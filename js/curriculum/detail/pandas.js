/* pandas (pd-01 to pd-35): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Examples use the café's own tables,
   or a tiny one made on the spot, and never the task's answer. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: 'that day\'s takings', rating: 'the customers\' rating out of 5, missing on 9 days' };

export const PANDAS_DETAIL = {
'pd-01': {
  explain: [
    '**pandas** is a Python toolkit for working with tables. `import pandas as pd` brings it in, and lets you call it `pd` for short.',
    'A table in pandas is called a **DataFrame**: columns with names across the top, and rows numbered down the side, starting at 0.',
    '`pd.DataFrame({...})` builds one from a dict. Each key becomes a column name, and its list becomes the values down that column.',
    'Every column must have the same number of values, since each row needs one value in every column.',
    'A table\'s name on the last line, on its own, shows the table underneath when you run. No `print` needed.',
  ],
  example: {
    say: 'Here is a small table of pastries, built from a dict.',
    code: `import pandas as pd
pastries = pd.DataFrame({
    "pastry": ["croissant", "muffin", "scone"],
    "price": [2.20, 2.50, 1.90],
})
pastries`,
    lines: [
      ['"pastry": [...]', 'a column called pastry, with three values down it.'],
      ['"price": [...]', 'a second column, with one price for each pastry.'],
      ['pastries', 'on the last line on its own, so the table is shown, rows numbered 0 to 2.'],
    ],
  },
  brief: {
    story: 'The menu table needs to show how many of each drink sold today.',
    get: [['A table is ready:', { menu: 'a DataFrame with a drink column (latte, espresso, tea) and a price column' }]],
    want: ['Add a third column, `cups`, with the values 30, 12 and 18'],
    out: 'Keep the table in `menu`, now with three columns.',
  },
},
'pd-02': {
  explain: [
    '`cafe` is a table that\'s already loaded for you: 120 days of sales at a café chain in three cities.',
    '`cafe.head()` shows the first 5 rows, and `cafe.head(3)` the first 3. Looking at a few rows first is how you meet any new table.',
    '`cafe.shape` gives the size as (rows, columns).',
    '`cafe.columns` lists the column names.',
    '`.head()` has brackets because it does something; `.shape` and `.columns` have none, because they\'re facts about the table.',
  ],
  example: {
    say: 'Here is a first look at the café table: its size, its columns and its last rows.',
    code: `print(cafe.shape)
print(list(cafe.columns))
cafe.tail(2)`,
    lines: [
      ['cafe.shape', '120 rows and 7 columns.'],
      ['list(cafe.columns)', 'the seven column names, as a list.'],
      ['cafe.tail(2)', 'like head, but from the end: the last 2 rows.'],
    ],
  },
  brief: {
    story: 'A new analyst has joined, and their first job is to get a feel for the café data.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Print `cafe.shape`', 'Then show the first **3** rows'],
    out: 'The output should show (120, 7), then 3 rows of the table.',
  },
},
'pd-03': {
  explain: [
    '`cafe["cups"]` picks out one column: its name, in quotes, inside square brackets.',
    'A single column on its own is called a **Series**. It\'s like a list of values with the row numbers kept alongside.',
    'A column can sum itself up: `.sum()` for the total, `.mean()` for the average, `.max()` and `.min()` for the biggest and smallest.',
    'Each of these hands back a single number you can print or store in a variable.',
    '`cafe.cups` is a shortcut for the same column. It only works when the column\'s name has no spaces.',
  ],
  example: {
    say: 'Here the price column is picked out and summed up three ways.',
    code: `prices = cafe["price"]
print(prices.min())
print(prices.max())
print(round(prices.mean(), 2))`,
    lines: [
      ['cafe["price"]', 'picks out the price column as a Series.'],
      ['prices.min() / .max()', 'the cheapest and dearest price in the table.'],
      ['round(prices.mean(), 2)', 'the average price, tidied to 2 places.'],
    ],
  },
  brief: {
    story: 'The owner wants one number for the quarterly update: how many cups the café sold in total.',
    get: [['`cafe` is loaded, one row per day, including:', { cups: 'cups sold that day' }]],
    want: ['Add up the `cups` column'],
    out: 'Set `total_cups` to the total.',
  },
},
'pd-04': {
  explain: [
    '`.describe()` sums up a number column all at once: how many values, the average (mean), the spread (std), the smallest, the largest, and the quarter points in between.',
    'It\'s the quickest way to see what a column looks like, and to spot something odd, like a negative price.',
    '`.value_counts()` counts how often each value appears in a column: how many rows say Lagos, how many say Accra.',
    'It lists the most common value first.',
    'Both give back a result you can store in a name and keep working with.',
  ],
  example: {
    say: 'Here the cups column is summed up, and the drinks are counted.',
    code: `print(cafe["cups"].describe().round(1))
cafe["drink"].value_counts()`,
    lines: [
      ['cafe["cups"].describe()', 'count, mean, spread, smallest, quarters and largest of the cups.'],
      ['.round(1)', 'tidies those to 1 decimal place.'],
      ['cafe["drink"].value_counts()', 'how many days each drink appears on, most common first.'],
    ],
  },
  brief: {
    story: 'Head office suspects one city is under-represented in the data and wants a quick count.',
    get: [['`cafe` is loaded, one row per day, including:', { city: 'Lagos, Accra or Nairobi' }]],
    want: ['Count how many rows there are for each `city`'],
    out: 'Show the counts: put `cafe["city"].value_counts()` on the last line.',
  },
},
'pd-05': {
  explain: [
    'Comparing a column with a value, like `cafe["cups"] > 45`, asks the question of every row at once.',
    'It gives back a column of True/False answers, one per row. That column is called a **mask**.',
    'Put the mask inside `cafe[...]` and only the rows marked True are kept: `cafe[mask]`.',
    'The mask can go straight inside the brackets: `cafe[cafe["cups"] > 45]`.',
    'This is called **filtering**, and it\'s the move you\'ll use more than any other.',
  ],
  example: {
    say: 'Here the days with a top rating are kept.',
    code: `top = cafe[cafe["rating"] >= 4.9]
print(len(top), "days rated 4.9 or more")
top[["date", "city", "rating"]].head(3)`,
    lines: [
      ['cafe["rating"] >= 4.9', 'True for each day rated 4.9 or more, False for the rest.'],
      ['cafe[...]', 'keeps only the True rows.'],
      ['top[["date", "city", "rating"]]', 'shows just three columns, to keep it short.'],
    ],
  },
  brief: {
    story: 'The rota planner wants every day the café was really busy: more than 45 cups.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Keep every row where more than 45 cups were sold'],
    out: 'Set `busy` to those rows, with all their columns.',
  },
},
'pd-06': {
  explain: [
    'To combine questions, use `&` for "and", `|` for "or", and `~` for "not".',
    '`&` keeps a row only when both questions are True. `|` keeps it when either one is.',
    '**Put brackets around each question**: `(cafe["price"] < 3) & (cafe["cups"] > 40)`. Without them, Python works things out in the wrong order and you get an error.',
    'The words `and` and `or` won\'t work here. On whole columns, pandas needs the symbols.',
    'The combined mask goes inside `cafe[...]` exactly like a single one.',
  ],
  example: {
    say: 'Here the Accra days that were either very busy or very quiet are picked out.',
    code: `accra = cafe["city"] == "Accra"
extreme = (cafe["cups"] > 55) | (cafe["cups"] < 10)
cafe[accra & extreme][["date", "city", "cups"]]`,
    lines: [
      ['cafe["city"] == "Accra"', 'True on Accra days.'],
      ['(... > 55) | (... < 10)', 'True on days over 55 cups or under 10.'],
      ['cafe[accra & extreme]', 'keeps the rows where both masks are True.'],
    ],
  },
  brief: {
    story: 'Marketing wants to feature drinks that are cheap but well loved.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Keep the rows where `price` is under 3.5', '...**and** `rating` is above 4.5'],
    out: 'Set `cheap_good` to those rows.',
    fine: ['Put brackets round each condition.'],
  },
},
'pd-07': {
  explain: [
    'Storing something under a new column name makes the column appear: `cafe["new"] = ...`.',
    'Maths on a column happens to every row at once: `cafe["revenue"] * 2` doubles them all. No loop needed.',
    'You can combine columns too: `cafe["revenue"] / cafe["cups"]` divides row by row.',
    'A comparison makes a True/False column, which can also be stored.',
    '`.round(2)` rounds every value in the column to 2 decimal places.',
  ],
  example: {
    say: 'Here two new columns are worked out for every day.',
    code: `cafe["per_cup"] = (cafe["revenue"] / cafe["cups"]).round(2)
cafe["five_star"] = cafe["rating"] >= 4.8
cafe[["revenue", "cups", "per_cup", "five_star"]].head(3)`,
    lines: [
      ['cafe["revenue"] / cafe["cups"]', 'divides each day\'s takings by its cups, row by row.'],
      ['cafe["per_cup"] = ...', 'stores the answers as a new column.'],
      ['cafe["rating"] >= 4.8', 'a True/False column, stored as five_star.'],
    ],
  },
  brief: {
    story: 'The staff tip jar is shared, and the manager estimates it as 10% of each day\'s takings.',
    get: [['`cafe` is loaded, one row per day, including:', { revenue: 'that day\'s takings' }]],
    want: ['Add a `tip` column worth 10% of `revenue`', 'Round it to 2 decimals'],
    out: 'Add the `tip` column to `cafe`.',
  },
},
'pd-08': {
  explain: [
    '`.sort_values("revenue")` sorts the table by that column, smallest first.',
    'Add `ascending=False` inside the brackets for largest first.',
    'A `name=value` inside the brackets, like `ascending=False`, is a **setting**: it changes how the function behaves.',
    '`.nlargest(5, "revenue")` is a shortcut for "the top 5 by revenue", and `.nsmallest` the bottom.',
    'Neither changes `cafe` itself: they hand you a new, sorted table. Store it if you want to keep it.',
  ],
  example: {
    say: 'Here the quietest days are found two ways.',
    code: `quiet = cafe.sort_values("cups").head(3)
print(quiet[["date", "city", "cups"]])
cafe.nsmallest(3, "cups")[["date", "city", "cups"]]`,
    lines: [
      ['cafe.sort_values("cups")', 'the whole table, fewest cups first.'],
      ['.head(3)', 'the first 3 rows of that: the three quietest days.'],
      ['cafe.nsmallest(3, "cups")', 'the same three, in one step.'],
    ],
  },
  brief: {
    story: 'The anniversary post will celebrate the café\'s five best days for takings.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Find the 5 highest-revenue days'],
    out: 'Set `top5` to those 5 rows.',
  },
},
'pd-09': {
  explain: [
    '`groupby` answers "per city" or "per drink" questions.',
    'It splits the rows into groups (all the Lagos rows, all the Accra rows...), works out a summary for each group, and puts the answers side by side.',
    '`cafe.groupby("city")["revenue"].mean()` reads left to right: group by city, take the revenue, find each group\'s average.',
    'Any summary works at the end: `.sum()`, `.mean()`, `.max()`, `.count()`.',
    'The answer has one row per group, with the group names down the left. pandas calls those row labels the **index**.',
  ],
  example: {
    say: 'Here the best day in each city and each drink\'s average rating are found.',
    code: `print(cafe.groupby("city")["cups"].max())
cafe.groupby("drink")["rating"].mean().round(2)`,
    lines: [
      ['cafe.groupby("city")["cups"].max()', 'the most cups on any single day, for each city.'],
      ['cafe.groupby("drink")["rating"].mean()', 'the average rating for each drink.'],
      ['.round(2)', 'tidies the averages.'],
    ],
  },
  brief: {
    story: 'The buyer orders milk and beans by drink, and wants the total cups sold of each.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Add up the cups sold for each `drink`'],
    out: 'Set `by_drink`: one row per drink.',
  },
},
'pd-10': {
  explain: [
    '`.agg(["sum", "mean"])` works out more than one summary for each group at once, one column each.',
    'You can also name each result: `.agg(total=("cups", "sum"), score=("rating", "mean"))`.',
    'Read each part as: new column name = (which column, which summary).',
    'That way one groupby can summarise several columns, each in its own way.',
    'Choosing the names yourself makes the table easier to read later.',
  ],
  example: {
    say: 'Here each city gets its busiest day, its average price and its number of days.',
    code: `cafe.groupby("city").agg(
    busiest=("cups", "max"),
    avg_price=("price", "mean"),
    days=("date", "count"),
).round(2)`,
    lines: [
      ['busiest=("cups", "max")', 'a column called busiest: the max of cups in each city.'],
      ['avg_price=("price", "mean")', 'the average price in each city.'],
      ['days=("date", "count")', 'how many days each city has.'],
    ],
  },
  brief: {
    story: 'The menu review looks at each drink\'s sales and how well it\'s liked, side by side.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Group by `drink`', 'Make `total_cups`: the sum of cups', 'Make `avg_rating`: the mean of rating'],
    out: 'Set `summary`: one row per drink, with columns `total_cups` and `avg_rating`.',
  },
},
'pd-11': {
  explain: [
    'A missing value shows as `NaN`, short for "not a number". The `rating` column has 9 of them, on days nobody rated.',
    '`.isna()` marks each missing value True, and `.isna().sum()` counts them in each column. Always look before you work anything out.',
    '`.dropna()` removes the rows with gaps. Easy, but you lose those rows\' other data too.',
    '`.fillna(value)` fills the gaps with a value you choose instead, keeping every row.',
    '`.copy()` makes a separate copy of a table, so filling the copy leaves the original alone.',
  ],
  example: {
    say: 'Here the gaps are counted, then dropped and filled, to compare.',
    code: `print(cafe["rating"].isna().sum(), "missing ratings")
print(len(cafe.dropna()), "rows left after dropna")
filled = cafe["rating"].fillna(0)
print(filled.isna().sum(), "missing after fillna")`,
    lines: [
      ['cafe["rating"].isna().sum()', 'counts the missing ratings: 9.'],
      ['cafe.dropna()', 'throws away the 9 rows with a gap, leaving 111.'],
      ['.fillna(0)', 'fills each gap with 0 (a poor choice for ratings, which is why the task uses the average).'],
    ],
  },
  brief: {
    story: 'The satisfaction chart needs a rating for every day, and the team agreed to fill gaps with the average.',
    get: [['`cafe` is loaded, one row per day, including:', { rating: 'the customers\' rating out of 5, missing on 9 days' }]],
    want: ['Make `filled`: a copy of `cafe`', 'Replace each missing `rating` with the average rating'],
    out: 'Set `filled`, keeping all 120 rows.',
  },
},
'pd-12': {
  explain: [
    'When a column holds real dates, `.dt` gets at the parts of them.',
    '`cafe["date"].dt.month` is the month number, `.dt.day_name()` the name of the weekday, and `.dt.year` the year.',
    '`.dt.to_period("M")` labels each row with its month, like `2024-01`, which is handy for grouping.',
    'Group by one of those parts for a monthly or weekly view: `cafe.groupby(cafe["date"].dt.day_name())`.',
    'The cafe table runs from January to April 2024.',
  ],
  example: {
    say: 'Here each day gets its weekday, and takings are added up by weekday.',
    code: `cafe["weekday"] = cafe["date"].dt.day_name()
print(cafe[["date", "weekday"]].head(3))
cafe.groupby("weekday")["revenue"].sum().round(0)`,
    lines: [
      ['cafe["date"].dt.day_name()', 'the weekday of each date, like Wednesday.'],
      ['cafe.groupby("weekday")["revenue"].sum()', 'total takings for each weekday.'],
    ],
  },
  brief: {
    story: 'The monthly report needs takings for each month of the year so far.',
    get: [['`cafe` is loaded, one row per day, including:', { date: 'the day, as a real date', revenue: 'that day\'s takings' }]],
    want: ['Label each row with its month', 'Add up the `revenue` for each month'],
    out: 'Set `monthly`: one row per month, January to April.',
  },
},
'pd-13': {
  explain: [
    'A **pivot table** is a grid: one column\'s values down the side, another\'s across the top, and a summary in every cell.',
    '`index=` says what goes down the side, and `columns=` what goes across the top.',
    '`values=` is the column whose numbers fill the cells.',
    '`aggfunc=` says how to combine the rows that land in the same cell: `"sum"`, `"mean"`, `"max"` and so on.',
    'It\'s the same as a groupby on two columns, laid out as a grid that\'s easy to read.',
  ],
  example: {
    say: 'Here the busiest day is shown for every city and drink.',
    code: `cafe.pivot_table(index="drink", columns="city", values="cups", aggfunc="max")`,
    lines: [
      ['index="drink"', 'one row per drink, down the side.'],
      ['columns="city"', 'one column per city, across the top.'],
      ['values="cups", aggfunc="max"', 'each cell holds the most cups on any day for that drink in that city.'],
    ],
  },
  brief: {
    story: 'The regional meeting compares average takings for every drink in every city on one grid.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Put cities down the side and drinks across the top', 'Fill each cell with the mean `revenue`'],
    out: 'Set `grid` to the pivot table.',
  },
},
'pd-14': {
  explain: [
    '`.loc[]` picks rows and columns by **label**: the row labels down the left (here 0 to 119) and the column names.',
    '`.iloc[]` picks by **position**, counting from 0, whatever the labels are.',
    'Both take rows first, then columns, with a comma between: `cafe.loc[0, "city"]` or `cafe.iloc[0, 1]`.',
    'A colon picks a range: `0:3` means "from 0 up to 3". Careful: `.iloc[0:3]` stops before 3, but `.loc[0:3]` includes 3.',
    'Negative positions count back from the end in `.iloc`: `-1` is the last row.',
  ],
  example: {
    say: 'Here single values and small blocks are picked out both ways.',
    code: `print(cafe.loc[5, "drink"])
print(cafe.iloc[-1, 2])
cafe.loc[10:12, ["city", "cups", "revenue"]]`,
    lines: [
      ['cafe.loc[5, "drink"]', 'the row labelled 5, the drink column.'],
      ['cafe.iloc[-1, 2]', 'the last row, the third column (position 2 is drink).'],
      ['cafe.loc[10:12, [...]]', 'rows 10, 11 and 12 (loc includes the end), and three columns.'],
    ],
  },
  brief: {
    story: 'A quick spot check of the newest data: the last few days, just the date and city.',
    get: [['`cafe` is loaded: 120 rows, with date and city as its first two columns.']],
    want: ['Use `.iloc` to take the **last 3 rows**', 'And the **first 2 columns**'],
    out: 'Set `last`: 3 rows by 2 columns.',
  },
},
'pd-15': {
  explain: [
    '`.isin(["Lagos", "Accra"])` asks "is this value one of these?" for every row. It\'s neater than several `|`s.',
    '`.between(3, 4.5)` asks "is it in this range?", counting both ends as inside.',
    'Both give a True/False mask, so they work inside `cafe[...]` like any other condition.',
    '`~` in front of a mask flips every True to False and back, so it means "not": `~cafe["drink"].isin(["tea"])` is every drink except tea.',
    'They combine with `&` and `|` like any mask.',
  ],
  example: {
    say: 'Here the coffee drinks with a mid-range rating are picked out.',
    code: `coffee = cafe["drink"].isin(["latte", "espresso"])
mid = cafe["rating"].between(4, 4.5)
print(len(cafe[coffee & mid]), "coffee days rated 4 to 4.5")
cafe[~cafe["city"].isin(["Lagos"])]["city"].unique()`,
    lines: [
      ['.isin(["latte", "espresso"])', 'True for latte or espresso rows.'],
      ['.between(4, 4.5)', 'True for ratings from 4 to 4.5, both ends included.'],
      ['~cafe["city"].isin(["Lagos"])', 'every city except Lagos.'],
    ],
  },
  brief: {
    story: 'The mid-price review looks at everything priced 3 to 4.50, but tea is being reviewed separately.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Keep the rows where `price` is between 3 and 4.5', '...and the drink is **not** tea'],
    out: 'Set `mid` to those rows.',
  },
},
'pd-16': {
  explain: [
    '`.rename(columns={"old": "new"})` changes column names. The curly brackets pair each old name with its new one.',
    'You can rename several at once by adding more pairs.',
    '`.drop(columns=["rating"])` removes the columns named in the list.',
    'Both give back a **new** table, and leave the original as it was.',
    'Steps can be joined with dots, one after the other: `cafe.rename(...).drop(...)`.',
  ],
  example: {
    say: 'Here the table is tidied for a report: two renames and a column dropped.',
    code: `report = cafe.rename(columns={"revenue": "takings", "drink": "item"}).drop(columns=["rating", "price"])
print(list(report.columns))
print(list(cafe.columns))`,
    lines: [
      ['.rename(columns={...})', 'revenue becomes takings and drink becomes item.'],
      ['.drop(columns=[...])', 'leaves out rating and price.'],
      ['print(list(cafe.columns))', 'cafe itself still has its original columns.'],
    ],
  },
  brief: {
    story: 'The stock system expects "units" rather than "cups", and doesn\'t want ratings at all.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Rename `cups` to `units`', 'Remove `rating`'],
    out: 'Set `tidy` to the new table, keeping all 120 rows.',
  },
},
'pd-17': {
  explain: [
    '`.map(fn)` runs a function on **every value** in a column, and gives back all the answers as a new column.',
    'Any function works: a built-in like `str.upper`, one you wrote with `def`, or a lambda.',
    'A **lambda** is a small function written on the spot. `lambda c: "big" if c > 40 else "small"` means: take a value, call it c, and give back "big" if it\'s over 40, otherwise "small".',
    '`.apply(fn, axis=1)` is the same idea, but one whole row at a time, so the function can use several columns.',
    'For simple maths, plain column arithmetic is faster; `.map` is for rules that need a bit of logic.',
  ],
  example: {
    say: 'Here each rating gets a word, and each drink a size of cup.',
    code: `cafe["mood"] = cafe["rating"].map(lambda r: "happy" if r >= 4 else "meh")
cups = {"espresso": "small", "latte": "large", "cold brew": "large", "tea": "medium"}
cafe["cup"] = cafe["drink"].map(cups)
cafe[["rating", "mood", "drink", "cup"]].head(4)`,
    lines: [
      ['lambda r: "happy" if r >= 4 else "meh"', 'a one-line rule, run on every rating.'],
      ['cafe["drink"].map(cups)', 'map can also take a dict: it looks each drink up.'],
    ],
  },
  brief: {
    story: 'The rota labels each day big or small, depending on whether it sold more than 40 cups.',
    get: [['`cafe` is loaded, one row per day, including:', { cups: 'cups sold that day' }]],
    want: ['Add a `size` column: `"big"` when cups is over 40, otherwise `"small"`'],
    out: 'Add the `size` column to `cafe`.',
  },
},
'pd-18': {
  explain: [
    '`.str` gives a text column the same tools a single piece of text has, used on every row at once.',
    '`.str.upper()` and `.str.lower()` change the capitals, and `.str.len()` counts the characters in each value.',
    '`.str.contains("co")` asks whether each value contains some text, and `.str.startswith("c")` whether it starts with it.',
    'The ones that ask a question give True or False for every row, so they work as a mask to filter with.',
    'Missing values stay missing, rather than causing an error.',
  ],
  example: {
    say: 'Here the drinks with a space in their name, and the cities starting with A, are found.',
    code: `print(cafe["drink"].str.title().unique())
two_words = cafe[cafe["drink"].str.contains(" ")]
print(two_words["drink"].unique())
cafe[cafe["city"].str.startswith("A")]["city"].unique()`,
    lines: [
      ['.str.title()', 'a capital at the start of each word, on every row.'],
      ['.str.contains(" ")', 'True where the drink has a space: only cold brew.'],
      ['.str.startswith("A")', 'True for Accra.'],
    ],
  },
  brief: {
    story: 'The new menu board has narrow slots, so drinks with long names need checking.',
    get: [['`cafe` is loaded, one row per day, including:', { drink: 'latte, espresso, cold brew or tea' }]],
    want: ['Keep the rows where the drink name is longer than 5 characters'],
    out: 'Set `long_names` to those rows.',
  },
},
'pd-19': {
  explain: [
    '`pd.cut(column, bins=[0, 20, 40, 60])` sorts numbers into bands, with the edges you give: 0 to 20, 20 to 40, 40 to 60.',
    '`labels=["low", "mid", "high"]` names the bands; without labels, each shows its range.',
    '`pd.qcut(column, 4)` makes 4 groups with the **same number of rows** in each, wherever the edges happen to fall.',
    'Four equal groups are called **quartiles**: Q1 is the bottom quarter, Q4 the top.',
    'Either way, each row gets a band label you can count or group by.',
  ],
  example: {
    say: 'Here prices are banded by fixed edges, and ratings split into three equal groups.',
    code: `cafe["price_band"] = pd.cut(cafe["price"], bins=[0, 3, 4.5, 10], labels=["budget", "standard", "premium"])
print(cafe["price_band"].value_counts())
cafe["rating_third"] = pd.qcut(cafe["rating"], 3, labels=["low", "mid", "top"])
cafe["rating_third"].value_counts()`,
    lines: [
      ['pd.cut(..., bins=[0, 3, 4.5, 10])', 'fixed edges, so the bands can hold very different numbers of days.'],
      ['pd.qcut(cafe["rating"], 3, ...)', 'three groups with as near the same number of rated days in each as possible.'],
    ],
  },
  brief: {
    story: 'The finance team ranks days into quarters by takings, from the slowest quarter to the best.',
    get: [['`cafe` is loaded, one row per day, including:', { revenue: 'that day\'s takings' }]],
    want: ['Split `revenue` into 4 equal-sized groups', 'Label them Q1 to Q4'],
    out: 'Add a `tier` column to `cafe`.',
  },
},
'pd-20': {
  explain: [
    'A **CSV** is a plain text file holding a table: one row per line, with commas between the values. It\'s how most data arrives.',
    '`pd.read_csv("sales.csv")` reads one into a DataFrame, using the first line as the column names.',
    'There are no files to open here, so the text is handed over with `io.StringIO(text)` instead. It works exactly the same way.',
    'Three quotes, `"""`, let a piece of text run over several lines.',
    '`.to_csv(index=False)` goes the other way, from a table back to CSV text, leaving out the row numbers.',
  ],
  example: {
    say: 'Here a small CSV of deliveries is read, filtered and written back out.',
    code: `import io
text = """item,bags
beans,6
milk,12
sugar,3"""
deliveries = pd.read_csv(io.StringIO(text))
print(deliveries)
print(deliveries[deliveries["bags"] > 5].to_csv(index=False))`,
    lines: [
      ['pd.read_csv(io.StringIO(text))', 'reads the text as if it were a file: two columns, three rows.'],
      ['deliveries["bags"] > 5', 'the same filtering as on any table.'],
      ['.to_csv(index=False)', 'turns the result back into CSV text.'],
    ],
  },
  brief: {
    story: 'The barista leaderboard arrived as a CSV, and the manager wants the busy ones.',
    get: [['Ready to use:', { text: 'a CSV of name, city and cups for four baristas', crew: 'that CSV read into a table' }]],
    want: ['Keep the rows of `crew` where `cups` is above 20'],
    out: 'Set `busy_crew` to those rows.',
  },
},
'pd-21': {
  explain: [
    '`cafe.query("cups > 40")` filters with the condition written as text, the way you\'d say it.',
    'Inside the text, column names go without quotes or brackets.',
    'You write the words `and` / `or` instead of `&` / `|`, and no extra brackets are needed.',
    'A text value inside needs its own quotes, of the other kind: `"city == \'Lagos\'"`.',
    'It gives the same result as the mask way; use whichever reads more clearly to you.',
  ],
  example: {
    say: 'Here two filters are written with query.',
    code: `print(len(cafe.query("drink == 'tea' and rating >= 4.5")))
cafe.query("cups < 10 or cups >= 58")[["date", "city", "cups"]]`,
    lines: [
      ['"drink == \'tea\' and rating >= 4.5"', 'tea days rated 4.5 or more; tea needs its own quotes.'],
      ['"cups < 10 or cups >= 58"', 'the very quiet or very busiest days, written with "or".'],
    ],
  },
  brief: {
    story: 'The Lagos manager wants their busiest days, and prefers filters that read like a sentence.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Use `query` to keep the Lagos days with **more than 40** cups'],
    out: 'Set `busy_lagos` to those rows.',
  },
},
'pd-22': {
  explain: [
    'A **chain** is several steps joined by dots, each one working on the result of the step before.',
    '`.assign(per_cup=...)` adds a column and hands back the whole table, so the next step can follow on.',
    'Put the chain inside round brackets, one step per line, and it reads top to bottom like a recipe.',
    'Inside assign, `lambda d: d["revenue"] / d["cups"]` means "work it out from the table d, as it is at this step".',
    'Chains avoid lots of in-between variables, and make the order of the steps obvious.',
  ],
  example: {
    say: 'Here a chain finds the best-rated Nairobi days, with a new column, in four steps.',
    code: `(
    cafe
    .query("city == 'Nairobi'")
    .assign(stars=lambda d: d["rating"].round())
    .sort_values("rating", ascending=False)
    .head(3)[["date", "rating", "stars"]]
)`,
    lines: [
      ['.query("city == \'Nairobi\'")', 'step 1: only Nairobi days.'],
      ['.assign(stars=lambda d: ...)', 'step 2: a new column, worked out from the table at this step.'],
      ['.sort_values(...).head(3)', 'steps 3 and 4: best first, then the top three.'],
    ],
  },
  brief: {
    story: 'The pricing team wants the days when a cup earned the least, worked out in one readable chain.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Add `per_cup`: revenue ÷ cups, with `assign`', 'Keep the rows where `per_cup` is under 3', 'Sort by `per_cup`, cheapest first', 'Do it all in one chain'],
    out: 'Set `best_value` to the result.',
  },
},
'pd-23': {
  explain: [
    '`np.where(question, if_true, if_false)` makes a whole column of answers in one go.',
    '`np` is **numpy**, the toolkit for numbers that pandas is built on. It\'s already imported here as `np`.',
    'The question is a True/False mask; each row gets the first value where it\'s True and the second where it\'s False.',
    '`np.where(cafe["cups"] > 40, "busy", "quiet")` gives "busy" or "quiet" for every row.',
    'np.where is for a yes-or-no choice. For bands of numbers, `pd.cut` is still the better tool.',
  ],
  example: {
    say: 'Here each day is marked as a good or a bad day for ratings, and its first-half or second-half of the month.',
    code: `cafe["mood"] = np.where(cafe["rating"] >= 4, "good", "poor")
cafe["half"] = np.where(cafe["date"].dt.day <= 15, "first half", "second half")
cafe[["date", "rating", "mood", "half"]].head(3)`,
    lines: [
      ['np.where(cafe["rating"] >= 4, "good", "poor")', '"good" where the rating is 4 or more, "poor" everywhere else (a missing rating counts as not 4 or more).'],
      ['cafe["date"].dt.day <= 15', 'True in the first fifteen days of each month.'],
    ],
  },
  brief: {
    story: 'The rota differs at weekends, so every day needs marking as a weekday or a weekend.',
    get: [['`cafe` is loaded, one row per day, including:', { date: 'the day; `.dt.dayofweek` is 5 for Saturday and 6 for Sunday' }]],
    want: ['Add a column `day_type`', 'It says `"weekend"` on Saturdays and Sundays, and `"weekday"` otherwise'],
    out: 'Add `day_type` to `cafe`.',
  },
},
'pd-24': {
  explain: [
    '`.cumsum()` adds up as it goes down a column: every row holds the total so far. It\'s also called a **running total**.',
    'The last value of a running total is the same as `.sum()` of the whole column.',
    '`.rank()` numbers values by size. With `ascending=False`, 1 is the biggest.',
    'Equal values share a rank (by default, the average of the places they\'d take).',
    'Both keep every row, unlike `.sum()` or `.max()`, which squash a whole column to one number.',
  ],
  example: {
    say: 'Here cups build up day by day, and each day\'s rating is ranked.',
    code: `cafe["cups_so_far"] = cafe["cups"].cumsum()
cafe["rating_rank"] = cafe["rating"].rank(ascending=False)
cafe[["date", "cups", "cups_so_far", "rating", "rating_rank"]].head(4)`,
    lines: [
      ['cafe["cups"].cumsum()', 'each row holds all the cups up to and including that day.'],
      ['.rank(ascending=False)', 'the best rating gets 1; ties share a rank like 2.5.'],
    ],
  },
  brief: {
    story: 'The owner tracks takings building up through the year, and wants each day\'s place in the league.',
    get: [['`cafe` is loaded, one row per day, in date order, including:', { revenue: 'that day\'s takings' }]],
    want: ['Add `running`: the revenue so far, day by day', 'Add `rank`: each day\'s revenue rank, 1 = the best day'],
    out: 'Add both columns to `cafe`.',
  },
},
'pd-25': {
  explain: [
    'The shop\'s `orders` table has a `status` for every online order: delivered, shipped or cancelled.',
    '`.value_counts()` counts each value, biggest first.',
    'The setting `normalize=True` turns the counts into **shares** of the whole: fractions that add up to 1.',
    'Times 100 and rounded, that\'s a percentage people can read at a glance.',
    'Shares are fairer than counts for comparing: 50 cancellations out of 100 is very different from 50 out of 1,000.',
  ],
  example: {
    say: 'Here the café\'s days are counted by drink, then turned into percentages.',
    code: `print(cafe["drink"].value_counts())
(cafe["drink"].value_counts(normalize=True) * 100).round(1)`,
    lines: [
      ['value_counts()', 'how many days each drink appears on.'],
      ['normalize=True', 'the same as shares of all 120 days.'],
      ['* 100 ... .round(1)', 'as percentages, to 1 place, adding up to 100.'],
    ],
  },
  brief: {
    story: 'Customer service wants to report what share of online orders get cancelled.',
    get: [['`orders` is loaded, one row per online order, including:', { status: 'delivered, shipped or cancelled' }]],
    want: ['Work out the percentage of orders with each status', 'Round to 1 decimal place'],
    out: 'Set `status_pct`.',
  },
},
'pd-26': {
  explain: [
    '`.head(3)` after a `groupby` keeps the first 3 rows **of each group**, not of the whole table.',
    'So sort first, biggest at the top, then group: each group\'s first 3 rows are its best 3.',
    '`cafe.sort_values("revenue", ascending=False).groupby("city").head(3)` is each city\'s three best days.',
    'You get the original rows back, with all their columns, not a summary.',
    'The rows keep the sorted order, so the cities come out mixed together. Sort again at the end to group them neatly.',
  ],
  example: {
    say: 'Here each drink\'s two best-rated days are kept.',
    code: `best = cafe.sort_values("rating", ascending=False).groupby("drink").head(2)
best.sort_values(["drink", "rating"], ascending=[True, False])[["drink", "date", "rating"]]`,
    lines: [
      ['sort_values("rating", ascending=False)', 'best-rated days first.'],
      ['.groupby("drink").head(2)', 'the first 2 rows of each drink: its two best days.'],
      ['sort_values(["drink", "rating"], ...)', 'tidies them so each drink\'s rows sit together.'],
    ],
  },
  brief: {
    story: 'Each café manager gets a certificate for their three best days.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Find each city\'s three best days by revenue'],
    out: 'Set `top3` to those rows of `cafe`: 9 rows in all.',
  },
},
'pd-27': {
  explain: [
    '`.groupby("customer_id").filter(...)` keeps or drops **whole groups** at once: every order of a customer who passes, none of a customer who doesn\'t.',
    'The test is a small function given one group at a time, as a little table.',
    '`lambda g: len(g) >= 6` asks "does this customer have 6 or more orders?"',
    'You get the original rows back, with all their columns, not a summary.',
    'That\'s the difference from `.agg()`, which squashes each group into one row.',
  ],
  example: {
    say: 'Here only the cities with more than 40 days in the data are kept, with all their days.',
    code: `print(cafe.groupby("city").size())
big = cafe.groupby("city").filter(lambda g: len(g) > 40)
print(big["city"].unique())
print(len(big), "rows kept")`,
    lines: [
      ['cafe.groupby("city").size()', 'how many days each city has: Lagos 47, Accra 37, Nairobi 36.'],
      ['lambda g: len(g) > 40', 'g is all the rows for one city; keep the city if it has more than 40.'],
      ['len(big)', 'every one of Lagos\'s 47 rows is kept; the other cities are dropped whole.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants every order placed by its true regulars: customers with 6 or more orders.',
    get: [['`orders` is loaded, one row per online order:', { order_id: 'the order', customer_id: 'who placed it', order_date: 'the day', status: 'delivered, shipped or cancelled' }]],
    want: ['Keep every order placed by a customer with 6 or more orders', 'Keep all the columns of `orders`'],
    out: 'Set `regulars` to those orders.',
  },
},
'pd-28': {
  explain: [
    '`.groupby("customer_id").cumcount()` numbers the rows inside each group, counting from 0: a customer\'s first order is 0, their next is 1, and so on.',
    'Add 1 to count from 1, the way people do.',
    'Sort by date first. Otherwise "first" just means whichever row happened to come first in the table.',
    'The numbers sit on every row, so they can go straight in as a new column.',
    'With that number, "first orders" is simply `nth == 1`, and "third order or later" is `nth >= 3`.',
  ],
  example: {
    say: 'Here each city\'s days are numbered in order, and each city\'s first day is picked out.',
    code: `c = cafe.sort_values("date").copy()
c["day_no"] = c.groupby("city").cumcount() + 1
print(c[["date", "city", "day_no"]].head(5))
c[c["day_no"] == 1][["date", "city"]]`,
    lines: [
      ['cafe.sort_values("date")', 'puts the days in order first.'],
      ['groupby("city").cumcount() + 1', 'numbers each city\'s rows 1, 2, 3...'],
      ['c[c["day_no"] == 1]', 'each city\'s first day in the data.'],
    ],
  },
  brief: {
    story: 'The welcome-offer team wants each customer\'s very first order.',
    get: [['`o` is ready: the `orders` table sorted by date, then order id.']],
    want: ['Add a column `nth` to `o`: which order this is for that customer, 1 for their first', 'Make `firsts`: just the rows where `nth` is 1'],
    out: 'Add `nth` and set `firsts`.',
  },
},
'pd-29': {
  explain: [
    '`.diff()` gives each value minus the one before it.',
    'On dates, the answer is a length of time, and `.dt.days` turns that into a number of days.',
    'After `.groupby("customer_id")`, "the one before" means that customer\'s previous order, never someone else\'s.',
    'Each customer\'s first order has nothing before it, so its gap is missing (NaN). That\'s right: there was no gap yet.',
    '`.mean()` skips the missing values, so the average gap only uses real gaps.',
  ],
  example: {
    say: 'Here the change in cups from one day to the next is worked out within each city.',
    code: `c = cafe.sort_values("date").copy()
c["change"] = c.groupby("city")["cups"].diff()
c[["date", "city", "cups", "change"]].head(6)`,
    lines: [
      ['c.groupby("city")["cups"].diff()', 'each day\'s cups minus that city\'s previous day.'],
      ['change on a city\'s first row', 'missing (NaN): there\'s no earlier day in that city to compare with.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants to know how long customers usually wait between orders.',
    get: [['`o` is ready: `orders` sorted by date, with a `gap` column that mistakenly compares every order with the row above it.']],
    want: ['Fix `gap` so it\'s the days since **that customer\'s** previous order', 'Make `typical_gap`: the average gap, rounded to 1 place'],
    out: 'Fix `gap` and set `typical_gap`.',
  },
},
'pd-30': {
  explain: [
    'Group by two columns, `cafe.groupby(["city", "drink"])["revenue"].sum()`, and the result has a two-level index: city on the outside, drink inside. That\'s a **MultiIndex**.',
    '`.loc["Lagos"]` takes a whole outer level: every drink in Lagos.',
    '`.loc[("Lagos", "latte")]` gives a single value: latte in Lagos.',
    '`.xs("latte", level="drink")` cuts the other way: latte in every city. xs is short for cross-section.',
    '`.unstack()` turns the inner level into columns, making a grid like a pivot table.',
  ],
  example: {
    say: 'Here cups are summed by city and drink, then sliced three ways.',
    code: `both = cafe.groupby(["city", "drink"])["cups"].sum()
print(both.loc["Accra"])
print(both.loc[("Nairobi", "tea")])
both.xs("espresso", level="drink")`,
    lines: [
      ['both.loc["Accra"]', 'every drink in Accra.'],
      ['both.loc[("Nairobi", "tea")]', 'one number: tea in Nairobi.'],
      ['both.xs("espresso", level="drink")', 'espresso across all three cities.'],
    ],
  },
  brief: {
    story: 'The Lagos manager wants their drinks, and the latte buyer wants latte across every city, from the same summary.',
    get: [['`by_both` is ready: revenue grouped by city, then drink.']],
    want: ['Make `lagos`: the revenue of every drink in Lagos', 'Make `latte`: latte revenue in every city'],
    out: 'Set `lagos` and `latte`.',
  },
},
'pd-31': {
  explain: [
    '`pivot_table(..., margins=True)` adds a total row along the bottom and a total column down the side, like the grand totals in a spreadsheet pivot.',
    '`margins_name="Total"` names them. Leave it out and they\'re called "All".',
    'The totals are worked out from the data itself, not by adding up the rounded cells, so they\'re always right.',
    'The bottom-right corner is the grand total of everything.',
    '`.round(2)` at the end tidies every cell.',
  ],
  example: {
    say: 'Here cups are pivoted by drink and city, with totals.',
    code: `cafe.pivot_table(values="cups", index="drink", columns="city", aggfunc="sum",
                 margins=True, margins_name="Total")`,
    lines: [
      ['margins=True', 'adds a total row and a total column.'],
      ['margins_name="Total"', 'names them Total instead of All.'],
      ['the bottom-right cell', 'every cup sold, in every city.'],
    ],
  },
  brief: {
    story: 'The board pack wants takings by city and drink, with totals on both edges, like the old spreadsheet.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Pivot revenue by city (rows) and drink (columns), summed', 'Add totals called "Total" on both edges', 'Round to 2 places'],
    out: 'Set `grid` to the pivot table.',
  },
},
'pd-32': {
  explain: [
    '`cafe["date"].dt.day_name()` gives "Monday", "Tuesday" and so on.',
    'Group by it and the days come out A to Z: Friday first, Wednesday last. Not much use for a weekly chart.',
    '`pd.Categorical(column, categories=[...], ordered=True)` tells pandas the right order. Sorting and grouping then follow it.',
    'Adding `observed=True` to the groupby keeps pandas from warning about it.',
    'Use it for anything with a natural order that isn\'t alphabetical: months, sizes like S, M and L, or ratings like low, medium, high.',
  ],
  example: {
    say: 'Here cup sizes are put in their natural order instead of alphabetical.',
    code: `sizes = pd.Series(["large", "small", "medium", "small", "large", "large"])
print(sizes.value_counts().sort_index())
ordered = pd.Categorical(sizes, categories=["small", "medium", "large"], ordered=True)
pd.Series(ordered).value_counts().sort_index()`,
    lines: [
      ['sort_index() on plain text', 'A to Z: large, medium, small.'],
      ['pd.Categorical(..., categories=[...], ordered=True)', 'tells pandas the real order.'],
      ['sort_index() on the categorical', 'now small, medium, large.'],
    ],
  },
  brief: {
    story: 'The weekly chart lists the days alphabetically, which confuses everyone.',
    get: [['`cafe` is loaded, with a `day` column of weekday names already added.']],
    want: ['Make the days run Monday to Sunday', 'Add up the revenue for each day of the week', 'Round to 2 places'],
    out: 'Set `by_day`, in week order.',
  },
},
'pd-33': {
  explain: [
    'Exports often cram several values into one cell, like an order\'s items written as "latte, scone". Counted like that, each ticket is one lump.',
    '`.str.split(", ")` turns the text in each cell into a list.',
    '`.explode("items")` then gives every item in the list its own row, copying the rest of the row alongside.',
    'Then it\'s ordinary data again: `value_counts()` counts each item, and groupby works as usual.',
    'The rows keep their original label, so you can tell which items came from the same ticket.',
  ],
  example: {
    say: 'Here a table of baristas and the drinks they can make is exploded and counted.',
    code: `skills = pd.DataFrame({
    "barista": ["Ama", "Ben"],
    "drinks": ["latte, flat white", "latte, cold brew, tea"],
})
skills["drinks"] = skills["drinks"].str.split(", ")
long = skills.explode("drinks")
print(long)
long["drinks"].value_counts()`,
    lines: [
      ['.str.split(", ")', 'each cell becomes a list of drinks.'],
      ['.explode("drinks")', 'one row per barista per drink.'],
      ['value_counts()', 'how many baristas can make each drink: latte 2.'],
    ],
  },
  brief: {
    story: 'Each ticket\'s items arrived as one comma-separated cell, and the kitchen wants item counts.',
    get: [['`tickets` is ready:', { ticket: 'the ticket number', items: 'the items on it, as text like "latte, scone"' }]],
    want: ['Split `items` into lists', 'Explode them into one row per item', 'Count how many times each item was ordered'],
    out: 'Set `counts`, most first.',
  },
},
'pd-34': {
  explain: [
    '`.rank()` after a `groupby` ranks each value against its own group only: the best day **in each city** gets rank 1.',
    '`cafe.groupby("city")["revenue"].rank(ascending=False)` keeps every row, so it can go straight in as a new column.',
    'Compare `cafe["revenue"].rank()` without a groupby, which ranks against the whole table.',
    'Filtering for rank 1 then gives each group\'s winner.',
    'SQL does the same with `RANK() OVER (PARTITION BY city ORDER BY revenue DESC)`: the groupby plays the part of PARTITION BY.',
  ],
  example: {
    say: 'Here each day\'s cups are ranked within its drink, and each drink\'s busiest day is found.',
    code: `cafe["drink_rank"] = cafe.groupby("drink")["cups"].rank(ascending=False, method="first")
cafe[cafe["drink_rank"] == 1][["drink", "date", "cups"]]`,
    lines: [
      ['groupby("drink")["cups"].rank(...)', 'ranks each day against the other days of the same drink.'],
      ['method="first"', 'breaks ties by order, so each drink has exactly one rank 1.'],
      ['cafe[cafe["drink_rank"] == 1]', 'each drink\'s busiest day.'],
    ],
  },
  brief: {
    story: 'Every café gets its own leaderboard, so each needs its best day picked out.',
    get: [['`cafe` is loaded, one row per day:', CAFE]],
    want: ['Add `city_rank`: each day\'s revenue rank within its own city, 1 for that city\'s best day', 'Make `best`: the rows where `city_rank` is 1'],
    out: 'Add `city_rank` and set `best`: 3 rows.',
  },
},
'pd-35': {
  explain: [
    'A **cohort** is everyone who started in the same month, like "the January joiners".',
    '`.dt.to_period("M")` turns each date into its month, like 2024-03, so every date in a month matches.',
    '`.groupby("customer_id")["month"].transform("min")` finds each customer\'s first month and puts it on every one of their orders.',
    'A pivot of customers by cohort (rows) and month (columns), counting different customers, is a **cohort grid**.',
    'Read along a row to see how many of one month\'s starters were still buying in later months: the heart of retention analysis.',
  ],
  example: {
    say: 'Here each city gets the first month it appears in the data, the same trick on the café table.',
    code: `c = cafe.copy()
c["month"] = c["date"].dt.to_period("M")
c["first_month"] = c.groupby("city")["month"].transform("min")
c[["date", "city", "month", "first_month"]].head(4)`,
    lines: [
      ['.dt.to_period("M")', 'each date as its month.'],
      ['transform("min")', 'each city\'s earliest month, written on every one of its rows.'],
    ],
  },
  brief: {
    story: 'The investors want a cohort grid: of each month\'s new customers, how many kept ordering?',
    get: [['`o` is ready: a copy of `orders` with a `month` column (each order\'s month).']],
    want: ['Add `cohort` to `o`: each customer\'s first month', 'Make `grid`: how many different customers ordered, with cohorts as rows and months as columns', 'Put 0 where there were none'],
    out: 'Add `cohort` and set `grid`.',
  },
},
};
