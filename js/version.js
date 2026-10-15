/* The app's version: one number, raised with every build, and sw.js's SHELL
   raised to match (tests.html checks the two agree). You → About shows it.
   The service worker fetches the app's files from the network first, so a
   new build reaches everyone the first time they open it; what changed is
   then shown once by the "What's new" tour (WHATS_NEW in js/guide.js). */
export const VERSION = 120;
export const BUILT = '2026-10-14';
