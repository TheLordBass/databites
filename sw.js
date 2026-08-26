/* Offline support.
   Shell: stale-while-revalidate, so updates land on the next open.
   Pyodide (tens of MB from the CDN): cache-first and never re-fetched. */

const SHELL = 'databites-shell-v11';
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
  './js/curriculum/pandas.js',
  './js/curriculum/wrangling.js',
  './js/curriculum/timeseries.js',
  './js/curriculum/matplotlib.js',
  './js/curriculum/seaborn.js',
  './js/curriculum/analysis.js',
  './js/screens/home.js',
  './js/screens/tracks.js',
  './js/screens/lesson.js',
  './js/screens/sandbox.js',
  './js/screens/you.js',
  './icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((cache) => cache.addAll(APP_FILES))
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

  // Python runtime + wheels, and the webfonts: keep the first copy forever.
  if (
    url.hostname === 'cdn.jsdelivr.net' ||
    url.hostname === 'files.pythonhosted.org' ||
    url.hostname === 'pypi.org' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
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

  event.respondWith(
    caches.open(SHELL).then(async (cache) => {
      // Only page navigations ignore the query string; versioned assets must not.
      const hit = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone()).catch(() => {});
          return response;
        })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});
