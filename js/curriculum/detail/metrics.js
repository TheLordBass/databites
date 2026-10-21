/* Metrics (mt-01 to mt-15): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Examples use a few numbers made on
   the spot, or a different split, never the task's answer. */

const SESSIONS = { session_id: 'one per visit', date: 'March or April 2024', channel: 'search, social, email or direct', device: 'mobile or desktop', viewed_product: 'True if they looked at a product', added_to_cart: 'True if they added one to the cart', purchased: 'True if they bought', revenue: 'what they spent, 0 if nothing' };
const SUBS = { customer_id: 'the customer', start: 'the month they started', month: 'a month they paid for', plan: 'monthly or annual', revenue: 'what they paid that month' };
const AB = { user_id: 'one per user', group: 'A or B: which checkout design they saw', device: 'mobile or desktop', converted: '1 if they bought, 0 if not', revenue: 'what they spent, 0 if nothing' };
const GOT_SESSIONS = ['`sessions` has one row per visit to the online shop, 3,000 visits:', SESSIONS];
const GOT_SUBS = ['`subs` has one row for each month a subscriber paid, July 2023 to December 2024:', SUBS];
const GOT_AB = ['`ab_test` has one row per user in a checkout experiment, 4,000 users:', AB];

export const METRICS_DETAIL = {
'mt-01': {
  explain: [
    'A **metric** is a number with an exact definition, written down so everyone counts it the same way.',
    'Here, "conversion rate" means visits that ended in a purchase, divided by all visits.',
    'Change the definition, to purchases ÷ visitors, or ÷ product views, and you get a different number. That\'s why you write it down.',
    'True counts as 1 and False as 0, so `.sum()` of a True/False column counts the Trues.',
    'And `.mean()` gives the share that are True, which here is the conversion rate.',
  ],
  example: {
    say: 'Here five visits, two of which clicked, are counted and turned into a rate.',
    code: `clicked = pd.Series([True, False, False, True, False])
print(clicked.sum(), len(clicked), clicked.mean())`,
    lines: [
      ['clicked.sum()', '2: each True counts as 1.'],
      ['len(clicked)', '5 visits in all.'],
      ['clicked.mean()', '0.4: the share that clicked.'],
    ],
  },
  brief: {
    story: 'The new head of e-commerce wants the shop\'s conversion rate, defined as purchases ÷ visits.',
    get: [GOT_SESSIONS],
    want: ['`visits`: how many sessions', '`purchases`: how many ended in a purchase', '`conversion`: purchases ÷ visits, rounded to 4 places'],
    out: 'Two counts and a rate.',
  },
},
'mt-02': {
  explain: [
    'A **funnel** counts how many people make it to each step: visit, view a product, add to cart, buy.',
    'Each step can only lose people, never gain them.',
    '`pd.Series({...})` builds a labelled list of numbers, one per step, in the order you write them.',
    'Each `"name": number` pair becomes one labelled value.',
    'Read it top to bottom. It shows you where the biggest crowd gives up, which is where a fix pays off most.',
  ],
  example: {
    say: 'Here a poster campaign is laid out as a funnel.',
    code: `steps = pd.Series({"saw poster": 200, "came in": 60, "ordered": 45})
steps`,
    lines: [
      ['pd.Series({...})', 'three labelled numbers, in the order written.'],
      ['the shape', 'the biggest drop is from seeing the poster to coming in.'],
    ],
  },
  brief: {
    story: 'The e-commerce team wants to see the whole shopping journey in four numbers.',
    get: [GOT_SESSIONS],
    want: ['Make `funnel`: a Series with the counts for `sessions` (all visits), `viewed`, `cart` and `bought`, in that order'],
    out: 'Four labelled numbers, each smaller than the one above.',
  },
},
'mt-03': {
  explain: [
    'Each step\'s **step rate** is the share of the step before that made it through: carts ÷ views, and so on.',
    '`funnel.shift(1)` slides every value down one place, so each step sits next to the one above it.',
    '`funnel / funnel.shift(1)` divides every step by the one above it, all at once.',
    'The first step has nothing above it, so it comes out blank (NaN).',
    'The lowest step rate is your leakiest step, and `.idxmin()` gives you its name.',
  ],
  example: {
    say: 'Here the poster funnel gets a step rate for each step, and the leakiest one is named.',
    code: `steps = pd.Series({"saw poster": 200, "came in": 60, "ordered": 45})
rates = steps / steps.shift(1)
print(rates)
print(rates.idxmin())`,
    lines: [
      ['steps / steps.shift(1)', '60 ÷ 200 = 0.3 came in, and 45 ÷ 60 = 0.75 of those ordered.'],
      ['rates.idxmin()', 'the step with the lowest rate: came in.'],
    ],
  },
  brief: {
    story: 'The team can only fix one step this quarter, and wants to know which is leaking most.',
    get: [GOT_SESSIONS, ['The starter builds `funnel`.']],
    want: ['`step_rate`: each step divided by the step before, rounded to 3', '`leakiest`: the name of the step with the lowest rate'],
    out: 'Four rates (the first blank) and a step name.',
  },
},
'mt-04': {
  explain: [
    'One average hides a lot. Split conversion by where the visit came from: search, social, email or direct.',
    '`.agg(["count", "mean"])` gives two numbers per group at once: how many, and the share.',
    'Always show the count next to the rate. A channel converting brilliantly on 12 visits proves very little.',
    'Rename the columns so the result explains itself, then sort.',
    'Email visitors already know the shop, which is why email tends to convert best.',
  ],
  example: {
    say: 'Here conversion is split by device, with the count next to it.',
    code: `sessions.groupby("device")["purchased"].agg(["count", "mean"]).round(3)`,
    lines: [
      ['groupby("device")', 'one row per device.'],
      ['agg(["count", "mean"])', 'how many visits, and the share that bought.'],
    ],
  },
  brief: {
    story: 'Marketing has to split next month\'s budget between channels.',
    get: [GOT_SESSIONS],
    want: ['`by_channel`: one row per channel', '`sessions`: how many visits', '`conversion`: the share that bought, rounded to 3', 'Best conversion first'],
    out: 'Four rows, two columns.',
  },
},
'mt-05': {
  explain: [
    '**Average order value** (AOV) is revenue ÷ purchases: what a buyer spends.',
    '**Revenue per visit** is revenue ÷ all visits, buyers or not.',
    'They fit together exactly: revenue per visit = conversion rate × average order value.',
    'So there are two levers you can pull: more buyers, or bigger baskets.',
    'Teams often watch revenue per visit, because it moves when either lever does.',
  ],
  example: {
    say: 'Here 200 visits bring 10 buyers and £300 in revenue.',
    code: `revenue, buyers, visits = 300, 10, 200
aov = revenue / buyers
per_visit = revenue / visits
print(aov, per_visit, (buyers / visits) * aov)`,
    lines: [
      ['aov', '30 per buyer.'],
      ['per_visit', '1.5 per visit.'],
      ['(buyers / visits) * aov', 'conversion × AOV is 0.05 × 30: the same 1.5.'],
    ],
  },
  brief: {
    story: 'Finance asks what an average buyer spends, and what an average visit is worth.',
    get: [GOT_SESSIONS],
    want: ['`aov`: revenue per purchase, rounded to 2', '`per_visit`: revenue per session, rounded to 2'],
    out: 'Two amounts.',
  },
},
'mt-06': {
  explain: [
    '`subs` is a coffee subscription, with one row for each month a customer paid. Someone who stayed five months has five rows.',
    'So counting rows counts paid months, not customers.',
    '`.nunique()` counts the different values, so `groupby("month")["customer_id"].nunique()` is the number of different customers in each month.',
    'Active customers is the base for nearly every subscription number.',
    'Churn, retention and revenue per customer all divide by it.',
  ],
  example: {
    say: 'Here are the different customers on each plan, each counted once.',
    code: `print(len(subs), "paid months")
subs.groupby("plan")["customer_id"].nunique()`,
    lines: [
      ['len(subs)', 'every row: a paid month.'],
      ['.nunique()', 'each customer counted once per plan, however many months they paid.'],
    ],
  },
  brief: {
    story: 'The subscription manager wants to know how many customers were paying each month, and when the peak was.',
    get: [GOT_SUBS],
    want: ['`active`: how many different customers were active in each month', '`peak_month`: the month with the most'],
    out: 'A count per month, and one month.',
  },
},
'mt-07': {
  explain: [
    'A customer has **churned** once their last paid month has passed.',
    'The data runs to December 2024, so anyone whose last month is earlier than that has left.',
    '`subs.groupby("customer_id")["month"].max()` is each customer\'s last month, and `.value_counts()` then counts how many left in each month.',
    '**Monthly churn rate** = customers who left that month ÷ customers active that month.',
    'Churn decides how long customers stick around, so lower is better.',
  ],
  example: {
    say: 'Here three customers\' paid months give each one\'s last month, then a count per month.',
    code: `paid = pd.DataFrame({"customer": [1, 1, 2, 2, 2, 3], "month": [1, 2, 1, 2, 3, 1]})
last = paid.groupby("customer")["month"].max()
print(last)
last.value_counts().sort_index()`,
    lines: [
      ['groupby("customer")["month"].max()', 'each customer\'s last month: 2, 3 and 1.'],
      ['value_counts().sort_index()', 'one customer finished in each of months 1, 2 and 3.'],
    ],
  },
  brief: {
    story: 'The board wants a monthly churn rate, to see whether it is getting better.',
    get: [GOT_SUBS, ['The starter makes `active`: customers active in each month.']],
    want: ['`left`: how many customers had their last month in each month before December 2024', '`churn_rate`: left ÷ active for each of those months, rounded to 3'],
    out: 'A count and a rate per month.',
  },
},
'mt-08': {
  explain: [
    'A **retention curve** shows the share of customers still paying 1, 2, 3 months after they started.',
    'It starts at 100% and falls.',
    'A customer\'s **age** in a given month is how many months after their start it is: (years apart) × 12 + (months apart).',
    'Compare like with like. Customers who started by December 2023 have all had at least 12 months to stay or go.',
    'Divide the customers active at each age by the number who started.',
  ],
  example: {
    say: 'Here\'s the age, in months, of a customer who started in November 2023, as of February 2024.',
    code: `start = pd.Timestamp("2023-11-01")
month = pd.Timestamp("2024-02-01")
(month.year - start.year) * 12 + (month.month - start.month)`,
    lines: [
      ['(month.year - start.year) * 12', 'one year apart: 12 months.'],
      ['(month.month - start.month)', '2 − 11 = −9. Together, 12 − 9 = 3 months.'],
    ],
  },
  brief: {
    story: 'The product team wants to know how quickly new subscribers drop off.',
    get: [GOT_SUBS, ['The starter adds `age` to a copy of `subs`, as `s`.']],
    want: ['Use the customers who started by December 2023', '`retention`: for ages 0 to 12, the share of them still active, rounded to 3'],
    out: '13 shares, starting at 1.0 and falling.',
  },
},
'mt-09': {
  explain: [
    '**Lifetime value** (LTV) is the money a customer brings in over their whole time with you.',
    'The simplest honest version: add up what each customer paid, then average those totals.',
    'Split it by plan. Annual subscribers pay less a month, but stay far longer.',
    'Customers who are still subscribed will pay more yet, so this undercounts a little.',
    'A quick forward-looking estimate is monthly revenue ÷ monthly churn rate.',
  ],
  example: {
    say: 'Here three customers\' payments are added up per customer, then averaged.',
    code: `paid = pd.DataFrame({"customer": [1, 1, 1, 2, 3, 3], "revenue": [18, 18, 18, 18, 15, 15]})
per = paid.groupby("customer")["revenue"].sum()
print(per)
print(per.mean())`,
    lines: [
      ['groupby("customer")["revenue"].sum()', 'each customer\'s total: 54, 18 and 30.'],
      ['per.mean()', 'the average customer is worth 34.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know how much they can spend to win a customer on each plan.',
    get: [GOT_SUBS],
    want: ['`ltv`: the average total paid per customer, for each plan, rounded to 2'],
    out: 'Two amounts: monthly and annual.',
  },
},
'mt-10': {
  explain: [
    'Revenue = customers × orders per customer × average order value.',
    'So when revenue moves, one of those three moved it.',
    'That\'s a **metric tree**: the top number split into parts that teams can actually act on.',
    'Marketing chases more customers, while the product team chases bigger baskets.',
    'Work out each part per month, and multiplying them back together gives the revenue exactly.',
  ],
  example: {
    say: 'Here three parts multiply back to a revenue.',
    code: `customers, per_customer, aov = 50, 1.2, 30
print(customers * per_customer, "orders")
print(customers * per_customer * aov, "revenue")`,
    lines: [
      ['customers * per_customer', '50 customers each ordering 1.2 times: 60 orders.'],
      ['× aov', '60 orders at 30 each: 1,800.'],
    ],
  },
  brief: {
    story: 'Revenue dipped in one month, and the board wants to know which part moved.',
    get: [["The shop's tables are loaded. The starter makes `ok`: one row per order that wasn't cancelled, with its `month` and `amount`."]],
    want: ['`tree`: one row per month with `customers` (different buyers), `orders` and `revenue`', '`per_customer`: orders ÷ customers', '`aov`: revenue ÷ orders'],
    out: 'One row per month, five columns.',
  },
},
'mt-11': {
  explain: [
    'An **A/B test** shows each user one of two versions, here checkout design A or B, half and half.',
    'Before reading any results, check the groups came out the size they should.',
    '`chisquare(counts)` from `scipy.stats` asks: if the split really were 50/50, how unlikely would counts like these be?',
    'A tiny p-value means the split itself is broken, a **sample ratio mismatch**, and none of the results can be trusted.',
    'Teams use a strict line, p < 0.001, because they check every single test.',
  ],
  example: {
    say: 'Here two splits of 1,000 users are checked: one slightly off, one well off.',
    code: `from scipy.stats import chisquare
print(round(chisquare([510, 490]).pvalue, 3))
print(chisquare([560, 440]).pvalue)`,
    lines: [
      ['[510, 490]', 'a little uneven, as luck makes: p is high, fine.'],
      ['[560, 440]', 'too uneven for luck: p is tiny, so something broke the split.'],
    ],
  },
  brief: {
    story: 'The checkout test has finished. Before anyone looks at results, the analyst checks the split.',
    get: [GOT_AB],
    want: ['`counts`: users in each group, A then B', '`split_p`: the chisquare p-value', '`split_ok`: True when split_p is 0.001 or more'],
    out: 'Two counts, a p-value and True or False.',
  },
},
'mt-12': {
  explain: [
    '**Lift** is how much better B did: B\'s conversion minus A\'s.',
    'Relative lift divides that by A\'s, so you can say "B converted 14% more".',
    'One test is one sample, so the lift comes with uncertainty.',
    'Its standard error is √(pa(1 − pa) ÷ na + pb(1 − pb) ÷ nb).',
    'Lift ± 1.96 standard errors is a **95% interval**. If it crosses zero, the data can\'t rule out there being no difference at all.',
  ],
  example: {
    say: 'Here 10% against 12%, with 1,000 users each, gets an interval.',
    code: `pa, pb, n = 0.10, 0.12, 1000
se = np.sqrt(pa * (1 - pa) / n + pb * (1 - pb) / n)
lift = pb - pa
print(round(lift, 3), round(lift - 1.96 * se, 4), round(lift + 1.96 * se, 4))`,
    lines: [
      ['lift', 'two percentage points: 0.02.'],
      ['the interval', 'from just below 0 to about 0.05: it crosses zero, so this is not settled.'],
    ],
  },
  brief: {
    story: 'The designer says B is better. The analyst wants to know by how much, with an honest range.',
    get: [GOT_AB, ['The starter sets `pa`, `pb` (each group\'s conversion) and `na`, `nb` (its users).']],
    want: ['`lift`: B minus A conversion', '`low` and `high`: lift minus and plus 1.96 standard errors', 'All three rounded to 4'],
    out: 'A lift and an interval around it.',
  },
},
'mt-13': {
  explain: [
    '`proportions_ztest(successes, totals)` from `statsmodels.stats.proportion` tests whether two conversion rates differ by more than chance would explain.',
    'It hands back two things: the z statistic and the p-value.',
    'If p is above 0.05, call it **inconclusive**, not "no effect".',
    'The interval from the last lesson shows why: slightly worse and much better both fit the data.',
    'The cure is more users, not a different test. Work out how many you need before you start.',
  ],
  example: {
    say: 'Here 100 out of 1,000 against 120 out of 1,000 is tested.',
    code: `from statsmodels.stats.proportion import proportions_ztest
z, p = proportions_ztest([100, 120], [1000, 1000])
print(round(z, 2), round(p, 3))`,
    lines: [
      ['proportions_ztest([100, 120], [1000, 1000])', 'the buyers in each group, then the users in each.'],
      ['p', 'above 0.05: inconclusive, though B looked better.'],
    ],
  },
  brief: {
    story: 'The test is over. The product lead wants a clear call: ship B, or keep testing.',
    get: [GOT_AB, ['The starter makes `g`: purchases, users and conversion per group.']],
    want: ['`p_value` from `proportions_ztest`, given the purchases and users in each group', '`decision`: "ship" if p_value is under 0.05, otherwise "inconclusive"'],
    out: 'A p-value and a word.',
  },
},
'mt-14': {
  explain: [
    'A **guardrail** is a number that mustn\'t get worse, even when the main one improves: refunds, page speed, or revenue.',
    'A design could win more buyers and still shrink their baskets.',
    'Revenue per user counts the non-buyers as £0, so it catches both changes at once.',
    '`ttest_ind(b, a, equal_var=False)` from `scipy.stats` is a Welch t-test. It compares two averages without assuming they\'re equally spread.',
    'A guardrail passes when it hasn\'t clearly got worse.',
  ],
  example: {
    say: 'Here five users per group either spent something or nothing.',
    code: `from scipy.stats import ttest_ind
a = [0, 0, 20, 0, 30]
b = [0, 25, 0, 35, 0]
print(np.mean(a), np.mean(b))
print(round(ttest_ind(b, a, equal_var=False).pvalue, 3))`,
    lines: [
      ['np.mean', 'revenue per user, zeros included: £10 against £12.'],
      ['the p-value', 'large: with this little data the groups can\'t be told apart.'],
    ],
  },
  brief: {
    story: 'Design B wins more buyers. Finance wants to be sure it isn\'t losing money per user.',
    get: [GOT_AB],
    want: ['`per_user`: the average revenue per user in each group, rounded to 3', "`guard_p`: the Welch t-test p-value comparing B's revenue with A's"],
    out: 'Two averages and a p-value.',
  },
},
'mt-15': {
  explain: [
    'Before deciding, check the lift points the same way in each big segment.',
    'If B wins overall but loses on mobile, find out why first.',
    'A pivot of conversion, with devices down the side and groups across the top, shows it at a glance.',
    'B minus A in each row is that segment\'s lift.',
    'The same direction everywhere makes a result easier to believe. Mixed directions can even flip the overall result.',
  ],
  example: {
    say: 'Here the shop\'s visits are split two ways at once: conversion by device and by channel.',
    code: `sessions.pivot_table(index="device", columns="channel", values="purchased", aggfunc="mean").round(3)`,
    lines: [
      ['index="device", columns="channel"', 'devices down the side, channels across.'],
      ['aggfunc="mean"', 'each cell is the share that bought.'],
    ],
  },
  brief: {
    story: 'Before shipping B, the product lead asks whether it wins on mobile and desktop alike.',
    get: [GOT_AB],
    want: ['`by_device`: conversion by device (rows) and group (columns)', 'A `lift` column: B minus A', '`same_way`: True if the lift is above 0 on every device'],
    out: 'Two rows, three columns, and True or False.',
  },
},
};
