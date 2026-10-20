/* You → Settings → Display: colours, light or dark, and text size, kept
   per device.

   index.html applies the saved choice before the first paint (no flash);
   this applies it again on boot and whenever it changes, and keeps the
   browser bar's colour in step with the theme. */

const KEY = 'databites.display';

/* The colour themes, each a pair like the house colours: one colour by
   day, a partner by night. Their tokens, light and dark, are in styles.css
   ([data-palette]); here, each one's name, its two colours in plain words,
   and its paper colours, light then dark, for the browser's bar. Matcha,
   the house colours, is the default: what anyone new sees, and anyone who
   hasn't picked. */
export const THEMES = [
  { id: 'matcha', name: "The Hyde Special", about: 'Matcha green by day, nude at night', paper: ['#f8f3ea', '#12150d'] },
  { id: 'espresso', name: 'Caramel Macchiato', about: 'Coffee brown by day, caramel at night', paper: ['#f7f1e8', '#15110e'] },
  { id: 'blueberry', name: 'Espresso Tonic', about: 'Blue by day, lemon at night', paper: ['#f4f6fa', '#0f131b'] },
  { id: 'hibiscus', name: 'Rose Latte', about: 'Pink by day, mint at night', paper: ['#fbf4f3', '#170f12'] },
  { id: 'earlgrey', name: 'London Fog', about: 'Calm slate by day, lavender at night', paper: ['#f5f4f2', '#131315'] },
  { id: 'contrast', name: 'High contrast', about: 'Black and white: blue by day, yellow at night', paper: ['#ffffff', '#000000'] },
];

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
  const colours = THEMES.find((t) => t.id === display.palette) || THEMES[0];
  if (colours.id !== 'matcha') root.setAttribute('data-palette', colours.id);
  else root.removeAttribute('data-palette');
  const BAR = { light: colours.paper[0], dark: colours.paper[1] };
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
