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
    'A **measure** is a named formula, like `Total Qty = SUM(order_items[qty])`. It stores no numbers — it works them out for whatever is showing.',
    'In a matrix by product category, every row gets its own answer: one formula, a different slice of the data each time.',
    'Columns are written `table[column]`. That is DAX\'s address for a column.',
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
    '`RELATED` fetches a value from a lookup table for the row you are on — here, that line\'s product price.',
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
    'In the model, lookup tables (products, customers, calendar) filter the data tables (order_items, orders) — never the other way round.',
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
    '`CALCULATE(expression, filter)` works out an expression with a filter added.',
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
    '`VAR name = expression` stores a result; `RETURN` gives the answer. It reads top to bottom, like a recipe.',
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
    'Time intelligence needs a calendar table with every date in it. The model has one: `calendar`.',
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
    'A second argument is the fallback: `SELECTEDVALUE(products[category], "everything")`.',
    '`&` joins text, so a measure can write a label. Report titles that change with the filters are made this way.',
  ],
  starter: `Label = "Sales of " & SELECTEDVALUE(products[category])`,
  task: 'On the total row, `Label` stops at "Sales of". Give `SELECTEDVALUE` a fallback so the total reads `Sales of everything`.',
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
    '`IF(HASONEVALUE(...), value)` with no third argument leaves the total blank.',
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
    '`CONCATENATEX(table, expression, separator)` goes row by row and joins the results into one piece of text.',
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
  title: 'One lookup, two fact tables',
  concept: [
    '`cities` is the lookup for the shop\'s customers **and** the cafe\'s days. So a matrix by country splits both: cafe takings and shop sales side by side.',
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
];
