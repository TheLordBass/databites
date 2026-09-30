/* Python basics — for someone who has never written code. Just enough
   Python to read the pandas track: values and names, text, True/False,
   lists, functions, the dot, dicts, if and for. Every lesson stays with
   the cafe, so the numbers mean something.

   The track is a primer (index.js): once someone has done lessons
   elsewhere, Home stops sending them back here. */

export const BASICS = [

/* ── Values and names ──────────────────────────────────── */
{
  id: 'py-01', mins: 2,
  title: 'Python works things out',
  concept: [
    'You type instructions, press **Run**, and Python carries them out, one line at a time from the top.',
    '`print(...)` shows whatever is inside its brackets, underneath your code. `print(2 + 3)` shows 5.',
    'Maths works as you would expect: `+` and `-`, `*` for times, `/` for divide. Brackets are worked out first.',
  ],
  starter: `print(2 + 3)`,
  task: 'A latte costs 4.50. On a new line, print what **12** lattes cost.',
  hint: '`*` means times: `print(12 * 4.50)`.',
  solution: `print(2 + 3)
print(12 * 4.50)`,
  check: `import re as _re
assert _re.search(r"(^|\\s)54(\\.0+)?(\\s|$)", _out), "Print 12 times 4.50 on a new line: print(12 * 4.50). The answer is 54."`,
},
{
  id: 'py-02', mins: 3,
  title: 'Give a value a name',
  concept: [
    '`price = 4.50` stores 4.50 under the name `price`. From then on, `price` means 4.50. A named value is called a **variable**.',
    'The `=` means "store this", not "is equal to". The name goes on the left, the value on the right.',
    'Names can\'t have spaces, so use `_` instead: `cups_sold`. Capitals count: `Price` and `price` are two different names.',
  ],
  starter: `price = 4.50
cups = 30

print(price)`,
  task: 'Make a variable called `takings` that holds price times cups. Use the names `price` and `cups`, not the numbers.',
  hint: 'A new line at the end: `takings = price * cups`. Add `print(takings)` under it if you want to see it printed.',
  solution: `price = 4.50
cups = 30

takings = price * cups
print(takings)`,
  check: `assert "takings" in globals(), "Make a variable called takings, with a line that starts: takings = "
assert takings == price * cups, "takings should be price times cups, which is 135.0 here."`,
},
{
  id: 'py-03', mins: 3,
  title: 'Text goes in quotes',
  concept: [
    'Text goes inside quotes: `"latte"`. Programmers call a piece of text a **string**.',
    'Without quotes, Python takes a word to be a name. `latte` on its own is an error, because nothing has that name.',
    '`+` joins strings end to end: `"cold" + " brew"` gives `"cold brew"`. Notice the space is inside the quotes.',
  ],
  starter: `drink = "latte"
city = "Lagos"

print(drink)`,
  task: 'Make `order`: the drink, then `" in "`, then the city, joined with `+`. Print it. It should read `latte in Lagos`.',
  hint: '`order = drink + " in " + city` — the spaces go inside the quotes around `in`.',
  solution: `drink = "latte"
city = "Lagos"

order = drink + " in " + city
print(order)`,
  check: `assert "order" in globals(), "Make a variable called order."
assert isinstance(order, str), "order should be text: join the strings with +."
assert order == drink + " in " + city, 'order should read "latte in Lagos": drink, then " in ", then city.'`,
},
{
  id: 'py-04', mins: 3,
  title: 'True or False',
  concept: [
    'A comparison is a yes-or-no question, and Python answers it with `True` or `False`.',
    '`>` more than, `<` less than, `>=` at least, `==` equal to, `!=` not equal to.',
    'Comparing takes **two** equals signs. One `=` stores a value; `==` asks "are these the same?"',
  ],
  starter: `cups = 52

print(cups > 40)
print(cups == 52)`,
  task: 'Make `is_busy`: whether `cups` is **more than 45**. Print it.',
  hint: '`is_busy = cups > 45` stores the answer to the question, True or False.',
  solution: `cups = 52

is_busy = cups > 45
print(is_busy)`,
  check: `assert "is_busy" in globals(), "Make a variable called is_busy."
assert isinstance(is_busy, bool), "is_busy should be True or False: store the comparison itself, cups > 45."
assert is_busy == (cups > 45), "is_busy is whether cups is more than 45."`,
},
{
  id: 'py-05', mins: 4,
  title: 'A list keeps things in order',
  concept: [
    'Square brackets make a **list**: several values in order, with commas between. `cups = [30, 12, 18]`.',
    'Each item has a position, counted from **0**. `cups[0]` is the first item, `cups[1]` the second, and `cups[-1]` the last.',
    '`len(cups)` counts the items, `sum(cups)` adds them up and `max(cups)` finds the biggest.',
  ],
  starter: `cups = [30, 12, 18, 41, 25]

print(cups[0])
print(len(cups))`,
  task: 'Make `total`, all the cups added up, and `last`, the last item in the list.',
  hint: '`total = sum(cups)` and `last = cups[-1]`.',
  solution: `cups = [30, 12, 18, 41, 25]

total = sum(cups)
last = cups[-1]
print(total, last)`,
  check: `assert "total" in globals(), "Make a variable called total."
assert total == sum(cups), "total should be every item added up: sum(cups)."
assert "last" in globals(), "Make a variable called last."
assert last == cups[-1], "last is the final item in the list: cups[-1]."`,
},

/* ── Tools and choices ─────────────────────────────────── */
{
  id: 'py-06', mins: 4,
  title: 'Functions: a name, then brackets',
  concept: [
    'A **function** is a ready-made action with a name. You use it by writing the name, then brackets: `len(cups)`.',
    'What goes inside the brackets is what it works on. Some take two things, with a comma between: `round(3.14159, 2)` gives 3.14.',
    'A function hands back an answer you can store or use again, even inside another function: `round(sum(cups) / 5, 1)`.',
  ],
  starter: `cups = [30, 12, 18, 41, 25, 20]

print(max(cups))
print(round(3.14159, 2))`,
  task: 'Make `average`: the cups added up, divided by how many there are, and rounded to **1** decimal place with `round`.',
  hint: 'Work from the inside out: `sum(cups) / len(cups)` is the average, and `round(..., 1)` goes around it. `average = round(sum(cups) / len(cups), 1)`',
  solution: `cups = [30, 12, 18, 41, 25, 20]

average = round(sum(cups) / len(cups), 1)
print(average)`,
  check: `assert "average" in globals(), "Make a variable called average."
assert isinstance(average, (int, float)), "average should be a number: no quotes around it."
_raw = sum(cups) / len(cups)
assert average == round(_raw, 1) or abs(average - _raw) < 1e-9, "average should be sum(cups) divided by len(cups)."
assert average == round(_raw, 1), "Nearly: now round it to 1 decimal place, round(..., 1)."`,
},
{
  id: 'py-07', mins: 4,
  title: 'The dot: ask a value to do something',
  concept: [
    'Some actions belong to a kind of value, and you reach them with a dot: `"latte".upper()` gives `"LATTE"`. These are called **methods**.',
    'Text has `.upper()`, `.lower()`, `.title()` (a capital at the start of each word) and `.strip()` (trims spaces off both ends).',
    'Dots can follow one another, and each works on the result of the last. pandas works this way: `cafe.head()` is a method too.',
  ],
  starter: `name = "  kofi mensah  "

print(name.upper())
print(name.strip())`,
  task: 'Make `tidy`: `name` with the spaces trimmed off both ends, **then** a capital at the start of each word. It should read `Kofi Mensah`.',
  hint: 'One dot after another: `tidy = name.strip().title()`.',
  solution: `name = "  kofi mensah  "

tidy = name.strip().title()
print(tidy)`,
  check: `assert "tidy" in globals(), "Make a variable called tidy."
assert tidy == name.strip().title(), 'tidy should read "Kofi Mensah": .strip() for the spaces, then .title() for the capitals.'`,
},
{
  id: 'py-08', mins: 4,
  title: 'A dict: look things up by name',
  concept: [
    'Curly brackets make a **dict** (short for dictionary): pairs of a **key** and a value. `prices = {"latte": 4.50, "tea": 2.75}`.',
    'Look a value up by its key, in square brackets: `prices["tea"]` is 2.75. Like looking up a word to find its meaning.',
    'Store into a key to add a pair, or to change one: `prices["mocha"] = 5.25`.',
  ],
  starter: `prices = {"latte": 4.50, "espresso": 3.00, "tea": 2.75}

print(prices["latte"])`,
  task: 'Add `"mocha"` at **5.25** to `prices`. Then make `two_teas`: the price of two teas, looked up from `prices`.',
  hint: '`prices["mocha"] = 5.25`, then `two_teas = prices["tea"] * 2`.',
  solution: `prices = {"latte": 4.50, "espresso": 3.00, "tea": 2.75}

prices["mocha"] = 5.25
two_teas = prices["tea"] * 2
print(two_teas)`,
  check: `assert "mocha" in prices, 'Add mocha to prices: prices["mocha"] = 5.25'
assert prices["mocha"] == 5.25, "mocha should cost 5.25."
assert "two_teas" in globals(), "Make a variable called two_teas."
assert two_teas == prices["tea"] * 2, 'two_teas is prices["tea"] times 2.'`,
},
{
  id: 'py-09', mins: 4,
  title: 'Only if: if, elif, else',
  concept: [
    '`if` runs the lines under it only when its comparison is True. `else` gives the lines to run when it isn\'t.',
    'The `if` line ends with a colon, `:`, and the lines that belong to it are pushed in by 4 spaces. That indent is how Python knows where they end.',
    '`elif` (short for "else if") adds another test in between. Python stops at the first test that is True.',
  ],
  starter: `cups = 38

if cups > 45:
    label = "busy"
else:
    label = "quiet"

print(label)`,
  task: 'Add a middle band: over 45 is `"busy"`, over 25 is `"normal"`, anything else `"quiet"`. With 38 cups, `label` should come out `"normal"`.',
  hint: 'Between the `if` block and `else:`, add `elif cups > 25:` and, indented under it, `label = "normal"`.',
  solution: `cups = 38

if cups > 45:
    label = "busy"
elif cups > 25:
    label = "normal"
else:
    label = "quiet"

print(label)`,
  check: `assert "label" in globals(), "Keep the variable called label."
assert label == "normal", '38 cups is over 25 but not over 45, so label should be "normal". Add an elif cups > 25: test.'`,
},
{
  id: 'py-10', mins: 4,
  title: 'For each one: for',
  concept: [
    '`for cup in cups:` runs the indented lines once for every item in the list. Each time round, `cup` holds the next item.',
    'It is how you do something to every item: print it, test it, or add it to a running count.',
    'In pandas you rarely write this yourself. `cafe["cups"] * 2` doubles every row at once, but a loop like this is what happens underneath.',
  ],
  starter: `cups = [30, 12, 18, 41, 25]

for cup in cups:
    print(cup)`,
  task: 'Count the busy days. Make `busy_days` start at 0, then go through `cups` and add 1 to it each time an item is **more than 20**.',
  hint: `\`busy_days = 0\` above the loop. Inside it: \`if cup > 20:\`, and under that, indented again, \`busy_days = busy_days + 1\`.`,
  solution: `cups = [30, 12, 18, 41, 25]

busy_days = 0
for cup in cups:
    if cup > 20:
        busy_days = busy_days + 1

print(busy_days)`,
  check: `assert "busy_days" in globals(), "Make a variable called busy_days, starting at 0."
assert busy_days == sum(1 for _c in cups if _c > 20), "busy_days should count the items over 20: that's 3 of them."`,
},
];
