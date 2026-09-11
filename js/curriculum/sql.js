/* SQL — the same questions the pandas track asks, put to a database.
   Every dataset in the prelude is also a table (SQLite, built fresh each
   run), so cafe here is the very cafe you already know.

   Checks call _same_as(reference_sql): the learner's last result must
   match the reference's, rows in any order unless ordered=True. Column
   names are compared without caring about case. */

export const SQL = [
{
  id: 'sq-01', mins: 3,
  title: 'Ask a table for columns',
  concept: [
    'SQL asks a database for rows. Every dataset you know is a table here — `cafe` included.',
    '`SELECT` names the columns and `FROM` names the table. `*` means every column.',
    '`LIMIT 5` keeps it short while you look around.',
  ],
  starter: `SELECT *
FROM cafe
LIMIT 5;`,
  task: 'Get just the `date`, `city` and `revenue` columns — for every row, not just five.',
  hint: 'List the columns after SELECT with commas between them, and drop the LIMIT.',
  solution: `SELECT date, city, revenue
FROM cafe;`,
  check: `_same_as("SELECT date, city, revenue FROM cafe")`,
},
{
  id: 'sq-02', mins: 3,
  title: 'Keep the rows you want',
  concept: [
    '`WHERE` keeps only the rows where the condition holds.',
    "One `=` to compare, not two. Text goes in **single** quotes: `city = 'Lagos'`.",
    'Join conditions with `AND` and `OR`.',
  ],
  starter: `SELECT date, city, cups
FROM cafe
WHERE cups > 50;`,
  task: 'The Lagos days that sold **more than 40** cups. Just `date` and `cups`.',
  hint: "Two conditions joined by AND: `city = 'Lagos'` and `cups > 40`.",
  solution: `SELECT date, cups
FROM cafe
WHERE city = 'Lagos' AND cups > 40;`,
  check: `_same_as("SELECT date, cups FROM cafe WHERE city = 'Lagos' AND cups > 40")`,
},
{
  id: 'sq-03', mins: 3,
  title: 'Sort, then cut',
  concept: [
    '`ORDER BY col` sorts smallest first. Add `DESC` for biggest first.',
    '`LIMIT n` keeps the first n rows *after* sorting — that is how you get a top five.',
    'Sort on two columns with a comma: `ORDER BY city, revenue DESC`.',
  ],
  starter: `SELECT date, city, revenue
FROM cafe
ORDER BY revenue
LIMIT 5;`,
  task: 'The five highest-revenue days: `date`, `city`, `revenue`, biggest first.',
  hint: 'The starter sorts the wrong way round. `DESC` after the column flips it.',
  solution: `SELECT date, city, revenue
FROM cafe
ORDER BY revenue DESC
LIMIT 5;`,
  check: `_same_as("SELECT date, city, revenue FROM cafe ORDER BY revenue DESC LIMIT 5", ordered=True)`,
},
{
  id: 'sq-04', mins: 3,
  title: 'Lists, ranges and patterns',
  concept: [
    "`drink IN ('latte', 'tea')` is a short way to write several ORs.",
    '`price BETWEEN 3 AND 4` includes both ends.',
    "`drink LIKE '%brew'` matches a pattern: `%` stands for anything at all.",
  ],
  starter: `SELECT date, drink, price
FROM cafe
WHERE drink = 'latte';`,
  task: 'Latte **or** tea days where the price was between 3 and 4: `date`, `drink`, `price`.',
  hint: "`WHERE drink IN ('latte', 'tea') AND price BETWEEN 3 AND 4`",
  solution: `SELECT date, drink, price
FROM cafe
WHERE drink IN ('latte', 'tea')
  AND price BETWEEN 3 AND 4;`,
  check: `_same_as("SELECT date, drink, price FROM cafe WHERE drink IN ('latte', 'tea') AND price BETWEEN 3 AND 4")`,
},
{
  id: 'sq-05', mins: 3,
  title: 'Missing is NULL',
  concept: [
    'A missing value is `NULL`. Nine days in `cafe` have no rating.',
    '`rating = NULL` is never true — not even for the missing ones. Ask `rating IS NULL`.',
    '`COALESCE(rating, 0)` swaps a NULL for something else when you need a value.',
  ],
  starter: `SELECT date, city, drink
FROM cafe
WHERE rating = NULL;`,
  task: 'Find the days with no rating: `date`, `city`, `drink`. The starter looks right and finds nothing — fix it.',
  hint: 'NULL means unknown, and "is unknown equal to unknown?" is itself unknown. `IS NULL` is the question that works.',
  solution: `SELECT date, city, drink
FROM cafe
WHERE rating IS NULL;`,
  check: `_same_as("SELECT date, city, drink FROM cafe WHERE rating IS NULL")`,
},
{
  id: 'sq-06', mins: 3,
  title: 'Work something out',
  concept: [
    'A column can be a calculation: `cups * price`.',
    '`AS` names the result: `cups * price AS takings`.',
    'Careful: a whole number divided by a whole number drops the fraction in SQLite. `45 / 8` is 5; `45 / 8.0` is 5.625.',
  ],
  starter: `SELECT date, cups, cups / 8 AS per_hour
FROM cafe;`,
  task: 'For every day: `date`, `cups`, and `per_hour` — cups over an 8-hour day, **rounded to 1 place**. The starter loses the fractions.',
  hint: 'Divide by `8.0` instead of `8`, and wrap it in `ROUND(..., 1)`.',
  solution: `SELECT date, cups, ROUND(cups / 8.0, 1) AS per_hour
FROM cafe;`,
  check: `_same_as("SELECT date, cups, ROUND(cups / 8.0, 1) AS per_hour FROM cafe")`,
},
{
  id: 'sq-07', mins: 3,
  title: 'Squash it to one row',
  concept: [
    '`COUNT`, `SUM`, `AVG`, `MIN` and `MAX` turn a whole column into one number.',
    '`COUNT(*)` counts rows. `COUNT(rating)` counts only the ratings that exist.',
    '`AVG` skips NULLs by itself — no cleaning needed first.',
  ],
  starter: `SELECT COUNT(rating) AS days
FROM cafe;`,
  task: 'One row: `days` (how many rows), `total` (all the revenue, rounded to 2) and `avg_rating` (rounded to 2).',
  hint: '`COUNT(*) AS days, ROUND(SUM(revenue), 2) AS total, ROUND(AVG(rating), 2) AS avg_rating`',
  solution: `SELECT COUNT(*) AS days,
       ROUND(SUM(revenue), 2) AS total,
       ROUND(AVG(rating), 2) AS avg_rating
FROM cafe;`,
  check: `_same_as("SELECT COUNT(*) AS days, ROUND(SUM(revenue), 2) AS total, ROUND(AVG(rating), 2) AS avg_rating FROM cafe")`,
},
{
  id: 'sq-08', mins: 4,
  title: 'One row per group',
  concept: [
    '`GROUP BY city` does the squashing once **per city**.',
    'Every column you select must be grouped on, or sit inside an aggregate like `SUM`.',
    "It's pandas' `groupby(...).agg(...)` in one sentence.",
  ],
  starter: `SELECT city, SUM(revenue)
FROM cafe;`,
  task: 'Per city: `city`, `days` (how many rows) and `revenue` (the total, rounded to 2).',
  hint: 'Add `GROUP BY city` at the end, and name the two numbers with AS.',
  solution: `SELECT city, COUNT(*) AS days, ROUND(SUM(revenue), 2) AS revenue
FROM cafe
GROUP BY city;`,
  check: `_same_as("SELECT city, COUNT(*) AS days, ROUND(SUM(revenue), 2) AS revenue FROM cafe GROUP BY city")`,
},
{
  id: 'sq-09', mins: 4,
  title: 'Filter the groups',
  concept: [
    '`WHERE` filters rows **before** grouping. `HAVING` filters groups **after**.',
    'So a condition on `SUM(...)` or `AVG(...)` goes in HAVING.',
    'The order to remember: WHERE, then GROUP BY, then HAVING.',
  ],
  starter: `SELECT drink, ROUND(AVG(cups), 1) AS avg_cups
FROM cafe
GROUP BY drink;`,
  task: 'Only the drinks that average **more than 35** cups a day: `drink`, `avg_cups` (rounded to 1).',
  hint: 'After GROUP BY: `HAVING AVG(cups) > 35`',
  solution: `SELECT drink, ROUND(AVG(cups), 1) AS avg_cups
FROM cafe
GROUP BY drink
HAVING AVG(cups) > 35;`,
  check: `_same_as("SELECT drink, ROUND(AVG(cups), 1) AS avg_cups FROM cafe GROUP BY drink HAVING AVG(cups) > 35")`,
},
{
  id: 'sq-10', mins: 4,
  title: 'Labels from rules',
  concept: [
    "`CASE WHEN ... THEN ... ELSE ... END` makes a new value from rules — like `np.where` with more branches.",
    'The first WHEN that matches wins.',
    'You can `GROUP BY` the label you just made.',
  ],
  starter: `SELECT CASE WHEN cups < 20 THEN 'quiet'
            ELSE 'normal' END AS band,
       COUNT(*) AS days
FROM cafe
GROUP BY band;`,
  task: "Add a third band: more than 45 cups is `'busy'`. Count the days in each: `band`, `days`.",
  hint: "Another line before the ELSE: `WHEN cups > 45 THEN 'busy'`",
  solution: `SELECT CASE WHEN cups < 20 THEN 'quiet'
            WHEN cups > 45 THEN 'busy'
            ELSE 'normal' END AS band,
       COUNT(*) AS days
FROM cafe
GROUP BY band;`,
  check: `_same_as("SELECT CASE WHEN cups < 20 THEN 'quiet' WHEN cups > 45 THEN 'busy' ELSE 'normal' END AS band, COUNT(*) AS days FROM cafe GROUP BY band")`,
},
{
  id: 'sq-11', mins: 4,
  title: 'Dates are text here',
  concept: [
    "SQLite keeps dates as text like `'2024-01-31'` — which happens to sort correctly.",
    "`strftime('%Y-%m', date)` pulls out the year and month. `'%m'` is just the month, `'%w'` the weekday.",
    'Group by it and you have monthly totals.',
  ],
  starter: `SELECT date, strftime('%m', date) AS month, revenue
FROM cafe
LIMIT 5;`,
  task: 'Monthly takings: `month` like `2024-01` and `revenue` (the total, rounded to 2), in month order.',
  hint: "`strftime('%Y-%m', date) AS month`, then GROUP BY month and ORDER BY month.",
  solution: `SELECT strftime('%Y-%m', date) AS month,
       ROUND(SUM(revenue), 2) AS revenue
FROM cafe
GROUP BY month
ORDER BY month;`,
  check: `_same_as("SELECT strftime('%Y-%m', date) AS month, ROUND(SUM(revenue), 2) AS revenue FROM cafe GROUP BY month ORDER BY month", ordered=True)`,
},
{
  id: 'sq-12', mins: 4,
  title: 'Join two tables',
  concept: [
    '`JOIN cities ON cafe.city = cities.city` lines rows up wherever the cities match.',
    'Short aliases save typing: `FROM cafe c JOIN cities ci ON c.city = ci.city`.',
    'A plain JOIN keeps only rows that match on both sides.',
  ],
  starter: `SELECT *
FROM cities;`,
  task: 'Total revenue by **country**: `country`, `revenue` (rounded to 2). The country lives in `cities`.',
  hint: 'Join cafe to cities on city, then `GROUP BY ci.country`.',
  solution: `SELECT ci.country, ROUND(SUM(c.revenue), 2) AS revenue
FROM cafe c
JOIN cities ci ON c.city = ci.city
GROUP BY ci.country;`,
  check: `_same_as("SELECT ci.country, ROUND(SUM(c.revenue), 2) AS revenue FROM cafe c JOIN cities ci ON c.city = ci.city GROUP BY ci.country")`,
},
{
  id: 'sq-13', mins: 4,
  title: 'Keep the ones with no match',
  concept: [
    '`LEFT JOIN` keeps every row of the left table, matched or not. The gaps come back as NULL.',
    'Kigali is in `cities` but never in `cafe` — a plain JOIN quietly drops it.',
    "`COUNT(c.date)` counts real matches. `COUNT(*)` would give Kigali a 1 for its row of NULLs.",
  ],
  starter: `SELECT ci.city, COUNT(*) AS days
FROM cities ci
JOIN cafe c ON c.city = ci.city
GROUP BY ci.city;`,
  task: 'Every city in `cities` with its number of trading days — Kigali included, with **0**: `city`, `days`.',
  hint: 'Make it a `LEFT JOIN`, and count a column from cafe instead of `*`.',
  solution: `SELECT ci.city, COUNT(c.date) AS days
FROM cities ci
LEFT JOIN cafe c ON c.city = ci.city
GROUP BY ci.city;`,
  check: `_same_as("SELECT ci.city, COUNT(c.date) AS days FROM cities ci LEFT JOIN cafe c ON c.city = ci.city GROUP BY ci.city")`,
},
{
  id: 'sq-14', mins: 4,
  title: 'A query inside a query',
  concept: [
    'Put a query in brackets and use its answer: `WHERE revenue > (SELECT AVG(revenue) FROM cafe)`.',
    'The inner query runs first and hands back a single number.',
    'No running two queries and copying a number across by hand.',
  ],
  starter: `SELECT AVG(revenue)
FROM cafe;`,
  task: 'The days that beat the average revenue: `date`, `city`, `revenue`.',
  hint: 'Keep the starter as it is, but in brackets, on the right of `revenue >`.',
  solution: `SELECT date, city, revenue
FROM cafe
WHERE revenue > (SELECT AVG(revenue) FROM cafe);`,
  check: `_same_as("SELECT date, city, revenue FROM cafe WHERE revenue > (SELECT AVG(revenue) FROM cafe)")`,
},
{
  id: 'sq-15', mins: 5,
  title: 'Name a step with WITH',
  concept: [
    '`WITH by_city AS (...)` names a query, so the next one can read it like a table.',
    'A long query becomes steps you read top to bottom.',
    'You can use the named step more than once in the same query.',
  ],
  starter: `WITH by_city AS (
  SELECT city, ROUND(SUM(revenue), 2) AS revenue
  FROM cafe
  GROUP BY city
)
SELECT *
FROM by_city;`,
  task: 'Keep only the cities whose total is **above the average of those totals**: `city`, `revenue`.',
  hint: 'Add `WHERE revenue > (SELECT AVG(revenue) FROM by_city)` — by_city works like a table there too.',
  solution: `WITH by_city AS (
  SELECT city, ROUND(SUM(revenue), 2) AS revenue
  FROM cafe
  GROUP BY city
)
SELECT city, revenue
FROM by_city
WHERE revenue > (SELECT AVG(revenue) FROM by_city);`,
  check: `_same_as("WITH b AS (SELECT city, ROUND(SUM(revenue), 2) AS revenue FROM cafe GROUP BY city) SELECT city, revenue FROM b WHERE revenue > (SELECT AVG(revenue) FROM b)")`,
},
{
  id: 'sq-16', mins: 5,
  title: 'Rank inside each group',
  concept: [
    'A window function works across rows **without** squashing them: `RANK() OVER (PARTITION BY city ORDER BY revenue DESC)`.',
    '`PARTITION BY` starts the ranking again for each city.',
    "You can't filter on a window in WHERE. Work it out in a WITH, then filter outside.",
  ],
  starter: `SELECT city, date, revenue,
       RANK() OVER (PARTITION BY city ORDER BY revenue DESC) AS rnk
FROM cafe;`,
  task: "Keep each city's top 3 days: `city`, `date`, `revenue`, `rnk`.",
  hint: 'Wrap the starter: `WITH ranked AS (...starter...) SELECT ... FROM ranked WHERE rnk <= 3`',
  solution: `WITH ranked AS (
  SELECT city, date, revenue,
         RANK() OVER (PARTITION BY city ORDER BY revenue DESC) AS rnk
  FROM cafe
)
SELECT city, date, revenue, rnk
FROM ranked
WHERE rnk <= 3;`,
  check: `_same_as("SELECT city, date, revenue, rnk FROM (SELECT city, date, revenue, RANK() OVER (PARTITION BY city ORDER BY revenue DESC) AS rnk FROM cafe) WHERE rnk <= 3")`,
},
{
  id: 'sq-17', mins: 4,
  title: 'Running totals',
  concept: [
    '`SUM(revenue) OVER (ORDER BY date)` adds up everything so far, row by row.',
    'Add `PARTITION BY city` inside the brackets for a running total per city.',
    "It's pandas' `cumsum()`, in SQL.",
  ],
  starter: `SELECT date, revenue
FROM cafe
WHERE city = 'Lagos'
ORDER BY date;`,
  task: "Lagos only: `date`, `revenue` and `running` — Lagos's revenue so far, rounded to 2 — in date order.",
  hint: '`ROUND(SUM(revenue) OVER (ORDER BY date), 2) AS running`',
  solution: `SELECT date, revenue,
       ROUND(SUM(revenue) OVER (ORDER BY date), 2) AS running
FROM cafe
WHERE city = 'Lagos'
ORDER BY date;`,
  check: `_same_as("SELECT date, revenue, ROUND(SUM(revenue) OVER (ORDER BY date), 2) AS running FROM cafe WHERE city = 'Lagos' ORDER BY date", ordered=True)`,
},
{
  id: 'sq-18', mins: 5, lang: 'python',
  title: 'SQL into pandas',
  concept: [
    'Back in Python: `sqlite3.connect(":memory:")` opens a database, and `df.to_sql(...)` writes a table into it.',
    '`pd.read_sql(query, db)` runs a query and hands back a **DataFrame**.',
    'So filter and group in SQL, then chart it with pandas — the best of both.',
  ],
  starter: `import sqlite3
db = sqlite3.connect(":memory:")
cafe.to_sql("cafe", db, index=False)

pd.read_sql("SELECT city, COUNT(*) AS days FROM cafe GROUP BY city", db)`,
  task: 'Make `monthly` with `pd.read_sql`: one row per month, columns `month` and `revenue`. Then draw it with `monthly.plot.bar(x="month", y="revenue")`.',
  hint: "The query from the dates lesson works as it is: `strftime('%Y-%m', date) AS month` and `SUM(revenue) AS revenue`, grouped by month.",
  solution: `import sqlite3
db = sqlite3.connect(":memory:")
cafe.to_sql("cafe", db, index=False)

monthly = pd.read_sql("""
    SELECT strftime('%Y-%m', date) AS month, SUM(revenue) AS revenue
    FROM cafe
    GROUP BY month
    ORDER BY month
""", db)
monthly.plot.bar(x="month", y="revenue")
plt.show()`,
  check: `assert "monthly" in globals(), "Make a variable called monthly."
assert isinstance(monthly, pd.DataFrame), "monthly should be what pd.read_sql hands back - a DataFrame."
assert set(monthly.columns) == {"month", "revenue"}, "Name the columns month and revenue."
assert len(monthly) == 4, "One row per month - January to April is four."
assert len(_axes()) > 0, 'Now draw it: monthly.plot.bar(x="month", y="revenue")'`,
},
];
