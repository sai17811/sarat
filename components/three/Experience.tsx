'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { PCFShadowMap } from 'three';
import { useStore } from '@/lib/store';
import { Scene } from './Scene';

function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

/**
 * True after `ms` with no scroll, touch, pointer or key input. Flips state only
 * on transitions, so it re-renders at most twice per idle period.
 */
function useIdle(ms = 3500) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer = 0;
    let isIdle = false;
    const wake = () => {
      if (isIdle) { isIdle = false; setIdle(false); }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { isIdle = true; setIdle(true); }, ms);
    };
    const evs = ['scroll', 'wheel', 'pointermove', 'pointerdown', 'touchstart', 'keydown'] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    const unsub = useStore.subscribe(wake); // seat picks, booking open/close
    wake();
    return () => {
      window.clearTimeout(timer);
      evs.forEach((e) => window.removeEventListener(e, wake));
      unsub();
    };
  }, [ms]);
  return idle;
}

/**
 * Demand mode at a capped fps: low tier runs ~30fps instead of every vsync: halves GPU
 * work and battery drain on phones while shaders still animate via uTime.
 */
function ThrottledFrames({ fps = 30 }: { fps?: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const step = 1000 / fps;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last >= step - 1) {
        last = t;
        invalidate();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, fps]);
  return null;
}

/**
 * The WebGL layer. Loaded lazily (see ExperienceLoader) so the page's text,
 * showtimes and booking buttons are interactive before any 3D code arrives.
 */
export default function Experience() {
  const visible = usePageVisible();
  const ready = useStore((s) => s.ready);
  const booking = useStore((s) => s.booking);
  const setTier = useStore((s) => s.setTier);
  const tier = useStore((s) => s.tier);
  // Booking needs crisp pointer feedback, so it always gets full frame rate.
  // Idle visitors only see ambient motion (dust, screen glow), so drop to
  // 15fps until they scroll, touch or move: big GPU and battery savings.
  const idle = useIdle();
  const throttle = (tier === 'low' || idle) && !booking;
  const fps = idle ? 15 : 30;
  const [maxDpr] = useState(() => Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1 : 1.75));
  const [dpr, setDpr] = useState(() => Math.min(maxDpr, 1.5));

  return (
    <Canvas
      className={'gl' + (ready ? ' on' : '') + (booking ? ' interactive' : '')}
      // Stop rendering entirely when the tab is hidden.
      frameloop={!visible ? 'never' : throttle ? 'demand' : 'always'}
      dpr={dpr}
      // MSAA happens in the EffectComposer, so the default framebuffer skips it.
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      shadows={{ enabled: useStore.getState().tier === 'high', type: PCFShadowMap, autoUpdate: false }}
      camera={{ fov: 48, near: 0.1, far: 120, position: [0, 12, 26.5] }}
      // Fixed fullscreen canvas: use client coords. The wrapper only accepts
      // pointer events while booking (see .gl.interactive in globals.css).
      eventPrefix="client"
    >
      {/* Watches real frame times and steps quality up or down. Paused while
          throttled, so a deliberate 15/30fps cap never reads as a slow GPU. */}
      {!throttle && <PerformanceMonitor
        flipflops={3}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        onDecline={() => {
          const next = Math.max(1, dpr - 0.25);
          setDpr(next);
          if (next <= 1) setTier('low'); // already at 1x: drop MSAA + heavy effects
        }}
        onFallback={() => {
          setDpr(1);
          setTier('low');
        }}
      />}
      {visible && throttle && <ThrottledFrames fps={fps} />}
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
