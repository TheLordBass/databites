# DataBites

Learn **pandas**, **matplotlib** and **seaborn** in 3-minute bites, on your phone.

Real CPython runs inside the page (Pyodide → WebAssembly). Your code and your
progress never leave the device. After the first load it works with no connection.

---

## Why it's built this way

Every design decision here is aimed at the "I want to learn this but I keep
bouncing off it" problem:

| Friction | What the app does |
| --- | --- |
| Deciding what to do | Home screen is **one button**: the next lesson |
| Setup before learning | Nothing to install — no Anaconda, no Colab, no login |
| Walls of text | Max 3 bullets per concept, then you type |
| Getting stuck → quitting | **Nudge me** → **Just show me the answer**, one tap, no penalty |
| Typing `["` on a phone | Tap-to-insert snippet bar under the editor |
| Losing your place | Everything resumes exactly where you left it |
| Learning 5 datasets at once | One home dataset (`cafe`) for the mechanics; new tables only where meeting unfamiliar data *is* the lesson |
| Boring linear order | "Surprise me" and "⚡ shortest bite" buttons |
| Broken streaks | The streak only moves when you *finish* something, and forgives one missed day |

---

## The design

Editorial, not dashboard. The rules, in case you extend it:

- **No cards.** Hairline rules (`--rule`) and whitespace separate things. If you
  find yourself adding a border-radius and a background to group content, use a
  rule and some space instead.
- **Type carries the hierarchy.** Instrument Serif for anything that announces
  itself (titles, big numbers, track names), IBM Plex Sans for reading, IBM Plex
  Mono for code. Nothing in between competes.
- **One accent, spent sparingly.** A printer's red. It marks the active tab, the
  concept bullets, the "Your turn" label and errors — nothing else. Each track
  overrides `--accent` with its own ink, drawn from one earthy family so six
  tracks never look like a rainbow.
- **Warm, never blue-black.** `#faf7f0` paper, `#16130f` at night. Both are real
  modes, driven by `prefers-color-scheme`.
- **No emoji in the interface.** Success is small-caps "That's it" and a serif
  `+28`, not confetti.
- **Numbers are set as folios**, zero-padded, the way a book numbers chapters.

Fonts come from Google Fonts and are cached by the service worker on first load,
so offline still works; every stack has a real local fallback.

## Run it on your computer

No Node, no Python, no build step needed.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8123>.

Opening `index.html` directly with `file://` will **not** work — ES modules and
service workers need a real `http://` origin.

---

## Get it on your Android phone

It's already live at **https://thelordbass.github.io/databites/**

Open that in Chrome on your phone → menu **⋮** → **Add to Home screen**. It then
opens full screen with no browser chrome, and the app's **You** tab offers a
one-tap install button whenever Chrome allows it.

To publish updates, just push — Pages redeploys itself:

```bash
git add -A && git commit -m "your change" && git push
```

The service worker serves the cached copy first, so a change shows up on the
**second** open, not the first. That is deliberate: it is what makes the app
open instantly and work offline.

> First launch downloads ~25 MB of Python runtime. Do it on wifi once; after
> that the service worker serves it from cache and the app opens offline.

---

## Intellisense

Every editor — lessons, practice and the sandbox — suggests as you type:
`cafe.` lists cafe's methods *and its columns*, `cafe["ci` offers `city`,
`sns.histplot(data=cafe, x="` offers cafe's columns, and inside a call the
signature sits above the line with the argument you're on underlined.

| Key | Does |
| --- | --- |
| ↑ / ↓ | move through the list |
| Enter or Tab | take the highlighted one (methods get their `()`, caret inside) |
| Esc | dismiss |
| Ctrl+Space | ask for suggestions anywhere |

On a phone, tap a suggestion. The keyboard stays up.

It is not Jedi. Suggestions come from the **live** Python namespace (`_complete`
in `js/worker.js`), which is why it knows your data's columns: after you run
code, the variables you made complete too. Nothing you type is executed to
work out a suggestion — expressions are resolved by walking names, attributes
and literal subscripts, a filter like `cafe[cafe.cups > 40]` is assumed to keep
cafe's shape, and only lazy calls (`groupby`, `rolling`, `resample`...) with
literal arguments are really made. A line like `busy = cafe[...]` above the
caret is enough for `busy.` to complete before you've run anything.

In practice problems, the function's arguments complete as the example input,
so `df.` inside `def solution(df):` lists that problem's real columns.

SQL gets the same treatment: after `FROM` or `JOIN` it offers the tables;
elsewhere the columns of the tables the query reads (it looks past the caret,
since `SELECT` is typed before the `FROM` that names the table), including
aliases (`c.` lists cafe's columns after `FROM cafe c`) and `WITH` steps.
Inside `WHERE city = '` it offers the values that column really holds.
Keywords come back in whichever case you're typing, and `ROUND(` shows its
arguments.

## SQL

SQL runs in SQLite — Python's own `sqlite3`, which Pyodide fetches (small)
the first time an SQL lesson or problem runs. There's no separate database
to maintain: on each run the worker builds one from the namespace, turning
every DataFrame into a table of the same name. So the SQL track queries the
very `cafe` the pandas lessons use. Dates are stored as ISO text
(`'2024-01-31'`), which is what SQLite's date functions expect.

The **Sandbox** has a Python | SQL | DAX switch. All three modes share one
workspace, so a DataFrame you make in Python mode is a table in SQL mode
(reassign it and the table is replaced), tables you `CREATE` in SQL stay put
between runs, and DAX measures stay defined for the next DAX run. Each mode
keeps its own draft and its own recipes.

An SQL lesson's editor holds SQL (`lang: 'sql'` on the track, overridable per
lesson). Its check calls `_same_as(reference_sql)`: the learner's last
result must match the reference's, rows in any order unless you pass
`ordered=True`. The failures are worded as the next thing to try — wrong
columns ("AS names a column"), wrong row count, right rows in the wrong
order. SQLite's own errors get a second line too: *Did you mean revenue?*,
*text values go in single quotes*, *filter groups with HAVING*.

## DAX

The DAX track runs on a small DAX engine written for this app,
`js/dax.py`, which the worker fetches the first time anything DAX runs. It
is **not** Microsoft's engine, and it does not try to be all of DAX. It
covers what a learner meets first:

- measures, filter context and row context, and context transition
- `CALCULATE` with `ALL`, `ALLEXCEPT` and `KEEPFILTERS`
- the `X` iterators, `RELATED` and `RANKX`
- time intelligence on a calendar table treated as Power BI's "marked" date table

A known gap: a whole data table used as a `CALCULATE` filter, like
`CALCULATE(DISTINCTCOUNT(orders[customer_id]), order_items)`, filters only that
table. It does not reach the lookup tables through it, as Power BI's expanded
tables do. Column filters, `FILTER` and `SUMMARIZE` over related columns all work.

Every lesson's answer was checked against the same numbers worked out
separately in pandas.

The model is the shop plus `cafe`, with a generated `calendar`. The links run
order_items → orders → customers → cities, order_items → products, and
orders / cafe → calendar. Relationships are many-to-one and filter one way,
from the lookup side to the data side, as in a default Power BI model. So,
just as in Power BI, `COUNTROWS(orders)` stays the same on every row of a
matrix by product category.

A lesson's editor holds measure definitions such as `Total Sales = ...`,
each starting at the left edge. Indented lines continue the measure above.
The lesson's `rows:` sets the column its matrix is split by. Checks call
`_dax_expect(measure, reference, helpers={...}, uses=[...])`, and the measure
must match the reference both overall and in every row. The reference only
uses its own helper measures, never the learner's, so a wrong `[Sales]`
can't hide a wrong answer.

DAX practice problems (`js/practice/more-dax.js`) name a `measure`, a
`reference` expression with optional `helpers`, and `layouts`: the matrices
it is tested in, such as `[]` for the total, `['products[category]']`, or two
columns crossed. The hidden tests are those layouts. Every cell and total of
each one must match. **Run** tries only the first layout. In a cell, BLANK
and 0 count as the same, as `BLANK() = 0` does in DAX. The learner's script
is not run on its own there (`_DAX_EXEC = False`); `_judge_dax` evaluates
it layout by layout.

## Practice problems

The **Practice** tab is LeetCode-style: no teaching and no starter code. You
write `def solution(...)`, and it's judged against **hidden** inputs,
including the edge cases the problem is really about — ties, missing values,
empty results, boundaries. **Run** tries your function on the visible example;
**Submit** runs the hidden tests and, on failure, shows exactly which case
broke: its input, the expected output, and what you returned.

124 original problems: 50 in Python and 50 in SQL, each split 18 easy,
20 medium, 12 hard, and 24 in DAX (9 easy, 9 medium, 6 hard), with a filter
for each language. They live in `js/practice/problems.js`, `more-python.js`,
`more-sql.js` and `more-dax.js`; `problems.js` merges them and sorts Python,
then SQL, then DAX, easy before hard. A run that goes over 12
seconds — nearly always a loop that never ends — is stopped as *Time limit
exceeded*, and the Python worker restarts itself rather than hanging.

Problems live in `js/practice/problems.js`. Each one gives Python for:

| Name | Purpose |
| --- | --- |
| `_ref(...)` | the reference answer. Its parameter names label a failing case (`orders =`, `menu =`) |
| `_example()` | the visible example, as a tuple of arguments. The description renders it from `_ref`, so it can't drift |
| `_cases()` | the hidden tests — a list of argument tuples. Put the trap in here |

`mode` sets how answers are compared: `frame` (columns and rows in any
order), `frame_ordered` (rows in order), `frame_strict` (column order too),
`scalar` or `list`. Setup runs in a private namespace, so a solution can't
simply call `_ref`.

**SQL problems** set `lang: 'sql'` and define `_ref_sql` (the reference
query) instead of `_ref`. `_example()` returns a dict of `{table name:
DataFrame}` and `_cases()` a list of them; the judge loads each case into its
own fresh SQLite database and runs both queries there. Column names are
compared without regard to case.

Two optional lists keep the tests honest:

- `alt` — other correct answers. The tests must **accept** them, which catches
  tests that only allow one way of writing it.
- `wrong` — tempting wrong answers (`>=` instead of `>`, an inner join that
  drops the quiet customers). The tests must **reject** them, which proves the
  hidden cases actually exercise the trap.

Check all of it from the console:

```js
const P = await import('/js/practice/problems.js');
const { python } = await import('/js/python.js');
const judge = (p, code) => python.run({ code, key: 'pt', lang: p.lang, prelude: P.preludeFor(p),
                                        needs: P.needsFor(p), check: P.judgeCode(p, true),
                                        timeoutMs: 20000 });
for (const p of P.PROBLEMS) {
  if (!(await judge(p, p.solution)).judge?.ok) console.error('solution fails:', p.id);
  if ((await judge(p, p.stub)).judge?.ok)      console.error('stub passes:', p.id);
  for (const a of p.alt || [])   if (!(await judge(p, a)).judge?.ok) console.error('alt rejected:', p.id);
  for (const w of p.wrong || []) if ((await judge(p, w)).judge?.ok)  console.error('wrong accepted:', p.id);
}
console.log('done');
```

## Adding your own lessons

Lessons are plain objects. Drop one into `js/curriculum/pandas.js` (or
`matplotlib.js` / `seaborn.js`) and it appears in the app immediately:

```js
{
  id: 'pd-14',                    // must be unique
  mins: 3,                        // drives XP and the "shortest bite" button
  title: 'Renaming columns',
  concept: [                      // 2–3 lines. **bold** and `code` work.
    '`.rename(columns={...})` gives columns better names.',
  ],
  starter: 'cafe.rename(columns={"cups": "units"}).head()',
  task: 'Rename `revenue` to `sales`.',
  hint: 'Pass `{"revenue": "sales"}` to `columns=`.',
  solution: 'renamed = cafe.rename(columns={"revenue": "sales"})\nrenamed.head()',
  check: `assert "sales" in renamed.columns, "No sales column yet."`,
}
```

**Writing a `check`:** it's Python, run in the same namespace as the learner's
code right after it. Raise `AssertionError` with the message you want shown:

```python
assert "busy" in globals(), "Make a variable called busy."
```

Three extras are injected for you:

| Name | What it gives you |
| --- | --- |
| `_out` | everything the code printed, as a string |
| `_axes()` | list of every matplotlib `Axes` currently drawn |
| `_labels()` | all chart text (title, axis labels, legend), lowercased |

Write the message as the **next thing to try**, never as a verdict —
`"Some rows in busy have 45 cups or fewer."` beats `"Wrong."`

### Check both directions

A lesson is only correct if the solution passes **and** the starter fails.
Paste this into the browser console on any screen:

```js
const cur = await import('/js/curriculum/index.js');
const { python } = await import('/js/python.js');
for (const L of cur.ALL_LESSONS) {
  const o = { prelude: cur.lessonPrelude(L), check: L.check, needs: L.needs || [], lang: L.lang };
  const s = await python.run({ ...o, code: L.solution, key: 'S'+L.id });
  const t = await python.run({ ...o, code: L.starter,  key: 'T'+L.id });
  if (!s.ok || !s.check?.passed) console.error('solution fails:', L.id, s.error || s.check?.msg);
  if (t.check?.passed)           console.error('starter is a freebie:', L.id);
}
console.log('done');
```

---

## The curriculum

160 lessons across 9 tracks — 100 in Python, 35 in SQL, 25 in DAX — plus 124 practice problems (50 in Python, 50 in SQL, 24 in DAX). The topic order follows *Python for Data Analysis*
(Wes McKinney, 3rd ed.) as a syllabus — chapters 5–13 — but every lesson,
example and exercise here is original and written against the `cafe` dataset.

| Track | Lessons | Covers |
| --- | --- | --- |
| pandas | 25 | DataFrames, Series, filtering, groupby, `loc`/`iloc`, `.str`, `apply`/`map`, binning, missing data, `read_csv`, `query`, method chains with `assign`, `np.where`, `cumsum`/`rank`, shares with `value_counts(normalize=True)` |
| messy data | 10 | unfamiliar tables, bad column names, text that only looks the same, numbers stored as text, mixed date formats, yes/y/YES, duplicates, regex extraction, "missing" spelled as text, a full clean from start to finish |
| wrangling | 15 | `merge` and join types, `concat`, duplicates, `melt`, `stack`/`unstack`, `transform`, `crosstab`, melt → merge → groupby on wide data; then the shop in pandas — many-to-one merges with `validate`, three-table totals, `indicator=True` anti-joins, a category × month pivot |
| time series | 10 | datetime index, `resample`, `rolling`, `shift`/`pct_change`, `.dt` features, `ewm`, a full year of weather, counting the empty days |
| matplotlib | 15 | figure/axes, bar, scatter, hist, legends, subplots, annotation, `.plot()`, styling, `twinx`, sorted horizontal bars, stacked bars, error bars |
| seaborn | 15 | themes, `hue`, categorical plots, heatmaps, facets, `pairplot`, `regplot`, violins, KDE, strip-over-box, `catplot` panels, `jointplot` |
| analysis | 10 | the capstone — framing, profiling, outliers, correlation, `polyfit`, statsmodels OLS, scikit-learn, the final chart, and whether the winner wins every month |
| SQL | 35 | `SELECT`/`WHERE`, `NULL`, `ORDER BY`, aggregates, `GROUP BY`/`HAVING`, `CASE`, dates, joins and `LEFT JOIN`, subqueries, `WITH`; then the four-table shop — multi-table joins, `COUNT(DISTINCT)`, anti-joins, `EXISTS`, `UNION`, conditional counts, date gaps, `CREATE TABLE AS`; window functions (`RANK`, running totals, `LAG`, share of total), and `pd.read_sql` back into pandas; then `INSERT`, `UPDATE`, `DELETE`, text functions and `ROW_NUMBER` for the latest row per group |
| DAX | 25 | measures, `SUMX` and `RELATED`, one-way filter flow, `CALCULATE`, `KEEPFILTERS`, `ALL` for shares, `FILTER` and context transition, `AVERAGEX`, `VAR`/`RETURN`, `RANKX`, `TOTALYTD`, `DATEADD` growth; BLANK and `COALESCE`, `SWITCH(TRUE())`, `SELECTEDVALUE`, `HASONEVALUE` totals, `CONCATENATEX`; `MAXX` and context transition, `VALUES` as a filter, `TOPN` in `CALCULATE`, rolling `DATESINPERIOD`, two fact tables on one lookup |

### Lazy-loaded packages

scipy, statsmodels and scikit-learn are **not** in the boot download — they
would roughly double it. A lesson declares what it needs:

```js
{ id: 'an-08', needs: ['scikit-learn'], … }
```

The worker fetches those on that lesson's first run (a few seconds), the lesson
card warns about it up front, and the Run button reports progress. After that
the service worker has them cached.

## The dataset

Every lesson uses the same 120 rows, generated in `js/curriculum/prelude.js`:

```
date     datetime   one row per day, Jan–Apr 2024
city     text       Lagos, Nairobi or Accra
drink    text       latte, espresso, cold brew, tea
cups     int        cups sold that day
price    float      price per cup
revenue  float      cups × price
rating   float      customer rating — has 9 missing values
```

A second table, `cities`, holds city / country / population. **Kigali** appears
in it but never in `cafe` — that deliberate gap is what makes inner vs outer
joins visible in the wrangling track.

**The shop** is four linked tables for the SQL track — the café's online
store: `customers` (40, two with no city, six who never ordered), `orders`
(150, January to June 2024, delivered / shipped / cancelled), `order_items`
(what was in each order) and `products` (12, one of which — the tote bag —
has never sold). It has its own random generator and comes after everything
else in the prelude, so it can't shift a single value in `cafe`.

Lessons get a **fresh** copy on every run, so a mistake can never poison the
next attempt. The Sandbox is the opposite — state persists, like a notebook.

---

## Layout

```
index.html              app shell
sw.js                   offline caching
manifest.webmanifest    home-screen install
serve.ps1               local dev server
css/styles.css          the whole design system
js/
  main.js               hash router + boot
  python.js             main-thread handle on the worker
  worker.js             Pyodide + the Python execution/check runtime
  store.js              progress, XP, streak (localStorage)
  ui.js                 DOM helpers
  screens/              home, tracks, lesson, sandbox, you
  curriculum/           prelude + the three tracks
```

**Upgrading Python:** `PYODIDE_VERSIONS` at the top of `js/worker.js` is a
fallback list — the first version that exists on the CDN wins. Add a newer one
to the front to upgrade.
