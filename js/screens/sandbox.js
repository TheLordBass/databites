import { $, escapeHTML, toast, buzz } from '../ui.js';
import { python } from '../python.js';
import { PRELUDE } from '../curriculum/index.js';

const KEY = 'databites.sandbox';

/* A blank editor is paralysis. There is always something one tap away. */
const RECIPES = [
  ['Peek', 'the first 8 rows', 'cafe.head(8)'],
  ['Summary', 'every number at once', 'cafe.describe().round(2)'],
  ['Best days', 'top 8 by revenue', 'cafe.nlargest(8, "revenue")'],
  ['By city', 'grouped averages', 'cafe.groupby("city")[["cups", "revenue"]].mean().round(1)'],
  ['Spread', 'where revenue lands',
    'import seaborn as sns\nsns.set_theme()\nsns.histplot(data=cafe, x="revenue", bins=20)\nplt.show()'],
  ['Scatter', 'cups against money',
    'import seaborn as sns\nsns.set_theme()\nsns.scatterplot(data=cafe, x="cups", y="revenue", hue="city")\nplt.show()'],
  ['Heatmap', 'what moves together',
    'import seaborn as sns\nsns.set_theme()\nsns.heatmap(cafe[["cups","price","revenue","rating"]].corr(), annot=True)\nplt.show()'],
  ['Over time', 'weekly takings',
    'weekly = cafe.set_index("date")["revenue"].resample("W").sum()\nweekly.plot(linewidth=2)\nplt.title("Revenue by week")\nplt.show()'],
];

const SNIPS = [
  { label: 'cafe', insert: 'cafe' },
  { label: 'cities', insert: 'cities' },
  { label: '["…"]', insert: '[""]', back: 2 },
  { label: '()', insert: '()', back: 1 },
  { label: '.head()', insert: '.head()' },
  { label: 'groupby', insert: '.groupby("")', back: 2 },
  { label: 'plt.', insert: 'plt.' },
  { label: 'sns.', insert: 'sns.' },
  { label: '"', insert: '"' },
];

export function renderSandbox(mount, ctx) {
  ctx.setTitle('Sandbox');
  mount.className = 'screen lesson-screen t-sandbox';

  const saved = localStorage.getItem(KEY) || RECIPES[0][2];

  mount.innerHTML = `
    <div class="stack">
      <div>
        <p class="label lesson-kicker">No lessons, no marking</p>
        <h1 class="display-xl" style="margin:6px 0 10px;color:var(--accent)">Sandbox</h1>
        <p class="note" style="margin:0">
          <code>cafe</code>, <code>cities</code>, <code>pd</code>, <code>np</code>,
          <code>plt</code> and <code>sns</code> are loaded. Variables stay put between
          runs, like a notebook.
        </p>
      </div>

      <div>
        <p class="label label-mark" style="margin:0 0 12px">Start with one of these</p>
        <div class="recipes" id="recipes">
          ${RECIPES.map((r, i) => `
            <button class="recipe" data-recipe="${i}">
              <span class="recipe-n">${escapeHTML(r[0])}</span>
              <span class="recipe-d">${escapeHTML(r[1])}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="editor-wrap">
        <div class="editor-bar">
          <span class="label">Python</span>
          <button class="btn-text" id="wipe" style="font-size:12px">Clear</button>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" style="min-height:190px"
          aria-label="Python code"></textarea>
        <div class="snips" id="snips">
          ${SNIPS.map((s, i) => `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      <button class="btn btn-accent btn-block" id="run">Run</button>

      <div id="result"></div>
    </div>
  `;

  const editor = $('#code', mount);
  const result = $('#result', mount);
  editor.value = saved;

  const store = () => localStorage.setItem(KEY, editor.value);
  editor.addEventListener('input', store);

  const insert = (text, back = 0) => {
    editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, 'end');
    const caret = editor.selectionStart - back;
    editor.setSelectionRange(caret, caret);
    editor.focus();
    store();
  };

  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      insert('    ');
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      run();
    }
  });

  $('#snips', mount).addEventListener('click', (event) => {
    const button = event.target.closest('[data-snip]');
    if (!button) return;
    const snip = SNIPS[Number(button.dataset.snip)];
    insert(snip.insert, snip.back || 0);
    buzz(8);
  });

  $('#recipes', mount).addEventListener('click', (event) => {
    const card = event.target.closest('[data-recipe]');
    if (!card) return;
    editor.value = RECIPES[Number(card.dataset.recipe)][2];
    store();
    buzz(10);
    run();
  });

  $('#wipe', mount).addEventListener('click', () => {
    editor.value = '';
    result.innerHTML = '';
    store();
    editor.focus();
  });

  const button = $('#run', mount);
  let busy = false;

  async function run() {
    if (busy || !python.isReady) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Running…';

    // fresh:false — this is a scratchpad, state should persist like a notebook.
    const out = await python.run({
      code: editor.value,
      key: 'sandbox',
      prelude: PRELUDE,
      fresh: false,
    });

    busy = false;
    button.disabled = false;
    button.textContent = 'Run';

    const parts = [];
    if (out.images && out.images.length) {
      parts.push(`<div class="out">${out.images
        .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart">`).join('')}</div>`);
    }
    const text = (out.stdout || '').trim();
    if (text) {
      parts.push(`<div class="out"><div class="out-head">Output</div>
        <pre class="out-body">${escapeHTML(text)}</pre></div>`);
    }
    if (!out.ok) {
      parts.push(`<div class="out"><div class="out-head" style="color:var(--accent)">Error</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre></div>`);
    }
    if (!parts.length) parts.push(`<p class="needs-note">Ran fine — nothing to show.</p>`);

    result.innerHTML = parts.join('');
    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  button.addEventListener('click', run);

  if (!python.isReady) {
    button.disabled = true;
    button.textContent = 'Warming up Python…';
    python.whenReady(() => {
      if (!button.isConnected) return;
      button.disabled = false;
      button.textContent = 'Run';
    });
  } else if (!python.hasSeaborn) {
    toast('seaborn is offline — pandas and matplotlib still work');
  }
}
