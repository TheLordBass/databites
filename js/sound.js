/* Café sounds, off unless you turn them on (You → Settings → Display and
   sound). Made in the browser with Web Audio, so there's nothing to
   download: a cup set down on its saucer for a pass, a burst of milk
   steam for the big wins (a track finished), two glasses clinking for a
   Taste test passed, the counter bell, ding ding, for a Signature (the
   order's up), and a rubber stamp's soft thud as an achievement's stamp
   lands. Every sound
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

/* One struck thing: sine partials at ratios of `freq`, each with its own
   level and ring time (the high ones die first), and a tick of noise for
   the moment of contact. */
function strike(a, at, freq, partials, level = 1) {
  const out = a.createGain();
  out.gain.value = level;
  out.connect(a.destination);
  partials.forEach(([ratio, gain, ring, detune = 0]) => {
    const osc = a.createOscillator();
    const amp = a.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio + detune;
    amp.gain.setValueAtTime(0, at);
    amp.gain.linearRampToValueAtTime(gain, at + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + ring);
    osc.connect(amp);
    amp.connect(out);
    osc.start(at);
    osc.stop(at + ring + 0.05);
  });
  const tick = a.createBuffer(1, Math.floor(a.sampleRate * 0.006), a.sampleRate);
  const data = tick.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = a.createBufferSource();
  noise.buffer = tick;
  const high = a.createBiquadFilter();
  high.type = 'highpass';
  high.frequency.value = 4000;
  const amp = a.createGain();
  amp.gain.value = 0.05;
  noise.connect(high);
  high.connect(amp);
  amp.connect(out);
  noise.start(at);
}

/* A Taste test passed: two glasses touched together. Glass rings at
   uneven partials; the two are a shade apart in pitch, so they shimmer
   against each other, and they touch again, softly, a beat later. */
const GLASS = [[1, 0.1, 1.5], [2.32, 0.05, 0.8], [4.25, 0.025, 0.4], [6.63, 0.012, 0.22]];
function glasses(a) {
  const now = a.currentTime;
  strike(a, now, 1568, GLASS);
  strike(a, now + 0.008, 1622, GLASS, 0.9);
  strike(a, now + 0.13, 1595, GLASS, 0.35);
}

/* A Signature passed: the bell on the counter, rung twice. A bell's
   partials sit well apart; the lowest is doubled a few hertz off, which
   gives a desk bell its slow wobble as it rings out. */
const BELL = [[1, 0.09, 2.4], [1, 0.05, 2.4, 3.5], [2.76, 0.05, 1.3], [5.4, 0.022, 0.6], [8.93, 0.01, 0.3]];
function bell(a) {
  const now = a.currentTime;
  strike(a, now, 1319, BELL);
  strike(a, now + 0.3, 1319, BELL);
}

/* A rubber stamp pressed onto paper: a low, dull knock that dies at once,
   a soft slap of noise for the rubber meeting the page, and no ring at all.
   `at` is when, in seconds from now, so it can land with the animation. */
function stamp(a, at = 0) {
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const amp = a.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(58, t + 0.09);
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.22, t + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(amp);
  amp.connect(a.destination);
  osc.start(t);
  osc.stop(t + 0.2);
  const slap = a.createBuffer(1, Math.floor(a.sampleRate * 0.05), a.sampleRate);
  const data = slap.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const noise = a.createBufferSource();
  noise.buffer = slap;
  const low = a.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 1400;
  const level = a.createGain();
  level.gain.value = 0.14;
  noise.connect(low);
  low.connect(level);
  level.connect(a.destination);
  noise.start(t);
}

/** Plays 'clink', 'hiss', 'glasses', 'bell' or 'stamp' when sounds are on;
    `at` delays it (seconds). Never throws: a sound is a nicety. */
export function play(kind, { force = false, at = 0 } = {}) {
  if (!force && !soundOn()) return;
  try {
    const a = audio();
    if (!a) return;
    if (kind === 'hiss') hiss(a);
    else if (kind === 'glasses') glasses(a);
    else if (kind === 'bell') bell(a);
    else if (kind === 'stamp') stamp(a, at);
    else clink(a);
  } catch {
    /* no sound, no matter */
  }
}
