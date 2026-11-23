'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '@/lib/store';
import { Director } from './Director';
import { Hall } from './Hall';
import { Seats } from './Seats';
import { Screen } from './Screen';
import { AtmosRings, Beam, Dust } from './Atmosphere';
import { Effects } from './Effects';

export function Scene() {
  const tier = useStore((s) => s.tier);
  return (
    <>
      {/* Director must mount first: it writes the per-frame state others read. */}
      <Director />
      <color attach="background" args={['#060505']} />
      <fogExp2 attach="fog" args={['#060505', 0.018]} />
      <Hall />
      <Seats />
      <Screen />
      <Beam />
      <Dust />
      {tier === 'high' && <AtmosRings />}
      <Effects />
      <ShadowBake />
      <ReadySignal />
    </>
  );
}

/**
 * The hall never moves, so shadows are rendered for a couple of frames and
 * then frozen (shadowMap.autoUpdate = false on the Canvas). Re-baked only
 * when the quality tier changes the shadow-map size.
 */
function ShadowBake() {
  const gl = useThree((s) => s.gl);
  const tier = useStore((s) => s.tier);
  const frames = useRef(3);
  useEffect(() => { frames.current = 3; }, [tier]);
  useFrame(() => {
    if (frames.current > 0) {
      gl.shadowMap.needsUpdate = true;
      frames.current--;
    }
  });
  return null;
}

/** Tell the UI the hall is on screen (fades the canvas in, hides the leader). */
function ReadySignal() {
  const done = useRef(false);
  const n = useRef(0);
  useFrame(() => {
    if (done.current) return;
    if (++n.current > 2) {
      done.current = true;
      useStore.getState().setReady();
    }
  });
  return null;
}
