'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

// Sample showtimes until the cinema's ticketing system is connected.
const SLOTS = ['10:15 AM', '11:30 AM', '1:30 PM', '2:45 PM', '4:45 PM', '6:00 PM', '7:00 PM', '9:30 PM', '10:30 PM'];
const WK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Day = { top: string; label: string };

export function Showtimes() {
  const open = useStore((s) => s.open);
  const [day, setDay] = useState(0);
  // Dates come from the visitor's clock, so build them after hydration.
  const [days, setDays] = useState<Day[] | null>(null);

  useEffect(() => {
    const now = new Date();
    setDays(Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      return { top: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : WK[d.getDay()], label: `${d.getDate()} ${MO[d.getMonth()]}` };
    }));
  }, []);

  const times = [0, 1, 2, 3, 4]
    .map((k) => ({ i: (day + k * 2) % SLOTS.length, hot: (day + k) % 3 === 0, k }))
    .sort((a, b) => a.i - b.i);

  return (
    <>
      <div className="tabs" role="group" aria-label="Choose a date">
        {(days ?? Array.from({ length: 5 }, () => ({ top: ' ', label: ' ' }))).map((d, i) => (
          <button key={i} type="button" className="tab" aria-pressed={i === day} onClick={() => setDay(i)}>
            <span className="mono" style={{ fontSize: 9 }}>{d.top}</span>
            <b>{d.label}</b>
          </button>
        ))}
      </div>
      <div className="times">
        {times.map((t) => (
          <button key={t.k} type="button" className="time" onClick={open}>
            {SLOTS[t.i]}
            <small className={t.hot ? 'hot' : undefined}>{t.hot ? 'Filling fast' : `Screen ${t.k + 1}`}</small>
          </button>
        ))}
      </div>
    </>
  );
}
