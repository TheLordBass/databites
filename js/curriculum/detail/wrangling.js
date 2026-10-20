/* Wrangling (wr-01 to wr-15): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Examples use a tiny table made on
   the spot, or ask a different question, never the task's answer. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, missing on 9 days" };
const CITIES = { city: 'Lagos, Nairobi, Accra and Kigali', country: 'the country it is in', population_m: 'people living there, in millions' };
const GOT_CAFE = ['`cafe` has one row per day:', CAFE];
const GOT_CITIES = ['`cities` has one row per city:', CITIES];
const GOT_SHOP = ['The shop\'s tables are loaded: `customers` (customer_id, name, city, joined), `orders` (order_id, customer_id, order_date, status), `order_items` (order_id, product_id, qty) and `products` (product_id, name, category, price).'];

export const WRANGLING_DETAIL = {
'wr-01': {
  explain: [
    'Facts about one thing are often split across tables. `cafe` has the city; `cities` has each city\'s country and population.',
    'Joining two tables, which pandas calls **merging**, puts them side by side, lining rows up wherever a shared column matches.',
    '`pd.merge(cafe, cities, on="city")` gives every cafe row the matching row from `cities`.',
    '`on=` names the column the two tables share.',
    'The result has the columns of both, so you can group cafe sales by country.',
  ],
  example: {
    say: 'Here a small menu table adds whether each drink is hot to the first four days.',
    code: `menu = pd.DataFrame({"drink": ["latte", "espresso", "cold brew", "tea"],
                     "hot": [True, True, False, True]})
pd.merge(cafe.head(4), menu, on="drink")[["date", "drink", "hot"]]`,
    lines: [
      ['menu', 'a tiny lookup table: one row per drink.'],
      ['on="drink"', 'rows are lined up wherever the drink matches.'],
      ['[["date", "drink", "hot"]]', 'just three of the columns, to keep it short.'],
    ],
  },
  brief: {
    story: 'Head office wants the cafe data with each city\'s country attached.',
    get: [GOT_CAFE, GOT_CITIES],
    want: ['Make `joined`: `cafe` merged with `cities` on the `city` column'],
    out: '`joined` has every cafe column, plus `country` and `population_m`.',
  },
},
'wr-02': {
  explain: [
    'When a row has no match on the other side, the `how=` setting decides whether it stays.',
    '`how="inner"`, what you get if you say nothing, keeps only the rows that match on **both** sides.',
    '`how="left"` keeps every row of the first table, matched or not.',
    '`how="outer"` keeps every row from both tables.',
    'Where a row had no partner, the other table\'s columns come back as `NaN`, missing.',
  ],
  example: {
    say: 'Here a staff list and a rota are joined two ways.',
    code: `staff = pd.DataFrame({"name": ["Ada", "Kofi", "Zola"], "shift": ["am", "pm", "am"]})
rota = pd.DataFrame({"name": ["Ada", "Kofi", "Nia"], "hours": [6, 8, 4]})
print(pd.merge(staff, rota, on="name"))
pd.merge(staff, rota, on="name", how="outer")`,
    lines: [
      ['pd.merge(staff, rota, on="name")', 'inner: only Ada and Kofi are in both.'],
      ['how="outer"', 'everyone: Zola has no hours and Nia has no shift, so those show NaN.'],
    ],
  },
  brief: {
    story: 'The expansion team wants Kigali to appear in the join, even with no sales yet.',
    get: [GOT_CAFE, GOT_CITIES],
    want: ['Make `outer`: the first 5 cafe rows joined to `cities` with `how="outer"`'],
    out: '`outer` includes a Kigali row, with its sales columns missing.',
  },
},
'wr-03': {
  explain: [
    '`pd.concat([a, b])` stacks tables: the rows of `b` go underneath the rows of `a`.',
    'They should have the same columns, so the rows line up.',
    'Each row keeps the row number it had before, so the numbers can come out jumbled or repeated.',
    '`ignore_index=True` numbers the result afresh: 0, 1, 2 and on.',
    '`axis=1` puts them side by side instead of on top of each other.',
  ],
  example: {
    say: 'Here two days of sales are stacked, first as they come, then numbered afresh.',
    code: `mon = pd.DataFrame({"drink": ["latte", "tea"], "cups": [30, 12]})
tue = pd.DataFrame({"drink": ["latte", "mocha"], "cups": [28, 9]})
print(pd.concat([mon, tue]))
pd.concat([mon, tue], ignore_index=True)`,
    lines: [
      ['pd.concat([mon, tue])', 'Tuesday under Monday. The row numbers 0 and 1 appear twice.'],
      ['ignore_index=True', 'numbered 0 to 3 instead.'],
    ],
  },
  brief: {
    story: 'The quarterly report shows the newest month first, and needs the three months in one table.',
    get: [GOT_CAFE],
    want: ['Make `q1`: March, then February, then January, stacked', 'Fresh row numbers, starting at 0'],
    out: '`q1` has every row from January to March.',
  },
},
'wr-04': {
  explain: [
    '`.drop_duplicates()` throws away repeat rows, keeping the first of each.',
    '`subset=[...]` decides which columns count when judging "the same". With `subset=["city"]`, you keep one row per city.',
    'With two columns in the subset, you keep one row per pair of values.',
    '`.replace({"old": "new"})` swaps values wherever they appear.',
    'Both give back a new table and leave the original alone.',
  ],
  example: {
    say: 'Here a visit log loses its exact repeats, then keeps one row per name, with a word replaced.',
    code: `visits = pd.DataFrame({"name": ["Ada", "Kofi", "Ada", "Kofi"],
                       "day": ["Mon", "Mon", "Tue", "Mon"]})
print(visits.drop_duplicates())
visits.drop_duplicates(subset=["name"]).replace({"Mon": "Monday"})`,
    lines: [
      ['visits.drop_duplicates()', 'Kofi on Monday was there twice, so one goes.'],
      ['subset=["name"]', 'one row per name: the first for each.'],
      ['.replace({"Mon": "Monday"})', 'swaps Mon for Monday wherever it appears.'],
    ],
  },
  brief: {
    story: 'The menu team wants to know which drinks each city has actually sold.',
    get: [GOT_CAFE],
    want: ['Make `pairs`: one row for each city and drink combination that appears', 'Just those two columns'],
    out: '`pairs` has two columns, `city` and `drink`.',
  },
},
'wr-05': {
  explain: [
    'A **wide** table has one column per measurement, like cups and revenue side by side.',
    'A **long** table has one row per measurement, with a column saying which measurement it is.',
    '`.melt()` turns wide into long. `id_vars` are the columns to keep as they are; `value_vars` are the ones to fold down into rows.',
    '`var_name` names the new column that says which measurement, and `value_name` the one holding the numbers.',
    'Seaborn and most charting tools want long data.',
  ],
  example: {
    say: 'Here a scoreboard with one column per round is melted into one row per team per round.',
    code: `scores = pd.DataFrame({"team": ["red", "blue"], "round1": [3, 5], "round2": [4, 2]})
scores.melt(id_vars="team", var_name="round", value_name="points")`,
    lines: [
      ['id_vars="team"', 'team stays as it is, repeated on each new row.'],
      ['var_name="round"', 'the old column names, round1 and round2, go in a column called round.'],
      ['value_name="points"', 'the numbers go in a column called points.'],
    ],
  },
  brief: {
    story: 'The charting tool wants cups and ratings as rows, not side by side.',
    get: [GOT_CAFE],
    want: ['Melt the first 6 rows on `cups` and `rating`, keeping `date`', 'Name the new columns `measure` and `amount`'],
    out: '`long` has 12 rows: 6 days, two measures each.',
  },
},
'wr-06': {
  explain: [
    'Grouping by **two** columns gives answers labelled by both: city, then drink.',
    'That two-level set of row labels is called a **MultiIndex**.',
    '`.unstack()` moves the inner label (here, the drink) up into columns, turning the long list into a grid.',
    '`.stack()` does the reverse.',
    'The grid is the same one a pivot table gives, reached another way.',
  ],
  example: {
    say: 'Here the most cups each drink sold in a day, in each city, as a grid.',
    code: `g = cafe.groupby(["drink", "city"])["cups"].max()
g.unstack()`,
    lines: [
      ['groupby(["drink", "city"])', 'one answer for each drink in each city, labelled by both.'],
      ['.unstack()', 'the cities move up into columns, so each drink is one row.'],
    ],
  },
  brief: {
    story: 'The owner wants a grid: cities down the side, drinks across the top, average revenue in each cell.',
    get: [GOT_CAFE],
    want: ['Make `table`: the average `revenue` grouped by city **and** drink', 'Unstacked, so the drinks become the columns'],
    out: '`table` has three rows, one per city, and a column per drink.',
  },
},
'wr-07': {
  explain: [
    '`.agg` gives one number **per group**: three cities, three numbers.',
    '`.transform` gives one **per row**: every row gets its own group\'s figure.',
    'So the result is as long as the table, and can become a new column.',
    'Then you can compare each row with its group: this day\'s revenue against its city\'s usual.',
    'Any group sum works: `transform("mean")`, `"max"`, `"sum"`.',
  ],
  example: {
    say: 'Here each day gets the most cups its drink ever sold in a day, to compare with.',
    code: `cafe["drink_max"] = cafe.groupby("drink")["cups"].transform("max")
cafe[["drink", "cups", "drink_max"]].head()`,
    lines: [
      ['groupby("drink")["cups"]', 'the cups, split by drink.'],
      ['.transform("max")', 'each row gets the biggest number of cups for its own drink.'],
    ],
  },
  brief: {
    story: 'Each city manager wants to know how every day compares with their city\'s usual.',
    get: [GOT_CAFE],
    want: ['Add `vs_city`: each row\'s revenue minus its own city\'s average revenue'],
    out: '`cafe` has a `vs_city` column: positive above the city\'s average, negative below.',
  },
},
'wr-08': {
  explain: [
    '`pd.crosstab(a, b)` counts how often each pair of values turns up together: each city with each drink.',
    'The values of `a` go down the side and the values of `b` across the top.',
    '`normalize="index"` turns the counts into shares of each row, so every row adds up to 1.',
    'Add `values=` and `aggfunc=` and it becomes a pivot table.',
    'It is the quickest way to see whether two things go together.',
  ],
  example: {
    say: 'Here is how many days each drink was sold, month by month.',
    code: `pd.crosstab(cafe["drink"], cafe["date"].dt.month)`,
    lines: [
      ['cafe["drink"]', 'drinks down the side.'],
      ['cafe["date"].dt.month', 'month numbers across the top, 1 to 4.'],
    ],
  },
  brief: {
    story: 'The menu team wants to see which drinks each city sells most often.',
    get: [GOT_CAFE],
    want: ['Make `ct`: the plain counts of each city and drink pair, not shares'],
    out: '`ct` has a row per city and a column per drink. The counts add up to 120.',
  },
},
'wr-09': {
  explain: [
    'Two new tables: `marks`, with one column per subject, and `students`, with each student\'s name and year.',
    '`marks` is **wide**: the subject names are column headings, when really they are data.',
    'Ask "average per subject" of a wide table and you have to name every column.',
    'Melt it so each row is one student, one subject, one score.',
    'Then grouping by subject is one line.',
  ],
  example: {
    say: 'Here a wide table of cups per day is melted, then added up by day.',
    code: `week = pd.DataFrame({"branch": ["Lagos", "Accra"], "mon": [40, 25], "tue": [38, 30]})
long = week.melt(id_vars="branch", var_name="day", value_name="cups")
print(long)
long.groupby("day")["cups"].sum()`,
    lines: [
      ['week.melt(...)', 'one row per branch per day.'],
      ['groupby("day")', 'easy now that day is a column: Monday 65, Tuesday 68.'],
    ],
  },
  brief: {
    story: 'The school wants averages by subject, and the marks arrived with one column per subject.',
    get: [['`marks`:', { student_id: '1 to 8', maths: 'a score out of 100', physics: 'a score out of 100', history: 'a score out of 100' }]],
    want: ['Melt `marks` into `long_marks`, keeping `student_id`', 'Name the new columns `subject` and `score`'],
    out: '`long_marks` has 24 rows: 8 students, 3 subjects each.',
  },
},
'wr-10': {
  explain: [
    'Melt first, **then** join. Long data merges cleanly; wide data does not.',
    'Once the student details are attached, you can group by anything in either table.',
    'Here the year lives in `students`, and the scores in `marks`.',
    'Melt, then merge, then group: those three steps are most of real data work.',
  ],
  example: {
    say: 'Here the marks are melted and averaged by subject, before any join.',
    code: `long_marks = marks.melt(id_vars="student_id", var_name="subject", value_name="score")
long_marks.groupby("subject")["score"].mean().round(1)`,
    lines: [
      ['marks.melt(...)', 'one row per student per subject.'],
      ['groupby("subject")', 'the average score in each subject.'],
    ],
  },
  brief: {
    story: 'The head of year wants to know which year group is scoring best.',
    get: [['`marks` (student_id, maths, physics, history) and `students`:', { student_id: '1 to 8', name: 'their name', year: '1, 2 or 3' }]],
    want: ['Make `by_year`: the average `score` for each school `year`'],
    out: '`by_year` has three values, one per year.',
  },
},
'wr-11': {
  explain: [
    'The shop is four tables. `orders` says who bought, as a `customer_id`; `customers` says who they are.',
    'Merging orders onto customers is **many-to-one**: lots of orders can share one customer.',
    "If a customer appeared twice in `customers`, the merge would quietly copy that customer's orders. Totals would go up, with no error.",
    '`validate="many_to_one"` makes pandas check that each order finds exactly one customer, and stop with an error if not.',
    'It costs nothing, and it catches a mistake you would otherwise not see.',
  ],
  example: {
    say: 'Here three sales get their product details, with a check that each finds exactly one product.',
    code: `sales = pd.DataFrame({"product_id": [101, 101, 105], "qty": [2, 1, 3]})
pd.merge(sales, products, on="product_id", validate="many_to_one")[["product_id", "name", "qty", "price"]]`,
    lines: [
      ['many_to_one', 'many sales can share a product, but each product id must be in products once.'],
      ['[[...]]', 'four of the columns, to keep it short.'],
    ],
  },
  brief: {
    story: 'Customer service wants every order with the customer\'s name and city on it.',
    get: [GOT_SHOP],
    want: ['Make `orders_c`: `orders` merged with `customers` on `customer_id`', 'Use `validate="many_to_one"`'],
    out: '`orders_c` has 150 rows, each with a `name` and `city`.',
  },
},
'wr-12': {
  explain: [
    'One line of an order lives in `order_items`: an order, a product and a quantity.',
    'The price lives in `products`, and the status in `orders`.',
    'Merge the lines onto products, then onto orders, so each line has all three.',
    '`qty * price` is what each line was worth.',
    'Then `groupby("order_id")` and add up, and you know what every order came to.',
    '`as_index=False` keeps order_id as a column, and `.rename(columns={...})` gives the total its name.',
  ],
  example: {
    say: 'Here order 5001\'s lines are priced, then added up.',
    code: `one = order_items[order_items["order_id"] == 5001].merge(products, on="product_id")
one["value"] = one["qty"] * one["price"]
print(one[["name", "qty", "price", "value"]])
print("order total:", one["value"].sum())`,
    lines: [
      ['.merge(products, on="product_id")', 'brings in each line\'s name and price.'],
      ['one["qty"] * one["price"]', 'what each line was worth.'],
      ['.sum()', 'the whole order.'],
    ],
  },
  brief: {
    story: 'Finance wants the value of every order, leaving out the cancelled ones.',
    get: [GOT_SHOP],
    want: ['Make `order_totals`: one row per order that wasn\'t cancelled', 'Its value (qty × price, added up) in a column called `total`'],
    out: '`order_totals` has `order_id` and `total`.',
  },
},
'wr-13': {
  explain: [
    '`how="left"` keeps every row of the first table, whether it found a match or not.',
    '`indicator=True` adds a column called `_merge` saying where each row came from.',
    '`both` means it matched. `left_only` means a row of the first table with nothing on the right.',
    'Keep the `left_only` rows, and you have the ones with no match.',
    'So "customers who never ordered" is a left join, then the `left_only` rows.',
  ],
  example: {
    say: 'Here is the product that has never been sold.',
    code: `m = pd.merge(products, order_items, on="product_id", how="left", indicator=True)
m.loc[m["_merge"] == "left_only", ["name", "_merge"]]`,
    lines: [
      ['how="left", indicator=True', 'every product is kept, with a _merge column.'],
      ['m["_merge"] == "left_only"', 'the products that matched no order line: the tote bag.'],
    ],
  },
  brief: {
    story: 'Marketing wants to email the customers who signed up but never bought.',
    get: [GOT_SHOP],
    want: ['Make `never`: the names of the customers who have never placed an order'],
    out: '`never` is a list of names.',
  },
},
'wr-14': {
  explain: [
    'Ids are how tables join; names are what people want to read.',
    'Do the sums on ids, because two customers can share a name but never an id.',
    "Group the order lines by `customer_id` for each customer's spend.",
    'Then merge onto `customers` for the names.',
    'Finally sort, keep the top, and pick just the columns people need.',
  ],
  example: {
    say: 'Here are the three products sold in the biggest quantities, by name.',
    code: `per_product = order_items.groupby("product_id", as_index=False)["qty"].sum()
(per_product.merge(products, on="product_id")
 .sort_values("qty", ascending=False)
 .head(3)[["name", "qty"]])`,
    lines: [
      ['groupby("product_id")', 'the sums, done on ids.'],
      ['.merge(products, ...)', 'then the names brought in.'],
      ['.sort_values(...).head(3)', 'biggest first, top three.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants to send a thank-you to the five biggest spenders.',
    get: [GOT_SHOP],
    want: ['Make `top5`: the 5 customers who spent the most', 'Leave out cancelled orders', 'Exactly two columns, `name` and `spent`, biggest first'],
    out: '`top5` has five rows.',
  },
},
'wr-15': {
  explain: [
    'A pivot table turns a long list into a grid: here, product categories down the side and months across the top.',
    '`pivot_table(index=..., columns=..., values=..., aggfunc="sum")` builds it in one go.',
    '`index` goes down the side, `columns` across the top, and `values` is what fills the cells.',
    '`fill_value=0` fills the holes. A category that sold nothing that month really did sell 0.',
    'To get the month from a date, use `.dt.month`.',
  ],
  example: {
    say: 'Here are the cups each drink sold in each city, as a grid.',
    code: `cafe.pivot_table(index="drink", columns="city", values="cups", aggfunc="sum")`,
    lines: [
      ['index="drink"', 'one row per drink.'],
      ['columns="city"', 'one column per city.'],
      ['values="cups", aggfunc="sum"', 'each cell adds up the cups.'],
    ],
  },
  brief: {
    story: 'The buyer wants to see which categories sell in which months.',
    get: [GOT_SHOP],
    want: ['Make `cat_month`: revenue (qty × price), cancelled orders left out', 'One row per product `category`, one column per month number (1 to 6)', '0 where nothing sold'],
    out: '`cat_month` is a grid of four categories by six months.',
  },
},
};
