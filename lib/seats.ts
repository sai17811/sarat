// Seat model shared by the 3D hall and the 2D seat map.
// Deterministic (seeded) so server and client render the same layout.

export type Seat = {
  i: number;
  id: string;
  row: number;
  rec: boolean;
  x: number;
  side: -1 | 1;
  booked: boolean;
};

export const ROW_LETTERS = 'ABCDEFGHIJKL';
export const ROW_COUNT = 12;
export const RECLINER_FROM_ROW = 10;
export const PRICE = { classic: 200, recliner: 350 } as const; // sample prices
export const MAX_SEATS = 8;

function build(): Seat[] {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const seats: Seat[] = [];

  for (let row = 0; row < ROW_COUNT; row++) {
    const rec = row >= RECLINER_FROM_ROW;
    const perSide = rec ? 5 : 9;
    const spacing = rec ? 1.75 : 0.95;
    const start = rec ? 1.62 : 1.18;
    const rowSeats: Omit<Seat, 'i' | 'id' | 'booked'>[] = [];

    for (const side of [-1, 1] as const) {
      for (let k = 0; k < perSide; k++) rowSeats.push({ row, rec, side, x: side * (start + k * spacing) });
    }
    rowSeats
      .sort((a, b) => a.x - b.x)
      .forEach((s, n) => {
        seats.push({ ...s, i: seats.length, id: ROW_LETTERS[row] + (n + 1), booked: rnd() < (rec ? 0.34 : 0.26) });
      });
  }
  return seats;
}

export const SEATS: readonly Seat[] = build();

export const seatPrice = (s: Seat) => (s.rec ? PRICE.recliner : PRICE.classic);

/** Two adjacent free seats closest to the centre sweet spot. */
export function bestPair(): number[] {
  let best: number[] = [];
  let score = Infinity;
  for (let row = 4; row <= 8; row++) {
    const rowSeats = SEATS.filter((s) => s.row === row);
    for (let k = 0; k < rowSeats.length - 1; k++) {
      const a = rowSeats[k];
      const b = rowSeats[k + 1];
      if (a.booked || b.booked || a.side !== b.side) continue;
      const sc = Math.abs((a.x + b.x) / 2) + Math.abs(row - 6.5) * 0.8;
      if (sc < score) {
        score = sc;
        best = [a.i, b.i];
      }
    }
  }
  return best;
}
