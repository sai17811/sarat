import { CanvasTexture, ClampToEdgeWrapping, RepeatWrapping, SRGBColorSpace } from 'three';

// Procedural textures, generated once on the client. Swap for KTX2 photo
// textures (see README) once real material photos of the hall exist.

type Draw = (g: CanvasRenderingContext2D, size: number) => void;

function make(size: number, draw: Draw, { srgb = true, repeat = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = SRGBColorSpace;
  return t;
}

const speckle = (g: CanvasRenderingContext2D, size: number, n: number, alpha: number, col: string) => {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    g.globalAlpha = Math.random() * alpha;
    g.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4);
  }
  g.globalAlpha = 1;
};

let cache: ReturnType<typeof build> | null = null;
export const getTextures = () => (cache ??= build());

function build() {
  const fabric = make(256, (g, s) => {
    g.fillStyle = '#c9c4c0';
    g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      g.fillStyle = y % 4 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)';
      g.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 2) {
      g.fillStyle = 'rgba(0,0,0,.04)';
      g.fillRect(x, 0, 1, s);
    }
    speckle(g, s, 5000, 0.25, '#000');
  }, { repeat: 3 });

  const leather = make(256, (g, s) => {
    g.fillStyle = '#d8d0c6';
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) {
      g.strokeStyle = 'rgba(0,0,0,' + Math.random() * 0.12 + ')';
      g.beginPath();
      g.arc(Math.random() * s, Math.random() * s, Math.random() * 5 + 1, 0, Math.random() * 6);
      g.stroke();
    }
  }, { repeat: 2 });

  const carpet = make(512, (g, s) => {
    g.fillStyle = '#1e1013';
    g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(122,22,38,.55)';
    g.lineWidth = 3;
    for (let i = -s; i < s * 2; i += 64) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + s, s); g.stroke();
      g.beginPath(); g.moveTo(i + s, 0); g.lineTo(i, s); g.stroke();
    }
    g.fillStyle = 'rgba(242,169,59,.35)';
    for (let y = 0; y < s; y += 64) for (let x = 0; x < s; x += 64) { g.beginPath(); g.arc(x + 32, y, 3, 0, 7); g.fill(); }
    speckle(g, s, 26000, 0.35, '#000');
    speckle(g, s, 8000, 0.12, '#fff');
  });

  const panel = make(512, (g, s) => {
    g.fillStyle = '#2b2026';
    g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 128) {
      g.fillStyle = '#120c0f'; g.fillRect(x, 0, 5, s);
      g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x + 5, 0, 2, s);
    }
    for (let y = 0; y < s; y += 3) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, y, s, 1); }
    speckle(g, s, 14000, 0.2, '#000');
  });

  const wash = make(128, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s * 0.85, 0, s / 2, s * 0.85, s * 0.8);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,.35)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  }, { srgb: false });
  wash.wrapS = wash.wrapT = ClampToEdgeWrapping;

  const exit = make(256, (g, s) => {
    g.fillStyle = '#062c14';
    g.fillRect(0, 0, s, s);
    g.fillStyle = '#7dffb0';
    g.font = '700 70px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('EXIT', s / 2, s / 2);
  });
  exit.wrapS = exit.wrapT = ClampToEdgeWrapping;
  exit.repeat.set(1, 0.42);
  exit.offset.set(0, 0.29);

  const flare = make(128, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, '#fff');
    gr.addColorStop(0.15, 'rgba(255,220,170,.6)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  });
  flare.wrapS = flare.wrapT = ClampToEdgeWrapping;

  return { fabric, leather, carpet, panel, wash, exit, flare };
}
