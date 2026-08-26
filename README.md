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
| Learning 5 datasets at once | **One** dataset (`cafe`) across all 66 lessons |
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
  const o = { prelude: cur.PRELUDE, check: L.check, needs: L.needs || [] };
  const s = await python.run({ ...o, code: L.solution, key: 'S'+L.id });
  const t = await python.run({ ...o, code: L.starter,  key: 'T'+L.id });
  if (!s.ok || !s.check?.passed) console.error('solution fails:', L.id, s.error || s.check?.msg);
  if (t.check?.passed)           console.error('starter is a freebie:', L.id);
}
console.log('done');
```

---

## The curriculum

66 lessons across 6 tracks. The topic order follows *Python for Data Analysis*
(Wes McKinney, 3rd ed.) as a syllabus — chapters 5–13 — but every lesson,
example and exercise here is original and written against the `cafe` dataset.

| Track | Lessons | Covers |
| --- | --- | --- |
| pandas | 20 | DataFrames, Series, filtering, groupby, `loc`/`iloc`, `.str`, `apply`/`map`, binning, missing data, `read_csv` |
| wrangling | 8 | `merge` and join types, `concat`, duplicates, `melt`, `stack`/`unstack`, `transform`, `crosstab` |
| time series | 6 | datetime index, `resample`, `rolling`, `shift`/`pct_change`, `.dt` features, `ewm` |
| matplotlib | 11 | figure/axes, bar, scatter, hist, legends, subplots, annotation, `.plot()`, styling |
| seaborn | 12 | themes, `hue`, categorical plots, heatmaps, facets, `pairplot`, `regplot`, violins, KDE |
| analysis | 9 | the capstone — framing, profiling, outliers, correlation, `polyfit`, statsmodels OLS, scikit-learn, the final chart |

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
