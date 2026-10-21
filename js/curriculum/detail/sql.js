/* SQL (sq-01 to sq-45): the fuller teaching, a worked example and the task
   as a brief (see detail/index.js). Examples ask a different question, often
   of a small table (cities, products), and never give the task's answer. */

const CAFE = { date: 'the day, as text like 2024-01-31', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, NULL on 9 days" };
const CITIES = { city: 'Lagos, Nairobi, Accra and Kigali', country: 'the country it is in', population_m: 'people living there, in millions' };
const CUSTOMERS = { customer_id: 'a number for each customer, 1 to 40', name: 'their name', city: 'where they live, NULL for two of them', joined: 'the day they signed up' };
const ORDERS = { order_id: 'a number for each order', customer_id: 'who placed it', order_date: 'the day it was placed', status: 'delivered, shipped or cancelled' };
const ITEMS = { order_id: 'which order', product_id: 'which product', qty: 'how many of it' };
const PRODUCTS = { product_id: 'a number for each product, 101 to 112', name: 'what it is called', category: 'beans, kit, merch or gift', price: 'the price of one' };

export const SQL_DETAIL = {
'sq-01': {
  explain: [
    'A **database** stores data in tables, and **SQL** is the language you use to ask it questions. Each question you ask is called a **query**.',
    'The café\'s sales live in a table called `cafe`. Each row is one day of trading, with columns like `date`, `city`, `cups` and `revenue`.',
    '`SELECT` lists the columns you want, with commas between them, and `FROM` says which table to look in.',
    'Not sure what\'s there? `*` after SELECT means "every column".',
    '`LIMIT 5` keeps just the first 5 rows, which is handy while you\'re having a look around. Take it off and you get the lot.',
    'The `;` marks the end of a query. Writing SQL\'s own words in capitals isn\'t a rule, just a habit that makes queries easier to read.',
  ],
  example: {
    say: 'Here are two columns from the `cities` table, which has one row for each city.',
    code: `SELECT city, country
FROM cities;`,
    lines: [
      ['SELECT city, country', 'the two columns wanted, with a comma between them.'],
      ['FROM cities', 'the table they come from.'],
      [';', 'the end of the query. No LIMIT, so every row comes back: all four cities.'],
    ],
  },
  brief: {
    story: 'The finance team wants a list of what each day took, and where.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['Just the `date`, `city` and `revenue` columns', 'Every row, not only the first five'],
    out: 'Three columns and 120 rows.',
  },
},
'sq-02': {
  explain: [
    '`WHERE` keeps only the rows that pass a test. The rest are just left out of your answer. Nothing is deleted from the table.',
    'You can test with `=`, `>`, `<`, `>=` (at least), `<=` (at most) and `<>` (not equal). Note that SQL uses a single `=`.',
    'Words go in **single** quotes, like `city = \'Lagos\'`. Numbers don\'t need any.',
    '`AND` joins two tests that must both pass. `OR` is happy if either one does.',
    'Mixing AND with OR? Put brackets round the OR part, so it\'s clear what goes with what.',
    'WHERE always comes after FROM.',
  ],
  example: {
    say: 'Here are the tea days that were rated 4.8 or more.',
    code: `SELECT date, drink, rating
FROM cafe
WHERE drink = 'tea' AND rating >= 4.8;`,
    lines: [
      ["drink = 'tea'", 'only the tea days. The text is in single quotes.'],
      ['rating >= 4.8', 'only ratings of 4.8 or more.'],
      ['AND', 'a row has to pass both to be kept.'],
    ],
  },
  brief: {
    story: 'The Lagos manager wants to see the days the branch was properly busy.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['Only Lagos days', 'Only days with more than 40 cups', 'Just the `date` and `cups` columns'],
    out: 'Two columns, one row for each busy Lagos day.',
    fine: ["`'Lagos'` needs its capital L: text has to match exactly."],
  },
},
'sq-03': {
  explain: [
    '`ORDER BY cups` sorts the rows by that column, smallest first. For words that means A to Z, and for dates, earliest first.',
    'Want the biggest first? Add `DESC` after the column. `ASC`, smallest first, is what you get if you don\'t say.',
    '`LIMIT` comes last and cuts the list *after* it\'s been sorted. Sort biggest first, keep 5, and there\'s your top five.',
    'You can sort by two columns, with a comma: `ORDER BY city, revenue DESC` sorts by city, then by biggest revenue within each city.',
    'Without ORDER BY, a database can hand the rows back in whatever order it likes. If the order matters to you, ask for it.',
  ],
  example: {
    say: 'Here are the three quietest days, fewest cups first.',
    code: `SELECT date, city, cups
FROM cafe
ORDER BY cups
LIMIT 3;`,
    lines: [
      ['ORDER BY cups', 'sorts every day by cups, smallest first.'],
      ['LIMIT 3', 'then keeps the first three rows of that sorted list.'],
    ],
  },
  brief: {
    story: 'The owner wants to celebrate the five best days of the year so far.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['The five days with the highest revenue', 'Biggest first', 'Columns `date`, `city`, `revenue`'],
    out: 'Five rows, the best day at the top.',
  },
},
'sq-04': {
  explain: [
    '`drink IN (\'latte\', \'tea\')` passes when the drink is anything on the list. It\'s a shorter way of writing `drink = \'latte\' OR drink = \'tea\'`.',
    '`price BETWEEN 3 AND 4` includes both ends, so £3.00 and £4.00 both count.',
    '`LIKE` matches a pattern. `%` stands for any amount of text, even none, so `\'%brew\'` is anything ending in brew.',
    '`_` in a pattern stands for exactly one character.',
    'Put `NOT` in front of any of these to flip it: `drink NOT IN (\'tea\')`, `city NOT LIKE \'L%\'`.',
  ],
  example: {
    say: 'Here are the cities in a country starting with K, or with between 2 and 5 million people.',
    code: `SELECT city, country, population_m
FROM cities
WHERE country LIKE 'K%'
   OR population_m BETWEEN 2 AND 5;`,
    lines: [
      ["country LIKE 'K%'", 'a K, then anything at all: Kenya matches.'],
      ['population_m BETWEEN 2 AND 5', 'from 2 to 5 million, both ends included.'],
      ['OR', 'either one is enough to keep the row.'],
    ],
  },
  brief: {
    story: 'A milk supplier asks how lattes and teas sell at mid-range prices.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['Latte or tea days', 'Where the price was between £3 and £4, both ends included', 'Columns `date`, `drink`, `price`'],
    out: 'Three columns, one row for each day that fits.',
  },
},
'sq-05': {
  explain: [
    'When a database doesn\'t know a value, it stores `NULL`. That means "unknown". It isn\'t zero, and it isn\'t empty text.',
    'Nine days in `cafe` have no rating, so their `rating` is NULL.',
    'Here\'s the catch: `rating = NULL` is never true, not even for the missing ones. Is an unknown equal to an unknown? Nobody knows, so the row isn\'t kept.',
    'Ask `rating IS NULL` to find the missing ones, and `rating IS NOT NULL` for the ones that are there.',
    '`COALESCE(rating, 0)` gives the rating when there is one, and 0 when there isn\'t. Handy when you need something to show in the gap.',
  ],
  example: {
    say: 'Here are the customers who never gave a city, with a stand-in shown where it\'s missing.',
    code: `SELECT name, COALESCE(city, 'not given') AS city
FROM customers
WHERE city IS NULL;`,
    lines: [
      ['city IS NULL', 'keeps the rows where city is missing.'],
      ["COALESCE(city, 'not given')", "shows the city if there is one, and 'not given' where it's NULL."],
    ],
  },
  brief: {
    story: 'Nine days have no rating, and the quality team wants to know which, so they can chase the missing forms.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['The days with no rating', 'Columns `date`, `city`, `drink`'],
    out: 'Nine rows.',
    fine: ['The starter runs without an error and finds nothing. That is what makes `= NULL` a trap.'],
  },
},
'sq-06': {
  explain: [
    'A column in SELECT doesn\'t have to be stored in the table. It can be a calculation, like `cups * price`, worked out on every row.',
    '`AS` gives your new column a name: `cups * price AS takings`. Without it, the column is named after the sum itself, which gets messy.',
    '`+`, `-`, `*` and `/` work just like they do on a calculator.',
    'One trap: in SQLite, a whole number divided by a whole number throws the fraction away. `45 / 8` gives 5, not 5.625.',
    'Make either side a decimal to keep the fraction: `45 / 8.0`.',
    '`ROUND(x, 1)` then tidies it to 1 decimal place.',
  ],
  example: {
    say: 'Here\'s 45 divided by 8, done three ways. You don\'t even need a table for a sum.',
    code: `SELECT 45 / 8 AS whole,
       45 / 8.0 AS exact,
       ROUND(45 / 8.0, 1) AS rounded;`,
    lines: [
      ['45 / 8', 'two whole numbers, so the fraction is dropped: 5.'],
      ['45 / 8.0', 'one side is a decimal, so the fraction stays: 5.625.'],
      ['ROUND(..., 1)', 'rounds that to 1 place: 5.6.'],
    ],
  },
  brief: {
    story: 'The café wants to know how many cups an hour each day averaged, to plan staff.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['For every day: `date` and `cups`', '`per_hour`: cups divided by an 8-hour day, rounded to 1 place'],
    out: 'Three columns and 120 rows.',
    fine: ['The starter divides by 8 and loses the fractions.'],
  },
},
'sq-07': {
  explain: [
    '`COUNT`, `SUM`, `AVG`, `MIN` and `MAX` squash a whole column down to one number, so the answer is a single row.',
    '`SUM` adds up, `AVG` finds the average, and `MIN` and `MAX` find the smallest and largest.',
    '`COUNT(*)` counts rows. `COUNT(rating)` only counts the rows where a rating was actually given.',
    '`AVG` and `SUM` skip NULLs by themselves, so the missing ratings don\'t drag anything down.',
    'Wrap one in ROUND to tidy it, like `ROUND(AVG(rating), 2)`, and give it a name with AS.',
  ],
  example: {
    say: 'Here are the cheapest price, the dearest price and how many products the shop sells.',
    code: `SELECT MIN(price) AS cheapest,
       MAX(price) AS dearest,
       COUNT(*) AS products
FROM products;`,
    lines: [
      ['MIN(price)', 'the smallest price in the whole column.'],
      ['MAX(price)', 'the largest.'],
      ['COUNT(*)', 'how many rows: one per product.'],
    ],
  },
  brief: {
    story: 'The owner wants the headline numbers for the year so far, in one line.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['`days`: how many rows', '`total`: all the revenue, rounded to 2', '`avg_rating`: the average rating, rounded to 2'],
    out: 'One row, three columns.',
  },
},
'sq-08': {
  explain: [
    '`GROUP BY city` sorts the rows into one pile per city, then squashes each pile down, so you get one row per city.',
    'So `SUM(revenue)` with `GROUP BY city` gives each city its own total.',
    'Every column in SELECT has to be either in the GROUP BY, or inside something like SUM or COUNT. Otherwise SQL doesn\'t know which row\'s value to show.',
    'Name each number with AS, so the result has column names a person can read.',
    'GROUP BY comes after FROM, and after WHERE if you have one.',
  ],
  example: {
    say: 'Here\'s each product category, with how many products it has and their average price.',
    code: `SELECT category, COUNT(*) AS products, ROUND(AVG(price), 2) AS avg_price
FROM products
GROUP BY category;`,
    lines: [
      ['GROUP BY category', 'one pile, and so one row, per category.'],
      ['COUNT(*)', 'the rows in each pile: how many products.'],
      ['ROUND(AVG(price), 2)', 'the average price in each pile, rounded to 2.'],
    ],
  },
  brief: {
    story: "The regional manager wants each city's year in two numbers.",
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['One row per city', '`days`: how many rows that city has', '`revenue`: its total, rounded to 2'],
    out: 'Columns `city`, `days`, `revenue`: three rows.',
  },
},
'sq-09': {
  explain: [
    '`WHERE` filters rows **before** they\'re grouped. `HAVING` filters the groups **after**.',
    'So a test on a group\'s total or average, like `SUM(revenue) > 1000`, has to go in HAVING. At the WHERE stage, the totals don\'t exist yet.',
    'The order they go in is FROM, WHERE, GROUP BY, HAVING, then ORDER BY.',
    'You can use both at once: WHERE to drop the rows you don\'t want counted, and HAVING to drop whole groups afterwards.',
  ],
  example: {
    say: 'Here are the product categories with at least 3 products.',
    code: `SELECT category, COUNT(*) AS products
FROM products
GROUP BY category
HAVING COUNT(*) >= 3;`,
    lines: [
      ['GROUP BY category', 'one row per category, with its count.'],
      ['HAVING COUNT(*) >= 3', 'then keeps only the groups with 3 or more. The gift category has one, so it goes.'],
    ],
  },
  brief: {
    story: 'The menu is getting long, so the owner only wants to keep the drinks that pull their weight.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['Only the drinks that average more than 35 cups a day', '`avg_cups` rounded to 1'],
    out: 'Columns `drink` and `avg_cups`.',
  },
},
'sq-10': {
  explain: [
    '`CASE WHEN ... THEN ... ELSE ... END` makes a new value from your own rules: when this is true, give that.',
    'You can have as many WHENs as you like. They\'re checked from the top, and the first one that\'s true wins.',
    '`ELSE` is the answer when nothing matches. Leave it out and you\'ll get NULL.',
    'Give the result a name with AS, just like any other column.',
    'You can then GROUP BY the label you just made, to count how many rows got each one.',
  ],
  example: {
    say: 'Here every product gets a price band.',
    code: `SELECT name, price,
       CASE WHEN price < 10 THEN 'small'
            WHEN price < 20 THEN 'mid'
            ELSE 'big' END AS band
FROM products
ORDER BY price;`,
    lines: [
      ["WHEN price < 10 THEN 'small'", 'under 10 is small.'],
      ["WHEN price < 20 THEN 'mid'", 'only checked if the first rule failed, so this means 10 up to 20.'],
      ["ELSE 'big'", 'everything else.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know how many days were quiet, normal and busy.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ["Fewer than 20 cups: `'quiet'`", "More than 45 cups: `'busy'`", "Anything else: `'normal'`", 'Count the days in each band'],
    out: 'Columns `band` and `days`: three rows.',
  },
},
'sq-11': {
  explain: [
    'SQLite stores dates as text, like `\'2024-01-31\'`. Because the year comes first, sorting the text sorts the dates correctly too.',
    '`strftime(pattern, date)` pulls pieces out of a date. `%Y` is the year, `%m` the month and `%d` the day.',
    'So `strftime(\'%Y-%m\', date)` gives `\'2024-01\'`, the year and month together, which is perfect for grouping by month.',
    '`\'%w\'` gives the day of the week as a number, from 0 for Sunday up to 6 for Saturday.',
    'Group by whichever piece you pulled out, and you\'ve got totals per month or per weekday.',
  ],
  example: {
    say: 'Here\'s the average number of cups for each day of the week.',
    code: `SELECT strftime('%w', date) AS weekday,
       COUNT(*) AS days,
       ROUND(AVG(cups), 1) AS avg_cups
FROM cafe
GROUP BY weekday
ORDER BY weekday;`,
    lines: [
      ["strftime('%w', date)", 'the weekday as a number, 0 for Sunday.'],
      ['GROUP BY weekday', 'one row per weekday.'],
      ['ROUND(AVG(cups), 1)', 'the average cups on that weekday.'],
    ],
  },
  brief: {
    story: 'The accountant wants the takings month by month.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['`month`, written like `2024-01`', "`revenue`: the month's total, rounded to 2", 'In month order'],
    out: 'Four rows, January to April.',
  },
},
'sq-12': {
  explain: [
    'Data is often split across tables. `cafe` knows the city, but it\'s `cities` that knows each city\'s country.',
    '`JOIN cities ON cafe.city = cities.city` lines the rows up wherever the cities match, so both tables\' columns sit side by side.',
    'Typing table names over and over gets tiring, so you can give each a short nickname, called an **alias**: `FROM cafe c JOIN cities ci ON c.city = ci.city`.',
    'Then `c.revenue` means the revenue from cafe, and `ci.country` means the country from cities.',
    'A plain JOIN only keeps rows that find a match on both sides.',
    'Once joined, WHERE, GROUP BY and ORDER BY work just as they always do.',
  ],
  example: {
    say: 'Here are the first five days, with each city\'s country and size brought across from `cities`.',
    code: `SELECT c.date, c.city, ci.country, ci.population_m
FROM cafe c
JOIN cities ci ON c.city = ci.city
ORDER BY c.date
LIMIT 5;`,
    lines: [
      ['FROM cafe c', 'cafe, nicknamed c.'],
      ['JOIN cities ci ON c.city = ci.city', 'brings in the row of cities with the same city.'],
      ['ci.country, ci.population_m', 'columns from cities, now beside the cafe columns.'],
    ],
  },
  brief: {
    story: 'Head office reports by country, not city.',
    get: [['`cafe` has one row per day:', CAFE], ['`cities` has one row per city:', CITIES]],
    want: ['Total revenue per country', 'Rounded to 2'],
    out: 'Columns `country` and `revenue`: three rows.',
  },
},
'sq-13': {
  explain: [
    'A plain JOIN quietly drops any row without a partner. Kigali is in `cities` but has no days in `cafe`, so it simply vanishes, and nothing warns you.',
    '`LEFT JOIN` keeps every row of the left table, the one after FROM, whether it finds a match or not.',
    'Where there\'s no match, the columns from the right table come back as NULL.',
    'That catches people out when counting. `COUNT(*)` would count Kigali\'s row of NULLs as 1 day.',
    '`COUNT(c.date)` only counts real dates, so Kigali gets the 0 it deserves.',
  ],
  example: {
    say: 'Here every city is kept, even Kigali, which has no days. NULLs sort first, so it\'s at the top.',
    code: `SELECT ci.city, ci.country, c.date, c.revenue
FROM cities ci
LEFT JOIN cafe c ON c.city = ci.city
ORDER BY c.date
LIMIT 4;`,
    lines: [
      ['FROM cities ci LEFT JOIN cafe c', 'every row of cities is kept, matched or not.'],
      ['c.date, c.revenue', 'blank (NULL) for Kigali, which matched nothing.'],
    ],
  },
  brief: {
    story: 'Head office is deciding whether to open in Kigali, and wants every city on the list, even ones with no trading yet.',
    get: [['`cities` has one row per city:', CITIES], ['`cafe` has one row per day:', CAFE]],
    want: ['Every city in `cities`', '`days`: its number of trading days in `cafe`', 'Kigali included, with 0'],
    out: 'Columns `city` and `days`: four rows.',
  },
},
'sq-14': {
  explain: [
    'You can put a whole query in brackets inside another one, and its answer gets used right there. That\'s called a **subquery**.',
    '`(SELECT AVG(revenue) FROM cafe)` hands back one number, the average.',
    'So `WHERE revenue > (SELECT AVG(revenue) FROM cafe)` checks every row against that average.',
    'The inner query runs first, then the outer one uses its answer.',
    'No running two queries and copying a number across by hand, and it stays right when the data changes.',
  ],
  example: {
    say: 'Here\'s the dearest product, found without typing its price in.',
    code: `SELECT name, price
FROM products
WHERE price = (SELECT MAX(price) FROM products);`,
    lines: [
      ['(SELECT MAX(price) FROM products)', 'the inner query: the highest price, one number.'],
      ['WHERE price = ...', 'keeps the product with that price.'],
    ],
  },
  brief: {
    story: 'The owner wants to look at the good days: the ones that beat the average.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['The days whose revenue is above the average day', 'Columns `date`, `city`, `revenue`'],
    out: 'Three columns, one row for each day above average.',
    fine: ["Work the average out inside the query. Don't type the number in."],
  },
},
'sq-15': {
  explain: [
    '`WITH name AS ( ... )` gives a query a name. The query after it can then read it just like a table.',
    'That turns one long, tangled query into steps you can read from top to bottom.',
    'You\'ll hear a named step like this called a **CTE** (common table expression). It\'s just jargon for a named step.',
    'You can use a named step more than once, even inside a subquery.',
    'Nothing gets saved. The named step only lasts for this one query.',
  ],
  example: {
    say: 'Here the top price in each category is worked out as a named step, then read like a table.',
    code: `WITH top_prices AS (
  SELECT category, MAX(price) AS top_price
  FROM products
  GROUP BY category
)
SELECT *
FROM top_prices
ORDER BY top_price DESC;`,
    lines: [
      ['WITH top_prices AS (...)', 'names the query in brackets top_prices.'],
      ['FROM top_prices', 'the next query reads it as if it were a table.'],
    ],
  },
  brief: {
    story: 'The owner wants to know which cities are pulling above their weight.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ["Each city's total revenue (the starter has it)", 'Keep only the cities whose total is above the average of those totals'],
    out: 'Columns `city` and `revenue`.',
  },
},
'sq-19': {
  explain: [
    'The café sells online too, and that data lives in four tables that work as a team: `customers`, `orders`, `order_items` and `products`.',
    'Each table holds one kind of thing. One row of `orders` is one order. One row of `order_items` is one product within one order.',
    '**Ids** link them together. An order has a `customer_id` saying who placed it, and an order item has an `order_id` and a `product_id`.',
    'Keeping each thing in one place means a customer\'s name is stored just once, however many orders they place.',
    'Whenever you meet a new database, start by counting: how many rows, which values, what\'s missing, which dates.',
  ],
  example: {
    say: 'Here\'s a first look at `orders`: how many there are, and the first and last days.',
    code: `SELECT COUNT(*) AS orders,
       MIN(order_date) AS first_day,
       MAX(order_date) AS last_day
FROM orders;`,
    lines: [
      ['COUNT(*)', 'one row per order, so this counts orders.'],
      ['MIN(order_date), MAX(order_date)', 'the earliest and latest days, so you know what time the data covers.'],
    ],
  },
  brief: {
    story: 'It is your first day on the online shop team, and your manager asks how the orders are getting on.',
    get: [['`orders` has one row per order:', ORDERS]],
    want: ['How many orders have each `status`', 'Most first'],
    out: 'Columns `status` and `orders`: three rows.',
  },
},
'sq-20': {
  explain: [
    'A JOIN doesn\'t have to stop at two tables. Join a second, then a third, each lining up with what you\'ve built so far.',
    'Each JOIN gets its own `ON`, saying which id matches which.',
    'Here, `orders` gives the status and the date, `order_items` gives the quantity, and `products` gives the name and the price.',
    '`oi.qty * p.price` is what one line of an order was worth.',
    'Join first. After that, WHERE, GROUP BY and ORDER BY treat the joined rows as one big table.',
  ],
  example: {
    say: 'Here\'s everything in order 5001, with each product named.',
    code: `SELECT o.order_id, o.order_date, p.name, oi.qty
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.order_id = 5001;`,
    lines: [
      ['JOIN order_items oi ON oi.order_id = o.order_id', "brings in the order's lines."],
      ['JOIN products p ON p.product_id = oi.product_id', "brings in each line's product, for its name."],
      ['WHERE o.order_id = 5001', 'just the one order.'],
    ],
  },
  brief: {
    story: 'The buyer wants to know which products bring in the most money.',
    get: [['`orders`:', ORDERS], ['`order_items`, one row per product in an order:', ITEMS], ['`products`:', PRODUCTS]],
    want: ['Revenue per product: qty × price, added up', 'Leave out cancelled orders', 'Best seller first'],
    out: 'Columns `name` and `revenue`.',
  },
},
'sq-21': {
  explain: [
    '`COUNT(*)` counts rows. In `orders`, one row is one order, so that counts orders.',
    '`COUNT(DISTINCT customer_id)` counts the different customers instead, each one once, however many orders they placed.',
    'A great habit before any count: say out loud what one row is. That tells you what `COUNT(*)` is really counting.',
    '`SELECT DISTINCT city FROM customers` works the same way, listing each value once.',
    'DISTINCT leaves NULLs out when it counts.',
  ],
  example: {
    say: 'Here are orders and customers counted side by side, from the same table.',
    code: `SELECT COUNT(*) AS orders,
       COUNT(DISTINCT customer_id) AS customers
FROM orders;`,
    lines: [
      ['COUNT(*)', 'every row: 150 orders.'],
      ['COUNT(DISTINCT customer_id)', 'each customer once, however many orders they placed.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how many people in each city actually buy, not how many orders there are.',
    get: [['`orders`:', ORDERS], ['`customers`:', CUSTOMERS]],
    want: ['For each city, how many **different** customers have placed an order'],
    out: 'Columns `city` and `buyers`.',
  },
},
'sq-22': {
  explain: [
    'To find rows with **no** match, LEFT JOIN, then keep only the rows where the right side came back NULL.',
    'After a LEFT JOIN, `WHERE o.order_id IS NULL` means "no order matched this customer".',
    'Test a column that\'s never NULL when there is a match, like the id. Then a NULL can only mean one thing.',
    'It\'s how you answer questions like "who signed up but never bought?" or "which product has never sold?"',
  ],
  example: {
    say: 'Here\'s the one product that has never been sold.',
    code: `SELECT p.name, oi.order_id
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.order_id IS NULL;`,
    lines: [
      ['LEFT JOIN order_items', 'every product is kept, sold or not.'],
      ['WHERE oi.order_id IS NULL', 'keeps the products that matched no order line. The tote bag.'],
    ],
  },
  brief: {
    story: 'Marketing wants to email the people who signed up but never bought.',
    get: [['`customers`:', CUSTOMERS], ['`orders`:', ORDERS]],
    want: ['The customers who have never placed an order', 'In alphabetical order'],
    out: 'One column, `name`, A to Z.',
  },
},
'sq-23': {
  explain: [
    '`EXISTS ( ... )` is true when the query inside finds at least one row, and false when it finds nothing.',
    'The inner query can use the outer row\'s columns. `WHERE o.customer_id = c.customer_id` means "this particular customer\'s orders".',
    'So `WHERE EXISTS (...)` keeps a customer who has at least one match, and lists them just once, however many matches there are.',
    'You\'ll often see `SELECT 1` inside. EXISTS only cares whether a row is there, not what\'s in it.',
    '`NOT EXISTS` is the opposite. Unlike `NOT IN`, it can\'t be tripped up by a NULL in the list.',
  ],
  example: {
    say: 'Here are the products with no order lines at all.',
    code: `SELECT p.name
FROM products p
WHERE NOT EXISTS (
  SELECT 1
  FROM order_items oi
  WHERE oi.product_id = p.product_id
);`,
    lines: [
      ['WHERE oi.product_id = p.product_id', 'the inner query looks for this product, the one in the outer row.'],
      ['NOT EXISTS', 'keeps the product only if the inner query finds nothing.'],
    ],
  },
  brief: {
    story: 'The kit supplier wants to thank the customers who bought their gear.',
    get: [['`customers`:', CUSTOMERS], ['`orders`, `order_items` and `products`:', PRODUCTS]],
    want: ['The customers who bought at least one product in the `kit` category', 'Each one once', 'In alphabetical order'],
    out: 'One column, `name`, A to Z.',
  },
},
'sq-24': {
  explain: [
    '`UNION` stacks one query\'s rows under another\'s, as one result.',
    'Both queries need the same number of columns, in the same order. The column names come from the first one.',
    '`UNION` drops repeats, so each value comes out once. `UNION ALL` keeps every row, repeats and all.',
    'You can chain as many as you need: `... UNION ... UNION ...`.',
    'One `ORDER BY` at the very end sorts the whole stack.',
  ],
  example: {
    say: 'Here the categories with something under £12 are stacked with those with something over £20, each listed once.',
    code: `SELECT category FROM products WHERE price < 12
UNION
SELECT category FROM products WHERE price > 20
ORDER BY category;`,
    lines: [
      ['UNION', "stacks the two lists. kit is in both, but it's only shown once."],
      ['ORDER BY category', 'one sort, at the end, for the whole stack.'],
    ],
  },
  brief: {
    story: 'Head office wants one master list of every city the business has touched.',
    get: [['`cafe`, `cities` and `customers` all have a `city` column.']],
    want: ['Every city named in any of the three', 'Each one once', 'No NULLs', 'A to Z'],
    out: 'One column, `city`.',
  },
},
'sq-25': {
  explain: [
    'Some questions need two steps. "The average order" means: first a total for each order, then the average of those totals.',
    'In the shop, each order has one or more lines in `order_items`, one per product.',
    'Average the lines directly and you get the average *line*. An order with three lines would be counted three times.',
    'So build step one in a WITH, with one row per order, then take the average of that.',
    'At each step, ask what one row is. First it\'s a line, then it\'s an order.',
  ],
  example: {
    say: 'Here\'s how many orders a customer places on average: a count per customer first, then the average of those.',
    code: `WITH per_customer AS (
  SELECT customer_id, COUNT(*) AS orders
  FROM orders
  GROUP BY customer_id
)
SELECT ROUND(AVG(orders), 2) AS avg_orders
FROM per_customer;`,
    lines: [
      ['per_customer', 'step one: one row per customer, with their number of orders.'],
      ['AVG(orders)', 'step two: the average of those counts.'],
    ],
  },
  brief: {
    story: 'The finance lead asks what a typical online order is worth.',
    get: [['`orders`:', ORDERS], ['`order_items`:', ITEMS], ['`products`:', PRODUCTS]],
    want: ["The average value of an order, each order's lines added up first", 'Leave out cancelled orders', 'Rounded to 2'],
    out: 'One row, one column: `avg_order`.',
  },
},
'sq-26': {
  explain: [
    '`CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END` gives a 1 for each cancelled order and a 0 for anything else.',
    '`SUM` of that adds up the 1s, which is a count of only the rows that match.',
    'Put a few of those side by side, one for each value, and you\'ve turned values into columns. That\'s a **pivot**, done in SQL.',
    'For a percentage, divide the count by the total and multiply by 100.',
    'Write `100.0`, not `100`. Otherwise a whole number divided by a whole number throws the fraction away.',
  ],
  example: {
    say: 'Here each category gets a count of all its products, and of just the ones costing £15 or more.',
    code: `SELECT category,
       COUNT(*) AS products,
       SUM(CASE WHEN price >= 15 THEN 1 ELSE 0 END) AS pricey
FROM products
GROUP BY category;`,
    lines: [
      ['CASE WHEN price >= 15 THEN 1 ELSE 0 END', '1 for a pricey product, 0 for the rest.'],
      ['SUM(...)', 'adds the 1s up: the pricey ones in each category.'],
    ],
  },
  brief: {
    story: 'Customer service wants to know which city cancels most, as a share of its orders.',
    get: [['`orders`:', ORDERS], ['`customers`:', CUSTOMERS]],
    want: ['Per city: `orders` (all of them)', '`cancelled`: how many were cancelled', '`cancel_pct`: cancelled as a percentage of orders, rounded to 1'],
    out: 'Four columns, one row per city.',
  },
},
'sq-27': {
  explain: [
    'To count the days between two dates, you first need to turn each one into a number.',
    '`julianday(date)` gives a date as a plain count of days. Take one from another and you\'ve got the days in between.',
    'The answer can come with a decimal part, so `CAST(... AS INTEGER)` turns it into a whole number of days.',
    '`MIN(order_date)` for each customer is their first order. MIN works on these dates because they sort correctly as text.',
    'When you group by a customer and want their name too, put both in the GROUP BY.',
  ],
  example: {
    say: 'Here are the three latest orders, with how many days before 1 July each was placed.',
    code: `SELECT order_id, order_date,
       CAST(julianday('2024-07-01') - julianday(order_date) AS INTEGER) AS days_before
FROM orders
ORDER BY order_date DESC
LIMIT 3;`,
    lines: [
      ["julianday('2024-07-01') - julianday(order_date)", 'one date as a number of days, take away the other.'],
      ['CAST(... AS INTEGER)', 'keeps it a whole number of days.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how long new sign-ups wait before their first order.',
    get: [['`customers`:', CUSTOMERS], ['`orders`:', ORDERS]],
    want: ['Every customer who has ordered', '`days_to_first`: the days from `joined` to their first order, as a whole number'],
    out: 'Columns `name` and `days_to_first`.',
  },
},
'sq-30': {
  explain: [
    '`CREATE TABLE monthly AS SELECT ...` saves a query\'s answer as a brand new table called `monthly`.',
    'From then on, `monthly` behaves like any other table. You can filter it, join it and sort it.',
    'End each query with `;`. You can write several in a row, and they run one after another.',
    'Analysts build results in steps like this, so each step can be checked on its own.',
    'Here, every run starts from fresh copies of the tables, so your new table is gone next time. In a real database it would stay.',
  ],
  example: {
    say: 'Here the dearer products are saved as a table, then the new table is summed up.',
    code: `CREATE TABLE pricey AS
SELECT name, price
FROM products
WHERE price > 20;

SELECT COUNT(*) AS products, MAX(price) AS top
FROM pricey;`,
    lines: [
      ['CREATE TABLE pricey AS', 'saves the answer of the SELECT under it as a table called pricey.'],
      ['FROM pricey', 'the second query uses the new table like any other.'],
    ],
  },
  brief: {
    story: 'The operations lead wants to spot the busy months.',
    get: [['`orders`:', ORDERS]],
    want: ['Keep the starter, which saves `monthly`', 'Then: the months with more orders than the average month', 'In month order'],
    out: 'Columns `month` and `orders`.',
  },
},
'sq-16': {
  explain: [
    'A **window function** works across rows without squashing them. Every row stays put, with an answer added alongside it.',
    '`RANK() OVER (ORDER BY revenue DESC)` numbers the rows 1, 2, 3, starting from the biggest.',
    'Add `PARTITION BY city` inside the brackets and the numbering starts again for each city.',
    'Rows that tie share a rank, and the next number is skipped: 1, 2, 2, 4.',
    'WHERE runs before the window does, so you can\'t filter on a rank there. Work the rank out in a WITH, then filter outside it.',
  ],
  example: {
    say: 'Here every product is ranked by price within its own category.',
    code: `SELECT category, name, price,
       RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk
FROM products
ORDER BY category, rnk;`,
    lines: [
      ['PARTITION BY category', 'the ranking starts again at 1 for each category.'],
      ['ORDER BY price DESC', 'the dearest in each category is rank 1.'],
    ],
  },
  brief: {
    story: 'Each city manager wants their own top three days for the staff noticeboard.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ["Rank each city's days by revenue, biggest first", 'Keep ranks 1 to 3'],
    out: 'Columns `city`, `date`, `revenue`, `rnk`: three rows per city.',
  },
},
'sq-17': {
  explain: [
    '`SUM(revenue) OVER (ORDER BY date)` gives a **running total**. On each row, it\'s everything up to and including that row.',
    'The ORDER BY inside OVER decides what "so far" means. Here, it\'s by date.',
    'Every row stays. The running total just appears next to it.',
    'Put `PARTITION BY city` inside the brackets for a separate running total in each city.',
    '`COUNT(*) OVER (ORDER BY ...)` works the same way, as a running count.',
  ],
  example: {
    say: 'Here\'s a running count of the orders, in date order.',
    code: `SELECT order_date, order_id,
       COUNT(*) OVER (ORDER BY order_date, order_id) AS so_far
FROM orders
ORDER BY order_date, order_id
LIMIT 6;`,
    lines: [
      ['COUNT(*) OVER (ORDER BY order_date, order_id)', 'how many orders up to and including this one.'],
      ['LIMIT 6', 'just the first six, to see it climb.'],
    ],
  },
  brief: {
    story: "The Lagos manager wants to watch the branch's takings build up through the year.",
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['Lagos only', "`running`: Lagos's revenue so far, rounded to 2", 'In date order'],
    out: 'Columns `date`, `revenue`, `running`.',
  },
},
'sq-28': {
  explain: [
    '`LAG(column) OVER (ORDER BY ...)` fetches a value from the row before. `LEAD` fetches it from the row after.',
    '`PARTITION BY customer_id` inside the brackets keeps it within one customer, so you get their own previous order, not someone else\'s.',
    'The first row has nothing before it, so LAG gives NULL there.',
    'For dates, take one `julianday` from the other to get the gap in days.',
    'If two rows tie in the ORDER BY, add a tie-breaker, so "the row before" is always the same row.',
  ],
  example: {
    say: 'Here are Nairobi\'s first five days, each with the revenue from the Nairobi day before.',
    code: `SELECT date, revenue,
       LAG(revenue) OVER (ORDER BY date) AS day_before
FROM cafe
WHERE city = 'Nairobi'
ORDER BY date
LIMIT 5;`,
    lines: [
      ['LAG(revenue) OVER (ORDER BY date)', 'the revenue from the row before, in date order.'],
      ['day_before', 'NULL on the first row, which has nothing before it.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how often customers come back to order again.',
    get: [['`orders`:', ORDERS]],
    want: ['For every order: `customer_id`, `order_id`', "`gap_days`: days since that customer's previous order, NULL for their first", 'Sorted by customer, then date, then order id'],
    out: 'Three columns, one row per order: 150 rows.',
    fine: ['Two orders on the same day go in order_id order.'],
  },
},
'sq-29': {
  explain: [
    '`SUM(x) OVER ()` is a window with nothing in its brackets. It\'s the grand total, repeated on every row.',
    'Divide by it to get each row\'s share: `100.0 * x / SUM(x) OVER ()`.',
    'Windows are worked out after GROUP BY, so they can look at grouped results.',
    'That\'s why `SUM(SUM(x)) OVER ()` works. The inner SUM is each group\'s total, and the outer one adds those up.',
    'The shares add up to 100, give or take a little rounding.',
  ],
  example: {
    say: 'Here\'s each city\'s share of the four cities\' people.',
    code: `SELECT city, population_m,
       ROUND(100.0 * population_m / SUM(population_m) OVER (), 1) AS pct
FROM cities;`,
    lines: [
      ['SUM(population_m) OVER ()', 'all four added up, shown on every row.'],
      ['100.0 * population_m / ...', "each city's share, as a percentage."],
    ],
  },
  brief: {
    story: 'The buyer wants to see how the money splits across categories.',
    get: [['`order_items`:', ITEMS], ['`products`:', PRODUCTS]],
    want: ["`revenue` per category (the starter has it)", "`pct`: each category's share of all revenue, as a percentage rounded to 1", 'Biggest first'],
    out: 'Columns `category`, `revenue`, `pct`.',
  },
},
'sq-18': {
  explain: [
    'This lesson steps back into Python, where pandas and SQL can work as a team.',
    '`sqlite3.connect(":memory:")` opens an empty database that only lives while your code runs.',
    '`cafe.to_sql("cafe", db, index=False)` copies a pandas table into it, as a table called cafe.',
    '`pd.read_sql(query, db)` runs a query and hands the answer back as a **DataFrame**.',
    'So you can filter and group in SQL, then chart the result or carry on in pandas.',
    'Three quotes, `"""`, let a long query spread over several lines.',
  ],
  example: {
    say: 'Here the cities table goes into a database, and a query comes back as a DataFrame.',
    code: `import sqlite3
db = sqlite3.connect(":memory:")
cities.to_sql("cities", db, index=False)

big = pd.read_sql("SELECT city, population_m FROM cities WHERE population_m > 2", db)
big`,
    lines: [
      ['cities.to_sql("cities", db, index=False)', 'copies the pandas table into the database.'],
      ['pd.read_sql(...)', 'runs the query and gives back a DataFrame.'],
      ['big', 'on the last line on its own, so the table is shown.'],
    ],
  },
  brief: {
    story: 'The owner wants a bar chart of monthly takings, and the query is easiest to write in SQL.',
    get: [['`cafe` is a pandas table, one row per day:', CAFE]],
    want: ['`monthly` from `pd.read_sql`: one row per month, columns `month` and `revenue`', 'Draw it: `monthly.plot.bar(x="month", y="revenue")`'],
    out: 'A DataFrame called `monthly` with four rows, and a bar chart of it.',
  },
},
'sq-31': {
  explain: [
    '`INSERT INTO table (columns) VALUES (values)` adds a new row.',
    'List the columns you\'re filling, then give the values in the same order. That way nothing can land in the wrong column.',
    'Words go in single quotes, numbers without.',
    'End it with `;`, and a SELECT after it can show you the new row.',
    'Every run here starts from a fresh copy of the tables, so experiment as much as you like. In a real database, a change stays changed.',
  ],
  example: {
    say: 'Here a new city is added, then the table is shown, biggest first.',
    code: `INSERT INTO cities (city, country, population_m)
VALUES ('Kampala', 'Uganda', 1.7);

SELECT *
FROM cities
ORDER BY population_m DESC;`,
    lines: [
      ['INSERT INTO cities (city, country, population_m)', 'the table, and the columns being filled.'],
      ["VALUES ('Kampala', 'Uganda', 1.7)", 'one value for each column, in the same order.'],
    ],
  },
  brief: {
    story: 'The shop is adding a new product, and it needs to go in the database.',
    get: [['`products`:', PRODUCTS]],
    want: ['Add product `113`: name `sticker pack`, category `merch`, price `3.5`', "Then the starter's SELECT, showing the merch products cheapest first"],
    out: 'Columns `name` and `price`, with the sticker pack at the top.',
  },
},
'sq-32': {
  explain: [
    '`UPDATE table SET column = new value WHERE ...` changes values in the rows that match.',
    'The new value can be built from the old one, so `price * 1.1` is the old price plus 10%.',
    'WHERE picks which rows change. Forget it and **every** row changes, which is one of the classic SQL mistakes.',
    'A safe habit: write the WHERE as a SELECT first, check the rows it finds, then turn it into the UPDATE.',
    'You can change several columns at once, with commas: `SET price = 10, name = \'mug\'`.',
  ],
  example: {
    say: 'Here Kigali\'s population grows by half a million, then the table is shown.',
    code: `UPDATE cities
SET population_m = population_m + 0.5
WHERE city = 'Kigali';

SELECT *
FROM cities;`,
    lines: [
      ['SET population_m = population_m + 0.5', 'the new value, worked out from the old one.'],
      ["WHERE city = 'Kigali'", 'only the Kigali row changes. The others stay as they were.'],
    ],
  },
  brief: {
    story: 'Bean prices are going up by 10%.',
    get: [['`products`:', PRODUCTS]],
    want: ['Change only the `beans` products', 'New price: `ROUND(price * 1.1, 2)`', "Then the starter's SELECT, showing every product"],
    out: 'Every product, with only the three beans prices changed.',
  },
},
'sq-33': {
  explain: [
    '`DELETE FROM table WHERE ...` removes the rows that match. There\'s no undo button.',
    '`DELETE FROM orders` with no WHERE empties the entire table.',
    'So use the same safe habit: run a SELECT with that WHERE first, check the rows, then delete.',
    'Removing an order leaves its lines behind in `order_items`, pointing at an order that no longer exists. Real databases can be set up to stop that, with rules called foreign keys.',
  ],
  example: {
    say: 'Here the products under £10 are removed, then the ones left are counted.',
    code: `DELETE FROM products
WHERE price < 10;

SELECT COUNT(*) AS left_over
FROM products;`,
    lines: [
      ['DELETE FROM products WHERE price < 10', 'removes the mug and the filter papers.'],
      ['COUNT(*)', 'ten products are left of the twelve.'],
    ],
  },
  brief: {
    story: 'The analysts want the cancelled orders out of the way.',
    get: [['`orders`:', ORDERS]],
    want: ['Delete the cancelled orders', "Then the starter's count of orders per status"],
    out: 'Columns `status` and `orders`, with no cancelled row.',
  },
},
'sq-34': {
  explain: [
    '`||` glues text together: `name || \' (\' || category || \')\'` gives `mug (merch)`.',
    '`UPPER` and `LOWER` change capitals, `LENGTH` counts characters, and `TRIM` strips spaces off the ends.',
    '`SUBSTR(text, start, length)` cuts out a piece. It starts counting at 1, so `SUBSTR(\'Lagos\', 1, 3)` is `Lag`.',
    'You can tuck functions inside each other: `UPPER(SUBSTR(city, 1, 3))` gives `LAG`.',
    'Watch out for gaps. Anything joined to NULL becomes NULL, so use `COALESCE(city, \'unknown\')` to fill the gap first.',
  ],
  example: {
    say: 'Here are four products as a label, a short capital code and a letter count.',
    code: `SELECT name || ' (' || category || ')' AS label,
       UPPER(SUBSTR(name, 1, 4)) AS short,
       LENGTH(name) AS letters
FROM products
LIMIT 4;`,
    lines: [
      ["name || ' (' || category || ')'", 'four pieces of text joined into one.'],
      ['UPPER(SUBSTR(name, 1, 4))', 'the first 4 characters, in capitals.'],
      ['LENGTH(name)', 'how many characters, spaces included.'],
    ],
  },
  brief: {
    story: 'The warehouse wants a short code for each customer, to write on parcels.',
    get: [['`customers`:', CUSTOMERS]],
    want: ['Replace `city` with `code`', 'The first three letters of the city in capitals, a dash, then the customer_id, like `LAG-2`', 'Someone with no city gets `UNK`, like `UNK-7`', 'Keep the first 8 customers'],
    out: 'Columns `customer_id`, `name`, `code`: eight rows.',
  },
},
'sq-35': {
  explain: [
    '`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC)` numbers each customer\'s orders 1, 2, 3, newest first.',
    'Keep number 1 and you\'ve got exactly one row per customer: their latest order.',
    'RANK hands out two 1s when there\'s a tie. ROW_NUMBER never does. It just picks one.',
    'So tell it how to break ties, or the database will choose for you, and it might choose differently next time. Add a second column to the ORDER BY.',
    'As with RANK, number the rows in a WITH, then filter outside it.',
  ],
  example: {
    say: 'Here\'s the cheapest product in each category.',
    code: `WITH numbered AS (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price, product_id) AS rn
  FROM products
)
SELECT category, name, price
FROM numbered
WHERE rn = 1;`,
    lines: [
      ['PARTITION BY category ORDER BY price, product_id', "numbers each category's products from the cheapest, with product_id breaking any tie."],
      ['WHERE rn = 1', 'keeps one row per category.'],
    ],
  },
  brief: {
    story: "Customer service wants each customer's most recent order on one screen.",
    get: [['`orders`:', ORDERS]],
    want: ["Number each customer's orders with `ROW_NUMBER()` in a WITH, newest first", 'Ties go to the higher order_id', 'Keep number 1', 'By customer_id'],
    out: 'Columns `customer_id`, `order_id`, `order_date`: one row per customer who has ordered.',
  },
},
'sq-36': {
  explain: [
    'One WITH can hold several named steps, with commas between them: `WITH monthly AS (...), city_avg AS (...)`.',
    'Each step can read the ones above it.',
    'The final SELECT, after the last bracket, can use any of them, and even join them together.',
    'Name each step after what one of its rows is. `monthly` has one row per city per month.',
    'Steps you can read from top to bottom are far easier to check than one big nested query.',
  ],
  example: {
    say: 'Here two named steps follow each other: a count per category, then only the bigger categories.',
    code: `WITH by_cat AS (
  SELECT category, COUNT(*) AS products
  FROM products
  GROUP BY category
),
big AS (
  SELECT * FROM by_cat WHERE products >= 3
)
SELECT *
FROM big
ORDER BY products DESC;`,
    lines: [
      ['by_cat', 'step one: one row per category, with its count.'],
      [', big AS (...)', 'step two, after a comma, reads step one.'],
      ['FROM big', 'the final query reads the last step.'],
    ],
  },
  brief: {
    story: 'Each city manager wants to know their own good months, judged against their own average.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['Monthly revenue per city (the starter has it)', "A second step, `city_avg`: each city's average month", "Only the months that beat their own city's average", 'By city, then month'],
    out: 'Columns `city`, `month`, `revenue`.',
  },
},
'sq-37': {
  explain: [
    'A **self-join** joins a table to a copy of itself. Give each copy its own short name: `order_items a JOIN order_items b`.',
    'Join them on `a.order_id = b.order_id`, and every line meets every other line from the same order.',
    'That gives you the pairs of products bought together.',
    'Left like that, each pair turns up twice (mug with beans, and beans with mug), and every product pairs up with itself.',
    '`AND a.product_id < b.product_id` fixes both problems: only one way round, and never with itself.',
  ],
  example: {
    say: 'Here the beans are paired up within their own category, cheaper one first.',
    code: `SELECT a.name AS cheaper, b.name AS dearer, b.price - a.price AS gap
FROM products a
JOIN products b ON a.category = b.category AND a.price < b.price
WHERE a.category = 'beans';`,
    lines: [
      ['FROM products a JOIN products b', 'two copies of the same table, called a and b.'],
      ['a.price < b.price', 'only one way round: the cheaper one on the left, and never a product with itself.'],
    ],
  },
  brief: {
    story: 'The shop wants to suggest "often bought with" products on each page.',
    get: [['`order_items`, one row per product in an order:', ITEMS]],
    want: ['Pairs of products bought in the same order: `product_a` and `product_b`, smaller id first', '`orders`: how many orders had both', 'Keep pairs with 6 or more orders', 'Most first, then by `product_a` and `product_b`'],
    out: 'Columns `product_a`, `product_b`, `orders`.',
  },
},
'sq-38': {
  explain: [
    'A window can look at just the nearby rows. `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` means this row and the six before it.',
    'With one row per day, that\'s a week.',
    'So `AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` is the average of the last seven days, worked out fresh on every row. That\'s a **moving average**.',
    'It smooths out the odd strange day, so you can see the trend underneath.',
    'The first six days don\'t have six days behind them yet, so they just average what there is.',
  ],
  example: {
    say: 'Here are the cups over the last three days, on each of the first five days.',
    code: `SELECT date, cups,
       SUM(cups) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS last3
FROM cafe
ORDER BY date
LIMIT 5;`,
    lines: [
      ['ROWS BETWEEN 2 PRECEDING AND CURRENT ROW', 'this day and the two before it.'],
      ['last3', 'on the first two days there are fewer days behind, so it adds what there is.'],
    ],
  },
  brief: {
    story: 'The owner wants a smoother line of takings, without the daily ups and downs.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ['`avg7`: the average revenue of each day and the six days before it', 'Rounded to 2', 'By date'],
    out: 'Columns `date`, `revenue`, `avg7`: 120 rows.',
  },
},
'sq-39': {
  explain: [
    '`NTILE(4) OVER (ORDER BY spend DESC)` deals the rows into 4 groups in that order, as evenly as it can.',
    'Group 1 is the top quarter, and group 4 the bottom.',
    'Four groups like this are called **quartiles**. When the rows don\'t divide evenly, the first groups get one extra each.',
    'Give the ORDER BY a tie-breaker, like `customer_id`. Otherwise two customers who spent the same could swap groups from one run to the next.',
    'It\'s a quick way to find your best customers, say for a loyalty offer.',
  ],
  example: {
    say: 'Here the twelve products are dealt into three price bands, dearest first.',
    code: `SELECT name, price,
       NTILE(3) OVER (ORDER BY price DESC, product_id) AS band
FROM products
ORDER BY price DESC;`,
    lines: [
      ['NTILE(3)', 'three groups. Twelve products split evenly, four in each.'],
      ['ORDER BY price DESC, product_id', 'dearest first, with product_id breaking any tie.'],
    ],
  },
  brief: {
    story: "The loyalty team wants customers split into four bands by how much they've spent.",
    get: [['The starter works out `spend` for each customer, from `orders`, `order_items` and `products`.']],
    want: ['`quartile`: which quarter each customer falls in by spend, 1 for the biggest spenders', 'Ties broken by `customer_id`', 'Biggest spend first'],
    out: 'Columns `customer_id`, `spend`, `quartile`.',
  },
},
'sq-40': {
  explain: [
    '`EXCEPT` takes the rows from the first query and removes any that the second query also gives.',
    '`INTERSECT` does the reverse, keeping only the rows both queries give.',
    'Both queries need the same columns, in the same order.',
    'The result never has repeats, just as if you\'d written DISTINCT.',
    'So customers who ordered before June, EXCEPT those who ordered from June on, are the ones who\'ve gone quiet.',
  ],
  example: {
    say: 'Here\'s the one category that has both something over £20 and something under £10.',
    code: `SELECT category FROM products WHERE price > 20
INTERSECT
SELECT category FROM products WHERE price < 10;`,
    lines: [
      ['SELECT category ... price > 20', 'kit and gift.'],
      ['INTERSECT', 'keeps what is in both lists: only kit has something under 10 as well.'],
    ],
  },
  brief: {
    story: 'Marketing wants a "we miss you" list: people who used to order but have stopped.',
    get: [['`orders`:', ORDERS]],
    want: ['The customers who ordered before June', 'But not in June or after'],
    out: 'One column, `customer_id`.',
  },
},
'sq-41': {
  explain: [
    'Divide one whole number by another here and you get a whole number back: `7 / 2` is 3.',
    '`1.0 * 7 / 2` turns it into a decimal first, so you get 3.5.',
    'Dividing by zero is trouble. Many databases stop with an error.',
    '`NULLIF(x, 0)` gives NULL when x is 0, and x otherwise. Dividing by NULL gives NULL, which is an honest blank.',
    'The tote bag has never sold, so its average quantity should be blank. Not 0, and not an error.',
  ],
  example: {
    say: 'Here are three divisions, side by side.',
    code: `SELECT 7 / 2 AS whole,
       1.0 * 7 / 2 AS decimal,
       7 / NULLIF(0, 0) AS safe;`,
    lines: [
      ['7 / 2', 'whole numbers, so the fraction goes: 3.'],
      ['1.0 * 7 / 2', 'a decimal first, so it stays: 3.5.'],
      ['7 / NULLIF(0, 0)', 'the bottom is 0, so NULLIF makes it NULL, and the answer is blank.'],
    ],
  },
  brief: {
    story: 'The buyer wants the average quantity per sale for every product, even ones that never sold.',
    get: [['`products`:', PRODUCTS], ['`order_items`:', ITEMS]],
    want: ['Fix `avg_qty`, the average quantity per order line', 'Keep the decimals, rounded to 2', 'Divide by `NULLIF(COUNT(oi.order_id), 0)`, so the tote bag gets a blank', 'Keep the columns and the order'],
    out: 'Columns `name`, `lines`, `avg_qty`, with a blank for the tote bag.',
  },
},
'sq-42': {
  explain: [
    'GROUP BY only makes rows for values that are actually there. A day with no orders simply doesn\'t show up.',
    'Chart that and the line skips straight over the gap, hiding your quiet days.',
    '`WITH RECURSIVE` builds a list by repeating a step. Start with one row, then keep adding the next one until a condition says stop.',
    '`date(day, \'+1 day\')` gives you the next day.',
    'LEFT JOIN the orders onto the full list of days, then count. `COUNT(o.order_id)` only counts real orders, so an empty day gets 0.',
  ],
  example: {
    say: 'Here the numbers 1 to 5 are built by repeating a step, each with its square.',
    code: `WITH RECURSIVE n(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM n WHERE x < 5
)
SELECT x, x * x AS squared
FROM n;`,
    lines: [
      ['SELECT 1', 'the starting row.'],
      ['SELECT x + 1 FROM n WHERE x < 5', 'the step: add the next number, until 5.'],
      ['x * x', 'each number times itself.'],
    ],
  },
  brief: {
    story: 'The shop wants a chart of January orders with no missing days.',
    get: [['`orders`:', ORDERS]],
    want: ['Every day of January, including the days with no orders', '`orders`: how many orders that day', 'By day'],
    out: 'Columns `day` and `orders`: 31 rows.',
  },
},
'sq-43': {
  explain: [
    'A customer\'s **cohort** is when they first bought. Everyone who started in March is the March cohort.',
    'Grouping customers this way shows whether newer customers behave like the older ones.',
    '`substr(order_date, 1, 7)` takes the first 7 characters of \'2024-03-15\', which is \'2024-03\', the month.',
    'The `MIN` of that, for each customer, is the month of their first order.',
    'Count the customers in each cohort and you\'ve got the first column of every cohort report.',
  ],
  example: {
    say: 'Here are the first five customers\' first month, and how many orders they\'ve placed.',
    code: `SELECT customer_id,
       MIN(substr(order_date, 1, 7)) AS first_month,
       COUNT(*) AS orders
FROM orders
GROUP BY customer_id
ORDER BY customer_id
LIMIT 5;`,
    lines: [
      ['substr(order_date, 1, 7)', 'the year and month of each order.'],
      ['MIN(...)', 'the earliest of those, per customer: their first month.'],
    ],
  },
  brief: {
    story: 'The growth team wants to know how many new customers started each month.',
    get: [['`orders`:', ORDERS]],
    want: ["Each customer's first month, in a WITH step called `firsts`", 'Then count the customers in each one'],
    out: 'Columns `cohort` and `customers`, by cohort.',
  },
},
'sq-44': {
  explain: [
    'The next question for each cohort: did they come back? In other words, did they order again in a later month?',
    '`EXISTS (...)` checks for a later order: the same customer, in a month after their cohort.',
    '`CASE WHEN EXISTS (...) THEN 1 ELSE 0 END` turns that into a 1 if they came back and a 0 if they didn\'t.',
    '`SUM` those 1s and 0s and you\'ve counted the customers who came back.',
    'Divide by the size of the cohort and you have a **retention rate**, the number every subscription business keeps a close eye on.',
  ],
  example: {
    say: 'Here the first six customers get a 1 if they\'ve ever had an order cancelled, and a 0 if not.',
    code: `SELECT c.name,
       CASE WHEN EXISTS (
         SELECT 1 FROM orders o
         WHERE o.customer_id = c.customer_id AND o.status = 'cancelled'
       ) THEN 1 ELSE 0 END AS ever_cancelled
FROM customers c
ORDER BY c.customer_id
LIMIT 6;`,
    lines: [
      ['EXISTS (...)', 'looks for a cancelled order belonging to this customer.'],
      ['THEN 1 ELSE 0', 'turns yes or no into a number you could add up.'],
    ],
  },
  brief: {
    story: 'The growth team wants to know how many people from each cohort came back.',
    get: [['`orders`:', ORDERS]],
    want: ['Keep the starter: each cohort and its `customers`', '`came_back`: how many in each cohort ordered again in a later month'],
    out: 'Columns `cohort`, `customers`, `came_back`, by cohort.',
  },
},
'sq-45': {
  explain: [
    'The **median** is the middle value once everything\'s sorted: half above it, half below.',
    'One huge day drags the average up, but barely moves the median. That makes the median a fairer idea of a typical day.',
    'SQLite has no MEDIAN, so you build one. Number each city\'s rows in order with `ROW_NUMBER()`, and count them with `COUNT(*) OVER (PARTITION BY city)`.',
    'With n rows, the middle is row `(n + 1) / 2`. When n is even there are two middle rows, and `(n + 2) / 2` is the other one.',
    'Whole-number division makes this work for an odd n too, because both point at the same row. Then average the one or two rows you kept.',
  ],
  example: {
    say: 'Here the twelve products are numbered from the cheapest. With 12 rows, the middle two are rows 6 and 7.',
    code: `SELECT name, price,
       ROW_NUMBER() OVER (ORDER BY price) AS rn,
       COUNT(*) OVER () AS n
FROM products;`,
    lines: [
      ['ROW_NUMBER() OVER (ORDER BY price)', 'numbers them 1 to 12, cheapest first.'],
      ['COUNT(*) OVER ()', 'how many rows there are, 12, on every row.'],
      ['rows 6 and 7', '(12 + 1) / 2 is 6 and (12 + 2) / 2 is 7, so the median is the average of those two prices.'],
    ],
  },
  brief: {
    story: 'The owner suspects a few huge days make the average look better than a typical day.',
    get: [['`cafe` has one row per day:', CAFE]],
    want: ["Each city's median daily revenue, rounded to 2", 'Number and count the rows in a WITH step, then average the middle one or two'],
    out: 'Columns `city` and `median`: three rows.',
  },
},
};
