/* Take it with you: code from a lesson or the Sandbox as a Jupyter notebook or
   a .py script that runs as is in real Python — Jupyter, VS Code, Colab.

   The first cell is the same PRELUDE the app runs, so cafe, the shop and the
   rest are rebuilt from their seeds, value for value. SQL gets a small helper
   that loads those DataFrames into SQLite, as the app does. DAX has no export:
   its engine only exists inside DataBites. */

import { PRELUDE } from './curriculum/index.js';
import { saveFile } from './ui.js';

const SQL_HELPER = `import sqlite3

def run_sql(script):
    """Every DataFrame defined so far becomes a SQLite table (dates as ISO text,
    like DataBites). Runs the script and returns the last result as a DataFrame."""
    db = sqlite3.connect(":memory:")
    for name, value in list(globals().items()):
        if isinstance(value, pd.DataFrame) and not name.startswith("_"):
            table = value.copy()
            for column in table.columns:
                if pd.api.types.is_datetime64_any_dtype(table[column]):
                    table[column] = table[column].dt.strftime("%Y-%m-%d")
            table.to_sql(name, db, index=False)
    statements, buffer = [], ""
    for line in script.splitlines(keepends=True):
        buffer += line
        if sqlite3.complete_statement(buffer):
            statements.append(buffer.strip())
            buffer = ""
    if buffer.strip():
        statements.append(buffer.strip())
    result = None
    for statement in statements:
        cursor = db.execute(statement)
        if cursor.description:
            result = pd.DataFrame(cursor.fetchall(), columns=[c[0] for c in cursor.description])
    db.commit()
    return result`;

const SETUP_NOTE = 'The datasets, rebuilt from the same seeds DataBites uses. Run this first.';

const lines = (text) => text.split('\n').map((line, i, all) => (i < all.length - 1 ? `${line}\n` : line));

function codeCells(code, lang) {
  if (lang !== 'sql') return [['code', code.trim()]];
  return [
    ['code', SQL_HELPER],
    ['code', `result = run_sql("""\n${code.trim().replace(/"""/g, '\\"\\"\\"')}\n""")\nresult`],
  ];
}

export function notebook(title, about, code, lang) {
  const cells = [
    ['markdown', `# ${title}\n\n${about}\n\n*Made in DataBites. Runs as is in Jupyter, VS Code or Colab.*`],
    ['markdown', SETUP_NOTE],
    ['code', PRELUDE.trim()],
    ...codeCells(code, lang),
  ];
  return `${JSON.stringify({
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { name: 'python3', display_name: 'Python 3', language: 'python' },
      language_info: { name: 'python' },
    },
    cells: cells.map(([type, text], i) => ({
      id: `databites-${i + 1}`,
      cell_type: type,
      metadata: {},
      source: lines(text),
      ...(type === 'code' ? { outputs: [], execution_count: null } : {}),
    })),
  }, null, 1)}\n`;
}

export function script(title, about, code, lang) {
  const comment = (text) => text.split('\n').map((l) => `# ${l}`.trimEnd()).join('\n');
  const body = lang === 'sql'
    ? `${SQL_HELPER}\n\n\nprint(run_sql("""\n${code.trim().replace(/"""/g, '\\"\\"\\"')}\n"""))`
    : code.trim();
  return [
    comment(`${title}\n\n${about.replace(/`/g, '')}\n\nMade in DataBites. In a script only print() shows results:\na last line on its own shows nothing, so wrap it in print(...).`),
    '',
    `# ── ${SETUP_NOTE}`,
    PRELUDE.trim(),
    '',
    '# ── Your code',
    body,
    '',
  ].join('\n');
}

export const canTake = (lang) => lang === 'python' || lang === 'sql';

/** kind: 'ipynb' or 'py'. */
export function takeWithYou(kind, { name, title, about = '', code, lang }) {
  const text = kind === 'py' ? script(title, about, code, lang) : notebook(title, about, code, lang);
  const type = kind === 'py' ? 'text/x-python' : 'application/x-ipynb+json';
  return saveFile(`${name}.${kind}`, text, type);
}
