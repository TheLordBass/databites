/* Projects (pj-01 to pj-25): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Each project lesson uses one tool;
   its example shows that tool's move on a tiny table or another question. */

const SHOP = ["The shop's tables are loaded: `orders` (order_id, customer_id, order_date, status), `order_items` (order_id, product_id, qty), `products` (product_id, name, category, price), `customers` (customer_id, name, city, joined) and `cities` (city, country, population_m)."];
const MODEL = ["The shop's model is loaded: `orders`, `order_items`, `products`, `customers`, `calendar` and `cities`, linked by their ids."];
const DAYS = ['`cafe` (one row per day: date, city, drink, cups, price, revenue, rating) and `weather` (one row per day of 2024: date, temp_c, rain_mm, wind_kph) are loaded.'];
const SURVEY = ['`survey` is loaded: 32 messy answers with `Name`, `City`, `Signed Up`, `Spend (GBP)`, `Subscribed?` and `Note`, some padded with spaces.'];
const GROW = 'Where should the shop grow next?';
const WEATHER = 'Does the weather change how many cups the café sells?';
const ENGAGED = 'Which city is most engaged, and how sure can we be?';
const WINBACK = 'Which customers have stopped buying, and which are worth winning back?';

export const PROJECTS_DETAIL = {
'pj-01': {
  explain: [
    'A project starts with a question, not a function: **where should the shop grow next?** Five steps, one tool each.',
    'First, the numbers per city. The city lives on `customers`, two joins away from an order line: order_items → orders → customers.',
    'Merges can be chained, `a.merge(b, on=...).merge(c, on=...)`, each one adding more columns.',
    'Settle the awkward cases before you count. Cancelled orders don\'t count, and a customer with no city goes under `"unknown"` rather than vanishing.',
    '`.fillna("unknown")` fills the missing cities with that word.',
  ],
  example: {
    say: 'Here two merges in a row bring each order line its status and its customer\'s city.',
    code: `order_items.merge(orders, on="order_id").merge(customers, on="customer_id")[["order_id", "status", "name", "city"]].head(4)`,
    lines: [
      ['.merge(orders, on="order_id")', 'each line gets its order\'s status and customer.'],
      ['.merge(customers, on="customer_id")', 'then that customer\'s name and city.'],
    ],
  },
  brief: {
    story: `The owner asks: ${GROW} Start with the numbers for each city.`,
    get: [SHOP, ['The starter makes `lines`: order_items with price and `revenue`.']],
    want: ["Bring in each line's order and customer", 'Leave out cancelled orders', '`by_city`: one row per city with `revenue`, `customers` (different buying customers) and `orders`', 'No city? Count it as `"unknown"`'],
    out: 'One row per city, including `unknown`.',
  },
},
'pj-02': {
  explain: [
    'Two tools agreeing is how you come to trust a number. Rebuild the city table in SQL, and it should match the pandas one.',
    'Once you join to `order_items`, an order appears once for every line it has.',
    'So `COUNT(*)` would count lines. Count orders with `COUNT(DISTINCT o.order_id)` instead.',
    '`COALESCE(c.city, \'unknown\')` gives the gap a name.',
    'Group by that too, or the NULLs hang around as a separate group.',
  ],
  example: {
    say: 'Here lines and orders are counted side by side for each category, to show the difference.',
    code: `SELECT p.category,
       COUNT(*) AS lines,
       COUNT(DISTINCT oi.order_id) AS orders
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category;`,
    lines: [
      ['COUNT(*)', 'every line.'],
      ['COUNT(DISTINCT oi.order_id)', 'each order once, however many lines it has in that category.'],
    ],
  },
  brief: {
    story: 'Before the city numbers go to the owner, check them a second way, in SQL.',
    get: [SHOP],
    want: ['Leave out cancelled orders', 'Show a missing city as `unknown`', 'Add `revenue` (qty × price) and `avg_order` (revenue ÷ orders, rounded to 2)', 'Columns `city`, `orders`, `revenue`, `avg_order`, biggest revenue first'],
    out: 'The same cities and revenue as the pandas table.',
  },
},
'pj-03': {
  explain: [
    'In a Power BI report the same numbers become measures, so they give the right answer for any slice: city, month or category.',
    'Build the parts first, then divide one by the other.',
    'That way the answer stays right on every row, and on the total too.',
    'The total is all revenue ÷ all buyers, not an average of the city rows.',
    'Measures get that right for free, because each one is worked out inside its own row\'s filter.',
  ],
  example: {
    say: 'Here lines per order is built from two parts. Look at the total: it isn\'t the average of the rows.',
    code: `Lines = COUNTROWS(order_items)
Orders = DISTINCTCOUNT(order_items[order_id])
Lines Per Order = DIVIDE([Lines], [Orders])`,
    lines: [
      ['[Lines], [Orders]', 'the two parts, for whatever city is showing.'],
      ['the total row', 'all lines ÷ all orders, worked out fresh.'],
    ],
  },
  brief: {
    story: 'The dashboard needs spend per buyer for each city, for any filter the owner picks.',
    get: [MODEL, ['The starter has `Revenue` and `Net Revenue`.']],
    want: ["`Buyers`: different customers with an order that wasn't cancelled", '`Per Buyer`: Net Revenue divided by Buyers'],
    out: 'A matrix with one row per city, and a total.',
  },
},
'pj-04': {
  explain: [
    'The question is about where to grow, so chart spend **per customer**, not total revenue.',
    'Lagos is biggest mostly because it has the most customers.',
    'Every average rests on a count, so put each city\'s customer count in its label, like `Accra (5)`.',
    'Then a bar built on two people can\'t pass itself off as a trend.',
    'Sort the bars, and write what you found in the title.',
  ],
  example: {
    say: 'Here two made-up averages are labelled with their counts, and the title says what the counts reveal.',
    code: `sizes = pd.Series({"Lagos": 4.2, "Accra": 6.1})
counts = {"Lagos": 18, "Accra": 2}
labels = [f"{c} ({counts[c]})" for c in sizes.index]
plt.barh(labels, sizes.values)
plt.title("Accra looks higher, on just 2 customers")
plt.show()`,
    lines: [
      ['f"{c} ({counts[c]})"', 'each city\'s name with its count in brackets.'],
      ['plt.barh(labels, ...)', 'the bars carry those labels.'],
      ['the title', 'the finding, not the chart type.'],
    ],
  },
  brief: {
    story: `${GROW} The owner wants one chart of what a customer is worth in each city.`,
    get: [SHOP, ['The starter makes `by_city` with `revenue`, `customers` and `per_customer`.']],
    want: ['Draw `per_customer` as sorted horizontal bars', 'Label each bar with its city and customer count, like `Accra (5)`', 'Put the finding in the title'],
    out: 'One sorted bar chart.',
  },
},
'pj-05': {
  explain: [
    'A recommendation is a rule you can say out loud, applied to the numbers.',
    'Then anyone can check it, and argue with the rule rather than with you.',
    'Here the rule is: customers who already spend well (above the average per customer), in a city with at least 5 of them, then the fewest customers per million people.',
    'Combine the conditions with `&`, each in its own brackets, and `.idxmin()` finds the row with the lowest value.',
    'Kigali tops spend per customer, but on just 2 customers. Two is an anecdote, not a market.',
  ],
  example: {
    say: 'Here three towns are put through a rule like the one in the task.',
    code: `towns = pd.DataFrame({"town": ["A", "B", "C"], "spend": [50, 70, 65],
                      "customers": [12, 3, 8], "per_million": [4.0, 1.0, 2.5]})
keep = towns[(towns["spend"] > towns["spend"].mean()) & (towns["customers"] >= 5)]
print(keep)
keep.loc[keep["per_million"].idxmin(), "town"]`,
    lines: [
      ['towns["spend"] > towns["spend"].mean()', 'B and C spend above the average.'],
      ['towns["customers"] >= 5', 'but B has only 3 customers, so it goes.'],
      ['idxmin()', 'of what is left, the lowest per_million: C.'],
    ],
  },
  brief: {
    story: `${GROW} Time to make the call.`,
    get: [SHOP, ['The starter makes `by_city` with `revenue`, `customers` and each city\'s `population_m`.']],
    want: ['`per_customer` and `per_million` (customers per million people)', 'Keep cities above the overall average spend per customer, with at least 5 customers', '`pick`: the one with the lowest `per_million`'],
    out: '`pick` is one city name.',
  },
},
'pj-06': {
  explain: [
    'A new question: **does the weather change how many cups the café sells?** If it does, the café could plan staff around the forecast.',
    '`cafe` has one row per day, and so does `weather`.',
    'Joining on `date` puts each day\'s sales next to that day\'s weather.',
    'Decide what "rainy" means before you look at any results. Here, it\'s more than 1 mm.',
    'Choose afterwards, and the answer gets to pick its own definition.',
  ],
  example: {
    say: 'Here two days of sales get their weather, and a wet flag.',
    code: `sales = pd.DataFrame({"date": pd.to_datetime(["2024-01-01", "2024-01-02"]), "cups": [40, 35]})
both = sales.merge(weather[["date", "rain_mm"]], on="date")
both["wet"] = both["rain_mm"] > 1
both`,
    lines: [
      ['merge(..., on="date")', 'each day gets its own rain.'],
      ['both["rain_mm"] > 1', 'True for the wet days, by the rule set in advance.'],
    ],
  },
  brief: {
    story: `The café manager asks: ${WEATHER} First, line the days up.`,
    get: [DAYS],
    want: ['`days`: cafe joined to weather on `date`, one row per café day', 'A `rainy` column: True when `rain_mm` is over 1'],
    out: '`days` has 120 rows.',
  },
},
'pj-07': {
  explain: [
    'Compare like with like: average cups on rainy days against dry days.',
    'Give the difference as a percentage: (rainy − dry) ÷ dry × 100.',
    'A percentage makes the size easy to grasp. "2% fewer" and "30% fewer" are very different stories.',
    'Then do the same for temperature: days warmer than the median against the rest.',
    'Grouping by a True/False condition gives a False row and a True row, which you pick out with `[True]` and `[False]`.',
  ],
  example: {
    say: 'Here the dearer days are compared with the cheaper ones, as a percentage.',
    code: `high = cafe["price"] > cafe["price"].median()
m = cafe.groupby(high)["cups"].mean()
print(m)
print(round((m[True] - m[False]) / m[False] * 100, 1))`,
    lines: [
      ['cafe.groupby(high)', 'a False row (cheaper days) and a True row (dearer days).'],
      ['(m[True] - m[False]) / m[False] * 100', 'how much higher, in %, cups are on dearer days.'],
    ],
  },
  brief: {
    story: `${WEATHER} Measure the size of the effect.`,
    get: [DAYS, ['The starter makes `days` with a `rainy` column.']],
    want: ['`rain_effect`: how much higher average cups are on rainy days than dry ones, in %, rounded to 1', '`warm_effect`: the same for days above the median `temp_c` against the rest'],
    out: 'Two percentages, negative if lower.',
  },
},
'pj-08': {
  explain: [
    'A correlation, r, says how closely two things move together. 0 is not at all, and −1 or 1 is in perfect lockstep.',
    'Below about 0.3 either way, a day-to-day link is too weak to plan around.',
    'Add the days up into weeks and the correlation often jumps.',
    'That\'s because there are fewer points, and both columns drift with the season, so a shared trend can pass for a cause.',
    'Lead with the daily number. Give the weekly one with that warning attached, never the other way round.',
  ],
  example: {
    say: 'Here cups and wind are correlated by day, then by week.',
    code: `w = cafe.merge(weather, on="date").set_index("date")
print(round(w["cups"].corr(w["wind_kph"]), 2))
weekly = w[["cups", "wind_kph"]].resample("W").agg({"cups": "sum", "wind_kph": "mean"})
print(round(weekly["cups"].corr(weekly["wind_kph"]), 2))`,
    lines: [
      ['the daily r', 'one point per day.'],
      ['resample("W").agg(...)', 'weekly total cups and weekly average wind.'],
      ['the weekly r', 'from only 18 weeks, so it can swing far from the daily one.'],
    ],
  },
  brief: {
    story: `${WEATHER} Measure how strong the link really is.`,
    get: [DAYS],
    want: ['`r_temp` and `r_rain`: the daily correlation of cups with `temp_c` and with `rain_mm`', '`weekly_r`: weekly total cups against weekly mean `temp_c`', 'Round all three to 2'],
    out: 'Three correlations.',
  },
},
'pj-09': {
  explain: [
    'A scatter of every day with a fitted line shows two things at once: the slope, and how much the points ignore it.',
    '`sns.regplot` draws both.',
    'The title carries the finding, at its honest size.',
    'With r near 0, "slightly" is the honest word. "Heat kills sales" wouldn\'t be.',
    'Put r in the title too, with an f-string: `f"... (r = {r:.2f})"` shows it to 2 places.',
  ],
  example: {
    say: 'Here wind is plotted against cups, with r worked out and written into the title.',
    code: `import seaborn as sns
days = cafe.merge(weather, on="date")
r = days["cups"].corr(days["wind_kph"])
sns.regplot(data=days, x="wind_kph", y="cups")
plt.title(f"Wind and cups (r = {r:.2f})")
plt.show()`,
    lines: [
      ['r = ...', 'the correlation, worked out, never typed.'],
      ['{r:.2f}', 'r to 2 decimal places, inside the title.'],
    ],
  },
  brief: {
    story: `${WEATHER} Make the chart for the manager.`,
    get: [DAYS],
    want: ['Switch to `sns.regplot` so the fitted line shows', 'Title it with the finding and its r to 2 places, like `Warmer days sell slightly fewer cups (r = -0.12)`'],
    out: 'One scatter with a line and an honest title.',
  },
},
'pj-10': {
  explain: [
    'The question was a practical one: should the café plan staff around the weather forecast?',
    'Write the rule before you look. Plan by weather only if the daily link is at least moderate (|r| of 0.3 or more), or warm days differ by 15% or more.',
    '`abs(x)` is the size of a number, ignoring its sign.',
    'Then say what you found, with the numbers, whichever way it goes.',
    '"No" is a perfectly good answer, and it saves the café from chasing noise.',
  ],
  example: {
    say: 'Here the rule is applied to two small made-up numbers, and the reason is written from them.',
    code: `r = -0.05
gap = 4.0
act = abs(r) >= 0.3 or abs(gap) >= 15
print(act)
print(f"Not worth it: r = {r:.2f} and a {gap:.0f}% gap are both small.")`,
    lines: [
      ['abs(r) >= 0.3 or abs(gap) >= 15', 'the rule, as one True or False.'],
      ['the f-string', 'the reason, with the numbers dropped in.'],
    ],
  },
  brief: {
    story: `${WEATHER} Make the call.`,
    get: [DAYS, ['The starter works out `r_temp` and `warm_effect`.']],
    want: ['`plan_for_weather`: True or False by the rule', '`reason`: one sentence that includes r to 2 places, like `r = -0.12`'],
    out: 'A True or False, and a sentence.',
  },
},
'pj-11': {
  explain: [
    'A new question from the survey: **which city is most engaged, and how sure can we be?**',
    'First, one clean table, so every later step starts from the same place.',
    'The mess, item by item: padded names, exact duplicate rows, "£18.00" and "n/a" as text, Yes/y/YES, and dates in two formats.',
    'Each fix is a move from the messy data course: strip and title, to_numeric, startswith("y"), to_datetime.',
    'The £ tells you the survey is British, so 05/02/2024 is day first: 5 February.',
  ],
  example: {
    say: 'Here a tiny messy table gets two of those fixes.',
    code: `raw = pd.DataFrame({"Name": [" ada ", "KOFI"], "Paid": ["£4.50", "n/a"]})
raw["Name"] = raw["Name"].str.strip().str.title()
raw["Paid"] = pd.to_numeric(raw["Paid"].str.replace("£", "", regex=False), errors="coerce")
raw`,
    lines: [
      ['.str.strip().str.title()', '" ada " becomes Ada, and KOFI becomes Kofi.'],
      ['pd.to_numeric(..., errors="coerce")', '£4.50 becomes 4.5, and n/a becomes missing.'],
    ],
  },
  brief: {
    story: `The marketing lead asks: ${ENGAGED} First, clean the survey once, properly.`,
    get: [SURVEY, ['The starter makes `clean`, a copy with its column names stripped.']],
    want: ['Drop exact duplicate rows', 'Strip and title-case `Name` and `City`', '`Spend (GBP)` a number (n/a missing)', '`Subscribed?` True or False', '`Signed Up` real dates, day first, with "unknown" missing'],
    out: '`clean` has 30 rows and tidy columns.',
  },
},
'pj-12': {
  explain: [
    'Summaries are there to answer the question, so choose their columns with the question in mind.',
    'Here that means how many responses, how engaged people are (the share subscribed), and what they spend.',
    '`.agg(name=(column, how))` builds them in one step, and `how` can be a little function of your own: `lambda s: s.isna().sum()` counts the blanks.',
    '`mean()` on a True/False column is the share that are True. Multiply by 100 and it\'s a percentage.',
    'A mean skips missing values without saying a word, so show how many it skipped.',
  ],
  example: {
    say: 'Here two teams are summed up: their size, the share who joined, and the blank scores.',
    code: `t = pd.DataFrame({"team": ["a", "a", "b"], "joined": [True, False, True], "score": [5, None, 7]})
t.groupby("team").agg(people=("joined", "size"), joined=("joined", "mean"),
                      blanks=("score", lambda s: s.isna().sum()))`,
    lines: [
      ['("joined", "size")', 'how many rows each team has.'],
      ['("joined", "mean")', 'the share who joined: 0.5 and 1.0.'],
      ['lambda s: s.isna().sum()', 'a tiny function: the blanks in each team\'s scores.'],
    ],
  },
  brief: {
    story: `${ENGAGED} Sum the survey up by city.`,
    get: [SURVEY, ['The starter makes `clean`, the cleaned survey.']],
    want: ['`by_city`, one row per city', '`responses`', '`subscribed`: % subscribed, rounded to 0', '`avg_spend`: mean of the spends given, rounded to 2', '`no_spend`: how many left the spend blank'],
    out: 'Three rows, four columns.',
  },
},
'pj-13': {
  explain: [
    'An average is only as good as the answers underneath it.',
    'Half of Nairobi\'s responses said n/a for spend, so its average rests on just the other half.',
    'Put the **coverage** next to the number: the share of responses that actually gave a spend.',
    'Flag it, don\'t delete it. A city under 75% coverage keeps its figure, with a warning attached.',
    '`.index[condition].tolist()` gives the labels of the rows that meet a condition, as a list.',
  ],
  example: {
    say: 'Here two branches get a coverage figure, and the ones under 75% are listed.',
    code: `t = pd.DataFrame({"responses": [10, 8], "no_spend": [1, 4]}, index=["Lagos", "Accra"])
t["coverage"] = ((t["responses"] - t["no_spend"]) / t["responses"] * 100).round(0)
print(t)
t.index[t["coverage"] < 75].tolist()`,
    lines: [
      ['(responses - no_spend) / responses * 100', 'the % who gave a spend: 90 and 50.'],
      ['t.index[...].tolist()', 'the names of the rows under 75: just Accra.'],
    ],
  },
  brief: {
    story: `${ENGAGED} Before anyone quotes a spend figure, show how much it rests on.`,
    get: [SURVEY, ['The starter makes `by_city` with responses, subscribed, avg_spend and no_spend.']],
    want: ['Add `coverage`: the % of responses that gave a spend, rounded to 0', '`shaky`: the list of cities with coverage under 75'],
    out: 'A coverage column, and a list of city names.',
  },
},
'pj-14': {
  explain: [
    'A one-page summary gets one chart, so pick the measure the question is about: engagement, the share subscribed.',
    'Shares belong on an axis from 0 to 100: `ax.set_ylim(0, 100)`.',
    'Start the axis higher and small gaps look enormous.',
    'Every bar is built on some number of responses, so put that count in the label, as before.',
    'Sort the bars, highest first, and write the finding in the title.',
  ],
  example: {
    say: 'Here the same two shares are drawn twice: on an axis starting at 35, and on one starting at 0.',
    code: `shares = pd.Series({"Lagos": 40, "Accra": 55})
fig, (left, right) = plt.subplots(1, 2, figsize=(7, 3))
left.bar(shares.index, shares.values)
left.set_ylim(35, 56)
left.set_title("Starts at 35")
right.bar(shares.index, shares.values)
right.set_ylim(0, 100)
right.set_title("Starts at 0")
plt.show()`,
    lines: [
      ['left.set_ylim(35, 56)', 'Accra looks four times as big.'],
      ['right.set_ylim(0, 100)', 'the honest picture: 55 against 40.'],
    ],
  },
  brief: {
    story: `${ENGAGED} One chart for the summary page.`,
    get: [SURVEY, ['The starter makes `by_city` with `responses` and `subscribed`.']],
    want: ['Draw `subscribed` as bars, highest first', 'Label each with its city and response count, like `Lagos (12)`', 'A y-axis from 0 to 100', 'The finding as the title'],
    out: 'One bar chart.',
  },
},
'pj-15': {
  explain: [
    'The last step is words: a short paragraph someone can read without the chart.',
    'Build it from the table, rather than retyping the figures.',
    'An **f-string**, with an `f` before the quotes, drops each value in straight from the table: `f"{best} at {share:.0f}%"`.',
    'That way the words can never drift away from the data.',
    'Lead with the finding, then the caveat: the most engaged city first, the shaky figure after.',
  ],
  example: {
    say: 'Here a sentence is built from a small table, with the best row found by code.',
    code: `t = pd.Series({"Lagos": 64, "Accra": 50})
best = t.idxmax()
print(f"{best} is the most engaged, at {t[best]:.0f}% subscribed.")`,
    lines: [
      ['t.idxmax()', 'the label of the biggest value: Lagos.'],
      ['{t[best]:.0f}', 'its value, with no decimal places.'],
    ],
  },
  brief: {
    story: `${ENGAGED} Write the summary.`,
    get: [SURVEY, ['The starter makes `by_city` (with subscribed and coverage) and `shaky`.']],
    want: ['`summary`: a few sentences built with f-strings from `by_city`', 'Name the city with the highest `subscribed` share, and give that share', 'Name each city in `shaky` as a figure to treat with care'],
    out: '`summary` is a short paragraph of text.',
  },
},
'pj-16': {
  explain: [
    'A new question, and a bigger one: **which customers have stopped buying, and which are worth winning back?**',
    'First, pin down what "stopped" means, in numbers.',
    'The data runs to the end of June, so measure from 30 June: `(pd.Timestamp("2024-06-30") - last_order).dt.days`.',
    'Use a customer\'s last order that went through, not a cancelled one.',
    'A customer usually orders again within about a month, so more than 45 days quiet is well past normal. Call those customers **lapsed**.',
  ],
  example: {
    say: 'Here two last-order dates are measured from 30 June and checked against 45 days.',
    code: `last = pd.Series(pd.to_datetime(["2024-06-20", "2024-04-01"]))
days = (pd.Timestamp("2024-06-30") - last).dt.days
print(days.tolist())
print((days > 45).tolist())`,
    lines: [
      ['pd.Timestamp("2024-06-30") - last', 'the gap from each date to 30 June.'],
      ['.dt.days', 'as whole days: 10 and 90.'],
      ['days > 45', 'only the second is lapsed.'],
    ],
  },
  brief: {
    story: `The marketing lead asks: ${WINBACK} First, find who has gone quiet.`,
    get: [SHOP],
    want: ['`last`: one row per customer with an order that went through', '`customer_id`, `last_order` (their latest order date) and `days_since` (days to 30 June 2024)', '`lapsed`: True when `days_since` is over 45'],
    out: 'One row per buying customer.',
  },
},
'pj-17': {
  explain: [
    'Before anyone emails out a list of names, build it a second way.',
    'If SQL and pandas agree, a slip in either one is much less likely.',
    '`julianday(\'2024-06-30\') - julianday(MAX(order_date))` is the days since a customer\'s last order.',
    'HAVING keeps the customers where that\'s over 45. It filters the groups, after GROUP BY.',
    'Leave the cancelled orders out in the WHERE, before the grouping, exactly as the pandas did.',
  ],
  example: {
    say: 'Here customers who first ordered more than 170 days before 30 June are listed, using HAVING on the gap.',
    code: `SELECT customer_id,
       MIN(order_date) AS first_order,
       CAST(julianday('2024-06-30') - julianday(MIN(order_date)) AS INTEGER) AS days_known
FROM orders
GROUP BY customer_id
HAVING days_known > 170
ORDER BY customer_id;`,
    lines: [
      ['julianday(...) - julianday(...)', 'the days between two dates.'],
      ['HAVING days_known > 170', 'keeps only the customers whose gap is over 170.'],
    ],
  },
  brief: {
    story: `${WINBACK} Check the lapsed list in SQL before anyone emails it.`,
    get: [SHOP],
    want: ['`customer_id` and `last_order` for the lapsed customers', 'Leave out cancelled orders', 'Keep customers more than 45 days quiet on 30 June 2024', 'By customer_id'],
    out: 'The same customers as the pandas list.',
  },
},
'pj-18': {
  explain: [
    'Winning someone back matters more if they used to spend a lot.',
    'A customer\'s spend is their order lines, qty × price, from orders that went through.',
    'Add it up per customer, and attach it to `last`.',
    'Then put the two groups side by side: how many, the average spend and the total.',
    'A small group can still matter a great deal if each person in it spent a lot.',
  ],
  example: {
    say: 'Here three customers are compared by group, in one step.',
    code: `t = pd.DataFrame({"lapsed": [True, False, False], "spend": [120, 40, 60]})
t.groupby("lapsed")["spend"].agg(customers="size", avg_spend="mean", total_spend="sum")`,
    lines: [
      ['groupby("lapsed")', 'a False row and a True row.'],
      ['.agg(customers="size", ...)', 'three named columns: the count, the average and the total.'],
    ],
  },
  brief: {
    story: `${WINBACK} Find out what the lapsed customers were worth.`,
    get: [SHOP, ['The starter makes `last` (with `lapsed`) and `lines` (order lines from orders that went through).']],
    want: ["`spend` on `last`: each customer's total of qty × price", '`compare`: one row for lapsed (True) and one for active (False), with `customers`, `avg_spend` and `total_spend`, rounded to 2'],
    out: 'Two rows, three columns.',
  },
},
'pj-19': {
  explain: [
    'Did the lapsed customers want something different? Split each group\'s spend across the product categories.',
    '`pd.crosstab(rows, columns, values=..., aggfunc="sum")` adds up a value in a grid.',
    'Add `normalize="index"` and each row becomes shares that add up to 1. Multiply by 100 for percentages.',
    'Look for the biggest gap between the two rows, either way.',
    'That\'s where the groups differ most, and the first place to look for a reason.',
  ],
  example: {
    say: 'Here each city\'s takings are split by drink, as shares of the row.',
    code: `pd.crosstab(cafe["city"], cafe["drink"], values=cafe["revenue"], aggfunc="sum", normalize="index").round(3)`,
    lines: [
      ['values=cafe["revenue"], aggfunc="sum"', 'each cell adds up revenue, not a count of rows.'],
      ['normalize="index"', 'each row turned into shares that add up to 1.'],
    ],
  },
  brief: {
    story: `${WINBACK} Did the lapsed customers buy different things?`,
    get: [SHOP, ['The starter makes `lines`: every order line with its `value`, `category` and the customer\'s `lapsed` flag.']],
    want: ['`mix`: the share of spend in each category, as a percentage rounded to 1, with lapsed (True) and active (False) as rows', '`biggest`: the category where the two rows differ most, either way'],
    out: 'A grid of two rows, and one category name.',
  },
},
'pj-20': {
  explain: [
    'Are some customers drifting away faster than others?',
    'A customer\'s **cohort** is the month of their first order that went through.',
    '`.dt.to_period("M")` turns a date into its month, like 2024-03.',
    'Group by cohort, then count the customers and the lapsed ones.',
    'A rate needs its count next to it. 1 lapsed out of 4 is 25%, but it\'s still only 4 people.',
  ],
  example: {
    say: 'Here three dates become their months.',
    code: `d = pd.Series(pd.to_datetime(["2024-01-15", "2024-01-30", "2024-03-02"]))
d.dt.to_period("M")`,
    lines: [
      ['.dt.to_period("M")', 'the month each date falls in: two in January, one in March.'],
    ],
  },
  brief: {
    story: `${WINBACK} Check whether some starting months drift away more than others.`,
    get: [SHOP, ['The starter makes `last` with `lapsed`.']],
    want: ["`cohort` on `last`: each customer's first month", '`by_cohort`, one row per cohort: `customers`, `lapsed` (how many) and `rate` (the % lapsed, rounded to 0)'],
    out: 'One row per starting month.',
  },
},
'pj-21': {
  explain: [
    'One chart should carry the finding: most customers order again within a few weeks, and a tail has gone quiet.',
    '`ax.hist(values, bins=range(0, 165, 15))` counts the values in 15-day bands: 0 to 15, 15 to 30, and so on.',
    '`ax.axvline(45)` draws the cut-off as a line down the chart.',
    'Say the finding in the title, with the number in it.',
    'The title is the bit people actually remember.',
  ],
  example: {
    say: 'Here the café\'s cups are counted in bands of 5, with a line at 20 and the count of quiet days in the title.',
    code: `fig, ax = plt.subplots()
ax.hist(cafe["cups"], bins=range(0, 65, 5))
ax.axvline(20, color="grey", linestyle="--")
ax.set_title(f"{(cafe['cups'] < 20).sum()} days sold fewer than 20 cups")
plt.show()`,
    lines: [
      ['bins=range(0, 65, 5)', 'bands of 5 cups, from 0 to 65.'],
      ['ax.axvline(20, ...)', 'a dashed line at 20.'],
      ['the title', 'the count worked out, never typed.'],
    ],
  },
  brief: {
    story: `${WINBACK} One chart for the slide.`,
    get: [SHOP, ['The starter makes `last` with `days_since` and `lapsed`.']],
    want: ['A histogram of `days_since` in 15-day bands from 0 to 165', 'A vertical line at 45', 'A title that says how many customers are lapsed'],
    out: 'One histogram.',
  },
},
'pj-22': {
  explain: [
    'The list will change every week, so the report needs a measure that works it out fresh, not a number someone typed in.',
    '`FILTER(customers, ...)` goes through the customers one by one.',
    'Inside it, `CALCULATE(MAX(orders[order_date]), orders[status] <> "cancelled")` is that customer\'s last order that went through.',
    'Lapsed on 30 June means a last order before 16 May: `< DATE(2024, 5, 16)`.',
    'In a live report, a date worked out from TODAY() would take its place.',
  ],
  example: {
    say: 'Here the customers whose first order was in January are counted in each city.',
    code: `Early = COUNTROWS(FILTER(customers, CALCULATE(MIN(orders[order_date])) < DATE(2024, 2, 1)))`,
    lines: [
      ['CALCULATE(MIN(orders[order_date]))', 'this one customer\'s first order.'],
      ['< DATE(2024, 2, 1)', 'before 1 February.'],
    ],
  },
  brief: {
    story: `${WINBACK} Put the lapsed count on the dashboard.`,
    get: [MODEL],
    want: ["`Lapsed`: how many customers' last order that went through was before 16 May 2024"],
    out: 'A matrix with one row per city, and a total.',
  },
},
'pj-23': {
  explain: [
    'Even a short list needs an order. Start with whoever used to spend the most.',
    'Join `last` to `customers` for names and cities.',
    'A blank city stays blank. Say so, rather than guess.',
    'Sort by spend, biggest first, and keep the top five for a personal message.',
    'Everyone else can get the general email.',
  ],
  example: {
    say: 'Here the three dearest products are listed with just the columns a reader needs.',
    code: `products.sort_values("price", ascending=False).head(3)[["name", "category", "price"]]`,
    lines: [
      ['sort_values("price", ascending=False)', 'dearest first.'],
      ['.head(3)[[...]]', 'the top three, with just three columns.'],
    ],
  },
  brief: {
    story: `${WINBACK} Decide who gets a personal message first.`,
    get: [SHOP, ['The starter makes `last` with `lapsed`, `days_since` and `spend`.']],
    want: ['`targets`: the lapsed customers with `customer_id`, `name`, `city`, `spend` and `days_since`', 'Biggest spend first, top five only'],
    out: 'Five rows.',
  },
},
'pj-24': {
  explain: [
    'To argue for a campaign, put a number on it.',
    'A customer\'s **monthly value** is their spend divided by the months they were buying, first month to last, both counted.',
    'Months between two dates: (years apart) × 12 + (months apart) + 1.',
    'So someone who only bought in March was buying for 1 month.',
    'Add up the five targets\' monthly values and you get the most that winning them all back could be worth each month. Say "up to".',
  ],
  example: {
    say: 'Here the months from 20 January to 3 April are counted, both ends included.',
    code: `first = pd.Timestamp("2024-01-20")
last = pd.Timestamp("2024-04-03")
(last.year - first.year) * 12 + (last.month - first.month) + 1`,
    lines: [
      ['(last.month - first.month)', '4 − 1 = 3 months apart.'],
      ['+ 1', 'counting both January and April: 4 months.'],
    ],
  },
  brief: {
    story: `${WINBACK} Put a number on what is at stake.`,
    get: [SHOP, ['The starter makes `targets` (the top five) and `span` (each customer\'s first and last order dates).']],
    want: ['Bring `span` onto `targets`', '`months`: first to last month, both counted', '`monthly`: spend ÷ months, rounded to 2', '`at_stake`: the five monthly values added up, rounded to 2'],
    out: '`at_stake` is one amount.',
  },
},
'pj-25': {
  explain: [
    'The last step is the recommendation, in words someone can act on without ever opening the notebook.',
    'Build it with f-strings from the tables, so no figure is typed in by hand.',
    'Say how many are lapsed, who to contact first, and what it could be worth.',
    '`{x:.2f}` in an f-string shows a number to 2 decimal places, which is just right for pounds and pence.',
    'Finish with the caveat. This is money people spent before, and winning them back is a hope, not a promise.',
  ],
  example: {
    say: 'Here a two-sentence case is built from three made-up numbers.',
    code: `n, total, stake = 3, 20, 41.5
print(f"{n} of {total} customers have gone quiet. Winning them back could be worth up to {stake:.2f} a month.")`,
    lines: [
      ['{n} of {total}', 'the numbers dropped into the words.'],
      ['{stake:.2f}', '41.50, to 2 places.'],
    ],
  },
  brief: {
    story: `${WINBACK} Make the case to the marketing lead.`,
    get: [SHOP, ['The starter makes `last`, `targets` and `at_stake`.']],
    want: ['`summary`: a few sentences built with f-strings', 'How many customers are lapsed, out of how many', 'Name the top target', 'Give `at_stake` as the most it could be worth a month'],
    out: '`summary` is a short paragraph of text.',
  },
},
};
