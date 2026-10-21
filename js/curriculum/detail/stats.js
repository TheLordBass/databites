/* Statistics (st-01 to st-35): the fuller teaching, a worked example and
   the task as a brief (see detail/index.js). Examples use a handful of
   numbers made on the spot, so the idea is plain and the task's answer
   stays hidden. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, missing on 9 days" };
const GOT_CAFE = ['`cafe` has one row per day, 120 days:', CAFE];
const GOT_SHOP = ["The shop's `order_items` (order_id, product_id, qty) and `products` (product_id, name, category, price) are loaded."];
const GOT_HEAT = ['The starter builds `heat`: a year of weather with what a seaside kiosk sold each day.', { temp_c: 'the temperature, °C', rain_mm: 'rain, in mm', iced: 'iced drinks sold', hot: 'hot drinks sold', suncream: 'sun cream sold' }];
const GOT_PVALUE = ['The starter gives you `p_value(a, b, n)`: the two-sided p-value for a conversions out of n against b out of n.'];

export const STATS_DETAIL = {
'st-01': {
  explain: [
    'The **mean** adds everything up and divides by how many there are. One huge value drags it right along.',
    'The **median** is the middle value once they\'re sorted. A few big values barely nudge it.',
    'When the mean sits well above the median, the data is **right-skewed**: lots of ordinary values, plus a long tail of big ones.',
    'Order values, incomes and waiting times nearly always look like this.',
    'So for "a typical order", give the median. Save the mean for totals and budgets, where every pound counts.',
  ],
  example: {
    say: 'Here five tips, one of them huge, are summed up both ways.',
    code: `tips = pd.Series([2, 3, 3, 4, 40])
print("mean:", tips.mean())
print("median:", tips.median())`,
    lines: [
      ['tips.mean()', '52 ÷ 5 = 10.4, pulled up by the one 40.'],
      ['tips.median()', 'the middle value, 3: what a typical tip really is.'],
    ],
  },
  brief: {
    story: 'Marketing wants to say what a typical online order is worth, and the finance team warns the average might mislead.',
    get: [GOT_SHOP],
    want: ['Make `order_value`: one total per order', 'Set `mean_order` and `median_order`', '`skewed`: True if the mean is above the median'],
    out: 'Two numbers and a True or False.',
  },
},
'st-02': {
  explain: [
    'Two cities can have the same average and still behave nothing alike. **Spread** tells you how far values typically sit from the middle.',
    'The **standard deviation**, `.std()`, is roughly how far a typical value sits from the average. A few extreme values push it up.',
    'The **interquartile range** (IQR) is the value three quarters of the way up minus the value a quarter of the way up: `.quantile(0.75) - .quantile(0.25)`.',
    'The IQR covers the middle half and ignores the extremes altogether.',
    '"68% of values within one standard deviation" only holds for bell-shaped data, so check it rather than assume it.',
  ],
  example: {
    say: 'Here two sets of numbers share an average but not a spread.',
    code: `steady = pd.Series([9, 10, 10, 11])
wild = pd.Series([1, 5, 15, 19])
print(steady.mean(), wild.mean())
print(round(steady.std(), 2), round(wild.std(), 2))
print(wild.quantile(0.75) - wild.quantile(0.25))`,
    lines: [
      ['.mean()', 'both average 10.'],
      ['.std()', 'about 0.8 against about 8.4: the second set is ten times as spread out.'],
      ['quantile(0.75) - quantile(0.25)', "the IQR of the wild set: its middle half spans 12."],
    ],
  },
  brief: {
    story: 'The rota planner needs to know how much the daily cups swing, not just the average.',
    get: [GOT_CAFE],
    want: ['`std_cups`: the standard deviation of cups', '`iqr_cups`: the 75th percentile minus the 25th', '`within_one`: the % of days within one standard deviation of the mean, rounded to 1'],
    out: 'Three numbers. Is `within_one` near 68?',
  },
},
'st-03': {
  explain: [
    'Pick any 30 days and you\'ll get a slightly different mean each time. That wobble is called **sampling variation**.',
    'It\'s the reason a single number needs an error bar.',
    'Draw lots of samples and their means spread out by about the standard deviation ÷ √(sample size). That\'s the **standard error**.',
    'Bigger samples wobble less, but only by the square root. Four times the data just halves the wobble.',
    '`np.random.default_rng(1)` makes the random draws come out the same every time, so your result can be checked.',
  ],
  example: {
    say: 'Here five samples of 10 days each give five different average prices.',
    code: `rng = np.random.default_rng(7)
means = [rng.choice(cafe["price"], size=10).mean() for _ in range(5)]
print(np.round(means, 2))`,
    lines: [
      ['rng.choice(cafe["price"], size=10)', '10 prices picked at random.'],
      ['for _ in range(5)', 'done five times, each average kept in a list.'],
      ['the result', 'five averages, all slightly different: sampling variation.'],
    ],
  },
  brief: {
    story: 'A manager asks why last month\'s sample of 30 days gave a different average from this month\'s.',
    get: [GOT_CAFE],
    want: ['`sample_means`: the means of 500 samples of 30 days each, picked with replacement', '`standard_error`: the standard deviation of cups ÷ √30', 'Compare the two'],
    out: 'The spread of `sample_means` should be close to `standard_error`.',
  },
},
'st-04': {
  explain: [
    'A **95% confidence interval** is your estimate plus or minus about two standard errors.',
    'For a mean, that\'s mean ± 1.96 × std ÷ √n, where n is how many values there are.',
    'It tells you how precisely the data pins down the **mean**.',
    'It\'s not the range where 95% of days fall. Individual days spread much wider than their average does.',
    'Always give the interval with the number. "36 cups a day (33 to 39)" says far more than "36".',
  ],
  example: {
    say: 'Here eight waiting times get a 95% interval for their mean.',
    code: `waits = pd.Series([4, 6, 5, 7, 3, 5, 6, 4])
se = waits.std() / np.sqrt(len(waits))
print(waits.mean(), round(waits.mean() - 1.96 * se, 2), round(waits.mean() + 1.96 * se, 2))`,
    lines: [
      ['waits.std() / np.sqrt(len(waits))', 'the standard error of the mean.'],
      ['mean ± 1.96 × se', 'the interval: the mean of 5 is pinned down to roughly 4.1 to 5.9.'],
    ],
  },
  brief: {
    story: 'The owner wants the average cups a day for the business plan, with an honest error bar.',
    get: [GOT_CAFE],
    want: ['`ci_low` and `ci_high`: the 95% interval for mean cups per day', 'Use all the days'],
    out: 'Two numbers either side of the mean.',
  },
},
'st-05': {
  explain: [
    'The ±1.96 formula leans on assumptions. The **bootstrap** leans on the data instead.',
    'Pick the same number of values again, at random, with repeats allowed, and work out the mean.',
    'Do that thousands of times. All those means show you how much the mean could wobble.',
    'The middle 95% of them, from the 2.5th to the 97.5th percentile, is your interval: `np.percentile(means, [2.5, 97.5])`.',
    'When it agrees with the formula, both are probably fine. When they disagree, trust the bootstrap more.',
  ],
  example: {
    say: 'Here four numbers are resampled three times, repeats allowed.',
    code: `rng = np.random.default_rng(4)
small = np.array([3, 5, 8, 9])
for _ in range(3):
    pick = rng.choice(small, size=4, replace=True)
    print(pick, pick.mean())`,
    lines: [
      ['replace=True', 'a value can be picked more than once, and another left out.'],
      ['pick.mean()', 'each resample has its own mean. Thousands of them make the interval.'],
    ],
  },
  brief: {
    story: 'A sceptical investor asks whether the formula interval can be trusted. Build one without the formula.',
    get: [GOT_CAFE],
    want: ['With `rng = np.random.default_rng(0)`, take 2000 resamples of all the days', 'Keep their means', '`boot_low` and `boot_high`: the 2.5th and 97.5th percentiles'],
    out: 'Two numbers, close to the formula interval.',
  },
},
'st-06': {
  explain: [
    'On average, Nairobi sells more cups a day than Lagos. But is that really the cities, or just the luck of which days fell where?',
    'A difference between two means has its own standard error: √(variance₁ ÷ n₁ + variance₂ ÷ n₂).',
    'The **variance**, `.var()`, is the standard deviation squared, and n is how many values each group has.',
    'The 95% interval for the difference is the difference ± 1.96 of those.',
    'If the interval includes 0, the data can\'t tell the groups apart, even though one number is bigger.',
  ],
  example: {
    say: 'Here two small groups are compared, with an interval for the gap between them.',
    code: `a = pd.Series([10, 12, 11, 13])
b = pd.Series([14, 15, 13, 16])
gap = b.mean() - a.mean()
se = np.sqrt(a.var() / len(a) + b.var() / len(b))
print(gap, round(gap - 1.96 * se, 2), round(gap + 1.96 * se, 2))`,
    lines: [
      ['gap', 'b averages 3 more than a.'],
      ['se', 'how much that gap could wobble.'],
      ['the interval', 'about 1.2 to 4.8: it leaves out 0, so the gap is clear.'],
    ],
  },
  brief: {
    story: 'The Nairobi manager says their branch is busier than Lagos. Is it really?',
    get: [GOT_CAFE],
    want: ["`gap`: Nairobi's mean cups minus Lagos's", '`gap_low` and `gap_high`: its 95% interval', '`clear`: True only if the interval leaves out 0'],
    out: 'A gap, its interval, and True or False.',
  },
},
'st-07': {
  explain: [
    'A **t-test** asks how surprising a gap this size would be if the two groups were really the same.',
    '`stats.ttest_ind(a, b, equal_var=False)` from `scipy` runs Welch\'s t-test, which doesn\'t assume the groups are equally spread.',
    'The **p-value** measures that surprise: the chance of a gap at least this big from luck alone.',
    'Below 0.05 is the usual line for "unlikely to be chance", but it\'s a convention, not a law of nature.',
    'A big p-value doesn\'t prove the groups are equal. It just says this data can\'t show a difference.',
  ],
  example: {
    say: 'Here the two small groups from the last lesson go through a t-test.',
    code: `from scipy import stats
p = stats.ttest_ind([10, 12, 11, 13], [14, 15, 13, 16], equal_var=False).pvalue
print(round(p, 4))`,
    lines: [
      ['stats.ttest_ind(..., equal_var=False)', "Welch's t-test on the two groups."],
      ['.pvalue', 'well under 0.05: a gap this big would rarely happen by chance.'],
    ],
  },
  brief: {
    story: "Head office wants a standard test, not a hand-made interval, before believing Nairobi is busier.",
    get: [GOT_CAFE],
    want: ["Run Welch's t-test on Nairobi's cups against Lagos's", '`p_value`', '`significant`: True if it is below 0.05'],
    out: 'A p-value, and True or False.',
  },
},
'st-08': {
  explain: [
    'An **A/B test** shows two versions to different visitors and compares how many convert: sign up, buy, click.',
    'Each version has a **rate**, which is conversions ÷ visitors.',
    'To test two rates, **z** is the difference in rates divided by √(p(1−p)(1/n₁ + 1/n₂)), where p pools both groups together.',
    'A z of about 2 or more, either way, would be surprising for pure chance.',
    'The two-sided p-value comes from the bell curve: `2 * (1 - 0.5 * (1 + erf(abs(z) / sqrt(2))))`.',
  ],
  example: {
    say: 'Here 30 out of 300 against 33 out of 300 is tested: a 10% lift that looks rather good.',
    code: `from math import erf, sqrt
rate_a, rate_b = 30 / 300, 33 / 300
pooled = 63 / 600
z = (rate_b - rate_a) / sqrt(pooled * (1 - pooled) * (1 / 300 + 1 / 300))
p = 2 * (1 - 0.5 * (1 + erf(abs(z) / sqrt(2))))
print(round(z, 2), round(p, 3))`,
    lines: [
      ['pooled', 'all conversions over all visitors: 63 out of 600.'],
      ['z', 'only about 0.4: the gap is small against the wobble.'],
      ['p', 'far above 0.05. The lift could easily be luck.'],
    ],
  },
  brief: {
    story: 'Version B of the sign-up page converted 66 of 400 visitors, against 48 of 400 for version A. The designer wants to ship B.',
    get: [['The starter sets `conversions` and `visitors` for A and B.']],
    want: ["`lift`: B's rate over A's, as a % increase", '`z` and `p_value`', '`ship_b`: True only if p_value is below 0.05'],
    out: 'A lift, a z, a p-value and a decision.',
  },
},
'st-09': {
  explain: [
    'Test enough pairs and something will pass p < 0.05 by chance alone.',
    'At 0.05, each test has a 1 in 20 chance of a false alarm. Six tests give luck far more chances.',
    'The **Bonferroni correction** divides the threshold by the number of tests, so with six it\'s 0.05 ÷ 6.',
    'It\'s stricter, and it\'s honest about how many looks you took.',
    'A result that passes 0.05 on its own but fails the corrected line is probably luck.',
  ],
  example: {
    say: 'Here three p-values are judged against 0.05, then against the corrected line.',
    code: `ps = [0.01, 0.03, 0.2]
print([p < 0.05 for p in ps])
print([p < 0.05 / len(ps) for p in ps])`,
    lines: [
      ['p < 0.05', 'two look significant.'],
      ['p < 0.05 / len(ps)', 'with three tests the line is about 0.017, so only the first survives.'],
    ],
  },
  brief: {
    story: 'An analyst compared every pair of drinks and found a "significant" one. Is it real?',
    get: [GOT_CAFE],
    want: ["Run Welch's t-test on cups for every pair of drinks", '`pairs_under_05`: the pairs with p below 0.05', '`pairs_after_correction`: those below 0.05 ÷ the number of pairs'],
    out: 'Two lists of pairs, each pair as `combinations` gives it.',
  },
},
'st-10': {
  explain: [
    'A p-value mixes up two things: how big the effect is, and how much data there is.',
    'With enough data, even a tiny, meaningless gap becomes "significant".',
    'An **effect size** measures the gap itself. **Cohen\'s d** is the difference in means divided by the pooled standard deviation.',
    'The pooled standard deviation combines both groups\' spreads, weighted by their sizes.',
    'As a rough guide, 0.2 is small, 0.5 medium and 0.8 large. Say the size first, then the uncertainty.',
  ],
  example: {
    say: 'Here\'s Cohen\'s d for the two small groups from earlier.',
    code: `a = pd.Series([10, 12, 11, 13])
b = pd.Series([14, 15, 13, 16])
pooled = np.sqrt(((len(a) - 1) * a.var() + (len(b) - 1) * b.var()) / (len(a) + len(b) - 2))
print(round((b.mean() - a.mean()) / pooled, 2))`,
    lines: [
      ['pooled', 'the two spreads combined into one.'],
      ['(b.mean() - a.mean()) / pooled', 'the gap measured in standard deviations: over 2, a large effect.'],
    ],
  },
  brief: {
    story: 'Nairobi\'s lead over Lagos might be real, but is it big enough to matter?',
    get: [GOT_CAFE],
    want: ["`d`: Cohen's d for Nairobi against Lagos, with the pooled standard deviation", '`size` by `abs(d)`: "negligible" under 0.2, "small" under 0.5, "medium" under 0.8, otherwise "large"'],
    out: 'A number and a word.',
  },
},
'st-11': {
  explain: [
    'A **probability** is how often something happens in the long run, from 0 (never) to 1 (always).',
    'A fair die lands on six 1 time in 6, about 0.167.',
    'You can find a probability by **simulation**: have the computer try it thousands of times, and count.',
    '`(rolls == 6).mean()` gives the share of sixes, because each True counts as 1 and each False as 0.',
    'The more tries, the closer the share gets to the true probability. That\'s the **law of large numbers**.',
  ],
  example: {
    say: 'Here a coin is tossed 10 times, then 10,000 times.',
    code: `rng = np.random.default_rng(1)
print((rng.integers(0, 2, size=10) == 1).mean())
print((rng.integers(0, 2, size=10_000) == 1).mean())`,
    lines: [
      ['rng.integers(0, 2, ...)', '0 or 1, like tails or heads.'],
      ['10 tosses', 'the share of heads can land well away from 0.5.'],
      ['10,000 tosses', 'very close to 0.5.'],
    ],
  },
  brief: {
    story: 'The café is planning a dice game for a promotion, and wants to know the real odds.',
    get: [['Nothing to load: the dice are simulated with `rng = np.random.default_rng(5)`.']],
    want: ['`rolls`: 10,000 rolls, and `share_six`: the share that are sixes', '`first` and `second`: two dice, 10,000 rolls each', '`share_seven`: the share of throws where they add up to 7'],
    out: 'Two shares, close to 1 in 6 and 6 in 36.',
  },
},
'st-12': {
  explain: [
    'A **conditional probability** is a chance once you already know something.',
    'The chance of a pastry, given that someone has a loyalty card, is written P(pastry | card).',
    'Narrow down to the rows you know about, then take the share: card holders who bought a pastry ÷ all card holders.',
    'The order matters. P(pastry | card) and P(card | pastry) are different questions with different answers.',
    'Mixing them up is one of the commonest mistakes people make when reading statistics.',
  ],
  example: {
    say: 'Here 500 deliveries are split by weather and lateness, and the chance is asked both ways round.',
    code: `t = pd.DataFrame({"late": [30, 20], "on time": [70, 380]}, index=["rain", "dry"])
print(t.loc["rain", "late"] / t.loc["rain"].sum())
print(t.loc["rain", "late"] / t["late"].sum())`,
    lines: [
      ['P(late | rain)', '30 of the 100 rainy deliveries were late: 0.3.'],
      ['P(rain | late)', '30 of the 50 late deliveries were in rain: 0.6. A different question.'],
    ],
  },
  brief: {
    story: 'Marketing claims the loyalty card makes people buy pastries. Start with the right chances.',
    get: [['The starter makes `table`: 1,000 visitors, with or without a card, who did or didn\'t buy a pastry.']],
    want: ['`p_pastry`: the chance that any visitor bought a pastry', '`p_pastry_given_card`: the chance among card holders', '`p_card_given_pastry`: the chance that a pastry buyer had a card'],
    out: 'Three chances between 0 and 1.',
  },
},
'st-13': {
  explain: [
    'A **z-score** says how many standard deviations a value sits from the mean: (value − mean) ÷ standard deviation.',
    '0 is exactly average, +2 is two standard deviations above, and −1 is one below.',
    'It puts different things on the same scale, so a hot day and a wet day can be compared by how unusual each one is.',
    'In bell-shaped data, about 1 value in 20 lands beyond ±2.',
    'Lopsided data, like rain, lands out there more often, and much further out.',
  ],
  example: {
    say: 'Here every day\'s cups become a z-score, and the most extreme days are found.',
    code: `cups = cafe["cups"]
z = (cups - cups.mean()) / cups.std()
print(round(z.max(), 2), round(z.min(), 2))`,
    lines: [
      ['(cups - cups.mean()) / cups.std()', 'how many standard deviations each day is from average.'],
      ['z.max(), z.min()', 'the busiest and quietest days: neither even 2 away, so cups never get wild.'],
    ],
  },
  brief: {
    story: 'The local paper asks which was more extraordinary: the year\'s hottest day or its wettest.',
    get: [['`weather` has one row per day of 2024, with `temp_c` and `rain_mm`.']],
    want: ["`temp_z` and `rain_z`: every day's temperature and rain as z-scores", '`hottest` and `wettest`: the biggest z-score in each', '`more_unusual`: "temp" or "rain"', '`rain_far`: the share of days with a rain z-score beyond ±2'],
    out: 'Two z-scores, a word and a share.',
  },
},
'st-14': {
  explain: [
    'Lots of measurements pile up in a **bell shape**: most near the middle, fewer further out, the same on both sides.',
    'This is the **normal distribution**, and just two numbers describe it: its mean and standard deviation.',
    '`stats.norm.cdf(x, mean, sd)` gives the share below x, so `1 - cdf` is the share above.',
    '`stats.norm.ppf(0.9, mean, sd)` goes the other way, giving the value that 90% fall below.',
    'It\'s a model, not the data. Before you trust what it predicts, compare it with what really happened.',
  ],
  example: {
    say: 'Here heights with a mean of 170 cm and a standard deviation of 10 are asked two questions.',
    code: `from scipy import stats
print(round(stats.norm.cdf(180, 170, 10), 3))
print(round(stats.norm.ppf(0.5, 170, 10), 1))`,
    lines: [
      ['stats.norm.cdf(180, 170, 10)', 'the share under 180 cm, one standard deviation up: about 0.84.'],
      ['stats.norm.ppf(0.5, 170, 10)', 'the height half the people are under: the mean, 170.'],
    ],
  },
  brief: {
    story: 'The head barista wants to know how often a shot runs too long, and where to set the "too slow" line.',
    get: [['The starter makes `shots`: 500 espresso shots, timed in seconds.']],
    want: ['`m` and `s`: the mean and standard deviation', '`predicted_over_32`: the share the bell curve expects over 32 seconds', '`actual_over_32`: the share that really were', '`slowest_tenth`: the time only the slowest 10% go over'],
    out: 'Two shares close together, and a time in seconds.',
  },
},
'st-15': {
  explain: [
    'Repeat the same yes-or-no chance a set number of times, and count the yeses.',
    'That count follows a **binomial distribution**, set by how many tries there are (n) and the chance each time (p).',
    '`stats.binom.pmf(k, n, p)` is the chance of exactly k.',
    '`stats.binom.sf(k, n, p)` is the chance of **more than** k, so "10 or more" is `sf(9, n, p)`.',
    'Whenever you can, check a formula against a simulation: `rng.binomial(n, p, size=10_000)`.',
  ],
  example: {
    say: 'Here are the chances for 10 coin tosses.',
    code: `from scipy import stats
print(round(stats.binom.pmf(5, 10, 0.5), 3))
print(round(stats.binom.sf(7, 10, 0.5), 3))`,
    lines: [
      ['stats.binom.pmf(5, 10, 0.5)', 'exactly 5 heads: about 1 time in 4.'],
      ['stats.binom.sf(7, 10, 0.5)', 'more than 7, so 8 or more heads: about 5 times in 100.'],
    ],
  },
  brief: {
    story: 'The baker wants to know how many pastries to have ready for the morning rush.',
    get: [['20 customers come in, and each has a 30% chance of buying a pastry: `n, p = 20, 0.3`.']],
    want: ['`exactly_6`: the chance of exactly 6 pastries', '`ten_or_more`: the chance of 10 or more', '`sim_ten_or_more`: the share of 10,000 simulated mornings with 10 or more, using `rng = np.random.default_rng(3)`'],
    out: 'Three chances, the last two close together.',
  },
},
'st-16': {
  explain: [
    'Counts of things that happen at random through time, like customers walking in during an hour, usually follow a **Poisson distribution**.',
    'It\'s set by just one number: the average count, called mu.',
    '`stats.poisson.cdf(k, mu)` is the chance of k or fewer.',
    '`stats.poisson.sf(k, mu)` is the chance of more than k.',
    'It answers real staffing questions, like how often an hour will bring more customers than one barista can handle.',
  ],
  example: {
    say: 'Here online orders arrive at 3 an hour on average.',
    code: `from scipy import stats
print(round(stats.poisson.pmf(0, 3), 3))
print(round(stats.poisson.sf(5, 3), 3))`,
    lines: [
      ['stats.poisson.pmf(0, 3)', 'the chance of an hour with no orders at all: about 5%.'],
      ['stats.poisson.sf(5, 3)', 'the chance of more than 5: about 8%.'],
    ],
  },
  brief: {
    story: 'One barista can handle 12 customers an hour. The manager wants to know how often that will not be enough.',
    get: [['The starter sets `mu = 9` customers an hour, and `hourly`: 300 logged hours of customer counts.']],
    want: ['`p_rush`: the Poisson chance of more than 12 in an hour', '`expected_rush_hours`: how many of the 300 hours that predicts', '`actual_rush_hours`: how many logged hours had more than 12', '`p_quiet`: the chance of 4 or fewer'],
    out: 'Expected and actual rush hours close together, and two chances.',
  },
},
'st-17': {
  explain: [
    'Some data is lopsided: lots of small values and a few big ones. **Skew** measures that. 0 is symmetrical, and above 0 means a long tail of big values.',
    'And yet the **average** of 30 values, taken again and again, piles up in a bell shape.',
    'This is the **central limit theorem**: averages of enough values come out close to normal, whatever shape the values themselves have.',
    'It\'s the reason the ±1.96 intervals earlier in this course work at all.',
    'The bell of averages is also narrower than the data, by √30, just as the standard error said.',
  ],
  example: {
    say: 'Here single dice rolls, which are flat, sit next to averages of 10 rolls, which make a bell.',
    code: `rng = np.random.default_rng(6)
one = rng.integers(1, 7, 1000)
avgs = rng.integers(1, 7, (1000, 10)).mean(axis=1)
fig, (left, right) = plt.subplots(1, 2, figsize=(7, 3))
left.hist(one, bins=6)
right.hist(avgs, bins=20)
plt.show()`,
    lines: [
      ['one', '1,000 single rolls: every number about equally often, a flat shape.'],
      ['avgs', '1,000 averages of 10 rolls each: piled up around 3.5 in a bell.'],
    ],
  },
  brief: {
    story: 'A colleague says the order values are too lopsided for intervals to work. Show them why they still do.',
    get: [GOT_SHOP, ['The starter makes `order_value`: one total per order.']],
    want: ['With `rng = np.random.default_rng(2)`, take 1,000 samples of 30 orders, repeats allowed', '`sample_means`: each sample\'s mean, and `skew_means`: their skew', 'Side by side: a histogram of `order_value` on `left` and of `sample_means` on `right`'],
    out: 'A skew near 0, and two histograms: one lopsided, one a bell.',
  },
},
'st-18': {
  explain: [
    'Shares need error bars too. 31% from one stretch of days could easily be 25% or 37% from another.',
    'A share\'s standard error is √(p × (1 − p) ÷ n), where p is the share and n is how many there are.',
    'The 95% interval is p ± 1.96 of those, just like for a mean.',
    'A share of True values is simply `.mean()` of a True/False column.',
    'With very few values, or a share near 0% or 100%, this simple version gets shaky.',
  ],
  example: {
    say: 'Here 45 out of 150 survey answers said yes.',
    code: `p = 45 / 150
se = np.sqrt(p * (1 - p) / 150)
print(p, round(p - 1.96 * se, 3), round(p + 1.96 * se, 3))`,
    lines: [
      ['p', 'the share: 0.3.'],
      ['se', 'how much that share could wobble.'],
      ['the interval', 'about 0.23 to 0.37.'],
    ],
  },
  brief: {
    story: 'The owner wants to say "a third of our days get top ratings", with an honest error bar.',
    get: [GOT_CAFE],
    want: ['`n`: how many rated days there are', '`p`: the share rated 4.5 or more', '`se`: its standard error', '`low` and `high`: the 95% interval for the share'],
    out: 'A share, and an interval around it.',
  },
},
'st-19': {
  explain: [
    'Before running a survey, decide how precise it needs to be. The **margin of error** is the ± part of the interval: 1.96 standard errors.',
    'Turn the formula round and you get the size you need. For a mean: n = (1.96 × sd ÷ margin)².',
    'For a share: n = 1.96² × p(1 − p) ÷ margin². Using p = 0.5 gives the biggest answer, so it\'s the safe guess.',
    'Round **up** with `math.ceil`. You can\'t ask 384.2 people.',
    'Halving the margin takes four times the people. Precision doesn\'t come cheap.',
  ],
  example: {
    say: 'Here\'s how many values it takes to pin a mean down to ±1, when they vary by 10, and then to ±0.5.',
    code: `import math
print(math.ceil((1.96 * 10 / 1) ** 2))
print(math.ceil((1.96 * 10 / 0.5) ** 2))`,
    lines: [
      ['(1.96 * 10 / 1) ** 2', '384.16, rounded up to 385.'],
      ['margin 0.5', 'half the margin needs four times as many: 1,537.'],
    ],
  },
  brief: {
    story: 'The owner wants to run a survey and a sales study, and asks how big each must be.',
    get: [GOT_CAFE],
    want: ['`n_mean`: the days needed to pin mean cups down to ±2 cups', '`n_share`: the people needed for a share within ±0.05, with p = 0.5', '`n_share_half`: the same within ±0.025', 'Round each one up'],
    out: 'Three whole numbers.',
  },
},
'st-20': {
  explain: [
    'The **expected value** is the average result you\'d get if you repeated something many, many times.',
    'Work it out as each outcome times its chance, all added up.',
    'With numpy, that\'s `(outcomes * chances).sum()`.',
    'It\'s a long-run average. Any single month can land well away from it.',
    'A simulation is a good check, and a good reason to give budgets a bit of slack.',
  ],
  example: {
    say: 'Here\'s the expected payout of a raffle ticket that wins £5 now and then, and £50 rarely.',
    code: `outcomes = np.array([0, 5, 50])
chances = np.array([0.9, 0.09, 0.01])
print((outcomes * chances).sum())`,
    lines: [
      ['outcomes * chances', '0 × 0.9, 5 × 0.09 and 50 × 0.01.'],
      ['.sum()', 'about 0.95: what each ticket pays out on average.'],
    ],
  },
  brief: {
    story: 'A scratch card comes with every coffee. Finance wants to know what the promotion will really cost.',
    get: [['The starter makes `prizes`: each prize, what it costs the café, and its chance.']],
    want: ['`ev`: the expected cost per card', '`monthly`: the expected cost of 2,000 cards', '`simulated`: the total cost of 2,000 simulated cards, with `rng = np.random.default_rng(4)`'],
    out: 'Three costs, the last two close together.',
  },
},
'st-21': {
  explain: [
    '**Correlation**, written r, measures how closely two numbers move together along a straight line.',
    '+1 is a perfect rising line, −1 is a perfect falling one, and 0 means no straight-line link at all.',
    '`a.corr(b)` works it out.',
    'Always look at the scatter as well. r is a single number, and very different pictures can share it.',
    'As a rough guide, around 0.1 is weak, 0.3 moderate, and 0.5 or more strong.',
  ],
  example: {
    say: 'Here one set of numbers is correlated with three others.',
    code: `x = pd.Series([1, 2, 3, 4, 5])
print(round(x.corr(pd.Series([2, 4, 5, 8, 10])), 2))
print(round(x.corr(pd.Series([10, 8, 6, 4, 2])), 2))
print(round(x.corr(pd.Series([3, 1, 4, 1, 5])), 2))`,
    lines: [
      ['[2, 4, 5, 8, 10]', 'rises almost in a straight line: close to +1.'],
      ['[10, 8, 6, 4, 2]', 'falls in a perfect line: −1.'],
      ['[3, 1, 4, 1, 5]', 'jumps about: a weak link.'],
    ],
  },
  brief: {
    story: 'The kiosk owner wants to know what drives iced drink sales.',
    get: [GOT_HEAT],
    want: ['`r_iced`: the correlation between temperature and iced drinks', '`r_rain`: between rain and iced drinks', 'A scatter of temperature against iced drinks'],
    out: 'Two correlations and a scatter.',
  },
},
'st-22': {
  explain: [
    'The usual correlation, **Pearson\'s r**, can be dragged about by a single extreme point.',
    'One typo can turn a strong link upside down.',
    '**Spearman\'s** correlation ranks the values first (1st, 2nd, 3rd) and then correlates the ranks.',
    'A wild value just becomes "the biggest", however big it really is.',
    'It\'s `a.corr(b, method="spearman")`. When the two disagree a lot, go looking for an outlier.',
  ],
  example: {
    say: 'Here five pairs rise together in perfect order, but the last value is huge.',
    code: `a = pd.Series([1, 2, 3, 4, 5])
b = pd.Series([2, 3, 4, 5, 100])
print(round(a.corr(b), 2), round(a.corr(b, method="spearman"), 2))`,
    lines: [
      ['a.corr(b)', "Pearson: well below 1, because 100 is far off any straight line."],
      ['method="spearman"', 'the order is perfect, so the rank correlation is exactly 1.'],
    ],
  },
  brief: {
    story: 'The marketing report says adverts and sign-ups barely move together. Someone suspects a typo.',
    get: [['The starter makes `weeks`: 12 weeks of advert spend and sign-ups. Week 1\'s sign-ups were typed as 300 instead of 30.']],
    want: ['`pearson`: the usual correlation between ads and sign-ups', '`spearman`: the rank correlation', '`pearson_fixed`: the usual correlation without week 1'],
    out: 'Three correlations.',
  },
},
'st-23': {
  explain: [
    '`stats.linregress(x, y)` fits the straight line y = intercept + slope × x that sits closest to the points. This is **linear regression**.',
    'The **slope** is the story. It\'s how much y changes for each extra 1 of x.',
    '**r²**, the correlation squared, is the share of y\'s ups and downs that the line accounts for.',
    'To predict, put a value into the line: intercept + slope × x.',
    'Only predict inside the range you\'ve actually seen. The line knows nothing beyond it.',
  ],
  example: {
    say: 'Here a line is fitted through four points, then used to predict a fifth.',
    code: `from scipy import stats
fit = stats.linregress([1, 2, 3, 4], [3, 5, 7, 9.5])
print(round(fit.slope, 2), round(fit.intercept, 2), round(fit.rvalue ** 2, 3))
print(round(fit.intercept + fit.slope * 5, 2))`,
    lines: [
      ['fit.slope', 'about 2.15: y rises by that much for each step of x.'],
      ['fit.rvalue ** 2', 'r², very close to 1: the line fits almost perfectly.'],
      ['intercept + slope * 5', "the line's prediction for x = 5."],
    ],
  },
  brief: {
    story: 'The kiosk owner wants to order iced drink stock from the weather forecast.',
    get: [GOT_HEAT],
    want: ['`fit`: a line through iced drinks against temperature, with `stats.linregress`', '`slope` and `r_squared`', '`at_25`: the iced drinks the line predicts for a 25°C day'],
    out: 'A slope, an r² and a prediction.',
  },
},
'st-24': {
  explain: [
    'A **residual** is what a fitted line got wrong for one point: the real value minus the prediction.',
    '`np.polyfit(x, y, 1)` fits a line, and `np.polyval(fit, x)` gives its predictions.',
    'Use 2 instead of 1 and `polyfit` fits a curve that can bend once.',
    'Plot the residuals against x. A shapeless cloud around 0 means the line caught the pattern.',
    'A curve or a funnel in the residuals means it didn\'t.',
  ],
  example: {
    say: 'Here a straight line is fitted to points on a curve, and then a curve is.',
    code: `x = np.array([0, 1, 2, 3, 4])
y = x ** 2
line = np.polyfit(x, y, 1)
print(np.round(y - np.polyval(line, x), 1))
curve = np.polyfit(x, y, 2)
print(np.round(y - np.polyval(curve, x), 1))`,
    lines: [
      ['the line\'s residuals', 'up, down, down, down, up: a pattern left behind, so the line missed the bend.'],
      ['the curve\'s residuals', 'all about 0: the curve fits exactly.'],
    ],
  },
  brief: {
    story: 'The kiosk owner tried a straight line for hot drinks too, and the forecasts keep missing.',
    get: [GOT_HEAT],
    want: ['A straight line for hot drinks against temperature, and `residuals`', 'Draw the residuals against temperature', 'A curve (2 instead of 1), and `curve_residuals`', '`line_spread` and `curve_spread`: the standard deviation of each'],
    out: 'A chart of residuals, and two spreads: the curve\'s smaller.',
  },
},
'st-25': {
  explain: [
    'Two things can move together because a third thing is driving both of them.',
    'Hot days sell more iced drinks **and** more sun cream, but sun cream doesn\'t make anyone thirsty.',
    'That third thing is called a **lurking variable**, or a confounder.',
    'So hold it steady and look again. Among days with similar temperatures, does the link survive?',
    '`pd.qcut(values, 8)` splits values into 8 bands with the same number of days in each.',
  ],
  example: {
    say: 'Here eight temperatures are split into four bands of two days each.',
    code: `temps = pd.Series([5, 8, 12, 15, 20, 25, 28, 30])
pd.qcut(temps, 4)`,
    lines: [
      ['pd.qcut(temps, 4)', 'four bands, each holding two of the days.'],
      ['the labels', 'each band is shown as a range: the lowest temperature in it up to the highest.'],
    ],
  },
  brief: {
    story: 'A sun cream brand wants to sponsor the iced drinks, because "their customers are our customers".',
    get: [GOT_HEAT],
    want: ['`overall`: the correlation between iced drinks and sun cream', '`band`: 8 equal-sized temperature bands, as a column', '`within`: the correlation inside each band, and `within_avg`: their average'],
    out: 'A strong overall correlation, and a much weaker one within bands.',
  },
},
'st-26': {
  explain: [
    'To ask whether two categories are linked, count every combination in a table.',
    'The **chi-square test** compares those counts with what you\'d expect if the two had nothing to do with each other.',
    '`stats.chi2_contingency(table)` hands back four things: the statistic, the p-value, the degrees of freedom and the expected counts.',
    'A small p tells you they\'re linked, but not where.',
    'So set the real counts next to the expected ones to see which cells stand out.',
  ],
  example: {
    say: 'Here members and guests are compared on whether they joined a tasting.',
    code: `from scipy import stats
t = pd.DataFrame({"yes": [30, 10], "no": [20, 40]}, index=["members", "guests"])
chi2, p, dof, expected = stats.chi2_contingency(t)
print(round(p, 4))
print(expected)`,
    lines: [
      ['chi2, p, dof, expected = ...', 'the four results, each given a name.'],
      ['p', 'tiny: membership and joining are linked.'],
      ['expected', 'what each cell would hold if they were not: 20, 30, 20, 30.'],
    ],
  },
  brief: {
    story: 'The menu team suspects people order differently in the afternoon.',
    get: [['The starter makes `table`: 280 orders, morning or afternoon, against hot coffee, tea or a cold drink.']],
    want: ['Run the test on `table` into `chi2, p, dof, expected`', '`linked`: True if p is below 0.05', '`biggest`: the (time, drink) pair furthest above its expected count', '`cafe_p`: the same test for city against drink in `cafe`'],
    out: 'A True or False, a pair, and a p-value.',
  },
},
'st-27': {
  explain: [
    'Sometimes the question is whether counts fit a pattern you had in mind, like "every weekday is equally busy".',
    'That\'s a **goodness-of-fit** test.',
    '`stats.chisquare(counts)` tests the counts against all being equal.',
    'Give it `f_exp=` to test against a different pattern. The expected counts need to add up to the same total.',
    'A small p says the pattern doesn\'t fit.',
  ],
  example: {
    say: 'Here two dice are rolled 120 times each: one fair, one loaded towards six.',
    code: `from scipy import stats
print(round(stats.chisquare([18, 22, 19, 21, 20, 20]).pvalue, 3))
print(stats.chisquare([10, 10, 10, 10, 10, 70]).pvalue)`,
    lines: [
      ['[18, 22, 19, 21, 20, 20]', 'close to 20 each: p is high, so it fits "all equal".'],
      ['[10, 10, 10, 10, 10, 70]', 'far too many sixes: p is tiny.'],
    ],
  },
  brief: {
    story: 'The rota gives every day the same staff. The door counter suggests that is wrong.',
    get: [['The starter makes `door`: a month of door counts, added up by weekday.'], ["The shop's `orders` are loaded, with `order_date`."]],
    want: ['`p_door`: the p-value for every weekday being equally busy at the door', '`by_day`: online orders counted by weekday, Monday first', '`p_orders`: the same test on those'],
    out: 'Two p-values.',
  },
},
'st-28': {
  explain: [
    'When the same people are measured twice, before and after something, compare each person with themselves.',
    'The **paired t-test** works on those differences.',
    'People differ a lot from each other. Pairing cancels that out, so the test can spot a small, steady change.',
    '`stats.ttest_rel(after, before)` is the paired test.',
    '`stats.ttest_ind` would treat them as two groups of strangers and throw the pairing away.',
  ],
  example: {
    say: 'Here four people each improve by about half a point, from very different starting places.',
    code: `from scipy import stats
before = np.array([5.0, 6, 7, 8])
after = before + np.array([0.5, 0.4, 0.6, 0.5])
print(after - before)
print(round(stats.ttest_rel(after, before).pvalue, 4))`,
    lines: [
      ['after - before', 'every one went up by about 0.5.'],
      ['stats.ttest_rel', 'tiny p: a steady gain, even though the people differ by much more than 0.5.'],
    ],
  },
  brief: {
    story: 'The training manager wants proof that the training day made baristas faster.',
    get: [['The starter sets `before` and `after`: drinks an hour for 12 baristas.']],
    want: ['`mean_gain`: the average change', '`p_paired`: from `stats.ttest_rel(after, before)`', '`p_unpaired`: from `stats.ttest_ind(after, before)`'],
    out: 'A gain and two p-values: only one under 0.05.',
  },
},
'st-29': {
  explain: [
    'Comparing three groups with t-tests means three pairs, and the many-tests problem all over again.',
    '**ANOVA** asks one question first: could all the group means be the same?',
    '`stats.f_oneway(a, b, c)` weighs how far apart the group means are against how spread out each group is.',
    'A small p says at least one group differs, but not which one.',
    'Then look at the means, and use corrected pairwise tests.',
  ],
  example: {
    say: 'Here three groups that look alike are tested, then three that clearly differ.',
    code: `from scipy import stats
print(round(stats.f_oneway([5, 6, 7], [5, 6, 7], [5, 6, 8]).pvalue, 3))
print(round(stats.f_oneway([1, 2, 3], [5, 6, 7], [9, 10, 11]).pvalue, 5))`,
    lines: [
      ['the first three', 'almost the same: p is high.'],
      ['the second three', 'far apart and tight inside: p is tiny.'],
    ],
  },
  brief: {
    story: 'Customers complain about waits at one branch. Are the branches really different?',
    get: [['The starter makes `waits`: 40 timed waits at each of three branches.'], GOT_CAFE],
    want: ['`p_waits`: the ANOVA p-value for waits at the three branches', '`p_cups`: the same for cups a day across the three cities in `cafe`'],
    out: 'Two p-values.',
  },
},
'st-30': {
  explain: [
    'A t-test compares means. With lopsided data and only a few values, one huge value can swing a mean, and the test along with it.',
    'A **rank test** compares the groups by order instead.',
    '`stats.mannwhitneyu(a, b)` ranks every value from both groups together and asks whether one group\'s ranks run higher.',
    'It answers "does one group tend to be bigger?" rather than "are the means different?"',
    'Reach for it with spending, waiting times and incomes: long tails, few values.',
  ],
  example: {
    say: 'Here one group is bigger in every value, but its last value is enormous.',
    code: `from scipy import stats
a = [1, 2, 3, 4, 5]
b = [6, 7, 8, 9, 1000]
print(round(stats.ttest_ind(a, b, equal_var=False).pvalue, 3))
print(round(stats.mannwhitneyu(a, b).pvalue, 3))`,
    lines: [
      ['ttest_ind', 'the 1000 makes b so spread out that the t-test is unsure: a large p.'],
      ['mannwhitneyu', 'every b ranks above every a: a small p.'],
    ],
  },
  brief: {
    story: 'Marketing wants to know whether a voucher makes people spend more. One office order throws the numbers.',
    get: [['The starter makes `plain` and `voucher`: 30 basket values each, in £, with one huge plain order.']],
    want: ["`p_t`: Welch's t-test p-value for voucher against plain", '`p_rank`: the Mann-Whitney p-value', '`median_gap`: the voucher median minus the plain median'],
    out: 'Two p-values that disagree, and a gap in £.',
  },
},
'st-31': {
  explain: [
    'If the city made no difference, the labels "Nairobi" and "Lagos" are just stickers. Shuffling them wouldn\'t change anything.',
    'That\'s the idea behind a **permutation test**.',
    'Shuffle the labels thousands of times, and work out the gap each time.',
    'The share of shuffled gaps as big as the real one is your p-value, built by hand.',
    'No formulas and no bell-curve assumptions, just the data and a loop.',
  ],
  example: {
    say: 'Here six values, three per group, are shuffled three times and split again.',
    code: `rng = np.random.default_rng(3)
both = np.array([5, 6, 7, 10, 11, 12])
for _ in range(3):
    s = rng.permutation(both)
    print(s, round(s[:3].mean() - s[3:].mean(), 2))`,
    lines: [
      ['the real split', '5, 6, 7 against 10, 11, 12: a gap of −5.'],
      ['rng.permutation(both)', 'the same values in a random order: labels gone.'],
      ['s[:3] and s[3:]', 'the first three called one group, the rest the other. Shuffled gaps are mostly smaller.'],
    ],
  },
  brief: {
    story: 'A board member doesn\'t trust p-value formulas. Build the p-value from the data itself.',
    get: [GOT_CAFE, ['The starter sets `nai`, `lag`, `real_gap` and `both`: every day\'s cups from the two cities, labels gone.']],
    want: ['With `rng = np.random.default_rng(7)`, shuffle `both` 5,000 times', 'Each time, the first `len(nai)` are "Nairobi" and the rest "Lagos"', '`gaps`: the gap between their means each time', '`p_perm`: the share of gaps at least as big as the real one, ignoring the sign'],
    out: 'A p-value, close to the t-test\'s.',
  },
},
'st-32': {
  explain: [
    'An **A/A test** splits visitors between two identical pages. There\'s nothing to find.',
    'So any "significant" result is a **false alarm**.',
    'At the 0.05 line, about 1 test in 20 comes up significant anyway.',
    'That\'s exactly what 0.05 means: the false-alarm rate you\'ve agreed to live with.',
    'Simulate it to really believe it. Run lots of experiments where nothing changes, and count the alarms.',
  ],
  example: {
    say: 'Here a fair coin is tossed 100 times, over and over, and checked to see if it looks unfair.',
    code: `rng = np.random.default_rng(2)
heads = rng.binomial(100, 0.5, 1000)
print(((heads >= 60) | (heads <= 40)).mean())`,
    lines: [
      ['rng.binomial(100, 0.5, 1000)', '1,000 runs of 100 fair tosses.'],
      ['heads >= 60 or <= 40', 'a result that looks unfair.'],
      ['.mean()', 'about 1 run in 15 does, though the coin is fair every time.'],
    ],
  },
  brief: {
    story: 'The product team ran an A/A test as a check, and it came up "significant". Should they panic?',
    get: [GOT_PVALUE],
    want: ['Run 1,000 A/A tests: both pages at 10%, 500 visitors each, with the starter\'s `rng`', '`p_values`: every p-value', '`false_alarms`: the share below 0.05'],
    out: '`false_alarms` is close to 0.05.',
  },
},
'st-33': {
  explain: [
    '**Power** is the chance that a test spots an effect that really is there.',
    'A test with low power usually says "nothing found", even when there was something to find.',
    'Simulate it: give one version a real lift, run the experiment many times, and count how often p comes in under 0.05.',
    'More data gives you more power.',
    'Work it out before the experiment, not after a disappointing result.',
  ],
  example: {
    say: 'Here a coin that really lands heads 60% of the time is tossed 20 times, then 200 times, again and again.',
    code: `rng = np.random.default_rng(5)
small = rng.binomial(20, 0.6, 1000)
big = rng.binomial(200, 0.6, 1000)
print("20 tosses:", (small >= 15).mean())
print("200 tosses:", (big >= 114).mean())`,
    lines: [
      ['15 of 20, 114 of 200', 'counts a fair coin would rarely reach: enough to call the coin unfair.'],
      ['20 tosses', 'the biased coin only gets there now and then: low power.'],
      ['200 tosses', 'it gets there most of the time.'],
    ],
  },
  brief: {
    story: 'Page B really converts 12% against page A\'s 10%. Will the experiment the team planned even notice?',
    get: [GOT_PVALUE, ["The starter's `one_test(n)` runs one experiment with n visitors a page, and says whether it found the lift."]],
    want: ['`power_500`: the share of 1,000 experiments with 500 visitors a page that find the lift', '`power_2000`: the same with 2,000 visitors a page'],
    out: 'Two shares: the second much higher.',
  },
},
'st-34': {
  explain: [
    'Checking an A/B test every day and stopping the moment p dips under 0.05 sounds sensible. It isn\'t.',
    'Every look is one more chance for luck to cross the line.',
    'Simulate A/A tests, where nothing changes, checked after each of 20 days, and far more than 5% dip under 0.05 at some point.',
    'That\'s called **peeking**.',
    'Decide the sample size first and look once at the end, or use methods built for repeated looks.',
  ],
  example: {
    say: 'Here\'s the extreme case: 20 looks, each a fresh 5% chance of a false alarm.',
    code: `rng = np.random.default_rng(8)
looks = rng.uniform(0, 1, (1000, 20))
print((looks[:, -1] < 0.05).mean())
print((looks < 0.05).any(axis=1).mean())`,
    lines: [
      ['looks[:, -1] < 0.05', 'one look at the end: about 5% false alarms.'],
      ['.any(axis=1)', 'an alarm on any of 20 looks: about 60%. Real daily looks share data, so the rise is smaller, but it is still a rise.'],
    ],
  },
  brief: {
    story: 'A product manager checks the test dashboard every morning and wants to stop as soon as it goes green.',
    get: [GOT_PVALUE, ["The starter's `one_experiment()` runs 20 days of an A/A test and gives the p-value after each day."]],
    want: ['`runs`: 500 experiments', '`peeked`: the share whose p-value dipped under 0.05 on any day', '`looked_once`: the share under 0.05 on the last day'],
    out: 'Two shares: `peeked` far above `looked_once`.',
  },
},
'st-35': {
  explain: [
    'Pick out this month\'s worst performers, and next month they usually look better, even if nobody did anything.',
    'Part of a bad month was bad luck, and luck doesn\'t repeat.',
    'This is **regression to the mean**. The best performers slip back in just the same way.',
    'It tricks people into crediting whatever happened in between: a new manager, a pep talk, a warning letter.',
    'So always compare with a group that got nothing. If the untouched worst improved too, the "fix" may just have been luck.',
  ],
  example: {
    say: 'Here 1,000 people roll a die twice, and the ones who rolled low the first time are followed up.',
    code: `rng = np.random.default_rng(12)
first = rng.integers(1, 7, 1000)
second = rng.integers(1, 7, 1000)
low = first <= 2
print(round(first[low].mean(), 2), round(second[low].mean(), 2))`,
    lines: [
      ['first[low].mean()', 'the low rollers averaged about 1.5 the first time.'],
      ['second[low].mean()', 'the second time, about 3.5, like everyone else. Nothing changed but luck.'],
    ],
  },
  brief: {
    story: 'Head office sent warning letters to the 10 worst branches, and their scores rose. The letters are being called a success.',
    get: [['The starter makes `branches`: 40 branches, each scored in month1 and month2. Nothing changed between the months.']],
    want: ['`worst`: the 10 lowest month1 scores, and `worst_m1` and `worst_m2`: their averages each month', '`best`, `best_m1` and `best_m2`: the same for the 10 best'],
    out: 'Four averages: the worst rise and the best fall.',
  },
},
};
