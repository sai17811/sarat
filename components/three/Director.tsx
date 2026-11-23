'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { Color, Vector3 } from 'three';
import { LIGHT, MODES, SHOTS, SY, SZ, rowY, rowZ, type Mode } from '@/lib/hall';
import { SEATS } from '@/lib/seats';
import { scrollState } from '@/lib/scroll';
import { useStore } from '@/lib/store';
import { beamColor, frame } from './frameState';

const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Runs first every frame (mounted first in <Scene/>): picks the camera shot,
 * the screen programme and the light colour, and writes them to `frame`.
 * Uses frame-rate-independent damping, so 30 fps and 120 fps feel the same.
 */
export function Director() {
  const v = useMemo(() => ({ goalP: new Vector3(), goalT: new Vector3(), a: new Vector3(), b: new Vector3(), target: new Vector3(0, 8, -2), lightGoal: new Color(), white: new Color(1, 1, 1) }), []);
  const reduce = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const { booking, view } = useStore.getState();
    const idx = scrollState.reel;
    let mode: Mode;

    if (booking && view >= 0) {
      const s = SEATS[view];
      v.goalP.set(s.x, rowY(s.row) + (s.rec ? 1.12 : 1.22), rowZ(s.row) + 0.12);
      v.goalT.set(s.x * 0.25, SY, SZ);
      mode = 'film';
    } else if (booking) {
      const aspect = state.size.width / state.size.height;
      const wide = aspect > 1.15;
      const lift = Math.max(1, 1.3 / aspect);
      v.goalP.set(wide ? 3.6 : 0, 20 * lift, 27 + (lift - 1) * 4);
      v.goalT.set(wide ? 3.6 : 0, wide ? 0 : -6, 10.5);
      mode = 'book';
    } else {
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, SHOTS.length - 1);
      const f = smooth(idx - i0);
      v.goalP.copy(v.a.fromArray(SHOTS[i0].p).lerp(v.b.fromArray(SHOTS[i1].p), f));
      v.goalT.copy(v.a.fromArray(SHOTS[i0].t).lerp(v.b.fromArray(SHOTS[i1].t), f));
      if (!reduce) {
        v.goalP.x += state.pointer.x * 0.6;
        v.goalP.y += state.pointer.y * 0.35;
      }
      mode = MODES[Math.round(idx)] ?? 'brand';
    }

    const smoothTime = reduce ? 0.08 : 0.45;
    easing.damp3(state.camera.position, v.goalP, smoothTime, dt);
    easing.damp3(v.target, v.goalT, smoothTime, dt);
    state.camera.lookAt(v.target);

    if (mode !== frame.mode) {
      frame.mode = mode;
      frame.flashUntil = t + 0.2;
    }
    frame.idx = idx;
    frame.flicker = t < frame.flashUntil ? 0.35 : 1;
    frame.ceiling = !(booking && view < 0);
    frame.beam = booking && view < 0 ? 0.4 : 1;
    frame.atmos += ((booking ? 0 : Math.max(0, 1 - Math.abs(idx - 2) * 1.3)) - frame.atmos) * Math.min(1, dt * 5);
    frame.sepia += ((booking ? 0 : Math.max(0, 1 - Math.abs(idx - 4) * 1.4) * 0.85) - frame.sepia) * Math.min(1, dt * 6);

    v.lightGoal.setHex(LIGHT[mode]);
    easing.dampC(frame.light, v.lightGoal, 0.4, dt);
    beamColor.value.copy(frame.light).lerp(v.white, 0.55);
  });

  return null;
}
