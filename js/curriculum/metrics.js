/* Business metrics and A/B tests — the numbers companies are run on.
   Funnels and value per visit on `sessions`; retention, churn and lifetime
   value on `subs`; a metric tree on the shop; then an experiment, `ab_test`,
   read the way an experimentation team would. The statistics track has
   the theory (t-tests, sample size, peeking); this track uses it. */

const SCIPY = ['scipy'];

const FUNNEL = `funnel = pd.Series({
    "sessions": len(sessions),
    "viewed": int(sessions["viewed_product"].sum()),
    "cart": int(sessions["added_to_cart"].sum()),
    "bought": int(sessions["purchased"].sum()),
})`;

const ACTIVE = `active = subs.groupby("month")["customer_id"].nunique()`;

const RATES = `g = ab_test.groupby("group")["converted"].agg(["sum", "count", "mean"])
pa, pb = g.loc["A", "mean"], g.loc["B", "mean"]
na, nb = g.loc["A", "count"], g.loc["B", "count"]`;

export const METRICS = [

/* ── Measuring a business ──────────────────────────────── */
{
  id: 'mt-01', mins: 3,
  title: 'Define it before you count it',
  concept: [
    'A **metric** is a number with an exact definition. "Conversion rate" here means: visits that ended in a purchase, divided by all visits.',
    '`sessions` has one row per visit to the online shop, with True or False for how far it got: `viewed_product`, `added_to_cart`, `purchased`.',
    'The mean of a True/False column is the share that are True, so `sessions["purchased"].mean()` is the conversion rate.',
  ],
  starter: `sessions.head()`,
  task: 'Set `visits` (how many sessions), `purchases` (how many ended in a purchase) and `conversion` (purchases ÷ visits, rounded to 4 places).',
  hint: '`visits = len(sessions)`, `purchases = int(sessions["purchased"].sum())`, then `conversion = round(purchases / visits, 4)`.',
  solution: `visits = len(sessions)
purchases = int(sessions["purchased"].sum())
conversion = round(purchases / visits, 4)

visits, purchases, conversion`,
  check: `assert int(globals().get("visits", -1)) == len(sessions), "visits is how many sessions there are: len(sessions)."
assert int(globals().get("purchases", -1)) == int(sessions["purchased"].sum()), "purchases counts the sessions where purchased is True."
assert abs(float(conversion) - round(sessions["purchased"].mean(), 4)) < 1e-9, "conversion is purchases ÷ visits, rounded to 4 places."`,
},
{
  id: 'mt-02', mins: 3,
  title: 'The funnel',
  concept: [
    'A **funnel** counts how many get to each step: visit, view a product, add to cart, buy. Each step can only lose people.',
    '`pd.Series({...})` builds a labelled list of numbers, one per step, in the order you write them.',
    'Read it top to bottom. It shows where the biggest crowd gives up, which is where a fix pays most.',
  ],
  starter: `sessions[["viewed_product", "added_to_cart", "purchased"]].sum()`,
  task: 'Make `funnel`: a Series with the counts for `sessions` (all visits), `viewed`, `cart` and `bought`, in that order.',
  hint: '`pd.Series({"sessions": len(sessions), "viewed": int(sessions["viewed_product"].sum()), ...})`, carrying on for cart and bought.',
  solution: `${FUNNEL}

funnel`,
  check: `assert isinstance(globals().get("funnel"), pd.Series), "Make funnel a pandas Series."
assert list(funnel.index) == ["sessions", "viewed", "cart", "bought"], "The steps, in order: sessions, viewed, cart, bought."
_want = [len(sessions), int(sessions["viewed_product"].sum()), int(sessions["added_to_cart"].sum()), int(sessions["purchased"].sum())]
assert [int(v) for v in funnel] == _want, "Each step is a count: all sessions, then the True counts of viewed_product, added_to_cart and purchased."`,
},
{
  id: 'mt-03', mins: 3,
  title: 'Where they drop out',
  concept: [
    "Each step's **step rate** is the share of the step before that made it through: carts ÷ views, and so on.",
    '`funnel / funnel.shift(1)` divides every step by the one above it, all at once. The first step has nothing above it, so it comes out blank.',
    'The lowest step rate is the leakiest step: the place to look first.',
  ],
  starter: `${FUNNEL}
funnel`,
  task: 'Make `step_rate`: each step divided by the step before, rounded to 3. Then set `leakiest`: the name of the step with the lowest rate.',
  hint: '`step_rate = (funnel / funnel.shift(1)).round(3)`, then `leakiest = step_rate.idxmin()`. idxmin skips the blank first step.',
  solution: `${FUNNEL}
step_rate = (funnel / funnel.shift(1)).round(3)
leakiest = step_rate.idxmin()

step_rate`,
  check: `${FUNNEL.replace(/funnel/g, '_f')}
_r = (_f / _f.shift(1)).round(3)
assert isinstance(globals().get("step_rate"), pd.Series) and list(step_rate.index) == list(_f.index), "step_rate has one value per step, in funnel order."
assert np.allclose(step_rate.iloc[1:].astype(float), _r.iloc[1:].astype(float)), "Each step rate is that step divided by the one before: funnel / funnel.shift(1)."
assert globals().get("leakiest") == _r.idxmin(), "leakiest is the step with the lowest rate: step_rate.idxmin()."`,
},
{
  id: 'mt-04', mins: 4,
  title: 'Which channel converts?',
  concept: [
    'One average hides a lot. Split conversion by where the visit came from: search, social, email or direct.',
    'Always show the count beside the rate. A channel converting brilliantly on 12 visits proves very little.',
    'Email visitors already know the shop, which is why email tends to convert best.',
  ],
  starter: `sessions.groupby("channel")["purchased"].mean()`,
  task: 'Make `by_channel`: one row per channel with `sessions` (how many visits) and `conversion` (the share that bought, rounded to 3), best conversion first.',
  hint: '`sessions.groupby("channel").agg(sessions=("session_id", "size"), conversion=("purchased", "mean")).round(3)`, then `.sort_values("conversion", ascending=False)`.',
  solution: `by_channel = (sessions.groupby("channel")
              .agg(sessions=("session_id", "size"), conversion=("purchased", "mean"))
              .round(3)
              .sort_values("conversion", ascending=False))

by_channel`,
  check: `_b = sessions.groupby("channel").agg(sessions=("session_id", "size"), conversion=("purchased", "mean")).round(3).sort_values("conversion", ascending=False)
assert "by_channel" in globals() and {"sessions", "conversion"} <= set(by_channel.columns), "by_channel needs sessions and conversion columns."
assert list(by_channel.index) == list(_b.index), "One row per channel, best conversion first."
assert list(by_channel["sessions"].astype(int)) == list(_b["sessions"]) and np.allclose(by_channel["conversion"], _b["conversion"]), "sessions counts the visits and conversion is the share that bought, rounded to 3."`,
},
{
  id: 'mt-05', mins: 4,
  title: 'Value per visit',
  concept: [
    '**Average order value** (AOV) is revenue divided by purchases. **Revenue per visit** is revenue divided by all visits, buyers or not.',
    'They fit together exactly: revenue per visit = conversion rate × average order value. More buyers, or bigger baskets: two different levers.',
    'Teams often watch revenue per visit, because it moves when either lever does.',
  ],
  starter: `sessions["revenue"].sum()`,
  task: 'Set `aov` (revenue per purchase) and `per_visit` (revenue per session), both rounded to 2.',
  hint: '`aov = round(sessions["revenue"].sum() / sessions["purchased"].sum(), 2)` and `per_visit = round(sessions["revenue"].mean(), 2)`.',
  solution: `aov = round(sessions["revenue"].sum() / sessions["purchased"].sum(), 2)
per_visit = round(sessions["revenue"].mean(), 2)
conversion = sessions["purchased"].mean()

print("revenue per visit:", per_visit)
print("conversion x AOV:", round(conversion * aov, 2))`,
  check: `assert abs(float(globals().get("aov", 0)) - round(sessions["revenue"].sum() / sessions["purchased"].sum(), 2)) < 0.006, "aov is all the revenue divided by the number of purchases, rounded to 2."
assert abs(float(globals().get("per_visit", 0)) - round(sessions["revenue"].mean(), 2)) < 0.006, "per_visit is all the revenue divided by all the sessions, rounded to 2."`,
},

/* ── Keeping customers ─────────────────────────────────── */
{
  id: 'mt-06', mins: 3,
  title: 'Active customers each month',
  concept: [
    '`subs` is a coffee subscription: one row for each month a customer paid. Someone who stayed five months has five rows.',
    '`subs.groupby("month")["customer_id"].nunique()` counts the different customers active in each month.',
    'Active customers is the base for nearly every subscription number: churn, retention and revenue per customer all divide by it.',
  ],
  starter: `subs.head()`,
  task: 'Make `active`: how many different customers were active in each month. Then set `peak_month`: the month with the most.',
  hint: '`active = subs.groupby("month")["customer_id"].nunique()` and `peak_month = active.idxmax()`.',
  solution: `${ACTIVE}
peak_month = active.idxmax()

active.tail(), peak_month`,
  check: `_a = subs.groupby("month")["customer_id"].nunique()
assert isinstance(globals().get("active"), pd.Series) and len(active) == len(_a), "active has one count per month."
assert list(active.astype(int)) == list(_a), "Count different customers per month: nunique, not size."
assert pd.Timestamp(globals().get("peak_month")) == _a.idxmax(), "peak_month is the month with the most active customers: active.idxmax()."`,
},
{
  id: 'mt-07', mins: 4,
  title: 'Churn: who left this month?',
  concept: [
    "A customer has **churned** after their last paid month. The data runs to December 2024, so anyone whose last month is earlier has left.",
    '`subs.groupby("customer_id")["month"].max()` is each customer\'s last month. `value_counts()` then counts how many left in each month.',
    '**Monthly churn rate** = customers who left that month ÷ customers active that month. It decides how long customers stay, so lower is better.',
  ],
  starter: `${ACTIVE}
active.tail()`,
  task: 'Make `left`: how many customers had their last month in each month before December 2024. Then make `churn_rate`: left ÷ active for each of those months, rounded to 3.',
  hint: '`last = subs.groupby("customer_id")["month"].max()`, then `left = last[last < "2024-12-01"].value_counts().sort_index()`, and `churn_rate = (left / active).dropna().round(3)`.',
  solution: `${ACTIVE}
last = subs.groupby("customer_id")["month"].max()
left = last[last < "2024-12-01"].value_counts().sort_index()
churn_rate = (left / active).dropna().round(3)

churn_rate.tail()`,
  check: `_a = subs.groupby("month")["customer_id"].nunique()
_l = subs.groupby("customer_id")["month"].max()
_left = _l[_l < "2024-12-01"].value_counts().sort_index()
_c = (_left / _a).dropna().round(3)
assert isinstance(globals().get("left"), pd.Series) and int(left.sum()) == int(_left.sum()), "left counts each customer once, in their last month, for last months before December 2024."
assert isinstance(globals().get("churn_rate"), pd.Series) and len(churn_rate) == len(_c), "One churn rate per month that had leavers, December 2024 left out."
assert np.allclose(churn_rate.sort_index().astype(float), _c.astype(float)), "churn_rate is left ÷ active for each month, rounded to 3."`,
},
{
  id: 'mt-08', mins: 5,
  title: 'How many are still here?',
  concept: [
    'A **retention curve** shows the share of customers still paying 1, 2, 3 months after they started. It starts at 100% and falls.',
    "A customer's **age** in a month is how many months after their start it is: (years apart) × 12 + (months apart).",
    'Compare like with like: customers who started by December 2023 have all had at least 12 months to stay or go.',
  ],
  starter: `s = subs.copy()
s["age"] = (s["month"].dt.year - s["start"].dt.year) * 12 + (s["month"].dt.month - s["start"].dt.month)
s.head()`,
  task: 'Using the customers who started by December 2023, make `retention`: for ages 0 to 12, the share of them still active, rounded to 3.',
  hint: '`early = s[s["start"] <= "2023-12-01"]`, then `early.groupby("age")["customer_id"].nunique() / early["customer_id"].nunique()`, then `.loc[0:12].round(3)`.',
  solution: `s = subs.copy()
s["age"] = (s["month"].dt.year - s["start"].dt.year) * 12 + (s["month"].dt.month - s["start"].dt.month)
early = s[s["start"] <= "2023-12-01"]
retention = (early.groupby("age")["customer_id"].nunique() / early["customer_id"].nunique()).loc[0:12].round(3)

retention`,
  check: `_s = subs.copy()
_s["age"] = (_s["month"].dt.year - _s["start"].dt.year) * 12 + (_s["month"].dt.month - _s["start"].dt.month)
_e = _s[_s["start"] <= "2023-12-01"]
_r = (_e.groupby("age")["customer_id"].nunique() / _e["customer_id"].nunique()).loc[0:12].round(3)
assert isinstance(globals().get("retention"), pd.Series) and list(retention.index) == list(range(13)), "retention has ages 0 to 12: .loc[0:12]."
assert float(retention.iloc[0]) == 1.0, "Everyone is there at age 0, so the curve starts at 1. Divide by the early starters' count."
assert np.allclose(retention.astype(float), _r.astype(float)), "Each value is the share of the early starters still active at that age, rounded to 3."`,
},
{
  id: 'mt-09', mins: 4,
  title: 'What a customer is worth',
  concept: [
    '**Lifetime value** (LTV) is the money a customer brings in over their whole time with you. The simplest honest version: add up what each customer paid, then average.',
    'Split it by plan. Annual subscribers pay less a month but stay far longer.',
    'Customers still subscribed will pay more yet, so this undercounts. A quick forward-looking estimate is monthly revenue ÷ monthly churn rate.',
  ],
  starter: `subs.groupby("plan")["revenue"].sum()`,
  task: 'Make `ltv`: the average total paid per customer, for each plan, rounded to 2.',
  hint: 'Total per customer first, then average per plan: `subs.groupby(["plan", "customer_id"])["revenue"].sum().groupby("plan").mean().round(2)`.',
  solution: `ltv = subs.groupby(["plan", "customer_id"])["revenue"].sum().groupby("plan").mean().round(2)

ltv`,
  check: `_v = subs.groupby(["plan", "customer_id"])["revenue"].sum().groupby("plan").mean().round(2)
assert isinstance(globals().get("ltv"), pd.Series) and set(ltv.index) == set(_v.index), "ltv has one value per plan."
assert all(abs(float(ltv[k]) - float(_v[k])) < 0.006 for k in _v.index), "Add up each customer's payments first, then average those totals within each plan."`,
},
{
  id: 'mt-10', mins: 5,
  title: 'Break revenue into parts',
  concept: [
    'Revenue = customers × orders per customer × average order value. When revenue moves, one of the three moved it.',
    'That is a **metric tree**: the top number split into parts teams can act on. Marketing chases customers; the product team chases basket size.',
    'Work out each part per month, and multiplying them back together gives the revenue exactly.',
  ],
  starter: `ok = orders[orders["status"] != "cancelled"].copy()
ok["month"] = ok["order_date"].dt.to_period("M")
value = order_items.merge(products, on="product_id")
value["amount"] = value["qty"] * value["price"]
ok = ok.merge(value.groupby("order_id")["amount"].sum().rename("amount"), on="order_id")
ok.head()`,
  task: 'Make `tree`: one row per month with `customers` (different buyers), `orders` and `revenue`, then add `per_customer` (orders ÷ customers) and `aov` (revenue ÷ orders).',
  hint: '`ok.groupby("month").agg(customers=("customer_id", "nunique"), orders=("order_id", "nunique"), revenue=("amount", "sum"))`, then divide for the last two columns.',
  solution: `ok = orders[orders["status"] != "cancelled"].copy()
ok["month"] = ok["order_date"].dt.to_period("M")
value = order_items.merge(products, on="product_id")
value["amount"] = value["qty"] * value["price"]
ok = ok.merge(value.groupby("order_id")["amount"].sum().rename("amount"), on="order_id")
tree = ok.groupby("month").agg(customers=("customer_id", "nunique"),
                               orders=("order_id", "nunique"),
                               revenue=("amount", "sum"))
tree["per_customer"] = tree["orders"] / tree["customers"]
tree["aov"] = tree["revenue"] / tree["orders"]

tree.round(2)`,
  check: `for _c in ["customers", "orders", "revenue", "per_customer", "aov"]:
    assert _c in tree.columns, "tree needs a column called %s." % _c
_ok = orders[orders["status"] != "cancelled"]
assert int(tree["orders"].sum()) == len(_ok), "orders counts the orders that went through, each once."
assert np.allclose(tree["customers"] * tree["per_customer"] * tree["aov"], tree["revenue"]), "customers × per_customer × aov should give back the revenue: per_customer is orders ÷ customers, aov is revenue ÷ orders."
_li = order_items.merge(products, on="product_id").merge(_ok, on="order_id")
assert abs(float(tree["revenue"].sum()) - float((_li["qty"] * _li["price"]).sum())) < 0.01, "revenue adds up qty × price for the orders that went through."`,
},

/* ── Running experiments ───────────────────────────────── */
{
  id: 'mt-11', mins: 4, needs: SCIPY,
  title: 'Check the split first',
  concept: [
    "`ab_test` is an experiment: each user saw checkout design A or B, half and half. Before reading any results, check the groups came out the size they should.",
    '`chisquare(counts)` from `scipy.stats` asks: if the split were truly 50/50, how unlikely are counts like these? It gives a p-value.',
    'A tiny p-value means the split itself is broken, a **sample ratio mismatch**, and none of the results can be trusted. Teams use a strict line, p < 0.001, because they check every test.',
  ],
  starter: `ab_test["group"].value_counts()`,
  task: 'Make `counts` (users in each group, A then B) and set `split_p`, the chisquare p-value for them. Then set `split_ok`: True when split_p is 0.001 or more.',
  hint: '`from scipy.stats import chisquare`, `counts = ab_test["group"].value_counts().sort_index()`, `split_p = chisquare(counts).pvalue`, `split_ok = split_p >= 0.001`.',
  solution: `from scipy.stats import chisquare

counts = ab_test["group"].value_counts().sort_index()
split_p = chisquare(counts).pvalue
split_ok = split_p >= 0.001

counts, round(split_p, 3), split_ok`,
  check: `from scipy.stats import chisquare as _chi
_n = ab_test["group"].value_counts().sort_index()
assert list(globals().get("counts", pd.Series(dtype=int)).astype(int)) == list(_n), "counts is the users in each group, A then B: value_counts().sort_index()."
assert abs(float(split_p) - float(_chi(_n).pvalue)) < 1e-9, "split_p is chisquare(counts).pvalue."
assert bool(split_ok) == bool(_chi(_n).pvalue >= 0.001), "split_ok is True when split_p is 0.001 or more."`,
},
{
  id: 'mt-12', mins: 5,
  title: 'Lift, with an interval',
  concept: [
    "**Lift** is how much better B did: B's conversion minus A's. Relative lift divides that by A's: \"B converted 14% more\".",
    'One test is one sample, so the lift is uncertain. Its standard error is `np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)`.',
    'Lift ± 1.96 standard errors is a **95% interval**. If it crosses zero, the data cannot rule out no difference at all.',
  ],
  starter: `${RATES}
g`,
  task: 'Set `lift` (B minus A conversion), then `low` and `high`: the 95% interval, lift minus and plus 1.96 standard errors. Round all three to 4.',
  hint: '`se = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)`, `lift = round(pb - pa, 4)`, `low = round(pb - pa - 1.96 * se, 4)`, `high = round(pb - pa + 1.96 * se, 4)`.',
  solution: `${RATES}
se = np.sqrt(pa * (1 - pa) / na + pb * (1 - pb) / nb)
lift = round(pb - pa, 4)
low = round(pb - pa - 1.96 * se, 4)
high = round(pb - pa + 1.96 * se, 4)

lift, low, high`,
  check: `_g = ab_test.groupby("group")["converted"].agg(["count", "mean"])
_pa, _pb = _g.loc["A", "mean"], _g.loc["B", "mean"]
_se = np.sqrt(_pa * (1 - _pa) / _g.loc["A", "count"] + _pb * (1 - _pb) / _g.loc["B", "count"])
assert abs(float(globals().get("lift", 9)) - round(_pb - _pa, 4)) < 1e-9, "lift is B's conversion minus A's, rounded to 4."
assert abs(float(low) - round(_pb - _pa - 1.96 * _se, 4)) < 1e-9 and abs(float(high) - round(_pb - _pa + 1.96 * _se, 4)) < 1e-9, "low and high are the lift minus and plus 1.96 standard errors, rounded to 4."`,
},
{
  id: 'mt-13', mins: 4, needs: ['statsmodels'],
  title: 'Ship it, or keep going?',
  concept: [
    '`proportions_ztest(successes, totals)` from `statsmodels.stats.proportion` tests whether two conversion rates differ by more than chance would explain.',
    'If p is above 0.05, call it **inconclusive**, not "no effect". The interval from the last lesson shows why: slightly worse and much better both fit the data.',
    'The cure is more users, not a different test. Work out how many before you start (statistics: "How many do you need?").',
  ],
  starter: `${RATES}
g[["sum", "count"]]`,
  task: 'Set `p_value` from `proportions_ztest`, given the purchases and the users in each group. Then set `decision`: "ship" if p_value is under 0.05, otherwise "inconclusive".',
  hint: '`from statsmodels.stats.proportion import proportions_ztest`, then `z, p_value = proportions_ztest(g["sum"], g["count"])`, and an `if` for the decision.',
  solution: `from statsmodels.stats.proportion import proportions_ztest

${RATES}
z, p_value = proportions_ztest(g["sum"], g["count"])
decision = "ship" if p_value < 0.05 else "inconclusive"

round(p_value, 3), decision`,
  check: `from statsmodels.stats.proportion import proportions_ztest as _pz
_g = ab_test.groupby("group")["converted"].agg(["sum", "count"])
_z, _p = _pz(_g["sum"], _g["count"])
assert abs(float(globals().get("p_value", -1)) - float(_p)) < 1e-9, "p_value comes from proportions_ztest(purchases per group, users per group)."
assert globals().get("decision") == ("ship" if _p < 0.05 else "inconclusive"), "decision is 'ship' under 0.05, otherwise 'inconclusive'."`,
},
{
  id: 'mt-14', mins: 4, needs: SCIPY,
  title: 'Guardrails',
  concept: [
    'A **guardrail** is a number that must not get worse, even when the main one improves: refunds, page speed, or revenue.',
    'Revenue per user counts the non-buyers as 0, so it catches both more buyers and smaller baskets.',
    '`ttest_ind(b, a, equal_var=False)` from `scipy.stats` is a Welch t-test: it compares two averages without assuming the groups are equally spread.',
  ],
  starter: `ab_test.groupby("group")["revenue"].describe()`,
  task: "Make `per_user`: the average revenue per user in each group, rounded to 3. Then set `guard_p`: the Welch t-test p-value comparing B's revenue with A's.",
  hint: '`per_user = ab_test.groupby("group")["revenue"].mean().round(3)`, then `ttest_ind(b_revenue, a_revenue, equal_var=False).pvalue`, with each group\'s revenue picked by a mask.',
  solution: `from scipy.stats import ttest_ind

per_user = ab_test.groupby("group")["revenue"].mean().round(3)
a = ab_test.loc[ab_test["group"] == "A", "revenue"]
b = ab_test.loc[ab_test["group"] == "B", "revenue"]
guard_p = ttest_ind(b, a, equal_var=False).pvalue

per_user, round(guard_p, 3)`,
  check: `from scipy.stats import ttest_ind as _tt
_pu = ab_test.groupby("group")["revenue"].mean().round(3)
assert isinstance(globals().get("per_user"), pd.Series) and np.allclose(per_user.sort_index(), _pu), "per_user is each group's average revenue, non-buyers included, rounded to 3."
_p = _tt(ab_test.loc[ab_test["group"] == "B", "revenue"], ab_test.loc[ab_test["group"] == "A", "revenue"], equal_var=False).pvalue
assert abs(float(globals().get("guard_p", -1)) - float(_p)) < 1e-9, "guard_p is the Welch t-test (equal_var=False) on B's revenue against A's."`,
},
{
  id: 'mt-15', mins: 4,
  title: 'Does it hold in every segment?',
  concept: [
    'Before deciding, check the lift points the same way in each big segment. If B wins overall but loses on mobile, find out why first.',
    "A pivot of conversion, devices down the side and groups across the top, shows it at a glance. B minus A in each row is that segment's lift.",
    "Mixed directions can even flip the overall result (Simpson's paradox, from the analysis track). The same direction everywhere makes a result easier to believe.",
  ],
  starter: `ab_test.groupby(["device", "group"])["converted"].mean()`,
  task: 'Make `by_device`: conversion by device (rows) and group (columns), with a column `lift`: B minus A. Then set `same_way`: True if the lift is above 0 on every device.',
  hint: '`by_device = ab_test.pivot_table(index="device", columns="group", values="converted", aggfunc="mean")`, then `by_device["lift"] = by_device["B"] - by_device["A"]` and `bool((by_device["lift"] > 0).all())`.',
  solution: `by_device = ab_test.pivot_table(index="device", columns="group", values="converted", aggfunc="mean")
by_device["lift"] = by_device["B"] - by_device["A"]
same_way = bool((by_device["lift"] > 0).all())

by_device.round(4), same_way`,
  check: `_p = ab_test.pivot_table(index="device", columns="group", values="converted", aggfunc="mean")
assert "by_device" in globals() and {"A", "B", "lift"} <= set(map(str, by_device.columns)), "by_device needs columns A, B and lift."
assert set(by_device.index) == set(_p.index), "One row per device."
assert np.allclose(by_device.loc[_p.index, "lift"], _p["B"] - _p["A"]), "lift is B's conversion minus A's on each device."
assert globals().get("same_way") == bool(((_p["B"] - _p["A"]) > 0).all()), "same_way is True only if the lift is above 0 on every device."`,
},
];
