/* seaborn (sb-01 to sb-15): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). Each example draws a different
   chart from the task's, so its picture never gives the answer away. */

const CAFE = { date: 'the day', city: 'Lagos, Accra or Nairobi', drink: 'latte, espresso, cold brew or tea', cups: 'cups sold that day', price: 'the price of a cup', revenue: "that day's takings", rating: "the customers' rating out of 5, missing on 9 days" };
const GOT_CAFE = ['`cafe` has one row per day:', CAFE];

export const SEABORN_DETAIL = {
'sb-01': {
  explain: [
    '**seaborn** is a charting toolkit built on matplotlib. It understands pandas tables, so charts take less code.',
    '`import seaborn as sns` brings it in, called `sns` for short.',
    'Every seaborn chart follows one pattern: `data=` the table, then the columns by **name**, in quotes, like `x="cups"`.',
    '`sns.histplot(data=cafe, x="cups")` is a histogram of the cups column, with its axis labelled for you.',
    "`sns.set_theme()` switches on seaborn's tidier look for every chart after it.",
  ],
  example: {
    say: 'Here is how the prices are spread, in 10 bins.',
    code: `import seaborn as sns

sns.set_theme()
sns.histplot(data=cafe, x="price", bins=10)
plt.show()`,
    lines: [
      ['data=cafe', 'the table to draw from.'],
      ['x="price"', 'the column, by name. seaborn labels the axis with it.'],
      ['bins=10', 'ten slices of the price range.'],
    ],
  },
  brief: {
    story: 'The owner wants to see what a normal day\'s takings look like.',
    get: [GOT_CAFE],
    want: ['A histogram of `revenue`', 'With 20 bins'],
    out: 'A histogram with 20 bars.',
  },
},
'sb-02': {
  explain: [
    '`sns.countplot(data=..., x="city")` counts the rows in each group and draws a bar for each. No groupby needed.',
    '`sns.barplot(data=..., x=..., y=...)` is different: each bar is the **average** of the y column for that group.',
    'The thin line on top of each bar shows how sure that average is. A long line means the days vary a lot.',
    'countplot answers "how many?"; barplot answers "how much, on average?"',
  ],
  example: {
    say: 'Here is the average rating for each drink.',
    code: `sns.set_theme()
sns.barplot(data=cafe, x="drink", y="rating")
plt.show()`,
    lines: [
      ['x="drink"', 'one bar per drink.'],
      ['y="rating"', 'each bar is the average rating for that drink. Missing ratings are skipped.'],
    ],
  },
  brief: {
    story: 'Head office wants to know which city takes the most on a typical day.',
    get: [GOT_CAFE],
    want: ['Show the **average revenue** per `city`, using `barplot`'],
    out: 'Three bars, each with its thin line.',
  },
},
'sb-03': {
  explain: [
    '`hue="city"` colours the dots, bars or lines by another column. It is seaborn\'s best trick.',
    'It adds the key, the **legend**, for you.',
    'Each colour is one group, so one chart becomes a comparison.',
    'It works on nearly every seaborn chart: scatterplot, lineplot, histplot, barplot.',
  ],
  example: {
    say: 'Here each day is a dot, price against cups, coloured by drink.',
    code: `sns.set_theme()
sns.scatterplot(data=cafe, x="price", y="cups", hue="drink")
plt.show()`,
    lines: [
      ['hue="drink"', 'a colour for each drink, and a legend saying which is which.'],
    ],
  },
  brief: {
    story: 'The regional manager wonders whether the cups-to-money link differs by city.',
    get: [GOT_CAFE],
    want: ['Colour the starter\'s scatter by `city`'],
    out: 'The same scatter, in three colours, with a legend.',
  },
},
'sb-04': {
  explain: [
    '`sns.lineplot(data=..., x="date", y="revenue")` draws a line over time, and handles dates properly.',
    'When several rows share one x value, it draws their **average** at that point.',
    'It also shades a band around the line, showing how sure that average is.',
    '`errorbar=None` turns the band off when you just want the line.',
    '`hue=` gives one line per group.',
  ],
  example: {
    say: 'Here the cups are averaged month by month, with the band showing how sure each average is.',
    code: `sns.set_theme()
cafe["month"] = cafe["date"].dt.month
sns.lineplot(data=cafe, x="month", y="cups")
plt.show()`,
    lines: [
      ['cafe["month"] = ...', 'a month number for each day, 1 to 4.'],
      ['x="month"', 'about 30 days share each month, so the line is their average.'],
      ['the shaded band', 'how sure each monthly average is.'],
    ],
  },
  brief: {
    story: 'The owner wants the three cities\' takings over the first two months, side by side.',
    get: [GOT_CAFE],
    want: ['One line per `city`', 'Over the first 60 days'],
    out: 'Three coloured lines with a legend.',
  },
},
'sb-05': {
  explain: [
    'An average hides a lot. A **boxplot** shows how the values are spread.',
    'The box covers the middle half of the values. The line inside it is the **median**, the middle value.',
    'The whiskers reach out to the rest, and separate dots mark unusual values.',
    'A tall box means the days vary a lot; a short one means they are steady.',
    '`sns.boxplot(data=..., x="group", y="number")` draws one box per group.',
  ],
  example: {
    say: 'Here is how the ratings spread in each city.',
    code: `sns.set_theme()
sns.boxplot(data=cafe, x="city", y="rating")
plt.show()`,
    lines: [
      ['x="city"', 'one box per city.'],
      ['y="rating"', 'the spread of the ratings in that city.'],
    ],
  },
  brief: {
    story: 'The owner asks whether some drinks bring in steadier money than others.',
    get: [GOT_CAFE],
    want: ['Compare `revenue` across `drink` with a boxplot'],
    out: 'Four boxes, one per drink.',
  },
},
'sb-06': {
  explain: [
    'A **heatmap** draws a table as coloured squares: the colour shows how big each number is.',
    'Give it any grid of numbers, like a pivot table or a crosstab.',
    '`annot=True` writes the numbers in the squares too.',
    '`fmt=".1f"` shows them to 1 decimal place, and `cmap=` picks the colours.',
    'Your eye finds the biggest and smallest squares straight away.',
  ],
  example: {
    say: 'Here is how many days each city sold each drink, as coloured squares.',
    code: `sns.set_theme()
sns.heatmap(pd.crosstab(cafe["city"], cafe["drink"]), annot=True)
plt.show()`,
    lines: [
      ['pd.crosstab(...)', 'a grid of counts: cities down the side, drinks across.'],
      ['annot=True', 'writes each count in its square.'],
    ],
  },
  brief: {
    story: 'The menu team wants to see, in one picture, which drink sells best where.',
    get: [GOT_CAFE],
    want: ['A heatmap of the average `cups` for every city and drink pair', 'With the numbers shown'],
    out: 'A grid of three cities by four drinks.',
  },
},
'sb-07': {
  explain: [
    'Some seaborn charts can split into **panels**: one small chart per group, side by side.',
    'They are `relplot` (scatters and lines), `catplot` (bars and boxes) and `displot` (histograms).',
    '`col="city"` gives one panel per city.',
    'All the panels share the same scales, so they compare fairly.',
    "They build their own picture, so don't start them with `plt.subplots()`.",
  ],
  example: {
    say: 'Here is a histogram of the cups for each city, in its own panel.',
    code: `sns.set_theme()
sns.displot(data=cafe, x="cups", col="city", height=2.6)
plt.show()`,
    lines: [
      ['col="city"', 'one panel per city.'],
      ['height=2.6', 'how tall each panel is, so three fit across.'],
    ],
  },
  brief: {
    story: 'The menu team wants the cups-to-money scatter split up by drink.',
    get: [GOT_CAFE],
    want: ['One panel per `drink`', 'Coloured by `city`'],
    out: 'Four panels, each a coloured scatter.',
  },
},
'sb-08': {
  explain: [
    '`sns.pairplot(table)` draws a scatter of every number column against every other, in a grid.',
    "Down the diagonal, each column meets itself, so it shows how that column's values are spread instead.",
    'It is the fastest way to get to know a table you have never seen.',
    '`hue=` colours every panel by a group.',
    'Keep the columns few: four columns already make sixteen panels.',
  ],
  example: {
    say: 'Here two columns meet each other, coloured by drink.',
    code: `sns.set_theme()
sns.pairplot(cafe[["cups", "rating", "drink"]], hue="drink", height=1.8)
plt.show()`,
    lines: [
      ['cafe[["cups", "rating", "drink"]]', 'two number columns, plus drink for the colours.'],
      ['the diagonal', 'how cups and rating are each spread, one curve per drink.'],
    ],
  },
  brief: {
    story: 'A new analyst wants a first look at how all the café\'s numbers relate.',
    get: [GOT_CAFE],
    want: ['Include `rating` too', 'Colour the points by `city`'],
    out: 'A grid of panels: four columns against each other.',
  },
},
'sb-09': {
  explain: [
    '`sns.set_theme(style=..., palette=...)` sets the look for every chart after it.',
    'Styles change the background: `whitegrid`, `darkgrid`, `white` and `ticks`.',
    'Palettes change the colours: `deep`, `muted`, `rocket`, `mako` and `Set2`.',
    '`sns.despine()` takes away the top and right edges, for a cleaner look.',
    'Pick one look and use it for a whole report, so the charts belong together.',
  ],
  example: {
    say: 'Here is a count of days per drink, in the whitegrid style with the Set2 palette.',
    code: `sns.set_theme(style="whitegrid", palette="Set2")
sns.countplot(data=cafe, x="drink", hue="drink")
plt.show()`,
    lines: [
      ['style="whitegrid"', 'a white background with grid lines.'],
      ['palette="Set2"', 'soft colours, one per drink.'],
    ],
  },
  brief: {
    story: 'The brand team wants the charts to match the new report design.',
    get: [GOT_CAFE],
    want: ['Switch the style to `"ticks"` and the palette to `"rocket"`', 'Add a title'],
    out: 'The bar chart in the new look.',
  },
},
'sb-10': {
  explain: [
    '`sns.regplot(data=..., x=..., y=...)` draws the scatter **and** the straight line that fits it best.',
    'A line sloping up means the two rise together. A flat line means no link.',
    'The shaded band around the line shows how sure that line is.',
    '`scatter_kws={"alpha": 0.5}` makes the dots see-through.',
    '`sns.lmplot` does the same, and can split into panels with `col=`.',
  ],
  example: {
    say: 'Here is the best-fit line through rating and revenue.',
    code: `sns.set_theme()
sns.regplot(data=cafe, x="rating", y="revenue")
plt.show()`,
    lines: [
      ['x="rating", y="revenue"', 'one dot per day.'],
      ['the line', 'it dips a little, but the band is wide and the dots are scattered everywhere: no real link between rating and takings here.'],
    ],
  },
  brief: {
    story: 'The owner wants to prove that more cups means more money.',
    get: [GOT_CAFE],
    want: ['Fit a line through `cups` (along the bottom) against `revenue` (up the side)'],
    out: 'A scatter with a best-fit line.',
  },
},
'sb-11': {
  explain: [
    'A boxplot summarises the spread in five numbers. A **violin** draws its whole shape.',
    '`sns.violinplot(data=..., x=..., y=...)` takes the same settings as boxplot.',
    'Wide parts mean "lots of days looked like this"; thin parts, "few did".',
    'A small boxplot is drawn inside each violin.',
    'Two humps in one violin mean two kinds of day mixed together.',
  ],
  example: {
    say: 'Here is the shape of the prices in each city.',
    code: `sns.set_theme()
sns.violinplot(data=cafe, x="city", y="price")
plt.show()`,
    lines: [
      ['x="city", y="price"', 'one violin per city.'],
      ['the width', 'how many days had that price.'],
    ],
  },
  brief: {
    story: 'The owner wants to see the whole shape of each drink\'s takings, not just a box.',
    get: [GOT_CAFE],
    want: ['A violin of `revenue` for each `drink`', 'A title'],
    out: 'Four violins.',
  },
},
'sb-12': {
  explain: [
    "`sns.kdeplot` draws a smooth curve of how the values are spread, instead of a histogram's blocky bars.",
    'High parts of the curve are the common values.',
    '`fill=True` shades under the curve.',
    '`hue=` gives one curve per group, all on the same chart.',
    'Use it when the **shape** matters more than the exact counts.',
  ],
  example: {
    say: 'Here is one curve per drink for the cups, without shading.',
    code: `sns.set_theme()
sns.kdeplot(data=cafe, x="cups", hue="drink")
plt.show()`,
    lines: [
      ['x="cups"', 'how the cups are spread.'],
      ['hue="drink"', 'one curve per drink, so the shapes can be compared.'],
    ],
  },
  brief: {
    story: 'The regional manager wants to compare the shape of each city\'s takings.',
    get: [GOT_CAFE],
    want: ['One filled curve per `city`', 'All on the same chart'],
    out: 'Three shaded curves, overlapping.',
  },
},
'sb-13': {
  explain: [
    'A boxplot summarises. `sns.stripplot` shows every single day as a dot.',
    "`jitter=True` spreads the dots sideways a little, so they don't hide behind each other.",
    '`size=` sets how big the dots are.',
    'Draw the dots over a box and you get both: the summary, and the evidence behind it.',
    'Two seaborn calls before one `plt.show()` draw on the same chart.',
  ],
  example: {
    say: 'Here every day\'s revenue is a dot, grouped by city.',
    code: `sns.set_theme()
sns.stripplot(data=cafe, x="city", y="revenue", jitter=True, size=3)
plt.show()`,
    lines: [
      ['sns.stripplot', 'one dot per day.'],
      ['jitter=True', 'spread sideways so the dots can be seen.'],
    ],
  },
  brief: {
    story: 'A manager doesn\'t trust the boxplot, and wants to see the actual days.',
    get: [GOT_CAFE],
    want: ['Keep the boxplot', 'Draw the individual days on top of it with `sns.stripplot`'],
    out: 'Four boxes with dots over them.',
  },
},
'sb-14': {
  explain: [
    '`sns.catplot` draws bar, box and strip charts, and can split them into panels.',
    '`col="city"` gives one panel per city, all sharing the same axes so they compare fairly.',
    '`kind=` picks the chart inside each panel: `"bar"`, `"box"` or `"strip"`.',
    '`height=` sets how tall each panel is, and `aspect=` how wide compared with its height.',
  ],
  example: {
    say: 'Here is a boxplot of cups for each city, with one panel per drink.',
    code: `sns.set_theme()
sns.catplot(data=cafe, x="city", y="cups", kind="box", col="drink", height=2.4, aspect=0.8)
plt.show()`,
    lines: [
      ['kind="box"', 'a boxplot in each panel.'],
      ['col="drink"', 'one panel per drink.'],
      ['height=2.4, aspect=0.8', 'small, narrow panels, so four fit across.'],
    ],
  },
  brief: {
    story: 'Each city manager wants their own drink chart, but all on one page.',
    get: [GOT_CAFE],
    want: ['One bar chart per `city`, with `sns.catplot(..., kind="bar", col="city")`'],
    out: 'Three panels of bars.',
  },
},
'sb-15': {
  explain: [
    "`sns.jointplot` draws a scatter in the middle, and how each column's values are spread along the edges.",
    'One picture, three answers: how x is spread, how y is spread, and how they move together.',
    '`kind="reg"` adds a best-fit line.',
    '`kind="hex"` groups crowded points into shaded hexagons: the darker, the more days.',
    'It builds its own picture, like relplot and catplot.',
  ],
  example: {
    say: 'Here is price against cups, with crowded areas shaded as hexagons.',
    code: `sns.set_theme()
sns.jointplot(data=cafe, x="price", y="cups", kind="hex", height=4)
plt.show()`,
    lines: [
      ['kind="hex"', 'the middle shows hexagons, darker where more days fall.'],
      ['the edges', 'how price and cups are each spread.'],
    ],
  },
  brief: {
    story: 'The owner wants the cups-to-money link and both spreads in one picture.',
    get: [GOT_CAFE],
    want: ['Draw `cups` against `revenue` as a `sns.jointplot`', 'With a fitted line (`kind="reg"`)'],
    out: 'A scatter with a line, and histograms on two edges.',
  },
},
};
