/* You → Settings → Display: theme and text size, kept per device.

   index.html applies the saved choice before the first paint (no flash);
   this applies it again on boot and whenever it changes, and keeps the
   browser bar's colour in step with the theme. */

const KEY = 'databites.display';
const BAR = { light: '#f9f3e9', dark: '#17110d' };

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
  // Where a lesson's output goes on a wide screen: under the editor (the
  // default) or beside it. Phones always stack them.
  if (display.layout === 'beside') root.setAttribute('data-layout', 'beside');
  else root.removeAttribute('data-layout');

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

/* The editor bar's switch between the two layouts, for lessons, problems and
   the Sandbox. It only shows where there's room for side by side. */
export const layoutSwitch = () => {
  const beside = getDisplay().layout === 'beside';
  return `<button class="btn-text layout-switch" data-layout-switch aria-pressed="${beside}"
    title="Where the output goes">${beside ? 'Output below' : 'Side by side'}</button>`;
};

export function wireLayoutSwitch(mount) {
  mount.addEventListener('click', (event) => {
    const button = event.target.closest('[data-layout-switch]');
    if (!button) return;
    const beside = getDisplay().layout !== 'beside';
    setDisplay({ layout: beside ? 'beside' : '' });
    button.textContent = beside ? 'Output below' : 'Side by side';
    button.setAttribute('aria-pressed', String(beside));
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
