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
    const idle = window.requestIdleCallback;
    let cancelled = false;
    let handle = 0;
    if (idle) handle = idle(() => { if (!cancelled) setOk(true); }, { timeout: 1600 });
    else handle = window.setTimeout(() => { if (!cancelled) setOk(true); }, 400);
    return () => { cancelled = true; if (idle && window.cancelIdleCallback) window.cancelIdleCallback(handle); else window.clearTimeout(handle); };
  }, []);

  return ok ? <Experience /> : null;
}
