/* Syntax colouring for the code editor.

   The textarea stays the real input — caret, selection, undo, phone keyboards
   all native. Its own text is made transparent, and a <pre> laid exactly
   underneath draws the same text in colour, scrolled in step. Anything that
   sets editor.value is caught too, so Reset and recipes recolour.

   Deliberately small tokenizers, not a parser: comments, strings, numbers,
   keywords, calls, and DAX's [refs]. No regex lookbehind (iOS < 16.4). */

const PY_KW = new Set(('and as assert async await break class continue def del elif else except finally for '
  + 'from global if import in is lambda nonlocal not or pass raise return try while with yield True False None').split(' '));
const SQL_KW = new Set(('select from where group by order having limit offset join left right inner outer full '
  + 'cross on using as and or not null is in between like glob distinct case when then else end with recursive '
  + 'union all intersect except over partition rows range preceding following current row unbounded asc desc '
  + 'insert into values update set delete create table view drop exists').split(' '));
const DAX_KW = new Set('var return evaluate define measure order by asc desc true false in not'.split(' '));

const RULES = {
  python: {
    keywords: PY_KW, anyCase: false,
    rules: [
      ['com', /#.*/y],
      ['str', /[rbfuRBFU]{0,2}("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)/y],
      ['num', /\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y],
      ['word', /[A-Za-z_]\w*/y],
    ],
  },
  sql: {
    keywords: SQL_KW, anyCase: true,
    rules: [
      ['com', /--.*/y],
      ['str', /'(?:''|[^'])*'?/y],
      ['num', /\d+(?:\.\d+)?/y],
      ['word', /[A-Za-z_]\w*/y],
    ],
  },
  dax: {
    keywords: DAX_KW, anyCase: true,
    rules: [
      ['com', /(?:--|\/\/).*/y],
      ['str', /"(?:""|[^"])*"?/y],
      ['ref', /\[[^\]\n]*\]?/y],
      ['num', /\d+(?:\.\d+)?/y],
      ['word', /[A-Za-z_][\w.]*/y],
    ],
  },
};

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

/** The text as tokens, {kind, text}: kind is com, str, num, ref, kw, fn,
    name (any other word), or null for spaces and punctuation. */
export function tokens(text, lang = 'python') {
  const { keywords, anyCase, rules } = RULES[lang] || RULES.python;
  const out = [];
  let plain = '';
  let i = 0;
  const flush = () => {
    if (plain) out.push({ kind: null, text: plain });
    plain = '';
  };
  while (i < text.length) {
    let kind = null;
    let match = '';
    for (const [name, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(text);
      if (m && m[0]) { kind = name; match = m[0]; break; }
    }
    if (!kind) { plain += text[i]; i += 1; continue; }
    if (kind === 'word') {
      if (keywords.has(anyCase ? match.toLowerCase() : match)) kind = 'kw';
      else if (/^[ \t]*\(/.test(text.slice(i + match.length, i + match.length + 12))) kind = 'fn';
      else kind = 'name';
    }
    flush();
    out.push({ kind, text: match });
    i += match.length;
  }
  flush();
  return out;
}

export function colour(text, lang = 'python') {
  return tokens(text, lang)
    .map((t) => (t.kind && t.kind !== 'name' ? `<span class="t-${t.kind}">${esc(t.text)}</span>` : esc(t.text)))
    .join('');
}

const COPIED = [
  'boxSizing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'wordSpacing', 'tabSize', 'whiteSpace', 'textIndent',
];

export function attachHighlight(editor, lang = 'python') {
  const wrap = editor.parentElement;             // .editor-wrap: position: relative
  const pre = document.createElement('pre');
  pre.className = 'hl';
  pre.setAttribute('aria-hidden', 'true');
  wrap.insertBefore(pre, editor);
  editor.classList.add('has-hl');

  const sync = () => {
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
  };

  // Same box as the textarea's text area (clientWidth/Height leave out its
  // scrollbars), so both can scroll exactly as far.
  const layout = () => {
    const style = getComputedStyle(editor);
    COPIED.forEach((prop) => { pre.style[prop] = style[prop]; });
    pre.style.top = `${editor.offsetTop + editor.clientTop}px`;
    pre.style.left = `${editor.offsetLeft + editor.clientLeft}px`;
    pre.style.width = `${editor.clientWidth}px`;
    pre.style.height = `${editor.clientHeight}px`;
    sync();
  };

  // A trailing newline keeps the last, empty line's height in the pre too.
  // Layout again each time: a long line can bring in a scrollbar, which
  // shrinks the text area without resizing the textarea itself.
  const paint = () => {
    pre.innerHTML = `${colour(editor.value, lang)}\n`;
    layout();
  };

  const own = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
  Object.defineProperty(editor, 'value', {
    configurable: true,
    get() { return own.get.call(this); },
    set(v) { own.set.call(this, v); paint(); },
  });

  editor.addEventListener('input', paint);
  editor.addEventListener('scroll', sync);
  // Sizes change with the viewport, a font arriving, or the resize grip. A
  // window listener would outlive the screen (one more per lesson opened), so
  // watch the elements themselves and let go once they're gone.
  if (window.ResizeObserver) {
    const watch = new ResizeObserver(() => (editor.isConnected ? layout() : watch.disconnect()));
    watch.observe(editor);
    watch.observe(wrap);
  } else {
    const onResize = () => (editor.isConnected ? layout() : window.removeEventListener('resize', onResize));
    window.addEventListener('resize', onResize);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => editor.isConnected && layout());

  layout();
  paint();
}
