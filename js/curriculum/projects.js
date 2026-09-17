/* Projects — one real question, answered start to finish with every tool:
   pandas to build the numbers, SQL to check them, DAX to make them a report,
   a chart to show the finding, and a rule to make the call.

   Each lesson sets its own lang. Numbers leave out cancelled orders
   throughout, and the final pick is computed in the check, never typed in. */

const SALES = 'SUMX(order_items, order_items[qty] * RELATED(products[price]))';

const PREP = `lines = (order_items.merge(products, on="product_id")
         .merge(orders, on="order_id")
         .merge(customers[["customer_id", "city"]], on="customer_id"))
lines = lines[lines["status"] != "cancelled"]
lines["revenue"] = lines["qty"] * lines["price"]`;

export const PROJECTS = [

/* ── Where should the shop grow next? ──────────────────── */
{
  id: 'pj-01', mins: 5, lang: 'python',
  title: 'Start from the question',
  concept: [
    'A project starts with a question, not a function: **where should the shop grow next?** Five steps, one tool each.',
    'First, the numbers per city. The city lives on `customers`, two joins away from a line: order_items → orders → customers.',
    'Settle the edge cases before counting: cancelled orders don\'t count, and a customer with no city goes under `"unknown"` rather than vanishing.',
  ],
  starter: `lines = order_items.merge(products, on="product_id")
lines["revenue"] = lines["qty"] * lines["price"]
lines.head()`,
  task: 'Bring in each line\'s order and customer, leave out cancelled orders, and make `by_city`: one row per city with `revenue`, `customers` (different buying customers) and `orders`. No city? Count it as `"unknown"`.',
  hint: 'Merge `orders` on `order_id`, then `customers[["customer_id", "city"]]` on `customer_id`. Filter `status != "cancelled"`, `fillna("unknown")` on city, then `groupby("city").agg(revenue=("revenue", "sum"), customers=("customer_id", "nunique"), orders=("order_id", "nunique"))`.',
  solution: `${PREP}
lines["city"] = lines["city"].fillna("unknown")

by_city = lines.groupby("city").agg(
    revenue=("revenue", "sum"),
    customers=("customer_id", "nunique"),
    orders=("order_id", "nunique"),
).sort_values("revenue", ascending=False)
by_city`,
  check: `assert "by_city" in globals(), "Make a DataFrame called by_city."
_w = (order_items.merge(products, on="product_id").merge(orders, on="order_id")
      .merge(customers[["customer_id", "city"]], on="customer_id"))
_w = _w[_w["status"] != "cancelled"].assign(revenue=lambda d: d["qty"] * d["price"])
_w["city"] = _w["city"].fillna("unknown")
_w = _w.groupby("city").agg(revenue=("revenue", "sum"), customers=("customer_id", "nunique"), orders=("order_id", "nunique"))
_g = by_city if "city" not in by_city.columns else by_city.set_index("city")
for _c in ("revenue", "customers", "orders"):
    assert _c in _g.columns, "by_city needs a %s column." % _c
assert "unknown" in _g.index, 'Customers with no city should count under "unknown", not disappear.'
assert set(_g.index) == set(_w.index), "One row per city: %s." % ", ".join(sorted(_w.index))
_g = _g.loc[_w.index]
assert (_g["orders"] == _w["orders"]).all(), "The order counts are off. Are cancelled orders left out, and is each order counted once (nunique)?"
assert (_g["customers"] == _w["customers"]).all(), "customers should count different people: nunique, not count."
assert ((_g["revenue"] - _w["revenue"]).abs() < 0.01).all(), "Revenue is off: qty times price, with cancelled orders left out."`,
},
{
  id: 'pj-02', mins: 5, lang: 'sql', needs: ['sqlite3'],
  title: 'Check it a second way',
  concept: [
    'Two tools agreeing is how you come to trust a number. Rebuild the city table in SQL and it should match the pandas one.',
    'After joining to `order_items`, an order appears once per line — so count orders with `COUNT(DISTINCT o.order_id)`.',
    "`COALESCE(c.city, 'unknown')` names the gap. Group by it too, or the NULLs stay a separate group.",
  ],
  starter: `SELECT c.city, COUNT(DISTINCT o.order_id) AS orders
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.city;`,
  task: "Leave out cancelled orders, show a missing city as `unknown`, and add `revenue` (qty × price, through order_items and products) and `avg_order` (revenue ÷ orders, rounded to 2). Columns `city`, `orders`, `revenue`, `avg_order`, biggest revenue first.",
  hint: "Join `order_items oi` on the order and `products p` on the product, add `WHERE o.status <> 'cancelled'`, and use `COALESCE(c.city, 'unknown')` in both SELECT and GROUP BY. `avg_order` is `ROUND(SUM(oi.qty * p.price) * 1.0 / COUNT(DISTINCT o.order_id), 2)`.",
  solution: `SELECT COALESCE(c.city, 'unknown') AS city,
       COUNT(DISTINCT o.order_id) AS orders,
       SUM(oi.qty * p.price) AS revenue,
       ROUND(SUM(oi.qty * p.price) * 1.0 / COUNT(DISTINCT o.order_id), 2) AS avg_order
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY COALESCE(c.city, 'unknown')
ORDER BY revenue DESC;`,
  check: `_same_as("SELECT COALESCE(c.city, 'unknown') AS city, COUNT(DISTINCT o.order_id) AS orders, SUM(oi.qty * p.price) AS revenue, ROUND(SUM(oi.qty * p.price) * 1.0 / COUNT(DISTINCT o.order_id), 2) AS avg_order FROM orders o JOIN customers c ON c.customer_id = o.customer_id JOIN order_items oi ON oi.order_id = o.order_id JOIN products p ON p.product_id = oi.product_id WHERE o.status <> 'cancelled' GROUP BY COALESCE(c.city, 'unknown') ORDER BY revenue DESC", ordered=True)`,
},
{
  id: 'pj-03', mins: 5, lang: 'dax', rows: 'customers[city]',
  title: 'Turn it into measures',
  concept: [
    'In a Power BI report the same numbers become measures, so they answer for any slice: city, month or category.',
    '`Per Buyer` is one measure divided by another. Build the parts first and it stays right on every row, and in the total.',
    'Look at the total: it is all revenue ÷ all buyers, not an average of the city rows. Measures get that right for free.',
  ],
  starter: `Revenue = ${SALES}
Net Revenue = CALCULATE([Revenue], orders[status] <> "cancelled")`,
  task: 'Add `Buyers`: different customers with an order that wasn\'t cancelled. Then `Per Buyer`: Net Revenue divided by Buyers.',
  hint: '`Buyers = CALCULATE(DISTINCTCOUNT(orders[customer_id]), orders[status] <> "cancelled")`, then `Per Buyer = DIVIDE([Net Revenue], [Buyers])`.',
  solution: `Revenue = ${SALES}
Net Revenue = CALCULATE([Revenue], orders[status] <> "cancelled")
Buyers = CALCULATE(DISTINCTCOUNT(orders[customer_id]), orders[status] <> "cancelled")
Per Buyer = DIVIDE([Net Revenue], [Buyers])`,
  check: `_dax_expect("Buyers", 'CALCULATE(DISTINCTCOUNT(orders[customer_id]), orders[status] <> "cancelled")')
_dax_expect("Per Buyer", 'DIVIDE(CALCULATE([Revenue], orders[status] <> "cancelled"), CALCULATE(DISTINCTCOUNT(orders[customer_id]), orders[status] <> "cancelled"))', helpers={"Revenue": "${SALES}"}, uses=["DIVIDE"])`,
},
{
  id: 'pj-04', mins: 5, lang: 'python',
  title: 'One chart, one finding',
  concept: [
    'The question is about where to grow, so chart spend **per customer**, not total revenue. Lagos is biggest mostly because it has the most customers.',
    'Every average rests on a count. Put each city\'s customer count in its label, and a bar built on two people can\'t pass for a trend.',
    'Sort the bars, and write what you found in the title.',
  ],
  starter: `${PREP}
by_city = lines.groupby("city").agg(revenue=("revenue", "sum"), customers=("customer_id", "nunique"))
by_city["per_customer"] = by_city["revenue"] / by_city["customers"]

by_city["revenue"].plot.bar()
plt.show()`,
  task: 'Draw `per_customer` as sorted horizontal bars. Label each bar with its city and customer count, like `Accra (5)`, and put the finding in the title.',
  hint: '`s = by_city.sort_values("per_customer")`, labels from `zip(s.index, s["customers"])`, then `ax.barh(labels, s["per_customer"])` and `ax.set_title(...)`.',
  solution: `${PREP}
by_city = lines.groupby("city").agg(revenue=("revenue", "sum"), customers=("customer_id", "nunique"))
by_city["per_customer"] = by_city["revenue"] / by_city["customers"]

s = by_city.sort_values("per_customer")
labels = ["%s (%d)" % (city, n) for city, n in zip(s.index, s["customers"])]

fig, ax = plt.subplots()
ax.barh(labels, s["per_customer"])
ax.set_title("Kigali spends most per customer, but on just 2 customers")
ax.set_xlabel("Revenue per customer")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_ax = _ax[0]
_bars = list(_ax.patches)
assert len(_bars) == len(by_city), "One bar per city: %d bars." % len(by_city)
_w = [p.get_width() for p in _bars]
assert max(_w) > 1, "Draw them sideways with barh, per_customer along each bar."
assert _w == sorted(_w) or _w == sorted(_w, reverse=True), "Sort the bars by spend per customer."
_ticks = [t.get_text() for t in _ax.get_yticklabels()]
for _city, _n in by_city["customers"].items():
    assert any(_city in _t and str(int(_n)) in _t for _t in _ticks), "Label each bar with its city and customer count, like %s (%d)." % (_city, _n)
_title = _ax.get_title().strip()
assert _title, "The title is where the finding goes."
assert _title.lower() not in ("per_customer", "per customer", "spend per customer", "revenue per customer"), "Say what you found, not what the chart shows."`,
},
{
  id: 'pj-05', mins: 5, lang: 'python',
  title: 'Make the call',
  concept: [
    'A recommendation is a rule you can say out loud, applied to the numbers, so anyone can check it — and argue with the rule rather than with you.',
    'Here: customers who already spend well (above the average per customer), in a city with enough of them to trust (at least 5), and then the fewest customers per million people — the most room to grow.',
    'Kigali tops spend per customer on 2 customers. Two is an anecdote, not a market.',
  ],
  starter: `${PREP}
by_city = lines.groupby("city").agg(revenue=("revenue", "sum"), customers=("customer_id", "nunique")).reset_index()
by_city = by_city.merge(cities, on="city")
by_city`,
  task: 'Add `per_customer` and `per_million` (customers per million people — `population_m` is already in millions). Keep cities above the overall average spend per customer with at least 5 customers, and set `pick` to the one with the lowest `per_million`.',
  hint: 'The overall average is `by_city["revenue"].sum() / by_city["customers"].sum()`. Filter with both conditions in one `&`, then `.sort_values("per_million")["city"].iloc[0]`.',
  solution: `${PREP}
by_city = lines.groupby("city").agg(revenue=("revenue", "sum"), customers=("customer_id", "nunique")).reset_index()
by_city = by_city.merge(cities, on="city")

by_city["per_customer"] = by_city["revenue"] / by_city["customers"]
by_city["per_million"] = by_city["customers"] / by_city["population_m"]

average = by_city["revenue"].sum() / by_city["customers"].sum()
room = by_city[(by_city["per_customer"] > average) & (by_city["customers"] >= 5)]
pick = room.sort_values("per_million")["city"].iloc[0]

print("Grow in", pick)
room`,
  check: `assert "pick" in globals(), "Set pick to the city you would grow in."
for _c in ("per_customer", "per_million"):
    assert _c in by_city.columns, "Add a %s column to by_city." % _c
_t = by_city.set_index("city")
assert ((_t["per_million"] - _t["customers"] / _t["population_m"]).abs() < 0.01).all(), "per_million is customers ÷ population_m."
_avg = _t["revenue"].sum() / _t["customers"].sum()
_ok = _t[(_t["revenue"] / _t["customers"] > _avg) & (_t["customers"] >= 5)]
_want = (_ok["customers"] / _ok["population_m"]).idxmin()
_best = (_t["revenue"] / _t["customers"]).idxmax()
if _best != _want:
    assert str(pick) != _best, "%s spends the most per customer, on %d customers. Too few to bet on: keep the at-least-5 rule." % (_best, _t.loc[_best, "customers"])
assert str(pick) == _want, "Apply the rules in order: above-average spend per customer, at least 5 customers, then the lowest per_million."`,
},
];
