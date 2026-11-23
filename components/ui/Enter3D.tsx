'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { OPT_IN_KEY, preloadExperience } from '@/components/three/ExperienceLoader';

/** Shown on very weak devices instead of the 3D hall: a poster backdrop and an opt-in button. */
export function Enter3D() {
  const lite = useStore((s) => s.lite);
  const booking = useStore((s) => s.booking);

  useEffect(() => {
    document.body.classList.toggle('lite', lite);
  }, [lite]);

  if (!lite || booking) return null;

  const enter = () => {
    try { localStorage.setItem(OPT_IN_KEY, 'on'); } catch { /* private mode: just this visit */ }
    preloadExperience();
    useStore.getState().enter3d();
  };

  return (
    <button className="enter3d mono" type="button" onClick={enter} aria-label="Load the 3D cinema hall">
      <span className="dot" aria-hidden="true" />
      Tap to enter 3D
      <small>~ uses more data &amp; battery</small>
    </button>
  );
}
