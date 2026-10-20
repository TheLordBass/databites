/* Power BI modelling (pbi-01 to pbi-10): the fuller teaching, a worked
   example and the task as a brief (see detail/index.js). An example that
   makes a column of its own slices its matrix by it (example.rows,
   curriculum/index.js examplePrelude). */

const MODEL = ["The shop's model is loaded. `orders` (one row per order), `order_items` (one row per product in an order, with its `qty`), `products` (name, category, price), `customers` (name, city, joined), `calendar` (every date, with its month and weekday) and `cities`, all linked by their ids."];

export const POWERBI_DETAIL = {
'pbi-01': {
  explain: [
    'A **calculated column** is worked out once for every row and stored in the table, like a column that came with the data.',
    'Use a column when you want to **slice by** the result: put it on a matrix\'s rows, or filter on it.',
    'Use a measure for numbers that should come out differently in every cell.',
    'Write a column with its table first and the new name in brackets, at the left edge: `products[price band] = ...`.',
    'In a column you can use the row\'s own values directly: `products[price]` is this product\'s price.',
  ],
  example: {
    rows: 'products[cheap]',
    say: 'Here a column splits the products at 10, and the matrix counts the products on each side.',
    code: `products[cheap] = IF(products[price] < 10, "under 10", "10 or more")
Products = COUNTROWS(products)`,
    lines: [
      ['products[cheap] = ...', 'a new column on products, worked out for each product.'],
      ['the matrix', 'split by the new column: one row for each of its values.'],
    ],
  },
  brief: {
    story: 'The buyer wants sales split into premium and standard products.',
    get: [MODEL],
    want: ['Add the column `products[price band]`: `"premium"` when the price is 20 or more, `"standard"` otherwise'],
    out: 'A matrix split by price band, with Sales on each row.',
  },
},
'pbi-02': {
  explain: [
    'A column on a data table can look things up row by row, with RELATED.',
    '`order_items[line total] = order_items[qty] * RELATED(products[price])` stores each line\'s value.',
    'Then a plain `SUM(order_items[line total])` matches the SUMX measure. The multiplying already happened, once per row.',
    'The trade-off: a column is stored for every row, so the file gets bigger. A measure is only worked out when it is shown.',
    'Reach for a measure first, and a column when you need to slice or filter by it.',
  ],
  example: {
    say: 'Here a column marks each order line with 3 or more items, and a measure adds the marks up.',
    code: `order_items[big line] = IF(order_items[qty] >= 3, 1, 0)
Big Lines = SUM(order_items[big line])`,
    lines: [
      ['order_items[big line]', '1 on lines of 3 or more, 0 on the rest.'],
      ['SUM(order_items[big line])', 'adds the 1s: how many big lines in each category.'],
    ],
  },
  brief: {
    story: 'The finance team wants each line\'s value stored, so other reports can use it.',
    get: [MODEL],
    want: ['Add the column `order_items[line total]`', 'Add a measure `Sales From Column` that adds it up'],
    out: 'A matrix by category where `Sales From Column` matches `Sales` on every row.',
  },
},
'pbi-03': {
  explain: [
    'Anything about **when** belongs on the calendar table, as a column.',
    'Then every table that points at the calendar can be split by it: orders and café days alike.',
    '`x IN {"a", "b"}` is TRUE when x is any of the values in the curly brackets.',
    '`calendar[weekend] = calendar[weekday] IN {"Saturday", "Sunday"}` flags each date once.',
    'A TRUE/FALSE column slices like any other: the matrix gets a FALSE row and a TRUE row.',
  ],
  example: {
    rows: 'calendar[early week]',
    say: 'Here the dates are flagged for Monday to Wednesday, and orders are split by the flag.',
    code: `calendar[early week] = calendar[weekday] IN {"Monday", "Tuesday", "Wednesday"}
Orders = COUNTROWS(orders)`,
    lines: [
      ['IN {...}', 'TRUE for Mondays, Tuesdays and Wednesdays.'],
      ['the matrix', 'a FALSE row and a TRUE row, with each one\'s orders.'],
    ],
  },
  brief: {
    story: 'The manager wants to know how much of the online trade comes at weekends.',
    get: [MODEL],
    want: ['Add the column `calendar[weekend]`: TRUE for Saturdays and Sundays'],
    out: 'A matrix with a FALSE row and a TRUE row, splitting Orders.',
  },
},
'pbi-04': {
  explain: [
    'A **fact table** records events, one row each: `orders`, `order_items`. A **lookup table** describes things: `products`, `customers`.',
    'Filters flow from lookups to facts, never back. So a category filter reaches order_items, but not orders.',
    'A whole table used as a CALCULATE filter changes that.',
    '`CALCULATE(..., order_items)` keeps the order_items rows showing, **and the rows they look up**: their orders, and those orders\' customers.',
    'Power BI calls this the **expanded table**.',
  ],
  example: {
    say: 'Here orders are counted plainly, then through the order lines showing.',
    code: `Orders = COUNTROWS(orders)
Orders Here = CALCULATE(COUNTROWS(orders), order_items)`,
    lines: [
      ['Orders', 'the same on every row: the category filter can\'t reach orders.'],
      ['CALCULATE(..., order_items)', 'only the orders behind this category\'s lines.'],
    ],
  },
  brief: {
    story: 'The buyer wants to know how many different customers bought from each category.',
    get: [MODEL],
    want: ['Add `Buyers`: different customers with an order that included something from the row\'s category', 'Count them inside CALCULATE, with `order_items` as the filter'],
    out: 'A matrix by category. `Customers` stays the same on every row; `Buyers` changes.',
  },
},
'pbi-05': {
  explain: [
    'A calculated column can use a measure.',
    'On each row, the measure is worked out **for that row**: context transition again.',
    'So `customers[lifetime sales] = [Sales]` stores every customer\'s own total, on the customer.',
    'Now customers can be filtered by it, like any column.',
    '`CALCULATE(COUNTROWS(customers), customers[lifetime sales] >= 300)` counts the big spenders.',
  ],
  example: {
    say: 'Here each customer stores their own number of orders, and the busy ones are counted by city.',
    code: `customers[order count] = CALCULATE(COUNTROWS(orders))
Busy Customers = CALCULATE(COUNTROWS(customers), customers[order count] >= 5)`,
    lines: [
      ['CALCULATE(COUNTROWS(orders))', 'in a column, CALCULATE makes it this customer\'s orders.'],
      ['customers[order count] >= 5', 'a filter on the new column.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants the big spenders in each city.',
    get: [MODEL],
    want: ['Add the column `customers[lifetime sales]` from the Sales measure', 'Add `Big Spenders`: how many customers have lifetime sales of 300 or more'],
    out: 'A matrix by city.',
  },
},
'pbi-06': {
  explain: [
    'The shop is a **star schema**: fact tables in the middle, lookup tables around them like the points of a star.',
    'Customer segments like gold, silver and bronze belong on a lookup table, as a column.',
    'They are decided once per customer, then used to slice everything.',
    '`SWITCH(TRUE(), ...)` tries the bands in order, highest first.',
    "A segment in a column can go on any visual's rows or into any filter. One worked out inside a measure can't.",
  ],
  example: {
    rows: 'customers[orders band]',
    say: 'Here customers are banded by how many orders they placed, and counted in each band.',
    code: `customers[order count] = CALCULATE(COUNTROWS(orders))
customers[orders band] = SWITCH(TRUE(), customers[order count] >= 6, "6 or more", customers[order count] >= 3, "3 to 5", "under 3")
Customers = COUNTROWS(customers)`,
    lines: [
      ['customers[order count]', 'each customer\'s orders. Blank for those who never ordered.'],
      ['SWITCH(TRUE(), ...)', 'the first band that fits. A blank count fits none of the tests, so it lands in "under 3".'],
    ],
  },
  brief: {
    story: 'Marketing wants gold, silver and bronze customers, to use in every report.',
    get: [MODEL, ['The starter adds `customers[lifetime sales]`.']],
    want: ['Add the column `customers[segment]`: `"gold"` from 500 lifetime sales, `"silver"` from 200, `"bronze"` below that', 'Customers who never bought are bronze'],
    out: 'A matrix with one row per segment, showing Sales.',
  },
},
'pbi-07': {
  explain: [
    'When did each customer first buy? That is a column: `customers[first order] = CALCULATE(MIN(orders[order_date]))`.',
    "That date has no relationship to the calendar, so a month on the matrix doesn't filter customers by it.",
    'Compare it with the dates showing instead: `MIN(calendar[date])` to `MAX(calendar[date])`.',
    '`&&` means "and": both tests must be true.',
    'A customer is new in a month when their first order falls inside it.',
  ],
  example: {
    say: 'Here customers are counted in the month of their last order: the month they were last seen.',
    code: `customers[last order] = CALCULATE(MAX(orders[order_date]))
Last Seen = COUNTROWS(FILTER(customers, customers[last order] >= MIN(calendar[date]) && customers[last order] <= MAX(calendar[date])))`,
    lines: [
      ['MIN(calendar[date]), MAX(calendar[date])', 'the first and last dates of the month showing.'],
      ['&&', 'the last order must be on or after the first date and on or before the last.'],
    ],
  },
  brief: {
    story: 'The growth team wants to know how many new customers each month brought.',
    get: [MODEL, ['The starter adds `customers[first order]`.']],
    want: ['Add `New Customers`: how many customers had their first order inside the month showing'],
    out: 'A matrix by month.',
  },
},
'pbi-08': {
  explain: [
    'A running total adds everything up to the last date showing.',
    'Unlike TOTALYTD, it never starts again in January.',
    '`ALL(calendar[date])` is every date, whatever is showing.',
    '`FILTER(ALL(calendar[date]), calendar[date] <= MAX(calendar[date]))` keeps every date up to the end of the row\'s month.',
    'Given to CALCULATE, that replaces the month filter with "everything so far".',
  ],
  example: {
    say: 'Here each month counts the dates from the very first one to its own last day.',
    code: `Days So Far = COUNTROWS(FILTER(ALL(calendar[date]), calendar[date] <= MAX(calendar[date])))`,
    lines: [
      ['ALL(calendar[date])', 'every date in the calendar.'],
      ['<= MAX(calendar[date])', 'kept if on or before the end of the month showing.'],
    ],
  },
  brief: {
    story: 'The owner wants to watch total sales build up since the shop opened.',
    get: [MODEL],
    want: ['Add `Running Sales`: sales from the first date up to the end of each month'],
    out: 'A matrix by month, rising each month.',
  },
},
'pbi-09': {
  explain: [
    'How recently someone bought is a column too.',
    '`DATE(2024, 6, 30) - customers[last order]` gives the days since, counted from the end of the data.',
    'Taking one date from another gives the number of days between them.',
    "A customer who never ordered has no last order. Give them a blank, not a made-up number: `IF(ISBLANK(...), BLANK(), ...)`.",
    'Then "lapsed" is just a filter on that column.',
  ],
  example: {
    say: 'Here each customer stores how long ago they joined, and the average is shown by city.',
    code: `customers[days joined] = DATE(2024, 6, 30) - customers[joined]
Avg Days Joined = AVERAGE(customers[days joined])`,
    lines: [
      ['DATE(2024, 6, 30) - customers[joined]', 'the days from joining to the end of the data.'],
      ['AVERAGE(...)', 'the average of the new column, in each city.'],
    ],
  },
  brief: {
    story: 'Marketing wants a win-back list: customers who have gone quiet.',
    get: [MODEL, ['The starter adds `customers[last order]`.']],
    want: ['Add the column `customers[days since]`: days from each customer\'s last order to 30 June 2024, blank if they never ordered', 'Add `Lapsed`: customers whose last order was more than 30 days before'],
    out: 'A matrix by city.',
  },
},
'pbi-10': {
  explain: [
    'A model earns its keep when columns and measures work together: columns to slice by, measures to count.',
    'Average order value by segment asks: do gold customers place bigger orders, or just more of them?',
    'Order frequency asks the other half: how many orders does each customer place?',
    "The measures stay right in every row, because each is worked out inside that row's filter.",
  ],
  example: {
    rows: 'customers[city]',
    say: 'Here is how many orders a buying customer places in each city.',
    code: `Orders = COUNTROWS(orders)
Buyers = DISTINCTCOUNT(orders[customer_id])
Orders Each = DIVIDE([Orders], [Buyers])`,
    lines: [
      ['[Orders], [Buyers]', 'two counts, each for the city showing.'],
      ['DIVIDE(...)', 'orders per buying customer.'],
    ],
  },
  brief: {
    story: 'Marketing asks whether gold customers spend more per order, or simply order more.',
    get: [MODEL, ['The starter adds `customers[lifetime sales]` and `customers[segment]`.']],
    want: ['Add `Orders`: a count of orders', 'Add `Avg Order`: Sales divided by Orders'],
    out: 'A matrix with one row per segment.',
  },
},
};
