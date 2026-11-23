import type { Mode } from '@/lib/hall';
import { useStore } from '@/lib/store';

// What plays on the big screen for each reel. Pure 2D canvas drawing,
// redrawn at 30 fps max by <Screen/>.

export const SCREEN_W = 1280;
export const SCREEN_H = 540;

const OCCASION: Record<string, string> = {
  Birthday: 'Happy Birthday',
  Corporate: 'Welcome, team',
  'School / college': 'Welcome',
  'Fan show': 'A fan show for',
  'Pre-wedding film': 'The story of',
  Advertising: 'Presented by',
};

/** next/font hashes family names; read the real stacks from CSS variables. */
function fontStack(cssVar: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return v || fallback;
}

export function createScreenPainter(g: CanvasRenderingContext2D) {
  const W = SCREEN_W;
  const H = SCREEN_H;
  const SERIF = fontStack('--f-serif', 'Didot, serif');
  const MONO = fontStack('--f-mono', 'monospace');
  const TE = fontStack('--f-te', 'serif');

  const stars = Array.from({ length: 260 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.85, r: Math.random() * 1.7 + 0.3, p: Math.random() * 6 }));
  const confetti = Array.from({ length: 110 }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H, v: 30 + Math.random() * 60,
    c: ['#F2A93B', '#E8556D', '#ECE2CB', '#7FD1FF'][i % 4], w: 6 + Math.random() * 8, a: Math.random() * 6,
  }));

  function text(s: string, y: number, size: number, color: string, font = SERIF, weight = '800', style = 'italic') {
    const set = () => (g.font = style + ' ' + weight + ' ' + size + 'px ' + font);
    set();
    while (g.measureText(s).width > W * 0.88 && size > 14) { size -= 4; set(); }
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s, W / 2, y);
  }
  function glow(x: number, y: number, r: number, col: string) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const fill = (c: string) => { g.fillStyle = c; g.fillRect(0, 0, W, H); };

  const programs: Record<Mode, (t: number) => void> = {
    brand(t) {
      fill('#120a0c');
      glow(W * (0.3 + 0.18 * Math.sin(t * 0.3)), H * 0.55, 560, 'rgba(122,22,38,.6)');
      glow(W * (0.72 + 0.15 * Math.cos(t * 0.23)), H * 0.4, 460, 'rgba(242,169,59,.32)');
      text('సారథి', H * 0.2, 54, '#F2A93B', TE, '800', 'normal');
      text('Sarathi', H * 0.53, 230, '#F4ECDC');
      text('C I N E M A S  ·  R A J A H M U N D R Y', H * 0.85, 26, '#D8C9AE', MONO, '600', 'normal');
    },
    film(t) {
      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#02050f'); gr.addColorStop(1, '#182a5e');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff';
      for (const s of stars) {
        g.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2 + s.p));
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      const x = W * 0.72, y = H * 0.27, p = 1 + 0.08 * Math.sin(t * 2.2);
      glow(x, y, 190 * p, 'rgba(170,195,255,.5)');
      glow(x, y, 48 * p, 'rgba(255,255,255,.95)');
      g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 150 * p, y); g.lineTo(x + 150 * p, y); g.moveTo(x, y - 100 * p); g.lineTo(x, y + 100 * p); g.stroke();
      text('NOW SHOWING', H * 0.58, 26, '#F2A93B', MONO, '600', 'normal');
      text('Aakasamlo Oka Tara', H * 0.75, 120, '#F4ECDC');
    },
    tech(t) {
      fill('#030304');
      g.globalCompositeOperation = 'lighter';
      g.lineWidth = 2.4;
      const cols = ['rgba(255,46,77,.7)', 'rgba(46,255,138,.55)', 'rgba(61,123,255,.75)'];
      for (let k = 0; k < 21; k++) {
        g.strokeStyle = cols[k % 3];
        g.beginPath(); g.moveTo(W / 2, -20); g.lineTo(W / 2 + Math.sin(t * 0.7 + k * 0.5) * W * 0.8, H + 20); g.stroke();
      }
      g.globalCompositeOperation = 'source-over';
      text('Barco Laser', H * 0.42, 150, '#FFFFFF');
      text('D O L B Y   A T M O S', H * 0.72, 40, '#F2A93B', MONO, '600', 'normal');
    },
    recline() {
      fill('#1c0e05');
      glow(W / 2, H * 1.05, 640, 'rgba(255,160,60,.55)');
      text('Recline.', H * 0.35, 170, '#F4ECDC');
      text('Relax.', H * 0.7, 170, '#F2A93B');
    },
    legacy(t) {
      const f = 0.88 + Math.random() * 0.12;
      fill('rgb(' + ((214 * f) | 0) + ',' + ((196 * f) | 0) + ',' + ((156 * f) | 0) + ')');
      const cx = W / 2, cy = H / 2 - 10, r = 180;
      g.fillStyle = 'rgba(60,45,30,.25)';
      g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r + 44, -Math.PI / 2, -Math.PI / 2 + (t % 1) * Math.PI * 2); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(40,30,20,.8)'; g.lineWidth = 4;
      g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
      g.beginPath(); g.arc(cx, cy, r - 26, 0, 7); g.stroke();
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, cy); g.lineTo(W, cy); g.moveTo(cx, 0); g.lineTo(cx, H); g.stroke();
      text(String(5 - Math.floor(t % 5)), cy + 6, 230, '#2a2118', SERIF, '800', 'normal');
      text('S A R A T H I   F I L M S  ·  1 9 3 7', H * 0.93, 24, '#3a2e20', MONO, '600', 'normal');
      g.fillStyle = 'rgba(30,20,10,.5)';
      for (let k = 0; k < 320; k++) g.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
      g.fillRect(Math.random() * W, 0, 1.3, H);
    },
    events(t) {
      fill('#1a0b14');
      glow(W / 2, H / 2, 560, 'rgba(232,85,109,.32)');
      for (const c of confetti) {
        const y = ((c.y + t * c.v) % (H + 20)) - 10;
        g.save(); g.translate(c.x + Math.sin(t + c.a) * 14, y); g.rotate(t * 2 + c.a);
        g.fillStyle = c.c; g.fillRect(-c.w / 2, -c.w / 4, c.w, c.w / 2); g.restore();
      }
      const ev = useStore.getState().ev;
      text(OCCASION[ev.occ] ?? 'Welcome', H * 0.33, 80, '#F2A93B');
      text(ev.name || 'Your name here', H * 0.64, 170, '#F4ECDC');
    },
    visit(t) {
      fill('#0d0a0b');
      glow(W * (0.5 + 0.3 * Math.sin(t * 0.4)), H * 0.5, 600, 'rgba(242,169,59,.3)');
      text('See you at', H * 0.3, 80, '#F2A93B');
      text('the movies', H * 0.58, 190, '#F4ECDC');
      text('P R A S A D I T Y A   M A L L  ·  A V A   R O A D', H * 0.86, 24, '#CDBFA6', MONO, '600', 'normal');
    },
    book() {
      fill('#0b0909');
      g.fillStyle = 'rgba(242,169,59,.12)';
      for (let y = 0; y < 8; y++) for (let x = 0; x < 26; x++) g.fillRect(56 + x * 45, 40 + y * 56, 30, 30);
      text('Choose your seat', H * 0.5, 150, '#F4ECDC');
      text('T A P   A N Y   S E A T   I N   T H E   H A L L', H * 0.76, 26, '#F2A93B', MONO, '600', 'normal');
    },
  };

  return (mode: Mode, t: number) => programs[mode](t);
}
