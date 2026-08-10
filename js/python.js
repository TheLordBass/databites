/* Main-thread handle on the Pyodide worker. */

const worker = new Worker('js/worker.js');

let ready = false;
let seabornAvailable = false;
let nextId = 1;
const pending = new Map();
const listeners = { status: [], ready: [], fatal: [], pkg: [] };

const emit = (name, payload) => listeners[name].forEach((fn) => fn(payload));

worker.onmessage = ({ data }) => {
  switch (data.type) {
    case 'status':
      emit('status', data);
      break;
    case 'ready':
      ready = true;
      seabornAvailable = !!data.seaborn;
      emit('ready', data);
      break;
    case 'fatal':
      emit('fatal', data);
      break;
    case 'pkg':
      emit('pkg', data);
      break;
    case 'result': {
      const resolve = pending.get(data.id);
      if (resolve) {
        pending.delete(data.id);
        resolve(data);
      }
      break;
    }
  }
};

worker.onerror = (err) => emit('fatal', { text: err.message || 'The Python worker crashed.' });

export const python = {
  get isReady() { return ready; },
  get hasSeaborn() { return seabornAvailable; },

  on(event, fn) { listeners[event].push(fn); return () => {
    listeners[event] = listeners[event].filter((f) => f !== fn);
  }; },

  /** Run now if Python is up, otherwise as soon as it is. */
  whenReady(fn) {
    if (ready) fn();
    else listeners.ready.push(fn);
  },

  boot() { worker.postMessage({ type: 'init' }); },

  /**
   * Run a cell.
   * @param {object} opts
   * @param {string} opts.code    user code
   * @param {string} [opts.key]   namespace key (lesson id / 'sandbox')
   * @param {string} [opts.prelude] setup code run when the namespace is created
   * @param {string} [opts.check] assertions; AssertionError message becomes the hint
   * @param {boolean} [opts.fresh] rebuild the namespace first (default true)
   * @param {string[]} [opts.needs] extra Pyodide packages to fetch on demand
   * @returns {Promise<{ok, stdout, error, images, check}>}
   */
  run({ code, key = 'default', prelude = '', check = '', fresh = true, needs = [] }) {
    const id = nextId++;
    return new Promise((resolve) => {
      pending.set(id, resolve);
      worker.postMessage({ type: 'run', id, key, code, prelude, check, fresh, needs });
    });
  },
};
