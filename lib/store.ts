import { create } from 'zustand';
import { SEATS, MAX_SEATS, bestPair } from './seats';

export type Tier = 'high' | 'low';

type EventDraft = { name: string; occ: string };

type State = {
  booking: boolean;
  view: number; // seat index whose point-of-view is shown, -1 = overview
  hover: number;
  hoverX: number;
  hoverY: number;
  selected: number[];
  paid: boolean;
  ev: EventDraft;
  ready: boolean; // first 3D frame rendered
  glFailed: boolean;
  tier: Tier;
  lite: boolean; // weak device: poster backdrop, 3D only on request
};

type Actions = {
  open: () => void;
  close: () => void;
  toggle: (i: number) => void;
  setHover: (i: number, x?: number, y?: number) => void;
  toggleView: () => void;
  best: () => void;
  pay: () => void;
  finish: () => void;
  previewRecliner: () => void;
  setEv: (patch: Partial<EventDraft>) => void;
  setReady: () => void;
  setGlFailed: () => void;
  setTier: (t: Tier) => void;
  setLite: () => void;
  enter3d: () => void;
};

/**
 * One store for UI + 3D. The 3D scene reads it with getState()/subscribe()
 * inside useFrame, so seat changes never re-render the <Canvas> tree.
 */
export const useStore = create<State & Actions>()((set, get) => ({
  booking: false,
  view: -1,
  hover: -1,
  hoverX: 0,
  hoverY: 0,
  selected: [],
  paid: false,
  ev: { name: '', occ: 'Birthday' },
  ready: false,
  glFailed: false,
  tier: 'high',
  lite: false,

  open: () => set({ booking: true, view: -1, paid: false }),
  close: () => set({ booking: false, view: -1, hover: -1 }),

  toggle: (i) => {
    const { selected, view } = get();
    const seat = SEATS[i];
    if (!seat || seat.booked || view >= 0) return;
    if (selected.includes(i)) set({ selected: selected.filter((x) => x !== i) });
    else if (selected.length < MAX_SEATS) set({ selected: [...selected, i] });
  },

  setHover: (i, x = 0, y = 0) => {
    if (i === get().hover) set({ hoverX: x, hoverY: y });
    else set({ hover: i, hoverX: x, hoverY: y });
  },

  toggleView: () => {
    const { view, selected } = get();
    if (view >= 0) set({ view: -1 });
    else if (selected.length) set({ view: selected[selected.length - 1] });
  },

  best: () => set({ selected: bestPair(), view: -1 }),
  pay: () => set({ paid: true, view: -1 }),
  finish: () => set({ selected: [], paid: false, booking: false, view: -1, hover: -1 }),

  previewRecliner: () => {
    const seat = SEATS.find((s) => s.rec && !s.booked && Math.abs(s.x) < 4);
    // Without 3D there is no seat view, so just pick the recliner on the 2D map.
    const has3d = !get().lite && !get().glFailed;
    if (seat) set({ booking: true, paid: false, selected: [seat.i], view: has3d ? seat.i : -1 });
    else set({ booking: true });
  },

  setEv: (patch) => set({ ev: { ...get().ev, ...patch } }),
  setReady: () => set({ ready: true }),
  setGlFailed: () => set({ glFailed: true, ready: true }),
  setTier: (tier) => set({ tier }),
  // Lite mode counts as ready so the curtain opens straight onto the poster.
  setLite: () => set({ lite: true, ready: true }),
  enter3d: () => set({ lite: false, tier: 'low' }),
}));
