/* Offline support.
   Shell: stale-while-revalidate, so updates land on the next open.
   Pyodide (tens of MB from the CDN): cache-first and never re-fetched. */

// The old name stays in these: a new RUNTIME name would re-download Pyodide.
const SHELL = 'databites-shell-v64';
const RUNTIME = 'databites-pyodide-v1';

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/main.js',
  './js/ui.js',
  './js/store.js',
  './js/python.js',
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
  './js/screens/home.js',
  './js/screens/tracks.js',
  './js/screens/lesson.js',
  './js/screens/sandbox.js',
  './js/screens/you.js',
  './js/screens/practice.js',
  './js/practice/problems.js',
  './js/practice/more-python.js',
  './js/practice/more-sql.js',
  './js/practice/more-dax.js',
  './js/practice/algorithms.js',
  './js/editor.js',
  './js/intellisense.js',
  './js/highlight.js',
  './js/display.js',
  './js/session.js',
  './js/export.js',
  './js/writeup.js',
  './js/shortcuts.js',
  './js/game.js',
  './js/sync.js',
  './js/screens/exam.js',
  './js/exam/pl300.js',
  './js/dax.py',
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

  // Python runtime + wheels: keep the first copy forever. (The fonts are the
  // app's own files now, in the shell above.)
  if (
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'files.pythonhosted.org' ||
    url.hostname === 'pypi.org'
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
  // The self-test page must always be the deployed one, never an old copy.
  if (url.pathname.endsWith('/tests.html')) return;

  event.respondWith(
    caches.open(SHELL).then(async (cache) => {
      // Only page navigations ignore the query string; versioned assets must not.
      const hit = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
      // Revalidate past the HTTP cache too (a cheap ETag check), or the "fresh"
      // copy can be the same stale one. A new Request, because a navigation
      // request can't be re-fetched with options.
      const fresh = fetch(new Request(request.url, { cache: 'no-cache', credentials: 'same-origin' }))
        .then((response) => {
          if (response.ok) cache.put(request, response.clone()).catch(() => {});
          return response;
        })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});
