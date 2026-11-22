'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { measureReels, updateScroll } from '@/lib/scroll';
import { useStore } from '@/lib/store';

/**
 * Smooth scrolling (Lenis), reel measurement, reveal-on-scroll, and the
 * body classes the CSS keys off. Writes scroll into a plain object the
 * camera reads, so scrolling never triggers a React render.
 */
export function ScrollManager() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduce ? null : new Lenis({ autoRaf: true, lerp: 0.09, anchors: true });

    const onScroll = () => updateScroll(window.scrollY);
    const onResize = () => { measureReels(); onScroll(); };
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.2 },
    );
    document.querySelectorAll('[data-reel]').forEach((el) => io.observe(el));

    // Body classes + freeze page scroll while the booking view is open.
    const sync = () => {
      const { booking, glFailed } = useStore.getState();
      document.body.classList.toggle('is-booking', booking);
      document.body.classList.toggle('nogl', glFailed);
      if (lenis) { if (booking) lenis.stop(); else lenis.start(); }
      document.documentElement.style.overflow = booking ? 'hidden' : '';
    };
    sync();
    const unsub = useStore.subscribe(sync);

    return () => {
      unsub();
      io.disconnect();
      lenis?.destroy();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
    };
  }, []);

  return null;
}
