/* Sync across devices (You → Settings), off unless the learner turns it on.

   Progress still lives in this browser first: sync copies it to one row of a
   small Supabase table, under a sync code, and back. No account and no email:
   the code is the key, so it's long and random. The database side, and why the
   app can only load, save or delete by code, is supabase/sync.sql.

   Every save names the version it was based on. If another device saved in
   between, the save is refused, and this device loads that copy, folds it in
   (mergeInto in store.js) and tries again, so neither device wipes the other. */

import { store } from './store.js';

const API = 'https://hmuoqjdmwmsvfugiapmm.supabase.co/rest/v1/rpc';
// A publishable key is public by design: all it can do is call those three functions.
const KEY = 'sb_publishable_reL9IMk86QZw43djXLu_2Q_P3uXJ3-s';
const META = 'databites.sync';     // { code, version, sig, xp, at }: this device's side of it

// Crockford's base32: no I, L, O or U, so no character reads as another.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_LENGTH = 20;            // 100 random bits

// Screens where someone's in the middle of something. Changes from another
// device wait until they leave, rather than shifting the screen under them.
const BUSY = new Set(['lesson', 'problem', 'interview', 'quiz']);

/* ── The code ─────────────────────────────────────────────── */

export function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (b) => ALPHABET[b & 31]).join('');
}

/** What someone typed, read as a code: case, spaces and dashes don't matter,
    and O, I and L count as 0, 1 and 1. Null if it isn't a whole code. */
export function readCode(text) {
  const raw = String(text || '').toUpperCase().replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0').replace(/[IL]/g, '1');
  return raw.length === CODE_LENGTH && [...raw].every((ch) => ALPHABET.includes(ch)) ? raw : null;
}

/** 7KQM-4RZT-9WXB-2HNE-P3VD: in fours, so it's easy to type and check. */
export const showCode = (code) => code.match(/.{1,4}/g).join('-');

/* ── This device's side ───────────────────────────────────── */

function readMeta() {
  try { return JSON.parse(localStorage.getItem(META) || 'null'); } catch { return null; }
}

function writeMeta(meta) {
  try {
    if (meta) localStorage.setItem(META, JSON.stringify(meta));
    else localStorage.removeItem(META);
  } catch { /* storage blocked: sync just won't stick */ }
}

// A short fingerprint of what was last synced, so "anything new to send?" costs no request.
function fingerprint(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(36)}${(h1 >>> 0).toString(36)}:${text.length}`;
}

const current = () => {
  const payload = store.syncPayload();
  return { payload, sig: fingerprint(JSON.stringify(payload)) };
};

/* ── The server ───────────────────────────────────────────── */

class SyncError extends Error {}

async function call(fn, body) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 15000);
  let response;
  try {
    response = await fetch(`${API}/${fn}`, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abort.signal,
    });
  } catch {
    throw new SyncError("Couldn't reach the sync server. Check the connection: a work or school network may block it.");
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json()).message || ''; } catch { /* no reason given */ }
    throw new SyncError(`The sync server said no (${response.status}${detail ? `: ${detail}` : ''}). Your progress here is safe.`);
  }
  return response.json();
}

const load = async (code) => (await call('sync_load', { code }))[0] || null;
const save = (code, payload, base) => call('sync_save', { code, payload, base });

/* ── Syncing ──────────────────────────────────────────────── */

let ctx = null;             // the router's: to redraw a screen when changes arrive
let arrived = null;         // says how many finishes came in from another device
let running = null;      // the sync in flight, so two never overlap
let again = false;
let pending = false;        // changes waiting for the learner to leave a busy screen
let lastCheck = 0;
let lastError = '';
let timer = null;
const watchers = new Set(); // the You screen's status line

const screenName = () => (location.hash.replace(/^#\/?/, '') || 'home').split('/')[0];
const tell = () => watchers.forEach((fn) => fn());

/* One round. Clean (nothing new here since the last sync): see whether another
   device moved on, and if so take its copy as it is. Changed here: save on top
   of the version we know; refused means someone else saved first, so load
   theirs, merge, and go again. */
async function syncOnce() {
  const meta = readMeta();
  if (!meta) return { changed: false, added: 0 };
  const before = Object.keys(store.state.done).length;
  let changed = false;
  let settled = false;

  for (let tries = 0; tries < 4 && !settled; tries++) {
    const { payload, sig } = current();
    if (sig === meta.sig) {
      const row = await load(meta.code);
      if (!row) return gone(meta);
      if (row.version !== meta.version) {
        if (BUSY.has(screenName())) { pending = true; return { changed, added: 0 }; }
        store.adoptState(row.data);
        changed = true;
        settle(meta, row.version);
      }
      settled = true;
      break;
    }
    const version = await save(meta.code, payload, meta.version);
    if (version !== null) {
      Object.assign(meta, { version, sig, xp: payload.xp });
      settled = true;
      break;
    }
    const row = await load(meta.code);
    if (!row) return gone(meta);
    if (BUSY.has(screenName())) { pending = true; return { changed, added: 0 }; }
    store.mergeState(row.data, { baseXp: meta.xp === undefined ? null : meta.xp });
    changed = true;
    // That copy is now the shared point: XP it had is counted, so the next
    // merge adds only what's new since.
    meta.version = row.version;
    meta.xp = Number(row.data.xp) || 0;
  }
  // Four refusals in a row: another device is saving right now. What merged
  // in so far stays merged; the next round sends it.
  if (!settled) {
    const now = readMeta();
    if (now && now.code === meta.code) writeMeta(meta);
    soon();
    throw new SyncError('Your other device is saving at the same moment. This one will try again shortly.');
  }

  meta.at = Date.now();
  // Stopped while this was on its way: don't bring it back.
  const now = readMeta();
  if (now && now.code === meta.code) writeMeta(meta);
  pending = false;
  return { changed, added: Object.keys(store.state.done).length - before };
}

// In step with `version`: what's here now is what the server has.
function settle(meta, version) {
  const { payload, sig } = current();
  Object.assign(meta, { version, sig, xp: payload.xp });
}

// The copy was deleted, on another device: this one stops syncing too.
function gone(meta) {
  if (meta.version > 0) {
    writeMeta(null);
    lastError = 'Your synced copy was deleted on another device, so this one has stopped syncing too. Your progress here is untouched.';
  }
  return { changed: false, added: 0 };
}

function run() {
  if (running) {
    again = true;
    return running;
  }
  lastError = '';
  running = syncOnce()
    .then((result) => {
      redraw(result);
      return result;
    })
    .catch((err) => {
      lastError = err instanceof SyncError ? err.message : `Sync went wrong: ${err.message || err}. Your progress here is safe.`;
      return { changed: false, added: 0, error: lastError };
    })
    .finally(() => {
      running = null;
      tell();
      if (again) {
        again = false;
        run();
      }
    });
  tell();
  return running;
}

/* New progress from another device: redraw the screen, unless it's one where
   someone's mid-task, keeping its scroll and any open sections. */
function redraw({ changed, added }) {
  if (!ctx) return;
  ctx.refreshChrome();
  if (!changed || BUSY.has(screenName())) return;
  const screen = document.getElementById('screen');
  const scroll = screen ? screen.scrollTop : 0;
  const open = screen ? [...screen.querySelectorAll('details')].map((d) => d.open) : [];
  ctx.go(location.hash.replace(/^#\/?/, '') || 'home');
  const fresh = document.getElementById('screen');
  if (fresh) {
    const folds = fresh.querySelectorAll('details');
    if (folds.length === open.length) folds.forEach((d, i) => { d.open = open[i]; });
    fresh.scrollTop = scroll;
  }
  if (added > 0 && arrived) arrived(added);
}

function check(minGap) {
  if (!readMeta()) return;
  if (!pending && Date.now() - lastCheck < minGap) return;
  lastCheck = Date.now();
  run();
}

// After a change here: send it once things go quiet, if it's anything sync shares.
function soon() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const meta = readMeta();
    if (meta && current().sig !== meta.sig) run();
  }, 6000);
}

/* ── For the app ──────────────────────────────────────────── */

export const sync = {
  /** Hooks sync into the app. Does nothing over the network until it's turned on. */
  start(routerCtx, onArrive) {
    ctx = routerCtx;
    arrived = onArrive;
    store.onSave(soon);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check(30000);
      else {
        // Leaving the app: send anything new now, rather than in a few seconds.
        const meta = readMeta();
        if (meta && current().sig !== meta.sig) run();
      }
    });
    window.addEventListener('online', () => check(0));
    window.addEventListener('hashchange', () => check(60000));
    check(0);
  },

  get code() { return (readMeta() || {}).code || null; },

  /** A line for the You screen. */
  status() {
    if (lastError) return { text: lastError, bad: true };
    const meta = readMeta();
    if (!meta) return { text: '' };
    if (running) return { text: 'Syncing…' };
    if (!meta.at) return { text: 'Not synced yet.' };
    const mins = Math.floor((Date.now() - meta.at) / 60000);
    const when = mins < 1 ? 'just now'
      : mins < 60 ? `${mins} minute${mins === 1 ? '' : 's'} ago`
      : mins < 48 * 60 ? `${Math.floor(mins / 60)} hour${mins < 120 ? '' : 's'} ago`
      : new Date(meta.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    return { text: `Last synced ${when}.` };
  },

  /** Calls fn whenever the status changes. Returns a stop function. */
  watch(fn) {
    watchers.add(fn);
    return () => watchers.delete(fn);
  },

  /** Sync now (the button), and whenever the app wants a fresh look. */
  now() {
    lastCheck = Date.now();
    return run();
  },

  /** A new code for this device's progress. */
  async begin() {
    writeMeta({ code: newCode(), version: 0, sig: null });
    const result = await sync.now();
    if (result.error) writeMeta(null);
    return result;
  },

  /** Joins the progress already saved under `code`, folding in anything done here. */
  async join(code) {
    let row;
    try {
      row = await load(code);
    } catch (err) {
      return { error: err.message };
    }
    if (!row) return { error: "There's no progress under that code. Check it against your other device." };
    // A device with nothing done yet takes the copy as it is; otherwise both
    // are folded together, and the next round sends the result back.
    const fresh = !Object.keys(store.state.done).length;
    if (fresh) store.adoptState(row.data);
    else store.mergeState(row.data);
    const meta = { code, version: row.version, sig: null, xp: Number(row.data.xp) || 0 };
    if (fresh) settle(meta, row.version);
    writeMeta(meta);
    const result = await sync.now();
    if (ctx) ctx.refreshChrome();
    return result;
  },

  /** Stops syncing here. The synced copy stays, for the other devices. */
  stop() {
    writeMeta(null);
    lastError = '';
    pending = false;
    tell();
  },

  /** Erases the synced copy, then stops syncing here. */
  async erase() {
    const meta = readMeta();
    if (!meta) return {};
    try {
      await call('sync_delete', { code: meta.code });
    } catch (err) {
      return { error: err.message };
    }
    sync.stop();
    return {};
  },
};
