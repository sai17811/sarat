'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { MAX_SEATS, ROW_COUNT, ROW_LETTERS, SEATS, seatPrice } from '@/lib/seats';
import { useStore } from '@/lib/store';

/** 2D seat map kept in sync with the 3D hall: same store, same seats. */
function SeatMap() {
  const selected = useStore((s) => s.selected);
  const { toggle, setHover } = useStore(useShallow((s) => ({ toggle: s.toggle, setHover: s.setHover })));
  const rows = useMemo(() => Array.from({ length: ROW_COUNT }, (_, r) => SEATS.filter((s) => s.row === r)), []);
  const sel = new Set(selected);

  return (
    <div className="map" role="group" aria-label="Seat map">
      <div className="scr" aria-hidden="true" />
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'contents' }}>
          {r === 10 && <div style={{ height: 6 }} />}
          <div className="row">
            <em>{ROW_LETTERS[r]}</em>
            {row.map((s, n) => (
              <span key={s.id} style={{ display: 'contents' }}>
                {n > 0 && row[n - 1].side !== s.side && <span className="gap" />}
                <button
                  type="button"
                  className={s.rec ? 'rc' : undefined}
                  disabled={s.booked}
                  aria-pressed={sel.has(s.i)}
                  aria-label={(s.rec ? 'Recliner ' : 'Seat ') + s.id + (s.booked ? ', taken' : '')}
                  onClick={() => toggle(s.i)}
                  onPointerEnter={(e) => setHover(s.i, e.clientX, e.clientY)}
                  onPointerLeave={() => setHover(-1)}
                />
              </span>
            ))}
            <em>{ROW_LETTERS[r]}</em>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingPanel() {
  const st = useStore(useShallow((s) => ({ booking: s.booking, view: s.view, selected: s.selected, paid: s.paid })));
  const actions = useStore(useShallow((s) => ({ close: s.close, toggleView: s.toggleView, best: s.best, pay: s.pay, finish: s.finish })));
  const closeBtn = useRef<HTMLButtonElement>(null);
  const has3d = useStore((s) => !s.lite && !s.glFailed);

  const chosen = st.selected.map((i) => SEATS[i]);
  const total = chosen.reduce((a, s) => a + seatPrice(s), 0);
  const ids = chosen.map((s) => s.id).join(', ');

  useEffect(() => {
    if (!st.booking) return;
    const t = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 350);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && actions.close();
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [st.booking, actions]);

  const hint = st.view >= 0
    ? 'Your view from ' + SEATS[st.view].id
    : st.selected.length >= MAX_SEATS ? `Max ${MAX_SEATS} seats per booking` : 'Tap seats in the hall or on the map';

  return (
    <aside id="book" aria-label="Seat booking" aria-hidden={!st.booking} inert={!st.booking}>
      <article className="ticket">
        <div className="stub">
          <div><span className="mono">Screen 3 · Today · 7:00 PM</span><h3>Aakasamlo Oka Tara</h3></div>
          <button ref={closeBtn} className="x" type="button" aria-label="Close booking" onClick={actions.close}>×</button>
        </div>

        {!st.paid ? (
          <div className="bk">
            <p className="mono" style={{ margin: 0, color: 'var(--paper-mute)' }}>{hint}</p>
            <div className="legend mono">
              <span><i style={{ background: '#9C2A3A' }} />Classic</span>
              <span><i style={{ background: '#B07A3A' }} />Recliner</span>
              <span><i style={{ background: '#F2A93B' }} />Yours</span>
              <span><i style={{ background: '#3A3432' }} />Taken</span>
            </div>
            <SeatMap />
            <div className="sum">
              <div><span>Seats</span><b>{ids || '—'}</b></div>
              <div><span>Tickets</span><span>₹{total}</span></div>
              <div><span>Booking fee</span><span>₹0 · booked direct</span></div>
              <div className="tot"><span>Total</span><span>₹{total}</span></div>
              <span className="mono" style={{ color: 'var(--paper-mute)', fontSize: 9 }}>Sample prices · classic ₹200 · recliner ₹350</span>
            </div>
            <div className="acts">
              <button className="tk ghost" type="button" style={{ background: '#fff6e2' }} onClick={actions.best}>Best two seats for me</button>
              {has3d && (
                <button className="tk dark" type="button" disabled={!chosen.length} onClick={actions.toggleView}>
                  {st.view >= 0 ? 'Back to the seat map' : 'View from my seat'}
                </button>
              )}
              <button className="tk" type="button" disabled={!chosen.length} onClick={actions.pay}>Continue to pay</button>
            </div>
          </div>
        ) : (
          <div className="done" role="status" style={{ display: 'flex' }}>
            <span className="mono" style={{ color: 'var(--paper-mute)' }}>Admit {chosen.length} · SRC-24719</span>
            <h3>You&apos;re booked</h3>
            <p style={{ margin: 0 }}>Seats {ids} · Screen 3 · 7:00 PM</p>
            <div className="qr" role="img" aria-label="Entry QR code placeholder" />
            <p className="mono" style={{ margin: 0, color: 'var(--paper-mute)', fontSize: 10, lineHeight: 1.6 }}>
              Tickets arrive on WhatsApp in the live site.<br />Prototype: no booking was made.
            </p>
            <button className="tk dark" type="button" onClick={actions.finish}>Done</button>
          </div>
        )}
      </article>
    </aside>
  );
}
