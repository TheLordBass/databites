/* The Python course, parts 1 and 2 (py-01 to py-10): the fuller teaching,
   a worked example and the task as a brief (see detail/index.js). For
   someone who has never written code: every point says what a thing is,
   what it looks like and when you'd use it, with nothing assumed. */

export const BASICS_DETAIL = {
'py-01': {
  explain: [
    'A program is just a list of instructions. You type them in the editor, press **Run**, and Python works through them one line at a time, from the top down.',
    '`print(...)` shows whatever\'s inside its brackets, underneath your code. Leave the print out and Python still works the answer out, it just keeps it to itself.',
    'Python does sums like a calculator: `+` adds, `-` takes away, `*` multiplies and `/` divides. Times is `*` because `x` is already a letter.',
    'Brackets go first, just like in school maths. `(2 + 3) * 4` is 20, but `2 + 3 * 4` is 14.',
    'Every `print` starts a fresh line, so two prints give you two answers, one under the other.',
  ],
  example: {
    say: 'Here Python works out a small café bill: three teas at £2.75 each, then the same three teas plus a £2.00 pastry.',
    code: `print(3 * 2.75)
print(3 * 2.75 + 2.00)
print((3 + 1) * 2.75)`,
    lines: [
      ['print(3 * 2.75)', 'works out 3 times 2.75 and shows the answer: 8.25.'],
      ['print(3 * 2.75 + 2.00)', 'times comes before plus, so it\'s 8.25 + 2.00: 10.25.'],
      ['print((3 + 1) * 2.75)', 'the brackets go first, making 4, then 4 times 2.75: 11.0.'],
    ],
  },
  brief: {
    story: 'A regular wants to know what a round of lattes for the office costs before they order.',
    get: [['The editor starts with `print(2 + 3)`, which shows 5. A latte costs £4.50.']],
    want: ['Add a new line under the first one', 'Print what **12** lattes cost'],
    out: 'Run it: under the 5, you should see the price of 12 lattes.',
    fine: ['Use `*` for times: `12 * 4.50`.'],
  },
},
'py-02': {
  explain: [
    'A **variable** is a name you give to a value. `price = 4.50` files 4.50 away under the name `price`, and from then on, `price` means 4.50.',
    'Here `=` means "store this", not "is equal to". The name always goes on the left, and the value on the right.',
    'Once a value has a name, you can use the name wherever you\'d use the value, so `price * 2` is 9.0.',
    'Names can\'t have spaces, so join words with an underscore, like `cups_sold`. Capitals count too: `Price` and `price` are two different names.',
    'Names make code easier to read, and much easier to change. Update `price` once and every sum that uses it follows along.',
  ],
  example: {
    say: 'Here a pastry\'s price and the number sold get names, and the day\'s pastry money is worked out from those names.',
    code: `pastry_price = 2.00
pastries = 15
pastry_money = pastry_price * pastries
print(pastry_money)`,
    lines: [
      ['pastry_price = 2.00', 'stores 2.00 under the name pastry_price.'],
      ['pastries = 15', 'stores 15 under the name pastries.'],
      ['pastry_money = pastry_price * pastries', 'multiplies the two named values and stores the answer, 30.0, as pastry_money.'],
      ['print(pastry_money)', 'shows what\'s stored under that name.'],
    ],
  },
  brief: {
    story: 'The café wants today\'s takings for lattes, worked out from the price and the cups sold rather than typed in by hand.',
    get: [['Two variables are ready:', { price: 'the price of one latte, £4.50', cups: 'how many were sold, 30' }]],
    want: ['Make a variable called `takings`', 'Make it price times cups, using the names, not the numbers'],
    out: 'Set `takings`. Adding `print(takings)` shows it: 135.0.',
  },
},
'py-03': {
  explain: [
    'Text in Python goes inside quotes, like `"latte"`. A piece of text is called a **string**, as in a string of letters.',
    'The quotes tell Python "this is text, not a name". Without them, Python reads `latte` as a variable name, and if nothing has that name, you get an error.',
    'Double quotes `"` and single quotes `\'` both work. Just use the same kind at both ends.',
    '`+` joins two strings end to end: `"cold" + " brew"` gives `"cold brew"`. Python won\'t add spaces for you, so put them inside the quotes.',
    'A variable can hold text just as easily as a number. After `city = "Accra"`, `city` means "Accra".',
  ],
  example: {
    say: 'Here two pieces of text are joined to make the label for a cake stand.',
    code: `cake = "banana bread"
price = "2.50"
label = cake + ": " + price
print(label)`,
    lines: [
      ['cake = "banana bread"', 'stores the text banana bread under the name cake.'],
      ['price = "2.50"', 'in quotes, so this 2.50 is text, the way it should be printed, not a number.'],
      ['label = cake + ": " + price', 'joins three strings: the cake, a colon and space, then the price.'],
      ['print(label)', 'shows banana bread: 2.50.'],
    ],
  },
  brief: {
    story: 'The order screen needs a line saying what was ordered and where, like "latte in Lagos".',
    get: [['Two strings are ready:', { drink: '"latte"', city: '"Lagos"' }]],
    want: ['Make `order`: the drink, then `" in "`, then the city, joined with `+`', 'Print it'],
    out: 'Set `order`. It should read `latte in Lagos`.',
    fine: ['The spaces go inside the quotes around in: `" in "`.'],
  },
},
'py-04': {
  explain: [
    'A **comparison** asks a yes-or-no question about two values, and Python answers with `True` or `False`.',
    'You can ask `>` more than, `<` less than, `>=` at least, `<=` at most, `==` equal to, and `!=` not equal to.',
    'Comparing needs **two** equals signs. One `=` stores a value, while `==` asks "are these the same?" Mixing them up is the most common slip there is.',
    'True and False are values like any other, so you can keep the answer in a variable: `is_open = hour < 18`.',
    'These little yes-or-no answers are what every decision in code is built on: do this, but only if it\'s True.',
  ],
  example: {
    say: 'Here the café asks two questions about a tea order.',
    code: `teas = 8
print(teas >= 8)
print(teas == 10)
big_order = teas > 5
print(big_order)`,
    lines: [
      ['print(teas >= 8)', 'is 8 at least 8? Yes, so it shows True.'],
      ['print(teas == 10)', 'is 8 equal to 10? No: False.'],
      ['big_order = teas > 5', 'stores the answer to "is it more than 5?" under a name.'],
      ['print(big_order)', 'shows True.'],
    ],
  },
  brief: {
    story: 'The rota tool marks a day as busy when the café sells more than 45 cups.',
    get: [['One variable is ready:', { cups: 'cups sold today, 52' }]],
    want: ['Make `is_busy`: whether `cups` is **more than 45**', 'Print it'],
    out: 'Set `is_busy` to the comparison itself, so it holds True or False.',
  },
},
'py-05': {
  explain: [
    'A **list** keeps several values together in order, inside square brackets with commas between them: `cups = [30, 12, 18]`.',
    'Every item has a position, and Python counts from **0**, not 1. So `cups[0]` is the first item and `cups[1]` the second. It feels odd at first, but you get used to it.',
    'Negative positions count back from the end. `cups[-1]` is the last item, and `cups[-2]` the one before it.',
    '`len(cups)` counts the items, `sum(cups)` adds them up, and `max(cups)` and `min(cups)` find the biggest and smallest.',
    'Lists are how you keep a week of sales, a set of prices or a queue of customers together under one name.',
  ],
  example: {
    say: 'Here\'s a week of pastry sales, and four questions about it.',
    code: `pastries = [12, 9, 15, 7, 20]
print(pastries[1])
print(pastries[-2])
print(max(pastries))
print(len(pastries))`,
    lines: [
      ['pastries[1]', 'position 1 is the second item, because counting starts at 0: 9.'],
      ['pastries[-2]', 'the second from the end: 7.'],
      ['max(pastries)', 'the biggest day: 20.'],
      ['len(pastries)', 'how many days are in the list: 5.'],
    ],
  },
  brief: {
    story: 'The manager wants the week\'s total cups and how today went, from the list of daily sales.',
    get: [['A list is ready:', { cups: 'cups sold each day this week, in order: [30, 12, 18, 41, 25]' }]],
    want: ['Make `total`: all the cups added up', 'Make `last`: the last item in the list'],
    out: 'Set `total` and `last`.',
  },
},
'py-06': {
  explain: [
    'A **function** is a ready-made action with a name. You use it, or "call" it, by writing its name followed by brackets, like `len(cups)`.',
    'Whatever goes in the brackets is what it works on. Some functions take two things, with a comma between: `round(3.14159, 2)` rounds to 2 places and gives 3.14.',
    'A function hands an answer back to you. You can print it, store it, or use it straight away in a bigger sum.',
    'You can tuck one function inside another, and Python works from the inside out. In `round(sum(cups) / 5, 1)`, it adds up first, then divides, then rounds.',
    'You\'ve already met a few: `print`, `len`, `sum` and `max` are all functions. pandas, which comes later, is mostly a big toolbox of them.',
  ],
  example: {
    say: 'Here the average price of three drinks is worked out and tidied to 2 decimal places.',
    code: `prices = [4.50, 3.00, 2.75]
average = sum(prices) / len(prices)
print(average)
print(round(average, 2))`,
    lines: [
      ['sum(prices) / len(prices)', 'adds the prices (10.25) and divides by how many there are (3).'],
      ['print(average)', 'shows the full answer, with a long tail of digits.'],
      ['round(average, 2)', 'rounds it to 2 decimal places: 3.42.'],
    ],
  },
  brief: {
    story: 'The weekly report shows the average cups a day, rounded so it reads cleanly.',
    get: [['A list is ready:', { cups: 'cups sold on each of six days' }]],
    want: ['Add the cups up and divide by how many there are', 'Round it to **1** decimal place with `round`'],
    out: 'Set `average`, a number.',
    fine: ['Work from the inside out: the average first, then `round(..., 1)` around it.'],
  },
},
'py-07': {
  explain: [
    'Some actions belong to a particular kind of value, and you reach them with a dot. `"latte".upper()` gives `"LATTE"`. These are called **methods**.',
    'A method works on whatever\'s before the dot, so it doesn\'t need that value in its brackets. The brackets still go on the end, though.',
    'Text comes with some handy ones. `.upper()` and `.lower()` change the capitals, `.title()` gives every word a capital first letter, and `.strip()` trims spaces off both ends.',
    'A method doesn\'t change the original. It hands you back a new value, so store it if you want to keep it: `tidy = name.strip()`.',
    'You can chain dots, each one working on the result of the last. pandas works the same way, and `cafe.head()` is a method too.',
  ],
  example: {
    say: 'Here a drink name typed carelessly at the till is tidied up two ways.',
    code: `typed = "  FLAT white "
print(typed.strip())
print(typed.strip().lower())
print(typed.strip().title())`,
    lines: [
      ['typed.strip()', 'trims the spaces from both ends: FLAT white.'],
      ['.strip().lower()', 'trims, then makes it all small letters: flat white.'],
      ['.strip().title()', 'trims, then a capital at the start of each word: Flat White.'],
    ],
  },
  brief: {
    story: 'Names typed at the till come out with stray spaces and no capitals, and the loyalty card needs them neat.',
    get: [['One string is ready:', { name: '"  kofi mensah  ", with spaces at both ends' }]],
    want: ['Trim the spaces off both ends', '**Then** put a capital at the start of each word'],
    out: 'Set `tidy`. It should read `Kofi Mensah`.',
  },
},
'py-08': {
  explain: [
    'A **dict** (short for dictionary) stores pairs: a **key**, and the value that goes with it. Curly brackets make one: `prices = {"latte": 4.50, "tea": 2.75}`.',
    'Each pair is written key, colon, value, with commas between the pairs.',
    'You look a value up by its key, in square brackets: `prices["tea"]` is 2.75. Just like looking up a word in a dictionary to find its meaning.',
    'Store into a key and you either add a new pair or change the existing one: `prices["mocha"] = 5.25`.',
    'A list finds things by position, and a dict finds them by name. Reach for a dict whenever you\'ll look things up by what they\'re called.',
  ],
  example: {
    say: 'Here\'s a small pastry menu as a dict, with one price looked up and another changed.',
    code: `pastries = {"croissant": 2.20, "muffin": 2.50}
print(pastries["muffin"])
pastries["croissant"] = 2.40
pastries["scone"] = 1.90
print(pastries)`,
    lines: [
      ['pastries["muffin"]', 'looks up the value stored under the key muffin: 2.5.'],
      ['pastries["croissant"] = 2.40', 'croissant is already a key, so its price changes.'],
      ['pastries["scone"] = 1.90', 'scone is new, so a new pair is added.'],
      ['print(pastries)', 'shows all three pairs.'],
    ],
  },
  brief: {
    story: 'Mocha is joining the menu, and a customer has asked what two teas would cost.',
    get: [['A dict is ready:', { prices: '{"latte": 4.50, "espresso": 3.00, "tea": 2.75}' }]],
    want: ['Add `"mocha"` at **£5.25** to `prices`', 'Make `two_teas`: the price of two teas, looked up from `prices`'],
    out: 'Change `prices` and set `two_teas`.',
  },
},
'py-09': {
  explain: [
    '`if` runs the lines under it only when its comparison is True. When it\'s False, Python skips straight past them.',
    'The `if` line ends with a colon, `:`, and the lines that belong to it are pushed in by 4 spaces. That indent is how Python knows which lines are inside the if.',
    '`else:` holds the lines to run when the test is False. It doesn\'t need a comparison of its own.',
    '`elif` (short for "else if") squeezes another test in between. Use as many as you need.',
    'Python checks from the top down and stops at the **first** test that\'s True. So put the strictest test first, or it\'ll never get a turn.',
  ],
  example: {
    say: 'Here the café sorts a tip into a band, just the way the task sorts a day.',
    code: `tip = 3.50
if tip >= 5:
    note = "generous"
elif tip >= 2:
    note = "kind"
else:
    note = "small"
print(note)`,
    lines: [
      ['if tip >= 5:', '3.50 isn\'t at least 5, so this is False and its line is skipped.'],
      ['elif tip >= 2:', '3.50 is at least 2: True, so note becomes "kind" and Python stops checking.'],
      ['else:', 'only runs when every test above was False, so it\'s skipped here.'],
    ],
  },
  brief: {
    story: 'The rota sorts each day into busy, normal or quiet, and needs a middle band adding.',
    get: [['The editor sorts `cups` (38) into "busy" or "quiet" already.']],
    want: ['Keep over 45 as `"busy"`', 'Add a middle band: over 25 is `"normal"`', 'Anything else stays `"quiet"`'],
    out: 'Set `label`. With 38 cups, it should come out `"normal"`.',
    fine: ['The new `elif` goes between the `if` block and `else:`, with its line indented under it.'],
  },
},
'py-10': {
  explain: [
    'A **loop** repeats some lines for you. `for cup in cups:` runs the indented lines once for every item in the list.',
    'Each time round, the name after `for` (here `cup`) holds the next item: the first one, then the second, all the way to the end.',
    'Like `if`, the line ends with a colon, and the lines inside are indented by 4 spaces.',
    'A really common pattern is the running count. Set a variable to 0 before the loop, then add to it inside the loop whenever something\'s true.',
    'In pandas you\'ll rarely write loops yourself, because `cafe["cups"] * 2` doubles every row at once. But underneath, it\'s doing exactly this.',
  ],
  example: {
    say: 'Here a loop adds up the tips from five tables, one at a time, printing the total so far as it goes.',
    code: `tips = [2.00, 0.50, 3.00, 1.50, 2.50]
total = 0
for tip in tips:
    total = total + tip
    print(total)`,
    lines: [
      ['total = 0', 'starts the running total at 0, before the loop.'],
      ['for tip in tips:', 'goes through the list; each time, tip holds the next amount.'],
      ['total = total + tip', 'adds this tip to the total so far.'],
      ['print(total)', 'is indented too, so it runs each time round: 2.0, 2.5, 5.5, 7.0, 9.5.'],
    ],
  },
  brief: {
    story: 'The manager wants to know how many days this week the café sold more than 20 cups.',
    get: [['A list is ready:', { cups: 'cups sold each day: [30, 12, 18, 41, 25]' }]],
    want: ['Make `busy_days` start at 0', 'Go through `cups` with a loop', 'Add 1 to `busy_days` each time an item is **more than 20**'],
    out: 'Set `busy_days`. It should come out 3.',
  },
},
};
