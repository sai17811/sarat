'use client';

import { useRef, useState } from 'react';
import { BookButton } from './BookButton';

/** Generated projector-room ambience: brown noise gated at 24 Hz (the shutter). Opt-in only. */
function useProjectorSound() {
  const ctx = useRef<AudioContext | null>(null);
  const [on, setOn] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = async () => {
    try {
      if (!ctx.current) {
        const a = new AudioContext();
        const len = a.sampleRate * 2;
        const buf = a.createBuffer(1, len, a.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
        const src = a.createBufferSource(); src.buffer = buf; src.loop = true;
        const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
        const shutter = a.createGain(); shutter.gain.value = 0.6;
        const lfo = a.createOscillator(); lfo.frequency.value = 24;
        const depth = a.createGain(); depth.gain.value = 0.25;
        lfo.connect(depth).connect(shutter.gain);
        const master = a.createGain(); master.gain.value = 0.12;
        src.connect(lp).connect(shutter).connect(master).connect(a.destination);
        src.start(); lfo.start();
        ctx.current = a;
      }
      if (on) await ctx.current.suspend(); else await ctx.current.resume();
      setOn(!on);
    } catch {
      setFailed(true);
    }
  };
  return { on, failed, toggle };
}

export function Header() {
  const sound = useProjectorSound();
  return (
    <header className="top">
      <a className="brand" href="#r1" aria-label="Sarathi Cinemas home">
        <span className="te" aria-hidden="true">సారథి</span>
        <span className="en"><b>Sarathi</b><span className="mono">Cinemas · Rajahmundry</span></span>
      </a>
      <nav aria-label="Main">
        <a className="mono" href="#r2">Movies</a>
        <a className="mono" href="#r3">Experience</a>
        <a className="mono" href="#r6">Events</a>
        <a className="mono" href="#r7">Visit</a>
        <button className="snd mono" type="button" aria-pressed={sound.on} disabled={sound.failed} onClick={sound.toggle}>
          {sound.failed ? 'No sound' : sound.on ? 'Sound on' : 'Sound off'}
        </button>
        <BookButton className="tk sm">Book seats</BookButton>
      </nav>
    </header>
  );
}
