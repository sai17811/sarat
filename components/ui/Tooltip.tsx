'use client';

import { SEATS, seatPrice } from '@/lib/seats';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';

export function Tooltip() {
  const { hover, x, y, booking, selected } = useStore(
    useShallow((s) => ({ hover: s.hover, x: s.hoverX, y: s.hoverY, booking: s.booking, selected: s.selected })),
  );
  if (!booking || hover < 0) return null;
  const s = SEATS[hover];
  const state = s.booked ? ' · taken' : selected.includes(s.i) ? ' · yours' : '';
  return (
    <div id="tip" role="status" style={{ display: 'block', left: x, top: y }}>
      {s.id} · {s.rec ? 'Recliner' : 'Classic'} ₹{seatPrice(s)}{state}
    </div>
  );
}
