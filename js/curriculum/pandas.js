export const PANDAS = [
{
  id: 'pd-01', mins: 3,
  title: 'A table you can talk to',
  concept: [
    'pandas is a Python toolkit for tables. `import pandas as pd` brings it in, and lets you call it `pd` for short.',
    'A table in pandas is called a **DataFrame**: named columns, numbered rows. `pd.DataFrame({...})` builds one from a dict. Each key becomes a column name, and its list becomes the values down that column.',
    'A name on the last line, on its own, is shown underneath when you run. No `print` needed.',
  ],
  starter: `import pandas as pd

menu = pd.DataFrame({
    "drink": ["latte", "espresso", "tea"],
    "price": [4.50, 3.00, 2.75],
})

menu`,
  task: 'Add a third column, `cups`, with the values 30, 12 and 18.',
  hint: 'One more line inside the curly brackets, like the other two: `"cups": [30, 12, 18],`. Every column needs the same number of values: 3 here.',
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
    '`cafe` is a table that is already loaded for you: 120 days of sales at a café in three cities.',
    '`cafe.head()` shows the first 5 rows, and `cafe.head(3)` the first 3. `cafe.shape` gives the size, as (rows, columns).',
    '`cafe.columns` lists the column names. `.head()` has brackets because it does something; `.shape` has none because it is just a fact about the table.',
  ],
  starter: `cafe.head()`,
  task: 'Print `cafe.shape`, then show the first **3** rows.',
  hint: 'Two lines: `print(cafe.shape)`, then `cafe.head(3)` on the last line.',
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
    '`cafe["cups"]` picks out one column: its name, in quotes, inside square brackets. A single column on its own is called a **Series**.',
    'A column can summarise itself: `.mean()` for the average, `.max()` for the biggest, `.sum()` for the total.',
    '`cafe.cups` is a shortcut for the same column. It only works when the name has no spaces.',
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
    '`.describe()` sums up a number column at once: how many values, the average (mean), the smallest, the largest, and the quarter points in between.',
    '`.value_counts()` counts how often each value appears: how many rows say Lagos, how many say Accra.',
    'Both give back a result you can store in a name and keep working with.',
  ],
  starter: `cafe["revenue"].describe()`,
  task: 'Show how many rows there are for each `city`.',
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
    '`cafe["cups"] > 45` asks the question of every row at once, and gives back a column of True/False answers. That column is called a **mask**.',
    'Put the mask inside `cafe[...]` and only the rows marked True are kept: `cafe[mask]`.',
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
assert hasattr(busy, "columns"), "busy should be a table of whole rows, not a single column: cafe[...] around the mask."
assert (busy["cups"] > 45).all(), "Some rows in busy have 45 cups or fewer."
assert len(busy) == int((cafe["cups"] > 45).sum()), "busy is missing some of the busy days."`,
},
{
  id: 'pd-06', mins: 4,
  title: 'Two conditions at once',
  concept: [
    'To combine questions, use `&` for "and", `|` for "or", and `~` for "not".',
    '**Put brackets around each question**: `(cafe["price"] < 3) & (cafe["cups"] > 40)`. Without them, Python works things out in the wrong order.',
    'The words `and` and `or` won\'t work here. On whole columns, pandas needs the symbols.',
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
    'Store something under a new column name and the column appears: `cafe["new"] = ...`.',
    'Maths on a column happens to every row at once: `cafe["revenue"] * 2` doubles them all. No loop needed.',
    '`.round(2)` rounds to 2 decimal places.',
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
    '`.sort_values("revenue")` sorts by that column, smallest first. Add `ascending=False` inside the brackets for largest first.',
    'A `name=value` inside the brackets, like `ascending=False`, is a setting: it changes how the function behaves.',
    '`.nlargest(5, "revenue")` is a shortcut for "the top 5". Neither one changes `cafe` itself: they give you a new table.',
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
    '`groupby` answers "per city" or "per drink" questions. It splits the rows into groups, works out a summary for each group, and puts the answers side by side.',
    '`cafe.groupby("city")["revenue"].mean()` reads left to right: group by city, take the revenue, find each group\'s average.',
    'The answer has one row per group, with the group names down the left. pandas calls those row labels the **index**.',
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
    '`.agg(["sum", "mean"])` works out more than one summary for each group.',
    'You can name each result as well: `.agg(total=("cups", "sum"), score=("rating", "mean"))`. Read each part as: new name = (which column, which summary).',
    'Choosing the column names yourself makes the table easier to read later.',
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
    'A missing value shows as `NaN`, short for "not a number". The `rating` column has 9 of them.',
    '`.isna().sum()` counts the missing values in each column. Always look before you work anything out.',
    '`.dropna()` removes the rows with gaps. `.fillna(value)` fills the gaps with a value you choose.',
  ],
  starter: `print(cafe.isna().sum())

cafe["rating"].mean()`,
  task: 'Make `filled`: a copy of `cafe` where each missing `rating` is replaced by the average rating.',
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
    'When a column holds real dates, `.dt` gets at parts of them: `cafe["date"].dt.month` is the month number, `.dt.day_name()` the name of the day.',
    'Group by one of those parts for a monthly or weekly view.',
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
    'A pivot table is a grid: one column\'s values down the side, another\'s across the top, and a summary in every cell.',
    '`index=` goes down the side, `columns=` across the top, and `values=` is what fills the cells.',
    '`aggfunc="mean"` says how to combine the rows that land in the same cell: here, by their average.',
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
assert set(grid.index) == {"Lagos", "Nairobi", "Accra"}, 'Cities go down the side: index="city".'
assert set(grid.columns) == {"latte", "espresso", "cold brew", "tea"}, 'Drinks go across the top: columns="drink".'`,
},
{
  id: 'pd-14', mins: 4,
  title: 'loc and iloc',
  concept: [
    '`.loc[]` picks rows and columns by their **names**. `.iloc[]` picks them by **position**, counting from 0.',
    'Both take rows first, then columns, with a comma between: `cafe.loc[0, "city"]`.',
    '`0:3` means "from 0 up to 3". Careful: `.iloc[0:3]` stops before 3, but `.loc[0:3]` includes 3.',
  ],
  starter: `print(cafe.loc[0, "city"])
print(cafe.iloc[0, 1])

cafe.loc[0:2, ["city", "cups"]]`,
  task: 'Use `.iloc` to put the **last 3 rows** and the **first 2 columns** in `last`.',
  hint: 'Negative positions count back from the end. `-3:` is "from third-last to the end", and `:2` is "up to position 2": `cafe.iloc[-3:, :2]`.',
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
    '`.isin(["Lagos", "Accra"])` asks "is this value one of these?", which is neater than several `|`.',
    '`.between(3, 4.5)` asks "is it in this range?", counting both ends.',
    '`~` in front of a mask turns every True to False and back, so it means "not".',
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
    '`.rename(columns={"old": "new"})` changes column names. The curly brackets pair each old name with its new one.',
    '`.drop(columns=["rating"])` removes the columns in the list.',
    'Both give back a **new** table, and leave the original as it was.',
  ],
  starter: `cafe.rename(columns={"cups": "units"}).head(3)`,
  task: 'Make `tidy` = cafe with `cups` renamed to `units` **and** `rating` removed.',
  hint: 'One after the other, joined by a dot: `cafe.rename(columns={"cups": "units"}).drop(columns=["rating"])`',
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
    '`.map(fn)` runs a function on **every value** in a column, and gives back all the answers as a new column.',
    'A `lambda` is a small function written on the spot. `lambda c: "big" if c > 40 else "small"` means: take a value, call it `c`, and give back "big" if it is over 40, otherwise "small".',
    '`.apply(fn, axis=1)` is the same idea, one whole row at a time.',
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
    '`.str` gives a text column the same tools a single piece of text has, used on every row at once.',
    '`.str.upper()`, `.str.len()` (how many characters), `.str.contains("co")`, `.str.startswith("c")`.',
    'The ones that ask a question give True or False for every row, so they work as a mask to filter with.',
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
    '`pd.cut(column, bins=[0, 20, 40, 60])` sorts numbers into bands with the edges you give: 0 to 20, 20 to 40, 40 to 60.',
    '`pd.qcut(column, 4)` makes 4 groups with the **same number of rows** in each, wherever the edges fall. Four equal groups are called quartiles.',
    'Either way, each row gets a band label you can count or group by.',
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
assert _counts.max() - _counts.min() <= 1, "Use qcut: it puts the same number of rows in each group. cut uses fixed edges instead."`,
},
{
  id: 'pd-20', mins: 4,
  title: 'Loading a real CSV',
  concept: [
    'A CSV is a plain text file holding a table: one row per line, commas between the values. It is how most data arrives.',
    '`pd.read_csv("sales.csv")` reads one into a table. There are no files to open here, so the text is handed over with `io.StringIO(text)` instead; it works the same way. Three quotes, `"""`, let text run over several lines.',
    '`.to_csv(index=False)` goes the other way, from a table back to CSV text.',
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
    '`cafe.query("cups > 40")` filters with the condition written as text, the way you would say it.',
    'Inside it, column names go without quotes or brackets, and you write `and` / `or` instead of `&` / `|`.',
    'A text value inside needs its own quotes, of the other kind: `"city == \'Lagos\'"`.',
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
    'A **chain** is several steps joined by dots, each one working on the result of the step before.',
    '`.assign(per_cup=...)` adds a column and gives back the whole table, so the next step can follow. Put the chain in round brackets, one step per line, and it reads top to bottom like a recipe.',
    'Inside assign, `lambda d: d["revenue"] / d["cups"]` means "work it out from the table `d`, as it is at this step".',
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
    '`np.where(question, if_true, if_false)` makes a whole column of answers in one go. `np` is numpy, the toolkit for numbers that pandas is built on.',
    '`np.where(cafe["cups"] > 40, "busy", "quiet")` gives "busy" or "quiet" for every row.',
    'np.where is for yes-or-no. For bands of numbers, `pd.cut` is still the better tool.',
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
    '`.value_counts()` counts each value. The setting `normalize=True` turns the counts into shares of the whole: fractions that add up to 1.',
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
