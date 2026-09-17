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
  dialects: [
    ['PostgreSQL, BigQuery, Snowflake', 'The same: `ORDER BY revenue DESC LIMIT 5`.'],
    ['SQL Server', '`TOP` comes straight after SELECT instead: `SELECT TOP 5 date, city, revenue FROM cafe ORDER BY revenue DESC`.'],
  ],
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
  dialects: [
    ['PostgreSQL, SQL Server', 'The same trap: `45 / 8` is 5. Divide by `8.0`, or cast one side to a decimal first.'],
    ['BigQuery', '`/` always gives a decimal, so `45 / 8` is already 5.625. For whole-number division there, use `DIV(45, 8)`.'],
  ],
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
  dialects: [
    ['PostgreSQL', "Dates are a real type there. `to_char(date, 'YYYY-MM')` gives the text; `date_trunc('month', date)` gives the start of the month."],
    ['BigQuery', "`FORMAT_DATE('%Y-%m', date)`, or `DATE_TRUNC(date, MONTH)`."],
    ['SQL Server', "`FORMAT(date, 'yyyy-MM')`, or `DATETRUNC(month, date)` from SQL Server 2022."],
  ],
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

/* ── The shop: many tables ─────────────────────────────── */
{
  id: 'sq-19', mins: 3,
  title: 'Meet the shop',
  concept: [
    'The café also sells online. Four tables work together: `customers`, `orders`, `order_items` and `products`.',
    'Each table holds one kind of thing, and ids link them: an order has a `customer_id`; an order item has an `order_id` and a `product_id`.',
    'Meet any new database by counting: how many rows, which values, what is missing.',
  ],
  starter: `SELECT *
FROM orders
LIMIT 5;`,
  task: 'How many orders are there of each `status`? Columns `status` and `orders`, most first.',
  hint: 'GROUP BY status, COUNT(*) AS orders, then ORDER BY orders DESC.',
  solution: `SELECT status, COUNT(*) AS orders
FROM orders
GROUP BY status
ORDER BY orders DESC;`,
  check: `_same_as("SELECT status, COUNT(*) AS orders FROM orders GROUP BY status ORDER BY orders DESC", ordered=True)`,
},
{
  id: 'sq-20', mins: 5,
  title: 'Three tables at once',
  concept: [
    'A JOIN can keep going: `orders JOIN order_items ... JOIN products ...`.',
    'Each JOIN gets its own `ON`, saying which id matches which.',
    '`oi.qty * p.price` is what one line of an order was worth.',
  ],
  starter: `SELECT oi.order_id, oi.product_id, oi.qty
FROM order_items oi
LIMIT 5;`,
  task: "Revenue per **product**: `name` and `revenue` (qty × price, added up), best seller first. Leave out orders that were cancelled — the status lives in `orders`.",
  hint: "Start FROM orders o, JOIN order_items oi ON oi.order_id = o.order_id, JOIN products p ON p.product_id = oi.product_id. Then `WHERE o.status <> 'cancelled'`.",
  solution: `SELECT p.name, SUM(oi.qty * p.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.name
ORDER BY revenue DESC;`,
  check: `_same_as("SELECT p.name, SUM(oi.qty * p.price) AS revenue FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.status <> 'cancelled' GROUP BY p.name ORDER BY revenue DESC", ordered=True)`,
},
{
  id: 'sq-21', mins: 4,
  title: 'Count each thing once',
  concept: [
    '`COUNT(DISTINCT customer_id)` counts different customers, however many orders each placed.',
    '`COUNT(*)` would count orders instead — a different question.',
    'Say out loud what one row is before you count rows.',
  ],
  starter: `SELECT c.city, COUNT(*) AS buyers
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.city;`,
  task: 'For each city, how many **different** customers have placed an order: `city`, `buyers`.',
  hint: 'Swap `COUNT(*)` for `COUNT(DISTINCT o.customer_id)`.',
  solution: `SELECT c.city, COUNT(DISTINCT o.customer_id) AS buyers
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.city;`,
  check: `_same_as("SELECT c.city, COUNT(DISTINCT o.customer_id) AS buyers FROM orders o JOIN customers c ON c.customer_id = o.customer_id GROUP BY c.city")`,
},
{
  id: 'sq-22', mins: 4,
  title: "Who's missing?",
  concept: [
    'To find rows with **no** match: LEFT JOIN, then keep the rows where the right side came back NULL.',
    '`WHERE o.order_id IS NULL` after a LEFT JOIN means "no order matched".',
    'It answers questions like "who signed up but never bought?"',
  ],
  starter: `SELECT c.name
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id;`,
  task: 'The customers who have **never** placed an order: `name`, in alphabetical order.',
  hint: 'Make it a LEFT JOIN, add `WHERE o.order_id IS NULL`, and ORDER BY c.name.',
  solution: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.name;`,
  check: `_same_as("SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL ORDER BY c.name", ordered=True)`,
},
{
  id: 'sq-23', mins: 5,
  title: 'Is there one? EXISTS',
  concept: [
    '`WHERE EXISTS (SELECT 1 FROM ... WHERE ...)` keeps a row if the inner query finds anything for it.',
    'The inner query can use the outer row: `o.customer_id = c.customer_id`.',
    "`NOT EXISTS` is the opposite — and unlike `NOT IN`, a NULL can't trip it up.",
  ],
  starter: `SELECT name
FROM products
WHERE category = 'kit';`,
  task: "The customers who have bought at least one product from the `kit` category: `name`, in alphabetical order.",
  hint: 'Inside the EXISTS: orders joined to order_items joined to products, where the order belongs to this customer and the category is kit.',
  solution: `SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p ON p.product_id = oi.product_id
  WHERE o.customer_id = c.customer_id
    AND p.category = 'kit'
)
ORDER BY c.name;`,
  check: `_same_as("SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.customer_id = c.customer_id AND p.category = 'kit') ORDER BY c.name", ordered=True)`,
},

/* ── Harder questions ──────────────────────────────────── */
{
  id: 'sq-24', mins: 4,
  title: 'Stack results with UNION',
  concept: [
    "`UNION` puts one query's rows under another's. Both need the same number of columns.",
    '`UNION` drops duplicate rows; `UNION ALL` keeps every one.',
    'Handy when the same kind of thing lives in more than one table.',
  ],
  starter: `SELECT city FROM cafe
UNION ALL
SELECT city FROM customers;`,
  task: 'Every city named in `cafe`, `cities` or `customers` — each **once**, no NULLs — in alphabetical order. One column, `city`.',
  hint: 'Three SELECTs joined by UNION (not UNION ALL). Filter the NULLs out of customers, and put one ORDER BY at the very end.',
  solution: `SELECT city FROM cafe
UNION
SELECT city FROM cities
UNION
SELECT city FROM customers WHERE city IS NOT NULL
ORDER BY city;`,
  check: `_same_as("SELECT city FROM cafe UNION SELECT city FROM cities UNION SELECT city FROM customers WHERE city IS NOT NULL ORDER BY city", ordered=True)`,
},
{
  id: 'sq-25', mins: 5,
  title: 'Totals of totals',
  concept: [
    'Some questions take two steps: first a total **per order**, then the average **of those** totals.',
    'Build step one in a WITH, then summarise it.',
    'Averaging the order lines directly gives the average line, not the average order.',
  ],
  starter: `SELECT ROUND(AVG(oi.qty * p.price), 2) AS avg_order
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id;`,
  task: 'The average **order** value, rounded to 2: one row, one column `avg_order`. Leave out cancelled orders.',
  hint: "WITH totals AS (one row per order_id with SUM(oi.qty * p.price) AS total, cancelled orders filtered out) — then `SELECT ROUND(AVG(total), 2) AS avg_order FROM totals`.",
  solution: `WITH totals AS (
  SELECT o.order_id, SUM(oi.qty * p.price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p ON p.product_id = oi.product_id
  WHERE o.status <> 'cancelled'
  GROUP BY o.order_id
)
SELECT ROUND(AVG(total), 2) AS avg_order
FROM totals;`,
  check: `_same_as("WITH t AS (SELECT o.order_id, SUM(oi.qty * p.price) AS total FROM orders o JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.status <> 'cancelled' GROUP BY o.order_id) SELECT ROUND(AVG(total), 2) AS avg_order FROM t")`,
},
{
  id: 'sq-26', mins: 5,
  title: 'Count with conditions',
  concept: [
    "`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)` counts only the rows that match.",
    "Several of those side by side turn one column's values into columns — a pivot, in SQL.",
    'For a percentage, multiply by `100.0`, not `100` — whole numbers divided give a whole number.',
  ],
  starter: `SELECT c.city, COUNT(*) AS orders
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.city;`,
  task: 'Per city: `city`, `orders` (all of them), `cancelled` (how many were cancelled) and `cancel_pct` — cancelled as a percentage of orders, rounded to 1.',
  hint: "`ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct`",
  solution: `SELECT c.city,
       COUNT(*) AS orders,
       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.city;`,
  check: `_same_as("SELECT c.city, COUNT(*) AS orders, SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled, ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS cancel_pct FROM orders o JOIN customers c ON c.customer_id = o.customer_id GROUP BY c.city")`,
},
{
  id: 'sq-27', mins: 5,
  title: 'Days between dates',
  dialects: [
    ['PostgreSQL', 'Subtracting one date from another already gives whole days: `MIN(o.order_date) - c.joined`.'],
    ['BigQuery', '`DATE_DIFF(MIN(o.order_date), c.joined, DAY)`.'],
    ['SQL Server', '`DATEDIFF(day, c.joined, MIN(o.order_date))`, with the earlier date first.'],
  ],
  concept: [
    '`julianday(date)` turns a date into a count of days, so subtracting two gives the gap between them.',
    "`MIN(order_date)` per customer is that customer's first order.",
    'Wrap the gap in `CAST(... AS INTEGER)` for a whole number of days.',
  ],
  starter: `SELECT customer_id, MIN(order_date) AS first_order
FROM orders
GROUP BY customer_id;`,
  task: 'For every customer who has ordered: `name`, and `days_to_first` — the days from `joined` to their first order.',
  hint: 'Join customers to orders, GROUP BY the customer, and `CAST(julianday(MIN(o.order_date)) - julianday(c.joined) AS INTEGER)`.',
  solution: `SELECT c.name,
       CAST(julianday(MIN(o.order_date)) - julianday(c.joined) AS INTEGER) AS days_to_first
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name;`,
  check: `_same_as("SELECT c.name, CAST(julianday(MIN(o.order_date)) - julianday(c.joined) AS INTEGER) AS days_to_first FROM customers c JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.customer_id, c.name")`,
},
{
  id: 'sq-30', mins: 5,
  title: 'Save a result as a table',
  dialects: [
    ['PostgreSQL, Snowflake', 'The same: `CREATE TABLE monthly AS SELECT ...`.'],
    ['BigQuery', 'Tables live inside a dataset: `CREATE TABLE my_dataset.monthly AS SELECT ...`.'],
    ['SQL Server', '`SELECT ... INTO monthly FROM ...` makes the table from the query.'],
  ],
  concept: [
    "`CREATE TABLE monthly AS SELECT ...` saves a query's answer as a new table.",
    'After that, `monthly` works like any other table — filter it, join it, sort it.',
    'Analysts build results this way: in steps, each one checkable on its own.',
  ],
  starter: `CREATE TABLE monthly AS
SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month;`,
  task: 'Keep the starter, then add a second query underneath: the months in `monthly` with **more orders than the average month** — `month`, `orders`, in month order.',
  hint: 'After the semicolon: `SELECT month, orders FROM monthly WHERE orders > (SELECT AVG(orders) FROM monthly) ORDER BY month;`',
  solution: `CREATE TABLE monthly AS
SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month;

SELECT month, orders
FROM monthly
WHERE orders > (SELECT AVG(orders) FROM monthly)
ORDER BY month;`,
  check: `_same_as("CREATE TABLE m AS SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month; SELECT month, orders FROM m WHERE orders > (SELECT AVG(orders) FROM m) ORDER BY month", ordered=True)`,
},

/* ── Windows, and back to pandas ───────────────────────── */
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
  id: 'sq-28', mins: 5,
  title: 'The row before',
  concept: [
    "`LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)` fetches the same customer's previous order date.",
    "A customer's first order has nothing before it, so LAG gives NULL there.",
    'Subtract through julianday for the gap in days.',
  ],
  starter: `SELECT customer_id, order_id, order_date
FROM orders
ORDER BY customer_id, order_date;`,
  task: "For every order: `customer_id`, `order_id` and `gap_days` — days since that customer's previous order (NULL for their first). Sort by customer, then date, then order id; two orders on the same day go in order_id order.",
  hint: '`julianday(order_date) - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id)) AS gap_days`',
  solution: `SELECT customer_id, order_id,
       julianday(order_date)
         - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id)) AS gap_days
FROM orders
ORDER BY customer_id, order_date, order_id;`,
  check: `_same_as("SELECT customer_id, order_id, julianday(order_date) - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, order_id)) AS gap_days FROM orders ORDER BY customer_id, order_date, order_id", ordered=True)`,
},
{
  id: 'sq-29', mins: 5,
  title: 'Share of the whole',
  concept: [
    '`SUM(x) OVER ()` — a window with nothing in the brackets — is the grand total, repeated on every row.',
    "Divide by it for each row's share: `100.0 * x / SUM(x) OVER ()`.",
    'It works on grouped results too, because windows run after GROUP BY: `SUM(SUM(x)) OVER ()`.',
  ],
  starter: `SELECT p.category, SUM(oi.qty * p.price) AS revenue
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category;`,
  task: "Add `pct`: each category's share of all revenue, as a percentage rounded to 1. Columns `category`, `revenue`, `pct`, biggest first.",
  hint: '`ROUND(100.0 * SUM(oi.qty * p.price) / SUM(SUM(oi.qty * p.price)) OVER (), 1) AS pct` — then ORDER BY revenue DESC.',
  solution: `SELECT p.category,
       SUM(oi.qty * p.price) AS revenue,
       ROUND(100.0 * SUM(oi.qty * p.price) / SUM(SUM(oi.qty * p.price)) OVER (), 1) AS pct
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY revenue DESC;`,
  check: `_same_as("SELECT p.category, SUM(oi.qty * p.price) AS revenue, ROUND(100.0 * SUM(oi.qty * p.price) / SUM(SUM(oi.qty * p.price)) OVER (), 1) AS pct FROM order_items oi JOIN products p ON p.product_id = oi.product_id GROUP BY p.category ORDER BY revenue DESC", ordered=True)`,
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

/* ── Changing data, and text ───────────────────────────── */
{
  id: 'sq-31', mins: 4,
  title: 'Add a row with INSERT',
  concept: [
    "`INSERT INTO products (product_id, name, category, price) VALUES (113, 'sticker pack', 'merch', 3.5)` adds one row.",
    'Name the columns you are filling. Then the values can\'t land in the wrong place.',
    'Here every run starts from a fresh copy of the tables, so try things freely. In a real database, a change stays changed.',
  ],
  starter: `SELECT name, price
FROM products
WHERE category = 'merch'
ORDER BY price;`,
  task: 'Above the SELECT, add a new merch product: id `113`, name `sticker pack`, category `merch`, price `3.5`. The SELECT should then show it, cheapest first.',
  hint: "`INSERT INTO products (product_id, name, category, price) VALUES (113, 'sticker pack', 'merch', 3.5);` — end it with a semicolon, then the SELECT.",
  solution: `INSERT INTO products (product_id, name, category, price)
VALUES (113, 'sticker pack', 'merch', 3.5);

SELECT name, price
FROM products
WHERE category = 'merch'
ORDER BY price;`,
  check: `_same_as("INSERT INTO products VALUES (113, 'sticker pack', 'merch', 3.5); SELECT name, price FROM products WHERE category = 'merch' ORDER BY price", ordered=True)`,
},
{
  id: 'sq-32', mins: 4,
  title: 'Change rows with UPDATE',
  concept: [
    "`UPDATE products SET price = price * 1.1 WHERE category = 'beans'` changes values where they are.",
    'The right-hand side sees the old value: `price * 1.1` is the price before the change.',
    'Forget the WHERE and **every** row changes. Write the WHERE as a SELECT first, look at the rows, then turn it into the UPDATE.',
  ],
  starter: `SELECT name, category, price
FROM products
ORDER BY product_id;`,
  task: "Beans go up 10%. Above the SELECT, set the price of the `beans` products — and only those — to `ROUND(price * 1.1, 2)`. The SELECT shows every product, so a missing WHERE shows up.",
  hint: "`UPDATE products SET price = ROUND(price * 1.1, 2) WHERE category = 'beans';`",
  solution: `UPDATE products
SET price = ROUND(price * 1.1, 2)
WHERE category = 'beans';

SELECT name, category, price
FROM products
ORDER BY product_id;`,
  check: `_same_as("UPDATE products SET price = ROUND(price * 1.1, 2) WHERE category = 'beans'; SELECT name, category, price FROM products ORDER BY product_id", ordered=True)`,
},
{
  id: 'sq-33', mins: 4,
  title: 'Remove rows with DELETE',
  concept: [
    "`DELETE FROM orders WHERE status = 'cancelled'` removes those rows. There is no undo.",
    '`DELETE FROM orders` with no WHERE empties the whole table.',
    'Their lines in `order_items` stay behind, pointing at orders that no longer exist. Real databases use foreign keys to stop that. Here, it is worth knowing it can happen.',
  ],
  starter: `SELECT status, COUNT(*) AS orders
FROM orders
GROUP BY status
ORDER BY status;`,
  task: 'Above the count, delete the cancelled orders. The count underneath should then have no `cancelled` row.',
  hint: "`DELETE FROM orders WHERE status = 'cancelled';`",
  solution: `DELETE FROM orders
WHERE status = 'cancelled';

SELECT status, COUNT(*) AS orders
FROM orders
GROUP BY status
ORDER BY status;`,
  check: `_same_as("DELETE FROM orders WHERE status = 'cancelled'; SELECT status, COUNT(*) AS orders FROM orders GROUP BY status ORDER BY status", ordered=True)`,
},
{
  id: 'sq-34', mins: 5,
  title: 'Join, cut and shout: text',
  dialects: [
    ['PostgreSQL', '`||` works, and joins a number onto text as it is. `substr` works too, as does `SUBSTRING(city FROM 1 FOR 3)`.'],
    ['BigQuery', "`||` needs text on both sides: `'-' || CAST(customer_id AS STRING)`. Or use `CONCAT(...)`."],
    ['SQL Server', 'Join with `+` (casting numbers to text first) or `CONCAT(...)`, which converts for you. `SUBSTRING(city, 1, 3)`.'],
  ],
  concept: [
    "`||` joins text: `name || ' (' || city || ')'`.",
    '`UPPER`, `LOWER`, `LENGTH`, `TRIM`, and `SUBSTR(text, start, length)`, which counts from 1.',
    "Anything joined to NULL becomes NULL. `COALESCE(city, 'unknown')` fills the gap first.",
  ],
  starter: `SELECT customer_id, name, city
FROM customers
ORDER BY customer_id
LIMIT 8;`,
  task: "Replace `city` with `code`: the first three letters of the city in capitals, a dash, then the customer_id — customer 2 lives in Lagos, so `LAG-2`. Someone with no city gets `UNK`, so `UNK-7`. Columns `customer_id`, `name`, `code`.",
  hint: "`UPPER(SUBSTR(COALESCE(city, 'unknown'), 1, 3)) || '-' || customer_id AS code`",
  solution: `SELECT customer_id, name,
       UPPER(SUBSTR(COALESCE(city, 'unknown'), 1, 3)) || '-' || customer_id AS code
FROM customers
ORDER BY customer_id
LIMIT 8;`,
  check: `_same_as("SELECT customer_id, name, UPPER(SUBSTR(COALESCE(city, 'unknown'), 1, 3)) || '-' || customer_id AS code FROM customers ORDER BY customer_id LIMIT 8", ordered=True)`,
},
{
  id: 'sq-35', mins: 5,
  title: 'The latest one each: ROW_NUMBER',
  dialects: [
    ['BigQuery, Snowflake', '`QUALIFY` filters on a window directly, no WITH needed: `... QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) = 1`.'],
    ['PostgreSQL', '`SELECT DISTINCT ON (customer_id) customer_id, order_id, order_date FROM orders ORDER BY customer_id, order_date DESC, order_id DESC` keeps the first row per customer.'],
    ['SQL Server', 'No QUALIFY there: the WITH version is the way.'],
  ],
  concept: [
    '`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC)` numbers each customer\'s orders 1, 2, 3, newest first.',
    'Keep number 1 and you have one row per customer. RANK would give two 1s on a tie; ROW_NUMBER never does.',
    'So break ties yourself, or the database picks for you: add `order_id DESC` to the ORDER BY.',
  ],
  starter: `SELECT customer_id, order_id, order_date
FROM orders
ORDER BY customer_id, order_date DESC;`,
  task: "Keep only each customer's latest order. Number the orders with `ROW_NUMBER()` in a WITH — newest first, ties going to the higher order_id — then keep number 1. Columns `customer_id`, `order_id`, `order_date`, by customer_id.",
  hint: '`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn` inside the WITH, then `WHERE rn = 1` outside.',
  solution: `WITH ranked AS (
  SELECT customer_id, order_id, order_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id
                            ORDER BY order_date DESC, order_id DESC) AS rn
  FROM orders
)
SELECT customer_id, order_id, order_date
FROM ranked
WHERE rn = 1
ORDER BY customer_id;`,
  check: `_same_as("WITH r AS (SELECT customer_id, order_id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC) AS rn FROM orders) SELECT customer_id, order_id, order_date FROM r WHERE rn = 1 ORDER BY customer_id", ordered=True)`,
},
];
