/* The code editor's ergonomics, shared by lessons and practice:
   Tab inserts spaces, Enter carries the indent down (and steps in after a
   colon), Ctrl/Cmd+Enter runs, and snippet taps land at the caret. */

import { buzz } from './ui.js';

export function wireEditor(editor, { onChange = () => {}, onRun = () => {}, snipBar = null, snippets = [] } = {}) {
  const insert = (text, back = 0) => {
    editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, 'end');
    const caret = editor.selectionStart - back;
    editor.setSelectionRange(caret, caret);
    editor.focus();
    onChange();
  };

  editor.addEventListener('input', onChange);

  editor.addEventListener('keydown', (event) => {
    // Checked first: Ctrl+Enter is also an Enter, and used to be swallowed below.
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      onRun();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      insert('    ');
    } else if (event.key === 'Enter') {
      const upto = editor.value.slice(0, editor.selectionStart);
      const line = upto.slice(upto.lastIndexOf('\n') + 1);
      const indent = (line.match(/^[ \t]*/) || [''])[0];
      const deeper = /:\s*$/.test(line) ? '    ' : '';
      if (indent || deeper) {
        event.preventDefault();
        insert('\n' + indent + deeper);
      }
    }
  });

  if (snipBar) {
    snipBar.addEventListener('click', (event) => {
      const button = event.target.closest('[data-snip]');
      if (!button) return;
      const snip = snippets[Number(button.dataset.snip)];
      if (!snip) return;
      insert(snip.insert, snip.back || 0);
      buzz(8);
    });
  }

  return { insert };
}
