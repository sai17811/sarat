'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

// three.js + R3F + postprocessing live in their own chunk, fetched after
// the page is interactive and never rendered on the server.
const Experience = dynamic(() => import('./Experience'), { ssr: false, loading: () => null });

function canUseWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

export function ExperienceLoader() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!canUseWebGL2()) {
      useStore.getState().setGlFailed();
      return;
    }
    // Weak devices start on the low tier instead of discovering it by stuttering.
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (window.innerWidth < 820 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) useStore.getState().setTier('low');

    // Let the browser finish first paint / hydration before pulling the 3D chunk.
    let cancelled = false;
    const loadExperience = () => { if (!cancelled) setOk(true); };
    if (typeof window.requestIdleCallback === 'function' && typeof window.cancelIdleCallback === 'function') {
      const handle = window.requestIdleCallback(loadExperience, { timeout: 1600 });
      return () => { cancelled = true; window.cancelIdleCallback(handle); };
    }
    const handle = window.setTimeout(loadExperience, 400);
    return () => { cancelled = true; window.clearTimeout(handle); };
  }, []);

  return ok ? <Experience /> : null;
}
