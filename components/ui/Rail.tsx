'use client';

import { useEffect, useRef, useState } from 'react';
import { scrollState } from '@/lib/scroll';

const pad = (n: number) => String(n).padStart(2, '0');

/** Film-strip rail: reel buttons + a running timecode. DOM is updated via refs, not state. */
export function Rail() {
  const [labels, setLabels] = useState<string[]>([]);
  const tc = useRef<HTMLSpanElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setLabels(Array.from(document.querySelectorAll<HTMLElement>('[data-reel]')).map((el) => el.dataset.reel ?? ''));
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastIdx = -1;
    let lastTc = '';
    const tick = () => {
      const idx = Math.round(scrollState.reel);
      if (idx !== lastIdx) {
        btns.current.forEach((b, j) => b?.setAttribute('aria-current', String(j === idx)));
        lastIdx = idx;
      }
      const secs = scrollState.progress * 9120; // a 2h32m reel
      const text = pad(Math.floor(secs / 3600)) + ':' + pad(Math.floor(secs / 60) % 60) + ':' + pad(Math.floor(secs) % 60) + ':' + pad(Math.floor((secs % 1) * 24));
      if (text !== lastTc && tc.current) { tc.current.textContent = text; lastTc = text; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [labels.length]);

  const go = (i: number) => {
    const el = document.querySelectorAll('[data-reel]')[i];
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <aside className="rail" aria-label="Reels">
      {labels.map((l, i) => (
        <button key={l} ref={(el) => { btns.current[i] = el; }} type="button" aria-label={`Reel ${i + 1}: ${l}`} onClick={() => go(i)}>
          R{i + 1}
        </button>
      ))}
      <span className="tc" ref={tc}>00:00:00:00</span>
    </aside>
  );
}
