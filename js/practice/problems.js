/* Practice problems — LeetCode-style: no teaching, a function to write, and
   hidden tests that decide. Every problem here is original.

   setup  Python defining:
            _ref(...)    the reference answer. Its parameter names are the
                         labels a learner sees on a failing case.
            _example()   the visible example — a tuple of arguments.
            _cases()     the hidden tests — a list of argument tuples. Put the
                         edge case the problem is really about in here.
          It runs in a private namespace, so a solution can't call _ref.
   mode   how an answer is compared with the reference:
            frame          same columns in any order, rows in any order
            frame_ordered  same columns, rows in exactly this order
            frame_strict   exact column order and row order
            scalar | list
   alt    other correct answers. Tests must accept them — guards against
          tests that only accept one way of writing it.
   wrong  tempting wrong answers. Tests must reject them — proves the hidden
          cases actually exercise the trap. Both are checked by the harness
          in the README. */

import { MORE_PYTHON } from './more-python.js';
import { MORE_SQL } from './more-sql.js';

export const XP = { easy: 15, medium: 30, hard: 50 };

export const DIFFICULTY = {
  easy:   { label: 'Easy' },
  medium: { label: 'Medium' },
  hard:   { label: 'Hard' },
};

export const PRACTICE_PRELUDE = `import pandas as pd
import numpy as np
pd.set_option("display.width", 88)
pd.set_option("display.max_columns", 12)
`;

/* SQL problems: the learner's query is stored, not run, when the cell
   executes (_SQL_EXEC = False). The judge then runs it once per hidden case,
   each against its own fresh SQLite database. Their setup defines
   _ref_sql (the reference query), and _example / _cases return dicts of
   {table name: DataFrame} instead of argument tuples. */
export const SQL_PRACTICE_PRELUDE = PRACTICE_PRELUDE + '_SQL_EXEC = False\n';

export const preludeFor = (p) => (p.lang === 'sql' ? SQL_PRACTICE_PRELUDE : PRACTICE_PRELUDE);
export const needsFor = (p) => (p.lang === 'sql' ? ['sqlite3'] : []);

const BASE = [

/* ════════════════════════════════ Easy ════════════════════════════════ */
{
  id: 'p01', difficulty: 'easy', tags: ['filtering', 'selection'],
  title: 'Busy days',
  prompt: [
    'You get a DataFrame `df` of daily sales with columns `date`, `city` and `cups`.',
    'Return the rows where **more than 40** cups were sold, keeping only the `date` and `cups` columns.',
  ],
  notes: ['Row order does not matter.', 'A day with exactly 40 cups is not busy.'],
  stub: 'def solution(df):\n    # return the busy days\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    return df.loc[df["cups"] > 40, ["date", "cups"]]

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"]),
        "city": ["Lagos", "Accra", "Lagos", "Nairobi"],
        "cups": [47, 18, 52, 40],
    }),)

def _cases():
    r = np.random.default_rng(1)
    big = pd.DataFrame({
        "date": pd.date_range("2024-02-01", periods=30, freq="D"),
        "city": r.choice(["Lagos", "Accra", "Nairobi"], 30),
        "cups": r.integers(5, 70, 30),
    })
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-03-01", "2024-03-02"]),
                       "city": ["Accra", "Lagos"], "cups": [40, 41]}),),
        (pd.DataFrame({"date": pd.to_datetime(["2024-03-05"]),
                       "city": ["Accra"], "cups": [12]}),),
        (big,),
    ]
`,
  hint: 'Build a mask with `df["cups"] > 40`, then pick the two columns with `df.loc[mask, [...]]`.',
  solution: 'def solution(df):\n    return df.loc[df["cups"] > 40, ["date", "cups"]]\n',
  alt: ['def solution(df):\n    return df[df["cups"] > 40][["date", "cups"]]\n'],
  wrong: [
    'def solution(df):\n    return df.loc[df["cups"] >= 40, ["date", "cups"]]\n',
    'def solution(df):\n    return df[df["cups"] > 40]\n',
  ],
},
{
  id: 'p02', difficulty: 'easy', tags: ['groupby', 'counting'],
  title: 'Rows per city',
  prompt: [
    'Given `df` with a `city` column, count how many rows belong to each city.',
    'Return a DataFrame with exactly two columns: `city` and `n`.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    return df.groupby("city").size().reset_index(name="n")

def _example():
    return (pd.DataFrame({
        "city": ["Lagos", "Accra", "Lagos", "Nairobi", "Accra"],
        "cups": [47, 18, 52, 40, 33],
    }),)

def _cases():
    r = np.random.default_rng(2)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi", "Kigali"], 40),
                        "cups": r.integers(5, 70, 40)})
    return [
        _example(),
        (pd.DataFrame({"city": ["Accra", "Accra", "Accra"], "cups": [1, 2, 3]}),),
        (big,),
    ]
`,
  hint: '`df.groupby("city").size()` counts rows per group. `reset_index(name="n")` turns it back into a table and names the count.',
  solution: 'def solution(df):\n    return df.groupby("city").size().reset_index(name="n")\n',
  alt: ['def solution(df):\n    return df["city"].value_counts().rename_axis("city").reset_index(name="n")\n'],
  wrong: ['def solution(df):\n    return df["city"].value_counts().reset_index()\n'],
},
{
  id: 'p03', difficulty: 'easy', tags: ['aggregation', 'missing data'],
  title: 'Average price',
  prompt: [
    'Given `df` with a `price` column, return the mean price **rounded to 2 decimal places**, as a number.',
    'Some prices are missing. Leave them out of the average rather than counting them as zero.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    return round(float(df["price"].mean()), 2)

def _example():
    return (pd.DataFrame({"drink": ["latte", "espresso", "tea", "mocha"],
                          "price": [4.50, 3.00, None, 2.75]}),)

def _cases():
    r = np.random.default_rng(3)
    p = np.round(r.uniform(2, 6, 25), 2)
    p[[3, 9, 17]] = np.nan
    return [
        _example(),
        (pd.DataFrame({"drink": ["tea", "tea"], "price": [2.0, 2.0]}),),
        (pd.DataFrame({"drink": ["latte"], "price": [4.25]}),),
        (pd.DataFrame({"drink": ["x"] * 25, "price": p}),),
    ]
`,
  hint: '`.mean()` already skips missing values. Then `round(value, 2)`.',
  solution: 'def solution(df):\n    return round(df["price"].mean(), 2)\n',
  alt: ['def solution(df):\n    return df["price"].mean().round(2)\n'],
  wrong: ['def solution(df):\n    return round(df["price"].fillna(0).mean(), 2)\n'],
},
{
  id: 'p04', difficulty: 'easy', tags: ['missing data'],
  title: 'Count the gaps',
  prompt: [
    'Return the number of missing values in the `rating` column of `df`, as an integer.',
    'Other columns may have gaps of their own. Only count `rating`.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    return int(df["rating"].isna().sum())

def _example():
    return (pd.DataFrame({"drink": ["latte", "tea", "mocha", "espresso", "tea"],
                          "rating": [4.5, None, 3.8, None, 4.1],
                          "note": ["ok", None, None, "great", None]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"drink": ["tea", "latte"], "rating": [4.0, 3.5], "note": [None, None]}),),
        (pd.DataFrame({"drink": ["tea", "latte", "mocha"], "rating": [None, None, None],
                       "note": ["a", "b", "c"]}),),
    ]
`,
  hint: '`df["rating"].isna()` gives True where a value is missing. True counts as 1 when you `.sum()` it.',
  solution: 'def solution(df):\n    return int(df["rating"].isna().sum())\n',
  alt: ['def solution(df):\n    return len(df) - df["rating"].count()\n'],
  wrong: ['def solution(df):\n    return int(df.isna().sum().sum())\n'],
},
{
  id: 'p05', difficulty: 'easy', tags: ['strings', 'cleaning'],
  title: 'Tidy the city names',
  prompt: [
    'The `city` column in `df` has stray spaces and random capitals — `"  lagos"`, `"ACCRA "`.',
    'Return `df` with every city stripped of surrounding spaces and written in title case (`"New York"`). Leave every other column alone and keep the rows in the same order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    out["city"] = out["city"].str.strip().str.title()
    return out

def _example():
    return (pd.DataFrame({"city": ["  lagos", "ACCRA ", "Nairobi", " new york  "],
                          "cups": [47, 18, 52, 30]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"city": ["Lagos", "Accra"], "cups": [1, 2]}),),
        (pd.DataFrame({"city": ["kIGALI", "  cape town", "SAO PAULO  ", "lagos"],
                       "cups": [3, 4, 5, 6]}),),
    ]
`,
  hint: 'Chain two string methods on the column: `.str.strip()` then `.str.title()`. Work on a `.copy()` so the input is not changed.',
  solution: 'def solution(df):\n    out = df.copy()\n    out["city"] = out["city"].str.strip().str.title()\n    return out\n',
  alt: ['def solution(df):\n    return df.assign(city=df["city"].str.strip().str.title())\n'],
  wrong: [
    'def solution(df):\n    out = df.copy()\n    out["city"] = out["city"].str.strip().str.capitalize()\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    out["city"] = out["city"].str.title()\n    return out\n',
  ],
},
{
  id: 'p06', difficulty: 'easy', tags: ['sorting', 'ties'],
  title: 'Top three days',
  prompt: [
    'Given `df` with columns `date` and `revenue`, return the **3** highest-revenue rows, keeping only `date` and `revenue`.',
    'Order them from highest revenue to lowest. When two days tie on revenue, the **earlier date** comes first. If there are fewer than 3 rows, return them all.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    return (df.sort_values(["revenue", "date"], ascending=[False, True])
              .head(3)[["date", "revenue"]])

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-05", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-01"]),
        "revenue": [100.0, 100.0, 200.0, 150.0, 80.0],
    }),)

def _cases():
    r = np.random.default_rng(6)
    big = pd.DataFrame({"date": pd.date_range("2024-03-01", periods=20, freq="D"),
                        "revenue": r.choice([90.0, 120.0, 150.0, 180.0], 20)})
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-01-02", "2024-01-01"]),
                       "revenue": [5.0, 9.0]}),),
        (big.sample(frac=1, random_state=4),),
    ]
`,
  hint: '`sort_values` can take two columns and two directions: `ascending=[False, True]`. Then `.head(3)`.',
  solution: 'def solution(df):\n    ranked = df.sort_values(["revenue", "date"], ascending=[False, True])\n    return ranked.head(3)[["date", "revenue"]]\n',
  alt: ['def solution(df):\n    return df.sort_values(["revenue", "date"], ascending=[False, True])[["date", "revenue"]].iloc[:3]\n'],
  wrong: ['def solution(df):\n    return df.nlargest(3, "revenue")[["date", "revenue"]]\n'],
},
{
  id: 'p07', difficulty: 'easy', tags: ['missing data'],
  title: 'Fill with the median',
  prompt: [
    'Some values in the `rating` column of `df` are missing.',
    'Return `df` with each missing rating replaced by the **median** of the ratings that are present. Keep the rows in the same order.',
  ],
  notes: ['Median, not mean. They are different numbers here.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    out["rating"] = out["rating"].fillna(out["rating"].median())
    return out

def _example():
    return (pd.DataFrame({"drink": ["latte", "tea", "mocha", "espresso", "chai"],
                          "rating": [5.0, None, 3.0, 3.5, None]}),)

def _cases():
    r = np.random.default_rng(7)
    vals = np.round(r.uniform(1, 5, 20), 1)
    vals[[2, 5, 11]] = np.nan
    return [
        _example(),
        (pd.DataFrame({"drink": ["tea", "latte"], "rating": [4.0, 2.0]}),),
        (pd.DataFrame({"drink": ["x"] * 20, "rating": vals}),),
    ]
`,
  hint: '`df["rating"].median()` gives the number. `.fillna(number)` puts it in the gaps.',
  solution: 'def solution(df):\n    out = df.copy()\n    out["rating"] = out["rating"].fillna(out["rating"].median())\n    return out\n',
  wrong: ['def solution(df):\n    out = df.copy()\n    out["rating"] = out["rating"].fillna(out["rating"].mean())\n    return out\n'],
},
{
  id: 'p08', difficulty: 'easy', tags: ['columns', 'selection'],
  title: 'Rename and reorder',
  prompt: [
    'Return a DataFrame with `cups` renamed to `units` and `price` renamed to `unit_price`.',
    'Keep only three columns, in exactly this order: `date`, `units`, `unit_price`.',
  ],
  notes: ['Column order matters for this one.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_strict',
  setup: `
def _ref(df):
    renamed = df.rename(columns={"cups": "units", "price": "unit_price"})
    return renamed[["date", "units", "unit_price"]]

def _example():
    return (pd.DataFrame({"city": ["Lagos", "Accra"],
                          "cups": [47, 18],
                          "date": pd.to_datetime(["2024-01-01", "2024-01-02"]),
                          "price": [4.5, 3.0]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"price": [2.5], "date": pd.to_datetime(["2024-05-01"]),
                       "cups": [9], "city": ["Kigali"]}),),
    ]
`,
  hint: '`df.rename(columns={"old": "new"})`, then select the columns with a list in the order you want.',
  solution: 'def solution(df):\n    out = df.rename(columns={"cups": "units", "price": "unit_price"})\n    return out[["date", "units", "unit_price"]]\n',
  wrong: [
    'def solution(df):\n    out = df.rename(columns={"cups": "units", "price": "unit_price"})\n    return out[["units", "unit_price", "date"]]\n',
    'def solution(df):\n    return df.rename(columns={"cups": "units", "price": "unit_price"})\n',
  ],
},
{
  id: 'p22', difficulty: 'easy', tags: ['mapping', 'missing data'],
  title: 'Decode the till',
  prompt: [
    'The till writes drinks as short codes. You get `df` with a `code` column, and `names` — a dict from code to drink name.',
    'Return `df` with a new column `drink` holding the name for each code. A code that is not in `names` gets the drink `"unknown"`. Keep the rows in the same order.',
  ],
  stub: 'def solution(df, names):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df, names):
    out = df.copy()
    out["drink"] = out["code"].map(names).fillna("unknown")
    return out

def _example():
    return (pd.DataFrame({"code": ["LT", "ES", "TE", "XX", "LT"], "cups": [3, 1, 2, 5, 4]}),
            {"LT": "latte", "ES": "espresso", "TE": "tea"})

def _cases():
    return [
        _example(),
        (pd.DataFrame({"code": ["MO", "MO"], "cups": [1, 2]}), {"LT": "latte"}),
        (pd.DataFrame({"code": ["CB", "LT", "ES"], "cups": [7, 8, 9]}),
         {"CB": "cold brew", "LT": "latte", "ES": "espresso"}),
    ]
`,
  hint: '`df["code"].map(names)` looks every code up in the dict. Codes it can\'t find come back missing, and `.fillna(...)` fills those in.',
  solution: 'def solution(df, names):\n    out = df.copy()\n    out["drink"] = out["code"].map(names).fillna("unknown")\n    return out\n',
  alt: ['def solution(df, names):\n    return df.assign(drink=df["code"].map(lambda c: names.get(c, "unknown")))\n'],
  wrong: [
    'def solution(df, names):\n    out = df.copy()\n    out["drink"] = out["code"].map(names)\n    return out\n',
    'def solution(df, names):\n    out = df.copy()\n    out["drink"] = out["code"].replace(names)\n    return out\n',
  ],
},
{
  id: 'p23', difficulty: 'easy', tags: ['filtering', 'counting', 'boundaries'],
  title: 'Four stars and up',
  prompt: [
    'Given `df` with a `rating` column (out of 5), return how many rows have a rating of **4 or more**, as an integer.',
    'Some ratings are missing. A missing rating is not a good rating.',
  ],
  notes: ['A rating of exactly 4.0 counts.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    return int((df["rating"] >= 4).sum())

def _example():
    return (pd.DataFrame({"drink": ["latte", "tea", "mocha", "espresso", "tea", "latte"],
                          "rating": [4.5, 4.0, 3.9, None, 5.0, 3.0]}),)

def _cases():
    r = np.random.default_rng(23)
    big = np.round(r.choice([2.5, 3.0, 3.5, 4.0, 4.5, 5.0], 30), 1)
    big[[2, 11, 20]] = np.nan
    return [
        _example(),
        (pd.DataFrame({"drink": ["tea", "tea"], "rating": [4.0, 4.0]}),),
        (pd.DataFrame({"drink": ["a", "b", "c"], "rating": [None, None, 2.0]}),),
        (pd.DataFrame({"drink": ["x"] * 30, "rating": big}),),
    ]
`,
  hint: '`df["rating"] >= 4` is True or False per row, and False for a missing rating. `.sum()` counts the Trues.',
  solution: 'def solution(df):\n    return int((df["rating"] >= 4).sum())\n',
  alt: ['def solution(df):\n    return len(df[df["rating"] >= 4])\n'],
  wrong: [
    'def solution(df):\n    return int((df["rating"] > 4).sum())\n',
    'def solution(df):\n    return int(len(df) - (df["rating"] < 4).sum())\n',
  ],
},
{
  id: 'p24', difficulty: 'easy', tags: ['unique', 'sorting', 'missing data'],
  title: 'Where do we sell?',
  prompt: [
    'Given `df` with a `city` column, return a **sorted list** of the distinct city names, each once.',
    'Some rows have no city recorded. Leave those out.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(df):
    return sorted(df["city"].dropna().unique().tolist())

def _example():
    return (pd.DataFrame({"city": ["Lagos", "Accra", None, "Lagos", "Nairobi", "Accra"],
                          "cups": [47, 18, 9, 52, 40, 33]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"city": ["Kigali", "Kigali", "Kigali"], "cups": [1, 2, 3]}),),
        (pd.DataFrame({"city": ["Tema", None, "Abuja", "Tema"], "cups": [4, 5, 6, 7]}),),
        (pd.DataFrame({"city": [None, None], "cups": [1, 2]}),),
    ]
`,
  hint: '`.dropna()` removes the missing ones, `.unique()` keeps each name once, and `sorted(...)` hands back a list in order.',
  solution: 'def solution(df):\n    return sorted(df["city"].dropna().unique())\n',
  alt: ['def solution(df):\n    return sorted(set(df["city"].dropna()))\n'],
  wrong: [
    'def solution(df):\n    return list(df["city"].dropna().unique())\n',
    'def solution(df):\n    return sorted(df["city"].unique())\n',
  ],
},
{
  id: 'p25', difficulty: 'easy', tags: ['concat', 'columns'],
  title: 'Stack two months',
  prompt: [
    'You get two DataFrames with the same columns, `jan` and `feb` — though not necessarily in the same column order.',
    'Return one DataFrame with all of January\'s rows followed by all of February\'s, plus a column `month` that says `"jan"` or `"feb"` for each row.',
  ],
  notes: ['Keep the rows in that order: January first.'],
  stub: 'def solution(jan, feb):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(jan, feb):
    return pd.concat([jan.assign(month="jan"), feb.assign(month="feb")], ignore_index=True)

def _example():
    return (pd.DataFrame({"city": ["Lagos", "Accra"], "cups": [47, 18]}),
            pd.DataFrame({"cups": [52, 40, 33], "city": ["Lagos", "Nairobi", "Accra"]}))

def _cases():
    r = np.random.default_rng(25)
    a = pd.DataFrame({"city": r.choice(["Lagos", "Accra"], 8), "cups": r.integers(5, 60, 8)})
    b = pd.DataFrame({"city": r.choice(["Nairobi", "Tema"], 5), "cups": r.integers(5, 60, 5)})
    return [
        _example(),
        (pd.DataFrame({"city": ["Tema"], "cups": [3]}), pd.DataFrame({"city": ["Tema"], "cups": [3]})),
        (a, b),
    ]
`,
  hint: 'Add the label to each table first — `jan.assign(month="jan")` — then glue them with `pd.concat([...], ignore_index=True)`.',
  solution: 'def solution(jan, feb):\n    jan = jan.assign(month="jan")\n    feb = feb.assign(month="feb")\n    return pd.concat([jan, feb], ignore_index=True)\n',
  alt: ['def solution(jan, feb):\n    jan = jan.copy()\n    feb = feb.copy()\n    jan["month"] = "jan"\n    feb["month"] = "feb"\n    return pd.concat([jan, feb]).reset_index(drop=True)\n'],
  wrong: [
    'def solution(jan, feb):\n    return pd.concat([jan, feb], ignore_index=True)\n',
    'def solution(jan, feb):\n    return pd.concat([feb.assign(month="feb"), jan.assign(month="jan")], ignore_index=True)\n',
  ],
},
{
  id: 'p26', difficulty: 'easy', tags: ['filtering', 'sorting', 'ties'],
  title: 'Biggest tickets first',
  prompt: [
    'Given `df` with columns `date`, `city` and `revenue`, return the rows where revenue is **over 100**, highest revenue first.',
    'When two rows have the same revenue, the earlier date comes first. Keep every column.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    big = df[df["revenue"] > 100]
    return big.sort_values(["revenue", "date"], ascending=[False, True])

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-04", "2024-01-02", "2024-01-03",
                                "2024-01-01", "2024-01-05", "2024-01-06"]),
        "city": ["Accra", "Lagos", "Lagos", "Nairobi", "Accra", "Lagos"],
        "revenue": [120.0, 80.0, 150.0, 120.0, 100.0, 210.0],
    }),)

def _cases():
    r = np.random.default_rng(26)
    big = pd.DataFrame({"date": pd.date_range("2024-02-01", periods=30, freq="D"),
                        "city": r.choice(["Lagos", "Accra"], 30),
                        "revenue": r.choice([90.0, 100.0, 120.0, 140.0, 180.0], 30)})
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-03-09", "2024-03-02"]),
                       "city": ["Tema", "Tema"], "revenue": [130.0, 130.0]}),),
        (big.sample(frac=1, random_state=4),),
    ]
`,
  hint: 'Filter with `df["revenue"] > 100`, then sort on two columns at once: `sort_values(["revenue", "date"], ascending=[False, True])`.',
  solution: 'def solution(df):\n    big = df[df["revenue"] > 100]\n    return big.sort_values(["revenue", "date"], ascending=[False, True])\n',
  alt: ['def solution(df):\n    return df.query("revenue > 100").sort_values(["revenue", "date"], ascending=[False, True])\n'],
  wrong: [
    'def solution(df):\n    return df[df["revenue"] > 100].sort_values("revenue", ascending=False)\n',
    'def solution(df):\n    return df[df["revenue"] >= 100].sort_values(["revenue", "date"], ascending=[False, True])\n',
  ],
},
{
  id: 'p27', difficulty: 'easy', tags: ['missing data', 'strings'],
  title: 'How many emails are missing?',
  prompt: [
    'Given `df` with an `email` column, return the **percentage** of rows with no usable email, rounded to 1 decimal place — `42.9`, not `0.429`.',
    'An email counts as missing if it is absent, empty (`""`), or nothing but spaces.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    blank = df["email"].isna() | (df["email"].str.strip() == "")
    return round(float(blank.mean() * 100), 1)

def _example():
    return (pd.DataFrame({"name": ["Ada", "Kofi", "Zola", "Ife", "Nia", "Tunde", "Amara"],
                          "email": ["ada@mail.com", None, "", "ife@mail.com", "nia@mail.com",
                                    None, "amara@mail.com"]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"name": ["Ada", "Kofi"], "email": ["a@m.com", "k@m.com"]}),),
        (pd.DataFrame({"name": ["Ada", "Kofi", "Zola"], "email": ["   ", None, "z@m.com"]}),),
        (pd.DataFrame({"name": ["Ada", "Kofi"], "email": [None, None]}),),
    ]
`,
  hint: 'Two conditions joined with `|`: `.isna()`, or `.str.strip() == ""`. The mean of True/False is a fraction; times 100 makes it a percentage.',
  solution: 'def solution(df):\n    blank = df["email"].isna() | (df["email"].str.strip() == "")\n    return round(blank.mean() * 100, 1)\n',
  alt: ['def solution(df):\n    e = df["email"].fillna("").str.strip()\n    return round((e == "").sum() / len(df) * 100, 1)\n'],
  wrong: [
    'def solution(df):\n    return round(df["email"].isna().mean() * 100, 1)\n',
    'def solution(df):\n    blank = df["email"].isna() | (df["email"] == "")\n    return round(blank.mean() * 100, 1)\n',
    'def solution(df):\n    blank = df["email"].isna() | (df["email"].str.strip() == "")\n    return round(blank.mean(), 1)\n',
  ],
},

/* ═══════════════════════════════ Medium ═══════════════════════════════ */
{
  id: 'p09', difficulty: 'medium', tags: ['groupby', 'ties'],
  title: 'Best drink in each city',
  prompt: [
    'Given `df` with columns `city`, `drink` and `revenue` (one row per sale), find the drink with the highest **total** revenue in each city.',
    'Return a DataFrame with columns `city` and `drink`, one row per city. If two drinks tie, pick the one that comes first alphabetically.',
  ],
  notes: ['Total per drink, not the single biggest sale.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    g = df.groupby(["city", "drink"], as_index=False)["revenue"].sum()
    g = g.sort_values(["city", "revenue", "drink"], ascending=[True, False, True])
    return g.drop_duplicates("city")[["city", "drink"]]

def _example():
    return (pd.DataFrame({
        "city":    ["Lagos", "Lagos", "Lagos", "Accra", "Accra",    "Accra"],
        "drink":   ["latte", "tea",   "latte", "tea",   "espresso", "espresso"],
        "revenue": [100.0,   120.0,   50.0,    90.0,    60.0,       40.0],
    }),)

def _cases():
    r = np.random.default_rng(9)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi"], 60),
                        "drink": r.choice(["latte", "tea", "mocha", "espresso"], 60),
                        "revenue": np.round(r.uniform(10, 200, 60), 2)})
    return [
        _example(),
        (pd.DataFrame({"city": ["Kigali", "Kigali"], "drink": ["tea", "latte"],
                       "revenue": [50.0, 50.0]}),),
        (pd.DataFrame({"city": ["Accra"], "drink": ["mocha"], "revenue": [9.0]}),),
        (big,),
    ]
`,
  hint: 'Sum first: `groupby(["city", "drink"])`. Then sort so the winner comes first in each city, and keep the first row per city with `drop_duplicates("city")`.',
  solution: 'def solution(df):\n    totals = df.groupby(["city", "drink"], as_index=False)["revenue"].sum()\n    totals = totals.sort_values(["city", "revenue", "drink"], ascending=[True, False, True])\n    return totals.drop_duplicates("city")[["city", "drink"]]\n',
  alt: ['def solution(df):\n    t = df.groupby(["city", "drink"])["revenue"].sum().reset_index()\n    t = t.sort_values(["revenue", "drink"], ascending=[False, True])\n    return t.groupby("city").head(1)[["city", "drink"]]\n'],
  wrong: ['def solution(df):\n    return df.loc[df.groupby("city")["revenue"].idxmax(), ["city", "drink"]]\n'],
},
{
  id: 'p10', difficulty: 'medium', tags: ['groupby', 'transform'],
  title: "Share of the city's takings",
  prompt: [
    'Given `df` with columns `city` and `revenue`, add a column `share`: each row\'s revenue divided by the **total revenue of its own city**, rounded to 3 decimal places.',
    'Keep every original column and the original row order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    city_total = out.groupby("city")["revenue"].transform("sum")
    out["share"] = (out["revenue"] / city_total).round(3)
    return out

def _example():
    return (pd.DataFrame({"city": ["Lagos", "Accra", "Lagos", "Accra", "Accra"],
                          "revenue": [100.0, 50.0, 300.0, 50.0, 100.0]}),)

def _cases():
    r = np.random.default_rng(10)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi"], 30),
                        "revenue": np.round(r.uniform(10, 300, 30), 2)})
    return [
        _example(),
        (pd.DataFrame({"city": ["Kigali", "Kigali", "Kigali"], "revenue": [1.0, 1.0, 2.0]}),),
        (big,),
    ]
`,
  hint: '`groupby("city")["revenue"].transform("sum")` gives each row its city\'s total, lined up with the original rows.',
  solution: 'def solution(df):\n    out = df.copy()\n    total = out.groupby("city")["revenue"].transform("sum")\n    out["share"] = (out["revenue"] / total).round(3)\n    return out\n',
  wrong: ['def solution(df):\n    out = df.copy()\n    out["share"] = (out["revenue"] / out["revenue"].sum()).round(3)\n    return out\n'],
},
{
  id: 'p11', difficulty: 'medium', tags: ['dates', 'resampling'],
  title: 'Month on month',
  prompt: [
    'Given `df` with columns `date` and `revenue` (one row per day, not necessarily sorted), return one row per calendar month, earliest first.',
    'Columns: `month` as text like `"2024-01"`, `revenue` as that month\'s total, and `change` — the fractional change from the previous month, rounded to 3 decimal places. The first month has no previous month, so its `change` is missing.',
  ],
  notes: ['The data can span more than one year.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    m = (df.assign(month=df["date"].dt.strftime("%Y-%m"))
           .groupby("month", as_index=False)["revenue"].sum()
           .sort_values("month").reset_index(drop=True))
    m["change"] = m["revenue"].pct_change().round(3)
    return m[["month", "revenue", "change"]]

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-10", "2024-01-20", "2024-02-05", "2024-03-01", "2024-03-15"]),
        "revenue": [100.0, 100.0, 300.0, 150.0, 150.0],
    }),)

def _cases():
    r = np.random.default_rng(11)
    days = pd.date_range("2023-06-01", "2024-07-31", freq="D")
    span = pd.DataFrame({"date": days, "revenue": np.round(r.uniform(50, 150, len(days)), 2)})
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-05-02", "2024-04-30", "2024-05-01"]),
                       "revenue": [10.0, 40.0, 30.0]}),),
        (pd.DataFrame({"date": pd.to_datetime(["2024-09-01", "2024-09-09"]),
                       "revenue": [5.0, 7.0]}),),
        (span.sample(frac=1, random_state=2),),
    ]
`,
  hint: '`df["date"].dt.strftime("%Y-%m")` gives a month label that also sorts correctly. Group on it, sum, then `.pct_change()`.',
  solution: 'def solution(df):\n    month = df["date"].dt.strftime("%Y-%m")\n    m = df.groupby(month)["revenue"].sum().rename_axis("month").reset_index()\n    m["change"] = m["revenue"].pct_change().round(3)\n    return m\n',
  wrong: ['def solution(df):\n    m = df.groupby(df["date"].dt.month)["revenue"].sum().rename_axis("month").reset_index()\n    m["change"] = m["revenue"].pct_change().round(3)\n    return m\n'],
},
{
  id: 'p12', difficulty: 'medium', tags: ['joins', 'missing data'],
  title: 'Everyone, even the quiet ones',
  prompt: [
    'You get two tables: `orders` with `customer_id` and `amount`, and `customers` with `customer_id` and `name`.',
    'Return the total amount spent by **every** customer — including customers with no orders, who should show a total of 0. Columns: `name` and `total`. Ignore orders whose `customer_id` is not in `customers`.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'def solution(orders, customers):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(orders, customers):
    totals = orders.groupby("customer_id", as_index=False)["amount"].sum()
    out = customers.merge(totals, on="customer_id", how="left")
    out["total"] = out["amount"].fillna(0.0)
    return out[["name", "total"]]

def _example():
    return (
        pd.DataFrame({"customer_id": [1, 2, 1, 9], "amount": [12.0, 5.5, 3.0, 40.0]}),
        pd.DataFrame({"customer_id": [1, 2, 3], "name": ["Ada", "Kofi", "Zola"]}),
    )

def _cases():
    r = np.random.default_rng(12)
    people = pd.DataFrame({"customer_id": range(1, 9),
                           "name": ["Ada", "Kofi", "Zola", "Ife", "Tunde", "Amara", "Nia", "Kwame"]})
    many = pd.DataFrame({"customer_id": r.integers(1, 12, 40),
                         "amount": np.round(r.uniform(2, 60, 40), 2)})
    none = pd.DataFrame({"customer_id": pd.Series([], dtype="int64"),
                         "amount": pd.Series([], dtype="float64")})
    return [
        _example(),
        (pd.DataFrame({"customer_id": [1, 2], "amount": [3.0, 4.0]}),
         pd.DataFrame({"customer_id": [1, 2], "name": ["Ada", "Kofi"]})),
        (none, pd.DataFrame({"customer_id": [5, 6], "name": ["Ife", "Tunde"]})),
        (many, people),
    ]
`,
  hint: 'Start from `customers` and join the orders onto it with `how="left"`, so nobody drops out. Missing totals become `NaN` — `fillna(0)` them.',
  solution: 'def solution(orders, customers):\n    totals = orders.groupby("customer_id", as_index=False)["amount"].sum()\n    out = customers.merge(totals, on="customer_id", how="left")\n    out["total"] = out["amount"].fillna(0)\n    return out[["name", "total"]]\n',
  alt: ['def solution(orders, customers):\n    joined = customers.merge(orders, on="customer_id", how="left")\n    return joined.groupby("name", as_index=False)["amount"].sum().rename(columns={"amount": "total"})\n'],
  wrong: ['def solution(orders, customers):\n    joined = pd.merge(orders, customers, on="customer_id")\n    return joined.groupby("name", as_index=False)["amount"].sum().rename(columns={"amount": "total"})\n'],
},
{
  id: 'p13', difficulty: 'medium', tags: ['sorting', 'edge cases'],
  title: 'Second-highest price',
  prompt: [
    'Return the second-highest **distinct** value in `df["price"]`.',
    'If there is no second-highest value — every price is the same, or there is only one — return `None`.',
  ],
  notes: ['Missing prices do not count.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    distinct = sorted(df["price"].dropna().unique(), reverse=True)
    return float(distinct[1]) if len(distinct) > 1 else None

def _example():
    return (pd.DataFrame({"drink": ["latte", "mocha", "flat white", "tea"],
                          "price": [3.00, 4.50, 4.50, 2.00]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"drink": ["tea", "tea"], "price": [2.0, 2.0]}),),
        (pd.DataFrame({"drink": ["latte"], "price": [4.0]}),),
        (pd.DataFrame({"drink": ["a", "b", "c", "d"], "price": [None, 5.0, 1.0, 5.0]}),),
        (pd.DataFrame({"drink": list("abcdef"), "price": [2.5, 9.0, 7.25, 9.0, 1.0, 7.25]}),),
    ]
`,
  hint: 'Get the distinct prices first (`.dropna().unique()`), sort them high to low, and check you actually have two before taking the second.',
  solution: 'def solution(df):\n    distinct = sorted(df["price"].dropna().unique(), reverse=True)\n    if len(distinct) < 2:\n        return None\n    return float(distinct[1])\n',
  alt: ['def solution(df):\n    top = df["price"].drop_duplicates().nlargest(2)\n    return float(top.iloc[1]) if len(top) > 1 else None\n'],
  wrong: ['def solution(df):\n    return df["price"].sort_values(ascending=False).iloc[1]\n'],
},
{
  id: 'p14', difficulty: 'medium', tags: ['reshaping', 'pivot'],
  title: 'Wide by subject',
  prompt: [
    'Given long-format `df` with columns `student`, `subject` and `score` — one row per student per subject — turn it wide.',
    'Return one row per student: a `student` column, then one column per subject holding that score. A student with no score for a subject gets a missing value there.',
  ],
  notes: ['Row order does not matter. `student` must be a column, not the index.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    return df.pivot(index="student", columns="subject", values="score").reset_index()

def _example():
    return (pd.DataFrame({
        "student": ["Ada", "Ada", "Kofi", "Kofi", "Zola"],
        "subject": ["maths", "physics", "maths", "physics", "maths"],
        "score":   [72, 68, 65, 71, 88],
    }),)

def _cases():
    grid = pd.DataFrame({
        "student": ["Ife", "Ife", "Ife", "Nia", "Nia", "Nia"],
        "subject": ["maths", "history", "art", "maths", "history", "art"],
        "score":   [55, 82, 64, 73, 60, 88],
    })
    return [
        _example(),
        (grid,),
        (pd.DataFrame({"student": ["Tunde"], "subject": ["maths"], "score": [91]}),),
    ]
`,
  hint: '`df.pivot(index="student", columns="subject", values="score")` does the turn. The students end up in the index — `reset_index()` brings them back as a column.',
  solution: 'def solution(df):\n    wide = df.pivot(index="student", columns="subject", values="score")\n    return wide.reset_index()\n',
  alt: ['def solution(df):\n    return df.pivot_table(index="student", columns="subject", values="score", aggfunc="first").reset_index()\n'],
  wrong: ['def solution(df):\n    return df.pivot(index="student", columns="subject", values="score")\n'],
},
{
  id: 'p15', difficulty: 'medium', tags: ['duplicates', 'dates'],
  title: 'Latest record wins',
  prompt: [
    'Given `df` with columns `user_id`, `updated_at` and `email`, a user can appear several times as their record was updated.',
    'Keep only each user\'s **most recent** row. Return columns `user_id` and `email`.',
  ],
  notes: ['The rows are not in time order.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    latest = df.sort_values("updated_at").drop_duplicates("user_id", keep="last")
    return latest[["user_id", "email"]]

def _example():
    return (pd.DataFrame({
        "user_id": [1, 2, 1, 3, 2],
        "updated_at": pd.to_datetime(["2024-03-01", "2024-01-15", "2024-01-10", "2024-02-02", "2024-02-20"]),
        "email": ["ada@new.io", "kofi@old.io", "ada@old.io", "zola@x.io", "kofi@new.io"],
    }),)

def _cases():
    r = np.random.default_rng(15)
    n = 30
    big = pd.DataFrame({"user_id": r.integers(1, 8, n),
                        "updated_at": pd.Timestamp("2024-01-01") + pd.to_timedelta(r.permutation(n), unit="D"),
                        "email": ["u%d@mail.io" % i for i in range(n)]})
    return [
        _example(),
        (pd.DataFrame({"user_id": [4, 5], "updated_at": pd.to_datetime(["2024-01-01", "2024-01-02"]),
                       "email": ["ife@x.io", "tunde@x.io"]}),),
        (big,),
    ]
`,
  hint: 'Sort by `updated_at` first, so the newest row is last for every user. Then `drop_duplicates("user_id", keep="last")`.',
  solution: 'def solution(df):\n    latest = df.sort_values("updated_at").drop_duplicates("user_id", keep="last")\n    return latest[["user_id", "email"]]\n',
  alt: ['def solution(df):\n    return df.loc[df.groupby("user_id")["updated_at"].idxmax(), ["user_id", "email"]]\n'],
  wrong: ['def solution(df):\n    return df.drop_duplicates("user_id", keep="last")[["user_id", "email"]]\n'],
},
{
  id: 'p16', difficulty: 'medium', tags: ['binning', 'boundaries'],
  title: 'Spend bands',
  prompt: [
    'Given `df` with a `spend` column, add a `band` column: `"low"` below 10, `"mid"` from 10 up to but **not including** 30, and `"high"` for 30 and over.',
    'Keep every original column and the row order.',
  ],
  notes: ['Exactly 10 is mid. Exactly 30 is high.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    out["band"] = pd.cut(out["spend"], bins=[-np.inf, 10, 30, np.inf],
                         labels=["low", "mid", "high"], right=False).astype(object)
    return out

def _example():
    return (pd.DataFrame({"customer": ["Ada", "Kofi", "Zola", "Ife", "Tunde"],
                          "spend": [4.0, 10.0, 29.99, 30.0, 55.5]}),)

def _cases():
    r = np.random.default_rng(16)
    big = pd.DataFrame({"customer": ["c%d" % i for i in range(25)],
                        "spend": np.round(r.uniform(0, 60, 25), 2)})
    return [
        _example(),
        (pd.DataFrame({"customer": ["a", "b"], "spend": [9.99, 10.0]}),),
        (big,),
    ]
`,
  hint: '`pd.cut` with `bins=[-np.inf, 10, 30, np.inf]` does the banding — but by default each band includes its RIGHT edge. `right=False` flips that.',
  solution: 'def solution(df):\n    out = df.copy()\n    out["band"] = pd.cut(out["spend"], bins=[-np.inf, 10, 30, np.inf],\n                         labels=["low", "mid", "high"], right=False)\n    return out\n',
  alt: ['def solution(df):\n    out = df.copy()\n    out["band"] = np.select([out["spend"] < 10, out["spend"] < 30], ["low", "mid"], default="high")\n    return out\n'],
  wrong: ['def solution(df):\n    out = df.copy()\n    out["band"] = pd.cut(out["spend"], bins=[-np.inf, 10, 30, np.inf], labels=["low", "mid", "high"])\n    return out\n'],
},
{
  id: 'p17', difficulty: 'medium', tags: ['ranking', 'groupby'],
  title: 'Dense rank within city',
  prompt: [
    'Given `df` with columns `city` and `revenue`, add an integer column `rank`: where each row\'s revenue ranks **within its own city**, highest first.',
    'Ties share a rank, and the next rank follows straight on with no gap — `1, 1, 2`, not `1, 1, 3`. Keep the original row order.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    out["rank"] = (out.groupby("city")["revenue"]
                      .rank(method="dense", ascending=False).astype(int))
    return out

def _example():
    return (pd.DataFrame({
        "city":    ["Lagos", "Lagos", "Lagos", "Lagos", "Accra", "Accra"],
        "revenue": [300.0,   150.0,   300.0,   90.0,    80.0,    120.0],
    }),)

def _cases():
    r = np.random.default_rng(17)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi"], 30),
                        "revenue": r.choice([50.0, 80.0, 120.0, 200.0], 30)})
    return [_example(), (big,)]
`,
  hint: '`groupby("city")["revenue"].rank(...)` ranks inside each city. Look at the `method=` options — one of them is exactly the no-gaps rule.',
  solution: 'def solution(df):\n    out = df.copy()\n    ranks = out.groupby("city")["revenue"].rank(method="dense", ascending=False)\n    out["rank"] = ranks.astype(int)\n    return out\n',
  wrong: [
    'def solution(df):\n    out = df.copy()\n    out["rank"] = out.groupby("city")["revenue"].rank(method="min", ascending=False).astype(int)\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    out["rank"] = out.groupby("city")["revenue"].rank(method="dense").astype(int)\n    return out\n',
  ],
},
{
  id: 'p28', difficulty: 'medium', tags: ['joins', 'anti-join'],
  title: 'Never ordered',
  prompt: [
    'You get `customers` with columns `id` and `name`, and `orders` with a `customer_id` column saying who placed each order.',
    'Return a **sorted list** of the names of customers who have never placed an order.',
  ],
  notes: ['Customer ids are not the same as the row numbers.'],
  stub: 'def solution(customers, orders):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(customers, orders):
    quiet = customers.loc[~customers["id"].isin(orders["customer_id"]), "name"]
    return sorted(quiet.tolist())

def _example():
    return (pd.DataFrame({"id": [101, 102, 103, 104], "name": ["Zola", "Tunde", "Kofi", "Ada"]}),
            pd.DataFrame({"customer_id": [101, 103, 101, 999], "drink": ["latte", "tea", "mocha", "tea"]}))

def _cases():
    people = pd.DataFrame({"id": [7, 3, 9, 1, 4], "name": ["Nia", "Ife", "Amara", "Ada", "Kofi"]})
    return [
        _example(),
        (people, pd.DataFrame({"customer_id": [7, 3, 9, 1, 4, 4], "drink": ["tea"] * 6})),
        (people, pd.DataFrame({"customer_id": pd.Series([], dtype="int64"),
                               "drink": pd.Series([], dtype="object")})),
        (people, pd.DataFrame({"customer_id": [0, 1, 2], "drink": ["tea", "latte", "chai"]})),
    ]
`,
  hint: '`customers["id"].isin(orders["customer_id"])` is True for anyone who ordered. Flip it with `~` to keep the others, then take their names.',
  solution: 'def solution(customers, orders):\n    ordered = customers["id"].isin(orders["customer_id"])\n    return sorted(customers.loc[~ordered, "name"])\n',
  alt: ['def solution(customers, orders):\n    m = customers.merge(orders, left_on="id", right_on="customer_id", how="left", indicator=True)\n    return sorted(m.loc[m["_merge"] == "left_only", "name"])\n'],
  wrong: [
    'def solution(customers, orders):\n    return list(customers.loc[~customers["id"].isin(orders["customer_id"]), "name"])\n',
    'def solution(customers, orders):\n    return sorted(customers.loc[~customers.index.isin(orders["customer_id"]), "name"])\n',
  ],
},
{
  id: 'p29', difficulty: 'medium', tags: ['groupby', 'cumulative', 'dates'],
  title: 'Running total per city',
  prompt: [
    'Given `df` with columns `date`, `city` and `revenue` — one row per city per day, **not** in date order — add a column `running`: that city\'s total revenue so far, up to and including that day.',
    'Keep the rows in their original order.',
  ],
  notes: ['"So far" means in date order, whatever order the rows arrive in.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    out = df.copy()
    in_order = out.sort_values("date")
    out["running"] = in_order.groupby("city")["revenue"].cumsum()
    return out

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-03", "2024-01-01", "2024-01-02", "2024-01-01", "2024-01-02"]),
        "city": ["Lagos", "Lagos", "Lagos", "Accra", "Accra"],
        "revenue": [30.0, 10.0, 20.0, 5.0, 7.0],
    }),)

def _cases():
    r = np.random.default_rng(29)
    parts = [pd.DataFrame({"date": pd.date_range("2024-02-01", periods=12, freq="D"), "city": c,
                           "revenue": np.round(r.uniform(10, 90, 12), 2)}) for c in ["Lagos", "Accra", "Tema"]]
    big = pd.concat(parts).sample(frac=1, random_state=2).reset_index(drop=True)
    return [_example(), (big,)]
`,
  hint: 'Sort a copy by date and do `groupby("city")["revenue"].cumsum()` on that. Assigning the result back to the original lines rows up by index, so the original order survives.',
  solution: 'def solution(df):\n    out = df.copy()\n    in_order = out.sort_values("date")\n    out["running"] = in_order.groupby("city")["revenue"].cumsum()\n    return out\n',
  alt: ['def solution(df):\n    d = df.sort_values("date").copy()\n    d["running"] = d.groupby("city")["revenue"].cumsum()\n    return d.sort_index()\n'],
  wrong: [
    'def solution(df):\n    out = df.copy()\n    out["running"] = out.groupby("city")["revenue"].cumsum()\n    return out\n',
    'def solution(df):\n    d = df.sort_values("date").copy()\n    d["running"] = d.groupby("city")["revenue"].cumsum()\n    return d\n',
    'def solution(df):\n    out = df.copy()\n    out["running"] = out.sort_values("date")["revenue"].cumsum()\n    return out\n',
  ],
},
{
  id: 'p30', difficulty: 'medium', tags: ['groupby', 'top-n', 'ties'],
  title: 'Top two drinks per city',
  prompt: [
    'Given `df` with columns `city`, `drink` and `revenue` — one row per sale — find each city\'s **two** best-selling drinks by total revenue.',
    'Return columns `city`, `drink` and `revenue` (the total). If drinks tie for a place, the one first in the alphabet wins it. A city with only one drink gets one row.',
  ],
  notes: ['Exactly two per city at most, even when there is a tie.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    t = df.groupby(["city", "drink"], as_index=False)["revenue"].sum()
    t = t.sort_values(["city", "revenue", "drink"], ascending=[True, False, True])
    return t.groupby("city").head(2)

def _example():
    return (pd.DataFrame({
        "city": ["Lagos", "Lagos", "Lagos", "Lagos", "Lagos", "Lagos", "Accra", "Accra"],
        "drink": ["latte", "latte", "mocha", "tea", "tea", "chai", "espresso", "espresso"],
        "revenue": [100.0, 50.0, 120.0, 70.0, 50.0, 20.0, 60.0, 40.0],
    }),)

def _cases():
    r = np.random.default_rng(30)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi"], 50),
                        "drink": r.choice(["latte", "tea", "mocha", "chai", "espresso"], 50),
                        "revenue": r.choice([10.0, 20.0, 30.0], 50)})
    return [
        _example(),
        (pd.DataFrame({"city": ["Tema"] * 3, "drink": ["tea", "chai", "latte"], "revenue": [5.0, 5.0, 5.0]}),),
        (big,),
    ]
`,
  hint: 'Total first with `groupby(["city", "drink"])`. Sort so each city\'s winners come first — revenue high to low, then drink A to Z — and `groupby("city").head(2)` keeps two per city.',
  solution: 'def solution(df):\n    t = df.groupby(["city", "drink"], as_index=False)["revenue"].sum()\n    t = t.sort_values(["city", "revenue", "drink"], ascending=[True, False, True])\n    return t.groupby("city").head(2)\n',
  alt: ['def solution(df):\n    t = df.groupby(["city", "drink"])["revenue"].sum().reset_index()\n    t = t.sort_values(["revenue", "drink"], ascending=[False, True])\n    return t.groupby("city").head(2)\n'],
  wrong: [
    'def solution(df):\n    return df.sort_values("revenue", ascending=False).groupby("city").head(2)\n',
    'def solution(df):\n    t = df.groupby(["city", "drink"], as_index=False)["revenue"].sum()\n    r = t.groupby("city")["revenue"].rank(method="dense", ascending=False)\n    return t[r <= 2]\n',
    'def solution(df):\n    t = df.groupby(["city", "drink"], as_index=False)["revenue"].sum()\n    t = t.sort_values(["city", "revenue", "drink"], ascending=[True, False, False])\n    return t.groupby("city").head(2)\n',
  ],
},
{
  id: 'p31', difficulty: 'medium', tags: ['dates', 'groupby', 'shift'],
  title: 'Days between visits',
  prompt: [
    'Given `df` with columns `customer` and `date` (one row per visit, unsorted), work out for every visit how many days it has been since that customer\'s **previous** visit.',
    'Return columns `customer`, `date` and `gap_days`, sorted by customer and then date. A customer\'s first visit has no previous one, so its `gap_days` is missing — not 0.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    d = df.sort_values(["customer", "date"]).reset_index(drop=True)
    d["gap_days"] = d.groupby("customer")["date"].diff().dt.days
    return d[["customer", "date", "gap_days"]]

def _example():
    return (pd.DataFrame({
        "customer": ["kofi", "ada", "ada", "kofi", "ada"],
        "date": pd.to_datetime(["2024-01-10", "2024-01-09", "2024-01-01", "2024-01-03", "2024-01-04"]),
        "drink": ["tea", "latte", "mocha", "tea", "latte"],
    }),)

def _cases():
    r = np.random.default_rng(31)
    rows = []
    for who in ["zola", "ife", "nia", "tunde"]:
        days = pd.to_datetime("2024-02-01") + pd.to_timedelta(np.sort(r.choice(60, 5, replace=False)), unit="D")
        rows.append(pd.DataFrame({"customer": who, "date": days, "drink": "tea"}))
    big = pd.concat(rows).sample(frac=1, random_state=6)
    return [
        _example(),
        (pd.DataFrame({"customer": ["ada"], "date": pd.to_datetime(["2024-03-01"]), "drink": ["tea"]}),),
        (big,),
    ]
`,
  hint: 'Sort by customer, then date. `groupby("customer")["date"].diff()` gives each visit the time since the one before it for the same customer, and `.dt.days` turns that into a number.',
  solution: 'def solution(df):\n    d = df.sort_values(["customer", "date"]).copy()\n    d["gap_days"] = d.groupby("customer")["date"].diff().dt.days\n    return d[["customer", "date", "gap_days"]]\n',
  alt: ['def solution(df):\n    d = df.sort_values(["customer", "date"]).copy()\n    before = d.groupby("customer")["date"].shift()\n    d["gap_days"] = (d["date"] - before).dt.days\n    return d[["customer", "date", "gap_days"]]\n'],
  wrong: [
    'def solution(df):\n    d = df.sort_values(["customer", "date"]).copy()\n    d["gap_days"] = d["date"].diff().dt.days\n    return d[["customer", "date", "gap_days"]]\n',
    'def solution(df):\n    d = df.sort_values(["customer", "date"]).copy()\n    d["gap_days"] = d.groupby("customer")["date"].diff().dt.days.fillna(0)\n    return d[["customer", "date", "gap_days"]]\n',
  ],
},
{
  id: 'p32', difficulty: 'medium', tags: ['groupby', 'aggregation', 'boundaries'],
  title: 'Busy and lucrative',
  prompt: [
    'Given `df` with columns `city` and `revenue` (one row per sale), return a **sorted list** of the cities that have **at least 3 sales** and an **average revenue above 150**.',
    'Both conditions are about the city as a whole — all of its sales.',
  ],
  notes: ['Exactly 3 sales is enough. An average of exactly 150 is not.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(df):
    g = df.groupby("city")["revenue"].agg(["count", "mean"])
    return sorted(g[(g["count"] >= 3) & (g["mean"] > 150)].index.tolist())

def _example():
    return (pd.DataFrame({
        "city": ["Lagos", "Lagos", "Lagos", "Accra", "Accra", "Nairobi", "Nairobi", "Nairobi", "Nairobi",
                 "Kigali", "Kigali", "Kigali", "Abuja", "Abuja", "Abuja", "Abuja"],
        "revenue": [200.0, 180.0, 100.0, 300.0, 290.0, 160.0, 170.0, 155.0, 90.0,
                    150.0, 150.0, 150.0, 400.0, 100.0, 100.0, 100.0],
    }),)

def _cases():
    r = np.random.default_rng(32)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi", "Tema", "Kigali", "Abuja"], 40),
                        "revenue": r.choice([80.0, 120.0, 150.0, 200.0, 260.0], 40)})
    return [
        _example(),
        (pd.DataFrame({"city": ["Tema", "Tema"], "revenue": [500.0, 600.0]}),),
        (big,),
    ]
`,
  hint: 'One `groupby("city")`, two numbers per city: `.agg(["count", "mean"])`. Then keep the rows where both conditions hold and take the index.',
  solution: 'def solution(df):\n    g = df.groupby("city")["revenue"].agg(["count", "mean"])\n    keep = (g["count"] >= 3) & (g["mean"] > 150)\n    return sorted(g[keep].index)\n',
  alt: ['def solution(df):\n    g = df.groupby("city")["revenue"]\n    ok = (g.size() >= 3) & (g.mean() > 150)\n    return sorted(ok[ok].index)\n'],
  wrong: [
    'def solution(df):\n    big = df[df["revenue"] > 150].groupby("city").size()\n    return sorted(big[big >= 3].index)\n',
    'def solution(df):\n    g = df.groupby("city")["revenue"].agg(["count", "mean"])\n    return sorted(g[(g["count"] > 3) & (g["mean"] > 150)].index)\n',
    'def solution(df):\n    g = df.groupby("city")["revenue"].agg(["count", "mean"])\n    return sorted(g[(g["count"] >= 3) & (g["mean"] >= 150)].index)\n',
  ],
},
{
  id: 'p33', difficulty: 'medium', tags: ['strings', 'explode', 'cleaning'],
  title: 'Unpack the extras',
  prompt: [
    'Given `df` with columns `order_id` and `tags` — free text like `"Oat, extra shot"`, typed by hand — return one row per order per tag, with columns `order_id` and `tag`.',
    'Tags are separated by commas. Strip the spaces around each one and lowercase it; drop empty tags; and if an order lists the same tag twice, keep it once. Some orders have no tags at all.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    d = df.assign(tag=df["tags"].str.split(",")).explode("tag")
    d["tag"] = d["tag"].str.strip().str.lower()
    d = d[d["tag"].notna() & (d["tag"] != "")]
    return d[["order_id", "tag"]].drop_duplicates()

def _example():
    return (pd.DataFrame({
        "order_id": [1, 2, 3, 4],
        "tags": ["Oat, extra shot", "  vanilla ,OAT,", None, "Extra Shot, extra shot"],
    }),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"order_id": [7, 8], "tags": ["decaf", "ICED,  decaf , iced"]}),),
        (pd.DataFrame({"order_id": [9, 10, 11], "tags": [",", "oat", ""]}),),
    ]
`,
  hint: '`.str.split(",")` makes a list per row, and `.explode(...)` gives every list item its own row. Then clean with `.str.strip().str.lower()`, filter out the blanks, and `drop_duplicates()`.',
  solution: 'def solution(df):\n    d = df.assign(tag=df["tags"].str.split(",")).explode("tag")\n    d["tag"] = d["tag"].str.strip().str.lower()\n    d = d[d["tag"].notna() & (d["tag"] != "")]\n    return d[["order_id", "tag"]].drop_duplicates()\n',
  alt: ['def solution(df):\n    rows = []\n    for oid, tags in zip(df["order_id"], df["tags"]):\n        if not isinstance(tags, str):\n            continue\n        for t in tags.split(","):\n            t = t.strip().lower()\n            if t and (oid, t) not in rows:\n                rows.append((oid, t))\n    return pd.DataFrame(rows, columns=["order_id", "tag"])\n'],
  wrong: [
    'def solution(df):\n    d = df.assign(tag=df["tags"].str.split(",")).explode("tag")\n    d["tag"] = d["tag"].str.lower()\n    d = d[d["tag"].notna() & (d["tag"] != "")]\n    return d[["order_id", "tag"]].drop_duplicates()\n',
    'def solution(df):\n    d = df.assign(tag=df["tags"].str.split(",")).explode("tag")\n    d["tag"] = d["tag"].str.strip().str.lower()\n    d = d[d["tag"].notna()]\n    return d[["order_id", "tag"]].drop_duplicates()\n',
    'def solution(df):\n    d = df.assign(tag=df["tags"].str.split(",")).explode("tag")\n    d["tag"] = d["tag"].str.strip().str.lower()\n    d = d[d["tag"].notna() & (d["tag"] != "")]\n    return d[["order_id", "tag"]]\n',
  ],
},

/* ════════════════════════════════ Hard ════════════════════════════════ */
{
  id: 'p18', difficulty: 'hard', tags: ['dates', 'runs'],
  title: 'Longest selling streak',
  prompt: [
    'Given `df` with columns `date` and `sold` — at most one row per date, not sorted, and with some dates missing entirely — return the length of the longest run of **consecutive calendar days** on which `sold` was above zero.',
    'A missing date breaks a run, just like a day with nothing sold. Return an integer, and `0` if nothing was ever sold.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    days = df.loc[df["sold"] > 0, "date"].sort_values().drop_duplicates()
    if days.empty:
        return 0
    run_id = (days.diff() != pd.Timedelta(days=1)).cumsum()
    return int(run_id.value_counts().max())

def _example():
    return (pd.DataFrame({
        "date": pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04",
                                "2024-01-06", "2024-01-07", "2024-01-08", "2024-01-09"]),
        "sold": [3, 5, 0, 2, 4, 1, 6, 2],
    }),)

def _cases():
    r = np.random.default_rng(18)
    days = pd.date_range("2024-01-01", periods=60, freq="D")
    keep = r.random(60) > 0.15
    big = pd.DataFrame({"date": days[keep], "sold": r.integers(0, 4, int(keep.sum()))})
    return [
        _example(),
        (pd.DataFrame({"date": pd.to_datetime(["2024-05-03", "2024-05-01", "2024-05-02"]),
                       "sold": [1, 2, 3]}),),
        (pd.DataFrame({"date": pd.to_datetime(["2024-05-01", "2024-05-02"]), "sold": [0, 0]}),),
        (pd.DataFrame({"date": pd.to_datetime(["2024-05-01"]), "sold": [7]}),),
        (big.sample(frac=1, random_state=5),),
    ]
`,
  hint: 'Keep only the selling days and sort them. A new run starts wherever the gap to the previous day is not exactly one day — `diff()` finds the gaps, and a `cumsum()` of "is this a new run?" gives every run its own id.',
  solution: 'def solution(df):\n    days = df.loc[df["sold"] > 0, "date"].sort_values()\n    if days.empty:\n        return 0\n    new_run = days.diff() != pd.Timedelta(days=1)\n    run_id = new_run.cumsum()\n    return int(run_id.value_counts().max())\n',
  wrong: ['def solution(df):\n    best = run = 0\n    for sold in df.sort_values("date")["sold"]:\n        run = run + 1 if sold > 0 else 0\n        best = max(best, run)\n    return best\n'],
},
{
  id: 'p19', difficulty: 'hard', tags: ['rolling', 'time windows', 'groupby'],
  title: 'Seven-day average per store',
  prompt: [
    'Given `df` with columns `store`, `date` and `sales` — one row per store per trading day, unsorted, and stores do not trade every day — compute `avg7`: the mean of that store\'s sales over the **7 calendar days ending on that date**.',
    'Days a store did not trade simply are not in the window. Round `avg7` to 2 decimal places. Return columns `store`, `date`, `avg7`, sorted by store and then date.',
  ],
  notes: ['Seven calendar days, not seven rows.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    parts = []
    for store, g in df.groupby("store", sort=True):
        g = g.sort_values("date").set_index("date")
        avg = g["sales"].rolling("7D").mean().round(2)
        parts.append(pd.DataFrame({"store": store, "date": avg.index, "avg7": avg.values}))
    return pd.concat(parts, ignore_index=True)

def _example():
    return (pd.DataFrame({
        "store": ["A", "A", "A", "A", "B", "B"],
        "date": pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-05", "2024-01-09",
                                "2024-01-01", "2024-01-03"]),
        "sales": [10.0, 20.0, 30.0, 40.0, 5.0, 15.0],
    }),)

def _cases():
    r = np.random.default_rng(19)
    rows = []
    for store in ["N", "S", "E"]:
        days = pd.date_range("2024-02-01", periods=40, freq="D")
        days = days[r.random(40) > 0.3]
        rows.append(pd.DataFrame({"store": store, "date": days,
                                  "sales": np.round(r.uniform(20, 90, len(days)), 2)}))
    big = pd.concat(rows, ignore_index=True).sample(frac=1, random_state=9)
    return [_example(), (big,)]
`,
  hint: 'A time-based window is written as a string: `.rolling("7D")`. It needs the dates in the index and in order — so sort, `set_index("date")`, and do it store by store.',
  solution: 'def solution(df):\n    parts = []\n    for store, g in df.groupby("store"):\n        g = g.sort_values("date").set_index("date")\n        avg = g["sales"].rolling("7D").mean().round(2)\n        parts.append(pd.DataFrame({"store": store, "date": avg.index, "avg7": avg.values}))\n    return pd.concat(parts, ignore_index=True)\n',
  wrong: ['def solution(df):\n    d = df.sort_values(["store", "date"]).copy()\n    d["avg7"] = d.groupby("store")["sales"].transform(lambda s: s.rolling(7, min_periods=1).mean()).round(2)\n    return d[["store", "date", "avg7"]].reset_index(drop=True)\n'],
},
{
  id: 'p20', difficulty: 'hard', tags: ['groupby', 'sets'],
  title: 'Bought the whole menu',
  prompt: [
    'You get `orders` with columns `customer` and `drink`, and `menu` — a plain Python list of drinks.',
    'Return a **sorted list** of the customers who have ordered every drink on the menu at least once. Drinks that are not on the menu do not count towards anything.',
  ],
  notes: ['The menu might list a drink twice.'],
  stub: 'def solution(orders, menu):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(orders, menu):
    wanted = set(menu)
    tried = orders[orders["drink"].isin(wanted)].groupby("customer")["drink"].nunique()
    return sorted(tried[tried == len(wanted)].index.tolist())

def _example():
    return (
        pd.DataFrame({"customer": ["Ada", "Ada", "Ada", "Kofi", "Kofi", "Zola", "Zola", "Zola"],
                      "drink":    ["latte", "tea", "mocha", "latte", "tea", "tea", "latte", "chai"]}),
        ["latte", "tea", "mocha"],
    )

def _cases():
    r = np.random.default_rng(20)
    big = pd.DataFrame({"customer": r.choice(["Ada", "Kofi", "Zola", "Ife", "Tunde", "Amara"], 60),
                        "drink": r.choice(["latte", "tea", "mocha", "chai"], 60)})
    return [
        _example(),
        (pd.DataFrame({"customer": ["Ada", "Ada", "Kofi"], "drink": ["latte", "tea", "tea"]}),
         ["latte", "tea", "latte"]),
        (pd.DataFrame({"customer": ["Ada", "Kofi"], "drink": ["latte", "latte"]}),
         ["latte", "tea"]),
        (big, ["latte", "tea", "mocha"]),
    ]
`,
  hint: 'Throw away off-menu orders first with `.isin(menu)`. Then count distinct drinks per customer with `.nunique()`, and compare against the number of distinct drinks on the menu — `len(set(menu))`.',
  solution: 'def solution(orders, menu):\n    wanted = set(menu)\n    on_menu = orders[orders["drink"].isin(wanted)]\n    tried = on_menu.groupby("customer")["drink"].nunique()\n    return sorted(tried[tried == len(wanted)].index)\n',
  wrong: [
    'def solution(orders, menu):\n    tried = orders.groupby("customer")["drink"].nunique()\n    return sorted(tried[tried >= len(menu)].index)\n',
    'def solution(orders, menu):\n    on_menu = orders[orders["drink"].isin(menu)]\n    tried = on_menu.groupby("customer")["drink"].nunique()\n    return sorted(tried[tried == len(menu)].index)\n',
  ],
},
{
  id: 'p21', difficulty: 'hard', tags: ['sessions', 'dates', 'groupby'],
  title: 'Split clicks into sessions',
  prompt: [
    'Given `events` with columns `user` and `ts` (a timestamp per click, unsorted), split each user\'s clicks into sessions. A gap of **more than 30 minutes** since that user\'s previous click starts a new session.',
    'Number each user\'s sessions 1, 2, 3… in time order. Return columns `user`, `session` and `events` — how many clicks were in that session.',
  ],
  notes: ['A gap of exactly 30 minutes stays in the same session.', 'Row order does not matter.'],
  stub: 'def solution(events):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(events):
    d = events.sort_values(["user", "ts"]).copy()
    gap = d.groupby("user")["ts"].diff()
    starts = gap.isna() | (gap > pd.Timedelta(minutes=30))
    d["session"] = starts.groupby(d["user"]).cumsum().astype(int)
    return d.groupby(["user", "session"]).size().reset_index(name="events")

def _example():
    return (pd.DataFrame({
        "user": ["ada", "ada", "ada", "ada", "kofi", "kofi"],
        "ts": pd.to_datetime(["2024-01-01 09:00", "2024-01-01 09:30", "2024-01-01 10:01",
                              "2024-01-01 10:20", "2024-01-01 09:00", "2024-01-01 12:00"]),
    }),)

def _cases():
    r = np.random.default_rng(21)
    rows = []
    for user in ["zola", "ife", "nia"]:
        gaps = r.choice([5, 12, 30, 31, 45, 90], 15)
        ts = pd.Timestamp("2024-02-01 08:00") + pd.to_timedelta(np.cumsum(gaps), unit="min")
        rows.append(pd.DataFrame({"user": user, "ts": ts}))
    big = pd.concat(rows, ignore_index=True).sample(frac=1, random_state=3)
    return [
        _example(),
        (pd.DataFrame({"user": ["ada"], "ts": pd.to_datetime(["2024-01-01 09:00"])}),),
        (big,),
    ]
`,
  hint: 'Sort by user then time. `groupby("user")["ts"].diff()` gives each click its gap from the previous one. A click starts a session if its gap is missing (first click) or over 30 minutes — and a running total of those starts, per user, is the session number.',
  solution: 'def solution(events):\n    d = events.sort_values(["user", "ts"]).copy()\n    gap = d.groupby("user")["ts"].diff()\n    new_session = gap.isna() | (gap > pd.Timedelta(minutes=30))\n    d["session"] = new_session.groupby(d["user"]).cumsum()\n    return d.groupby(["user", "session"]).size().reset_index(name="events")\n',
  wrong: ['def solution(events):\n    d = events.sort_values(["user", "ts"]).copy()\n    gap = d.groupby("user")["ts"].diff()\n    new_session = gap.isna() | (gap >= pd.Timedelta(minutes=30))\n    d["session"] = new_session.groupby(d["user"]).cumsum()\n    return d.groupby(["user", "session"]).size().reset_index(name="events")\n'],
},
{
  id: 'p34', difficulty: 'hard', tags: ['dates', 'merge_asof', 'joins'],
  title: 'The price at the time',
  prompt: [
    'Prices change during the day. `prices` logs every change, with columns `ts`, `drink` and `price` — from that moment on, that drink costs that much. `sales` has columns `ts`, `drink` and `cups`. Neither table is sorted.',
    'Return `sales` with a `price` column: the price that drink had **when it was sold**. If a sale happens at the exact moment of a change, the new price applies. A sale before a drink\'s first logged price gets a missing price. Columns `ts`, `drink`, `cups`, `price`, sorted by `ts`.',
  ],
  stub: 'def solution(sales, prices):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(sales, prices):
    s = sales.sort_values("ts")
    p = prices.sort_values("ts")
    out = pd.merge_asof(s, p, on="ts", by="drink", direction="backward")
    return out[["ts", "drink", "cups", "price"]]

def _example():
    return (
        pd.DataFrame({"ts": pd.to_datetime(["2024-01-01 11:00", "2024-01-01 08:30", "2024-01-01 10:59",
                                            "2024-01-01 12:30", "2024-01-01 10:00"]),
                      "drink": ["latte", "tea", "latte", "tea", "tea"],
                      "cups": [2, 1, 3, 4, 2]}),
        pd.DataFrame({"ts": pd.to_datetime(["2024-01-01 09:00", "2024-01-01 12:00",
                                            "2024-01-01 11:00", "2024-01-01 09:00"]),
                      "drink": ["latte", "tea", "latte", "tea"],
                      "price": [4.0, 3.0, 4.5, 2.5]}),
    )

def _cases():
    r = np.random.default_rng(34)
    start = pd.Timestamp("2024-03-01 07:00")
    sales = pd.DataFrame({"ts": start + pd.to_timedelta(np.sort(r.choice(600, 40, replace=False)), unit="min"),
                          "drink": r.choice(["latte", "tea", "mocha"], 40),
                          "cups": r.integers(1, 5, 40)})
    rows = []
    for drink in ["latte", "tea", "mocha"]:
        mins = np.sort(r.choice(600, 5, replace=False))
        rows.append(pd.DataFrame({"ts": start + pd.to_timedelta(mins, unit="min"), "drink": drink,
                                  "price": np.round(r.uniform(2, 6, 5), 2)}))
    prices = pd.concat(rows).sample(frac=1, random_state=1)
    return [
        _example(),
        (pd.DataFrame({"ts": pd.to_datetime(["2024-01-02 08:00"]), "drink": ["tea"], "cups": [1]}),
         pd.DataFrame({"ts": pd.to_datetime(["2024-01-02 09:00"]), "drink": ["tea"], "price": [2.0]})),
        (sales.sample(frac=1, random_state=8), prices),
    ]
`,
  hint: '`pd.merge_asof` joins each row to the latest row at or before it. It needs both tables sorted by `ts`, and `by="drink"` so a latte never picks up the price of a tea.',
  solution: 'def solution(sales, prices):\n    s = sales.sort_values("ts")\n    p = prices.sort_values("ts")\n    out = pd.merge_asof(s, p, on="ts", by="drink")\n    return out[["ts", "drink", "cups", "price"]]\n',
  alt: ['def solution(sales, prices):\n    out = sales.sort_values("ts").reset_index(drop=True)\n    found = []\n    for ts, drink in zip(out["ts"], out["drink"]):\n        before = prices[(prices["drink"] == drink) & (prices["ts"] <= ts)]\n        found.append(before.sort_values("ts")["price"].iloc[-1] if len(before) else np.nan)\n    out["price"] = found\n    return out[["ts", "drink", "cups", "price"]]\n'],
  wrong: [
    'def solution(sales, prices):\n    s = sales.sort_values("ts")\n    p = prices.sort_values("ts")\n    out = pd.merge_asof(s, p.drop(columns="drink"), on="ts")\n    return out[["ts", "drink", "cups", "price"]]\n',
    'def solution(sales, prices):\n    s = sales.sort_values("ts")\n    p = prices.sort_values("ts")\n    out = pd.merge_asof(s, p, on="ts", by="drink", direction="nearest")\n    return out[["ts", "drink", "cups", "price"]]\n',
    'def solution(sales, prices):\n    s = sales.sort_values("ts")\n    p = prices.sort_values("ts")\n    out = pd.merge_asof(s, p, on="ts", by="drink", allow_exact_matches=False)\n    return out[["ts", "drink", "cups", "price"]]\n',
  ],
},
{
  id: 'p35', difficulty: 'hard', tags: ['intervals', 'groupby', 'sorting'],
  title: 'Double-booked rooms',
  prompt: [
    'Given `bookings` with columns `room`, `start` and `end` (hours of the day, `start` < `end`, in no particular order), find the rooms where two bookings overlap.',
    'Return a **sorted list** of those rooms. One booking ending at 11 and the next starting at 11 is fine — touching is not overlapping. Bookings in different rooms never clash.',
  ],
  stub: 'def solution(bookings):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(bookings):
    bad = set()
    for room, g in bookings.groupby("room"):
        g = g.sort_values(["start", "end"])
        if (g["start"] < g["end"].cummax().shift()).any():
            bad.add(room)
    return sorted(bad)

def _example():
    return (pd.DataFrame({
        "room":  ["A", "B", "C", "A", "E", "D", "B", "E"],
        "start": [9,   14,  13,  11,  12,  8,   10,  9],
        "end":   [11,  16,  17,  12,  13,  9,   15,  10],
    }),)

def _cases():
    r = np.random.default_rng(35)
    rows = []
    for room in ["R1", "R2", "R3", "R4", "R5", "R6"]:
        starts = r.choice(range(8, 18), 3, replace=False)
        for s in starts:
            rows.append({"room": room, "start": int(s), "end": int(s + r.integers(1, 3))})
    big = pd.DataFrame(rows).sample(frac=1, random_state=7)
    return [
        _example(),
        (pd.DataFrame({"room": ["A"], "start": [9], "end": [10]}),),
        (pd.DataFrame({"room": ["A", "A"], "start": [9, 9], "end": [10, 10]}),),
        (pd.DataFrame({"room": ["Z", "Z", "Z"], "start": [8, 12, 9], "end": [18, 13, 10]}),),
        (big,),
    ]
`,
  hint: 'Deal with one room at a time (`groupby("room")`) and sort its bookings by start. Then any clash shows up between neighbours: a booking clashes if it starts before the previous one ended — `start < end.shift()`.',
  solution: 'def solution(bookings):\n    bad = []\n    for room, g in bookings.groupby("room"):\n        g = g.sort_values("start")\n        if (g["start"] < g["end"].shift()).any():\n            bad.append(room)\n    return sorted(bad)\n',
  alt: ['def solution(bookings):\n    b = bookings.reset_index(drop=True).reset_index()\n    pairs = b.merge(b, on="room")\n    pairs = pairs[pairs["index_x"] < pairs["index_y"]]\n    clash = (pairs["start_x"] < pairs["end_y"]) & (pairs["start_y"] < pairs["end_x"])\n    return sorted(pairs.loc[clash, "room"].unique())\n'],
  wrong: [
    'def solution(bookings):\n    bad = []\n    for room, g in bookings.groupby("room"):\n        g = g.sort_values("start")\n        if (g["start"] <= g["end"].shift()).any():\n            bad.append(room)\n    return sorted(bad)\n',
    'def solution(bookings):\n    bad = []\n    for room, g in bookings.groupby("room"):\n        if (g["start"] < g["end"].shift()).any():\n            bad.append(room)\n    return sorted(bad)\n',
    'def solution(bookings):\n    d = bookings.sort_values("start")\n    clash = d["start"] < d["end"].shift()\n    return sorted(d.loc[clash, "room"].unique())\n',
  ],
},
{
  id: 'p36', difficulty: 'hard', tags: ['cohorts', 'dates', 'groupby'],
  title: 'Did they come back?',
  prompt: [
    'Given `visits` with columns `customer` and `date` (unsorted, date only), put each customer in a **cohort**: the month of their first ever visit, written `"2024-01"`.',
    'A customer **returned** if they visited again on a later day within 30 days of that first visit. Return one row per cohort with columns `cohort`, `customers` (how many are in it) and `returned` (the share who returned, between 0 and 1, rounded to 2 places).',
  ],
  notes: ['A second visit on the same day as the first does not count.', 'Exactly 30 days later counts; 31 does not.', 'Row order does not matter.'],
  stub: 'def solution(visits):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(visits):
    first = visits.groupby("customer")["date"].min().rename("first")
    d = visits.join(first, on="customer")
    gap = (d["date"] - d["first"]).dt.days
    back = d.loc[(gap > 0) & (gap <= 30), "customer"].unique()
    out = first.reset_index()
    out["cohort"] = out["first"].dt.strftime("%Y-%m")
    out["back"] = out["customer"].isin(back)
    g = out.groupby("cohort").agg(customers=("customer", "size"), returned=("back", "mean")).reset_index()
    g["returned"] = g["returned"].round(2)
    return g

def _example():
    return (pd.DataFrame({
        "customer": ["ada", "kofi", "zola", "tunde", "ada", "kofi", "ife", "nia", "zola", "kofi", "nia", "tunde"],
        "date": pd.to_datetime(["2024-01-05", "2024-01-10", "2024-01-28", "2024-02-20", "2024-01-20",
                                "2024-01-10", "2024-02-02", "2024-02-10", "2024-02-27", "2024-02-15",
                                "2024-03-12", "2024-01-25"]),
    }),)

def _cases():
    r = np.random.default_rng(36)
    rows = []
    for i in range(30):
        first = pd.Timestamp("2024-01-01") + pd.Timedelta(days=int(r.integers(0, 90)))
        rows.append({"customer": "c%02d" % i, "date": first})
        for _ in range(int(r.integers(0, 3))):
            rows.append({"customer": "c%02d" % i,
                         "date": first + pd.Timedelta(days=int(r.choice([0, 12, 29, 30, 31, 45])))})
    big = pd.DataFrame(rows).sample(frac=1, random_state=2)
    return [
        _example(),
        (pd.DataFrame({"customer": ["solo"], "date": pd.to_datetime(["2024-05-09"])}),),
        (big,),
    ]
`,
  hint: 'First visit per customer is `groupby("customer")["date"].min()` — not `first()`, the rows are unsorted. Join it back on, measure each visit\'s gap in days, and a customer returned if any gap is over 0 and at most 30. Then group the customers by the month of their first visit.',
  solution: 'def solution(visits):\n    first = visits.groupby("customer")["date"].min().rename("first")\n    d = visits.join(first, on="customer")\n    gap = (d["date"] - d["first"]).dt.days\n    back = d.loc[(gap > 0) & (gap <= 30), "customer"].unique()\n    out = first.reset_index()\n    out["cohort"] = out["first"].dt.strftime("%Y-%m")\n    out["back"] = out["customer"].isin(back)\n    g = out.groupby("cohort").agg(customers=("customer", "size"), returned=("back", "mean")).reset_index()\n    g["returned"] = g["returned"].round(2)\n    return g\n',
  alt: ['def solution(visits):\n    rows = []\n    for cust, g in visits.groupby("customer"):\n        days = g["date"].sort_values()\n        gaps = (days - days.iloc[0]).dt.days\n        rows.append({"cohort": days.iloc[0].strftime("%Y-%m"),\n                     "back": bool(((gaps > 0) & (gaps <= 30)).any())})\n    t = pd.DataFrame(rows)\n    out = t.groupby("cohort")["back"].agg(["size", "mean"]).reset_index()\n    out.columns = ["cohort", "customers", "returned"]\n    out["returned"] = out["returned"].round(2)\n    return out\n'],
  wrong: [
    'def solution(visits):\n    first = visits.groupby("customer")["date"].min().rename("first")\n    d = visits.join(first, on="customer")\n    gap = (d["date"] - d["first"]).dt.days\n    back = d.loc[(gap >= 0) & (gap <= 30) & d.duplicated("customer"), "customer"].unique()\n    out = first.reset_index()\n    out["cohort"] = out["first"].dt.strftime("%Y-%m")\n    out["back"] = out["customer"].isin(back)\n    g = out.groupby("cohort").agg(customers=("customer", "size"), returned=("back", "mean")).reset_index()\n    g["returned"] = g["returned"].round(2)\n    return g\n',
    'def solution(visits):\n    first = visits.groupby("customer")["date"].min().rename("first")\n    d = visits.join(first, on="customer")\n    gap = (d["date"] - d["first"]).dt.days\n    back = d.loc[(gap > 0) & (gap < 30), "customer"].unique()\n    out = first.reset_index()\n    out["cohort"] = out["first"].dt.strftime("%Y-%m")\n    out["back"] = out["customer"].isin(back)\n    g = out.groupby("cohort").agg(customers=("customer", "size"), returned=("back", "mean")).reset_index()\n    g["returned"] = g["returned"].round(2)\n    return g\n',
    'def solution(visits):\n    first = visits.groupby("customer")["date"].first().rename("first")\n    d = visits.join(first, on="customer")\n    gap = (d["date"] - d["first"]).dt.days\n    back = d.loc[(gap > 0) & (gap <= 30), "customer"].unique()\n    out = first.reset_index()\n    out["cohort"] = out["first"].dt.strftime("%Y-%m")\n    out["back"] = out["customer"].isin(back)\n    g = out.groupby("cohort").agg(customers=("customer", "size"), returned=("back", "mean")).reset_index()\n    g["returned"] = g["returned"].round(2)\n    return g\n',
  ],
},

/* ═════════════════════════════════ SQL ═════════════════════════════════ */
{
  id: 's01', difficulty: 'easy', lang: 'sql', tags: ['filtering', 'ordering'],
  title: 'Under three',
  prompt: [
    'You get a table `menu` with columns `drink` and `price`.',
    'Return `drink` and `price` for every drink costing **less than 3.00**, cheapest first. Drinks at the same price go in alphabetical order.',
  ],
  notes: ['Exactly 3.00 is not less than 3.00.'],
  stub: 'SELECT *\nFROM menu;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT drink, price FROM menu
WHERE price < 3
ORDER BY price, drink
"""

def _example():
    return {"menu": pd.DataFrame({
        "drink": ["latte", "mocha", "tea", "espresso", "water", "chai"],
        "price": [3.50, 2.50, 2.00, 3.00, 1.00, 2.50],
    })}

def _cases():
    return [
        _example(),
        {"menu": pd.DataFrame({"drink": ["zobo", "kunu", "chai", "flat white"],
                               "price": [2.0, 2.0, 2.0, 3.0]})},
        {"menu": pd.DataFrame({"drink": ["latte"], "price": [4.0]})},
    ]
`,
  hint: 'WHERE for the price, then ORDER BY two columns: price first, drink second.',
  solution: 'SELECT drink, price\nFROM menu\nWHERE price < 3\nORDER BY price, drink;\n',
  alt: ['SELECT drink, price FROM menu WHERE price < 3.0 ORDER BY 2, 1;\n'],
  wrong: [
    'SELECT drink, price\nFROM menu\nWHERE price <= 3\nORDER BY price, drink;\n',
    'SELECT drink, price\nFROM menu\nWHERE price < 3\nORDER BY price;\n',
    'SELECT drink, price\nFROM menu\nWHERE price < 3\nORDER BY price DESC, drink;\n',
  ],
},
{
  id: 's02', difficulty: 'easy', lang: 'sql', tags: ['group by', 'counting'],
  title: 'Orders per customer',
  prompt: [
    '`orders` has one row per order: `order_id`, `customer` and `drink`.',
    'Return one row per customer, with columns `customer` and `orders` — how many orders they placed.',
  ],
  notes: ['Name the count column exactly `orders`.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM orders;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT customer, COUNT(*) AS orders FROM orders GROUP BY customer"

def _example():
    return {"orders": pd.DataFrame({
        "order_id": [1, 2, 3, 4, 5, 6],
        "customer": ["Ada", "Kofi", "Ada", "Zola", "Ada", "Kofi"],
        "drink": ["latte", "latte", "tea", "mocha", "latte", "tea"],
    })}

def _cases():
    r = np.random.default_rng(102)
    n = 30
    big = pd.DataFrame({"order_id": list(range(1, n + 1)),
                        "customer": r.choice(["Ada", "Kofi", "Zola", "Ife"], n).tolist(),
                        "drink": r.choice(["latte", "tea"], n).tolist()})
    return [
        _example(),
        {"orders": pd.DataFrame({"order_id": [9], "customer": ["Nia"], "drink": ["tea"]})},
        {"orders": big},
    ]
`,
  hint: 'GROUP BY customer, COUNT(*) per group, and AS to name it.',
  solution: 'SELECT customer, COUNT(*) AS orders\nFROM orders\nGROUP BY customer;\n',
  alt: ['SELECT customer, COUNT(order_id) AS orders FROM orders GROUP BY 1;\n'],
  wrong: [
    'SELECT customer, COUNT(*)\nFROM orders\nGROUP BY customer;\n',
    'SELECT customer, COUNT(DISTINCT drink) AS orders\nFROM orders\nGROUP BY customer;\n',
  ],
},
{
  id: 's03', difficulty: 'easy', lang: 'sql', tags: ['NULL', 'strings'],
  title: 'No phone on file',
  prompt: [
    "`customers` has `name` and `phone`. A missing phone is NULL — and a few were saved as an empty string `''` by mistake, which counts as missing too.",
    'Return the `name` of every customer with no phone, in alphabetical order.',
  ],
  stub: 'SELECT *\nFROM customers;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT name FROM customers WHERE phone IS NULL OR phone = '' ORDER BY name"

def _example():
    return {"customers": pd.DataFrame({
        "name": ["Zola", "Ada", "Kofi", "Ife", "Tunde"],
        "phone": [None, "0803 111 2222", "", None, "0701 555 0000"],
    })}

def _cases():
    return [
        _example(),
        {"customers": pd.DataFrame({"name": ["Ada", "Kofi"], "phone": ["0803 1", "0803 2"]})},
        {"customers": pd.DataFrame({"name": ["Nia", "Amara", "Kwame"], "phone": ["", "0805 9", ""]})},
        {"customers": pd.DataFrame({"name": ["Tunde", "Ife"], "phone": [None, None]})},
    ]
`,
  hint: '`= NULL` is never true. Use `IS NULL`, and `OR` for the empty string.',
  solution: "SELECT name\nFROM customers\nWHERE phone IS NULL OR phone = ''\nORDER BY name;\n",
  alt: ["SELECT name FROM customers WHERE COALESCE(phone, '') = '' ORDER BY name;\n"],
  wrong: [
    "SELECT name\nFROM customers\nWHERE phone = NULL OR phone = ''\nORDER BY name;\n",
    'SELECT name\nFROM customers\nWHERE phone IS NULL\nORDER BY name;\n',
    "SELECT name\nFROM customers\nWHERE phone IS NULL OR phone = '';\n",
  ],
},
{
  id: 's04', difficulty: 'easy', lang: 'sql', tags: ['ordering', 'limit', 'ties'],
  title: 'Three biggest sales',
  prompt: [
    '`sales` has `sale_id` and `amount`.',
    'Return `sale_id` and `amount` for the **3** largest sales, biggest first. When two amounts tie, the smaller `sale_id` comes first. With fewer than 3 sales, return them all.',
  ],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT sale_id, amount FROM sales ORDER BY amount DESC, sale_id LIMIT 3"

def _example():
    return {"sales": pd.DataFrame({"sale_id": [9, 3, 7, 1, 5],
                                   "amount": [120.0, 80.0, 120.0, 200.0, 95.0]})}

def _cases():
    return [
        _example(),
        {"sales": pd.DataFrame({"sale_id": [4, 2], "amount": [10.0, 30.0]})},
        {"sales": pd.DataFrame({"sale_id": [8, 6, 4, 2], "amount": [50.0, 50.0, 50.0, 10.0]})},
    ]
`,
  hint: 'ORDER BY amount DESC, then sale_id for the ties — and LIMIT 3 last.',
  solution: 'SELECT sale_id, amount\nFROM sales\nORDER BY amount DESC, sale_id\nLIMIT 3;\n',
  alt: ['SELECT sale_id, amount FROM sales ORDER BY -amount, sale_id LIMIT 3;\n'],
  wrong: [
    'SELECT sale_id, amount\nFROM sales\nORDER BY amount DESC\nLIMIT 3;\n',
    'SELECT sale_id, amount\nFROM sales\nORDER BY amount, sale_id\nLIMIT 3;\n',
    'SELECT sale_id, amount\nFROM sales\nORDER BY amount DESC, sale_id DESC\nLIMIT 3;\n',
  ],
},
{
  id: 's05', difficulty: 'medium', lang: 'sql', tags: ['group by', 'having', 'boundaries'],
  title: 'Cities that pulled their weight',
  prompt: [
    '`sales` has one row per sale: `city` and `amount`.',
    'Return `city` and `total` — the sum of its sales — for every city whose total is **at least 500**.',
  ],
  notes: ['Exactly 500 counts.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT city, SUM(amount) AS total FROM sales GROUP BY city HAVING SUM(amount) >= 500"

def _example():
    return {"sales": pd.DataFrame({
        "city": ["Lagos", "Accra", "Nairobi", "Lagos", "Accra", "Tema", "Tema"],
        "amount": [300.0, 200.0, 600.0, 250.0, 300.0, 100.0, 150.0],
    })}

def _cases():
    r = np.random.default_rng(105)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Nairobi", "Tema", "Kigali"], 40).tolist(),
                        "amount": r.choice([50.0, 100.0, 125.0, 250.0], 40).tolist()})
    return [
        _example(),
        {"sales": pd.DataFrame({"city": ["Tema", "Tema"], "amount": [100.0, 399.0]})},
        {"sales": big},
    ]
`,
  hint: "A condition on a SUM can't go in WHERE — WHERE sees one row at a time. Put it in HAVING, after GROUP BY.",
  solution: 'SELECT city, SUM(amount) AS total\nFROM sales\nGROUP BY city\nHAVING SUM(amount) >= 500;\n',
  alt: ['SELECT city, SUM(amount) AS total FROM sales GROUP BY city HAVING total >= 500;\n'],
  wrong: [
    'SELECT city, SUM(amount) AS total\nFROM sales\nWHERE amount >= 500\nGROUP BY city;\n',
    'SELECT city, SUM(amount) AS total\nFROM sales\nGROUP BY city\nHAVING SUM(amount) > 500;\n',
  ],
},
{
  id: 's06', difficulty: 'medium', lang: 'sql', tags: ['joins', 'NULL', 'anti-join'],
  title: 'Never ordered, in SQL',
  prompt: [
    '`customers` has `id` and `name`. `orders` has `order_id` and `customer_id` — and guest checkouts leave `customer_id` empty (NULL).',
    'Return the `name` of every customer who has never placed an order, in alphabetical order.',
  ],
  notes: ['Guest orders belong to nobody.'],
  stub: 'SELECT *\nFROM customers;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.order_id IS NULL
ORDER BY c.name
"""

def _example():
    return {
        "customers": pd.DataFrame({"id": [1, 2, 3, 4], "name": ["Zola", "Tunde", "Kofi", "Ada"]}),
        # Int64, not float: ids should read 1, 3 - with a real NULL for the guest
        "orders": pd.DataFrame({"order_id": [10, 11, 12, 13],
                                "customer_id": pd.array([1, 3, None, 1], dtype="Int64")}),
    }

def _cases():
    people = pd.DataFrame({"id": [7, 3, 9, 1], "name": ["Nia", "Ife", "Amara", "Kwame"]})
    return [
        _example(),
        {"customers": people, "orders": pd.DataFrame({"order_id": [1, 2, 3, 4], "customer_id": [7, 3, 9, 1]})},
        {"customers": people, "orders": pd.DataFrame({"order_id": pd.Series([], dtype="int64"),
                                                      "customer_id": pd.Series([], dtype="float64")})},
        {"customers": people, "orders": pd.DataFrame({"order_id": [5, 6],
                                                      "customer_id": pd.array([None, 9], dtype="Int64")})},
    ]
`,
  hint: '`NOT IN (SELECT customer_id ...)` breaks as soon as that list holds a NULL: nothing is ever "not in" an unknown. LEFT JOIN the orders and keep the customers where no order matched — or filter the NULLs out first.',
  solution: 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.order_id IS NULL\nORDER BY c.name;\n',
  alt: [
    'SELECT name FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.id) ORDER BY name;\n',
    'SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL) ORDER BY name;\n',
  ],
  wrong: [
    'SELECT name\nFROM customers\nWHERE id NOT IN (SELECT customer_id FROM orders)\nORDER BY name;\n',
    'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.order_id IS NULL;\n',
  ],
},
{
  id: 's07', difficulty: 'medium', lang: 'sql', tags: ['NULL', 'aggregation'],
  title: 'Ratings that count',
  prompt: [
    '`reviews` has `drink` and `rating`. Some reviews left the rating blank (NULL).',
    'For **every** drink that appears — even one nobody rated — return `drink`, `avg_rating` (the average of the ratings given, rounded to 2) and `rated` (how many ratings were actually given).',
  ],
  notes: ['A drink with no ratings has an average of NULL and a `rated` of 0.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM reviews;\n',
  mode: 'frame',
  setup: `
_ref_sql = "SELECT drink, ROUND(AVG(rating), 2) AS avg_rating, COUNT(rating) AS rated FROM reviews GROUP BY drink"

def _example():
    return {"reviews": pd.DataFrame({
        "drink": ["latte", "latte", "tea", "latte", "tea", "mocha"],
        "rating": [4.0, None, None, 5.0, None, 3.0],
    })}

def _cases():
    r = np.random.default_rng(107)
    rating = r.choice([2.0, 3.0, 4.0, 5.0], 30)
    rating[[1, 4, 9, 15, 22]] = np.nan
    big = pd.DataFrame({"drink": r.choice(["latte", "tea", "mocha", "chai"], 30).tolist(), "rating": rating})
    return [
        _example(),
        {"reviews": pd.DataFrame({"drink": ["chai", "chai"], "rating": [3.0, 4.0]})},
        {"reviews": big},
    ]
`,
  hint: '`AVG` already skips NULLs. `COUNT(*)` counts rows; `COUNT(rating)` counts only ratings that exist. And no WHERE — it would throw away the drink nobody rated.',
  solution: 'SELECT drink,\n       ROUND(AVG(rating), 2) AS avg_rating,\n       COUNT(rating) AS rated\nFROM reviews\nGROUP BY drink;\n',
  alt: ['SELECT drink, ROUND(SUM(rating) / COUNT(rating), 2) AS avg_rating, COUNT(rating) AS rated FROM reviews GROUP BY drink;\n'],
  wrong: [
    'SELECT drink, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS rated\nFROM reviews\nGROUP BY drink;\n',
    'SELECT drink, ROUND(AVG(COALESCE(rating, 0)), 2) AS avg_rating, COUNT(rating) AS rated\nFROM reviews\nGROUP BY drink;\n',
    'SELECT drink, ROUND(AVG(rating), 2) AS avg_rating, COUNT(rating) AS rated\nFROM reviews\nWHERE rating IS NOT NULL\nGROUP BY drink;\n',
  ],
},
{
  id: 's08', difficulty: 'medium', lang: 'sql', tags: ['dates', 'group by'],
  title: 'Month by month',
  prompt: [
    "`sales` has `sale_date` (text like `'2025-01-15'`) and `amount`. The sales run across a new year.",
    'Return `month` (like `2025-01`) and `total` — that month\'s sales — in month order.',
  ],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT strftime('%Y-%m', sale_date) AS month, SUM(amount) AS total
FROM sales
GROUP BY month
ORDER BY month
"""

def _example():
    return {"sales": pd.DataFrame({
        "sale_date": ["2024-12-30", "2025-01-02", "2024-12-05", "2025-12-01", "2025-01-15"],
        "amount": [10.0, 20.0, 5.0, 7.0, 1.0],
    })}

def _cases():
    r = np.random.default_rng(108)
    days = pd.Timestamp("2024-11-01") + pd.to_timedelta(r.integers(0, 420, 40), unit="D")
    big = pd.DataFrame({"sale_date": days.strftime("%Y-%m-%d").tolist(),
                        "amount": r.choice([5.0, 12.5, 20.0], 40).tolist()})
    return [
        _example(),
        {"sales": pd.DataFrame({"sale_date": ["2025-03-03"], "amount": [9.0]})},
        {"sales": big},
    ]
`,
  hint: "`strftime('%m', ...)` alone would lump December 2024 in with December 2025. `'%Y-%m'` keeps the year.",
  solution: "SELECT strftime('%Y-%m', sale_date) AS month,\n       SUM(amount) AS total\nFROM sales\nGROUP BY month\nORDER BY month;\n",
  alt: ['SELECT substr(sale_date, 1, 7) AS month, SUM(amount) AS total FROM sales GROUP BY month ORDER BY month;\n'],
  wrong: [
    "SELECT strftime('%m', sale_date) AS month,\n       SUM(amount) AS total\nFROM sales\nGROUP BY month\nORDER BY month;\n",
    'SELECT substr(sale_date, 6, 2) AS month, SUM(amount) AS total\nFROM sales\nGROUP BY month\nORDER BY month;\n',
  ],
},
{
  id: 's09', difficulty: 'medium', lang: 'sql', tags: ['CASE', 'boundaries'],
  title: 'Price bands',
  prompt: [
    '`menu` has `drink` and `price`. Put each drink in a band: `budget` under 3, `standard` from 3 up to and including 5, `premium` over 5.',
    'Return `band` and `drinks` — how many drinks are in it — for the bands that have any.',
  ],
  notes: ['3.00 is standard. 5.00 is standard too.', 'Row order does not matter.'],
  stub: 'SELECT *\nFROM menu;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT CASE WHEN price < 3 THEN 'budget'
            WHEN price <= 5 THEN 'standard'
            ELSE 'premium' END AS band,
       COUNT(*) AS drinks
FROM menu
GROUP BY band
"""

def _example():
    return {"menu": pd.DataFrame({
        "drink": ["tea", "espresso", "latte", "mocha", "flat white", "affogato", "water"],
        "price": [2.50, 3.00, 4.20, 5.00, 5.50, 6.75, 1.80],
    })}

def _cases():
    r = np.random.default_rng(109)
    big = pd.DataFrame({"drink": ["d%d" % i for i in range(25)],
                        "price": r.choice([2.0, 2.99, 3.0, 4.5, 5.0, 5.01, 7.0], 25).tolist()})
    return [
        _example(),
        {"menu": pd.DataFrame({"drink": ["tea", "water"], "price": [2.0, 1.0]})},
        {"menu": big},
    ]
`,
  hint: 'In a CASE the first matching WHEN wins, so test `price < 3` first, then `price <= 5`, and let ELSE catch the rest.',
  solution: "SELECT CASE WHEN price < 3 THEN 'budget'\n            WHEN price <= 5 THEN 'standard'\n            ELSE 'premium' END AS band,\n       COUNT(*) AS drinks\nFROM menu\nGROUP BY band;\n",
  alt: ["SELECT CASE WHEN price > 5 THEN 'premium' WHEN price >= 3 THEN 'standard' ELSE 'budget' END AS band, COUNT(*) AS drinks FROM menu GROUP BY 1;\n"],
  wrong: [
    "SELECT CASE WHEN price <= 3 THEN 'budget'\n            WHEN price <= 5 THEN 'standard'\n            ELSE 'premium' END AS band,\n       COUNT(*) AS drinks\nFROM menu\nGROUP BY band;\n",
    "SELECT CASE WHEN price < 3 THEN 'budget'\n            WHEN price < 5 THEN 'standard'\n            ELSE 'premium' END AS band,\n       COUNT(*) AS drinks\nFROM menu\nGROUP BY band;\n",
  ],
},
{
  id: 's10', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'ties'],
  title: 'Top rep, ties included',
  prompt: [
    '`sales` has `city`, `rep` and `amount` — one row per sale, so a rep appears many times.',
    'For each city, return the rep with the highest **total** sales: `city`, `rep`, `total`. If reps tie for the top, return all of them.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
WITH totals AS (
  SELECT city, rep, SUM(amount) AS total FROM sales GROUP BY city, rep
), ranked AS (
  SELECT city, rep, total, RANK() OVER (PARTITION BY city ORDER BY total DESC) AS r FROM totals
)
SELECT city, rep, total FROM ranked WHERE r = 1
"""

def _example():
    return {"sales": pd.DataFrame({
        "city": ["Lagos", "Lagos", "Lagos", "Lagos", "Accra", "Accra", "Accra"],
        "rep": ["Ada", "Kofi", "Ada", "Zola", "Nia", "Ife", "Nia"],
        "amount": [100.0, 150.0, 50.0, 90.0, 120.0, 200.0, 60.0],
    })}

def _cases():
    r = np.random.default_rng(110)
    big = pd.DataFrame({"city": r.choice(["Lagos", "Accra", "Tema"], 40).tolist(),
                        "rep": r.choice(["Ada", "Kofi", "Zola", "Ife", "Nia"], 40).tolist(),
                        "amount": r.choice([10.0, 20.0, 30.0], 40).tolist()})
    return [
        _example(),
        {"sales": pd.DataFrame({"city": ["Tema", "Tema", "Tema"], "rep": ["Ama", "Yaw", "Esi"],
                                "amount": [40.0, 40.0, 40.0]})},
        {"sales": big},
    ]
`,
  hint: 'Total per city and rep first. Then `RANK() OVER (PARTITION BY city ORDER BY total DESC)` — RANK gives ties the same number, so keep rank 1. `ROW_NUMBER` would split a tie.',
  solution: 'WITH totals AS (\n  SELECT city, rep, SUM(amount) AS total\n  FROM sales\n  GROUP BY city, rep\n), ranked AS (\n  SELECT city, rep, total,\n         RANK() OVER (PARTITION BY city ORDER BY total DESC) AS r\n  FROM totals\n)\nSELECT city, rep, total\nFROM ranked\nWHERE r = 1;\n',
  alt: ['WITH t AS (SELECT city, rep, SUM(amount) AS total FROM sales GROUP BY city, rep)\nSELECT city, rep, total FROM t\nWHERE total = (SELECT MAX(total) FROM t AS u WHERE u.city = t.city);\n'],
  wrong: [
    'WITH totals AS (\n  SELECT city, rep, SUM(amount) AS total FROM sales GROUP BY city, rep\n), ranked AS (\n  SELECT city, rep, total, ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC) AS r FROM totals\n)\nSELECT city, rep, total FROM ranked WHERE r = 1;\n',
    'SELECT city, rep, MAX(total) AS total\nFROM (SELECT city, rep, SUM(amount) AS total FROM sales GROUP BY city, rep)\nGROUP BY city;\n',
    'WITH ranked AS (\n  SELECT city, rep, amount AS total, RANK() OVER (PARTITION BY city ORDER BY amount DESC) AS r FROM sales\n)\nSELECT city, rep, total FROM ranked WHERE r = 1;\n',
  ],
},
{
  id: 's11', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'ordering', 'ties'],
  title: 'Running balance',
  prompt: [
    '`moves` is a bank ledger: `move_id`, `account`, `ts` (text like `\'2024-01-01 09:00\'`) and `amount` — deposits positive, withdrawals negative. Move ids were handed out later, so they are **not** in time order.',
    "Return `move_id`, `account` and `balance` — the account's balance just after that move — sorted by account, then time. Two moves at the same `ts` happened in `move_id` order.",
  ],
  stub: 'SELECT *\nFROM moves;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT move_id, account,
       SUM(amount) OVER (PARTITION BY account ORDER BY ts, move_id) AS balance
FROM moves
ORDER BY account, ts, move_id
"""

def _example():
    return {"moves": pd.DataFrame({
        "move_id": [5, 2, 3, 1, 4, 6],
        "account": ["A", "A", "B", "A", "B", "A"],
        "ts": ["2024-01-01 09:00", "2024-01-01 09:00", "2024-01-01 10:00",
               "2024-01-01 11:00", "2024-01-01 08:00", "2024-01-02 09:00"],
        "amount": [50.0, 100.0, 30.0, -20.0, 10.0, -40.0],
    })}

def _cases():
    r = np.random.default_rng(111)
    n = 24
    ids = r.permutation(n) + 1
    big = pd.DataFrame({"move_id": ids.tolist(),
                        "account": r.choice(["A", "B", "C"], n).tolist(),
                        "ts": r.choice(["2024-02-01 09:00", "2024-02-01 12:00", "2024-02-02 09:00"], n).tolist(),
                        "amount": r.choice([-25.0, 10.0, 40.0, 100.0], n).tolist()})
    return [
        _example(),
        {"moves": pd.DataFrame({"move_id": [1], "account": ["Z"], "ts": ["2024-03-01 10:00"], "amount": [5.0]})},
        {"moves": big},
    ]
`,
  hint: "A running total is `SUM(amount) OVER (PARTITION BY account ORDER BY ...)`. Order by ts **and** move_id: with ts alone, moves sharing a time are summed together as one step.",
  solution: 'SELECT move_id, account,\n       SUM(amount) OVER (PARTITION BY account ORDER BY ts, move_id) AS balance\nFROM moves\nORDER BY account, ts, move_id;\n',
  alt: ['SELECT m.move_id, m.account,\n       (SELECT SUM(x.amount) FROM moves x\n        WHERE x.account = m.account\n          AND (x.ts < m.ts OR (x.ts = m.ts AND x.move_id <= m.move_id))) AS balance\nFROM moves m\nORDER BY m.account, m.ts, m.move_id;\n'],
  wrong: [
    'SELECT move_id, account,\n       SUM(amount) OVER (PARTITION BY account ORDER BY ts) AS balance\nFROM moves\nORDER BY account, ts, move_id;\n',
    'SELECT move_id, account,\n       SUM(amount) OVER (PARTITION BY account ORDER BY move_id) AS balance\nFROM moves\nORDER BY account, ts, move_id;\n',
    'SELECT move_id, account,\n       SUM(amount) OVER (ORDER BY ts, move_id) AS balance\nFROM moves\nORDER BY account, ts, move_id;\n',
  ],
},
{
  id: 's12', difficulty: 'hard', lang: 'sql', tags: ['recursive CTE', 'dates'],
  title: 'Days with no sales',
  prompt: [
    "`sales` has `sale_date` (text like `'2024-01-30'`) and `amount`, unsorted, and some days have several sales.",
    'Return every calendar date from the **first** sale date to the **last** on which nothing was sold, as a column `day`, in date order.',
  ],
  notes: ['A table can only list dates that happened. The missing ones have to be generated.'],
  stub: 'SELECT *\nFROM sales;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
WITH RECURSIVE days(day) AS (
  SELECT MIN(sale_date) FROM sales
  UNION ALL
  SELECT date(day, '+1 day') FROM days
  WHERE day < (SELECT MAX(sale_date) FROM sales)
)
SELECT day FROM days
WHERE day NOT IN (SELECT sale_date FROM sales)
ORDER BY day
"""

def _example():
    return {"sales": pd.DataFrame({
        "sale_date": ["2024-02-02", "2024-01-30", "2024-01-30", "2024-02-04", "2024-01-31"],
        "amount": [12.0, 8.0, 5.0, 20.0, 7.5],
    })}

def _cases():
    r = np.random.default_rng(112)
    days = pd.date_range("2024-02-20", "2024-03-20", freq="D")
    keep = days[r.random(len(days)) > 0.3].strftime("%Y-%m-%d").tolist()
    big = pd.DataFrame({"sale_date": keep + keep[:5], "amount": [3.0] * (len(keep) + 5)})
    return [
        _example(),
        {"sales": pd.DataFrame({"sale_date": ["2024-05-02", "2024-05-01", "2024-05-03"], "amount": [1.0, 2.0, 3.0]})},
        {"sales": pd.DataFrame({"sale_date": ["2024-06-06"], "amount": [4.0]})},
        {"sales": big.sample(frac=1, random_state=4)},
    ]
`,
  hint: "Generate the calendar with `WITH RECURSIVE`: start at `MIN(sale_date)`, add a day with `date(day, '+1 day')`, and stop once you reach `MAX(sale_date)`. Then keep the days that aren't in sales.",
  solution: "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sale_date) FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n  WHERE day < (SELECT MAX(sale_date) FROM sales)\n)\nSELECT day\nFROM days\nWHERE day NOT IN (SELECT sale_date FROM sales)\nORDER BY day;\n",
  alt: ["WITH RECURSIVE n(k) AS (\n  SELECT 0\n  UNION ALL\n  SELECT k + 1 FROM n\n  WHERE k < (SELECT julianday(MAX(sale_date)) - julianday(MIN(sale_date)) FROM sales)\n)\nSELECT date((SELECT MIN(sale_date) FROM sales), '+' || k || ' days') AS day\nFROM n\nWHERE day NOT IN (SELECT sale_date FROM sales)\nORDER BY day;\n"],
  wrong: [
    "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sale_date) FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n  WHERE day <= (SELECT MAX(sale_date) FROM sales)\n)\nSELECT day\nFROM days\nWHERE day NOT IN (SELECT sale_date FROM sales)\nORDER BY day;\n",
    "WITH RECURSIVE days(day) AS (\n  SELECT MIN(sale_date) FROM sales\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days\n  WHERE day < (SELECT MAX(sale_date) FROM sales)\n)\nSELECT day\nFROM days\nORDER BY day;\n",
  ],
},
];

/* Python first, then SQL; easy, medium, hard within each. The sort is
   stable, so problems keep their written order inside a level. */
const LEVEL = { easy: 0, medium: 1, hard: 2 };
const rank = (p) => (p.lang === 'sql' ? 3 : 0) + LEVEL[p.difficulty];
export const PROBLEMS = [...BASE, ...MORE_PYTHON, ...MORE_SQL].sort((a, b) => rank(a) - rank(b));

export const problemById = (id) => PROBLEMS.find((p) => p.id === id);

/* The Python that judges a solution. The problem's setup runs in a private
   namespace (_P), so learner code can't reach _ref. A JSON string literal is
   also a valid Python string literal, which is what makes embedding safe. */
export function judgeCode(problem, submit) {
  const setup = PRACTICE_PRELUDE + '\n' + problem.setup;
  const cases = submit ? '_P["_cases"]()' : '[_P["_example"]()]';
  const reveal = submit ? 'False' : 'True';
  const mode = JSON.stringify(problem.mode);
  return [
    '_P = {}',
    `exec(${JSON.stringify(setup)}, _P)`,
    problem.lang === 'sql'
      ? `__judge__ = _judge_sql(globals().get("_query", ""), _P["_ref_sql"], ${cases}, ${mode}, reveal=${reveal})`
      : `__judge__ = _judge(globals().get("solution"), _P["_ref"], ${cases}, ${mode}, reveal=${reveal})`,
    submit ? 'assert __judge__["ok"], __judge__["summary"]' : '',
  ].join('\n');
}

/* Renders the example's input and expected output, so the description can
   show it without anyone hand-copying tables that could drift from _ref. */
export function previewCode(problem) {
  const setup = PRACTICE_PRELUDE + '\n' + problem.setup;
  return [
    '_P = {}',
    `exec(${JSON.stringify(setup)}, _P)`,
    problem.lang === 'sql'
      ? '__judge__ = _preview_sql(_P["_ref_sql"], _P["_example"]())'
      : '__judge__ = _preview(_P["_ref"], _P["_example"]())',
  ].join('\n');
}
