/* A finished project, written up as one standalone web page for a portfolio.

   Everything on it is the learner's own: the code they ran for each step
   (their saved draft, never the model answer), what it printed, and the
   chart it drew. Nothing is claimed that the page doesn't show being made. */

import { store } from './store.js';
import { escapeHTML, localDay, saveFile } from './ui.js';

const TOOL = { python: 'Python (pandas, matplotlib, seaborn)', sql: 'SQL', dax: 'DAX' };
const plain = (text) => escapeHTML(String(text).replace(/`|\*\*/g, ''));

export const writeupReady = (part) => part.lessons.every((l) => store.isDone(l.id) && store.draft(l.id));

export function writeupHTML(part) {
  const last = part.lessons[part.lessons.length - 1];
  const finding = (store.work(last.id) || {}).text || '';
  const tools = [...new Set(part.lessons.map((l) => TOOL[l.lang] || l.lang))].join(' · ');

  const steps = part.lessons.map((l, i) => {
    const work = store.work(l.id) || {};
    return `
  <section class="step">
    <p class="kicker">Step ${i + 1} · ${escapeHTML(TOOL[l.lang] || l.lang)}</p>
    <h2>${escapeHTML(l.title)}</h2>
    <p>${plain(l.task)}</p>
    <pre class="code"><code>${escapeHTML(store.draft(l.id) || '')}</code></pre>
    ${work.image ? `<img src="data:image/png;base64,${work.image}" alt="Chart from step ${i + 1}: ${escapeHTML(l.title)}">` : ''}
    ${work.text && work.text.trim() ? `<pre class="output">${escapeHTML(work.text.trim())}</pre>` : ''}
  </section>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHTML(part.name)}</title>
<style>
  :root { --paper: #faf7f0; --ink: #17140f; --ink-2: #524b44; --rule: #ddd5c5; --accent: #6a3f8e; }
  @media (prefers-color-scheme: dark) {
    :root { --paper: #16130f; --ink: #f4eee4; --ink-2: #a89f92; --rule: #3a322a; --accent: #c39be3; }
  }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.6 Georgia, "Times New Roman", serif; }
  main { max-width: 760px; margin: 0 auto; padding: 48px 22px 64px; }
  .kicker { margin: 0 0 6px; font: 600 12px/1.4 system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }
  h1 { margin: 0 0 10px; font-size: clamp(32px, 7vw, 52px); line-height: 1.05; }
  h2 { margin: 0 0 8px; font-size: 26px; line-height: 1.15; }
  .meta { margin: 0; font: 14px/1.5 system-ui, sans-serif; color: var(--ink-2); }
  .finding { margin: 36px 0; padding: 18px 20px; border-left: 6px solid var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
  .step { margin: 40px 0 0; padding-top: 28px; border-top: 1px solid var(--rule); }
  pre { margin: 14px 0 0; padding: 14px 16px; overflow-x: auto; border: 1px solid var(--rule); border-radius: 3px;
        font: 13px/1.55 ui-monospace, Consolas, monospace; white-space: pre; }
  .finding pre { border: none; padding: 0; background: none; white-space: pre-wrap; font-size: 14px; }
  img { display: block; width: 100%; height: auto; margin: 16px 0 0; background: #fff; border: 1px solid var(--rule); }
  footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid var(--rule); font: 14px/1.5 system-ui, sans-serif; color: var(--ink-2); }
</style>
</head>
<body>
<main>
  <p class="kicker">Data analysis project</p>
  <h1>${escapeHTML(part.name)}</h1>
  <p class="meta">${escapeHTML(tools)} · ${localDay()}</p>

  <section class="finding">
    <p class="kicker">The finding</p>
    <pre>${escapeHTML(finding.trim() || 'See the last step.')}</pre>
  </section>
${steps}
  <footer>Worked through step by step in DataBites. Every figure and chart on this page came from the code shown with it.</footer>
</main>
</body>
</html>
`;
}

export function saveWriteup(part) {
  const slug = part.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return saveFile(`${slug}.html`, writeupHTML(part), 'text/html');
}
