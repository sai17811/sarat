'use client';

import { useEffect, useState } from 'react';

/** Non-blocking decorative opening: HTML is usable immediately. */
export function Leader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => { setVisible(false); document.body.classList.add('ready'); }, 420);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return <div id="leader" className="out" aria-hidden="true" />;
}
