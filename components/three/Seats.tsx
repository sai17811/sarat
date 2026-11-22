'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Color, InstancedMesh, Matrix4, MeshBasicMaterial, MeshPhysicalMaterial, Object3D, TorusGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { rowY, rowZ } from '@/lib/hall';
import { SEATS, MAX_SEATS, type Seat } from '@/lib/seats';
import { useStore } from '@/lib/store';
import { getTextures } from './textures';

/** Cushion, tilted back, two armrests (+ footrest on recliners), merged into one geometry. */
function seatGeometry(rec: boolean) {
  const w = rec ? 1.2 : 0.74;
  const parts: RoundedBoxGeometry[] = [];
  const add = (g: RoundedBoxGeometry, x: number, y: number, z: number, rx = 0) => {
    if (rx) g.rotateX(rx);
    g.translate(x, y, z);
    parts.push(g);
  };
  add(new RoundedBoxGeometry(w, 0.22, rec ? 0.86 : 0.62, 3, 0.08), 0, 0.42, rec ? -0.08 : -0.02);
  add(new RoundedBoxGeometry(w, rec ? 0.98 : 0.8, 0.16, 3, 0.07), 0, rec ? 0.98 : 0.9, rec ? 0.42 : 0.34, rec ? 0.3 : 0.12);
  const aw = rec ? 0.16 : 0.08;
  for (const sx of [-1, 1]) {
    add(new RoundedBoxGeometry(aw, 0.12, rec ? 0.9 : 0.66, 2, 0.04), sx * (w / 2 + aw / 2 + 0.01), 0.66, rec ? 0 : 0.04);
    add(new RoundedBoxGeometry(aw * 0.7, 0.56, 0.5, 2, 0.03), sx * (w / 2 + aw / 2 + 0.01), 0.3, 0.06);
  }
  if (rec) add(new RoundedBoxGeometry(w * 0.92, 0.12, 0.5, 2, 0.05), 0, 0.34, -0.66, -0.35);
  return mergeGeometries(parts);
}

const C = {
  velvet: new Color(0x8c1d2c), leather: new Color(0x8a5a2b),
  vAvail: new Color(0xb02a3e), lAvail: new Color(0xc4893f),
  taken: new Color(0x2a2527), mine: new Color(0xffb02e), hover: new Color(0xf5e6c8),
};

const noRaycast = () => {};

/**
 * 216 seats in 2 instanced draw calls. Colours are repainted from a store
 * subscription (no React render), and raycasting is switched off entirely
 * unless the booking view is open, so scrolling costs nothing for picking.
 */
export function Seats() {
  const groups = useMemo(() => {
    const tx = getTextures();
    return [false, true].map((rec) => ({
      rec,
      list: SEATS.filter((s) => s.rec === rec),
      geometry: seatGeometry(rec),
      material: rec
        ? new MeshPhysicalMaterial({ map: tx.leather, bumpMap: tx.leather, bumpScale: 0.6, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.5 })
        : new MeshPhysicalMaterial({ map: tx.fabric, bumpMap: tx.fabric, bumpScale: 0.8, roughness: 0.82, sheen: 1, sheenRoughness: 0.45, sheenColor: new Color(0xff8a96) }),
    }));
  }, []);
  const refs = [useRef<InstancedMesh>(null), useRef<InstancedMesh>(null)];
  const markers = useRef<InstancedMesh>(null);
  const markerGeo = useMemo(() => new TorusGeometry(0.24, 0.035, 8, 40), []);
  const markerMat = useMemo(() => new MeshBasicMaterial({ color: new Color(0xffb347).multiplyScalar(6) }), []);

  useLayoutEffect(() => {
    const m = new Matrix4();
    groups.forEach((g, k) => {
      const mesh = refs[k].current!;
      g.list.forEach((s, li) => mesh.setMatrixAt(li, m.makeTranslation(s.x, rowY(s.row), rowZ(s.row))));
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere(); // correct culling + picking for spread-out instances
    });

    let lastKey = '';
    const paint = () => {
      const st = useStore.getState();
      const key = [st.booking, st.view, st.hover, st.selected.join(',')].join('|');
      if (key === lastKey) return;
      lastKey = key;
      const sel = new Set(st.selected);
      groups.forEach((g, k) => {
        const mesh = refs[k].current!;
        g.list.forEach((s, li) => {
          let c: Color;
          if (!st.booking) c = s.rec ? C.leather : C.velvet;
          else if (sel.has(s.i)) c = C.mine;
          else if (s.booked) c = C.taken;
          else if (s.i === st.hover) c = C.hover;
          else c = s.rec ? C.lAvail : C.vAvail;
          mesh.setColorAt(li, c);
        });
        mesh.instanceColor!.needsUpdate = true;
        mesh.raycast = st.booking && st.view < 0 ? InstancedMesh.prototype.raycast : noRaycast;
      });
    };
    paint();
    return useStore.subscribe(paint);
  }, [groups]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => groups.forEach((g) => { g.geometry.dispose(); g.material.dispose(); }), [groups]);

  // Floating rings over the seats you picked (booking overview only).
  const dummy = useMemo(() => new Object3D(), []);
  useFrame((state) => {
    const mk = markers.current;
    if (!mk) return;
    const st = useStore.getState();
    if (!st.booking || st.view >= 0) { mk.count = 0; return; }
    const t = state.clock.elapsedTime;
    let n = 0;
    for (const i of st.selected) {
      if (n >= MAX_SEATS) break;
      const s = SEATS[i];
      dummy.position.set(s.x, rowY(s.row) + 1.75 + Math.sin(t * 3 + i) * 0.08, rowZ(s.row) + 0.1);
      dummy.rotation.set(Math.PI / 2, 0, t);
      dummy.updateMatrix();
      mk.setMatrixAt(n++, dummy.matrix);
    }
    mk.count = n;
    mk.instanceMatrix.needsUpdate = true;
  });

  const handlers = (list: Seat[]) => ({
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId === undefined) return;
      const s = list[e.instanceId];
      document.body.style.cursor = s.booked ? 'not-allowed' : 'pointer';
      useStore.getState().setHover(s.i, e.nativeEvent.clientX, e.nativeEvent.clientY);
    },
    onPointerOut: () => {
      document.body.style.cursor = '';
      useStore.getState().setHover(-1);
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta > 8 || e.instanceId === undefined) return; // ignore drags
      useStore.getState().toggle(list[e.instanceId].i);
    },
  });

  return (
    <>
      {groups.map((g, k) => (
        <instancedMesh
          key={String(g.rec)}
          ref={refs[k]}
          args={[g.geometry, g.material, g.list.length]}
          castShadow
          receiveShadow
          {...handlers(g.list)}
        />
      ))}
      <instancedMesh ref={markers} args={[markerGeo, markerMat, MAX_SEATS]} frustumCulled={false} />
    </>
  );
}
