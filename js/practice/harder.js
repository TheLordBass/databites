/* Harder practice: medium and hard problems that go past the first 139.
   Same formats as the rest (see problems.js, more-sql.js, more-dax.js and
   algorithms.js): Python and algorithm problems give _ref, _example and
   _cases; SQL gives _ref_sql and tables; DAX gives a measure, a reference
   and the layouts it is tested in. Every alt must pass and every wrong
   answer must fail on the hidden cases; tests.html checks both.
   All original, all set in the café. */

const SALES = 'SUMX(order_items, order_items[qty] * RELATED(products[price]))';
const REV = { Rev: SALES };
const CAT = 'products[category]';
const CITY = 'customers[city]';
const NAME = 'products[name]';
const MONTH = 'calendar[month]';

export const HARDER = [

/* ── Python ────────────────────────────────────────────── */
{
  id: 'p51', difficulty: 'hard', tags: ['sorting', 'cumulative', 'shares'],
  title: 'Most of the money',
  prompt: [
    '`df` has `product` and `sales`, one row per sale, so a product can appear many times.',
    'Return the **shortest list of products**, biggest total sales first, whose sales together reach at least 80% of all sales. Break ties in total sales by product name, A to Z.',
  ],
  notes: ['The product that takes the running total to 80% or past it is in the list.', 'If one product alone reaches 80%, the list is just that one.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(df):
    t = df.groupby("product")["sales"].sum().reset_index()
    t = t.sort_values(["sales", "product"], ascending=[False, True])
    total = t["sales"].sum()
    out, run = [], 0
    for p, s in zip(t["product"], t["sales"]):
        out.append(p)
        run += s
        if run >= 0.8 * total:
            break
    return out

def _example():
    return (pd.DataFrame({"product": ["mug", "beans", "mug", "kit", "tote", "beans", "kit"],
                          "sales":   [20, 50, 10, 25, 5, 30, 10]}),)

def _cases():
    r = np.random.default_rng(51)
    names = ["beans", "mug", "kit", "tote", "cups", "grinder", "filters", "gift card"]
    big = pd.DataFrame({"product": r.choice(names, 60), "sales": r.integers(1, 60, 60)})
    return [
        _example(),
        (pd.DataFrame({"product": ["a", "b", "c"], "sales": [50, 30, 20]}),),
        (pd.DataFrame({"product": ["y", "x", "z"], "sales": [40, 40, 20]}),),
        (pd.DataFrame({"product": ["solo", "tiny"], "sales": [90, 10]}),),
        (big,),
    ]
`,
  hint: 'Total each product with groupby, sort by total (biggest first) then name, and walk down the list adding totals until you reach 80% of the grand total. Use `>=`: reaching 80% exactly is enough.',
  solution: 'def solution(df):\n    t = df.groupby("product")["sales"].sum().reset_index()\n    t = t.sort_values(["sales", "product"], ascending=[False, True])\n    total = t["sales"].sum()\n    out, run = [], 0\n    for p, s in zip(t["product"], t["sales"]):\n        out.append(p)\n        run += s\n        if run >= 0.8 * total:\n            break\n    return out\n',
  alt: [
    'def solution(df):\n    t = df.groupby("product", as_index=False)["sales"].sum()\n    t = t.sort_values(["sales", "product"], ascending=[False, True])\n    before = t["sales"].cumsum() - t["sales"]\n    return t.loc[before < 0.8 * t["sales"].sum(), "product"].tolist()\n',
  ],
  wrong: [
    'def solution(df):\n    t = df.groupby("product")["sales"].sum().reset_index()\n    t = t.sort_values(["sales", "product"], ascending=[False, True])\n    total = t["sales"].sum()\n    out, run = [], 0\n    for p, s in zip(t["product"], t["sales"]):\n        out.append(p)\n        run += s\n        if run > 0.8 * total:\n            break\n    return out\n',
    'def solution(df):\n    t = df.groupby("product")["sales"].sum().reset_index()\n    t = t.sort_values(["sales", "product"], ascending=[False, False])\n    total = t["sales"].sum()\n    out, run = [], 0\n    for p, s in zip(t["product"], t["sales"]):\n        out.append(p)\n        run += s\n        if run >= 0.8 * total:\n            break\n    return out\n',
    'def solution(df):\n    t = df.sort_values(["sales", "product"], ascending=[False, True])\n    total = t["sales"].sum()\n    out, run = [], 0\n    for p, s in zip(t["product"], t["sales"]):\n        out.append(p)\n        run += s\n        if run >= 0.8 * total:\n            break\n    return out\n',
  ],
},
{
  id: 'p52', difficulty: 'hard', tags: ['dates', 'reindex', 'groupby'],
  title: 'Fill in the quiet days',
  prompt: [
    '`df` has `store`, `date` and `sales`, but only for days with sales: a quiet day has no row at all. Each store has at most one row per day.',
    "Return every store and every day from **that store's** first date to its last, with `sales` 0 on the days that were missing. Columns `store`, `date`, `sales`.",
  ],
  notes: ["Each store has its own range: don't fill in before its first day or after its last.", 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    parts = []
    for store, g in df.groupby("store"):
        days = pd.date_range(g["date"].min(), g["date"].max(), freq="D")
        s = g.set_index("date")["sales"].reindex(days, fill_value=0)
        parts.append(pd.DataFrame({"store": store, "date": days, "sales": s.to_numpy()}))
    return pd.concat(parts, ignore_index=True)

def _example():
    return (pd.DataFrame({
        "store": ["A", "A", "A", "B", "B"],
        "date": pd.to_datetime(["2024-03-01", "2024-03-02", "2024-03-05", "2024-03-03", "2024-03-04"]),
        "sales": [120, 80, 95, 40, 60],
    }),)

def _cases():
    r = np.random.default_rng(52)
    rows = []
    for store in ["Lagos", "Accra", "Nairobi"]:
        days = np.sort(r.choice(40, 12, replace=False))
        for d in days:
            rows.append({"store": store, "date": pd.Timestamp("2024-05-01") + pd.Timedelta(days=int(d)), "sales": int(r.integers(10, 200))})
    big = pd.DataFrame(rows).sample(frac=1, random_state=4)
    return [
        _example(),
        (pd.DataFrame({"store": ["C"], "date": pd.to_datetime(["2024-01-10"]), "sales": [55]}),),
        (pd.DataFrame({"store": ["D", "D"], "date": pd.to_datetime(["2024-02-27", "2024-03-02"]), "sales": [10, 20]}),),
        (big,),
    ]
`,
  hint: 'For each store, `pd.date_range(first, last, freq="D")` is every day it should have. Set the date as the index, `reindex` onto that range with `fill_value=0`, then put the store back and stack the stores together.',
  solution: 'def solution(df):\n    parts = []\n    for store, g in df.groupby("store"):\n        days = pd.date_range(g["date"].min(), g["date"].max(), freq="D")\n        s = g.set_index("date")["sales"].reindex(days, fill_value=0)\n        parts.append(pd.DataFrame({"store": store, "date": days, "sales": s.to_numpy()}))\n    return pd.concat(parts, ignore_index=True)\n',
  alt: [
    'def solution(df):\n    out = (df.sort_values("date").set_index("date").groupby("store")["sales"]\n             .apply(lambda s: s.asfreq("D", fill_value=0)).reset_index())\n    return out[["store", "date", "sales"]]\n',
  ],
  wrong: [
    'def solution(df):\n    days = pd.date_range(df["date"].min(), df["date"].max(), freq="D")\n    grid = pd.MultiIndex.from_product([df["store"].unique(), days], names=["store", "date"])\n    out = df.set_index(["store", "date"])["sales"].reindex(grid, fill_value=0).reset_index()\n    return out\n',
    'def solution(df):\n    parts = []\n    for store, g in df.groupby("store"):\n        days = pd.date_range(g["date"].min(), g["date"].max(), freq="D")\n        s = g.set_index("date")["sales"].reindex(days)\n        parts.append(pd.DataFrame({"store": store, "date": days, "sales": s.to_numpy()}))\n    return pd.concat(parts, ignore_index=True)\n',
  ],
},
{
  id: 'p53', difficulty: 'medium', tags: ['groupby', 'weighted average'],
  title: 'Average price, by the cup',
  prompt: [
    '`df` has `item`, `qty` and `price`: one row per sale, at whatever price it went for that day.',
    "Return each item's average price **per unit sold**, weighted by qty and not rounded. Columns `item`, `avg_price`.",
  ],
  notes: ['A plain mean of the price column counts a sale of 1 cup the same as a sale of 50.', 'Every item sold at least one unit, though a row can have a qty of 0.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    t = df.assign(_v=df["qty"] * df["price"]).groupby("item")[["_v", "qty"]].sum()
    return pd.DataFrame({"item": t.index, "avg_price": (t["_v"] / t["qty"]).to_numpy()})

def _example():
    return (pd.DataFrame({"item": ["latte", "latte", "tea", "latte", "tea"],
                          "qty":   [10, 2, 5, 0, 15],
                          "price": [3.0, 4.5, 2.0, 9.9, 2.4]}),)

def _cases():
    r = np.random.default_rng(53)
    big = pd.DataFrame({"item": r.choice(["latte", "tea", "mocha", "flat white"], 40),
                        "qty": r.integers(1, 30, 40),
                        "price": np.round(r.uniform(2, 5, 40), 2)})
    return [
        _example(),
        (pd.DataFrame({"item": ["espresso"], "qty": [3], "price": [2.2]}),),
        (pd.DataFrame({"item": ["cake", "cake"], "qty": [1, 49], "price": [5.0, 3.0]}),),
        (big,),
    ]
`,
  hint: 'Make a column of qty × price, then group by item and divide its sum by the sum of qty.',
  solution: 'def solution(df):\n    t = df.assign(value=df["qty"] * df["price"]).groupby("item")[["value", "qty"]].sum()\n    return pd.DataFrame({"item": t.index, "avg_price": (t["value"] / t["qty"]).to_numpy()})\n',
  alt: [
    'def solution(df):\n    out = df.groupby("item").apply(lambda g: (g["qty"] * g["price"]).sum() / g["qty"].sum(), include_groups=False)\n    return out.rename("avg_price").reset_index()\n',
  ],
  wrong: [
    'def solution(df):\n    return df.groupby("item", as_index=False)["price"].mean().rename(columns={"price": "avg_price"})\n',
    'def solution(df):\n    t = df.assign(value=df["qty"] * df["price"]).groupby("item").agg(value=("value", "sum"), n=("qty", "size"))\n    return pd.DataFrame({"item": t.index, "avg_price": (t["value"] / t["n"]).to_numpy()})\n',
  ],
},
{
  id: 'p54', difficulty: 'medium', tags: ['shift', 'groupby', 'change detection'],
  title: 'When did the price change?',
  prompt: [
    '`df` has `item`, `date` and `price`: one row per item per day, in no particular order.',
    "Return each item's first row, plus every row where its price differs from **that item's** price on the day before. Columns `item`, `date`, `price`.",
  ],
  notes: ['A price can change and later change back: both changes count.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    d = df.sort_values(["item", "date"])
    prev = d.groupby("item")["price"].shift()
    return d[prev.isna() | (d["price"] != prev)][["item", "date", "price"]].reset_index(drop=True)

def _example():
    days = pd.to_datetime(["2024-04-01", "2024-04-02", "2024-04-03", "2024-04-04"])
    return (pd.DataFrame({
        "item":  ["latte"] * 4 + ["tea"] * 4,
        "date":  list(days) * 2,
        "price": [3.0, 3.0, 3.2, 3.0, 3.0, 3.0, 3.0, 2.5],
    }).sample(frac=1, random_state=1),)

def _cases():
    r = np.random.default_rng(54)
    rows = []
    for item in ["latte", "tea", "mocha"]:
        price = 3.0
        for i in range(15):
            if r.random() < 0.3:
                price = float(r.choice([2.5, 3.0, 3.5]))
            rows.append({"item": item, "date": pd.Timestamp("2024-06-01") + pd.Timedelta(days=i), "price": price})
    big = pd.DataFrame(rows).sample(frac=1, random_state=2)
    return [
        _example(),
        (pd.DataFrame({"item": ["mug"] * 3, "date": pd.to_datetime(["2024-01-01", "2024-01-02", "2024-01-03"]),
                       "price": [9.5, 9.5, 9.5]}),),
        (pd.DataFrame({"item": ["a", "a", "b", "b"], "date": pd.to_datetime(["2024-01-01", "2024-01-02"] * 2),
                       "price": [5.0, 4.0, 4.0, 4.0]}),),
        (big,),
    ]
`,
  hint: 'Sort by item and date, then `groupby("item")["price"].shift()` is the price the day before, for the same item. Keep the rows where that is missing (the first day) or different.',
  solution: 'def solution(df):\n    d = df.sort_values(["item", "date"])\n    prev = d.groupby("item")["price"].shift()\n    return d[prev.isna() | (d["price"] != prev)][["item", "date", "price"]]\n',
  alt: [
    'def solution(df):\n    d = df.sort_values(["item", "date"]).copy()\n    changed = d.groupby("item")["price"].diff().fillna(1) != 0\n    return d.loc[changed, ["item", "date", "price"]]\n',
  ],
  wrong: [
    'def solution(df):\n    d = df.sort_values(["item", "date"])\n    prev = d["price"].shift()\n    return d[prev.isna() | (d["price"] != prev)][["item", "date", "price"]]\n',
    'def solution(df):\n    return df.sort_values(["item", "date"]).drop_duplicates(["item", "price"])[["item", "date", "price"]]\n',
  ],
},
{
  id: 'p55', difficulty: 'hard', tags: ['joins', 'cumcount', 'reconciliation'],
  title: 'Match the payments',
  prompt: [
    '`invoices` has `invoice_id`, `customer` and `amount`. `payments` has `customer` and `amount`, one row per payment.',
    "Each payment pays that customer's **oldest unpaid invoice of exactly that amount** (the lowest invoice_id). Return every invoice with `paid`, True or False. Columns `invoice_id`, `paid`.",
  ],
  notes: ['A payment that matches no unpaid invoice pays nothing.', 'Two payments of 20 pay two invoices of 20, oldest first.', 'Row order does not matter.'],
  stub: 'def solution(invoices, payments):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(invoices, payments):
    inv = invoices.sort_values("invoice_id").copy()
    inv["n"] = inv.groupby(["customer", "amount"]).cumcount()
    pay = payments.copy()
    pay["n"] = pay.groupby(["customer", "amount"]).cumcount()
    m = inv.merge(pay[["customer", "amount", "n"]].assign(_p=True), on=["customer", "amount", "n"], how="left")
    return pd.DataFrame({"invoice_id": m["invoice_id"].to_numpy(), "paid": m["_p"].notna().to_numpy()})

def _example():
    invoices = pd.DataFrame({"invoice_id": [1, 2, 3, 4, 5],
                             "customer": ["Ada", "Ada", "Ada", "Kofi", "Kofi"],
                             "amount": [20, 20, 35, 20, 50]})
    payments = pd.DataFrame({"customer": ["Ada", "Kofi", "Ada", "Ada"], "amount": [20, 50, 35, 15]})
    return (invoices, payments)

def _cases():
    r = np.random.default_rng(55)
    inv = pd.DataFrame({"invoice_id": np.arange(100, 140),
                        "customer": r.choice(["Ada", "Kofi", "Zola", "Ife"], 40),
                        "amount": r.choice([10, 20, 35, 50], 40)})
    pay = pd.DataFrame({"customer": r.choice(["Ada", "Kofi", "Zola", "Ife"], 30),
                        "amount": r.choice([10, 20, 35, 50, 15], 30)})
    return [
        _example(),
        (pd.DataFrame({"invoice_id": [7, 3], "customer": ["Nia", "Nia"], "amount": [20, 20]}),
         pd.DataFrame({"customer": ["Nia", "Nia", "Nia"], "amount": [20, 20, 20]})),
        (pd.DataFrame({"invoice_id": [1, 2], "customer": ["Esi", "Yaw"], "amount": [10, 10]}),
         pd.DataFrame({"customer": pd.Series([], dtype=object), "amount": pd.Series([], dtype=int)})),
        (inv.sample(frac=1, random_state=3), pay),
    ]
`,
  hint: 'Number each customer-and-amount\'s invoices in invoice_id order with `cumcount()`, and number the payments the same way. Then the 1st payment of 20 pays the 1st invoice of 20: merge on customer, amount and that number.',
  solution: 'def solution(invoices, payments):\n    inv = invoices.sort_values("invoice_id").copy()\n    inv["n"] = inv.groupby(["customer", "amount"]).cumcount()\n    pay = payments.copy()\n    pay["n"] = pay.groupby(["customer", "amount"]).cumcount()\n    m = inv.merge(pay[["customer", "amount", "n"]].assign(hit=True), on=["customer", "amount", "n"], how="left")\n    return pd.DataFrame({"invoice_id": m["invoice_id"], "paid": m["hit"].notna()})\n',
  alt: [
    'def solution(invoices, payments):\n    waiting = {}\n    for i, c, a in invoices.sort_values("invoice_id")[["invoice_id", "customer", "amount"]].itertuples(index=False):\n        waiting.setdefault((c, a), []).append(i)\n    paid = set()\n    for c, a in payments[["customer", "amount"]].itertuples(index=False):\n        queue = waiting.get((c, a))\n        if queue:\n            paid.add(queue.pop(0))\n    return pd.DataFrame({"invoice_id": invoices["invoice_id"], "paid": invoices["invoice_id"].isin(paid)})\n',
  ],
  wrong: [
    'def solution(invoices, payments):\n    hits = payments.drop_duplicates()[["customer", "amount"]].assign(hit=True)\n    m = invoices.merge(hits, on=["customer", "amount"], how="left")\n    return pd.DataFrame({"invoice_id": m["invoice_id"], "paid": m["hit"].notna()})\n',
    'def solution(invoices, payments):\n    inv = invoices.sort_values("invoice_id", ascending=False).copy()\n    inv["n"] = inv.groupby(["customer", "amount"]).cumcount()\n    pay = payments.copy()\n    pay["n"] = pay.groupby(["customer", "amount"]).cumcount()\n    m = inv.merge(pay[["customer", "amount", "n"]].assign(hit=True), on=["customer", "amount", "n"], how="left")\n    return pd.DataFrame({"invoice_id": m["invoice_id"], "paid": m["hit"].notna()})\n',
  ],
},
{
  id: 'p56', difficulty: 'medium', tags: ['groupby', 'transform', 'statistics'],
  title: 'Unusual days',
  prompt: [
    '`df` has `store`, `date` and `sales`.',
    "Return the rows where sales are more than 2 standard deviations from **that store's** average, above or below. Use pandas' `.std()` as it comes, which divides by n − 1. Columns `store`, `date`, `sales`.",
  ],
  notes: ['A store with a single day has no spread to measure, so none of its rows are unusual.', 'Row order does not matter.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame',
  setup: `
def _ref(df):
    g = df.groupby("store")["sales"]
    z = (df["sales"] - g.transform("mean")) / g.transform("std")
    return df[z.abs() > 2][["store", "date", "sales"]].reset_index(drop=True)

def _example():
    days = pd.date_range("2024-02-01", periods=8, freq="D")
    return (pd.DataFrame({
        "store": ["A"] * 8 + ["B"] * 8,
        "date": list(days) * 2,
        "sales": [100, 104, 98, 101, 99, 180, 102, 97, 1000, 1040, 1010, 990, 300, 1005, 1020, 995],
    }),)

def _cases():
    r = np.random.default_rng(56)
    rows = []
    for store, base in [("Lagos", 200), ("Accra", 60), ("Nairobi", 900)]:
        for i in range(30):
            sales = int(r.normal(base, base * 0.1))
            if r.random() < 0.08:
                sales = int(sales * r.choice([0.3, 2.2]))
            rows.append({"store": store, "date": pd.Timestamp("2024-03-01") + pd.Timedelta(days=i), "sales": sales})
    return [
        _example(),
        (pd.DataFrame({"store": ["solo"], "date": pd.to_datetime(["2024-01-01"]), "sales": [50]}),),
        (pd.DataFrame({"store": ["C"] * 6, "date": pd.date_range("2024-01-01", periods=6, freq="D"),
                       "sales": [0, 0, 0, 1, 1, 6]}),),
        (pd.DataFrame(rows),),
    ]
`,
  hint: '`g = df.groupby("store")["sales"]`, then `g.transform("mean")` and `g.transform("std")` line each store\'s average and spread up with its rows. Keep the rows where the distance from the average, divided by the spread, is more than 2 either way.',
  solution: 'def solution(df):\n    g = df.groupby("store")["sales"]\n    z = (df["sales"] - g.transform("mean")) / g.transform("std")\n    return df[z.abs() > 2][["store", "date", "sales"]]\n',
  alt: [
    'def solution(df):\n    stats = df.groupby("store")["sales"].agg(["mean", "std"]).reset_index()\n    m = df.merge(stats, on="store")\n    keep = (m["sales"] - m["mean"]).abs() > 2 * m["std"]\n    return m.loc[keep, ["store", "date", "sales"]]\n',
  ],
  wrong: [
    'def solution(df):\n    z = (df["sales"] - df["sales"].mean()) / df["sales"].std()\n    return df[z.abs() > 2][["store", "date", "sales"]]\n',
    'def solution(df):\n    g = df.groupby("store")["sales"]\n    z = (df["sales"] - g.transform("mean")) / g.transform(lambda s: s.std(ddof=0))\n    return df[z.abs() > 2][["store", "date", "sales"]]\n',
  ],
},

/* ── SQL ───────────────────────────────────────────────── */
{
  id: 's51', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'running totals', 'shares'],
  title: 'Most of the money, in SQL',
  prompt: [
    '`sales` has `product` and `amount`, one row per sale.',
    'Return the products, biggest total first, until their running total reaches **at least 80%** of all sales, including the product that gets it there. Columns `product` and `total`; break ties in total by product, A to Z.',
  ],
  stub: 'SELECT product, SUM(amount) AS total\nFROM sales\nGROUP BY product\nORDER BY total DESC;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """WITH t AS (SELECT product, SUM(amount) AS total FROM sales GROUP BY product),
r AS (SELECT product, total,
             SUM(total) OVER (ORDER BY total DESC, product ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run,
             SUM(total) OVER () AS grand
      FROM t)
SELECT product, total FROM r WHERE run - total < 0.8 * grand ORDER BY total DESC, product"""

def _example():
    return {"sales": pd.DataFrame({"product": ["mug", "beans", "mug", "kit", "tote", "beans", "kit"],
                                   "amount": [20, 50, 10, 25, 5, 30, 10]})}

def _cases():
    r = np.random.default_rng(151)
    names = ["beans", "mug", "kit", "tote", "cups", "grinder", "filters"]
    return [
        _example(),
        {"sales": pd.DataFrame({"product": ["a", "b", "c"], "amount": [50, 30, 20]})},
        {"sales": pd.DataFrame({"product": ["y", "x", "z"], "amount": [40, 40, 20]})},
        {"sales": pd.DataFrame({"product": r.choice(names, 50), "amount": r.integers(1, 80, 50)})},
    ]
`,
  hint: 'Total per product in a WITH step. Then a running `SUM(total) OVER (ORDER BY total DESC, product)` and the grand `SUM(total) OVER ()`. A product is in the list if the running total *before* it (running minus its own total) is still under 80%.',
  solution: 'WITH t AS (\n  SELECT product, SUM(amount) AS total\n  FROM sales\n  GROUP BY product\n),\nr AS (\n  SELECT product, total,\n         SUM(total) OVER (ORDER BY total DESC, product) AS run,\n         SUM(total) OVER () AS grand\n  FROM t\n)\nSELECT product, total\nFROM r\nWHERE run - total < 0.8 * grand\nORDER BY total DESC, product;\n',
  alt: ['WITH t AS (SELECT product, SUM(amount) AS total FROM sales GROUP BY product)\nSELECT a.product, a.total\nFROM t a\nWHERE (SELECT COALESCE(SUM(b.total), 0) FROM t b\n       WHERE b.total > a.total OR (b.total = a.total AND b.product < a.product)) < 0.8 * (SELECT SUM(total) FROM t)\nORDER BY a.total DESC, a.product;\n'],
  wrong: [
    'WITH t AS (SELECT product, SUM(amount) AS total FROM sales GROUP BY product),\nr AS (SELECT product, total, SUM(total) OVER (ORDER BY total DESC, product) AS run, SUM(total) OVER () AS grand FROM t)\nSELECT product, total FROM r WHERE run <= 0.8 * grand ORDER BY total DESC, product;\n',
    'WITH t AS (SELECT product, SUM(amount) AS total FROM sales GROUP BY product),\nr AS (SELECT product, total, SUM(total) OVER (ORDER BY total DESC, product DESC) AS run, SUM(total) OVER () AS grand FROM t)\nSELECT product, total FROM r WHERE run - total < 0.8 * grand ORDER BY total DESC, product DESC;\n',
  ],
},
{
  id: 's52', difficulty: 'medium', lang: 'sql', tags: ['window functions', 'percentages', 'integer division'],
  title: 'Growth on last month',
  prompt: [
    '`monthly` has `month` (text like 2024-03) and `revenue` (whole numbers), one row per month.',
    'Return `month`, `revenue` and `growth`: the percentage change from the month before, rounded to 1 place. The first month gets NULL. In month order.',
  ],
  stub: 'SELECT month, revenue\nFROM monthly\nORDER BY month;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT month, revenue, ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS growth FROM monthly ORDER BY month"

def _example():
    return {"monthly": pd.DataFrame({"month": ["2024-01", "2024-02", "2024-03", "2024-04"],
                                     "revenue": [300, 400, 380, 570]})}

def _cases():
    return [
        _example(),
        {"monthly": pd.DataFrame({"month": ["2024-03", "2024-01", "2024-02"], "revenue": [90, 120, 60]})},
        {"monthly": pd.DataFrame({"month": ["2024-05"], "revenue": [250]})},
        {"monthly": pd.DataFrame({"month": ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06"],
                                  "revenue": [333, 401, 397, 512, 499, 640]})},
    ]
`,
  hint: '`LAG(revenue) OVER (ORDER BY month)` is last month\'s revenue on this month\'s row. Growth is `100.0 * (revenue - last) / last`: the `100.0` keeps the decimals, and NULLIF guards the bottom.',
  solution: 'SELECT month, revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS growth\nFROM monthly\nORDER BY month;\n',
  alt: ['WITH m AS (SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS last FROM monthly)\nSELECT month, revenue, ROUND(100.0 * revenue / last - 100, 1) AS growth\nFROM m\nORDER BY month;\n'],
  wrong: [
    'SELECT month, revenue,\n       ROUND(100 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS growth\nFROM monthly\nORDER BY month;\n',
    'SELECT month, revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY revenue)) / LAG(revenue) OVER (ORDER BY revenue), 1) AS growth\nFROM monthly\nORDER BY month;\n',
  ],
},
{
  id: 's53', difficulty: 'medium', lang: 'sql', tags: ['INTERSECT', 'dates'],
  title: 'In January and February',
  prompt: [
    '`orders` has `customer_id` and `order_date` (text, YYYY-MM-DD).',
    'Return the customers who ordered in **both** January 2024 and February 2024: one column, `customer_id`, smallest first.',
  ],
  stub: 'SELECT customer_id, order_date\nFROM orders;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = "SELECT customer_id FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31' INTERSECT SELECT customer_id FROM orders WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29' ORDER BY customer_id"

def _example():
    return {"orders": pd.DataFrame({
        "customer_id": [1, 1, 2, 3, 3, 4, 4],
        "order_date": ["2024-01-05", "2024-02-11", "2024-01-20", "2024-02-02", "2024-02-28", "2023-01-15", "2024-02-03"],
    })}

def _cases():
    r = np.random.default_rng(153)
    days = pd.date_range("2023-12-01", "2024-03-31", freq="D").strftime("%Y-%m-%d")
    return [
        _example(),
        {"orders": pd.DataFrame({"customer_id": [9, 9], "order_date": ["2024-01-31", "2024-02-29"]})},
        {"orders": pd.DataFrame({"customer_id": [5, 6], "order_date": ["2024-01-02", "2024-02-02"]})},
        {"orders": pd.DataFrame({"customer_id": r.integers(1, 15, 60), "order_date": r.choice(days, 60)})},
    ]
`,
  hint: "January's customers `INTERSECT` February's customers, each picked with a WHERE on order_date that includes the year.",
  solution: "SELECT customer_id FROM orders\nWHERE order_date BETWEEN '2024-01-01' AND '2024-01-31'\nINTERSECT\nSELECT customer_id FROM orders\nWHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'\nORDER BY customer_id;\n",
  alt: ["SELECT customer_id FROM orders\nWHERE substr(order_date, 1, 7) IN ('2024-01', '2024-02')\nGROUP BY customer_id\nHAVING COUNT(DISTINCT substr(order_date, 1, 7)) = 2\nORDER BY customer_id;\n"],
  wrong: [
    "SELECT DISTINCT customer_id FROM orders\nWHERE substr(order_date, 1, 7) IN ('2024-01', '2024-02')\nORDER BY customer_id;\n",
    "SELECT customer_id FROM orders WHERE substr(order_date, 6, 2) = '01'\nINTERSECT\nSELECT customer_id FROM orders WHERE substr(order_date, 6, 2) = '02'\nORDER BY customer_id;\n",
  ],
},
{
  id: 's54', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'ties', 'shares'],
  title: "The best seller's share",
  prompt: [
    '`sales` has `category`, `product` and `amount` (whole numbers), one row per sale.',
    "For each category, return its best-selling product by total amount, and that product's share of the category's total as a percentage rounded to 1 place: `category`, `product`, `share`. If two products tie for best, return both.",
  ],
  stub: 'SELECT category, product, SUM(amount) AS total\nFROM sales\nGROUP BY category, product;\n',
  mode: 'frame',
  setup: `
_ref_sql = """WITH t AS (SELECT category, product, SUM(amount) AS total FROM sales GROUP BY category, product),
r AS (SELECT category, product, total,
             RANK() OVER (PARTITION BY category ORDER BY total DESC) AS rk,
             SUM(total) OVER (PARTITION BY category) AS cat_total
      FROM t)
SELECT category, product, ROUND(100.0 * total / cat_total, 1) AS share FROM r WHERE rk = 1"""

def _example():
    return {"sales": pd.DataFrame({
        "category": ["beans", "beans", "beans", "kit", "kit", "kit", "merch"],
        "product":  ["house", "dark", "house", "grinder", "cone", "cone", "mug"],
        "amount":   [12, 14, 13, 45, 22, 23, 9],
    })}

def _cases():
    r = np.random.default_rng(154)
    cats = {"beans": ["house", "dark", "decaf"], "kit": ["grinder", "cone", "papers"], "merch": ["mug", "tote", "cups"]}
    rows = []
    for _ in range(60):
        c = str(r.choice(list(cats)))
        rows.append({"category": c, "product": str(r.choice(cats[c])), "amount": int(r.integers(5, 50))})
    return [
        _example(),
        {"sales": pd.DataFrame({"category": ["x", "x", "x"], "product": ["a", "b", "c"], "amount": [30, 30, 40]})},
        {"sales": pd.DataFrame({"category": ["y", "y"], "product": ["p", "q"], "amount": [10, 20]})},
        {"sales": pd.DataFrame(rows)},
    ]
`,
  hint: 'Total each product in a WITH step. Then `RANK() OVER (PARTITION BY category ORDER BY total DESC)` finds the best (RANK keeps ties), and `SUM(total) OVER (PARTITION BY category)` is the category total to divide by, with `100.0`.',
  solution: 'WITH t AS (\n  SELECT category, product, SUM(amount) AS total\n  FROM sales\n  GROUP BY category, product\n),\nr AS (\n  SELECT category, product, total,\n         RANK() OVER (PARTITION BY category ORDER BY total DESC) AS rk,\n         SUM(total) OVER (PARTITION BY category) AS cat_total\n  FROM t\n)\nSELECT category, product, ROUND(100.0 * total / cat_total, 1) AS share\nFROM r\nWHERE rk = 1;\n',
  alt: ['WITH t AS (SELECT category, product, SUM(amount) AS total FROM sales GROUP BY category, product)\nSELECT t.category, t.product, ROUND(100.0 * t.total / c.cat_total, 1) AS share\nFROM t\nJOIN (SELECT category, SUM(total) AS cat_total, MAX(total) AS best FROM t GROUP BY category) c\n  ON c.category = t.category\nWHERE t.total = c.best;\n'],
  wrong: [
    'WITH t AS (SELECT category, product, SUM(amount) AS total FROM sales GROUP BY category, product),\nr AS (SELECT category, product, total, ROW_NUMBER() OVER (PARTITION BY category ORDER BY total DESC) AS rk, SUM(total) OVER (PARTITION BY category) AS cat_total FROM t)\nSELECT category, product, ROUND(100.0 * total / cat_total, 1) AS share FROM r WHERE rk = 1;\n',
    'WITH t AS (SELECT category, product, SUM(amount) AS total FROM sales GROUP BY category, product),\nr AS (SELECT category, product, total, RANK() OVER (PARTITION BY category ORDER BY total DESC) AS rk, SUM(total) OVER (PARTITION BY category) AS cat_total FROM t)\nSELECT category, product, ROUND(100 * total / cat_total, 1) AS share FROM r WHERE rk = 1;\n',
    'WITH t AS (SELECT category, product, SUM(amount) AS total FROM sales GROUP BY category, product),\nr AS (SELECT category, product, total, RANK() OVER (PARTITION BY category ORDER BY total DESC) AS rk, SUM(total) OVER () AS cat_total FROM t)\nSELECT category, product, ROUND(100.0 * total / cat_total, 1) AS share FROM r WHERE rk = 1;\n',
  ],
},
{
  id: 's55', difficulty: 'hard', lang: 'sql', tags: ['window functions', 'sessions', 'boundaries'],
  title: 'Sessions, in SQL',
  prompt: [
    '`clicks` has `user_id` and `minute`, a whole number of minutes since the site opened.',
    "A new session starts at a user's first click, and whenever **more than 30 minutes** have passed since that user's previous click. Return `user_id` and `sessions`, how many sessions each user had, by user_id.",
  ],
  stub: 'SELECT user_id, COUNT(*) AS clicks\nFROM clicks\nGROUP BY user_id\nORDER BY user_id;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """WITH g AS (SELECT user_id, minute - LAG(minute) OVER (PARTITION BY user_id ORDER BY minute) AS gap FROM clicks)
SELECT user_id, SUM(CASE WHEN gap IS NULL OR gap > 30 THEN 1 ELSE 0 END) AS sessions FROM g GROUP BY user_id ORDER BY user_id"""

def _example():
    return {"clicks": pd.DataFrame({"user_id": [1, 1, 1, 1, 2, 2, 2],
                                    "minute":  [0, 10, 41, 100, 5, 35, 66]})}

def _cases():
    r = np.random.default_rng(155)
    users = r.integers(1, 6, 70)
    minutes = r.integers(0, 600, 70)
    return [
        _example(),
        {"clicks": pd.DataFrame({"user_id": [7, 7, 7], "minute": [50, 20, 80]})},
        {"clicks": pd.DataFrame({"user_id": [8, 8, 9], "minute": [0, 0, 400]})},
        {"clicks": pd.DataFrame({"user_id": users, "minute": minutes})},
    ]
`,
  hint: '`minute - LAG(minute) OVER (PARTITION BY user_id ORDER BY minute)` is the gap since that user\'s previous click (NULL on their first). A click starts a session when the gap is NULL or over 30: count those per user.',
  solution: 'WITH g AS (\n  SELECT user_id,\n         minute - LAG(minute) OVER (PARTITION BY user_id ORDER BY minute) AS gap\n  FROM clicks\n)\nSELECT user_id,\n       SUM(CASE WHEN gap IS NULL OR gap > 30 THEN 1 ELSE 0 END) AS sessions\nFROM g\nGROUP BY user_id\nORDER BY user_id;\n',
  alt: ['WITH g AS (SELECT user_id, minute, LAG(minute) OVER (PARTITION BY user_id ORDER BY minute) AS prev FROM clicks)\nSELECT user_id, COUNT(*) AS sessions\nFROM g\nWHERE prev IS NULL OR minute - prev > 30\nGROUP BY user_id\nORDER BY user_id;\n'],
  wrong: [
    'WITH g AS (SELECT user_id, minute - LAG(minute) OVER (PARTITION BY user_id ORDER BY minute) AS gap FROM clicks)\nSELECT user_id, SUM(CASE WHEN gap IS NULL OR gap >= 30 THEN 1 ELSE 0 END) AS sessions FROM g GROUP BY user_id ORDER BY user_id;\n',
    'WITH g AS (SELECT user_id, minute - LAG(minute) OVER (ORDER BY minute) AS gap FROM clicks)\nSELECT user_id, SUM(CASE WHEN gap IS NULL OR gap > 30 THEN 1 ELSE 0 END) AS sessions FROM g GROUP BY user_id ORDER BY user_id;\n',
  ],
},
{
  id: 's56', difficulty: 'medium', lang: 'sql', tags: ['NTILE', 'window functions', 'group by'],
  title: 'Quartiles of spend',
  prompt: [
    '`spend` has `customer_id` and `amount`, one row per customer.',
    "Split the customers into 4 groups by amount with NTILE, the biggest spenders in group 1 and ties broken by customer_id. Return each group's `quartile`, `customers` and `total` amount, by quartile.",
  ],
  stub: 'SELECT customer_id, amount\nFROM spend\nORDER BY amount DESC;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """WITH q AS (SELECT customer_id, amount, NTILE(4) OVER (ORDER BY amount DESC, customer_id) AS quartile FROM spend)
SELECT quartile, COUNT(*) AS customers, SUM(amount) AS total FROM q GROUP BY quartile ORDER BY quartile"""

def _example():
    return {"spend": pd.DataFrame({"customer_id": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                                   "amount": [120, 45, 300, 80, 80, 15, 210, 60, 95, 30]})}

def _cases():
    r = np.random.default_rng(156)
    return [
        _example(),
        {"spend": pd.DataFrame({"customer_id": [4, 3, 2, 1], "amount": [10, 10, 10, 10]})},
        {"spend": pd.DataFrame({"customer_id": np.arange(1, 35), "amount": r.integers(5, 400, 34)})},
    ]
`,
  hint: '`NTILE(4) OVER (ORDER BY amount DESC, customer_id) AS quartile` in a WITH step, then group by quartile and count and add up.',
  solution: 'WITH q AS (\n  SELECT customer_id, amount,\n         NTILE(4) OVER (ORDER BY amount DESC, customer_id) AS quartile\n  FROM spend\n)\nSELECT quartile, COUNT(*) AS customers, SUM(amount) AS total\nFROM q\nGROUP BY quartile\nORDER BY quartile;\n',
  alt: ['SELECT quartile, COUNT(*) AS customers, SUM(amount) AS total\nFROM (SELECT amount, NTILE(4) OVER (ORDER BY amount DESC, customer_id) AS quartile FROM spend)\nGROUP BY quartile\nORDER BY quartile;\n'],
  wrong: [
    'WITH q AS (SELECT customer_id, amount, NTILE(4) OVER (ORDER BY amount, customer_id) AS quartile FROM spend)\nSELECT quartile, COUNT(*) AS customers, SUM(amount) AS total FROM q GROUP BY quartile ORDER BY quartile;\n',
    'WITH q AS (SELECT customer_id, amount, NTILE(4) OVER (ORDER BY amount DESC, customer_id) AS quartile FROM spend)\nSELECT quartile, COUNT(*) AS customers, SUM(DISTINCT amount) AS total FROM q GROUP BY quartile ORDER BY quartile;\n',
  ],
},

/* ── DAX ───────────────────────────────────────────────── */
{
  id: 'd25', difficulty: 'medium', lang: 'dax', tags: ['FILTER', 'calendar', 'BLANK'],
  title: 'Days without an order',
  prompt: [
    'Write `Empty Days`: how many days in the calendar had no orders at all.',
    'Each month row counts its own days.',
  ],
  stub: 'Orders = COUNTROWS(orders)\nEmpty Days = \n',
  measure: 'Empty Days', reference: 'COUNTROWS(FILTER(VALUES(calendar[date]), ISBLANK([Orders])))', helpers: { Orders: 'COUNTROWS(orders)' },
  layouts: [[MONTH], []],
  hint: "Go through the calendar's dates and keep the ones where `[Orders]` is blank: `COUNTROWS(FILTER(VALUES(calendar[date]), ISBLANK([Orders])))`. The orders table can't do it: a day with no orders isn't in it.",
  solution: 'Orders = COUNTROWS(orders)\nEmpty Days = COUNTROWS(FILTER(VALUES(calendar[date]), ISBLANK([Orders])))\n',
  alt: ['Orders = COUNTROWS(orders)\nEmpty Days = COUNTROWS(VALUES(calendar[date])) - COUNTROWS(FILTER(VALUES(calendar[date]), [Orders] > 0))\n'],
  wrong: [
    'Orders = COUNTROWS(orders)\nEmpty Days = COUNTROWS(FILTER(VALUES(orders[order_date]), ISBLANK([Orders])))\n',
    'Orders = COUNTROWS(orders)\nEmpty Days = COUNTROWS(FILTER(VALUES(calendar[date]), [Orders] > 1))\n',
  ],
},
{
  id: 'd26', difficulty: 'medium', lang: 'dax', tags: ['FILTER', 'context transition', 'BLANK'],
  title: "Products that didn't sell",
  prompt: [
    "Write `Unsold`: how many products had no revenue at all in what's showing.",
    'On a month row that is the products nobody bought that month; on a category row, the ones in that category that never sold.',
  ],
  stub: `Rev = ${SALES}\nUnsold = \n`,
  measure: 'Unsold', reference: 'COUNTROWS(FILTER(products, ISBLANK([Rev])))', helpers: REV,
  layouts: [[MONTH], [CAT], []],
  hint: 'Go product by product and keep the ones whose `[Rev]` is blank: `COUNTROWS(FILTER(products, ISBLANK([Rev])))`. Using the measure is what makes each product its own filter.',
  solution: `Rev = ${SALES}\nUnsold = COUNTROWS(FILTER(products, ISBLANK([Rev])))\n`,
  alt: [`Rev = ${SALES}\nUnsold = COUNTROWS(products) - COUNTROWS(FILTER(products, [Rev] > 0))\n`],
  wrong: [
    `Unsold = COUNTROWS(FILTER(products, ISBLANK(${SALES})))\n`,
    `Rev = ${SALES}\nUnsold = COUNTROWS(FILTER(ALL(products), ISBLANK([Rev])))\n`,
  ],
},
{
  id: 'd27', difficulty: 'hard', lang: 'dax', tags: ['VAR', 'FILTER', 'ALL'],
  title: 'Running share',
  prompt: [
    "Write `Running Share`: a product's revenue plus the revenue of every product that sold more, as a share of the revenue of all the products showing.",
    'It is tested by product, and by category then product, where "all the products showing" means the ones in that category.',
  ],
  stub: `Rev = ${SALES}\nRunning Share = \n`,
  measure: 'Running Share',
  reference: 'VAR mine = [Rev] RETURN DIVIDE(CALCULATE([Rev], FILTER(ALL(products[name]), [Rev] >= mine)), CALCULATE([Rev], ALL(products[name])))',
  helpers: REV,
  layouts: [[NAME], [CAT, NAME]],
  hint: "Store this product's revenue in a VAR first. Then `FILTER(ALL(products[name]), [Rev] >= mine)` is it and every product that sold at least as much; divide that revenue by `CALCULATE([Rev], ALL(products[name]))`. Clearing only the name keeps any category filter.",
  solution: `Rev = ${SALES}\nRunning Share =\n    VAR mine = [Rev]\n    RETURN DIVIDE(\n        CALCULATE([Rev], FILTER(ALL(products[name]), [Rev] >= mine)),\n        CALCULATE([Rev], ALL(products[name]))\n    )\n`,
  alt: [`Rev = ${SALES}\nRunning Share =\n    VAR mine = [Rev]\n    VAR upto = SUMX(FILTER(ALL(products[name]), [Rev] >= mine), [Rev])\n    RETURN DIVIDE(upto, CALCULATE([Rev], ALL(products[name])))\n`],
  wrong: [
    `Rev = ${SALES}\nRunning Share = DIVIDE(CALCULATE([Rev], FILTER(ALL(products[name]), [Rev] >= [Rev])), CALCULATE([Rev], ALL(products[name])))\n`,
    `Rev = ${SALES}\nRunning Share =\n    VAR mine = [Rev]\n    RETURN DIVIDE(CALCULATE([Rev], FILTER(ALL(products[name]), [Rev] >= mine)), CALCULATE([Rev], ALL(products)))\n`,
  ],
},
{
  id: 'd28', difficulty: 'hard', lang: 'dax', tags: ['DATEADD', 'FILTER', 'retention'],
  title: 'Kept for next month',
  prompt: [
    "Write `Kept`: how many of this month's buyers also ordered **in the month after**.",
    'June has no month after it in the data, so it comes out blank.',
  ],
  stub: 'Buyers = DISTINCTCOUNT(orders[customer_id])\nKept = \n',
  measure: 'Kept',
  reference: 'COUNTROWS(FILTER(VALUES(orders[customer_id]), CALCULATE(COUNTROWS(orders), DATEADD(calendar[date], 1, MONTH)) > 0))',
  helpers: { Buyers: 'DISTINCTCOUNT(orders[customer_id])' },
  layouts: [[MONTH], [MONTH, CITY]],
  hint: "Go through this month's customers with `FILTER(VALUES(orders[customer_id]), ...)`, and for each count their orders a month later: `CALCULATE(COUNTROWS(orders), DATEADD(calendar[date], 1, MONTH))`.",
  solution: 'Buyers = DISTINCTCOUNT(orders[customer_id])\nKept = COUNTROWS(FILTER(VALUES(orders[customer_id]),\n    CALCULATE(COUNTROWS(orders), DATEADD(calendar[date], 1, MONTH)) > 0))\n',
  alt: ['Buyers = DISTINCTCOUNT(orders[customer_id])\nKept =\n    VAR buyers = VALUES(orders[customer_id])\n    RETURN COUNTROWS(FILTER(buyers, NOT ISBLANK(CALCULATE(COUNTROWS(orders), DATEADD(calendar[date], 1, MONTH)))))\n'],
  wrong: [
    'Buyers = DISTINCTCOUNT(orders[customer_id])\nKept = COUNTROWS(FILTER(VALUES(orders[customer_id]), CALCULATE(COUNTROWS(orders), PREVIOUSMONTH(calendar[date])) > 0))\n',
    'Buyers = DISTINCTCOUNT(orders[customer_id])\nKept = CALCULATE(DISTINCTCOUNT(orders[customer_id]), DATEADD(calendar[date], 1, MONTH))\n',
  ],
},

/* ── Algorithms ────────────────────────────────────────── */
{
  id: 'alg16', difficulty: 'medium', tags: ['algorithms', 'intervals', 'sorting'],
  title: 'Tables needed',
  prompt: [
    'Each booking is a pair `[start, end]` in minutes, and holds a table from start up to, but not including, end.',
    'Return the fewest tables the café needs so that no two overlapping bookings share one.',
  ],
  notes: ['A booking ending at 30 and one starting at 30 can share a table.', 'No bookings means no tables.'],
  stub: 'def solution(bookings):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(bookings):
    events = []
    for s, e in bookings:
        events.append((s, 1))
        events.append((e, -1))
    events.sort()
    cur = best = 0
    for _, d in events:
        cur += d
        best = max(best, cur)
    return best

def _example():
    return ([[0, 30], [15, 45], [20, 35], [30, 60], [50, 70]],)

def _cases():
    r = np.random.default_rng(116)
    big = []
    for _ in range(300):
        s = int(r.integers(0, 2000))
        big.append([s, s + int(r.integers(5, 120))])
    return [_example(), ([],), ([[10, 20]],), ([[0, 30], [30, 60], [60, 90]],),
            ([[0, 10], [0, 10], [0, 10]],), ([[5, 50], [10, 20], [20, 30], [30, 40]],), (big,)]
`,
  hint: 'Turn every booking into two moments: +1 table at its start, -1 at its end. Sort the moments by time, with ends before starts at the same time, and keep a running count. The biggest the count gets is the answer.',
  solution: 'def solution(bookings):\n    events = []\n    for s, e in bookings:\n        events.append((s, 1))\n        events.append((e, -1))\n    events.sort()\n    cur = best = 0\n    for _, d in events:\n        cur += d\n        best = max(best, cur)\n    return best\n',
  alt: ['import heapq\n\ndef solution(bookings):\n    ends = []\n    for s, e in sorted(bookings):\n        if ends and ends[0] <= s:\n            heapq.heapreplace(ends, e)\n        else:\n            heapq.heappush(ends, e)\n    return len(ends)\n'],
  wrong: [
    'def solution(bookings):\n    events = []\n    for s, e in bookings:\n        events.append((s, -1))\n        events.append((e, 1))\n    events.sort()\n    cur = best = 0\n    for _, d in events:\n        cur -= d\n        best = max(best, cur)\n    return best\n',
    'def solution(bookings):\n    if not bookings:\n        return 0\n    return max(sum(1 for s2, e2 in bookings if s2 < e and s < e2) for s, e in bookings)\n',
  ],
},
{
  id: 'alg17', difficulty: 'hard', tags: ['algorithms', 'dynamic programming', 'subsequences'],
  title: 'Longest climb',
  prompt: [
    '`prices` is a list of numbers, one per day.',
    'Return the length of the longest set of days, kept in order but not necessarily next to each other, where every price is **strictly higher** than the one before.',
  ],
  notes: ['For [3, 1, 4, 1, 5, 9, 2, 6], one longest climb is 1, 4, 5, 9: length 4.', 'An empty list has a climb of 0.'],
  stub: 'def solution(prices):\n    pass\n',
  mode: 'scalar',
  setup: `
from bisect import bisect_left as _bl

def _ref(prices):
    tails = []
    for p in prices:
        i = _bl(tails, p)
        if i == len(tails):
            tails.append(p)
        else:
            tails[i] = p
    return len(tails)

def _example():
    return ([3, 1, 4, 1, 5, 9, 2, 6],)

def _cases():
    r = np.random.default_rng(117)
    big = [int(x) for x in r.integers(0, 500, 800)]
    return [_example(), ([],), ([7],), ([2, 2, 2, 2],), ([5, 4, 3, 2, 1],), ([1, 2, 2, 3],),
            ([10, 1, 2, 11, 3, 4, 12],), (big,)]
`,
  hint: 'Keep a list `tails`: `tails[k]` is the smallest price that can end a climb of length k + 1. For each price, find with `bisect_left` the first tail that is not smaller, and replace it, or add the price to the end. The answer is the length of tails.',
  solution: 'from bisect import bisect_left\n\ndef solution(prices):\n    tails = []\n    for p in prices:\n        i = bisect_left(tails, p)\n        if i == len(tails):\n            tails.append(p)\n        else:\n            tails[i] = p\n    return len(tails)\n',
  alt: ['def solution(prices):\n    best = [1] * len(prices)\n    for i in range(len(prices)):\n        for j in range(i):\n            if prices[j] < prices[i] and best[j] + 1 > best[i]:\n                best[i] = best[j] + 1\n    return max(best, default=0)\n'],
  wrong: [
    'from bisect import bisect_right\n\ndef solution(prices):\n    tails = []\n    for p in prices:\n        i = bisect_right(tails, p)\n        if i == len(tails):\n            tails.append(p)\n        else:\n            tails[i] = p\n    return len(tails)\n',
    'def solution(prices):\n    best = cur = 0\n    for i, p in enumerate(prices):\n        cur = cur + 1 if i and p > prices[i - 1] else 1\n        best = max(best, cur)\n    return best\n',
  ],
},
{
  id: 'alg18', difficulty: 'medium', tags: ['algorithms', 'hash maps', 'strings'],
  title: 'Same letters',
  prompt: [
    'The labels on the jars got muddled. Words made of exactly the same letters, like "tea" and "eat", belong together.',
    'Return the groups as a list of lists: each group sorted A to Z, and the groups in order of their first word. Every word is in exactly one group, even if it is alone.',
  ],
  notes: ['Words are lower case, with no spaces.', 'A word that appears twice appears twice in its group.'],
  stub: 'def solution(words):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(words):
    groups = {}
    for w in words:
        groups.setdefault("".join(sorted(w)), []).append(w)
    return sorted((sorted(g) for g in groups.values()), key=lambda g: g[0])

def _example():
    return (["tea", "eat", "oat", "ate", "taco", "coat", "tao", "tan"],)

def _cases():
    r = np.random.default_rng(118)
    base = ["stop", "pots", "tops", "spot", "post", "melon", "lemon", "listen", "silent", "enlist", "rat", "tar", "art", "loop", "pool", "polo"]
    big = [str(w) for w in r.choice(base, 40)]
    return [_example(), ([],), (["solo"],), (["pool", "loop", "polo", "lop", "pol"],), (["cup", "cup", "puc"],), (big,)]
`,
  hint: 'Two words belong together when their letters, sorted, are the same: `"".join(sorted(word))` is a key they share. Put the words in a dict of lists by that key, then sort each group and sort the groups by their first word.',
  solution: 'def solution(words):\n    groups = {}\n    for w in words:\n        groups.setdefault("".join(sorted(w)), []).append(w)\n    return sorted((sorted(g) for g in groups.values()), key=lambda g: g[0])\n',
  alt: ['from collections import Counter, defaultdict\n\ndef solution(words):\n    groups = defaultdict(list)\n    for w in words:\n        groups[tuple(sorted(Counter(w).items()))].append(w)\n    out = [sorted(g) for g in groups.values()]\n    out.sort(key=lambda g: g[0])\n    return out\n'],
  wrong: [
    'def solution(words):\n    groups = {}\n    for w in words:\n        groups.setdefault(frozenset(w), []).append(w)\n    return sorted((sorted(g) for g in groups.values()), key=lambda g: g[0])\n',
    'def solution(words):\n    groups = {}\n    for w in set(words):\n        groups.setdefault("".join(sorted(w)), []).append(w)\n    return sorted((sorted(g) for g in groups.values()), key=lambda g: g[0])\n',
  ],
},
{
  id: 'alg19', difficulty: 'hard', tags: ['algorithms', 'graphs', 'shortest path'],
  title: 'Fastest delivery',
  prompt: [
    '`roads` is a list of `[a, b, minutes]`: a road between stops a and b, usable both ways, that takes that many minutes. Stops are named with text.',
    "Return the fewest minutes from `start` to `end`, or -1 if `end` can't be reached.",
  ],
  notes: ['The route with the fewest stops is not always the fastest.', 'From a stop to itself takes 0 minutes.'],
  stub: 'def solution(roads, start, end):\n    pass\n',
  mode: 'scalar',
  setup: `
import heapq as _hq

def _ref(roads, start, end):
    nxt = {}
    for a, b, m in roads:
        nxt.setdefault(a, []).append((b, m))
        nxt.setdefault(b, []).append((a, m))
    best = {start: 0}
    todo = [(0, start)]
    while todo:
        d, here = _hq.heappop(todo)
        if here == end:
            return d
        if d > best.get(here, float("inf")):
            continue
        for there, m in nxt.get(here, []):
            if d + m < best.get(there, float("inf")):
                best[there] = d + m
                _hq.heappush(todo, (d + m, there))
    return -1

def _example():
    roads = [["cafe", "market", 4], ["cafe", "bridge", 1], ["bridge", "school", 2],
             ["school", "market", 1], ["market", "office", 5], ["school", "office", 3]]
    return (roads, "cafe", "office")

def _cases():
    r = np.random.default_rng(119)
    stops = ["s%d" % i for i in range(40)]
    big = [[stops[i], stops[i + 1], int(r.integers(1, 20))] for i in range(39)]
    for _ in range(80):
        a, b = r.choice(40, 2, replace=False)
        big.append([stops[a], stops[b], int(r.integers(1, 60))])
    return [_example(),
            ([["a", "b", 3]], "a", "a"),
            ([["a", "b", 3], ["c", "d", 1]], "a", "d"),
            ([["a", "b", 10], ["a", "c", 1], ["c", "d", 1], ["d", "b", 1]], "a", "b"),
            ([["x", "y", 5]], "y", "x"),
            (big, "s0", "s39"), (big, "s5", "s30")]
`,
  hint: "Dijkstra's method: keep a heap of (minutes so far, stop), always take the closest stop next, and from it try every road out, keeping a stop's time only if it's better than any found before. The first time you take `end` off the heap, that's the answer.",
  solution: 'import heapq\n\ndef solution(roads, start, end):\n    nxt = {}\n    for a, b, m in roads:\n        nxt.setdefault(a, []).append((b, m))\n        nxt.setdefault(b, []).append((a, m))\n    best = {start: 0}\n    todo = [(0, start)]\n    while todo:\n        d, here = heapq.heappop(todo)\n        if here == end:\n            return d\n        if d > best.get(here, float("inf")):\n            continue\n        for there, m in nxt.get(here, []):\n            if d + m < best.get(there, float("inf")):\n                best[there] = d + m\n                heapq.heappush(todo, (d + m, there))\n    return -1\n',
  alt: ['def solution(roads, start, end):\n    best = {start: 0}\n    for _ in range(len(roads) + 1):\n        changed = False\n        for a, b, m in roads:\n            for x, y in ((a, b), (b, a)):\n                if x in best and best[x] + m < best.get(y, float("inf")):\n                    best[y] = best[x] + m\n                    changed = True\n        if not changed:\n            break\n    return best.get(end, -1)\n'],
  wrong: [
    'from collections import deque\n\ndef solution(roads, start, end):\n    nxt = {}\n    for a, b, m in roads:\n        nxt.setdefault(a, []).append((b, m))\n        nxt.setdefault(b, []).append((a, m))\n    seen = {start: 0}\n    todo = deque([start])\n    while todo:\n        here = todo.popleft()\n        for there, m in nxt.get(here, []):\n            if there not in seen:\n                seen[there] = seen[here] + m\n                todo.append(there)\n    return seen.get(end, -1)\n',
    'import heapq\n\ndef solution(roads, start, end):\n    nxt = {}\n    for a, b, m in roads:\n        nxt.setdefault(a, []).append((b, m))\n    best = {start: 0}\n    todo = [(0, start)]\n    while todo:\n        d, here = heapq.heappop(todo)\n        if here == end:\n            return d\n        for there, m in nxt.get(here, []):\n            if d + m < best.get(there, float("inf")):\n                best[there] = d + m\n                heapq.heappush(todo, (d + m, there))\n    return -1\n',
  ],
},
];
