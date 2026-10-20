/* DAX (dx-01 to dx-35): the fuller teaching, a worked example and the task
   as a brief (see detail/index.js). Each example is a different measure,
   shown in the lesson's own matrix, so it never gives the task's answer. */

const MODEL = ["The shop's model is loaded. `orders` (one row per order), `order_items` (one row per product in an order, with its `qty`), `products` (name, category, price), `customers` (name, city), `calendar` (every date, with its month) and `cities` (city, country), all linked by their ids."];
const byCategory = 'A matrix with one row per product category, and a total.';
const byCity = 'A matrix with one row per customer city, and a total.';
const byMonth = 'A matrix with one row per month, January to June, and a total.';
const byProduct = 'A matrix with one row per product, and a total.';

export const DAX_DETAIL = {
'dx-01': {
  explain: [
    '**DAX** is the formula language of Power BI.',
    'A **measure** is a named formula, like `Total Qty = SUM(order_items[qty])`: the name, an equals sign, then the formula.',
    'A measure stores no numbers. It works them out for whatever is on show.',
    'Here the answers appear in a **matrix**, Power BI\'s kind of table, with one row per product category. Every row gets its own answer from the same formula.',
    'Columns are written `table[column]`. Each measure goes on its own line, starting at the left edge.',
  ],
  example: {
    say: 'Here a measure counts the products in each category.',
    code: 'Products = COUNTROWS(products)',
    lines: [
      ['Products =', 'the measure\'s name.'],
      ['COUNTROWS(products)', 'counts the rows of the products table: on each row of the matrix, only that category\'s products.'],
    ],
  },
  brief: {
    story: 'The buyer wants to know how many units of each category have sold.',
    get: [MODEL],
    want: ['Keep `Lines`', 'Add `Total Qty`: the sum of `order_items[qty]`, on a new line'],
    out: byCategory,
  },
},
'dx-02': {
  explain: [
    '`SUM` adds up one column. To multiply two things first, quantity times price, you have to go row by row.',
    '`SUMX(table, formula)` works the formula out on every row of the table, then adds up the answers.',
    'Functions ending in X work row by row like this. They are called **iterators**.',
    '`RELATED(products[price])` fetches the price from the `products` table, for the product on the row you are on.',
    'So `SUMX(order_items, order_items[qty] * RELATED(products[price]))` is the money.',
  ],
  example: {
    say: 'Here each order line fetches its product\'s price, and those prices are added up.',
    code: 'Shelf Price = SUMX(order_items, RELATED(products[price]))',
    lines: [
      ['SUMX(order_items, ...)', 'goes through the order lines one at a time.'],
      ['RELATED(products[price])', 'the price of that line\'s product, ignoring how many were bought.'],
    ],
  },
  brief: {
    story: 'The buyer wants sales in money, not units.',
    get: [MODEL],
    want: ['Make `Sales` the money: quantity times price, line by line'],
    out: byCategory,
  },
},
'dx-03': {
  explain: [
    'A measure can use another: `[Sales]` in square brackets means "the Sales measure, for whatever is showing".',
    '`DIVIDE(a, b)` divides a by b.',
    'If b is zero, DIVIDE gives a blank instead of an error.',
    'Build small measures and combine them. Each one is easy to check on its own.',
    'If a small one is wrong, fixing it fixes every measure built on it.',
  ],
  example: {
    say: 'Here two small measures are combined into a third: units per order line.',
    code: `Qty = SUM(order_items[qty])
Lines = COUNTROWS(order_items)
Qty Per Line = DIVIDE([Qty], [Lines])`,
    lines: [
      ['[Qty], [Lines]', 'the two measures above, used by name.'],
      ['DIVIDE(...)', 'units divided by lines, for each city.'],
    ],
  },
  brief: {
    story: 'Finance wants the average order value in each city.',
    get: [MODEL],
    want: ['Keep `Sales` and `Orders`', 'Add `Avg Order`: Sales divided by Orders, using `DIVIDE` and the two measures'],
    out: byCity,
  },
},
'dx-04': {
  explain: [
    '`COUNTROWS(orders)` counts orders.',
    '`DISTINCTCOUNT(orders[customer_id])` counts the different customers behind them.',
    'Someone who ordered three times in March is 3 orders, but 1 customer.',
    'Say what one row is before you count.',
    'That is half of getting a measure right.',
  ],
  example: {
    say: 'Here order lines and the different products in them are counted each month.',
    code: `Lines = COUNTROWS(order_items)
Products Sold = DISTINCTCOUNT(order_items[product_id])`,
    lines: [
      ['COUNTROWS(order_items)', 'every line, so a product bought twice counts twice.'],
      ['DISTINCTCOUNT(...)', 'each different product once.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how many people buy each month, not how many orders there are.',
    get: [MODEL],
    want: ['Keep `Orders`', 'Add `Customers`: how many **different** customers placed an order'],
    out: byMonth,
  },
},
'dx-05': {
  explain: [
    'The tables are linked, and filters flow along the links one way only.',
    'They flow from the tables that describe things (products, customers, calendar) to the tables that record what happened (orders, order_items).',
    'Never back. So a product filter reaches order_items, but not orders or customers.',
    'In a matrix by category, a measure on orders comes out the same on every row.',
    'Count something the filter can reach instead.',
  ],
  example: {
    say: 'Here one measure the category filter can reach sits beside one it can\'t.',
    code: `Lines = COUNTROWS(order_items)
All Customers = COUNTROWS(customers)`,
    lines: [
      ['Lines', 'changes from row to row: the category filter reaches order_items.'],
      ['All Customers', 'the same on every row: the filter can\'t flow up to customers.'],
    ],
  },
  brief: {
    story: 'The buyer wants to know how many orders included something from each category.',
    get: [MODEL],
    want: ['Add `Orders With It`: how many different orders included a product from each category', 'Notice that `Orders` doesn\'t change from row to row'],
    out: byCategory,
  },
},
'dx-06': {
  explain: [
    '`CALCULATE(formula, filter)` works out a formula with a filter of your own added.',
    '`CALCULATE([Sales], products[category] = "beans")` is sales of beans only.',
    'The matrix\'s own filters still apply, so on the Lagos row it is Lagos\'s beans.',
    'Text in a filter goes in double quotes.',
    'It is the most important function in DAX. Most of the rest are variations on it.',
  ],
  example: {
    say: 'Here the order lines for kit are counted in each city.',
    code: `Kit Lines = CALCULATE(COUNTROWS(order_items), products[category] = "kit")`,
    lines: [
      ['COUNTROWS(order_items)', 'what to work out: the lines.'],
      ['products[category] = "kit"', 'the filter CALCULATE adds: kit only.'],
    ],
  },
  brief: {
    story: 'The bean supplier wants to know how their beans sell in each city.',
    get: [MODEL],
    want: ['Add `Beans Sales`: sales of the `"beans"` category only'],
    out: byCity,
  },
},
'dx-07': {
  explain: [
    'A CALCULATE filter **replaces** any filter already on that column.',
    'So in a matrix by category, a "kit only" measure shows the kit total on every row, even the beans row.',
    '`KEEPFILTERS(...)` keeps the matrix\'s own filter as well as yours.',
    'Then only the row your filter agrees with gets a number; the rest are blank.',
    "Replacing is usually what you want. KEEPFILTERS is for when it isn't.",
  ],
  example: {
    say: 'Here kit lines are counted both ways in a matrix by category.',
    code: `Lines = COUNTROWS(order_items)
Kit Lines = CALCULATE([Lines], products[category] = "kit")
Kit Here = CALCULATE([Lines], KEEPFILTERS(products[category] = "kit"))`,
    lines: [
      ['Kit Lines', 'the kit total on every row: the filter replaced each row\'s category.'],
      ['Kit Here', 'a number only on the kit row: both filters kept.'],
    ],
  },
  brief: {
    story: 'The report should show beans sales only on the beans row.',
    get: [MODEL],
    want: ['Add `Beans Here`: the beans filter wrapped in `KEEPFILTERS`'],
    out: `${byCategory} Beans Here is blank on every row except beans.`,
  },
},
'dx-08': {
  explain: [
    '`ALL(products)` inside CALCULATE removes every filter on products.',
    'So `CALCULATE([Sales], ALL(products))` is all the sales, on every row.',
    'That is the whole to compare each part against.',
    "Divide a row's Sales by it, and you have that category's share.",
    'A share is a fraction: 0.25 means a quarter.',
  ],
  example: {
    say: 'Here each category\'s lines sit beside all the lines.',
    code: `Lines = COUNTROWS(order_items)
All Lines = CALCULATE([Lines], ALL(products))`,
    lines: [
      ['ALL(products)', 'takes the category filter away.'],
      ['All Lines', 'the same total, 281, on every row.'],
    ],
  },
  brief: {
    story: 'The buyer wants each category\'s share of all sales.',
    get: [MODEL],
    want: ["Add `Share`: each category's share of all sales, as a fraction"],
    out: `${byCategory} The total row is 1.`,
  },
},
'dx-09': {
  explain: [
    'A CALCULATE filter can use any comparison: `=`, `<>` (not equal), `>`, `<`, `>=` and `<=`.',
    '`orders[status] <> "cancelled"` keeps everything except cancelled.',
    'The filter lands on orders, and orders filters order_items.',
    'So [Sales] then counts only the lines of orders that went through.',
    'Name measures for what they mean: `Net Sales`, not `Sales 2`.',
  ],
  example: {
    say: 'Here the lines of delivered orders are counted each month.',
    code: `Lines = COUNTROWS(order_items)
Delivered Lines = CALCULATE([Lines], orders[status] = "delivered")`,
    lines: [
      ['orders[status] = "delivered"', 'only orders that were delivered.'],
      ['Delivered Lines', 'fewer than Lines: shipped and cancelled orders are left out.'],
    ],
  },
  brief: {
    story: 'Finance only counts money from orders that went through.',
    get: [MODEL],
    want: ["Add `Net Sales`: sales from the orders that weren't cancelled"],
    out: byMonth,
  },
},
'dx-10': {
  explain: [
    '`FILTER(table, condition)` goes through a table row by row and keeps the rows where the condition is true.',
    '`FILTER(customers, [Sales] > 300)` keeps the customers whose Sales is over 300.',
    'Inside FILTER, `[Sales]` is worked out for **that one customer**.',
    'A measure used on a row turns the row into a filter. That is called **context transition**.',
    '`COUNTROWS(FILTER(...))` counts what is left.',
  ],
  example: {
    say: 'Here the customers with 5 or more orders are counted in each city.',
    code: `Orders = COUNTROWS(orders)
Regulars = COUNTROWS(FILTER(customers, [Orders] >= 5))`,
    lines: [
      ['FILTER(customers, [Orders] >= 5)', 'each customer\'s own orders, kept if 5 or more.'],
      ['COUNTROWS(...)', 'how many customers that leaves.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants to know how many big spenders each city has.',
    get: [MODEL],
    want: ['Add `Big Customers`: how many customers bought more than 300 in total'],
    out: byCity,
  },
},
'dx-11': {
  explain: [
    '`AVERAGEX(customers, [Sales])` works out Sales for each customer, then takes the mean.',
    'Like SUMX, it goes row by row. It averages instead of adding.',
    'Customers who never bought give a blank, and AVERAGEX skips blanks.',
    'So this is the average **buying** customer.',
    'That differs from `DIVIDE([Sales], COUNTROWS(customers))`, which spreads the money over everyone.',
  ],
  example: {
    say: 'Here is the average number of orders per customer in each city.',
    code: `Orders = COUNTROWS(orders)
Avg Orders = AVERAGEX(customers, [Orders])`,
    lines: [
      ['AVERAGEX(customers, [Orders])', 'each customer\'s orders, then the average of those.'],
      ['blanks', 'customers with no orders are skipped.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know what a typical buying customer spends in each city.',
    get: [MODEL],
    want: ['Add `Avg Customer`: the average sales per customer, using `AVERAGEX`'],
    out: byCity,
  },
},
'dx-12': {
  explain: [
    '`VAR name = ...` stores a result under a name, and `RETURN` gives the answer.',
    'It reads top to bottom, like a recipe.',
    'A VAR is worked out once, where it is written. Clearer than repeating a measure, and quicker too.',
    'A long measure can run over several lines: start the lines after the first with spaces.',
    '`IF(test, if_true, if_false)` picks one of two results.',
  ],
  example: {
    say: 'Here each month is labelled by how many orders it had.',
    code: `Orders = COUNTROWS(orders)
Order Level =
    VAR n = [Orders]
    RETURN IF(n >= 25, "25 or more", "under 25")`,
    lines: [
      ['VAR n = [Orders]', 'the month\'s orders, stored as n.'],
      ['RETURN IF(...)', 'the answer: one label or the other.'],
    ],
  },
  brief: {
    story: 'The planner wants each month marked busy or quiet.',
    get: [MODEL],
    want: ['Add `Month Type`: `"busy"` when a month\'s Sales is over 2000, `"quiet"` otherwise', 'Store the Sales in a VAR first'],
    out: byMonth,
  },
},
'dx-13': {
  explain: [
    '`RANKX(ALL(products[name]), [Sales])` gives this product\'s place by Sales: 1 for the best.',
    'It compares the row\'s Sales with every product\'s.',
    '`ALL(products[name])` is the list to rank against.',
    'Without ALL, the only product in the list would be the row\'s own, and everything would rank 1.',
    'Ties share a rank, and the next rank is skipped: 1, 1, 3.',
  ],
  example: {
    say: 'Here products are ranked by units sold.',
    code: `Qty = SUM(order_items[qty])
Qty Rank = RANKX(ALL(products[name]), [Qty])`,
    lines: [
      ['ALL(products[name])', 'every product, to rank against.'],
      ['[Qty]', 'what to rank by: units, not money.'],
    ],
  },
  brief: {
    story: 'The buyer wants each product\'s place in the sales league.',
    get: [MODEL],
    want: ['Add `Rank`: each product\'s place by Sales, 1 for the best seller'],
    out: byProduct,
  },
},
'dx-14': {
  explain: [
    '`TOTALYTD([Sales], calendar[date])` adds up Sales from 1 January to the last date showing.',
    'On the March row that is January + February + March; on June, the whole half-year.',
    'Functions that work across dates are called **time intelligence**.',
    'They need a calendar table with every date in it. The model has one: `calendar`.',
    'YTD stands for "year to date".',
  ],
  example: {
    say: 'Here orders are counted month by month, and so far this year.',
    code: `Orders = COUNTROWS(orders)
Orders YTD = TOTALYTD([Orders], calendar[date])`,
    lines: [
      ['TOTALYTD(...)', 'from 1 January up to the end of each month.'],
      ['the June row', 'every order in the data: 150.'],
    ],
  },
  brief: {
    story: 'The board wants to see sales build up through the year.',
    get: [MODEL],
    want: ['Add `Sales YTD`: sales so far this year, month by month'],
    out: byMonth,
  },
},
'dx-15': {
  explain: [
    '`DATEADD(calendar[date], -1, MONTH)` moves the dates showing back one month.',
    'So `CALCULATE([Sales], DATEADD(calendar[date], -1, MONTH))` is last month\'s sales, on this month\'s row.',
    'January has no month before it in the data, so it is blank.',
    'Growth is (this − last) ÷ last. DIVIDE turns January\'s into a blank too, not an error.',
    'Measures built on measures, all the way down.',
  ],
  example: {
    say: 'Here each month\'s orders sit beside the month before.',
    code: `Orders = COUNTROWS(orders)
Prev Orders = CALCULATE([Orders], DATEADD(calendar[date], -1, MONTH))`,
    lines: [
      ['DATEADD(calendar[date], -1, MONTH)', 'the month before the one showing.'],
      ['January', 'blank: there is no December in the data.'],
    ],
  },
  brief: {
    story: 'The owner wants to know whether each month beat the one before.',
    get: [MODEL],
    want: ['Add `Prev Sales`: last month\'s sales', 'Add `Growth`: this month against last, as a fraction (0.1 means 10% up)'],
    out: byMonth,
  },
},
'dx-16': {
  explain: [
    'A measure with nothing to add up gives **BLANK**, not 0.',
    'The tote bag never sold, so its Sales is blank.',
    'A matrix leaves out rows where every measure is blank. That is why the tote bag is missing from the list.',
    '`ISBLANK(x)` is TRUE when x is blank.',
    '`COALESCE([Sales], 0)` gives the first value that isn\'t blank: Sales where there is some, 0 where there isn\'t.',
  ],
  example: {
    say: 'Here a second measure gives every product a word, so the tote bag appears.',
    code: `Qty = SUM(order_items[qty])
Has Sold = IF(ISBLANK([Qty]), "never", "yes")`,
    lines: [
      ['ISBLANK([Qty])', 'TRUE only for the tote bag.'],
      ['Has Sold', 'never blank, so the tote bag gets a row, with Qty empty.'],
    ],
  },
  brief: {
    story: 'The buyer asks why the tote bag isn\'t in the report at all.',
    get: [MODEL],
    want: ['Add `Sales Or Zero`: Sales, but 0 instead of blank'],
    out: `${byProduct} The tote bag turns up.`,
  },
},
'dx-17': {
  explain: [
    '`IF` picks between two answers. For three or more, IFs inside IFs get hard to read.',
    '`SWITCH(TRUE(), test1, result1, test2, result2, otherwise)` tries the tests in order.',
    'It gives the result of the first test that is true.',
    'The last value, with no test, is what you get when none are true.',
    'Order matters: put the highest threshold first.',
  ],
  example: {
    say: 'Here each category gets a word for how many order lines it has.',
    code: `Lines = COUNTROWS(order_items)
Busy = SWITCH(TRUE(), [Lines] >= 100, "lots", [Lines] >= 50, "some", "few")`,
    lines: [
      ['[Lines] >= 100, "lots"', 'tried first.'],
      ['[Lines] >= 50, "some"', 'only reached if the first failed.'],
      ['"few"', 'everything else.'],
    ],
  },
  brief: {
    story: 'The report needs three sizes of category, not two.',
    get: [MODEL],
    want: ['Give `Size` three bands with `SWITCH(TRUE(), ...)`: `"big"` from 5000, `"medium"` from 2000, `"small"` below that'],
    out: byCategory,
  },
},
'dx-18': {
  explain: [
    '`SELECTEDVALUE(products[category])` is the one category showing on this row.',
    'When more than one is showing, as on the total, it is blank.',
    'A second value in the brackets is what to show instead: `SELECTEDVALUE(products[category], "everything")`.',
    '`&` joins text, so a measure can write a label.',
    'Report titles that change with the filters are made this way.',
  ],
  example: {
    say: 'Here each row names its category, and the total says something sensible.',
    code: `Which = SELECTEDVALUE(products[category], "all of them")`,
    lines: [
      ['SELECTEDVALUE(products[category], ...)', 'the category on each row.'],
      ['"all of them"', 'shown on the total, where several categories are showing.'],
    ],
  },
  brief: {
    story: 'The total row\'s label is cut off, and the report looks broken.',
    get: [MODEL],
    want: ['Give `SELECTEDVALUE` a second value, so the total reads `Sales of everything`'],
    out: byCategory,
  },
},
'dx-19': {
  explain: [
    "Some numbers don't add up. A product's price makes sense on its own row, but a total of prices means nothing.",
    '`HASONEVALUE(products[name])` is TRUE when exactly one product is showing.',
    'That is every product row, but not the total.',
    '`IF(HASONEVALUE(...), value)`, with nothing given for "otherwise", leaves the total blank.',
    'A blank total is better than a wrong one.',
  ],
  example: {
    say: 'Here each row says whether it shows one product or many.',
    code: `Showing = IF(HASONEVALUE(products[name]), "one product", "many")`,
    lines: [
      ['HASONEVALUE(products[name])', 'TRUE on each product row.'],
      ['"many"', 'on the total, where all the products are showing.'],
    ],
  },
  brief: {
    story: 'The price list report adds the prices up on its total row, which means nothing.',
    get: [MODEL],
    want: ['Change `Price` so each product still shows its price, and the total row is blank'],
    out: byProduct,
  },
},
'dx-20': {
  explain: [
    '`CONCATENATEX(table, what to write for each row, separator)` goes row by row and joins the results into one piece of text.',
    '`VALUES(products[name])` is the list of names showing.',
    'So `CONCATENATEX(VALUES(products[name]), products[name], ", ")` lists the products showing, with commas between.',
    'Handy for labels and tooltips.',
    'On a big total the list gets long, as the total row shows.',
  ],
  example: {
    say: 'Here the different prices in each category are listed.',
    code: `Prices = CONCATENATEX(VALUES(products[price]), products[price], " / ")`,
    lines: [
      ['VALUES(products[price])', 'each different price showing.'],
      ['" / "', 'what goes between them.'],
    ],
  },
  brief: {
    story: 'The category report needs to say which products are in each category.',
    get: [MODEL],
    want: ['Add `Names`: the names of the products in each category, joined with `", "`'],
    out: byCategory,
  },
},
'dx-21': {
  explain: [
    '`MAXX(customers, ...)` works something out for every customer and keeps the biggest.',
    'Put a plain formula in, and every customer gets the **whole city\'s** answer. A formula on a row doesn\'t filter by that row.',
    'Use a measure instead, and each row becomes a filter first: context transition again.',
    'Wrapping the formula in `CALCULATE(...)` does the same.',
    'That is why measures are worth naming and reusing.',
  ],
  example: {
    say: 'Here the most orders by one customer is found in each city, the right way and the wrong way.',
    code: `Orders = COUNTROWS(orders)
Most Orders = MAXX(customers, [Orders])
Wrong = MAXX(customers, COUNTROWS(orders))`,
    lines: [
      ['MAXX(customers, [Orders])', 'each customer\'s own orders, then the biggest.'],
      ['MAXX(customers, COUNTROWS(orders))', 'every customer sees all the city\'s orders, so it is just the city total.'],
    ],
  },
  brief: {
    story: 'The "best customer" figure is suspiciously big: it matches each city\'s total.',
    get: [MODEL],
    want: ['Fix `Best Customer` so every customer is worked out on their own'],
    out: byCity,
  },
},
'dx-22': {
  explain: [
    'Each row filters one product. To compare it with its category, take the product filter off but keep the category.',
    '`ALL(products[name])` takes the product filter off.',
    "`VALUES(products[category])` on a product's row is that product's category.",
    'Given to CALCULATE as a filter, it puts the category back.',
    'So `CALCULATE([Sales], ALL(products[name]), VALUES(products[category]))` is the sales of the whole category.',
  ],
  example: {
    say: 'Here each product\'s units sit beside its whole category\'s units.',
    code: `Qty = SUM(order_items[qty])
Category Qty = CALCULATE([Qty], ALL(products[name]), VALUES(products[category]))`,
    lines: [
      ['ALL(products[name])', 'removes the product filter.'],
      ['VALUES(products[category])', 'keeps the product\'s own category.'],
    ],
  },
  brief: {
    story: 'The buyer wants each product\'s share of its own category, not of everything.',
    get: [MODEL],
    want: ['Make `Category Sales` keep the product\'s category', "Add `Share Of Category`: the product's Sales divided by it"],
    out: byProduct,
  },
},
'dx-23': {
  explain: [
    '`TOPN(3, ALL(products[name]), [Sales])` is a table: the three product names with the most Sales.',
    'It is worked out where it stands, so on the March row it is **March\'s** top three.',
    'Given to CALCULATE as a filter, it keeps just those products.',
    'So the measure is the sales of the top three, whichever they are that month.',
  ],
  example: {
    say: 'Here each month\'s units come from just its two most-bought products.',
    code: `Qty = SUM(order_items[qty])
Top 2 Qty = CALCULATE([Qty], TOPN(2, ALL(products[name]), [Qty]))`,
    lines: [
      ['TOPN(2, ALL(products[name]), [Qty])', 'the two products with the most units that month.'],
      ['CALCULATE([Qty], ...)', 'the units of just those two.'],
    ],
  },
  brief: {
    story: 'The buyer suspects a few products carry each month.',
    get: [MODEL],
    want: ["Add `Top 3 Sales`: each month, the sales of that month's three best-selling products"],
    out: byMonth,
  },
},
'dx-24': {
  explain: [
    '`DATESINPERIOD(calendar[date], MAX(calendar[date]), -3, MONTH)` is the three months up to the last date showing.',
    'On the April row that is February, March and April.',
    'The window moves with the row, which is why it is called **rolling**.',
    'A rolling total smooths out one odd month.',
    'The first months have less behind them, so they come out smaller.',
  ],
  example: {
    say: 'Here each month\'s orders are added to the month before\'s: a rolling two months.',
    code: `Orders = COUNTROWS(orders)
Orders 2M = CALCULATE([Orders], DATESINPERIOD(calendar[date], MAX(calendar[date]), -2, MONTH))`,
    lines: [
      ['MAX(calendar[date])', 'the last date showing on the row.'],
      ['-2, MONTH', 'two months back from it.'],
    ],
  },
  brief: {
    story: 'One odd month makes the trend hard to read. The owner wants it smoothed.',
    get: [MODEL],
    want: ['Add `Sales 3M`: the sales of the three months up to and including each month'],
    out: byMonth,
  },
},
'dx-25': {
  explain: [
    '`cities` describes the cities for both the shop\'s customers **and** the café\'s days.',
    'So a matrix by country splits both: café takings and shop sales side by side.',
    'A lookup table shared like this is what lets two different sets of data sit in one report.',
    'Power BI calls it a **dimension**.',
    'Rwanda has shop customers but no café, so anything about the café is blank there.',
  ],
  example: {
    say: 'Here café days and shop customers are counted by country.',
    code: `Cafe Days = COUNTROWS(cafe)
Shop Customers = COUNTROWS(customers)`,
    lines: [
      ['Cafe Days', 'the café\'s rows, through cities: blank for Rwanda.'],
      ['Shop Customers', 'the shop\'s customers, through the same cities table.'],
    ],
  },
  brief: {
    story: 'Head office wants to see how much of each country\'s money comes from the café.',
    get: [MODEL, ['`cafe` (one row per day, with `revenue`) is in the model too, linked through `cities`.']],
    want: ['Add `Cafe Share`: Cafe Sales divided by Cafe Sales plus Sales'],
    out: 'A matrix with one row per country, and a total.',
  },
},
'dx-26': {
  explain: [
    '`AVERAGEX(VALUES(calendar[month]), [Sales])` goes through the months one at a time.',
    'For each month it works out `[Sales]`, then it averages the answers.',
    '`VALUES(calendar[month])` is the list of months showing.',
    'Each time round, `[Sales]` sees only that month.',
    "A month with no sales comes out blank, and AVERAGEX skips blanks.",
  ],
  example: {
    say: 'Here each category\'s order lines are averaged over the months.',
    code: `Lines = COUNTROWS(order_items)
Avg Lines Month = AVERAGEX(VALUES(calendar[month]), [Lines])`,
    lines: [
      ['VALUES(calendar[month])', 'the six months.'],
      ['[Lines]', 'worked out for each month, then averaged.'],
    ],
  },
  brief: {
    story: 'The buyer wants each category\'s typical month.',
    get: [MODEL],
    want: ['Add `Avg Month`: the average sales per month, worked out month by month'],
    out: byCategory,
  },
},
'dx-27': {
  explain: [
    '`MAXX` goes through a table like AVERAGEX does, but keeps the biggest answer.',
    '`MAXX(VALUES(calendar[month]), [Sales])` is the sales of the best month.',
    "On the beans row it is beans' best month.",
    'On the total it is the best month for everything together, which can be a different month.',
    'MINX finds the worst month the same way.',
  ],
  example: {
    say: 'Here each category\'s quietest month is found.',
    code: `Lines = COUNTROWS(order_items)
Worst Month = MINX(VALUES(calendar[month]), [Lines])`,
    lines: [
      ['MINX(...)', 'works out each month\'s lines, and keeps the smallest.'],
    ],
  },
  brief: {
    story: 'The buyer wants to see how lumpy each category\'s sales are.',
    get: [MODEL],
    want: ['Add `Best Month`: the sales of the best single month'],
    out: byCategory,
  },
},
'dx-28': {
  explain: [
    '`FILTER(VALUES(calendar[date]), [Orders] >= 2)` keeps the days showing that had 2 or more orders.',
    '`COUNTROWS` around it counts them.',
    '`[Orders]` is worked out again for each day inside FILTER.',
    'That is what lets a measure test every row one by one.',
    'Busy days in a month is steadier than raw orders, which one big day can inflate.',
  ],
  example: {
    say: 'Here the days with no orders at all are counted each month.',
    code: `Orders = COUNTROWS(orders)
Quiet Days = COUNTROWS(FILTER(VALUES(calendar[date]), ISBLANK([Orders])))`,
    lines: [
      ['VALUES(calendar[date])', 'every day in the month.'],
      ['ISBLANK([Orders])', 'kept if that day had no orders.'],
    ],
  },
  brief: {
    story: 'The manager wants to know how many genuinely busy days each month had.',
    get: [MODEL],
    want: ['Add `Busy Days`: how many days had 2 or more orders'],
    out: byMonth,
  },
},
'dx-29': {
  explain: [
    '`TOPN(1, VALUES(products[name]), [Sales])` is a table with one row: the product showing with the most sales.',
    '`CONCATENATEX(table, products[name], ", ")` joins the names in a table into one piece of text.',
    'With one row, that is just the name.',
    "On a category row you get that category's best seller, and on the total the best seller of all.",
    'A tie would list both names.',
  ],
  example: {
    say: 'Here each category names the product bought in the biggest quantity.',
    code: `Qty = SUM(order_items[qty])
Most Bought = CONCATENATEX(TOPN(1, VALUES(products[name]), [Qty]), products[name], ", ")`,
    lines: [
      ['TOPN(1, ..., [Qty])', 'the product with the most units.'],
      ['CONCATENATEX(...)', 'turns that one-row table into its name.'],
    ],
  },
  brief: {
    story: 'The report should name each category\'s star product.',
    get: [MODEL],
    want: ['Add `Best Seller`: the name of the product with the most sales'],
    out: byCategory,
  },
},
'dx-30': {
  explain: [
    '`FILTER(customers, ...)` goes through the customers one at a time.',
    "Inside it, `CALCULATE(COUNTROWS(orders))` counts that one customer's orders.",
    'CALCULATE is what turns "the customer on this row" into a filter on orders.',
    'Without it, `COUNTROWS(orders)` would count every order for every customer.',
    'A customer with no orders gets BLANK, not 0, so test it with `ISBLANK(...)`.',
  ],
  example: {
    say: 'Here the customers with 3 or more orders are counted in each city.',
    code: `Loyal = COUNTROWS(FILTER(customers, CALCULATE(COUNTROWS(orders)) >= 3))`,
    lines: [
      ['CALCULATE(COUNTROWS(orders))', 'this one customer\'s orders.'],
      ['>= 3', 'kept if 3 or more.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how many sign-ups in each city never ordered.',
    get: [MODEL],
    want: ['Add `Never Ordered`: how many customers have no orders at all'],
    out: byCity,
  },
},
'dx-31': {
  explain: [
    '`DATESBETWEEN(calendar[date], DATE(2024, 3, 1), DATE(2024, 5, 31))` is every date from 1 March to 31 May, both ends included.',
    '`DATE(year, month, day)` builds a date, with the month as a number: 3 is March.',
    'Inside CALCULATE it replaces whatever dates were showing.',
    'So the measure is always about that window: a promotion, a season, a quarter that matters.',
  ],
  example: {
    say: 'Here the order lines from January alone are counted for each category.',
    code: `Lines = COUNTROWS(order_items)
January Lines = CALCULATE([Lines], DATESBETWEEN(calendar[date], DATE(2024, 1, 1), DATE(2024, 1, 31)))`,
    lines: [
      ['DATE(2024, 1, 1), DATE(2024, 1, 31)', 'from 1 January to 31 January.'],
      ['January Lines', 'each category\'s lines in that window only.'],
    ],
  },
  brief: {
    story: 'The spring promotion ran from March to May, and the buyer wants its sales by category.',
    get: [MODEL],
    want: ['Add `Spring Sales`: the sales from 1 March to 31 May 2024'],
    out: byCategory,
  },
},
'dx-32': {
  explain: [
    'A rank on the total row means nothing: everything together, ranked against single products, comes out 1.',
    '`ISFILTERED(products[name])` is TRUE on a product row and FALSE on the total.',
    'On the total, no one product is picked.',
    '`IF(ISFILTERED(products[name]), RANKX(...))` gives the rank on product rows.',
    'An IF with no third part gives BLANK, so the total cell stays empty.',
  ],
  example: {
    say: 'Here each row says whether one product is picked.',
    code: `Picked = IF(ISFILTERED(products[name]), "one", "all")`,
    lines: [
      ['ISFILTERED(products[name])', 'TRUE on each product row.'],
      ['"all"', 'on the total, where no product filter is set.'],
    ],
  },
  brief: {
    story: 'The total row says rank 1, and a reader asked what came first.',
    get: [MODEL],
    want: ['Change `Rank` so the total row is blank, while every product keeps its rank'],
    out: byProduct,
  },
},
'dx-33': {
  explain: [
    "Line the products up from best seller down. A product's **running share** is its sales plus the sales of every product above it, as a share of all sales.",
    "`VAR mine = [Sales]` keeps this product's sales.",
    '`FILTER(ALL(products[name]), [Sales] >= mine)` is this product and every product that sold at least as much.',
    'CALCULATE([Sales]) over that list, divided by all sales, is the running share.',
    'A few products usually make most of the money: the 80/20, or **Pareto**, rule.',
  ],
  example: {
    say: 'Here each product counts how many products sold at least as many units as it did.',
    code: `Qty = SUM(order_items[qty])
At Least Mine =
    VAR mine = [Qty]
    RETURN COUNTROWS(FILTER(ALL(products[name]), [Qty] >= mine))`,
    lines: [
      ['VAR mine = [Qty]', 'this product\'s units, kept before the filter changes.'],
      ['FILTER(ALL(products[name]), [Qty] >= mine)', 'every product with at least as many: the best seller gets 1.'],
    ],
  },
  brief: {
    story: 'The buyer wants to know how few products make most of the money.',
    get: [MODEL],
    want: ['Add `Running Share`: the share of all sales made by this product and every product that sold more'],
    out: byProduct,
  },
},
'dx-34': {
  explain: [
    '**ABC analysis** sorts products by how much they matter.',
    'A makes the first 70% of sales, B the next 20%, and C is the long tail.',
    '`SWITCH(TRUE(), [Running Share] <= 0.7, "A", [Running Share] <= 0.9, "B", "C")` gives the first band that fits.',
    'Wrap it in `IF(ISFILTERED(products[name]), ...)` so the total row stays blank.',
    'A products get the attention; C products are the ones to question.',
  ],
  example: {
    say: 'Here each product gets a price band, with the total left blank.',
    code: `Price Band = IF(ISFILTERED(products[name]),
    SWITCH(TRUE(), SUM(products[price]) <= 10, "cheap", SUM(products[price]) <= 20, "mid", "dear"))`,
    lines: [
      ['SWITCH(TRUE(), ...)', 'the first band that fits the price.'],
      ['IF(ISFILTERED(...), ...)', 'only on product rows; the total stays blank.'],
    ],
  },
  brief: {
    story: 'The buyer is reviewing the range and wants every product classed A, B or C.',
    get: [MODEL, ['The starter has `Sales` and `Running Share`.']],
    want: ['Add `Class`: "A" up to a running share of 0.7, "B" up to 0.9, and "C" after that', 'Blank on the total'],
    out: byProduct,
  },
},
'dx-35': {
  explain: [
    '`PREVIOUSMONTH(calendar[date])` is every date of the month before the one showing.',
    'Inside CALCULATE, it moves a measure back a month.',
    '`FILTER(VALUES(orders[customer_id]), ...)` goes through this month\'s buyers one at a time.',
    'Keep the ones whose orders in the month before are more than 0, and COUNTROWS gives the returning customers.',
    'January is blank: the data has no December for anyone to come back from.',
  ],
  example: {
    say: 'Here each month\'s buyers sit beside the month before\'s.',
    code: `Buyers = DISTINCTCOUNT(orders[customer_id])
Last Month Buyers = CALCULATE([Buyers], PREVIOUSMONTH(calendar[date]))`,
    lines: [
      ['PREVIOUSMONTH(calendar[date])', 'the dates of the month before.'],
      ['Last Month Buyers', 'blank in January, then last month\'s buyers on each row.'],
    ],
  },
  brief: {
    story: 'The growth team wants to know how many buyers come back the next month.',
    get: [MODEL],
    want: ["Add `Returning`: how many of this month's buyers also ordered the month before"],
    out: byMonth,
  },
},
};
