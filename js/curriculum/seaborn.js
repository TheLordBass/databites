export const SEABORN = [
{
  id: 'sb-01', mins: 3,
  title: 'Seaborn speaks DataFrame',
  concept: [
    'Seaborn is a charting toolkit built on matplotlib. It understands pandas tables, so charts take less code.',
    'The pattern is always the same: `data=` the table, then column **names** in quotes, like `x="cups"`.',
    '`sns.set_theme()` switches on seaborn\'s tidier look for every chart after it.',
  ],
  starter: `import seaborn as sns

sns.set_theme()
sns.histplot(data=cafe, x="cups")
plt.show()`,
  task: 'Draw a histogram of `revenue` with 20 bins instead.',
  hint: '`sns.histplot(data=cafe, x="revenue", bins=20)`',
  solution: `import seaborn as sns

sns.set_theme()
sns.histplot(data=cafe, x="revenue", bins=20)
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].patches, "The chart is empty — did histplot run?"
assert "revenue" in _labels(), "Seaborn labels the axis for you — plot x=\\"revenue\\"."`,
},
{
  id: 'sb-02', mins: 3,
  title: 'Counting categories',
  concept: [
    '`sns.countplot` counts the rows in each group and draws a bar for each. No groupby needed.',
    '`sns.barplot` is different: each bar shows the **average** of a column, with a thin line for how sure that average is.',
    'countplot for "how many", barplot for "how much, on average".',
  ],
  starter: `sns.set_theme()
sns.countplot(data=cafe, x="city")
plt.show()`,
  task: 'Show the **average revenue** per `city` using `barplot`.',
  hint: '`sns.barplot(data=cafe, x="city", y="revenue")`',
  solution: `sns.set_theme()
sns.barplot(data=cafe, x="city", y="revenue")
plt.title("Average revenue per city")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert len(_ax[0].patches) >= 3, "I expected one bar per city."
assert "revenue" in _labels(), "Put revenue on the y axis so it shows the average."`,
},
{
  id: 'sb-03', mins: 4,
  title: 'hue: colour by another column',
  concept: [
    '`hue="city"` colours the dots (or bars, or lines) by another column. It is seaborn\'s best trick.',
    'It adds the key, called the legend, for you.',
    'One extra setting turns a flat chart into a comparison.',
  ],
  starter: `sns.set_theme()
sns.scatterplot(data=cafe, x="cups", y="revenue")
plt.show()`,
  task: 'Colour the same scatter by `city`.',
  hint: 'Add `hue="city"` to the scatterplot call.',
  solution: `sns.set_theme()
sns.scatterplot(data=cafe, x="cups", y="revenue", hue="city")
plt.title("Cups vs revenue, by city")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_legend() is not None, "No legend — add hue=\\"city\\" and seaborn makes one."
_names = [t.get_text() for t in _ax[0].get_legend().get_texts()]
assert any("Lagos" in n for n in _names), "Colour by city, so Lagos shows up in the legend."`,
},
{
  id: 'sb-04', mins: 4,
  title: 'Lines over time',
  concept: [
    '`sns.lineplot(data=..., x="date", y="revenue")` draws a line over time, and handles dates properly.',
    'Where several rows share one date, it draws their average **and** a shaded band for how sure that average is.',
    '`errorbar=None` turns the band off when you just want the line.',
  ],
  starter: `sns.set_theme()
sns.lineplot(data=cafe.head(45), x="date", y="revenue")
plt.xticks(rotation=45)
plt.show()`,
  task: 'Draw one line per `city` over the first 60 days.',
  hint: '`sns.lineplot(data=cafe.head(60), x="date", y="revenue", hue="city")`',
  solution: `sns.set_theme()
sns.lineplot(data=cafe.head(60), x="date", y="revenue", hue="city")
plt.xticks(rotation=45)
plt.title("Revenue over time")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_legend() is not None, "One line per city means hue=\\"city\\"."
assert len([l for l in _ax[0].lines if len(l.get_xdata()) > 1]) >= 3, "I expected three city lines."`,
},
{
  id: 'sb-05', mins: 4,
  title: 'Boxplots: spread, not just average',
  concept: [
    'An average hides a lot. A **boxplot** shows how the values are spread.',
    'The box covers the middle half of the values, and the line inside is the median: the middle value. The whiskers reach out to the rest, and dots mark unusual ones.',
    '`sns.violinplot` and `sns.stripplot` show the same thing in other ways.',
  ],
  starter: `sns.set_theme()
sns.boxplot(data=cafe, x="city", y="cups")
plt.show()`,
  task: 'Compare `revenue` across `drink` with a boxplot.',
  hint: '`sns.boxplot(data=cafe, x="drink", y="revenue")`',
  solution: `sns.set_theme()
sns.boxplot(data=cafe, x="drink", y="revenue")
plt.title("Revenue spread by drink")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert "drink" in _labels(), "Put drink on the x axis."
assert "revenue" in _labels(), "Put revenue on the y axis."`,
},
{
  id: 'sb-06', mins: 4,
  title: 'Heatmaps',
  concept: [
    'A heatmap draws a table as coloured squares: the colour shows how big each number is.',
    'Give it a pivot table, or the table `.corr()` makes: how strongly each pair of columns moves together.',
    '`annot=True` writes the numbers in the squares too.',
  ],
  starter: `sns.set_theme()
nums = cafe[["cups", "price", "revenue", "rating"]].corr()
sns.heatmap(nums, annot=True, cmap="viridis")
plt.show()`,
  task: 'Draw a heatmap of the average `cups` for every city and drink pair, with the numbers shown.',
  hint: 'Build `grid = cafe.pivot_table(index="city", columns="drink", values="cups", aggfunc="mean")`, then `sns.heatmap(grid, annot=True)`.',
  solution: `sns.set_theme()
grid = cafe.pivot_table(index="city", columns="drink", values="cups", aggfunc="mean")

sns.heatmap(grid, annot=True, fmt=".1f", cmap="mako")
plt.title("Average cups")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].collections, "That doesn't look like a heatmap yet."
_ticks = " ".join(t.get_text() for t in _ax[0].get_xticklabels() + _ax[0].get_yticklabels()).lower()
assert "latte" in _ticks and "lagos" in _ticks, "Use the city-by-drink pivot table, not the correlations."
assert len(_ax[0].texts) >= 12, "Pass annot=True so the numbers appear in the squares."`,
},
{
  id: 'sb-07', mins: 4,
  title: 'Small multiples with col=',
  concept: [
    'Some seaborn charts can **split into panels**, one small chart per group: `relplot`, `catplot` and `displot`.',
    '`col="city"` gives one panel per city, all on the same scales so they compare fairly.',
    'They build their own picture, so don\'t start them with `plt.subplots()`.',
  ],
  starter: `sns.set_theme()
sns.relplot(data=cafe, x="cups", y="revenue", col="city", height=2.8)
plt.show()`,
  task: 'Make one panel per `drink`, coloured by `city`.',
  hint: '`sns.relplot(data=cafe, x="cups", y="revenue", col="drink", hue="city", height=2.6)`',
  solution: `sns.set_theme()
sns.relplot(
    data=cafe, x="cups", y="revenue",
    col="drink", hue="city",
    height=2.6, aspect=0.9,
)
plt.show()`,
  check: `_ax = _axes()
assert len(_ax) >= 4, "I expected 4 panels — one per drink. Use col=\\"drink\\"."
assert any(a.collections for a in _ax), "The panels look empty."`,
},
{
  id: 'sb-08', mins: 4,
  title: 'Everything against everything',
  concept: [
    '`sns.pairplot` draws a scatter of every number column against every other, in a grid.',
    'Down the diagonal, each column meets itself, so it shows how that column\'s values are spread instead.',
    'It is the fastest way to get to know a table you have never seen.',
  ],
  starter: `sns.set_theme()
sns.pairplot(cafe[["cups", "price", "revenue"]], height=1.7)
plt.show()`,
  task: 'Include `rating` too, and colour the points by `city`.',
  hint: 'Pass the columns **plus** `city`, then `hue="city"`: `sns.pairplot(cafe[["cups","price","revenue","rating","city"]], hue="city", height=1.6)`',
  solution: `sns.set_theme()
sns.pairplot(
    cafe[["cups", "price", "revenue", "rating", "city"]],
    hue="city",
    height=1.6,
)
plt.show()`,
  check: `_ax = _axes()
assert len(_ax) >= 16, "With 4 number columns there should be a 4 by 4 grid: add rating."
assert "rating" in _labels(), "rating isn't in the grid yet."`,
},
{
  id: 'sb-09', mins: 4,
  title: 'Make it yours',
  concept: [
    '`sns.set_theme(style=..., palette=...)` sets the look for everything after it.',
    'Styles: `whitegrid`, `darkgrid`, `white`, `ticks`.',
    'Palettes: `deep`, `muted`, `rocket`, `mako`, `Set2`.',
  ],
  starter: `sns.set_theme(style="whitegrid", palette="Set2")
sns.barplot(data=cafe, x="drink", y="revenue")
plt.show()`,
  task: 'Switch the style to `"ticks"` and the palette to `"rocket"`, and add a title.',
  hint: '`sns.set_theme(style="ticks", palette="rocket")`, then `plt.title("...")`.',
  solution: `sns.set_theme(style="ticks", palette="rocket")

sns.barplot(data=cafe, x="drink", y="revenue")
plt.title("Average revenue by drink")
sns.despine()
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_title().strip(), "Add a title with plt.title(...)."
import matplotlib as _m
assert not _m.rcParams["axes.grid"], 'Style "ticks" has no background grid — check the style name.'`,
},
{
  id: 'sb-10', mins: 4,
  title: 'Is there actually a trend?',
  concept: [
    '`sns.regplot` draws the scatter **and** the straight line that fits it best.',
    'The shaded band around the line shows how sure that line is.',
    '`sns.lmplot` does the same, and can split into panels with `col=`.',
  ],
  starter: `sns.set_theme()
sns.regplot(data=cafe, x="price", y="cups")
plt.show()`,
  task: 'Fit a line through `cups` (x) against `revenue` (y) instead.',
  hint: '`sns.regplot(data=cafe, x="cups", y="revenue")`',
  solution: `sns.set_theme()
sns.regplot(data=cafe, x="cups", y="revenue", scatter_kws={"alpha": 0.5})
plt.title("Cups really do drive revenue")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].collections, "I can't see the scattered points."
assert _ax[0].lines, "No fit line — regplot draws one for you."
assert "cups" in _ax[0].get_xlabel().lower(), "Put cups on the x axis."
assert "revenue" in _ax[0].get_ylabel().lower(), "Put revenue on the y axis."`,
},
{
  id: 'sb-11', mins: 4,
  title: 'Violins show the whole shape',
  concept: [
    'A boxplot summarises. A **violin** draws the whole shape of the values.',
    '`sns.violinplot(data=..., x=..., y=...)` takes the same settings as boxplot.',
    'Wide parts mean "lots of days looked like this".',
  ],
  starter: `sns.set_theme()
sns.violinplot(data=cafe, x="city", y="cups")
plt.show()`,
  task: 'Draw a violin of `revenue` for each `drink`, and give it a title.',
  hint: '`sns.violinplot(data=cafe, x="drink", y="revenue")` then `plt.title(...)`.',
  solution: `sns.set_theme()
sns.violinplot(data=cafe, x="drink", y="revenue", hue="drink", legend=False)
plt.title("Revenue distribution by drink")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].collections, "That doesn't look like a violin plot yet."
assert "drink" in _ax[0].get_xlabel().lower(), "Put drink on the x axis."
assert "revenue" in _ax[0].get_ylabel().lower(), "Put revenue on the y axis."
assert _ax[0].get_title().strip(), "Give it a title."`,
},
{
  id: 'sb-12', mins: 4,
  title: 'Smooth curves instead of bars',
  concept: [
    '`sns.kdeplot` draws a smooth curve of how the values are spread, instead of a histogram\'s blocky bars.',
    '`fill=True` shades under the curve, and `hue=` gives one curve per group.',
    'Use it when the **shape** matters more than the exact counts.',
  ],
  starter: `sns.set_theme()
sns.kdeplot(data=cafe, x="revenue", fill=True)
plt.show()`,
  task: 'Draw one filled curve per `city`, all on the same chart.',
  hint: 'Add `hue="city"` to the kdeplot call.',
  solution: `sns.set_theme()
sns.kdeplot(data=cafe, x="revenue", hue="city", fill=True, alpha=0.35)
plt.title("Revenue shape by city")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_legend() is not None, 'No legend — add hue="city" to split the curves.'
_names = [t.get_text() for t in _ax[0].get_legend().get_texts()]
assert any("Lagos" in n for n in _names), "Split by city, so Lagos should appear in the legend."
assert _ax[0].collections, "Pass fill=True so the curves are shaded."`,
},
{
  id: 'sb-13', mins: 4,
  title: 'Every point, not just the box',
  concept: [
    'A boxplot summarises. `sns.stripplot` shows every single day as a dot.',
    'Draw the dots over the box and you get both: the summary, and the evidence behind it.',
    '`jitter=True` spreads the dots sideways so they don\'t hide behind each other.',
  ],
  starter: `sns.set_theme()
sns.boxplot(data=cafe, x="drink", y="cups")
plt.show()`,
  task: 'Keep the boxplot, and draw the individual days on top of it with `sns.stripplot`.',
  hint: 'Call `sns.stripplot(data=cafe, x="drink", y="cups", jitter=True)` right after the boxplot, before `plt.show()`.',
  solution: `sns.set_theme()
sns.boxplot(data=cafe, x="drink", y="cups", color="white")
sns.stripplot(data=cafe, x="drink", y="cups", jitter=True, size=4)
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_dots = sum(len(c.get_offsets()) for c in _ax[0].collections if hasattr(c, "get_offsets"))
assert _dots >= 100, "I can't see the individual days yet — add sns.stripplot on the same chart."
assert _ax[0].patches or _ax[0].lines, "Keep the boxplot underneath the dots."`,
},
{
  id: 'sb-14', mins: 4,
  title: 'One panel per city',
  concept: [
    '`sns.catplot` draws bar, box and strip charts, and can split them into panels.',
    '`col="city"` gives one panel per city, all sharing the same axes so they compare fairly.',
    '`kind=` picks the chart inside each panel: `"bar"`, `"box"`, `"strip"`…',
  ],
  starter: `sns.set_theme()
sns.barplot(data=cafe, x="drink", y="revenue")
plt.show()`,
  task: 'Make one bar chart per `city`, with `sns.catplot(..., kind="bar", col="city")`.',
  hint: '`sns.catplot(data=cafe, x="drink", y="revenue", kind="bar", col="city")` — catplot makes its own figure, so no plt.subplots.',
  solution: `sns.set_theme()
sns.catplot(data=cafe, x="drink", y="revenue", kind="bar", col="city", height=3.2)
plt.show()`,
  check: `_ax = _axes()
assert len(_ax) >= 3, "One panel per city means 3 — use col='city'."
assert "Lagos" in " ".join(a.get_title() for a in _ax), "Each panel should be titled with its city."
assert all(a.patches for a in _ax), 'Every panel should have bars - kind="bar".'`,
},
{
  id: 'sb-15', mins: 4,
  title: 'Two spreads and a relationship',
  concept: [
    "`sns.jointplot` draws a scatter in the middle, and how each column's values are spread along the edges.",
    'One picture, three answers: how x is spread, how y is spread, and how they move together.',
    '`kind="reg"` adds a best-fit line; `kind="hex"` groups crowded points into shaded hexagons.',
  ],
  starter: `sns.set_theme()
sns.scatterplot(data=cafe, x="cups", y="revenue")
plt.show()`,
  task: 'Draw `cups` against `revenue` as a `sns.jointplot`, with a fitted line (`kind="reg"`).',
  hint: '`sns.jointplot(data=cafe, x="cups", y="revenue", kind="reg")`',
  solution: `sns.set_theme()
sns.jointplot(data=cafe, x="cups", y="revenue", kind="reg", height=4.5)
plt.show()`,
  check: `_ax = _axes()
assert len(_ax) >= 3, "A jointplot has three panels: the scatter, and a distribution along each edge."
assert any(a.lines for a in _ax), 'Add the fitted line with kind="reg".'`,
},
];
