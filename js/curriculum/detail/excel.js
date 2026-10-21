/* Excel (xl-01 to xl-20): the fuller teaching, a worked example and the
   task as a brief (see detail/index.js). An example's formula goes in its own
   column with its own heading (example.xl, curriculum/index.js
   examplePrelude), so its answer is never shown under the task's heading. */

const SHEET = { 'A date': 'the day', 'B city': 'Lagos, Accra or Nairobi', 'C drink': 'latte, espresso, cold brew or tea', 'D cups': 'cups sold that day', 'E price': 'the price of a cup', 'F revenue': "that day's takings", 'G rating': 'out of 5, empty on 9 days' };
const CAFE = ['The `cafe` sheet: headings in row 1, then one day per row, rows 2 to 121:', SHEET];

export const EXCEL_DETAIL = {
'xl-01': {
  explain: [
    'A spreadsheet is a big grid. Columns get letters, rows get numbers, and together they give every cell an address, like a seat number. **D2** is column D, row 2.',
    'This sheet is the café\'s sales book. Row 1 holds the headings, and every row after that is one day\'s trading. Column **D** is how many cups went out, and **E** is what one cup cost.',
    'Start a cell with **=** and you\'re telling Excel to work something out, rather than just store what you typed.',
    'So `=D2*E2` means "the cups times the price". In Excel, `*` is times and `/` is divided by.',
    'Copy that formula down the column and Excel adjusts it for each row as it goes. Row 3 gets `=D3*E3`, row 4 gets `=D4*E4`, and so on.',
    'The best part: fix a number in D or E and the answer updates by itself. That\'s why you write a formula instead of reaching for a calculator.',
  ],
  example: {
    xl: { cell: 'I2', label: 'price +0.50' },
    say: 'Imagine every price goes up by 50p. Column I works out the new price for each day, and the formula is copied down.',
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
    'A **range** is a block of cells. You write its first and last cell with a colon in between, so `F2:F121` means everything from F2 down to F121.',
    'On this sheet, that\'s the whole revenue column, from the café\'s first day to its last.',
    'A **function** is a calculation Excel already knows how to do. You give it a name, then put what it should work on inside brackets.',
    '`=SUM(F2:F121)` adds up every number in that range, so the whole column becomes one total.',
    'You can also write `F:F` for all of column F. That takes in the heading too, but SUM quietly skips words, so `=SUM(F:F)` lands on the same total.',
  ],
  example: {
    xl: { label: 'total cups' },
    say: 'Here\'s every cup the café has sold, added up in a single cell.',
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
    '`AVERAGE` gives you the typical value: it adds everything up, then divides by how many numbers there are.',
    '`MIN` finds the smallest number in a range, and `MAX` finds the biggest.',
    'They work just like SUM. Hand one a range and it hands back an answer, so `=MAX(D2:D121)` is the busiest day\'s cups.',
    'That answer is just a number, so you can use it anywhere a number fits, including inside a sum.',
    'That\'s how `=MAX(D2:D121)-MIN(D2:D121)` works. Excel finds both answers first, then takes one from the other.',
  ],
  example: {
    xl: { label: 'average cups' },
    say: 'Here\'s how many cups the café sells on an average day.',
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
    '`COUNT` counts the cells that hold a number.',
    '`COUNTA` is less fussy. It counts any cell with something in it: numbers, words, anything at all.',
    '`COUNTBLANK` goes the other way and counts the empty cells.',
    'Column G holds the customer rating, and it has gaps. On some days nobody left a rating, so those cells are simply empty.',
    'Checking for gaps is a good first habit with any new sheet. AVERAGE skips empty cells without saying a word, so you want to know how many there are before you trust it.',
  ],
  example: {
    xl: { label: 'days with a rating' },
    say: 'Here\'s how many days did get a rating.',
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
    '`=ROUND(number, places)` tidies a number to as many decimal places as you ask for. `=ROUND(3.14159, 2)` gives 3.14.',
    'When a number sits exactly halfway, Excel rounds away from zero, so 2.5 becomes 3.',
    'Use 0 places for a whole number. You can even use -1 to round to the nearest 10, handy for rough totals.',
    'You can round a calculation as you make it, all in one go: `ROUND(E2*1.2, 2)`.',
    'Be careful not to mix this up with formatting. Showing fewer decimals only changes how the cell looks, but ROUND really changes the number.',
  ],
  example: {
    xl: { cell: 'I2', label: 'revenue, whole' },
    say: 'Here each day\'s revenue is rounded to whole pounds, in column I.',
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
    'When you copy a formula down, its cell addresses travel with it. F2 becomes F3, then F4. These are called **relative** references, because they move relative to where the formula lands.',
    'Put a **$** in front of a letter or number and that part stays put, however far you copy.',
    'So `$F$2` always means F2, on every row. That\'s an **absolute** reference.',
    'Mix the two and you get a running total: `=SUM($F$2:F2)`. The start is pinned to the first day, while the end slides down one row at a time.',
    'Each row ends up adding everything from day one to its own day, like a till total that keeps growing.',
  ],
  example: {
    xl: { cell: 'I2', label: 'vs first day' },
    say: 'Here each day\'s cups are compared with the very first day, which stays locked in place.',
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
    'A share is a part divided by the whole. Here that\'s one day\'s revenue divided by the total revenue.',
    'As you copy down, the part should move to the next day. The total shouldn\'t move at all.',
    'So lock both ends of the total\'s range: `SUM($F$2:$F$121)`.',
    'Forget the $ signs and the range slides down with everything else. Each row then divides by a smaller and smaller total, and the shares come out too big.',
    'A share always sits between 0 and 1, where 0.01 means 1%. Add up every day\'s share and you get exactly 1, the whole lot.',
  ],
  example: {
    xl: { cell: 'I2', label: 'short of best' },
    say: 'Here every day is compared with the best day for cups, using a range locked at both ends.',
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
    '`=IF(test, answer if true, answer if false)` lets a cell make a decision. It gives one answer or the other.',
    'The test is a question with a yes or no answer, like `D2>=40`: did this day sell 40 cups or more? Excel calls the answers TRUE and FALSE.',
    'You can ask with `=`, `<>` (not equal), `>`, `<`, `>=` (at least) and `<=` (at most).',
    'Words in a formula need double quotes, like `"busy"`. Numbers and cell addresses don\'t.',
    'Copy it down and every row asks the question again about its own day.',
  ],
  example: {
    xl: { cell: 'I2', label: 'price check' },
    say: 'Here every day gets a word for its price: anything over £4 is pricey.',
    code: '=IF(E2>4,"pricey","fair")',
    lines: [
      ['E2>4', 'the test: was the price more than £4?'],
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
    'When two answers aren\'t enough, `IFS` lets you list as many tests as you like, each followed by its answer.',
    'Excel reads them in order and stops at the **first** test that\'s TRUE. Everything after it is ignored.',
    'Finish with the test `TRUE`. It\'s always true, so it catches whatever the other tests missed.',
    'Because Excel stops early, order matters. Put the biggest threshold first.',
    'Try it the wrong way round: test 25 before 45, and a 50-cup day stops at "steady", because 50 is also at least 25. The "rush" test never gets a look in.',
  ],
  example: {
    xl: { cell: 'I2', label: 'rating word' },
    say: 'Here every day\'s rating gets a word to describe it.',
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
    '`AND(test1, test2)` is only TRUE when every test inside it passes.',
    '`OR(test1, test2)` is easier to please. It\'s TRUE as soon as any one of them passes.',
    'They slot into IF where the test goes: `=IF(AND(B2="Lagos",D2>=40),"yes","no")`.',
    'You\'re not limited to two. Add more tests, with a comma between each.',
    'One nice thing: comparing words ignores capitals, so `B2="lagos"` still matches Lagos.',
  ],
  example: {
    xl: { cell: 'I2', label: 'star day' },
    say: 'Here a day earns a star if it sold 55 cups or more, or took £250 or more.',
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
    '`=COUNTIF(range, criteria)` counts the cells in a range that match what you\'re looking for.',
    'To match words, put them in quotes: `"Lagos"` counts the cells that say Lagos.',
    'Capitals don\'t matter, but spelling does. "Lagos" won\'t match "Lagoss".',
    'Every row of this sheet is one day, so counting the rows that say Lagos tells you how many days were in Lagos.',
    'You get back a single number, so the formula lives in one cell rather than being copied down.',
  ],
  example: {
    xl: { label: 'tea days' },
    say: 'Here are the days that sold tea, counted up.',
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
    '`=SUMIF(range to check, criteria, range to add)` adds up only the numbers you want.',
    'Excel checks the first range row by row. Wherever it matches, it adds the number from the same row of the third range.',
    'So `=SUMIF(C2:C121,"latte",F2:F121)` looks for latte in the drinks column and adds up the revenue on those rows.',
    'The two ranges need to line up row for row, so both run from row 2 to row 121.',
    'Leave the third range off and SUMIF just adds up the matching cells in the first range.',
  ],
  example: {
    xl: { label: 'Nairobi cups' },
    say: 'Here are all the cups sold in Nairobi, added up.',
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
    '`SUMIFS` is SUMIF with more than one condition. It only adds a row when **every** condition matches.',
    'This time the range to add comes **first**. After it come pairs: a range, then what it must match.',
    'So `=SUMIFS(F2:F121, B2:B121,"Accra", C2:C121,"tea")` is the money taken from tea in Accra.',
    'Watch the order, because it\'s the opposite of SUMIF, which puts the range to add last.',
    'SUMIFS can do anything SUMIF can, so plenty of people just use SUMIFS for everything.',
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
    'A criteria can compare as well as match. `">=40"` means 40 or more, and the sign and the number go inside the quotes together.',
    'To compare against a number sitting in a cell, join the sign to it with **&**, like `">="&J1`.',
    'If J1 holds 40, that builds the text ">=40" for you. Change J1 and the answer follows, with no need to touch the formula.',
    '`COUNTIFS` counts the rows where every condition matches. Like SUMIFS, it takes a range and a criteria for each one.',
    'In this editor, a first line like `J1: 40` puts 40 in J1 before your formula runs.',
  ],
  example: {
    say: 'Here J1 holds 4.5, and J2 counts the days rated at least that well.',
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
    'Underneath, every date is a number: how many days it is since the start of 1900. 1 March 2024 is day 45352.',
    'That\'s why you can compare dates with `>=` and `<`, just like any other number. A later date is simply a bigger number.',
    '`DATE(2024,3,1)` builds the date 1 March 2024 for you. You give it the year, the month and the day, in that order.',
    'Join it to a sign the same way as before: `">="&DATE(2024,3,1)` means on or after 1 March.',
    'To catch a whole month, use two conditions: on or after the 1st, and before the 1st of the next month.',
    '`AVERAGEIFS(range to average, range, criteria, ...)` works just like SUMIFS, except it averages.',
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
    'To point at another sheet, write its name and a **!** before the cells. `cities!A2:C5` is a block on the cities sheet.',
    'The cities sheet lists each city in A, its country in B and its population in C.',
    '`=VLOOKUP(what to find, table, column number, FALSE)` looks down the table\'s first column for your value, then brings back the cell that many columns across.',
    'The table\'s first column counts as 1, so 2 brings back the country.',
    '**FALSE** means "exact matches only". Leave it out and VLOOKUP makes a guess, and on unsorted data it\'ll happily hand back the wrong answer without any error.',
  ],
  example: {
    xl: { cell: 'I2', label: 'population (m)' },
    say: 'Here each row\'s city is looked up on the cities sheet to bring back its population.',
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
    'The prices are kept on a different sheet, `products`, with the id in A, the name in B, the category in C and the price in D.',
    '`=XLOOKUP(what to find, where to look, what to bring back)` reads almost like a sentence.',
    'So `XLOOKUP(B2,products!A:A,products!D:D)` finds the product id in column A and brings back the price from column D.',
    'There are no column numbers to count, and it only accepts exact matches unless you ask otherwise.',
    'What comes back is just a value, so you can multiply it by the quantity straight away.',
  ],
  example: {
    xl: { cell: 'E2', label: 'product name' },
    say: 'Here each line\'s product id is looked up to bring back the product\'s name.',
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
    '`MATCH(value, range, 0)` tells you **where** something is. If 59 is the 25th cell in D2:D121, `MATCH(59, D2:D121, 0)` gives 25. The 0 means exact matches only.',
    '`INDEX(range, n)` does the reverse and gives you the cell at that position. `INDEX(A2:A121, 25)` is the 25th date.',
    'Put them together and you can look anything up: find the position in one column, then read the same position in another.',
    'It doesn\'t care which side the answer is on, which is something VLOOKUP can\'t manage.',
    'Build it from the inside out. MAX finds the most cups, MATCH finds which row that was, and INDEX picks the date from that row.',
  ],
  example: {
    xl: { label: 'city of worst day' },
    say: 'Here\'s the city that had the day with the lowest revenue.',
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
    '**&** glues pieces of text together. `=C2&" in "&B2` gives "latte in Lagos". Put the spaces inside the quotes, or the words run together.',
    '`PROPER` gives each word a capital first letter, so `PROPER(C2)` turns latte into "Latte".',
    'Dates are trickier. Join one straight in and you\'ll see the number hiding underneath: `"on "&A2` gives "on 45292".',
    '`TEXT(value, format)` fixes that by writing the value the way you describe. `TEXT(A2,"d mmm")` gives "1 Jan".',
    'A few other formats worth knowing: "dd/mm/yyyy" for 01/01/2024, "mmmm" for January, and "0.00" for two decimal places.',
  ],
  example: {
    xl: { cell: 'I2', label: 'takings note' },
    say: 'Here each row gets a short note of its city and takings, with the money written to two decimal places.',
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
    'Some formulas give back a whole list instead of one answer. The list **spills** into the cells below, all by itself.',
    'When the data changes, the list grows or shrinks to fit. Nothing to copy down.',
    '`=FILTER(A2:A121, D2:D121>=55)` gives every date where the cups were 55 or more. The second part is a test, checked on every row.',
    '`UNIQUE(C2:C121)` lists each drink just once, and `SORT(...)` puts a list in order.',
    'The cells below need to be empty for the list to spill into. If something\'s in the way, you get `#SPILL!`.',
  ],
  example: {
    xl: { label: 'drinks' },
    say: 'Here\'s each drink listed once, A to Z, from a single formula.',
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
