# DataBites

Learn **Python** (pandas, matplotlib, seaborn, AI with scikit-learn, and algorithms), **SQL** and **DAX** in 3-minute bites, on your phone.

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
| Broken streaks | The streak only moves when you *finish* something, and spare days (you start with one, a big day earns another, up to two) cover missed days |

---

## The design

Editorial, not dashboard, and set in a cafe: the cafe's print (a menu board,
a loyalty card, a stamp) rather than coffee photos, chalkboards or brown
everywhere, which would cost the contrast and the loud blocks the app relies
on to hold attention. The rules, in case you extend it:

- **No cards.** Hairline rules (`--rule`) and whitespace separate things. If you
  find yourself adding a border-radius and a background to group content, use a
  rule and some space instead.
- **Type carries the hierarchy.** Fraunces for anything that announces
  itself (titles, big numbers, track names), IBM Plex Sans for reading, IBM Plex
  Mono for code. Nothing in between competes.
- **One accent, spent sparingly.** Coffee-cherry red. It marks the active tab,
  the concept bullets, the "Your turn" label and errors — nothing else. Each
  track overrides `--accent` with its own ink, drawn from one earthy family so
  fifteen tracks never look like a rainbow.
- **Warm, never blue-black.** Crema paper `#f9f3e9` and espresso ink `#1f1712`;
  at night, espresso `#17110d` paper and crema type. Both are real modes, driven
  by `prefers-color-scheme`, and every grey clears 4.5:1 on all three papers.
- **Progress is a loyalty card.** `tally()` draws round stamps, punched in sets
  of five, filled ones with a stamp's ring: a row on lists, two rows of ten on a
  track page, tiny ones in the You ledger. Past its `max`, a stamp stands for a
  few lessons; the first fills on any progress and the last only when it's all
  done.
- **Lists read like a menu board.** A dotted leader runs from a lesson or track
  name to its number, the way a menu runs from a drink to its price (CSS only:
  `::after` with `order`).
- **No emoji in the interface.** Success is one slim green row under your
  output: small-caps "That's it", and a serif `+28` that pops in and counts up.
  A short burst of coffee beans goes with it, with a few paper scraps in the
  tracks' inks (`confetti()` in `ui.js`): bigger for a finished track, a project,
  a hard problem, a boss or a special, and none at all when the device asks for
  reduced motion. PL-300 practice gets a smaller burst from the "Right" box when
  you check a right answer (more for choose-two and put-in-order); never during
  a mock.
- **Cafe words, never at the cost of clarity.** Today's special, Refills (with a
  line underneath saying they're lessons coming back so they stick), "The
  usual?" over the next lesson. Anything a cafe word would hide stays plain.
- **Numbers are set as folios**, zero-padded, the way a book numbers chapters.
- **The icon** is a cup whose steam is a rising bar chart (`icons/icon.svg`;
  `icon-maskable.svg` is the cropped-safe version Android uses). The PNGs are
  rendered from them with headless Edge.

The fonts are the app's own files, in `fonts/` (latin and latin-ext only), and
the service worker keeps them with the rest of the shell, so offline still
works and no font request goes to a third party. Every stack has a real local
fallback.

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

It's already live at **https://ibomenobasiekanem.com/databites/** (the old
address, thelordbass.github.io/databites, redirects there).

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

## Staying with it

- **The game layer** (`js/game.js`), borrowed from Boot.dev where it helps
  learning:
  - *Today's special* (a quest, in the code): Home offers three goals a day (an easy, a medium and a
    hard one: finish lessons, solve a problem, do the recalls, answer PL-300
    questions, pass lessons first try). Pick one; it can't be swapped. Finish
    it for 25, 40 or 60 bonus XP.
  - *First-try runs*: a new lesson or problem passed with no failed run, no
    nudge, no smaller step and no peek at the answer extends the run; anything
    else starts it again. Every 5 in a row is worth 15 XP.
  - *Spare days*: each covers one missed day of the streak. Everyone starts
    with one; a big day (3 new lessons or problems) earns another, up to two.
    They replaced a hidden one-day forgiveness, and You says how many you have.
  - *Ranks*: a title per band of levels, Intern to Chief Data Officer (all
    the lessons lands around level 15).
  - *Achievements*: 31, all listed on You with how to earn each, tied to real
    skills (first join, first CALCULATE, a stage of the path) and habits
    (streaks, specials, recalls, runs). Ones earned before they existed unlock
    quietly at start-up, once.
  - *Stage bosses*: the end of each stage of the path, on Tracks: the lessons
    that close each of its steps, 3 or 4 of them, cold (the test-out
    machinery, `kind: 'boss'`). Unlocked by finishing the stage; worth 100 XP.

  Deliberately left out: loot chests, gems and a shop (random rewards are a
  slot machine, and with ADHD they become the thing you chase), and
  leaderboards and leagues (they need accounts, and ranking against strangers
  puts beginners off). Everything is local, in the store, and goes into the
  progress file. Screens call `after()` when something is finished and show
  the notes it returns under the reward.
- **A learning path.** Tracks shows every track as a numbered step, in the
  order to take them, under seven stages: Start here, Ask questions (pandas,
  then SQL straight after it), Clean, reshape and chart, Find the story,
  Report in Power BI, Put it together and Go further. The step you're on says which lesson is next. The Python course
  is split: its first seven parts (all pandas needs) come first, and parts 8
  to 16 come back before AI and Algorithms, so nobody does eighty lessons of
  plain Python before touching data. Home's "what's next" and the button
  after a lesson walk the same path ("On to pandas" at the end of part 7).
  It lives in `TRACK_GROUPS` in `curriculum/index.js`; tests.html checks it
  takes in every lesson exactly once.
- **Test out.** Every unfinished part of a track, apart from Projects, offers
  "Know these already? Test out": the part's last two lessons, cold (no
  teaching, hints or answer; route `lesson/<id>/test`). Pass both and every
  lesson in the part is marked done, with XP only for the two actually solved.
  State lives in `store.testOut`.
- **See what you made.** Code that ends by storing something (`busy = ...`,
  `cafe["tip"] = ...`) prints nothing, so the result shows what's in it,
  under "What's in busy now". In lessons, problems and the Sandbox; worked out
  after the check (`_echo_stored()` in `worker.js`), so it never counts as
  printed output. Numbers show as `4303`, not numpy 2's `np.int64(4303)`.
- **See another way.** After a lesson or problem passes, the model answer is
  one tap away, with the lines yours didn't have marked. It's hidden when
  yours already matches.
- **In other databases.** SQL lessons where SQLite differs from PostgreSQL,
  BigQuery or SQL Server carry a `dialects` list, shown folded under the
  concept: `LIMIT` vs `TOP`, integer division, date functions, date
  differences, `CREATE TABLE AS`, text joining, `QUALIFY` and `DISTINCT ON`.
- **This week.** You shows the last seven days as bars, with one line: lessons,
  problems, active days, the busiest track. It comes from `store.log`, which was
  seeded once from existing finish dates.
- **Make it work offline.** You downloads every optional engine (SQLite,
  statsmodels, scikit-learn, scipy, the DAX engine) in one go, so every lesson
  works without a connection.
- **Keyboard and screen readers.** `?` outside a text box (or You → How this
  works) lists the shortcuts in a native `<dialog>`. Results are announced
  (`aria-live`), focus moves to each new screen, the current tab is marked
  `aria-current`, and charts have real alt text.
- **Just 5 minutes.** One button on Home builds today's steps: a due recall,
  the next lesson, and the easiest open problem in that lesson's language.
  They're walked in order, with a step counter and a skip, and nothing to
  choose. State lives in `store.session`; the flow is in `js/session.js`.
- **Trouble spots.** Failed lesson runs and failed practice submits are
  counted. Anything tried three or more times is listed on You, and such a
  lesson's first recall comes the next day and goes to the front of the
  queue. A clean recall, or a solve without peeking, clears it.
- **Plain-English errors.** Python errors end with a Tip worked out from the
  real workspace: "There's no column called 'Revenue'. Did you mean
  'revenue'?", `.grupby` → `.groupby`, `cafe.Revenue` → brackets, `=` for
  `==`, `and`/`or` on pandas conditions, indentation, unclosed brackets, a
  missing colon, text without quotes, a misspelt dict key, text `+` a number,
  a library the app doesn't have. See `_hint()` in `worker.js`. The Sandbox
  fetches scikit-learn, scipy, statsmodels and SQLite the first time code
  imports one, the way a lesson's `needs` does.
- **A daily reminder.** You → A daily reminder downloads an `.ics` file with a
  5-minute event every day and an alert. The calendar does the nudging,
  which a web app can't do reliably on a phone.
- **Display.** You → Display: Light, Dark or Like my device, and three text
  sizes. `index.html` applies the choice before first paint. Dark colours live
  twice in the CSS — in the media query and under `[data-theme="dark"]` — so
  change both together. Text size zooms each screen's content, since the
  stylesheet is in px.
- **Refills (quick recall).** A finished lesson comes back on Home 2, 7 and 21 days
  later, as its task alone: the starter code, with the teaching folded away.
  Three a day at most, so a backlog never turns into a wall; "Not today"
  leaves it due. State lives in `store.reviews`; the route is `lesson/<id>/review`.
- **A smaller step.** After three failed runs in a row, a lesson offers its
  answer as a scaffold. Keywords and function names stay, and anything the
  starter didn't already contain is blanked to `___`. When that leaves no
  gaps (an answer made only of names the starter had), every new line is
  blanked instead, so it's never the whole answer. See `skeleton()` in
  `lesson.js`, which uses the tokenizer in `highlight.js`.
- **Keep your progress safe.** Progress lives in the browser. The app asks the
  browser to keep it (`navigator.storage.persist()`), and You → Keep your
  progress safe saves it to a JSON file and loads one back. Loading merges:
  finished lessons are combined, XP and best streak take the higher value, and
  nothing on the device is removed. There's no server, by choice.
- **Your own data.** Sandbox → Load a CSV of your own reads a file into the
  shared workspace as a DataFrame named after the file, so it's a table in
  Python, SQL and DAX alike. The delimiter is detected, and ISO-looking date
  columns become dates. It lasts until the app closes, and the file never
  leaves the device.
- **Matrices.** DAX results come back as data (`result.blocks`) as well as
  text, and are drawn as real tables: numbers on the right, BLANK as an empty
  cell, and the total row set apart. In the Sandbox, *Matrix rows* picks what
  the measures are split by.
- **Take it with you.** Python and SQL lessons, and the Sandbox, download the
  code in the editor as a Jupyter notebook or a `.py` script (`js/export.js`).
  The first cell is the same `PRELUDE` the app runs, so the datasets come back
  value for value in Jupyter, VS Code or Colab. SQL gets a `run_sql()` helper
  that loads every DataFrame into SQLite. DAX has no export, because its engine
  only exists here.
- **Interview set.** Practice → Interview set: one SQL, one Python and one DAX
  problem, medium or harder, and a 20-minute clock that keeps running if you
  leave (`store.interview`, the `interview` route). Problems in the set show
  the time left, and the end shows solve times.
- **Project write-ups.** Finish a project and its track page offers a
  standalone HTML page for a portfolio (`js/writeup.js`): the finding, then
  each step's own code (the learner's saved draft, never the model answer),
  what it printed and its chart (`store.work`, saved when a project step passes).
- **Charts beside matrices.** In the Sandbox, a DAX matrix gets bars for its
  first measure underneath.
- **Syntax colouring.** `js/highlight.js` keeps the textarea as the real input
  (caret, selection, undo and phone keyboards stay native), makes its text
  transparent, and draws a coloured copy in a `<pre>` exactly underneath.
  Anything that sets `editor.value` recolours too, because that element's
  setter is patched.

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

A whole table used as a `CALCULATE` filter, like
`CALCULATE(DISTINCTCOUNT(orders[customer_id]), order_items)`, brings its lookup
tables along, as Power BI's expanded tables do. It stops at a blank key, which
in Power BI belongs to the lookup's blank row. Calculated columns
(`Table[Column] = ...` at the left edge) are worked out row by row before any
measure, and checked in lessons with `_dax_expect_column(table, column, reference)`.

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

## PL-300 prep

For the Power BI Data Analyst exam (PL-300): Practice → PL-300 prep, or the
card with the Power BI tracks. It has 107 original exam-style questions across
the four areas the exam measures (Prepare the data, Model the data, Visualize
and analyze, Deploy and maintain), in the exam's kinds of question:

- **Choose one** and **choose two**.
- **Put in order**: tap the steps into numbered slots, first to last; tap a
  placed step to take it out. Some lists include a step that doesn't belong,
  as the real exam's do. Marked slot by slot: right place, wrong place, not a step.
- **Case studies**: a scenario (overview, existing environment, requirements)
  and five questions that only make sense with it. The scenario opens on the
  first question and stays one tap away. Five of them, each leaning on
  different skills:

  | Case | Covers |
  |---|---|
  | Kettle & Grind | Gateways, DirectQuery, unpivot, apps |
  | The online store | A second date, incremental refresh, deployment pipelines |
  | Harbour Roasters | Folder sources, date locales, parameters, dataflows |
  | Riverside Deli | Dynamic RLS, sensitivity labels, subscriptions, alerts |
  | Sunrise Bakery | Last year, year to date, share of region, growth |

None is taken from the real exam, which is under NDA; they're set in the app's
own shop and cafe. The screen says it isn't affiliated with Microsoft, and
points to the current skills outline on Microsoft Learn.

- **10-question practice**, mixed or by area. After each answer you get the
  explanation, and where a lesson practises the same idea, a "Try it hands-on"
  link to it. Questions you got wrong come first next time, then ones you
  haven't seen.
- **Case studies** from the overview, one scenario at a time.
- **Mock exam:** 35 questions (10 / 10 / 10 / 5 by area) then a whole case
  study, 40 in all, in 80 minutes, with no feedback until it's marked. Then a
  score by area and a review of every miss. The clock keeps running if you
  leave; a mock that runs out while you're away is marked when you come back.
- **By area** on the overview: the share right of what you've tried, per area.

Questions live in `js/exam/pl300.js` as `{ id, domain, topic, type: 'single' |
'multi' | 'order', stem, options, answer, why, lesson?, case? }`: a multi
question says "Choose two."; an order question lists its steps in `answer`,
first to last, and says "in order"; a question with `case` belongs to one of
`CASES` and only appears after its scenario. `tests.html` checks every
question's and case's shape (ids, answer indices, wording, lesson links, that
cases and their questions point at each other) on each run. State lives in
`store.exam`; the routes are `exam` (overview) and `quiz` (the set in progress).

## Practice problems

The **Practice** tab is LeetCode-style: no teaching and no starter code. You
write `def solution(...)`, and it's judged against **hidden** inputs,
including the edge cases the problem is really about — ties, missing values,
empty results, boundaries. **Run** tries your function on the visible example;
**Submit** runs the hidden tests and, on failure, shows exactly which case
broke: its input, the expected output, and what you returned.

139 original problems: 50 in Python and 50 in SQL, each split 18 easy,
20 medium, 12 hard; 24 in DAX (9 easy, 9 medium, 6 hard); and 15 algorithm
problems in Python (5 easy, 6 medium, 4 hard: sets, sliding windows, stacks,
binary search, dynamic programming, breadth-first search, topological sort).
There's a filter chip for each language, and one for **Algorithms**, which
filters on the `algorithms` tag. They live in `js/practice/problems.js`,
`more-python.js`, `algorithms.js`, `more-sql.js` and `more-dax.js`;
`problems.js` merges them and sorts Python, then SQL, then DAX, easy before
hard. Just 5 minutes picks an algorithms problem when your next lesson is on
the Algorithms track, and a data problem otherwise. A run that goes over 12
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

**Write for someone who has never coded.** Every track can be someone's
first, so:

- Explain a term the first time a track uses it, in everyday words:
  "a single column on its own is called a **Series**", "a `name=value`
  inside the brackets is a setting".
- Say what a thing does before how: "`groupby` answers per-city questions"
  before the syntax.
- Keep other tracks out of it: SQL and DAX lessons don't lean on pandas.
- In tasks, hints and check messages, say what to type. Avoid "argument",
  "boolean", "parse", "unpack", "aggregation", "chain the fixes".

### Check both directions

A lesson is only correct if the solution passes **and** the starter fails. A
practice problem is only correct if its solution and every `alt` pass, and its
stub and every `wrong` answer fail.

Open **`tests.html`** and press Run. It isn't linked from the app or cached
for offline. It checks all of them in one worker session, DAX first so a clash
between the languages' helpers shows up. Then it lists every failure and the
ten slowest checks. Filter by language or id prefix to check just what you
changed. The whole set takes about ten minutes.

---

## The curriculum

370 lessons across 15 tracks — 285 in Python (including an 80-lesson Python course, 20 of messy data, 35 of statistics, 20 of AI and 40 of algorithms), 35 in SQL, 35 in DAX (25 on measures, 10 on Power BI modelling), and 15 in three projects — plus 139 practice problems (50 in Python, 15 algorithm problems, 50 in SQL, 24 in DAX). The topic order follows *Python for Data Analysis*
(Wes McKinney, 3rd ed.) as a syllabus — chapters 5–13 — but every lesson,
example and exercise here is original and written against the `cafe` dataset.

The AI track follows *Artificial Intelligence Programming with Python: From
Zero to Hero* (Perry Xiao, Wiley, 2022) the same way: chapters 3, 4, 5, 7 and
10 as a syllabus, every lesson original. The book's deep-learning frameworks
(TensorFlow and Keras, OpenCV, YOLO, face recognition, GANs, transformers)
can't run in the browser, so networks are built by hand in numpy, or with
scikit-learn's own `MLPClassifier`. "Take it with you" exports a lesson to
Colab for going further.

Later parts were planned from a shelf of Python books, again used only as
a syllabus, never as text. The Python course's newer parts follow *Think
Python* (3rd ed.), *Introducing Python* (3rd ed.), *Learning Python* (6th
ed.), *Professional Python* and *Job Ready Python*. Messy data's quality and
file parts follow *Practical Python: Data Wrangling and Data Quality*. AI's
"Better models" follows *Python for Data Science For Dummies* (3rd ed.), and
Algorithms' "Making it faster" follows *High Performance Python* (3rd ed.).
*Python Polars: The Definitive Guide* was looked at too, but polars doesn't
run in the browser's Python yet, so it has no track.

| Track | Lessons | Covers |
| --- | --- | --- |
| Python course | 80 | the language itself, from nothing: `print` and maths, variables, text, True/False, lists, calling functions, methods, dicts, `if`, `for`; then ints and floats, slicing, f-strings, `split`/`join`; `range`, `while`, `break`/`continue`, nested loops, `enumerate`/`zip`; changing lists, copies versus the same list, tuples, comprehensions; dicts in depth, records, sets, nested data; writing functions, `*args`, scope, lambdas, docstrings and type hints; reading errors, `try`/`except`, `raise`, files; `csv`, `json`, `datetime`, the standard library, a small program; classes, methods, `__repr__`, inheritance, dataclasses; `iter`/`next`, generators, `any`/`all`, decorators, `*`/`**` unpacking; regular expressions (`findall`, classes, groups, `fullmatch`, `sub`). Woven in between: conditional expressions and truthiness, `match`, `Counter`, `defaultdict`, `namedtuple`; `__eq__`/`__lt__`, `__len__`/`__contains__`/`__iter__`, `__add__`, properties with setters, classmethods; your own exceptions and `else`, context managers with `contextlib`, tests that catch broken versions, `doctest`, `unittest`; and to finish, small programs: word counts, bigrams, a Markov chain that writes, a banded tax calculator, and ETL into SQLite. Its first 10 lessons are a primer (`track.primer`): once you've done lessons elsewhere, Home skips those, but not the rest |
| pandas | 25 | DataFrames, Series, filtering, groupby, `loc`/`iloc`, `.str`, `apply`/`map`, binning, missing data, `read_csv`, `query`, method chains with `assign`, `np.where`, `cumsum`/`rank`, shares with `value_counts(normalize=True)` |
| messy data | 20 | unfamiliar tables, bad column names, text that only looks the same, numbers stored as text, mixed date formats, yes/y/YES, duplicates, regex extraction, "missing" spelled as text, a full clean from start to finish; then data quality: rules every row should follow, totals that don't add up, IQR outliers, near-miss spellings with `difflib`, a health report function; and files that fight back: fixed width with `read_fwf`, spreadsheet day counts as dates, junk lines and thousands commas in `read_csv`, nested JSON with `json_normalize`, and whether the data covers the dates you need |
| wrangling | 15 | `merge` and join types, `concat`, duplicates, `melt`, `stack`/`unstack`, `transform`, `crosstab`, melt → merge → groupby on wide data; then the shop in pandas — many-to-one merges with `validate`, three-table totals, `indicator=True` anti-joins, a category × month pivot |
| time series | 10 | datetime index, `resample`, `rolling`, `shift`/`pct_change`, `.dt` features, `ewm`, a full year of weather, counting the empty days |
| matplotlib | 15 | figure/axes, bar, scatter, hist, legends, subplots, annotation, `.plot()`, styling, `twinx`, sorted horizontal bars, stacked bars, error bars |
| seaborn | 15 | themes, `hue`, categorical plots, heatmaps, facets, `pairplot`, `regplot`, violins, KDE, strip-over-box, `catplot` panels, `jointplot` |
| analysis | 10 | the capstone — framing, profiling, outliers, correlation, `polyfit`, statsmodels OLS, scikit-learn, the final chart, and whether the winner wins every month |
| SQL | 35 | `SELECT`/`WHERE`, `NULL`, `ORDER BY`, aggregates, `GROUP BY`/`HAVING`, `CASE`, dates, joins and `LEFT JOIN`, subqueries, `WITH`; then the four-table shop — multi-table joins, `COUNT(DISTINCT)`, anti-joins, `EXISTS`, `UNION`, conditional counts, date gaps, `CREATE TABLE AS`; window functions (`RANK`, running totals, `LAG`, share of total), and `pd.read_sql` back into pandas; then `INSERT`, `UPDATE`, `DELETE`, text functions and `ROW_NUMBER` for the latest row per group |
| DAX | 25 | measures, `SUMX` and `RELATED`, one-way filter flow, `CALCULATE`, `KEEPFILTERS`, `ALL` for shares, `FILTER` and context transition, `AVERAGEX`, `VAR`/`RETURN`, `RANKX`, `TOTALYTD`, `DATEADD` growth; BLANK and `COALESCE`, `SWITCH(TRUE())`, `SELECTEDVALUE`, `HASONEVALUE` totals, `CONCATENATEX`; `MAXX` and context transition, `VALUES` as a filter, `TOPN` in `CALCULATE`, rolling `DATESINPERIOD`, two fact tables on one lookup |
| statistics | 35 | mean vs median on skewed order values, standard deviation and IQR (and checking the 68% rule), sampling variation and the standard error, 95% intervals by formula and by bootstrap, an interval for a difference, Welch's t-test with scipy, a two-proportion A/B test by hand, Bonferroni for many comparisons, Cohen's d; then chance by simulation and the law of large numbers, conditional probability from a two-way table, z-scores, the normal curve (`norm.cdf`/`ppf`), the binomial and the Poisson checked against simulations; the central limit theorem drawn, an interval for a share, sample sizes for a margin of error, expected value; correlation, Spearman against one wild point, `linregress` and r², residuals that show a curve, a lurking variable held steady in temperature bands; chi-square for a table and for an even spread, a paired t-test, one-way ANOVA, Mann-Whitney on lopsided baskets; and by simulation, a permutation test, false alarms in A/A tests, power, what peeking does, and regression to the mean |
| AI with Python | 20 | learning from examples (k-nearest neighbours, train/test, accuracy), a decision tree drawn with `plot_tree`, scaling features in a pipeline, a confusion matrix, five models compared with `cross_val_score`; one neuron and the sigmoid, a perceptron learning AND, gradient descent and the learning rate, an `MLPClassifier` reading handwritten digits, a convolution filter finding edges; k-means, PCA, bag of words with stop words, Naive Bayes sentiment on café reviews, Q-learning for a robot waiter; then better models: overfitting seen as train vs test by depth, `predict_proba` and acting only when sure, a random forest against one tree, feature importances, `GridSearchCV` |
| Algorithms | 40 | writing your own functions (`def`, `return`, defaults, `while`, edge cases and `assert`); counting steps, best/worst/average case, how work grows, Big-O, list vs set timed for real; guess-the-number, binary search, lower bound, `bisect`, binary search on the answer; selection and insertion sort, merging, `sorted` with a key, the top k with `heapq`; counting with dicts, two-sum, grouping, stacks, queues with `deque`; recursion, nested data, merge sort, memoisation, backtracking with pruning; adjacency lists, BFS, Dijkstra, greedy change, and dynamic programming when greedy fails; and making it faster: profiling with `cProfile`, hoisting work out of loops, lazy generator pipelines, numpy vectorising timed with `timeit`, and smaller tables with categories and `int8`. Plain Python (numpy and pandas in the last part), checked by calling your functions on cases that include the awkward ones |
| Power BI modelling | 10 | calculated columns vs measures, `RELATED` in a column, a date-table column, filtering through a fact table (expanded tables), a measure inside a column; segments, new customers per month, a running total, days since last order, value per segment |
| Projects | 15 | "Where should the shop grow next?" — build the city numbers in pandas, check them in SQL, make them measures in DAX, chart spend per customer with the counts it rests on, then make the call with a rule anyone can check; "Does the weather move the cafe?" — join by day, compare rainy and warm days, daily vs weekly correlation, a chart at its honest size, and a rule that says no; "From messy survey to a one-page summary" — clean it once, summarise by city, flag thin figures, one chart, a paragraph built from the numbers |

### Lazy-loaded packages

scipy, statsmodels and scikit-learn are **not** in the boot download — they
would roughly double it. A lesson declares what it needs:

```js
{ id: 'an-08', needs: ['scikit-learn'], … }
```

The worker fetches those on that lesson's first run (a few seconds), the lesson
card warns about it up front, and the Run button reports progress. After that
the service worker has them cached. Most of the AI track needs scikit-learn;
its numpy lessons (a neuron, gradient descent, filters, Q-learning) don't
wait for it. scikit-learn brings its classic datasets with it: iris flowers,
wines and handwritten digits.

A download that fails is checked for, not assumed: Pyodide's `loadPackage`
logs a failure instead of throwing, so the worker confirms the package really
arrived, says so if it didn't, and tries again on the next run. A timed run
downloads before its clock starts (scipy alone can take 40 seconds on a slow
line), and if that download fails, the run stops there with "A download
failed / Nothing wrong with your code" instead of retrying inside the time
limit, where a slow second try used to read as "a loop that never ends". It
doesn't count as a failed attempt at the lesson.

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

**`reviews`** is 40 short café reviews, written by hand and marked `happy` or
`unhappy`, for the AI track's text lessons (bag of words, sentiment).

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
fonts/                  Fraunces and IBM Plex, with their licences
js/
  main.js               hash router + boot
  python.js             main-thread handle on the worker
  worker.js             Pyodide + the Python execution/check runtime
  store.js              progress, XP, streak, spare days (localStorage)
  game.js               specials, first-try runs, ranks, achievements, bosses
  ui.js                 DOM helpers
  screens/              home, tracks, lesson, sandbox, you
  curriculum/           prelude + one file per track
```

**Upgrading Python:** `PYODIDE_VERSIONS` at the top of `js/worker.js` is a
fallback list — the first version that exists on the CDN wins. Add a newer one
to the front to upgrade.

---

## Licence and the small print

Copyright © 2026 Ibomeno Basiekanem. **All rights reserved.** The code,
lessons, problems, questions, datasets and design aren't licensed for reuse;
see [LICENSE](LICENSE). The source is public only so GitHub Pages can serve
the app.

DataBites is an independent learning app. It isn't affiliated with, endorsed
by or sponsored by Microsoft. Microsoft, Power BI and PL-300 are trademarks of
Microsoft. The DAX engine is written from scratch for teaching, and contains
no Microsoft code. The PL-300 practice questions were written for this app,
not taken from the real exam (its questions are under a non-disclosure
agreement; never add any remembered from sitting it). Every person, business,
review and number in the lessons is made up. The same notice is in the app,
under You → The small print.

The fonts (Fraunces, IBM Plex) are served from `fonts/`, not Google, so no
visitor's details go to a third party just to draw the type. They're under
the SIL Open Font License, whose text sits beside them. Pyodide and the
Python packages are fetched from the jsDelivr CDN when the app runs, under
their own licences.
