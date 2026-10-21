/* SQL cleaning (sc-01 to sc-15): the fuller teaching, a worked example and
   the task as a brief (see detail/index.js). Examples clean something else:
   another column, a short piece of text, or a different table. */

const SURVEY = {
  '" Name "': 'the name, some in lower case (the column name has spaces round it)',
  '"City "': 'Lagos, Accra or Nairobi, with stray spaces and capitals',
  '"Signed Up"': 'the sign-up date: 2024-01-05, 05/02/2024 or unknown',
  '"Spend (GBP)"': 'text like 12.50, £18.00 or n/a',
  '"Subscribed?"': 'Yes, y, N, no or YES',
  '"Note"': 'a sentence starting ref# and a number',
};
const GOT_SURVEY = ['`survey`, a customer survey export: 32 rows, all text, never tidied. Two rows were sent twice.', SURVEY];
const STORY = 'The marketing team wants the survey in the database, and asks you to make it trustworthy first.';

export const SQLCLEAN_DETAIL = {
'sc-01': {
  explain: [
    'This course is about cleaning data inside a database. The table is `survey`: a customer survey, exported by someone else and never tidied up.',
    'Even the column names are a mess. `" Name "` has spaces round it, and `"Spend (GBP)"` has brackets in it.',
    'A column name with spaces or symbols has to go in **double** quotes, written exactly as it is: `"City "`.',
    'Single quotes mean something different. `\'City \'` is just those words, the same on every row, not the column.',
    '`AS` gives a column a tidy new name in your result, so everything that follows can use plain names.',
  ],
  example: {
    say: 'Here two other awkward columns are picked out and given tidy names.',
    code: `SELECT "Signed Up" AS signed_up,
       "Spend (GBP)" AS spend
FROM survey
LIMIT 3;`,
    lines: [
      ['"Signed Up"', 'the column, in double quotes because of the space.'],
      ['AS signed_up', 'its new, plain name in the result.'],
    ],
  },
  brief: {
    story: STORY,
    get: [GOT_SURVEY],
    want: ['Just the name and the city, for every row', 'Renamed `name` and `city`'],
    out: 'Two columns, 32 rows.',
  },
},
'sc-02': {
  explain: [
    'Group by a text column and count, and every different value gets its own row.',
    'Messy text shows up as near-repeats. `Lagos`, `lagos` and ` Lagos` each get a row of their own.',
    'A space at the start or end is invisible. Wrap the value in brackets, `\'[\' || x || \']\'`, and suddenly you can see it.',
    '`||` is how you join text together in SQLite.',
    '`LENGTH(x)` counts the characters, spaces included, which is another good way to catch them.',
  ],
  example: {
    say: 'Here are all the spellings of the subscribed answer, in brackets.',
    code: `SELECT '[' || "Subscribed?" || ']' AS shown,
       COUNT(*) AS n
FROM survey
GROUP BY "Subscribed?";`,
    lines: [
      ['GROUP BY "Subscribed?"', 'one row per spelling.'],
      ["'[' || ... || ']'", 'the brackets make the edges of each value visible.'],
    ],
  },
  brief: {
    story: 'The city report shows five cities. The café only has three.',
    get: [GOT_SURVEY],
    want: ['Every spelling of the city, in square brackets, as `shown`', '`n`: how many rows have it', 'Most first, then by `shown`'],
    out: 'Five rows.',
  },
},
'sc-03': {
  explain: [
    '`TRIM(x)` takes the spaces off both ends. `LTRIM` and `RTRIM` do just one end each.',
    '`LOWER(x)` makes everything small, and `UPPER(x)` makes it all capitals.',
    'SQLite has no function for "capital first letter", so you build one from two pieces.',
    '`UPPER(SUBSTR(x, 1, 1))` is the first letter in capitals, and `LOWER(SUBSTR(x, 2))` is the rest, from the 2nd character on, in small letters.',
    'Trim first, so the first character really is a letter and not a space.',
  ],
  example: {
    say: 'Here three made-up values are trimmed, shouted and fixed.',
    code: `SELECT TRIM('  latte  ') AS trimmed,
       UPPER('tea') AS loud,
       UPPER(SUBSTR('mOCHA', 1, 1)) || LOWER(SUBSTR('mOCHA', 2)) AS fixed;`,
    lines: [
      ["TRIM('  latte  ')", 'latte, with no spaces either side.'],
      ["UPPER(SUBSTR(..., 1, 1)) || LOWER(SUBSTR(..., 2))", 'M, then ocha: Mocha.'],
    ],
  },
  brief: {
    story: 'The regional manager wants a count per city that adds up.',
    get: [GOT_SURVEY],
    want: ['The city trimmed, with a capital first letter and the rest lower case', '`city` and `n`, A to Z'],
    out: 'Three cities.',
  },
},
'sc-04': {
  explain: [
    'Exports love writing "missing" as a word: `\'n/a\'`, `\'unknown\'` or `\'-\'`.',
    '`IS NULL` can\'t see those, because to the database they\'re real values. So a count of the gaps comes out too low.',
    '`NULLIF(x, \'n/a\')` gives NULL when x is \'n/a\', and x otherwise. The stand-in becomes a proper gap.',
    '`COUNT(column)` skips NULLs, so after NULLIF it only counts the real answers.',
    '`COUNT(*)` counts rows, whatever\'s in them.',
  ],
  example: {
    say: 'Here the sign-up dates are counted, with "unknown" turned into a real gap first.',
    code: `SELECT COUNT(*) AS rows,
       COUNT(NULLIF("Signed Up", 'unknown')) AS dates_given
FROM survey;`,
    lines: [
      ["NULLIF(\"Signed Up\", 'unknown')", "unknown becomes NULL; every other date stays."],
      ['COUNT(...)', 'counts only what is left: 26 of the 32.'],
    ],
  },
  brief: {
    story: 'Finance asks how many people told us what they spend.',
    get: [GOT_SURVEY],
    want: ['`rows`: every row', '`given`: the spends that are really there, with n/a turned into NULL first'],
    out: 'One row, two numbers.',
  },
},
'sc-05': {
  explain: [
    'Group by **every** column and count. Any group with more than one row is an exact copy.',
    '`HAVING` filters the groups after they\'re made, the way WHERE filters rows before.',
    'So `HAVING COUNT(*) > 1` keeps only the groups that have copies.',
    'Exports repeat rows more often than you\'d think, when a file gets added twice or someone presses Send twice.',
    'Find them before you count anything else, or every total counts them twice too.',
  ],
  example: {
    say: 'Here HAVING keeps only the cities with more than 40 café days.',
    code: `SELECT city, COUNT(*) AS days
FROM cafe
GROUP BY city
HAVING COUNT(*) > 40;`,
    lines: [
      ['GROUP BY city', 'one group per city.'],
      ['HAVING COUNT(*) > 40', 'only Lagos, with 47 days, passes.'],
    ],
  },
  brief: {
    story: "The survey's response count looks too high. Find out why.",
    get: [GOT_SURVEY],
    want: ['The rows that appear more than once', '`name`, `note` and `copies`', 'Grouped by all six columns'],
    out: 'Two rows, each appearing twice.',
  },
},
'sc-06': {
  explain: [
    '`\'£18.00\'` is text, not a number. `REPLACE(x, \'£\', \'\')` takes the symbol out.',
    '`CAST(x AS REAL)` then turns the text into a number with decimals.',
    'Here\'s the sneaky part: in SQLite, `CAST(\'n/a\' AS REAL)` gives **0**. No error, just a quiet wrong answer.',
    'So turn the stand-ins into NULL first with NULLIF, or every n/a drags the average down.',
    'Build the clean column once in a WITH step, then sum it up from there.',
  ],
  example: {
    say: 'Here four bits of text are cast, to show what goes right and what quietly goes wrong.',
    code: `SELECT CAST('12.50' AS REAL) AS a,
       CAST('n/a' AS REAL) AS b,
       CAST(NULLIF('n/a', 'n/a') AS REAL) AS c,
       REPLACE('£4.50', '£', '') AS d;`,
    lines: [
      ["CAST('n/a' AS REAL)", '0: no error, just a wrong number.'],
      ['NULLIF first', 'gives NULL instead, which averages leave out.'],
      ["REPLACE('£4.50', '£', '')", '4.50, still text until it is cast.'],
    ],
  },
  brief: {
    story: "Finance's average spend looks far too low.",
    get: [GOT_SURVEY],
    want: ['`spend` as a real number: £ removed, n/a NULL', '`given`: how many spends', '`avg_spend`: the average, rounded to 2'],
    out: 'One row, two numbers.',
  },
},
'sc-07': {
  explain: [
    'Five spellings, only two meanings: Yes, y, YES, N and no.',
    'Start by making them look alike with `LOWER(TRIM(x))`.',
    'Then keep just the first letter with `SUBSTR(..., 1, 1)`, and every answer becomes either \'y\' or \'n\'.',
    '`CASE WHEN ... THEN 1 ELSE 0 END` turns that into a 1 or a 0.',
    'Add up the 1s and 0s and you\'ve counted the yeses.',
  ],
  example: {
    say: 'Here the busy days are counted for each drink, with a CASE inside a SUM.',
    code: `SELECT drink,
       SUM(CASE WHEN cups > 40 THEN 1 ELSE 0 END) AS busy_days
FROM cafe
GROUP BY drink;`,
    lines: [
      ['CASE WHEN cups > 40 THEN 1 ELSE 0 END', '1 for a busy day, 0 for the rest.'],
      ['SUM(...)', 'adds the 1s: the busy days for each drink.'],
    ],
  },
  brief: {
    story: 'The newsletter team needs to know how many people said yes.',
    get: [GOT_SURVEY],
    want: ['`subscribed`: every kind of yes', '`not_subscribed`: every kind of no', 'One row'],
    out: 'Two counts that add up to 32.',
  },
},
'sc-08': {
  explain: [
    'SQLite writes dates as text like `\'2024-01-05\'`: year, then month, then day.',
    '`\'05/02/2024\'` is the other way round, day first, from a British form. It means 5 February.',
    '`LIKE \'__/__/____\'` spots that layout. Each `_` stands for exactly one character.',
    'Rebuild it with SUBSTR and `||`: take the year from character 7, the month from 4 and the day from 1, with dashes in between.',
    'A CASE with no ELSE gives NULL for anything that fits neither layout, like \'unknown\'.',
  ],
  example: {
    say: 'Here one day-first date is rebuilt the right way round.',
    code: `SELECT SUBSTR('15/03/2024', 7, 4) || '-' || SUBSTR('15/03/2024', 4, 2) || '-'
       || SUBSTR('15/03/2024', 1, 2) AS iso,
       '15/03/2024' LIKE '__/__/____' AS fits;`,
    lines: [
      ["SUBSTR('15/03/2024', 7, 4)", '2024: four characters from the 7th.'],
      ['the result', '2024-03-15, which sorts and compares properly.'],
      ['fits', '1: it matches the day-first pattern.'],
    ],
  },
  brief: {
    story: 'Marketing wants sign-ups by month, and the dates come in two layouts.',
    get: [GOT_SURVEY],
    want: ['`signed_up` written like 2024-02-05', 'Keep the ones already like that, rebuild the day-first ones', "'unknown' becomes NULL", '`name` (trimmed) beside it'],
    out: 'Two columns, 32 rows.',
  },
},
'sc-09': {
  explain: [
    '`INSTR(text, \'#\')` tells you where the first `#` is, counting from 1. If there isn\'t one, it gives 0.',
    '`SUBSTR(text, start, length)` cuts out a piece.',
    'Work out the start and length from the marks around the piece you want: from just after the #, up to just before the first space.',
    '`CAST(... AS INTEGER)` turns the digits into a whole number.',
    'Now the number can be sorted and joined on, just like an id.',
  ],
  example: {
    say: 'Here a made-up note is searched, and its order number cut out.',
    code: `SELECT INSTR('order #552 ready', '#') AS hash_at,
       SUBSTR('order #552 ready', 8, 3) AS digits;`,
    lines: [
      ["INSTR(..., '#')", 'the # is the 7th character.'],
      ['SUBSTR(..., 8, 3)', 'three characters from the 8th: 552.'],
    ],
  },
  brief: {
    story: "Customer service wants each answer linked to its reference number.",
    get: [GOT_SURVEY],
    want: ['`ref`: the number between the # and the first space, as a whole number', '`name` (trimmed) beside it'],
    out: 'Two columns, 32 rows.',
  },
},
'sc-10': {
  explain: [
    '`SELECT DISTINCT *` gives each different row just once, so the exact copies disappear.',
    '`DISTINCT city, drink` gives each different pair once.',
    'Put it in a subquery and count it: `SELECT COUNT(*) FROM (SELECT DISTINCT * FROM survey)`.',
    'A subquery can also sit right inside SELECT and give one number, so you can line several counts up in one row.',
    'When copies differ very slightly, DISTINCT keeps them both. That\'s when ROW_NUMBER comes in, to keep one per key.',
  ],
  example: {
    say: 'Here the café\'s days are counted, next to its different city and drink pairs.',
    code: `SELECT (SELECT COUNT(*) FROM cafe) AS days,
       (SELECT COUNT(*) FROM (SELECT DISTINCT city, drink FROM cafe)) AS pairs;`,
    lines: [
      ['(SELECT COUNT(*) FROM cafe)', 'every row: 120 days.'],
      ['SELECT DISTINCT city, drink', 'each pair once: 3 cities by 4 drinks, 12.'],
    ],
  },
  brief: {
    story: 'Before the copies are removed, the data lead wants to know how many rows will be left.',
    get: [GOT_SURVEY],
    want: ['`before`: every row', '`after`: the rows left once exact copies are removed', 'One row'],
    out: 'Two numbers.',
  },
},
'sc-11': {
  explain: [
    'A good way to catch bad data: write down the rules every row should follow, then go looking for the rows that break them.',
    'Here the rules are a quantity of at least 1, a rating from 1 to 5, and a delivery on or after the day of the order.',
    'Each rule is a condition. Join them with `OR` in a WHERE, and any row breaking any rule gets caught.',
    'A CASE in the SELECT then names the first rule each row breaks.',
    'A missing rating isn\'t broken, just missing. `NULL NOT BETWEEN 1 AND 5` isn\'t true, so those rows pass.',
  ],
  example: {
    say: 'Here the café days that look odd, with very few cups or a very high price, are listed.',
    code: `SELECT date, cups, price
FROM cafe
WHERE cups < 10 OR price > 5.4;`,
    lines: [
      ['cups < 10 OR price > 5.4', 'either rule is enough to list the day.'],
      ['the result', 'days to look at, not to delete.'],
    ],
  },
  brief: {
    story: 'Some deliveries in the courier\'s log look impossible. The operations lead wants a list.',
    get: [['`courier`, a delivery log:', { order_id: 'the order', qty: 'how many', rating: '1 to 5, or missing', ordered: 'the day ordered', delivered: 'the day delivered' }]],
    want: ['`order_id` and `problem` for each row that breaks a rule', "'no quantity', 'rating out of range' or 'delivered before ordered', the first that applies", 'By order_id'],
    out: 'Four rows.',
  },
},
'sc-12': {
  explain: [
    'Whenever the same fact is stored twice, the two copies should agree. A receipt\'s total ought to match its lines added up.',
    'So rebuild the figure yourself: join the lines to the receipts, group by receipt, and SUM the prices.',
    'HAVING then keeps just the receipts where the two disagree.',
    'When you compare money, allow a tiny gap: `ABS(a - b) > 0.005` rather than `<>`.',
    'Computers store decimals in binary, so two amounts can be a hair apart even when they look exactly the same.',
  ],
  example: {
    say: 'Here\'s that hair-width gap, and the allowance that gets round it.',
    code: `SELECT 0.1 + 0.2 = 0.3 AS exact,
       ABS(0.1 + 0.2 - 0.3) < 0.005 AS close_enough;`,
    lines: [
      ['0.1 + 0.2 = 0.3', '0, false: off by a tiny amount.'],
      ['ABS(...) < 0.005', '1, true: equal to the penny.'],
    ],
  },
  brief: {
    story: "The till's receipt totals and their printed lines don't always agree. The accountant wants the ones that don't.",
    get: [['`receipts` (receipt, total) and `receipt_lines` (receipt, item, price).']],
    want: ['Only the receipts whose total differs from their lines by more than 0.005', '`receipt`, `total` and `from_lines` (rounded to 2)', 'By receipt'],
    out: 'Two receipts.',
  },
},
'sc-13': {
  explain: [
    'An outlier is a value far from the rest. It might be a typo, or something real, like a big catering order.',
    'So flag it, look at it, then decide. Never delete one you haven\'t looked at.',
    'The fair comparison is with its own group. `AVG(revenue) OVER (PARTITION BY city)` puts each city\'s average on every one of its rows.',
    'A window can\'t go in WHERE, so work it out in a WITH, then filter outside.',
  ],
  example: {
    say: 'Here each product sits next to its category\'s average price.',
    code: `SELECT name, category, price,
       ROUND(AVG(price) OVER (PARTITION BY category), 2) AS cat_avg
FROM products
ORDER BY category;`,
    lines: [
      ['PARTITION BY category', "each product gets its own category's average."],
      ['the result', 'the hand grinder at 45 stands out against a kit average of about 25.'],
    ],
  },
  brief: {
    story: "The regional manager asks which days were unusually big, for each branch's own standard.",
    get: [['`cafe`, one row per day: date, city, drink, cups, price, revenue, rating.']],
    want: ["The days whose revenue was more than 1.5 times their own city's average", '`date`, `city`, `revenue` and `city_avg` (rounded to 2)', 'By date'],
    out: 'A list of days, the earliest first.',
  },
},
'sc-14': {
  explain: [
    'Before you trust a table, give it a quick health check, all in one row.',
    'How many rows are there, how much is missing, how many different values, and are any ids repeated?',
    '`SUM(CASE WHEN x IS NULL THEN 1 ELSE 0 END)` counts the gaps in a column.',
    '`COUNT(DISTINCT x)` counts the different values, leaving NULLs out.',
    '`COUNT(*) - COUNT(DISTINCT id)` is how many ids are repeated. Anything above 0 means an id that should be unique isn\'t.',
  ],
  example: {
    say: 'Here\'s a health row for the café table.',
    code: `SELECT COUNT(*) AS rows,
       SUM(CASE WHEN rating IS NULL THEN 1 ELSE 0 END) AS no_rating,
       COUNT(DISTINCT drink) AS drinks
FROM cafe;`,
    lines: [
      ['no_rating', 'the days with no rating: 9.'],
      ['COUNT(DISTINCT drink)', 'four different drinks.'],
    ],
  },
  brief: {
    story: 'A new customer file arrives every month, and the data lead wants a one-row health check.',
    get: [['`customers`:', { customer_id: 'should be unique', name: 'their name', city: 'where they live, or NULL', joined: 'the day they signed up' }]],
    want: ['`rows`', '`no_city`: customers with no city', '`cities`: how many different cities', '`repeated_ids`: rows minus different customer_ids'],
    out: 'One row, four numbers.',
  },
},
'sc-15': {
  explain: [
    '`CREATE VIEW name AS SELECT ...` saves a query under a name. It stores no data of its own. It\'s worked out fresh every time you read it.',
    'Put every fix in one view: copies removed, city tidied, spend a number, subscribed as 1 or 0.',
    'Every report can then read the view, and they\'ll all get the same clean answers.',
    'Build it on `(SELECT DISTINCT * FROM survey)`, so the copies are gone before anything else.',
    'The raw table stays exactly as it arrived, as a record of what was wrong.',
  ],
  example: {
    say: 'Here a small view keeps the dearer products, and is then read like a table.',
    code: `CREATE VIEW dear AS
SELECT name, price
FROM products
WHERE price > 20;

SELECT *
FROM dear
ORDER BY price DESC;`,
    lines: [
      ['CREATE VIEW dear AS', 'names the query; nothing is copied.'],
      ['FROM dear', 'read like any table.'],
    ],
  },
  brief: {
    story: 'Three reports each clean the survey their own way, and they disagree. Make one clean version for all of them.',
    get: [GOT_SURVEY],
    want: ['`clean_survey`, from the distinct rows: `city` (tidied), `spend` (a number, £ gone, n/a NULL), `subscribed` (1 or 0)', 'Then per city: `responses`, `subscribed`, `avg_spend` (rounded to 2), A to Z'],
    out: 'Three rows, one per city.',
  },
},
};
