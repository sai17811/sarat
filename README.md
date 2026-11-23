# Sarathi Cinemas — Next.js + React Three Fiber

3D website for Sarathi Cinemas, Prasaditya Mall, Rajahmundry. Built by DrevenForge Technologies.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build && npm start
```

Deploy: push to GitHub → import in Vercel (zero config).

> Dependency versions use caret ranges. If `npm install` reports a peer conflict,
> run `npm install three@latest @types/three@latest` and retry.

## Structure

```
app/
  layout.tsx            fonts (next/font, self-hosted), metadata
  page.tsx              server-rendered page: all copy is real HTML (SEO, instant paint)
  globals.css           film-ticket art direction
lib/
  seats.ts              seat model shared by 3D + 2D map (deterministic)
  store.ts              zustand store: booking, selection, hover, quality tier
  scroll.ts             scroll → reel index, kept OUTSIDE React state
  hall.ts               hall dimensions, camera shots, screen-light colours
components/ui/          small client islands (booking panel, showtimes, rail, …)
components/three/
  ExperienceLoader.tsx  WebGL2 check, device tiering, lazy-loads the 3D chunk on idle
  Experience.tsx        <Canvas>: adaptive DPR, frameloop pause, baked shadows
  Scene.tsx             composition + shadow bake + ready signal
  Director.tsx          per-frame camera, programme, light colour → frameState
  Hall.tsx              static room merged per material (~8 draw calls)
  Seats.tsx             216 seats in 2 instanced draws, picking, selection rings
  Screen.tsx            curved screen, live canvas programme, area + key light
  Atmosphere.tsx        projector beam, dust, star ceiling, Atmos rings (GPU shaders)
  Effects.tsx           postprocessing film look (single merged pass)
```

## How rendering is optimised

| Technique | Where | Effect |
|---|---|---|
| 3D code split into its own chunk, loaded on `requestIdleCallback` after hydration | `ExperienceLoader` | Text, showtimes and booking are usable before any three.js downloads |
| No SSR for WebGL (`next/dynamic`, `ssr:false`) | `ExperienceLoader` | No server cost, no hydration mismatch |
| WebGL2 check + device tiering (cores / memory) | `ExperienceLoader` | Weak phones start on the low tier instead of stuttering first |
| `PerformanceMonitor` → adaptive DPR, then low tier | `Experience` | Holds frame rate by lowering resolution, then dropping MSAA + heavy effects |
| `frameloop="never"` when the tab is hidden | `Experience` | Zero GPU/battery use in background tabs |
| Static geometry merged per material | `Hall` | Whole room ≈ 8 draw calls |
| `InstancedMesh` for seats, `computeBoundingSphere()` | `Seats` | 216 seats = 2 draw calls, correct culling and picking |
| Raycasting disabled unless the booking view is open | `Seats` | Pointer moves cost nothing while scrolling |
| Shadows baked: `shadowMap.autoUpdate=false`, re-baked only on tier change | `Experience`, `Scene` | Shadow pass runs ~3 frames total, not every frame |
| Screen canvas redrawn at 30 fps max | `Screen` | Texture uploads halved on 60 Hz, quartered on 120 Hz |
| Particles and beam animate in vertex shaders | `Atmosphere` | No per-frame CPU work or buffer uploads |
| Atmos rings `visible=false` when faded out | `Atmosphere` | Skips the draw call |
| Scroll + selection live outside React (`scrollState`, store `subscribe`/`getState`) | `lib/scroll`, `Seats`, `Director` | Scrolling and hovering never re-render the Canvas tree |
| Frame-rate-independent damping (`maath/easing`) | `Director` | Same feel at 30, 60 or 120 fps |
| postprocessing merges effects into one pass; MSAA in the composer, not the canvas | `Effects`, `Experience` | One fullscreen pass instead of six |
| `next/font` self-hosting, `optimizePackageImports` | `layout`, `next.config` | No font CLS, smaller bundles |
| `prefers-reduced-motion` respected | `Director`, `ScrollManager` | No parallax/smooth scroll for those who opt out |

## Making it photoreal (next step)

The hall is procedural so the prototype stays tiny. For the production build:

1. Photograph and measure one of their screens (wide shots, seat close-ups, carpet, wall panels).
2. Model the hall in Blender. **Bake lighting** (Cycles → lightmaps) so realism costs nothing at runtime.
3. Export GLB, then compress:
   ```bash
   npx @gltf-transform/cli optimize hall.glb public/models/hall.glb --compress meshopt --texture-compress ktx2
   ```
4. Generate a typed component: `npx gltfjsx public/models/hall.glb --transform --types`.
5. Load it with drei `useGLTF` (+ `useKTX2`) inside `<Suspense>`, replacing `Hall.tsx`. Keep `Seats.tsx`
   as instanced meshes using the seat geometry from the GLB, so picking and colouring still work.

Target budget: hall GLB ≤ 6 MB, ≤ 60 draw calls, 60 fps on a mid-range Android at DPR 1.

## Still sample data

- Showtimes, prices, `[bracketed]` film titles, booking ID/QR.
- Photo slots in the Visit reel.
- Enquiry form and payment are not wired: add `app/api/enquiry/route.ts` (WhatsApp Business / CRM) and
  Razorpay or PhonePe checkout, and source seat availability from their ticketing system.
