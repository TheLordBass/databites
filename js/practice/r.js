/* R practice: write solution <- function(df) and it's judged in R against
   a reference on hidden tables, the way the Python problems are. Each
   problem's setup is R, run after the learner's code (so it can't be seen
   from it), and defines:
     .ref      the reference function
     .example  a list of named arguments: the one shown, and Run's test
     .cases    a list of those: Submit's tests, the example first
   mode: frame (any row order), frame_ordered, scalar or vector. Judged by
   .qc_judge in js/r.js; dplyr is loaded. */

const STUB = 'solution <- function(df) {\n  \n}\n';

export const R_PROBLEMS = [
/* ════════════════════════════════ Easy ════════════════════════════════ */
{
  id: 'r01', difficulty: 'easy', lang: 'r', tags: ['group by', 'counting'],
  title: 'Rows per city',
  prompt: [
    'Given `df` with a `city` column, count how many rows belong to each city.',
    'Return a data frame with exactly two columns: `city` and `n`.',
  ],
  notes: ['Row order does not matter.'],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) count(df, city)
.example <- function() list(df = data.frame(
  city = c("Lagos", "Accra", "Lagos", "Nairobi", "Accra"),
  cups = c(47, 18, 52, 40, 33)))
.cases <- function() {
  set.seed(2)
  list(.example(),
       list(df = data.frame(city = c("Accra", "Accra", "Accra"), cups = c(1, 2, 3))),
       list(df = data.frame(city = sample(c("Lagos", "Accra", "Nairobi", "Kigali"), 40, TRUE),
                            cups = sample(5:70, 40, TRUE))))
}
`,
  hint: '`count(df, city)` counts the rows for each city, in a column called `n`.',
  solution: 'solution <- function(df) {\n  count(df, city)\n}\n',
  alt: ['solution <- function(df) {\n  df |> group_by(city) |> summarise(n = n())\n}\n'],
  wrong: [
    'solution <- function(df) {\n  table(df$city)\n}\n',
    'solution <- function(df) {\n  df |> group_by(city) |> summarise(count = n())\n}\n',
  ],
},
{
  id: 'r02', difficulty: 'easy', lang: 'r', tags: ['aggregation', 'missing data'],
  title: 'Average price',
  prompt: [
    'Given `df` with a `price` column, return the mean price **rounded to 2 decimal places**, as a single number.',
    'Some prices are missing. Leave them out of the average.',
  ],
  stub: STUB,
  mode: 'scalar',
  setup: `
.ref <- function(df) round(mean(df$price, na.rm = TRUE), 2)
.example <- function() list(df = data.frame(drink = c("latte", "espresso", "tea", "mocha"),
                                            price = c(4.50, 3.00, NA, 2.75)))
.cases <- function() {
  set.seed(3)
  p <- round(runif(25, 2, 6), 2)
  p[c(3, 9, 17)] <- NA
  list(.example(),
       list(df = data.frame(drink = c("a", "b"), price = c(2.10, 2.15))),
       list(df = data.frame(drink = paste0("d", 1:25), price = p)))
}
`,
  hint: '`mean(df$price, na.rm = TRUE)` skips the missing ones. Then `round(..., 2)`.',
  solution: 'solution <- function(df) {\n  round(mean(df$price, na.rm = TRUE), 2)\n}\n',
  alt: ['solution <- function(df) {\n  round(mean(na.omit(df$price)), 2)\n}\n'],
  wrong: [
    'solution <- function(df) {\n  round(mean(df$price), 2)\n}\n',
    'solution <- function(df) {\n  mean(df$price, na.rm = TRUE)\n}\n',
  ],
},
{
  id: 'r03', difficulty: 'easy', lang: 'r', tags: ['filtering', 'ordering'],
  title: 'Under three',
  prompt: [
    'Given `df` with columns `drink` and `price`, return `drink` and `price` for every drink costing **less than £3.00**, cheapest first.',
    'Drinks at the same price go in alphabetical order.',
  ],
  notes: ['Exactly £3.00 is not less than £3.00.'],
  stub: STUB,
  mode: 'frame_ordered',
  setup: `
.ref <- function(df) df |> filter(price < 3) |> arrange(price, drink) |> select(drink, price)
.example <- function() list(df = data.frame(
  drink = c("latte", "mocha", "tea", "espresso", "water", "chai"),
  price = c(3.50, 2.50, 2.00, 3.00, 1.00, 2.50)))
.cases <- function() list(
  .example(),
  list(df = data.frame(drink = c("zobo", "kunu", "chai", "flat white"), price = c(2.0, 2.0, 2.0, 3.0))),
  list(df = data.frame(drink = "latte", price = 4.0)))
`,
  hint: '`filter()` for the price, then `arrange(price, drink)`: price first, drink second.',
  solution: 'solution <- function(df) {\n  df |>\n    filter(price < 3) |>\n    arrange(price, drink) |>\n    select(drink, price)\n}\n',
  alt: ['solution <- function(df) {\n  out <- df[df$price < 3, c("drink", "price")]\n  out[order(out$price, out$drink), ]\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> filter(price <= 3) |> arrange(price, drink) |> select(drink, price)\n}\n',
    'solution <- function(df) {\n  df |> filter(price < 3) |> arrange(price) |> select(drink, price)\n}\n',
    'solution <- function(df) {\n  df |> filter(price < 3) |> arrange(desc(price), drink) |> select(drink, price)\n}\n',
  ],
},
{
  id: 'r04', difficulty: 'easy', lang: 'r', tags: ['filtering'],
  title: 'Busy days',
  prompt: [
    'Given `df` of daily sales with columns `date`, `city` and `cups`, return the rows where **more than 40** cups were sold.',
    'Keep every column.',
  ],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) filter(df, cups > 40)
.example <- function() list(df = data.frame(
  date = as.Date(c("2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04")),
  city = c("Lagos", "Accra", "Lagos", "Nairobi"),
  cups = c(47, 40, 52, 12)))
.cases <- function() {
  set.seed(4)
  list(.example(),
       list(df = data.frame(date = as.Date("2024-02-01") + 0:2, city = "Accra", cups = c(40, 41, 39))),
       list(df = data.frame(date = as.Date("2024-03-01") + 0:29, city = sample(c("Lagos", "Accra"), 30, TRUE),
                            cups = sample(20:60, 30, TRUE))))
}
`,
  hint: '`filter(df, cups > 40)`',
  solution: 'solution <- function(df) {\n  filter(df, cups > 40)\n}\n',
  alt: ['solution <- function(df) {\n  df[df$cups > 40, ]\n}\n'],
  wrong: [
    'solution <- function(df) {\n  filter(df, cups >= 40)\n}\n',
    'solution <- function(df) {\n  df$cups > 40\n}\n',
  ],
},
{
  id: 'r05', difficulty: 'easy', lang: 'r', tags: ['new columns'],
  title: 'Add a total',
  prompt: [
    'Given `df` with columns `drink`, `cups` and `price`, add a column `total`: `cups` times `price`, **rounded to 2 decimal places**.',
    'Return the whole table with the new column on the end.',
  ],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) mutate(df, total = round(cups * price, 2))
.example <- function() list(df = data.frame(drink = c("latte", "tea", "mocha"),
                                            cups = c(12, 7, 9), price = c(3.333, 1.255, 4.10)))
.cases <- function() {
  set.seed(5)
  list(.example(),
       list(df = data.frame(drink = "water", cups = 0, price = 1.111)),
       list(df = data.frame(drink = paste0("d", 1:20), cups = sample(1:60, 20, TRUE),
                            price = round(runif(20, 1, 6), 3))))
}
`,
  hint: '`mutate(df, total = round(cups * price, 2))`',
  solution: 'solution <- function(df) {\n  mutate(df, total = round(cups * price, 2))\n}\n',
  alt: ['solution <- function(df) {\n  df$total <- round(df$cups * df$price, 2)\n  df\n}\n'],
  wrong: [
    'solution <- function(df) {\n  mutate(df, total = cups * price)\n}\n',
    'solution <- function(df) {\n  mutate(df, total = round(cups + price, 2))\n}\n',
  ],
},
{
  id: 'r06', difficulty: 'easy', lang: 'r', tags: ['group by', 'top'],
  title: 'The best seller',
  prompt: [
    'Given `df` with columns `drink`, `cups` and `price`, one row per sale, return the name of the drink that brought in the most money in total (cups times price, added up over all its rows).',
    'Return just the name, as a single piece of text.',
  ],
  notes: ['There is never a tie for first place.'],
  stub: STUB,
  mode: 'scalar',
  setup: `
.ref <- function(df) {
  totals <- df |> group_by(drink) |> summarise(money = sum(cups * price))
  totals$drink[which.max(totals$money)]
}
.example <- function() list(df = data.frame(
  drink = c("latte", "tea", "latte", "espresso", "tea", "tea"),
  cups = c(10, 30, 12, 20, 25, 28), price = c(4, 1, 4, 3, 1, 1)))
.cases <- function() list(
  .example(),
  list(df = data.frame(drink = c("chai", "chai", "mocha"), cups = c(5, 5, 9), price = c(2, 2, 2.5))),
  list(df = data.frame(drink = c("a", "b", "c", "b"), cups = c(1, 50, 2, 1), price = c(100, 1, 3, 1))))
`,
  hint: 'Group by drink, `summarise(money = sum(cups * price))`, then take the drink where money is biggest: `which.max()` finds its position.',
  solution: 'solution <- function(df) {\n  totals <- df |>\n    group_by(drink) |>\n    summarise(money = sum(cups * price))\n  totals$drink[which.max(totals$money)]\n}\n',
  alt: ['solution <- function(df) {\n  df |>\n    group_by(drink) |>\n    summarise(money = sum(cups * price)) |>\n    slice_max(money, n = 1) |>\n    pull(drink)\n}\n'],
  wrong: [
    'solution <- function(df) {\n  totals <- df |> group_by(drink) |> summarise(n = sum(cups))\n  totals$drink[which.max(totals$n)]\n}\n',
    'solution <- function(df) {\n  df$drink[which.max(df$cups * df$price)]\n}\n',
  ],
},

/* ═══════════════════════════════ Medium ═══════════════════════════════ */
{
  id: 'r07', difficulty: 'medium', lang: 'r', tags: ['group by', 'top'],
  title: 'Best day in each city',
  prompt: [
    'Given `df` with columns `date`, `city` and `revenue`, return each city\'s best day: the row with its highest revenue.',
    'Return the columns `city`, `date` and `revenue`. If a city has two days tied for best, keep both.',
  ],
  notes: ['Row order does not matter.'],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) df |> group_by(city) |> filter(revenue == max(revenue)) |> ungroup() |> select(city, date, revenue)
.example <- function() list(df = data.frame(
  date = as.Date("2024-01-01") + 0:5,
  city = c("Lagos", "Accra", "Lagos", "Accra", "Nairobi", "Lagos"),
  revenue = c(120, 95, 180, 110, 60, 150)))
.cases <- function() {
  set.seed(7)
  list(.example(),
       list(df = data.frame(date = as.Date("2024-02-01") + 0:3, city = c("Accra", "Accra", "Lagos", "Lagos"),
                            revenue = c(80, 80, 50, 20))),
       list(df = data.frame(date = as.Date("2024-03-01") + 0:39, city = sample(c("Lagos", "Accra", "Nairobi"), 40, TRUE),
                            revenue = round(runif(40, 20, 300), 2))))
}
`,
  hint: 'After `group_by(city)`, `filter(revenue == max(revenue))` keeps each city\'s best rows, ties included.',
  solution: 'solution <- function(df) {\n  df |>\n    group_by(city) |>\n    filter(revenue == max(revenue)) |>\n    ungroup() |>\n    select(city, date, revenue)\n}\n',
  alt: ['solution <- function(df) {\n  df |>\n    group_by(city) |>\n    slice_max(revenue, n = 1) |>\n    ungroup() |>\n    select(city, date, revenue)\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> filter(revenue == max(revenue)) |> select(city, date, revenue)\n}\n',
    'solution <- function(df) {\n  df |> group_by(city) |> slice_max(revenue, n = 1, with_ties = FALSE) |> ungroup() |> select(city, date, revenue)\n}\n',
  ],
},
{
  id: 'r08', difficulty: 'medium', lang: 'r', tags: ['group by', 'shares'],
  title: 'Share of the cups',
  prompt: [
    'Given `df` with columns `drink` and `cups`, return each drink\'s share of all the cups sold, as a percentage **rounded to 1 decimal place**.',
    'Return `drink` and `pct`, the biggest share first. Equal shares go in alphabetical order.',
  ],
  stub: STUB,
  mode: 'frame_ordered',
  setup: `
.ref <- function(df) df |> group_by(drink) |> summarise(cups = sum(cups)) |>
  mutate(pct = round(cups / sum(cups) * 100, 1)) |> arrange(desc(pct), drink) |> select(drink, pct)
.example <- function() list(df = data.frame(
  drink = c("latte", "tea", "latte", "mocha", "tea"),
  cups = c(30, 10, 20, 15, 25)))
.cases <- function() {
  set.seed(8)
  list(.example(),
       list(df = data.frame(drink = c("b", "a"), cups = c(5, 5))),
       list(df = data.frame(drink = sample(c("latte", "tea", "mocha", "chai", "flat white"), 30, TRUE),
                            cups = sample(1:40, 30, TRUE))))
}
`,
  hint: 'Sum the cups per drink first, then `mutate(pct = round(cups / sum(cups) * 100, 1))`, then sort.',
  solution: 'solution <- function(df) {\n  df |>\n    group_by(drink) |>\n    summarise(cups = sum(cups)) |>\n    mutate(pct = round(cups / sum(cups) * 100, 1)) |>\n    arrange(desc(pct), drink) |>\n    select(drink, pct)\n}\n',
  alt: ['solution <- function(df) {\n  t <- tapply(df$cups, df$drink, sum)\n  out <- data.frame(drink = names(t), pct = round(as.numeric(t) / sum(t) * 100, 1))\n  out[order(-out$pct, out$drink), ]\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> count(drink) |> mutate(pct = round(n / sum(n) * 100, 1)) |> arrange(desc(pct), drink) |> select(drink, pct)\n}\n',
    'solution <- function(df) {\n  df |> group_by(drink) |> summarise(cups = sum(cups)) |> mutate(pct = round(cups / sum(cups) * 100, 1)) |> select(drink, pct)\n}\n',
  ],
},
{
  id: 'r09', difficulty: 'medium', lang: 'r', tags: ['missing data', 'group by'],
  title: 'Fill from the same city',
  prompt: [
    'Given `df` with columns `city` and `rating`, fill each missing `rating` with the average of the known ratings **in the same city**, rounded to 2 decimal places.',
    'Leave the known ratings as they are, and return the whole table.',
  ],
  notes: ['Every city has at least one known rating.'],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) df |> group_by(city) |>
  mutate(rating = coalesce(rating, round(mean(rating, na.rm = TRUE), 2))) |> ungroup()
.example <- function() list(df = data.frame(
  city = c("Lagos", "Lagos", "Accra", "Accra", "Lagos", "Accra"),
  rating = c(4.2, NA, 3.1, 3.4, 4.5, NA)))
.cases <- function() {
  set.seed(9)
  r <- round(runif(30, 2, 5), 1)
  r[c(2, 11, 20, 29)] <- NA
  list(.example(),
       list(df = data.frame(city = c("Kigali", "Kigali", "Kigali"), rating = c(NA, 4, 5))),
       list(df = data.frame(city = rep(c("Lagos", "Accra", "Nairobi"), 10), rating = r)))
}
`,
  hint: 'After `group_by(city)`, `mean(rating, na.rm = TRUE)` is that city\'s average. `coalesce(rating, ...)` fills only the gaps.',
  solution: 'solution <- function(df) {\n  df |>\n    group_by(city) |>\n    mutate(rating = coalesce(rating, round(mean(rating, na.rm = TRUE), 2))) |>\n    ungroup()\n}\n',
  alt: ['solution <- function(df) {\n  avg <- ave(df$rating, df$city, FUN = function(x) round(mean(x, na.rm = TRUE), 2))\n  df$rating <- ifelse(is.na(df$rating), avg, df$rating)\n  df\n}\n'],
  wrong: [
    'solution <- function(df) {\n  mutate(df, rating = coalesce(rating, round(mean(rating, na.rm = TRUE), 2)))\n}\n',
    'solution <- function(df) {\n  df |> group_by(city) |> mutate(rating = coalesce(rating, mean(rating, na.rm = TRUE))) |> ungroup()\n}\n',
  ],
},
{
  id: 'r10', difficulty: 'medium', lang: 'r', tags: ['counting', 'vectors'],
  title: 'Customers who came back',
  prompt: [
    'Given `df` of orders with a `customer_id` column, return the ids of the customers with **two or more** orders.',
    'Return them as a vector, smallest id first.',
  ],
  notes: ['If nobody came back, return an empty vector.'],
  stub: STUB,
  mode: 'vector',
  setup: `
.ref <- function(df) df |> count(customer_id) |> filter(n >= 2) |> arrange(customer_id) |> pull(customer_id)
.example <- function() list(df = data.frame(order_id = 1:7, customer_id = c(9, 3, 9, 5, 3, 7, 3)))
.cases <- function() {
  set.seed(10)
  list(.example(),
       list(df = data.frame(order_id = 1:3, customer_id = c(1, 2, 3))),
       list(df = data.frame(order_id = 1:40, customer_id = sample(1:25, 40, TRUE))))
}
`,
  hint: '`count(df, customer_id)` gives each customer\'s orders in `n`. Keep `n >= 2`, sort, then `pull(customer_id)` takes the column out as a vector.',
  solution: 'solution <- function(df) {\n  df |>\n    count(customer_id) |>\n    filter(n >= 2) |>\n    arrange(customer_id) |>\n    pull(customer_id)\n}\n',
  alt: ['solution <- function(df) {\n  sort(unique(df$customer_id[duplicated(df$customer_id)]))\n}\n'],
  wrong: [
    'solution <- function(df) {\n  unique(df$customer_id[duplicated(df$customer_id)])\n}\n',
    'solution <- function(df) {\n  df |> count(customer_id) |> filter(n >= 3) |> arrange(customer_id) |> pull(customer_id)\n}\n',
  ],
},
{
  id: 'r11', difficulty: 'medium', lang: 'r', tags: ['dates', 'group by'],
  title: 'Month by month',
  prompt: [
    'Given `df` with columns `date` (real dates) and `revenue`, return the total revenue for each month.',
    'Return `month`, as text like `"2024-01"`, and `revenue`, in month order.',
  ],
  notes: ['The rows are not in date order, and they can span more than one year.'],
  stub: STUB,
  mode: 'frame_ordered',
  setup: `
.ref <- function(df) df |> mutate(month = format(date, "%Y-%m")) |> group_by(month) |>
  summarise(revenue = sum(revenue)) |> arrange(month)
.example <- function() list(df = data.frame(
  date = as.Date(c("2024-02-03", "2024-01-15", "2024-02-20", "2024-01-02")),
  revenue = c(120, 80, 60, 40)))
.cases <- function() {
  set.seed(11)
  list(.example(),
       list(df = data.frame(date = as.Date(c("2024-01-05", "2023-01-09", "2023-12-31")), revenue = c(10, 20, 30))),
       list(df = data.frame(date = as.Date("2023-11-01") + sample(0:150, 40), revenue = round(runif(40, 10, 200), 2))))
}
`,
  hint: '`format(date, "%Y-%m")` gives the year and month as text, which sorts in date order. Group by it and sum.',
  solution: 'solution <- function(df) {\n  df |>\n    mutate(month = format(date, "%Y-%m")) |>\n    group_by(month) |>\n    summarise(revenue = sum(revenue)) |>\n    arrange(month)\n}\n',
  alt: ['solution <- function(df) {\n  t <- tapply(df$revenue, format(df$date, "%Y-%m"), sum)\n  data.frame(month = names(t), revenue = as.numeric(t))\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> mutate(month = format(date, "%m")) |> group_by(month) |> summarise(revenue = sum(revenue))\n}\n',
    'solution <- function(df) {\n  df |> mutate(month = months(date)) |> group_by(month) |> summarise(revenue = sum(revenue))\n}\n',
  ],
},
{
  id: 'r12', difficulty: 'medium', lang: 'r', tags: ['group by', 'filtering'],
  title: 'Above their own average',
  prompt: [
    'Given `df` with columns `city` and `cups`, return the rows where `cups` is **above the average for that row\'s city**.',
    'Keep every column.',
  ],
  notes: ['Row order does not matter. Exactly the average is not above it.'],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) df |> group_by(city) |> filter(cups > mean(cups)) |> ungroup()
.example <- function() list(df = data.frame(
  city = c("Lagos", "Lagos", "Lagos", "Accra", "Accra"),
  cups = c(10, 40, 70, 20, 30)))
.cases <- function() {
  set.seed(12)
  list(.example(),
       list(df = data.frame(city = c("Accra", "Accra", "Lagos"), cups = c(25, 25, 90))),
       list(df = data.frame(city = sample(c("Lagos", "Accra", "Nairobi"), 36, TRUE), cups = sample(5:80, 36, TRUE))))
}
`,
  hint: 'After `group_by(city)`, `mean(cups)` is that city\'s average, so `filter(cups > mean(cups))` compares each row with its own city.',
  solution: 'solution <- function(df) {\n  df |>\n    group_by(city) |>\n    filter(cups > mean(cups)) |>\n    ungroup()\n}\n',
  alt: ['solution <- function(df) {\n  df[df$cups > ave(df$cups, df$city), ]\n}\n'],
  wrong: [
    'solution <- function(df) {\n  filter(df, cups > mean(cups))\n}\n',
    'solution <- function(df) {\n  df |> group_by(city) |> filter(cups >= mean(cups)) |> ungroup()\n}\n',
  ],
},

/* ════════════════════════════════ Hard ════════════════════════════════ */
{
  id: 'r13', difficulty: 'hard', lang: 'r', tags: ['dates', 'runs'],
  title: 'The longest streak',
  prompt: [
    'Given `df` with a `date` column of real dates (the days someone studied), return the length of their longest run of **consecutive days**, as a single number.',
    'The dates can be in any order, and the same day can appear more than once. No rows at all is a streak of 0.',
  ],
  stub: STUB,
  mode: 'scalar',
  setup: `
.ref <- function(df) {
  d <- sort(unique(df$date))
  if (!length(d)) return(0)
  breaks <- c(TRUE, diff(as.numeric(d)) != 1)
  max(table(cumsum(breaks)))
}
.example <- function() list(df = data.frame(date = as.Date(c(
  "2024-03-04", "2024-03-01", "2024-03-02", "2024-03-02", "2024-03-03", "2024-03-07", "2024-03-08"))))
.cases <- function() {
  set.seed(13)
  list(.example(),
       list(df = data.frame(date = as.Date(character()))),
       list(df = data.frame(date = as.Date("2024-01-10"))),
       list(df = data.frame(date = as.Date("2024-01-01") + sample(0:60, 45, TRUE))))
}
`,
  hint: 'Sort the unique days. A new run starts wherever the gap to the day before is not 1: `cumsum()` of those starts numbers each run, and `table()` counts its days.',
  solution: 'solution <- function(df) {\n  d <- sort(unique(df$date))\n  if (length(d) == 0) return(0)\n  starts <- c(TRUE, diff(as.numeric(d)) != 1)\n  max(table(cumsum(starts)))\n}\n',
  alt: ['solution <- function(df) {\n  d <- sort(unique(df$date))\n  if (length(d) == 0) return(0)\n  runs <- rle(diff(as.numeric(d)) == 1)\n  ones <- runs$lengths[runs$values]\n  if (length(ones) == 0) 1 else max(ones) + 1\n}\n'],
  wrong: [
    'solution <- function(df) {\n  d <- sort(df$date)\n  if (length(d) == 0) return(0)\n  starts <- c(TRUE, diff(as.numeric(d)) != 1)\n  max(table(cumsum(starts)))\n}\n',
    'solution <- function(df) {\n  d <- unique(df$date)\n  if (length(d) == 0) return(0)\n  starts <- c(TRUE, diff(as.numeric(d)) != 1)\n  max(table(cumsum(starts)))\n}\n',
  ],
},
{
  id: 'r14', difficulty: 'hard', lang: 'r', tags: ['window', 'group by'],
  title: 'Running total in each city',
  prompt: [
    'Given `df` with columns `date`, `city` and `revenue`, add `running`: each city\'s revenue so far, day by day, starting again for every city.',
    'Return every row, sorted by `city` and then by `date`.',
  ],
  notes: ['The rows arrive in no particular order.'],
  stub: STUB,
  mode: 'frame_ordered',
  setup: `
.ref <- function(df) df |> arrange(city, date) |> group_by(city) |> mutate(running = cumsum(revenue)) |> ungroup()
.example <- function() list(df = data.frame(
  date = as.Date(c("2024-01-03", "2024-01-01", "2024-01-02", "2024-01-01", "2024-01-02")),
  city = c("Lagos", "Lagos", "Accra", "Accra", "Lagos"),
  revenue = c(30, 10, 25, 15, 20)))
.cases <- function() {
  set.seed(14)
  n <- 30
  list(.example(),
       list(df = data.frame(date = as.Date("2024-05-01"), city = "Kigali", revenue = 9)),
       list(df = data.frame(date = as.Date("2024-02-01") + sample(0:200, n), city = sample(c("Lagos", "Accra", "Nairobi"), n, TRUE),
                            revenue = round(runif(n, 5, 90), 2))))
}
`,
  hint: 'Sort by city and date first, then `group_by(city)` and `mutate(running = cumsum(revenue))`.',
  solution: 'solution <- function(df) {\n  df |>\n    arrange(city, date) |>\n    group_by(city) |>\n    mutate(running = cumsum(revenue)) |>\n    ungroup()\n}\n',
  alt: ['solution <- function(df) {\n  df <- df[order(df$city, df$date), ]\n  df$running <- ave(df$revenue, df$city, FUN = cumsum)\n  df\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> arrange(city, date) |> mutate(running = cumsum(revenue))\n}\n',
    'solution <- function(df) {\n  df |> group_by(city) |> mutate(running = cumsum(revenue)) |> ungroup() |> arrange(city, date)\n}\n',
  ],
},
{
  id: 'r15', difficulty: 'hard', lang: 'r', tags: ['group by', 'ranking'],
  title: 'Second best',
  prompt: [
    'Given `df` with columns `city` and `revenue`, return each city\'s **second-highest different** revenue.',
    'If a city\'s top revenue appears twice, the second best is the next value down. A city with only one different value has no second best: leave it out.',
    'Return `city` and `revenue`.',
  ],
  notes: ['Row order does not matter.'],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) df |> distinct(city, revenue) |> group_by(city) |>
  arrange(desc(revenue), .by_group = TRUE) |> slice(2) |> ungroup()
.example <- function() list(df = data.frame(
  city = c("Lagos", "Lagos", "Lagos", "Accra", "Accra", "Nairobi"),
  revenue = c(300, 300, 250, 120, 90, 75)))
.cases <- function() {
  set.seed(15)
  list(.example(),
       list(df = data.frame(city = c("Kigali", "Kigali"), revenue = c(50, 50))),
       list(df = data.frame(city = sample(c("Lagos", "Accra", "Nairobi"), 30, TRUE), revenue = sample(c(10, 20, 30, 40, 50), 30, TRUE))))
}
`,
  hint: '`distinct(city, revenue)` drops repeated values. Then, in each city, sort biggest first and take the second row: `slice(2)`.',
  solution: 'solution <- function(df) {\n  df |>\n    distinct(city, revenue) |>\n    group_by(city) |>\n    arrange(desc(revenue), .by_group = TRUE) |>\n    slice(2) |>\n    ungroup()\n}\n',
  alt: ['solution <- function(df) {\n  df |>\n    group_by(city) |>\n    filter(revenue < max(revenue)) |>\n    summarise(revenue = max(revenue))\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> group_by(city) |> arrange(desc(revenue), .by_group = TRUE) |> slice(2) |> ungroup()\n}\n',
    'solution <- function(df) {\n  df |> distinct(city, revenue) |> arrange(desc(revenue)) |> slice(2)\n}\n',
  ],
},
{
  id: 'r16', difficulty: 'hard', lang: 'r', tags: ['dates', 'window', 'group by'],
  title: 'How long between orders',
  prompt: [
    'Given `df` of orders with columns `customer_id` and `order_date` (real dates), find each customer\'s **median** number of days between one order and their next.',
    'Customers with only one order have no gaps: leave them out. Return `customer_id` and `gap`.',
  ],
  notes: ['The orders arrive in no particular order. Row order does not matter.'],
  stub: STUB,
  mode: 'frame',
  setup: `
.ref <- function(df) df |> arrange(customer_id, order_date) |> group_by(customer_id) |>
  mutate(gap = as.numeric(order_date - lag(order_date))) |>
  summarise(gap = median(gap, na.rm = TRUE)) |> filter(!is.na(gap))
.example <- function() list(df = data.frame(
  customer_id = c(1, 2, 1, 1, 3, 2, 1),
  order_date = as.Date(c("2024-01-10", "2024-01-05", "2024-01-01", "2024-01-31", "2024-02-01", "2024-01-12", "2024-02-02"))))
.cases <- function() {
  set.seed(16)
  list(.example(),
       list(df = data.frame(customer_id = c(4, 5), order_date = as.Date(c("2024-03-01", "2024-03-02")))),
       list(df = data.frame(customer_id = sample(1:10, 40, TRUE), order_date = as.Date("2024-01-01") + sample(0:120, 40, TRUE))))
}
`,
  hint: 'Sort by customer and date, then inside each customer `lag(order_date)` is the order before. The gap is the difference, as a number. `median(gap, na.rm = TRUE)`, then drop the customers whose median is `NA`.',
  solution: 'solution <- function(df) {\n  df |>\n    arrange(customer_id, order_date) |>\n    group_by(customer_id) |>\n    mutate(gap = as.numeric(order_date - lag(order_date))) |>\n    summarise(gap = median(gap, na.rm = TRUE)) |>\n    filter(!is.na(gap))\n}\n',
  alt: ['solution <- function(df) {\n  gaps <- lapply(split(df$order_date, df$customer_id), function(d) diff(as.numeric(sort(d))))\n  gaps <- gaps[lengths(gaps) > 0]\n  data.frame(customer_id = as.numeric(names(gaps)), gap = vapply(gaps, median, 0))\n}\n'],
  wrong: [
    'solution <- function(df) {\n  df |> arrange(customer_id, order_date) |> group_by(customer_id) |> mutate(gap = as.numeric(order_date - lag(order_date))) |> summarise(gap = mean(gap, na.rm = TRUE)) |> filter(!is.na(gap))\n}\n',
    'solution <- function(df) {\n  df |> group_by(customer_id) |> mutate(gap = as.numeric(order_date - lag(order_date))) |> summarise(gap = median(gap, na.rm = TRUE)) |> filter(!is.na(gap))\n}\n',
  ],
},
];
