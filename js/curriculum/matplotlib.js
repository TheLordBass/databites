export const MATPLOTLIB = [
{
  id: 'mp-01', mins: 3,
  title: 'Your first chart',
  concept: [
    '`import matplotlib.pyplot as plt` — everyone writes it as `plt`.',
    '`plt.plot(x, y)` draws a line. `plt.show()` finishes the picture.',
    'The chart appears right below your code.',
  ],
  starter: `import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4], [10, 40, 25, 60])
plt.show()`,
  task: 'Plot the first 30 days of `cups` from the café data.',
  hint: '`plt.plot(cafe["cups"].head(30))` — with one argument, matplotlib uses the row numbers for x.',
  solution: `import matplotlib.pyplot as plt

plt.plot(cafe["cups"].head(30))
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared — did you call plt.plot(...)?"
assert _ax[0].lines, "I see a chart but no line on it."
_pts = len(_ax[0].lines[0].get_ydata())
assert _pts == 30, "Plot exactly the first 30 days — you plotted %d points." % _pts`,
},
{
  id: 'mp-02', mins: 3,
  title: 'Say what it means',
  concept: [
    'An unlabelled chart is a puzzle. Always spend the 3 extra seconds.',
    '`plt.title()`, `plt.xlabel()`, `plt.ylabel()`.',
    '`plt.grid(True)` makes values easier to read off.',
  ],
  starter: `plt.plot(cafe["cups"].head(30))
plt.title("Cups sold")
plt.show()`,
  task: 'Add an x-label of `"Day"` and a y-label of `"Cups"` too.',
  hint: '`plt.xlabel("Day")` and `plt.ylabel("Cups")`, before `plt.show()`.',
  solution: `plt.plot(cafe["cups"].head(30))
plt.title("Cups sold")
plt.xlabel("Day")
plt.ylabel("Cups")
plt.grid(True)
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_title().strip(), "The title went missing."
assert "day" in _ax[0].get_xlabel().lower(), 'The x axis needs a label of "Day".'
assert "cups" in _ax[0].get_ylabel().lower(), 'The y axis needs a label of "Cups".'`,
},
{
  id: 'mp-03', mins: 4,
  title: 'Figure and Axes',
  concept: [
    '`fig, ax = plt.subplots()` gives you the canvas (`fig`) and the plot (`ax`).',
    'On an Axes the methods gain `set_`: `ax.set_title()`, `ax.set_xlabel()`.',
    'This is the style real code uses — it scales to many charts at once.',
  ],
  starter: `fig, ax = plt.subplots()
ax.plot(cafe["revenue"].head(40))
ax.set_title("Revenue, first 40 days")
plt.show()`,
  task: 'Using `ax`, label the y axis `"Revenue"` and turn the grid on.',
  hint: '`ax.set_ylabel("Revenue")` and `ax.grid(True)`.',
  solution: `fig, ax = plt.subplots()
ax.plot(cafe["revenue"].head(40))
ax.set_title("Revenue, first 40 days")
ax.set_ylabel("Revenue")
ax.grid(True)
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert "revenue" in _ax[0].get_ylabel().lower(), 'Use ax.set_ylabel("Revenue").'
_lines = list(_ax[0].get_xgridlines()) + list(_ax[0].get_ygridlines())
assert any(g.get_visible() for g in _lines), "Turn the grid on with ax.grid(True)."`,
},
{
  id: 'mp-04', mins: 4,
  title: 'Bars for categories',
  concept: [
    'Lines are for things that flow. **Bars** are for separate categories.',
    '`ax.bar(labels, heights)` — two lists, same length.',
    'A groupby result gives you both: `.index` and `.values`.',
  ],
  starter: `totals = cafe.groupby("city")["revenue"].sum()

fig, ax = plt.subplots()
ax.bar(totals.index, totals.values)
plt.show()`,
  task: 'Chart total `cups` per `drink` instead, and title it `"Cups by drink"`.',
  hint: 'Group by `"drink"` and sum `"cups"`, then `ax.bar(...)` and `ax.set_title("Cups by drink")`.',
  solution: `totals = cafe.groupby("drink")["cups"].sum()

fig, ax = plt.subplots()
ax.bar(totals.index, totals.values, color="#8b7dff")
ax.set_title("Cups by drink")
ax.set_ylabel("Cups")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert len(_ax[0].patches) == 4, "I expected 4 bars — one per drink."
assert "drink" in _ax[0].get_title().lower(), 'Title it "Cups by drink".'`,
},
{
  id: 'mp-05', mins: 4,
  title: 'Scatter — two numbers meeting',
  concept: [
    'A scatter asks: when this goes up, does that go up too?',
    '`ax.scatter(x, y)` — one dot per row.',
    '`alpha=0.6` softens the dots so overlaps stay readable.',
  ],
  starter: `fig, ax = plt.subplots()
ax.scatter(cafe["price"], cafe["cups"], alpha=0.6)
ax.set_xlabel("Price")
ax.set_ylabel("Cups")
plt.show()`,
  task: 'Scatter `cups` (x) against `revenue` (y), and label both axes.',
  hint: '`ax.scatter(cafe["cups"], cafe["revenue"], alpha=0.6)` then set both labels.',
  solution: `fig, ax = plt.subplots()
ax.scatter(cafe["cups"], cafe["revenue"], alpha=0.6, color="#46c9d6")
ax.set_xlabel("Cups")
ax.set_ylabel("Revenue")
ax.set_title("More cups, more money")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].collections, "Use ax.scatter(...) rather than plot."
assert "cups" in _ax[0].get_xlabel().lower(), "Label the x axis Cups."
assert "revenue" in _ax[0].get_ylabel().lower(), "Label the y axis Revenue."`,
},
{
  id: 'mp-06', mins: 3,
  title: 'Histograms — the shape of one column',
  concept: [
    'A histogram slices a number column into **bins** and counts each bin.',
    '`ax.hist(values, bins=20)`.',
    'It answers "what is normal here, and what is rare?"',
  ],
  starter: `fig, ax = plt.subplots()
ax.hist(cafe["cups"], bins=10)
plt.show()`,
  task: 'Draw a histogram of `revenue` with **20** bins and a y-label of `"Days"`.',
  hint: '`ax.hist(cafe["revenue"], bins=20)` then `ax.set_ylabel("Days")`.',
  solution: `fig, ax = plt.subplots()
ax.hist(cafe["revenue"], bins=20, color="#9df06a", edgecolor="white")
ax.set_xlabel("Revenue")
ax.set_ylabel("Days")
ax.set_title("Most days look like this")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert len(_ax[0].patches) == 20, "I counted %d bins — ask for bins=20." % len(_ax[0].patches)
assert "days" in _ax[0].get_ylabel().lower(), 'Set the y label to "Days".'`,
},
{
  id: 'mp-07', mins: 4,
  title: 'Two lines and a legend',
  concept: [
    'Call `plot` twice on the same Axes to overlay lines.',
    'Give each a `label=`, then call `ax.legend()` once.',
    'Without the legend call, the labels stay invisible.',
  ],
  starter: `lagos = cafe[cafe["city"] == "Lagos"]["cups"].head(25).values
accra = cafe[cafe["city"] == "Accra"]["cups"].head(25).values

fig, ax = plt.subplots()
ax.plot(lagos, label="Lagos")
plt.show()`,
  task: 'Add the Accra line with its own label, then show the legend.',
  hint: '`ax.plot(accra, label="Accra")` and `ax.legend()`.',
  solution: `lagos = cafe[cafe["city"] == "Lagos"]["cups"].head(25).values
accra = cafe[cafe["city"] == "Accra"]["cups"].head(25).values

fig, ax = plt.subplots()
ax.plot(lagos, label="Lagos", linewidth=2)
ax.plot(accra, label="Accra", linewidth=2, linestyle="--")
ax.set_title("Lagos vs Accra")
ax.legend()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert len(_ax[0].lines) >= 2, "I only see one line — plot Accra as well."
assert _ax[0].get_legend() is not None, "Call ax.legend() to actually show the labels."
_names = [t.get_text().lower() for t in _ax[0].get_legend().get_texts()]
assert any("accra" in n for n in _names), 'The Accra line needs label="Accra".'`,
},
{
  id: 'mp-08', mins: 4,
  title: 'Several charts, one picture',
  concept: [
    '`plt.subplots(1, 2)` returns an array of Axes — one per slot.',
    'Unpack them: `fig, (left, right) = plt.subplots(1, 2)`.',
    '`fig.tight_layout()` stops the labels colliding.',
  ],
  starter: `fig, (left, right) = plt.subplots(1, 2, figsize=(8, 3.2))

left.hist(cafe["cups"], bins=15)
left.set_title("Cups")

plt.show()`,
  task: 'Fill the right panel with a histogram of `revenue`, title it, and tidy the layout.',
  hint: '`right.hist(cafe["revenue"], bins=15)`, `right.set_title("Revenue")`, `fig.tight_layout()`.',
  solution: `fig, (left, right) = plt.subplots(1, 2, figsize=(8, 3.2))

left.hist(cafe["cups"], bins=15, color="#8b7dff")
left.set_title("Cups")

right.hist(cafe["revenue"], bins=15, color="#46c9d6")
right.set_title("Revenue")

fig.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert len(_ax) >= 2, "I only see one panel — both left and right need something drawn."
assert _ax[1].patches, "The right panel is still empty."
assert _ax[1].get_title().strip(), "Give the right panel a title."`,
},
{
  id: 'mp-09', mins: 4,
  title: 'Zoom, annotate, finish',
  concept: [
    '`ax.set_ylim(low, high)` crops the view to the interesting part.',
    '`ax.axhline(y, ...)` drops a reference line across the chart.',
    '`ax.annotate("text", xy=(x, y))` points at one specific moment.',
  ],
  starter: `cups = cafe["cups"].head(40)

fig, ax = plt.subplots()
ax.plot(cups.values)
ax.axhline(cups.mean(), color="grey", linestyle="--")
plt.show()`,
  task: 'Crop the y axis to `0`–`70` and annotate the peak with the word `"Peak"`.',
  hint: '`ax.set_ylim(0, 70)` and `ax.annotate("Peak", xy=(cups.values.argmax(), cups.max()))`.',
  solution: `cups = cafe["cups"].head(40)
top = cups.values.argmax()

fig, ax = plt.subplots()
ax.plot(cups.values, linewidth=2)
ax.axhline(cups.mean(), color="grey", linestyle="--", label="average")
ax.set_ylim(0, 70)
ax.annotate("Peak", xy=(top, cups.max()), xytext=(top + 2, cups.max() + 3))
ax.legend()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert _ax[0].get_ylim() == (0.0, 70.0), "Set the y limits to exactly 0 and 70."
_words = [t.get_text().lower() for t in _ax[0].texts]
assert any("peak" in w for w in _words), 'Add an annotation reading "Peak".'`,
},
{
  id: 'mp-10', mins: 3,
  title: 'pandas can plot itself',
  concept: [
    'Every DataFrame and Series has `.plot()` built in — matplotlib underneath.',
    '`kind=` picks the type: `line`, `bar`, `barh`, `hist`, `box`, `area`.',
    'It labels the axes from your column names for free.',
  ],
  starter: `cafe.groupby("city")["revenue"].sum().plot(kind="bar")
plt.show()`,
  task: 'Draw a **horizontal** bar chart of total cups per drink, and give it a title.',
  hint: '`cafe.groupby("drink")["cups"].sum().plot(kind="barh")` then `plt.title("...")`.',
  solution: `totals = cafe.groupby("drink")["cups"].sum()

totals.plot(kind="barh", color="#8b7dff")
plt.title("Cups sold by drink")
plt.xlabel("Cups")
plt.tight_layout()
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert len(_ax[0].patches) == 4, "I expected 4 bars — one per drink."
assert _ax[0].get_title().strip(), "Give it a title with plt.title(...)."
_bar = _ax[0].patches[0]
assert _bar.get_width() > _bar.get_height(), 'Those bars are still vertical — use kind="barh".'`,
},
{
  id: 'mp-11', mins: 4,
  title: 'Colour, markers, line style',
  concept: [
    '`color=`, `linewidth=`, `linestyle=`, `marker=`, `alpha=` restyle any line.',
    'Shorthand exists too: `"ro--"` means red, circles, dashed.',
    '`alpha` runs 0 (invisible) to 1 (solid) — the fix for overlapping data.',
  ],
  starter: `cups = cafe["cups"].head(20)

plt.plot(cups.values, color="green", marker="s")
plt.show()`,
  task: 'Plot the first 20 cups as a **red, dashed** line with **circle** markers.',
  hint: '`plt.plot(cups.values, color="red", linestyle="--", marker="o")`',
  solution: `cups = cafe["cups"].head(20)

plt.plot(cups.values, color="red", linestyle="--", marker="o", alpha=0.8)
plt.title("First 20 days")
plt.ylabel("Cups")
plt.show()`,
  check: `import matplotlib.colors as _mc
_ax = _axes()
assert _ax and _ax[0].lines, "No line appeared."
_line = _ax[0].lines[0]
assert _line.get_linestyle() in ("--", "dashed"), "The line should be dashed."
assert _line.get_marker() == "o", "The markers should be circles."
assert _mc.to_rgb(_line.get_color()) == (1.0, 0.0, 0.0), "The line should be red."`,
},
{
  id: 'mp-12', mins: 4,
  title: 'Two scales, one chart',
  concept: [
    'Cups are in the hundreds a week, revenue in the thousands: on one axis the cups line looks flat.',
    '`ax2 = ax.twinx()` adds a second y axis on the right, sharing the same x.',
    'Label both sides, or nobody can tell which line belongs to which scale.',
  ],
  starter: `weekly = cafe.set_index("date")[["cups", "revenue"]].resample("W").sum()

fig, ax = plt.subplots()
ax.plot(weekly.index, weekly["cups"], label="cups")
ax.plot(weekly.index, weekly["revenue"], label="revenue")
plt.show()`,
  task: 'Put `revenue` on its own right-hand axis with `twinx()`, and label both y axes.',
  hint: 'Plot cups on `ax` and `ax.set_ylabel("cups")`; then `ax2 = ax.twinx()`, plot revenue on `ax2` and `ax2.set_ylabel("revenue")`.',
  solution: `weekly = cafe.set_index("date")[["cups", "revenue"]].resample("W").sum()

fig, ax = plt.subplots()
ax.plot(weekly.index, weekly["cups"], color="tab:blue")
ax.set_ylabel("cups")

ax2 = ax.twinx()
ax2.plot(weekly.index, weekly["revenue"], color="tab:orange")
ax2.set_ylabel("revenue")
plt.show()`,
  check: `_ax = _axes()
assert len(_ax) >= 2, "There's only one axis — ax.twinx() makes the second, right-hand one."
_ys = [a.get_ylabel().lower() for a in _ax]
assert any("cups" in y for y in _ys) and any("revenue" in y for y in _ys), "Label both y axes: cups on one, revenue on the other."
assert all(a.lines for a in _ax[:2]), "Each axis should carry its own line."`,
},
{
  id: 'mp-13', mins: 4,
  title: 'Long labels go sideways',
  concept: [
    'Product names are long; on an ordinary bar chart they crash into each other.',
    '`ax.barh(names, values)` lays the bars on their side, so every label reads left to right.',
    'Sort first, and the chart reads as a ranking — best seller at the top.',
  ],
  starter: `sold = order_items.merge(products, on="product_id").groupby("name")["qty"].sum()

fig, ax = plt.subplots()
ax.bar(sold.index, sold.values)
plt.show()`,
  task: 'Draw the same units sold as **horizontal** bars, sorted so the best seller is at the top.',
  hint: 'Add `.sort_values()` to `sold` — barh draws the first bar at the bottom, so smallest-first puts the biggest on top. Then `ax.barh(sold.index, sold.values)`.',
  solution: `sold = (order_items.merge(products, on="product_id")
        .groupby("name")["qty"].sum()
        .sort_values())

fig, ax = plt.subplots()
ax.barh(sold.index, sold.values)
ax.set_xlabel("units sold")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_bars = list(_ax[0].patches)
assert _bars, "No bars yet."
assert all(abs(p.get_x()) < 1e-9 for p in _bars) and len({round(p.get_width(), 6) for p in _bars}) > 1, "The bars should lie on their side — ax.barh, not ax.bar."
_top = max(_bars, key=lambda p: p.get_y())
assert _top.get_width() == max(p.get_width() for p in _bars), "Sort it so the best seller sits at the top."`,
},
{
  id: 'mp-14', mins: 4,
  title: 'Stacked bars',
  concept: [
    'A stacked bar shows a total **and** what it is made of, in one bar.',
    'Pivot so each row is a bar and each column a layer, then `.plot(kind="bar", stacked=True)`.',
    'Keep the layers few — past five or so, nobody can read the middle ones.',
  ],
  starter: `table = cafe.pivot_table(index="city", columns="drink", values="revenue", aggfunc="sum")
table`,
  task: 'Draw `table` as a stacked bar chart — one bar per city, one layer per drink — and give it a title.',
  hint: '`table.plot(kind="bar", stacked=True)`, then `plt.title(...)`.',
  solution: `table = cafe.pivot_table(index="city", columns="drink", values="revenue", aggfunc="sum")

table.plot(kind="bar", stacked=True)
plt.title("Revenue by city, split by drink")
plt.ylabel("revenue")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
_bars = _ax[0].patches
assert len(_bars) >= 12, "Expected 3 cities x 4 drinks = 12 pieces of bar."
assert len({round(p.get_y(), 6) for p in _bars}) > 1, "The layers are side by side — pass stacked=True so they stack."
assert _ax[0].get_title(), "Give it a title."`,
},
{
  id: 'mp-15', mins: 4,
  title: 'Show the spread with error bars',
  concept: [
    'An average on its own hides how much the days vary.',
    '`ax.bar(x, means, yerr=spread)` adds a whisker to each bar showing the spread.',
    'Here the spread is the standard deviation, `.std()`. `capsize=` puts little caps on the whiskers.',
  ],
  starter: `stats = cafe.groupby("drink")["cups"].agg(["mean", "std"])

fig, ax = plt.subplots()
ax.bar(stats.index, stats["mean"])
plt.show()`,
  task: "Add error bars showing each drink's standard deviation, and label the y axis.",
  hint: '`ax.bar(stats.index, stats["mean"], yerr=stats["std"], capsize=6)`, then `ax.set_ylabel(...)`.',
  solution: `stats = cafe.groupby("drink")["cups"].agg(["mean", "std"])

fig, ax = plt.subplots()
ax.bar(stats.index, stats["mean"], yerr=stats["std"], capsize=6)
ax.set_ylabel("cups per day")
plt.show()`,
  check: `_ax = _axes()
assert _ax, "No chart appeared."
assert any(getattr(c, "errorbar", None) is not None for c in _ax[0].containers), "No error bars yet — pass yerr=stats['std'] to ax.bar."
assert _ax[0].get_ylabel(), "Label the y axis."`,
},
];
