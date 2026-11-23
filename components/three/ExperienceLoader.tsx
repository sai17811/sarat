'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

/** Starts fetching the 3D chunk early (the curtain calls this on mount). */
export const preloadExperience = () => import('./Experience');

// three.js + R3F + postprocessing live in their own chunk, fetched after
// the page is interactive and never rendered on the server.
const Experience = dynamic(preloadExperience, { ssr: false, loading: () => null });

function canUseWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

type NetInfo = { saveData?: boolean; effectiveType?: string };

/** Very weak devices: slow network, few cores, little memory or reduced motion. */
function isVeryWeak() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: NetInfo };
  const conn = nav.connection;
  const slowNet = !!conn && (conn.saveData === true || ['slow-2g', '2g', '3g'].includes(conn.effectiveType ?? ''));
  return (
    slowNet ||
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) <= 2 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Weak or narrow: start on the low tier instead of discovering it by stuttering. */
function isWeakDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (
    isVeryWeak() ||
    window.innerWidth < 820 ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4
  );
}

/** True when this visit will get the 3D hall straight away (so it is worth preloading). */
export function wants3dNow() {
  return canUseWebGL2() && !(isVeryWeak() && !optedIn());
}

export const OPT_IN_KEY = 'sarathi-3d';

function optedIn() {
  try { return localStorage.getItem(OPT_IN_KEY) === 'on'; } catch { return false; }
}

export function ExperienceLoader() {
  const [ok, setOk] = useState(false);
  const lite = useStore((s) => s.lite);

  useEffect(() => {
    if (!canUseWebGL2()) {
      useStore.getState().setGlFailed();
      return;
    }
    if (isWeakDevice()) useStore.getState().setTier('low');

    // Very weak devices never download the 3D chunk unless the visitor asks
    // (or asked on an earlier visit). They get the poster backdrop instead.
    if (isVeryWeak() && !optedIn()) {
      useStore.getState().setLite();
      return;
    }

    // Let hydration finish, then mount while the curtain is still closed.
    const hasIdle = 'requestIdleCallback' in window;
    let cancelled = false;
    const go = () => { if (!cancelled) setOk(true); };
    const handle = hasIdle ? window.requestIdleCallback(go, { timeout: 600 }) : window.setTimeout(go, 200);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  // Tapped "Enter 3D": lite turns off, so mount the scene now.
  const wasLite = useRef(false);
  useEffect(() => {
    if (lite) wasLite.current = true;
    else if (wasLite.current) setOk(true);
  }, [lite]);

  return ok ? <Experience /> : null;
}
