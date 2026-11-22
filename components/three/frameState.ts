import { Color } from 'three';
import type { Mode } from '@/lib/hall';

/**
 * Per-frame values written once by <Director/> and read by every other
 * 3D component inside useFrame. Mutable on purpose: zero allocations,
 * zero React renders per frame.
 */
export const frame = {
  idx: 0,
  mode: 'brand' as Mode,
  flashUntil: 0,
  flicker: 1, // 1 = steady, <1 during a programme change
  sepia: 0,
  atmos: 0,
  beam: 1,
  ceiling: true,
  light: new Color(1, 1, 1), // current screen light colour (damped)
};

/** Shared uniform so the beam and the dust always match the screen colour. */
export const beamColor = { value: new Color(1, 0.95, 0.85) };
