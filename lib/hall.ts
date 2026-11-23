import { Vector3 } from 'three';

// Hall dimensions (metres). Screen is centred on x = 0, audience faces -z.
export const SW = 18;
export const SH = 7.6;
export const SY = 5.9;
export const SZ = -2;
export const rowZ = (r: number) => 5.4 + r * 1.38;
export const rowY = (r: number) => r * 0.42;
export const APEX = new Vector3(0, 10.6, 29.6); // projector lens

export type Mode = 'brand' | 'film' | 'tech' | 'recline' | 'legacy' | 'events' | 'visit' | 'book';

/** One screen programme + camera shot per reel, in page order. */
export const MODES: Mode[] = ['brand', 'film', 'tech', 'recline', 'legacy', 'events', 'visit'];

type V3 = [number, number, number];
export const SHOTS: { p: V3; t: V3 }[] = [
  { p: [0, 8.4, 26.5], t: [0, 5.5, -2] }, // back of hall, by the booth
  { p: [-6.8, 4.4, 14.5], t: [1.5, 5.8, -2] }, // mid aisle
  { p: [8.6, 5.2, 3.2], t: [-1.5, 8.8, 26] }, // turn to face the projector beam
  { p: [10.2, 6.4, 23.4], t: [0, 4.4, 17.6] }, // recliner rows
  { p: [0, 2.2, 3.6], t: [0, 6.6, -2] }, // front row, looking up (sepia)
  { p: [-9.6, 7.2, 9.6], t: [2, 5.6, -2] }, // events
  { p: [0, 5.9, 7.5], t: [0, 5.9, -2] }, // into the screen
];

/** Colour the screen throws into the room, per programme. */
export const LIGHT: Record<Mode, number> = {
  brand: 0xffcf9a,
  film: 0x9db3ff,
  tech: 0xc8a8ff,
  recline: 0xffb062,
  legacy: 0xead6a4,
  events: 0xff9fb4,
  visit: 0xffdfa0,
  book: 0xffd08a,
};
