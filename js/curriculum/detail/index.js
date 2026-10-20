/* Each lesson's fuller teaching, one file per course, merged into
   ALL_LESSONS as `detail` (curriculum/index.js). An entry, keyed by lesson id:

     explain  five or six plain-English points, in place of the lesson's
              three-bullet `concept` (which stays in the lesson's own file)
     example  a small worked example of the idea, never the task's answer:
                say    a sentence introducing it
                code   runs in the lesson's language, with its prelude and
                       setup; what it shows is worked out by expected.html
                       and built in (expected.js EXAMPLES), never typed in
                lines  [[a piece of the code, what it does], ...]
     brief    the task as a brief, like a practice question (ui.js
              briefBlock): { story, get, want, out, fine? }

   Written for someone who has never coded, like the lessons. tests.html
   checks every entry's shape, that it belongs to a real lesson, and that
   every example's result is built in and current. */

import { BASICS_DETAIL } from './basics.js';
import { PYTHON_DETAIL } from './python.js';
import { PANDAS_DETAIL } from './pandas.js';
import { SQL_DETAIL } from './sql.js';
import { EXCEL_DETAIL } from './excel.js';
import { MESSY_DETAIL } from './messy.js';
import { WRANGLING_DETAIL } from './wrangling.js';
import { MATPLOTLIB_DETAIL } from './matplotlib.js';

export const DETAIL = {
  ...BASICS_DETAIL,
  ...PYTHON_DETAIL,
  ...PANDAS_DETAIL,
  ...SQL_DETAIL,
  ...EXCEL_DETAIL,
  ...MESSY_DETAIL,
  ...WRANGLING_DETAIL,
  ...MATPLOTLIB_DETAIL,
};
