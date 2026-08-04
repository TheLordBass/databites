import { $, escapeHTML, ICON, toast } from '../ui.js';
import { python } from '../python.js';
import { PRELUDE } from '../curriculum/index.js';

const KEY = 'databites.sandbox';

const RECIPES = [
  ['Peek', 'cafe.head(8)'],
  ['Summary', 'cafe.describe().round(2)'],
  ['Top days', 'cafe.nlargest(8, "revenue")'],
  ['By city', 'cafe.groupby("city")[["cups", "revenue"]].mean().round(1)'],
  ['Histogram', 'import seaborn as sns\nsns.set_theme()\nsns.histplot(data=cafe, x="revenue", bins=20)\nplt.show()'],
  ['Scatter', 'import seaborn as sns\nsns.set_theme()\nsns.scatterplot(data=cafe, x="cups", y="revenue", hue="city")\nplt.show()'],
  ['Heatmap', 'import seaborn as sns\nsns.set_theme()\nsns.heatmap(cafe[["cups","price","revenue","rating"]].corr(), annot=True)\nplt.show()'],
];

export function renderSandbox(mount, ctx) {
  ctx.setTitle('Sandbox');
  mount.className = 'screen';

  const saved = localStorage.getItem(KEY) || 'cafe.head()';

  mount.innerHTML = `
    <div class="stack">
      <div>
        <div class="eyebrow">No rules here</div>
        <h1 class="h1">Sandbox</h1>
        <p class="muted" style="font-size:14.5px;margin:6px 0 0">
          <code>cafe</code>, <code>pd</code>, <code>np</code>, <code>plt</code> and
          <code>sns</code> are ready. Variables stick around between runs.
        </p>
      </div>

      <div class="snips" style="border:none;background:none;padding:0">
        ${RECIPES.map((r, i) => `<button class="snip" data-recipe="${i}">${escapeHTML(r[0])}</button>`).join('')}
      </div>

      <div class="editor-wrap">
        <div class="editor-bar">
          <span>Python</span>
          <button class="btn btn-sm btn-ghost" id="wipe" style="min-height:30px;padding:0 10px">Clear</button>
        </div>
        <textarea class="editor" id="code" spellcheck="false" autocapitalize="off"
          autocorrect="off" autocomplete="off" style="min-height:200px" aria-label="Python code"></textarea>
      </div>

      <button class="btn btn-go btn-block" id="run">${ICON.play}<span>Run</span></button>

      <div id="result"></div>
    </div>
  `;

  const editor = $('#code', mount);
  const result = $('#result', mount);
  editor.value = saved;

  editor.addEventListener('input', () => localStorage.setItem(KEY, editor.value));

  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end');
    }
  });

  mount.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-recipe]');
    if (!chip) return;
    editor.value = RECIPES[Number(chip.dataset.recipe)][1];
    localStorage.setItem(KEY, editor.value);
    run();
  });

  $('#wipe', mount).addEventListener('click', () => {
    editor.value = '';
    result.innerHTML = '';
    localStorage.setItem(KEY, '');
    editor.focus();
  });

  const button = $('#run', mount);
  let busy = false;

  async function run() {
    if (busy) return;
    busy = true;
    button.disabled = true;
    button.innerHTML = `${ICON.spark}<span>Running…</span>`;

    // fresh:false — this is a scratchpad, state should persist like a notebook.
    const out = await python.run({
      code: editor.value,
      key: 'sandbox',
      prelude: PRELUDE,
      fresh: false,
    });

    busy = false;
    button.disabled = false;
    button.innerHTML = `${ICON.play}<span>Run</span>`;

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
      parts.push(`<div class="out"><div class="out-head" style="color:var(--bad)">Error</div>
        <pre class="out-body is-err">${escapeHTML(out.error)}</pre></div>`);
    }
    if (!parts.length) parts.push(`<div class="chip">Ran fine — nothing to show</div>`);

    result.innerHTML = parts.join('');
  }

  button.addEventListener('click', run);

  if (!python.isReady) {
    button.disabled = true;
    button.innerHTML = `${ICON.spark}<span>Warming up Python…</span>`;
    python.whenReady(() => {
      if (!button.isConnected) return;
      button.disabled = false;
      button.innerHTML = `${ICON.play}<span>Run</span>`;
    });
  } else if (!python.hasSeaborn) {
    toast('seaborn is offline — pandas and matplotlib still work');
  }
}
