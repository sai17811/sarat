'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { preloadExperience, wants3dNow } from '@/components/three/ExperienceLoader';
import { useStore } from '@/lib/store';

const SEEN_KEY = 'sarathi:curtain';
const MIN_MS = 1200;
const MAX_MS = 3000;
const REPEAT_MS = 600;
const UNMOUNT_MS = 1400;

function seenBefore(): boolean {
  try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}
function markSeen() {
  try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* storage blocked */ }
}

/**
 * Theatre-curtain opening. Server-rendered so it paints instantly; while it is
 * closed the 3D chunk and scene data load behind it. It opens once the first
 * frame is ready (or the poster fallback is chosen), never later than MAX_MS.
 */
export function Curtain() {
  const ready = useStore((s) => s.ready);
  const [phase, setPhase] = useState<'closed' | 'open' | 'gone'>('closed');
  const minDone = useRef(false);
  const [minElapsed, setMinElapsed] = useState(false);

  const open = useCallback(() => {
    setPhase((p) => {
      if (p !== 'closed') return p;
      document.body.classList.add('ready');
      markSeen();
      return 'open';
    });
  }, []);

  // Start loading the 3D immediately, and set up the min/max timers.
  useEffect(() => {
    if (wants3dNow()) preloadExperience();
    const min = seenBefore() ? REPEAT_MS : MIN_MS;
    const tMin = window.setTimeout(() => { minDone.current = true; setMinElapsed(true); }, min);
    const tMax = window.setTimeout(open, MAX_MS);
    return () => { window.clearTimeout(tMin); window.clearTimeout(tMax); };
  }, [open]);

  // Open as soon as both the minimum time has passed and the scene is ready.
  useEffect(() => {
    if (ready && minElapsed) open();
  }, [ready, minElapsed, open]);

  // Unmount after the panels have slid away.
  useEffect(() => {
    if (phase !== 'open') return;
    const t = window.setTimeout(() => setPhase('gone'), UNMOUNT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div id="curtain" className={phase === 'open' ? 'open' : undefined} role="presentation">
      <div className="curtain-l" aria-hidden="true" />
      <div className="curtain-r" aria-hidden="true" />
      <div className="curtain-pelmet" aria-hidden="true" />
      <div className="curtain-title" aria-hidden="true">
        <span className="curtain-te">సారథి</span>
        <b>Sarathi</b>
        <span className="mono">Cinemas · Rajahmundry</span>
      </div>
      <button type="button" className="curtain-skip mono" onClick={open}>
        Skip
      </button>
    </div>
  );
}
