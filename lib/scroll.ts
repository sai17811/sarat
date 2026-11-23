// Scroll → "reel" index, kept OUTSIDE React state.
// The camera reads scrollState.reel every frame; nothing re-renders on scroll.

export const scrollState = { reel: 0, progress: 0 };

let centers: number[] = [];

export function measureReels() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reel]'));
  centers = els.map((el) => el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2);
}

export function updateScroll(y: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight || 1;
  scrollState.progress = Math.min(1, Math.max(0, y / max));

  if (!centers.length || y <= centers[0]) {
    scrollState.reel = 0;
    return;
  }
  for (let k = 0; k < centers.length - 1; k++) {
    if (y < centers[k + 1]) {
      scrollState.reel = k + (y - centers[k]) / (centers[k + 1] - centers[k]);
      return;
    }
  }
  scrollState.reel = centers.length - 1;
}
