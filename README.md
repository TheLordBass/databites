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
| Learning 5 datasets at once | **One** dataset (`cafe`) across all 31 lessons |
| Boring linear order | "Surprise me" and "⚡ shortest bite" buttons |
| Broken streaks | The streak only moves when you *finish* something, and forgives one missed day |

---

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

You need an HTTPS URL, which GitHub Pages gives you free.

**1. Put it on GitHub** (run these in the project folder):

```bash
git init -b main
```

```bash
git add -A && git commit -m "DataBites"
```

Create an empty repo on github.com, then:

```bash
git remote add origin https://github.com/YOUR-NAME/databites.git
```

```bash
git push -u origin main
```

**2. Turn on Pages:** repo → **Settings** → **Pages** → Source: *Deploy from a
branch* → `main` / `/ (root)` → Save. A minute later it's live at
`https://YOUR-NAME.github.io/databites/`.

**3. Install it:** open that URL in Chrome on your phone → menu **⋮** →
**Add to Home screen**. It now opens fullscreen with no browser chrome, and the
app's **You** tab will offer a one-tap install button when Chrome allows it.

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
  const s = await python.run({ code: L.solution, key: 'S'+L.id, prelude: cur.PRELUDE, check: L.check });
  const t = await python.run({ code: L.starter,  key: 'T'+L.id, prelude: cur.PRELUDE, check: L.check });
  if (!s.ok || !s.check?.passed) console.error('solution fails:', L.id, s.error || s.check?.msg);
  if (t.check?.passed)           console.error('starter is a freebie:', L.id);
}
console.log('done');
```

---

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
