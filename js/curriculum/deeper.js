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
  mistake: 'Leaving `SELECT *` in a finished query. If someone adds a column to the table later, your result quietly changes shape, and whatever reads it can break.',
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
  mistake: 'UNION when you meant UNION ALL. UNION removes duplicate rows, so two real sales of the same amount on the same day can quietly become one.',
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
  mistake: 'Quietly changing what Sales means. Keep a plain base measure and a clearly named filtered one, so nobody mixes them up in a report.',
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
};
