/* The Python course, parts 3 onwards (py-11 to py-80): the fuller teaching,
   a worked example and the task as a brief (see detail/index.js).
   Escaping: Python backslashes are written \\ here, as in python.js. */

export const PYTHON_DETAIL = {

/* ── Numbers and text ── */
'py-11': {
  explain: [
    'Python has two kinds of number. Whole numbers are called **int** (short for integer), like `30`. Numbers with a decimal point are called **float**, like `4.5`.',
    '`type(x)` tells you which kind a value is. It matters because some things only make sense for whole numbers, like a count of cups.',
    'Decimals are stored in binary inside the computer, so a few come out a hair off: `0.1 + 0.2` gives `0.30000000000000004`. It\'s normal. `round(x, 2)` tidies it for showing.',
    '`//` divides and throws the remainder away, keeping a whole number: `130 // 60` is 2.',
    '`%` (called modulo) gives just the remainder: `130 % 60` is 10. Together they turn 130 minutes into 2 hours and 10 minutes.',
  ],
  example: {
    say: 'Here 75 pastries are packed into boxes of 6: how many full boxes, and how many left over?',
    code: `pastries = 75
boxes = pastries // 6
left = pastries % 6
print(boxes, "full boxes and", left, "left over")
print(type(boxes), type(4.5))`,
    lines: [
      ['pastries // 6', '75 divided by 6 is 12.5; // keeps only the whole part: 12 boxes.'],
      ['pastries % 6', 'the remainder: 12 boxes use 72 pastries, so 3 are left.'],
      ['type(boxes), type(4.5)', 'shows that boxes is an int and 4.5 is a float.'],
    ],
  },
  brief: {
    story: 'The payroll sheet records shifts in hours and minutes, but the till logs them in minutes.',
    get: [['One variable is ready:', { shift: 'a barista\'s shift, 487 minutes' }]],
    want: ['Make `hours`: the whole hours in the shift, using `//`', 'Make `mins`: the minutes left over, using `%`'],
    out: 'Set `hours` and `mins`, both whole numbers: 487 minutes is 8 hours and 7 minutes.',
  },
},
'py-12': {
  explain: [
    'Numbers often arrive as text: typed into a form, read from a file, copied from a website. `"12"` in quotes looks like a number but is a string.',
    'Text can\'t be added up like numbers. `"12" + "3"` joins the two into `"123"`, and `"12" + 3` (text plus a number) stops with an error.',
    'To fix it, convert: `int("12")` turns text into a whole number, and `float("4.50")` into a decimal.',
    '`str(7)` goes the other way, turning a number into text, which is useful when you want to join it into a sentence.',
    'If the text isn\'t a number at all, `int("ten")` stops with a ValueError. Part 8 of the course shows how to catch that.',
  ],
  example: {
    say: 'Here the till sends quantities as text, and they need adding up properly.',
    code: `sold = ["3", "5", "2"]
print(sold[0] + sold[1])
total = int(sold[0]) + int(sold[1]) + int(sold[2])
print(total)
print("Sold " + str(total) + " cakes")`,
    lines: [
      ['sold[0] + sold[1]', 'joins the two strings into "35": text, not 8.'],
      ['int(sold[0]) + ...', 'turns each piece into a whole number first, so they add up: 10.'],
      ['str(total)', 'turns 10 back into text so it can be joined into the sentence.'],
    ],
  },
  brief: {
    story: 'A price list arrived from the supplier\'s website, and every price came through as text.',
    get: [['A list is ready:', { prices: '["4.50", "3.00", "2.75"]: prices, but as text' }]],
    want: ['Turn each price into a real number', 'Add the three up'],
    out: 'Set `total`, a number: 10.25.',
    fine: ['Start `total = 0`, then loop over the prices, adding `float(p)` each time.'],
  },
},
'py-13': {
  explain: [
    'A string is a row of characters (letters, digits, dashes, spaces), and each has a position, counted from 0 like a list.',
    '`code[0]` is the first character and `code[-1]` the last.',
    'A **slice** takes a run of characters: `code[4:8]` goes from position 4 up to, but not including, 8. That\'s 4 characters.',
    'Leave a number out to mean "from the start" or "to the end": `code[:3]` is the first three, and `code[9:]` is everything from position 9.',
    '`len(code)` counts the characters, and `code[::-1]` gives the whole string backwards.',
  ],
  example: {
    say: 'Here a delivery reference is taken apart with slices.',
    code: `ref = "ACC-1207-B"
print(ref[:3])
print(ref[4:8])
print(ref[-1])
print(len(ref))`,
    lines: [
      ['ref[:3]', 'from the start up to position 3: ACC.'],
      ['ref[4:8]', 'positions 4, 5, 6 and 7: 1207. Position 3 is the dash, so it starts at 4.'],
      ['ref[-1]', 'the last character: B.'],
      ['len(ref)', 'how many characters there are: 10.'],
    ],
  },
  brief: {
    story: 'Order codes pack three facts into one string, and the report needs them as separate columns.',
    get: [['One string is ready:', { code: '"LAG-2024-0153": the city, the year and the order number, with dashes between' }]],
    want: ['Make `city`: the first part', 'Make `year`: the middle part', 'Make `number`: the last part'],
    out: 'Set all three as text, using slices. `year` should be `"2024"`.',
    fine: ['Count the positions: the dashes sit at 3 and 8.'],
  },
},
'py-14': {
  explain: [
    'An **f-string** lets you drop values into text. Put an `f` just before the opening quote, then put names inside curly brackets: `f"{name} owes {total}"`.',
    'Python swaps each `{...}` for the value it holds when the line runs, so the sentence always shows the current numbers.',
    'After a colon inside the brackets, you say how it should look. `{total:.2f}` shows exactly 2 decimal places.',
    '`{big:,}` adds commas between thousands, so 1234567 shows as 1,234,567.',
    'Formatting only changes how a number looks in the text. The number itself, stored in its variable, is untouched.',
  ],
  example: {
    say: 'Here a receipt line and a yearly figure are written with f-strings.',
    code: `item = "cold brew"
price = 3.5
cups_this_year = 48210
print(f"1 x {item}: {price:.2f}")
print(f"Cups this year: {cups_this_year:,}")`,
    lines: [
      ['f"1 x {item}: {price:.2f}"', '{item} becomes cold brew, and {price:.2f} shows 3.5 as 3.50.'],
      ['{cups_this_year:,}', 'adds a comma between the thousands: 48,210.'],
    ],
  },
  brief: {
    story: 'The tab screen and the yearly report both need numbers shown the way people expect to read them.',
    get: [['Three values are ready:', { name: '"Ada"', total: '12.5, what Ada owes', takings: '1234567, the year\'s takings' }]],
    want: ['Make `line`, reading exactly `Ada owes £12.50`', 'Make `big`, reading exactly `Takings: 1,234,567`', 'Use f-strings for both'],
    out: 'Set `line` and `big`.',
  },
},
'py-15': {
  explain: [
    '`text.split(",")` cuts a string wherever there\'s a comma and gives back a list of the pieces.',
    'With nothing in the brackets, `.split()` cuts on spaces, which is handy for words in a sentence.',
    'The pieces are still text, so a number among them needs `int(...)` or `float(...)` before you can do sums with it.',
    '`", ".join(items)` goes the other way: it glues a list of strings into one, with `", "` between each.',
    'Splitting and joining is most of what reading and writing a simple file means: one line of text in, a list of values out, and back again.',
  ],
  example: {
    say: 'Here a line from a delivery note is split into its parts, and a list of cities is joined into one line.',
    code: `note = "beans;6;9.75"
parts = note.split(";")
print(parts)
bags = int(parts[1])
print(bags * float(parts[2]))
print(" | ".join(["Lagos", "Accra", "Nairobi"]))`,
    lines: [
      ['note.split(";")', 'cuts at every semicolon: [\'beans\', \'6\', \'9.75\'].'],
      ['int(parts[1])', 'the second piece is "6" as text; int turns it into the number 6.'],
      ['bags * float(parts[2])', '6 bags at 9.75 each: 58.5.'],
      ['" | ".join([...])', 'glues the three cities together with " | " between them.'],
    ],
  },
  brief: {
    story: 'A line from the till export needs turning into real values, and the menu board needs one line listing the drinks.',
    get: [['Ready to use:', { line: '"latte,3,4.50": a drink, the cups, and the price', parts: 'line split at the commas' }]],
    want: ['Make `drink`, `cups` (a whole number) and `price` (a decimal) from `parts`', 'Make `cost`: cups times price', 'Make `menu` by joining `["latte", "tea", "mocha"]` with `" / "`'],
    out: 'Set `drink`, `cups`, `price`, `cost` and `menu`.',
  },
},

/* ── Loops in depth ── */
'py-16': {
  explain: [
    '`range` makes a run of whole numbers for a loop to go through. `range(5)` gives 0, 1, 2, 3, 4: five numbers, starting at 0 and stopping **before** 5.',
    'Give it two numbers to choose the start: `range(1, 6)` gives 1, 2, 3, 4, 5. It still stops before the second number.',
    'A third number is the step: `range(0, 20, 5)` counts 0, 5, 10, 15.',
    '`for i in range(3):` repeats something exactly 3 times, whether or not you use `i` inside.',
    'A range doesn\'t show its numbers when printed. `list(range(...))` turns it into a list you can see.',
  ],
  example: {
    say: 'Here range counts table numbers and the hours the café is open.',
    code: `print(list(range(4)))
print(list(range(1, 5)))
print(list(range(8, 20, 4)))
for table in range(1, 4):
    print("Table", table)`,
    lines: [
      ['range(4)', '0, 1, 2, 3: four numbers, stopping before 4.'],
      ['range(1, 5)', 'starts at 1 instead: 1, 2, 3, 4.'],
      ['range(8, 20, 4)', 'from 8 in steps of 4, stopping before 20: 8, 12, 16.'],
      ['for table in range(1, 4):', 'runs the print three times, with table as 1, 2 and 3.'],
    ],
  },
  brief: {
    story: 'A trainee wants to check two counting jobs with Python before doing them by hand.',
    get: [['The editor shows a loop over `range(5)`, printing 0 to 4.']],
    want: ['Make `total`: every whole number from 1 to 100 added up, using a loop over a `range`', 'Make `evens`: a list of the even numbers from 2 to 20, using a range with a step'],
    out: 'Set `total` (5050) and `evens`.',
    fine: ['A range stops before its second number, so 1 to 100 is `range(1, 101)`.'],
  },
},
'py-17': {
  explain: [
    '`while condition:` repeats the lines under it for as long as the condition is True. It checks again before every turn.',
    'Use `while` when you don\'t know in advance how many times to repeat: "until the jar is full", "until the queue is empty".',
    'Something inside the loop has to change, or the condition stays True and the loop never ends. (If that happens here, Python is stopped after a while and says so.)',
    '`x += 1` is a short way of writing `x = x + 1`. The same works for `-=`, `*=` and `/=`.',
    'When the loop ends, the variables keep their last values, so you can read off how many turns it took.',
  ],
  example: {
    say: 'Here a tip jar gets 2.50 an hour: how many hours until it holds at least 10?',
    code: `jar = 0
hours = 0
while jar < 10:
    jar += 2.50
    hours += 1
print(hours, jar)`,
    lines: [
      ['while jar < 10:', 'keeps going while the jar holds less than 10.'],
      ['jar += 2.50', 'adds 2.50 each turn: 2.5, 5.0, 7.5, 10.0.'],
      ['hours += 1', 'counts the turns.'],
      ['print(hours, jar)', 'after 4 turns jar is 10.0, which isn\'t less than 10, so the loop stops: 4 10.0.'],
    ],
  },
  brief: {
    story: 'A barista is saving 7.50 a day towards a 100 coffee course, and wants to know how long it\'ll take.',
    get: [['Two variables are ready:', { savings: 'starts at 0', day: 'starts at 0' }]],
    want: ['Write a `while` loop that runs until `savings` reaches at least 100', 'Each turn, add 7.50 to `savings` and 1 to `day`'],
    out: 'Leave `day` and `savings` holding their final values: it takes 14 days.',
  },
},
'py-18': {
  explain: [
    '`break` leaves a loop straight away, skipping any items still to come. Use it once you\'ve found what you were looking for.',
    '`continue` skips the rest of the current turn and moves on to the next item. Use it to leave some items out.',
    'Both usually sit inside an `if`, so they only happen when something is true.',
    'A `for` loop can have an `else:` underneath, which runs only if the loop finished without hitting `break`. It\'s a neat way to say "not found".',
    'A variable set inside a loop is still there after it, so you can read what the loop found.',
  ],
  example: {
    say: 'Here a list of waiting times is searched, and then added up without the missing ones.',
    code: `waits = [3, 5, None, 12, 4]
for w in waits:
    if w is not None and w > 10:
        print("First long wait:", w)
        break
total = 0
for w in waits:
    if w is None:
        continue
    total += w
print("Total:", total)`,
    lines: [
      ['break', 'once 12 is found, the first loop stops: it never looks at 4.'],
      ['if w is None: continue', 'skips the missing value and goes straight to the next one.'],
      ['total += w', 'only runs for real values: 3 + 5 + 12 + 4 = 24.'],
    ],
  },
  brief: {
    story: 'The manager wants the first big order of the day, and the day\'s total without the cancelled order.',
    get: [['A list is ready:', { orders: '[12.0, 8.5, -1, 23.0, 4.0, 31.5], where -1 marks a cancelled order' }]],
    want: ['Make `first_big`: the first order over 20, found with a loop and `break`', 'Make `total`: all the orders added up, skipping the cancelled one with `continue`'],
    out: 'Set `first_big` (23.0) and `total` (79.0).',
  },
},
'py-19': {
  explain: [
    'You can put a loop inside another loop. The inner loop runs all the way through, once for every turn of the outer one.',
    'It\'s how you make every combination of two lists: for each drink, go through every size.',
    'Two drinks in three sizes make 2 × 3 = 6 combinations.',
    'Each loop has its own indent, so the inner loop\'s lines are pushed in twice.',
    'The work multiplies: two lists of 100 make 10,000 turns, which is worth remembering when lists get long.',
  ],
  example: {
    say: 'Here every pastry is paired with every filling.',
    code: `pastries = ["croissant", "bun"]
fillings = ["jam", "custard"]
for p in pastries:
    for f in fillings:
        print(f, p)`,
    lines: [
      ['for p in pastries:', 'the outer loop picks croissant, then bun.'],
      ['for f in fillings:', 'for each pastry, the inner loop goes through both fillings.'],
      ['print(f, p)', 'runs 2 × 2 = 4 times: jam croissant, custard croissant, jam bun, custard bun.'],
    ],
  },
  brief: {
    story: 'The new menu board lists every drink in every size, and someone has to write the list.',
    get: [['Two lists are ready:', { drinks: '["latte", "tea"]', sizes: '["small", "medium", "large"]' }]],
    want: ['Make `options`: a list of strings like `"small latte"`', 'One for every size of every drink', 'Put the drinks in the outer loop'],
    out: 'Set `options`: 6 strings, all the latte sizes first.',
  },
},
'py-20': {
  explain: [
    '`enumerate(items)` gives each item together with its position, so you don\'t have to count yourself: `for i, name in enumerate(names):`.',
    'Positions start at 0. Add `start=1` to count from 1, the way people number lists.',
    '`zip(a, b)` walks two lists side by side: the first with the first, the second with the second, and so on.',
    'They work together: `enumerate(zip(a, b))` gives a position and a pair, unpacked as `i, (x, y)`.',
    '`reversed(items)` goes through backwards and `sorted(items)` in order, both without changing the list itself.',
  ],
  example: {
    say: 'Here the day\'s three rotas are numbered and paired with their shift times.',
    code: `staff = ["Ama", "Ben", "Chi"]
shifts = ["7am", "11am", "3pm"]
for i, (person, start) in enumerate(zip(staff, shifts), start=1):
    print(f"{i}. {person} starts at {start}")`,
    lines: [
      ['zip(staff, shifts)', 'pairs Ama with 7am, Ben with 11am, Chi with 3pm.'],
      ['enumerate(..., start=1)', 'numbers each pair from 1.'],
      ['i, (person, start)', 'unpacks the number and the pair in one go.'],
    ],
  },
  brief: {
    story: 'The loyalty email lists the top customers, numbered, with what each spent.',
    get: [['Two lists are ready, in the same order:', { names: '["Ada", "Kofi", "Zola"]', spent: '[12.5, 30.0, 8.25]' }]],
    want: ['Make `lines`: one string per customer, like `"1. Ada: 12.50"`', 'Use `enumerate` with `start=1` together with `zip`', 'Show the amounts with 2 decimal places'],
    out: 'Set `lines`, a list of three strings.',
  },
},

/* ── Lists and tuples ── */
'py-21': {
  explain: [
    'Lists can change after they\'re made. `.append(x)` adds x to the end, and `.insert(0, x)` puts x at the front (position 0).',
    '`items[1] = x` replaces the item at position 1 with x.',
    '`.remove(x)` takes out the first x it finds. `.pop()` takes the last item off and hands it back; `.pop(0)` does the same with the first.',
    'These methods change the list itself, in place. Apart from `.pop()`, they hand back nothing at all (`None`).',
    'So never write `queue = queue.append(x)`: that stores the nothing, and the list is lost. Just write `queue.append(x)`.',
  ],
  example: {
    say: 'Here the pastry case is restocked and sold from.',
    code: `case = ["muffin", "scone"]
case.append("croissant")
case.insert(0, "brownie")
case.remove("scone")
sold = case.pop()
print(sold)
print(case)`,
    lines: [
      ['case.append("croissant")', 'adds it to the end: muffin, scone, croissant.'],
      ['case.insert(0, "brownie")', 'puts brownie at the front.'],
      ['case.remove("scone")', 'takes scone out.'],
      ['sold = case.pop()', 'takes the last item, croissant, off the list and stores it in sold.'],
    ],
  },
  brief: {
    story: 'The queue at the counter changes all morning, and the app has to keep up.',
    get: [['A list is ready:', { queue: '["Ada", "Kofi", "Zola"], in the order they joined' }]],
    want: ['Femi joins the end', 'Nia jumps in at the front', 'Kofi leaves', 'The first person is served: take them off with `pop(0)` into `served`'],
    out: 'Set `served`. `queue` should end as `["Ada", "Zola", "Femi"]`.',
  },
},
'py-22': {
  explain: [
    '`b = a` doesn\'t copy a list. It gives the same list a second name. There\'s still only one list.',
    'So a change made through `b` shows up through `a` too, because they\'re the same list.',
    'To get a separate list you can change freely, make a copy: `b = a.copy()`, `b = a[:]` or `b = list(a)` all work.',
    'This catches everyone at least once. It applies to dicts as well, and to a list you hand to a function that changes it.',
    '`b is a` asks whether two names point at the very same list: True for a second name, False for a copy.',
  ],
  example: {
    say: 'Here the same mistake happens with a list of opening hours, then the fix.',
    code: `hours = [8, 9, 10]
same = hours
copy = hours.copy()
same.append(11)
print(hours)
print(copy)
print(same is hours, copy is hours)`,
    lines: [
      ['same = hours', 'a second name for the same list.'],
      ['copy = hours.copy()', 'a separate list with the same items.'],
      ['same.append(11)', 'changes the one list, so hours shows the 11 too.'],
      ['copy is hours', 'False: the copy was left alone.'],
    ],
  },
  brief: {
    story: 'The sale price list ended up changing the full prices too, and the till started charging sale prices all day.',
    get: [['The editor makes `sale` from `prices` and takes 20% off every item, but `prices` changes as well.']],
    want: ['Fix it so `sale` gets the 20% off', '...but `prices` stays as `[4.5, 3.0, 2.75]`'],
    out: 'Keep `prices` unchanged; `sale` should be `[3.6, 2.4, 2.2]`.',
  },
},
'py-23': {
  explain: [
    '`sorted(items)` gives a **new** sorted list and leaves the old one alone. `items.sort()` sorts the list itself, in place.',
    'Add `reverse=True` to either for biggest first.',
    '`x in items` asks whether x is in the list, `items.index(x)` gives its position (the first time it appears), and `items.count(x)` how many times it appears.',
    '`min`, `max` and `sum` work on any list of numbers.',
    'A slice works on any list: `sorted(items, reverse=True)[:3]` is the three biggest.',
  ],
  example: {
    say: 'Here a list of cake sales is searched and sorted.',
    code: `cakes = [7, 12, 3, 12, 9]
print(sorted(cakes))
print(sorted(cakes, reverse=True)[:2])
print(cakes.index(12), cakes.count(12))
print(cakes)`,
    lines: [
      ['sorted(cakes)', 'a new list, smallest first: [3, 7, 9, 12, 12].'],
      ['sorted(..., reverse=True)[:2]', 'biggest first, then the first two: [12, 12].'],
      ['cakes.index(12)', 'where 12 first appears: position 1.'],
      ['print(cakes)', 'unchanged, because sorted() made a new list.'],
    ],
  },
  brief: {
    story: 'The weekly report highlights the best days, and the manager noticed one figure repeated.',
    get: [['A list is ready:', { cups: '[31, 48, 12, 55, 40, 61, 9, 48]: cups sold each day' }]],
    want: ['Make `top3`: the three biggest values, biggest first', 'Make `busiest_day`: the position of the biggest value', 'Make `repeats`: how many times 48 appears'],
    out: 'Set all three, and leave `cups` itself unchanged.',
  },
},
'py-24': {
  explain: [
    'A **tuple** is like a list in round brackets: `("Ada", 12.5)`. The difference is that it can\'t be changed once it\'s made.',
    'That suits a fixed bundle of facts that belong together, like a name and a total, or a date and a city.',
    '**Unpacking** splits a tuple into separate names in one line: `name, total = pair`. There must be one name per item.',
    'Unpacking also swaps two values with no spare variable: `a, b = b, a`.',
    'A function can hand back several values at once, `return low, high`, which arrive as a tuple. Unpack them where you call it: `low, high = spread(prices)`.',
  ],
  example: {
    say: 'Here a delivery is stored as a tuple, unpacked, and a function returns two values.',
    code: `delivery = ("Accra", "beans", 12)
city, item, bags = delivery
print(city, bags)

def first_and_last(days):
    return days[0], days[-1]

start, end = first_and_last(["Mon", "Tue", "Wed"])
print(start, end)`,
    lines: [
      ['city, item, bags = delivery', 'three names for the three values, in order.'],
      ['return days[0], days[-1]', 'hands back two values as one tuple.'],
      ['start, end = ...', 'unpacks them where the function is called: Mon Wed.'],
    ],
  },
  brief: {
    story: 'Orders arrive as fixed bundles, and the pricing team wants the range of a price list from one function call.',
    get: [['Ready to use:', { order: '("Ada", "latte", 2, 4.5): a customer, a drink, cups and price', cheapest_and_dearest: 'a function that currently returns None' }]],
    want: ['Unpack `order` into `name`, `drink`, `cups` and `price`', 'Make `cheapest_and_dearest` return the smallest and biggest price as a tuple', 'Unpack its answer for `[4.5, 3.0, 6.25, 2.75]` into `low, high`'],
    out: 'Set the four names, finish the function, and set `low` (2.75) and `high` (6.25).',
  },
},
'py-25': {
  explain: [
    'A **list comprehension** builds a new list in one line: `[p * 2 for p in prices]` is every price, doubled.',
    'Read it left to right: "p times 2, for each p in prices". The part before `for` is what goes into the new list.',
    'Add an `if` at the end to keep only some items: `[p for p in prices if p > 3]` keeps the prices over 3.',
    'It does exactly what a loop with `.append` does, in less space. Both are fine; use whichever reads more clearly.',
    'The original list is left alone: a comprehension always makes a new one.',
  ],
  example: {
    say: 'Here cake prices go up 10%, and only the cheap ones are picked out.',
    code: `cakes = [2.00, 3.50, 1.20, 4.00]
raised = [round(c * 1.1, 2) for c in cakes]
cheap = [c for c in cakes if c < 3]
print(raised)
print(cheap)`,
    lines: [
      ['[round(c * 1.1, 2) for c in cakes]', 'every price times 1.1, rounded to 2 places.'],
      ['[c for c in cakes if c < 3]', 'keeps only the prices under 3: [2.0, 1.2].'],
    ],
  },
  brief: {
    story: 'The price list for wholesale customers adds 20% tax, but only on items over 2.',
    get: [['A list is ready:', { prices: '[4.5, 3.0, 2.75, 6.0, 1.25]' }]],
    want: ['Make `with_vat` in **one** list comprehension', 'Keep each price over 2', 'Multiply it by 1.2 and round to 2 places'],
    out: 'Set `with_vat`: [5.4, 3.6, 3.3, 7.2].',
  },
},
};
