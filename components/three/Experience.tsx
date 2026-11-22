'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
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
 * The WebGL layer. Loaded lazily (see ExperienceLoader) so the page's text,
 * showtimes and booking buttons are interactive before any 3D code arrives.
 */
export default function Experience() {
  const visible = usePageVisible();
  const ready = useStore((s) => s.ready);
  const booking = useStore((s) => s.booking);
  const setTier = useStore((s) => s.setTier);
  const [maxDpr] = useState(() => Math.min(window.devicePixelRatio || 1, window.innerWidth < 820 ? 1 : 1.75));
  const [dpr, setDpr] = useState(() => Math.min(maxDpr, 1.5));

  return (
    <Canvas
      className={'gl' + (ready ? ' on' : '') + (booking ? ' interactive' : '')}
      // Stop rendering entirely when the tab is hidden.
      frameloop={visible ? 'always' : 'never'}
      dpr={dpr}
      // MSAA happens in the EffectComposer, so the default framebuffer skips it.
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      shadows={{ enabled: useStore.getState().tier === 'high', type: PCFShadowMap, autoUpdate: false }}
      camera={{ fov: 48, near: 0.1, far: 120, position: [0, 12, 26.5] }}
      // Fixed fullscreen canvas: use client coords. The wrapper only accepts
      // pointer events while booking (see .gl.interactive in globals.css).
      eventPrefix="client"
    >
      {/* Watches real frame times and steps quality up or down. */}
      <PerformanceMonitor
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
      />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
