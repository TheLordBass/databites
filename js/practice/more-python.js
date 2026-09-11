/* More Python practice problems, p37 to p50. Same format as problems.js:
   setup defines _ref, _example and _cases; alt answers must be accepted and
   wrong answers rejected by the hidden cases (the README harness checks). */

export const MORE_PYTHON = [

/* ── Easy ──────────────────────────────────────────────── */
{
  id: 'p37', difficulty: 'easy', tags: ['missing data', 'arithmetic'],
  title: 'After the discount',
  prompt: [
    '`df` has `item`, `price` and `discount` — a fraction, so `0.25` means 25% off. A missing discount means no discount.',
    'Return `df` with a new column `final`: the price after the discount, rounded to 2 places. Keep the rows in order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    out["final"] = (out["price"] * (1 - out["discount"].fillna(0))).round(2)
    return out

def _example():
    return (pd.DataFrame({"item": ["latte", "tea", "mug", "beans"],
                          "price": [4.50, 2.00, 9.50, 12.00],
                          "discount": [0.10, None, 0.25, 0.0]}),)

def _cases():
    r = np.random.default_rng(37)
    d = r.choice([0.05, 0.1, 0.2, 0.5], 20).astype(float)
    d[[2, 7, 11]] = np.nan
    big = pd.DataFrame({"item": ["x%d" % i for i in range(20)],
                        "price": np.round(r.uniform(1, 30, 20), 2), "discount": d})
    return [
        _example(),
        (pd.DataFrame({"item": ["a", "b"], "price": [3.0, 5.0], "discount": [None, None]}),),
        (big,),
    ]
`,
  hint: 'Anything times a missing value is missing. `.fillna(0)` on the discount first, then `price * (1 - discount)`, then `.round(2)`.',
  solution: 'def solution(df):\n    out = df.copy()\n    out["final"] = (out["price"] * (1 - out["discount"].fillna(0))).round(2)\n    return out\n',
  alt: ['def solution(df):\n    return df.assign(final=(df["price"] * (1 - df["discount"].fillna(0))).round(2))\n'],
  wrong: [
    'def solution(df):\n    out = df.copy()\n    out["final"] = (out["price"] * (1 - out["discount"])).round(2)\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    out["final"] = (out["price"] - out["discount"].fillna(0)).round(2)\n    return out\n',
  ],
},
{
  id: 'p38', difficulty: 'easy', tags: ['strings', 'ties'],
  title: 'Longest name',
  prompt: [
    '`df` has a `name` column. Some names were saved with spaces around them — ignore those.',
    'Return the longest name, without its spaces. If several are equally long, return the one first in alphabetical order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    names = df["name"].str.strip()
    longest = names.str.len().max()
    return sorted(names[names.str.len() == longest])[0]

def _example():
    return (pd.DataFrame({"name": ["Ada", " Kwame ", "Zola", "Amara", "Tunde"]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"name": ["Nia"]}),),
        (pd.DataFrame({"name": ["Zola", "Kofi", "  Esi", "Ife"]}),),
        (pd.DataFrame({"name": ["Lindiwe", "Wanjiru ", "Halima"]}),),
    ]
`,
  hint: 'Strip first: `df["name"].str.strip()`. Find the longest length, keep the names that have it, and take the first in `sorted(...)` order.',
  solution: 'def solution(df):\n    names = df["name"].str.strip()\n    longest = names.str.len().max()\n    return sorted(names[names.str.len() == longest])[0]\n',
  alt: ['def solution(df):\n    return min(df["name"].str.strip(), key=lambda s: (-len(s), s))\n'],
  wrong: [
    'def solution(df):\n    return df.loc[df["name"].str.len().idxmax(), "name"]\n',
    'def solution(df):\n    names = df["name"].str.strip()\n    return names[names.str.len().idxmax()]\n',
  ],
},
{
  id: 'p39', difficulty: 'easy', tags: ['dates', 'groupby', 'ties'],
  title: 'Busiest weekday',
  prompt: [
    '`df` has a `date` and the `cups` sold that day.',
    'Return the name of the weekday (like `"Monday"`) with the most cups sold **in total**. If two weekdays tie, the one earlier in the week wins — Monday first.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def _ref(df):
    totals = df.groupby(df["date"].dt.dayofweek)["cups"].sum()
    return _DAYS[int(totals[totals == totals.max()].index.min())]

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-01", "2024-01-05", "2024-01-03", "2024-01-10"]),
        "cups": [30, 30, 18, 18],
    }),)

def _cases():
    r = np.random.default_rng(39)
    big = pd.DataFrame({"date": pd.date_range("2024-02-01", periods=40, freq="D"),
                        "cups": r.integers(5, 60, 40)})
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-01-05", "2024-01-01"]), "cups": [30, 30]}),),
        (big,),
    ]
`,
  hint: '`.dt.dayofweek` numbers the days Monday = 0, so grouping on it puts the week in order — and `.idxmax()` returns the first of any tie. Turn the number back into a name at the end.',
  solution: 'def solution(df):\n    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]\n    totals = df.groupby(df["date"].dt.dayofweek)["cups"].sum()\n    return days[totals.idxmax()]\n',
  alt: ['def solution(df):\n    d = df.assign(dow=df["date"].dt.dayofweek, day=df["date"].dt.day_name())\n    totals = d.groupby(["dow", "day"])["cups"].sum()\n    return totals[totals == totals.max()].index[0][1]\n'],
  wrong: [
    'def solution(df):\n    return df.groupby(df["date"].dt.day_name())["cups"].sum().idxmax()\n',
    'def solution(df):\n    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]\n    means = df.groupby(df["date"].dt.dayofweek)["cups"].mean()\n    return days[means.idxmax()]\n',
  ],
},
{
  id: 'p40', difficulty: 'easy', tags: ['missing data'],
  title: 'Rows with a gap',
  prompt: [
    'Return the rows of `df` that have **at least one** missing value, in any column.',
    'Keep every column, and keep the rows in their original order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    return df[df.isna().any(axis=1)]

def _example():
    return (pd.DataFrame({"city": ["Lagos", None, "Accra", "Nairobi", "Tema"],
                          "cups": [12, 30, None, 18, 22],
                          "rating": [4.5, 3.9, 4.1, None, 4.8]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"city": ["Lagos", "Accra"], "cups": [1, 2], "rating": [4.0, 5.0]}),),
        (pd.DataFrame({"city": [None, "Tema", "Kumasi"], "cups": [None, 3, 4], "rating": [None, None, 4.2]}),),
    ]
`,
  hint: '`df.isna()` is True wherever a value is missing. `.any(axis=1)` asks "is anything in this row missing?"',
  solution: 'def solution(df):\n    return df[df.isna().any(axis=1)]\n',
  alt: ['def solution(df):\n    return df.loc[df.isnull().sum(axis=1) > 0]\n'],
  wrong: [
    'def solution(df):\n    return df.dropna()\n',
    'def solution(df):\n    return df[df.isna().all(axis=1)]\n',
    'def solution(df):\n    return df[df["rating"].isna()]\n',
  ],
},

/* ── Medium ────────────────────────────────────────────── */
{
  id: 'p41', difficulty: 'medium', tags: ['reshaping', 'pivot', 'duplicates'],
  title: 'Long to wide',
  prompt: [
    '`df` has one row per mark: `student`, `subject`, `mark`. A student who resat a subject has two marks for it — keep the **higher** one.',
    'Return one row per student, sorted by student: a `student` column, then one column per subject in alphabetical order. A subject a student never took is missing.',
  ],
  notes: ['Column order matters.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_strict',
  setup: `
def _ref(df):
    wide = df.pivot_table(index="student", columns="subject", values="mark", aggfunc="max")
    wide = wide[sorted(wide.columns)].reset_index()
    wide.columns.name = None
    return wide

def _example():
    return (pd.DataFrame({
        "student": ["Ada", "Ada", "Kofi", "Ada", "Zola"],
        "subject": ["maths", "physics", "maths", "maths", "history"],
        "mark": [70, 65, 80, 75, 90],
    }),)

def _cases():
    r = np.random.default_rng(41)
    big = pd.DataFrame({"student": r.choice(["Ada", "Kofi", "Zola", "Ife"], 25).tolist(),
                        "subject": r.choice(["maths", "art", "physics"], 25).tolist(),
                        "mark": r.integers(40, 100, 25)})
    return [_example(), (big,)]
`,
  hint: '`pivot_table(index="student", columns="subject", values="mark", aggfunc="max")` — the aggfunc is what decides between two marks. Then `reset_index()`.',
  solution: 'def solution(df):\n    wide = df.pivot_table(index="student", columns="subject", values="mark", aggfunc="max")\n    return wide.reset_index().rename_axis(columns=None)\n',
  alt: ['def solution(df):\n    wide = df.groupby(["student", "subject"])["mark"].max().unstack()\n    return wide.reset_index().rename_axis(columns=None)\n'],
  wrong: [
    'def solution(df):\n    wide = df.pivot_table(index="student", columns="subject", values="mark")\n    return wide.reset_index().rename_axis(columns=None)\n',
    'def solution(df):\n    return df.pivot(index="student", columns="subject", values="mark").reset_index()\n',
  ],
},
{
  id: 'p42', difficulty: 'medium', tags: ['missing data', 'groupby'],
  title: 'Fill gaps per device',
  prompt: [
    '`df` holds sensor readings: `device`, `ts` and `reading`. Rows are already in time order, but devices are mixed together, and some readings are missing.',
    'Fill each missing reading with the **same device\'s** previous reading. A device with nothing before its gap stays missing. Keep the rows in order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    out["reading"] = out.groupby("device")["reading"].ffill()
    return out

def _example():
    return (pd.DataFrame({
        "device": ["A", "B", "A", "B", "A", "B"],
        "ts": [1, 2, 3, 4, 5, 6],
        "reading": [1.5, None, None, 5.0, None, None],
    }),)

def _cases():
    r = np.random.default_rng(42)
    vals = np.round(r.uniform(0, 10, 30), 1)
    vals[r.random(30) < 0.4] = np.nan
    big = pd.DataFrame({"device": r.choice(["A", "B", "C"], 30).tolist(), "ts": list(range(30)), "reading": vals})
    return [_example(), (big,)]
`,
  hint: '`.ffill()` carries the last value forward. Do it inside `groupby("device")` so B never borrows A\'s reading.',
  solution: 'def solution(df):\n    out = df.copy()\n    out["reading"] = out.groupby("device")["reading"].ffill()\n    return out\n',
  alt: ['def solution(df):\n    return df.assign(reading=df.groupby("device")["reading"].transform(lambda s: s.ffill()))\n'],
  wrong: [
    'def solution(df):\n    out = df.copy()\n    out["reading"] = out["reading"].ffill()\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    out["reading"] = out["reading"].fillna(0)\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    out["reading"] = out.groupby("device")["reading"].bfill()\n    return out\n',
  ],
},
{
  id: 'p43', difficulty: 'medium', tags: ['dates', 'resampling', 'pct_change'],
  title: 'Month on month',
  prompt: [
    '`df` has daily `date` and `sales`, not in order. Every month has at least one sale.',
    'Return one row per month, in order: `month` (text like `"2024-01"`), `total`, and `change_pct` — the percentage change from the month before, rounded to 1. The first month has no month before it.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    m = df.groupby(df["date"].dt.strftime("%Y-%m"))["sales"].sum().sort_index()
    out = pd.DataFrame({"month": m.index, "total": m.values})
    out["change_pct"] = (out["total"].pct_change() * 100).round(1)
    return out

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-02-10", "2024-01-05", "2024-01-20", "2024-03-02", "2024-02-11"]),
        "sales": [60.0, 50.0, 30.0, 90.0, 20.0],
    }),)

def _cases():
    r = np.random.default_rng(43)
    days = pd.date_range("2023-11-01", "2024-03-31", freq="D")
    big = pd.DataFrame({"date": days, "sales": np.round(r.uniform(10, 90, len(days)), 2)}).sample(frac=1, random_state=3)
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-01-03", "2023-12-30"]), "sales": [40.0, 50.0]}),),
        (big,),
    ]
`,
  hint: 'Group on `df["date"].dt.strftime("%Y-%m")` — text months sort correctly, even across a new year. Then `.pct_change() * 100`.',
  solution: 'def solution(df):\n    m = df.groupby(df["date"].dt.strftime("%Y-%m"))["sales"].sum()\n    out = pd.DataFrame({"month": m.index, "total": m.values})\n    out["change_pct"] = (out["total"].pct_change() * 100).round(1)\n    return out\n',
  alt: ['def solution(df):\n    m = df.set_index("date").sort_index()["sales"].resample("MS").sum()\n    out = pd.DataFrame({"month": m.index.strftime("%Y-%m"), "total": m.values})\n    out["change_pct"] = (out["total"].pct_change() * 100).round(1)\n    return out\n'],
  wrong: [
    'def solution(df):\n    m = df.groupby(df["date"].dt.strftime("%Y-%m"))["sales"].sum()\n    out = pd.DataFrame({"month": m.index, "total": m.values})\n    out["change_pct"] = out["total"].pct_change().round(1)\n    return out\n',
    'def solution(df):\n    m = df.groupby(df["date"].dt.strftime("%Y-%m"))["sales"].sum()\n    out = pd.DataFrame({"month": m.index, "total": m.values})\n    out["change_pct"] = out["total"].diff().round(1)\n    return out\n',
  ],
},
{
  id: 'p44', difficulty: 'medium', tags: ['groupby', 'transform'],
  title: 'Above their own average',
  prompt: [
    '`df` has `customer` and `amount`, one row per purchase.',
    "Return the purchases that were **above that customer's own average** purchase. Keep all columns.",
  ],
  notes: ['Equal to the average is not above it.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    return df[df["amount"] > df.groupby("customer")["amount"].transform("mean")]

def _example():
    return (pd.DataFrame({"customer": ["Ada", "Ada", "Zola", "Zola", "Kofi", "Kofi"],
                          "amount": [10.0, 14.0, 50.0, 90.0, 5.0, 5.0]}),)

def _cases():
    r = np.random.default_rng(44)
    big = pd.DataFrame({"customer": r.choice(["Ada", "Kofi", "Zola", "Ife", "Nia"], 30).tolist(),
                        "amount": r.choice([5.0, 10.0, 20.0, 40.0], 30).tolist()})
    return [_example(), (pd.DataFrame({"customer": ["Esi"], "amount": [7.0]}),), (big,)]
`,
  hint: '`groupby("customer")["amount"].transform("mean")` gives every row its own customer\'s average, lined up with the original rows.',
  solution: 'def solution(df):\n    avg = df.groupby("customer")["amount"].transform("mean")\n    return df[df["amount"] > avg]\n',
  alt: ['def solution(df):\n    means = df.groupby("customer")["amount"].mean()\n    return df[df["amount"] > df["customer"].map(means)]\n'],
  wrong: [
    'def solution(df):\n    return df[df["amount"] > df["amount"].mean()]\n',
    'def solution(df):\n    avg = df.groupby("customer")["amount"].transform("mean")\n    return df[df["amount"] >= avg]\n',
  ],
},
{
  id: 'p45', difficulty: 'medium', tags: ['strings', 'missing data'],
  title: 'First and last names',
  prompt: [
    '`df` has a `name` column: full names typed by hand, sometimes with extra spaces, sometimes with a middle name, sometimes just one word.',
    'Add `first` (the first word) and `last` (the last word). A one-word name has no last name — leave it missing. Keep the rows in order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    words = out["name"].str.split()
    out["first"] = words.str[0]
    out["last"] = words.apply(lambda w: w[-1] if len(w) > 1 else None)
    return out

def _example():
    return (pd.DataFrame({"name": ["Ada Lovelace", "Kofi Annan Mensah", " Nia ", "Zola  Nkosi"],
                          "city": ["Lagos", "Accra", "Nairobi", "Tema"]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"name": ["Esi", "Yaw Boateng"], "city": ["Accra", "Kumasi"]}),),
    ]
`,
  hint: '`.str.split()` with no argument splits on any run of spaces and ignores spaces at the ends. Then `.str[0]` is the first word — and the last word needs a check for one-word names.',
  solution: 'def solution(df):\n    out = df.copy()\n    words = out["name"].str.split()\n    out["first"] = words.str[0]\n    out["last"] = words.apply(lambda w: w[-1] if len(w) > 1 else None)\n    return out\n',
  alt: ['def solution(df):\n    out = df.copy()\n    words = out["name"].apply(lambda s: s.split())\n    out["first"] = words.apply(lambda w: w[0])\n    out["last"] = words.apply(lambda w: w[-1] if len(w) > 1 else None)\n    return out\n'],
  wrong: [
    'def solution(df):\n    out = df.copy()\n    parts = out["name"].str.split(" ", expand=True)\n    out["first"] = parts[0]\n    out["last"] = parts[1]\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    words = out["name"].str.split()\n    out["first"] = words.str[0]\n    out["last"] = words.str[-1]\n    return out\n',
  ],
},

/* ── Hard ──────────────────────────────────────────────── */
{
  id: 'p46', difficulty: 'hard', tags: ['intervals', 'sorting', 'groupby'],
  title: 'Merge the bookings',
  prompt: [
    '`df` has `person`, `start` and `end` (hours, start < end), in no particular order.',
    "Merge each person's bookings that overlap **or touch** — 9–11 and 11–12 become 9–12 — into single blocks. Return `person`, `start`, `end`.",
  ],
  notes: ['A booking can sit entirely inside another.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    rows = []
    for person, g in df.sort_values(["person", "start", "end"]).groupby("person"):
        cur_s, cur_e = None, None
        for s, e in zip(g["start"], g["end"]):
            if cur_s is None:
                cur_s, cur_e = s, e
            elif s <= cur_e:
                cur_e = max(cur_e, e)
            else:
                rows.append((person, cur_s, cur_e))
                cur_s, cur_e = s, e
        rows.append((person, cur_s, cur_e))
    return pd.DataFrame(rows, columns=["person", "start", "end"])

def _example():
    return (pd.DataFrame({
        "person": ["Ada", "Ada", "Ada", "Kofi", "Kofi", "Ada"],
        "start":  [13, 9, 11, 8, 12, 16],
        "end":    [15, 11, 12, 18, 13, 17],
    }),)

def _cases():
    r = np.random.default_rng(46)
    rows = []
    for person in ["Ada", "Kofi", "Zola", "Ife"]:
        for _ in range(6):
            s = int(r.integers(0, 40))
            rows.append({"person": person, "start": s, "end": s + int(r.integers(1, 6))})
    big = pd.DataFrame(rows).sample(frac=1, random_state=2)
    return [
        _example(),
        (pd.DataFrame({"person": ["Nia"], "start": [9], "end": [10]}),),
        (big,),
    ]
`,
  hint: 'Sort by person and start. Walk each person\'s bookings keeping a current block: if the next one starts at or before the block\'s end, stretch the end to whichever is later; otherwise close the block and start a new one.',
  solution: 'def solution(df):\n    rows = []\n    for person, g in df.sort_values(["person", "start"]).groupby("person"):\n        cur_s, cur_e = None, None\n        for s, e in zip(g["start"], g["end"]):\n            if cur_s is None:\n                cur_s, cur_e = s, e\n            elif s <= cur_e:\n                cur_e = max(cur_e, e)\n            else:\n                rows.append((person, cur_s, cur_e))\n                cur_s, cur_e = s, e\n        rows.append((person, cur_s, cur_e))\n    return pd.DataFrame(rows, columns=["person", "start", "end"])\n',
  alt: ['def solution(df):\n    d = df.sort_values(["person", "start"]).copy()\n    reach = d.groupby("person")["end"].cummax()\n    d["new"] = d["start"] > reach.groupby(d["person"]).shift()\n    d["block"] = d.groupby("person")["new"].cumsum()\n    out = d.groupby(["person", "block"]).agg(start=("start", "min"), end=("end", "max")).reset_index()\n    return out[["person", "start", "end"]]\n'],
  wrong: [
    'def solution(df):\n    rows = []\n    for person, g in df.sort_values(["person", "start"]).groupby("person"):\n        cur_s, cur_e = None, None\n        for s, e in zip(g["start"], g["end"]):\n            if cur_s is None:\n                cur_s, cur_e = s, e\n            elif s < cur_e:\n                cur_e = max(cur_e, e)\n            else:\n                rows.append((person, cur_s, cur_e))\n                cur_s, cur_e = s, e\n        rows.append((person, cur_s, cur_e))\n    return pd.DataFrame(rows, columns=["person", "start", "end"])\n',
    'def solution(df):\n    rows = []\n    for person, g in df.sort_values(["person", "start"]).groupby("person"):\n        cur_s, cur_e = None, None\n        for s, e in zip(g["start"], g["end"]):\n            if cur_s is None:\n                cur_s, cur_e = s, e\n            elif s <= cur_e:\n                cur_e = e\n            else:\n                rows.append((person, cur_s, cur_e))\n                cur_s, cur_e = s, e\n        rows.append((person, cur_s, cur_e))\n    return pd.DataFrame(rows, columns=["person", "start", "end"])\n',
  ],
},
{
  id: 'p47', difficulty: 'hard', tags: ['runs', 'groupby', 'sorting'],
  title: 'Longest rising run',
  prompt: [
    '`df` has `product`, `day` (a whole number, one row per product per day, no days missing) and `price`. The rows are not in order.',
    "For each product, find the longest run of consecutive days where the price went **up** every day. A single day is a run of 1. Return `product` and `longest`.",
  ],
  notes: ['A flat day (same price) ends a run.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    out = []
    for product, g in df.sort_values(["product", "day"]).groupby("product"):
        best, run, prev = 1, 0, None
        for p in g["price"]:
            run = run + 1 if prev is not None and p > prev else 1
            best = max(best, run)
            prev = p
        out.append((product, best))
    return pd.DataFrame(out, columns=["product", "longest"])

def _example():
    return (pd.DataFrame({
        "product": ["beans"] * 6 + ["mug"] * 3,
        "day":     [3, 1, 2, 4, 5, 6, 1, 2, 3],
        "price":   [11.0, 10.0, 10.5, 11.0, 11.5, 12.0, 9.0, 9.0, 8.0],
    }),)

def _cases():
    r = np.random.default_rng(47)
    rows = []
    for product in ["beans", "mug", "kit"]:
        for day in range(1, 16):
            rows.append({"product": product, "day": day, "price": float(r.choice([8, 9, 10, 11, 12]))})
    big = pd.DataFrame(rows).sample(frac=1, random_state=6)
    return [_example(), (big,)]
`,
  hint: 'Sort by product and day first — the rows arrive shuffled. A day continues the run if its price is higher than the day before; otherwise the run starts again at 1.',
  solution: 'def solution(df):\n    out = []\n    for product, g in df.sort_values(["product", "day"]).groupby("product"):\n        best, run, prev = 1, 0, None\n        for p in g["price"]:\n            run = run + 1 if prev is not None and p > prev else 1\n            best = max(best, run)\n            prev = p\n        out.append((product, best))\n    return pd.DataFrame(out, columns=["product", "longest"])\n',
  alt: ['def solution(df):\n    d = df.sort_values(["product", "day"]).copy()\n    up = d["price"] > d.groupby("product")["price"].shift()\n    d["run_id"] = (~up).cumsum()\n    sizes = d.groupby(["product", "run_id"]).size()\n    return sizes.groupby(level="product").max().reset_index(name="longest")\n'],
  wrong: [
    'def solution(df):\n    out = []\n    for product, g in df.sort_values(["product", "day"]).groupby("product"):\n        best, run, prev = 1, 0, None\n        for p in g["price"]:\n            run = run + 1 if prev is not None and p >= prev else 1\n            best = max(best, run)\n            prev = p\n        out.append((product, best))\n    return pd.DataFrame(out, columns=["product", "longest"])\n',
    'def solution(df):\n    out = []\n    for product, g in df.groupby("product"):\n        best, run, prev = 1, 0, None\n        for p in g["price"]:\n            run = run + 1 if prev is not None and p > prev else 1\n            best = max(best, run)\n            prev = p\n        out.append((product, best))\n    return pd.DataFrame(out, columns=["product", "longest"])\n',
  ],
},
{
  id: 'p48', difficulty: 'hard', tags: ['groupby', 'ties', 'concat'],
  title: 'Top three and the rest',
  prompt: [
    '`df` has `category` and `revenue`, one row per sale.',
    'Return the 3 categories with the highest total revenue, biggest first (a tie goes alphabetically), followed by one row `"other"` holding the total of every remaining category. With 3 categories or fewer, there is no "other" row.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    t = df.groupby("category", as_index=False)["revenue"].sum()
    t = t.sort_values(["revenue", "category"], ascending=[False, True])
    top, rest = t.head(3), t.iloc[3:]
    if len(rest):
        top = pd.concat([top, pd.DataFrame({"category": ["other"], "revenue": [rest["revenue"].sum()]})])
    return top.reset_index(drop=True)

def _example():
    return (pd.DataFrame({
        "category": ["beans", "kit", "merch", "beans", "gift", "kit", "tea", "merch"],
        "revenue":  [50.0, 30.0, 20.0, 25.0, 15.0, 10.0, 40.0, 20.0],
    }),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"category": ["a", "b", "c", "a"], "revenue": [5.0, 7.0, 1.0, 4.0]}),),
        (pd.DataFrame({"category": ["x", "y"], "revenue": [3.0, 3.0]}),),
    ]
`,
  hint: 'Total per category, sort by revenue (high to low) and then category (A to Z). `head(3)` is the top; if anything is left over, `pd.concat` one extra row with its sum.',
  solution: 'def solution(df):\n    t = df.groupby("category", as_index=False)["revenue"].sum()\n    t = t.sort_values(["revenue", "category"], ascending=[False, True])\n    top, rest = t.head(3), t.iloc[3:]\n    if len(rest):\n        other = pd.DataFrame({"category": ["other"], "revenue": [rest["revenue"].sum()]})\n        top = pd.concat([top, other])\n    return top\n',
  alt: ['def solution(df):\n    t = df.groupby("category")["revenue"].sum()\n    order = sorted(t.index, key=lambda c: (-t[c], c))\n    rows = [(c, t[c]) for c in order[:3]]\n    if len(order) > 3:\n        rows.append(("other", sum(t[c] for c in order[3:])))\n    return pd.DataFrame(rows, columns=["category", "revenue"])\n'],
  wrong: [
    'def solution(df):\n    t = df.groupby("category", as_index=False)["revenue"].sum()\n    t = t.sort_values(["revenue", "category"], ascending=[False, True])\n    other = pd.DataFrame({"category": ["other"], "revenue": [t["revenue"].iloc[3:].sum()]})\n    return pd.concat([t.head(3), other])\n',
    'def solution(df):\n    t = df.groupby("category", as_index=False)["revenue"].sum()\n    t = t.sort_values(["revenue", "category"], ascending=[False, True])\n    top = t.head(3)\n    if len(t) > 3:\n        top = pd.concat([top, pd.DataFrame({"category": ["other"], "revenue": [t["revenue"].sum()]})])\n    return top\n',
  ],
},
{
  id: 'p49', difficulty: 'hard', tags: ['cumulative', 'groupby', 'dates'],
  title: 'Overdrawn',
  prompt: [
    '`df` is a ledger: `account`, `ts` and `amount` (deposits positive, withdrawals negative), not in order. Each account starts at 0.',
    'For every account whose running balance ever goes **below zero**, return `account` and `first_negative` — the `ts` of the move that first took it below zero. Accounts that never go below zero are left out.',
  ],
  notes: ['A balance of exactly 0 is not overdrawn.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    d = df.sort_values(["account", "ts"]).copy()
    d["balance"] = d.groupby("account")["amount"].cumsum()
    neg = d[d["balance"] < 0]
    return neg.groupby("account", as_index=False)["ts"].min().rename(columns={"ts": "first_negative"})

def _example():
    return (pd.DataFrame({
        "account": ["A", "A", "B", "A", "B", "C", "B"],
        "ts": pd.to_datetime(["2024-01-03", "2024-01-01", "2024-01-02", "2024-01-02",
                              "2024-01-01", "2024-01-01", "2024-01-03"]),
        "amount": [-50.0, 100.0, -30.0, -60.0, 30.0, 20.0, -5.0],
    }),)

def _cases():
    r = np.random.default_rng(49)
    rows = []
    for acct in ["A", "B", "C", "D", "E"]:
        rows.append(pd.DataFrame({"account": acct,
                                  "ts": pd.date_range("2024-02-01", periods=10, freq="D"),
                                  "amount": r.choice([-40.0, -15.0, 10.0, 25.0], 10)}))
    big = pd.concat(rows).sample(frac=1, random_state=5)
    return [_example(), (big,)]
`,
  hint: 'Sort by account and time, then `groupby("account")["amount"].cumsum()` is the running balance. Keep the rows below zero and take the earliest `ts` per account.',
  solution: 'def solution(df):\n    d = df.sort_values(["account", "ts"]).copy()\n    d["balance"] = d.groupby("account")["amount"].cumsum()\n    neg = d[d["balance"] < 0]\n    out = neg.groupby("account", as_index=False)["ts"].min()\n    return out.rename(columns={"ts": "first_negative"})\n',
  alt: ['def solution(df):\n    rows = []\n    for acct, g in df.sort_values("ts").groupby("account"):\n        bal = 0\n        for ts, amt in zip(g["ts"], g["amount"]):\n            bal += amt\n            if bal < 0:\n                rows.append((acct, ts))\n                break\n    return pd.DataFrame(rows, columns=["account", "first_negative"])\n'],
  wrong: [
    'def solution(df):\n    d = df.sort_values(["account", "ts"]).copy()\n    d["balance"] = d.groupby("account")["amount"].cumsum()\n    neg = d[d["balance"] <= 0]\n    return neg.groupby("account", as_index=False)["ts"].min().rename(columns={"ts": "first_negative"})\n',
    'def solution(df):\n    d = df.copy()\n    d["balance"] = d.groupby("account")["amount"].cumsum()\n    neg = d[d["balance"] < 0]\n    return neg.groupby("account", as_index=False)["ts"].min().rename(columns={"ts": "first_negative"})\n',
  ],
},
{
  id: 'p50', difficulty: 'hard', tags: ['self-join', 'counting', 'duplicates'],
  title: 'Bought together',
  prompt: [
    '`df` has `order_id` and `product`, one row per line of an order. A product can appear twice in one order — count it once.',
    'Find the pairs of products that were bought in the same order in **at least 2** orders. Return `product_a` and `product_b` (alphabetically, a before b) and `n`, the number of orders with both — sorted by `n` high to low, then `product_a`, then `product_b`.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    d = df[["order_id", "product"]].drop_duplicates()
    pairs = d.merge(d, on="order_id")
    pairs = pairs[pairs["product_x"] < pairs["product_y"]]
    n = pairs.groupby(["product_x", "product_y"]).size().reset_index(name="n")
    n = n[n["n"] >= 2].rename(columns={"product_x": "product_a", "product_y": "product_b"})
    return n.sort_values(["n", "product_a", "product_b"], ascending=[False, True, True])

def _example():
    return (pd.DataFrame({
        "order_id": [1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5],
        "product":  ["beans", "mug", "beans", "beans", "mug", "mug", "grinder", "beans",
                     "grinder", "filters", "filters", "grinder"],
    }),)

def _cases():
    r = np.random.default_rng(50)
    rows = []
    for oid in range(1, 26):
        for p in r.choice(["beans", "mug", "grinder", "filters", "cups", "tote"], int(r.integers(1, 5))):
            rows.append({"order_id": oid, "product": str(p)})
    return [_example(), (pd.DataFrame(rows),)]
`,
  hint: 'Drop duplicate lines first. Then merge the table with itself on `order_id` — every pair of lines in an order — and keep `product_x < product_y` so each pair appears once, in order.',
  solution: 'def solution(df):\n    d = df[["order_id", "product"]].drop_duplicates()\n    pairs = d.merge(d, on="order_id")\n    pairs = pairs[pairs["product_x"] < pairs["product_y"]]\n    n = pairs.groupby(["product_x", "product_y"]).size().reset_index(name="n")\n    n = n[n["n"] >= 2].rename(columns={"product_x": "product_a", "product_y": "product_b"})\n    return n.sort_values(["n", "product_a", "product_b"], ascending=[False, True, True])\n',
  alt: ['def solution(df):\n    from itertools import combinations\n    from collections import Counter\n    c = Counter()\n    for _, g in df.groupby("order_id"):\n        for a, b in combinations(sorted(set(g["product"])), 2):\n            c[(a, b)] += 1\n    rows = [(a, b, n) for (a, b), n in c.items() if n >= 2]\n    out = pd.DataFrame(rows, columns=["product_a", "product_b", "n"])\n    return out.sort_values(["n", "product_a", "product_b"], ascending=[False, True, True])\n'],
  wrong: [
    'def solution(df):\n    pairs = df.merge(df, on="order_id")\n    pairs = pairs[pairs["product_x"] < pairs["product_y"]]\n    n = pairs.groupby(["product_x", "product_y"]).size().reset_index(name="n")\n    n = n[n["n"] >= 2].rename(columns={"product_x": "product_a", "product_y": "product_b"})\n    return n.sort_values(["n", "product_a", "product_b"], ascending=[False, True, True])\n',
    'def solution(df):\n    d = df[["order_id", "product"]].drop_duplicates()\n    pairs = d.merge(d, on="order_id")\n    pairs = pairs[pairs["product_x"] != pairs["product_y"]]\n    n = pairs.groupby(["product_x", "product_y"]).size().reset_index(name="n")\n    n = n[n["n"] >= 2].rename(columns={"product_x": "product_a", "product_y": "product_b"})\n    return n.sort_values(["n", "product_a", "product_b"], ascending=[False, True, True])\n',
    'def solution(df):\n    d = df[["order_id", "product"]].drop_duplicates()\n    pairs = d.merge(d, on="order_id")\n    pairs = pairs[pairs["product_x"] < pairs["product_y"]]\n    n = pairs.groupby(["product_x", "product_y"]).size().reset_index(name="n")\n    n = n.rename(columns={"product_x": "product_a", "product_y": "product_b"})\n    return n.sort_values(["n", "product_a", "product_b"], ascending=[False, True, True])\n',
  ],
},
];
