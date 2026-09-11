/* Intellisense for the code editor: completions and call signatures.

   The suggestions come from Python itself (_complete in worker.js), resolved
   against the live namespace, so cafe. lists cafe's real columns and
   cafe["ci offers city. Nothing the learner typed is executed to get them.

   Keys while the list is open: Up/Down to move, Enter or Tab to take one,
   Esc to dismiss. Ctrl+Space asks for suggestions anywhere. On a phone, tap. */

import { python } from './python.js';
import { escapeHTML } from './ui.js';

const KIND = {
  column: 'col', method: 'fn', function: 'fn', builtin: 'fn', class: 'cls',
  module: 'mod', property: 'prop', attribute: 'attr', variable: 'var', keyword: 'kw',
  table: 'tbl', value: 'val',
};

// Contexts where the caret is inside a quote: the prefix starts after it, and accepting closes it.
const QUOTED = new Set(['column', 'value']);

/* Where the caret sits, in px relative to the editor's wrapper: a hidden
   mirror of the textarea lays out the same text and we measure a marker. */
const MIRRORED = [
  'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight',
  'tabSize', 'whiteSpace', 'wordSpacing', 'textIndent',
];

function caretPoint(editor, pos) {
  const style = getComputedStyle(editor);
  const mirror = document.createElement('div');
  MIRRORED.forEach((prop) => { mirror.style[prop] = style[prop]; });
  Object.assign(mirror.style, {
    position: 'absolute', visibility: 'hidden', top: '0', left: '-9999px',
    overflow: 'hidden', borderStyle: 'solid', height: 'auto',
  });
  mirror.textContent = editor.value.slice(0, pos);
  const mark = document.createElement('span');
  mark.textContent = '​';
  mirror.appendChild(mark);
  document.body.appendChild(mirror);
  const x = mark.offsetLeft;
  const y = mark.offsetTop;
  mirror.remove();
  const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.6;
  return {
    x: editor.offsetLeft + x - editor.scrollLeft,
    y: editor.offsetTop + y - editor.scrollTop,
    line,
  };
}

export function attachIntellisense(editor, { key = 'default', prelude = '', bind = '', lang = 'python' } = {}) {
  const wrap = editor.closest('.editor-wrap') || editor.parentElement;
  const uid = Math.random().toString(36).slice(2, 8);

  const box = document.createElement('div');
  box.className = 'isense';
  box.hidden = true;
  box.innerHTML = `<ul class="isense-items" role="listbox" id="isense-${uid}"></ul><p class="isense-doc"></p>`;
  const list = box.querySelector('.isense-items');
  const docLine = box.querySelector('.isense-doc');

  const sig = document.createElement('div');
  sig.className = 'isense-sig';
  sig.hidden = true;
  sig.setAttribute('aria-live', 'polite');

  wrap.append(box, sig);
  editor.setAttribute('aria-autocomplete', 'list');
  editor.setAttribute('aria-controls', list.id);
  editor.setAttribute('autocapitalize', 'off');

  let all = [];          // what Python returned
  let items = [];        // filtered to the prefix typed since
  let active = 0;
  let context = 'none';
  let quote = '"';
  let signature = null;
  let seq = 0;
  let timer = null;
  let below = true;

  const isOpen = () => !box.hidden;

  function prefixNow() {
    const text = editor.value.slice(0, editor.selectionStart);
    if (QUOTED.has(context)) {
      const at = text.lastIndexOf(quote);
      return at === -1 ? null : text.slice(at + 1);
    }
    return (text.match(/[A-Za-z_0-9]*$/) || [''])[0];
  }

  function closeList() {
    box.hidden = true;
    items = [];
    editor.removeAttribute('aria-activedescendant');
  }

  function closeAll() {
    clearTimeout(timer);
    seq++;
    closeList();
    sig.hidden = true;
    signature = null;
  }

  function place() {
    const pt = caretPoint(editor, editor.selectionStart);
    const wrapBox = wrap.getBoundingClientRect();
    const view = window.visualViewport;
    const viewBottom = view ? view.offsetTop + view.height : window.innerHeight;

    if (isOpen()) {
      const width = Math.min(340, wrap.clientWidth);
      box.style.width = width + 'px';
      box.style.left = Math.max(0, Math.min(pt.x - 12, wrap.clientWidth - width)) + 'px';
      const height = box.offsetHeight;
      const caretTop = wrapBox.top + pt.y;
      below = caretTop + pt.line + height + 8 <= viewBottom || caretTop - height - 8 < 56;
      box.style.top = (below ? pt.y + pt.line + 4 : pt.y - height - 4) + 'px';
    }
    if (!sig.hidden) {
      const width = Math.min(sig.offsetWidth, wrap.clientWidth);
      sig.style.left = Math.max(0, Math.min(pt.x - 16, wrap.clientWidth - width)) + 'px';
      // above the caret line, unless the list already took that side
      const above = isOpen() ? below : true;
      sig.style.top = (above ? pt.y - sig.offsetHeight - 6 : pt.y + pt.line + 6) + 'px';
    }
  }

  function renderSignature() {
    if (!signature || !signature.params) { sig.hidden = true; return; }
    const params = signature.params.map((p, i) =>
      i === signature.active ? `<b>${escapeHTML(p)}</b>` : escapeHTML(p));
    if (signature.more) params.push('...');
    sig.innerHTML = `<div class="isense-sig-call">${escapeHTML(signature.name)}(${params.join(', ')})</div>`
      + (signature.doc ? `<div class="isense-sig-doc">${escapeHTML(signature.doc)}</div>` : '');
    sig.hidden = false;
  }

  function renderList() {
    if (!items.length) { closeList(); return; }
    active = Math.min(active, items.length - 1);
    list.innerHTML = items.map((item, i) => `
      <li class="isense-item${i === active ? ' is-active' : ''}" role="option" id="isense-${uid}-${i}"
          data-i="${i}" aria-selected="${i === active}">
        <span class="isense-kind k-${escapeHTML(item.kind)}">${KIND[item.kind] || escapeHTML(item.kind)}</span>
        <span class="isense-label">${escapeHTML(item.label)}</span>
        ${item.detail ? `<span class="isense-detail">${escapeHTML(item.detail)}</span>` : ''}
      </li>`).join('');
    box.hidden = false;
    showActive();
  }

  function showActive() {
    const item = items[active];
    list.querySelectorAll('.isense-item').forEach((el, i) => {
      el.classList.toggle('is-active', i === active);
      el.setAttribute('aria-selected', String(i === active));
    });
    // Scroll the list by hand: scrollIntoView would also (smoothly) scroll the
    // page, which moves the caret after place() has measured it.
    const el = list.children[active];
    if (el) {
      if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
      else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
      }
    }
    editor.setAttribute('aria-activedescendant', `isense-${uid}-${active}`);
    docLine.textContent = (item && item.doc) || '';
    docLine.hidden = !docLine.textContent;
  }

  /* Narrow what we already have while Python works out the fresh answer, so
     Enter never takes a suggestion that no longer matches what's typed. */
  function refilter() {
    const prefix = prefixNow();
    if (prefix === null) { closeList(); return; }
    const low = prefix.toLowerCase();
    items = all.filter((item) => item.label.toLowerCase().includes(low));
    items.sort((a, b) => (!a.label.toLowerCase().startsWith(low)) - (!b.label.toLowerCase().startsWith(low)));
    if (items.length === 1 && items[0].label === prefix) items = [];
    active = 0;
    renderList();
  }

  async function query(force, listToo) {
    const mine = ++seq;
    const pos = editor.selectionStart;
    if (editor.selectionEnd !== pos) { closeAll(); return; }
    // SQL also needs what comes after the caret: SELECT is typed before the FROM that says which table.
    const res = await python.complete({
      key, prelude, bind, force, lang,
      text: editor.value.slice(0, pos),
      after: lang === 'sql' ? editor.value.slice(pos) : '',
    });
    if (mine !== seq || document.activeElement !== editor) return;

    signature = res.signature || null;
    renderSignature();
    if (listToo) {
      all = res.items || [];
      context = res.context || 'none';
      quote = res.quote || '"';
      refilter();
    }
    place();
  }

  function request({ force = false, listToo = true, delay = 120 } = {}) {
    clearTimeout(timer);
    timer = setTimeout(() => query(force, listToo), delay);
  }

  function accept(i) {
    const item = items[i];
    if (!item) return;
    const pos = editor.selectionStart;
    const prefix = prefixNow() || '';
    const after = editor.value.slice(pos);
    let text = item.insert || item.label;
    let back = 0;
    let skip = 0;

    if (QUOTED.has(context)) {
      if (after.startsWith(quote)) skip = 1;
      else text += quote;
    } else if (item.call && !after.startsWith('(')) {
      text += '()';
      back = item.args ? 1 : 0;
    } else if (item.space && !/^\s/.test(after)) {
      text += ' ';                        // SQL keywords: straight on to the next word
    }

    editor.setRangeText(text, pos - prefix.length, pos, 'end');
    const caret = editor.selectionStart - back + skip;
    editor.setSelectionRange(caret, caret);
    closeList();
    editor.focus();
    // lets the screen save the draft, and asks again (a signature, after a "(")
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* Capture phase on the wrapper runs before the editor's own key handling,
     so a consumed Enter never also becomes a newline. */
  wrap.addEventListener('keydown', (event) => {
    if (event.target !== editor) return;
    if (event.ctrlKey && (event.key === ' ' || event.code === 'Space')) {
      event.preventDefault();
      event.stopPropagation();
      request({ force: true, delay: 0 });
      return;
    }
    if (event.key === 'Escape' && (isOpen() || !sig.hidden)) {
      event.preventDefault();
      event.stopPropagation();
      closeAll();
      return;
    }
    if (!isOpen() || event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      active = (active + step + items.length) % items.length;
      showActive();
    } else if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      accept(active);
    }
  }, true);

  editor.addEventListener('input', () => {
    if (isOpen()) refilter();
    if (isOpen()) place();
    request();
  });

  // Caret moved without typing: keep the signature honest, but don't pop a list.
  const moved = () => { closeList(); request({ listToo: false, delay: 60 }); };
  editor.addEventListener('click', moved);
  editor.addEventListener('keyup', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) moved();
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !isOpen()) moved();
  });
  editor.addEventListener('scroll', () => { if (isOpen() || !sig.hidden) place(); });
  editor.addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== editor) closeAll(); }, 150); });

  // Mouse: mousedown is cancelled so the editor keeps focus; click accepts.
  box.addEventListener('mousedown', (event) => event.preventDefault());
  box.addEventListener('click', (event) => {
    const el = event.target.closest('.isense-item');
    if (el) accept(Number(el.dataset.i));
  });

  // Touch: a tap that didn't travel accepts on touchend, and cancelling it
  // stops the emulated mouse events - which would otherwise land on the
  // editor underneath the closed list and move the caret. A drag still
  // scrolls the list.
  let touch = null;
  box.addEventListener('touchstart', (event) => {
    const t = event.touches[0];
    touch = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  box.addEventListener('touchmove', (event) => {
    const t = event.touches[0];
    if (touch && (Math.abs(t.clientX - touch.x) > 8 || Math.abs(t.clientY - touch.y) > 8)) touch = null;
  }, { passive: true });
  box.addEventListener('touchcancel', () => { touch = null; });
  box.addEventListener('touchend', (event) => {
    const el = touch && event.target.closest('.isense-item');
    touch = null;
    if (!el) return;
    event.preventDefault();
    accept(Number(el.dataset.i));
  });

  return { close: closeAll };
}
