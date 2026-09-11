import { $, escapeHTML, toast, buzz } from '../ui.js';
import { python } from '../python.js';
import { PRELUDE } from '../curriculum/index.js';
import { wireEditor } from '../editor.js';
import { attachIntellisense } from '../intellisense.js';

const MODE_KEY = 'databites.sandbox.mode';

/* The prelude only runs when the shared namespace is first made, so it is
   the same for every mode. _DAX_KEEP: measures from one DAX run stay
   defined for the next, like variables in Python mode. */
const SANDBOX_PRELUDE = PRELUDE + '\n_DAX_KEEP = True\n';

const REV = 'Revenue = SUMX(order_items, order_items[qty] * RELATED(products[price]))';

/* Three languages, one workspace: they run in the same namespace, so a
   DataFrame made in Python mode is a table in SQL mode, and in the DAX model.
   Each keeps its own draft - the Python one under the original key, so
   nothing saved is lost. A blank editor is paralysis: there is always a
   recipe one tap away. */
const MODES = {
  python: {
    label: 'Python',
    theme: 't-sandbox',
    draftKey: 'databites.sandbox',
    note: `<code>cafe</code>, <code>cities</code>, <code>pd</code>, <code>np</code>,
      <code>plt</code> and <code>sns</code> are loaded. Variables stay put between
      runs, like a notebook.`,
    recipes: [
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
    ],
    snips: [
      { label: 'cafe', insert: 'cafe' },
      { label: 'cities', insert: 'cities' },
      { label: '["…"]', insert: '[""]', back: 2 },
      { label: '()', insert: '()', back: 1 },
      { label: '.head()', insert: '.head()' },
      { label: 'groupby', insert: '.groupby("")', back: 2 },
      { label: 'plt.', insert: 'plt.' },
      { label: 'sns.', insert: 'sns.' },
      { label: '"', insert: '"' },
    ],
  },
  sql: {
    label: 'SQL',
    theme: 't-sql',
    draftKey: 'databites.sandbox.sql',
    note: `Every dataset is a table: <code>cafe</code>, <code>cities</code>, <code>survey</code>,
      <code>weather</code>, <code>students</code>, <code>marks</code> &mdash; and the shop:
      <code>customers</code>, <code>orders</code>, <code>order_items</code>, <code>products</code>.
      Tables you create stay put between runs, and a DataFrame you make in Python mode turns up
      here as a table.`,
    recipes: [
      ['Peek', 'the first 8 rows', 'SELECT *\nFROM cafe\nLIMIT 8;'],
      ["What's here", 'every table', "SELECT name\nFROM sqlite_master\nWHERE type = 'table';"],
      ['Best days', 'top 8 by revenue', 'SELECT date, city, revenue\nFROM cafe\nORDER BY revenue DESC\nLIMIT 8;'],
      ['By city', 'grouped averages',
        'SELECT city, COUNT(*) AS days, ROUND(AVG(revenue), 1) AS avg_revenue\nFROM cafe\nGROUP BY city;'],
      ['By month', 'monthly takings',
        "SELECT strftime('%Y-%m', date) AS month, ROUND(SUM(revenue), 2) AS revenue\nFROM cafe\nGROUP BY month\nORDER BY month;"],
      ['By country', 'a join',
        'SELECT ci.country, ROUND(SUM(c.revenue), 2) AS revenue\nFROM cafe c\nJOIN cities ci ON c.city = ci.city\nGROUP BY ci.country;'],
      ['Top 3 each', 'ranked per city',
        'WITH ranked AS (\n  SELECT city, date, revenue,\n         RANK() OVER (PARTITION BY city ORDER BY revenue DESC) AS rnk\n  FROM cafe\n)\nSELECT *\nFROM ranked\nWHERE rnk <= 3;'],
      ['Gaps', 'missing ratings',
        'SELECT COUNT(*) AS days, COUNT(rating) AS rated,\n       COUNT(*) - COUNT(rating) AS missing\nFROM cafe;'],
    ],
    snips: [
      { label: 'SELECT', insert: 'SELECT ' },
      { label: 'FROM', insert: '\nFROM ' },
      { label: 'WHERE', insert: '\nWHERE ' },
      { label: 'GROUP BY', insert: '\nGROUP BY ' },
      { label: 'ORDER BY', insert: '\nORDER BY ' },
      { label: 'COUNT(*)', insert: 'COUNT(*)' },
      { label: 'AS', insert: ' AS ' },
      { label: "'…'", insert: "''", back: 1 },
      { label: '()', insert: '()', back: 1 },
      { label: ', ', insert: ', ' },
    ],
  },
  dax: {
    label: 'DAX',
    theme: 't-dax',
    draftKey: 'databites.sandbox.dax',
    note: `The shop and the cafe are one model: <code>customers</code>, <code>orders</code>,
      <code>order_items</code>, <code>products</code>, <code>cafe</code>, <code>cities</code> and a
      <code>calendar</code>, joined by one-way relationships. Measures you define stay put between
      runs. <code>EVALUATE</code> shows a table.`,
    recipes: [
      ['Peek', 'the products table', 'EVALUATE\nproducts'],
      ['A measure', 'the total takings', REV],
      ['By category', 'a measure in a matrix',
        `${REV}\n\nEVALUATE\nSUMMARIZECOLUMNS(products[category], "Revenue", [Revenue])`],
      ['By month', 'with year to date',
        `${REV}\nYTD = TOTALYTD([Revenue], calendar[date])\n\nEVALUATE\nSUMMARIZECOLUMNS(calendar[month], "Revenue", [Revenue], "YTD", [YTD])`],
      ['Shares', 'each city of the whole',
        `${REV}\nShare = DIVIDE([Revenue], CALCULATE([Revenue], ALL(customers[city])))\n\nEVALUATE\nSUMMARIZECOLUMNS(customers[city], "Revenue", [Revenue], "Share", [Share])`],
      ['Ranked', 'products by revenue',
        `${REV}\nRank = RANKX(ALL(products[name]), [Revenue])\n\nEVALUATE\nSUMMARIZECOLUMNS(products[name], "Revenue", [Revenue], "Rank", [Rank])`],
      ['Cafe', 'cups and ratings by drink',
        'EVALUATE\nSUMMARIZECOLUMNS(cafe[drink], "Cups", SUM(cafe[cups]), "Avg rating", AVERAGE(cafe[rating]))'],
      ['Filtered', 'big orders only',
        `${REV}\n\nEVALUATE\nFILTER(ADDCOLUMNS(orders, "Revenue", [Revenue]), [Revenue] >= 150)`],
    ],
    snips: [
      { label: '[ ]', insert: '[]', back: 1 },
      { label: 'EVALUATE', insert: 'EVALUATE\n' },
      { label: 'CALCULATE', insert: 'CALCULATE()', back: 1 },
      { label: 'SUMX', insert: 'SUMX()', back: 1 },
      { label: 'DIVIDE', insert: 'DIVIDE()', back: 1 },
      { label: 'FILTER', insert: 'FILTER()', back: 1 },
      { label: 'ALL', insert: 'ALL()', back: 1 },
      { label: 'RELATED', insert: 'RELATED()', back: 1 },
      { label: '"…"', insert: '""', back: 1 },
      { label: ', ', insert: ', ' },
    ],
  },
};
const ARIA = { python: 'Python code', sql: 'SQL query', dax: 'DAX measures and queries' };

// localStorage can throw (private mode, blocked site data) - the sandbox must still open.
const load = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const keep = (key, value) => { try { localStorage.setItem(key, value); } catch { /* not saved, still usable */ } };

export function renderSandbox(mount, ctx) {
  ctx.setTitle('Sandbox');
  const stored = load(MODE_KEY);
  const mode = Object.hasOwn(MODES, stored ?? '') ? stored : 'python';
  const M = MODES[mode];
  const isSql = mode === 'sql';
  const isDax = mode === 'dax';
  mount.className = `screen lesson-screen ${M.theme}`;

  const saved = load(M.draftKey) ?? M.recipes[0][2];

  mount.innerHTML = `
    <div class="stack">
      <div class="s-intro">
        <p class="label lesson-kicker">No lessons, no marking</p>
        <h1 class="display-xl" style="margin:6px 0 10px;color:var(--accent)">Sandbox</h1>
        <div class="filters" role="group" aria-label="Language" id="modes">
          ${Object.entries(MODES).map(([k, m]) => `
            <button class="filter ${k === mode ? 'is-on' : ''}" data-mode="${k}"
                    aria-pressed="${k === mode}">${m.label}</button>`).join('')}
        </div>
        <p class="note" style="margin:0">${M.note}</p>
      </div>

      <div class="s-recipes">
        <p class="label label-mark" style="margin:0 0 12px">Start with one of these</p>
        <div class="recipes" id="recipes">
          ${M.recipes.map((r, i) => `
            <button class="recipe" data-recipe="${i}">
              <span class="recipe-n">${escapeHTML(r[0])}</span>
              <span class="recipe-d">${escapeHTML(r[1])}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="l-work stack">
      <div class="editor-wrap">
        <div class="editor-bar">
          <span class="label">${M.label}</span>
          <button class="btn-text" id="wipe" style="font-size:12px">Clear</button>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" style="min-height:190px"
          aria-label="${ARIA[mode]}"></textarea>
        <div class="snips" id="snips">
          ${M.snips.map((s, i) => `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      <button class="btn btn-accent btn-block" id="run">Run</button>

      <div id="result"></div>
      </div>
    </div>
  `;

  const editor = $('#code', mount);
  const result = $('#result', mount);
  const button = $('#run', mount);
  editor.value = saved;

  const store = () => keep(M.draftKey, editor.value);
  wireEditor(editor, { onChange: store, onRun: () => run(), snipBar: $('#snips', mount), snippets: M.snips });
  attachIntellisense(editor, { key: 'sandbox', prelude: SANDBOX_PRELUDE, lang: mode });

  $('#modes', mount).addEventListener('click', (event) => {
    const chip = event.target.closest('[data-mode]');
    if (!chip || chip.dataset.mode === mode) return;
    store();
    keep(MODE_KEY, chip.dataset.mode);
    buzz(8);
    ctx.go('play');          // re-render through the router, on a fresh node
  });

  $('#recipes', mount).addEventListener('click', (event) => {
    const card = event.target.closest('[data-recipe]');
    if (!card) return;
    editor.value = M.recipes[Number(card.dataset.recipe)][2];
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

  let busy = false;

  // The first SQL run may still be fetching SQLite - say so on the button.
  const offPkg = python.on('pkg', ({ text, done }) => {
    if (!button.isConnected) return offPkg();
    if (busy) button.textContent = done || !text ? 'Running…' : text;
  });

  async function run() {
    if (busy || !python.isReady) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Running…';

    // fresh:false — this is a scratchpad, state should persist like a notebook.
    const out = await python.run({
      code: editor.value,
      key: 'sandbox',
      prelude: SANDBOX_PRELUDE,
      fresh: false,
      lang: mode,
      needs: isSql ? ['sqlite3'] : [],
      timeoutMs: 30000,          // an endless loop restarts Python instead of freezing it
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
      parts.push(`<div class="out"><div class="out-head" style="color:var(--accent)">${out.timedOut ? 'Time limit' : isSql ? 'The database said no' : isDax ? 'The DAX has a problem' : 'Error'}</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre></div>`);
    }
    if (!parts.length) parts.push(`<p class="needs-note">Ran fine — nothing to show.</p>`);

    result.innerHTML = parts.join('');
    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  button.addEventListener('click', run);

  if (isSql) python.whenReady(() => python.ensure(['sqlite3']));   // SQLite before the first Run

  if (!python.isReady) {
    button.disabled = true;
    button.textContent = isSql ? 'Getting the database ready…' : isDax ? 'Getting DAX ready…' : 'Warming up Python…';
    python.whenReady(() => {
      if (!button.isConnected) return;
      button.disabled = false;
      button.textContent = 'Run';
    });
  } else if (mode === 'python' && !python.hasSeaborn) {
    toast('seaborn is offline — pandas and matplotlib still work');
  }
}
