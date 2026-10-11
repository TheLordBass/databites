/* Projects — one real question, answered start to finish with every tool:
   pandas to build the numbers, SQL to check them, DAX to make them a report,
   a chart to show the finding, and a rule to make the call.

   Each lesson sets its own lang. Numbers leave out cancelled orders
   throughout, and the final pick is computed in the check, never typed in. */

const SALES = 'SUMX(order_items, order_items[qty] * RELATED(products[price]))';

const DAYS = `days = cafe.merge(weather, on="date")`;

const SURVEY = `clean = survey.drop_duplicates().copy()
clean.columns = [c.strip() for c in clean.columns]
clean["Name"] = clean["Name"].str.strip().str.title()
clean["City"] = clean["City"].str.strip().str.title()
clean["Spend (GBP)"] = pd.to_numeric(clean["Spend (GBP)"].str.replace("£", "", regex=False), errors="coerce")
clean["Subscribed?"] = clean["Subscribed?"].str.strip().str.lower().str.startswith("y")
iso = pd.to_datetime(clean["Signed Up"], format="%Y-%m-%d", errors="coerce")
day_first = pd.to_datetime(clean["Signed Up"], format="%d/%m/%Y", errors="coerce")
clean["Signed Up"] = iso.fillna(day_first)`;

const BY_CITY = `by_city = clean.groupby("City").agg(
    responses=("Name", "size"),
    subscribed=("Subscribed?", "mean"),
    avg_spend=("Spend (GBP)", "mean"),
    no_spend=("Spend (GBP)", lambda s: s.isna().sum()),
)
by_city["subscribed"] = (by_city["subscribed"] * 100).round(0)
by_city["avg_spend"] = by_city["avg_spend"].round(2)`;

const COVERAGE = `by_city["coverage"] = ((by_city["responses"] - by_city["no_spend"]) / by_city["responses"] * 100).round(0)
shaky = by_city.index[by_city["coverage"] < 75].tolist()`;

const PREP = `lines = (order_items.merge(products, on="product_id")
         .merge(orders, on="order_id")
         .merge(customers[["customer_id", "city"]], on="customer_id"))
lines = lines[lines["status"] != "cancelled"]
lines["revenue"] = lines["qty"] * lines["price"]`;

// "Who should we win back?": the shop's customers, measured on 30 June 2024.
const LAST = `ok = orders[orders["status"] != "cancelled"]
last = ok.groupby("customer_id")["order_date"].max().rename("last_order").reset_index()
last["days_since"] = (pd.Timestamp("2024-06-30") - last["last_order"]).dt.days
last["lapsed"] = last["days_since"] > 45`;

const SPEND = `lines = order_items.merge(products, on="product_id").merge(ok, on="order_id")
lines["value"] = lines["qty"] * lines["price"]
spend = lines.groupby("customer_id")["value"].sum().rename("spend")
last = last.merge(spend, on="customer_id")`;

const TARGETS = `targets = (last[last["lapsed"]]
           .merge(customers[["customer_id", "name", "city"]], on="customer_id")
           .sort_values("spend", ascending=False)
           .head(5)[["customer_id", "name", "city", "spend", "days_since"]])`;

const STAKE = `span = ok.groupby("customer_id")["order_date"].agg(["min", "max"])
targets = targets.merge(span, left_on="customer_id", right_index=True)
targets["months"] = ((targets["max"].dt.year - targets["min"].dt.year) * 12
                     + (targets["max"].dt.month - targets["min"].dt.month) + 1)
targets["monthly"] = (targets["spend"] / targets["months"]).round(2)
at_stake = round(float(targets["monthly"].sum()), 2)`;

// The same lapsed list, worked out from scratch inside a check.
const LAPSED_CHECK = `_ok = orders[orders["status"] != "cancelled"]
_span = _ok.groupby("customer_id")["order_date"].agg(["min", "max"])
_lapsed = (pd.Timestamp("2024-06-30") - _span["max"]).dt.days > 45
_li = order_items.merge(products, on="product_id").merge(_ok, on="order_id")
_spend = (_li["qty"] * _li["price"]).groupby(_li["customer_id"]).sum()`;

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

/* ── Does the weather move the cafe? ───────────────────── */
{
  id: 'pj-06', mins: 4, lang: 'python',
  title: 'Line up the days',
  concept: [
    'A new question: **does the weather change how many cups the cafe sells?** If it does, the cafe could staff by the forecast.',
    '`cafe` has one row per day, and so does `weather`. Joining on `date` puts each day\'s sales next to that day\'s weather.',
    'Decide what "rainy" means before you look at any results: here, more than 1 mm. Choosing afterwards lets the answer pick its own definition.',
  ],
  starter: `weather.head()`,
  task: 'Make `days`: cafe joined to weather on `date`, one row per cafe day, with a `rainy` column that is True when `rain_mm` is over 1.',
  hint: '`days = cafe.merge(weather, on="date")`, then `days["rainy"] = days["rain_mm"] > 1`.',
  solution: `${DAYS}
days["rainy"] = days["rain_mm"] > 1
days[["date", "cups", "temp_c", "rain_mm", "rainy"]].head()`,
  check: `assert "days" in globals(), "Make a DataFrame called days."
assert len(days) == len(cafe), "One row per cafe day: %d rows. An inner join on date keeps just those." % len(cafe)
for _c in ("cups", "temp_c", "rain_mm", "rainy"):
    assert _c in days.columns, "days needs a %s column." % _c
_d = days.sort_values("date")
assert (_d["rainy"].astype(bool).values == (_d["rain_mm"] > 1).values).all(), "rainy should be True exactly when rain_mm is over 1."`,
},
{
  id: 'pj-07', mins: 5, lang: 'python',
  title: 'Rain or shine',
  concept: [
    'Compare like with like: average cups on rainy days against dry days, as a percentage difference, (rainy − dry) ÷ dry × 100.',
    'Do the same for temperature: days warmer than the median against the rest.',
    'A percentage makes the size readable. "2% fewer" and "30% fewer" are very different stories.',
  ],
  starter: `${DAYS}
days["rainy"] = days["rain_mm"] > 1
days.groupby("rainy")["cups"].mean()`,
  task: 'Set `rain_effect`: how much higher average cups are on rainy days than dry ones, in %, rounded to 1 (negative if lower). Then `warm_effect`, the same for days above the median `temp_c` against the rest.',
  hint: '`rain = days.groupby("rainy")["cups"].mean()`, then `round((rain[True] - rain[False]) / rain[False] * 100, 1)`. For warmth, group by `days["temp_c"] > days["temp_c"].median()`.',
  solution: `${DAYS}
days["rainy"] = days["rain_mm"] > 1

rain = days.groupby("rainy")["cups"].mean()
rain_effect = round((rain[True] - rain[False]) / rain[False] * 100, 1)

warm = days.groupby(days["temp_c"] > days["temp_c"].median())["cups"].mean()
warm_effect = round((warm[True] - warm[False]) / warm[False] * 100, 1)

print("rainy days:", rain_effect, "%   warm days:", warm_effect, "%")`,
  check: `for _v in ("rain_effect", "warm_effect"):
    assert _v in globals(), "Set %s." % _v
_d = cafe.merge(weather, on="date")
_r = _d.groupby(_d["rain_mm"] > 1)["cups"].mean()
_w = _d.groupby(_d["temp_c"] > _d["temp_c"].median())["cups"].mean()
assert abs(float(rain_effect) - (_r[True] - _r[False]) / _r[False] * 100) < 0.06, "rain_effect is (rainy mean - dry mean) / dry mean x 100."
assert abs(float(warm_effect) - (_w[True] - _w[False]) / _w[False] * 100) < 0.06, "warm_effect compares days above the median temp_c with the rest, the same way."`,
},
{
  id: 'pj-08', mins: 5, lang: 'python',
  title: 'How strong, really?',
  concept: [
    'A correlation, r, says how closely two things move together: 0 is not at all, −1 or 1 is in lockstep. Below about 0.3 either way, a day-to-day link is too weak to plan around.',
    'Add the days up into weeks and the correlation often jumps. There are fewer points, and both columns drift with the season, so a shared trend can pass for a cause.',
    'Lead with the daily number. Give the weekly one with that warning, never the other way round.',
  ],
  starter: `${DAYS}
days[["cups", "temp_c", "rain_mm"]].corr()`,
  task: 'Set `r_temp` and `r_rain`: the daily correlation of cups with `temp_c` and with `rain_mm`. Then `weekly_r`: weekly total cups against weekly mean `temp_c`. Round all three to 2.',
  hint: '`days["cups"].corr(days["temp_c"])`. For weeks: `weekly = days.set_index("date").resample("W").agg({"cups": "sum", "temp_c": "mean"})`, then correlate those two columns.',
  solution: `${DAYS}

r_temp = round(days["cups"].corr(days["temp_c"]), 2)
r_rain = round(days["cups"].corr(days["rain_mm"]), 2)

weekly = days.set_index("date").resample("W").agg({"cups": "sum", "temp_c": "mean"})
weekly_r = round(weekly["cups"].corr(weekly["temp_c"]), 2)

print("daily: temp", r_temp, " rain", r_rain, "   weekly temp", weekly_r, "on", len(weekly), "weeks")`,
  check: `for _v in ("r_temp", "r_rain", "weekly_r"):
    assert _v in globals(), "Set %s." % _v
_d = cafe.merge(weather, on="date")
assert abs(float(r_temp) - _d["cups"].corr(_d["temp_c"])) < 0.011, "r_temp is the daily correlation of cups with temp_c."
assert abs(float(r_rain) - _d["cups"].corr(_d["rain_mm"])) < 0.011, "r_rain is the daily correlation of cups with rain_mm."
_wk = _d.set_index("date").resample("W").agg({"cups": "sum", "temp_c": "mean"})
assert abs(float(weekly_r) - _wk["cups"].corr(_wk["temp_c"])) < 0.02, "weekly_r: total cups per week against mean temp_c per week."`,
},
{
  id: 'pj-09', mins: 5, lang: 'python',
  title: 'Show it at its real size',
  concept: [
    'A scatter of every day with a fitted line shows two things at once: the slope, and how much the points ignore it.',
    'The title carries the finding at its honest size. With r near −0.1, "warmer days sell slightly fewer cups" is true; "heat kills sales" is not.',
    'Put r in the title too, so the size is there in numbers as well as words.',
  ],
  starter: `import seaborn as sns
${DAYS}
sns.scatterplot(data=days, x="temp_c", y="cups")
plt.show()`,
  task: 'Switch to `sns.regplot` so the fitted line shows, and title the chart with the finding and its r to 2 places, like `Warmer days sell slightly fewer cups (r = -0.12)`.',
  hint: '`r = days["cups"].corr(days["temp_c"])`, `sns.regplot(data=days, x="temp_c", y="cups")`, then `plt.title(f"... (r = {r:.2f})")`. The `f` before the quotes lets you drop values into `{ }`, and `:.2f` means "to 2 decimal places".',
  solution: `import seaborn as sns
${DAYS}
r = days["cups"].corr(days["temp_c"])

sns.regplot(data=days, x="temp_c", y="cups", scatter_kws={"alpha": 0.6})
plt.title(f"Warmer days sell slightly fewer cups (r = {r:.2f})")
plt.xlabel("Temperature (°C)")
plt.ylabel("Cups sold")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_ax = _ax[0]
assert len(_ax.lines) >= 1, "Use sns.regplot, so the fitted line is drawn."
assert any(len(c.get_offsets()) == len(cafe) for c in _ax.collections), "Plot every day: temp_c along x, cups up y."
_d = cafe.merge(weather, on="date")
_r = _d["cups"].corr(_d["temp_c"])
_title = _ax.get_title()
assert "%.2f" % _r in _title, "Put r in the title, to 2 places: %.2f." % _r
assert "strong" not in _title.lower(), "With r this close to 0, the link isn't strong. Say what's there, at its real size."`,
},
{
  id: 'pj-10', mins: 5, lang: 'python',
  title: 'Make the call, either way',
  concept: [
    'The question was practical: should the cafe staff by the weather forecast?',
    'Write the rule before looking: plan by weather only if the daily link is at least moderate (|r| of 0.3 or more), or warm days differ by 15% or more.',
    'Then say what you found, with the numbers, whichever way it goes. "No" is a real answer, and it saves the cafe from chasing noise.',
  ],
  starter: `${DAYS}
r_temp = days["cups"].corr(days["temp_c"])
warm = days.groupby(days["temp_c"] > days["temp_c"].median())["cups"].mean()
warm_effect = (warm[True] - warm[False]) / warm[False] * 100
print(round(r_temp, 2), round(warm_effect, 1))`,
  task: 'Set `plan_for_weather` to True or False by that rule, and `reason` to one sentence that includes r to 2 places, like `r = -0.12`.',
  hint: '`plan_for_weather = abs(r_temp) >= 0.3 or abs(warm_effect) >= 15`. Build `reason` with an f-string: `f"... (r = {r_temp:.2f}) ..."`.',
  solution: `${DAYS}
r_temp = days["cups"].corr(days["temp_c"])
warm = days.groupby(days["temp_c"] > days["temp_c"].median())["cups"].mean()
warm_effect = (warm[True] - warm[False]) / warm[False] * 100

plan_for_weather = bool(abs(r_temp) >= 0.3 or abs(warm_effect) >= 15)
if plan_for_weather:
    reason = f"Weather moves sales enough to plan for (r = {r_temp:.2f}, warm days {warm_effect:+.0f}%)."
else:
    reason = f"Too weak to staff by: r = {r_temp:.2f}, and warm days differ by only {warm_effect:+.0f}%."
print(plan_for_weather, "-", reason)`,
  check: `for _v in ("plan_for_weather", "reason"):
    assert _v in globals(), "Set %s." % _v
_d = cafe.merge(weather, on="date")
_r = _d["cups"].corr(_d["temp_c"])
_w = _d.groupby(_d["temp_c"] > _d["temp_c"].median())["cups"].mean()
_e = (_w[True] - _w[False]) / _w[False] * 100
_want = abs(_r) >= 0.3 or abs(_e) >= 15
assert bool(plan_for_weather) == _want, "Apply the rule as written: |r| of 0.3 or more, or warm days differing by 15% or more."
assert isinstance(reason, str) and "%.2f" % _r in reason, "Say why, with r to 2 places (%.2f) in the sentence." % _r`,
},

/* ── From messy survey to a one-page summary ───────────── */
{
  id: 'pj-11', mins: 5, lang: 'python',
  title: 'Clean it once, properly',
  concept: [
    'A new question from the survey: **which city is most engaged, and how sure can we be?** First, one clean table, so every later step starts from the same place.',
    'The mess, one item each: padded names, exact duplicate rows, "£18.00" and "n/a" as text, Yes/y/YES, and dates in two formats.',
    'The £ says the survey is British, so 05/02/2024 is day first: 5 February.',
  ],
  starter: `clean = survey.copy()
clean.columns = [c.strip() for c in clean.columns]
clean.head()`,
  task: 'Finish `clean`: drop exact duplicate rows; strip and title-case `Name` and `City`; make `Spend (GBP)` a number (n/a becomes missing); `Subscribed?` True or False; `Signed Up` real dates, day first, with "unknown" missing.',
  hint: '`drop_duplicates()`, `.str.strip().str.title()`, `pd.to_numeric(....str.replace("£", "", regex=False), errors="coerce")`, `.str.strip().str.lower().str.startswith("y")`, and two `pd.to_datetime` passes (`format="%Y-%m-%d"`, then `format="%d/%m/%Y"`, both with `errors="coerce"`) joined with `fillna`.',
  solution: `${SURVEY}
clean.head()`,
  check: `assert "clean" in globals(), "Make a DataFrame called clean."
_cols = ["Name", "City", "Signed Up", "Spend (GBP)", "Subscribed?", "Note"]
assert list(clean.columns) == _cols, "Strip the column names: %s." % ", ".join(_cols)
_raw = survey.drop_duplicates()
assert len(clean) == len(_raw), "Drop the exact duplicates: %d rows should be left." % len(_raw)
assert set(clean["City"]) == {"Lagos", "Accra", "Nairobi"}, "City should be stripped and title-cased: Lagos, Accra, Nairobi."
assert (clean["Name"] == clean["Name"].str.strip()).all() and clean["Name"].str.istitle().all(), "Name should be stripped and title-cased."
assert pd.api.types.is_numeric_dtype(clean["Spend (GBP)"]), "Spend (GBP) should be numbers, with n/a as missing."
_spend = pd.to_numeric(_raw["Spend (GBP)"].str.replace("£", "", regex=False), errors="coerce")
assert abs(clean["Spend (GBP)"].sum() - _spend.sum()) < 0.01 and clean["Spend (GBP)"].isna().sum() == _spend.isna().sum(), "Spend is off: take out the £ and let n/a become missing."
assert clean["Subscribed?"].dtype == bool, "Subscribed? should be True or False."
assert pd.api.types.is_datetime64_any_dtype(clean["Signed Up"]), "Signed Up should be dates."
_dates = set(clean["Signed Up"].dropna())
assert pd.Timestamp("2024-02-05") in _dates and pd.Timestamp("2024-05-02") not in _dates, "Read 05/02/2024 day first, as 5 February."
assert clean["Signed Up"].isna().sum() == (_raw["Signed Up"] == "unknown").sum(), '"unknown" should become a missing date, and every real date should be read correctly.'`,
},
{
  id: 'pj-12', mins: 5, lang: 'python',
  title: 'One row per city',
  concept: [
    'Summaries answer the question, so choose their columns for it: how many responses, how engaged (the share subscribed), and what people spend.',
    '`mean()` on a True/False column is the share that are True. Times 100, it is a percentage.',
    'Count the blanks as well as averaging the rest. A mean quietly skips missing values, and the table should show how many it skipped.',
  ],
  starter: `${SURVEY}
clean.groupby("City").size()`,
  task: 'Make `by_city`, one row per city: `responses`, `subscribed` (% subscribed, rounded to 0), `avg_spend` (mean of the spends given, rounded to 2) and `no_spend` (how many left the spend blank).',
  hint: '`clean.groupby("City").agg(responses=("Name", "size"), subscribed=("Subscribed?", "mean"), avg_spend=("Spend (GBP)", "mean"), no_spend=("Spend (GBP)", lambda s: s.isna().sum()))`, then scale and round.',
  solution: `${SURVEY}
${BY_CITY}
by_city`,
  check: `assert "by_city" in globals(), "Make a DataFrame called by_city."
_b = by_city.set_index("City") if "City" in by_city.columns else by_city
for _c in ("responses", "subscribed", "avg_spend", "no_spend"):
    assert _c in _b.columns, "by_city needs a %s column." % _c
_g = clean.groupby("City")
assert set(_b.index) == set(_g.size().index), "One row per city, with City as the index or a column."
_b = _b.reindex(_g.size().index)
assert (_b["responses"] == _g.size()).all(), "responses counts every row per city."
assert ((_b["subscribed"] - (_g["Subscribed?"].mean() * 100).round(0)).abs() < 0.51).all(), "subscribed is the share of True, as a percentage."
assert ((_b["avg_spend"] - _g["Spend (GBP)"].mean()).abs() < 0.01).all(), "avg_spend is the mean of the spends people gave. mean() skips the blanks."
assert (_b["no_spend"] == _g["Spend (GBP)"].apply(lambda s: s.isna().sum())).all(), "no_spend counts the blank spends per city."`,
},
{
  id: 'pj-13', mins: 4, lang: 'python',
  title: 'What can you trust?',
  concept: [
    'An average is only as good as the answers under it. Half of Nairobi\'s responses said n/a for spend, so its average rests on the other half.',
    'Put the coverage next to the number: the share of responses that gave a spend.',
    'Flag, don\'t delete. A city under 75% coverage keeps its figure, with a warning attached.',
  ],
  starter: `${SURVEY}
${BY_CITY}
by_city`,
  task: 'Add `coverage` to `by_city`: the % of responses that gave a spend, rounded to 0. Then set `shaky` to the list of cities with coverage under 75.',
  hint: '`(by_city["responses"] - by_city["no_spend"]) / by_city["responses"] * 100`, rounded; then `by_city.index[by_city["coverage"] < 75].tolist()`.',
  solution: `${SURVEY}
${BY_CITY}
${COVERAGE}
print("shaky:", shaky)
by_city`,
  check: `assert "coverage" in by_city.columns, "Add a coverage column to by_city."
_b = by_city.set_index("City") if "City" in by_city.columns else by_city
_cov = (_b["responses"] - _b["no_spend"]) / _b["responses"] * 100
assert ((_b["coverage"] - _cov).abs() < 0.51).all(), "coverage is the share of responses that gave a spend, in %."
assert "shaky" in globals(), "Set shaky to a list of cities."
assert sorted(shaky) == sorted(_cov.index[_cov < 75].tolist()), "shaky is every city whose coverage is under 75."`,
},
{
  id: 'pj-14', mins: 5, lang: 'python',
  title: 'One chart for the page',
  concept: [
    'A one-page summary gets one chart, so pick the measure the question is about: engagement, the share subscribed.',
    'Shares belong on an axis from 0 to 100. Starting higher makes small gaps look huge.',
    'Every bar is built on some number of responses. Put that count in the label, as before.',
  ],
  starter: `${SURVEY}
${BY_CITY}
by_city["subscribed"].plot.bar()
plt.show()`,
  task: 'Draw `subscribed` as bars, highest first, each labelled with its city and response count like `Lagos (12)`, on a y-axis from 0 to 100, with the finding as the title.',
  hint: '`s = by_city.sort_values("subscribed", ascending=False)`, labels from `zip(s.index, s["responses"])`, `ax.bar(labels, s["subscribed"])`, `ax.set_ylim(0, 100)`.',
  solution: `${SURVEY}
${BY_CITY}
s = by_city.sort_values("subscribed", ascending=False)
labels = ["%s (%d)" % (city, n) for city, n in zip(s.index, s["responses"])]

fig, ax = plt.subplots()
ax.bar(labels, s["subscribed"])
ax.set_ylim(0, 100)
ax.set_ylabel("Subscribed (%)")
ax.set_title("Every Lagos response subscribed; no Accra response did")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_ax = _ax[0]
_h = [p.get_height() for p in _ax.patches]
assert len(_h) == len(by_city), "One bar per city."
assert _h == sorted(_h, reverse=True), "Sort the bars, highest first."
_ticks = [t.get_text() for t in _ax.get_xticklabels()]
_b = by_city.set_index("City") if "City" in by_city.columns else by_city
for _city, _n in _b["responses"].items():
    assert any(_city in _t and str(int(_n)) in _t for _t in _ticks), "Label each bar with its city and response count, like %s (%d)." % (_city, _n)
assert _ax.get_ylim()[1] >= 100, "Run the y-axis up to 100, so shares read as shares: ax.set_ylim(0, 100)."
assert _ax.get_title().strip(), "Put the finding in the title."`,
},
{
  id: 'pj-15', mins: 5, lang: 'python',
  title: 'Write the summary',
  concept: [
    'The last step is words: a short paragraph someone can read without the chart.',
    'Build it from the table, not by retyping figures. An f-string (an `f` before the quotes) drops each number in from `by_city`, so the words can\'t drift from the data.',
    'Lead with the finding, then the caveat: the most engaged city first, the shaky figure after.',
  ],
  starter: `${SURVEY}
${BY_CITY}
${COVERAGE}
by_city`,
  task: 'Set `summary`: a few sentences, built with f-strings from `by_city`, that name the city with the highest `subscribed` share and give that share, and name each city in `shaky` as a figure to treat with care.',
  hint: '`top = by_city["subscribed"].idxmax()`, then `f"{top} ... {by_city.loc[top, \'subscribed\']:.0f}% ..."`, and `", ".join(shaky)` for the caveat.',
  solution: `${SURVEY}
${BY_CITY}
${COVERAGE}

top = by_city["subscribed"].idxmax()
big = by_city["avg_spend"].idxmax()
caveat = ", ".join(shaky)
summary = (
    f"{top} is the most engaged city: {by_city.loc[top, 'subscribed']:.0f}% of its responses subscribed. "
    f"{big} spends the most on average, £{by_city.loc[big, 'avg_spend']:.2f}. "
    f"Treat the spend figure for {caveat} with care: fewer than 3 in 4 of those responses gave one."
)
print(summary)`,
  check: `assert isinstance(globals().get("summary"), str) and summary.strip(), "Set summary to a string."
_b = by_city.set_index("City") if "City" in by_city.columns else by_city
_top = _b["subscribed"].idxmax()
assert _top in summary, "Lead with the most engaged city, %s." % _top
assert "%.0f" % _b.loc[_top, "subscribed"] in summary, "Give %s's subscribed share as a number: %.0f%%." % (_top, _b.loc[_top, "subscribed"])
_shaky = _b.index[(_b["responses"] - _b["no_spend"]) / _b["responses"] * 100 < 75].tolist()
for _c in _shaky:
    assert _c in summary, "Name %s as a figure to treat with care: under 75%% of its responses gave a spend." % _c`,
},

/* ── Who should we win back? ───────────────────────────── */
{
  id: 'pj-16', mins: 5, lang: 'python',
  title: 'Who has gone quiet?',
  concept: [
    'A new question, a bigger one: **which online customers have stopped buying, and which are worth winning back?** First, say what "stopped" means, in numbers.',
    "The data runs to the end of June, so measure from 30 June. A customer's last order that went through, not cancelled, shows how long they have been quiet.",
    "A customer usually orders again within about a month, so more than 45 days quiet is well past normal. Call those customers **lapsed**.",
  ],
  starter: `ok = orders[orders["status"] != "cancelled"]
ok.head()`,
  task: 'Make `last`: one row per customer with an order that went through, with `customer_id`, `last_order` (their latest order date) and `days_since` (days from it to 30 June 2024). Then add `lapsed`: True when `days_since` is over 45.',
  hint: '`ok.groupby("customer_id")["order_date"].max()` is each last order; `.rename("last_order").reset_index()` makes it a table. Then `(pd.Timestamp("2024-06-30") - last["last_order"]).dt.days` and `last["days_since"] > 45`.',
  solution: `${LAST}

last["lapsed"].sum()`,
  check: `assert "last" in globals(), "Make a DataFrame called last."
${LAPSED_CHECK}
for _c in ["customer_id", "last_order", "days_since", "lapsed"]:
    assert _c in last.columns, "last needs a column called %s." % _c
assert len(last) == len(_span), "One row per customer with an order that went through: %d of them." % len(_span)
_mine = last.set_index("customer_id").sort_index()
_days = (pd.Timestamp("2024-06-30") - _span["max"]).dt.days
assert (_mine["days_since"].to_numpy() == _days.sort_index().to_numpy()).all(), "days_since is the days from each customer's last order that went through (not cancelled) to 30 June 2024."
assert int(_mine["lapsed"].sum()) == int(_lapsed.sum()), "lapsed is True when days_since is over 45."`,
},
{
  id: 'pj-17', mins: 4, lang: 'sql', needs: ['sqlite3'],
  title: 'The same list, in SQL',
  concept: [
    'Before anyone emails a list of names, build it a second way. If SQL and pandas agree, a slip in either one is much less likely.',
    "`julianday('2024-06-30') - julianday(MAX(order_date))` is the days since a customer's last order. HAVING keeps the customers where that is over 45.",
    'Leave the cancelled orders out in the WHERE, before the grouping, exactly as the pandas did.',
  ],
  starter: `SELECT customer_id, MAX(order_date) AS last_order
FROM orders
GROUP BY customer_id;`,
  task: 'List the lapsed customers in SQL: `customer_id` and `last_order`, leaving out cancelled orders and keeping customers more than 45 days quiet on 30 June 2024, by customer_id. It should match the pandas list.',
  hint: "Add `WHERE status <> 'cancelled'` before the GROUP BY, and `HAVING julianday('2024-06-30') - julianday(MAX(order_date)) > 45` after it.",
  solution: `SELECT customer_id, MAX(order_date) AS last_order
FROM orders
WHERE status <> 'cancelled'
GROUP BY customer_id
HAVING julianday('2024-06-30') - julianday(MAX(order_date)) > 45
ORDER BY customer_id;`,
  check: `_same_as("SELECT customer_id, MAX(order_date) AS last_order FROM orders WHERE status <> 'cancelled' GROUP BY customer_id HAVING julianday('2024-06-30') - julianday(MAX(order_date)) > 45 ORDER BY customer_id", ordered=True)`,
},
{
  id: 'pj-18', mins: 5, lang: 'python',
  title: 'What were they worth?',
  concept: [
    "Winning someone back matters more if they used to spend a lot. A customer's spend is their order lines, qty × price, from orders that went through.",
    'Join `order_items` to `products` for the price and to `ok` for the orders that went through, then add up per customer.',
    'Then put the two groups side by side: how many, the average spend and the total. A small group can still matter if each of them spent a lot.',
  ],
  starter: `${LAST}
lines = order_items.merge(products, on="product_id").merge(ok, on="order_id")
lines.head()`,
  task: "Add `spend` to `last`: each customer's total of qty × price. Then make `compare`, one row for lapsed (True) and one for active (False), with `customers`, `avg_spend` and `total_spend`, rounded to 2 places.",
  hint: '`lines["value"] = lines["qty"] * lines["price"]`, then group by customer_id, sum, and merge onto `last`. For compare: `last.groupby("lapsed").agg(customers=("customer_id", "size"), avg_spend=("spend", "mean"), total_spend=("spend", "sum")).round(2)`.',
  solution: `${LAST}
${SPEND}
compare = last.groupby("lapsed").agg(customers=("customer_id", "size"),
                                     avg_spend=("spend", "mean"),
                                     total_spend=("spend", "sum")).round(2)

compare`,
  check: `assert "spend" in last.columns, "Add a spend column to last."
${LAPSED_CHECK}
assert abs(float(last["spend"].sum()) - float(_spend.sum())) < 0.01, "spend is qty × price, added up per customer, from orders that went through."
assert "compare" in globals(), "Make compare: one row for lapsed, one for active."
_cmp = compare.set_index("lapsed") if "lapsed" in compare.columns else compare
for _col in ["customers", "avg_spend", "total_spend"]:
    assert _col in _cmp.columns, "compare needs a column called %s." % _col
_lap = _spend[_lapsed[_lapsed].index]
assert int(_cmp.loc[True, "customers"]) == len(_lap), "The True row counts the lapsed customers."
assert abs(float(_cmp.loc[True, "avg_spend"]) - round(float(_lap.mean()), 2)) < 0.01, "avg_spend is each group's average spend, rounded to 2."
assert abs(float(_cmp.loc[True, "total_spend"]) - round(float(_lap.sum()), 2)) < 0.01, "total_spend adds up each group's spend."`,
},
{
  id: 'pj-19', mins: 5, lang: 'python',
  title: 'What did they buy?',
  concept: [
    "Did the lapsed customers want something different? Split each group's spend across the product categories.",
    '`pd.crosstab(rows, columns, values=..., aggfunc="sum", normalize="index")` adds up the spend in a grid, then turns each row into shares that add up to 1.',
    'Look for the biggest gap between the two rows. That is where the groups differ most, and the first place to look for a reason.',
  ],
  starter: `${LAST}
${SPEND}
lines = lines.merge(last[["customer_id", "lapsed"]], on="customer_id")
lines.head()`,
  task: 'Make `mix`: the share of spend in each category, as a percentage rounded to 1, with lapsed (True) and active (False) as the rows. Then set `biggest`: the category where the two rows differ most, either way.',
  hint: '`(pd.crosstab(lines["lapsed"], lines["category"], values=lines["value"], aggfunc="sum", normalize="index") * 100).round(1)`, then `(mix.loc[True] - mix.loc[False]).abs().idxmax()`.',
  solution: `${LAST}
${SPEND}
lines = lines.merge(last[["customer_id", "lapsed"]], on="customer_id")
mix = (pd.crosstab(lines["lapsed"], lines["category"], values=lines["value"],
                   aggfunc="sum", normalize="index") * 100).round(1)
biggest = (mix.loc[True] - mix.loc[False]).abs().idxmax()

mix`,
  check: `assert "mix" in globals(), "Make mix: the share of spend by category, lapsed and active as rows."
${LAPSED_CHECK}
_li["value"] = _li["qty"] * _li["price"]
_li["lapsed"] = _li["customer_id"].map(_lapsed)
_m = (pd.crosstab(_li["lapsed"], _li["category"], values=_li["value"], aggfunc="sum", normalize="index") * 100).round(1)
assert set(map(str, mix.columns)) == set(map(str, _m.columns)), "One column per category: %s." % ", ".join(map(str, _m.columns))
assert all(abs(float(mix.loc[_r, _c]) - float(_m.loc[_r, _c])) < 0.06 for _r in [True, False] for _c in _m.columns), "Each row is that group's spend split across the categories, as a percentage rounded to 1: normalize='index', then times 100."
assert globals().get("biggest") == (_m.loc[True] - _m.loc[False]).abs().idxmax(), "biggest is the category with the largest gap between the two rows, whichever way it goes."`,
},
{
  id: 'pj-20', mins: 4, lang: 'python',
  title: 'When did they start?',
  concept: [
    "Are some customers drifting away faster than others? A customer's cohort is the month of their first order that went through.",
    '`.dt.to_period("M")` turns a date into its month. Group by cohort, then count the customers and the lapsed ones.',
    'A rate needs its count beside it. 1 lapsed out of 4 is 25%, but it is only 4 people, so read small cohorts with care.',
  ],
  starter: `${LAST}
ok.groupby("customer_id")["order_date"].min().head()`,
  task: 'Add each customer\'s `cohort` to `last`. Then make `by_cohort`, one row per cohort: `customers`, `lapsed` (how many) and `rate` (the % lapsed, rounded to 0).',
  hint: '`first = ok.groupby("customer_id")["order_date"].min().dt.to_period("M").rename("cohort")`, merge it onto `last`, then `last.groupby("cohort").agg(customers=("customer_id", "size"), lapsed=("lapsed", "sum"))` and work out rate from those two.',
  solution: `${LAST}
first = ok.groupby("customer_id")["order_date"].min().dt.to_period("M").rename("cohort")
last = last.merge(first, on="customer_id")
by_cohort = last.groupby("cohort").agg(customers=("customer_id", "size"), lapsed=("lapsed", "sum"))
by_cohort["rate"] = (by_cohort["lapsed"] / by_cohort["customers"] * 100).round(0)

by_cohort`,
  check: `assert "by_cohort" in globals(), "Make by_cohort: one row per cohort."
${LAPSED_CHECK}
_g = pd.DataFrame({"cohort": _span["min"].dt.to_period("M"), "lapsed": _lapsed}).groupby("cohort").agg(customers=("lapsed", "size"), lapsed=("lapsed", "sum"))
for _col in ["customers", "lapsed", "rate"]:
    assert _col in by_cohort.columns, "by_cohort needs a column called %s." % _col
assert len(by_cohort) == len(_g), "One row per cohort: %d of them." % len(_g)
assert list(by_cohort["customers"].astype(int)) == list(_g["customers"].astype(int)), "customers counts each cohort's customers, in month order."
assert list(by_cohort["lapsed"].astype(int)) == list(_g["lapsed"].astype(int)), "lapsed counts the lapsed customers in each cohort."
_rate = (_g["lapsed"] / _g["customers"] * 100).round(0)
assert all(abs(float(a) - float(b)) < 0.6 for a, b in zip(by_cohort["rate"], _rate)), "rate is the percentage lapsed in each cohort, rounded to 0."`,
},
{
  id: 'pj-21', mins: 5, lang: 'python',
  title: 'One chart for the finding',
  concept: [
    'One chart should carry the finding: most customers order again within a few weeks, and a tail has gone quiet.',
    '`ax.hist(last["days_since"], bins=range(0, 165, 15))` counts the customers in 15-day bands. `ax.axvline(45)` draws the cut-off as a line down the chart.',
    'Say the finding in the title, with the number in it. The title is the part people remember.',
  ],
  starter: `${LAST}
last["days_since"].plot.hist()
plt.show()`,
  task: 'Draw a histogram of `days_since` in 15-day bands from 0 to 165, with a vertical line at 45 and a title that says how many customers are lapsed.',
  hint: '`fig, ax = plt.subplots()`, `ax.hist(last["days_since"], bins=range(0, 165, 15))`, `ax.axvline(45, linestyle="--")`, and an f-string title with `int(last["lapsed"].sum())` in it.',
  solution: `${LAST}
n = int(last["lapsed"].sum())

fig, ax = plt.subplots()
ax.hist(last["days_since"], bins=range(0, 165, 15), color="#8a6a4f", edgecolor="white")
ax.axvline(45, color="#b23a26", linestyle="--")
ax.set_xlabel("Days since last order, on 30 June")
ax.set_ylabel("Customers")
ax.set_title(f"{n} of {len(last)} customers have been quiet for over 45 days")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_ax = _ax[0]
assert len(_ax.patches) >= 5, "Draw a histogram of days_since with ax.hist(...)."
assert int(round(sum(p.get_height() for p in _ax.patches))) == len(last), "Every customer should land in a bar: bands from 0 to 165 cover them all."
assert any(45 in [float(x) for x in _l.get_xdata()] for _l in _ax.lines), "Draw the cut-off: ax.axvline(45)."
assert str(int(last["lapsed"].sum())) in _ax.get_title(), "Put the number of lapsed customers in the title."`,
},
{
  id: 'pj-22', mins: 5, lang: 'dax', rows: 'customers[city]',
  title: 'A measure for the dashboard',
  concept: [
    'The list will change every week, so the report needs a measure that works it out fresh, not a number typed in.',
    "`CALCULATE(MAX(orders[order_date]), orders[status] <> \"cancelled\")` is a customer's last order that went through, when it's worked out one customer at a time inside FILTER.",
    'Lapsed on 30 June means a last order before 16 May: `< DATE(2024, 5, 16)`. In a live report, a date worked out from TODAY() would take its place.',
  ],
  starter: `Customers = DISTINCTCOUNT(orders[customer_id])`,
  task: "Add `Lapsed`: how many customers' last order that went through was before 16 May 2024. The matrix splits it by city.",
  hint: '`Lapsed = COUNTROWS(FILTER(VALUES(orders[customer_id]), CALCULATE(MAX(orders[order_date]), orders[status] <> "cancelled") < DATE(2024, 5, 16)))`',
  solution: `Customers = DISTINCTCOUNT(orders[customer_id])
Lapsed = COUNTROWS(FILTER(VALUES(orders[customer_id]),
    CALCULATE(MAX(orders[order_date]), orders[status] <> "cancelled") < DATE(2024, 5, 16)))`,
  check: `_dax_expect("Lapsed", 'COUNTROWS(FILTER(VALUES(orders[customer_id]), CALCULATE(MAX(orders[order_date]), orders[status] <> "cancelled") < DATE(2024, 5, 16)))', helpers={"Customers": "DISTINCTCOUNT(orders[customer_id])"}, uses=["FILTER"])`,
},
{
  id: 'pj-23', mins: 4, lang: 'python',
  title: 'Who first?',
  concept: [
    'Eight people is a short list, but a campaign still needs an order. Start with whoever used to spend the most.',
    "Join `last` to `customers` for names and cities. A blank city stays blank: say so, rather than guess.",
    'Keep the top five for a personal message. The rest can get the general email.',
  ],
  starter: `${LAST}
${SPEND}
last[last["lapsed"]]`,
  task: 'Make `targets`: the lapsed customers with `customer_id`, `name`, `city`, `spend` and `days_since`, biggest spend first, top five only.',
  hint: '`last[last["lapsed"]].merge(customers[["customer_id", "name", "city"]], on="customer_id")`, then `.sort_values("spend", ascending=False).head(5)` and pick the columns.',
  solution: `${LAST}
${SPEND}
${TARGETS}

targets`,
  check: `assert "targets" in globals(), "Make targets: the top five lapsed customers by spend."
${LAPSED_CHECK}
assert len(targets) == 5, "Keep the top five."
for _c in ["customer_id", "name", "city", "spend"]:
    assert _c in targets.columns, "targets needs a column called %s." % _c
_top = _spend[_lapsed[_lapsed].index].sort_values(ascending=False).head(5)
assert list(targets["customer_id"]) == list(_top.index), "Lapsed customers only, biggest spend first."
assert list(targets["name"]) == customers.set_index("customer_id").loc[_top.index, "name"].tolist(), "Bring each name across from customers."`,
},
{
  id: 'pj-24', mins: 5, lang: 'python',
  title: 'How much is at stake?',
  concept: [
    "To argue for a campaign, put a number on it. A customer's **monthly value** is their spend divided by the months they were buying, from first month to last, both counted.",
    'Months between two dates: `(last.dt.year - first.dt.year) * 12 + (last.dt.month - first.dt.month) + 1`. Someone who only bought in March was buying for 1 month.',
    'Add up the monthly values of the five targets: that is the most that winning them all back could be worth each month. Say "up to": not everyone will come back.',
  ],
  starter: `${LAST}
${SPEND}
${TARGETS}
span = ok.groupby("customer_id")["order_date"].agg(["min", "max"])
span.head()`,
  task: 'Bring `span` onto `targets`, add `months` (first to last month, both counted) and `monthly` (spend ÷ months, rounded to 2), then set `at_stake`: the five monthly values added up, rounded to 2.',
  hint: '`targets = targets.merge(span, left_on="customer_id", right_index=True)`, then months from the `min` and `max` columns as in the second bullet, `monthly = (spend / months).round(2)`, and `at_stake = round(float(targets["monthly"].sum()), 2)`.',
  solution: `${LAST}
${SPEND}
${TARGETS}
${STAKE}

targets[["name", "spend", "months", "monthly"]]`,
  check: `assert "months" in targets.columns and "monthly" in targets.columns, "Add months and monthly to targets."
${LAPSED_CHECK}
_top = _spend[_lapsed[_lapsed].index].sort_values(ascending=False).head(5).index
_s = _span.loc[_top]
_m = (_s["max"].dt.year - _s["min"].dt.year) * 12 + (_s["max"].dt.month - _s["min"].dt.month) + 1
assert sorted(targets["months"].astype(int)) == sorted(_m.astype(int)), "months runs from first month to last, both counted: someone who only bought in March was buying for 1 month."
_monthly = (_spend.loc[_top] / _m).round(2)
assert "at_stake" in globals() and abs(float(at_stake) - round(float(_monthly.sum()), 2)) < 0.02, "at_stake adds up the five monthly values (spend ÷ months), rounded to 2."`,
},
{
  id: 'pj-25', mins: 5, lang: 'python',
  title: 'Make the case',
  concept: [
    'The last step is the recommendation, in words someone can act on without opening the notebook.',
    'Build it with f-strings from the tables, so no figure is typed in by hand: how many are lapsed, who to contact first, and what it could be worth.',
    "Finish with the caveat. This is money people spent before, and winning them back is a hope, not a promise.",
  ],
  starter: `${LAST}
${SPEND}
${TARGETS}
${STAKE}
targets[["name", "city", "spend", "monthly"]]`,
  task: 'Set `summary`: a few sentences, built with f-strings, that say how many customers are lapsed and out of how many, name the top target, and give `at_stake` as the most it could be worth a month.',
  hint: '`n = int(last["lapsed"].sum())` and `top = targets.iloc[0]`, then something like `f"{n} of our {len(last)} customers ... Start with {top[\'name\']} ... up to £{at_stake:.2f} a month"`.',
  solution: `${LAST}
${SPEND}
${TARGETS}
${STAKE}

n = int(last["lapsed"].sum())
top = targets.iloc[0]
summary = (
    f"{n} of our {len(last)} online customers have not ordered for over 45 days. "
    f"Start with {top['name']}, who spent £{top['spend']:.2f} before going quiet. "
    f"Winning back the top five could be worth up to £{at_stake:.2f} a month if they buy as they used to. "
    f"Some won't come back, so treat that as a ceiling, not a forecast."
)
print(summary)`,
  check: `assert isinstance(globals().get("summary"), str) and summary.strip(), "Set summary to a string."
_n = int(last["lapsed"].sum())
assert str(_n) in summary, "Say how many customers are lapsed: %d." % _n
assert str(len(last)) in summary, "Say out of how many: %d customers." % len(last)
assert str(targets["name"].iloc[0]) in summary, "Name the top target: %s." % targets["name"].iloc[0]
assert any(_s in summary for _s in ["%.2f" % at_stake, "{:,.2f}".format(at_stake), "%.0f" % at_stake]), "Give at_stake as the most it could be worth a month."`,
},
];
