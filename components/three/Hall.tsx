'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending, BoxGeometry, BufferGeometry, Color, DoubleSide, Group, Material,
  MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rowY, rowZ } from '@/lib/hall';
import { getTextures } from './textures';
import { frame } from './frameState';
import { Stars } from './Atmosphere';

type Kind = 'wall' | 'carpet' | 'dark' | 'amber' | 'booth' | 'wash' | 'exit' | 'curtain';

/** Scale box UVs per face so a tiling texture keeps real-world size. */
function boxUV(g: BoxGeometry, w: number, h: number, d: number, tile: number) {
  const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) {
    const i = f * 4 + v;
    uv.setXY(i, (uv.getX(i) * dims[f][0]) / tile, (uv.getY(i) * dims[f][1]) / tile);
  }
}

function buildHall() {
  const bins: Partial<Record<Kind, BufferGeometry[]>> = {};
  const put = (k: Kind, g: BufferGeometry) => (bins[k] ??= []).push(g);
  const box = (k: Kind, w: number, h: number, d: number, x: number, y: number, z: number, tile = 3) => {
    const g = new BoxGeometry(w, h, d); boxUV(g, w, h, d, tile); g.translate(x, y, z); put(k, g);
  };
  const plane = (k: Kind, w: number, h: number, x: number, y: number, z: number, ry = 0, rx = 0) => {
    const g = new PlaneGeometry(w, h); if (rx) g.rotateX(rx); if (ry) g.rotateY(ry); g.translate(x, y, z); put(k, g);
  };
  const curtain = (w: number, h: number, folds: number, x: number, y: number, z: number) => {
    const g = new PlaneGeometry(w, h, folds * 10, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / w + 0.5;
      p.setZ(i, Math.sin(u * folds * Math.PI * 2) * 0.22 + Math.sin(u * folds * 7.3) * 0.04);
    }
    g.computeVertexNormals(); g.translate(x, y, z); put('curtain', g);
  };

  // shell
  box('wall', 0.4, 16, 34, -12.6, 7.7, 13.4, 4);
  box('wall', 0.4, 16, 34, 12.6, 7.7, 13.4, 4);
  box('wall', 25.6, 16, 0.4, 0, 7.7, 30.2, 4);
  box('dark', 25.6, 16, 0.4, 0, 7.7, -3.4);
  box('carpet', 25.6, 0.3, 9.6, 0, -0.45, 1.2, 2.2);
  box('dark', 20.5, 1.0, 1.6, 0, 0.2, -2.3);
  // stepped seating platforms + aisle step lights
  for (let r = 0; r < 12; r++) {
    const h = rowY(r) + 0.3;
    box('carpet', 24.8, h, 1.4, 0, rowY(r) - h / 2, rowZ(r) + 0.12, 2.2);
    for (const x of [0, -10.6, 10.6]) box('amber', 0.34, 0.035, 0.05, x, rowY(r) + 0.02, rowZ(r) - 0.57);
  }
  // sconces, wall washes, ceiling speakers
  for (let z = 3; z <= 27; z += 6) for (const sx of [-1, 1]) {
    box('amber', 0.06, 0.7, 0.32, sx * 12.37, 6.8, z);
    box('dark', 0.5, 0.9, 0.9, sx * 12.1, 11.2, z + 3);
    plane('wash', 3.2, 6.5, sx * 12.38, 8.3, z, sx < 0 ? Math.PI / 2 : -Math.PI / 2);
  }
  for (let r = 0; r < 12; r += 3) for (const x of [-10.6, 10.6]) plane('wash', 2.2, 2.2, x, rowY(r) + 0.03, rowZ(r) + 0.2, 0, -Math.PI / 2);
  box('booth', 3.4, 1.2, 0.08, 0, 10.6, 29.97);
  box('dark', 0.9, 0.5, 0.12, -12.3, 3.2, 1.0);
  box('dark', 0.9, 0.5, 0.12, 12.3, 3.2, 1.0);
  plane('exit', 0.8, 0.34, -12.38, 3.2, 1.0, Math.PI / 2);
  plane('exit', 0.8, 0.34, 12.38, 3.2, 1.0, -Math.PI / 2);
  curtain(3.3, 13.4, 7, -10.9, 6.3, -2.6);
  curtain(3.3, 13.4, 7, 10.9, 6.3, -2.6);
  curtain(25.4, 2.4, 36, 0, 13.9, -2.5);

  const tx = getTextures();
  const mats: Record<Kind, Material> = {
    carpet: new MeshStandardMaterial({ map: tx.carpet, bumpMap: tx.carpet, bumpScale: 1.2, roughness: 0.96 }),
    wall: new MeshStandardMaterial({ map: tx.panel, bumpMap: tx.panel, bumpScale: 1.5, roughness: 0.92 }),
    dark: new MeshStandardMaterial({ color: 0x0d0b0c, roughness: 0.6, metalness: 0.2 }),
    curtain: new MeshPhysicalMaterial({ color: 0x5a0c19, map: tx.fabric, roughness: 0.78, sheen: 1, sheenRoughness: 0.35, sheenColor: new Color(0xff6b7c), side: DoubleSide }),
    amber: new MeshBasicMaterial({ color: new Color(0xffa63d).multiplyScalar(5) }),
    booth: new MeshBasicMaterial({ color: new Color(0xfff1d6).multiplyScalar(3) }),
    wash: new MeshBasicMaterial({ map: tx.wash, color: new Color(0xffa94d).multiplyScalar(0.55), transparent: true, blending: AdditiveBlending, depthWrite: false }),
    exit: new MeshBasicMaterial({ map: tx.exit, color: new Color(2.2, 2.2, 2.2) }),
  };

  // One merged mesh per material: ~8 draw calls for the whole room.
  return (Object.keys(bins) as Kind[]).map((k) => ({
    key: k,
    geometry: mergeGeometries(bins[k]!),
    material: mats[k],
    receiveShadow: k === 'carpet' || k === 'wall',
  }));
}

export function Hall() {
  const parts = useMemo(buildHall, []);
  const ceiling = useRef<Group>(null);
  const ceilMat = useMemo(() => new MeshStandardMaterial({ color: 0x0b0809, roughness: 1 }), []);

  useEffect(() => () => parts.forEach((p) => { p.geometry.dispose(); p.material.dispose(); }), [parts]);

  // Ceiling lifts away for the booking cutaway view.
  useFrame(() => { if (ceiling.current) ceiling.current.visible = frame.ceiling; });

  return (
    <>
      {parts.map((p) => (
        <mesh key={p.key} geometry={p.geometry} material={p.material} receiveShadow={p.receiveShadow} matrixAutoUpdate={false} />
      ))}
      <group ref={ceiling}>
        <mesh position={[0, 15.7, 13.4]} material={ceilMat}>
          <boxGeometry args={[25.6, 0.4, 34]} />
        </mesh>
        <Stars />
      </group>
    </>
  );
}
