/* Power BI modelling — the model around the measures: calculated columns,
   the date table, filters through a fact table, and patterns built on a star
   schema (segments, new customers, running totals, recency).

   Calculated columns are written Table[Column] = expression at the left edge,
   and checked row by row with _dax_expect_column. `rows` may be a column the
   lesson itself adds; the starter then errors until it exists, which says so. */

const SALES = 'SUMX(order_items, order_items[qty] * RELATED(products[price]))';
const LIFETIME = 'customers[lifetime sales] = [Sales]';
const SEGMENT = 'customers[segment] = SWITCH(TRUE(), customers[lifetime sales] >= 500, "gold", customers[lifetime sales] >= 200, "silver", "bronze")';

export const POWERBI = [

/* ── Columns and the model ─────────────────────────────── */
{
  id: 'pbi-01', mins: 4, rows: 'products[price band]',
  title: 'A column, not a measure',
  concept: [
    'A **calculated column** is worked out once for every row and stored in the table, like a column that came with the data.',
    'Use a column when you want to **slice by** the result: put it on a matrix\'s rows, or filter on it. Use a measure for numbers that should come out differently in every cell.',
    'Write it with the table first and the new column in brackets, at the left edge: `products[price band] = ...`.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add the column `products[price band]`: `"premium"` when the price is 20 or more, `"standard"` otherwise. The matrix is split by it, so until it exists the matrix has nothing to split by.',
  hint: '`products[price band] = IF(products[price] >= 20, "premium", "standard")`',
  solution: `Sales = ${SALES}
products[price band] = IF(products[price] >= 20, "premium", "standard")`,
  check: `_dax_expect_column("products", "price band", 'IF(products[price] >= 20, "premium", "standard")', uses=["IF"])
_dax_expect("Sales", "${SALES}")`,
},
{
  id: 'pbi-02', mins: 4, rows: 'products[category]',
  title: 'RELATED in a column',
  concept: [
    'A column on a data table can look things up row by row: `order_items[line total] = order_items[qty] * RELATED(products[price])`.',
    'Then plain `SUM(order_items[line total])` matches the SUMX measure. The multiplying already happened, once per row.',
    'The trade-off: a column is stored for every row, so the file gets bigger. A measure is only worked out when it\'s shown. Reach for a measure first, and a column when you need to slice or filter by it.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add the column `order_items[line total]`, then a measure `Sales From Column` that adds it up. It should match `Sales` on every row.',
  hint: '`order_items[line total] = order_items[qty] * RELATED(products[price])`, then `Sales From Column = SUM(order_items[line total])`.',
  solution: `Sales = ${SALES}
order_items[line total] = order_items[qty] * RELATED(products[price])
Sales From Column = SUM(order_items[line total])`,
  check: `_dax_expect_column("order_items", "line total", "order_items[qty] * RELATED(products[price])", uses=["RELATED"])
_dax_expect("Sales From Column", "${SALES}", uses=["SUM"])`,
},
{
  id: 'pbi-03', mins: 4, rows: 'calendar[weekend]',
  title: 'Slice time with the date table',
  concept: [
    'Anything about **when** belongs on the calendar table, as a column. Then every table that points at the calendar can be split by it: orders and cafe days alike.',
    '`calendar[weekend] = calendar[weekday] IN {"Saturday", "Sunday"}` flags each date once.',
    'A TRUE/FALSE column slices like any other: the matrix gets a FALSE row and a TRUE row.',
  ],
  starter: `Orders = COUNTROWS(orders)`,
  task: 'Add the column `calendar[weekend]`: TRUE for Saturdays and Sundays. The matrix splits Orders by it.',
  hint: '`calendar[weekend] = calendar[weekday] IN {"Saturday", "Sunday"}`',
  solution: `Orders = COUNTROWS(orders)
calendar[weekend] = calendar[weekday] IN {"Saturday", "Sunday"}`,
  check: `_dax_expect_column("calendar", "weekend", 'calendar[weekday] IN {"Saturday", "Sunday"}')
_dax_expect("Orders", "COUNTROWS(orders)")`,
},
{
  id: 'pbi-04', mins: 5, rows: 'products[category]',
  title: 'Filter through a fact table',
  concept: [
    'Filters flow from lookups to facts, never back. A category filter reaches order_items but not orders, so `DISTINCTCOUNT(orders[customer_id])` ignores it.',
    'A whole table used as a CALCULATE filter changes that. `CALCULATE(..., order_items)` keeps the order_items rows showing, **and the rows they look up**: their orders, and those orders\' customers.',
    'Power BI calls this the expanded table. It is the exact way to ask "customers who bought something in this category".',
  ],
  starter: `Customers = DISTINCTCOUNT(orders[customer_id])`,
  task: 'Add `Buyers`: different customers with an order that included something from the row\'s category. Count them inside CALCULATE, with `order_items` as the filter. Notice `Customers` doesn\'t change from row to row.',
  hint: '`Buyers = CALCULATE(DISTINCTCOUNT(orders[customer_id]), order_items)`',
  solution: `Customers = DISTINCTCOUNT(orders[customer_id])
Buyers = CALCULATE(DISTINCTCOUNT(orders[customer_id]), order_items)`,
  check: `_dax_expect("Buyers", "COUNTROWS(SUMMARIZE(order_items, orders[customer_id]))", uses=["CALCULATE"])`,
},
{
  id: 'pbi-05', mins: 5, rows: 'customers[city]',
  title: 'A measure inside a column',
  concept: [
    'A calculated column can use a measure. On each row the measure is worked out **for that row**: context transition again.',
    'So `customers[lifetime sales] = [Sales]` stores every customer\'s own total, on the customer.',
    'Now customers can be filtered by it, like any column: `CALCULATE(COUNTROWS(customers), customers[lifetime sales] >= 300)`.',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add the column `customers[lifetime sales]` from the Sales measure, then `Big Spenders`: how many customers have lifetime sales of 300 or more.',
  hint: `\`${LIFETIME}\`, then \`Big Spenders = CALCULATE(COUNTROWS(customers), customers[lifetime sales] >= 300)\`.`,
  solution: `Sales = ${SALES}
${LIFETIME}
Big Spenders = CALCULATE(COUNTROWS(customers), customers[lifetime sales] >= 300)`,
  check: `_dax_expect_column("customers", "lifetime sales", "[Sales]", helpers={"Sales": "${SALES}"})
_dax_expect("Big Spenders", "CALCULATE(COUNTROWS(customers), customers[lifetime sales] >= 300)")`,
},

/* ── Patterns on a star schema ─────────────────────────── */
{
  id: 'pbi-06', mins: 4, rows: 'customers[segment]',
  title: 'Segments as a column',
  concept: [
    'Customer segments like gold, silver and bronze are a classic column: decided once per customer, then used to slice everything.',
    '`SWITCH(TRUE(), ...)` tries the bands in order, highest first.',
    'A segment in a column can go on any visual\'s rows or into any filter. A segment worked out inside a measure can\'t.',
  ],
  starter: `Sales = ${SALES}
${LIFETIME}`,
  task: 'Add the column `customers[segment]`: `"gold"` from 500 lifetime sales, `"silver"` from 200, and `"bronze"` below that, including customers who never bought. The matrix shows Sales by segment.',
  hint: '`customers[segment] = SWITCH(TRUE(), customers[lifetime sales] >= 500, "gold", customers[lifetime sales] >= 200, "silver", "bronze")`',
  solution: `Sales = ${SALES}
${LIFETIME}
${SEGMENT}`,
  check: `_dax_expect_column("customers", "segment", 'SWITCH(TRUE(), customers[lifetime sales] >= 500, "gold", customers[lifetime sales] >= 200, "silver", "bronze")', uses=["SWITCH"])
_dax_expect("Sales", "${SALES}")`,
},
{
  id: 'pbi-07', mins: 5, rows: 'calendar[month]',
  title: 'New customers each month',
  concept: [
    'When did each customer first buy? That\'s a column: `customers[first order] = CALCULATE(MIN(orders[order_date]))`.',
    'That date has no relationship to the calendar, so a month on the matrix doesn\'t filter customers by it. Compare it with the dates showing instead: `MIN(calendar[date])` to `MAX(calendar[date])`.',
    'A customer is new in a month when their first order falls inside it.',
  ],
  starter: `customers[first order] = CALCULATE(MIN(orders[order_date]))`,
  task: 'Add `New Customers`: how many customers had their first order inside the month showing.',
  hint: '`New Customers = COUNTROWS(FILTER(customers, customers[first order] >= MIN(calendar[date]) && customers[first order] <= MAX(calendar[date])))`',
  solution: `customers[first order] = CALCULATE(MIN(orders[order_date]))
New Customers = COUNTROWS(FILTER(customers, customers[first order] >= MIN(calendar[date]) && customers[first order] <= MAX(calendar[date])))`,
  check: `_dax_expect_column("customers", "first order", "CALCULATE(MIN(orders[order_date]))")
_dax_expect("New Customers", "COUNTROWS(FILTER(customers, customers[first order] >= MIN(calendar[date]) && customers[first order] <= MAX(calendar[date])))", uses=["FILTER"])`,
},
{
  id: 'pbi-08', mins: 4, rows: 'calendar[month]',
  title: 'A running total',
  concept: [
    'A running total adds everything up to the last date showing. Unlike TOTALYTD it never starts again in January.',
    '`FILTER(ALL(calendar[date]), calendar[date] <= MAX(calendar[date]))` is every date up to the end of the row\'s month.',
    'Given to CALCULATE, that replaces the month filter with "everything so far".',
  ],
  starter: `Sales = ${SALES}`,
  task: 'Add `Running Sales`: sales from the first date up to the end of each month.',
  hint: '`Running Sales = CALCULATE([Sales], FILTER(ALL(calendar[date]), calendar[date] <= MAX(calendar[date])))`',
  solution: `Sales = ${SALES}
Running Sales = CALCULATE([Sales], FILTER(ALL(calendar[date]), calendar[date] <= MAX(calendar[date])))`,
  check: `_dax_expect("Running Sales", "CALCULATE([Sales], FILTER(ALL(calendar[date]), calendar[date] <= MAX(calendar[date])))", helpers={"Sales": "${SALES}"}, uses=["FILTER"])`,
},
{
  id: 'pbi-09', mins: 5, rows: 'customers[city]',
  title: 'Days since the last order',
  concept: [
    'How recently someone bought is a column too. `DATE(2024, 6, 30) - customers[last order]` gives the days since, counted from the end of the data.',
    'A customer who never ordered has no last order. Give them a blank, not a made-up number: `IF(ISBLANK(...), BLANK(), ...)`.',
    'Then "lapsed" is just a filter on that column.',
  ],
  starter: `customers[last order] = CALCULATE(MAX(orders[order_date]))`,
  task: 'Add the column `customers[days since]`: days from each customer\'s last order to 30 June 2024, blank if they never ordered. Then `Lapsed`: customers whose last order was more than 30 days before.',
  hint: '`customers[days since] = IF(ISBLANK(customers[last order]), BLANK(), DATE(2024, 6, 30) - customers[last order])`, then `Lapsed = CALCULATE(COUNTROWS(customers), customers[days since] > 30)`.',
  solution: `customers[last order] = CALCULATE(MAX(orders[order_date]))
customers[days since] = IF(ISBLANK(customers[last order]), BLANK(), DATE(2024, 6, 30) - customers[last order])
Lapsed = CALCULATE(COUNTROWS(customers), customers[days since] > 30)`,
  check: `_dax_expect_column("customers", "days since", "IF(ISBLANK(customers[last order]), BLANK(), DATE(2024, 6, 30) - customers[last order])", uses=["ISBLANK"])
_dax_expect("Lapsed", "CALCULATE(COUNTROWS(customers), customers[days since] > 30)")`,
},
{
  id: 'pbi-10', mins: 4, rows: 'customers[segment]',
  title: 'Value per segment',
  concept: [
    'A model earns its keep when columns and measures work together: columns to slice by, measures to count.',
    'Average order value by segment asks: do gold customers place bigger orders, or just more of them?',
    'The measures stay right in every row because each is worked out inside that segment\'s filter.',
  ],
  starter: `Sales = ${SALES}
${LIFETIME}
${SEGMENT}`,
  task: 'Add `Orders` (a count of orders) and `Avg Order` (Sales divided by Orders), to compare the segments.',
  hint: '`Orders = COUNTROWS(orders)`, then `Avg Order = DIVIDE([Sales], [Orders])`.',
  solution: `Sales = ${SALES}
${LIFETIME}
${SEGMENT}
Orders = COUNTROWS(orders)
Avg Order = DIVIDE([Sales], [Orders])`,
  check: `_dax_expect("Orders", "COUNTROWS(orders)")
_dax_expect("Avg Order", "DIVIDE([Sales], COUNTROWS(orders))", helpers={"Sales": "${SALES}"}, uses=["DIVIDE"])`,
},
];
