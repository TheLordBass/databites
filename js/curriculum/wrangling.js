export const WRANGLING = [
{
  id: 'wr-01', mins: 4,
  title: 'Joining two tables',
  concept: [
    '`pd.merge(left, right, on="col")` glues two tables together on a shared column.',
    'A second table called `cities` is already loaded — city, country, population.',
    'Every row of `cafe` picks up the matching row from `cities`.',
  ],
  starter: `cities`,
  task: 'Make `joined` = `cafe` merged with `cities` on the `city` column.',
  hint: '`joined = pd.merge(cafe, cities, on="city")`',
  solution: `joined = pd.merge(cafe, cities, on="city")

print(joined.shape)
joined[["city", "country", "population_m", "cups"]].head()`,
  check: `assert "joined" in globals(), "Make a variable called joined."
assert "country" in joined.columns, "joined should have picked up the country column."
assert len(joined) == 120, "All 120 rows should survive — every cafe city exists in cities."
assert joined.loc[joined["city"] == "Lagos", "country"].iloc[0] == "Nigeria", "Lagos should line up with Nigeria."`,
},
{
  id: 'wr-02', mins: 4,
  title: 'Who survives the join',
  concept: [
    '`how="inner"` (the default) keeps only rows that matched **both** sides.',
    '`how="left"` keeps every left row; `how="outer"` keeps everything from both.',
    'Kigali is in `cities` but never in `cafe` — so the join style decides its fate.',
  ],
  starter: `small = cafe.head(5)

print(pd.merge(small, cities, on="city").shape)
print(pd.merge(small, cities, on="city", how="outer").shape)`,
  task: 'Make `outer` = the first 5 cafe rows outer-joined to `cities`, so Kigali survives.',
  hint: 'Add `how="outer"`: `pd.merge(cafe.head(5), cities, on="city", how="outer")`',
  solution: `outer = pd.merge(cafe.head(5), cities, on="city", how="outer")

print(outer[["city", "country", "cups"]])
outer[outer["cups"].isna()]`,
  check: `assert "outer" in globals(), "Make a variable called outer."
assert "Kigali" in set(outer["city"]), 'Kigali is missing — an inner join drops it. Use how="outer".'
assert outer.loc[outer["city"] == "Kigali", "cups"].isna().all(), "Kigali has no sales, so its cups should be NaN."`,
},
{
  id: 'wr-03', mins: 4,
  title: 'Stacking tables',
  concept: [
    '`pd.concat([a, b])` stacks rows on top of each other.',
    '`ignore_index=True` renumbers the result 0, 1, 2… instead of repeating labels.',
    '`axis=1` glues side by side instead of end to end.',
  ],
  starter: `jan = cafe[cafe["date"].dt.month == 1]
feb = cafe[cafe["date"].dt.month == 2]
print(len(jan), len(feb))

both = pd.concat([jan, feb])
both.index[:5]`,
  task: 'Make `q1` = January, February and March stacked, with a clean index starting at 0.',
  hint: 'Add `mar`, then `pd.concat([jan, feb, mar], ignore_index=True)`.',
  solution: `jan = cafe[cafe["date"].dt.month == 1]
feb = cafe[cafe["date"].dt.month == 2]
mar = cafe[cafe["date"].dt.month == 3]

q1 = pd.concat([jan, feb, mar], ignore_index=True)

print(len(q1))
q1.tail(3)`,
  check: `assert "q1" in globals(), "Make a variable called q1."
assert len(q1) == 91, "January + February + March is 91 days in 2024, not %d." % len(q1)
assert list(q1.index) == list(range(91)), "The index still repeats — pass ignore_index=True."`,
},
{
  id: 'wr-04', mins: 3,
  title: 'Duplicates and replacements',
  concept: [
    '`.drop_duplicates()` throws away repeat rows, keeping the first.',
    '`subset=[...]` decides which columns count as "the same".',
    '`.replace({"old": "new"})` swaps values wherever they appear.',
  ],
  starter: `print(cafe["drink"].replace({"tea": "chai"}).unique())

cafe.drop_duplicates(subset=["city"])[["city", "drink"]]`,
  task: 'Make `pairs` = one row per unique **city + drink** combination, keeping just those two columns.',
  hint: '`cafe.drop_duplicates(subset=["city", "drink"])[["city", "drink"]]`',
  solution: `pairs = cafe.drop_duplicates(subset=["city", "drink"])[["city", "drink"]]

print(len(pairs))
pairs.sort_values(["city", "drink"])`,
  check: `assert "pairs" in globals(), "Make a variable called pairs."
assert list(pairs.columns) == ["city", "drink"], "Keep only the city and drink columns."
assert not pairs.duplicated().any(), "There are still repeated city+drink pairs."
assert len(pairs) == len(cafe.drop_duplicates(subset=["city", "drink"])), "Some combinations went missing."`,
},
{
  id: 'wr-05', mins: 4,
  title: 'Wide to long with melt',
  concept: [
    '**Wide** = one column per measure. **Long** = one row per measurement.',
    '`.melt(id_vars=..., value_vars=[...])` turns wide into long.',
    'Seaborn and most plotting tools secretly want long data.',
  ],
  starter: `wide = cafe.head(4)[["date", "cups", "revenue"]]
print(wide)

wide.melt(id_vars="date")`,
  task: 'Melt the first 6 rows on `cups` and `rating`, naming the new columns `measure` and `amount`.',
  hint: '`cafe.head(6).melt(id_vars="date", value_vars=["cups", "rating"], var_name="measure", value_name="amount")`',
  solution: `long = cafe.head(6).melt(
    id_vars="date",
    value_vars=["cups", "rating"],
    var_name="measure",
    value_name="amount",
)

print(long.shape)
long`,
  check: `assert "long" in globals(), "Put the result in a variable called long."
assert list(long.columns) == ["date", "measure", "amount"], "Name the new columns measure and amount."
assert len(long) == 12, "6 rows x 2 measures = 12 rows, not %d." % len(long)
assert set(long["measure"]) == {"cups", "rating"}, "Melt cups and rating."`,
},
{
  id: 'wr-06', mins: 4,
  title: 'unstack — pivoting an index',
  concept: [
    'Grouping by **two** columns gives a Series with a MultiIndex.',
    '`.unstack()` lifts the inner index level up into columns.',
    '`.stack()` does the reverse. This is `pivot_table` from the other direction.',
  ],
  starter: `g = cafe.groupby(["city", "drink"])["cups"].sum()
print(g.head())

g.unstack()`,
  task: 'Make `table` = mean `revenue` grouped by city **and** drink, unstacked so drinks are the columns.',
  hint: '`cafe.groupby(["city", "drink"])["revenue"].mean().unstack()`',
  solution: `table = cafe.groupby(["city", "drink"])["revenue"].mean().unstack()

table.round(1)`,
  check: `assert "table" in globals(), "Make a variable called table."
assert set(table.index) == {"Lagos", "Nairobi", "Accra"}, "Cities should be the rows."
assert set(table.columns) == {"latte", "espresso", "cold brew", "tea"}, "Drinks should be the columns — did you unstack?"`,
},
{
  id: 'wr-07', mins: 4,
  title: 'transform — compare a row to its group',
  concept: [
    '`.agg` gives one number **per group**. `.transform` gives one **per original row**.',
    'That means the result lines up with the table and can become a new column.',
    'Perfect for "how does this day compare to its city\'s normal?"',
  ],
  starter: `cafe["city_avg"] = cafe.groupby("city")["revenue"].transform("mean")

cafe[["city", "revenue", "city_avg"]].head()`,
  task: 'Add `vs_city` = how far this row\'s revenue sits above or below its own city average.',
  hint: 'Subtract the transform from the column: `cafe["revenue"] - cafe.groupby("city")["revenue"].transform("mean")`',
  solution: `cafe["city_avg"] = cafe.groupby("city")["revenue"].transform("mean")
cafe["vs_city"] = cafe["revenue"] - cafe["city_avg"]

cafe[["city", "revenue", "city_avg", "vs_city"]].head()`,
  check: `assert "vs_city" in cafe.columns, "cafe has no vs_city column yet."
_want = cafe["revenue"] - cafe.groupby("city")["revenue"].transform("mean")
assert (cafe["vs_city"] - _want).abs().max() < 1e-6, "vs_city should be revenue minus the city's own average."
assert abs(float(cafe.groupby("city")["vs_city"].mean().abs().max())) < 1e-6, "Within each city these differences should cancel out to zero."`,
},
{
  id: 'wr-08', mins: 3,
  title: 'crosstab — counting pairs',
  concept: [
    '`pd.crosstab(a, b)` counts how often each combination shows up.',
    '`normalize="index"` turns those counts into proportions per row.',
    'Add `values=` and `aggfunc=` and it becomes a pivot table.',
  ],
  starter: `pd.crosstab(cafe["city"], cafe["drink"], normalize="index").round(2)`,
  task: 'Make `ct` = the plain **counts** of each city / drink combination.',
  hint: '`ct = pd.crosstab(cafe["city"], cafe["drink"])` — no normalize this time.',
  solution: `ct = pd.crosstab(cafe["city"], cafe["drink"])

print(ct.sum().sum())
ct`,
  check: `assert "ct" in globals(), "Make a variable called ct."
assert ct.shape == (3, 4), "Expected 3 cities by 4 drinks, got %s." % (ct.shape,)
assert int(ct.to_numpy().sum()) == 120, "Plain counts should add up to all 120 rows — drop the normalize argument."`,
},
{
  id: 'wr-09', mins: 4,
  title: 'Wide data in the wild',
  concept: [
    'Two new tables: `marks` (one column per subject) and `students`.',
    '`marks` is **wide** — the subject names are column headers, not data.',
    'Almost nothing in pandas wants that shape. Melt it and everything opens up.',
  ],
  starter: `print(marks)

students`,
  task: 'Melt `marks` on `student_id` into `long_marks`, with columns `subject` and `score`.',
  hint: '`marks.melt(id_vars="student_id", var_name="subject", value_name="score")`',
  solution: `long_marks = marks.melt(
    id_vars="student_id",
    var_name="subject",
    value_name="score",
)

print(long_marks.shape)
long_marks.head(6)`,
  check: `assert "long_marks" in globals(), "Make a variable called long_marks."
assert list(long_marks.columns) == ["student_id", "subject", "score"], "Name the new columns subject and score."
assert len(long_marks) == 24, "8 students x 3 subjects = 24 rows, you got %d." % len(long_marks)
assert set(long_marks["subject"]) == {"maths", "physics", "history"}, "All three subjects should appear in the subject column."`,
},
{
  id: 'wr-10', mins: 5,
  title: 'Long data, then joined, then answered',
  concept: [
    'Melt first, **then** join. Long data merges cleanly; wide data does not.',
    'Once the names are attached you can group by anything in either table.',
    'This melt → merge → groupby chain is most of real data work.',
  ],
  starter: `long_marks = marks.melt(id_vars="student_id", var_name="subject", value_name="score")

pd.merge(long_marks, students, on="student_id").head()`,
  task: 'Make `by_year` — the mean `score` for each school `year`.',
  hint: 'Merge `long_marks` with `students` on `student_id`, then `.groupby("year")["score"].mean()`.',
  solution: `long_marks = marks.melt(id_vars="student_id", var_name="subject", value_name="score")
joined = pd.merge(long_marks, students, on="student_id")

by_year = joined.groupby("year")["score"].mean().round(1)

print(joined.head())
by_year`,
  check: `assert "by_year" in globals(), "Make a variable called by_year."
assert set(by_year.index) == {1, 2, 3}, "There are three school years — 1, 2 and 3."
_lm = marks.melt(id_vars="student_id", var_name="subject", value_name="score")
_want = pd.merge(_lm, students, on="student_id").groupby("year")["score"].mean()
assert (by_year - _want.round(1)).abs().max() < 0.06, "Those aren't the mean scores per year — check the merge key."`,
},

/* ── The shop, in pandas ───────────────────────────────── */
{
  id: 'wr-11', mins: 4,
  title: 'Many orders, one customer',
  concept: [
    'The shop is four tables. `orders` says who bought (`customer_id`); `customers` says who they are.',
    'Merging orders onto customers is **many-to-one**: lots of orders can share one customer.',
    '`validate="many_to_one"` makes pandas check that for you — and stop with an error if it isn\'t true.',
  ],
  starter: `orders.head()`,
  task: 'Make `orders_c` = `orders` merged with `customers` on `customer_id`, so every order carries the customer\'s `name` and `city`. Use `validate="many_to_one"`.',
  hint: '`pd.merge(orders, customers, on="customer_id", validate="many_to_one")`',
  solution: `orders_c = pd.merge(orders, customers, on="customer_id", validate="many_to_one")

orders_c[["order_id", "name", "city", "status"]].head()`,
  check: `assert "orders_c" in globals(), "Make a variable called orders_c."
assert {"name", "city", "status"} <= set(orders_c.columns), "orders_c should have name and city from customers, and status from orders."
assert len(orders_c) == len(orders), "Every order should survive — each one has a customer. You have %d rows." % len(orders_c)`,
},
{
  id: 'wr-12', mins: 5,
  title: 'Three tables, one total',
  concept: [
    'One line of an order lives in `order_items`: an order, a product, a quantity. The price lives in `products`, the status in `orders`.',
    'Merge the lines onto products and orders, and `qty * price` is what each line was worth.',
    'Then `groupby("order_id")` and add up, and you know what every order came to.',
  ],
  starter: `order_items.head()`,
  task: 'Make `order_totals`: one row per order that **wasn\'t cancelled**, with its value (qty × price, added up) in a column called `total`.',
  hint: '`lines = order_items.merge(products, on="product_id").merge(orders, on="order_id")`, drop the cancelled ones, make `lines["value"] = lines["qty"] * lines["price"]`, then group by order_id and sum.',
  solution: `lines = order_items.merge(products, on="product_id").merge(orders, on="order_id")
lines = lines[lines["status"] != "cancelled"]
lines["value"] = lines["qty"] * lines["price"]

order_totals = (lines.groupby("order_id", as_index=False)["value"].sum()
                .rename(columns={"value": "total"}))
order_totals.head()`,
  check: `assert "order_totals" in globals(), "Make a variable called order_totals."
_ot = order_totals.to_frame() if isinstance(order_totals, pd.Series) else order_totals
if "order_id" not in _ot.columns:
    _ot = _ot.reset_index()
assert "total" in _ot.columns, "Name the column total."
_l = order_items.merge(products, on="product_id").merge(orders, on="order_id")
_l = _l[_l["status"] != "cancelled"]
_want = (_l["qty"] * _l["price"]).groupby(_l["order_id"]).sum()
assert len(_ot) == len(_want), "One row per order that wasn't cancelled: %d of them." % len(_want)
assert (_ot.set_index("order_id")["total"].reindex(_want.index) - _want).abs().max() < 0.01, "Some totals are off — qty times price, added up per order."`,
},
{
  id: 'wr-13', mins: 4,
  title: 'Who never bought, in pandas',
  concept: [
    '`how="left"` keeps every customer, whether they ordered or not.',
    '`indicator=True` adds a `_merge` column: `both` for a match, `left_only` for a row with nothing on the right.',
    'The `left_only` rows are exactly the customers who never ordered.',
  ],
  starter: `pd.merge(customers, orders, on="customer_id").shape`,
  task: 'Make `never` = the `name`s of the customers who have never placed an order.',
  hint: '`m = pd.merge(customers, orders, on="customer_id", how="left", indicator=True)` — then the names where `m["_merge"] == "left_only"`.',
  solution: `m = pd.merge(customers, orders, on="customer_id", how="left", indicator=True)
never = m.loc[m["_merge"] == "left_only", "name"]

never`,
  check: `assert "never" in globals(), "Make a variable called never."
_want = set(customers.loc[~customers["customer_id"].isin(orders["customer_id"]), "name"])
_got = set(never["name"]) if isinstance(never, pd.DataFrame) else set(never)
assert _got == _want, "It should be the %d customers with no orders at all." % len(_want)`,
},
{
  id: 'wr-14', mins: 5,
  title: 'Best customers, by name',
  concept: [
    'Ids are how tables join; names are what people want to read. Do the sums on ids, then merge the names in.',
    'Group the order lines by `customer_id` for each customer\'s spend…',
    '…then merge onto `customers` for the name, sort, and keep the top.',
  ],
  starter: `customers.head()`,
  task: 'Make `top5`: the 5 customers who spent the most (leaving out cancelled orders), with exactly two columns, `name` and `spent`, biggest first.',
  hint: 'Build the lines as in the last lesson, `lines["spent"] = lines["qty"] * lines["price"]`, `groupby("customer_id", as_index=False)["spent"].sum()`, merge with customers, `sort_values("spent", ascending=False).head(5)[["name", "spent"]]`.',
  solution: `lines = order_items.merge(products, on="product_id").merge(orders, on="order_id")
lines = lines[lines["status"] != "cancelled"]
lines["spent"] = lines["qty"] * lines["price"]

per_customer = lines.groupby("customer_id", as_index=False)["spent"].sum()
top5 = (per_customer.merge(customers, on="customer_id")
        .sort_values("spent", ascending=False)
        .head(5)[["name", "spent"]])
top5`,
  check: `assert "top5" in globals(), "Make a variable called top5."
assert list(top5.columns) == ["name", "spent"], "top5 should have exactly name and spent, in that order."
assert len(top5) == 5, "Five customers."
_l = order_items.merge(products, on="product_id").merge(orders, on="order_id")
_l = _l[_l["status"] != "cancelled"]
_s = (_l["qty"] * _l["price"]).groupby(_l["customer_id"]).sum().sort_values(ascending=False)
assert top5["spent"].is_monotonic_decreasing, "Biggest spender first."
assert [round(float(x), 2) for x in top5["spent"]] == [round(float(x), 2) for x in _s.values[:5]], "Those aren't the top five spenders — check you left out cancelled orders."`,
},
{
  id: 'wr-15', mins: 5,
  title: 'Category by month',
  concept: [
    'A pivot table turns a long list into a grid: here, product categories down the side, months across the top.',
    '`pivot_table(index=..., columns=..., values=..., aggfunc="sum")` builds it in one call.',
    '`fill_value=0` fills the holes: a category that sold nothing that month really did sell 0.',
  ],
  starter: `products["category"].value_counts()`,
  task: 'Make `cat_month`: revenue (qty × price, cancelled orders left out), with one row per product `category` and one column per month number (1 to 6), and 0 where nothing sold.',
  hint: 'Build the lines, add `lines["month"] = lines["order_date"].dt.month`, then `lines.pivot_table(index="category", columns="month", values="revenue", aggfunc="sum", fill_value=0)`.',
  solution: `lines = order_items.merge(products, on="product_id").merge(orders, on="order_id")
lines = lines[lines["status"] != "cancelled"]
lines["revenue"] = lines["qty"] * lines["price"]
lines["month"] = lines["order_date"].dt.month

cat_month = lines.pivot_table(index="category", columns="month", values="revenue",
                              aggfunc="sum", fill_value=0)
cat_month`,
  check: `assert "cat_month" in globals(), "Make a variable called cat_month."
_l = order_items.merge(products, on="product_id").merge(orders, on="order_id")
_l = _l[_l["status"] != "cancelled"]
_want = (_l["qty"] * _l["price"]).groupby([_l["category"], _l["order_date"].dt.month]).sum().unstack(fill_value=0)
assert set(cat_month.index) == set(_want.index), "One row per category that sold something."
assert [int(c) for c in cat_month.columns] == [int(c) for c in _want.columns], "One column per month, 1 to 6, in order."
assert not cat_month.isna().any().any(), "Fill the gaps with 0 — pass fill_value=0."
assert abs(float(cat_month.values.sum()) - float(_want.values.sum())) < 0.01, "The grid doesn't add up to all the revenue — check which orders you kept."`,
},
];
