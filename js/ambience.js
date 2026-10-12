/* Background sounds: lo-fi music, café chatter and rain to learn to, from
   the headphones in the top bar. Nothing is downloaded and nothing is
   sampled: each layer is synthesised here with Web Audio, rendered once
   (OfflineAudioContext) into a loop, and then simply played. A rendered loop
   keeps going while Python is busy, a tab is in the background or the page
   is mid-render, which a note-by-note scheduler on timers wouldn't.

   The music is two 16-bar "tapes" that take turns: jazzy seventh chords on
   a soft electric piano, a round bass, a dusty swung beat, a few melody
   notes through a delay, vinyl crackle and a slow tape wobble. Café chatter
   is distant mumbling voices (filtered buzz and breath through vowel
   formants), cups on saucers, a spoon stirring, the steam wand and the
   door bell. Rain is two channels of filtered noise and drops on the glass.
   Every layer uses its own seeded random numbers, so it sounds the same
   every time and never needs saving. */

const RATE = 24000;                     // lo-fi on purpose, and it halves the memory
const BPM = 74;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const STEP = BEAT / 4;                  // a sixteenth
const SWING = STEP * 0.32;              // the off-beat eighths land late
const TAPE_BARS = 16;
const TAPE = TAPE_BARS * BAR;           // how long a tape plays before the next starts
const TAIL = 3;                         // the reverb and delay ring on past that

const KEY = 'databites.ambience';
export const LAYERS = [
  ['beats', 'Lo-fi music'],
  ['cafe', 'Café chatter'],
  ['rain', 'Rain'],
];

/* ── Small helpers ───────────────────────────────────────── */

function seeded(seed) {                 // mulberry32
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const between = (r, lo, hi) => lo + r() * (hi - lo);
const pick = (r, list) => list[Math.floor(r() * list.length)];

function noise(ctx, seconds, r, brown = false) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = r() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return buffer;
}

function filter(ctx, type, freq, q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function gain(ctx, value) {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

function chain(...nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  return nodes[nodes.length - 1];
}

function pan(ctx, value) {
  if (!ctx.createStereoPanner) return gain(ctx, 1);
  const p = ctx.createStereoPanner();
  p.pan.value = value;
  return p;
}

/* A room: decaying noise, a little different on each side. */
function reverb(ctx, seconds, r) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * (1 - i / len) ** 3;
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

/* Warmth: a gentle tanh curve, the way tape and old amps round off peaks. */
function warmth(ctx, drive) {
  const shaper = ctx.createWaveShaper();
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  shaper.curve = curve;
  return shaper;
}

function offline(seconds) {
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  return new Ctx(2, Math.ceil(RATE * seconds), RATE);
}

function render(ctx) {
  // Old Safari only has the callback form.
  return new Promise((resolve, reject) => {
    ctx.oncomplete = (e) => resolve(e.renderedBuffer);
    const p = ctx.startRendering();
    if (p && p.then) p.then(resolve, reject);
  });
}

/* A loop with no click where it joins: render a little extra, then fade the
   extra in over the start, so the last sample runs into the first. */
function seamless(buffer, fade, into) {
  const sr = buffer.sampleRate;
  const x = Math.floor(fade * sr);
  const len = buffer.length - x;
  const out = into.createBuffer(buffer.numberOfChannels, len, sr);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = out.getChannelData(c);
    dst.set(src.subarray(0, len));
    for (let i = 0; i < x; i++) {
      const a = i / x;
      dst[i] = src[i] * Math.sqrt(a) + src[len + i] * Math.sqrt(1 - a);
    }
  }
  return out;
}

/* ── Lo-fi music ─────────────────────────────────────────── */

// Bass root, then the chord above it, voiced close in the middle of the keyboard.
const CHORDS = {
  Fmaj9: [41, [57, 60, 64, 67]],
  Em7: [40, [52, 55, 59, 62]],
  Dm9: [38, [53, 57, 60, 64]],
  Cmaj9: [36, [55, 59, 62, 64]],
  G13: [43, [53, 59, 64, 69]],
  Am9: [45, [55, 60, 64, 71]],
  Fmaj7: [41, [53, 57, 60, 64]],
  Cmaj7: [36, [55, 59, 60, 64]],
  G6: [43, [55, 59, 62, 64]],
};
const PROGRESSIONS = {
  a: ['Fmaj9', 'Em7', 'Dm9', 'Cmaj9'],
  b: ['Dm9', 'G13', 'Cmaj9', 'Am9'],
  c: ['Am9', 'Fmaj7', 'Cmaj7', 'G6'],
};
const TAPES = [
  { seed: 7, form: ['a', 'a', 'b', 'b'] },
  { seed: 31, form: ['c', 'c', 'b', 'a'], breathe: true },
];
const PENTATONIC = [67, 69, 72, 74, 76, 79, 81];

function renderTape({ seed, form, breathe }) {
  const r = seeded(seed);
  const ctx = offline(TAPE + TAIL);
  const end = TAPE + TAIL;

  // The mix: everything through a dusty low-pass, a little warmth and a compressor.
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 3;
  comp.attack.value = 0.01;
  comp.release.value = 0.25;
  const bus = gain(ctx, 0.9);
  chain(bus, filter(ctx, 'highpass', 35), filter(ctx, 'lowpass', 7200), warmth(ctx, 1.4), comp, gain(ctx, 0.82), ctx.destination);

  const room = reverb(ctx, 2.4, r);
  chain(room, gain(ctx, 0.32), bus);
  const echo = ctx.createDelay(2);
  echo.delayTime.value = BEAT * 0.75;
  const feedback = gain(ctx, 0.38);
  const echoTone = filter(ctx, 'lowpass', 1900);
  chain(echo, echoTone, feedback, echo);
  chain(echoTone, gain(ctx, 0.6), bus);

  // The tape wobble: every pitched voice drifts a few cents, slowly.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.33;
  const wobble = gain(ctx, 7);
  lfo.connect(wobble);
  lfo.start(0);

  const keysBus = gain(ctx, 0.5);
  chain(keysBus, filter(ctx, 'lowpass', 2300), bus);
  keysBus.connect(gain(ctx, 0.3)).connect(room);
  keysBus.connect(gain(ctx, 0.1)).connect(echo);

  const leadBus = gain(ctx, 0.3);
  chain(leadBus, filter(ctx, 'lowpass', 2600), bus);
  leadBus.connect(gain(ctx, 0.45)).connect(echo);
  leadBus.connect(gain(ctx, 0.35)).connect(room);

  const bassBus = gain(ctx, 0.55);
  chain(bassBus, filter(ctx, 'lowpass', 320), bus);

  const drumBus = gain(ctx, 0.5);
  chain(drumBus, filter(ctx, 'lowpass', 6500), bus);
  const snareRoom = gain(ctx, 0.18);
  snareRoom.connect(room);

  const hiss = noise(ctx, 1.5, r);

  function key(t, midi, vel, dur) {
    const f = mtof(midi);
    const car = ctx.createOscillator();
    car.frequency.value = f;
    const mod = ctx.createOscillator();
    mod.frequency.value = f;
    const index = ctx.createGain();       // how much the modulator brightens the note: a lot at first
    index.gain.setValueAtTime(f * 1.1 * vel, t);
    index.gain.exponentialRampToValueAtTime(f * 0.04, t + 0.7);
    chain(mod, index, car.frequency);
    wobble.connect(car.detune);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.13 * vel, t + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.075 * vel, t + 0.45);
    amp.gain.setTargetAtTime(0.0001, t + dur, 0.4);
    chain(car, amp, keysBus);
    car.start(t);
    mod.start(t);
    car.stop(Math.min(end, t + dur + 2.5));
    mod.stop(Math.min(end, t + dur + 2.5));
  }

  function chord(t, name, vel, dur) {
    CHORDS[name][1].forEach((m, i) => key(t + i * between(r, 0.006, 0.022), m, vel * between(r, 0.82, 1), dur));
  }

  function bass(t, midi, dur, vel = 1) {
    const f = mtof(midi);
    const osc = ctx.createOscillator();
    osc.frequency.value = f;
    const over = ctx.createOscillator();
    over.type = 'triangle';
    over.frequency.value = f * 2;
    const overAmp = gain(ctx, 0.12);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.5 * vel, t + 0.012);
    amp.gain.setTargetAtTime(0.32 * vel, t + 0.03, 0.25);
    amp.gain.setTargetAtTime(0.0001, t + dur, 0.08);
    osc.connect(amp);
    chain(over, overAmp, amp);
    amp.connect(bassBus);
    [osc, over].forEach((o) => { o.start(t); o.stop(Math.min(end, t + dur + 0.6)); });
  }

  function kick(t, vel) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(46, t + 0.1);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.95 * vel, t + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    chain(osc, amp, drumBus);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  function snare(t, vel) {
    const src = ctx.createBufferSource();
    src.buffer = hiss;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.42 * vel, t + 0.003);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    chain(src, filter(ctx, 'bandpass', 1700, 0.8), amp, drumBus);
    amp.connect(snareRoom);
    src.start(t, r() * 1.2, 0.25);
    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(200, t);
    body.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    const bodyAmp = ctx.createGain();
    bodyAmp.gain.setValueAtTime(0.25 * vel, t);
    bodyAmp.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    chain(body, bodyAmp, drumBus);
    body.start(t);
    body.stop(t + 0.12);
  }

  function hat(t, vel, open = false) {
    const src = ctx.createBufferSource();
    src.buffer = hiss;
    const amp = ctx.createGain();
    const len = open ? 0.2 : 0.035;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.13 * vel, t + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + len);
    chain(src, filter(ctx, 'highpass', 7000), amp, drumBus);
    src.start(t, r() * 1.2, len + 0.02);
  }

  function lead(t, midi, dur) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = mtof(midi);
    wobble.connect(osc.detune);
    const vib = ctx.createOscillator();
    vib.frequency.value = 5;
    const vibAmp = ctx.createGain();
    vibAmp.gain.setValueAtTime(0, t);
    vibAmp.gain.linearRampToValueAtTime(9, t + 0.25);
    chain(vib, vibAmp, osc.detune);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.16, t + 0.025);
    amp.gain.setTargetAtTime(0.09, t + 0.05, 0.2);
    amp.gain.setTargetAtTime(0.0001, t + dur, 0.12);
    chain(osc, amp, leadBus);
    [osc, vib].forEach((o) => { o.start(t); o.stop(Math.min(end, t + dur + 0.8)); });
  }

  const human = (t) => Math.max(0, t + between(r, -0.008, 0.008));   // played, not programmed
  const swung = (step) => step * STEP + (step % 4 === 2 ? SWING : 0);
  const KICKS = [[0, 10], [0, 7, 10], [0, 3, 10], [0, 8, 11]];
  let note = 2;                          // where the melody is on the pentatonic

  form.forEach((name, section) => {
    PROGRESSIONS[name].forEach((chordName, i) => {
      const bar = section * 4 + i;
      const t0 = bar * BAR;
      const [root] = CHORDS[chordName];
      const quiet = breathe && bar === 0;  // the second tape opens on the keys alone

      chord(human(t0), chordName, 0.95, BEAT * 2.4);
      if (r() < 0.7) chord(human(t0 + swung(10)), chordName, 0.55, BEAT * 1.2);

      bass(t0, root, BEAT * 1.6);
      bass(t0 + swung(10), r() < 0.5 ? root : root + 7, BEAT * 0.9, 0.8);
      if (r() < 0.5) bass(t0 + 14 * STEP, root + pick(r, [-2, 2, 5]), STEP * 1.6, 0.6);

      if (!quiet) {
        const kicks = pick(r, KICKS);
        kicks.forEach((s) => kick(human(t0 + swung(s)), s === 0 ? 1 : 0.8));
        snare(t0 + 4 * STEP + 0.012, 1);
        snare(t0 + 12 * STEP + 0.012, 1);
        if (r() < 0.3) snare(t0 + swung(15), 0.25);
        for (let s = 0; s < 16; s += 2) {
          const open = s === 14 && r() < 0.25;
          hat(human(t0 + swung(s)), s % 4 === 0 ? 0.8 : 0.5, open);
        }
        if (r() < 0.35) hat(t0 + swung(7), 0.3);
      }

      // A few notes of melody in the second half of every eight bars.
      if (bar % 8 >= 4) {
        const slots = [0, 2, 4, 6, 8, 10, 12, 14].filter(() => r() < 0.42);
        slots.forEach((s, j) => {
          note = Math.max(0, Math.min(PENTATONIC.length - 1, note + pick(r, [-2, -1, -1, 1, 1, 2])));
          const next = slots[j + 1] ?? 16;
          lead(human(t0 + swung(s)), PENTATONIC[note], Math.min(next - s, 4) * STEP * 0.9);
        });
      }
    });
  });

  // Vinyl: a soft hiss and the odd pop, all the way through, gone by the tail.
  const vinyl = ctx.createBuffer(1, RATE * 4, RATE);
  const vd = vinyl.getChannelData(0);
  let pop = 0;
  for (let i = 0; i < vd.length; i++) {
    if (r() < 0.0007) pop = (r() * 2 - 1) * 0.7;
    pop *= 0.8;
    vd[i] = (r() * 2 - 1) * 0.02 + pop;
  }
  const crackle = ctx.createBufferSource();
  crackle.buffer = vinyl;
  crackle.loop = true;
  const crackleAmp = gain(ctx, 0.45);
  crackleAmp.gain.setValueAtTime(0.45, TAPE);
  crackleAmp.gain.linearRampToValueAtTime(0, TAPE + 1);
  chain(crackle, filter(ctx, 'highpass', 700), filter(ctx, 'lowpass', 6000), crackleAmp, bus);
  crackle.start(0);

  return render(ctx);
}

/* ── Café chatter ────────────────────────────────────────── */

const CAFE_LEN = 40;
const VOWELS = [[730, 1090], [270, 2290], [530, 1840], [570, 840], [440, 1020], [300, 870], [660, 1720]];

function renderCafe() {
  const r = seeded(1234);
  const len = CAFE_LEN + 3;
  const ctx = offline(len);
  const bus = gain(ctx, 1);
  const comp = ctx.createDynamicsCompressor();
  chain(bus, comp, gain(ctx, 0.9), ctx.destination);
  const room = reverb(ctx, 1.8, r);
  chain(room, gain(ctx, 0.5), bus);

  // The room itself: a low rumble of everything at once.
  const tone = ctx.createBufferSource();
  tone.buffer = noise(ctx, len, r, true);
  chain(tone, filter(ctx, 'lowpass', 420), gain(ctx, 0.3), bus);
  tone.start(0);

  // Voices, across the room: buzz and breath through two vowel formants,
  // shaped into syllables and phrases, then muffled by distance.
  const voices = gain(ctx, 0.55);
  chain(voices, filter(ctx, 'lowpass', 1100), bus);
  voices.connect(gain(ctx, 0.5)).connect(room);
  const breath = noise(ctx, 2, r);
  for (let v = 0; v < 6; v++) {
    const pitch = v % 2 ? between(r, 175, 230) : between(r, 95, 135);
    const buzz = ctx.createOscillator();
    buzz.type = 'sawtooth';
    buzz.frequency.value = pitch;
    const air = ctx.createBufferSource();
    air.buffer = breath;
    air.loop = true;
    const mix = gain(ctx, 1);
    buzz.connect(gain(ctx, 0.5)).connect(mix);
    air.connect(gain(ctx, 0.25)).connect(mix);
    const f1 = filter(ctx, 'bandpass', 600, 5);
    const f2 = filter(ctx, 'bandpass', 1400, 7);
    const amp = ctx.createGain();
    amp.gain.value = 0;
    mix.connect(f1);
    mix.connect(f2);
    f1.connect(amp);
    f2.connect(gain(ctx, 0.6)).connect(amp);
    chain(amp, pan(ctx, between(r, -0.8, 0.8)), gain(ctx, between(r, 0.5, 1)), voices);

    let t = between(r, 0, 4);
    while (t < len - 1) {
      const phraseEnd = t + between(r, 1.5, 5);
      let f0 = pitch * between(r, 1, 1.15);
      while (t < phraseEnd) {
        const syl = between(r, 0.11, 0.28);
        const [a, b] = pick(r, VOWELS);
        f1.frequency.setTargetAtTime(a, t, 0.03);
        f2.frequency.setTargetAtTime(b, t, 0.03);
        f0 *= between(r, 0.96, 1.03);
        buzz.frequency.setTargetAtTime(f0, t, 0.04);
        amp.gain.setTargetAtTime(between(r, 0.4, 1), t, 0.02);
        amp.gain.setTargetAtTime(0.05, t + syl * 0.7, 0.03);
        t += syl;
      }
      amp.gain.setTargetAtTime(0, t, 0.05);
      t += between(r, 0.8, 4);
    }
    buzz.start(0);
    air.start(0, r());
    buzz.stop(len);
    air.stop(len);
  }

  const clinks = gain(ctx, 1);
  chain(clinks, bus);
  clinks.connect(gain(ctx, 0.6)).connect(room);

  function ting(t, freqs, level, decay, where) {
    const out = pan(ctx, where);
    out.connect(clinks);
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = f;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.linearRampToValueAtTime(level / (i + 1), t + 0.003);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      chain(osc, amp, out);
      osc.start(t);
      osc.stop(t + decay + 0.05);
    });
  }

  // Cups and spoons, here and there.
  let t = 0.6;
  while (t < len - 1) {
    const where = between(r, -0.9, 0.9);
    const s = between(r, 0.92, 1.08);
    if (r() < 0.75) {
      ting(t, [2650 * s, 3950 * s, 5300 * s], between(r, 0.03, 0.07), between(r, 0.18, 0.4), where);
      if (r() < 0.3) ting(t + 0.09, [2700 * s, 4020 * s], 0.025, 0.2, where);
    } else {
      for (let k = 0; k < 4 + Math.floor(r() * 4); k++) {
        ting(t + k * between(r, 0.14, 0.2), [3800 * s, 5200 * s], between(r, 0.008, 0.016), 0.09, where);
      }
    }
    t += between(r, 1.2, 5);
  }

  // The steam wand, once: a hiss that rises and settles.
  const steamAt = 15;
  const steam = ctx.createBufferSource();
  steam.buffer = noise(ctx, 5, r);
  const wand = filter(ctx, 'bandpass', 2600, 1.2);
  wand.frequency.setValueAtTime(2600, steamAt);
  wand.frequency.linearRampToValueAtTime(4200, steamAt + 4);
  const steamAmp = ctx.createGain();
  steamAmp.gain.setValueAtTime(0.0001, steamAt);
  steamAmp.gain.linearRampToValueAtTime(0.05, steamAt + 0.6);
  steamAmp.gain.setValueAtTime(0.05, steamAt + 3.4);
  steamAmp.gain.exponentialRampToValueAtTime(0.0001, steamAt + 4.6);
  chain(steam, wand, steamAmp, pan(ctx, 0.5), bus);
  steam.start(steamAt);

  // And the bell over the door, once.
  ting(31, [1760, 2640, 3520, 4400], 0.035, 1.6, -0.6);
  ting(31.18, [1760, 2640, 3520], 0.02, 1.2, -0.6);

  return render(ctx);
}

/* ── Rain ────────────────────────────────────────────────── */

const RAIN_LEN = 20;

function renderRain() {
  const r = seeded(99);
  const len = RAIN_LEN + 3;
  const ctx = offline(len);
  const bus = gain(ctx, 1);
  chain(bus, ctx.destination);

  // The downpour: noise on each side, so it's wide, not in your head.
  const merger = ctx.createChannelMerger(2);
  [0, 1].forEach((side) => {
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx, len, r);
    chain(src, filter(ctx, 'highpass', 450), filter(ctx, 'lowpass', 5200), gain(ctx, 0.2)).connect(merger, 0, side);
    src.start(0);
  });
  merger.connect(bus);
  const rumble = ctx.createBufferSource();
  rumble.buffer = noise(ctx, len, r, true);
  chain(rumble, filter(ctx, 'lowpass', 180), gain(ctx, 0.35), bus);
  rumble.start(0);

  // Drops on the window, written straight into a buffer: a tiny ping each.
  const drops = ctx.createBuffer(2, Math.ceil(RATE * len), RATE);
  const L = drops.getChannelData(0);
  const R = drops.getChannelData(1);
  const count = Math.floor(len * 22);
  for (let k = 0; k < count; k++) {
    const at = Math.floor(r() * (L.length - 400));
    const f = between(r, 1800, 5200);
    const tau = between(r, 0.0015, 0.005) * RATE;
    const level = between(r, 0.02, 0.12) * (r() < 0.1 ? 2 : 1);
    const p = r();
    for (let i = 0; i < 300; i++) {
      const s = Math.sin((2 * Math.PI * f * i) / RATE) * Math.exp(-i / tau) * level;
      L[at + i] += s * (1 - p);
      R[at + i] += s * p;
    }
  }
  const dropSrc = ctx.createBufferSource();
  dropSrc.buffer = drops;
  chain(dropSrc, filter(ctx, 'lowpass', 6000), gain(ctx, 0.8), bus);
  dropSrc.start(0);

  return render(ctx);
}

/* ── Playing ─────────────────────────────────────────────── */

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    return {
      layers: { beats: true, cafe: true, rain: false, ...(p.layers || {}) },
      volume: typeof p.volume === 'number' ? Math.max(0, Math.min(100, p.volume)) : 60,
    };
  } catch {
    return { layers: { beats: true, cafe: true, rain: false }, volume: 60 };
  }
}

const prefs = loadPrefs();
const savePrefs = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* not kept, still plays */ } };

let ctx = null;
let master = null;
let playing = false;
let pending = 0;                         // layers still rendering
const layer = {};                        // name -> { gain, started, buffers }
const listeners = new Set();
const changed = () => listeners.forEach((fn) => fn());

const level = () => (prefs.volume / 100) ** 2 * 0.9;

function context() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    // Play through the ringer switch on iPhone, as music does.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* older Safari */ }
  }
  return ctx;
}

// How loud each layer sits against the others: the music on top, rain underneath.
const MIX = { beats: 0.85, cafe: 0.9, rain: 0.55 };

function slot(name) {
  if (!layer[name]) {
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(master);
    layer[name] = { gain: g, ready: null, buffers: null };
  }
  return layer[name];
}

/* Renders a layer and sets it going (silent until faded in), once. The
   promise is kept, so asking again while it's rendering waits for the same one. */
function startLayer(name) {
  const L = slot(name);
  if (!L.ready) {
    L.ready = (async () => {
      if (name === 'beats') {
        // The two tapes take turns. Two are booked at the start, and each one,
        // when it ends, books another, so one is always queued a whole tape ahead.
        L.buffers = [await renderTape(TAPES[0])];
        let when = ctx.currentTime + 0.15;
        let index = 0;
        const book = () => {
          const src = ctx.createBufferSource();
          src.buffer = L.buffers[index];
          src.connect(L.gain);
          src.start(when);
          when += TAPE;
          index = (index + 1) % L.buffers.length;
          src.onended = book;
        };
        book();
        book();
        renderTape(TAPES[1]).then((second) => { L.buffers.push(second); }, () => {});
      } else {
        const raw = await (name === 'cafe' ? renderCafe() : renderRain());
        const src = ctx.createBufferSource();
        src.buffer = seamless(raw, 3, ctx);
        src.loop = true;
        src.connect(L.gain);
        src.start(ctx.currentTime + 0.05);
      }
    })();
    L.ready.catch(() => { L.ready = null; });   // a failed render can be tried again
  }
  return L.ready;
}

function ramp(param, to, secs) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(to, now + secs);
}

const fadeLayer = (name, on) => layer[name] && ramp(layer[name].gain.gain, on ? MIX[name] : 0, on ? 1.5 : 0.8);

/* Starts every layer that's switched on, side by side, and fades each in as
   it's ready: rain and café take a moment, the music a few seconds. */
async function bringIn(names) {
  pending += 1;
  changed();
  await Promise.all(names.map(async (name) => {
    try {
      await startLayer(name);
      if (playing && prefs.layers[name]) fadeLayer(name, true);
    } catch { /* that layer stays quiet */ }
  }));
  pending -= 1;
  changed();
}

export const ambience = {
  get playing() { return playing; },
  get busy() { return pending > 0; },
  get layers() { return { ...prefs.layers }; },
  get volume() { return prefs.volume; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  /** Call from a tap: that's what lets a browser start sound. */
  play() {
    if (playing) return;
    const a = context();
    if (!a) return;
    if (a.state === 'suspended') a.resume();
    if (!Object.values(prefs.layers).some(Boolean)) prefs.layers.beats = true;
    playing = true;
    ramp(master.gain, level(), 1.2);
    bringIn(LAYERS.map(([name]) => name).filter((name) => prefs.layers[name]));
  },

  pause() {
    if (!playing || !ctx) return;
    playing = false;
    ramp(master.gain, 0, 0.7);
    // Suspended, the clock stops too, so every queued tape picks up exactly where it was.
    setTimeout(() => { if (!playing && ctx.state === 'running') ctx.suspend(); }, 800);
    changed();
  },

  toggle() { return playing ? this.pause() : this.play(); },

  setLayer(name, on) {
    prefs.layers[name] = on;
    savePrefs();
    changed();
    if (!ctx || !playing) return;
    if (!Object.values(prefs.layers).some(Boolean)) { this.pause(); return; }
    if (on) bringIn([name]);
    else fadeLayer(name, false);
  },

  setVolume(v) {
    prefs.volume = Math.max(0, Math.min(100, Math.round(v)));
    savePrefs();
    if (ctx && playing) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.05);
    changed();
  },

  // For tests: where the sound stands right now.
  _state: () => ({
    context: ctx && ctx.state,
    master: master && +master.gain.value.toFixed(3),
    layers: Object.fromEntries(Object.entries(layer).map(([k, L]) => [k, +L.gain.gain.value.toFixed(3)])),
  }),
  // For tests: render a layer without playing it.
  _render: { tape: (i) => renderTape(TAPES[i]), cafe: renderCafe, rain: renderRain },
};

/* ── The headphones in the top bar, and their panel ─────── */

export function wireAmbience() {
  const button = document.getElementById('amb-btn');
  if (!button) return;
  let panel = null;

  const paint = () => {
    button.classList.toggle('is-on', ambience.playing);
    button.setAttribute('aria-pressed', String(ambience.playing));
    if (!panel) return;
    const play = panel.querySelector('.amb-play');
    play.textContent = ambience.playing ? (ambience.busy ? 'Getting the sounds ready…' : 'Pause') : 'Play';
    play.className = `btn btn-block amb-play ${ambience.playing ? 'btn-quiet' : 'btn-accent'}`;
    panel.querySelectorAll('[data-layer]').forEach((chip) => {
      const on = Boolean(ambience.layers[chip.dataset.layer]);
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', String(on));
    });
    panel.querySelector('.amb-vol input').value = String(ambience.volume);
  };
  ambience.onChange(paint);

  const close = () => {
    if (!panel) return;
    panel.remove();
    panel = null;
    button.setAttribute('aria-expanded', 'false');
  };

  // Under the headphones, kept on screen. Phones resize the window at odd
  // moments (the address bar, turning sideways), so it moves rather than closes.
  const place = () => {
    if (!panel) return;
    const r = button.getBoundingClientRect();
    const width = Math.min(310, window.innerWidth - 24);
    panel.style.width = `${width}px`;
    panel.style.top = `${r.bottom + 8}px`;
    panel.style.left = `${Math.max(12, Math.min(r.right - width, window.innerWidth - width - 12))}px`;
  };

  const open = () => {
    panel = document.createElement('div');
    panel.className = 'amb-panel';
    panel.id = 'amb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Background sounds');
    panel.innerHTML = `
      <p class="amb-title">Background sounds</p>
      <p class="amb-note">Lo-fi music and café sounds to learn to. They're made right here as
        they play, so nothing downloads. Mix them however you like.</p>
      <button type="button" class="btn btn-block amb-play">Play</button>
      <div class="amb-layers" role="group" aria-label="What to play">
        ${LAYERS.map(([name, label]) => `<button type="button" class="filter" data-layer="${name}">${label}</button>`).join('')}
      </div>
      <label class="amb-vol"><span class="label">Volume</span><input type="range" min="0" max="100" step="1"></label>`;
    document.body.append(panel);
    place();
    panel.addEventListener('click', (event) => {
      if (event.target.closest('.amb-play')) ambience.toggle();
      const chip = event.target.closest('[data-layer]');
      if (chip) ambience.setLayer(chip.dataset.layer, !ambience.layers[chip.dataset.layer]);
    });
    panel.querySelector('.amb-vol input').addEventListener('input', (event) => ambience.setVolume(Number(event.target.value)));
    button.setAttribute('aria-expanded', 'true');
    paint();
    panel.querySelector('.amb-play').focus({ preventScroll: true });
  };

  button.addEventListener('click', () => (panel ? close() : open()));
  document.addEventListener('click', (event) => {
    if (panel && !event.target.closest('#amb-panel') && !event.target.closest('#amb-btn')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel) { close(); button.focus(); }
  });
  window.addEventListener('resize', place);
  paint();
}
