/* R for data analysis: the pandas course's questions again, in R, on the
   same tables. Base R for the first look, then dplyr (filter, mutate,
   group_by, summarise), which is how most analysts write R today. It runs
   in webR (js/r.js), fetched the first time an R lesson runs.

   Checks are R. Each run's helpers:
     has("name")                     the learner made it
     expect(condition, "message")    the message is the hint when it's FALSE
     expect_table(got, want, ordered = FALSE)
                                     same columns (any case), same rows, in
                                     order if ordered; says what differs
     out_has("text"), .out, .last    what was printed, and the last value
     fresh("cafe")                   a table as loaded, before the learner's changes */

export const R_LESSONS = [
{
  id: 'r-01', mins: 3,
  title: 'A table you can talk to',
  concept: [
    'R is a language made for working with data. A table in R is called a **data frame**: named columns, numbered rows.',
    '`data.frame(...)` builds one. Each `name = c(...)` becomes a column, and `c()` (short for combine) lists the values down it.',
    '`<-` stores something under a name. A name on a line of its own is shown underneath when you run.',
  ],
  starter: `menu <- data.frame(
  drink = c("latte", "espresso", "tea"),
  price = c(4.50, 3.00, 2.75)
)

menu`,
  task: 'Add a third column, `cups`, with the values 30, 12 and 18.',
  hint: 'Put a comma at the end of the price line, then add `cups = c(30, 12, 18)` under it. Every column needs the same number of values: 3 here.',
  solution: `menu <- data.frame(
  drink = c("latte", "espresso", "tea"),
  price = c(4.50, 3.00, 2.75),
  cups = c(30, 12, 18)
)

menu`,
  check: `expect(has("menu"), "Keep the table in a variable called menu.")
expect("cups" %in% names(menu), "menu doesn't have a cups column yet.")
expect(identical(as.numeric(menu$cups), c(30, 12, 18)), "cups should be 30, 12, 18, in that order.")`,
},
{
  id: 'r-02', mins: 3,
  title: 'First look at real data',
  concept: [
    '`cafe` is already loaded for you: 120 days of sales at a café in three cities. It is the same table the pandas course uses.',
    '`head(cafe, 3)` shows the first 3 rows. `dim(cafe)` gives its size, rows then columns, and `names(cafe)` lists the column names.',
    'R starts a line of results with `[1]`. It only means "this line starts with the first value".',
  ],
  starter: `head(cafe)`,
  task: 'Show `dim(cafe)`, then the first **3** rows.',
  hint: 'Two lines: `dim(cafe)`, then `head(cafe, 3)`.',
  solution: `dim(cafe)

head(cafe, 3)`,
  check: `expect(grepl("120 +7", .out), "Add dim(cafe). I should see 120 and 7 in the output.")
expect(out_has("2024-01-03"), "Show the first 3 rows with head(cafe, 3).")
expect(!out_has("2024-01-04"), "That's more than 3 rows. Give head() a 3.")`,
},
{
  id: 'r-03', mins: 3,
  title: 'One column at a time',
  concept: [
    '`cafe$cups` picks out one column: the table, a `$`, then the column\'s name. A column on its own is a **vector**, a row of values.',
    'A vector can be summed up: `mean()` for the average, `max()` for the biggest, `sum()` for the total.',
    'In R, what a function works on goes inside its brackets: `sum(cafe$cups)`.',
  ],
  starter: `mean(cafe$cups)
max(cafe$cups)`,
  task: 'Store the **total** number of cups sold in a variable called `total_cups`, and show it.',
  hint: '`total_cups <- sum(cafe$cups)`, then `total_cups` on a line of its own.',
  solution: `total_cups <- sum(cafe$cups)

mean(cafe$cups)
total_cups`,
  check: `expect(has("total_cups"), "Make a variable called total_cups.")
expect(isTRUE(all.equal(as.numeric(total_cups), sum(cafe$cups))), "total_cups should be the sum of the cups column.")`,
},
{
  id: 'r-04', mins: 3,
  title: 'Counting and describing',
  concept: [
    '`summary(cafe$revenue)` describes a number column at once: the smallest, the quarter points, the middle (median), the average (mean) and the largest.',
    '`count(cafe, city)` counts how many rows there are for each city, and gives back a table with the count in a column called `n`.',
    '`count()` comes from **dplyr**, R\'s toolkit for tables, which is already loaded here.',
  ],
  starter: `summary(cafe$revenue)`,
  task: 'Show how many rows there are for each `city`.',
  hint: '`count(cafe, city)`: the table first, then the column to count. Put it on the last line.',
  solution: `summary(cafe$revenue)

count(cafe, city)`,
  check: `expect(is.data.frame(.last) && "n" %in% names(.last), "End with count(cafe, city), which gives back a table with an n column.")
expect_table(.last, count(fresh("cafe"), city))`,
},
{
  id: 'r-05', mins: 4,
  title: 'Keeping only the rows you want',
  concept: [
    '`filter(cafe, cups > 45)` keeps only the rows where the condition is true. The table comes first, then the question to ask of every row.',
    'Inside dplyr\'s functions you write column names on their own, with no `cafe$` in front.',
    'dplyr is already loaded here. In R on your own computer you would start with `library(dplyr)`.',
  ],
  starter: `filter(cafe, cups > 50)`,
  task: 'Make `busy` hold every row where more than 45 cups were sold, and show how many rows it has.',
  hint: '`busy <- filter(cafe, cups > 45)`, then `nrow(busy)` to count its rows.',
  solution: `busy <- filter(cafe, cups > 45)

nrow(busy)
head(busy)`,
  check: `expect(has("busy"), "Make a variable called busy.")
expect(is.data.frame(busy), "busy should be a table of whole rows: filter(cafe, ...).")
expect(all(busy$cups > 45), "Some rows in busy have 45 cups or fewer.")
expect_table(busy, filter(fresh("cafe"), cups > 45))`,
},
{
  id: 'r-06', mins: 4,
  title: 'Two conditions at once',
  concept: [
    'Give `filter()` two conditions with a comma between them, and a row has to pass both.',
    '`&` means and, `|` means or, and `!` means not: `filter(cafe, city == "Lagos" | city == "Accra")`.',
    'R compares with a double `==`. A single `=` names something, so it can\'t ask a question.',
  ],
  starter: `hot <- filter(cafe, city == "Lagos", cups > 40)
head(hot)`,
  task: 'Make `cheap_good` = rows where `price` is under 3.5 **and** `rating` is above 4.5.',
  hint: '`filter(cafe, price < 3.5, rating > 4.5)`',
  solution: `cheap_good <- filter(cafe, price < 3.5, rating > 4.5)

nrow(cheap_good)
cheap_good`,
  check: `expect(has("cheap_good"), "Make a variable called cheap_good.")
expect_table(cheap_good, filter(fresh("cafe"), price < 3.5, rating > 4.5))`,
},
{
  id: 'r-07', mins: 3,
  title: 'Adding a column',
  concept: [
    '`mutate()` adds a column worked out from the others: `mutate(cafe, per_cup = revenue / cups)`.',
    'It gives back a new table with the extra column. To keep it, store the result over the old one: `cafe <- mutate(cafe, ...)`.',
    '`round(x, 2)` rounds to 2 decimal places.',
  ],
  starter: `cafe <- mutate(cafe, per_cup = revenue / cups)

head(cafe)`,
  task: 'Add a `tip` column worth 10% of `revenue`, rounded to 2 decimals, and keep it in `cafe`.',
  hint: '`cafe <- mutate(cafe, tip = round(revenue * 0.10, 2))`',
  solution: `cafe <- mutate(cafe, tip = round(revenue * 0.10, 2))

head(cafe)`,
  check: `expect("tip" %in% names(cafe), "cafe doesn't have a tip column yet. Keep it: cafe <- mutate(cafe, ...).")
expect(isTRUE(all.equal(cafe$tip, round(cafe$revenue * 0.10, 2))), "tip should be revenue times 0.10, rounded to 2 places.")`,
},
{
  id: 'r-08', mins: 3,
  title: 'Sorting and top rows',
  concept: [
    '`arrange(cafe, revenue)` sorts the rows, smallest first. Wrap the column in `desc()` for biggest first.',
    '`head(x, 5)` then keeps the first 5 rows. Sorted first, that is the best five.',
    '`slice_max(cafe, revenue, n = 5)` does both in one go.',
  ],
  starter: `top5 <- head(arrange(cafe, revenue), 5)
top5`,
  task: 'Make `top5` hold the 5 highest-revenue days, biggest first.',
  hint: 'The starter sorts the wrong way round. `desc(revenue)` flips it, or use `slice_max(cafe, revenue, n = 5)`.',
  solution: `top5 <- slice_max(cafe, revenue, n = 5)

top5`,
  check: `expect(has("top5"), "Make a variable called top5.")
expect_table(top5, slice_max(fresh("cafe"), revenue, n = 5), ordered = TRUE)`,
},
{
  id: 'r-09', mins: 4,
  title: 'group_by: the big one',
  concept: [
    '`group_by(drink)` sorts the rows into groups, one per drink, and `summarise()` boils each group down to one row.',
    '`|>` is the pipe. It hands what\'s on its left to the function on its right, so read it as "and then": `cafe |> group_by(drink) |> summarise(cups = sum(cups))`.',
    'In `summarise()`, the name before the `=` is the new column\'s name.',
  ],
  starter: `cafe |>
  group_by(city) |>
  summarise(revenue = sum(revenue))`,
  task: 'Make `by_drink` = the **total cups** sold for each `drink`, in a column called `cups`.',
  hint: 'Group by `drink` instead of city, and sum `cups`: `cafe |> group_by(drink) |> summarise(cups = sum(cups))`.',
  solution: `by_drink <- cafe |>
  group_by(drink) |>
  summarise(cups = sum(cups))

by_drink`,
  check: `expect(has("by_drink"), "Make a variable called by_drink.")
expect_table(by_drink, fresh("cafe") |> group_by(drink) |> summarise(cups = sum(cups)))`,
},
{
  id: 'r-10', mins: 4,
  title: 'Several summaries at once',
  concept: [
    '`summarise()` can make several columns at once, with commas between them.',
    '`n()` counts the rows in each group, and `mean(x, na.rm = TRUE)` averages while skipping missing values.',
    'Without `na.rm = TRUE`, one missing value makes the whole average `NA`, which is R\'s word for missing.',
  ],
  starter: `cafe |>
  group_by(drink) |>
  summarise(days = n())`,
  task: 'Make `drinks`: per `drink`, `total_cups` (sum of cups) and `avg_rating` (mean of rating, skipping missing values).',
  hint: '`summarise(total_cups = sum(cups), avg_rating = mean(rating, na.rm = TRUE))`',
  solution: `drinks <- cafe |>
  group_by(drink) |>
  summarise(total_cups = sum(cups), avg_rating = mean(rating, na.rm = TRUE))

drinks`,
  check: `expect(has("drinks"), "Make a variable called drinks.")
expect(!anyNA(drinks$avg_rating), "avg_rating has an NA in it: add na.rm = TRUE inside mean().")
expect_table(drinks, fresh("cafe") |> group_by(drink) |> summarise(total_cups = sum(cups), avg_rating = mean(rating, na.rm = TRUE)))`,
},
{
  id: 'r-11', mins: 4,
  title: 'Holes in the data',
  concept: [
    'A missing value in R is `NA`. `is.na(x)` asks every value "are you missing?" and gives back TRUE or FALSE for each.',
    '`sum(is.na(cafe$rating))` counts the holes, because TRUE counts as 1 and FALSE as 0.',
    '`coalesce(rating, 4)` fills each hole with 4 and leaves the other values alone.',
  ],
  starter: `sum(is.na(cafe$rating))`,
  task: 'Make `filled`: `cafe` with each missing `rating` replaced by the average rating. Then show how many holes are left.',
  hint: '`filled <- mutate(cafe, rating = coalesce(rating, mean(rating, na.rm = TRUE)))`, then `sum(is.na(filled$rating))`.',
  solution: `filled <- mutate(cafe, rating = coalesce(rating, mean(rating, na.rm = TRUE)))

sum(is.na(filled$rating))
head(filled)`,
  check: `expect(has("filled"), "Make a variable called filled.")
expect(!anyNA(filled$rating), "filled still has missing ratings.")
avg <- mean(fresh("cafe")$rating, na.rm = TRUE)
expect(isTRUE(all.equal(filled$rating, ifelse(is.na(fresh("cafe")$rating), avg, fresh("cafe")$rating))), "The holes should get the average rating, and the other ratings stay as they were.")`,
},
{
  id: 'r-12', mins: 4,
  title: 'Working with dates',
  concept: [
    'The `date` column holds real dates, so R can do date things with it.',
    '`format(date, "%Y-%m")` turns a date into text like `2024-01`. `%Y` stands for the year and `%m` for the month\'s number.',
    'Make a month column with `mutate()`, then group by it.',
  ],
  starter: `cafe |>
  mutate(month = format(date, "%Y-%m")) |>
  head()`,
  task: 'Make `monthly` = total `revenue` per month, with the columns `month` and `revenue`.',
  hint: 'After the mutate: `group_by(month) |> summarise(revenue = sum(revenue))`.',
  solution: `monthly <- cafe |>
  mutate(month = format(date, "%Y-%m")) |>
  group_by(month) |>
  summarise(revenue = sum(revenue))

monthly`,
  check: `expect(has("monthly"), "Make a variable called monthly.")
expect_table(monthly, fresh("cafe") |> mutate(month = format(date, "%Y-%m")) |> group_by(month) |> summarise(revenue = sum(revenue)))`,
},
{
  id: 'r-13', mins: 4,
  title: 'Pivot tables',
  concept: [
    'A pivot table puts one thing down the side, another across the top, and a summary in every cell.',
    '`tapply(values, list(rows, columns), mean)` builds one: the numbers to summarise, then what goes down the side and across, then how to sum them up.',
    'It gives back a **matrix**, a grid of numbers with names on both edges. `round(x, 1)` rounds the whole grid.',
  ],
  starter: `tapply(cafe$cups, cafe$city, sum)`,
  task: 'Make `grid` = mean `revenue`, cities down the side, drinks across the top. Show it rounded to 1 place.',
  hint: '`grid <- tapply(cafe$revenue, list(cafe$city, cafe$drink), mean)`, then `round(grid, 1)`.',
  solution: `grid <- tapply(cafe$revenue, list(cafe$city, cafe$drink), mean)

round(grid, 1)`,
  check: `expect(has("grid"), "Make a variable called grid.")
want <- tapply(fresh("cafe")$revenue, list(fresh("cafe")$city, fresh("cafe")$drink), mean)
expect(is.matrix(grid) && identical(dim(grid), dim(want)), "grid should have the cities down the side and the drinks across the top.")
expect(identical(rownames(grid), rownames(want)), "The cities go down the side: list(cafe$city, cafe$drink), city first.")
expect(isTRUE(all.equal(unname(grid), unname(want))), "Each cell should be the mean revenue for that city and drink.")`,
},
{
  id: 'r-14', mins: 4,
  title: 'Picking by position',
  concept: [
    'Square brackets pick rows and columns by position: `cafe[rows, columns]`. Counting starts at 1.',
    '`cafe[1:3, ]` is the first three rows (an empty spot means all of them), and `cafe[, 1:2]` is the first two columns.',
    '`tail(x, 3)` is the last 3 rows, the way `head()` is the first.',
  ],
  starter: `cafe[1:3, ]`,
  task: 'Put the **last 3 rows** and the **first 2 columns** in `corner`.',
  hint: '`corner <- tail(cafe[, 1:2], 3)`',
  solution: `corner <- tail(cafe[, 1:2], 3)

corner`,
  check: `expect(has("corner"), "Make a variable called corner.")
expect_table(corner, fresh("cafe")[118:120, 1:2], ordered = TRUE)`,
},
{
  id: 'r-15', mins: 3,
  title: '%in% and between',
  concept: [
    '`drink %in% c("latte", "tea")` asks "is it one of these?" It is a short way to write several ors.',
    '`between(price, 3, 4.5)` keeps prices from 3 to 4.5, both ends included.',
    'A `!` in front turns a question round: `!drink %in% c("tea")` means "not tea".',
  ],
  starter: `filter(cafe, drink %in% c("latte", "tea"))`,
  task: 'Make `mid` = rows where `price` is between 3 and 4.5, and the drink is **not** tea.',
  hint: '`filter(cafe, between(price, 3, 4.5), !drink %in% c("tea"))`',
  solution: `mid <- filter(cafe, between(price, 3, 4.5), !drink %in% c("tea"))

nrow(mid)
head(mid)`,
  check: `expect(has("mid"), "Make a variable called mid.")
expect_table(mid, filter(fresh("cafe"), price >= 3, price <= 4.5, drink != "tea"))`,
},
{
  id: 'r-16', mins: 3,
  title: 'Renaming and dropping',
  concept: [
    '`select()` keeps the columns you name: `select(cafe, date, revenue)`. A minus drops one instead: `select(cafe, -rating)`.',
    '`rename(cafe, units = cups)` renames a column, new name first, then the old one.',
    'Both give back a new table, and `cafe` stays as it was.',
  ],
  starter: `select(cafe, date, city, revenue)`,
  task: 'Make `tidy` = cafe with `cups` renamed to `units` **and** `rating` removed.',
  hint: '`tidy <- cafe |> rename(units = cups) |> select(-rating)`',
  solution: `tidy <- cafe |>
  rename(units = cups) |>
  select(-rating)

head(tidy)`,
  check: `expect(has("tidy"), "Make a variable called tidy.")
expect_table(tidy, fresh("cafe") |> rename(units = cups) |> select(-rating))`,
},
{
  id: 'r-17', mins: 4,
  title: 'Your own function on a column',
  concept: [
    '`function(c) ...` makes a function of your own, where `c` stands for whatever you give it. Store it under a name and use it like any other.',
    '`ifelse(test, yes, no)` gives back yes where the test is TRUE and no where it is FALSE, for every value at once.',
    'So `size_of <- function(c) ifelse(c > 40, "big", "small")` labels a whole column in one go.',
  ],
  starter: `double_it <- function(x) x * 2
double_it(21)`,
  task: 'Add a `size` column to `cafe`: `"big"` when cups is over 40, otherwise `"small"`. Then count the sizes.',
  hint: 'Make `size_of` as above, then `cafe <- mutate(cafe, size = size_of(cups))`, then `count(cafe, size)`.',
  solution: `size_of <- function(c) ifelse(c > 40, "big", "small")
cafe <- mutate(cafe, size = size_of(cups))

count(cafe, size)`,
  check: `expect("size" %in% names(cafe), "cafe doesn't have a size column yet. Keep it: cafe <- mutate(cafe, ...).")
expect(identical(cafe$size, ifelse(cafe$cups > 40, "big", "small")), "size should be big when cups is over 40, and small otherwise.")`,
},
{
  id: 'r-18', mins: 4,
  title: 'Text columns',
  concept: [
    '`nchar(drink)` counts the letters in each value, `toupper()` puts them in capitals, and `trimws()` trims spaces off the ends.',
    '`grepl("brew", drink)` asks whether each value contains "brew", and gives back TRUE or FALSE.',
    'They all work on a whole column at once, so they fit inside `filter()` and `mutate()`.',
  ],
  starter: `unique(toupper(cafe$drink))`,
  task: 'Make `long_names` = rows where the drink name is longer than 5 characters, and show which drinks those are.',
  hint: '`long_names <- filter(cafe, nchar(drink) > 5)`, then `unique(long_names$drink)`.',
  solution: `long_names <- filter(cafe, nchar(drink) > 5)

unique(long_names$drink)`,
  check: `expect(has("long_names"), "Make a variable called long_names.")
expect_table(long_names, filter(fresh("cafe"), nchar(drink) > 5))`,
},
{
  id: 'r-19', mins: 4,
  title: 'Turning numbers into bands',
  concept: [
    '`cut(x, breaks, labels = ...)` sorts numbers into bands. `breaks` lists the edges, and `labels` names the bands between them.',
    '`quantile(x, c(0, 0.25, 0.5, 0.75, 1))` finds the edges that split the values into four groups of the same size.',
    'Add `include.lowest = TRUE` so the very smallest value lands in the first band.',
  ],
  starter: `quantile(cafe$revenue, c(0, 0.25, 0.5, 0.75, 1))`,
  task: 'Add a `tier` column to `cafe`: `revenue` split into 4 equal-sized groups labelled Q1, Q2, Q3 and Q4. Then count the tiers.',
  hint: 'Keep the edges as `edges <- quantile(...)`, then `cafe <- mutate(cafe, tier = cut(revenue, edges, labels = c("Q1", "Q2", "Q3", "Q4"), include.lowest = TRUE))`.',
  solution: `edges <- quantile(cafe$revenue, c(0, 0.25, 0.5, 0.75, 1))
cafe <- mutate(cafe, tier = cut(revenue, edges, labels = c("Q1", "Q2", "Q3", "Q4"), include.lowest = TRUE))

count(cafe, tier)`,
  check: `expect("tier" %in% names(cafe), "cafe doesn't have a tier column yet.")
expect(!anyNA(cafe$tier), "Some rows have no tier. Did you add include.lowest = TRUE?")
want <- cut(cafe$revenue, quantile(cafe$revenue, c(0, 0.25, 0.5, 0.75, 1)), labels = c("Q1", "Q2", "Q3", "Q4"), include.lowest = TRUE)
expect(identical(as.character(cafe$tier), as.character(want)), "tier should split revenue at its quarter points, labelled Q1 to Q4.")`,
},
{
  id: 'r-20', mins: 4,
  title: 'Loading a real CSV',
  concept: [
    '`read.csv()` reads a CSV file into a data frame. Here the file is a piece of text, so it goes in as `text = ...`.',
    'The first line of a CSV names the columns, and every line after it is a row.',
    'Once it is loaded it is an ordinary data frame, so you can filter it like any other.',
  ],
  starter: `text <- "name,city,cups
Ada,Lagos,12
Kofi,Accra,30
Zola,Nairobi,25
Ife,Lagos,41"

crew <- read.csv(text = text)
crew`,
  task: 'Make `busy_crew` = the rows of `crew` where `cups` is above 20.',
  hint: '`busy_crew <- filter(crew, cups > 20)`, then `busy_crew` on the last line.',
  solution: `text <- "name,city,cups
Ada,Lagos,12
Kofi,Accra,30
Zola,Nairobi,25
Ife,Lagos,41"

crew <- read.csv(text = text)
busy_crew <- filter(crew, cups > 20)

busy_crew`,
  check: `expect(has("busy_crew"), "Make a variable called busy_crew.")
expect_table(busy_crew, filter(crew, cups > 20))`,
},
{
  id: 'r-21', mins: 3,
  title: 'One step after another',
  concept: [
    'A pipe can be as long as you like. Each step takes the table from the step above it.',
    'Put each step on its own line and end the line with `|>`. It reads like a recipe.',
    'Older R code uses `%>%` for the same thing, so you will meet both.',
  ],
  starter: `cafe |>
  filter(city == "Lagos") |>
  head()`,
  task: 'Make `busy_lagos`: the Lagos days with **more than 40** cups, just the `date` and `cups` columns, most cups first.',
  hint: 'Add `cups > 40` to the filter, then `select(date, cups)`, then `arrange(desc(cups))`.',
  solution: `busy_lagos <- cafe |>
  filter(city == "Lagos", cups > 40) |>
  select(date, cups) |>
  arrange(desc(cups))

busy_lagos`,
  check: `expect(has("busy_lagos"), "Make a variable called busy_lagos.")
expect_table(busy_lagos, fresh("cafe") |> filter(city == "Lagos", cups > 40) |> select(date, cups) |> arrange(desc(cups)), ordered = TRUE)`,
},
{
  id: 'r-22', mins: 4,
  title: 'Build it in one chain',
  concept: [
    'A chain can mix every step you know: `mutate()`, `filter()`, `arrange()` and `summarise()`.',
    'A column made by `mutate()` can be used straight away by the steps below it.',
    'Build a chain one line at a time, and run it after each step to watch the table change.',
  ],
  starter: `cafe |>
  mutate(per_cup = revenue / cups) |>
  head()`,
  task: 'Make `best_value` in one chain: add `per_cup` (revenue divided by cups), keep the rows where `per_cup` is under 3, and sort by `per_cup`, cheapest first.',
  hint: 'After the mutate: `filter(per_cup < 3) |> arrange(per_cup)`.',
  solution: `best_value <- cafe |>
  mutate(per_cup = revenue / cups) |>
  filter(per_cup < 3) |>
  arrange(per_cup)

head(best_value)`,
  check: `expect(has("best_value"), "Make a variable called best_value.")
expect_table(best_value, fresh("cafe") |> mutate(per_cup = revenue / cups) |> filter(per_cup < 3) |> arrange(per_cup), ordered = TRUE)`,
},
{
  id: 'r-23', mins: 3,
  title: 'Pick a value by condition',
  concept: [
    '`weekdays(date)` gives the name of the day: "Monday", "Tuesday" and so on.',
    '`case_when()` checks conditions in order and gives the value of the first one that is true: `case_when(cups > 50 ~ "busy", cups > 30 ~ "steady", TRUE ~ "quiet")`.',
    'Read the `~` as "then". `TRUE ~` at the end catches everything left over.',
  ],
  starter: `cafe |>
  mutate(day = weekdays(date)) |>
  count(day)`,
  task: 'Add a column `day_type` to `cafe`: `"weekend"` on Saturdays and Sundays, `"weekday"` otherwise. Then count each type.',
  hint: '`cafe <- mutate(cafe, day_type = case_when(weekdays(date) %in% c("Saturday", "Sunday") ~ "weekend", TRUE ~ "weekday"))`',
  solution: `cafe <- mutate(cafe, day_type = case_when(
  weekdays(date) %in% c("Saturday", "Sunday") ~ "weekend",
  TRUE ~ "weekday"
))

count(cafe, day_type)`,
  check: `expect("day_type" %in% names(cafe), "cafe doesn't have a day_type column yet.")
want <- ifelse(weekdays(cafe$date) %in% c("Saturday", "Sunday"), "weekend", "weekday")
expect(identical(cafe$day_type, want), "day_type should be weekend on Saturdays and Sundays, and weekday otherwise.")`,
},
{
  id: 'r-24', mins: 4,
  title: 'Running totals and ranks',
  concept: [
    '`cumsum(x)` is a running total: each value, plus everything before it.',
    '`min_rank(desc(x))` ranks the values, 1 for the biggest. Equal values share a rank, the way a sports table does.',
    'Both work inside `mutate()`, so each becomes a new column.',
  ],
  starter: `cumsum(c(5, 10, 20))`,
  task: 'Add two columns to `cafe`: `running` (the revenue so far, day by day) and `rank` (each day\'s revenue rank, 1 = the best day). Show the best days first.',
  hint: '`cafe <- mutate(cafe, running = cumsum(revenue), rank = min_rank(desc(revenue)))`, then `head(arrange(cafe, rank))`.',
  solution: `cafe <- mutate(cafe, running = cumsum(revenue), rank = min_rank(desc(revenue)))

head(arrange(cafe, rank))`,
  check: `expect(all(c("running", "rank") %in% names(cafe)), "cafe needs both a running column and a rank column.")
expect(isTRUE(all.equal(cafe$running, cumsum(cafe$revenue))), "running should be the revenue so far: cumsum(revenue).")
expect(isTRUE(all.equal(as.numeric(cafe$rank), as.numeric(min_rank(desc(cafe$revenue))))), "rank should be 1 for the best day: min_rank(desc(revenue)).")`,
},
{
  id: 'r-25', mins: 3,
  title: 'Shares, not counts',
  concept: [
    '`orders` is the shop\'s order table: one row per order, each with a `status`.',
    '`count(orders, status)` counts the orders with each status, in a column called `n`.',
    'A share is one count divided by the total: `n / sum(n)`. Times 100, it is a percentage.',
  ],
  starter: `count(orders, status)`,
  task: 'Make `status_pct`: the count of each `status`, with a `pct` column added: its percentage of all orders, rounded to 1 decimal place.',
  hint: '`status_pct <- orders |> count(status) |> mutate(pct = round(n / sum(n) * 100, 1))`',
  solution: `status_pct <- orders |>
  count(status) |>
  mutate(pct = round(n / sum(n) * 100, 1))

status_pct`,
  check: `expect(has("status_pct"), "Make a variable called status_pct.")
expect_table(status_pct, fresh("orders") |> count(status) |> mutate(pct = round(n / sum(n) * 100, 1)))`,
},
{
  id: 'r-26', mins: 4,
  title: 'The top three in each group',
  concept: [
    'After `group_by()`, `slice_max()` works inside each group: the top rows of every city, rather than of the whole table.',
    '`slice_max(revenue, n = 3)` keeps the 3 biggest revenues in each group.',
    '`ungroup()` at the end takes the groups away again, so later steps see one table.',
  ],
  starter: `cafe |>
  slice_max(revenue, n = 3)`,
  task: 'Make `top3`: each city\'s three best days by revenue. That\'s 9 rows in all.',
  hint: 'Put `group_by(city)` before the `slice_max()`, and `ungroup()` after it.',
  solution: `top3 <- cafe |>
  group_by(city) |>
  slice_max(revenue, n = 3) |>
  ungroup()

top3`,
  check: `expect(has("top3"), "Make a variable called top3.")
expect_table(top3, fresh("cafe") |> group_by(city) |> slice_max(revenue, n = 3) |> ungroup())`,
},
{
  id: 'r-27', mins: 4,
  title: 'Keep only the groups that pass',
  concept: [
    'After `group_by()`, `filter()` asks its question of each group, so it can keep or drop whole groups.',
    'Inside it, `n()` is the number of rows in the group: `filter(n() >= 6)` keeps the groups with 6 or more.',
    '`n_distinct(x)` counts how many different values there are.',
  ],
  starter: `orders |>
  count(customer_id) |>
  arrange(desc(n))`,
  task: 'Make `regulars`: every order placed by a customer with 6 or more orders, keeping all the columns of `orders`. Then show how many customers that is.',
  hint: '`regulars <- orders |> group_by(customer_id) |> filter(n() >= 6) |> ungroup()`, then `n_distinct(regulars$customer_id)`.',
  solution: `regulars <- orders |>
  group_by(customer_id) |>
  filter(n() >= 6) |>
  ungroup()

n_distinct(regulars$customer_id)`,
  check: `expect(has("regulars"), "Make a variable called regulars.")
expect_table(regulars, fresh("orders") |> group_by(customer_id) |> filter(n() >= 6) |> ungroup())`,
},
{
  id: 'r-28', mins: 4,
  title: "Number each customer's orders",
  concept: [
    '`row_number()` numbers the rows 1, 2, 3 and on. After `group_by()`, it starts again at 1 in every group.',
    'Sort first, so the numbers follow time: `arrange(order_date, order_id)`.',
    'Then `nth == 1` marks each customer\'s first order.',
  ],
  starter: `o <- orders |>
  arrange(order_date, order_id)

head(o)`,
  task: 'Add a column `nth` to `o`: which order this is for that customer, 1 for their first. Then make `firsts`, just the rows where `nth` is 1.',
  hint: 'Add `group_by(customer_id) |> mutate(nth = row_number()) |> ungroup()` to the pipe, then `firsts <- filter(o, nth == 1)`.',
  solution: `o <- orders |>
  arrange(order_date, order_id) |>
  group_by(customer_id) |>
  mutate(nth = row_number()) |>
  ungroup()

firsts <- filter(o, nth == 1)
head(firsts)`,
  check: `expect(has("firsts"), "Make firsts: the rows of o where nth is 1.")
want <- fresh("orders") |> arrange(order_date, order_id) |> group_by(customer_id) |> mutate(nth = row_number()) |> ungroup()
expect_table(firsts, filter(want, nth == 1))`,
},
{
  id: 'r-29', mins: 4,
  title: 'Days since their last order',
  concept: [
    '`lag(x)` gives each row the value from the row before it. After `group_by()`, it stays inside each group.',
    'Take one date from another and you get the days between them. `as.numeric()` turns that into a plain number.',
    'A customer\'s first order has nothing before it, so its gap is `NA`.',
  ],
  starter: `o <- orders |>
  arrange(order_date, order_id) |>
  mutate(gap = as.numeric(order_date - lag(order_date)))

typical_gap <- round(mean(o$gap, na.rm = TRUE), 1)
typical_gap`,
  task: 'Fix `gap` so it\'s the days since **that customer\'s** previous order. Then `typical_gap` is the average gap, rounded to 1 place.',
  hint: 'Put `group_by(customer_id)` before the `mutate()`, and `ungroup()` after it.',
  solution: `o <- orders |>
  arrange(order_date, order_id) |>
  group_by(customer_id) |>
  mutate(gap = as.numeric(order_date - lag(order_date))) |>
  ungroup()

typical_gap <- round(mean(o$gap, na.rm = TRUE), 1)
typical_gap`,
  check: `expect(has("typical_gap"), "Make typical_gap: the average gap, rounded to 1 place.")
want <- fresh("orders") |> arrange(order_date, order_id) |> group_by(customer_id) |> mutate(gap = as.numeric(order_date - lag(order_date))) |> ungroup()
expect(isTRUE(all.equal(as.numeric(typical_gap), round(mean(want$gap, na.rm = TRUE), 1))), "typical_gap is off. Is the gap worked out inside each customer, with group_by(customer_id)?")`,
},
{
  id: 'r-30', mins: 4,
  title: 'Joining two tables',
  concept: [
    '`cities` holds each city\'s country and population, in millions.',
    '`left_join(cafe, cities, by = "city")` adds the matching columns from `cities` to every row of `cafe`, matched on the `city` values.',
    'A row with no match keeps all its own values and gets `NA` in the new columns.',
  ],
  starter: `cities`,
  task: 'Make `with_country`: `cafe` with the `country` and `population_m` of each row\'s city joined on. Then count the rows for each country.',
  hint: '`with_country <- left_join(cafe, cities, by = "city")`, then `count(with_country, country)`.',
  solution: `with_country <- left_join(cafe, cities, by = "city")

count(with_country, country)`,
  check: `expect(has("with_country"), "Make a variable called with_country.")
expect_table(with_country, left_join(fresh("cafe"), fresh("cities"), by = "city"))`,
},
{
  id: 'r-31', mins: 3,
  title: 'A pivot with totals',
  concept: [
    '`addmargins()` adds totals to a grid from `tapply()`: one for each row, one for each column, and a grand total in the corner.',
    'The totals are named `Sum`, on both edges.',
    '`round(x, 2)` rounds the whole grid, totals and all.',
  ],
  starter: `grid <- tapply(cafe$revenue, list(cafe$city, cafe$drink), sum)
round(grid, 2)`,
  task: 'Make `grid`: revenue by city (rows) and drink (columns), summed, with totals on both edges, rounded to 2 places.',
  hint: '`grid <- round(addmargins(grid), 2)` after the tapply line, then `grid` on the last line.',
  solution: `grid <- tapply(cafe$revenue, list(cafe$city, cafe$drink), sum)
grid <- round(addmargins(grid), 2)

grid`,
  check: `expect(has("grid"), "Make a variable called grid.")
want <- round(addmargins(tapply(fresh("cafe")$revenue, list(fresh("cafe")$city, fresh("cafe")$drink), sum)), 2)
expect(identical(dim(grid), dim(want)), "grid needs a total row and a total column. addmargins() adds both.")
expect(isTRUE(all.equal(unname(unclass(grid)), unname(unclass(want)))), "The cells should be summed revenue, with the totals, rounded to 2 places.")`,
},
{
  id: 'r-32', mins: 4,
  title: 'Days in week order',
  concept: [
    'Text sorts A to Z, so Friday comes before Monday. To put days in their real order, R has to be told it.',
    'A **factor** is text with a fixed order: `factor(day, levels = week)`, where `week` lists the days from Monday.',
    'Group by a factor and the groups come out in that order.',
  ],
  starter: `cafe |>
  mutate(day = weekdays(date)) |>
  group_by(day) |>
  summarise(revenue = round(sum(revenue), 2))`,
  task: 'Make `by_day`: total revenue for each day of the week, Monday to Sunday in that order, rounded to 2 places.',
  hint: 'Make `week <- c("Monday", "Tuesday", ...)`, then `mutate(day = factor(weekdays(date), levels = week))` before the group_by.',
  solution: `week <- c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")

by_day <- cafe |>
  mutate(day = factor(weekdays(date), levels = week)) |>
  group_by(day) |>
  summarise(revenue = round(sum(revenue), 2))

by_day`,
  check: `expect(has("by_day"), "Make a variable called by_day.")
expect(is.factor(by_day$day), "Make day a factor, so it keeps the week's order: factor(weekdays(date), levels = week).")
days <- c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
want <- fresh("cafe") |> mutate(day = factor(weekdays(date), levels = days)) |> group_by(day) |> summarise(revenue = round(sum(revenue), 2))
expect_table(by_day, want, ordered = TRUE)`,
},
{
  id: 'r-33', mins: 4,
  title: 'Splitting a cell into rows',
  concept: [
    '`strsplit(items, ", ")` splits each piece of text at every comma and gives back a **list**: one bundle of pieces for each row.',
    '`unlist()` pours all the bundles out into one long vector.',
    'Then `table()` counts each value, and `sort(x, decreasing = TRUE)` puts the most common first.',
  ],
  starter: `tickets <- data.frame(
  ticket = 1:5,
  items = c("latte, scone", "tea", "latte, latte, muffin", "cold brew, scone", "tea, muffin")
)

strsplit(tickets$items, ", ")`,
  task: 'Make `counts`: how many times each item was ordered across all the tickets, most first.',
  hint: '`counts <- sort(table(unlist(strsplit(tickets$items, ", "))), decreasing = TRUE)`',
  solution: `tickets <- data.frame(
  ticket = 1:5,
  items = c("latte, scone", "tea", "latte, latte, muffin", "cold brew, scone", "tea, muffin")
)

counts <- sort(table(unlist(strsplit(tickets$items, ", "))), decreasing = TRUE)
counts`,
  check: `expect(has("counts"), "Make a variable called counts.")
v <- if (is.data.frame(counts)) setNames(counts[[ncol(counts)]], counts[[1]]) else setNames(as.vector(counts), names(counts))
expect(isTRUE(v[["latte"]] == 3) && isTRUE(v[["tea"]] == 2), "counts should have latte 3 times and tea twice. Split, unlist, then table().")
expect(identical(unname(v), sort(unname(v), decreasing = TRUE)), "Put the most common first: sort(..., decreasing = TRUE).")`,
},
{
  id: 'r-34', mins: 3,
  title: 'Rank inside each group',
  concept: [
    'After `group_by()`, `min_rank()` ranks inside each group, so every city gets its own 1.',
    '`desc()` inside it makes 1 the biggest value.',
    'Filter for rank 1 afterwards and you have each group\'s best row.',
  ],
  starter: `cafe |>
  mutate(rank = min_rank(desc(revenue))) |>
  filter(rank == 1)`,
  task: 'Add `city_rank` to `cafe`: each day\'s revenue rank within its own city, 1 for that city\'s best day. Then make `best`: the rows where `city_rank` is 1.',
  hint: '`cafe <- cafe |> group_by(city) |> mutate(city_rank = min_rank(desc(revenue))) |> ungroup()`, then `best <- filter(cafe, city_rank == 1)`.',
  solution: `cafe <- cafe |>
  group_by(city) |>
  mutate(city_rank = min_rank(desc(revenue))) |>
  ungroup()

best <- filter(cafe, city_rank == 1)
best`,
  check: `expect(has("best"), "Make best: the rows of cafe where city_rank is 1.")
want <- fresh("cafe") |> group_by(city) |> mutate(city_rank = min_rank(desc(revenue))) |> ungroup()
expect_table(best, filter(want, city_rank == 1))`,
},
{
  id: 'r-35', mins: 5,
  title: 'Cohorts: when each customer started',
  concept: [
    'A **cohort** is a group of customers who started at the same time. Here, that means the month of their first order.',
    'After `group_by(customer_id)`, `min(month)` inside `mutate()` gives every row that customer\'s first month.',
    '`n_distinct(customer_id)` inside `summarise()` counts different customers, rather than orders.',
  ],
  starter: `o <- orders |>
  mutate(month = format(order_date, "%Y-%m"))

head(o)`,
  task: 'Add `cohort` to `o`: each customer\'s first month. Then make `grid`: for each `cohort` and `month`, `customers`, the number of different customers who ordered.',
  hint: 'Add `group_by(customer_id) |> mutate(cohort = min(month)) |> ungroup()` to the pipe. Then `grid <- o |> group_by(cohort, month) |> summarise(customers = n_distinct(customer_id))`.',
  solution: `o <- orders |>
  mutate(month = format(order_date, "%Y-%m")) |>
  group_by(customer_id) |>
  mutate(cohort = min(month)) |>
  ungroup()

grid <- o |>
  group_by(cohort, month) |>
  summarise(customers = n_distinct(customer_id)) |>
  ungroup()

grid`,
  check: `expect(has("grid"), "Make a variable called grid.")
want <- fresh("orders") |> mutate(month = format(order_date, "%Y-%m")) |> group_by(customer_id) |> mutate(cohort = min(month)) |> ungroup() |> group_by(cohort, month) |> summarise(customers = n_distinct(customer_id)) |> ungroup()
expect_table(grid, want)`,
},
];
