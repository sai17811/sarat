# Performance improvements in this delivery

- Removed the fullscreen blocking film-leader countdown. Hero UI appears and is usable immediately.
- Deferred the 3D chunk until browser idle (with a timeout fallback).
- Default to low quality on narrow mobile screens, weak CPUs / low-memory devices and reduced-motion preferences.
- Restrict mobile canvas resolution to device pixel ratio 1.
- Omit post-processing completely in low-quality mode (desktop high-quality still uses it).
- Disable expensive spotlight shadows on low-quality mode.
- Reduce dust particle count and dynamic screen refresh rate.

## Run and verify

`npm install` then `npm run dev`, `npm run typecheck`, `npm run build`. Test in browser on low-end Android and desktop with Chrome DevTools performance profiler. Measure LCP, INP, CLS, frame rate and GPU use. These source-level changes have NOT been validated in a full browser run here.

## Important

This is the **Sarathi Cinemas** project from the provided ZIP, not a tarot website. Only performance-related presentation source has changed. The site still uses a continuous render loop during visible tabs and can consume GPU; adding an on-demand renderer for idle scenes is a follow-up optimization.
