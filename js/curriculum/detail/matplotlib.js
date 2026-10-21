/* matplotlib (mp-01 to mp-15): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Each example draws a different
   chart from the task's, so its picture never gives the answer away. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, missing on 9 days" };
const GOT_CAFE = ['`cafe` has one row per day:', CAFE];

export const MATPLOTLIB_DETAIL = {
'mp-01': {
  explain: [
    '**matplotlib** is Python\'s charting toolkit.',
    '`import matplotlib.pyplot as plt` brings in its drawing tools, and everyone calls them `plt` for short.',
    '`plt.plot(x, y)` draws a line through the points, with x values along the bottom and y values up the side.',
    'Give it just one set of values and it uses their positions, 0, 1, 2 and on, along the bottom.',
    '`plt.show()` finishes the picture, and your chart appears below the code.',
  ],
  example: {
    say: 'Here\'s the price of a cup over the first two weeks.',
    code: `import matplotlib.pyplot as plt

plt.plot(cafe["price"].head(14))
plt.show()`,
    lines: [
      ['cafe["price"].head(14)', 'the first 14 prices: one point each.'],
      ['plt.plot(...)', 'joins the points with a line, the row numbers along the bottom.'],
      ['plt.show()', 'draws it.'],
    ],
  },
  brief: {
    story: 'The owner wants to see how the first month went, at a glance.',
    get: [GOT_CAFE],
    want: ['Plot the first 30 days of `cups`'],
    out: 'A line chart with 30 points.',
  },
},
'mp-02': {
  explain: [
    'A chart without labels is a puzzle. What\'s going up, and measured in what?',
    '`plt.title("...")` puts a title across the top.',
    '`plt.xlabel("...")` labels the bottom axis, and `plt.ylabel("...")` the side.',
    '`plt.grid(True)` adds faint lines, so values are easier to read off.',
    'They all go before `plt.show()`.',
  ],
  example: {
    say: 'Here the first two weeks of ratings get a title, a side label and a grid.',
    code: `plt.plot(cafe["rating"].head(14))
plt.title("Ratings, first two weeks")
plt.ylabel("Rating out of 5")
plt.grid(True)
plt.show()`,
    lines: [
      ['plt.title(...)', 'the words across the top.'],
      ['plt.ylabel(...)', 'says what the side axis measures.'],
      ['plt.grid(True)', 'faint guide lines. A missing rating leaves a gap in the line.'],
    ],
  },
  brief: {
    story: 'The chart is going in the weekly email, so it has to explain itself.',
    get: [GOT_CAFE],
    want: ['Keep the starter\'s chart and title', 'Add an x-label of `"Day"` and a y-label of `"Cups"`'],
    out: 'The same line chart, labelled on both axes.',
  },
},
'mp-03': {
  explain: [
    '`fig, ax = plt.subplots()` hands you two things at once.',
    '`fig`, the **figure**, is the whole picture. `ax`, short for **axes**, is the chart sitting inside it.',
    'You draw on `ax`: `ax.plot(...)`, `ax.bar(...)`.',
    'Labelling on `ax` starts with `set_`: `ax.set_title()`, `ax.set_xlabel()`, `ax.set_ylabel()`.',
    'Most real code works this way, because it copes well with several charts in one picture.',
  ],
  example: {
    say: 'Here\'s a chart of prices drawn on an ax, and labelled the ax way.',
    code: `fig, ax = plt.subplots()
ax.plot(cafe["price"].head(30))
ax.set_title("Price, first 30 days")
ax.set_xlabel("Day")
plt.show()`,
    lines: [
      ['fig, ax = plt.subplots()', 'makes the picture and the chart inside it.'],
      ['ax.plot(...)', 'draws on that chart.'],
      ['ax.set_title / ax.set_xlabel', 'the ax versions of title and xlabel.'],
    ],
  },
  brief: {
    story: 'The finance team wants the revenue chart finished off properly.',
    get: [GOT_CAFE],
    want: ['Using `ax`, label the y axis `"Revenue"`', 'Turn the grid on'],
    out: 'The revenue chart with a side label and a grid.',
  },
},
'mp-04': {
  explain: [
    'Lines are for things that change over time. **Bars** are for comparing separate groups.',
    '`ax.bar(labels, heights)` takes two lists of the same length: what each bar is called, and how tall it is.',
    'A groupby answer has both. `.index` holds the group names and `.values` holds the numbers.',
    'So group first, then hand those two straight to `ax.bar`.',
    '`color=` changes the colour of the bars.',
  ],
  example: {
    say: 'Here\'s the average rating in each city, as bars.',
    code: `avg = cafe.groupby("city")["rating"].mean()

fig, ax = plt.subplots()
ax.bar(avg.index, avg.values)
ax.set_title("Average rating")
plt.show()`,
    lines: [
      ['cafe.groupby("city")["rating"].mean()', 'one average per city.'],
      ['avg.index, avg.values', 'the city names for the labels, the averages for the heights.'],
    ],
  },
  brief: {
    story: 'The menu team wants to see which drink sells the most cups.',
    get: [GOT_CAFE],
    want: ['A bar chart of total `cups` per `drink`', 'Titled `"Cups by drink"`'],
    out: 'Four bars, one per drink.',
  },
},
'mp-05': {
  explain: [
    'A **scatter** asks a simple question: when this goes up, does that go up too?',
    '`ax.scatter(x, y)` draws one dot per row, at its x and y.',
    'Dots drifting up to the right mean the two rise together. A shapeless cloud means they don\'t.',
    '`alpha=0.6` makes the dots see-through, so you can still read the spots where they pile up.',
    'Label both axes, or nobody will know which number is which.',
  ],
  example: {
    say: 'Here each day is a dot, with its rating along the bottom and its cups up the side.',
    code: `fig, ax = plt.subplots()
ax.scatter(cafe["rating"], cafe["cups"], alpha=0.6)
ax.set_xlabel("Rating")
ax.set_ylabel("Cups")
plt.show()`,
    lines: [
      ['ax.scatter(cafe["rating"], cafe["cups"])', 'one dot per day. Days with no rating are left out.'],
      ['alpha=0.6', 'see-through dots.'],
      ['the shape', 'a cloud with no clear slope: a better rating doesn\'t mean more cups here.'],
    ],
  },
  brief: {
    story: 'The owner wants proof that busier days bring in more money.',
    get: [GOT_CAFE],
    want: ['Scatter `cups` (along the bottom) against `revenue` (up the side)', 'Label both axes'],
    out: 'A scatter with one dot per day.',
  },
},
'mp-06': {
  explain: [
    'A **histogram** shows how the values in one column are spread out.',
    'It chops the range into slices, called **bins**, and draws a bar for how many values land in each.',
    '`ax.hist(values, bins=20)` uses 20 bins. More bins show more detail, but get spiky.',
    'Tall bars show what\'s normal, and short bars out at the edges show what\'s rare.',
    'Up the side is a count, here of how many days.',
  ],
  example: {
    say: 'Here\'s how the prices are spread, in 8 bins.',
    code: `fig, ax = plt.subplots()
ax.hist(cafe["price"], bins=8)
ax.set_xlabel("Price")
plt.show()`,
    lines: [
      ['bins=8', 'the prices are cut into 8 equal slices.'],
      ['each bar', 'how many days had a price in that slice.'],
    ],
  },
  brief: {
    story: 'The owner wants to know what a normal day\'s takings look like.',
    get: [GOT_CAFE],
    want: ['A histogram of `revenue` with **20** bins', 'A y-label of `"Days"`'],
    out: 'A histogram with 20 bars.',
  },
},
'mp-07': {
  explain: [
    'Call `plot` twice on the same `ax` and you get two lines on one chart.',
    'Each one gets its own colour automatically.',
    'Name each line with `label="..."` as you draw it.',
    'Then call `ax.legend()` once, to show the key.',
    'Forget that call and the names never appear.',
  ],
  example: {
    say: 'Here are the cups on latte days and on tea days, as two lines with a key.',
    code: `latte = cafe[cafe["drink"] == "latte"]["cups"].head(20).values
tea = cafe[cafe["drink"] == "tea"]["cups"].head(20).values

fig, ax = plt.subplots()
ax.plot(latte, label="latte")
ax.plot(tea, label="tea")
ax.legend()
plt.show()`,
    lines: [
      ['.values', 'just the numbers, so both lines start at 0 along the bottom.'],
      ['label="latte"', 'the name for this line.'],
      ['ax.legend()', 'shows the key.'],
    ],
  },
  brief: {
    story: 'The regional manager wants Lagos and Accra compared on one chart.',
    get: [GOT_CAFE],
    want: ['Add the Accra line with its own label', 'Show the legend'],
    out: 'Two lines, with a key naming them.',
  },
},
'mp-08': {
  explain: [
    '`plt.subplots(1, 2)` makes one picture holding 1 row of 2 charts.',
    '`fig, (left, right) = plt.subplots(1, 2)` gives each chart its own name.',
    'Then draw on each one separately: `left.hist(...)`, `right.plot(...)`.',
    '`figsize=(8, 3.2)` sets the picture\'s width and height.',
    '`fig.tight_layout()` spaces the charts out so their labels don\'t bump into each other.',
  ],
  example: {
    say: 'Here two different charts sit side by side: cups over time, and how the ratings spread.',
    code: `fig, (left, right) = plt.subplots(1, 2, figsize=(8, 3.2))
left.plot(cafe["cups"].head(30).values)
left.set_title("Cups, 30 days")
right.hist(cafe["rating"].dropna(), bins=8)
right.set_title("Ratings")
fig.tight_layout()
plt.show()`,
    lines: [
      ['plt.subplots(1, 2, ...)', 'one row, two charts.'],
      ['left.plot / right.hist', 'each chart is drawn on separately.'],
      ['fig.tight_layout()', 'stops the titles and labels overlapping.'],
    ],
  },
  brief: {
    story: 'The report has room for one picture, and two charts to show.',
    get: [GOT_CAFE],
    want: ['A histogram of `revenue` in the right-hand chart', 'A title for it', 'Tidy the spacing'],
    out: 'Two histograms side by side.',
  },
},
'mp-09': {
  explain: [
    '`ax.set_ylim(low, high)` sets where the side axis starts and ends.',
    'Starting at 0 stops small ups and downs from looking dramatic.',
    '`ax.axhline(y)` draws a straight line across the chart at height y, like an average to compare against.',
    '`ax.annotate("text", xy=(x, y))` writes a note at one point.',
    '`.argmax()` gives the position of the biggest value, and `.argmin()` the smallest, which is handy for knowing where to put the note.',
  ],
  example: {
    say: 'Here the first 30 days of revenue get a fixed scale, an average line and a note on the lowest day.',
    code: `rev = cafe["revenue"].head(30)
low = rev.values.argmin()

fig, ax = plt.subplots()
ax.plot(rev.values)
ax.axhline(rev.mean(), color="grey", linestyle="--")
ax.set_ylim(0, 350)
ax.annotate("Low", xy=(low, rev.min()))
plt.show()`,
    lines: [
      ['rev.values.argmin()', 'the position of the lowest day.'],
      ['ax.axhline(rev.mean(), ...)', 'a dashed line at the average.'],
      ['ax.annotate("Low", xy=...)', 'writes Low at that point.'],
    ],
  },
  brief: {
    story: 'The chart for the board needs a fair scale and its best day pointed out.',
    get: [GOT_CAFE],
    want: ['Make the side axis run from `0` to `70`', 'Label the highest point with the word `"Peak"`'],
    out: 'The cups chart, scaled 0 to 70, with Peak written at the top point.',
  },
},
'mp-10': {
  explain: [
    'Every pandas table and column has `.plot()` built in, with matplotlib doing the drawing underneath.',
    '`kind=` picks the chart: `"line"`, `"bar"`, `"barh"` (bars on their side), `"hist"`, `"box"` or `"area"`.',
    'It labels the chart from your column names for free.',
    'You can still add `plt.title(...)` and the rest afterwards.',
    'For a quick look it\'s the fastest way there is. For a finished chart, `ax` gives you more control.',
  ],
  example: {
    say: 'Here\'s a box plot of the cups, straight from pandas.',
    code: `cafe[["cups"]].plot(kind="box")
plt.show()`,
    lines: [
      ['kind="box"', 'a box plot: the box is the middle half of the days, the line in it the median.'],
      ['the whiskers', 'reach out to the lowest and highest days.'],
    ],
  },
  brief: {
    story: 'The menu team wants a quick ranking of drinks by cups.',
    get: [GOT_CAFE],
    want: ['A **horizontal** bar chart of total cups per drink', 'A title'],
    out: 'Four bars lying on their side.',
  },
},
'mp-11': {
  explain: [
    'You can change how a line looks with `color=`, `linewidth=`, `linestyle=` and `marker=`, which puts a shape at each point.',
    'Line styles include `"-"` (solid), `"--"` (dashed) and `":"` (dotted).',
    'Markers include `"o"` (circles), `"s"` (squares) and `"^"` (triangles).',
    'There\'s a shorthand too: `"ro--"` means red, circles, dashed.',
    '`alpha` runs from 0 (invisible) to 1 (solid), and helps where lines overlap.',
  ],
  example: {
    say: 'Here the first 15 days of revenue are drawn green, with triangles, dotted, using the shorthand.',
    code: `plt.plot(cafe["revenue"].head(15).values, "g^:")
plt.show()`,
    lines: [
      ['"g^:"', 'g for green, ^ for triangles, : for a dotted line.'],
    ],
  },
  brief: {
    story: 'The chart has to stand out in a busy slide.',
    get: [GOT_CAFE],
    want: ['Plot the first 20 cups as a **red, dashed** line', 'With **circle** markers'],
    out: 'One red dashed line with a circle at each point.',
  },
},
'mp-12': {
  explain: [
    'Some numbers live on very different scales. Plot them on one axis and the smaller one looks flat.',
    '`ax2 = ax.twinx()` adds a second scale up the right-hand side, sharing the same bottom axis.',
    'Draw one line on `ax` and the other on `ax2`.',
    'Label both sides, or nobody can tell which line belongs to which scale.',
    'Colouring each label to match its line helps too.',
  ],
  example: {
    say: 'Here weekly average cups sit on the left scale, and the weekly average rating on the right.',
    code: `weekly = cafe.set_index("date")[["cups", "rating"]].resample("W").mean()

fig, ax = plt.subplots()
ax.plot(weekly.index, weekly["cups"], color="tab:blue")
ax.set_ylabel("cups")
ax2 = ax.twinx()
ax2.plot(weekly.index, weekly["rating"], color="tab:green")
ax2.set_ylabel("rating")
plt.show()`,
    lines: [
      ['resample("W").mean()', 'one average per week.'],
      ['ax2 = ax.twinx()', 'a second chart on the same bottom axis, with its own scale on the right.'],
      ['ax2.set_ylabel("rating")', 'labels the right-hand scale.'],
    ],
  },
  brief: {
    story: 'On one scale, the cups line looks flat beside revenue. The owner wants to see both properly.',
    get: [GOT_CAFE],
    want: ['Put `revenue` on its own right-hand axis with `twinx()`', 'Label both y axes'],
    out: 'Two lines, a scale on each side.',
  },
},
'mp-13': {
  explain: [
    'Long labels crash into each other under an ordinary bar chart.',
    '`ax.barh(names, values)` lays the bars on their side, so every label reads left to right.',
    'barh draws the first bar at the bottom.',
    'So sort smallest first with `.sort_values()`, and the biggest ends up on top.',
    'Sorted like that, the chart reads as a ranking.',
  ],
  example: {
    say: 'Here\'s the average price in each product category, as a sorted ranking on its side.',
    code: `cats = products.groupby("category")["price"].mean().sort_values()

fig, ax = plt.subplots()
ax.barh(cats.index, cats.values)
ax.set_xlabel("average price")
plt.show()`,
    lines: [
      ['.sort_values()', 'smallest first, so the dearest category is drawn last, at the top.'],
      ['ax.barh(...)', 'bars on their side, labels down the left.'],
    ],
  },
  brief: {
    story: 'The buyer wants a ranking of products by units sold, readable on a phone.',
    get: [['The shop\'s `order_items` (order_id, product_id, qty) and `products` (product_id, name, category, price) are loaded.']],
    want: ['The units sold as **horizontal** bars', 'Sorted, so the best seller is at the top'],
    out: 'One bar per product, the longest at the top.',
  },
},
'mp-14': {
  explain: [
    'A **stacked bar** shows a total **and** what it\'s made of, all in one bar.',
    'Start with a table where each row is a bar and each column is a layer.',
    'Then `.plot(kind="bar", stacked=True)` piles the layers up.',
    'The legend tells you which colour is which layer.',
    'Keep the layers few. Past five or so, nobody can read the middle ones.',
  ],
  example: {
    say: 'Here are the days in each city, split by which drink was sold.',
    code: `pd.crosstab(cafe["city"], cafe["drink"]).plot(kind="bar", stacked=True)
plt.ylabel("days")
plt.show()`,
    lines: [
      ['pd.crosstab(...)', 'a row per city, a column per drink: how many days of each.'],
      ['stacked=True', 'the drinks pile up into one bar per city.'],
    ],
  },
  brief: {
    story: 'Head office wants each city\'s revenue, and what makes it up, in one chart.',
    get: [GOT_CAFE],
    want: ['Draw `table` as a stacked bar chart: one bar per city, one layer per drink', 'A title'],
    out: 'Three stacked bars.',
  },
},
'mp-15': {
  explain: [
    'An average on its own hides how much the days vary.',
    '`ax.bar(x, means, yerr=spread)` adds a whisker to each bar to show the spread.',
    'Here the spread is the **standard deviation**, `.std()`: roughly, how far a typical day sits from the average.',
    'A long whisker means the days vary a lot. A short one means they\'re steady.',
    '`capsize=` puts little caps on the ends of the whiskers.',
  ],
  example: {
    say: 'Here\'s the average revenue in each city, with whiskers showing the spread.',
    code: `by_city = cafe.groupby("city")["revenue"].agg(["mean", "std"])

fig, ax = plt.subplots()
ax.bar(by_city.index, by_city["mean"], yerr=by_city["std"], capsize=6)
plt.show()`,
    lines: [
      ['.agg(["mean", "std"])', 'two columns: each city\'s average and its standard deviation.'],
      ['yerr=by_city["std"]', 'the length of each whisker.'],
    ],
  },
  brief: {
    story: 'The owner asks whether some drinks are steadier sellers than others.',
    get: [GOT_CAFE],
    want: ["Add error bars showing each drink's standard deviation", 'Label the y axis'],
    out: 'Four bars, each with a whisker.',
  },
},
};
