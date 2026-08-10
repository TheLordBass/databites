export const SEABORN = [
{
  id: 'sb-01', mins: 3,
  title: 'Seaborn speaks DataFrame',
  concept: [
    'Seaborn sits on top of matplotlib and already knows about DataFrames.',
    'The pattern is always: `data=`, then column **names** as strings.',
    '`sns.set_theme()` instantly makes everything look better.',
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
    '`sns.countplot` counts rows per category — no groupby needed.',
    '`sns.barplot` is different: it shows the **mean** of a value, with error bars.',
    'Pick countplot for "how many", barplot for "how much on average".',
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
  title: 'hue — a third dimension, free',
  concept: [
    '`hue=` colours the marks by another column. This is seaborn\'s superpower.',
    'It builds the legend for you.',
    'One extra word turns a flat chart into a comparison.',
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
    '`sns.lineplot(data=..., x="date", y="revenue")` handles dates properly.',
    'With several rows per x, it draws the mean **and** a confidence band.',
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
  title: 'Boxplots — spread, not just average',
  concept: [
    'An average hides the story. A **boxplot** shows the whole spread.',
    'The box holds the middle 50%; the line inside is the median.',
    '`sns.violinplot` and `sns.stripplot` are drop-in alternatives.',
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
    'A heatmap paints a table: value → colour.',
    'Feed it a pivot table or a `.corr()` matrix.',
    '`annot=True` writes the numbers into the squares.',
  ],
  starter: `sns.set_theme()
nums = cafe[["cups", "price", "revenue", "rating"]].corr()
sns.heatmap(nums, annot=True, cmap="viridis")
plt.show()`,
  task: 'Heatmap the mean `cups` for every city × drink pair, with the numbers shown.',
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
assert "latte" in _ticks and "lagos" in _ticks, "Heatmap the city x drink pivot table, not the correlation matrix."
assert len(_ax[0].texts) >= 12, "Pass annot=True so the numbers appear in the squares."`,
},
{
  id: 'sb-07', mins: 4,
  title: 'Small multiples with col=',
  concept: [
    'Figure-level plots — `relplot`, `catplot`, `displot` — can **split into panels**.',
    '`col="city"` gives one panel per city, sharing the same scales.',
    'These return a grid object, so use `plt` sparingly with them.',
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
    '`sns.pairplot` scatters every numeric column against every other.',
    'The diagonal shows each column\'s own distribution.',
    'It is the fastest way to meet a dataset you have never seen.',
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
assert len(_ax) >= 16, "With 4 numeric columns I expect a 4x4 grid — add rating."
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
    '`sns.regplot` draws the scatter **and** the best-fit line through it.',
    'The shaded band around the line is how unsure that fit is.',
    '`sns.lmplot` is the same thing but can split into panels with `col=`.',
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
    'A boxplot summarises. A **violin** draws the actual distribution.',
    '`sns.violinplot(data=..., x=..., y=...)` — same arguments as boxplot.',
    'Wide parts mean "lots of days looked like this".',
  ],
  starter: `sns.set_theme()
sns.violinplot(data=cafe, x="city", y="cups")
plt.show()`,
  task: 'Show how `revenue` is distributed across each `drink`, and title it.',
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
    '`sns.kdeplot` draws a smooth density curve rather than blocky bars.',
    '`fill=True` shades underneath; `hue=` gives you one curve per group.',
    'Use it when the **shape** matters more than the exact counts.',
  ],
  starter: `sns.set_theme()
sns.kdeplot(data=cafe, x="revenue", fill=True)
plt.show()`,
  task: 'Draw one filled curve per `city`, overlaid on the same axes.',
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
];
