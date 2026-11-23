'use client';

import { useEffect, useRef } from 'react';

/** Placeholder poster art. Replace with the distributor's poster via next/image. */
export function Poster() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    const W = c.width, H = c.height;
    const css = getComputedStyle(document.documentElement);
    const serif = css.getPropertyValue('--f-serif').trim() || 'serif';
    const mono = css.getPropertyValue('--f-mono').trim() || 'monospace';

    const draw = () => {
      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#040817'); gr.addColorStop(1, '#1b2a5c');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      let s = 3;
      const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      g.fillStyle = '#fff';
      for (let i = 0; i < 140; i++) { g.globalAlpha = 0.3 + r() * 0.7; g.beginPath(); g.arc(r() * W, r() * H * 0.7, r() * 1.3 + 0.2, 0, 7); g.fill(); }
      g.globalAlpha = 1;
      const sx = W * 0.66, sy = H * 0.24;
      const rg = g.createRadialGradient(sx, sy, 0, sx, sy, 90);
      rg.addColorStop(0, '#fff'); rg.addColorStop(0.12, 'rgba(200,215,255,.8)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(sx - 90, sy - 90, 180, 180);
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(sx - 60, sy); g.lineTo(sx + 60, sy); g.moveTo(sx, sy - 40); g.lineTo(sx, sy + 40); g.stroke();
      g.fillStyle = '#F2EAD8'; g.textAlign = 'center';
      g.font = `italic 800 40px ${serif}`;
      g.fillText('Aakasamlo', W / 2, H * 0.7);
      g.fillText('Oka Tara', W / 2, H * 0.7 + 42);
      g.font = `600 11px ${mono}`; g.fillStyle = '#F2A93B';
      g.fillText('NOW SHOWING · SARATHI', W / 2, H * 0.93);
    };
    draw();
    document.fonts?.ready.then(draw);
  }, []);

  return <canvas ref={ref} className="poster" width={264} height={396} role="img" aria-label="Poster artwork for Aakasamlo Oka Tara" />;
}
