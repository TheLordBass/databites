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

/* ── Dicts and sets ── */
'py-26': {
  explain: [
    'You can loop over a dict three ways. `for key in d:` gives the keys, `for value in d.values():` gives the values, and `for key, value in d.items():` gives both together.',
    '`key in d` asks whether a key is there, and answers True or False.',
    '`d[key]` stops with a KeyError when the key isn\'t there. `d.get(key, 0)` is the safe way: it gives the value, or 0 (or whatever you put second) when there\'s none.',
    '`d[key] = value` adds an entry or changes one, and `del d[key]` removes one.',
    'A list comprehension over `d.items()` picks out entries: `[k for k, v in d.items() if v > 10]`.',
  ],
  example: {
    say: 'Here the pastry stock is checked, looked up safely and tidied.',
    code: `stock = {"croissant": 0, "muffin": 9, "scone": 4}
for item, left in stock.items():
    print(item, left)
print("muffin" in stock, stock.get("bun", 0))
low = [item for item, left in stock.items() if left < 5]
del stock["croissant"]
print(low, stock)`,
    lines: [
      ['for item, left in stock.items():', 'goes through every pair, giving the key and the value each time.'],
      ['stock.get("bun", 0)', 'there are no buns in the dict, so it gives the 0 instead of an error.'],
      ['[item for item, left in ... if left < 5]', 'the pastries with fewer than 5 left.'],
      ['del stock["croissant"]', 'removes that entry altogether.'],
    ],
  },
  brief: {
    story: 'The morning stock check flags anything sold out, and someone has asked about cold brew, which the café doesn\'t stock yet.',
    get: [['A dict is ready:', { stock: 'each drink and how many are left: latte 40, tea 25, mocha 0, chai 12' }]],
    want: ['Make `out_of_stock`: a list of the drinks with 0 left', 'Make `cold_brew`: how many cold brews are in stock, using `.get` (there are none)', 'Remove mocha from `stock`'],
    out: 'Set `out_of_stock` and `cold_brew`, and change `stock`.',
  },
},
'py-27': {
  explain: [
    'Real data often arrives as a list of **records**: one dict per order, with the same keys in each. Data from websites (JSON) looks exactly like this.',
    'Loop over the list, and each time round you have one record. Read its fields by key: `order["total"]`.',
    'An `if` inside the loop leaves some records out, like cancelled orders.',
    'Collecting into a dict as you go, customer to running total, is called **grouping**. It\'s the same thing a pivot table or pandas\' groupby does.',
    '`spend.get(name, 0) + amount` is the trick: it starts each new customer at 0, then adds.',
  ],
  example: {
    say: 'Here deliveries are grouped by rider, adding up each rider\'s distance.',
    code: `trips = [
    {"rider": "Ama", "km": 4.0},
    {"rider": "Ben", "km": 2.5},
    {"rider": "Ama", "km": 3.0},
]
distance = {}
for t in trips:
    distance[t["rider"]] = distance.get(t["rider"], 0) + t["km"]
print(distance)`,
    lines: [
      ['for t in trips:', 'each time round, t is one trip record.'],
      ['t["rider"]', 'reads that trip\'s rider.'],
      ['distance.get(t["rider"], 0) + t["km"]', 'the rider\'s total so far (0 the first time), plus this trip.'],
      ['print(distance)', 'Ama: 7.0, Ben: 2.5.'],
    ],
  },
  brief: {
    story: 'The loyalty team wants each customer\'s spend, but cancelled orders shouldn\'t count.',
    get: [['A list of order records is ready:', { orders: 'one dict per order, with "customer", "total" and "status" ("delivered" or "cancelled")' }]],
    want: ['Go through the orders', 'Skip any that were cancelled', 'Add each remaining order\'s total to its customer'],
    out: 'Set `spend`: a dict of each customer and their total.',
  },
},
'py-28': {
  explain: [
    'A **set** holds each value once, in no particular order. `set(["tea", "tea", "latte"])` is `{"tea", "latte"}`: the repeat disappears.',
    'Sets answer questions about overlap. `a & b` is what\'s in both, `a | b` is what\'s in either, and `a - b` is what\'s in a but not in b.',
    'Asking `x in a_set` is instant, however big the set is. Asking the same of a long list means checking every item.',
    'Because sets have no order, they have no positions: `myset[0]` doesn\'t work.',
    'Turning a list into a set is the quickest way to get its unique values.',
  ],
  example: {
    say: 'Here two days of customers are compared.',
    code: `monday = {"Ada", "Ben", "Chi"}
tuesday = {"Ben", "Chi", "Dee"}
print(monday & tuesday)
print(monday - tuesday)
print(len(monday | tuesday))
print(set(["tea", "tea", "latte"]))`,
    lines: [
      ['monday & tuesday', 'came both days: Ben and Chi.'],
      ['monday - tuesday', 'came Monday but not Tuesday: Ada.'],
      ['len(monday | tuesday)', 'everyone who came on either day, counted once: 4.'],
      ['set(["tea", "tea", "latte"])', 'the repeated tea is kept once.'],
    ],
  },
  brief: {
    story: 'Marketing is planning offers for latte drinkers, tea drinkers, and people who have both.',
    get: [['Two sets of customers are ready:', { latte_fans: 'Ada, Kofi, Zola and Nia', tea_fans: 'Kofi, Femi, Nia and Tunde' }]],
    want: ['Make `both`: customers who drink both', 'Make `either`: everyone who drinks either', 'Make `latte_only`: latte fans who never have tea'],
    out: 'Set `both`, `either` and `latte_only`, all sets.',
  },
},
'py-29': {
  explain: [
    'Comprehensions build dicts too. Use curly brackets and a key, colon, value: `{name: len(name) for name in names}`.',
    'To work from an existing dict, loop over `.items()`: `{drink: price * 0.9 for drink, price in menu.items()}`.',
    'Swapping key and value turns a dict round: `{price: drink for drink, price in menu.items()}`. (If two drinks shared a price, only one would survive, since keys are unique.)',
    'A **set comprehension** uses curly brackets with single values: `{w.lower() for w in words}`.',
    'As with lists, a comprehension always makes something new and leaves the original alone.',
  ],
  example: {
    say: 'Here a cake menu gets a new price for each cake, and is turned round to look cakes up by price.',
    code: `cakes = {"brownie": 2.0, "carrot": 3.0}
raised = {c: round(p * 1.05, 2) for c, p in cakes.items()}
by_price = {p: c for c, p in cakes.items()}
print(raised)
print(by_price)`,
    lines: [
      ['{c: round(p * 1.05, 2) for c, p in cakes.items()}', 'each cake with its price up 5%.'],
      ['{p: c for c, p in cakes.items()}', 'the same pairs swapped round: price first, then the cake.'],
    ],
  },
  brief: {
    story: 'The weekend sale takes 10% off everything, and the till needs to look drinks up by price.',
    get: [['A dict is ready:', { menu: 'latte 4.5, tea 3.0, mocha 5.0' }]],
    want: ['Make `sale`: the menu with 10% off every price, rounded to 2 places, in one dict comprehension', 'Make `by_price`: the menu turned round, price to drink'],
    out: 'Set `sale` and `by_price`.',
  },
},
'py-30': {
  explain: [
    'Data can nest: a dict whose values are themselves dicts. Here, each city holds its own dict of sales by drink.',
    'Reach in with one key after another: `sales["Lagos"]["latte"]` is the lattes sold in Lagos.',
    'To visit every number, loop over the outer dict, then over the inner one inside it.',
    '`sum(d.values())` adds up the values of one inner dict, which gives a total per city.',
    '`max(totals, key=totals.get)` gives the key with the biggest value: the winner.',
  ],
  example: {
    say: 'Here pastry sales by café are added up per café, and the best seller is found.',
    code: `sold = {
    "Lagos": {"croissant": 10, "muffin": 4},
    "Accra": {"croissant": 3, "muffin": 8},
}
print(sold["Accra"]["muffin"])
per_cafe = {city: sum(d.values()) for city, d in sold.items()}
print(per_cafe)
print(max(per_cafe, key=per_cafe.get))`,
    lines: [
      ['sold["Accra"]["muffin"]', 'the Accra dict first, then muffin inside it: 8.'],
      ['sum(d.values())', 'adds up one café\'s pastries: Lagos 14, Accra 11.'],
      ['max(per_cafe, key=per_cafe.get)', 'the café with the biggest total: Lagos.'],
    ],
  },
  brief: {
    story: 'Head office wants each café\'s total, each drink\'s total across all cafés, and the overall best seller.',
    get: [['A nested dict is ready:', { sales: 'each city, holding a dict of drink to cups sold' }]],
    want: ['Make `per_city`: each city with its total cups', 'Make `drink_totals`: each drink with its total across every city', 'Make `top_drink`: the drink that sold most overall'],
    out: 'Set `per_city`, `drink_totals` and `top_drink`.',
  },
},

/* ── Functions in depth ── */
'py-31': {
  explain: [
    '`def name(parameters):` makes your own function. The parameters are the names for whatever the caller puts in the brackets.',
    'The lines inside are indented, and `return` hands the answer back to whoever called it.',
    'Defining a function doesn\'t run it. Nothing happens until it\'s called, by name with brackets: `vat(4.5)`.',
    'A function you write is used just like a built-in one, and it can call other functions, including ones you wrote yourself.',
    'Small functions that each do one job are easy to test and reuse. Name them for what they give back.',
  ],
  example: {
    say: 'Here a function works out a tip, and a second function uses it for a whole table.',
    code: `def tip(bill):
    return round(bill * 0.1, 2)

def table_tips(bills):
    total = 0
    for b in bills:
        total += tip(b)
    return total

print(tip(23.40))
print(table_tips([23.40, 12.00]))`,
    lines: [
      ['def tip(bill):', 'makes a function called tip, with one parameter, bill.'],
      ['return round(bill * 0.1, 2)', 'hands back 10% of the bill.'],
      ['total += tip(b)', 'table_tips calls tip for each bill.'],
      ['print(tip(23.40))', 'only now does tip run: 2.34.'],
    ],
  },
  brief: {
    story: 'Wholesale invoices add 20% tax, and the till needs one function for a price and one for a whole order.',
    get: [['Two functions are started, but they don\'t work yet:', { vat: 'returns the price unchanged', total_with_vat: 'returns 0' }]],
    want: ['Make `vat` return the price plus 20%, rounded to 2 places', 'Make `total_with_vat` use `vat` on every price and add them up'],
    out: 'Finish both functions: `total_with_vat([4.5, 3.0, 2.75])` should give 12.3.',
  },
},
'py-32': {
  explain: [
    'A star before a parameter, `def average(*numbers):`, lets the function take any number of values. They\'re gathered up into a tuple called `numbers`.',
    'That\'s why `print` takes as many things as you give it: it\'s written this way.',
    'Inside, `numbers` is an ordinary tuple: you can loop over it, `sum` it or take its `len`.',
    'Good functions handle the edges. The average of no numbers at all doesn\'t exist, so returning `None` says so honestly, where 0 would be a lie.',
    '`if not numbers:` is True when the tuple is empty, because an empty tuple counts as False.',
  ],
  example: {
    say: 'Here a function adds up any number of bills, and says plainly when there were none.',
    code: `def total(*bills):
    if not bills:
        return None
    return sum(bills)

print(total(4.5, 3.0, 2.75))
print(total(10))
print(total())`,
    lines: [
      ['def total(*bills):', 'the star gathers every value passed in into a tuple called bills.'],
      ['if not bills:', 'an empty tuple counts as False, so this catches a call with nothing in it.'],
      ['print(total())', 'no bills at all: it gives None rather than a misleading 0.'],
    ],
  },
  brief: {
    story: 'The averaging helper is awkward to call with a list, and it crashes when there\'s nothing to average.',
    get: [['A function is ready:', { average: 'takes a list, average([4, 8, 6]), and divides by zero on an empty one' }]],
    want: ['Change `average` so it takes the numbers one by one: `average(4, 8, 6)`', 'Make it return `None` when it\'s given none at all'],
    out: 'Rewrite `average`: `average(4, 8, 6)` gives 6.0 and `average()` gives None.',
  },
},
'py-33': {
  explain: [
    'Names made inside a function belong to that function. They\'re called **local**, and they vanish when the function ends.',
    'That keeps functions from tripping over each other: a `total` inside one function never clashes with a `total` elsewhere.',
    'A function can read a name from outside it. But as soon as you assign to that name inside, Python treats it as a new local name for the whole function.',
    'So `tab = tab + amount` inside a function fails with an UnboundLocalError: the local `tab` has no value yet when it\'s read.',
    'The clean fix is nearly always the same: pass the value in as a parameter, and return the new value out.',
  ],
  example: {
    say: 'Here a loyalty card\'s stamps are updated the clean way: passed in, handed back.',
    code: `stamps = 3

def add_stamp(stamps):
    return stamps + 1

stamps = add_stamp(stamps)
stamps = add_stamp(stamps)
print(stamps)`,
    lines: [
      ['def add_stamp(stamps):', 'the function gets its own stamps, passed in.'],
      ['return stamps + 1', 'it hands the new count back rather than changing anything outside.'],
      ['stamps = add_stamp(stamps)', 'the answer is stored back in the outside name: 4, then 5.'],
    ],
  },
  brief: {
    story: 'The tab function crashes the first time it\'s used, with an UnboundLocalError.',
    get: [['The editor has `tab = 0` and a function `add_to_tab(amount)` that tries to change `tab` from inside.']],
    want: ['Rewrite `add_to_tab` to take the tab as a parameter: `add_to_tab(tab, amount)`', 'Return the new tab', 'Run `tab = add_to_tab(tab, 4.5)`, then `tab = add_to_tab(tab, 3.0)`'],
    out: 'Rewrite the function; `tab` should end at 7.5.',
  },
},
'py-34': {
  explain: [
    'A function is a value like any other. You can store it under another name, put it in a list, or hand it to another function.',
    'Handing a function to a function lets you write one tool that applies any rule: `apply_rule(prices, round)`.',
    '`lambda p: p * 0.9` makes a small function on the spot, with no name. It\'s the same as a one-line `def` that returns `p * 0.9`.',
    'Lambdas suit short rules handed straight to other functions: `sorted(names, key=lambda n: n.lower())`.',
    '`map(fn, items)` applies a function to every item and `filter(fn, items)` keeps the items where it\'s True. Wrap them in `list(...)` to see the results.',
  ],
  example: {
    say: 'Here one function applies whatever rule it\'s given to a list of prices.',
    code: `def every(prices, rule):
    return [rule(p) for p in prices]

prices = [2.0, 3.5, 5.0]
print(every(prices, lambda p: p + 0.5))
print(every(prices, str))
print(list(filter(lambda p: p > 3, prices)))`,
    lines: [
      ['def every(prices, rule):', 'rule is a parameter that holds a function.'],
      ['lambda p: p + 0.5', 'a tiny function, made on the spot, that adds 0.5.'],
      ['every(prices, str)', 'str is a function too, so each price becomes text.'],
      ['filter(lambda p: p > 3, prices)', 'keeps the prices over 3: 3.5 and 5.0.'],
    ],
  },
  brief: {
    story: 'The pricing tool should apply any rule to a price list, and also pick out the cheap items.',
    get: [['Ready to use:', { apply_rule: 'a function that currently returns an empty list', prices: '[4.5, 3.0, 6.0]' }]],
    want: ['Finish `apply_rule` so it returns `rule(p)` for every price', 'Make `discounted` with `apply_rule` and a lambda taking 10% off', 'Make `cheap`: the prices under 4, using `filter`'],
    out: 'Finish the function and set `discounted` and `cheap`.',
  },
},
'py-35': {
  explain: [
    'A **docstring** is a string written on the first line inside a function, saying what it does. It\'s usually in triple quotes: `"""Revenue per cup."""`.',
    '`help(fn)` shows a function\'s docstring, and code editors show it when you hover over the function\'s name.',
    '**Type hints** note what kind of value goes in and comes out: `def vat(price: float) -> float:`.',
    'Python itself doesn\'t enforce type hints: the code runs the same either way. Editors and checking tools use them to catch mistakes before you run anything.',
    'Both are for the next person who reads the code, and that\'s usually you, a few months from now.',
  ],
  example: {
    say: 'Here a small function is described and hinted, then its help is shown.',
    code: `def boxes_needed(pastries: int, per_box: int) -> int:
    """How many boxes hold all the pastries, rounding up."""
    return -(-pastries // per_box)

print(boxes_needed(13, 6))
help(boxes_needed)`,
    lines: [
      ['pastries: int, per_box: int', 'hints that both parameters are whole numbers.'],
      ['-> int', 'hints that the function gives back a whole number.'],
      ['"""How many boxes..."""', 'the docstring: what the function does, in one sentence.'],
      ['help(boxes_needed)', 'prints the function\'s name, hints and docstring.'],
    ],
  },
  brief: {
    story: 'A new colleague keeps asking what the per-cup helper does. The code should say it for itself.',
    get: [['A function is ready:', { per_cup: 'revenue divided by cups, rounded to 2 places' }]],
    want: ['Add a docstring saying what `per_cup` gives back', 'Add type hints: `revenue` is a float, `cups` an int, and it returns a float'],
    out: 'Keep what `per_cup` does the same: `per_cup(10.0, 4)` is still 2.5.',
  },
},

/* ── Choices and collections ── */
'py-61': {
  explain: [
    '`"big" if cups > 30 else "small"` picks one of two values in a single line. It\'s called a **conditional expression**.',
    'Read it like English: this, if that, otherwise the other. It suits short choices; a full `if` block is clearer for anything longer.',
    'When Python asks a yes-or-no question of a value, some values count as False: `0`, `""` (empty text), `[]`, `{}` and `None`. Everything else counts as True. This is called **truthiness**.',
    'So `if orders:` means "if there are any orders", with no need to write `len(orders) > 0`.',
    '`name or "guest"` gives `name`, or `"guest"` when the name is empty: a neat way to fill in a blank.',
  ],
  example: {
    say: 'Here tips are labelled in one line, and blank notes are filled in.',
    code: `tips = [0, 2.5, 6.0]
labels = ["none" if t == 0 else "some" for t in tips]
print(labels)
notes = ["oat milk", "", "extra hot"]
print([n or "no note" for n in notes])
print(bool([]), bool([1]))`,
    lines: [
      ['"none" if t == 0 else "some"', 'picks one of two labels for each tip.'],
      ['n or "no note"', 'an empty note counts as False, so it\'s swapped for "no note".'],
      ['bool([]), bool([1])', 'an empty list counts as False, a list with anything in it as True.'],
    ],
  },
  brief: {
    story: 'The order screen shows "guest" when a customer gives no name, and labels each order as big or small.',
    get: [['Ready to use:', { names: '["Ada", "", "Kofi", ""]: two customers gave no name' }]],
    want: ['Make `labels`: each name, or `"guest"` where it\'s empty, with a list comprehension', 'Make `sizes`: `"big"` or `"small"` for each of `[12, 45, 31, 30]`, where big means over 30'],
    out: 'Set `labels` and `sizes`.',
    fine: ['30 itself isn\'t over 30, so it\'s small.'],
  },
},
'py-62': {
  explain: [
    '`match value:` compares one value with a list of `case`s, from the top, and runs the first one that fits. It reads more clearly than a long chain of `elif`s.',
    '`case "tea" | "coffee":` matches either one; the `|` means "or".',
    '`case _:` matches anything at all, so it goes last, as the catch-all for whatever nothing else matched.',
    'A case can match a **shape** and pull parts out of it: `case ["refund", amount]:` fits any two-item list starting with "refund", and puts the second item in `amount`.',
    'The shape has to fit exactly: `["close"]` doesn\'t match `["close", "now"]`, because the lengths differ.',
  ],
  example: {
    say: 'Here till messages are read by their shape.',
    code: `def read(msg):
    match msg:
        case ["tip", amount]:
            return f"tip of {amount}"
        case ["open"] | ["close"]:
            return "till " + msg[0]
        case _:
            return "unknown"

print(read(["tip", 2]))
print(read(["open"]))
print(read(["tip"]))`,
    lines: [
      ['case ["tip", amount]:', 'fits a two-item list starting with "tip", and names the second item amount.'],
      ['case ["open"] | ["close"]:', 'either one-item list fits.'],
      ['read(["tip"])', 'only one item, so the tip shape doesn\'t fit and the catch-all answers.'],
    ],
  },
  brief: {
    story: 'The till sends commands as small lists, and the handler only understands sales so far.',
    get: [['A function is ready:', { handle: 'matches ["sell", item], with a catch-all for anything else' }]],
    want: ['Add a case for `["refund", amount]` that gives back `refunded £4.50`, with the amount to 2 decimal places', 'Add a case for `["close"]` that gives back `till closed`', 'Put both above the catch-all'],
    out: 'Finish `handle`.',
  },
},
'py-63': {
  explain: [
    'Counting how often things turn up is so common that Python has a tool for it: `Counter`, from the `collections` module.',
    '`from collections import Counter` brings it in. Then `Counter(items)` gives a tally: each item, and how many times it appeared.',
    '`.most_common(2)` gives the top 2 as (item, count) pairs, biggest first.',
    'Ask a Counter about something it never saw and you get 0, not an error.',
    'Counters add up: `monday + tuesday` combines two tallies into one.',
  ],
  example: {
    say: 'Here two days of pastry orders are tallied and combined.',
    code: `from collections import Counter
sat = Counter(["muffin", "scone", "muffin"])
sun = Counter(["scone", "scone", "bun"])
print(sat)
weekend = sat + sun
print(weekend.most_common(1))
print(sat["bun"])`,
    lines: [
      ['Counter([...])', 'a tally: muffin 2, scone 1.'],
      ['sat + sun', 'adds the two tallies together.'],
      ['weekend.most_common(1)', 'the top pastry and its count: scone, 3.'],
      ['sat["bun"]', 'no buns on Saturday: 0, not an error.'],
    ],
  },
  brief: {
    story: 'The manager wants to know which drinks were most popular across two days.',
    get: [['Two lists are ready:', { monday: 'Monday\'s drinks, one per order', tuesday: 'Tuesday\'s drinks' }]],
    want: ['Make `mon` and `tue`: Counters of each day\'s drinks', 'Make `both`: the two added together', 'Make `top`: the top 2 of `both`', 'Make `chai_monday`: how many chais `mon` counted'],
    out: 'Set all five.',
  },
},
'py-64': {
  explain: [
    'Grouping by hand means checking every time whether a key exists yet: `if city not in groups: groups[city] = []`.',
    '`defaultdict(list)`, from `collections`, does that check for you. The first time you use a key it hasn\'t got, it puts an empty list there.',
    '`defaultdict(float)` starts missing keys at 0.0 instead, which suits running totals: `totals[drink] += price` just works.',
    'Apart from that, it behaves like an ordinary dict.',
    '`dict(groups)` turns it into a plain dict, which prints more neatly.',
  ],
  example: {
    say: 'Here orders are grouped by table and totted up, without any checks.',
    code: `from collections import defaultdict
orders = [(1, "latte"), (2, "tea"), (1, "muffin")]
by_table = defaultdict(list)
for table, item in orders:
    by_table[table].append(item)
print(dict(by_table))
spent = defaultdict(float)
spent["Ada"] += 4.5
print(dict(spent))`,
    lines: [
      ['by_table = defaultdict(list)', 'any new key starts with an empty list.'],
      ['by_table[table].append(item)', 'table 1 doesn\'t exist at first, so an empty list appears, then latte goes in.'],
      ['spent["Ada"] += 4.5', 'Ada starts at 0.0, so this gives 4.5 with no error.'],
    ],
  },
  brief: {
    story: 'The grouping code is full of "is this key here yet?" checks, and the till also needs totals per drink.',
    get: [['Ready to use:', { orders: 'pairs of (city, customer name)', sales: 'pairs of (drink, price)' }]],
    want: ['Make `by_city`: the customers grouped by city, with `defaultdict(list)` and no `if`', 'Make `takings`: a `defaultdict(float)` holding the total for each drink in `sales`'],
    out: 'Set `by_city` and `takings`.',
  },
},
'py-65': {
  explain: [
    'A tuple like `("latte", 4.5, 2)` keeps values in order, but `sale[1]` doesn\'t say what the 4.5 means. A reader has to remember that position 1 is the price.',
    '`namedtuple`, from `collections`, makes a kind of tuple whose items have names as well as positions.',
    '`Sale = namedtuple("Sale", ["drink", "price", "qty"])` describes it once. Then `Sale("latte", 4.5, 2)` makes one, and `s.price` reads far better than `s[1]`.',
    'It still works as an ordinary tuple too: you can unpack it or use positions.',
    'Like any tuple it can\'t be changed. `s._replace(qty=3)` gives back a new one with that one value swapped, leaving the old one as it was.',
  ],
  example: {
    say: 'Here deliveries get names for their parts.',
    code: `from collections import namedtuple
Delivery = namedtuple("Delivery", ["item", "bags", "city"])
d = Delivery("beans", 6, "Accra")
print(d.bags, d.city)
print(d)
more = d._replace(bags=8)
print(more.bags, d.bags)`,
    lines: [
      ['namedtuple("Delivery", [...])', 'describes a tuple with three named parts.'],
      ['d.bags, d.city', 'reads the parts by name: 6 Accra.'],
      ['d._replace(bags=8)', 'a new delivery with 8 bags; d itself still has 6.'],
    ],
  },
  brief: {
    story: 'The sales code is full of `[1]` and `[2]`, and nobody remembers which is the price.',
    get: [['Ready to use:', { sales: 'a list of (drink, price, qty) tuples', Sale: 'a namedtuple with the fields drink, price and qty' }]],
    want: ['Make `named`: each sale as a `Sale`', 'Make `total`: price times qty for each, added up, using the names', 'Make `bigger`: the first sale with its qty changed to 4, using `_replace`'],
    out: 'Set `named`, `total` and `bigger`.',
  },
},

/* ── When things go wrong ── */
'py-36': {
  explain: [
    'When something goes wrong, Python stops and shows an **error message**. It names the kind of error and the line it happened on.',
    'Read the last line first: it says what went wrong. The lines above show where.',
    '**NameError**: a name Python doesn\'t know, often a typo. **TypeError**: an action that doesn\'t suit the value, like adding text to a number.',
    '**IndexError**: a position past the end of a list. **KeyError**: a key that isn\'t in a dict. **ValueError**: the right kind of value but a wrong one, like `int("ten")`.',
    'Python stops at the first error, so fix one, run again, and repeat until it runs cleanly. The Tip under each error in this app says what to try.',
  ],
  example: {
    say: 'Here one mistake is made on purpose and caught, so you can see the message Python gives.',
    code: `cups = [31, 48, 12]
try:
    print(cups[3])
except IndexError as e:
    print("IndexError:", e)
print(cups[2])`,
    lines: [
      ['cups[3]', 'the list has positions 0, 1 and 2 only, so position 3 is past the end.'],
      ['except IndexError as e:', 'catches the error so the message can be shown here (the next lessons explain this).'],
      ['print(cups[2])', 'the last item is at position 2: 12.'],
    ],
  },
  brief: {
    story: 'The takings script was written in a hurry and won\'t run. It has three mistakes.',
    get: [['The editor has two lists, `cups` and `prices`, a loop working out the takings, and a line building `report`.']],
    want: ['Run it and fix the error it stops on', 'Run it again, and fix the next one', 'Keep going until it runs: there are three'],
    out: '`report` should read `Takings: 316.5`.',
  },
},
'py-37': {
  explain: [
    '`try:` runs some code that might go wrong. If it hits an error, Python jumps to the matching `except` instead of stopping.',
    '`except ValueError:` catches only that kind of error and runs a backup plan.',
    'Always name the error you expect. A bare `except:` catches everything, including mistakes you\'d want to see and fix.',
    'Use it where bad input is normal, like numbers typed by people. Let real bugs still stop the program, so they get noticed.',
    'Inside a function, `return` inside the `try` hands back the good answer, and `return` inside the `except` hands back the backup.',
  ],
  example: {
    say: 'Here a table number typed by a customer is read safely.',
    code: `def table_number(text):
    try:
        return int(text)
    except ValueError:
        return None

print(table_number("12"))
print(table_number("by the window"))`,
    lines: [
      ['try: return int(text)', 'tries to turn the text into a whole number.'],
      ['except ValueError:', '"by the window" isn\'t a number, so int stops with a ValueError, caught here.'],
      ['return None', 'the backup: None means "no table number given".'],
    ],
  },
  brief: {
    story: 'Prices typed into the stock sheet sometimes say "n/a", and the import crashes when it meets one.',
    get: [['A function is ready:', { safe_float: 'returns float(text), and crashes on text that isn\'t a number' }]],
    want: ['Make `safe_float` return the number when the text is one', 'Return `None` when it isn\'t'],
    out: 'Finish `safe_float`: `safe_float("4.50")` gives 4.5, `safe_float("n/a")` gives None.',
  },
},
'py-38': {
  explain: [
    '`raise ValueError("price can\'t be negative")` stops with your own error and message. It\'s how a function refuses input that makes no sense.',
    'Raising early, at the moment bad data arrives, is far better than letting it travel on and cause a confusing problem later.',
    'Whoever calls the function can catch it: `except ValueError as e:` puts the error in `e`.',
    '`str(e)` is the message you wrote, so the caller can show or log it.',
    '`finally:`, after the excepts, runs whether or not there was an error, which suits tidying up.',
  ],
  example: {
    say: 'Here a function refuses a booking for zero people, and the refusal is caught.',
    code: `def book(people):
    if people < 1:
        raise ValueError("a booking needs at least one person")
    return f"table for {people}"

print(book(4))
try:
    book(0)
except ValueError as e:
    print("Refused:", str(e))`,
    lines: [
      ['raise ValueError(...)', 'stops the function with this message when the number makes no sense.'],
      ['except ValueError as e:', 'the caller catches the refusal.'],
      ['str(e)', 'the message written in the raise.'],
    ],
  },
  brief: {
    story: 'Someone typed a negative price into the till, and it went through.',
    get: [['A function is ready:', { set_price: 'returns the price rounded to 2 places, whatever it is' }]],
    want: ['Make `set_price` raise a `ValueError`, with a message, for a negative price', 'Return the price rounded to 2 places otherwise', 'Catch the error from `set_price(-2)` and make `message` its text'],
    out: 'Finish `set_price` and set `message`.',
  },
},
'py-39': {
  explain: [
    'Real data has bad rows: a missing field, a word where a number should be. One bad line shouldn\'t stop a whole file from loading.',
    'Put the work for each line inside `try`, inside the loop. A bad line is caught, and the loop carries on to the next.',
    'A missing field shows up as an **IndexError** (asking for a part that isn\'t there), and a field that isn\'t a number as a **ValueError**.',
    'One `except` can catch several kinds at once: `except (ValueError, IndexError):`.',
    'Keep the bad rows somewhere you can see them. Dropping them silently hides problems that someone needs to fix.',
  ],
  example: {
    say: 'Here a list of tips is read, keeping the bad entries to one side.',
    code: `entries = ["2.50", "two", "1.00", ""]
good, bad = [], []
for e in entries:
    try:
        good.append(float(e))
    except ValueError:
        bad.append(e)
print(good)
print(bad)`,
    lines: [
      ['try: good.append(float(e))', 'a real number goes straight into good.'],
      ['except ValueError: bad.append(e)', '"two" and "" aren\'t numbers, so they go into bad, as they were.'],
      ['print(good), print(bad)', '[2.5, 1.0] and [\'two\', \'\'].'],
    ],
  },
  brief: {
    story: 'The order log has a few broken lines, and the whole import fails on the first one.',
    get: [['Ready to use:', { lines: 'five order lines, three of them broken', parse: 'a function that splits each line, and crashes on a bad one' }]],
    want: ['Wrap the work for each line in `try`, catching `ValueError` and `IndexError`', 'Good lines go in `good` as before', 'Bad lines go in `bad`, exactly as they were', 'Then set `good, bad = parse(lines)`'],
    out: 'Finish `parse` and set `good` and `bad`.',
  },
},
'py-40': {
  explain: [
    '`open("today.txt", "w")` opens a file for writing: it makes the file if needed, and empties it if it was already there.',
    'The second value is the **mode**. `"w"` writes from scratch, `"a"` adds to the end, and `"r"` (the default) reads.',
    'Use it with `with`: `with open(...) as f:` closes the file for you when the indented block ends, even if something goes wrong inside.',
    '`f.write(text)` writes text; add `"\\n"` to end a line. `f.read()` reads the whole file as one string, and `.splitlines()` cuts it into lines.',
    'Files in this app live in the browser\'s memory, and vanish when you close it. On your own computer they\'d stay on disk.',
  ],
  example: {
    say: 'Here a list of specials is written to a file, added to, and read back.',
    code: `with open("specials.txt", "w") as f:
    f.write("pumpkin latte\\n")
with open("specials.txt", "a") as f:
    f.write("iced mocha\\n")
with open("specials.txt") as f:
    text = f.read()
print(text.splitlines())`,
    lines: [
      ['open("specials.txt", "w")', 'opens the file for writing, starting it empty.'],
      ['open("specials.txt", "a")', '"a" adds to the end instead of starting again.'],
      ['f.read()', 'reads everything back as one string.'],
      ['text.splitlines()', 'cuts it into a list of lines, without the newlines.'],
    ],
  },
  brief: {
    story: 'The day\'s orders are saved to a file as they come in, and chai was just ordered.',
    get: [['The editor writes three drinks, one per line, to `"today.txt"`.']],
    want: ['Add `"chai"` to the end of the file, using mode `"a"`', 'Read the file back into `lines`: a list of the four names, without their newlines'],
    out: 'The file should end with chai, and `lines` should hold all four names.',
  },
},

/* ── Files, formats and the standard library ── */
'py-41': {
  explain: [
    'A **CSV** file is a table in plain text: one row per line, with commas between the values. The first line is usually the header.',
    'Python\'s `csv` module reads and writes CSV properly. It handles a value with a comma inside (wrapped in quotes), which `split(",")` would cut in the wrong place.',
    '`csv.writer(f).writerows(rows)` writes a list of rows to a file opened for writing.',
    '`csv.DictReader(f)` reads each row back as a dict, keyed by the header line: `row["total"]`.',
    'Everything comes back as text, so turn numbers into numbers yourself. pandas\' `read_csv` does all of this and more in one line.',
  ],
  example: {
    say: 'Here a small stock list is written as a CSV, with a comma inside one value, and read back.',
    code: `import csv
rows = [["item", "note", "qty"], ["beans", "dark, oily", "6"], ["milk", "oat", "12"]]
with open("stock.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)
with open("stock.csv") as f:
    records = list(csv.DictReader(f))
print(records[0]["note"])
print(sum(int(r["qty"]) for r in records))`,
    lines: [
      ['csv.writer(f).writerows(rows)', 'writes every row, putting quotes round "dark, oily" so its comma stays inside.'],
      ['csv.DictReader(f)', 'reads each row as a dict keyed by the header: item, note, qty.'],
      ['records[0]["note"]', 'the comma survived: dark, oily.'],
      ['int(r["qty"])', 'qty comes back as text, so it\'s turned into a number before adding: 18.'],
    ],
  },
  brief: {
    story: 'The till exported a CSV, and one drink has a comma in its name.',
    get: [['The editor writes `orders.csv` with a header and three orders: customer, drink and total.']],
    want: ['Read the file back with `csv.DictReader`', 'Make `total`: the `total` column added up as numbers', 'Make `drinks`: the list of drinks'],
    out: 'Set `total` (19.7) and `drinks`; "flat white, oat" should come back whole.',
  },
},
'py-42': {
  explain: [
    '**JSON** is how most websites and apps pass data around. It\'s text that looks like Python dicts and lists, always with double quotes.',
    '`json.loads(text)` turns JSON text into real dicts and lists you can work with.',
    '`json.dumps(data)` goes the other way, turning dicts and lists into JSON text. `indent=2` lays it out neatly.',
    'JSON is often nested, so you reach in one step at a time: `order["items"][0]["price"]` is the first item\'s price.',
    'Numbers in JSON come back as real numbers, so you can do sums with them straight away.',
  ],
  example: {
    say: 'Here a delivery app\'s message is read, and a reply is written.',
    code: `import json
msg = '{"rider": "Ama", "stops": [{"city": "Lagos", "mins": 12}, {"city": "Lagos", "mins": 9}]}'
data = json.loads(msg)
print(data["stops"][1]["mins"])
total = sum(s["mins"] for s in data["stops"])
print(json.dumps({"rider": data["rider"], "minutes": total}))`,
    lines: [
      ['json.loads(msg)', 'turns the text into a dict holding a list of dicts.'],
      ['data["stops"][1]["mins"]', 'the stops list, then the second stop, then its minutes: 9.'],
      ['json.dumps({...})', 'writes a new dict back out as JSON text.'],
    ],
  },
  brief: {
    story: 'An online order arrived from the website as JSON, and the kitchen system needs a short summary back.',
    get: [['Ready to use:', { order: 'the order, read from JSON: an "id", a "customer", and "items", each with a "qty" and a "price"' }]],
    want: ['Make `total`: qty times price for every item, added up', 'Make `summary`: `json.dumps` of a dict holding the order\'s `id` and that `total`'],
    out: 'Set `total` (12.25) and `summary`, which is text.',
  },
},
'py-43': {
  explain: [
    '`date(2024, 3, 15)` makes a date: year, month, day. It comes from the `datetime` module.',
    'Take one date from another and you get a **timedelta**: a length of time. Its `.days` is the gap in days.',
    'Add `timedelta(days=30)` to a date to move it on 30 days, crossing months and years correctly.',
    '`d.strftime("%A %d %B %Y")` writes a date as text. `%A` is the weekday, `%d` the day, `%B` the month\'s name and `%Y` the year.',
    '`datetime.strptime("05/02/2024", "%d/%m/%Y")` reads text into a date and time. The format says which part is which, so 05 is read as the day here.',
  ],
  example: {
    say: 'Here a coffee subscription\'s dates are worked out.',
    code: `from datetime import date, datetime, timedelta
start = date(2024, 2, 20)
next_box = start + timedelta(days=14)
print(next_box, next_box.strftime("%A"))
print((date(2024, 3, 31) - start).days)
print(datetime.strptime("29/02/2024", "%d/%m/%Y").date())`,
    lines: [
      ['start + timedelta(days=14)', 'two weeks on, across the end of February: 5 March.'],
      ['.strftime("%A")', 'that date\'s weekday, as a word.'],
      ['(date(...) - start).days', 'the gap between two dates, in days.'],
      ['datetime.strptime("29/02/2024", "%d/%m/%Y")', 'reads the text day first: 29 February.'],
    ],
  },
  brief: {
    story: 'The loyalty team tracks when members join, when they first order, and when their reward renews.',
    get: [['Two dates are ready:', { joined: '15 January 2024', first_order: '2 March 2024' }]],
    want: ['Make `gap`: the days between `joined` and `first_order`, as a number', 'Make `renewal`: the date 30 days after `first_order`', 'Make `day_name`: the weekday of `first_order`, like "Saturday"', 'Make `parsed`: the date in the text `"05/02/2024"`, read day first'],
    out: 'Set all four.',
  },
},
'py-44': {
  explain: [
    'A **module** is a file of ready-made tools. `import math` brings one in, and you use what\'s inside with a dot: `math.ceil(2.1)` rounds up to 3.',
    '`from math import ceil` brings in just `ceil`, so you can write `ceil(2.1)` on its own.',
    'Python comes with a big **standard library** of modules: `math`, `statistics`, `random`, `datetime`, `json`, `csv`, `re` and many more, all ready to import.',
    '`random` gives different results every run. That\'s the point, but it makes results hard to check.',
    'Fixing the **seed**, `random.Random(7)`, makes the same "random" choices every time, so a result can be repeated and checked.',
  ],
  example: {
    say: 'Here three modules help plan the pastry order and pick a staff prize.',
    code: `import math, statistics, random
pastries_needed = 50
print(math.ceil(pastries_needed / 12))
print(statistics.mean([12, 15, 9]))
draw = random.Random(3)
print(draw.choice(["Ama", "Ben", "Chi"]))`,
    lines: [
      ['math.ceil(50 / 12)', '50 / 12 is about 4.2, and ceil rounds up: 5 trays.'],
      ['statistics.mean([...])', 'the average of the three numbers: 12.'],
      ['random.Random(3)', 'a random picker with a fixed seed, so it chooses the same name every run.'],
    ],
  },
  brief: {
    story: 'Three small jobs: how many boxes for 100 cups, the middle day\'s sales, and a fair draw for the drink of the week.',
    get: [['Ready to use:', { cups: 'cups sold on seven days', 'math, statistics, random': 'already imported' }]],
    want: ['Make `boxes`: how many boxes of 12 cups you need for 100 cups, rounding up with `math.ceil`', 'Make `middle`: the median of `cups`, from `statistics`', 'Make `pick`: a drink chosen from `["latte", "tea", "mocha"]` by `random.Random(7).choice`'],
    out: 'Set `boxes`, `middle` and `pick`.',
  },
},
'py-45': {
  explain: [
    'A small program is a few simple steps in a row: read the data, tidy it, work out the numbers, present them.',
    'Give each step its own function, and the last line can read like a list of what the program does: `report(totals(read(raw)))`.',
    'Each function takes the result of the one before it, so you can test and fix one step at a time.',
    'Reading: split the text into lines, skip the header, and turn each line into a dict, with numbers made into numbers.',
    'A real data project has exactly this shape. pandas, SQL and the rest of this app just make each step shorter.',
  ],
  example: {
    say: 'Here a tiny three-step program reads tips, adds them up per barista, and prints a line each.',
    code: `raw = "name,tip\\nAma,2.5\\nBen,1.0\\nAma,3.0"

def read(text):
    return [line.split(",") for line in text.splitlines()[1:]]

def totals(rows):
    out = {}
    for name, tip in rows:
        out[name] = out.get(name, 0) + float(tip)
    return out

def report(t):
    return "\\n".join(f"{n}: {v:.2f}" for n, v in t.items())

print(report(totals(read(raw))))`,
    lines: [
      ['text.splitlines()[1:]', 'every line except the header.'],
      ['out.get(name, 0) + float(tip)', 'groups the tips by name, turning each into a number.'],
      ['report(totals(read(raw)))', 'the three steps in a row, from the inside out.'],
    ],
  },
  brief: {
    story: 'Head office wants a short report of each city\'s takings, biggest first, from the raw till export.',
    get: [['Ready to use:', { raw: 'the export as text: a header, then city, drink, cups, price on each line', 'read_rows, takings_by_city, report': 'three functions, still empty' }]],
    want: ['`read_rows`: a dict per line after the header, with cups as an int and price as a float', '`takings_by_city`: each city with its cups times price, added up', '`report`: one line per city, biggest takings first, like `Lagos: 240.00`, joined with newlines'],
    out: 'Fill in all three functions.',
  },
},

/* ── Classes and objects ── */
'py-46': {
  explain: [
    'A **class** describes a kind of thing, and an **object** is one of them. `class Order:` describes orders in general; `Order("Ada")` makes one particular order.',
    'Inside a class, `__init__` runs automatically whenever a new object is made. It sets the object up.',
    'Its first parameter, `self`, is the object being built. `self.customer = customer` stores a value on it, called an **attribute**.',
    'Read an attribute with a dot: `order.customer`.',
    'Each object keeps its own attributes. That\'s why a list like `items` must be made inside `__init__`, so every order gets its own.',
  ],
  example: {
    say: 'Here a class describes tables, and two tables are made.',
    code: `class Table:
    def __init__(self, number, seats):
        self.number = number
        self.seats = seats
        self.guests = []

t1 = Table(1, 4)
t2 = Table(2, 2)
t1.guests.append("Ama")
print(t1.number, t1.seats, t1.guests)
print(t2.number, t2.guests)`,
    lines: [
      ['def __init__(self, number, seats):', 'runs whenever a Table is made, with the values given.'],
      ['self.guests = []', 'each table gets its own empty list of guests.'],
      ['t1.guests.append("Ama")', 'changes only t1\'s list; t2\'s stays empty.'],
    ],
  },
  brief: {
    story: 'The ordering app keeps each order as an object, and it needs to know the city and the items too.',
    get: [['A class is ready:', { Order: 'takes a customer when it\'s made and stores it as `self.customer`' }]],
    want: ['Give `Order` an attribute `city`, passed in when it\'s made', 'Give it `items`, which starts as an empty list', 'Make `first = Order("Ada", "Lagos")` and `second = Order("Kofi", "Accra")`'],
    out: 'Change the class and make the two orders.',
  },
},
'py-47': {
  explain: [
    'A **method** is a function that belongs to a class. It\'s written inside the class, indented under it.',
    'Its first parameter is always `self`: the object the method was called on.',
    '`order.add("latte", 4.5)` calls the `add` method, and Python passes `order` in as `self` for you, so you only give the other values.',
    'Inside, the method reads and changes the object\'s attributes through `self`: `self.items.append(...)`.',
    'Methods keep the data and what you can do with it together, so an order knows how to add to itself and total itself.',
  ],
  example: {
    say: 'Here a loyalty card can stamp itself and say whether a free coffee is due.',
    code: `class Card:
    def __init__(self, owner):
        self.owner = owner
        self.stamps = 0

    def stamp(self):
        self.stamps += 1

    def free_coffee_due(self):
        return self.stamps >= 5

c = Card("Ama")
for _ in range(5):
    c.stamp()
print(c.stamps, c.free_coffee_due())`,
    lines: [
      ['def stamp(self):', 'a method; self is whichever card it\'s called on.'],
      ['self.stamps += 1', 'adds one stamp to that card.'],
      ['c.stamp()', 'calls the method on c: Python passes c in as self.'],
      ['c.free_coffee_due()', 'True once there are 5 stamps.'],
    ],
  },
  brief: {
    story: 'An order should be able to add items and total itself, rather than other code reaching into it.',
    get: [['A class is ready:', { Order: 'with a customer and an empty items list, and two unfinished methods, add and total' }]],
    want: ['Finish `add`: put `(name, price)` on the order\'s `items`', 'Finish `total`: add up the prices of the items'],
    out: 'Finish both methods: the order in the editor should total 7.75.',
  },
},
'py-48': {
  explain: [
    'Printing an object you made shows something like `<__main__.Order object at 0x10a2c>`: what kind of thing it is and where it lives in memory. Not much use.',
    'Write a method called `__repr__` that returns a string, and Python uses it whenever the object is printed or shown.',
    'Make it say what matters at a glance: the customer, how many items, the total.',
    'Methods with two underscores on each side, like `__init__` and `__repr__`, are Python\'s **hooks**. Write one, and Python\'s own behaviour uses yours.',
    'You never call `__repr__` yourself: `print(o)` and the console call it for you.',
  ],
  example: {
    say: 'Here a table shows itself clearly when printed.',
    code: `class Table:
    def __init__(self, number, guests):
        self.number = number
        self.guests = guests

    def __repr__(self):
        return f"Table {self.number} ({len(self.guests)} guests)"

print(Table(4, ["Ama", "Ben"]))`,
    lines: [
      ['def __repr__(self):', 'the hook Python uses to show the object.'],
      ['return f"Table {self.number} ..."', 'builds the text from the object\'s own attributes.'],
      ['print(Table(...))', 'shows Table 4 (2 guests) instead of a memory address.'],
    ],
  },
  brief: {
    story: 'Printing an order in the logs shows a memory address, which tells the support team nothing.',
    get: [['A class is ready:', { Order: 'with a customer, items, add and total; printing one shows <__main__.Order object ...>' }]],
    want: ['Add a `__repr__` method that returns a string'],
    out: '`print(o)` should show `Order(Ada, 2 items, £7.75)`.',
  },
},
'py-49': {
  explain: [
    'A class can build on another one. `class Delivery(Order):` gets everything an Order has, then adds or changes what it needs. This is called **inheritance**.',
    'Order is the **parent** class and Delivery the **child**. A Delivery can do everything an Order can.',
    'In the child\'s `__init__`, `super().__init__(customer)` runs the parent\'s set-up first. Then you add attributes of your own, like `self.fee`.',
    'A method with the same name as the parent\'s replaces it for the child.',
    'The child\'s version can still use the parent\'s with `super().total()`, then add to it, so you don\'t repeat code.',
  ],
  example: {
    say: 'Here a party booking builds on an ordinary booking and adds a deposit.',
    code: `class Booking:
    def __init__(self, name, people):
        self.name = name
        self.people = people

    def cost(self):
        return self.people * 10

class Party(Booking):
    def __init__(self, name, people, deposit):
        super().__init__(name, people)
        self.deposit = deposit

    def cost(self):
        return super().cost() + self.deposit

print(Booking("Ama", 4).cost(), Party("Ben", 4, 50).cost())`,
    lines: [
      ['class Party(Booking):', 'a Party is a Booking with extras.'],
      ['super().__init__(name, people)', 'runs Booking\'s set-up, then the deposit is added.'],
      ['return super().cost() + self.deposit', 'Booking\'s cost (40), plus the deposit (50): 90.'],
    ],
  },
  brief: {
    story: 'Delivery orders cost the same as counter orders, plus a delivery fee.',
    get: [['Two classes are ready:', { Order: 'with a customer, items, add and total', Delivery: 'builds on Order and runs its set-up, but ignores the fee' }]],
    want: ['Make `Delivery` keep its `fee`', 'Give it a `total`: an order\'s total plus the fee, using `super().total()`'],
    out: 'Finish `Delivery`: a 4.50 latte with a 2.50 fee totals 7.0.',
  },
},
'py-50': {
  explain: [
    'Many classes just hold data: a name, a price, a quantity. Writing `__init__` and `__repr__` for each is tedious.',
    'Put `@dataclass` above the class and list its fields with their types: `name: str`, `price: float`. Python writes `__init__`, `__repr__` and `==` for you.',
    'A field can have a default: `qty: int = 1`. Fields with defaults have to come after the ones without.',
    'Two dataclass objects with the same fields count as equal, which two plain objects don\'t.',
    'You can still add your own methods, like `cost`, exactly as in any class.',
  ],
  example: {
    say: 'Here a pastry is described as a dataclass, with a default and a method.',
    code: `from dataclasses import dataclass

@dataclass
class Pastry:
    name: str
    price: float
    left: int = 12

    def value(self):
        return round(self.price * self.left, 2)

p = Pastry("croissant", 2.2)
print(p)
print(p.value())
print(Pastry("bun", 1.5) == Pastry("bun", 1.5))`,
    lines: [
      ['@dataclass', 'tells Python to write __init__, __repr__ and == from the fields.'],
      ['left: int = 12', 'a field with a default, so it can be left out.'],
      ['print(p)', 'the written-for-you __repr__ shows every field.'],
      ['Pastry(...) == Pastry(...)', 'same fields, so they count as equal: True.'],
    ],
  },
  brief: {
    story: 'The order system needs a simple Item with a name, price and quantity, and its cost.',
    get: [['A dataclass is ready:', { Item: 'with one field so far, name' }]],
    want: ['Give `Item` a `price` (a float)', 'Give it a `qty` (an int, 1 by default)', 'Add a method `cost` that returns price times qty'],
    out: '`Item("latte", 4.5, 2).cost()` should be 9.0.',
  },
},

/* ── Classes that behave ── */
'py-66': {
  explain: [
    'Two objects you made aren\'t equal just because their attributes match. Unless you say otherwise, `==` asks "is this the very same object?"',
    'Write `__eq__(self, other)` to decide what equal means for your class, and return True or False.',
    'Check the other thing is the same kind first, with `isinstance(other, Drink)`, so comparing a drink with some text gives False rather than an error.',
    'Write `__lt__(self, other)` for "less than". `<` then works on your objects.',
    'Once `<` works, `sorted()`, `min()` and `max()` work on lists of your objects too, because they all use `<` underneath.',
  ],
  example: {
    say: 'Here bags of beans are compared by weight.',
    code: `class Bag:
    def __init__(self, origin, kg):
        self.origin, self.kg = origin, kg

    def __eq__(self, other):
        return isinstance(other, Bag) and (self.origin, self.kg) == (other.origin, other.kg)

    def __lt__(self, other):
        return self.kg < other.kg

    def __repr__(self):
        return f"{self.origin} {self.kg}kg"

bags = [Bag("Kenya", 5), Bag("Peru", 2), Bag("Kenya", 5)]
print(bags[0] == bags[2], bags[0] == "Kenya")
print(sorted(bags), min(bags))`,
    lines: [
      ['def __eq__(self, other):', 'equal when both the origin and the weight match.'],
      ['bags[0] == "Kenya"', 'not a Bag, so isinstance makes it False instead of an error.'],
      ['def __lt__(self, other):', 'a bag is "less" when it weighs less, so sorted and min work.'],
    ],
  },
  brief: {
    story: 'The menu tool can\'t tell that two identical drinks are the same, and it can\'t sort drinks by price.',
    get: [['Ready to use:', { Drink: 'a class with a name and a price', menu: 'three drinks: mocha, tea, latte' }]],
    want: ['Give `Drink` an `__eq__`: equal when the name and the price both match', 'Give it an `__lt__`: a drink is less than another when it\'s cheaper', 'Make `by_price = sorted(menu)` and `cheapest = min(menu)`'],
    out: 'Finish the class and set `by_price` and `cheapest`.',
  },
},
'py-67': {
  explain: [
    'Python\'s built-in tools call hooks too. `len(x)` calls `x.__len__()`, and `item in x` calls `x.__contains__(item)`.',
    'A `for` loop calls `x.__iter__()`, which hands back something that gives one item at a time.',
    'Write those three methods, and your object works with `len`, `in` and `for` just as a list does.',
    'Inside, it keeps its own rules: this menu refuses repeats, which a plain list wouldn\'t.',
    '`__iter__` can simply pass the job on to a list it holds: `return iter(self.drinks)`.',
  ],
  example: {
    say: 'Here a queue object works with len, in and for.',
    code: `class Queue:
    def __init__(self, names):
        self.names = list(names)

    def __len__(self):
        return len(self.names)

    def __contains__(self, name):
        return name in self.names

    def __iter__(self):
        return iter(self.names)

q = Queue(["Ama", "Ben"])
print(len(q), "Ben" in q)
for person in q:
    print(person)`,
    lines: [
      ['def __len__(self):', 'len(q) calls this: 2.'],
      ['def __contains__(self, name):', '"Ben" in q calls this: True.'],
      ['def __iter__(self):', 'the for loop calls this, and goes through the names.'],
    ],
  },
  brief: {
    story: 'The menu object refuses repeats, which is good, but it won\'t work with len, in or a for loop.',
    get: [['A class is ready:', { Menu: 'keeps a list of drink names, and its add skips repeats' }]],
    want: ['Give `Menu` a `__len__`: how many drinks', 'Give it a `__contains__`: whether a name is on it', 'Give it an `__iter__`: to loop over the names', 'Set `count = len(menu)`, `has_tea = "tea" in menu` and `names = [d for d in menu]`'],
    out: 'Add the three hooks and set the three names.',
  },
},
'py-68': {
  explain: [
    '`a + b` calls `a.__add__(b)`. Write that method, and `+` can mean whatever makes sense for your objects.',
    'For baskets, adding two makes one bigger basket holding both lots of items.',
    'It should hand back a **new** object and leave both originals alone, just as `2 + 3` doesn\'t change the 2.',
    'Adding two lists makes a new list, so `self.items + other.items` is a neat way to build the combined items.',
    '`sum(baskets)` starts from 0, and 0 plus a basket makes no sense. Give `sum` an empty basket to start from instead: `sum(baskets, Basket())`.',
  ],
  example: {
    say: 'Here two shopping lists are added together.',
    code: `class Shopping:
    def __init__(self, items=None):
        self.items = list(items or [])

    def __add__(self, other):
        return Shopping(self.items + other.items)

    def __repr__(self):
        return f"Shopping({self.items})"

a = Shopping(["milk"])
b = Shopping(["beans", "sugar"])
print(a + b)
print(a)
print(sum([a, b, a], Shopping()))`,
    lines: [
      ['def __add__(self, other):', 'a + b calls this.'],
      ['Shopping(self.items + other.items)', 'a new list holding both, in a new Shopping.'],
      ['print(a)', 'a is unchanged by the adding.'],
      ['sum([...], Shopping())', 'starts from an empty list instead of 0.'],
    ],
  },
  brief: {
    story: 'A table sharing a bill wants their baskets combined into one.',
    get: [['Ready to use:', { Basket: 'a class holding items, with total and __repr__', ada: 'a basket with a latte', kofi: 'a basket with a tea and a cake' }]],
    want: ['Write `__add__` so `ada + kofi` gives a new Basket holding both lots of items', 'Make `shared = ada + kofi`', 'Make `everyone = sum([ada, kofi, ada], Basket())`'],
    out: 'Add `__add__` and set `shared` and `everyone`; neither original basket should change.',
  },
},
'py-69': {
  explain: [
    '`@property` above a method lets you read it like an attribute, with no brackets: `drink.with_vat` instead of `drink.with_vat()`.',
    'It\'s worked out fresh every time you read it, so it\'s never out of date when the price changes.',
    'A property can guard a value too. A **setter**, marked `@price.setter`, runs whenever something is assigned to `price`, and can refuse a bad value by raising an error.',
    'The real value is kept under a slightly different name, by habit with an underscore in front: `self._price`. The underscore means "for use inside the class only".',
    'Assigning in `__init__` (`self.price = price`) goes through the setter too, so even a brand new drink gets checked.',
  ],
  example: {
    say: 'Here a table\'s guest count is guarded, and its free seats are worked out fresh.',
    code: `class Table:
    def __init__(self, seats, guests):
        self.seats = seats
        self.guests = guests

    @property
    def guests(self):
        return self._guests

    @guests.setter
    def guests(self, value):
        if value > self.seats:
            raise ValueError("not enough seats")
        self._guests = value

    @property
    def free(self):
        return self.seats - self._guests

t = Table(4, 3)
print(t.free)
try:
    t.guests = 6
except ValueError as e:
    print(e)`,
    lines: [
      ['@property def guests', 'reading t.guests runs this and gives the stored value.'],
      ['@guests.setter', 'assigning t.guests runs this check first.'],
      ['t.free', 'a read-only property, worked out each time: 1.'],
      ['t.guests = 6', 'more guests than seats, so the setter refuses it.'],
    ],
  },
  brief: {
    story: 'Nothing stops a negative price being set on a drink, and the tax price is worked out by hand all over the code.',
    get: [['A class is ready:', { Drink: 'with a name and a plain price attribute' }]],
    want: ['Make `price` a property: reading it gives `self._price`', 'Its setter raises a `ValueError` for a negative price, and otherwise stores it rounded to 2 places', 'Keep `self.price = price` in `__init__`, so new drinks are checked too', 'Add a read-only property `with_vat`: the price times 1.2, rounded to 2 places', 'Delete the `latte.price = -3` line, which would now be refused'],
    out: 'Finish the class: a 4.50 latte\'s `with_vat` is 5.4.',
  },
},
'py-70': {
  explain: [
    'Data doesn\'t always arrive in the shape `__init__` wants. Here an order arrives as one line of text: `"Ada,Lagos,12.5"`.',
    'A **classmethod** gives the class a second way to build an object: `Order.from_line("Ada,Lagos,12.5")`.',
    'Put `@classmethod` on the line above it. Its first parameter is the class itself, called `cls` by habit, rather than an object.',
    'Inside, `cls(...)` makes the object, exactly as `Order(...)` would, after the text has been split and converted.',
    'A value set in the class body, outside any method, is a **class attribute**, shared by every object: handy for a setting like a tax rate.',
  ],
  example: {
    say: 'Here bookings can be made the usual way or from a line of text.',
    code: `class Booking:
    deposit = 10

    def __init__(self, name, people):
        self.name = name
        self.people = people

    @classmethod
    def from_text(cls, text):
        name, people = text.split(":")
        return cls(name, int(people))

b = Booking.from_text("Ama:4")
print(b.name, b.people, Booking.deposit)`,
    lines: [
      ['deposit = 10', 'a class attribute: one value shared by every booking.'],
      ['@classmethod def from_text(cls, text):', 'a second way in; cls is the Booking class itself.'],
      ['return cls(name, int(people))', 'splits the text, turns people into a number, then makes the booking.'],
    ],
  },
  brief: {
    story: 'Orders arrive from the website as lines of text, and the code should turn each into an Order cleanly.',
    get: [['Ready to use:', { Order: 'a class with customer, city and amount, a class attribute vat, and with_vat', lines: 'three lines like "Ada,Lagos,12.5"' }]],
    want: ['Add a classmethod `from_line` that splits a line and returns an Order, with the amount as a float', 'Make `orders`: an Order from each line, made with it'],
    out: 'Add `from_line` and set `orders`.',
  },
},

/* ── Iterators, generators and more ── */
'py-51': {
  explain: [
    'Behind the scenes, a `for` loop keeps asking for the next item until there are none left.',
    'You can do the same by hand. `it = iter(items)` makes an **iterator**: something that hands out the items one at a time.',
    '`next(it)` gives the next item each time it\'s called.',
    'When an iterator runs out, `next` raises a StopIteration error. A `for` loop catches that quietly and stops.',
    'A handy trick: take the first item off with `next`, like a header row, then loop over the rest. The loop carries on from where `next` stopped.',
  ],
  example: {
    say: 'Here the first line of a tip log is set aside, and the rest are read.',
    code: `log = ["name,tip", "Ama,2.5", "Ben,1.0"]
it = iter(log)
first = next(it)
print("header:", first)
for line in it:
    print(line)`,
    lines: [
      ['it = iter(log)', 'an iterator over the lines.'],
      ['next(it)', 'takes the first line, the header.'],
      ['for line in it:', 'carries on from the second line, so the header isn\'t seen again.'],
    ],
  },
  brief: {
    story: 'An export starts with a header line that shouldn\'t be added up with the numbers.',
    get: [['A list is ready:', { lines: '"customer,total", then three customer lines' }]],
    want: ['From a fresh `rows = iter(lines)`, take the header with `next` into `header`', 'Make `totals`: the total from each remaining line, as numbers'],
    out: 'Set `header` and `totals` ([12.5, 30.0, 8.25]).',
  },
},
'py-52': {
  explain: [
    'A function that uses `yield` instead of `return` is a **generator**.',
    'Each `yield` hands out one value and pauses the function right there, until the next value is asked for.',
    '`return` ends a function with one answer. `yield` can hand out many, one at a time.',
    'Because it makes values on demand, a generator can describe a stream far too long to keep in a list.',
    '`list(gen)` collects everything it makes, and a `for` loop takes the values one by one.',
  ],
  example: {
    say: 'Here a generator hands out queue ticket numbers one at a time.',
    code: `def tickets(start, how_many):
    n = start
    for _ in range(how_many):
        yield n
        n += 1

print(list(tickets(101, 4)))
for t in tickets(7, 2):
    print("Now serving", t)`,
    lines: [
      ['yield n', 'hands out the current number and pauses.'],
      ['n += 1', 'runs when the next number is asked for.'],
      ['list(tickets(101, 4))', 'collects every value: 101 to 104.'],
    ],
  },
  brief: {
    story: 'The till screen should show the running total after every item, not just the final bill.',
    get: [['A function is ready:', { running_totals: 'adds the amounts up and returns only the final total' }]],
    want: ['Turn it into a generator that yields the total after every amount'],
    out: '`list(running_totals([4.5, 3.0, 2.5]))` should be `[4.5, 7.5, 10.0]`.',
  },
},
'py-53': {
  explain: [
    '`sum(o for o in orders if o > 10)` adds up without building a list first. The part in brackets is a **generator expression**: a comprehension in round brackets.',
    'It works like a list comprehension, but makes each value only when `sum` asks for it.',
    '`any(...)` is True if at least one value is True. `all(...)` is True only if every one is.',
    'Both stop as soon as they know the answer, so they\'re quick even on long lists.',
    'They make questions read like English: `any(o > 30 for o in orders)` is "is any order over 30?"',
  ],
  example: {
    say: 'Here three questions are asked of a week\'s pastry sales.',
    code: `sold = [14, 9, 22, 6, 18]
print(sum(s for s in sold if s >= 10))
print(any(s > 20 for s in sold))
print(all(s > 5 for s in sold))`,
    lines: [
      ['sum(s for s in sold if s >= 10)', 'adds the days with 10 or more: 54.'],
      ['any(s > 20 for s in sold)', 'is there at least one day over 20? Yes: True.'],
      ['all(s > 5 for s in sold)', 'is every day over 5? Yes: True.'],
    ],
  },
  brief: {
    story: 'The manager wants three quick answers about today\'s orders.',
    get: [['A list is ready:', { orders: '[12.0, 8.5, 23.0, 2.5, 31.5]' }]],
    want: ['Make `big_total`: the total of the orders over 10, in one `sum(...)`', 'Make `any_over_30`: whether any order is over 30', 'Make `all_over_3`: whether every order is over 3'],
    out: 'Set all three.',
  },
},
'py-54': {
  explain: [
    'A **decorator** wraps a function inside another, to add something before or after it runs: timing it, logging it, counting it, checking its input.',
    'It\'s a function that takes a function and gives back a new one, usually called `wrapper`.',
    'Writing `@count_calls` on the line above a `def` means the same as `f = count_calls(f)`.',
    'The wrapper takes `*args, **kwargs` and passes them on, so the decorator works on any function, whatever it takes.',
    'The wrapper must still `return` what the original function returns, or the answers get lost.',
  ],
  example: {
    say: 'Here a decorator prints a note every time a function is used.',
    code: `def announce(fn):
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__)
        return fn(*args, **kwargs)
    return wrapper

@announce
def add_tip(bill):
    return round(bill * 1.1, 2)

print(add_tip(20))`,
    lines: [
      ['def wrapper(*args, **kwargs):', 'takes whatever the function would have taken.'],
      ['print("calling", fn.__name__)', 'the extra step, before the real function runs.'],
      ['@announce', 'wraps add_tip, so calling it runs the wrapper first: calling add_tip, then 22.0.'],
    ],
  },
  brief: {
    story: 'The team wants to know how often the tax function is used, without changing the function itself.',
    get: [['Ready to use:', { count_calls: 'a decorator whose wrapper runs the function but doesn\'t count yet', vat: 'a function decorated with it, called twice' }]],
    want: ['Make the wrapper add 1 to `wrapper.calls` every time it runs'],
    out: 'After the two calls, `vat.calls` should be 2.',
  },
},
'py-55': {
  explain: [
    '`first, *rest = items` puts the first item in `first`, and everything after it into the list `rest`. The star collects whatever is left over.',
    '`{**a, **b}` merges two dicts into a new one. Where both have the same key, the value from b wins.',
    'That makes it a neat way to apply someone\'s choices over a set of defaults.',
    'In a function call, `f(*items)` spreads a list out as separate values.',
    '`f(**options)` spreads a dict out as named values, matching keys to parameter names.',
  ],
  example: {
    say: 'Here a delivery round is split, and a cake order is built from defaults.',
    code: `stops = ["Lagos", "Ikeja", "Lekki", "Yaba"]
first, *rest = stops
print(first, rest)
standard = {"size": "medium", "icing": "plain"}
custom = {"icing": "chocolate"}
order = {**standard, **custom}
print(order)

def label(size, icing):
    return f"{size} cake, {icing} icing"

print(label(**order))`,
    lines: [
      ['first, *rest = stops', 'Lagos goes in first, the other three in rest.'],
      ['{**standard, **custom}', 'both dicts merged; custom\'s icing wins.'],
      ['label(**order)', 'the keys size and icing become the named values.'],
    ],
  },
  brief: {
    story: 'The queue app serves the first person, and a regular\'s usual order is built from the house defaults plus their changes.',
    get: [['Ready to use:', { queue: 'four names', defaults: 'size medium, whole milk, 1 shot', wanted: 'oat milk, 2 shots', describe: 'a function taking size, milk and shots' }]],
    want: ['Make `served, waiting` with one starred unpacking of `queue`', 'Make `order`: `defaults` with `wanted` merged over it', 'Make `line = describe(**order)`'],
    out: 'Set all four names.',
  },
},

/* ── Code you can trust ── */
'py-71': {
  explain: [
    'You can make a kind of error of your own by building on `Exception`: `class OutOfStock(Exception): pass`.',
    'It works like ValueError, but its name says exactly what went wrong, which makes messages and logs much clearer.',
    'Whoever calls your code can catch just that one: `except OutOfStock:` handles a sold-out drink, while a real bug still stops the program.',
    'A `try` can have an `else:` after the excepts. It runs only if nothing went wrong.',
    'And a `finally:` runs either way, error or not, which suits tidying up.',
  ],
  example: {
    say: 'Here a booking system raises its own error when the café is full.',
    code: `class FullUp(Exception):
    pass

seats = 2

def book(name):
    global seats
    if seats == 0:
        raise FullUp(name + " couldn't be seated")
    seats -= 1

for person in ["Ama", "Ben", "Chi"]:
    try:
        book(person)
    except FullUp as e:
        print("Sorry:", e)
    else:
        print("Seated", person)`,
    lines: [
      ['class FullUp(Exception): pass', 'a new kind of error, built on Exception.'],
      ['raise FullUp(...)', 'raised when there are no seats left.'],
      ['except FullUp as e:', 'catches only this kind, for Chi.'],
      ['else:', 'runs only when booking worked, for Ama and Ben.'],
    ],
  },
  brief: {
    story: 'The till stops dead when a drink is sold out, and the team wants it to note the problem and carry on.',
    get: [['Ready to use:', { stock: 'latte 2, tea 0, mocha 5', sell: 'raises a ValueError for a sold-out drink' }]],
    want: ['Make a class `OutOfStock`, built on `Exception`', 'Have `sell` raise it instead of ValueError', '`try` each sale in the loop: when it works (in `else`), add `"sold " + d` to `log`; on `OutOfStock`, add `"no " + d`'],
    out: '`log` should end as `["sold latte", "no tea", "sold mocha"]`.',
  },
},
'py-72': {
  explain: [
    '`with open(...)` promises the file gets closed at the end, even if something inside goes wrong. Anything that sets up and tidies away like that is a **context manager**.',
    'The easy way to write your own is a generator marked `@contextmanager`, from the `contextlib` module.',
    'The code before its `yield` runs on the way into the `with` block, and the code after `yield` runs on the way out.',
    'On its own, the code after `yield` is skipped if the block fails with an error.',
    'Put the `yield` inside `try:` and the tidying-up inside `finally:`, and it runs even when the code in the `with` fails.',
  ],
  example: {
    say: 'Here a "kitchen open" context manager always closes the kitchen, even after a problem.',
    code: `from contextlib import contextmanager

@contextmanager
def kitchen():
    print("kitchen open")
    try:
        yield
    finally:
        print("kitchen closed")

try:
    with kitchen():
        print("cooking")
        raise ValueError("oven fault")
except ValueError as e:
    print("problem:", e)`,
    lines: [
      ['print("kitchen open")', 'runs on the way into the with block.'],
      ['try: yield', 'the with block runs here.'],
      ['finally: print("kitchen closed")', 'runs on the way out, even though the block raised an error.'],
    ],
  },
  brief: {
    story: 'When the card machine fails mid-sale, the back till is left open all night.',
    get: [['Ready to use:', { till_open: 'a context manager that logs "open" and "close" to events, but only closes when nothing goes wrong' }]],
    want: ['Make `till_open` close the till even when something goes wrong inside the `with`', 'Put its `yield` inside `try:`', 'Put the closing line in `finally:`'],
    out: 'The back till should close before the error is noted.',
  },
},
'py-73': {
  explain: [
    'A **test** is a small function that calls your code with inputs whose answers you already know, and checks them with `assert`.',
    'By habit, a test\'s name starts with `test_`, so tools can find and run them all.',
    'A good test is one that a broken version of the code would fail. A test that always passes proves nothing.',
    'So pick inputs where a mistake would show: nothing at all (0), an exact boundary (10), a value well past it (25).',
    'Run the tests after every change. When one fails, either the code broke or the test was wrong, and both are worth knowing.',
  ],
  example: {
    say: 'Here a delivery fee rule is tested at its edges.',
    code: `def delivery_fee(total):
    """Free delivery from 20 upwards, otherwise 2.50."""
    return 0 if total >= 20 else 2.50

def test_delivery_fee():
    assert delivery_fee(0) == 2.50
    assert delivery_fee(19.99) == 2.50
    assert delivery_fee(20) == 0
    assert delivery_fee(55) == 0

test_delivery_fee()
print("all passed")`,
    lines: [
      ['delivery_fee(19.99)', 'just under the boundary: still charged.'],
      ['delivery_fee(20)', 'exactly on the boundary: free. A version using > instead of >= would fail here.'],
      ['test_delivery_fee()', 'runs every assert; if one fails, it stops with an error.'],
    ],
  },
  brief: {
    story: 'The loyalty rule has caused billing mistakes before, so it needs a test that would catch them.',
    get: [['Ready to use:', { loyalty_stamps: 'one stamp per cup, plus a bonus stamp for every full 10 cups', test_loyalty_stamps: 'a test with one assert so far' }]],
    want: ['Add three asserts to `test_loyalty_stamps`: for 0 cups, 10 cups and 25 cups', 'Work the answers out from the docstring'],
    out: 'Your test is also tried against broken versions of the function, and should catch every one.',
  },
},
'py-74': {
  explain: [
    'A docstring can show examples written as if typed into Python: a line starting `>>> ` with the call, and the answer on the line under it.',
    'They show a reader exactly how to use the function, which is often clearer than a description.',
    'The `doctest` module runs those examples and checks the answers still match.',
    'So the examples in your documentation can\'t quietly drift out of date: if the code changes and an answer no longer matches, doctest says so.',
    '`doctest.run_docstring_examples(fn, globals(), verbose=True)` runs one function\'s examples and reports on each.',
  ],
  example: {
    say: 'Here a cup-size helper carries its own checked examples.',
    code: `import doctest

def size_name(ml):
    """Name a cup by its size in millilitres.

    >>> size_name(240)
    'small'
    >>> size_name(350)
    'large'
    """
    return "small" if ml < 300 else "large"

doctest.run_docstring_examples(size_name, globals(), verbose=True)`,
    lines: [
      ['>>> size_name(240)', 'an example call, as if typed into Python.'],
      ["'small'", 'the answer it should give, on the next line.'],
      ['run_docstring_examples(..., verbose=True)', 'runs both examples and reports each one as ok.'],
    ],
  },
  brief: {
    story: 'The price label helper has one example in its docstring, and the team wants the edge cases shown and checked too.',
    get: [['A function is ready:', { price_label: 'shows a price with a pound sign and 2 decimal places, with one doctest example' }]],
    want: ['Add two more examples to the docstring: `price_label(3)` and `price_label(12.499)`', 'Work out what each should show', 'Run it, and make sure all three pass'],
    out: 'Three examples in the docstring, all passing.',
  },
},
'py-75': {
  explain: [
    'As tests pile up, the `unittest` module keeps them in order. You write a class built on `unittest.TestCase`, with one method per test.',
    'Each test method\'s name starts with `test_`, so unittest can find them all and run them.',
    'Instead of a bare `assert`, use its own checks, like `self.assertEqual(got, want)`. When one fails, the report shows both values side by side, which makes the problem obvious.',
    '`with self.assertRaises(ValueError):` checks that the code indented inside it raises the error it should. If it doesn\'t, the test fails.',
    'The runner reports each test as ok or FAIL, and a summary at the end.',
  ],
  example: {
    say: 'Here a tip rule gets a small unittest suite.',
    code: `import sys, unittest

def tip(bill, percent):
    if percent < 0:
        raise ValueError("tip can't be negative")
    return round(bill * percent / 100, 2)

class TestTip(unittest.TestCase):
    def test_ten_percent(self):
        self.assertEqual(tip(25, 10), 2.5)

    def test_negative(self):
        with self.assertRaises(ValueError):
            tip(25, -5)

def run_tests():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestTip)
    unittest.TextTestRunner(stream=sys.stdout, verbosity=2).run(suite)

run_tests()`,
    lines: [
      ['class TestTip(unittest.TestCase):', 'a set of tests for tip.'],
      ['self.assertEqual(tip(25, 10), 2.5)', 'checks the answer, and would show both values if they differed.'],
      ['with self.assertRaises(ValueError):', 'passes only if the indented call raises a ValueError.'],
      ['run_tests()', 'loads the tests, runs them and prints a report.'],
    ],
  },
  brief: {
    story: 'The bill-splitting function has a test for the easy case, but none for rounding or for zero people.',
    get: [['Ready to use:', { split_bill: 'each person\'s share, to 2 places, refusing fewer than 1 person', TestSplitBill: 'a TestCase with one test, test_even_split' }]],
    want: ['Add `test_rounding`: check that 10 split 3 ways is 3.33', 'Add `test_no_people`: check that splitting between 0 people raises a ValueError', 'Run them: all three should pass'],
    out: 'Add the two test methods; your tests are also tried against broken versions.',
  },
},

/* ── Regular expressions ── */
'py-56': {
  explain: [
    'A **regular expression** (regex for short) is a pattern for finding pieces of text.',
    '`re.findall(pattern, text)` gives back a list of every piece of the text that matches the pattern.',
    'Most characters in a pattern just match themselves: `r"tea"` finds "tea". Capitals matter, so it won\'t find "Tea".',
    'Special codes stand for kinds of character: `\\d` means any digit, and `+` means "one or more of the thing before". So `\\d+` finds whole numbers like 4 or 12.',
    'Write patterns as **raw strings**, with an `r` before the quotes, like `r"\\d+"`, so Python leaves the backslashes alone for the regex.',
  ],
  example: {
    say: 'Here the numbers are pulled out of a delivery note.',
    code: `import re
note = "6 bags of beans, 12 cartons of milk and 2 boxes of cups"
print(re.findall(r"\\d+", note))
print(re.findall(r"bags|boxes", note))
print([int(n) for n in re.findall(r"\\d+", note)])`,
    lines: [
      ['re.findall(r"\\d+", note)', 'every run of digits, as text: 6, 12, 2.'],
      ['r"bags|boxes"', 'the | means "or": finds either word.'],
      ['[int(n) for n in ...]', 'turns the found pieces into real numbers.'],
    ],
  },
  brief: {
    story: 'Table notes from the waiting staff mix words and numbers, and the kitchen wants just the numbers.',
    get: [['A string is ready:', { note: '"Table 4 ordered 2 lattes and 3 croissants; table 12 wants 1 tea."' }]],
    want: ['Find every number in the note with `re.findall`', 'Turn them into whole numbers (ints)'],
    out: 'Set `numbers`: [4, 2, 3, 12, 1].',
    fine: ['The first search in the editor missed "Table": patterns care about capitals.'],
  },
},
'py-57': {
  explain: [
    'Square brackets match any **one** character from a set: `[aeiou]` is any vowel, and `[A-Z]` any capital letter (the dash means "from ... to").',
    'Shortcuts: `\\d` is any digit, `\\w` any letter, digit or underscore, and `\\s` any space.',
    'After a character or set, say how many you want: `+` one or more, `*` none or more, `?` none or one.',
    'Curly brackets give exact counts: `{3}` exactly three, `{2,4}` two to four.',
    'So `[A-Z]{3}-\\d{4}` matches three capitals, a dash and four digits: a product code like `BNS-1024`.',
  ],
  example: {
    say: 'Here table codes in a booking list are found.',
    code: `import re
bookings = "T-04 booked, T-12 free, t-7 broken, T-123 is the terrace"
print(re.findall(r"T-\\d{2}", bookings))
print(re.findall(r"[A-Za-z]-\\d+", bookings))`,
    lines: [
      ['r"T-\\d{2}"', 'a capital T, a dash, then exactly two digits: T-04, T-12, and the T-12 inside T-123.'],
      ['r"[A-Za-z]-\\d+"', 'any letter, a dash, then one or more digits: includes t-7 and T-123 whole.'],
    ],
  },
  brief: {
    story: 'The restock note mentions product codes among other words, some of them typed wrongly.',
    get: [['A string is ready:', { stock: 'a note naming codes like BNS-1024, plus some that don\'t fit the format' }]],
    want: ['Find every product code: exactly three capitals, a dash and four digits'],
    out: 'Set `codes`: ["BNS-1024", "KIT-0042", "MRC-9001"].',
  },
},
'py-58': {
  explain: [
    'Round brackets in a pattern make a **group**: the part of the match you want to keep.',
    'With one group, `re.findall` gives back just that part. With two groups, it gives back a pair for every match.',
    '`\\.` means a real full stop. A plain `.` means "any one character", which is a common slip.',
    '`re.search` finds only the first match. `m.group(1)` is what its first group caught.',
    'If nothing matches, `re.search` gives `None`, so check before using the result.',
  ],
  example: {
    say: 'Here riders and their delivery times are pulled out of a log.',
    code: `import re
log = "Ama delivered in 12 mins. Ben cancelled. Chi delivered in 9 mins."
pairs = re.findall(r"(\\w+) delivered in (\\d+) mins", log)
print(pairs)
m = re.search(r"(\\w+) cancelled", log)
print(m.group(1))`,
    lines: [
      ['(\\w+) delivered in (\\d+) mins', 'two groups: the name and the minutes.'],
      ['re.findall(...)', 'gives a pair for each match: (Ama, 12) and (Chi, 9).'],
      ['m.group(1)', 'what the first group caught in the first match: Ben.'],
    ],
  },
  brief: {
    story: 'The payment log mixes payments and tips, and finance wants just the payments, by name.',
    get: [['A multi-line string is ready:', { log: 'lines like "Ada paid £12.50 at 09:14", and one tip line' }]],
    want: ['Find every "paid" line\'s name and amount, with two groups', 'Turn each amount into a float'],
    out: 'Set `payments`: a list of (name, amount) pairs. Zola tipped, so she isn\'t in it.',
  },
},
'py-59': {
  explain: [
    '`re.search` finds a match anywhere inside the text, which is too loose for checking a format: it happily finds four digits inside "12345".',
    '`re.fullmatch(pattern, text)` only matches if the pattern covers the **whole** text, start to end. It\'s the right tool for checking that something is in the right format.',
    'It gives a match object when it fits and `None` when it doesn\'t, so `is not None` turns that into True or False.',
    '`^` means "the start" and `$` "the end", another way of pinning a pattern to the whole text.',
    '`flags=re.IGNORECASE` makes capitals and small letters count the same.',
  ],
  example: {
    say: 'Here voucher codes are checked properly.',
    code: `import re
def valid(code):
    return re.fullmatch(r"SAVE\\d{2}", code) is not None
print(valid("SAVE10"), valid("SAVE100"), valid("xSAVE10"))
print(re.fullmatch(r"save\\d{2}", "SAVE20", flags=re.IGNORECASE) is not None)`,
    lines: [
      ['re.fullmatch(r"SAVE\\d{2}", code)', 'matches only when the whole code is SAVE and two digits.'],
      ['valid("SAVE100")', 'three digits, so it doesn\'t cover the whole text: False.'],
      ['flags=re.IGNORECASE', 'save matches SAVE: True.'],
    ],
  },
  brief: {
    story: 'The product code checker lets through codes with extra characters at either end.',
    get: [['A function is ready:', { is_code: 'uses re.search, so "XBNS-10245" passes too' }]],
    want: ['Make `is_code` True only when the **whole** text is a code (three capitals, a dash, four digits), using `re.fullmatch`', 'Write `is_code_any_case`: the same check with small letters allowed, using `flags=re.IGNORECASE`'],
    out: 'Fix `is_code` and add `is_code_any_case`.',
  },
},
'py-60': {
  explain: [
    '`re.sub(pattern, replacement, text)` swaps every match for the replacement, and gives back the new text.',
    '`re.sub(r"\\s+", " ", text)` squashes every run of spaces into a single space: a common tidy-up.',
    'In the replacement, `\\1`, `\\2` and so on put back what each group caught, so the parts can be rearranged.',
    'So `re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", text)` turns 05/02/2024 into 2024-02-05, everywhere it appears.',
    'Write the replacement as a raw string too, so the backslashes reach the regex.',
  ],
  example: {
    say: 'Here phone numbers are tidied and rearranged.',
    code: `import re
notes = "Call  Ama on 0803-555-1234,   Ben on 0701-555-9876"
tidy = re.sub(r"\\s+", " ", notes)
print(tidy)
print(re.sub(r"(\\d{4})-(\\d{3})-(\\d{4})", r"(\\1) \\2 \\3", tidy))`,
    lines: [
      ['re.sub(r"\\s+", " ", notes)', 'every run of spaces becomes one space.'],
      ['(\\d{4})-(\\d{3})-(\\d{4})', 'three groups: the parts of each number.'],
      ['r"(\\1) \\2 \\3"', 'puts the parts back in a new layout: (0803) 555 1234.'],
    ],
  },
  brief: {
    story: 'A customer note was typed carelessly, with dates in day/month/year, and the database wants year-month-day.',
    get: [['A string is ready:', { note: 'a sentence with extra spaces and three dates like 05/02/2024' }]],
    want: ['Squash every run of spaces to one', 'Rewrite every date from day/month/year to year-month-day'],
    out: 'Set `tidy`: "Signed up 2024-02-05, first order 2024-03-17, last 2024-06-02."',
  },
},

/* ── Small programs ── */
'py-76': {
  explain: [
    'Counting words is where most text analysis starts: the words that come up most tell you what people are talking about.',
    'Real text needs tidying first. Make it lower case, so "Great" and "great" count as one word.',
    'Then leave the punctuation behind: `re.findall(r"[a-z\']+", text.lower())` keeps only runs of letters (and apostrophes, for words like "don\'t").',
    'Little words like "the" and "and" swamp everything else. These are called **stop words**, and you leave them out before counting.',
    '`Counter(...).most_common(3)` then gives the three most frequent words that are left, with their counts.',
  ],
  example: {
    say: 'Here the words in three short reviews are tidied and counted.',
    code: `import re
from collections import Counter
reviews = "Lovely coffee. The coffee was hot! Lovely staff, lovely place."
words = re.findall(r"[a-z']+", reviews.lower())
print(words)
stop = {"the", "was"}
print(Counter(w for w in words if w not in stop).most_common(2))`,
    lines: [
      ['reviews.lower()', 'everything in small letters, so Lovely and lovely match.'],
      ['re.findall(r"[a-z\']+", ...)', 'just the words, without full stops or commas.'],
      ['if w not in stop', 'leaves out the little words before counting.'],
      ['most_common(2)', 'lovely 3 times, coffee twice.'],
    ],
  },
  brief: {
    story: 'The owner wants to know what customers mention most in their reviews.',
    get: [['Ready to use:', { text: 'three lines of reviews', stop: 'a set of little words to leave out' }]],
    want: ['Make `words`: the words in `text`, lower case and without punctuation, using `re.findall`', 'Make `top`: the 3 most common words that aren\'t in `stop`, as (word, count) pairs'],
    out: 'Set `words` and `top`.',
  },
},
'py-77': {
  explain: [
    'A **bigram** is a pair of words that sit side by side.',
    '`zip(words, words[1:])` pairs each word with the one after it: the list beside itself, shifted by one.',
    'Collect, for every word, the words that came straight after it: `{"the": ["latte", "cake", ...], ...}`.',
    'That map is a tiny **language model**: it knows which words tend to follow which.',
    'Count a word\'s followers and the most common one is the likeliest next word. The word suggestions on a phone keyboard grew from this idea.',
  ],
  example: {
    say: 'Here the pairs in a short order history are listed and counted.',
    code: `from collections import Counter, defaultdict
words = "flat white then flat white then oat latte".split()
print(list(zip(words, words[1:]))[:3])
after = defaultdict(list)
for a, b in zip(words, words[1:]):
    after[a].append(b)
print(after["flat"], Counter(after["then"]))`,
    lines: [
      ['zip(words, words[1:])', 'pairs each word with the next: (flat, white), (white, then), ...'],
      ['after[a].append(b)', 'records b as one of the words that followed a.'],
      ['after["flat"]', 'white, both times.'],
    ],
  },
  brief: {
    story: 'The app team is experimenting with suggesting the next word in review comments.',
    get: [['Ready to use:', { words: 'the words of two review lines, in order' }]],
    want: ['Make `followers`: a `defaultdict(list)` holding, for every word, the words that came straight after it', 'Make `after_the`: the most common word after "the"', 'Make `after_was`: a Counter of the words after "was"'],
    out: 'Set all three.',
  },
},
'py-78': {
  explain: [
    'Run the followers map forwards and it writes. Start from a word, pick one of the words that followed it, then one that followed that one, and so on.',
    'Text made this way is called a **Markov chain**: each word depends only on the one before it.',
    'Picking with `rng.choice(...)` from a word\'s list of followers makes common followers likelier, since they appear in the list more often.',
    'If the last word never had anything after it, there\'s nothing to pick, so stop early.',
    'With a fixed seed, `random.Random(4)`, the "random" picks come out the same every run. That\'s how you test code that relies on chance.',
  ],
  example: {
    say: 'Here a tiny chain writes a few words from a short menu description.',
    code: `import random
from collections import defaultdict
words = "fresh bread and fresh coffee and warm bread".split()
after = defaultdict(list)
for a, b in zip(words, words[1:]):
    after[a].append(b)
rng = random.Random(2)
out = ["fresh"]
while len(out) < 5 and after.get(out[-1]):
    out.append(rng.choice(after[out[-1]]))
print(" ".join(out))`,
    lines: [
      ['after.get(out[-1])', 'the words that followed the last word so far.'],
      ['rng.choice(...)', 'picks one of them; a fixed seed makes it the same every run.'],
      ['while len(out) < 5 and ...', 'stops at 5 words, or earlier if a word had no followers.'],
    ],
  },
  brief: {
    story: 'For fun, the social team wants a bot that writes review-style sentences from real reviews.',
    get: [['Ready to use:', { followers: 'every word, with the words that came after it', babble: 'a function that starts a list with the first word, but doesn\'t add any more yet' }]],
    want: ['Finish `babble`: while `out` is shorter than `length`, pick the next word with `rng.choice` from the followers of the last word, and add it on', 'Stop early if the last word has no followers', 'Make `line`: `" ".join(babble("the", 8, random.Random(4)))`'],
    out: 'Finish `babble` and set `line`.',
  },
},
'py-79': {
  explain: [
    'Lots of charges work in **bands**: the first slice of income pays one rate, the next slice a higher one, and so on.',
    'Only the money inside a band pays that band\'s rate, so earning a little more never leaves you worse off.',
    'Keep the bands as data, a list of (upper limit, rate) pairs, rather than a pile of `if`s. Changing a rate is then one number.',
    'Loop through the bands. For each one, the slice taxed is the income above where the last band ended, up to this band\'s limit.',
    '`12_000` is just 12000 (the underscore is for reading), and `float("inf")` is infinity, bigger than any number, so the last band has no top.',
  ],
  example: {
    say: 'Here delivery charges work in distance bands: the first 3 km free, then 0.50 a km to 10 km, then 1.00 a km.',
    code: `bands = [(3, 0.0), (10, 0.5), (float("inf"), 1.0)]
def charge(km):
    owed, lower = 0, 0
    for upper, rate in bands:
        part = min(km, upper) - lower
        if part <= 0:
            break
        owed += part * rate
        lower = upper
    return owed
print(charge(2), charge(8), charge(15))`,
    lines: [
      ['part = min(km, upper) - lower', 'the slice of the distance inside this band.'],
      ['if part <= 0: break', 'the distance has run out, so stop.'],
      ['charge(8)', '3 km free, then 5 km at 0.50: 2.5.'],
      ['charge(15)', '3 free, 7 at 0.50, 5 at 1.00: 8.5.'],
    ],
  },
  brief: {
    story: 'A barista asked how much tax they\'d pay on a raise, and the payroll helper needs finishing (the bands are made up).',
    get: [['Ready to use:', { bands: '(up to, rate) pairs: 0% to 12,000, 20% to 40,000, 40% above', tax: 'a function with the loop started but empty' }]],
    want: ['For each band, work out the slice of income above `lower` and up to `upper`', 'Stop if that slice is 0 or less', 'Otherwise add slice times rate to `owed`, then set `lower = upper`'],
    out: 'Finish `tax`: `tax(30_000)` should be 3600.0.',
  },
},
'py-80': {
  explain: [
    '**ETL** is the everyday shape of data work: **extract** the raw data, **transform** it (tidy, check, convert), then **load** it somewhere it can be asked questions, like a database.',
    'Give each stage its own function, so each can be tested and fixed on its own.',
    'Rows that fail the checks go to one side with the reason, rather than vanishing, so someone can fix them at the source.',
    'Python comes with `sqlite3`, a small database that can live in memory: `sqlite3.connect(":memory:")`.',
    '`db.executemany("INSERT ...", rows)` loads many rows at once, and SQL can then answer questions about them with `db.execute(...).fetchall()`.',
  ],
  example: {
    say: 'Here a tiny list of tips goes through the three stages into a database.',
    code: `import sqlite3
raw = ["Ama,2.5", "Ben,oops", "Chi,1.0"]
def extract(lines):
    return [line.split(",") for line in lines]
def transform(rows):
    good, bad = [], []
    for name, tip in rows:
        try:
            good.append((name, float(tip)))
        except ValueError:
            bad.append((name, tip))
    return good, bad
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE tips (name TEXT, tip REAL)")
good, bad = transform(extract(raw))
db.executemany("INSERT INTO tips VALUES (?, ?)", good)
print(db.execute("SELECT SUM(tip) FROM tips").fetchone()[0], bad)`,
    lines: [
      ['extract(lines)', 'splits each raw line into its parts.'],
      ['transform(rows)', 'turns tips into numbers, setting aside any that aren\'t.'],
      ['db.executemany("INSERT ...", good)', 'loads all the good rows at once.'],
      ['SELECT SUM(tip) FROM tips', 'asks the database a question: the total, 3.5.'],
    ],
  },
  brief: {
    story: 'The nightly sales export needs tidying and checking before it goes into the reporting database.',
    get: [['Ready to use:', { raw: 'the export as text: date, branch, drink, cups, price', extract: 'turns each line into a dict', transform: 'loops over the rows but does nothing yet', load: 'creates the sales table and inserts rows' }]],
    want: ['In `transform`, strip each branch and put it in title case, turn cups into an int and price into a float', 'Reject a row whose cups isn\'t a whole number, or is below 0, as a pair `(row, reason)`', 'Make `takings`: `db.execute("SELECT branch, SUM(cups * price) FROM sales GROUP BY branch ORDER BY branch").fetchall()`'],
    out: 'Finish `transform` and set `takings`: 4 rows load and 2 are rejected.',
  },
},
};
