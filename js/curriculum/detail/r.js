/* R (r-01 to r-35): the fuller teaching, a worked example and the task as a
   brief (see detail/index.js). Examples ask a different question of the café
   data, or use a tiny vector of their own, never the task's answer. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, NA on 9 days" };
const GOT_CAFE = ['`cafe` is loaded: one row per day, 120 days.', CAFE];
const GOT_ORDERS = ["`orders` is the shop's order table: `order_id`, `customer_id`, `order_date` and `status`."];

export const R_DETAIL = {
'r-01': {
  explain: [
    'R is a language made for working with data.',
    'A table in R is called a **data frame**: named columns, numbered rows.',
    '`data.frame(...)` builds one. Each `name = c(...)` becomes a column, and `c()` (short for combine) lists the values down it.',
    '`<-` stores something under a name, the way `=` does in Python.',
    'A name on a line of its own is shown underneath when you run.',
  ],
  example: {
    say: 'Here a vector is doubled, and a small data frame is built.',
    code: `prices <- c(2.5, 3, 4.2)
prices * 2

staff <- data.frame(name = c("Ada", "Kofi"), shift = c("am", "pm"))
staff`,
    lines: [
      ['c(2.5, 3, 4.2)', 'three values combined into one vector.'],
      ['prices * 2', 'maths happens to every value at once.'],
      ['data.frame(...)', 'two columns, two rows.'],
    ],
  },
  brief: {
    story: 'The menu table needs to show how many of each drink sold today.',
    get: [['The starter makes `menu`: a drink column and a price column.']],
    want: ['Add a third column, `cups`, with the values 30, 12 and 18'],
    out: '`menu` with three columns.',
  },
},
'r-02': {
  explain: [
    '`cafe` is already loaded: 120 days of sales at a café in three cities. It is the same table the pandas course uses.',
    '`head(cafe, 3)` shows the first 3 rows, and `tail(cafe, 3)` the last 3.',
    '`dim(cafe)` gives its size: rows, then columns.',
    '`names(cafe)` lists the column names.',
    'R starts a line of results with `[1]`. It only means "this line starts with the first value".',
  ],
  example: {
    say: 'Here are the column names and the last two rows.',
    code: `names(cafe)
tail(cafe, 2)`,
    lines: [
      ['names(cafe)', 'the seven column names.'],
      ['tail(cafe, 2)', 'the last two days.'],
    ],
  },
  brief: {
    story: 'A new analyst wants a first look at the café data in R.',
    get: [GOT_CAFE],
    want: ['Show `dim(cafe)`', 'Then the first **3** rows'],
    out: '120 and 7, then three rows.',
  },
},
'r-03': {
  explain: [
    '`cafe$cups` picks out one column: the table, a `$`, then the column\'s name.',
    'A column on its own is a **vector**, a row of values.',
    'A vector can be summed up: `mean()` for the average, `max()` for the biggest, `min()` for the smallest, `sum()` for the total.',
    'What a function works on goes inside its brackets: `sum(cafe$cups)`.',
  ],
  example: {
    say: 'Here are the average price and the fewest cups in a day.',
    code: `mean(cafe$price)
min(cafe$cups)`,
    lines: [
      ['cafe$price', 'the price column, as a vector.'],
      ['min(cafe$cups)', 'the quietest day: 8 cups.'],
    ],
  },
  brief: {
    story: 'The owner wants one number: every cup sold so far.',
    get: [GOT_CAFE],
    want: ['`total_cups`: the total number of cups sold, shown'],
    out: 'One number.',
  },
},
'r-04': {
  explain: [
    '`summary(x)` describes a number column at once: the smallest, the quarter points, the median, the mean and the largest.',
    '`count(cafe, city)` counts how many rows there are for each city.',
    'It gives back a table with the count in a column called `n`.',
    '`count()` comes from **dplyr**, R\'s toolkit for tables, which is already loaded here.',
  ],
  example: {
    say: 'Here the cups are described, and the days counted by drink.',
    code: `summary(cafe$cups)
count(cafe, drink)`,
    lines: [
      ['summary(...)', 'six numbers describing the spread of cups.'],
      ['count(cafe, drink)', 'one row per drink, with n: how many days.'],
    ],
  },
  brief: {
    story: 'Head office asks how many days each branch has traded.',
    get: [GOT_CAFE],
    want: ['Show how many rows there are for each `city`'],
    out: 'Three rows, with `n`.',
  },
},
'r-05': {
  explain: [
    '`filter(cafe, cups > 45)` keeps only the rows where the condition is true.',
    'The table comes first, then the question to ask of every row.',
    'Inside dplyr\'s functions you write column names on their own, with no `cafe$` in front.',
    '`nrow(x)` counts the rows of a table.',
    'In R on your own computer you would start with `library(dplyr)`.',
  ],
  example: {
    say: 'Here are the days rated 4.8 or more, counted.',
    code: `top_rated <- filter(cafe, rating >= 4.8)
nrow(top_rated)`,
    lines: [
      ['filter(cafe, rating >= 4.8)', 'only those rows. Missing ratings are dropped, not kept.'],
      ['nrow(...)', 'how many there are.'],
    ],
  },
  brief: {
    story: 'The rota planner wants every busy day.',
    get: [GOT_CAFE],
    want: ['`busy`: every row where more than 45 cups were sold', 'Show how many rows it has'],
    out: 'A count of busy days.',
  },
},
'r-06': {
  explain: [
    'Give `filter()` two conditions with a comma between them, and a row has to pass both.',
    '`&` means and, `|` means or, and `!` means not.',
    '`filter(cafe, city == "Lagos" | city == "Accra")` keeps either city.',
    'R compares with a double `==`.',
    "A single `=` names something, so it can't ask a question.",
  ],
  example: {
    say: 'Here the tea days in Accra are counted.',
    code: `nrow(filter(cafe, city == "Accra", drink == "tea"))`,
    lines: [
      ['city == "Accra", drink == "tea"', 'two conditions: a row must pass both.'],
    ],
  },
  brief: {
    story: 'Marketing wants the cheap days that customers loved.',
    get: [GOT_CAFE],
    want: ['`cheap_good`: rows where `price` is under 3.5 **and** `rating` is above 4.5'],
    out: 'A table of the days that fit.',
  },
},
'r-07': {
  explain: [
    '`mutate()` adds a column worked out from the others: `mutate(cafe, per_cup = revenue / cups)`.',
    'It gives back a new table with the extra column.',
    'To keep it, store the result over the old one: `cafe <- mutate(cafe, ...)`.',
    '`round(x, 2)` rounds to 2 decimal places.',
  ],
  example: {
    say: 'Here each day gets the revenue per cup, shown for the first three days.',
    code: `head(mutate(cafe, per_cup = round(revenue / cups, 2)), 3)`,
    lines: [
      ['per_cup = ...', 'a new column: revenue divided by cups, which is the price.'],
      ['not stored', 'cafe itself is unchanged, because nothing was stored back.'],
    ],
  },
  brief: {
    story: 'The staff want to see the tips their days earned, at 10%.',
    get: [GOT_CAFE],
    want: ['Add a `tip` column worth 10% of `revenue`, rounded to 2 decimals', 'Keep it in `cafe`'],
    out: '`cafe` with a `tip` column.',
  },
},
'r-08': {
  explain: [
    '`arrange(cafe, revenue)` sorts the rows, smallest first.',
    'Wrap the column in `desc()` for biggest first.',
    '`head(x, 5)` then keeps the first 5 rows. Sorted first, that is the best five.',
    '`slice_max(cafe, revenue, n = 5)` does both in one go.',
  ],
  example: {
    say: 'Here are the three quietest days.',
    code: `head(arrange(cafe, cups), 3)`,
    lines: [
      ['arrange(cafe, cups)', 'fewest cups first.'],
      ['head(..., 3)', 'the first three of that order.'],
    ],
  },
  brief: {
    story: 'The owner wants to celebrate the five best days.',
    get: [GOT_CAFE],
    want: ['`top5`: the 5 highest-revenue days, biggest first'],
    out: 'Five rows.',
  },
},
'r-09': {
  explain: [
    '`group_by(drink)` sorts the rows into groups, one per drink.',
    '`summarise()` boils each group down to one row.',
    '`|>` is the pipe. It hands what\'s on its left to the function on its right, so read it as "and then".',
    '`cafe |> group_by(drink) |> summarise(cups = sum(cups))` reads: take cafe, group it by drink, then sum the cups.',
    'In `summarise()`, the name before the `=` is the new column\'s name.',
  ],
  example: {
    say: 'Here is the average price in each city.',
    code: `cafe |>
  group_by(city) |>
  summarise(avg_price = mean(price))`,
    lines: [
      ['group_by(city)', 'one group per city.'],
      ['summarise(avg_price = mean(price))', 'one row per group, with a column called avg_price.'],
    ],
  },
  brief: {
    story: 'The menu team wants total cups for each drink.',
    get: [GOT_CAFE],
    want: ['`by_drink`: the total cups sold for each `drink`, in a column called `cups`'],
    out: 'Four rows.',
  },
},
'r-10': {
  explain: [
    '`summarise()` can make several columns at once, with commas between them.',
    '`n()` counts the rows in each group.',
    '`mean(x, na.rm = TRUE)` averages while skipping missing values.',
    "Without `na.rm = TRUE`, one missing value makes the whole average `NA`, R's word for missing.",
  ],
  example: {
    say: 'Here each city gets its number of days and its best day\'s takings.',
    code: `cafe |>
  group_by(city) |>
  summarise(days = n(), best = max(revenue))`,
    lines: [
      ['days = n()', 'the rows in each group.'],
      ['best = max(revenue)', 'a second column, after a comma.'],
    ],
  },
  brief: {
    story: 'The menu team wants each drink\'s sales and its average rating.',
    get: [GOT_CAFE],
    want: ['`drinks`: per `drink`, `total_cups` (sum of cups) and `avg_rating` (mean of rating, skipping missing values)'],
    out: 'Four rows, three columns.',
  },
},
'r-11': {
  explain: [
    'A missing value in R is `NA`.',
    '`is.na(x)` asks every value "are you missing?" and gives back TRUE or FALSE for each.',
    '`sum(is.na(x))` counts the holes, because TRUE counts as 1 and FALSE as 0.',
    '`coalesce(x, 4)` fills each hole with 4 and leaves the other values alone.',
  ],
  example: {
    say: 'Here a short vector with one hole is checked and filled.',
    code: `x <- c(3, NA, 5)
is.na(x)
sum(is.na(x))
coalesce(x, 0)`,
    lines: [
      ['is.na(x)', 'FALSE, TRUE, FALSE.'],
      ['sum(is.na(x))', '1 hole.'],
      ['coalesce(x, 0)', 'the hole becomes 0.'],
    ],
  },
  brief: {
    story: 'The quality team wants the missing ratings filled with the average, for a quick chart.',
    get: [GOT_CAFE],
    want: ['`filled`: `cafe` with each missing `rating` replaced by the average rating', 'Show how many holes are left'],
    out: '0 holes.',
  },
},
'r-12': {
  explain: [
    'The `date` column holds real dates, so R can do date things with it.',
    '`format(date, "%Y-%m")` turns a date into text like `2024-01`.',
    '`%Y` stands for the year, `%m` the month\'s number, `%d` the day and `%B` the month\'s name.',
    'Make a month column with `mutate()`, then group by it.',
  ],
  example: {
    say: 'Here one date is written two ways.',
    code: `d <- as.Date("2024-03-15")
format(d, "%Y-%m")
format(d, "%d %B")`,
    lines: [
      ['"%Y-%m"', '2024-03: year and month.'],
      ['"%d %B"', '15 March: day and month name.'],
    ],
  },
  brief: {
    story: 'The accountant wants takings month by month.',
    get: [GOT_CAFE],
    want: ['`monthly`: total `revenue` per month, with the columns `month` and `revenue`'],
    out: 'Four rows.',
  },
},
'r-13': {
  explain: [
    'A pivot table puts one thing down the side, another across the top, and a summary in every cell.',
    '`tapply(values, list(rows, columns), mean)` builds one.',
    'First the numbers to summarise, then what goes down the side and across, then how to sum them up.',
    'It gives back a **matrix**, a grid of numbers with names on both edges.',
    '`round(x, 1)` rounds the whole grid.',
  ],
  example: {
    say: 'Here is the most cups sold in a day, for each city and drink.',
    code: `tapply(cafe$cups, list(cafe$city, cafe$drink), max)`,
    lines: [
      ['list(cafe$city, cafe$drink)', 'cities down the side, drinks across.'],
      ['max', 'each cell is the biggest number of cups.'],
    ],
  },
  brief: {
    story: 'The owner wants a grid of average takings, city by drink.',
    get: [GOT_CAFE],
    want: ['`grid`: mean `revenue`, cities down the side, drinks across the top', 'Show it rounded to 1 place'],
    out: 'A 3 × 4 grid.',
  },
},
'r-14': {
  explain: [
    'Square brackets pick rows and columns by position: `cafe[rows, columns]`.',
    'Counting starts at 1, not 0 as in Python.',
    '`cafe[1:3, ]` is the first three rows: an empty spot means all of them.',
    '`cafe[, 1:2]` is the first two columns. You can name columns too: `cafe[1:2, c("date", "cups")]`.',
    '`tail(x, 3)` is the last 3 rows, the way `head()` is the first.',
  ],
  example: {
    say: 'Here one cell, then a small corner by column name, are picked out.',
    code: `cafe[2, 3]
cafe[1:2, c("date", "cups")]`,
    lines: [
      ['cafe[2, 3]', 'row 2, column 3: the second day\'s drink.'],
      ['cafe[1:2, c("date", "cups")]', 'two rows, two named columns.'],
    ],
  },
  brief: {
    story: 'A colleague wants a tiny corner of the table to check by eye.',
    get: [GOT_CAFE],
    want: ['`corner`: the **last 3 rows** and the **first 2 columns**'],
    out: 'A 3 × 2 table.',
  },
},
'r-15': {
  explain: [
    '`x %in% c("latte", "tea")` asks "is it one of these?", for every value.',
    'It is a short way to write several ors.',
    '`between(price, 3, 4.5)` keeps prices from 3 to 4.5, both ends included.',
    'A `!` in front turns a question round: `!drink %in% c("tea")` means "not tea".',
  ],
  example: {
    say: 'Here both questions are asked of a few values.',
    code: `x <- c("latte", "tea", "mocha")
x %in% c("tea", "mocha")
between(c(2, 3.5, 5), 3, 4.5)`,
    lines: [
      ['%in%', 'FALSE, TRUE, TRUE.'],
      ['between(...)', 'only 3.5 is from 3 to 4.5.'],
    ],
  },
  brief: {
    story: 'A coffee supplier wants mid-price days that weren\'t tea.',
    get: [GOT_CAFE],
    want: ['`mid`: rows where `price` is between 3 and 4.5, and the drink is **not** tea'],
    out: 'A table of the days that fit.',
  },
},
'r-16': {
  explain: [
    '`select()` keeps the columns you name: `select(cafe, date, revenue)`.',
    'A minus drops one instead: `select(cafe, -rating)`.',
    '`rename(cafe, units = cups)` renames a column: new name first, then the old one.',
    'Both give back a new table, and `cafe` stays as it was.',
  ],
  example: {
    say: 'Here two columns are dropped, and another renamed, and the names shown.',
    code: `names(select(cafe, -price, -revenue))
names(rename(cafe, day = date))`,
    lines: [
      ['-price, -revenue', 'both dropped.'],
      ['day = date', 'date is now called day.'],
    ],
  },
  brief: {
    story: 'The warehouse system wants the table with its own column names.',
    get: [GOT_CAFE],
    want: ['`tidy`: cafe with `cups` renamed to `units` **and** `rating` removed'],
    out: 'Six columns.',
  },
},
'r-17': {
  explain: [
    '`function(x) ...` makes a function of your own, where `x` stands for whatever you give it.',
    'Store it under a name and use it like any other.',
    '`ifelse(test, yes, no)` gives back yes where the test is TRUE and no where it is FALSE, for every value at once.',
    'So `size_of <- function(c) ifelse(c > 40, "big", "small")` labels a whole column in one go.',
  ],
  example: {
    say: 'Here a small function adds VAT, and ifelse labels two numbers.',
    code: `add_vat <- function(p) round(p * 1.2, 2)
add_vat(c(2.5, 4))
ifelse(c(10, 50) > 40, "big", "small")`,
    lines: [
      ['function(p) ...', 'a function of one value, p.'],
      ['ifelse(...)', '"small" for 10, "big" for 50.'],
    ],
  },
  brief: {
    story: 'The rota planner wants every day marked big or small.',
    get: [GOT_CAFE],
    want: ['Add a `size` column to `cafe`: `"big"` when cups is over 40, otherwise `"small"`', 'Count the sizes'],
    out: 'Two counts.',
  },
},
'r-18': {
  explain: [
    '`nchar(x)` counts the letters in each value, `toupper()` puts them in capitals, and `trimws()` trims spaces off the ends.',
    '`grepl("brew", x)` asks whether each value contains "brew", and gives back TRUE or FALSE.',
    'They all work on a whole column at once.',
    'So they fit inside `filter()` and `mutate()`.',
  ],
  example: {
    say: 'Here two messy drink names are measured, shouted and searched.',
    code: `d <- c(" tea", "cold brew ")
nchar(trimws(d))
toupper(d)
grepl("brew", d)`,
    lines: [
      ['nchar(trimws(d))', 'letters once the spaces are trimmed: 3 and 9.'],
      ['grepl("brew", d)', 'FALSE, TRUE.'],
    ],
  },
  brief: {
    story: 'The menu printer can\'t fit long drink names. Find them.',
    get: [GOT_CAFE],
    want: ['`long_names`: rows where the drink name is longer than 5 characters', 'Show which drinks those are'],
    out: 'The long drink names.',
  },
},
'r-19': {
  explain: [
    '`cut(x, breaks, labels = ...)` sorts numbers into bands.',
    '`breaks` lists the edges, and `labels` names the bands between them.',
    '`quantile(x, c(0, 0.25, 0.5, 0.75, 1))` finds the edges that split the values into four groups of the same size.',
    'Add `include.lowest = TRUE` so the very smallest value lands in the first band.',
  ],
  example: {
    say: 'Here three numbers are put into three named bands.',
    code: `cut(c(1, 5, 9), breaks = c(0, 3, 6, 10), labels = c("low", "mid", "high"))`,
    lines: [
      ['breaks = c(0, 3, 6, 10)', 'three bands: 0 to 3, 3 to 6, 6 to 10.'],
      ['the result', 'low, mid, high.'],
    ],
  },
  brief: {
    story: 'The owner wants every day graded into quarters by takings.',
    get: [GOT_CAFE],
    want: ['Add a `tier` column: `revenue` split into 4 equal-sized groups, labelled Q1 to Q4', 'Count the tiers'],
    out: 'About 30 days in each tier.',
  },
},
'r-20': {
  explain: [
    '`read.csv()` reads a CSV file into a data frame.',
    'Here the file is a piece of text, so it goes in as `text = ...`.',
    'The first line names the columns, and every line after it is a row.',
    'Once loaded, it is an ordinary data frame, so you can filter it like any other.',
  ],
  example: {
    say: 'Here three lines of text are read as a table.',
    code: `prices <- read.csv(text = "drink,price
latte,4.5
tea,2.75")
prices`,
    lines: [
      ['the first line', 'drink and price become the column names.'],
      ['read.csv(text = ...)', 'a data frame with two rows.'],
    ],
  },
  brief: {
    story: 'The rota arrived as a CSV, and the manager wants the busy staff.',
    get: [['The starter reads `crew`: name, city and cups for four staff.']],
    want: ['`busy_crew`: the rows of `crew` where `cups` is above 20'],
    out: 'Three rows.',
  },
},
'r-21': {
  explain: [
    'A pipe can be as long as you like. Each step takes the table from the step above it.',
    'Put each step on its own line and end the line with `|>`.',
    'It reads like a recipe, top to bottom.',
    'Older R code uses `%>%` for the same thing, so you will meet both.',
  ],
  example: {
    say: 'Here three steps in a row: filter, pick columns, show the first three.',
    code: `cafe |>
  filter(drink == "tea") |>
  select(date, city) |>
  head(3)`,
    lines: [
      ['filter(drink == "tea")', 'only tea days.'],
      ['select(date, city)', 'just two columns.'],
    ],
  },
  brief: {
    story: 'The Lagos manager wants their busy days, best first.',
    get: [GOT_CAFE],
    want: ['`busy_lagos`: the Lagos days with **more than 40** cups', 'Just `date` and `cups`', 'Most cups first'],
    out: 'A short table.',
  },
},
'r-22': {
  explain: [
    'A chain can mix every step you know: `mutate()`, `filter()`, `arrange()` and `summarise()`.',
    'A column made by `mutate()` can be used straight away by the steps below it.',
    'The order matters: a step can only use columns that exist by the time it runs.',
    'Build a chain one line at a time, and run it after each step to watch the table change.',
  ],
  example: {
    say: 'Here a column is made, then used straight away to filter.',
    code: `cafe |>
  mutate(big = cups > 50) |>
  filter(big) |>
  nrow()`,
    lines: [
      ['mutate(big = cups > 50)', 'a TRUE/FALSE column.'],
      ['filter(big)', 'used on the very next line.'],
    ],
  },
  brief: {
    story: 'Finance wants the days when cups were cheapest, per cup sold.',
    get: [GOT_CAFE],
    want: ['`best_value` in one chain: add `per_cup` (revenue ÷ cups), keep the rows where `per_cup` is under 3, sort by `per_cup`, cheapest first'],
    out: 'A sorted table.',
  },
},
'r-23': {
  explain: [
    '`weekdays(date)` gives the name of the day: "Monday", "Tuesday" and so on.',
    '`case_when()` checks conditions in order and gives the value of the first one that is true.',
    'Read the `~` as "then": `cups > 50 ~ "busy"`.',
    '`TRUE ~` at the end catches everything left over.',
  ],
  example: {
    say: 'Here one date is named, and three numbers are labelled.',
    code: `weekdays(as.Date("2024-03-16"))
x <- c(55, 35, 10)
case_when(x > 50 ~ "busy", x > 30 ~ "steady", TRUE ~ "quiet")`,
    lines: [
      ['weekdays(...)', '16 March 2024 was a Saturday.'],
      ['case_when(...)', 'busy, steady, quiet.'],
    ],
  },
  brief: {
    story: 'The planner wants weekends and weekdays compared.',
    get: [GOT_CAFE],
    want: ['Add `day_type`: `"weekend"` on Saturdays and Sundays, `"weekday"` otherwise', 'Count each type'],
    out: 'Two counts.',
  },
},
'r-24': {
  explain: [
    '`cumsum(x)` is a running total: each value, plus everything before it.',
    '`min_rank(desc(x))` ranks the values, 1 for the biggest.',
    'Equal values share a rank, the way a sports table does.',
    'Both work inside `mutate()`, so each becomes a new column.',
  ],
  example: {
    say: 'Here four numbers get a running total and a rank.',
    code: `x <- c(5, 3, 8, 3)
cumsum(x)
min_rank(desc(x))`,
    lines: [
      ['cumsum(x)', '5, 8, 16, 19.'],
      ['min_rank(desc(x))', '8 is 1st, 5 is 2nd, and the two 3s share 3rd.'],
    ],
  },
  brief: {
    story: 'The owner wants the takings building up, and each day\'s place.',
    get: [GOT_CAFE],
    want: ['Add `running` (the revenue so far, day by day) and `rank` (1 = the best day)', 'Show the best days first'],
    out: '`cafe` with two new columns.',
  },
},
'r-25': {
  explain: [
    '`orders` is the shop\'s order table: one row per order, each with a `status`.',
    '`count(orders, status)` counts the orders with each status, in a column called `n`.',
    'A share is one count divided by the total: `n / sum(n)`.',
    'Times 100, it is a percentage.',
  ],
  example: {
    say: 'Here each city\'s share of all the takings is worked out.',
    code: `cafe |>
  group_by(city) |>
  summarise(revenue = sum(revenue)) |>
  mutate(share = round(revenue / sum(revenue) * 100, 1))`,
    lines: [
      ['sum(revenue)', 'inside mutate, the total of all three cities.'],
      ['share', 'each city\'s percentage. They add up to 100.'],
    ],
  },
  brief: {
    story: 'Customer service wants to know what share of orders get cancelled.',
    get: [GOT_ORDERS],
    want: ['`status_pct`: the count of each `status`', 'A `pct` column: its percentage of all orders, rounded to 1'],
    out: 'Three rows.',
  },
},
'r-26': {
  explain: [
    'After `group_by()`, `slice_max()` works inside each group: the top rows of every group, rather than of the whole table.',
    '`slice_max(revenue, n = 3)` keeps the 3 biggest revenues in each group.',
    'A tie can let in an extra row.',
    '`ungroup()` at the end takes the groups away again, so later steps see one table.',
  ],
  example: {
    say: 'Here the single busiest day for each drink is found.',
    code: `cafe |>
  group_by(drink) |>
  slice_max(cups, n = 1) |>
  ungroup() |>
  select(drink, date, cups)`,
    lines: [
      ['slice_max(cups, n = 1)', 'the top row inside each drink\'s group.'],
      ['ungroup()', 'back to one plain table.'],
    ],
  },
  brief: {
    story: 'Each city manager wants their three best days.',
    get: [GOT_CAFE],
    want: ["`top3`: each city's three best days by revenue"],
    out: '9 rows in all.',
  },
},
'r-27': {
  explain: [
    'After `group_by()`, `filter()` asks its question of each group, so it can keep or drop whole groups.',
    'Inside it, `n()` is the number of rows in the group.',
    '`filter(n() >= 6)` keeps the groups with 6 or more rows.',
    '`n_distinct(x)` counts how many different values there are.',
  ],
  example: {
    say: 'Here only the drinks sold on more than 30 days are kept.',
    code: `cafe |>
  group_by(drink) |>
  filter(n() > 30) |>
  ungroup() |>
  count(drink)`,
    lines: [
      ['filter(n() > 30)', 'a whole group stays or goes.'],
      ['count(drink)', 'the drinks that stayed, with their days.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants every order from its regular customers.',
    get: [GOT_ORDERS],
    want: ['`regulars`: every order by a customer with 6 or more orders, all columns kept', 'Show how many customers that is'],
    out: 'A table of orders, and a count.',
  },
},
'r-28': {
  explain: [
    '`row_number()` numbers the rows 1, 2, 3 and on.',
    'After `group_by()`, it starts again at 1 in every group.',
    'Sort first, so the numbers follow time: `arrange(order_date, order_id)`.',
    'Then `nth == 1` marks each customer\'s first order.',
  ],
  example: {
    say: 'Here each city\'s first two days are numbered and kept.',
    code: `cafe |>
  group_by(city) |>
  mutate(day_no = row_number()) |>
  filter(day_no <= 2) |>
  ungroup() |>
  select(city, date, day_no)`,
    lines: [
      ['row_number()', 'starts at 1 again for each city.'],
      ['filter(day_no <= 2)', 'the first two of each.'],
    ],
  },
  brief: {
    story: 'Marketing wants each customer\'s first order.',
    get: [GOT_ORDERS, ['The starter makes `o`: orders sorted by date and id, grouped by customer.']],
    want: ['Add `nth`: which order this is for that customer, 1 for their first', '`firsts`: just the rows where `nth` is 1'],
    out: 'One row per customer.',
  },
},
'r-29': {
  explain: [
    '`lag(x)` gives each row the value from the row before it.',
    'After `group_by()`, it stays inside each group, so it never borrows from another customer.',
    'Take one date from another and you get the days between them. `as.numeric()` turns that into a plain number.',
    "A customer's first order has nothing before it, so its gap is `NA`.",
  ],
  example: {
    say: 'Here three numbers are compared with the one before, and two dates are subtracted.',
    code: `x <- c(10, 12, 15)
x - lag(x)
as.numeric(as.Date("2024-03-10") - as.Date("2024-03-01"))`,
    lines: [
      ['x - lag(x)', 'NA, then 2, then 3.'],
      ['as.numeric(...)', '9 days.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how often customers come back.',
    get: [GOT_ORDERS, ['The starter works out `gap`, but across all customers at once.']],
    want: ["Fix `gap` so it's the days since **that customer's** previous order", '`typical_gap`: the average gap, rounded to 1'],
    out: 'One number of days.',
  },
},
'r-30': {
  explain: [
    '`cities` holds each city\'s country and population, in millions.',
    '`left_join(a, b, by = "city")` adds the matching columns from b to every row of a, matched on city.',
    'A row with no match keeps all its own values, and gets `NA` in the new columns.',
    'Every row of the left table stays.',
  ],
  example: {
    say: 'Here two staff get their city\'s country joined on.',
    code: `staff <- data.frame(name = c("Ada", "Kofi"), city = c("Lagos", "Kigali"))
left_join(staff, cities, by = "city")`,
    lines: [
      ['by = "city"', 'rows are matched on the city.'],
      ['the result', 'Ada gets Nigeria, Kofi gets Rwanda.'],
    ],
  },
  brief: {
    story: 'Head office reports by country.',
    get: [GOT_CAFE, ['`cities` has `city`, `country` and `population_m`.']],
    want: ["`with_country`: `cafe` with each row's `country` and `population_m` joined on", 'Count the rows for each country'],
    out: 'Three countries.',
  },
},
'r-31': {
  explain: [
    '`addmargins()` adds totals to a grid: one for each row, one for each column, and a grand total in the corner.',
    'The totals are named `Sum`, on both edges.',
    'It works on a grid from `tapply()`, or from `table()`, which counts pairs.',
    '`round(x, 2)` rounds the whole grid, totals and all.',
  ],
  example: {
    say: 'Here the days are counted by city and drink, with totals.',
    code: `addmargins(table(cafe$city, cafe$drink))`,
    lines: [
      ['table(...)', 'how many days for each city and drink.'],
      ['addmargins(...)', 'a Sum row, a Sum column, and 120 in the corner.'],
    ],
  },
  brief: {
    story: 'The accountant wants a revenue grid with totals both ways.',
    get: [GOT_CAFE],
    want: ['`grid`: revenue by city (rows) and drink (columns), summed', 'Totals on both edges', 'Rounded to 2'],
    out: 'A 4 × 5 grid with Sum edges.',
  },
},
'r-32': {
  explain: [
    'Text sorts A to Z, so Friday comes before Monday.',
    'To put days in their real order, R has to be told it.',
    'A **factor** is text with a fixed order: `factor(day, levels = week)`, where `week` lists the days from Monday.',
    'Group by a factor and the groups come out in that order.',
  ],
  example: {
    say: 'Here text sorts A to Z, and a factor keeps the order it was given.',
    code: `sort(c("Monday", "Friday"))
f <- factor(c("tue", "mon", "tue"), levels = c("mon", "tue"))
table(f)`,
    lines: [
      ['sort(...)', 'Friday first: alphabetical.'],
      ['levels = c("mon", "tue")', 'the order to use: mon first, whatever the letters say.'],
    ],
  },
  brief: {
    story: 'The weekly report lists the days in the wrong order.',
    get: [GOT_CAFE],
    want: ['`by_day`: total revenue for each day of the week, Monday to Sunday in that order, rounded to 2'],
    out: 'Seven rows, Monday first.',
  },
},
'r-33': {
  explain: [
    '`strsplit(items, ", ")` splits each piece of text at every comma.',
    'It gives back a **list**: one bundle of pieces for each row.',
    '`unlist()` pours all the bundles out into one long vector.',
    'Then `table()` counts each value, and `sort(x, decreasing = TRUE)` puts the most common first.',
  ],
  example: {
    say: 'Here two pieces of text are split, then poured into one vector.',
    code: `parts <- strsplit(c("a, b", "c"), ", ")
parts
unlist(parts)`,
    lines: [
      ['strsplit(...)', 'a list: a and b in the first bundle, c in the second.'],
      ['unlist(parts)', 'one vector: a, b, c.'],
    ],
  },
  brief: {
    story: 'The till stores each ticket\'s items in one cell. Count the items.',
    get: [['The starter makes `tickets`: five tickets, each with its `items` as text.']],
    want: ['`counts`: how many times each item was ordered across all the tickets, most first'],
    out: 'A count per item.',
  },
},
'r-34': {
  explain: [
    'After `group_by()`, `min_rank()` ranks inside each group, so every group gets its own 1.',
    '`desc()` inside it makes 1 the biggest value. Without it, 1 is the smallest.',
    'Equal values share a rank, so a tie can give a group two rows ranked 1.',
    "Filter for rank 1 afterwards and you have each group's top row.",
  ],
  example: {
    say: 'Here each drink\'s quietest day is found by ranking within the drink.',
    code: `cafe |>
  group_by(drink) |>
  mutate(r = min_rank(cups)) |>
  filter(r == 1) |>
  ungroup() |>
  select(drink, date, cups)`,
    lines: [
      ['min_rank(cups)', 'no desc(), so 1 is the fewest cups, inside each drink.'],
      ['filter(r == 1)', 'each drink\'s quietest day.'],
    ],
  },
  brief: {
    story: 'Each city manager wants their own best day.',
    get: [GOT_CAFE],
    want: ["Add `city_rank`: each day's revenue rank within its own city, 1 for the best", '`best`: the rows where `city_rank` is 1'],
    out: 'One row per city.',
  },
},
'r-35': {
  explain: [
    'A **cohort** is a group of customers who started at the same time: here, the month of their first order.',
    "After `group_by(customer_id)`, `min(month)` inside `mutate()` gives every row that customer's first month.",
    '`n_distinct(customer_id)` inside `summarise()` counts different customers, rather than orders.',
    'A grid of cohort by month shows how each starting group carries on buying.',
  ],
  example: {
    say: 'Here each city\'s first trading day is put on every one of its rows, then shown once.',
    code: `cafe |>
  group_by(city) |>
  mutate(first_day = min(date)) |>
  ungroup() |>
  distinct(city, first_day)`,
    lines: [
      ['mutate(first_day = min(date))', 'every row gets its group\'s earliest date.'],
      ['distinct(...)', 'one row per city.'],
    ],
  },
  brief: {
    story: 'The growth team wants to see how each month\'s new customers keep buying.',
    get: [GOT_ORDERS, ['The starter makes `o`: orders with a `month` column.']],
    want: ["Add `cohort` to `o`: each customer's first month", '`grid`: for each `cohort` and `month`, `customers`, the number of different customers who ordered'],
    out: 'One row per cohort and month.',
  },
},
};
