/* The code editor's ergonomics, shared by lessons, practice and the sandbox:
   Tab inserts spaces and Shift+Tab takes them away, Enter carries the indent
   down (and steps in after a colon), Ctrl/Cmd+Enter runs, and snippet taps
   land at the caret. Esc then Tab leaves the editor, for keyboard users. */

import { buzz } from './ui.js';

export function wireEditor(editor, { onChange = () => {}, onRun = () => {}, snipBar = null, snippets = [] } = {}) {
  // setRangeText fires no input event of its own; send one, so the draft saves,
  // the colouring redraws and intellisense looks again - as if it were typed.
  const changed = () => editor.dispatchEvent(new Event('input', { bubbles: true }));

  const insert = (text, back = 0) => {
    editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, 'end');
    const caret = editor.selectionStart - back;
    editor.setSelectionRange(caret, caret);
    editor.focus();
    changed();
  };

  // Shift+Tab: take up to four spaces off the start of the caret's line.
  const dedent = () => {
    const pos = editor.selectionStart;
    const start = editor.value.lastIndexOf('\n', pos - 1) + 1;
    const lead = (editor.value.slice(start).match(/^ {1,4}/) || [''])[0];
    if (!lead) return;
    editor.setRangeText('', start, start + lead.length, 'preserve');
    const caret = Math.max(start, pos - lead.length);
    editor.setSelectionRange(caret, caret);
    changed();
  };

  editor.addEventListener('input', onChange);

  // Tab indents, so it can't also move focus - which trapped keyboard users
  // inside the editor. Esc, then Tab, lets the next Tab leave as normal.
  let tabLeaves = false;
  editor.addEventListener('blur', () => { tabLeaves = false; });

  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      tabLeaves = true;
      return;
    }
    if (event.key === 'Tab' && tabLeaves) {
      tabLeaves = false;
      return;                                   // default: focus moves on
    }
    if (event.key !== 'Shift') tabLeaves = false;

    // Checked first: Ctrl+Enter is also an Enter, and used to be swallowed below.
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      onRun();
    } else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      dedent();
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
