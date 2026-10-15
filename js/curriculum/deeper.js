/* "Go deeper": an optional fold on a lesson, under its three bullets.
   Keyed by lesson id. Each entry has three short parts:
     why      why it works, the idea underneath the syntax
     mistake  the usual mistake, and how to spot it
     work     where it turns up in an analyst's day
   Written for someone who has never coded, like the lessons. tests.html
   checks every key is a real lesson and every part is there. */

export const DEEPER = {

/* ── SQL ───────────────────────────────────────────────── */
'sq-01': {
  why: 'A database only reads the columns you name, so listing them is clearer than `*` and, on a big table, faster too.',
  mistake: 'Leaving `SELECT *` in a finished query. If someone adds a column to the table later, your result changes shape without warning, and whatever reads it can break.',
  work: 'Analysts meet every new table with `SELECT * ... LIMIT 5`, then list the exact columns once they know what they need.',
},
'sq-02': {
  why: 'WHERE is checked one row at a time. Each row either passes the test or is left out, before anything else happens.',
  mistake: "Mixing AND and OR without brackets. `city = 'Lagos' OR city = 'Accra' AND cups > 40` means any Lagos day or a busy Accra day, because AND is worked out first. Brackets make the meaning certain.",
  work: 'Almost every report starts with a WHERE: one region, one month, only completed orders.',
},
'sq-03': {
  why: 'The database finds the rows, then sorts them, and only then counts off the LIMIT. That is why the order of those words matters.',
  mistake: 'LIMIT without ORDER BY. The database may hand back rows in any order it likes, so "the first 5" can change from one run to the next.',
  work: 'Top 10 products, the 5 worst days, the latest 20 orders: ORDER BY plus LIMIT gets them all.',
},
'sq-04': {
  why: 'IN, BETWEEN and LIKE are shorthand. The database turns them back into plain comparisons, so they cost nothing extra and read far better.',
  mistake: "BETWEEN on dates that carry a time. `BETWEEN '2024-01-01' AND '2024-01-31'` misses anything after midnight at the start of the 31st when the column holds times too.",
  work: "Filtering to a list of product codes, a price band, or every email that ends in one company's domain.",
},
'sq-05': {
  why: 'NULL means "unknown", and comparing anything with unknown gives unknown, which WHERE treats as not true. So `= NULL` never matches anything.',
  mistake: "Turning NULLs into 0 without thinking. An unknown rating isn't a rating of 0, and filling it in drags the average down.",
  work: 'Before any analysis, analysts count the NULLs in each important column, because missing data changes what the numbers mean.',
},
'sq-06': {
  why: 'A calculated column is worked out fresh for each row as the query runs. Nothing is stored, so it is always up to date.',
  mistake: 'Losing the decimals: in SQLite and many other databases `45 / 8` is 5. Put a decimal point on one side, like `45 / 8.0`.',
  work: 'Margins, line totals, price per unit: most numbers in a report are worked out from stored columns rather than stored themselves.',
},
'sq-07': {
  why: 'An aggregate reads every row that got past the WHERE and keeps a running result, so it gives one answer however many rows there are.',
  mistake: "Treating `COUNT(column)` and `COUNT(*)` as the same. COUNT(column) skips NULLs, which is right when you mean it and a nasty surprise when you don't.",
  work: 'The headline numbers on a dashboard (total sales, number of orders, average rating) are aggregates like these.',
},
'sq-08': {
  why: 'GROUP BY sorts the rows into piles that share a value, then runs each aggregate once per pile.',
  mistake: "Selecting a column that isn't grouped or aggregated. SQLite lets it through and picks a value from somewhere in the group; most other databases stop with an error.",
  work: 'Sales by region, orders by month, tickets by team: "by" in a question usually means GROUP BY.',
},
'sq-09': {
  why: 'A query is worked out in a fixed order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. HAVING comes after the grouping, so it is the only place that can see group totals.',
  mistake: 'Putting a row condition in HAVING. It may still work, but it filters after all the grouping is done, which is slower and harder to read than WHERE.',
  work: '"Customers who spent over £500" or "products with fewer than 3 sales": any filter on a total.',
},
'sq-10': {
  why: 'CASE is checked from the top for each row and stops at the first WHEN that is true, like a row of if, else-if tests.',
  mistake: "Overlapping rules in the wrong order. `WHEN cups > 20 THEN 'busy' WHEN cups > 40 THEN 'very busy'` never says very busy: the first rule has already caught those rows.",
  work: 'Banding customers by spend, flagging late deliveries, turning codes into readable names. CASE is everywhere in reporting.',
},
'sq-11': {
  why: 'Dates written year, month, day sort and compare correctly as plain text, because the biggest unit comes first. That is why this ISO format is used.',
  mistake: "Comparing dates kept as text in another format, like day/month/year. As text, '05/02/2024' sorts before '12/01/2024', whatever the real dates are.",
  work: 'Most databases have a proper date type. The idea of grouping by a month pulled out of a date is in every monthly report.',
},
'sq-12': {
  why: 'A JOIN tries rows on the left against rows on the right and keeps the pairs where the ON condition is true. Indexes on the id columns make that quick.',
  mistake: 'Joining on the wrong column, or on only part of the key. The query still runs, but rows multiply or vanish, so check the row count before and after every join.',
  work: 'Real data is split across many tables so nothing is stored twice. Almost every useful query joins a few back together.',
},
'sq-13': {
  why: 'A LEFT JOIN keeps every left-hand row and fills in NULLs where nothing matched, so absences become rows you can see and count.',
  mistake: "A condition on the right-hand table in WHERE after a LEFT JOIN. `WHERE ci.country = 'Ghana'` throws away the NULL rows and turns it back into a plain JOIN. Put it in the ON instead.",
  work: 'Reports that must list every product, region or month, including the ones with nothing to show.',
},
'sq-14': {
  why: 'The inner query is a value in its own right. The database works it out, then uses the answer wherever you wrote the brackets.',
  mistake: 'An inner query that gives back more than one row where one value is expected. Use IN for a list, or make sure it can only give one answer.',
  work: '"Days above average", "products priced over the category median": comparing each row with a summary of the whole.',
},
'sq-15': {
  why: 'A WITH step (a CTE, short for common table expression) is a named query that lasts for this one statement, a bit like a variable in a program.',
  mistake: 'Expecting a WITH step to be saved. It disappears when the query ends. Use CREATE TABLE, or a view, if you need it again later.',
  work: 'Long analysis queries are written as a chain of WITH steps, so a colleague can check each one on its own.',
},
'sq-19': {
  why: "Splitting data into tables that each hold one kind of thing means every fact is stored once. Change a customer's city in one place and every order sees it.",
  mistake: 'Starting analysis before knowing what one row of each table is. Most wrong answers come from misreading the grain: what a single row stands for.',
  work: 'The first hours with any new database go like this: counting rows, checking the ids link up, and finding what is missing.',
},
'sq-20': {
  why: 'Each JOIN builds on the result of the one before, so the order you write them follows the path from one table to the next.',
  mistake: 'Leaving out an ON condition. Then every row pairs with every other row, and 150 orders times 281 lines becomes a huge, meaningless table.',
  work: 'Revenue by customer, by product, by city: three or four tables joined is the bread and butter of sales reporting.',
},
'sq-21': {
  why: 'After a join a customer appears once per order, so a plain count counts orders. DISTINCT removes the repeats before counting.',
  mistake: "Reaching for DISTINCT to hide duplicates you don't understand. If a join makes repeats you didn't expect, the join itself is usually wrong.",
  work: '"How many customers bought this month" against "how many orders": mixing the two up is one of the most common reporting errors.',
},
'sq-22': {
  why: 'After a LEFT JOIN, a NULL in the right-hand id can only mean nothing matched, because a real id is never NULL.',
  mistake: 'Testing a right-hand column that can be NULL anyway. Test the id, not a column like city that may be blank even for rows that matched.',
  work: 'Customers who never bought, products never sold, staff with no training record: finding the gaps is a regular request.',
},
'sq-23': {
  why: 'EXISTS stops looking as soon as it finds one matching row, so it answers yes or no without counting everything.',
  mistake: 'NOT IN with a list that can hold a NULL. A single NULL in the list makes NOT IN match nothing at all, silently.',
  work: '"Customers who ordered at least once", "orders with a cancelled item": yes-or-no questions about related rows.',
},
'sq-24': {
  why: 'UNION lines columns up by position, not by name: the first column of each query lands in the same output column.',
  mistake: 'UNION when you meant UNION ALL. UNION removes duplicate rows, so two real sales of the same amount on the same day can turn into one, and nobody notices.',
  work: "Combining this year's and last year's tables, or online and in-store sales kept in different places.",
},
'sq-25': {
  why: 'An average only means something for one kind of thing. Make one row per order first, then average those rows, and you are averaging orders.',
  mistake: 'Averaging at the wrong grain. The average order line and the average order are different numbers, and reports often mix them up.',
  work: 'Average order value, average spend per customer, average tickets per agent: each needs a total first, then the average.',
},
'sq-26': {
  why: 'The CASE turns each row into a 1 or a 0 for the condition, so the SUM of those counts the rows that matched.',
  mistake: 'Writing `100 * cancelled / total` with whole numbers and getting 0. Use `100.0`, so the division keeps its decimals.',
  work: 'Cancellation rates, the share of deliveries on time, a count of each status side by side in one row.',
},
'sq-27': {
  why: 'julianday turns a date into a plain number of days counted from a fixed point long ago, so taking one from another gives the days between them.',
  mistake: "Subtracting the date text directly. '2024-03-01' minus '2024-02-01' doesn't give 29: SQLite reads the text as numbers and gives nonsense.",
  work: 'Days to delivery, time since the last purchase, the length of a subscription.',
},
'sq-30': {
  why: 'CREATE TABLE AS runs the query once and stores the answer, so later queries read the stored rows instead of working them out again.',
  mistake: "Forgetting that a saved table doesn't update. When new orders arrive, `monthly` is out of date until you build it again. A view, made with CREATE VIEW, re-runs every time instead.",
  work: 'Data teams build summary tables like this every night, so dashboards load quickly in the morning.',
},
'sq-16': {
  why: 'A window function sees a group of rows but writes its answer on every row, instead of squashing them the way GROUP BY does.',
  mistake: "Trying `WHERE RANK() ... = 1`. Windows are worked out after WHERE, so the rank doesn't exist yet. Work it out in a WITH step and filter outside.",
  work: 'The top product in each category, the best salesperson in each region, the third-highest score on each test.',
},
'sq-17': {
  why: 'With ORDER BY inside OVER, the window grows row by row: each row sees itself and everything before it.',
  mistake: 'Ties in the ORDER BY. Rows that share a date are added in together, so the running total can jump by two days at once.',
  work: 'Year-to-date sales, cumulative sign-ups, a budget being spent down over the month.',
},
'sq-28': {
  why: 'LAG looks back a set number of rows in the window\'s order (one, unless you say otherwise) without any self-join.',
  mistake: 'Leaving out PARTITION BY. Without it, the "previous order" can belong to a different customer.',
  work: 'The change since last month, days between visits, spotting when a value suddenly jumps.',
},
'sq-29': {
  why: 'An empty `OVER ()` makes the window every row, so the grand total sits on each row, ready to divide by.',
  mistake: 'Dividing two whole numbers again. Use `100.0`, or every share smaller than the whole comes out as 0.',
  work: "Each region's share of sales, each product's share of returns, market share tables.",
},
'sq-18': {
  why: 'SQL and pandas are good at different things: databases filter and join huge tables quickly, and Python charts and models well. read_sql hands the result across as a DataFrame.',
  mistake: 'Pulling a whole table into pandas and filtering it there. Let the database do the WHERE and GROUP BY, and bring back only what you need.',
  work: 'A very common setup: SQL to fetch and shape the data, Python for the analysis and charts.',
},
'sq-31': {
  why: "INSERT adds a new row. Naming the columns matches each value to its column by name, whatever order the table's columns are in.",
  mistake: 'Leaving out the column list. If someone adds a column to the table later, the INSERT breaks, or worse, puts values in the wrong place.',
  work: 'Analysts rarely insert by hand, but INSERT turns up in scripts that load data, and in small test tables for checking a query.',
},
'sq-32': {
  why: 'UPDATE changes the values in place, all at once, for every row the WHERE matches.',
  mistake: 'An UPDATE with no WHERE, or the wrong one. Run the same WHERE as a SELECT first, to see exactly which rows will change.',
  work: 'Fixing a mistyped category, applying a price rise, marking records as checked.',
},
'sq-33': {
  why: "DELETE removes every row the WHERE matches, for good, unless it's inside a transaction that can be rolled back.",
  mistake: 'Deleting from one table and leaving matching rows in another, like order lines for orders that no longer exist.',
  work: "Many companies never really delete. They add a column like `is_deleted` and filter on it, so the history isn't lost.",
},
'sq-34': {
  why: "Text functions work on each row's value, so one expression can tidy thousands of names at once.",
  mistake: 'Joining text to a NULL and getting NULL for the whole thing. Wrap anything that might be missing in COALESCE first.',
  work: 'Building labels for reports, tidying names and codes before a join, splitting codes into their parts.',
},
'sq-35': {
  why: 'ROW_NUMBER gives every row in a group a different number, even when values tie, so keeping number 1 always leaves exactly one row.',
  mistake: 'Not breaking ties. When two orders share a date, which one is "latest" is up to the database unless you add another column to the ORDER BY.',
  work: "The latest status of each ticket, each customer's most recent address, removing duplicate records.",
},
'sq-36': {
  why: 'Each WITH step can read the ones above it, so a long query becomes a pipeline you read from top to bottom.',
  mistake: 'Cramming too much into one step. If a step needs a long comment to explain it, split it into two named steps instead.',
  work: 'Analysts write reports as chains of steps (clean, summarise, compare), and run each step alone to check it.',
},
'sq-37': {
  why: 'The two copies are just two names for the same rows, so the join can compare any row with any other row in the same table.',
  mistake: 'Leaving out `a.product_id < b.product_id`. Every pair then turns up twice, and each product is paired with itself.',
  work: '"Bought together" suggestions, finding duplicate customers, and comparing each employee with their manager, who lives in the same table.',
},
'sq-38': {
  why: 'The ROWS frame tells the window exactly which rows to use, counted from the current one, so the average slides along one row at a time.',
  mistake: 'Using it when days are missing. ROWS counts rows, not days, so if some dates have no row, "6 preceding" reaches back more than a week.',
  work: '7-day averages are everywhere: website visits, sales, sign-ups, anything that jumps about from one day to the next.',
},
'sq-39': {
  why: 'NTILE counts the rows, divides by the number of groups, and deals them out in order, so each group gets nearly the same number of rows.',
  mistake: 'Reading quartiles as equal amounts of money. Each quarter has the same number of customers, but the top quarter usually holds far more of the spend.',
  work: 'Segments like "top 25% of customers", performance bands for stores, and deciles with `NTILE(10)`.',
},
'sq-40': {
  why: 'EXCEPT compares whole rows: the two queries are lined up column by column, and anything found in the second is taken out of the first.',
  mistake: 'Columns in a different order. EXCEPT matches by position, so `SELECT id, city` against `SELECT city, id` compares ids with cities and finds nothing in common.',
  work: 'Lapsed customers, products dropped from the range, staff in one system but missing from another: a quick way to reconcile two lists.',
},
'sq-41': {
  why: 'NULLIF swaps a zero for NULL before the division happens, and any sum with NULL in it gives NULL instead of an error.',
  mistake: "Covering the blank with `COALESCE(..., 0)`. A product that never sold doesn't have an average of 0. It has no average, and a 0 would drag down any summary of them.",
  work: 'Conversion rates, cost per unit, growth rates: any ratio where the bottom can be zero for some rows.',
},
'sq-42': {
  why: 'A recursive WITH starts from one row, then keeps running its second half on the row it has just made, until the WHERE stops it.',
  mistake: "Forgetting the stop. Without `WHERE day < '2024-01-31'` the list never ends, and the query runs until something breaks it off.",
  work: 'Calendars for charts and reports, so a quiet day shows as 0 instead of vanishing. Many companies keep a ready-made date table for exactly this.',
},
'sq-43': {
  why: "MIN works on the month text because 'YYYY-MM' sorts in date order, so the smallest one is the earliest.",
  mistake: 'Using the date they joined instead of their first purchase. Signing up and buying are different moments, and cohorts usually mean the first purchase.',
  work: 'Cohort tables are how subscription businesses, apps and shops judge whether they keep their customers.',
},
'sq-44': {
  why: 'The inner query runs once for each customer, looking for any order after their first month. EXISTS turns "found one" into a yes.',
  mistake: 'Comparing young cohorts with old ones. A cohort that started in April has had far less time to come back than one from January.',
  work: 'Retention by cohort is a headline number in board reports for subscription and online businesses.',
},
'sq-45': {
  why: 'Numbering the sorted rows lets you pick the middle one by its position, which is all a median is.',
  mistake: 'Quoting an average for money or times, which are often lopsided. A few huge orders lift the average well above what a typical customer spends; the median shows the typical one.',
  work: 'Median salary, median delivery time, median house price: the median is the honest "typical" for lopsided numbers.',
},

/* ── pandas ────────────────────────────────────────────── */
'pd-01': {
  why: 'A DataFrame is a set of columns that share one index, the row labels down the left. Each column holds one kind of value, which is what makes maths on a whole column fast.',
  mistake: 'Lists of different lengths in the dict. Every column needs the same number of values, or pandas stops with an error about lengths.',
  work: 'Analysts build small tables by hand to try out an idea or a calculation before running it on the real data.',
},
'pd-02': {
  why: '`.head()` and `.shape` only look. They never change the table, so they are safe to run as often as you like.',
  mistake: 'Trusting the first five rows to stand for the whole table. Problems often hide further down, which is why counts and missing values come next.',
  work: 'The first minutes with any new dataset: its size, the column names, a few rows, then the gaps.',
},
'pd-03': {
  why: "A Series is one column with the table's row labels still attached, so it lines up correctly with other columns when you combine them.",
  mistake: "The dot shortcut on a column whose name clashes with a method, like a column called `count`. `cafe.count` is the method, not your column; square brackets always work.",
  work: 'Nearly every calculation starts by picking out a column: total revenue, the average rating, the biggest order.',
},
'pd-04': {
  why: 'describe works out several summaries in one go, and value_counts groups identical values and counts them, biggest first.',
  mistake: 'Reading the mean without the spread. Two cities can share an average while one is steady and the other swings wildly; std and the quarter points show it.',
  work: 'value_counts is often the first question asked of any column: which values are there, and how common is each?',
},
'pd-05': {
  why: 'A mask is a column of True and False with the same row labels as the table, so pandas keeps exactly the rows labelled True.',
  mistake: 'Filtering, then changing the smaller table, which can set off a SettingWithCopyWarning. Add `.copy()` after the filter if you mean to edit the result.',
  work: 'Every analysis narrows the data first: one region, one month, valid orders only.',
},
'pd-06': {
  why: "`&` and `|` work row by row down two columns of True and False. Python's `and` and `or` want a single True or False, which a whole column isn't.",
  mistake: 'Leaving out the brackets. `cafe["price"] < 3 & cafe["cups"] > 40` works out `3 & cafe["cups"]` first, and gives an error or the wrong rows.',
  work: 'Real filters usually have several parts: this region, this month, and not cancelled.',
},
'pd-07': {
  why: 'Maths on a column happens for every row at once inside numpy, which is far faster than going through the rows one by one.',
  mistake: 'Rounding too early. Round for display at the end; rounding mid-calculation adds small errors that grow when thousands of rows are added up.',
  work: 'Margins, totals, flags and categories are all new columns built from the ones already there.',
},
'pd-08': {
  why: 'sort_values gives back a new, sorted table and leaves the original alone, so you can sort different ways without losing anything.',
  mistake: "Expecting `cafe.sort_values(...)` on its own line to change cafe. It doesn't. Store the result: `cafe = cafe.sort_values(...)`.",
  work: 'Top-10 lists, worst performers, the latest records: sorting is in almost every report.',
},
'pd-09': {
  why: 'groupby works in three moves, often called split-apply-combine: split the rows into groups, apply a summary to each, and combine the answers into one table.',
  mistake: 'Grouping without choosing a column. `cafe.groupby("city").mean()` tries to average every column, and the text columns get in the way.',
  work: '"Sales by region", "tickets per agent", "average spend per customer": most business questions are a groupby.',
},
'pd-10': {
  why: 'Named aggregation pairs each new column name with a (column, summary) choice, so the result has exactly the columns you asked for.',
  mistake: 'Two-level column names from `.agg(["sum", "mean"])` on several columns, which are awkward to use afterwards. Named aggregation avoids them.',
  work: 'Summary tables in reports usually show a count, a total and an average side by side.',
},
'pd-11': {
  why: "NaN is a special value meaning missing, and most pandas summaries skip it on their own. That is helpful only if you know it's happening.",
  mistake: 'Dropping every row with any gap. `dropna()` throws away a whole row even when only one unimportant column is missing; `subset=[...]` chooses the columns that matter.',
  work: 'Counting the gaps, and deciding what to do about them, is a standard first step in every analysis.',
},
'pd-12': {
  why: 'Real date values know about the calendar, so pandas can pull out months, weekdays and quarters, and work out the time between dates.',
  mistake: 'Dates left as text. `.dt` only works on real dates, so convert with `pd.to_datetime` first.',
  work: 'Weekly and monthly trends, seasons and day-of-week patterns all start from parts of a date.',
},
'pd-13': {
  why: 'pivot_table is a groupby on two columns, with one of them spread out across the top.',
  mistake: 'Forgetting that it averages unless told otherwise. For totals, say `aggfunc="sum"`.',
  work: 'The classic management table, such as region by month or product by store, is a pivot.',
},
'pd-14': {
  why: 'loc uses the labels pandas keeps on rows and columns. iloc ignores labels and counts positions, like a list.',
  mistake: 'Using loc after filtering or sorting and expecting positions. Labels travel with their rows, so `.loc[0]` might not be the first row any more.',
  work: 'Picking out one value to quote, fixing a single wrong cell, or taking the first few rows by position.',
},
'pd-15': {
  why: 'Both are shortcuts that build a True/False mask, so they plug into `cafe[...]` like any other condition.',
  mistake: "Expecting `between` on dates with times to take in the whole last day. Like SQL's BETWEEN, it stops at midnight at the start of that day.",
  work: 'Filtering to a list of products, a price band or a range of dates.',
},
'pd-16': {
  why: 'Both give back a new table and leave the original as it was, which keeps your earlier steps safe.',
  mistake: 'Renaming without saving the result, then wondering why the old name is still there. Store it: `cafe = cafe.rename(...)`.',
  work: 'Tidying column names before sharing a table, and dropping the columns nobody needs.',
},
'pd-17': {
  why: 'map calls your function once for each value and collects the answers, so you can apply any rule you can write down.',
  mistake: 'Using apply for things pandas can already do to whole columns. Calling a function row by row is much slower than `cafe["cups"] * 2` or `np.where`.',
  work: 'Business rules that need their own logic: categorising products, cleaning odd values, tagging records.',
},
'pd-18': {
  why: '.str runs the text method on every value at once, and skips missing values instead of failing on them.',
  mistake: 'Forgetting case and spaces. "Lagos", "lagos" and "Lagos " are three different values until you strip and lower them.',
  work: 'Cleaning names, finding keywords in comments, pulling codes out of longer text.',
},
'pd-19': {
  why: 'cut uses the edges you choose. qcut chooses them for you, so that each band holds the same number of rows.',
  mistake: 'A value outside every band, or exactly on the bottom edge, becomes NaN. Check your edges cover the smallest and largest values.',
  work: 'Age bands, spend tiers, delivery-time buckets: turning a number into a few groups people can compare.',
},
'pd-20': {
  why: "read_csv reads the text, guesses each column's type, and builds the table. That guessing is why it's worth checking the result.",
  mistake: 'Not checking the types after loading. Dates arrive as text, and numbers with symbols like £ arrive as text, until you tell pandas otherwise.',
  work: 'Most data still arrives as CSV exports from other systems, so read_csv is often the first line of an analysis.',
},
'pd-21': {
  why: "query reads the condition as text and works it out against the table's columns, which saves writing `cafe[...]` again and again.",
  mistake: "Column names with spaces. query can't read them as they are: wrap the name in backticks (the key next to 1 on most keyboards), or rename the column first.",
  work: 'Long filters with several parts are easier to read, and to change, written as query text.',
},
'pd-22': {
  why: 'Each step gives back a new table, so the next method can be called straight on it, top to bottom.',
  mistake: 'A chain too long to find mistakes in. When one gives a wrong answer, comment out steps from the bottom up until you find the one that goes wrong.',
  work: 'Readable chains of steps are how many analysts write cleaning code that others can review.',
},
'pd-23': {
  why: 'np.where works on whole columns at once, taking the second or third value row by row depending on the question.',
  mistake: 'np.where nested three deep for several categories. It works, but is hard to read; `pd.cut` or `np.select` is clearer.',
  work: 'Flags like "late" or "on time", "new" or "returning", "over budget" or "under".',
},
'pd-24': {
  why: 'cumsum keeps a running total as it goes down the rows, and rank works out where each value would sit if they were sorted.',
  mistake: 'A running total on unsorted data. cumsum follows the row order, so sort by date first or "the total so far" means nothing.',
  work: 'Year-to-date figures, league tables and percentiles.',
},
'pd-25': {
  why: 'normalize=True divides every count by the total, so the shares always add up to 1.',
  mistake: 'Comparing raw counts between groups of different sizes. 30 cancellations is a lot out of 100 orders and very few out of 10,000; shares make them comparable.',
  work: 'Mix reports: the share of orders by status, by channel, by region.',
},
'pd-26': {
  why: '`groupby(...).head(n)` keeps the first n rows of each group in their current order, so sorting first decides what "first" means.',
  mistake: 'Sorting after the groupby instead of before. Then head keeps whichever rows happened to come first, not the biggest.',
  work: 'Top products per category, best agents per team, the three busiest days per store.',
},
'pd-27': {
  why: 'filter runs your test once per group and keeps every row of the groups that pass, so the table keeps its original rows and columns.',
  mistake: "Testing the wrong thing in the lambda. `g` is the whole group's table, so `len(g)` counts its rows and `g[\"cups\"].mean()` averages one of its columns.",
  work: 'Leaving out customers with too few orders before studying behaviour, or keeping only stores open all year.',
},
'pd-28': {
  why: 'cumcount counts how many rows of the same group came before each row, which is the same as numbering them from 0.',
  mistake: 'Forgetting to sort by date first. The numbers follow the current row order, so "first order" would only mean "first row in the table".',
  work: 'Telling first-time from repeat buyers, finding the second purchase, seeing how behaviour changes with each visit.',
},
'pd-29': {
  why: "diff takes each value away from the one before it, and grouping first makes \"before\" mean the same customer's previous order.",
  mistake: 'Averaging the gaps without noticing who is left out. Customers with a single order have no gap at all, so the average describes repeat buyers only.',
  work: 'The time between purchases decides when to send a reminder, and helps spot customers drifting away.',
},
'pd-30': {
  why: 'A MultiIndex keeps both keys on each row, so pandas can pick by the outer key, the inner one, or both together.',
  mistake: "Fighting a MultiIndex you don't need. `.reset_index()` turns the levels back into ordinary columns, which are often easier to filter and join.",
  work: 'Anything grouped by two things, like region and month or store and product, comes out with a MultiIndex.',
},
'pd-31': {
  why: 'margins runs the same summary again with each grouping taken away, so the totals come from the raw data, not from the rounded cells.',
  mistake: "Reading a margin as a total when aggfunc is \"mean\". Then the edge is the overall average, not a sum.",
  work: 'Almost every pivot shared with managers has grand totals along the edges.',
},
'pd-32': {
  why: 'An ordered Categorical stores the allowed values and their order, so sorting and grouping use that order instead of the alphabet.',
  mistake: "A typo in the categories list. A value that isn't in the list silently becomes NaN, so check for missing values after converting.",
  work: 'Weekdays, months, sizes, satisfaction ratings and priorities all have a natural order that tables and charts should follow.',
},
'pd-33': {
  why: 'explode repeats the row once for each item in the list, so every item gets its own row, with the rest of the row copied alongside.',
  mistake: 'Exploding text. explode only splits lists, so "latte, scone" must become a list with `.str.split(", ")` first.',
  work: 'Tags, the products in an order, multiple-choice survey answers: anything exported as several values in one cell.',
},
'pd-34': {
  why: '`groupby(...).rank()` ranks each value only against the others in its own group, then puts the ranks back on the original rows.',
  mistake: 'Not choosing how ties are ranked. By default tied values share the average of their places, like 1.5; `method="min"` gives 1, 1, 3 and `method="dense"` gives 1, 1, 2.',
  work: 'The best day per store, the top product per category, ranking agents within each team.',
},
'pd-35': {
  why: "transform(\"min\") works out each customer's earliest month and writes it back on every one of their rows, ready to group by.",
  mistake: 'Comparing cohorts by their raw counts. Earlier cohorts have had more months to buy again, so compare them the same number of months after they started.',
  work: 'Cohort grids are a standard retention report in online shops, apps and subscription businesses.',
},

/* ── DAX ───────────────────────────────────────────────── */
'dx-01': {
  why: 'A measure is a recipe, not a stored number. Power BI works it out again for every cell, using whatever filters that cell has.',
  mistake: "Making a new column when a measure would do. Columns are stored row by row and don't change with the filters; totals and ratios belong in measures.",
  work: 'Every number on a Power BI page, from a single card to a chart, is usually a measure.',
},
'dx-02': {
  why: 'SUMX is an iterator: it visits each row of the table, works out the expression there, then adds up all the answers.',
  mistake: "`SUM(qty) * AVERAGE(price)`. Multiplying two totals isn't the same as adding up qty × price line by line, and gives the wrong revenue.",
  work: 'Revenue, cost and margin measures are almost always a SUMX over the sales lines.',
},
'dx-03': {
  why: 'A measure in square brackets is worked out with the same filters as the cell it sits in, so measures stack together cleanly.',
  mistake: 'Writing `/` instead of DIVIDE. A zero on the bottom then shows an error or infinity in the report instead of a clean blank.',
  work: 'Good models have a few base measures, like Sales and Orders, and build everything else from them.',
},
'dx-04': {
  why: 'COUNTROWS counts the rows of a table. DISTINCTCOUNT counts the different values in a column, so a repeat customer counts once.',
  mistake: "Adding up distinct counts across months. 20 customers in January and 20 in February isn't 40 customers if many bought in both.",
  work: 'Active customers, unique visitors, products sold: "how many different" questions are everywhere.',
},
'dx-05': {
  why: 'Relationships carry filters from the lookup tables to the tables of events, one way. That one-way flow keeps the numbers predictable.',
  mistake: "Expecting a filter on an event table to reach a lookup table. A product filter reaches order_items but not orders, so order counts don't change by product.",
  work: 'Knowing which way filters flow is the most common fix when a Power BI number won\'t change after you click something.',
},
'dx-06': {
  why: "CALCULATE builds a new set of filters, the cell's own with yours added or swapped in, then works the measure out under them.",
  mistake: 'Testing a measure directly as a CALCULATE filter, like `CALCULATE([Sales], [Orders] > 5)`. Filters there must be on columns; a measure test needs FILTER.',
  work: "Sales for one region, last year's numbers, completed orders only: nearly every advanced measure is a CALCULATE.",
},
'dx-07': {
  why: 'A CALCULATE filter on a column overwrites any filter already on that same column, unless KEEPFILTERS asks it to combine them.',
  mistake: "Not noticing the overwrite. A Beans Sales measure that shows the same number on every category row is CALCULATE replacing the row's own filter.",
  work: 'Measures that should respect what someone picked in a slicer often need KEEPFILTERS.',
},
'dx-08': {
  why: 'ALL takes filters away inside CALCULATE, so the measure sees the whole table whatever the row says.',
  mistake: 'ALL on the wrong thing. `ALL(products)` clears every product filter, category included; `ALL(products[name])` clears only the name.',
  work: 'Percent of total, share of category, contribution to growth.',
},
'dx-09': {
  why: 'The filter lands on orders, and the relationship carries it on to order_items, so only the lines of orders that went through are added up.',
  mistake: 'Changing what Sales means without telling anyone. Keep a plain base measure and a clearly named filtered one, so nobody mixes them up in a report.',
  work: 'Net sales, completed orders only, test accounts left out: business rules usually live in measures like this.',
},
'dx-10': {
  why: 'FILTER visits each row and keeps it when the test is true. Using a measure in the test turns each row into a filter first: context transition.',
  mistake: 'FILTER over a big table when a single column would do. `FILTER(order_items, ...)` visits every line; `FILTER(VALUES(customers[customer_id]), ...)` visits each customer once.',
  work: 'Counting customers over a spend threshold, products running low, stores missing their targets.',
},
'dx-11': {
  why: 'AVERAGEX works out the measure for each customer, then averages those answers, leaving out the customers whose answer is blank.',
  mistake: 'Not saying which average. Average per buying customer and average per customer on the books are both right, as answers to different questions.',
  work: 'Average spend per customer, average orders per store, average basket per visit.',
},
'dx-12': {
  why: 'A VAR is worked out once, where it is written, and keeps that value even when the filters change later in the measure.',
  mistake: 'Expecting a VAR to change inside a later CALCULATE. Once stored, its value is fixed; that is useful, as the running share lesson shows.',
  work: "Long measures are written with VARs so each step can be checked, and so nothing is worked out twice.",
},
'dx-13': {
  why: "RANKX works out the measure for every item in the list, sorts the answers, and gives the current item's place.",
  mistake: "Ranking against VALUES instead of ALL. VALUES holds only the row's own product, so everything comes out 1.",
  work: 'Top-N tables, league tables of stores or agents, picking out the best sellers.',
},
'dx-14': {
  why: 'TOTALYTD is CALCULATE with a ready-made filter: every date from 1 January up to the last date showing.',
  mistake: 'A date table with gaps. Time intelligence needs every date, no gaps, in a table marked as the date table.',
  work: 'Year-to-date sales is one of the most common numbers in any finance or sales report.',
},
'dx-15': {
  why: 'DATEADD shifts the dates in the filter by a set amount, so the measure is worked out for the same length of time, earlier.',
  mistake: "Growth on a month with nothing before it. If last month had no sales, growth can't be worked out, and DIVIDE rightly gives a blank, not 100% or an error.",
  work: 'Month-on-month and year-on-year growth are headline numbers in most business reports.',
},
'dx-16': {
  why: 'BLANK means there was nothing to work out. Power BI hides rows where every measure is blank, which keeps tables short.',
  mistake: "Turning every blank into 0. Then every product and month appears, including ones that never had anything, and the table fills up with zeros.",
  work: 'Blank or 0 is a real design choice: blank for "nothing happened", 0 when people need to see the zero.',
},
'dx-17': {
  why: '`SWITCH(TRUE(), ...)` checks each test in order and gives back the first one that is true, like CASE WHEN in SQL.',
  mistake: 'Thresholds in the wrong order. Test the biggest first, or the first test catches everything above it.',
  work: 'Banding customers, rating performance red, amber or green, labelling sizes.',
},
'dx-18': {
  why: 'SELECTEDVALUE gives the one value showing for a column, or blank (or your fallback) when several are showing.',
  mistake: 'Using it where several values can show. On a total, or when someone picks two items, it falls back, so always give a sensible fallback.',
  work: 'Titles that follow the filters, like "Sales for Lagos", and measures that change with what was picked.',
},
'dx-19': {
  why: 'HASONEVALUE checks whether the filters leave exactly one value of a column: true on detail rows, false on totals.',
  mistake: 'Hiding totals that do mean something. A sum of sales should total; only things like prices, rates and ranks need hiding.',
  work: 'Keeping report totals honest: no summed prices and no totals of averages.',
},
'dx-20': {
  why: 'CONCATENATEX visits each row of a table, writes some text for it, and joins it all up with your separator.',
  mistake: 'Lists that grow huge on the totals. Limit them, with TOPN for example, or hide them on the total row.',
  work: 'Tooltips listing what was in an order, labels like "top sellers: X, Y, Z".',
},
'dx-21': {
  why: 'A measure name is always wrapped in a hidden CALCULATE, which turns the current row into a filter. A formula typed out in full has no such wrapper.',
  mistake: "Pasting the SUMX formula where the measure should go, inside an iterator. Every row then sees the whole table's total.",
  work: "Understanding context transition is what lets people fix DAX that gives strange numbers, rather than guess.",
},
'dx-22': {
  why: "ALL removes the product name filter; `VALUES(products[category])` then puts the row's own category back, leaving the category's total.",
  mistake: "`ALL(products)` instead of `ALL(products[name])`. That clears the category too, and you're back to the grand total.",
  work: 'Share within category, within region, within month: the "share of its own group" pattern.',
},
'dx-23': {
  why: 'TOPN gives back a small table of the leading items for the current filters, and CALCULATE then uses that table as a filter.',
  mistake: "Expecting TOPN to sort. It gives the top items in no particular order; sorting is the visual's job.",
  work: "The top 5 customers' share of sales, sales of the top three products, how concentrated sales are.",
},
'dx-24': {
  why: 'DATESINPERIOD builds a list of dates ending at the date you give and reaching back as far as you ask, and CALCULATE uses it as the date filter.',
  mistake: 'Anchoring the window on TODAY() instead of the dates showing. The window should move with the row, which `MAX(calendar[date])` does.',
  work: 'Rolling 3- and 12-month totals smooth out the seasons in trend reports.',
},
'dx-25': {
  why: 'A shared lookup table filters every table of events related to it, so one slicer, or one row, can split several kinds of data at once.',
  mistake: 'Linking event tables straight to each other. Connect each one to the shared lookup tables instead, so filters flow cleanly.',
  work: 'Budget beside actuals, or web beside store sales, in one report through shared date and region tables.',
},
'dx-26': {
  why: 'AVERAGEX makes each month the filter in turn, works out [Sales] for that month, then averages the answers.',
  mistake: 'Dividing by 12, or by the number of months in the calendar. Months with no data then drag the average down; AVERAGEX skips those blanks.',
  work: 'Average monthly sales, average daily orders, the typical week: averages over periods of time.',
},
'dx-27': {
  why: 'MAXX works out the measure for each month and keeps only the largest answer.',
  mistake: "Expecting the month's name back. MAXX gives the value; to show which month it was, use TOPN, as in the best seller lesson.",
  work: 'The peak month, the best day of the year, record figures for setting targets.',
},
'dx-28': {
  why: 'FILTER makes each day the filter in turn, works out [Orders] for it, and keeps the days that pass the test.',
  mistake: "Counting days from the orders table instead of the calendar. Days with no orders aren't in orders at all, so questions about empty days need the calendar.",
  work: 'Trading days, days over target, days with no sales: counting the periods that pass a test.',
},
'dx-29': {
  why: 'TOPN keeps the leading row for the current filters, and CONCATENATEX turns that one-row table into text.',
  mistake: 'Forgetting ties. Two products with exactly the same sales both come back from TOPN, which is why the separator still matters.',
  work: 'Card visuals that name the top product, region or agent beside the number.',
},
'dx-30': {
  why: 'Inside FILTER, CALCULATE turns the current customer into a filter, which flows on to orders and counts just their orders.',
  mistake: 'Leaving out CALCULATE. Then `COUNTROWS(orders)` counts every order for every customer, and nobody seems to have never ordered.',
  work: 'Dormant accounts, sign-ups who never bought, products never sold: finding what is missing is a common request.',
},
'dx-31': {
  why: 'DATESBETWEEN builds the list of dates between two points, and CALCULATE swaps it in for whatever dates were filtered.',
  mistake: 'Typing in dates that should move. For "the last 90 days" or "this quarter", work the dates out from the data instead.',
  work: "Campaign periods, seasons, financial years that don't start in January.",
},
'dx-32': {
  why: 'On the total row nothing filters the product name, so ISFILTERED is FALSE and the IF gives a blank.',
  mistake: 'Hiding the number with formatting instead, like white text on the total. It still comes out when the table is exported; a blank is really blank.',
  work: 'Rank, price and percentage measures in tables usually blank themselves on the totals this way.',
},
'dx-33': {
  why: "The VAR stores this product's sales before CALCULATE clears the filters, so FILTER can compare every product with that one fixed number.",
  mistake: 'Writing `[Sales] >= [Sales]` without the VAR. Inside FILTER both sides are worked out for the same product, so every product passes.',
  work: 'Pareto charts show how concentrated sales, complaints or costs are. "20% of products make 80% of sales" comes from exactly this.',
},
'dx-34': {
  why: '`SWITCH(TRUE(), ...)` reads the running share and stops at the first band it fits, so A, B and C never overlap.',
  mistake: "Bands that don't match how the business works. 70/20/10 is a habit, not a law: agree the thresholds with the people who will use the classes.",
  work: 'ABC analysis decides which stock is checked most often, which products get shelf space, and where attention goes first.',
},
'dx-35': {
  why: "For each of this month's buyers, CALCULATE with PREVIOUSMONTH moves the filter back a month and counts their orders there.",
  mistake: 'Reading the total row. With no single month showing there is no "month before", so the total is blank; adding up the months would count people twice.',
  work: 'Returning-customer counts sit at the heart of retention dashboards.',
},

/* ── R ─────────────────────────────────────────────────── */
'r-01': {
  why: "A data frame is columns of the same length side by side, so row 3 of every column belongs to the same thing. Each column holds one kind of value, which is what lets R work on a whole column at once.",
  mistake: "Columns of different lengths. `data.frame(a = c(1, 2, 3), b = c(1, 2))` stops with an error, because every row needs a value in every column.",
  work: "Nearly everything an analyst does in R starts and ends with a data frame: a file read in, cleaned, summed up and saved out again.",
},
'r-02': {
  why: "`head()`, `dim()` and `names()` only look, so they are safe on any table, however big. They tell you what you have before you change anything.",
  mistake: "Trusting a table you haven't looked at. A column called `revenue` may have come in as text, or the headings may have loaded as the first row; one `head()` shows it.",
  work: "The first few commands on any new dataset at work are nearly always these, often with `str()` or `glimpse()` to see each column's type.",
},
'r-03': {
  why: "A column on its own is a vector, and R's maths works on a whole vector at once. `sum()` needs no loop, because the vector is the unit R thinks in.",
  mistake: "A typo after the `$`. Capitals count, so `cafe$Cups` gives back `NULL` (nothing) rather than an error, and `sum(cafe$Cups)` quietly returns 0.",
  work: "Quick checks like a column's total, the biggest order or the average price are one `$` and one function away.",
},
'r-04': {
  why: "`summary()` gives five landmarks of a column at once, so you see its spread, not just its average. `count()` is grouping and counting in one step.",
  mistake: "Reading the mean alone. One huge day pulls the mean up while the median, the middle value, barely moves. When the two are far apart, a few big values are doing the pulling.",
  work: "Counting rows per category is how analysts check a dataset is balanced, and it answers questions like \"how many orders per region?\" on the spot.",
},
'r-05': {
  why: "The condition is asked of every row at once, giving TRUE or FALSE for each, and `filter()` keeps the TRUE ones. Bare column names work because dplyr looks them up inside the table.",
  mistake: "Not storing the result. `filter(cafe, cups > 45)` shows the busy days, but without `busy <- ...` the filtered table is gone, and `cafe` itself never changed.",
  work: "Every report narrows the data first: one region, one month, only the finished orders.",
},
'r-06': {
  why: "`&` and `|` combine TRUE and FALSE answers row by row. A comma between conditions in `filter()` means the same as `&`.",
  mistake: "Writing `city == \"Lagos\" | \"Accra\"`. R doesn't repeat the `city ==` for you, so it stops with an error. Each side of `|` needs its own full comparison, or use `%in%`.",
  work: "Segments are usually two or three conditions together: cheap and well rated, or big orders from new customers.",
},
'r-07': {
  why: "`mutate()` works the new column out for every row at once, from the other columns in that row. R doesn't change a table in place, which is why the result has to be stored.",
  mistake: "Leaving off `cafe <- `. The new column appears when you run it, then seems to vanish, because the original `cafe` was never replaced.",
  work: "Profit from revenue and cost, a price with tax, a flag for big orders: most analysis adds a few worked-out columns first.",
},
'r-08': {
  why: "`arrange()` reorders the rows without changing any values. `head()` after it takes the first few rows of that new order.",
  mistake: "`head()` before `arrange()`. Taking 5 rows and then sorting them gives the first five days in order, not the five best days.",
  work: "Top products, worst stores, latest orders: sort, then take the top.",
},
'r-09': {
  why: "`group_by()` doesn't change the rows. It marks which group each one is in, and `summarise()` then works once per group instead of once for the whole table.",
  mistake: "Summarising without grouping. `cafe |> summarise(cups = sum(cups))` gives one grand total, not a row per drink, because nothing told it to split.",
  work: "Sales by region, orders by month, average rating by product: group and summarise is the core of most reports.",
},
'r-10': {
  why: "Each `name = calculation` in `summarise()` makes one column, all worked out from the same groups, so the numbers line up row by row.",
  mistake: "A missing value without `na.rm = TRUE`. One empty rating makes that drink's whole average `NA`, and in a big table the hole is easy to miss.",
  work: "A count, a total and an average per group is the standard first summary of any business question.",
},
'r-11': {
  why: "`NA` means \"unknown\", so anything worked out from it is unknown too: `NA + 1` is `NA`. That is R being honest, not broken.",
  mistake: "Testing with `== NA`. `rating == NA` gives `NA` for every row and never TRUE, so `is.na()` is the only way to find the holes.",
  work: "Every real dataset has gaps. Counting them, deciding whether to fill or drop them, and saying which you did is part of the job.",
},
'r-12': {
  why: "A real date is stored as a count of days, which is why R can sort dates properly and work out the gap between two. `format()` only changes how it's written.",
  mistake: "Grouping by the raw date when you meant the month. Every single day becomes its own group; make a month column first.",
  work: "Monthly revenue, weekly sign-ups and year-on-year comparisons all start by turning dates into periods.",
},
'r-13': {
  why: "`tapply()` splits the values by two labels at once and runs the summary in each cell, which is exactly what a spreadsheet's pivot table does.",
  mistake: "Reading an empty cell as zero. A city that never sold a drink gets `NA`, which means \"no data\", not \"sold nothing\".",
  work: "Cross-tabs like region by product, or month by channel, are the tables managers ask for most.",
},
'r-14': {
  why: "Inside the square brackets, the part before the comma picks rows and the part after picks columns. Leaving one empty means all of them.",
  mistake: "Forgetting the comma. `cafe[1:3]` picks the first three columns, not rows, because without a comma R treats a data frame as a list of columns.",
  work: "Positions suit a quick look. For real analysis, names (with `filter()` and `select()`) keep working when the data changes shape.",
},
'r-15': {
  why: "`%in%` checks each value against the whole list and answers TRUE or FALSE, so it slots straight into `filter()`.",
  mistake: "Writing `drink == c(\"latte\", \"tea\")`. That compares the rows in turn with latte, then tea, then latte again, so it quietly misses rows. `%in%` is the right tool.",
  work: "Filtering to a list of products, stores or customer types is daily work, and the list often comes from another table.",
},
'r-16': {
  why: "`select()` and `rename()` change the columns, never the rows, and give back a new table, so the original is always there to go back to.",
  mistake: "Getting rename the wrong way round. It's new name = old name, so `rename(cafe, cups = units)` looks for a column called `units` and stops with an error.",
  work: "Tidying column names and dropping what you don't need gets a table ready to share or join.",
},
'r-17': {
  why: "`ifelse()` works on a whole vector at once, so a function built from it labels every row in one call, with no loop.",
  mistake: "Using `if` instead of `ifelse`. `if (cups > 40)` wants a single TRUE or FALSE, so given a whole column it stops with an error.",
  work: "Small functions for rules you use often, like a size band or a region code, keep every report labelling things the same way.",
},
'r-18': {
  why: "Text functions work on every value in a column at once and give back one answer per row, which is why they fit inside `filter()` and `mutate()`.",
  mistake: "Forgetting that capitals count. `grepl(\"Brew\", drink)` misses \"cold brew\"; use `tolower()` first, or add `ignore.case = TRUE`.",
  work: "Cleaning names, finding products by keyword and checking codes are everyday text jobs.",
},
'r-19': {
  why: "`cut()` compares each number with the edges and gives it the label of the band it falls in. `quantile()` picks edges so each band holds about the same number of rows.",
  mistake: "Leaving out `include.lowest = TRUE`. The smallest value sits exactly on the first edge, falls outside every band and becomes `NA`.",
  work: "Customer value tiers, age groups and price bands all come from cutting a number column.",
},
'r-20': {
  why: "`read.csv()` takes the first line as the column names and guesses each column's type from the values under it.",
  mistake: "A number column that loads as text because one cell held something like \"n/a\". `str()` straight after loading shows every column's type.",
  work: "Most data arrives as a CSV exported from another system, so reading one cleanly is where most projects begin.",
},
'r-21': {
  why: "The pipe hands each step's table to the next step as its first input, so a long chain reads top to bottom in the order things happen.",
  mistake: "A missing `|>` at the end of a line. R takes the chain as finished there, and the next line runs on its own with no table, and fails.",
  work: "Analysts share chains like this because a colleague can follow them step by step and check each one.",
},
'r-22': {
  why: "Each step only sees the table from the step above it, so a column made by `mutate()` exists for every step below it.",
  mistake: "Using a column before the step that makes it, like filtering on `per_cup` above the `mutate()` that creates it. R says the object can't be found.",
  work: "Building a chain a line at a time, running it after each one, is how experienced analysts catch mistakes early.",
},
'r-23': {
  why: "`case_when()` tries its conditions from the top and stops at the first TRUE, so the order of the lines is part of the logic.",
  mistake: "A broad condition first. With `cups > 30` above `cups > 50`, every busy day is labelled \"steady\", because the first true line wins.",
  work: "Labelling rows into segments, like weekday or weekend, new or returning, small, medium or large, is a daily job.",
},
'r-24': {
  why: "`cumsum()` adds as it goes down the column, so the order of the rows decides the answer. `min_rank()` gives equal values the same rank and skips the next one.",
  mistake: "A running total on unsorted rows. If the dates are out of order, the total jumps about; `arrange()` by date first.",
  work: "Year-to-date revenue and league tables of stores or products use exactly these two.",
},
'r-25': {
  why: "Dividing each count by the total turns counts into shares that add up to 100%, so groups of different sizes can be compared fairly.",
  mistake: "Rounding before adding up. Rounded shares can total 99.9% or 100.1%, so round only for showing, at the very end.",
  work: "Status breakdowns, market shares and survey answers are nearly always reported as percentages.",
},
'r-26': {
  why: "After `group_by()`, dplyr runs `slice_max()` once per group, so each city gets its own top three.",
  mistake: "Forgetting `ungroup()`. Later steps still work group by group, which quietly changes what `n()` and ranks mean.",
  work: "Best sellers per store and top customers per region come up in nearly every sales review.",
},
'r-27': {
  why: "Grouped, `filter()` asks its question once per group, and `n()` is that group's size, so a whole group stays or goes together.",
  mistake: "Expecting one row per customer. A grouped filter keeps every row of the groups that pass; summarise afterwards for one row each.",
  work: "Finding regular customers, busy products, or stores with enough data to trust is a common first cut.",
},
'r-28': {
  why: "`row_number()` counts down the rows in their current order and starts again in each group, so sorting first is what makes the numbers mean first, second, third.",
  mistake: "Numbering before sorting. The numbers follow whatever order the rows happen to be in, so \"first order\" may not be the earliest.",
  work: "First purchases, repeat orders and how quickly customers come back all start from numbering orders.",
},
'r-29': {
  why: "`lag()` looks one row up, and after `group_by()` it stays inside each group, so each order sits beside that customer's previous one.",
  mistake: "Lagging without grouping. Each customer's first order then picks up the previous customer's last date, and the gap is nonsense.",
  work: "Time between purchases drives retention work, like deciding when to send a reminder.",
},
'r-30': {
  why: "`left_join()` looks up each row's city in the other table and copies its columns across, keeping every row of the left table.",
  mistake: "Duplicate rows. If the right table lists a city twice, every matching row on the left appears twice; check the key is unique first.",
  work: "Adding customer details to orders, or regions to stores, is one of the most common steps in any analysis.",
},
'r-31': {
  why: "`addmargins()` adds up each row and each column of the grid and puts the totals on the edges, like a spreadsheet's grand totals.",
  mistake: "Adding margins to averages. A total of averages isn't the average of everything, so margins suit sums and counts, not means.",
  work: "Finance and sales packs nearly always show tables with row and column totals.",
},
'r-32': {
  why: "A factor is text with a fixed list of levels, and R sorts and groups by that list rather than the alphabet.",
  mistake: "A spelling that doesn't match a level. \"monday\" in the data against \"Monday\" in the levels becomes `NA`, and those rows drop out of the totals.",
  work: "Days, months, sizes and ratings like poor, fair, good all need their real order in charts and tables.",
},
'r-33': {
  why: "`strsplit()` gives each row its own bundle of pieces, and `unlist()` pours them all into one long vector, so each item can be counted on its own.",
  mistake: "Splitting on the wrong separator. If some tickets use \", \" and others \",\", stray spaces make \"latte\" and \" latte\" count separately; `trimws()` fixes it.",
  work: "Tags, basket contents and multiple-choice survey answers often arrive packed into one cell.",
},
'r-34': {
  why: "Grouped, `min_rank()` ranks inside each city separately, so every city has its own number 1.",
  mistake: "Expecting one row per group. Equal values share a rank, so two best days with the same revenue both get 1, and both stay after the filter.",
  work: "Best store per region, top product per category and each salesperson's best month all use this pattern.",
},
'r-35': {
  why: "Giving every row its customer's first month lets you group people by when they started, then follow each group through the months after.",
  mistake: "Counting orders instead of customers. `n()` counts rows; `n_distinct(customer_id)` counts people, which is what a cohort table needs.",
  work: "Cohort tables are how subscription businesses and shops see whether customers stick around.",
},

/* ── The Python course ─────────────────────────────────── */
'py-01': {
  why: "Python reads your code from the top, one line at a time, and finishes each line before the next, so the order of the lines matters.",
  mistake: "Expecting to see a sum that sits in the middle of your code. It's worked out and then thrown away; `print()` is how you see it.",
  work: "Analysts use Python as a calculator that remembers every step, which makes the working easy to check.",
},
'py-02': {
  why: "A variable is a label on a value. Change the value once at the top and every line that uses the name follows.",
  mistake: "A name spelled differently later. `Price` and `price` are two names, so a NameError usually means a typo.",
  work: "Settings like a tax rate or a date range live in named variables at the top of a script, so they change in one place.",
},
'py-03': {
  why: "Quotes tell Python \"this is text, not a name\". Inside quotes nothing is looked up or worked out.",
  mistake: "`\"Total: \" + 5` stops with a TypeError, because text and a number can't be joined. Turn the number into text first, with `str(5)` or an f-string.",
  work: "Labels, file names and messages in reports are all strings stitched together from pieces.",
},
'py-04': {
  why: "Every comparison boils down to True or False, and `if`, `while` and filters all run on those two values.",
  mistake: "`if price = 5:` with one equals sign stops with a SyntaxError, because `=` stores and `==` compares.",
  work: "Every filter and rule in data work, like orders over 100 or late deliveries, is a comparison underneath.",
},
'py-05': {
  why: "A list keeps items in the order you put them in, and each position has a number, so you can always get back to the third item.",
  mistake: "Counting from 1. `cups[3]` on a three-item list is past the end, an IndexError, because the positions are 0, 1 and 2.",
  work: "Lists hold anything in order: a day's readings, a set of file names, the columns to keep.",
},
'py-06': {
  why: "A function packs a job behind a name, so you can use it without knowing how it works inside, like a calculator's square-root key.",
  mistake: "Leaving off the brackets. `len` on its own is the function itself, not an answer; `len(cups)` runs it.",
  work: "Most analysis is functions inside functions: the average of a column, rounded, written into a report.",
},
'py-07': {
  why: "A method is a function that belongs to a kind of value, so text has text actions and lists have list actions.",
  mistake: "Expecting a text method to change the original. `name.upper()` gives back a new string, and `name` stays as it was unless you store the result.",
  work: "Cleaning messy text with `.strip()` and `.lower()` before comparing it is one of the first things done to real data.",
},
'py-08': {
  why: "A dict finds a value by its key straight away, however many pairs it holds, because it doesn't search through them one by one.",
  mistake: "Asking for a key that isn't there. `prices[\"mocha\"]` stops with a KeyError; check with `in` first, or use `.get()`.",
  work: "Lookups like product to price, or code to country name, are dicts, and JSON data from websites is built from them.",
},
'py-09': {
  why: "Python checks the tests from the top and runs only the first one that is True, so at most one branch ever runs.",
  mistake: "Tests in the wrong order. Checking `cups > 20` before `cups > 50` means the over-50 branch never runs, because the first test already caught those.",
  work: "Business rules like discount levels or delivery bands are written as chains of `if` and `elif`.",
},
'py-10': {
  why: "A loop runs the same lines once per item, with the loop's name holding a different item each time round.",
  mistake: "Getting the indent wrong. A line that isn't pushed in runs once after the loop, not once per item.",
  work: "Looping over files, rows or dates to do the same job to each is where automation starts.",
},
'py-11': {
  why: "Computers store decimals in binary, where some tenths can't be written exactly, just as 1/3 can't be written exactly as a decimal.",
  mistake: "Comparing decimals with `==`. `0.1 + 0.2 == 0.3` is False; round both sides first, or check the gap between them is tiny.",
  work: "Money is where this bites, which is why finance code rounds at the end or counts in whole pennies.",
},
'py-12': {
  why: "To Python, `\"12\"` and `12` are different things: two characters, and a number. Converting one to the other is a deliberate step.",
  mistake: "Adding numbers read from a file before converting them. `\"12\" + \"3\"` gives `\"123\"` with no error, so a wrong total can slip through unnoticed.",
  work: "Data from forms, CSV files and websites arrives as text, so converting it is routine.",
},
'py-13': {
  why: "A slice leaves out its end position, so `code[0:4]` gives 4 characters and the next slice can start at 4 with no overlap.",
  mistake: "Expecting the end position to be included. `code[4:8]` stops at position 7.",
  work: "Taking the year out of `\"2024-03-15\"`, or the region out of a fixed-format ID, is a slice.",
},
'py-14': {
  why: "What's inside the braces is worked out first and dropped into the text, so the text always shows the current values.",
  mistake: "Forgetting the `f`. Without it, `\"{total}\"` prints the braces and the word itself.",
  work: "Report lines, email text and chart labels are built with f-strings.",
},
'py-15': {
  why: "`split` and `join` are opposites: one turns a line into a list of pieces, the other turns a list back into a line.",
  mistake: "Splitting data whose values contain the separator. \"Lagos, Nigeria\" inside a comma-split line breaks into two pieces, which is what the csv module is for.",
  work: "Reading simple text files, tidying lists of names and building comma-separated output.",
},
'py-16': {
  why: "`range` makes its numbers as they're needed rather than storing them all, so even `range(1000000)` costs almost nothing.",
  mistake: "Off by one. `range(1, 10)` stops at 9; to include 10, the stop has to be 11.",
  work: "Repeating something a set number of times, or stepping through positions in a list.",
},
'py-17': {
  why: "A `while` loop checks its condition before every turn, so it keeps going exactly as long as there's something left to do.",
  mistake: "Nothing inside changes the condition, so it never becomes False and the loop never ends.",
  work: "Retrying a download until it works, or reading until a file runs out.",
},
'py-18': {
  why: "`break` and `continue` let a loop react to what it finds, instead of always running to the end.",
  mistake: "A `break` that isn't inside an `if`. The loop then stops on the very first item.",
  work: "Searching for the first matching record, or skipping blank lines in a file.",
},
'py-19': {
  why: "The inner loop runs all the way through for each turn of the outer one, which is why the work multiplies.",
  mistake: "Nested loops over big lists. 10,000 rows matched against 10,000 rows is 100 million turns; a dict or a set finds each match in one step.",
  work: "Comparing every item with every other is sometimes needed, but analysts reach for lookups and joins once the data gets big.",
},
'py-20': {
  why: "`enumerate` and `zip` hand the loop things in pairs, so you don't keep a counter or an index by hand.",
  mistake: "`zip` on lists of different lengths stops at the shorter one and silently drops the rest.",
  work: "Pairing names with scores, or numbering the lines of a report.",
},
'py-21': {
  why: "Methods like `.append()` change the list itself and give back nothing, which is Python's way of saying the original changed.",
  mistake: "`items = items.append(x)` stores `None` over your list, because append gives back nothing.",
  work: "Collecting results as you go, like the bad rows found or the files done.",
},
'py-22': {
  why: "A name points at a value. `b = a` makes a second name point at the same list, not a new one.",
  mistake: "Changing a \"copy\" and finding the original changed too. Use `.copy()` whenever you need two separate lists.",
  work: "Keeping an untouched version of the data before cleaning it is good practice, and it needs a real copy.",
},
'py-23': {
  why: "`sorted()` makes a new list and `.sort()` changes the old one. `key=` sorts by a worked-out value without changing the items.",
  mistake: "`result = items.sort()` gives `None`, because sort changes the list and gives back nothing.",
  work: "Ranking, finding where something appears and counting how often come up in every analysis.",
},
'py-24': {
  why: "A tuple can't change, so it's safe to pass around as a fixed record, and it can be a dict key where a list can't.",
  mistake: "Unpacking into the wrong number of names. `a, b = (1, 2, 3)` stops with a ValueError.",
  work: "A function with two answers, like the lowest and highest value, hands them back as a tuple.",
},
'py-25': {
  why: "A comprehension is a loop with `.append`, written as one expression that produces the new list.",
  mistake: "Cramming too much in. A comprehension with two loops and conditions is harder to read than the plain loop, and clarity wins.",
  work: "Turning a column of text into numbers, or keeping only the valid values, in one readable line.",
},
'py-26': {
  why: "`.get()` gives a default when a key is missing, so counting and lookups don't stop at the first new key.",
  mistake: "Adding or removing keys while looping over the same dict, which stops with a RuntimeError. Loop over a copy of the keys, `list(d)`.",
  work: "Totals per category, lookups and settings are dicts read and updated in loops.",
},
'py-27': {
  why: "Each record is a dict with the same keys, so every field has a name instead of a position.",
  mistake: "A record that lacks a key. One order with no `\"total\"` stops the loop with a KeyError; `.get(\"total\", 0)` copes.",
  work: "Data from websites and app exports comes as lists of records, and turning them into totals is everyday work.",
},
'py-28': {
  why: "A set stores values so that \"is it in here?\" is answered instantly, and it can't hold a value twice.",
  mistake: "Expecting an order. A set has none, so sort it before showing it.",
  work: "Customers on both lists, products never sold, the different values in a column.",
},
'py-29': {
  why: "A dict comprehension builds key and value pairs in one expression, the way a list comprehension builds items.",
  mistake: "Two items that give the same key. The later one silently replaces the earlier.",
  work: "Building lookups, like name to length or product to discounted price, from data you already have.",
},
'py-30': {
  why: "Each level is another lookup: the first key picks the inner dict, and the second picks the value inside it.",
  mistake: "A missing inner key. `sales[\"Lagos\"][\"mocha\"]` stops with a KeyError even though Lagos is there.",
  work: "Website data and settings files nest like this, and reaching the right value is half the job.",
},
'py-31': {
  why: "The code inside `def` only runs when the function is called, with the parameters standing in for whatever is passed.",
  mistake: "Printing instead of returning. A function that prints its answer gives back `None`, so the answer can't be stored or used.",
  work: "Wrapping a repeated step, like cleaning a column, in a function saves copying the same lines around.",
},
'py-32': {
  why: "The star gathers any number of values into one tuple, so the function doesn't need to know how many it will get.",
  mistake: "Dividing by the count without checking it. The average of no numbers is a ZeroDivisionError unless the function handles the empty case.",
  work: "Helpers that take a flexible number of inputs, like combining several files into one.",
},
'py-33': {
  why: "Each call to a function gets its own set of names, so a name inside one function can't clash with the same name anywhere else.",
  mistake: "Trying to change an outside variable from inside a function. Assigning to it makes a new local one instead, and the outside value stays put.",
  work: "Functions that take inputs and return outputs, with nothing hidden, are easy to test and reuse.",
},
'py-34': {
  why: "A function's name is just a name for a value, so the function can be handed to another function, which calls it later.",
  mistake: "Calling it when you meant to pass it. `sorted(items, key=len())` runs `len` with nothing and stops; pass `len` without brackets.",
  work: "Sorting records by a field, or applying one rule to every value, passes a small function in.",
},
'py-35': {
  why: "The docstring is kept with the function, so tools can show it wherever the function is used.",
  mistake: "Expecting type hints to stop bad input. Python ignores them while running; only editors and checkers read them.",
  work: "Shared code without docstrings gets misused, so teams expect one on every function.",
},
'py-61': {
  why: "A conditional expression is a value, not a statement, so it can sit anywhere a value can: inside a print, a list or a call.",
  mistake: "Truthiness surprises. A total of 0 counts as False, so `if total:` treats a real zero like a missing one; write `if total is not None:` when 0 is a fair answer.",
  work: "Labels, defaults and short fallbacks like `name or \"guest\"` keep code brief.",
},
'py-62': {
  why: "`match` checks the cases from the top, runs the first that fits, and can pull pieces out of the value as it matches.",
  mistake: "Putting `case _:` first. It matches everything, so the cases below it never run.",
  work: "Handling commands, message types or records that come in a few known shapes.",
},
'py-63': {
  why: "A Counter is a dict that counts, with every new item starting at 0, so a tally is one line.",
  mistake: "Counting before tidying. \"Latte\" and \"latte \" are different items to a Counter.",
  work: "Counting words, error types, products sold or answers to a survey question.",
},
'py-64': {
  why: "A defaultdict makes the starting value for any key it hasn't seen, so grouping code needs no checks.",
  mistake: "Just looking up a missing key with square brackets adds it, empty, which can leave stray keys behind.",
  work: "Grouping records by customer, city or date before adding them up.",
},
'py-65': {
  why: "A named tuple is still a tuple, small and fixed, but each position also has a name to read it by.",
  mistake: "Trying to change a field. `s.qty = 3` stops with an AttributeError; `_replace` gives a new one instead.",
  work: "Light records for rows read from a file, where a full class would be more than you need.",
},
'py-36': {
  why: "The last line names the error, and the lines above trace the route Python took to reach it, ending at the line that failed.",
  mistake: "Reading from the top. The first lines are often inside other people's code; the useful parts are the last line and the last line of your own code above it.",
  work: "Reading error messages quickly is one of the skills that saves the most time in real work.",
},
'py-37': {
  why: "`try` lets an error be expected and handled, so one bad value doesn't stop everything.",
  mistake: "A bare `except:` that hides real bugs, like a misspelt name, that you'd want to see and fix.",
  work: "Converting what people type, reading files that may be missing, calling websites that may be down.",
},
'py-38': {
  why: "Raising an error stops the function the moment something is wrong, instead of letting a bad value travel on and cause trouble later.",
  mistake: "Returning a special value like -1 for bad input. The caller can forget to check, and then treats -1 as a real number.",
  work: "Checking inputs at the top of a function, so problems show up where they began.",
},
'py-39': {
  why: "Catching errors row by row means one bad line costs one row, not the whole file.",
  mistake: "Dropping bad rows silently. Without a list of what was skipped and why, nobody knows the data was incomplete.",
  work: "Data pipelines keep a rejects list or file that someone reviews.",
},
'py-40': {
  why: "`with` closes the file when the block ends, even after an error, so nothing is left half-written.",
  mistake: "Opening with `\"w\"` when you meant `\"a\"`. `\"w\"` empties the file first, wiping what was there.",
  work: "Saving results, logs and exports to files is how scripts hand work to people and other programs.",
},
'py-41': {
  why: "The csv module understands quoting, so a value like \"Lagos, Nigeria\" in quotes stays one value.",
  mistake: "Forgetting that everything comes back as text. A column of \"10\", \"9\", \"100\" sorted as text puts \"100\" before \"9\".",
  work: "Swapping data with spreadsheets and other systems is still mostly done with CSV files.",
},
'py-42': {
  why: "JSON maps neatly onto dicts and lists, so `json.loads` gives you ordinary Python data to work with.",
  mistake: "Writing JSON by hand with single quotes. JSON needs double quotes, so `json.loads(\"{'a': 1}\")` stops with an error.",
  work: "Almost every website and app that shares data sends and receives JSON.",
},
'py-43': {
  why: "Dates are real calendar values, so taking one from another gives an exact number of days, leap years included.",
  mistake: "Mixing up day and month. \"05/02/2024\" is 5 February in the UK and May 2 in the US; the format string decides, so it has to match the data.",
  work: "The age of invoices, days to delivery and month-by-month reports all need date maths.",
},
'py-44': {
  why: "Importing a module loads its code once and keeps its functions under its name, so nothing clashes with your own names.",
  mistake: "Naming your own file after a module, like `random.py`. Python then imports your file instead of the real one.",
  work: "The standard library covers maths, dates, files and more, so many jobs need nothing extra installed.",
},
'py-45': {
  why: "Small functions in a row make a program read like a list of steps, and each step can be checked on its own.",
  mistake: "One long block that does everything. When something breaks, there's no way to test the steps separately.",
  work: "Real analysis scripts follow read, clean, calculate, report, whatever the tools.",
},
'py-46': {
  why: "A class bundles data with the actions that belong to it, and each object keeps its own copy of the data.",
  mistake: "Leaving out `self.` in `__init__`. A plain `customer = customer` sets a name that vanishes when `__init__` ends, so the object never gets the attribute.",
  work: "Libraries like pandas are built from classes: a DataFrame is an object with data and methods.",
},
'py-47': {
  why: "Python passes the object in as `self` for you, which is how a method reaches that object's data.",
  mistake: "Leaving `self` out of the method's definition. Calling it then stops with a TypeError about the number of arguments.",
  work: "Methods keep rules beside the data, like an order that knows how to total itself.",
},
'py-48': {
  why: "Python calls `__repr__` whenever it needs to show the object, so one method fixes printing everywhere.",
  mistake: "Returning something other than a string from `__repr__`, which stops with a TypeError the moment the object is printed.",
  work: "A readable repr makes debugging far quicker: you see what an object holds at a glance.",
},
'py-49': {
  why: "The child class starts with everything the parent has, so you only write what's different.",
  mistake: "Forgetting `super().__init__(...)`. The parent's set-up never runs, and its attributes are missing.",
  work: "Inheritance suits families of similar things, though many teams keep it shallow so code stays easy to follow.",
},
'py-50': {
  why: "`@dataclass` writes the routine methods from the fields you list, so a class that holds data is a few lines.",
  mistake: "A field with a default before one without, which stops with a TypeError as soon as the class is defined.",
  work: "Dataclasses are a popular way to give records clear names and types in real code.",
},
'py-66': {
  why: "Without `__eq__`, `==` asks whether two names point at the very same object, not whether the two look alike.",
  mistake: "Comparing with something of another kind without checking. Reading `other.price` from a piece of text stops with an AttributeError.",
  work: "Objects that compare and sort naturally plug straight into `sorted()`, `max()` and rules about them.",
},
'py-67': {
  why: "Built-ins like `len` and `for` call these hook methods, so writing them makes your object behave like a list.",
  mistake: "A `__len__` that gives back something other than a whole number, which stops with a TypeError.",
  work: "Collections of your own, like a menu or a basket, that keep their own rules while feeling like lists.",
},
'py-68': {
  why: "`+` is shorthand for calling `__add__`, so writing it decides what adding your objects means.",
  mistake: "Changing `self` inside `__add__` and giving it back. Then `a + b` quietly changes `a`, which nobody expects.",
  work: "Money amounts, measurements and baskets are common things worth adding with `+`.",
},
'py-69': {
  why: "A property runs a method when you read an attribute, so a worked-out value is always up to date.",
  mistake: "Storing the real value under the property's own name. The setter then calls itself over and over, until Python stops it with a RecursionError.",
  work: "Properties guard values like prices or percentages, so a bad value is refused the moment it's set.",
},
'py-70': {
  why: "A classmethod is given the class itself, not an object, so it can build new objects in a different way.",
  mistake: "Writing `Order(...)` inside it instead of `cls(...)`. A class built on Order that uses it then gets a plain Order back.",
  work: "Building objects from a line of a file, a database row or a JSON record.",
},
'py-51': {
  why: "An iterator remembers where it got to, so each `next` gives the following item.",
  mistake: "Looping over the same iterator twice. The second loop gets nothing, because the first one used it up.",
  work: "Taking off a header row, then looping over the data, is the classic use.",
},
'py-52': {
  why: "A generator pauses at each `yield`, so values are made only when they're asked for, and memory stays small.",
  mistake: "Expecting to use it twice. Once a generator has handed out its values, it's empty.",
  work: "Reading a huge log file a line at a time, without loading the whole file.",
},
'py-53': {
  why: "A generator expression feeds values one at a time, and `any` and `all` stop as soon as they know the answer.",
  mistake: "Forgetting the empty case. `any([])` is False and `all([])` is True, so an empty list passes every \"all\" check.",
  work: "Quick checks over data: is any order late, are all the prices positive.",
},
'py-54': {
  why: "`@name` above a function is shorthand for passing the function to `name` and keeping what comes back.",
  mistake: "A wrapper that forgets to return the original function's result, so the decorated function suddenly gives back `None`.",
  work: "Timing, caching and logging are added to functions with decorators in real code.",
},
'py-55': {
  why: "One star spreads a list out into separate values; two spread a dict out into named ones.",
  mistake: "Merging dicts in the wrong order. In `{**a, **b}` the values from `b` win, so swapping them changes the result.",
  work: "Combining settings with defaults, and passing options on to another function.",
},
'py-71': {
  why: "An error class of your own has its own name, so callers can catch exactly that situation and nothing else.",
  mistake: "Making every error the same kind. If everything is a ValueError, the caller can't tell a sold-out drink from a real bug.",
  work: "Libraries define their own errors so the code that uses them can react properly.",
},
'py-72': {
  why: "The code before `yield` sets things up and the code after it tidies away, whatever happens in between.",
  mistake: "Leaving out `try` and `finally`. The tidying is then skipped whenever the code inside the `with` fails.",
  work: "Opening and closing database connections, locks and temporary files.",
},
'py-73': {
  why: "A test pins down what correct means, so a later change that breaks it fails loudly instead of quietly.",
  mistake: "Testing only the easy cases. A test with a typical input passes even when the boundary, like exactly 10, is wrong.",
  work: "Teams run their tests automatically before any change goes live.",
},
'py-74': {
  why: "doctest reads the examples in a docstring, runs them, and compares what comes out with what's written.",
  mistake: "Examples whose output changes from run to run, like times or random numbers. They fail even when the code is right.",
  work: "Library documentation often doubles as tests this way.",
},
'py-75': {
  why: "Keeping tests in a TestCase lets them run together, and each failure is reported with both values.",
  mistake: "Tests that depend on each other's order or leftovers. Each test should set up everything it needs.",
  work: "unittest, and pytest which builds on the same ideas, is how most Python projects are tested.",
},
'py-56': {
  why: "A regex describes the shape of some text rather than the exact text, so one pattern finds every match.",
  mistake: "Forgetting the `r` before the quotes. Some backslash pairs mean something else to Python first, like `\\b`, and the pattern breaks.",
  work: "Pulling numbers, codes, dates and email addresses out of messy text.",
},
'py-57': {
  why: "A character class is one position that accepts any of a set of characters, and a repeat says how many positions.",
  mistake: "Greedy repeats. `.*` grabs as much as it can, so it often swallows more than you meant.",
  work: "Matching product codes, phone numbers and postcodes that have a fixed shape.",
},
'py-58': {
  why: "Brackets mark the part of the match to keep, so you can find a whole pattern but take out only the piece you need.",
  mistake: "A plain `.` where you meant a full stop. `.` matches any character; `\\.` is a real full stop.",
  work: "Splitting names from email addresses, prices from text, or dates into their parts.",
},
'py-59': {
  why: "`fullmatch`, and the `^` and `$` anchors, make the pattern account for every character, not just a piece of the text.",
  mistake: "Checking a format with `search` instead of `fullmatch`, so \"12345\" passes a four-digit check.",
  work: "Checking IDs, codes and dates before they go into a database.",
},
'py-60': {
  why: "`re.sub` finds every match and builds new text, and groups let you reuse parts of what it found.",
  mistake: "Writing `\\1` in a normal string, where Python turns it into a different character before the regex sees it. Use a raw string for the replacement too.",
  work: "Making dates, phone numbers and spacing consistent across a whole column of text.",
},
'py-76': {
  why: "Tidying first makes different spellings of the same word count as one, so the counts mean something.",
  mistake: "Leaving the stop words in. The top of the list fills with \"the\" and \"and\", which say nothing about the subject.",
  work: "Analysing reviews, survey comments and support tickets starts with word counts.",
},
'py-77': {
  why: "Pairing each word with the next records which words follow which, and the counts say how likely each follower is.",
  mistake: "Pairing across reviews. With every review joined into one list, the last word of one review seems to lead to the first word of the next.",
  work: "Autocomplete and search suggestions grew from counting which words follow which.",
},
'py-78': {
  why: "Each pick depends only on the current word, so the text sounds right a few words at a time but has no overall plan.",
  mistake: "Testing without a fixed seed. The output changes every run, so there's nothing steady to check it against.",
  work: "Predicting the next word from what came before is also the basic task that modern AI text tools learn, with far more context.",
},
'py-79': {
  why: "Each band taxes only the income inside it, so earning a little more never leaves you worse off.",
  mistake: "Taxing all of the income at the top band's rate. It's the most common misunderstanding of how bands work.",
  work: "Commission rates, delivery charges and energy tariffs all work in bands.",
},
'py-80': {
  why: "Separate stages can each be tested and rerun on their own, and bad rows are caught before they reach the database.",
  mistake: "Loading first and cleaning later. Bad rows in the database spread into every report built on it.",
  work: "ETL jobs run on a schedule in most companies, feeding the dashboards analysts use every day.",
},
};
