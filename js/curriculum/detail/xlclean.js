/* Excel cleaning (xc-01 to xc-15): the fuller teaching, a worked example and
   the task as a brief (see detail/index.js). Each example puts its formula in
   a column of its own (example.xl), so it never sits under the task's
   heading, and works on something other than the task's answer. */

const SHEET = {
  'A " Name "': 'the name, some in lower case',
  'B "City "': 'Lagos, Accra or Nairobi, with stray spaces and capitals',
  'C "Signed Up"': 'the sign-up date as text: 2024-01-05, 05/02/2024 or unknown',
  'D "Spend (GBP)"': 'text like 12.50, £18.00 or n/a',
  'E "Subscribed?"': 'Yes, y, N, no or YES',
  'F "Note"': 'a sentence starting ref# and a number',
};
const GOT_SURVEY = ['The `survey` sheet: a customer survey export, rows 2 to 33, everything stored as text. Two rows were sent twice.', SHEET];
const STORY = 'The marketing team sent over a survey export, and wants it usable by the end of the day.';

export const XLCLEAN_DETAIL = {
'xc-01': {
  explain: [
    'This course cleans a messy export with formulas. The sheet is `survey`: answers to a customer survey, never tidied.',
    'Column B, the city, has spaces before and after some names. A space at the start or end is invisible, but Excel counts it.',
    'So " Lagos" and "Lagos" are different values, and a filter or lookup treats them as two cities.',
    '`LEN(B2)` counts the characters, spaces included: the quickest way to see them.',
    '`=TRIM(B2)` takes off the spaces at both ends, and squeezes double spaces inside down to one.',
  ],
  example: {
    xl: { cell: 'H2', label: 'name length' },
    say: 'Here each name\'s length is counted, so the hidden spaces show up as extra characters.',
    code: '=LEN(A2)',
    lines: [
      ['LEN(A2)', 'the characters in the name, spaces included.'],
      ['filled down', 'names with a space round them come out longer than they look.'],
    ],
  },
  brief: {
    story: STORY,
    get: [GOT_SURVEY],
    want: ['In G2, the city with its extra spaces trimmed off'],
    out: 'G2 holds the formula, filled down to row 33.',
  },
},
'xc-02': {
  explain: [
    'Column A, the name, mixes "ada lovelace" with "Kofi Mensah".',
    '`PROPER` gives each word a capital first letter and makes the rest lower case.',
    '`UPPER` makes it all capitals, and `LOWER` all small letters.',
    'Functions can sit inside each other. Excel works from the inside out: `=PROPER(TRIM(A2))` trims first, then fixes the capitals.',
  ],
  example: {
    xl: { cell: 'H2', label: 'loud city' },
    say: 'Here the city is trimmed and put in capitals.',
    code: '=UPPER(TRIM(B2))',
    lines: [
      ['TRIM(B2)', 'worked out first: the spaces go.'],
      ['UPPER(...)', 'then every letter becomes a capital: LAGOS.'],
    ],
  },
  brief: {
    story: 'The names are going into a mail merge, and half of them start with a small letter.',
    get: [GOT_SURVEY],
    want: ['In G2, the name trimmed and in proper capitals, like "Ada Lovelace"'],
    out: 'G2 holds the formula, filled down to row 33.',
  },
},
'xc-03': {
  explain: [
    'COUNTIF ignores capitals, but not spaces: `"lagos"` counts "Lagos" and "lagos", and misses " Lagos".',
    'A **wildcard** stands for unknown text in a criteria.',
    '`*` means any run of characters, even none. `?` means exactly one.',
    'So `"*lagos*"` matches "lagos" with anything before or after it.',
    'Wildcards only work on text criteria, inside the quotes.',
  ],
  example: {
    xl: { cell: 'L2', label: 'yes answers' },
    say: 'Here every answer starting with y is counted, however it was typed.',
    code: '=COUNTIF(E2:E33,"y*")',
    lines: [
      ['"y*"', 'a y, then anything: Yes, y and YES all match.'],
      ['the count', '20 of the 32 rows.'],
    ],
  },
  brief: {
    story: 'The Lagos manager asks how many survey answers came from their branch.',
    get: [GOT_SURVEY],
    want: ['In J2, count every row whose city is Lagos, however it was typed'],
    out: 'J2 shows one number.',
  },
},
'xc-04': {
  explain: [
    'Exports often write "missing" as text: "n/a", "unknown", "-".',
    "The cell isn't empty, so COUNTBLANK can't see it, and nothing looks missing.",
    'COUNTIF finds them: `COUNTIF(D2:D33,"n/a")` counts the spends written n/a.',
    'Two counts add together in one formula with `+`.',
  ],
  example: {
    xl: { cell: 'L2', label: 'empty cells' },
    say: 'Here every truly empty cell in the survey is counted.',
    code: '=COUNTBLANK(A2:F33)',
    lines: [
      ['COUNTBLANK(A2:F33)', 'the empty cells in the whole survey.'],
      ['the answer', "0. The gaps are there, they're just written as words."],
    ],
  },
  brief: {
    story: 'The data lead asks how much of the survey is really missing.',
    get: [GOT_SURVEY],
    want: ['In J2, the spends written "n/a" in column D, plus the sign-up dates written "unknown" in column C'],
    out: 'J2 shows one number.',
  },
},
'xc-05': {
  explain: [
    'Each note has its own reference number, so a note that turns up twice means the whole row was sent twice.',
    "`COUNTIF($F$2:$F$33,F2)` counts how many times this row's note appears in the whole column.",
    '1 is normal; 2 or more is a copy.',
    'Lock the range with `$` so it stays the whole column as the formula fills down, while `F2` moves row by row.',
  ],
  example: {
    xl: { cell: 'H2', label: 'same spelling' },
    say: 'Here each row counts how many rows share its exact city spelling.',
    code: '=COUNTIF($B$2:$B$33,B2)',
    lines: [
      ['$B$2:$B$33', 'locked: always the whole city column.'],
      ['B2', 'moves down: each row looks up its own city.'],
    ],
  },
  brief: {
    story: "The survey's response count looks too high. Mark the rows that were sent twice.",
    get: [GOT_SURVEY],
    want: ["In G2, how many times this row's note appears in column F"],
    out: 'G2 holds the formula, filled down. A 2 marks a copy.',
  },
},
'xc-06': {
  explain: [
    '"£18.00" is text: Excel can\'t add it up.',
    '`SUBSTITUTE(D2,"£","")` swaps every £ for nothing.',
    '`VALUE(...)` turns text that looks like a number into a real one.',
    '"n/a" can\'t become a number, so VALUE gives #VALUE!.',
    '`IFERROR(formula,"")` gives an empty answer instead of the error.',
  ],
  example: {
    xl: { cell: 'H2', label: 'without the £' },
    say: 'Here the £ is taken out, but nothing more.',
    code: '=SUBSTITUTE(D2,"£","")',
    lines: [
      ['SUBSTITUTE(D2,"£","")', '£18.00 becomes 18.00.'],
      ['still text', "it sits on the left of the cell: VALUE is still needed to make it a number."],
    ],
  },
  brief: {
    story: "Finance's spend total comes out as 0, because every spend is text.",
    get: [GOT_SURVEY],
    want: ['In G2, the spend as a real number: £ taken out, empty for n/a'],
    out: 'G2 holds the formula, filled down to row 33.',
  },
},
'xc-07': {
  explain: [
    'Five spellings, two meanings: Yes, y, YES, N and no.',
    'Make them alike first: `LOWER(TRIM(E2))`.',
    '`LEFT(text,1)` keeps just the first character, so every answer is now "y" or "n".',
    'IF then turns it into 1 or 0.',
    'A column of 1s and 0s adds up to a count, and averages to a share.',
  ],
  example: {
    xl: { cell: 'H2', label: 'first letter' },
    say: 'Here each answer is tidied down to its first letter.',
    code: '=LEFT(LOWER(TRIM(E2)),1)',
    lines: [
      ['LOWER(TRIM(E2))', 'the answer, trimmed and in small letters.'],
      ['LEFT(...,1)', 'just the first character: y or n.'],
    ],
  },
  brief: {
    story: 'The newsletter team needs a column they can add up.',
    get: [GOT_SURVEY],
    want: ['In G2, 1 for every kind of yes and 0 for every kind of no'],
    out: 'G2 holds the formula, filled down to row 33.',
  },
},
'xc-08': {
  explain: [
    'Column C mixes "2024-01-05" (year first) with "05/02/2024" (day first, from a British form), and "unknown". All of it is text.',
    '`DATE(year, month, day)` builds a real date from three numbers.',
    'LEFT, MID and RIGHT cut the pieces out: `MID(C2,4,2)` is 2 characters from the 4th.',
    'IF picks the layout: a "/" as the 3rd character means day first.',
    'IFERROR gives an empty answer for "unknown", which isn\'t a date at all.',
  ],
  example: {
    xl: { cell: 'L2', fill: false, label: 'a date' },
    say: 'Here one day-first date is taken apart and built into a real date.',
    code: '=DATE(RIGHT("05/02/2024",4),MID("05/02/2024",4,2),LEFT("05/02/2024",2))',
    lines: [
      ['RIGHT(...,4)', 'the year: 2024.'],
      ['MID(...,4,2)', 'the month: 02.'],
      ['LEFT(...,2)', 'the day: 05. Together, 5 February 2024.'],
    ],
  },
  brief: {
    story: 'Marketing wants sign-ups by month, and the dates come in two layouts.',
    get: [GOT_SURVEY],
    want: ['In G2, a real date for every sign-up: year-first and day-first both', 'Empty for "unknown"'],
    out: 'G2 holds the formula, filled down to row 33.',
  },
},
'xc-09': {
  explain: [
    'Each note starts "ref#1000 ...". The number sits between the # and the first space.',
    '`TEXTAFTER(F2,"#")` gives everything after the #.',
    '`TEXTBEFORE(text," ")` gives everything before the first space.',
    'Put one inside the other, then VALUE turns the digits into a number.',
    'Cutting at the marks, rather than at fixed positions, keeps working when the numbers get longer.',
  ],
  example: {
    xl: { cell: 'H2', label: 'after the #' },
    say: 'Here the first step on its own: everything after the #.',
    code: '=TEXTAFTER(F2,"#")',
    lines: [
      ['TEXTAFTER(F2,"#")', '"1000 priority high": the number, and the words after it.'],
    ],
  },
  brief: {
    story: 'Customer service wants each answer linked to its reference number.',
    get: [GOT_SURVEY],
    want: ['In G2, the reference number from each note, as a real number'],
    out: 'G2 holds the formula, filled down to row 33.',
  },
},
'xc-10': {
  explain: [
    '`UNIQUE(range)` lists each different value of a range once. The list **spills** into the cells below.',
    'Given several columns, it lists each different row: a row only counts as a repeat if every cell matches.',
    '`ROWS(...)` counts the rows of whatever it is given, including a list a formula makes.',
    'So `ROWS(UNIQUE(range))` counts without listing.',
  ],
  example: {
    xl: { cell: 'L2', label: 'city spellings' },
    say: 'Here the different spellings of the city are counted.',
    code: '=ROWS(UNIQUE(B2:B33))',
    lines: [
      ['UNIQUE(B2:B33)', 'each spelling once.'],
      ['ROWS(...)', 'how many: 5, for 3 real cities.'],
    ],
  },
  brief: {
    story: 'The data lead wants to know how many rows will be left once the copies go.',
    get: [GOT_SURVEY],
    want: ['In J2, the rows left once exact copies are removed'],
    out: 'J2 shows one number.',
  },
},
'xc-11': {
  explain: [
    "This sheet is a courier's log: order (A), quantity (B), rating (C), the day ordered (D) and the day delivered (E).",
    'Write down rules every row should obey, then check each row against them.',
    '`IFS` checks the rules in order and gives the answer for the first that fails. A last test of `TRUE` catches the rows that pass.',
    'A missing rating isn\'t broken, just missing, so check `C2<>""` before testing its range.',
    'Dates written year first compare correctly even as text.',
  ],
  example: {
    xl: { cell: 'G2', label: 'quantity check' },
    say: 'Here one rule is checked on its own.',
    code: '=IF(B2<1,"no quantity","fine")',
    lines: [
      ['B2<1', 'the rule: at least 1 has to be sent.'],
      ['"fine"', 'shown when the row passes.'],
    ],
  },
  brief: {
    story: "Some deliveries in the courier's log look impossible. The operations lead wants each one marked.",
    get: [['The `courier` sheet:', { 'A order_id': 'the order', 'B qty': 'how many', 'C rating': '1 to 5, or empty', 'D ordered': 'the day ordered', 'E delivered': 'the day delivered' }]],
    want: ['In F2, the first rule each row breaks: "no quantity", "rating out of range" or "delivered before ordered"', 'Empty when the row is fine'],
    out: 'F2 holds the formula, filled down.',
  },
},
'xc-12': {
  explain: [
    "When the same fact is stored twice, the two should agree: a receipt's total ought to equal its lines added up.",
    'The lines live on another sheet. `receipt_lines!A:A` is column A of that sheet.',
    "`SUMIF(receipt_lines!A:A,A2,receipt_lines!C:C)` adds up the prices of this receipt's lines.",
    'Compare money with a small allowance, `ABS(B2-...)>0.005`, not `<>`.',
    'Decimals stored in binary can be a hair apart even when they look equal.',
  ],
  example: {
    xl: { cell: 'D2', label: 'from lines' },
    say: "Here each receipt's lines are added up from the other sheet.",
    code: '=SUMIF(receipt_lines!A:A,A2,receipt_lines!C:C)',
    lines: [
      ['receipt_lines!A:A,A2', 'the lines whose receipt number matches this row.'],
      ['receipt_lines!C:C', 'their prices, added up.'],
    ],
  },
  brief: {
    story: "The till's totals and the printed lines don't always agree. The accountant wants the ones that don't.",
    get: [['The `receipts` sheet (A receipt, B total), and `receipt_lines` (A receipt, B item, C price).']],
    want: ["In C2, TRUE where the receipt's total differs from its lines added up by more than 0.005"],
    out: 'C2 holds the formula, filled down.',
  },
},
'xc-13': {
  explain: [
    'An outlier is a value far from the rest. It might be a typo or something real.',
    'Flag it, look at it, then decide.',
    "A fair comparison is with the row's own group: `AVERAGEIFS($F$2:$F$121,$B$2:$B$121,B2)` is the average revenue of this row's city.",
    'Lock the ranges with `$`, so every row averages the whole column; only B2 moves.',
  ],
  example: {
    xl: { cell: 'I2', label: 'vs average' },
    say: "Here each day's revenue is shown as a multiple of the overall average.",
    code: '=ROUND(F2/AVERAGE($F$2:$F$121),2)',
    lines: [
      ['F2/AVERAGE($F$2:$F$121)', '1 is an average day; 2 is twice as big.'],
      ['the catch', 'one overall average, so small branches look quieter than they are.'],
    ],
  },
  brief: {
    story: "The regional manager asks which days were unusually big, for each branch's own standard.",
    get: [['The `cafe` sheet: one row per day, rows 2 to 121, with the city in B and the revenue in F.']],
    want: ["In H2, TRUE where the day's revenue is more than 1.5 times its own city's average revenue"],
    out: 'H2 holds the formula, filled down to row 121.',
  },
},
'xc-14': {
  explain: [
    '`COUNTA(range)` counts the cells that hold anything at all: numbers, text, "n/a".',
    '`COUNT(range)` counts only the numbers, so on text it gives 0.',
    'Take away the stand-ins and you have the real answers: `COUNTA(D2:D33)-COUNTIF(D2:D33,"n/a")`.',
    'A few counts like this at the top of a sheet sum up its health: rows, real answers, copies.',
  ],
  example: {
    xl: { cell: 'L2', label: 'filled dates' },
    say: 'Here the sign-up cells that hold anything are counted.',
    code: '=COUNTA(C2:C33)',
    lines: [
      ['COUNTA(C2:C33)', '32: every cell has something in it.'],
      ['the catch', '"unknown" counts too, so 32 overstates the real dates.'],
    ],
  },
  brief: {
    story: 'Next to the average spend, the report should say how many people gave one.',
    get: [GOT_SURVEY],
    want: ['In J2, how many rows give a real spend'],
    out: 'J2 shows one number.',
  },
},
'xc-15': {
  explain: [
    '`COUNTIFS` counts the rows where every condition matches, in range and criteria pairs.',
    'With wildcards in each criteria, it cleans as it counts.',
    '`"*nairobi*"` matches the city however it was typed; `"y*"` matches Yes, y and YES.',
    'For a quick answer that is enough. For anything you will reuse, clean the columns properly first.',
  ],
  example: {
    xl: { cell: 'L2', label: 'Accra no' },
    say: 'Here the Accra answers that are some kind of no are counted.',
    code: '=COUNTIFS(B2:B33,"*accra*",E2:E33,"n*")',
    lines: [
      ['"*accra*"', 'Accra however it was typed.'],
      ['"n*"', 'N and no both count.'],
    ],
  },
  brief: {
    story: 'The Nairobi manager wants to know how many of their customers subscribed, today, before anything is cleaned.',
    get: [GOT_SURVEY],
    want: ['In J2, the Nairobi rows whose answer is some kind of yes, however either was typed'],
    out: 'J2 shows one number.',
  },
},
};
