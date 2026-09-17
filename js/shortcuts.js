/* The keyboard shortcuts, in one list: press ? anywhere outside a text box,
   or use the button on You. A native <dialog>, so focus is trapped inside
   it and Esc closes it without any extra code. */

import { escapeHTML } from './ui.js';

const KEYS = [
  ['Ctrl + Enter', 'Run the code (⌘ + Enter on a Mac)'],
  ['Ctrl + Space', 'Suggestions, anywhere in the editor'],
  ['↑  ↓', 'Move through suggestions'],
  ['Enter or Tab', 'Take the suggestion'],
  ['Esc', 'Close the suggestions'],
  ['Tab / Shift + Tab', 'Indent / take the indent away'],
  ['Esc, then Tab', 'Leave the editor'],
  ['?', 'This list'],
];

let dialog = null;

export function openShortcuts() {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'keys';
    dialog.setAttribute('aria-labelledby', 'keys-title');
    dialog.innerHTML = `
      <h2 id="keys-title">Keyboard shortcuts</h2>
      <dl>${KEYS.map(([key, what]) => `<dt><kbd>${escapeHTML(key)}</kbd></dt><dd>${escapeHTML(what)}</dd>`).join('')}</dl>
      <button class="btn btn-quiet btn-block" type="button" data-close>Close</button>`;
    dialog.querySelector('[data-close]').addEventListener('click', () => closeShortcuts());
    // A click on the backdrop lands on the dialog itself: close.
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeShortcuts(); });
    document.body.append(dialog);
  }
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
  dialog.querySelector('[data-close]').focus();
}

function closeShortcuts() {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

export function listenForShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target && event.target.closest && event.target.closest('textarea, input, select, [contenteditable]')) return;
    event.preventDefault();
    openShortcuts();
  });
}
