/* Practice questions that ask the same thing in more than one language:
   each list is one situation, a question per language. A question's page
   offers its family ("Also in SQL · R"), so you can try it again in another
   language; each version keeps its own progress. Only questions that really
   ask the same thing belong together, even where the wording differs a
   little (one keeps every column, another only two). tests.html checks
   every id here is a real question. */

export const FAMILIES = [
  ['p01', 'r04'],                 // more than 40 cups
  ['p02', 'r01'],                 // rows per city
  ['p03', 'r02'],                 // average price, gaps left out
  ['p44', 'r12'],                 // above their own group's average
  ['s01', 'r03'],                 // drinks under 3.00
  ['s08', 'r11'],                 // totals by month
  ['p13', 's27'],                 // the second-highest price
  ['s02', 'x09'],                 // orders per customer
  ['s29', 'd13'],                 // big orders
  ['s32', 'd18'],                 // cancellation rate
  ['s52', 'd19'],                 // growth on the month before
  ['d05', 'x01'],                 // cancelled orders
  ['d11', 'x03'],                 // average rating, gaps left out
  // Data cleaning (cleaning.js)
  ['p05', 'c01', 'c02', 'c03'],   // one name per city
  ['c04', 'c05', 'c06', 'c07'],   // spend from text
  ['c08', 'c09', 'c10'],          // every kind of yes
  ['c11', 'c12', 'c13'],          // rows sent twice
  ['c14', 'c15'],                 // two date layouts
  ['c16', 'c17'],                 // shifts that break the rules
];

/** The other questions in this one's family, in the family's order. */
export const twinsOf = (id) => (FAMILIES.find((f) => f.includes(id)) || []).filter((x) => x !== id);
