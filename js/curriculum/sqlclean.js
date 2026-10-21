/* SQL cleaning (sc-*): the messy data course's ideas, done in a database.
   Most lessons work on `survey`, the same deliberately filthy export the
   messy data course uses: as a table its column names keep their spaces
   (" Name ", "City "), so they're written in double quotes. A few lessons
   bring a small table of their own through `setup` (a DataFrame, which
   becomes a table like every dataset does).

   Checks call _same_as(reference_sql), as in sql.js: the learner's last
   result must match the reference's, rows in any order unless ordered=True. */

// A courier's log with a few rows that break the rules (sc-11).
const COURIER = `courier = pd.DataFrame({
    "order_id":  [101, 102, 103, 104, 105, 106, 107, 108],
    "qty":       [2, 0, 1, 3, -1, 2, 1, 4],
    "rating":    [5, 4, 9, 3, 5, None, 2, 5],
    "ordered":   ["2024-03-01", "2024-03-01", "2024-03-02", "2024-03-02",
                  "2024-03-03", "2024-03-03", "2024-03-04", "2024-03-04"],
    "delivered": ["2024-03-02", "2024-03-03", "2024-03-02", "2024-03-01",
                  "2024-03-05", "2024-03-04", "2024-03-06", "2024-03-05"],
})`;

// Receipts whose stored totals don't all match their lines (sc-12).
const RECEIPTS = `receipts = pd.DataFrame({"receipt": [1, 2, 3, 4], "total": [12.25, 7.50, 11.00, 15.75]})
receipt_lines = pd.DataFrame({
    "receipt": [1, 1, 2, 2, 3, 3, 3, 4, 4],
    "item":    ["latte", "cake", "tea", "tea", "mocha", "cake", "tea", "latte", "brownie"],
    "price":   [4.50, 7.75, 2.75, 2.75, 5.00, 3.25, 2.75, 4.50, 3.75],
})`;

const TITLE_CITY = `UPPER(SUBSTR(TRIM("City "), 1, 1)) || LOWER(SUBSTR(TRIM("City "), 2))`;
const SPEND = `CAST(NULLIF(REPLACE("Spend (GBP)", '£', ''), 'n/a') AS REAL)`;
const YES = `SUBSTR(LOWER(TRIM("Subscribed?")), 1, 1) = 'y'`;

export const SQL_CLEAN = [

/* ── Find the mess ─────────────────────────────────────── */
{
  id: 'sc-01', mins: 3,
  title: 'Column names with spaces',
  concept: [
    '`survey` is a customer survey, exported by someone else and never tidied. Even its column names are messy: `" Name "` has spaces round it.',
    'A column name with spaces or symbols goes in **double** quotes, exactly as it is, spaces included: `"City "`. Single quotes mean text instead.',
    '`AS` gives a column a tidy new name in the result: `"City " AS city`.',
  ],
  starter: `SELECT *
FROM survey
LIMIT 5;`,
  task: 'Get just the name and the city for every row, renamed `name` and `city`.',
  hint: 'Each name in double quotes, spaces and all: `SELECT " Name " AS name, "City " AS city FROM survey;`',
  solution: `SELECT " Name " AS name,
       "City " AS city
FROM survey;`,
  check: `_same_as("""SELECT " Name " AS name, "City " AS city FROM survey""")`,
  deeper: {
    why: 'Exports often keep whatever the person who made the spreadsheet typed as headings, spaces and all. The database stores them exactly, so you have to quote them exactly.',
    mistake: "Writing `'City '` in single quotes. That isn't the column, it's the text \"City \", so every row shows the same word.",
    work: 'Renaming awkward columns with AS at the very start, in one place, means every query after it can use plain names.',
  },
},
{
  id: 'sc-02', mins: 3,
  title: 'How many ways is it spelled?',
  concept: [
    'GROUP BY a text column and count: every different value gets its own row. Messy text shows up as near-repeats: `Lagos`, `lagos`, ` Lagos`.',
    "A space at the start or end is invisible. Wrap the value in brackets, `'[' || x || ']'`, and the spaces show.",
    '`||` joins text in SQLite. `LENGTH(x)` counts characters, spaces included.',
  ],
  starter: `SELECT "City "
FROM survey
LIMIT 8;`,
  task: 'Every different spelling of the city, inside square brackets so the spaces show, as `shown`, with `n`: how many rows have it. Most first, then by `shown`.',
  hint: `\`SELECT '[' || "City " || ']' AS shown, COUNT(*) AS n FROM survey GROUP BY "City " ORDER BY n DESC, shown;\``,
  solution: `SELECT '[' || "City " || ']' AS shown,
       COUNT(*) AS n
FROM survey
GROUP BY "City "
ORDER BY n DESC, shown;`,
  check: `_same_as("""SELECT '[' || "City " || ']' AS shown, COUNT(*) AS n FROM survey GROUP BY "City " ORDER BY n DESC, shown""", ordered=True)`,
  deeper: {
    why: 'Three cities typed five ways means any count by city splits one place into several rows. Seeing every spelling first tells you exactly what to fix.',
    mistake: "Checking with `WHERE city = 'Lagos'` and trusting the count. The rows spelled ' Lagos' and 'lagos' are quietly left out.",
    work: 'GROUP BY with a count is the first thing analysts run on any text column from a new source.',
  },
},
{
  id: 'sc-03', mins: 4,
  title: 'Trim and fix the capitals',
  dialects: [
    ['PostgreSQL, Oracle', '`INITCAP(TRIM(city))` gives every word a capital in one go.'],
    ['SQL Server', '`TRIM` works from SQL Server 2017; before that, `LTRIM(RTRIM(city))`.'],
  ],
  concept: [
    '`TRIM(x)` takes the spaces off both ends. `LTRIM` and `RTRIM` do one end each.',
    '`LOWER(x)` and `UPPER(x)` change the capitals.',
    "SQLite has no title-case function, so build it: the first letter in capitals, the rest in lower case: `UPPER(SUBSTR(x, 1, 1)) || LOWER(SUBSTR(x, 2))`.",
  ],
  starter: `SELECT TRIM("City ") AS city, COUNT(*) AS n
FROM survey
GROUP BY city;`,
  task: 'Tidy the city so it reads like `Lagos`: spaces trimmed, a capital first letter, the rest lower case. Count each: `city` and `n`, A to Z. Three cities should be left.',
  hint: `Use \`TRIM("City ")\` twice inside \`UPPER(SUBSTR(..., 1, 1)) || LOWER(SUBSTR(..., 2))\`, then GROUP BY city ORDER BY city.`,
  solution: `SELECT ${TITLE_CITY} AS city,
       COUNT(*) AS n
FROM survey
GROUP BY city
ORDER BY city;`,
  check: `_same_as("""SELECT ${TITLE_CITY} AS city, COUNT(*) AS n FROM survey GROUP BY city ORDER BY city""", ordered=True)`,
  deeper: {
    why: "Trimming alone isn't enough: 'lagos' and 'Lagos' still group apart. Fixing the capitals as well is what folds them into one.",
    mistake: "Trimming after cutting out the first letter. SUBSTR(' Lagos', 1, 1) is the space, so trim first, then take the letter.",
    work: 'Once a fix works, it goes in one place (a view, or the load step of a pipeline) so every report reads the tidy version.',
  },
},
{
  id: 'sc-04', mins: 3,
  title: 'Text that means "missing"',
  concept: [
    "Exports often write missing as text: `'n/a'`, `'unknown'`, `'-'`. `IS NULL` can't see them, so a count of the gaps comes out too low.",
    "`NULLIF(x, 'n/a')` gives NULL when x is 'n/a', and x otherwise: the stand-in becomes a real gap.",
    '`COUNT(column)` skips NULLs, so after NULLIF it counts only the real values.',
  ],
  starter: `SELECT COUNT(*) AS missing
FROM survey
WHERE "Spend (GBP)" IS NULL;`,
  task: "The starter finds no missing spends, because they're written n/a. Make one row: `rows` (every row) and `given` (the spends that really are there, with n/a turned into NULL first).",
  hint: `\`SELECT COUNT(*) AS rows, COUNT(NULLIF("Spend (GBP)", 'n/a')) AS given FROM survey;\``,
  solution: `SELECT COUNT(*) AS rows,
       COUNT(NULLIF("Spend (GBP)", 'n/a')) AS given
FROM survey;`,
  check: `_same_as("""SELECT COUNT(*) AS rows, COUNT(NULLIF("Spend (GBP)", 'n/a')) AS given FROM survey""")`,
  deeper: {
    why: 'A report that says "nothing missing" when 6 answers are n/a is wrong twice: the gaps are hidden, and the average counts them as real answers.',
    mistake: "Using `WHERE spend <> 'n/a'` and forgetting it. Every later query has to repeat the same filter, and one of them won't.",
    work: 'Search a new table for the usual stand-ins (n/a, none, unknown, -, 0 where 0 makes no sense) before trusting any count.',
  },
},
{
  id: 'sc-05', mins: 4,
  title: 'Rows that appear twice',
  concept: [
    'Group by **every** column and count: a group with more than one row is an exact copy.',
    'HAVING keeps only the groups that pass a test, after grouping: `HAVING COUNT(*) > 1`.',
    'Exports repeat rows when a file is appended twice or a form is sent twice. Find them before you count anything.',
  ],
  starter: `SELECT COUNT(*) AS rows
FROM survey;`,
  task: 'List the rows that appear more than once: `name`, `note` and `copies` (how many times it appears). Group by all six columns.',
  hint: `\`SELECT " Name " AS name, "Note" AS note, COUNT(*) AS copies FROM survey GROUP BY " Name ", "City ", "Signed Up", "Spend (GBP)", "Subscribed?", "Note" HAVING COUNT(*) > 1;\``,
  solution: `SELECT " Name " AS name,
       "Note" AS note,
       COUNT(*) AS copies
FROM survey
GROUP BY " Name ", "City ", "Signed Up", "Spend (GBP)", "Subscribed?", "Note"
HAVING COUNT(*) > 1;`,
  check: `_same_as("""SELECT " Name " AS name, "Note" AS note, COUNT(*) AS copies FROM survey GROUP BY " Name ", "City ", "Signed Up", "Spend (GBP)", "Subscribed?", "Note" HAVING COUNT(*) > 1""")`,
  deeper: {
    why: 'Each copy is counted again in every total, so two copies of a big order make the takings look bigger than they were.',
    mistake: 'Grouping by the name alone. Two different people can share a name; only rows equal in every column are true copies.',
    work: 'Count the rows before and after removing copies, and say how many went, so anyone checking can follow it.',
  },
},

/* ── Fix it ────────────────────────────────────────────── */
{
  id: 'sc-06', mins: 4,
  title: 'Text into numbers',
  dialects: [
    ['SQL Server', '`TRY_CAST(x AS DECIMAL(10, 2))` gives NULL for text that isn\'t a number, instead of an error.'],
    ['PostgreSQL', "`'n/a'::numeric` stops with an error, so NULLIF first, just as here."],
  ],
  concept: [
    "`'£18.00'` is text. `REPLACE(x, '£', '')` takes the symbol out.",
    '`CAST(x AS REAL)` turns text into a number with decimals.',
    "Careful: in SQLite, `CAST('n/a' AS REAL)` gives **0**, not an error. So NULLIF the stand-in first, or every n/a pulls the average down.",
  ],
  starter: `SELECT ROUND(AVG(CAST("Spend (GBP)" AS REAL)), 2) AS avg_spend
FROM survey;`,
  task: 'The starter gets the average wrong: the £ amounts and the n/a both come out as 0. Make `spend` a real number (£ removed, n/a NULL), then one row: `given` (how many spends) and `avg_spend` (rounded to 2).',
  hint: `Inside a WITH: \`CAST(NULLIF(REPLACE("Spend (GBP)", '£', ''), 'n/a') AS REAL) AS spend\`. Then \`SELECT COUNT(spend) AS given, ROUND(AVG(spend), 2) AS avg_spend\`.`,
  solution: `WITH s AS (
  SELECT ${SPEND} AS spend
  FROM survey
)
SELECT COUNT(spend) AS given,
       ROUND(AVG(spend), 2) AS avg_spend
FROM s;`,
  check: `_same_as("""WITH s AS (SELECT ${SPEND} AS spend FROM survey) SELECT COUNT(spend) AS given, ROUND(AVG(spend), 2) AS avg_spend FROM s""")`,
  deeper: {
    why: "A silent 0 is worse than an error: the query runs, the answer looks reasonable, and it's wrong.",
    mistake: 'Removing the £ and casting, but forgetting the n/a. Six made-up zeros drag the average down by a third.',
    work: 'After converting, count how many values became NULL and compare it with the stand-ins you found. They should match.',
  },
},
{
  id: 'sc-07', mins: 3,
  title: 'Yes, y, YES, N, no',
  concept: [
    'Five spellings, two meanings. Make them alike first: `LOWER(TRIM(x))`.',
    "Then keep just the first letter, `SUBSTR(..., 1, 1)`: every answer is now 'y' or 'n'.",
    'CASE turns that into 1 or 0, and SUM adds up the 1s: a count of the yeses.',
  ],
  starter: `SELECT COUNT(*) AS subscribed
FROM survey
WHERE "Subscribed?" = 'Yes';`,
  task: 'The starter only counts the answers spelled exactly Yes. Count every kind of yes and every kind of no: one row, `subscribed` and `not_subscribed`.',
  hint: `\`SUM(CASE WHEN SUBSTR(LOWER(TRIM("Subscribed?")), 1, 1) = 'y' THEN 1 ELSE 0 END) AS subscribed\`, and the same the other way round.`,
  solution: `SELECT SUM(CASE WHEN ${YES} THEN 1 ELSE 0 END) AS subscribed,
       SUM(CASE WHEN ${YES} THEN 0 ELSE 1 END) AS not_subscribed
FROM survey;`,
  check: `_same_as("""SELECT SUM(CASE WHEN ${YES} THEN 1 ELSE 0 END) AS subscribed, SUM(CASE WHEN ${YES} THEN 0 ELSE 1 END) AS not_subscribed FROM survey""")`,
  deeper: {
    why: 'Matching one exact spelling quietly drops the rest, and the count looks believable.',
    mistake: "Testing `LIKE 'y%'` without LOWER: SQLite's LIKE ignores capitals for plain letters, but most databases don't, so the query changes meaning when it moves.",
    work: 'Store the cleaned answer as 1 or 0 once, so everyone downstream adds it up the same way.',
  },
},
{
  id: 'sc-08', mins: 5,
  title: 'Two date formats',
  dialects: [
    ['PostgreSQL', "`TO_DATE(signed_up, 'DD/MM/YYYY')` reads the day-first ones."],
    ['SQL Server', '`TRY_CONVERT(date, signed_up, 103)`: style 103 is day/month/year, and anything unreadable gives NULL.'],
  ],
  concept: [
    "SQLite keeps dates as text like `'2024-01-05'`. `'05/02/2024'` is day, month, year: British, from a form.",
    "`LIKE '__/__/____'` spots that layout: each `_` is exactly one character.",
    "Rebuild it with SUBSTR and `||`: the year (from character 7), a dash, the month (from 4), a dash, the day (from 1). A CASE with no ELSE gives NULL for anything else, like 'unknown'.",
  ],
  starter: `SELECT TRIM(" Name ") AS name,
       "Signed Up" AS signed_up
FROM survey;`,
  task: "Make `signed_up` a proper date written like `2024-02-05`: keep the ones already like that, rebuild the day-first ones, and leave 'unknown' as NULL. Columns `name` (trimmed) and `signed_up`.",
  hint: `\`CASE WHEN "Signed Up" LIKE '____-__-__' THEN "Signed Up" WHEN "Signed Up" LIKE '__/__/____' THEN SUBSTR("Signed Up", 7, 4) || '-' || SUBSTR("Signed Up", 4, 2) || '-' || SUBSTR("Signed Up", 1, 2) END AS signed_up\``,
  solution: `SELECT TRIM(" Name ") AS name,
       CASE WHEN "Signed Up" LIKE '____-__-__' THEN "Signed Up"
            WHEN "Signed Up" LIKE '__/__/____'
              THEN SUBSTR("Signed Up", 7, 4) || '-' || SUBSTR("Signed Up", 4, 2) || '-' || SUBSTR("Signed Up", 1, 2)
       END AS signed_up
FROM survey;`,
  check: `_same_as("""SELECT TRIM(" Name ") AS name, CASE WHEN "Signed Up" LIKE '____-__-__' THEN "Signed Up" WHEN "Signed Up" LIKE '__/__/____' THEN SUBSTR("Signed Up", 7, 4) || '-' || SUBSTR("Signed Up", 4, 2) || '-' || SUBSTR("Signed Up", 1, 2) END AS signed_up FROM survey""")`,
  deeper: {
    why: 'Dates written year first sort and compare correctly as text. Mixed layouts sort nonsense: every 05/... lands among the Mays.',
    mistake: 'Guessing month-first. 05/02/2024 then becomes 2 May instead of 5 February, and nothing errors to warn you.',
    work: 'Decide the layout from where the data came from (a British form, an American system), and write that choice down next to the query.',
  },
},
{
  id: 'sc-09', mins: 4,
  title: 'A number hiding in text',
  dialects: [
    ['PostgreSQL', "`SPLIT_PART(note, ' ', 1)` gives 'ref#1000', or use a pattern: `SUBSTRING(note FROM 'ref#([0-9]+)')`."],
    ['BigQuery', "`REGEXP_EXTRACT(note, r'ref#(\\d+)')` pulls the digits out directly."],
  ],
  concept: [
    "`INSTR(text, '#')` gives the position of the first `#` (0 if there isn't one).",
    '`SUBSTR(text, start, length)` cuts out a piece. Work the start and length out from the positions of the things around it.',
    '`CAST(... AS INTEGER)` turns the digits into a whole number you can sort and join on.',
  ],
  starter: `SELECT "Note"
FROM survey
LIMIT 5;`,
  task: "Each note starts `ref#1000 ...`. Make `ref`: the number between the `#` and the first space, as a whole number. Columns `name` (trimmed) and `ref`.",
  hint: `\`CAST(SUBSTR("Note", INSTR("Note", '#') + 1, INSTR("Note", ' ') - INSTR("Note", '#') - 1) AS INTEGER) AS ref\``,
  solution: `SELECT TRIM(" Name ") AS name,
       CAST(SUBSTR("Note", INSTR("Note", '#') + 1,
                   INSTR("Note", ' ') - INSTR("Note", '#') - 1) AS INTEGER) AS ref
FROM survey;`,
  check: `_same_as("""SELECT TRIM(" Name ") AS name, CAST(SUBSTR("Note", INSTR("Note", '#') + 1, INSTR("Note", ' ') - INSTR("Note", '#') - 1) AS INTEGER) AS ref FROM survey""")`,
  deeper: {
    why: 'Working the length out from the positions keeps it right when the numbers grow from 4 digits to 5.',
    mistake: 'Cutting a fixed `SUBSTR(note, 5, 4)`. It works today and silently chops ref#10000 to 1000.',
    work: 'Pulling ids out of free text is how a support ticket gets linked to the order it mentions.',
  },
},
{
  id: 'sc-10', mins: 3,
  title: 'Keep one of each',
  concept: [
    '`SELECT DISTINCT *` gives each different row once: the exact copies go.',
    'Used in a subquery, `SELECT COUNT(*) FROM (SELECT DISTINCT * FROM survey)` counts the rows left.',
    'When copies differ slightly (one corrected, one not), DISTINCT keeps both. Then ROW_NUMBER, from the SQL course, keeps one per key.',
  ],
  starter: `SELECT COUNT(*) AS before
FROM survey;`,
  task: 'One row: `before` (every row) and `after` (the rows left once exact copies are removed).',
  hint: '`SELECT (SELECT COUNT(*) FROM survey) AS before, (SELECT COUNT(*) FROM (SELECT DISTINCT * FROM survey)) AS after;`',
  solution: `SELECT (SELECT COUNT(*) FROM survey) AS before,
       (SELECT COUNT(*) FROM (SELECT DISTINCT * FROM survey)) AS after;`,
  check: `_same_as("""SELECT (SELECT COUNT(*) FROM survey) AS before, (SELECT COUNT(*) FROM (SELECT DISTINCT * FROM survey)) AS after""")`,
  deeper: {
    why: 'Before and after, side by side, is the proof that the clean-up removed what it should and nothing more.',
    mistake: 'Running DISTINCT on a few columns and calling it de-duplicated. Rows that differ elsewhere were real, and they vanish.',
    work: 'Put the DISTINCT in the clean view or table, once, rather than in every query that reads it.',
  },
},

/* ── Can you trust it? ─────────────────────────────────── */
{
  id: 'sc-11', mins: 5,
  title: 'Rules every row should follow',
  setup: COURIER,
  concept: [
    'Write down rules every row should obey, then find the rows that break them: a quantity of at least 1, a rating from 1 to 5, delivered on or after ordered.',
    "Each rule is a condition. `OR` joins them in a WHERE, so a row breaking any of them is kept.",
    "A CASE names the first rule each row breaks. A missing rating isn't broken, just missing: `NULL NOT BETWEEN 1 AND 5` isn't true, so it passes.",
  ],
  starter: `SELECT *
FROM courier;`,
  task: "List the rows of `courier` that break a rule: `order_id` and `problem`, which is 'no quantity' (qty below 1), 'rating out of range' (not from 1 to 5) or 'delivered before ordered', the first that applies. By order_id.",
  hint: "`CASE WHEN qty < 1 THEN 'no quantity' WHEN rating NOT BETWEEN 1 AND 5 THEN 'rating out of range' WHEN delivered < ordered THEN 'delivered before ordered' END AS problem`, and the same three conditions joined by OR in the WHERE.",
  solution: `SELECT order_id,
       CASE WHEN qty < 1 THEN 'no quantity'
            WHEN rating NOT BETWEEN 1 AND 5 THEN 'rating out of range'
            WHEN delivered < ordered THEN 'delivered before ordered'
       END AS problem
FROM courier
WHERE qty < 1 OR rating NOT BETWEEN 1 AND 5 OR delivered < ordered
ORDER BY order_id;`,
  check: `_same_as("""SELECT order_id, CASE WHEN qty < 1 THEN 'no quantity' WHEN rating NOT BETWEEN 1 AND 5 THEN 'rating out of range' WHEN delivered < ordered THEN 'delivered before ordered' END AS problem FROM courier WHERE qty < 1 OR rating NOT BETWEEN 1 AND 5 OR delivered < ordered ORDER BY order_id""", ordered=True)`,
  deeper: {
    why: 'A rule broken by several rows in the same way usually points to a fault upstream, in the system that made them. The list is evidence to send back.',
    mistake: 'Deleting the broken rows straight away. Set them aside with their reason, so someone can fix the source.',
    work: 'Teams keep checks like these as saved queries that run after every load, and alert someone when a row turns up.',
  },
},
{
  id: 'sc-12', mins: 5,
  title: "Totals that don't add up",
  setup: RECEIPTS,
  concept: [
    "When the same fact is stored twice, the two should agree: a receipt's total ought to equal its lines added up.",
    'Rebuild the figure yourself: join the lines to the receipts, group by receipt, and SUM the prices.',
    'Compare money with a small allowance: `ABS(total - SUM(price)) > 0.005`, not `<>`. Decimals are stored in binary, so equal-looking amounts can be a hair apart.',
  ],
  starter: `SELECT r.receipt, r.total, SUM(l.price) AS from_lines
FROM receipts r
JOIN receipt_lines l ON l.receipt = r.receipt
GROUP BY r.receipt, r.total;`,
  task: '`receipts` holds each receipt\'s total, and `receipt_lines` its items. Keep only the receipts whose total differs from their lines by more than 0.005: `receipt`, `total` and `from_lines` (rounded to 2), by receipt.',
  hint: '`HAVING ABS(r.total - SUM(l.price)) > 0.005`, `ROUND(SUM(l.price), 2) AS from_lines` and `ORDER BY r.receipt`.',
  solution: `SELECT r.receipt, r.total,
       ROUND(SUM(l.price), 2) AS from_lines
FROM receipts r
JOIN receipt_lines l ON l.receipt = r.receipt
GROUP BY r.receipt, r.total
HAVING ABS(r.total - SUM(l.price)) > 0.005
ORDER BY r.receipt;`,
  check: `_same_as("""SELECT r.receipt, r.total, ROUND(SUM(l.price), 2) AS from_lines FROM receipts r JOIN receipt_lines l ON l.receipt = r.receipt GROUP BY r.receipt, r.total HAVING ABS(r.total - SUM(l.price)) > 0.005 ORDER BY r.receipt""", ordered=True)`,
  deeper: {
    why: "Two copies of a fact that disagree means one is wrong, and you can't know which until you look. Reports built on either are suspect.",
    mistake: 'Comparing with `<>`. 0.1 + 0.2 stored in binary is not quite 0.3, so matching totals can be flagged as wrong.',
    work: 'Reconciling totals between systems, the till against the bank, is a daily job in finance teams.',
  },
},
{
  id: 'sc-13', mins: 5,
  title: 'Unusual, not impossible',
  concept: [
    "An outlier is a value far from the rest. It might be a typo or something real, like a huge catering order. Flag it, look at it, then decide.",
    "Compare each row with its own group: `AVG(revenue) OVER (PARTITION BY city)` puts each city's average on every one of its rows.",
    "A window can't go in WHERE, so work it out in a WITH, then filter outside.",
  ],
  starter: `SELECT city, ROUND(AVG(revenue), 2) AS city_avg
FROM cafe
GROUP BY city;`,
  task: "Find the café days whose revenue was more than 1.5 times their own city's average: `date`, `city`, `revenue` and `city_avg` (rounded to 2), by date.",
  hint: 'In a WITH: `SELECT date, city, revenue, AVG(revenue) OVER (PARTITION BY city) AS city_avg FROM cafe`. Then keep `revenue > 1.5 * city_avg`.',
  solution: `WITH t AS (
  SELECT date, city, revenue,
         AVG(revenue) OVER (PARTITION BY city) AS city_avg
  FROM cafe
)
SELECT date, city, revenue, ROUND(city_avg, 2) AS city_avg
FROM t
WHERE revenue > 1.5 * city_avg
ORDER BY date;`,
  check: `_same_as("""WITH t AS (SELECT date, city, revenue, AVG(revenue) OVER (PARTITION BY city) AS city_avg FROM cafe) SELECT date, city, revenue, ROUND(city_avg, 2) AS city_avg FROM t WHERE revenue > 1.5 * city_avg ORDER BY date""", ordered=True)`,
  deeper: {
    why: "A big day in a small branch can look ordinary beside the busiest city. Comparing each row with its own group catches what a single overall average misses.",
    mistake: 'Deleting the outliers to make a chart look tidy. If they were real, the chart now hides the most interesting days.',
    work: 'A list like this goes to someone who knows the branch: "was 24 January really that busy?" One answer saves hours of guessing.',
  },
},
{
  id: 'sc-14', mins: 4,
  title: 'A health check in one query',
  concept: [
    'Before you trust a table, sum up its health in one row: how many rows, how much is missing, how many different values, any repeated ids.',
    '`SUM(CASE WHEN x IS NULL THEN 1 ELSE 0 END)` counts the gaps in a column. `COUNT(DISTINCT x)` counts the different values.',
    '`COUNT(*) - COUNT(DISTINCT id)` is the number of repeated ids: anything above 0 means an id that should be unique isn\'t.',
  ],
  starter: `SELECT COUNT(*) AS rows
FROM customers;`,
  task: 'One health row for `customers`: `rows`, `no_city` (customers with no city), `cities` (how many different cities) and `repeated_ids` (rows minus different customer_ids).',
  hint: '`SUM(CASE WHEN city IS NULL THEN 1 ELSE 0 END) AS no_city, COUNT(DISTINCT city) AS cities, COUNT(*) - COUNT(DISTINCT customer_id) AS repeated_ids`',
  solution: `SELECT COUNT(*) AS rows,
       SUM(CASE WHEN city IS NULL THEN 1 ELSE 0 END) AS no_city,
       COUNT(DISTINCT city) AS cities,
       COUNT(*) - COUNT(DISTINCT customer_id) AS repeated_ids
FROM customers;`,
  check: `_same_as("""SELECT COUNT(*) AS rows, SUM(CASE WHEN city IS NULL THEN 1 ELSE 0 END) AS no_city, COUNT(DISTINCT city) AS cities, COUNT(*) - COUNT(DISTINCT customer_id) AS repeated_ids FROM customers""")`,
  deeper: {
    why: 'A health row run on every new file, and compared with last time, spots a broken export the day it arrives.',
    mistake: 'Counting cities with `COUNT(city)`. That counts rows with a city, not different cities.',
    work: 'Save the health query and run it on each delivery of the data. A change in the numbers is the first sign something upstream changed.',
  },
},
{
  id: 'sc-15', mins: 6,
  title: 'One clean view',
  concept: [
    "`CREATE VIEW clean_survey AS SELECT ...` saves a query under a name. It stores no data: it's worked out fresh each time someone reads it.",
    'Put every fix in the view, once: copies removed, city tidied, spend a number, subscribed as 1 or 0. Every report then reads `clean_survey` and gets the same clean answers.',
    'Build the fixes on `(SELECT DISTINCT * FROM survey)`, so the copies go first.',
  ],
  starter: `CREATE VIEW clean_survey AS
SELECT *
FROM survey;

SELECT *
FROM clean_survey
LIMIT 3;`,
  task: 'Make `clean_survey` from the distinct rows, with three columns: `city` (tidied, like Lagos), `spend` (a number, £ gone, n/a NULL) and `subscribed` (1 or 0). Then summarise it: `city`, `responses`, `subscribed` (how many) and `avg_spend` (rounded to 2), A to Z.',
  hint: 'The three expressions are the ones from "Trim and fix the capitals", "Text into numbers" and "Yes, y, YES, N, no", over `FROM (SELECT DISTINCT * FROM survey)`. Then group the view by city.',
  solution: `CREATE VIEW clean_survey AS
SELECT ${TITLE_CITY} AS city,
       ${SPEND} AS spend,
       CASE WHEN ${YES} THEN 1 ELSE 0 END AS subscribed
FROM (SELECT DISTINCT * FROM survey);

SELECT city,
       COUNT(*) AS responses,
       SUM(subscribed) AS subscribed,
       ROUND(AVG(spend), 2) AS avg_spend
FROM clean_survey
GROUP BY city
ORDER BY city;`,
  check: `_same_as("""CREATE VIEW cs AS SELECT ${TITLE_CITY} AS city, ${SPEND} AS spend, CASE WHEN ${YES} THEN 1 ELSE 0 END AS subscribed FROM (SELECT DISTINCT * FROM survey); SELECT city, COUNT(*) AS responses, SUM(subscribed) AS subscribed, ROUND(AVG(spend), 2) AS avg_spend FROM cs GROUP BY city ORDER BY city""", ordered=True)`,
  deeper: {
    why: 'Fixes copied into every report drift apart: one report trims the city and another forgets. One view means one definition of clean.',
    mistake: 'Cleaning in place with UPDATE on the raw table. The original is gone, and so is the evidence of what was wrong.',
    work: 'Raw tables stay as they arrived; a clean layer of views sits on top. Data teams call these the raw and clean (or staging) layers.',
  },
},
];
