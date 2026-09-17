/* You → Display: theme and text size, kept per device.

   index.html applies the saved choice before the first paint (no flash);
   this applies it again on boot and whenever it changes, and keeps the
   browser bar's colour in step with the theme. */

const KEY = 'databites.display';
const BAR = { light: '#faf7f0', dark: '#16130f' };

export function getDisplay() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function applyDisplay(display = getDisplay()) {
  const root = document.documentElement;
  const theme = display.theme === 'light' || display.theme === 'dark' ? display.theme : null;
  const size = display.size === 'small' || display.size === 'large' ? display.size : null;
  if (theme) root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
  if (size) root.setAttribute('data-size', size);
  else root.removeAttribute('data-size');

  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    if (meta.dataset.media === undefined) meta.dataset.media = meta.getAttribute('media') || '';
    const own = meta.dataset.media.includes('dark') ? 'dark' : 'light';
    if (theme) {
      meta.setAttribute('media', 'all');
      meta.setAttribute('content', BAR[theme]);
    } else {
      meta.setAttribute('media', meta.dataset.media);
      meta.setAttribute('content', BAR[own]);
    }
  });
}

export function setDisplay(change) {
  const display = { ...getDisplay(), ...change };
  Object.keys(display).forEach((k) => { if (!display[k]) delete display[k]; });
  try {
    localStorage.setItem(KEY, JSON.stringify(display));
  } catch {
    /* not saved; still applied for this visit */
  }
  applyDisplay(display);
  return display;
}
