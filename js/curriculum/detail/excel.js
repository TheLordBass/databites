/* Excel (xl-01 to xl-20): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). An example's formula goes in its own
   column with its own heading (example.xl, curriculum/index.js
   examplePrelude), so its answer is never shown under the task's heading. */

const SHEET = { 'A date': 'the day', 'B city': 'Lagos, Accra or Nairobi', 'C drink': 'latte, espresso, cold brew or tea', 'D cups': 'cups sold that day', 'E price': 'the price of a cup', 'F revenue': "that day's takings", 'G rating': 'out of 5, empty on 9 days' };
const CAFE = ['The `cafe` sheet: headings in row 1, then one day per row, rows 2 to 121:', SHEET];

export const EXCEL_DETAIL = {
'xl-01': {
  explain: [
    'A spreadsheet is a grid. Columns have letters and rows have numbers, so every cell has an address: **D2** is column D, row 2.',
    'This sheet holds the café data: headings in row 1, then one day per row. Column **D** is the cups sold that day and **E** is the price of a cup.',
    'Type **=** first, and the cell works something out instead of just holding what you typed.',
    '`=D2*E2` multiplies the two cells. `*` means times, and `/` means divided by.',
    'Copied down, each row gets its own version: row 3 says `=D3*E3`, row 4 `=D4*E4`, and so on.',
    'Change a number in D or E and the answer changes with it. That is the whole point of a formula.',
  ],
  example: {
    xl: { cell: 'I2', label: 'price +0.50' },
    say: 'Here every price goes up by 50p, worked out in column I and copied down.',
    code: '=E2+0.5',
    lines: [
      ['=', 'tells the cell to work something out.'],
      ['E2+0.5', 'the price on this row, plus 0.5.'],
      ['copied down', 'row 3 gets =E3+0.5, row 4 =E4+0.5, and so on to the last row.'],
    ],
  },
  brief: {
    story: 'The café wants each day\'s takings worked out on the sheet, not on a calculator.',
    get: [CAFE],
    want: ['In H2, the cups (D2) times the price (E2)'],
    out: 'H2 holds the formula, and it is filled down to every row for you.',
  },
},
'xl-02': {
  explain: [
    'A **range** is a block of cells, written as its two ends with a colon between them: `F2:F121` means F2 down to F121.',
    'That is the whole revenue column, from the first day to the last.',
    'A **function** is a ready-made calculation. It has a name, then brackets holding what it works on.',
    '`=SUM(F2:F121)` adds up every number in the range.',
    '`F:F` means all of column F. It includes the heading in row 1, but SUM skips text, so `=SUM(F:F)` gives the same total.',
  ],
  example: {
    xl: { label: 'total cups' },
    say: 'Here are all the cups sold, added up in one cell.',
    code: '=SUM(D2:D121)',
    lines: [
      ['SUM', 'the function that adds up.'],
      ['D2:D121', 'the range: every cell from D2 down to D121, the cups column.'],
    ],
  },
  brief: {
    story: 'The owner wants one number: everything the café has taken so far.',
    get: [CAFE],
    want: ['In J2, add up all the revenue in column F'],
    out: 'J2 shows one number: the total revenue.',
  },
},
'xl-03': {
  explain: [
    '`AVERAGE` gives the mean: the total divided by how many numbers there are.',
    '`MIN` gives the smallest number in a range, and `MAX` the largest.',
    'They take a range, just like SUM: `=MAX(D2:D121)` is the most cups sold in a single day.',
    'A function hands back a number, so it can go anywhere a number can, even into a sum.',
    'So `=MAX(D2:D121)-MIN(D2:D121)` takes one answer away from the other.',
  ],
  example: {
    xl: { label: 'average cups' },
    say: 'Here is the average number of cups sold in a day.',
    code: '=AVERAGE(D2:D121)',
    lines: [
      ['AVERAGE', 'adds up the range, then divides by how many numbers there are.'],
      ['D2:D121', 'the cups column, so it is the cups on a typical day. The long decimal is fine; rounding comes soon.'],
    ],
  },
  brief: {
    story: 'The rota planner wants to know how far apart the café\'s best and worst days are.',
    get: [CAFE],
    want: ['In J2, the most cups sold in a day, take away the fewest'],
    out: 'J2 shows one number.',
  },
},
'xl-04': {
  explain: [
    '`COUNT` counts the cells holding numbers.',
    '`COUNTA` counts every cell that isn\'t empty: numbers, text, anything.',
    '`COUNTBLANK` counts the empty ones.',
    'Column G, the rating, has gaps: on some days nobody left a rating, so those cells are empty.',
    'Looking for gaps is the first thing to do with any new sheet, because AVERAGE skips empty cells without telling you.',
  ],
  example: {
    xl: { label: 'days with a rating' },
    say: 'Here are the days that do have a rating.',
    code: '=COUNT(G2:G121)',
    lines: [
      ['COUNT', 'counts the cells holding a number.'],
      ['G2:G121', 'the ratings. The empty cells are left out, so this is fewer than 120.'],
    ],
  },
  brief: {
    story: 'The quality team wants to know how many days have no rating, before they trust the average.',
    get: [CAFE],
    want: ['In J2, count the empty cells in G2:G121'],
    out: 'J2 shows one number.',
  },
},
'xl-05': {
  explain: [
    '`=ROUND(number, places)` rounds to that many decimal places: `=ROUND(3.14159, 2)` is 3.14.',
    'Excel rounds halves up, away from zero: 2.5 becomes 3.',
    'Places can be 0 for a whole number, or even -1 to round to the nearest 10.',
    'The number to round can be a sum worked out right there: `ROUND(E2*1.2, 2)`.',
    'Showing fewer decimals (formatting the cell) only changes how it looks. ROUND changes the number itself.',
  ],
  example: {
    xl: { cell: 'I2', label: 'revenue, whole' },
    say: 'Here each day\'s revenue is rounded to a whole number, in column I.',
    code: '=ROUND(F2,0)',
    lines: [
      ['F2', 'the revenue on this row.'],
      [',0', 'no decimal places: a whole number.'],
    ],
  },
  brief: {
    story: 'The menu board needs prices with VAT, to the penny.',
    get: [CAFE],
    want: ['In H2, the price (E2) with 20% VAT added: E2 times 1.2', 'Rounded to 2 decimal places'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-06': {
  explain: [
    'When a formula is copied down, its cell addresses move with it: F2 becomes F3, then F4. These are **relative** references.',
    'A **$** stops the part straight after it from moving.',
    '`$F$2` means F2 wherever the formula is copied: an **absolute** reference.',
    '`=SUM($F$2:F2)` is a running total. The start is locked on F2, and the end moves down a row each time.',
    'So each row adds up everything from the first day to its own day.',
  ],
  example: {
    xl: { cell: 'I2', label: 'vs first day' },
    say: 'Here each day\'s cups are compared with the very first day, which stays locked.',
    code: '=D2-$D$2',
    lines: [
      ['D2', 'relative: becomes D3, D4 and so on as it is copied down.'],
      ['$D$2', 'locked: always the first day\'s cups.'],
      ['the first row', 'is 0, since it is the first day compared with itself.'],
    ],
  },
  brief: {
    story: 'The owner wants to watch the year\'s takings build up, day by day.',
    get: [CAFE],
    want: ['Add $ signs to the starter so H2 becomes a running total', 'On the last row it should equal the whole total'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-07': {
  explain: [
    'A share is a part divided by the whole: one day\'s revenue divided by the total revenue.',
    'The part should move down a row each time. The total shouldn\'t.',
    'So lock the total\'s range at both ends: `SUM($F$2:$F$121)`.',
    'Without the $ signs, the range slides down too, and each row divides by a smaller and smaller total.',
    'A share is between 0 and 1: 0.01 is 1%. All the shares together add up to exactly 1.',
  ],
  example: {
    xl: { cell: 'I2', label: 'short of best' },
    say: 'Here each day is compared with the best day for cups, a range that is locked at both ends.',
    code: '=D2-MAX($D$2:$D$121)',
    lines: [
      ['MAX($D$2:$D$121)', 'the most cups in a day. Locked, so every row looks at the whole column.'],
      ['D2-...', 'how many cups short of the best day this one was. The best day shows 0.'],
    ],
  },
  brief: {
    story: 'The accountant wants each day\'s share of the year\'s takings.',
    get: [CAFE],
    want: ['Lock the range in the starter\'s SUM', 'So every row divides by the same total'],
    out: 'H2 holds the formula, filled down. The shares add up to 1.',
  },
},
'xl-08': {
  explain: [
    '`=IF(test, answer if true, answer if false)` gives one answer or the other.',
    'The test is a comparison like `D2>=40`, which is either TRUE or FALSE.',
    'The comparisons are `=`, `<>` (not equal), `>`, `<`, `>=` (at least) and `<=` (at most).',
    'Text in a formula goes in double quotes, like `"busy"`. Numbers and cell addresses don\'t.',
    'Copied down, the test is checked again on every row.',
  ],
  example: {
    xl: { cell: 'I2', label: 'price check' },
    say: 'Here every day gets a word for its price.',
    code: '=IF(E2>4,"pricey","fair")',
    lines: [
      ['E2>4', 'the test: was the price more than 4?'],
      ['"pricey"', 'the answer when it was.'],
      ['"fair"', 'the answer when it wasn\'t.'],
    ],
  },
  brief: {
    story: 'The rota planner wants every day marked busy or quiet.',
    get: [CAFE],
    want: ['In H2, "busy" on days with 40 or more cups', '"quiet" on the rest'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-09': {
  explain: [
    '`IFS` takes pairs: a test, then its answer, as many pairs as you need.',
    'It gives the answer for the **first** test that is TRUE, and ignores the rest.',
    'End with the test `TRUE`, which is always true, so it catches whatever is left.',
    'Order matters: test the biggest threshold first.',
    'Put 25 before 45 and every busy day stops at "steady", because 45 cups is also at least 25.',
  ],
  example: {
    xl: { cell: 'I2', label: 'rating word' },
    say: 'Here every day\'s rating gets a word.',
    code: '=IFS(G2>=4.5,"loved",G2>=3.5,"liked",TRUE,"fine")',
    lines: [
      ['G2>=4.5,"loved"', 'the first pair, the highest bar.'],
      ['G2>=3.5,"liked"', 'only reached if the first test failed.'],
      ['TRUE,"fine"', 'everything else. An empty rating counts as 0, so it lands here too.'],
    ],
  },
  brief: {
    story: 'The rota planner wants three kinds of day, not two.',
    get: [CAFE],
    want: ['In H2, "rush" for 45 cups or more', '"steady" for 25 or more', '"slow" for the rest'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-10': {
  explain: [
    '`AND(test1, test2)` is TRUE only when every test inside it is TRUE.',
    '`OR(test1, test2)` is TRUE when at least one of them is.',
    'They go inside IF, in the test\'s place: `=IF(AND(B2="Lagos",D2>=40),"yes","no")`.',
    'You can put more than two tests inside, with commas between them.',
    'Comparing text ignores capitals: `B2="lagos"` matches Lagos too.',
  ],
  example: {
    xl: { cell: 'I2', label: 'star day' },
    say: 'Here a day is a star if it sold 55 cups or more, or took 250 or more.',
    code: '=IF(OR(D2>=55,F2>=250),"star","")',
    lines: [
      ['OR(D2>=55,F2>=250)', 'TRUE if either one is true.'],
      ['""', 'two quotes with nothing between: an empty answer, so ordinary days stay blank.'],
    ],
  },
  brief: {
    story: 'The Lagos manager wants their big days marked, and only theirs.',
    get: [CAFE],
    want: ['Change the starter so "yes" means a Lagos day **and** 40 or more cups', '"no" for everything else'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-11': {
  explain: [
    '`=COUNTIF(range, criteria)` counts the cells in the range that match the criteria.',
    'The criteria for text goes in quotes: `"Lagos"` counts the cells that say Lagos.',
    'Capitals don\'t matter, but spelling does.',
    'Each row of cafe is one day, so counting the rows that say Lagos counts the days in Lagos.',
    'It gives one number, so it goes in a single cell, not filled down.',
  ],
  example: {
    xl: { label: 'tea days' },
    say: 'Here are the days that sold tea, counted.',
    code: '=COUNTIF(C2:C121,"tea")',
    lines: [
      ['C2:C121', 'the drink column.'],
      ['"tea"', 'count only the cells that say tea.'],
    ],
  },
  brief: {
    story: 'Head office asks how many days the Lagos branch has traded.',
    get: [CAFE],
    want: ['In J2, count the days in Lagos (column B)'],
    out: 'J2 shows one number.',
  },
},
'xl-12': {
  explain: [
    '`=SUMIF(range to test, criteria, range to add)` adds up only some of the numbers.',
    'Wherever the first range matches, the number in the same row of the third range is added.',
    '`=SUMIF(C2:C121,"latte",F2:F121)` adds the revenue (F) on every row whose drink (C) is latte.',
    'The two ranges must line up row for row: both from row 2 to row 121.',
    'Leave the third range out, and SUMIF adds up the first range itself.',
  ],
  example: {
    xl: { label: 'Nairobi cups' },
    say: 'Here are the cups sold in Nairobi, added up.',
    code: '=SUMIF(B2:B121,"Nairobi",D2:D121)',
    lines: [
      ['B2:B121,"Nairobi"', 'the rows to use: the ones whose city is Nairobi.'],
      ['D2:D121', 'what to add up on those rows: the cups.'],
    ],
  },
  brief: {
    story: 'The milk supplier asks how much the café takes on lattes.',
    get: [CAFE],
    want: ['In J2, add up the revenue (F) from the latte days (C)'],
    out: 'J2 shows one number.',
  },
},
'xl-13': {
  explain: [
    '`SUMIFS` adds up the rows where **every** condition matches.',
    'The range to add comes **first**, then pairs: a range, and what it must match.',
    '`=SUMIFS(F2:F121, B2:B121,"Accra", C2:C121,"tea")` is the revenue from tea in Accra.',
    'That order is the opposite of SUMIF, where the range to add comes last.',
    'SUMIFS does everything SUMIF does, so many people only ever use SUMIFS.',
  ],
  example: {
    xl: { label: 'Lagos espresso cups' },
    say: 'Here are the espresso cups sold in Lagos.',
    code: '=SUMIFS(D2:D121,B2:B121,"Lagos",C2:C121,"espresso")',
    lines: [
      ['D2:D121', 'first: what to add up, the cups.'],
      ['B2:B121,"Lagos"', 'the first condition: the city is Lagos.'],
      ['C2:C121,"espresso"', 'the second: the drink is espresso. A row needs both.'],
    ],
  },
  brief: {
    story: 'The Accra manager wants to know what tea brings in at their branch.',
    get: [CAFE],
    want: ['In J2, add up the revenue from tea sold in Accra'],
    out: 'J2 shows one number.',
  },
},
'xl-14': {
  explain: [
    'A criteria can compare: `">=40"` means 40 or more. The sign and the number go inside the quotes together.',
    'To use a number from a cell, join the sign to it with **&**: `">="&J1`.',
    'If J1 holds 40, that builds the text ">=40". Change J1 and the answer follows.',
    '`COUNTIFS` counts the rows where every condition matches, in range and criteria pairs, like SUMIFS.',
    'In this editor, a first line like `J1: 40` puts 40 in J1 before the formula runs.',
  ],
  example: {
    say: 'Here J1 holds 4.5, and J2 counts the days rated at least that.',
    code: 'J1: 4.5\n=COUNTIF(G2:G121,">="&J1)',
    lines: [
      ['J1: 4.5', 'puts 4.5 in J1.'],
      ['">="&J1', 'joins the sign to whatever J1 holds: ">=4.5".'],
      ['COUNTIF(G2:G121, ...)', 'counts the ratings that pass.'],
    ],
  },
  brief: {
    story: 'The Nairobi manager wants to count big days, and to change what "big" means without touching the formula.',
    get: [CAFE, ['J1 holds 40 (the first line of the editor puts it there).']],
    want: ['In J2, count the Nairobi days with at least J1 cups', 'Use J1, rather than typing 40'],
    out: 'J2 shows one number.',
  },
},
'xl-15': {
  explain: [
    'A date is a number underneath: the count of days since 1900. 1 March 2024 is 45352.',
    'That is why dates can be compared with `>=` and `<`, like any number.',
    '`DATE(2024,3,1)` makes the date 1 March 2024: year, month, day.',
    'Join it to a sign as before: `">="&DATE(2024,3,1)` means on or after 1 March.',
    'For a whole month, use two conditions: on or after the 1st, and before the 1st of the next month.',
    '`AVERAGEIFS(range to average, range, criteria, ...)` works like SUMIFS, but averages.',
  ],
  example: {
    xl: { label: 'days in February' },
    say: 'Here are the days in February 2024, counted.',
    code: '=COUNTIFS(A2:A121,">="&DATE(2024,2,1),A2:A121,"<"&DATE(2024,3,1))',
    lines: [
      ['">="&DATE(2024,2,1)', 'on or after 1 February.'],
      ['"<"&DATE(2024,3,1)', 'and before 1 March. 2024 is a leap year, so 29 days.'],
    ],
  },
  brief: {
    story: 'The owner wants to know how busy March was, on a typical day.',
    get: [CAFE],
    want: ['In J2, the average cups sold per day in March 2024', 'The dates are in column A'],
    out: 'J2 shows one number.',
  },
},
'xl-16': {
  explain: [
    'Another sheet\'s cells are written with its name and a **!**: `cities!A2:C5` is a block of the cities sheet.',
    'The cities sheet has the city in A, the country in B and the population in C.',
    '`=VLOOKUP(what to find, table, column number, FALSE)` finds the value in the table\'s first column, then brings back the cell that many columns across.',
    'Column 1 is the first column of the table, so 2 is the country.',
    '**FALSE** asks for an exact match. Leave it out and VLOOKUP guesses, which on unsorted data brings back wrong answers with no error.',
  ],
  example: {
    xl: { cell: 'I2', label: 'population (m)' },
    say: 'Here each row\'s city is looked up on the cities sheet, to bring back its population.',
    code: '=VLOOKUP(B2,cities!A:C,3,FALSE)',
    lines: [
      ['B2', 'what to find: this row\'s city.'],
      ['cities!A:C', 'where to look: columns A to C of the cities sheet.'],
      ['3,FALSE', 'bring back the third column, the population, on an exact match only.'],
    ],
  },
  brief: {
    story: 'Head office reports by country, and the cafe sheet only has cities.',
    get: [CAFE, ['The `cities` sheet:', { 'A city': 'Lagos, Nairobi, Accra or Kigali', 'B country': 'its country', 'C population_m': 'people, in millions' }]],
    want: ['Add the missing FALSE to the starter', 'So H2 shows the country for each row\'s city'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-17': {
  explain: [
    'This sheet is `order_items`: an order number in A, a product id in B and a quantity in C.',
    'The prices live on the `products` sheet: id in A, name in B, category in C and price in D.',
    '`=XLOOKUP(what to find, where to look, what to bring back)`.',
    '`XLOOKUP(B2,products!A:A,products!D:D)` finds the product id in column A and brings back the price from column D.',
    'No column numbers to count, and it is an exact match unless you ask for something else.',
    'A lookup gives a value like any other, so it can be multiplied.',
  ],
  example: {
    xl: { cell: 'E2', label: 'product name' },
    say: 'Here each line\'s product id is looked up, to bring back the product\'s name.',
    code: '=XLOOKUP(B2,products!A:A,products!B:B)',
    lines: [
      ['B2', 'what to find: this line\'s product id.'],
      ['products!A:A', 'where to look: the ids on the products sheet.'],
      ['products!B:B', 'what to bring back from the same row: the name.'],
    ],
  },
  brief: {
    story: 'The finance team wants the value of every order line.',
    get: [['The `order_items` sheet:', { 'A order_id': 'which order', 'B product_id': 'which product', 'C qty': 'how many' }], ['The `products` sheet:', { 'A product_id': 'its id', 'B name': 'its name', 'C category': 'beans, kit, merch or gift', 'D price': 'the price of one' }]],
    want: ['In D2, the quantity (C2) times the product\'s price, looked up on the products sheet'],
    out: 'D2 holds the formula, filled down to every row.',
  },
},
'xl-18': {
  explain: [
    '`MATCH(value, range, 0)` says **where** the value is: `MATCH(59, D2:D121, 0)` is 25 if 59 is the 25th cell. The 0 makes it exact.',
    '`INDEX(range, n)` gives the **n-th** cell of a range: `INDEX(A2:A121, 25)` is the 25th date.',
    'Together they look anything up: find the position in one column, then take the same position from another.',
    'It works whichever side the answer is on, which VLOOKUP can\'t do.',
    'Work from the inside out: MAX first, then MATCH, then INDEX.',
  ],
  example: {
    xl: { label: 'city of worst day' },
    say: 'Here is the city of the day with the lowest revenue.',
    code: '=INDEX(B2:B121,MATCH(MIN(F2:F121),F2:F121,0))',
    lines: [
      ['MIN(F2:F121)', 'the lowest revenue.'],
      ['MATCH(..., F2:F121, 0)', 'where it is in the revenue column: its position.'],
      ['INDEX(B2:B121, ...)', 'the city at that same position.'],
    ],
  },
  brief: {
    story: 'The owner wants to know when the busiest day was.',
    get: [CAFE],
    want: ['In J2, the date (column A) of the day with the most cups'],
    out: 'J2 shows one date.',
  },
},
'xl-19': {
  explain: [
    '**&** joins text: `=C2&" in "&B2` gives "latte in Lagos". The spaces go inside the quotes.',
    '`PROPER` gives each word a capital letter: `PROPER(C2)` is "Latte".',
    'A date joined straight in shows the number underneath: `"on "&A2` gives "on 45292".',
    '`TEXT(value, format)` writes it the way you want: `TEXT(A2,"d mmm")` is "1 Jan".',
    'Other formats: "dd/mm/yyyy" for 01/01/2024, "mmmm" for January, and "0.00" for two decimal places.',
  ],
  example: {
    xl: { cell: 'I2', label: 'takings note' },
    say: 'Here each row gets a note of its city and takings, with the money written to two places.',
    code: '=B2&" took "&TEXT(F2,"0.00")',
    lines: [
      ['B2&" took "', 'the city, then the words " took ", spaces included.'],
      ['TEXT(F2,"0.00")', 'the revenue, always with two decimal places.'],
    ],
  },
  brief: {
    story: 'The social media team wants a ready-made caption for each day.',
    get: [CAFE],
    want: ['Wrap the starter\'s A2 in TEXT', 'So each label reads like "Latte in Lagos, 1 Jan"'],
    out: 'H2 holds the formula, filled down to every row.',
  },
},
'xl-20': {
  explain: [
    'Some formulas give back a whole list. It **spills**: the answer fills the cells below by itself.',
    'When the data changes, the list grows or shrinks to fit.',
    '`=FILTER(A2:A121, D2:D121>=55)` gives every date whose cups are 55 or more. The second part is a test, checked row by row.',
    '`UNIQUE(C2:C121)` lists each drink once, and `SORT(...)` puts a list in order.',
    'The cells a list spills into must be empty, or you get `#SPILL!`.',
  ],
  example: {
    xl: { label: 'drinks' },
    say: 'Here is each drink once, A to Z, from one formula.',
    code: '=SORT(UNIQUE(C2:C121))',
    lines: [
      ['UNIQUE(C2:C121)', 'each drink once.'],
      ['SORT(...)', 'in alphabetical order. The list spills down from J2.'],
    ],
  },
  brief: {
    story: 'The owner wants a list of the big days, to see if they have anything in common.',
    get: [CAFE],
    want: ['In J2, list the dates (column A) of every day with 55 or more cups'],
    out: 'The list spills down from J2.',
  },
},
};
