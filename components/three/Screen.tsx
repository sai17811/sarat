'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CanvasTexture, Color, LinearFilter, MeshBasicMaterial, PlaneGeometry, PointLight,
  RectAreaLight, SpotLight, SRGBColorSpace,
} from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { SH, SW, SY, SZ } from '@/lib/hall';
import { useStore } from '@/lib/store';
import { createScreenPainter, SCREEN_H, SCREEN_W } from './screenPrograms';
import { frame } from './frameState';

RectAreaLightUniformsLib.init();

const FPS = 1 / 20; // screen content refresh cap

/** Curved Harkness-style screen + the lights it throws into the room. */
export function Screen() {
  const tier = useStore((s) => s.tier);
  const { texture, paint, geometry, material } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;

    const geometry = new PlaneGeometry(SW, SH, 48, 1);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (SW / 2);
      p.setZ(i, u * u * 0.55); // gentle curve toward the audience
    }
    geometry.computeVertexNormals();

    const material = new MeshBasicMaterial({ map: texture, color: new Color(1.25, 1.25, 1.25), fog: false });
    return { texture, paint: createScreenPainter(canvas.getContext('2d')!), geometry, material };
  }, []);

  const area = useRef<RectAreaLight>(null);
  const key = useRef<SpotLight>(null);
  const last = useRef(-1);

  useEffect(() => {
    // Fonts arrive after first paint; force a redraw when they do.
    document.fonts?.ready.then(() => (last.current = -1));
    return () => { texture.dispose(); geometry.dispose(); material.dispose(); };
  }, [texture, geometry, material]);

  useEffect(() => {
    area.current?.lookAt(0, SY, 20);
    if (key.current) key.current.target.position.set(0, 2.5, 17);
    key.current?.target.updateMatrixWorld();
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (last.current < 0 || t - last.current >= FPS) {
      paint(frame.mode, t);
      texture.needsUpdate = true;
      last.current = t;
    }
    const f = frame.flicker;
    material.color.setScalar(1.25 * (f < 1 ? 0.6 : 1));
    if (area.current) { area.current.color.copy(frame.light); area.current.intensity = 3.2 * f; }
    if (key.current) { key.current.color.copy(frame.light); key.current.intensity = 320 * f; }
  });

  const shadowRes = tier === 'high' ? 2048 : 1024;

  // A new shadow-map size only takes effect once the old map is released.
  useEffect(() => {
    const shadow = key.current?.shadow;
    if (shadow?.map) { shadow.map.dispose(); (shadow as { map: unknown }).map = null; }
  }, [shadowRes]);

  return (
    <>
      <mesh geometry={geometry} material={material} position={[0, SY, SZ]} />
      <mesh position={[0, SY, SZ - 0.06]}>
        <planeGeometry args={[SW + 1.2, SH + 1]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <hemisphereLight args={[0x3a2a40, 0x080505, 0.35]} />
      <rectAreaLight ref={area} args={[0xffffff, 3.2, SW, SH]} position={[0, SY, SZ + 0.3]} />
      <spotLight
        ref={key}
        position={[0, SY + 0.5, SZ + 1.2]}
        angle={0.95}
        penumbra={1}
        decay={2}
        intensity={320}
        castShadow={tier === 'high'}
        shadow-mapSize={[shadowRes, shadowRes]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
      <BoothLight />
    </>
  );
}

function BoothLight() {
  const light = useMemo(() => {
    const l = new PointLight(0xffc27a, 40, 0, 2);
    l.position.set(0, 10.6, 28.4);
    return l;
  }, []);
  return <primitive object={light} />;
}
