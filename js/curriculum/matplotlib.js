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
];
