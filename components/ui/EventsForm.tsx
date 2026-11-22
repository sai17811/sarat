'use client';

import { useState, type FormEvent } from 'react';
import { useStore } from '@/lib/store';

const OCCASIONS = ['Birthday', 'Corporate', 'School / college', 'Fan show', 'Pre-wedding film', 'Advertising'];

/** Typing a name updates the 3D screen live (it reads ev from the store). */
export function EventsForm() {
  const setEv = useStore((s) => s.setEv);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/enquiry → WhatsApp Business / CRM.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="ok" role="status" style={{ display: 'block' }}>
        <h3>Enquiry received</h3>
        <p>The events team would call back to plan the screen, timing and snacks. Prototype: nothing was sent.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="two">
        <label htmlFor="evName">Name<input id="evName" type="text" maxLength={20} autoComplete="name" onChange={(e) => setEv({ name: e.target.value.trim() })} /></label>
        <label htmlFor="evOcc">Occasion
          <select id="evOcc" onChange={(e) => setEv({ occ: e.target.value })}>
            {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
      </div>
      <div className="two">
        <label htmlFor="evPhone">WhatsApp number<input id="evPhone" type="tel" autoComplete="tel" /></label>
        <label htmlFor="evGuests">Guests<input id="evGuests" type="number" min={1} /></label>
      </div>
      <button className="tk dark" type="submit">Request a callback</button>
    </form>
  );
}
