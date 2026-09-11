/* Main-thread handle on the Pyodide worker.

   The worker is replaceable. A run given a time limit that it overshoots —
   almost always a loop that never ends — gets the worker terminated and a
   fresh one booted, so one bad loop can't freeze Python for the rest of the
   session. Runs requested while Python is (re)starting are queued, not lost. */

let worker = null;
let ready = false;
let seabornAvailable = false;
let nextId = 1;
const pending = new Map();      // id -> { resolve, timer }
let readyWaiters = [];          // one-shot: whenReady callbacks and queued runs
const listeners = { status: [], ready: [], fatal: [], pkg: [] };

const emit = (name, payload) => listeners[name].forEach((fn) => fn(payload));

function onMessage({ data }) {
  switch (data.type) {
    case 'status':
      emit('status', data);
      break;
    case 'ready': {
      ready = true;
      seabornAvailable = !!data.seaborn;
      const waiting = readyWaiters;
      readyWaiters = [];
      waiting.forEach((fn) => fn());
      emit('ready', data);
      break;
    }
    case 'fatal':
      emit('fatal', data);
      break;
    case 'pkg':
      emit('pkg', data);
      break;
    case 'result': {
      const job = pending.get(data.id);
      if (job) {
        clearTimeout(job.timer);
        pending.delete(data.id);
        job.resolve(data);
      }
      break;
    }
  }
}

function spawn() {
  worker = new Worker('js/worker.js');
  worker.onmessage = onMessage;
  worker.onerror = (err) => emit('fatal', { text: err.message || 'The Python worker crashed.' });
}

function restart() {
  worker.terminate();
  ready = false;
  for (const job of pending.values()) {
    clearTimeout(job.timer);
    job.resolve({
      ok: false, stdout: '', images: [], check: null, judge: null,
      error: 'Python was restarted before this could run. Try again.',
    });
  }
  pending.clear();
  spawn();
  worker.postMessage({ type: 'init' });
}

spawn();

export const python = {
  get isReady() { return ready; },
  get hasSeaborn() { return seabornAvailable; },

  on(event, fn) {
    listeners[event].push(fn);
    return () => { listeners[event] = listeners[event].filter((f) => f !== fn); };
  },

  /** Run now if Python is up, otherwise once as soon as it is. */
  whenReady(fn) {
    if (ready) fn();
    else readyWaiters.push(fn);
  },

  boot() { worker.postMessage({ type: 'init' }); },

  /**
   * Run a cell.
   * @param {object} opts
   * @param {string} opts.code        user code
   * @param {string} [opts.key]       namespace key (lesson id / 'sandbox')
   * @param {string} [opts.prelude]   setup code run when the namespace is created
   * @param {string} [opts.check]     assertions; AssertionError message becomes the hint
   * @param {boolean} [opts.fresh]    rebuild the namespace first (default true)
   * @param {string[]} [opts.needs]   extra Pyodide packages to fetch on demand
   * @param {number} [opts.timeoutMs] give up and restart Python after this long
   * @returns {Promise<{ok, stdout, error, images, check, judge, timedOut?}>}
   */
  run({ code, key = 'default', prelude = '', check = '', fresh = true, needs = [], timeoutMs = 0 }) {
    const id = nextId++;
    return new Promise((resolve) => {
      const send = () => {
        const job = { resolve, timer: null };
        if (timeoutMs) {
          job.timer = setTimeout(() => {
            if (!pending.has(id)) return;
            pending.delete(id);
            resolve({
              ok: false, timedOut: true, stdout: '', images: [], check: null, judge: null,
              error: `Still running after ${Math.round(timeoutMs / 1000)} seconds, so it was stopped.\n`
                   + 'Python is restarting itself - give it a moment.',
            });
            restart();
          }, timeoutMs);
        }
        pending.set(id, job);
        worker.postMessage({ type: 'run', id, key, code, prelude, check, fresh, needs });
      };
      if (ready) send();
      else readyWaiters.push(send);
    });
  },

  /**
   * Completions for the code before the caret. Never queues: if Python isn't
   * up yet there is simply nothing to suggest.
   * @returns {Promise<{items, replace, context, quote?, signature}>}
   */
  complete({ key = 'default', prelude = '', text = '', bind = '', force = false }) {
    if (!ready) return Promise.resolve({ items: [], signature: null });
    const id = nextId++;
    return new Promise((resolve) => {
      pending.set(id, { resolve, timer: null });
      worker.postMessage({ type: 'complete', id, key, prelude, text, bind, force });
    });
  },
};
