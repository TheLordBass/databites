/* Data cleaning practice, c01 to c17. Every one is original.

   They come in families: the same situation in Python, SQL, R and Excel,
   linked by families.js, so a question can be tried again in another
   language ("Also in"). Each is judged the usual way for its language (see
   problems.js for Python and SQL, r.js for R, excel.js for Excel), and every
   one is tagged `cleaning`, which the Practice screen gathers across
   languages. */

const R_STUB = 'solution <- function(df) {\n  \n}\n';

export const CLEANING_PROBLEMS = [

/* ── One name per city (with p05, Python) ───────────────── */
{
  id: 'c01', difficulty: 'medium', lang: 'sql', tags: ['cleaning', 'text', 'group by'],
  title: 'Tidy cities, then total',
  prompt: [
    'You get a table `sales` with columns `city` and `cups`. The cities were typed by hand: stray spaces and random capitals, like `" lagos"` and `"LAGOS"`.',
    'Return one row per city, with `city` tidied (no spaces round it, a capital first letter and the rest lower case) and `cups`, that city\'s total. A to Z by city.',
  ],
  notes: ['Every city is a single word.', 'In SQLite, GROUP BY city means the raw column, even if a result column is also called city.'],
  stub: 'SELECT city, SUM(cups) AS cups\nFROM sales\nGROUP BY city;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2)) AS city, SUM(cups) AS cups
FROM sales
GROUP BY 1
ORDER BY 1
"""

def _example():
    return {"sales": pd.DataFrame({
        "city": [" lagos", "LAGOS", "Accra ", "accra", "Nairobi", "lagos "],
        "cups": [10, 20, 5, 5, 7, 3],
    })}

def _cases():
    return [
        _example(),
        {"sales": pd.DataFrame({"city": ["Lagos", "Accra"], "cups": [4, 6]})},
        {"sales": pd.DataFrame({"city": ["  kIGALI", "kigali  ", "NAIROBI", "nairobi", " Accra "],
                                "cups": [1, 2, 3, 4, 5]})},
    ]
`,
  hint: 'Tidy with `UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2))`, then group by that tidied expression (or by its position, `GROUP BY 1`), not by the raw `city`.',
  solution: 'SELECT UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2)) AS city,\n       SUM(cups) AS cups\nFROM sales\nGROUP BY 1\nORDER BY 1;\n',
  alt: [
    'SELECT UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2)) AS city, SUM(cups) AS cups FROM sales GROUP BY UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2)) ORDER BY 1;\n',
    'WITH t AS (SELECT UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2)) AS c, cups FROM sales)\nSELECT c AS city, SUM(cups) AS cups FROM t GROUP BY c ORDER BY c;\n',
  ],
  wrong: [
    'SELECT UPPER(SUBSTR(TRIM(city), 1, 1)) || LOWER(SUBSTR(TRIM(city), 2)) AS city, SUM(cups) AS cups FROM sales GROUP BY city ORDER BY 1;\n',
    'SELECT TRIM(city) AS city, SUM(cups) AS cups FROM sales GROUP BY TRIM(city) ORDER BY 1;\n',
    'SELECT LOWER(TRIM(city)) AS city, SUM(cups) AS cups FROM sales GROUP BY 1 ORDER BY 1;\n',
  ],
},
{
  id: 'c02', difficulty: 'easy', lang: 'r', tags: ['cleaning', 'text'],
  title: 'Tidy the city names, in R',
  prompt: [
    'The `city` column in `df` has stray spaces and random capitals: `"  lagos"`, `"ACCRA "`.',
    'Return `df` with every city trimmed and written with a capital first letter and the rest lower case (`"Lagos"`). Leave every other column alone and keep the rows in the same order.',
  ],
  notes: ['Every city is a single word.'],
  stub: R_STUB,
  mode: 'frame_ordered',
  setup: `
.ref <- function(df) {
  x <- trimws(df$city)
  df$city <- paste0(toupper(substr(x, 1, 1)), tolower(substring(x, 2)))
  df
}
.example <- function() list(df = data.frame(
  city = c("  lagos", "ACCRA ", "Nairobi", " kigali  "),
  cups = c(47, 18, 52, 30)))
.cases <- function() list(
  .example(),
  list(df = data.frame(city = c("Lagos", "Accra"), cups = c(1, 2))),
  list(df = data.frame(city = c("nAIROBI", "  LAGOS", "accra  "), cups = c(3, 4, 5))))
`,
  hint: '`trimws(df$city)` takes the spaces off. Then `paste0(toupper(substr(x, 1, 1)), tolower(substring(x, 2)))` builds the capital first letter and the lower-case rest.',
  solution: 'solution <- function(df) {\n  x <- trimws(df$city)\n  df$city <- paste0(toupper(substr(x, 1, 1)), tolower(substring(x, 2)))\n  df\n}\n',
  alt: [
    'solution <- function(df) {\n  df |> mutate(city = tools::toTitleCase(tolower(trimws(city))))\n}\n',
  ],
  wrong: [
    'solution <- function(df) {\n  df$city <- trimws(df$city)\n  df\n}\n',
    'solution <- function(df) {\n  x <- trimws(df$city)\n  df$city <- paste0(toupper(substr(x, 1, 1)), substring(x, 2))\n  df\n}\n',
  ],
},
{
  id: 'c03', difficulty: 'easy', lang: 'excel', tags: ['cleaning', 'TRIM', 'PROPER', 'fill down'],
  title: 'Tidy the city names, in Excel',
  xl: { sheet: 'survey', cell: 'G2', fill: true },
  prompt: [
    'The `survey` sheet is open: a customer survey export, rows 2 to 33. Column B is the city, typed with stray spaces and random capitals.',
    'In **G2**, the city with the spaces round it taken off and each word given a capital first letter, like `Lagos`. It is filled down.',
  ],
  stub: '=',
  reference: '=PROPER(TRIM(B2))',
  edge: {
    about: 'The survey sheet with one city typed as "  kIGALI  ".',
    code: 'book["survey"].loc[0, "City "] = "  kIGALI  "\n',
  },
  hint: 'Trim first, then fix the capitals: `PROPER(TRIM(B2))`.',
  solution: '=PROPER(TRIM(B2))',
  alt: ['=TRIM(PROPER(B2))', '=UPPER(LEFT(TRIM(B2),1))&LOWER(MID(TRIM(B2),2,99))'],
  wrong: ['=TRIM(B2)', '=PROPER(B2)', '=UPPER(TRIM(B2))'],
},

/* ── Spend as a number ──────────────────────────────────── */
{
  id: 'c04', difficulty: 'easy', lang: 'python', tags: ['cleaning', 'numbers from text'],
  title: 'Average spend from text',
  prompt: [
    'Given `df` with a `spend` column stored as text: `"12.50"`, `"£18.00"`, `"7"`, and `"n/a"` where someone left it blank.',
    'Return the average spend, rounded to 2 decimal places, as a number. Take the £ out, and leave the n/a answers out of the average.',
  ],
  notes: ['There is always at least one real spend.', 'An n/a is not a spend of 0.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    s = pd.to_numeric(df["spend"].str.replace("£", "", regex=False), errors="coerce")
    return round(float(s.mean()), 2)

def _example():
    return (pd.DataFrame({"name": ["Ada", "Kofi", "Zola", "Ife"],
                          "spend": ["12.50", "£18.00", "n/a", "7"]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"name": ["A", "B"], "spend": ["£4.00", "£6.00"]}),),
        (pd.DataFrame({"name": list("ABCDE"), "spend": ["n/a", "3", "n/a", "£3.50", "10"]}),),
    ]
`,
  hint: '`.str.replace("£", "", regex=False)` takes the symbol out, and `pd.to_numeric(..., errors="coerce")` turns n/a into NaN, which `.mean()` skips.',
  solution: 'def solution(df):\n    spend = pd.to_numeric(df["spend"].str.replace("£", "", regex=False), errors="coerce")\n    return round(float(spend.mean()), 2)\n',
  alt: [
    'def solution(df):\n    s = df["spend"].str.lstrip("£").replace("n/a", np.nan).astype(float)\n    return round(s.mean(), 2)\n',
  ],
  wrong: [
    'def solution(df):\n    return round(float(pd.to_numeric(df["spend"], errors="coerce").mean()), 2)\n',
    'def solution(df):\n    s = pd.to_numeric(df["spend"].str.replace("£", "", regex=False), errors="coerce").fillna(0)\n    return round(float(s.mean()), 2)\n',
  ],
},
{
  id: 'c05', difficulty: 'easy', lang: 'sql', tags: ['cleaning', 'numbers from text', 'NULLIF'],
  title: 'Average spend from text, in SQL',
  prompt: [
    'You get a table `answers` with columns `name` and `spend`. `spend` is text: `"12.50"`, `"£18.00"`, `"7"`, or `"n/a"`.',
    'Return one row with one column, `avg_spend`: the average spend rounded to 2 decimal places, with the £ taken out and the n/a answers left out.',
  ],
  notes: ["In SQLite, CAST('n/a' AS REAL) is 0, not an error."],
  stub: 'SELECT ROUND(AVG(CAST(spend AS REAL)), 2) AS avg_spend\nFROM answers;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT ROUND(AVG(CAST(NULLIF(REPLACE(spend, '£', ''), 'n/a') AS REAL)), 2) AS avg_spend
FROM answers
"""

def _example():
    return {"answers": pd.DataFrame({"name": ["Ada", "Kofi", "Zola", "Ife"],
                                     "spend": ["12.50", "£18.00", "n/a", "7"]})}

def _cases():
    return [
        _example(),
        {"answers": pd.DataFrame({"name": ["A", "B"], "spend": ["£4.00", "£6.00"]})},
        {"answers": pd.DataFrame({"name": list("ABCDE"), "spend": ["n/a", "3", "n/a", "£3.50", "10"]})},
    ]
`,
  hint: "Take the £ out with `REPLACE(spend, '£', '')`, turn n/a into NULL with `NULLIF(..., 'n/a')`, then CAST to REAL and average.",
  solution: "SELECT ROUND(AVG(CAST(NULLIF(REPLACE(spend, '£', ''), 'n/a') AS REAL)), 2) AS avg_spend\nFROM answers;\n",
  alt: [
    "SELECT ROUND(AVG(CAST(REPLACE(spend, '£', '') AS REAL)), 2) AS avg_spend FROM answers WHERE spend <> 'n/a';\n",
  ],
  wrong: [
    "SELECT ROUND(AVG(CAST(REPLACE(spend, '£', '') AS REAL)), 2) AS avg_spend FROM answers;\n",
    "SELECT ROUND(AVG(CAST(NULLIF(spend, 'n/a') AS REAL)), 2) AS avg_spend FROM answers;\n",
  ],
},
{
  id: 'c06', difficulty: 'easy', lang: 'r', tags: ['cleaning', 'numbers from text'],
  title: 'Average spend from text, in R',
  prompt: [
    'Given `df` with a `spend` column stored as text: `"12.50"`, `"£18.00"`, `"7"`, or `"n/a"`.',
    'Return the average spend, rounded to 2 decimal places, as a single number. Take the £ out, and leave the n/a answers out of the average.',
  ],
  notes: ['There is always at least one real spend.'],
  stub: R_STUB,
  mode: 'scalar',
  setup: `
.ref <- function(df) round(mean(suppressWarnings(as.numeric(gsub("£", "", df$spend, fixed = TRUE))), na.rm = TRUE), 2)
.example <- function() list(df = data.frame(name = c("Ada", "Kofi", "Zola", "Ife"),
                                             spend = c("12.50", "£18.00", "n/a", "7")))
.cases <- function() list(
  .example(),
  list(df = data.frame(name = c("A", "B"), spend = c("£4.00", "£6.00"))),
  list(df = data.frame(name = LETTERS[1:5], spend = c("n/a", "3", "n/a", "£3.50", "10"))))
`,
  hint: '`gsub("£", "", df$spend, fixed = TRUE)` takes the £ out, `as.numeric` turns n/a into NA, and `mean(..., na.rm = TRUE)` skips it.',
  solution: 'solution <- function(df) {\n  spend <- suppressWarnings(as.numeric(gsub("£", "", df$spend, fixed = TRUE)))\n  round(mean(spend, na.rm = TRUE), 2)\n}\n',
  alt: [
    'solution <- function(df) {\n  x <- sub("£", "", df$spend, fixed = TRUE)\n  x <- x[x != "n/a"]\n  round(mean(as.numeric(x)), 2)\n}\n',
  ],
  wrong: [
    'solution <- function(df) {\n  round(mean(suppressWarnings(as.numeric(df$spend)), na.rm = TRUE), 2)\n}\n',
    'solution <- function(df) {\n  x <- suppressWarnings(as.numeric(gsub("£", "", df$spend, fixed = TRUE)))\n  x[is.na(x)] <- 0\n  round(mean(x), 2)\n}\n',
  ],
},
{
  id: 'c07', difficulty: 'medium', lang: 'excel', tags: ['cleaning', 'SUBSTITUTE', 'VALUE', 'IFERROR'],
  title: 'Average spend from text, in Excel',
  xl: { sheet: 'survey', cell: 'J2' },
  prompt: [
    'The `survey` sheet is open, rows 2 to 33. Column D is the spend, stored as text: `12.50`, `£18.00`, `7`, or `n/a`.',
    'In **J2**, the average spend rounded to 2 decimal places, with the n/a answers left out.',
  ],
  notes: ['One formula, in J2: no helper column.', 'An n/a is not a spend of 0.', 'Excel here, like Excel on a UK computer, reads £18.00 as a number, so VALUE alone is accepted. Taking the £ out first is what works on any computer.'],
  stub: '=',
  reference: '=ROUND(AVERAGE(IFERROR(VALUE(SUBSTITUTE(D2:D33,"£","")),"")),2)',
  hint: 'Work on the whole range at once: VALUE turns the text into numbers, and IFERROR turns each n/a into "", which AVERAGE skips. Taking the £ out first with `SUBSTITUTE(D2:D33,"£","")` makes it work on any computer. ROUND around it all.',
  solution: '=ROUND(AVERAGE(IFERROR(VALUE(SUBSTITUTE(D2:D33,"£","")),"")),2)',
  alt: ['=ROUND(AVERAGE(IFERROR(--SUBSTITUTE(D2:D33,"£",""),"")),2)', '=ROUND(AVERAGE(IFERROR(VALUE(D2:D33),"")),2)'],
  wrong: [
    '=ROUND(AVERAGE(D2:D33),2)',
    '=ROUND(AVERAGE(IFERROR(VALUE(SUBSTITUTE(D2:D33,"£","")),0)),2)',
  ],
},

/* ── Yes, y, YES ────────────────────────────────────────── */
{
  id: 'c08', difficulty: 'easy', lang: 'python', tags: ['cleaning', 'text', 'counting'],
  title: 'Every kind of yes',
  prompt: [
    'Given `df` with a `subscribed` column typed by hand: `"Yes"`, `"y"`, `"YES"`, `" yes "`, `"N"`, `"no"`, `"nope"`.',
    'Return how many rows are some kind of yes, as a whole number: any answer whose first letter, once spaces are trimmed, is a y.',
  ],
  stub: 'def solution(df):\n    pass\n',
  mode: 'scalar',
  setup: `
def _ref(df):
    return int((df["subscribed"].str.strip().str.lower().str[0] == "y").sum())

def _example():
    return (pd.DataFrame({"subscribed": ["Yes", "y", "N", "no", "YES", " yes ", "nope"]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"subscribed": ["no", "N"]}),),
        (pd.DataFrame({"subscribed": ["Y", "  y", "yes ", "n", "Yeah"]}),),
    ]
`,
  hint: '`.str.strip().str.lower().str[0] == "y"` gives True or False for each row, and `.sum()` counts the Trues. Wrap it in `int(...)`.',
  solution: 'def solution(df):\n    first = df["subscribed"].str.strip().str.lower().str[0]\n    return int((first == "y").sum())\n',
  alt: ['def solution(df):\n    return int(df["subscribed"].str.strip().str.lower().str.startswith("y").sum())\n'],
  wrong: [
    'def solution(df):\n    return int((df["subscribed"].str.lower() == "yes").sum())\n',
    'def solution(df):\n    return int((df["subscribed"].str.lower().str[0] == "y").sum())\n',
  ],
},
{
  id: 'c09', difficulty: 'easy', lang: 'sql', tags: ['cleaning', 'CASE', 'counting'],
  title: 'Every kind of yes, in SQL',
  prompt: [
    'You get a table `answers` with columns `name` and `subscribed`, typed by hand: `Yes`, `y`, `YES`, ` yes `, `N`, `no`.',
    'Return one row with one column, `subscribers`: how many answers are some kind of yes, meaning the first letter, once spaces are trimmed, is a y.',
  ],
  stub: "SELECT COUNT(*) AS subscribers\nFROM answers\nWHERE subscribed = 'Yes';\n",
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT SUM(CASE WHEN SUBSTR(LOWER(TRIM(subscribed)), 1, 1) = 'y' THEN 1 ELSE 0 END) AS subscribers
FROM answers
"""

def _example():
    return {"answers": pd.DataFrame({"name": list("ABCDEF"),
                                     "subscribed": ["Yes", "y", "N", "no", "YES", " yes "]})}

def _cases():
    return [
        _example(),
        {"answers": pd.DataFrame({"name": ["A", "B"], "subscribed": ["no", "N"]})},
        {"answers": pd.DataFrame({"name": list("ABCD"), "subscribed": ["  Y", "yes ", "n", "Yeah"]})},
    ]
`,
  hint: "`SUM(CASE WHEN SUBSTR(LOWER(TRIM(subscribed)), 1, 1) = 'y' THEN 1 ELSE 0 END)`",
  solution: "SELECT SUM(CASE WHEN SUBSTR(LOWER(TRIM(subscribed)), 1, 1) = 'y' THEN 1 ELSE 0 END) AS subscribers\nFROM answers;\n",
  alt: ["SELECT COUNT(*) AS subscribers FROM answers WHERE LOWER(TRIM(subscribed)) LIKE 'y%';\n"],
  wrong: [
    "SELECT COUNT(*) AS subscribers FROM answers WHERE subscribed = 'Yes';\n",
    "SELECT COUNT(*) AS subscribers FROM answers WHERE subscribed LIKE 'y%';\n",
  ],
},
{
  id: 'c10', difficulty: 'medium', lang: 'excel', tags: ['cleaning', 'COUNTIF', 'COUNTA'],
  title: 'Share who said yes',
  xl: { sheet: 'survey', cell: 'J2' },
  prompt: [
    'The `survey` sheet is open, rows 2 to 33. Column E is whether each person subscribed, typed as `Yes`, `y`, `YES`, `N` or `no`.',
    'In **J2**, the percentage of the people who answered who said some kind of yes, rounded to 1 decimal place (so `62.5`, not `0.625`).',
  ],
  notes: ['Someone who left the answer blank did not answer, so they are not part of the percentage.'],
  stub: '=',
  reference: '=ROUND(COUNTIF(E2:E33,"y*")/COUNTA(E2:E33)*100,1)',
  edge: {
    about: 'The survey sheet with one subscribed answer left blank.',
    code: 'book["survey"].loc[0, "Subscribed?"] = None\n',
  },
  hint: 'A wildcard counts every yes: `COUNTIF(E2:E33,"y*")`. Divide by the answers given, `COUNTA(E2:E33)`, which skips blanks. Times 100, rounded to 1.',
  solution: '=ROUND(COUNTIF(E2:E33,"y*")/COUNTA(E2:E33)*100,1)',
  alt: ['=ROUND(100*COUNTIF(E2:E33,"y*")/COUNTA(E2:E33),1)'],
  wrong: [
    '=ROUND(COUNTIF(E2:E33,"y*")/ROWS(E2:E33)*100,1)',
    '=ROUND(COUNTIF(E2:E33,"Yes")/COUNTA(E2:E33)*100,1)',
    '=ROUND(COUNTIF(E2:E33,"y*")/COUNTA(E2:E33),1)',
  ],
},

/* ── Drop the copies ────────────────────────────────────── */
{
  id: 'c11', difficulty: 'easy', lang: 'python', tags: ['cleaning', 'duplicates'],
  title: 'Sent twice',
  prompt: [
    'Given `df`, where some rows were sent twice (or more) by mistake.',
    'Return `df` with the exact copies removed, keeping the first of each, in the original order. Rows that only share a name are not copies.',
  ],
  notes: ['Number the rows afresh (0, 1, 2...) in what you return.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    return df.drop_duplicates().reset_index(drop=True)

def _example():
    return (pd.DataFrame({"name": ["Ada", "Kofi", "Ada", "Ada"],
                          "city": ["Lagos", "Accra", "Lagos", "Nairobi"],
                          "cups": [3, 2, 3, 5]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"name": ["Zola", "Ife"], "city": ["Accra", "Lagos"], "cups": [1, 2]}),),
        (pd.DataFrame({"name": ["Nia", "Tunde", "Nia", "Nia", "Tunde"],
                       "city": ["Lagos", "Accra", "Lagos", "Lagos", "Kigali"],
                       "cups": [4, 6, 4, 4, 6]}),),
    ]
`,
  hint: '`df.drop_duplicates()` keeps the first of each exact copy. Then `.reset_index(drop=True)`.',
  solution: 'def solution(df):\n    return df.drop_duplicates().reset_index(drop=True)\n',
  alt: ['def solution(df):\n    return df[~df.duplicated()].reset_index(drop=True)\n'],
  wrong: [
    'def solution(df):\n    return df.drop_duplicates(subset=["name"]).reset_index(drop=True)\n',
    'def solution(df):\n    return df.drop_duplicates(keep="last").reset_index(drop=True)\n',
  ],
},
{
  id: 'c12', difficulty: 'easy', lang: 'sql', tags: ['cleaning', 'duplicates', 'DISTINCT'],
  title: 'Sent twice, in SQL',
  prompt: [
    'You get a table `signups` with columns `name`, `city` and `joined`. Some rows were sent twice by mistake.',
    'Return every column, with each exact copy appearing only once. Rows that only share a name are not copies.',
  ],
  notes: ['Row order does not matter.'],
  stub: 'SELECT *\nFROM signups;\n',
  mode: 'frame',
  setup: `
_ref_sql = """
SELECT DISTINCT * FROM signups
"""

def _example():
    return {"signups": pd.DataFrame({"name": ["Ada", "Kofi", "Ada", "Ada"],
                                     "city": ["Lagos", "Accra", "Lagos", "Nairobi"],
                                     "joined": ["2024-01-05", "2024-02-01", "2024-01-05", "2024-03-09"]})}

def _cases():
    return [
        _example(),
        {"signups": pd.DataFrame({"name": ["Zola"], "city": ["Accra"], "joined": ["2024-04-04"]})},
        {"signups": pd.DataFrame({"name": ["Nia", "Nia", "Nia", "Tunde"],
                                  "city": ["Lagos", "Lagos", "Lagos", "Accra"],
                                  "joined": ["2024-01-01", "2024-01-01", "2024-01-02", "2024-01-01"]})},
    ]
`,
  hint: '`SELECT DISTINCT *` keeps each different row once.',
  solution: 'SELECT DISTINCT *\nFROM signups;\n',
  alt: ['SELECT name, city, joined FROM signups GROUP BY name, city, joined;\n'],
  wrong: [
    'SELECT * FROM signups;\n',
    'SELECT name, city, joined FROM signups GROUP BY name;\n',
  ],
},
{
  id: 'c13', difficulty: 'easy', lang: 'r', tags: ['cleaning', 'duplicates'],
  title: 'How many were sent twice?',
  prompt: [
    'Given `df`, where some rows were sent more than once by mistake.',
    'Return how many rows are extra copies: rows that exactly repeat an earlier row. A row sent three times has two extra copies. Rows that only share a name are not copies.',
  ],
  stub: R_STUB,
  mode: 'scalar',
  setup: `
.ref <- function(df) sum(duplicated(df))
.example <- function() list(df = data.frame(name = c("Ada", "Kofi", "Ada", "Ada"),
                                             city = c("Lagos", "Accra", "Lagos", "Nairobi"),
                                             cups = c(3, 2, 3, 5)))
.cases <- function() list(
  .example(),
  list(df = data.frame(name = c("Zola", "Zola"), city = c("Accra", "Accra"), cups = c(1, 2))),
  list(df = data.frame(name = c("Nia", "Nia", "Nia", "Tunde"), city = c("Lagos", "Lagos", "Lagos", "Accra"),
                       cups = c(4, 4, 4, 6))))
`,
  hint: '`duplicated(df)` is TRUE for each row that repeats an earlier one, and `sum` counts the TRUEs.',
  solution: 'solution <- function(df) {\n  sum(duplicated(df))\n}\n',
  alt: ['solution <- function(df) {\n  nrow(df) - nrow(distinct(df))\n}\n'],
  wrong: [
    'solution <- function(df) {\n  sum(duplicated(df$name))\n}\n',
    'solution <- function(df) {\n  nrow(df) - length(unique(df$city))\n}\n',
  ],
},

/* ── Day-first dates ────────────────────────────────────── */
{
  id: 'c14', difficulty: 'medium', lang: 'python', tags: ['cleaning', 'dates'],
  title: 'Two date layouts',
  prompt: [
    'Given `df` with a `joined` column of text dates from two systems: year first (`"2024-03-05"`) and day first, British style (`"05/03/2024"`, 5 March). Some say `"unknown"`.',
    'Return `df` with `joined` rewritten as text, year first (`"2024-03-05"`), and missing where it said unknown. Leave the other columns and the row order alone.',
  ],
  notes: ['05/03/2024 is 5 March, not 3 May.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'frame_ordered',
  setup: `
def _ref(df):
    iso = pd.to_datetime(df["joined"], format="%Y-%m-%d", errors="coerce")
    dmy = pd.to_datetime(df["joined"], format="%d/%m/%Y", errors="coerce")
    out = df.copy()
    out["joined"] = iso.fillna(dmy).dt.strftime("%Y-%m-%d")
    return out

def _example():
    return (pd.DataFrame({"name": ["Ada", "Kofi", "Zola", "Ife", "Nia"],
                          "joined": ["2024-03-05", "05/03/2024", "unknown", "2024-12-01", "01/12/2024"]}),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"name": ["A", "B"], "joined": ["2024-01-02", "2024-02-03"]}),),
        (pd.DataFrame({"name": ["A", "B", "C"], "joined": ["13/01/2024", "2024-01-13", "unknown"]}),),
    ]
`,
  hint: 'Read the column twice, once with `format="%Y-%m-%d"` and once with `format="%d/%m/%Y"`, both with `errors="coerce"`. `.fillna` one with the other, then `.dt.strftime("%Y-%m-%d")`.',
  solution: 'def solution(df):\n    iso = pd.to_datetime(df["joined"], format="%Y-%m-%d", errors="coerce")\n    dmy = pd.to_datetime(df["joined"], format="%d/%m/%Y", errors="coerce")\n    out = df.copy()\n    out["joined"] = iso.fillna(dmy).dt.strftime("%Y-%m-%d")\n    return out\n',
  alt: [
    'def solution(df):\n    def fix(t):\n        if "/" in t:\n            d, m, y = t.split("/")\n            return f"{y}-{m}-{d}"\n        return t if t[:2] == "20" else np.nan\n    return df.assign(joined=df["joined"].map(fix))\n',
  ],
  wrong: [
    'def solution(df):\n    out = df.copy()\n    out["joined"] = pd.to_datetime(df["joined"], format="mixed", errors="coerce").dt.strftime("%Y-%m-%d")\n    return out\n',
    'def solution(df):\n    out = df.copy()\n    mdy = pd.to_datetime(df["joined"], format="%m/%d/%Y", errors="coerce")\n    iso = pd.to_datetime(df["joined"], format="%Y-%m-%d", errors="coerce")\n    out["joined"] = iso.fillna(mdy).dt.strftime("%Y-%m-%d")\n    return out\n',
  ],
},
{
  id: 'c15', difficulty: 'hard', lang: 'sql', tags: ['cleaning', 'dates', 'group by'],
  title: 'Sign-ups per month, two layouts',
  prompt: [
    'You get a table `signups` with columns `name` and `joined`: text dates from two systems, year first (`2024-03-05`) and day first (`05/03/2024`, 5 March), and some `unknown`.',
    'Return `month` (like `2024-03`) and `signups`, how many joined that month, in month order. Leave out the unknowns.',
  ],
  notes: ['05/03/2024 is 5 March, not 3 May.'],
  stub: 'SELECT SUBSTR(joined, 1, 7) AS month, COUNT(*) AS signups\nFROM signups\nGROUP BY month\nORDER BY month;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
WITH d AS (
  SELECT CASE WHEN joined LIKE '____-__-__' THEN joined
              WHEN joined LIKE '__/__/____' THEN SUBSTR(joined, 7, 4) || '-' || SUBSTR(joined, 4, 2) || '-' || SUBSTR(joined, 1, 2)
         END AS day
  FROM signups
)
SELECT SUBSTR(day, 1, 7) AS month, COUNT(*) AS signups
FROM d
WHERE day IS NOT NULL
GROUP BY 1
ORDER BY 1
"""

def _example():
    return {"signups": pd.DataFrame({
        "name": list("ABCDEF"),
        "joined": ["2024-03-05", "05/03/2024", "unknown", "2024-01-20", "12/01/2024", "01/12/2024"],
    })}

def _cases():
    return [
        _example(),
        {"signups": pd.DataFrame({"name": ["A", "B"], "joined": ["2024-02-01", "2024-02-28"]})},
        {"signups": pd.DataFrame({"name": list("ABCD"),
                                  "joined": ["03/04/2024", "04/03/2024", "unknown", "2024-04-30"]})},
    ]
`,
  hint: 'Rebuild each date first, in a WITH: keep the year-first ones, and turn `dd/mm/yyyy` into `yyyy-mm-dd` with SUBSTR and `||`. Then group the first 7 characters, leaving out the NULLs.',
  solution: "WITH d AS (\n  SELECT CASE WHEN joined LIKE '____-__-__' THEN joined\n              WHEN joined LIKE '__/__/____'\n                THEN SUBSTR(joined, 7, 4) || '-' || SUBSTR(joined, 4, 2) || '-' || SUBSTR(joined, 1, 2)\n         END AS day\n  FROM signups\n)\nSELECT SUBSTR(day, 1, 7) AS month, COUNT(*) AS signups\nFROM d\nWHERE day IS NOT NULL\nGROUP BY month\nORDER BY month;\n",
  alt: [
    "SELECT CASE WHEN joined LIKE '__/__/____' THEN SUBSTR(joined, 7, 4) || '-' || SUBSTR(joined, 4, 2) ELSE SUBSTR(joined, 1, 7) END AS month, COUNT(*) AS signups FROM signups WHERE joined <> 'unknown' GROUP BY 1 ORDER BY 1;\n",
  ],
  wrong: [
    "SELECT SUBSTR(joined, 1, 7) AS month, COUNT(*) AS signups FROM signups WHERE joined <> 'unknown' GROUP BY 1 ORDER BY 1;\n",
    "SELECT CASE WHEN joined LIKE '__/__/____' THEN SUBSTR(joined, 7, 4) || '-' || SUBSTR(joined, 1, 2) ELSE SUBSTR(joined, 1, 7) END AS month, COUNT(*) AS signups FROM signups WHERE joined <> 'unknown' GROUP BY 1 ORDER BY 1;\n",
  ],
},

/* ── Rows that break the rules ──────────────────────────── */
{
  id: 'c16', difficulty: 'medium', lang: 'sql', tags: ['cleaning', 'data quality', 'NULL'],
  title: 'Shifts that break the rules',
  prompt: [
    'You get a table `shifts`: `shift_id`, `barista`, `start_hr`, `end_hr` (hours on a 24-hour clock) and `cups`.',
    'Return `shift_id` for every shift that breaks a rule, smallest first. The rules: the shift ends **after** it starts, cups is **0 or more**, and the barista is named (not NULL, not blank or only spaces).',
  ],
  notes: ['A shift that ends at the hour it starts breaks the first rule.', 'A shift with 0 cups is fine.'],
  stub: 'SELECT shift_id\nFROM shifts\nORDER BY shift_id;\n',
  mode: 'frame_ordered',
  setup: `
_ref_sql = """
SELECT shift_id FROM shifts
WHERE end_hr <= start_hr OR cups < 0 OR barista IS NULL OR TRIM(barista) = ''
ORDER BY shift_id
"""

def _example():
    return {"shifts": pd.DataFrame({
        "shift_id": [1, 2, 3, 4, 5, 6],
        "barista": ["Ada", "Kofi", None, "Zola", "  ", "Ife"],
        "start_hr": [7, 12, 8, 9, 10, 6],
        "end_hr": [12, 12, 14, 15, 16, 11],
        "cups": [40, 10, 30, -2, 25, 0],
    })}

def _cases():
    return [
        _example(),
        {"shifts": pd.DataFrame({"shift_id": [1, 2], "barista": ["Ada", "Kofi"],
                                 "start_hr": [7, 8], "end_hr": [9, 10], "cups": [5, 0]})},
        {"shifts": pd.DataFrame({"shift_id": [9, 4, 7], "barista": ["", "Nia", "Tunde"],
                                 "start_hr": [7, 15, 6], "end_hr": [9, 13, 6], "cups": [1, 2, 3]})},
    ]
`,
  hint: "Join the rules with OR: `end_hr <= start_hr OR cups < 0 OR barista IS NULL OR TRIM(barista) = ''`. A NULL is never equal to '', so it needs its own test.",
  solution: "SELECT shift_id\nFROM shifts\nWHERE end_hr <= start_hr\n   OR cups < 0\n   OR barista IS NULL\n   OR TRIM(barista) = ''\nORDER BY shift_id;\n",
  alt: ["SELECT shift_id FROM shifts WHERE NOT (end_hr > start_hr AND cups >= 0 AND COALESCE(TRIM(barista), '') <> '') ORDER BY shift_id;\n"],
  wrong: [
    "SELECT shift_id FROM shifts WHERE end_hr <= start_hr OR cups < 0 OR TRIM(barista) = '' ORDER BY shift_id;\n",
    "SELECT shift_id FROM shifts WHERE end_hr < start_hr OR cups < 0 OR barista IS NULL OR TRIM(barista) = '' ORDER BY shift_id;\n",
    "SELECT shift_id FROM shifts WHERE end_hr <= start_hr OR cups <= 0 OR barista IS NULL OR TRIM(barista) = '' ORDER BY shift_id;\n",
  ],
},
{
  id: 'c17', difficulty: 'medium', lang: 'python', tags: ['cleaning', 'data quality', 'missing data'],
  title: 'Shifts that break the rules, in pandas',
  prompt: [
    'Given `df` with `shift_id`, `barista`, `start_hr`, `end_hr` (hours on a 24-hour clock) and `cups`.',
    'Return a list of the `shift_id`s that break a rule, smallest first. The rules: the shift ends **after** it starts, cups is **0 or more**, and the barista is named (not missing, not blank or only spaces).',
  ],
  notes: ['A shift that ends at the hour it starts breaks the first rule.', 'A shift with 0 cups is fine.', 'Return a plain list of whole numbers, empty if every shift is fine.'],
  stub: 'def solution(df):\n    pass\n',
  mode: 'list',
  setup: `
def _ref(df):
    bad = ((df["end_hr"] <= df["start_hr"]) | (df["cups"] < 0)
           | (df["barista"].fillna("").str.strip() == ""))
    return sorted(int(x) for x in df.loc[bad, "shift_id"])

def _example():
    return (pd.DataFrame({
        "shift_id": [1, 2, 3, 4, 5, 6],
        "barista": ["Ada", "Kofi", None, "Zola", "  ", "Ife"],
        "start_hr": [7, 12, 8, 9, 10, 6],
        "end_hr": [12, 12, 14, 15, 16, 11],
        "cups": [40, 10, 30, -2, 25, 0],
    }),)

def _cases():
    return [
        _example(),
        (pd.DataFrame({"shift_id": [1, 2], "barista": ["Ada", "Kofi"],
                       "start_hr": [7, 8], "end_hr": [9, 10], "cups": [5, 0]}),),
        (pd.DataFrame({"shift_id": [9, 4, 7], "barista": ["", "Nia", "Tunde"],
                       "start_hr": [7, 15, 6], "end_hr": [9, 13, 6], "cups": [1, 2, 3]}),),
    ]
`,
  hint: 'One True/False column per rule, joined with `|`. For the name, `df["barista"].fillna("").str.strip() == ""` catches missing, blank and spaces at once. Then `sorted(...)` the matching `shift_id`s.',
  solution: 'def solution(df):\n    bad = ((df["end_hr"] <= df["start_hr"])\n           | (df["cups"] < 0)\n           | (df["barista"].fillna("").str.strip() == ""))\n    return sorted(int(x) for x in df.loc[bad, "shift_id"])\n',
  alt: ['def solution(df):\n    ok = (df["end_hr"] > df["start_hr"]) & (df["cups"] >= 0) & df["barista"].notna() & (df["barista"].str.strip() != "")\n    return sorted(df.loc[~ok, "shift_id"].tolist())\n'],
  wrong: [
    'def solution(df):\n    bad = (df["end_hr"] <= df["start_hr"]) | (df["cups"] < 0) | (df["barista"] == "")\n    return sorted(df.loc[bad, "shift_id"].tolist())\n',
    'def solution(df):\n    bad = (df["end_hr"] < df["start_hr"]) | (df["cups"] < 0) | (df["barista"].fillna("").str.strip() == "")\n    return sorted(df.loc[bad, "shift_id"].tolist())\n',
  ],
},
];
