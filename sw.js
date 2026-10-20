/* Offline support.
   The app's own files: network first, so a new build is what everyone gets
   the first time they open it. The cached copy is the fallback: offline, or
   a network too slow to wait for (3 seconds). SHELL matches js/version.js.
   Pyodide (tens of MB from the CDN) and recordings: cache-first, never re-fetched. */

// The old name stays in these: a new RUNTIME name would re-download Pyodide.
const SHELL = 'databites-shell-v138';
const RUNTIME = 'databites-pyodide-v1';

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/main.js',
  './js/version.js',
  './js/ui.js',
  './js/store.js',
  './js/python.js',
  './js/r.js',
  './js/curriculum/r.js',
  './js/worker.js',
  './js/curriculum/index.js',
  './js/curriculum/prelude.js',
  './js/curriculum/basics.js',
  './js/curriculum/python.js',
  './js/curriculum/checks.js',
  './js/curriculum/pandas.js',
  './js/curriculum/messy.js',
  './js/curriculum/wrangling.js',
  './js/curriculum/timeseries.js',
  './js/curriculum/matplotlib.js',
  './js/curriculum/seaborn.js',
  './js/curriculum/analysis.js',
  './js/curriculum/sql.js',
  './js/curriculum/dax.js',
  './js/curriculum/projects.js',
  './js/curriculum/powerbi.js',
  './js/curriculum/stats.js',
  './js/curriculum/ai.js',
  './js/curriculum/algo.js',
  './js/curriculum/numpy.js',
  './js/curriculum/metrics.js',
  './js/curriculum/forecast.js',
  './js/curriculum/ml.js',
  './js/curriculum/excel.js',
  './js/curriculum/deeper.js',
  './js/curriculum/etl.js',
  './js/curriculum/expected.js',
  './js/screens/home.js',
  './js/screens/tracks.js',
  './js/screens/lesson.js',
  './js/screens/sandbox.js',
  './js/screens/you.js',
  './js/screens/welcome.js',
  './js/screens/practice.js',
  './js/practice/problems.js',
  './js/practice/more-python.js',
  './js/practice/more-sql.js',
  './js/practice/more-dax.js',
  './js/practice/excel.js',
  './js/practice/algorithms.js',
  './js/practice/harder.js',
  './js/practice/r.js',
  './js/practice/cafe-names.js',
  './js/practice/stories.js',
  './js/editor.js',
  './js/intellisense.js',
  './js/highlight.js',
  './js/display.js',
  './js/session.js',
  './js/export.js',
  './js/writeup.js',
  './js/shortcuts.js',
  './js/game.js',
  './js/stamps.js',
  './js/search.js',
  './js/nav.js',
  './js/cafe.js',
  './js/sound.js',
  './js/ambience.js',
  './js/guide.js',
  './js/sync.js',
  './js/screens/exam.js',
  './js/exam/pl300.js',
  './js/dax.py',
  './js/excel.py',
  './icons/icon.svg',
  './fonts/fraunces-latin.woff2',
  './fonts/fraunces-latin-ext.woff2',
  './fonts/ibm-plex-sans-latin.woff2',
  './fonts/ibm-plex-sans-latin-ext.woff2',
  './fonts/ibm-plex-mono-400-latin.woff2',
  './fonts/ibm-plex-mono-400-latin-ext.woff2',
  './fonts/ibm-plex-mono-500-latin.woff2',
  './fonts/ibm-plex-mono-500-latin-ext.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    // cache: 'reload' skips the browser's HTTP cache. GitHub Pages lets files
    // sit there for 10 minutes, and without this a new shell was filled with
    // the previous deploy's files - new worker, old screens.
    caches.open(SHELL)
      .then((cache) => cache.addAll(APP_FILES.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== SHELL && name !== RUNTIME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Python runtime + wheels, and R (webR, versioned in its path) and its
  // packages: keep the first copy forever. (The fonts are the app's own
  // files now, in the shell above.)
  if (
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'files.pythonhosted.org' ||
    url.hostname === 'pypi.org' ||
    url.hostname === 'webr.r-wasm.org' ||
    url.hostname === 'repo.r-wasm.org'
  ) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok || response.type === 'opaque') {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
    );
    return;
  }

  if (url.origin !== location.origin) return;
  // Recordings (the café chatter) never change: keep the first copy, in the
  // cache that survives new versions, so it isn't fetched again each deploy.
  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone()).catch(() => {});
        return response;
      })
    );
    return;
  }
  // The self-test and expected-output pages must always be the deployed ones, never an old copy.
  if (url.pathname.endsWith('/tests.html') || url.pathname.endsWith('/expected.html')) return;

  event.respondWith(
    caches.open(SHELL).then(async (cache) => {
      // Only page navigations ignore the query string; versioned assets must not.
      const hit = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
      // Network first, past the HTTP cache too (a cheap ETag check), or the
      // "fresh" copy could be the browser's stale one. A new Request, because
      // a navigation request can't be re-fetched with options.
      const fresh = fetch(new Request(request.url, { cache: 'no-cache', credentials: 'same-origin' }))
        .then((response) => {
          if (response.ok) cache.put(request, response.clone()).catch(() => {});
          return response;
        });
      if (!hit) return fresh;
      // Offline, or slow: the cached copy, while the fresh one still lands in the cache.
      const slow = new Promise((resolve) => setTimeout(() => resolve(hit), 3000));
      return Promise.race([fresh.catch(() => hit), slow]);
    })
  );
});
