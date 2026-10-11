/* Café sounds, off unless you turn them on (You → Settings → Display and
   sound). Made in the browser with Web Audio, so there's nothing to
   download: a cup set down on its saucer for a pass, and a burst of milk
   steam for the big wins (a track finished, a boss beaten). Every sound
   follows a tap, which is what lets a browser play it. Kept per device,
   like the theme. */

import { getDisplay } from './display.js';

let ctx = null;

export const soundOn = () => getDisplay().sound === 'on';

function audio() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* Two bright partials that die away fast: china on china. */
function clink(a) {
  const now = a.currentTime;
  [[2637, 0.16, 0], [3951, 0.09, 0.012], [5274, 0.05, 0.02]].forEach(([freq, gain, at]) => {
    const osc = a.createOscillator();
    const amp = a.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, now + at);
    amp.gain.linearRampToValueAtTime(gain, now + at + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.45);
    osc.connect(amp);
    amp.connect(a.destination);
    osc.start(now + at);
    osc.stop(now + at + 0.5);
  });
}

/* Noise through a band-pass, swelling and fading: the steam wand. */
function hiss(a) {
  const now = a.currentTime;
  const length = 1.1;
  const buffer = a.createBuffer(1, Math.floor(a.sampleRate * length), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = a.createBufferSource();
  noise.buffer = buffer;
  const band = a.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(2400, now);
  band.frequency.linearRampToValueAtTime(4200, now + length);
  const amp = a.createGain();
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(0.11, now + 0.18);
  amp.gain.setValueAtTime(0.11, now + 0.6);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + length);
  noise.connect(band);
  band.connect(amp);
  amp.connect(a.destination);
  noise.start(now);
  noise.stop(now + length);
  setTimeout(() => clink(a), 650);   // and the cup goes down
}

/** Plays 'clink' or 'hiss' when sounds are on. Never throws: a sound is a nicety. */
export function play(kind, { force = false } = {}) {
  if (!force && !soundOn()) return;
  try {
    const a = audio();
    if (!a) return;
    if (kind === 'hiss') hiss(a);
    else clink(a);
  } catch {
    /* no sound, no matter */
  }
}
