/* DAX — measures and filter context, Power BI style, on the shop model:
   customers, orders, order_items, products and a calendar, related the way
   a Power BI model would be (lookup tables filter data tables, one way).

   `rows` is the column the lesson's matrix is split by, like dragging a
   field onto the rows of a Power BI matrix. Checks call
   _dax_expect(measure, reference, helpers=..., uses=...): the learner's
   measure must match the reference overall and in every row. */

const SALES = 'SUMX(order_items, order_items[qty] * RELATED(products[price]))';

export const DAX = [

/* ── Your first measures ───────────────────────────────── */
{
  id: 'dx-01', mins: 3, rows: 'products[category]',
  title: 'A measure answers "how much"',
  concept: [
    'DAX is the formula language of Power BI. A **measure** is a named formula, like `Total Qty = SUM(order_items[qty])`. It stores no numbers: it works them out for whatever is on show.',
    'Here the answers appear in a **matrix**, Power BI\'s kind of table, with one row per product category. Every row gets its own answer: one formula, a different slice of the data each time.',
    'Columns are written `table[column]`. The `order_items` table has one row per product in an order, so `order_items[qty]` is how many of it were bought.',
  ],
  starter: `Lines = COUNTROWS(order_items)`,
  task: 'Add a second measure, `Total Qty`, that adds up `order_items[qty]`. Start it on a new line, at the left edge.',
  hint: '`Total Qty = SUM(order_items[qty])` — on its own line, with nothing before it.',
  solution: `Lines = COUNTROWS(order_items)
Total Qty = SUM(order_items[qty])`,
  check: `_dax_expect("Total Qty", "SUM(order_items[qty])")`,
},
{
  id: 'dx-02', mins: 4, rows: 'products[category]',
  title: 'Row by row: SUMX',
  concept: [
    '`SUM` adds up one column. To multiply two things first — quantity times price — you have to go row by row.',
    '`SUMX(order_items, order_items[qty] * RELATED(products[price]))` works out qty × price on every line, then adds them up.',
    '`RELATED(products[price])` fetches the price from the `products` table, for the product on the row you are on.',
  ],
  starter: `Sales = SUM(order_items[qty])`,
  task: 'Make `Sales` the money, not the units: quantity times price, line by line.',
  hint: `\`Sales = ${SALES}\``,
  solution: `Sales = ${SALES}`,
  check: `_dax_expect("Sales", "${SALES}", uses=["SUMX"])`,
},
{
  id: 'dx-03', mins: 4, rows: 'customers[city]',
  title: 'Measures made of measures',
  concept: [
    'A measure can use another: `[Sales]` in square brackets means "the Sales measure, for whatever is showing".',
    '`DIVIDE(a, b)` divides — and gives a blank instead of an error when b is zero.',
    'Build small measures and combine them. Each one is easy to check on its own.',
  ],
  starter: `Sales = ${SALES}
Orders = COUNTROWS(orders)`,
  task: 'Add `Avg Order`: Sales divided by Orders, using `DIVIDE` and the two measures above.',
  hint: '`Avg Order = DIVIDE([Sales], [Orders])`',
  solution: `Sales = ${SALES}
Orders = COUNTROWS(orders)
Avg Order = DIVIDE([Sales], [Orders])`,
  check: `_dax_expect("Avg Order", "DIVIDE([Sales], [Orders])", helpers={"Sales": "${SALES}", "Orders": "COUNTROWS(orders)"}, uses=["DIVIDE"])`,
},
{
  id: 'dx-04', mins: 3, rows: 'calendar[month]',
  title: 'Orders, or customers?',
  concept: [
    '`COUNTROWS(orders)` counts orders. `DISTINCTCOUNT(orders[customer_id])` counts the different customers behind them.',
    'Someone who ordered three times in March is 3 orders, but 1 customer.',
    'Say what one row is before you count. That is half of getting a measure right.',
  ],
  starter: `Orders = COUNTROWS(orders)`,
  task: 'Add `Customers`: how many **different** customers placed an order.',
  hint: '`Customers = DISTINCTCOUNT(orders[customer_id])`',
  solution: `Orders = COUNTROWS(orders)
Customers = DISTINCTCOUNT(orders[customer_id])`,
  check: `_dax_expect("Customers", "DISTINCTCOUNT(orders[customer_id])")`,
},
{
  id: 'dx-05', mins: 4, rows: 'products[category]',
  title: 'Filters flow one way',
  concept: [
    'The tables are linked, and filters flow along the links one way only: from the tables that describe things (products, customers, calendar) to the tables that record what happened (orders, order_items). Never back.',
    'So in a matrix by product category, `COUNTROWS(orders)` is the same on every row: the product filter reaches order_items, but not back up to orders.',
    'Count something the filter can reach: the orders behind the lines, `DISTINCTCOUNT(order_items[order_id])`.',
  ],
  starter: `Orders = COUNTROWS(orders)`,
  task: 'Add `Orders With It`: how many different orders included a product from each category. Notice that `Orders` doesn\'t change from row to row.',
  hint: '`Orders With It = DISTINCTCOUNT(order_items[order_id])` — order_items is where the product filter arrives.',
  solution: `Orders = COUNTROWS(orders)
Orders With It = DISTINCTCOUNT(order_items[order_id])`,
  check: `_dax_expect("Orders With It", "DISTINCTCOUNT(order_items[order_id])")`,
},

/* ── CALCULATE ─────────────────────────────────────────── */
{
  id: 'dx-06', mins: 4, rows: 'customers[city]',
  title: 'CALCULATE changes the filter',
  concept: [
    '`CALCULATE(formula, filter)` works out a formula with a filter of your own added.',
    '`CALCULATE([Sales], products[category] = "beans")` is sales of beans only — in whichever city the row is.',
    'It is the most important function in DAX. Most of the rest are variations on it.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Beans Sales`: sales of the `"beans"` category only.',
  hint: '`Beans Sales = CALCULATE([Sales], products[category] = "beans")`',
  solution: `Sales = ${SALES}
Beans Sales = CALCULATE([Sales], products[category] = "beans")`,
  check: `_dax_expect("Beans Sales", 'CALCULATE([Sales], products[category] = "beans")', helpers={"Sales": "${SALES}"}, uses=["CALCULATE"])`,
},
{
  id: 'dx-07', mins: 4, rows: 'products[category]',
  title: 'Replace, or keep?',
  concept: [
    'A CALCULATE filter **replaces** any filter already on that column. So in a matrix by category, `Beans Sales` shows the beans total on every row.',
    '`KEEPFILTERS(...)` keeps the matrix\'s own filter as well, so only the beans row gets a number.',
    'Replacing is usually what you want. KEEPFILTERS is for when it isn\'t.',
  ],
  starter: `Sales = ${SALES}
Beans Sales = CALCULATE([Sales], products[category] = "beans")`,
  task: 'Add `Beans Here`: the same filter wrapped in `KEEPFILTERS`, so it is blank on every row except beans.',
  hint: '`Beans Here = CALCULATE([Sales], KEEPFILTERS(products[category] = "beans"))`',
  solution: `Sales = ${SALES}
Beans Sales = CALCULATE([Sales], products[category] = "beans")
Beans Here = CALCULATE([Sales], KEEPFILTERS(products[category] = "beans"))`,
  check: `_dax_expect("Beans Here", 'CALCULATE([Sales], KEEPFILTERS(products[category] = "beans"))', helpers={"Sales": "${SALES}"}, uses=["KEEPFILTERS"])`,
},
{
  id: 'dx-08', mins: 4, rows: 'products[category]',
  title: 'ALL: the whole, for a share',
  concept: [
    '`ALL(products)` inside CALCULATE removes every filter on products.',
    'So `CALCULATE([Sales], ALL(products))` is all the sales, on every row — the whole to compare each part against.',
    'Divide a row\'s Sales by it, and you have that category\'s share.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Share`: each category\'s share of all sales, as a fraction (0.25 means a quarter).',
  hint: '`Share = DIVIDE([Sales], CALCULATE([Sales], ALL(products)))`',
  solution: `Sales = ${SALES}
Share = DIVIDE([Sales], CALCULATE([Sales], ALL(products)))`,
  check: `_dax_expect("Share", "DIVIDE([Sales], CALCULATE([Sales], ALL(products)))", helpers={"Sales": "${SALES}"}, uses=["ALL"])`,
},
{
  id: 'dx-09', mins: 3, rows: 'calendar[month]',
  title: 'Leave the cancelled out',
  concept: [
    'A CALCULATE filter can use any comparison: `orders[status] <> "cancelled"` keeps everything except cancelled.',
    'The filter lands on orders, and orders filters order_items — so [Sales] counts only the lines of orders that went through.',
    'Name measures for what they mean: `Net Sales`, not `Sales 2`.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Net Sales`: sales from the orders that weren\'t cancelled.',
  hint: '`Net Sales = CALCULATE([Sales], orders[status] <> "cancelled")`',
  solution: `Sales = ${SALES}
Net Sales = CALCULATE([Sales], orders[status] <> "cancelled")`,
  check: `_dax_expect("Net Sales", 'CALCULATE([Sales], orders[status] <> "cancelled")', helpers={"Sales": "${SALES}"}, uses=["CALCULATE"])`,
},
{
  id: 'dx-10', mins: 5, rows: 'customers[city]',
  title: 'FILTER with a measure',
  concept: [
    '`FILTER(customers, [Sales] > 300)` goes customer by customer and keeps the ones whose Sales is over 300.',
    'Inside FILTER, `[Sales]` is worked out for **that one customer**: a measure used on a row turns the row into a filter. That is called context transition.',
    '`COUNTROWS(FILTER(...))` counts what is left.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Big Customers`: how many customers bought more than 300 in total.',
  hint: '`Big Customers = COUNTROWS(FILTER(customers, [Sales] > 300))`',
  solution: `Sales = ${SALES}
Big Customers = COUNTROWS(FILTER(customers, [Sales] > 300))`,
  check: `_dax_expect("Big Customers", "COUNTROWS(FILTER(customers, [Sales] > 300))", helpers={"Sales": "${SALES}"}, uses=["FILTER"])`,
},

/* ── Iterators, ranking and time ───────────────────────── */
{
  id: 'dx-11', mins: 4, rows: 'customers[city]',
  title: 'The average customer',
  concept: [
    '`AVERAGEX(customers, [Sales])` works out Sales for each customer, then takes the mean.',
    'Customers who never bought give a blank, and AVERAGEX skips blanks — so this is the average **buying** customer.',
    'That differs from `DIVIDE([Sales], COUNTROWS(customers))`, which spreads the money over everyone.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Avg Customer`: the average sales per customer, using `AVERAGEX`.',
  hint: '`Avg Customer = AVERAGEX(customers, [Sales])`',
  solution: `Sales = ${SALES}
Avg Customer = AVERAGEX(customers, [Sales])`,
  check: `_dax_expect("Avg Customer", "AVERAGEX(customers, [Sales])", helpers={"Sales": "${SALES}"}, uses=["AVERAGEX"])`,
},
{
  id: 'dx-12', mins: 4, rows: 'calendar[month]',
  title: 'Name the steps with VAR',
  concept: [
    '`VAR name = ...` stores a result under a name; `RETURN` gives the answer. It reads top to bottom, like a recipe.',
    'A VAR is worked out once, where it is written — clearer than repeating the same measure, and quicker too.',
    '`IF(test, if_true, if_false)` picks one of two results.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Month Type`: `"busy"` when a month\'s Sales is over 2000, `"quiet"` otherwise. Store the Sales in a VAR first.',
  hint: '`Month Type = VAR s = [Sales] RETURN IF(s > 2000, "busy", "quiet")` — it can go across several indented lines.',
  solution: `Sales = ${SALES}
Month Type =
    VAR s = [Sales]
    RETURN IF(s > 2000, "busy", "quiet")`,
  check: `_dax_expect("Month Type", 'VAR s = [Sales] RETURN IF(s > 2000, "busy", "quiet")', helpers={"Sales": "${SALES}"}, uses=["IF"])`,
},
{
  id: 'dx-13', mins: 4, rows: 'products[name]',
  title: 'Rank the products',
  concept: [
    '`RANKX(ALL(products[name]), [Sales])` compares this product\'s Sales with every product\'s and gives its place — 1 for the best.',
    '`ALL(products[name])` is the list to rank against. Without ALL, the only product in the list would be the row\'s own, and everything would rank 1.',
    'Ties share a rank, and the next rank is skipped: 1, 1, 3.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Rank`: each product\'s place by Sales, 1 for the best seller.',
  hint: '`Rank = RANKX(ALL(products[name]), [Sales])`',
  solution: `Sales = ${SALES}
Rank = RANKX(ALL(products[name]), [Sales])`,
  check: `_dax_expect("Rank", "RANKX(ALL(products[name]), [Sales])", helpers={"Sales": "${SALES}"}, uses=["RANKX"])`,
},
{
  id: 'dx-14', mins: 4, rows: 'calendar[month]',
  title: 'Year to date',
  concept: [
    '`TOTALYTD([Sales], calendar[date])` adds up Sales from 1 January to the last date showing.',
    'On the March row that is January + February + March; on June, the whole half-year.',
    'Functions like this, which work across dates, need a calendar table with every date in it. Power BI calls them time intelligence. The model has one: `calendar`.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Sales YTD`: sales so far this year, month by month.',
  hint: '`Sales YTD = TOTALYTD([Sales], calendar[date])`',
  solution: `Sales = ${SALES}
Sales YTD = TOTALYTD([Sales], calendar[date])`,
  check: `_dax_expect("Sales YTD", "TOTALYTD([Sales], calendar[date])", helpers={"Sales": "${SALES}"}, uses=["TOTALYTD"])`,
},
{
  id: 'dx-15', mins: 5, rows: 'calendar[month]',
  title: 'Growth on last month',
  concept: [
    '`CALCULATE([Sales], DATEADD(calendar[date], -1, MONTH))` is last month\'s sales, shown on this month\'s row.',
    'January has no month before it in the data, so it is blank — and DIVIDE turns its growth into a blank too, not an error.',
    'Growth is (this − last) ÷ last: measures built on measures, all the way down.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Prev Sales` (last month\'s sales) and `Growth` (this month against last, as a fraction — 0.1 means 10% up).',
  hint: '`Prev Sales = CALCULATE([Sales], DATEADD(calendar[date], -1, MONTH))`, then `Growth = DIVIDE([Sales] - [Prev Sales], [Prev Sales])`.',
  solution: `Sales = ${SALES}
Prev Sales = CALCULATE([Sales], DATEADD(calendar[date], -1, MONTH))
Growth = DIVIDE([Sales] - [Prev Sales], [Prev Sales])`,
  check: `_dax_expect("Prev Sales", "CALCULATE([Sales], DATEADD(calendar[date], -1, MONTH))", helpers={"Sales": "${SALES}"}, uses=["DATEADD"])
_dax_expect("Growth", "DIVIDE([Sales] - [Prev Sales], [Prev Sales])", helpers={"Sales": "${SALES}", "Prev Sales": "CALCULATE([Sales], DATEADD(calendar[date], -1, MONTH))"})`,
},

/* ── Blanks, labels and totals ─────────────────────────── */
{
  id: 'dx-16', mins: 3, rows: 'products[name]',
  title: 'Blank is not zero',
  concept: [
    'A measure with nothing to add up gives **BLANK**, not 0. The tote bag never sold, so its Sales is blank.',
    'A matrix leaves out rows where every measure is blank. That is why the tote bag is missing from the list.',
    '`COALESCE([Sales], 0)` gives the first value that isn\'t blank: Sales where there is some, 0 where there isn\'t.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Sales Or Zero`: Sales, but 0 instead of blank. Watch the tote bag turn up.',
  hint: '`Sales Or Zero = COALESCE([Sales], 0)`',
  solution: `Sales = ${SALES}
Sales Or Zero = COALESCE([Sales], 0)`,
  check: `_dax_expect("Sales Or Zero", "COALESCE([Sales], 0)", helpers={"Sales": "${SALES}"})`,
},
{
  id: 'dx-17', mins: 4, rows: 'products[category]',
  title: 'Sort into bands with SWITCH',
  concept: [
    '`IF` picks between two answers. For three or more, IFs inside IFs get hard to read.',
    '`SWITCH(TRUE(), test1, result1, test2, result2, otherwise)` tries the tests in order and returns the result of the first one that is true.',
    'So order matters: put the highest threshold first, or everything over 2000 would stop at the first test.',
  ],
  starter: `Sales = ${SALES}
Size = IF([Sales] >= 5000, "big", "small")`,
  task: 'Give `Size` three bands: `"big"` from 5000, `"medium"` from 2000, `"small"` below that. Use `SWITCH(TRUE(), ...)`.',
  hint: '`Size = SWITCH(TRUE(), [Sales] >= 5000, "big", [Sales] >= 2000, "medium", "small")`',
  solution: `Sales = ${SALES}
Size = SWITCH(TRUE(), [Sales] >= 5000, "big", [Sales] >= 2000, "medium", "small")`,
  check: `_dax_expect("Size", 'SWITCH(TRUE(), [Sales] >= 5000, "big", [Sales] >= 2000, "medium", "small")', helpers={"Sales": "${SALES}"}, uses=["SWITCH"])`,
},
{
  id: 'dx-18', mins: 3, rows: 'products[category]',
  title: 'Say what is showing',
  concept: [
    '`SELECTEDVALUE(products[category])` is the one category showing on this row. When more than one is showing, as on the total, it is blank.',
    'A second value in the brackets is what to show instead: `SELECTEDVALUE(products[category], "everything")`.',
    '`&` joins text, so a measure can write a label. Report titles that change with the filters are made this way.',
  ],
  starter: `Label = "Sales of " & SELECTEDVALUE(products[category])`,
  task: 'On the total row, `Label` stops at "Sales of". Give `SELECTEDVALUE` a second value, so the total reads `Sales of everything`.',
  hint: '`Label = "Sales of " & SELECTEDVALUE(products[category], "everything")`',
  solution: `Label = "Sales of " & SELECTEDVALUE(products[category], "everything")`,
  check: `_dax_expect("Label", '"Sales of " & SELECTEDVALUE(products[category], "everything")', uses=["SELECTEDVALUE"])`,
},
{
  id: 'dx-19', mins: 4, rows: 'products[name]',
  title: 'Totals that mean nothing',
  concept: [
    'Some numbers don\'t add up. A product\'s price makes sense on its own row, but a total of prices means nothing.',
    '`HASONEVALUE(products[name])` is TRUE when exactly one product is showing: every product row, but not the total.',
    '`IF(HASONEVALUE(...), value)`, with nothing given for "otherwise", leaves the total blank.',
  ],
  starter: `Price = SUM(products[price])`,
  task: 'Change `Price` so each product still shows its price, and the total row is blank.',
  hint: '`Price = IF(HASONEVALUE(products[name]), SUM(products[price]))`',
  solution: `Price = IF(HASONEVALUE(products[name]), SUM(products[price]))`,
  check: `_dax_expect("Price", "IF(HASONEVALUE(products[name]), SUM(products[price]))")`,
},
{
  id: 'dx-20', mins: 3, rows: 'products[category]',
  title: 'A list in one cell',
  concept: [
    '`CONCATENATEX(table, what to write for each row, separator)` goes row by row and joins the results into one piece of text.',
    '`CONCATENATEX(VALUES(products[name]), products[name], ", ")` lists the products showing, with commas between.',
    'Handy for labels and tooltips. On a big total the list gets long, as the total row shows.',
  ],
  starter: `Products = COUNTROWS(products)`,
  task: 'Add `Names`: the names of the products in each category, joined with `", "`.',
  hint: '`Names = CONCATENATEX(VALUES(products[name]), products[name], ", ")`',
  solution: `Products = COUNTROWS(products)
Names = CONCATENATEX(VALUES(products[name]), products[name], ", ")`,
  check: `_dax_expect("Names", 'CONCATENATEX(VALUES(products[name]), products[name], ", ")', uses=["CONCATENATEX"])`,
},

/* ── Patterns that come up ─────────────────────────────── */
{
  id: 'dx-21', mins: 4, rows: 'customers[city]',
  title: 'Why a measure, not a formula',
  concept: [
    '`MAXX(customers, ...)` works something out for every customer and keeps the biggest.',
    'Put the SUMX formula straight in and every customer gets the **whole city\'s** sales. A formula on a row doesn\'t filter by that row.',
    'Use the measure `[Sales]` and each row becomes a filter first: context transition again. Wrapping the formula in `CALCULATE(...)` does the same.',
  ],
  starter: `Sales = ${SALES}
Best Customer = MAXX(customers, ${SALES})`,
  task: '`Best Customer` shows each city\'s total, not its best customer\'s spend. Fix it so every customer is worked out on their own.',
  hint: '`Best Customer = MAXX(customers, [Sales])`',
  solution: `Sales = ${SALES}
Best Customer = MAXX(customers, [Sales])`,
  check: `_dax_expect("Best Customer", "MAXX(customers, [Sales])", helpers={"Sales": "${SALES}"})`,
},
{
  id: 'dx-22', mins: 5, rows: 'products[name]',
  title: 'Share of its own category',
  concept: [
    'Each row filters one product. To compare it with its category, take the product filter off but keep the category.',
    '`VALUES(products[category])` on a product\'s row is that product\'s category. Given to CALCULATE as a filter, it puts the category back.',
    'So `CALCULATE([Sales], ALL(products[name]), VALUES(products[category]))` is the sales of the whole category.',
  ],
  starter: `Sales = ${SALES}
Category Sales = CALCULATE([Sales], ALL(products[name]))`,
  task: 'Right now `Category Sales` is every sale, on every row. Make it keep the product\'s category, then add `Share Of Category`: the product\'s Sales divided by it.',
  hint: '`Category Sales = CALCULATE([Sales], ALL(products[name]), VALUES(products[category]))`, then `Share Of Category = DIVIDE([Sales], [Category Sales])`.',
  solution: `Sales = ${SALES}
Category Sales = CALCULATE([Sales], ALL(products[name]), VALUES(products[category]))
Share Of Category = DIVIDE([Sales], [Category Sales])`,
  check: `_dax_expect("Category Sales", "CALCULATE([Sales], ALL(products[name]), VALUES(products[category]))", helpers={"Sales": "${SALES}"})
_dax_expect("Share Of Category", "DIVIDE([Sales], CALCULATE([Sales], ALL(products[name]), VALUES(products[category])))", helpers={"Sales": "${SALES}"})`,
},
{
  id: 'dx-23', mins: 4, rows: 'calendar[month]',
  title: 'Only the top three',
  concept: [
    '`TOPN(3, ALL(products[name]), [Sales])` is a table: the three product names with the most Sales.',
    'It is worked out where it stands, so on the March row it is **March\'s** top three.',
    'Given to CALCULATE as a filter, it keeps just those products.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Top 3 Sales`: each month, the sales of that month\'s three best-selling products.',
  hint: '`Top 3 Sales = CALCULATE([Sales], TOPN(3, ALL(products[name]), [Sales]))`',
  solution: `Sales = ${SALES}
Top 3 Sales = CALCULATE([Sales], TOPN(3, ALL(products[name]), [Sales]))`,
  check: `_dax_expect("Top 3 Sales", "CALCULATE([Sales], TOPN(3, ALL(products[name]), [Sales]))", helpers={"Sales": "${SALES}"}, uses=["TOPN"])`,
},
{
  id: 'dx-24', mins: 4, rows: 'calendar[month]',
  title: 'A rolling three months',
  concept: [
    '`DATESINPERIOD(calendar[date], MAX(calendar[date]), -3, MONTH)` is the three months up to the last date showing.',
    'On the April row that is February, March and April. The window moves with the row, which is why it is called rolling.',
    'A rolling total smooths out one odd month. The first two months have less behind them, so they come out smaller.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Sales 3M`: the sales of the three months up to and including each month.',
  hint: '`Sales 3M = CALCULATE([Sales], DATESINPERIOD(calendar[date], MAX(calendar[date]), -3, MONTH))`',
  solution: `Sales = ${SALES}
Sales 3M = CALCULATE([Sales], DATESINPERIOD(calendar[date], MAX(calendar[date]), -3, MONTH))`,
  check: `_dax_expect("Sales 3M", "CALCULATE([Sales], DATESINPERIOD(calendar[date], MAX(calendar[date]), -3, MONTH))", helpers={"Sales": "${SALES}"}, uses=["DATESINPERIOD"])`,
},
{
  id: 'dx-25', mins: 4, rows: 'cities[country]',
  title: 'One lookup table, two kinds of sales',
  concept: [
    '`cities` describes the cities for both the shop\'s customers **and** the cafe\'s days. So a matrix by country splits both: cafe takings and shop sales side by side.',
    'A lookup table shared like this is what lets two different sets of data sit in one report. Power BI calls it a dimension.',
    'Rwanda has shop customers but no cafe, so its Cafe Sales is blank.',
  ],
  starter: `Sales = ${SALES}
Cafe Sales = SUM(cafe[revenue])`,
  task: 'Add `Cafe Share`: the cafe\'s part of all the money taken in each country — Cafe Sales divided by Cafe Sales plus Sales.',
  hint: '`Cafe Share = DIVIDE([Cafe Sales], [Cafe Sales] + [Sales])`',
  solution: `Sales = ${SALES}
Cafe Sales = SUM(cafe[revenue])
Cafe Share = DIVIDE([Cafe Sales], [Cafe Sales] + [Sales])`,
  check: `_dax_expect("Cafe Share", "DIVIDE([Cafe Sales], [Cafe Sales] + [Sales])", helpers={"Sales": "${SALES}", "Cafe Sales": "SUM(cafe[revenue])"})`,
},

/* ── Going through a table ─────────────────────────────── */
{
  id: 'dx-26', mins: 4, rows: 'products[category]',
  title: 'The average month',
  concept: [
    '`AVERAGEX(VALUES(calendar[month]), [Sales])` goes through the months one at a time, works out `[Sales]` for each, then averages the answers.',
    '`VALUES(calendar[month])` is the list of months showing. Each time round, `[Sales]` sees only that month, just as each row of a matrix sees only its own slice.',
    "A month with no sales comes out blank, and AVERAGEX skips blanks, so an empty month doesn't drag the average down.",
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Avg Month`: the average sales per month, worked out month by month.',
  hint: '`Avg Month = AVERAGEX(VALUES(calendar[month]), [Sales])`',
  solution: `Sales = ${SALES}
Avg Month = AVERAGEX(VALUES(calendar[month]), [Sales])`,
  check: `_dax_expect("Avg Month", "AVERAGEX(VALUES(calendar[month]), [Sales])", helpers={"Sales": "${SALES}"}, uses=["AVERAGEX"])`,
},
{
  id: 'dx-27', mins: 3, rows: 'products[category]',
  title: 'The best month',
  concept: [
    '`MAXX` goes through a table like AVERAGEX does, but keeps the biggest answer: `MAXX(VALUES(calendar[month]), [Sales])` is the sales of the best month.',
    "On the beans row it is beans' best month. On the total it is the best month for everything together, which can be a different month.",
    'MINX finds the worst month the same way. Side by side with the average, they show how steady, or lumpy, sales are.',
  ],
  starter: `Sales = ${SALES}
Avg Month = AVERAGEX(VALUES(calendar[month]), [Sales])`,
  task: 'Add `Best Month`: the sales of the best single month.',
  hint: '`Best Month = MAXX(VALUES(calendar[month]), [Sales])`',
  solution: `Sales = ${SALES}
Avg Month = AVERAGEX(VALUES(calendar[month]), [Sales])
Best Month = MAXX(VALUES(calendar[month]), [Sales])`,
  check: `_dax_expect("Best Month", "MAXX(VALUES(calendar[month]), [Sales])", helpers={"Sales": "${SALES}"}, uses=["MAXX"])`,
},
{
  id: 'dx-28', mins: 4, rows: 'calendar[month]',
  title: 'Count the busy days',
  concept: [
    '`FILTER(VALUES(calendar[date]), [Orders] >= 2)` keeps the days showing that had 2 or more orders. `COUNTROWS` around it counts them.',
    '`[Orders]` is worked out again for each day inside FILTER. That is what lets a measure test every row one by one.',
    'Busy days out of all the days in a month is a steadier measure of a good month than raw orders, which one big day can inflate.',
  ],
  starter: `Orders = COUNTROWS(orders)`,
  task: 'Add `Busy Days`: how many days had 2 or more orders.',
  hint: '`Busy Days = COUNTROWS(FILTER(VALUES(calendar[date]), [Orders] >= 2))`',
  solution: `Orders = COUNTROWS(orders)
Busy Days = COUNTROWS(FILTER(VALUES(calendar[date]), [Orders] >= 2))`,
  check: `_dax_expect("Busy Days", "COUNTROWS(FILTER(VALUES(calendar[date]), [Orders] >= 2))", helpers={"Orders": "COUNTROWS(orders)"}, uses=["FILTER"])`,
},
{
  id: 'dx-29', mins: 4, rows: 'products[category]',
  title: 'Name the best seller',
  concept: [
    '`TOPN(1, VALUES(products[name]), [Sales])` is a table with one row: whichever product showing has the most sales.',
    '`CONCATENATEX(table, products[name], ", ")` joins the names in a table into one piece of text. With one row, that is just the name.',
    "On a category row you get that category's best seller, and on the total the best seller of all. A tie would list both names.",
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Best Seller`: the name of the product with the most sales.',
  hint: '`Best Seller = CONCATENATEX(TOPN(1, VALUES(products[name]), [Sales]), products[name], ", ")`',
  solution: `Sales = ${SALES}
Best Seller = CONCATENATEX(TOPN(1, VALUES(products[name]), [Sales]), products[name], ", ")`,
  check: `_dax_expect("Best Seller", 'CONCATENATEX(TOPN(1, VALUES(products[name]), [Sales]), products[name], ", ")', helpers={"Sales": "${SALES}"}, uses=["TOPN"])`,
},
{
  id: 'dx-30', mins: 4, rows: 'customers[city]',
  title: 'Customers who never ordered',
  concept: [
    "`FILTER(customers, ...)` goes through the customers one at a time. Inside it, `CALCULATE(COUNTROWS(orders))` counts that one customer's orders.",
    'CALCULATE is what turns "the customer on this row" into a filter on orders. Without it, `COUNTROWS(orders)` would count every order for every customer.',
    'A customer with no orders gets BLANK, not 0, so test it with `ISBLANK(...)`.',
  ],
  starter: `Customers = COUNTROWS(customers)`,
  task: 'Add `Never Ordered`: how many customers have no orders at all.',
  hint: '`Never Ordered = COUNTROWS(FILTER(customers, ISBLANK(CALCULATE(COUNTROWS(orders)))))`',
  solution: `Customers = COUNTROWS(customers)
Never Ordered = COUNTROWS(FILTER(customers, ISBLANK(CALCULATE(COUNTROWS(orders)))))`,
  check: `_dax_expect("Never Ordered", "COUNTROWS(FILTER(customers, ISBLANK(CALCULATE(COUNTROWS(orders)))))", helpers={"Customers": "COUNTROWS(customers)"}, uses=["FILTER"])`,
},

/* ── Analyst patterns ──────────────────────────────────── */
{
  id: 'dx-31', mins: 4, rows: 'products[category]',
  title: 'A fixed window: DATESBETWEEN',
  concept: [
    '`DATESBETWEEN(calendar[date], DATE(2024, 3, 1), DATE(2024, 5, 31))` is every date from 1 March to 31 May, both ends included.',
    'Inside CALCULATE it replaces whatever dates were showing, so the measure is always about that window: a promotion, a season, a quarter that matters.',
    '`DATE(year, month, day)` builds a date, with the month as a number: 3 is March.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Spring Sales`: the sales from 1 March to 31 May 2024.',
  hint: '`Spring Sales = CALCULATE([Sales], DATESBETWEEN(calendar[date], DATE(2024, 3, 1), DATE(2024, 5, 31)))`',
  solution: `Sales = ${SALES}
Spring Sales = CALCULATE([Sales], DATESBETWEEN(calendar[date], DATE(2024, 3, 1), DATE(2024, 5, 31)))`,
  check: `_dax_expect("Spring Sales", "CALCULATE([Sales], DATESBETWEEN(calendar[date], DATE(2024, 3, 1), DATE(2024, 5, 31)))", helpers={"Sales": "${SALES}"}, uses=["DATESBETWEEN"])`,
},
{
  id: 'dx-32', mins: 4, rows: 'products[name]',
  title: 'Hide the rank on the total',
  concept: [
    'A rank on the total row means nothing. Everything together, ranked against single products, simply comes out 1.',
    '`ISFILTERED(products[name])` is TRUE on a product row and FALSE on the total, where no one product is picked.',
    '`IF(ISFILTERED(products[name]), RANKX(...))` gives the rank on product rows. An IF with no third part gives BLANK, so the total cell stays empty.',
  ],
  starter: `Sales = ${SALES}
Rank = RANKX(ALL(products[name]), [Sales])`,
  task: 'Change `Rank` so the total row is blank, while every product keeps its rank.',
  hint: '`Rank = IF(ISFILTERED(products[name]), RANKX(ALL(products[name]), [Sales]))`',
  solution: `Sales = ${SALES}
Rank = IF(ISFILTERED(products[name]), RANKX(ALL(products[name]), [Sales]))`,
  check: `_dax_expect("Rank", "IF(ISFILTERED(products[name]), RANKX(ALL(products[name]), [Sales]))", helpers={"Sales": "${SALES}"})`,
},
{
  id: 'dx-33', mins: 5, rows: 'products[name]',
  title: 'Running share: the Pareto line',
  concept: [
    "Line the products up from best seller down. A product's **running share** is its sales plus the sales of every product above it, as a share of all sales.",
    "`VAR mine = [Sales]` keeps this product's sales. Then `FILTER(ALL(products[name]), [Sales] >= mine)` is this product and every product that sold at least as much.",
    'CALCULATE([Sales]) over that list, divided by all sales, is the running share. A few products usually make most of the money: the 80/20, or Pareto, rule.',
  ],
  starter: `Sales = ${SALES}
Share = DIVIDE([Sales], CALCULATE([Sales], ALL(products[name])))`,
  task: 'Add `Running Share`: the share of all sales made by this product and every product that sold more.',
  hint: '`Running Share = VAR mine = [Sales] RETURN DIVIDE(CALCULATE([Sales], FILTER(ALL(products[name]), [Sales] >= mine)), CALCULATE([Sales], ALL(products[name])))`, across several lines if you like.',
  solution: `Sales = ${SALES}
Share = DIVIDE([Sales], CALCULATE([Sales], ALL(products[name])))
Running Share =
    VAR mine = [Sales]
    RETURN DIVIDE(
        CALCULATE([Sales], FILTER(ALL(products[name]), [Sales] >= mine)),
        CALCULATE([Sales], ALL(products[name]))
    )`,
  check: `_dax_expect("Running Share", "VAR mine = [Sales] RETURN DIVIDE(CALCULATE([Sales], FILTER(ALL(products[name]), [Sales] >= mine)), CALCULATE([Sales], ALL(products[name])))", helpers={"Sales": "${SALES}"}, uses=["FILTER"])`,
},
{
  id: 'dx-34', mins: 4, rows: 'products[name]',
  title: 'A, B or C',
  concept: [
    '**ABC analysis** sorts products by how much they matter: A makes the first 70% of sales, B the next 20%, and C is the long tail.',
    '`SWITCH(TRUE(), [Running Share] <= 0.7, "A", [Running Share] <= 0.9, "B", "C")` tries the tests in order and gives the first one that is true.',
    'Wrap it in `IF(ISFILTERED(products[name]), ...)`, as with the rank, so the total row stays blank.',
  ],
  starter: `Sales = ${SALES}
Running Share =
    VAR mine = [Sales]
    RETURN DIVIDE(
        CALCULATE([Sales], FILTER(ALL(products[name]), [Sales] >= mine)),
        CALCULATE([Sales], ALL(products[name]))
    )`,
  task: 'Add `Class`: "A" up to a running share of 0.7, "B" up to 0.9, and "C" after that. Blank on the total.',
  hint: '`Class = IF(ISFILTERED(products[name]), SWITCH(TRUE(), [Running Share] <= 0.7, "A", [Running Share] <= 0.9, "B", "C"))`',
  solution: `Sales = ${SALES}
Running Share =
    VAR mine = [Sales]
    RETURN DIVIDE(
        CALCULATE([Sales], FILTER(ALL(products[name]), [Sales] >= mine)),
        CALCULATE([Sales], ALL(products[name]))
    )
Class = IF(ISFILTERED(products[name]),
    SWITCH(TRUE(), [Running Share] <= 0.7, "A", [Running Share] <= 0.9, "B", "C"))`,
  check: `_dax_expect("Class", 'IF(ISFILTERED(products[name]), SWITCH(TRUE(), [Running Share] <= 0.7, "A", [Running Share] <= 0.9, "B", "C"))', helpers={"Sales": "${SALES}", "Running Share": "VAR mine = [Sales] RETURN DIVIDE(CALCULATE([Sales], FILTER(ALL(products[name]), [Sales] >= mine)), CALCULATE([Sales], ALL(products[name])))"}, uses=["SWITCH"])`,
},
{
  id: 'dx-35', mins: 5, rows: 'calendar[month]',
  title: 'Customers who came back',
  concept: [
    '`PREVIOUSMONTH(calendar[date])` is every date of the month before the one showing. Inside CALCULATE, it moves a measure back a month.',
    "`FILTER(VALUES(orders[customer_id]), CALCULATE(COUNTROWS(orders), PREVIOUSMONTH(calendar[date])) > 0)` keeps this month's buyers who also bought the month before.",
    'COUNTROWS of that is the number of returning customers. January is blank: the data has no December for anyone to come back from.',
  ],
  starter: `Buyers = DISTINCTCOUNT(orders[customer_id])`,
  task: "Add `Returning`: how many of this month's buyers also ordered the month before.",
  hint: '`Returning = COUNTROWS(FILTER(VALUES(orders[customer_id]), CALCULATE(COUNTROWS(orders), PREVIOUSMONTH(calendar[date])) > 0))`',
  solution: `Buyers = DISTINCTCOUNT(orders[customer_id])
Returning = COUNTROWS(FILTER(VALUES(orders[customer_id]),
    CALCULATE(COUNTROWS(orders), PREVIOUSMONTH(calendar[date])) > 0))`,
  check: `_dax_expect("Returning", "COUNTROWS(FILTER(VALUES(orders[customer_id]), CALCULATE(COUNTROWS(orders), PREVIOUSMONTH(calendar[date])) > 0))", helpers={"Buyers": "DISTINCTCOUNT(orders[customer_id])"}, uses=["PREVIOUSMONTH"])`,
},
];
