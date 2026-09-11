export const PANDAS = [
{
  id: 'pd-01', mins: 3,
  title: 'A table you can talk to',
  concept: [
    'A **DataFrame** is a table: named columns, numbered rows.',
    'Build one from a dict — each key becomes a column.',
    'Put a bare variable on the last line and it gets printed.',
  ],
  starter: `import pandas as pd

menu = pd.DataFrame({
    "drink": ["latte", "espresso", "tea"],
    "price": [4.50, 3.00, 2.75],
})

menu`,
  task: 'Add a `cups` column with the values 30, 12, 18.',
  hint: 'One more `"name": [list]` pair inside the `{ }`. It must be the same length as the others — 3 items.',
  solution: `import pandas as pd

menu = pd.DataFrame({
    "drink": ["latte", "espresso", "tea"],
    "price": [4.50, 3.00, 2.75],
    "cups":  [30, 12, 18],
})

menu`,
  check: `assert "menu" in globals(), "Keep the table in a variable called menu."
assert "cups" in menu.columns, "menu doesn't have a cups column yet."
assert list(menu["cups"]) == [30, 12, 18], "cups should be 30, 12, 18 — in that order."`,
},
{
  id: 'pd-02', mins: 3,
  title: 'First look at real data',
  concept: [
    '`cafe` is already loaded for you — 120 days of sales.',
    '`.head()` shows the top rows, `.shape` gives (rows, columns).',
    '`.columns` lists the column names.',
  ],
  starter: `cafe.head()`,
  task: 'Print `cafe.shape`, then show the first **3** rows.',
  hint: 'Two lines: `print(cafe.shape)` and then `cafe.head(3)` last.',
  solution: `print(cafe.shape)

cafe.head(3)`,
  check: `assert "(120, 7)" in _out, "Add print(cafe.shape) — I should see (120, 7) in the output."
assert _out.count("2024-01-03") == 1, "Show exactly 3 rows with cafe.head(3)."
assert "2024-01-04" not in _out, "That's more than 3 rows — pass 3 to head()."`,
},
{
  id: 'pd-03', mins: 3,
  title: 'One column is a Series',
  concept: [
    '`cafe["cups"]` pulls out a single column — a **Series**.',
    'Series know how to summarise themselves: `.mean()`, `.max()`, `.sum()`.',
    '`cafe.cups` is a shortcut that works when the name has no spaces.',
  ],
  starter: `print(cafe["cups"].mean())
print(cafe["cups"].max())`,
  task: 'Store the **total** number of cups sold in a variable called `total_cups`.',
  hint: '`total_cups = cafe["cups"].sum()`',
  solution: `total_cups = cafe["cups"].sum()

print(cafe["cups"].mean())
print(total_cups)`,
  check: `assert "total_cups" in globals(), "Make a variable named total_cups."
assert int(total_cups) == int(cafe["cups"].sum()), "total_cups should be the sum of the cups column."`,
},
{
  id: 'pd-04', mins: 3,
  title: 'Counting and describing',
  concept: [
    '`.describe()` gives count, mean, min, max and quartiles at once.',
    '`.value_counts()` counts how often each value appears in a text column.',
    'Both return something you can keep working with.',
  ],
  starter: `cafe["revenue"].describe()`,
  task: 'Print how many rows belong to each `city`.',
  hint: '`cafe["city"].value_counts()` — put it on the last line, or wrap it in `print(...)`.',
  solution: `print(cafe["revenue"].describe())

cafe["city"].value_counts()`,
  check: `assert "Lagos" in _out and "Accra" in _out, "I should see the city names — use cafe['city'].value_counts()."
assert str(int((cafe["city"] == "Lagos").sum())) in _out, "That doesn't look like a count of the cities."`,
},
{
  id: 'pd-05', mins: 4,
  title: 'Keeping only the rows you want',
  concept: [
    '`cafe["cups"] > 45` gives a column of True/False — a **mask**.',
    'Feed the mask back in: `cafe[mask]` keeps only the True rows.',
    'This is the move you will use more than any other.',
  ],
  starter: `mask = cafe["cups"] > 45
print(mask.head())

cafe[mask].head()`,
  task: 'Make `busy` hold every row where more than 45 cups were sold.',
  hint: '`busy = cafe[cafe["cups"] > 45]` — the mask can go straight inside the brackets.',
  solution: `busy = cafe[cafe["cups"] > 45]

print(len(busy))
busy.head()`,
  check: `assert "busy" in globals(), "Make a variable called busy."
assert hasattr(busy, "columns"), "busy should be a DataFrame of rows, not a single column."
assert (busy["cups"] > 45).all(), "Some rows in busy have 45 cups or fewer."
assert len(busy) == int((cafe["cups"] > 45).sum()), "busy is missing some of the busy days."`,
},
{
  id: 'pd-06', mins: 4,
  title: 'Two conditions at once',
  concept: [
    'Use `&` for and, `|` for or, `~` for not.',
    '**Wrap every condition in brackets** — `(a > 1) & (b < 2)`.',
    'Plain `and` / `or` will not work here. Python needs the symbols.',
  ],
  starter: `hot = cafe[(cafe["city"] == "Lagos") & (cafe["cups"] > 40)]
hot.head()`,
  task: 'Make `cheap_good` = rows where `price` is under 3.5 **and** `rating` is above 4.5.',
  hint: '`cafe[(cafe["price"] < 3.5) & (cafe["rating"] > 4.5)]` — brackets around each side.',
  solution: `cheap_good = cafe[(cafe["price"] < 3.5) & (cafe["rating"] > 4.5)]

print(len(cheap_good))
cheap_good.head()`,
  check: `assert "cheap_good" in globals(), "Make a variable called cheap_good."
_want = cafe[(cafe["price"] < 3.5) & (cafe["rating"] > 4.5)]
assert len(cheap_good) == len(_want), "Row count is off — check both conditions and the & between them."`,
},
{
  id: 'pd-07', mins: 3,
  title: 'Adding a column',
  concept: [
    'Assign to a new name and the column appears: `df["new"] = ...`.',
    'Maths on a column happens to every row at once — no loop needed.',
    '`.round(2)` tidies up long decimals.',
  ],
  starter: `cafe["big_day"] = cafe["cups"] > 45

cafe[["cups", "big_day"]].head()`,
  task: 'Add a `tip` column worth 10% of `revenue`, rounded to 2 decimals.',
  hint: '`cafe["tip"] = (cafe["revenue"] * 0.10).round(2)`',
  solution: `cafe["tip"] = (cafe["revenue"] * 0.10).round(2)

cafe[["revenue", "tip"]].head()`,
  check: `assert "tip" in cafe.columns, "cafe still has no tip column."
_want = (cafe["revenue"] * 0.10).round(2)
assert (cafe["tip"] - _want).abs().max() < 0.005, "tip should be 10% of revenue, rounded to 2 places."`,
},
{
  id: 'pd-08', mins: 3,
  title: 'Sorting and top rows',
  concept: [
    '`.sort_values("col")` sorts small → large. Add `ascending=False` to flip it.',
    '`.nlargest(5, "col")` is the shortcut for "the top 5".',
    'Neither changes `cafe` — they hand you a new table.',
  ],
  starter: `cafe.sort_values("revenue", ascending=False).head()`,
  task: 'Put the 5 highest-revenue days in a variable called `top5`.',
  hint: '`top5 = cafe.nlargest(5, "revenue")` (or sort then `.head(5)`).',
  solution: `top5 = cafe.nlargest(5, "revenue")

top5`,
  check: `assert "top5" in globals(), "Make a variable called top5."
assert len(top5) == 5, "top5 should have exactly 5 rows."
_want = set(cafe.nlargest(5, "revenue")["revenue"].round(2))
assert set(top5["revenue"].round(2)) == _want, "Those aren't the 5 biggest revenue days."`,
},
{
  id: 'pd-09', mins: 4,
  title: 'groupby — the big one',
  concept: [
    '**Split → apply → combine**: split by a column, run a summary on each group.',
    '`cafe.groupby("city")["revenue"].mean()` reads left to right, exactly like that.',
    'The thing you grouped by becomes the index of the result.',
  ],
  starter: `cafe.groupby("city")["revenue"].mean()`,
  task: 'Make `by_drink` = the **total cups** sold for each `drink`.',
  hint: '`by_drink = cafe.groupby("drink")["cups"].sum()`',
  solution: `by_drink = cafe.groupby("drink")["cups"].sum()

by_drink`,
  check: `assert "by_drink" in globals(), "Make a variable called by_drink."
assert set(by_drink.index) == {"latte", "espresso", "cold brew", "tea"}, "Group by drink — one row per drink."
_want = cafe.groupby("drink")["cups"].sum()
assert (by_drink.sort_index() - _want.sort_index()).abs().max() < 1e-6, "Those should be summed cups per drink."`,
},
{
  id: 'pd-10', mins: 4,
  title: 'Several summaries at once',
  concept: [
    '`.agg(["sum", "mean"])` gives you more than one number per group.',
    'Named form is clearer: `.agg(total=("cups", "sum"), score=("rating", "mean"))`.',
    'You choose the output column names — future-you will thank you.',
  ],
  starter: `cafe.groupby("city")["revenue"].agg(["sum", "mean", "max"])`,
  task: 'Make `summary`: per `drink`, `total_cups` (sum of cups) and `avg_rating` (mean of rating).',
  hint: '`cafe.groupby("drink").agg(total_cups=("cups", "sum"), avg_rating=("rating", "mean"))`',
  solution: `summary = cafe.groupby("drink").agg(
    total_cups=("cups", "sum"),
    avg_rating=("rating", "mean"),
)

summary`,
  check: `assert "summary" in globals(), "Make a variable called summary."
assert set(summary.columns) == {"total_cups", "avg_rating"}, "Name the columns total_cups and avg_rating."
assert len(summary) == 4, "There should be one row per drink."`,
},
{
  id: 'pd-11', mins: 4,
  title: 'Holes in the data',
  concept: [
    'Missing values show as `NaN`. `rating` has 9 of them.',
    '`.isna().sum()` counts them per column — always look first.',
    '`.dropna()` removes those rows; `.fillna(value)` patches them.',
  ],
  starter: `print(cafe.isna().sum())

cafe["rating"].mean()`,
  task: 'Make `filled` = a copy of `cafe` where missing `rating` becomes the mean rating.',
  hint: '`filled = cafe.copy()` then `filled["rating"] = filled["rating"].fillna(cafe["rating"].mean())`',
  solution: `filled = cafe.copy()
filled["rating"] = filled["rating"].fillna(cafe["rating"].mean())

print(filled["rating"].isna().sum())
filled.head()`,
  check: `assert "filled" in globals(), "Make a variable called filled."
assert len(filled) == 120, "Don't drop the rows — fill them, so all 120 stay."
assert filled["rating"].isna().sum() == 0, "There are still missing ratings in filled."
assert abs(filled["rating"].mean() - cafe["rating"].mean()) < 0.02, "Fill with the mean rating."`,
},
{
  id: 'pd-12', mins: 4,
  title: 'Working with dates',
  concept: [
    'Real date columns unlock `.dt` — `cafe["date"].dt.month`, `.dt.day_name()`.',
    'Group by a derived date part to get a monthly or weekly view.',
    '`.dt.to_period("M")` labels each row with its month, like `2024-01`.',
  ],
  starter: `cafe["month"] = cafe["date"].dt.to_period("M")
cafe[["date", "month"]].head()`,
  task: 'Make `monthly` = total `revenue` per month.',
  hint: 'Add the `month` column first, then `cafe.groupby("month")["revenue"].sum()`.',
  solution: `cafe["month"] = cafe["date"].dt.to_period("M")
monthly = cafe.groupby("month")["revenue"].sum()

monthly`,
  check: `assert "monthly" in globals(), "Make a variable called monthly."
assert len(monthly) == 4, "Jan to Apr — that's 4 months."
assert abs(float(monthly.sum()) - float(cafe["revenue"].sum())) < 1.0, "The months should add up to total revenue."`,
},
{
  id: 'pd-13', mins: 4,
  title: 'Pivot tables',
  concept: [
    '`pivot_table` turns one column into rows and another into columns.',
    '`index=` down the side, `columns=` across the top, `values=` in the cells.',
    '`aggfunc="mean"` decides what to do when several rows land in one cell.',
  ],
  starter: `cafe.pivot_table(index="city", columns="drink", values="cups", aggfunc="sum")`,
  task: 'Make `grid` = mean `revenue`, cities down the side, drinks across the top.',
  hint: '`grid = cafe.pivot_table(index="city", columns="drink", values="revenue", aggfunc="mean")`',
  solution: `grid = cafe.pivot_table(
    index="city",
    columns="drink",
    values="revenue",
    aggfunc="mean",
)

grid.round(1)`,
  check: `assert "grid" in globals(), "Make a variable called grid."
assert set(grid.index) == {"Lagos", "Nairobi", "Accra"}, "Cities belong on the index."
assert set(grid.columns) == {"latte", "espresso", "cold brew", "tea"}, "Drinks belong across the columns."`,
},
{
  id: 'pd-14', mins: 4,
  title: 'loc and iloc',
  concept: [
    '`.loc[]` selects by **label**. `.iloc[]` selects by **position**.',
    'Both take rows first, then columns: `cafe.loc[0, "city"]`.',
    'Careful: `.iloc[0:3]` stops before 3, but `.loc[0:3]` includes 3.',
  ],
  starter: `print(cafe.loc[0, "city"])
print(cafe.iloc[0, 1])

cafe.loc[0:2, ["city", "cups"]]`,
  task: 'Use `.iloc` to put the **last 3 rows** and the **first 2 columns** in `last`.',
  hint: 'Negative positions count from the end: `cafe.iloc[-3:, :2]`.',
  solution: `last = cafe.iloc[-3:, :2]

last`,
  check: `assert "last" in globals(), "Make a variable called last."
assert last.shape == (3, 2), "Expected 3 rows and 2 columns, got %s." % (last.shape,)
assert list(last.columns) == ["date", "city"], "The first two columns are date and city."
assert list(last.index) == [117, 118, 119], "Those aren't the last 3 rows — try a negative position."`,
},
{
  id: 'pd-15', mins: 3,
  title: 'isin and between',
  concept: [
    '`.isin([...])` asks "is this value one of these?" — cleaner than chaining `|`.',
    '`.between(low, high)` tests a range, and includes both ends.',
    '`~` in front of a mask flips it to mean "not".',
  ],
  starter: `west = cafe[cafe["city"].isin(["Lagos", "Accra"])]
print(len(west))

west.head()`,
  task: 'Make `mid` = rows where `price` is between 3 and 4.5, and the drink is **not** tea.',
  hint: '`cafe[cafe["price"].between(3, 4.5) & ~cafe["drink"].isin(["tea"])]`',
  solution: `mid = cafe[cafe["price"].between(3, 4.5) & ~cafe["drink"].isin(["tea"])]

print(len(mid))
mid.head()`,
  check: `assert "mid" in globals(), "Make a variable called mid."
_want = cafe[cafe["price"].between(3, 4.5) & ~cafe["drink"].isin(["tea"])]
assert len(mid) == len(_want), "Row count is off — check the range and the 'not tea' part."
assert "tea" not in set(mid["drink"]), "Tea is still in there — you need the ~ to flip that mask."`,
},
{
  id: 'pd-16', mins: 3,
  title: 'Renaming and dropping',
  concept: [
    '`.rename(columns={"old": "new"})` fixes bad column names.',
    '`.drop(columns=[...])` removes columns you don\'t need.',
    'Both hand back a **new** table — the original is untouched.',
  ],
  starter: `cafe.rename(columns={"cups": "units"}).head(3)`,
  task: 'Make `tidy` = cafe with `cups` renamed to `units` **and** `rating` removed.',
  hint: 'Chain them: `cafe.rename(columns={"cups": "units"}).drop(columns=["rating"])`',
  solution: `tidy = cafe.rename(columns={"cups": "units"}).drop(columns=["rating"])

tidy.head()`,
  check: `assert "tidy" in globals(), "Make a variable called tidy."
assert "units" in tidy.columns, "cups should now be called units."
assert "cups" not in tidy.columns, "The old cups name is still there."
assert "rating" not in tidy.columns, "rating should be dropped."
assert len(tidy) == 120, "Drop the column, not the rows."`,
},
{
  id: 'pd-17', mins: 4,
  title: 'Your own function on a column',
  concept: [
    '`.map(fn)` runs your function on **every value** of a Series.',
    'A `lambda` is a throwaway function: `lambda c: "big" if c > 40 else "small"`.',
    '`.apply(fn, axis=1)` is the row-at-a-time version for whole DataFrames.',
  ],
  starter: `cafe["shout"] = cafe["drink"].map(str.upper)

cafe[["drink", "shout"]].head()`,
  task: 'Add a `size` column: `"big"` when cups is over 40, otherwise `"small"`.',
  hint: '`cafe["size"] = cafe["cups"].map(lambda c: "big" if c > 40 else "small")`',
  solution: `cafe["size"] = cafe["cups"].map(lambda c: "big" if c > 40 else "small")

print(cafe["size"].value_counts())
cafe[["cups", "size"]].head()`,
  check: `assert "size" in cafe.columns, "cafe has no size column yet."
assert set(cafe["size"].unique()) <= {"big", "small"}, 'Only the words "big" and "small".'
_want = cafe["cups"].map(lambda c: "big" if c > 40 else "small")
assert (cafe["size"] == _want).all(), "The cut-off should be above 40 cups."`,
},
{
  id: 'pd-18', mins: 4,
  title: 'Text columns and .str',
  concept: [
    '`.str` unlocks string methods on an entire column at once.',
    '`.str.upper()`, `.str.len()`, `.str.contains("co")`, `.str.startswith("c")`.',
    'They return a Series, so they drop straight into a filter.',
  ],
  starter: `print(cafe["drink"].str.upper().head(3))

cafe[cafe["drink"].str.contains("co")].head()`,
  task: 'Make `long_names` = rows where the drink name is longer than 5 characters.',
  hint: '`cafe[cafe["drink"].str.len() > 5]`',
  solution: `long_names = cafe[cafe["drink"].str.len() > 5]

print(long_names["drink"].unique())
long_names.head()`,
  check: `assert "long_names" in globals(), "Make a variable called long_names."
assert set(long_names["drink"].unique()) == {"espresso", "cold brew"}, "Only espresso and cold brew are longer than 5 letters."
assert len(long_names) == int((cafe["drink"].str.len() > 5).sum()), "Some matching rows are missing."`,
},
{
  id: 'pd-19', mins: 4,
  title: 'Turning numbers into bands',
  concept: [
    '`pd.cut(col, bins=[...])` slices a number column into labelled bands.',
    '`pd.qcut(col, 4)` makes **equal-sized** groups instead — quartiles.',
    'The result is a category you can then group by or count.',
  ],
  starter: `cafe["band"] = pd.cut(cafe["cups"], bins=[0, 20, 40, 60], labels=["low", "mid", "high"])

cafe["band"].value_counts()`,
  task: 'Add a `tier` column: `revenue` split into 4 equal-sized groups labelled Q1–Q4.',
  hint: '`cafe["tier"] = pd.qcut(cafe["revenue"], 4, labels=["Q1", "Q2", "Q3", "Q4"])`',
  solution: `cafe["tier"] = pd.qcut(cafe["revenue"], 4, labels=["Q1", "Q2", "Q3", "Q4"])

print(cafe["tier"].value_counts())
cafe[["revenue", "tier"]].head()`,
  check: `assert "tier" in cafe.columns, "cafe has no tier column yet."
assert set(str(v) for v in cafe["tier"].unique()) == {"Q1", "Q2", "Q3", "Q4"}, "Label the four groups Q1 to Q4."
_counts = cafe["tier"].value_counts()
assert _counts.max() - _counts.min() <= 1, "qcut gives equal-sized groups — cut gives equal-width ones. Use qcut."`,
},
{
  id: 'pd-20', mins: 4,
  title: 'Loading a real CSV',
  concept: [
    '`pd.read_csv("sales.csv")` is how data actually arrives in real life.',
    'There is no hard drive in your phone browser, so we hand it text instead — `io.StringIO(text)`. The API is identical.',
    '`df.to_csv(index=False)` goes the other way.',
  ],
  starter: `import io

text = """name,city,cups
Ada,Lagos,12
Kofi,Accra,30
Zola,Nairobi,25
Ife,Lagos,41"""

crew = pd.read_csv(io.StringIO(text))
crew`,
  task: 'Make `busy_crew` = the rows where `cups` is above 20.',
  hint: 'Exactly the filtering you already know: `crew[crew["cups"] > 20]`.',
  solution: `import io

text = """name,city,cups
Ada,Lagos,12
Kofi,Accra,30
Zola,Nairobi,25
Ife,Lagos,41"""

crew = pd.read_csv(io.StringIO(text))
busy_crew = crew[crew["cups"] > 20]

print(busy_crew.to_csv(index=False))
busy_crew`,
  check: `assert "crew" in globals(), "Keep the loaded table in a variable called crew."
assert list(crew.columns) == ["name", "city", "cups"], "read_csv should give you name, city and cups."
assert "busy_crew" in globals(), "Make a variable called busy_crew."
assert set(busy_crew["name"]) == {"Kofi", "Zola", "Ife"}, "Kofi, Zola and Ife are the ones above 20 cups."`,
},

/* ── Going further ─────────────────────────────────────── */
{
  id: 'pd-21', mins: 3,
  title: 'Ask in words: query',
  concept: [
    '`cafe.query("cups > 40")` filters with an expression written as text.',
    'Inside it, column names go bare, and you write `and` / `or` — no brackets, no `&`.',
    'Text inside the query needs its own quotes: `"city == \'Lagos\'"`.',
  ],
  starter: `cafe.query("cups > 50").head()`,
  task: 'Make `busy_lagos` = the Lagos days with **more than 40** cups, using `query`.',
  hint: "`cafe.query(\"city == 'Lagos' and cups > 40\")` — single quotes around Lagos, double quotes around the whole thing.",
  solution: `busy_lagos = cafe.query("city == 'Lagos' and cups > 40")

busy_lagos.head()`,
  check: `assert "busy_lagos" in globals(), "Make a variable called busy_lagos."
_want = cafe[(cafe["city"] == "Lagos") & (cafe["cups"] > 40)]
assert set(busy_lagos["city"]) == {"Lagos"}, "Only Lagos rows should be left."
assert len(busy_lagos) == len(_want), "There should be %d rows: Lagos AND more than 40 cups." % len(_want)`,
},
{
  id: 'pd-22', mins: 4,
  title: 'Build it in one chain',
  concept: [
    '`.assign(new=...)` adds a column and hands back the whole table, so the next step can follow on.',
    'Wrap a chain in brackets and put one step per line — it reads top to bottom, like a recipe.',
    'Inside assign, `lambda d: d["revenue"] / d["cups"]` means "the table as it is at this step".',
  ],
  starter: `per_cup = cafe["revenue"] / cafe["cups"]
cafe.assign(per_cup=per_cup).head()`,
  task: 'Make `best_value` in one chain: add `per_cup` (revenue ÷ cups), keep the rows where `per_cup` is under 3, and sort by `per_cup`, cheapest first.',
  hint: 'Three steps inside brackets: `.assign(per_cup=lambda d: d["revenue"] / d["cups"])`, then `.query("per_cup < 3")`, then `.sort_values("per_cup")`.',
  solution: `best_value = (
    cafe
    .assign(per_cup=lambda d: d["revenue"] / d["cups"])
    .query("per_cup < 3")
    .sort_values("per_cup")
)

best_value.head()`,
  check: `assert "best_value" in globals(), "Make a variable called best_value."
assert "per_cup" in best_value.columns, "Add a per_cup column with assign."
_pc = cafe["revenue"] / cafe["cups"]
assert len(best_value) == int((_pc < 3).sum()), "Keep only the rows where per_cup is under 3."
assert best_value["per_cup"].is_monotonic_increasing, "Sort it cheapest first."`,
},
{
  id: 'pd-23', mins: 3,
  title: 'Pick a value by condition',
  concept: [
    '`np.where(condition, if_true, if_false)` builds a whole column in one go.',
    '`np.where(cafe["cups"] > 40, "busy", "quiet")` gives busy or quiet for every row.',
    'For bands of numbers, `pd.cut` is still the better tool. np.where is for yes-or-no.',
  ],
  starter: `cafe["weekend"] = cafe["date"].dt.dayofweek >= 5
cafe[["date", "weekend"]].head(7)`,
  task: 'Add a column `day_type` that says `"weekend"` on Saturdays and Sundays and `"weekday"` otherwise.',
  hint: '`.dt.dayofweek` is 5 for Saturday and 6 for Sunday. `np.where(cafe["date"].dt.dayofweek >= 5, "weekend", "weekday")`',
  solution: `cafe["day_type"] = np.where(cafe["date"].dt.dayofweek >= 5, "weekend", "weekday")

cafe["day_type"].value_counts()`,
  check: `assert "day_type" in cafe.columns, "Add a day_type column to cafe."
_want = np.where(cafe["date"].dt.dayofweek >= 5, "weekend", "weekday")
assert (cafe["day_type"].astype(str).values == _want).all(), "Saturday and Sunday (dayofweek 5 and 6) are weekend; the rest are weekday."`,
},
{
  id: 'pd-24', mins: 4,
  title: 'Running totals and ranks',
  concept: [
    '`.cumsum()` adds up as it goes: every row holds the total so far.',
    '`.rank(ascending=False)` numbers values by size — 1 is the biggest.',
    'Both keep every row, unlike `.sum()` or `.max()`, which squash a column to one number.',
  ],
  starter: `cafe["revenue"].sum()`,
  task: 'Add two columns to `cafe`: `running` (the revenue so far, day by day) and `rank` (each day\'s revenue rank, 1 = the best day).',
  hint: '`cafe["running"] = cafe["revenue"].cumsum()` and `cafe["rank"] = cafe["revenue"].rank(ascending=False)`',
  solution: `cafe["running"] = cafe["revenue"].cumsum()
cafe["rank"] = cafe["revenue"].rank(ascending=False)

cafe.sort_values("rank").head()`,
  check: `assert "running" in cafe.columns, "Add a running column."
assert "rank" in cafe.columns, "Add a rank column."
assert abs(float(cafe["running"].iloc[-1]) - float(cafe["revenue"].sum())) < 0.01, "The last running total should equal all the revenue added together."
assert float(cafe.loc[cafe["revenue"].idxmax(), "rank"]) == 1, "The best day should have rank 1 — rank with ascending=False."`,
},
{
  id: 'pd-25', mins: 3,
  title: 'Shares, not counts',
  concept: [
    "The shop's `orders` table has a `status` for every order: delivered, shipped or cancelled.",
    '`.value_counts()` counts each value. `normalize=True` turns the counts into shares of the whole.',
    'Times 100 and rounded, that is a percentage people can read at a glance.',
  ],
  starter: `orders["status"].value_counts()`,
  task: 'Make `status_pct`: the percentage of orders with each status, rounded to 1 decimal place.',
  hint: '`(orders["status"].value_counts(normalize=True) * 100).round(1)`',
  solution: `status_pct = (orders["status"].value_counts(normalize=True) * 100).round(1)

status_pct`,
  check: `assert "status_pct" in globals(), "Make a variable called status_pct."
_want = (orders["status"].value_counts(normalize=True) * 100).round(1)
assert set(status_pct.index) == set(_want.index), "One value per status: delivered, shipped and cancelled."
assert abs(float(status_pct.sum()) - 100) < 0.5, "Shares of the whole add up to about 100 — use normalize=True, then multiply by 100."
assert all(abs(float(status_pct[k]) - float(_want[k])) < 0.06 for k in _want.index), "Round each percentage to 1 decimal place."`,
},
];
