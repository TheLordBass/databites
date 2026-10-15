/* The Sandbox (route: play): no lessons, no marking. Five modes (Python, SQL,
   DAX, Excel, R), each with its own draft and recipes to start from, all
   running in one shared namespace ('sandbox', fresh: false) so what you make
   stays put between runs, like a notebook. Load CSV turns a file into a table
   (a sheet, in Excel) for the visit. Excel keeps the sheet you're on above
   the editor; Python can be taken away as a notebook or a script
   (js/export.js). */

import { $, escapeHTML, toast, buzz, daxOutput, echoBlock, showResult, sheetPreview, showTarget, printed, dataRows } from '../ui.js';
import { layoutSwitch, wireLayoutSwitch } from '../display.js';
import { python } from '../python.js';
import { PRELUDE } from '../curriculum/index.js';
import { wireEditor } from '../editor.js';
import { attachIntellisense } from '../intellisense.js';
import { attachHighlight } from '../highlight.js';
import { canTake, takeWithYou } from '../export.js';
import { guideIfDue } from '../guide.js';

// R runs in webR (js/r.js), loaded the first time R mode opens.
const rEngine = () => import('../r.js').then((m) => m.rEngine);

const MODE_KEY = 'databites.sandbox.mode';
const ROWS_KEY = 'databites.sandbox.daxrows';

// DAX mode: what a measure-only script is split by, like dragging a field onto a matrix.
const ROW_FIELDS = ['', 'products[category]', 'products[name]', 'customers[city]', 'cities[country]',
  'calendar[month]', 'calendar[quarter]', 'orders[status]', 'cafe[drink]', 'cafe[city]'];

/* The prelude only runs when the shared namespace is first made, so it is
   the same for every mode. _DAX_KEEP: measures from one DAX run stay
   defined for the next, like variables in Python mode. */
const SANDBOX_PRELUDE = PRELUDE + '\n_DAX_KEEP = True\n';

/* The extras that stay out of the boot download, fetched the first time the
   code imports one, as a lesson's `needs` would. Without this, trying the AI
   track's code here said "No module named 'sklearn'". */
const LAZY = { sklearn: 'scikit-learn', scipy: 'scipy', statsmodels: 'statsmodels', sqlite3: 'sqlite3' };
const importsNeeding = (code) => [...new Set(
  [...code.matchAll(/^[ \t]*(?:from|import)[ \t]+([A-Za-z_]\w*)/gm)].map((m) => LAZY[m[1]]).filter(Boolean),
)];

const REV = 'Revenue = SUMX(order_items, order_items[qty] * RELATED(products[price]))';

/* Four languages, one workspace: they run in the same namespace, so a
   DataFrame made in Python mode is a table in SQL mode, in the DAX model, and
   a sheet in Excel.
   Each keeps its own draft - the Python one under the original key, so
   nothing saved is lost. A blank editor is paralysis: there is always a
   recipe one tap away. */
const MODES = {
  python: {
    label: 'Python',
    theme: 't-sandbox',
    draftKey: 'databites.sandbox',
    note: `Every dataset is already loaded (<code>cafe</code>, <code>cities</code>, <code>survey</code>,
      <code>weather</code>, <code>students</code>, <code>marks</code> and the shop's
      <code>customers</code>, <code>orders</code>, <code>order_items</code> and <code>products</code>),
      and so are <code>pd</code>, <code>np</code>, <code>plt</code> and <code>sns</code>.
      Variables stay put between runs, like a notebook.`,
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
      <code>weather</code>, <code>students</code>, <code>marks</code>, plus the shop:
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
  /* Excel: every DataFrame is a sheet (js/excel.py). The sheet picker and
     Fill down sit above Run, the way DAX has its matrix rows. A recipe's
     fourth item is the sheet and fill it needs. */
  excel: {
    label: 'Excel',
    theme: 't-excel',
    draftKey: 'databites.sandbox.excel',
    note: `Every dataset is a sheet. Pick one above the Run button. Its columns are A, B, C and on,
      the headings sit in row 1 and the data starts in row 2, so on <code>cafe</code>,
      <code>=SUM(F2:F121)</code> adds up the revenue. Your formula goes in the first empty column.
      To put one somewhere else, start the line with the cell, like <code>J2: =AVERAGE(D2:D121)</code>,
      and add more lines like that for more cells. Other sheets are a name away, like
      <code>cities!A:C</code>, and a DataFrame you make in Python mode is a sheet here too.`,
    recipes: [
      ['Total', 'all the revenue', '=SUM(F2:F121)'],
      ['Each row', 'cups times price, filled down', '=D2*E2', { fill: true }],
      ['Count', 'days in Lagos', '=COUNTIF(B2:B121,"Lagos")'],
      ['Two conditions', 'tea revenue in Accra', '=SUMIFS(F2:F121,B2:B121,"Accra",C2:C121,"tea")'],
      ['Busy or quiet', 'IF, filled down', '=IF(D2>=40,"busy","quiet")', { fill: true }],
      ['Look up', "each city's country", '=VLOOKUP(B2,cities!A:C,2,FALSE)', { fill: true }],
      ['A small table', 'revenue for each city',
        'J2: Lagos\nK2: =SUMIF(B2:B121,J2,F2:F121)\nJ3: Nairobi\nK3: =SUMIF(B2:B121,J3,F2:F121)\nJ4: Accra\nK4: =SUMIF(B2:B121,J4,F2:F121)'],
      ['Big days', 'FILTER spills a list', '=FILTER(A2:F121,F2:F121>200)'],
    ],
    snips: [
      { label: '=', insert: '=' },
      { label: '( )', insert: '()', back: 1 },
      { label: ', ', insert: ',' },
      { label: ':', insert: ':' },
      { label: '$', insert: '$' },
      { label: '"…"', insert: '""', back: 1 },
      { label: 'SUM', insert: 'SUM()', back: 1 },
      { label: 'IF', insert: 'IF()', back: 1 },
      { label: 'SUMIFS', insert: 'SUMIFS()', back: 1 },
      { label: 'XLOOKUP', insert: 'XLOOKUP()', back: 1 },
      { label: 'cities!', insert: 'cities!' },
    ],
  },
  /* R: a separate engine (webR), so it has the same datasets but not what
     the other modes make. Its variables stay put between runs all the same. */
  r: {
    label: 'R',
    theme: 't-r',
    draftKey: 'databites.sandbox.r',
    note: `Every dataset is here as a tibble (<code>cafe</code>, <code>cities</code>, <code>survey</code>,
      <code>weather</code>, <code>students</code>, <code>marks</code> and the shop's
      <code>customers</code>, <code>orders</code>, <code>order_items</code> and <code>products</code>),
      and dplyr is loaded. Variables stay put between runs, like the R console. R is a separate
      engine, so a DataFrame you make in Python mode doesn't reach it. It downloads the first time
      you open this mode, and is kept after that.`,
    recipes: [
      ['Peek', 'the first 8 rows', 'head(cafe, 8)'],
      ['Summary', 'every column at once', 'summary(cafe)'],
      ['Best days', 'top 8 by revenue', 'cafe |>\n  slice_max(revenue, n = 8)'],
      ['By city', 'grouped averages',
        'cafe |>\n  group_by(city) |>\n  summarise(days = n(), cups = round(mean(cups), 1), revenue = round(mean(revenue), 1))'],
      ['By month', 'monthly takings',
        'cafe |>\n  mutate(month = format(date, "%Y-%m")) |>\n  group_by(month) |>\n  summarise(revenue = round(sum(revenue), 2))'],
      ['By country', 'a join',
        'cafe |>\n  left_join(cities, by = "city") |>\n  group_by(country) |>\n  summarise(revenue = round(sum(revenue), 2))'],
      ['Spread', 'a histogram', 'hist(cafe$revenue, breaks = 20, main = "Revenue per day", xlab = "revenue")'],
      ['Scatter', 'cups against money', 'plot(cafe$cups, cafe$revenue, xlab = "cups", ylab = "revenue", pch = 19)'],
    ],
    snips: [
      { label: 'cafe', insert: 'cafe' },
      { label: '<-', insert: ' <- ' },
      { label: '|>', insert: ' |> ' },
      { label: '$', insert: '$' },
      { label: '( )', insert: '()', back: 1 },
      { label: '"…"', insert: '""', back: 1 },
      { label: 'filter', insert: 'filter()', back: 1 },
      { label: 'mutate', insert: 'mutate()', back: 1 },
      { label: 'group_by', insert: 'group_by()', back: 1 },
      { label: 'summarise', insert: 'summarise()', back: 1 },
      { label: 'arrange', insert: 'arrange()', back: 1 },
    ],
  },
};
const ARIA = { python: 'Python code', sql: 'SQL query', dax: 'DAX measures and queries', excel: 'Excel formulas', r: 'R code' };

// Excel mode's sheets: the datasets, then any CSV loaded this visit.
const SHEETS = ['cafe', 'cities', 'customers', 'products', 'orders', 'order_items', 'weather', 'students', 'marks', 'survey'];
const loadedSheets = [];
// The CSVs loaded this visit, by name: R is a separate engine, so R mode
// loads them into its own space too, again after R restarts.
const loadedFiles = new Map();
let rHas = { boots: -1, names: new Set() };
const SHEET_KEY = 'databites.sandbox.xlsheet';
const FILL_KEY = 'databites.sandbox.xlfill';

// After a CSV loads: a first look at it, in whichever language is showing.
const PEEK = {
  python: (name) => `${name}.head(8)`,
  sql: (name) => `SELECT *\nFROM ${name}\nLIMIT 8;`,
  dax: (name) => `EVALUATE\n${name}`,
  excel: () => '=COUNTA(A:A)-1',
  r: (name) => `head(${name}, 8)`,
};

// Names the workspace already relies on; a file called np.csv mustn't replace numpy.
const RESERVED = new Set(['pd', 'np', 'plt', 'sns', 'io', 'json', 'sys', 'math', 'ast', 'data']);

function tableName(filename) {
  let base = filename.replace(/\.[^.]*$/, '').toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
  if (!base || /^\d/.test(base)) base = `t_${base}`;
  if (RESERVED.has(base)) base += '_csv';
  return base;
}

// localStorage can throw (private mode, blocked site data) - the sandbox must still open.
const load = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const keep = (key, value) => { try { localStorage.setItem(key, value); } catch { /* not saved, still usable */ } };

export function renderSandbox(mount, ctx) {
  ctx.setTitle('Sandbox');
  const stored = load(MODE_KEY);
  const mode = Object.keys(MODES).includes(stored) ? stored : 'python';   // not Object.hasOwn: iOS < 15.4
  const M = MODES[mode];
  const isSql = mode === 'sql';
  const isDax = mode === 'dax';
  const isXl = mode === 'excel';
  const isR = mode === 'r';
  let rReady = !isR;          // R comes in on demand: Run waits for it
  const sheets = [...SHEETS, ...loadedSheets];
  let xlSheet = load(SHEET_KEY) || 'cafe';
  if (!sheets.includes(xlSheet)) xlSheet = 'cafe';
  let xlFill = load(FILL_KEY) === '1';
  let daxRows = load(ROWS_KEY) ?? 'products[category]';
  if (!ROW_FIELDS.includes(daxRows)) daxRows = 'products[category]';
  mount.className = `screen lesson-screen ${M.theme}`;

  const saved = load(M.draftKey) ?? M.recipes[0][2];

  mount.innerHTML = `
    <div class="stack">
      <div class="s-intro">
        <p class="label lesson-kicker">No lessons, no marking</p>
        <h1 class="display-xl" style="margin:6px 0 10px;color:var(--accent)">Sandbox</h1>
        <div class="filters seg seg-wrap-narrow" role="group" aria-label="Language" id="modes" style="margin-bottom:14px">
          ${Object.entries(MODES).map(([k, m]) => `
            <button class="filter ${k === mode ? 'is-on' : ''}" data-mode="${k}"
                    aria-pressed="${k === mode}">${m.label}</button>`).join('')}
        </div>
        <details class="reveal s-about">
          <summary>What's loaded</summary>
          <div class="reveal-body">
            <p>${M.note}</p>
            <p><b>Your own data:</b> Load CSV, in the editor bar, turns a file into a table (a sheet, in
            Excel) in every mode until you close the app. The file never leaves your device.</p>
          </div>
        </details>
      </div>

      <div class="s-recipes">
        <p class="label label-mark" style="margin:0 0 10px">Start with one of these</p>
        <div class="recipes" id="recipes">
          ${M.recipes.map((r, i) => `
            <button class="recipe" data-recipe="${i}">
              <span class="recipe-n">${escapeHTML(r[0])}</span>
              <span class="recipe-d">${escapeHTML(r[1])}</span>
            </button>`).join('')}
        </div>
      </div>

      <div class="l-work stack">
      <div class="l-code stack">
      ${isXl ? `<div class="rows-pick">
        <span class="label">Sheet</span>
        <select id="xl-sheet" aria-label="Sheet">
          ${sheets.map((n) => `<option value="${escapeHTML(n)}"${n === xlSheet ? ' selected' : ''}>${escapeHTML(n)}</option>`).join('')}
        </select>
        <label class="xl-fill"><input type="checkbox" id="xl-fill"${xlFill ? ' checked' : ''}> Fill down</label>
      </div>
      <div class="xl-peeks" id="xl-peek" role="group" aria-label="The sheet"></div>` : ''}
      <div class="editor-wrap">
        <div class="editor-bar">
          <span class="label">${M.label}${isXl ? '<span id="xl-rows"></span>' : ''}</span>
          <span class="editor-actions">
            ${layoutSwitch()}
            <button class="btn-text" id="load-csv" style="font-size:12px">Load CSV</button>
            <button class="btn-text" id="wipe" style="font-size:12px">Clear</button>
          </span>
          <input type="file" id="csv-file" accept=".csv,.tsv,.txt,text/csv" hidden>
        </div>
        <textarea class="editor editor-tall" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off"
          aria-label="${ARIA[mode]}"></textarea>
        <div class="snips" id="snips">
          ${M.snips.map((s, i) => `<button class="snip" data-snip="${i}">${escapeHTML(s.label)}</button>`).join('')}
        </div>
      </div>

      ${isDax ? `<label class="rows-pick">
        <span class="label">Matrix rows</span>
        <select id="dax-rows">
          ${ROW_FIELDS.map((f) => `<option value="${f}"${f === daxRows ? ' selected' : ''}>${f || 'none (totals only)'}</option>`).join('')}
        </select>
      </label>` : ''}

      <button class="btn btn-accent btn-block" id="run">Run</button>
      </div>

      <div id="result" aria-live="polite"></div>

      ${canTake(mode) ? `<details class="reveal s-take">
        <summary>Take it with you</summary>
        <div class="reveal-body">
          <p>What's in the editor, plus the datasets, as a file that runs in real Python:
          Jupyter, VS Code or Google Colab. A CSV you loaded isn't inside it; read that with
          <code>pd.read_csv</code> there.</p>
          <div class="quick-row">
            <button class="btn btn-quiet" id="take-ipynb">Notebook</button>
            <button class="btn btn-quiet" id="take-py">Script (.py)</button>
          </div>
        </div>
      </details>` : ''}
      </div>
    </div>
  `;

  const editor = $('#code', mount);
  wireLayoutSwitch(mount);
  guideIfDue('sandbox');
  const result = $('#result', mount);
  const button = $('#run', mount);
  editor.value = saved;

  const store = () => keep(M.draftKey, editor.value);
  wireEditor(editor, { onChange: store, onRun: () => run(), snipBar: $('#snips', mount), snippets: M.snips });
  attachIntellisense(editor, { key: 'sandbox', prelude: SANDBOX_PRELUDE, lang: mode });
  attachHighlight(editor, mode);

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
    const recipe = M.recipes[Number(card.dataset.recipe)];
    editor.value = recipe[2];
    if (isXl) setSheet((recipe[3] && recipe[3].sheet) || 'cafe', Boolean(recipe[3] && recipe[3].fill));
    store();
    buzz(10);
    run();
  });

  ['ipynb', 'py'].forEach((kind) => {
    const take = $(`#take-${kind}`, mount);
    if (!take) return;
    take.addEventListener('click', async () => {
      const saved = await takeWithYou(kind, {
        name: `querycafe-sandbox-${mode}`, title: `QueryCafe Sandbox (${M.label})`,
        about: 'Written in the QueryCafe Sandbox.', code: editor.value, lang: mode,
      });
      if (saved) toast(kind === 'py' ? 'Script saved' : 'Notebook saved. Open it in Jupyter, VS Code or Colab');
    });
  });

  const rowsPick = $('#dax-rows', mount);
  if (rowsPick) {
    rowsPick.addEventListener('change', () => {
      daxRows = rowsPick.value;
      keep(ROWS_KEY, daxRows);
      if (editor.value.trim()) run();
    });
  }

  // Excel: the sheet the formula goes on, and whether it fills down to the last row.
  const sheetPick = $('#xl-sheet', mount);
  const fillPick = $('#xl-fill', mount);
  function setSheet(name, fill) {
    if (!sheetPick) return;
    if (![...sheetPick.options].some((o) => o.value === name)) sheetPick.add(new Option(name, name));
    xlSheet = sheetPick.value = name;
    xlFill = fillPick.checked = fill;
    keep(SHEET_KEY, xlSheet);
    keep(FILL_KEY, xlFill ? '1' : '');
    peek();
  }
  /* Excel: the sheet you're on, above the editor the whole time, runs and
     all: the cell your formula goes in outlined, and how far its data runs
     (by the editor too), so a range never means counting rows. */
  const sheetView = $('#xl-peek', mount);
  let peeks = 0;
  async function peek() {
    if (!isXl || !python.isReady) return;
    const ask = ++peeks;
    const out = await python.run({
      code: '', key: 'sandbox', prelude: SANDBOX_PRELUDE, fresh: false, lang: 'excel', timeoutMs: 15000,
      rows: JSON.stringify({ sheet: xlSheet, fill: xlFill }), check: '__judge__ = {"grids": _excel_peek()}',
    });
    if (!sheetView.isConnected || ask !== peeks) return;
    const grids = out.judge && out.judge.grids;
    if (!grids || !grids.length) return;
    sheetView.innerHTML = sheetPreview(grids);
    const span = grids[0].span;
    $('#xl-rows', mount).textContent = span && span.rows ? ` · ${xlSheet}, data in ${dataRows(span)}` : '';
    showTarget(sheetView);
  }
  if (isXl) python.whenReady(peek);

  if (sheetPick) {
    const changed = () => {
      setSheet(sheetPick.value, fillPick.checked);
      if (editor.value.trim()) run();
    };
    sheetPick.addEventListener('change', changed);
    fillPick.addEventListener('change', changed);
  }

  const csvInput = $('#csv-file', mount);
  $('#load-csv', mount).addEventListener('click', () => csvInput.click());
  csvInput.addEventListener('change', async () => {
    const file = csvInput.files && csvInput.files[0];
    csvInput.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast('That file is over 10 MB, which is too big to load here');
      return;
    }
    const text = await file.text();
    const out = await python.load({ key: 'sandbox', prelude: SANDBOX_PRELUDE, name: tableName(file.name), text });
    if (!button.isConnected) return;
    if (!out.ok) {
      result.innerHTML = `<div class="out"><div class="out-head" style="color:var(--accent)">Couldn't load that file</div>
        <pre class="out-body is-err">${escapeHTML(out.error || 'It may not be a CSV.')}</pre></div>`;
      return;
    }
    toast(`Loaded ${out.name}: ${out.rows} rows`);
    loadedFiles.set(out.name, text);
    if (!SHEETS.includes(out.name) && !loadedSheets.includes(out.name)) loadedSheets.push(out.name);
    if (isXl) setSheet(out.name, false);
    editor.value = PEEK[mode](out.name);
    store();
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

  // R mode: the files loaded this visit, into R's space, once each (again after R restarts).
  async function filesIntoR() {
    const r = await rEngine();
    if (rHas.boots !== r.boots) rHas = { boots: r.boots, names: new Set() };
    for (const [name, text] of loadedFiles) {
      if (rHas.names.has(name)) continue;
      const got = await r.load({ space: 'sandbox', name, text });
      if (got.ok) rHas.names.add(name);
    }
  }

  async function run() {
    if (busy || !python.isReady || !rReady) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Running…';
    if (isR) await filesIntoR();

    // fresh:false — this is a scratchpad, state should persist like a notebook.
    const out = await python.run({
      code: editor.value,
      key: 'sandbox',
      prelude: SANDBOX_PRELUDE,
      fresh: false,
      lang: mode,
      rows: isDax ? daxRows : isXl ? JSON.stringify({ sheet: xlSheet, fill: xlFill }) : undefined,
      needs: isSql ? ['sqlite3'] : mode === 'python' ? importsNeeding(editor.value) : [],
      timeoutMs: 30000,          // an endless loop restarts Python instead of freezing it
    });

    busy = false;
    button.disabled = false;
    button.textContent = 'Run';

    const parts = [];
    if (out.images && out.images.length) {
      parts.push(`<div class="out">${out.images
        .map((b64) => `<img src="data:image/png;base64,${b64}" alt="Chart drawn by your code">`).join('')}</div>`);
    }
    const text = (out.stdout || '').trim();
    if (out.blocks && out.blocks.length) {
      parts.push(daxOutput(out.blocks, { chart: true }));
    } else if (text) {
      parts.push(`<div class="out"><div class="out-head">Output</div>
        ${printed(out.stdout, out.grids)}</div>`);
    }
    if (out.echo) parts.push(echoBlock(out));
    if (!out.ok) {
      parts.push(`<div class="out"><div class="out-head" style="color:var(--accent)">${out.timedOut ? 'Time limit' : isSql ? 'The database said no' : isDax ? 'The DAX has a problem' : isXl ? "Excel won't take that formula" : isR ? 'R stopped here' : 'Error'}</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre></div>`);
    }
    if (!parts.length) parts.push(`<p class="needs-note">That ran fine, but there was nothing to show.</p>`);

    result.innerHTML = parts.join('');
    showResult(mount, result);
  }

  button.addEventListener('click', run);

  // R mode starts R loading as it opens, and the button says how far it's got.
  if (isR) {
    rEngine().then((r) => {
      if (r.isReady) { rReady = true; return; }
      button.disabled = true;
      button.textContent = 'Getting R ready…';
      const off = r.onStatus((text) => {
        if (button.isConnected && text && !busy) button.textContent = text;
      });
      r.warm().then(() => {
        off();
        rReady = true;
        if (!button.isConnected || !python.isReady) return;
        button.disabled = false;
        button.textContent = 'Run';
      });
    });
  }

  if (isSql) python.whenReady(() => python.ensure(['sqlite3']));   // SQLite before the first Run

  if (!python.isReady) {
    button.disabled = true;
    button.textContent = isSql ? 'Getting the database ready…' : isDax ? 'Getting DAX ready…' : isXl ? 'Getting Excel ready…' : isR ? 'Getting R ready…' : 'Warming up Python…';
    python.whenReady(() => {
      if (!button.isConnected || !rReady) return;
      button.disabled = false;
      button.textContent = 'Run';
    });
  } else if (mode === 'python' && !python.hasSeaborn) {
    toast("seaborn couldn't load offline, but pandas and matplotlib still work");
  }
}
