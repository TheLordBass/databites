/* R, for the R course (js/curriculum/r.js): webR, which is R compiled to
   WebAssembly the way Pyodide is Python, running in a worker of its own.

   Nothing here loads until an R lesson needs it: the first one fetches R
   (about 12 MB, kept by the service worker after that), installs dplyr, and
   reads in the shared tables. Those come from the Python side as CSV
   (_export_frames in worker.js), so R's cafe is the very cafe the pandas
   lessons use, with the same dates and missing values.

   A run is R code evaluated one top-level expression at a time in a fresh
   environment (.qc_run, below), the way a console would: a value left
   showing is printed, a table is drawn as a grid too (the same grids
   pandas and SQL get), and a check written in R reads the result.
   GitHub Pages can't send the headers webR's fastest channel needs, so it
   talks by postMessage; a run can't be interrupted that way, so one that
   overruns gets R closed and started again, as Python does. */

import { python } from './python.js';
import { PRELUDE } from './curriculum/prelude.js';

const WEBR = 'https://webr.r-wasm.org/v0.6.0/';
const PACKAGES = ['dplyr', 'jsonlite'];

let webR = null;
let booting = null;
let ready = false;
let queue = Promise.resolve();
const waiting = [];
const listeners = new Set();

const say = (text) => listeners.forEach((fn) => fn(text));

/* The helpers every run and check uses. Dot names, so ls() doesn't show them. */
const SETUP = String.raw`
suppressPackageStartupMessages(library(dplyr, warn.conflicts = FALSE))
options(dplyr.summarise.inform = FALSE, width = 100, cli.num_colors = 1,
        crayon.enabled = FALSE, tibble.print_min = 10, tibble.print_max = 10,
        warn = 1, digits = 7)

local({
  meta <- jsonlite::fromJSON(.qc_meta, simplifyVector = FALSE)
  for (t in meta) {
    df <- utils::read.csv(file.path("/qc", paste0(t$name, ".csv")), stringsAsFactors = FALSE,
                          check.names = FALSE, na.strings = c("", "NA"))
    names(df) <- unlist(t$cols)        # by position: some names (survey's) are messy on purpose
    for (j in seq_along(df)) {
      x <- df[[j]]
      df[[j]] <- switch(t$kinds[[j]],
        date = as.Date(x),
        datetime = as.POSIXct(x, tz = "UTC"),
        bool = as.logical(x),
        int = as.integer(x),
        num = as.numeric(x),
        as.character(x))
    }
    assign(t$name, dplyr::as_tibble(df), envir = globalenv())
  }
})
rm(.qc_meta, envir = globalenv())

# A failed check: its message is what the learner reads.
.qc_fail <- function(msg) stop(structure(class = c("qc_fail", "error", "condition"),
                                         list(message = msg, call = NULL)))
.qc_expect <- function(cond, msg) if (!isTRUE(cond)) .qc_fail(msg) else invisible(TRUE)

# Values as text for comparing: dates as dates, numbers to 6 places, NA as NA.
.qc_key <- function(x) {
  if (is.factor(x)) x <- as.character(x)
  if (inherits(x, "Date") || inherits(x, "POSIXt")) x <- format(x)
  if (is.numeric(x)) x <- ifelse(is.na(x), NA, format(round(x, 6), scientific = FALSE, trim = TRUE, drop0trailing = TRUE))
  x <- as.character(x)
  x[is.na(x)] <- "NA"
  x
}

# What's wrong with a table, compared with the one wanted; NULL when nothing is.
.qc_problem <- function(got, want, ordered = FALSE) {
  if (!is.data.frame(got)) return("That should be a table (a data frame), not a single value or a column.")
  g <- as.data.frame(got)
  w <- as.data.frame(want)
  if (!setequal(tolower(names(g)), tolower(names(w))))
    return(sprintf("The columns should be %s. Yours are %s.", paste(names(w), collapse = ", "),
                   if (ncol(g)) paste(names(g), collapse = ", ") else "none"))
  names(g) <- tolower(names(g))
  names(w) <- tolower(names(w))
  g <- g[names(w)]
  if (nrow(g) != nrow(w))
    return(sprintf("There should be %d row%s. Yours has %d.", nrow(w), if (nrow(w) == 1) "" else "s", nrow(g)))
  rows <- function(d) if (!nrow(d)) character() else do.call(paste, c(lapply(d, .qc_key), sep = "\r"))
  rg <- rows(g)
  rw <- rows(w)
  if (ordered && identical(rg, rw)) return(NULL)
  if (!ordered && identical(sort(rg), sort(rw))) return(NULL)
  if (ordered && identical(sort(rg), sort(rw))) return("Right rows, wrong order. Check the arrange().")
  "Right shape, but some values differ. Check the conditions and the rounding."
}
.qc_table <- function(got, want, ordered = FALSE) {
  p <- .qc_problem(got, want, ordered)
  if (!is.null(p)) .qc_fail(p)
  invisible(TRUE)
}

# A table drawn as a grid: the same shape ui.frameGrid draws for pandas and SQL.
.qc_grid <- function(df, txt, limit = 10) {
  n <- nrow(df)
  k <- min(n, limit)
  part <- as.data.frame(df[seq_len(k), , drop = FALSE])
  cols <- lapply(part, function(x) {
    v <- if (inherits(x, "Date") || inherits(x, "POSIXt")) format(x)
         else if (is.numeric(x)) format(x, trim = TRUE)
         else as.character(x)
    v[is.na(x)] <- "NA"
    v
  })
  m <- ncol(df)
  shown <- if (k < n) sprintf("first %d of %d rows", k, n) else sprintf("%d row%s", n, if (n == 1) "" else "s")
  list(header = I(names(df)), index = I(as.character(seq_len(k))), indexName = "",
       rows = lapply(seq_len(k), function(i) I(vapply(cols, function(col) col[i], ""))),
       num = I(vapply(df, is.numeric, TRUE)), gapRow = NULL, gapCol = NULL, sql = TRUE,
       shown = paste0(shown, sprintf(" × %d column%s", m, if (m == 1) "" else "s")),
       note = NULL, text = paste(txt, collapse = "\n"))
}

# An error, in plain words, with a tip for the usual suspects.
.qc_error <- function(e) {
  msg <- conditionMessage(e)
  # dplyr wraps the real problem: "In argument: cupz > 45. Caused by error: ! object ...".
  # Keep the problem, and say where it happened in brackets.
  if (grepl("Caused by error", msg, fixed = TRUE)) {
    inner <- sub("(?s).*Caused by error[^\n]*\n! ?", "", msg, perl = TRUE)
    arg <- regmatches(msg, regexpr("In argument: [^\n]*", msg))
    msg <- paste0(inner, if (length(arg)) paste0(" (in ", sub("[.]$", "", sub("^In argument: ", "", arg)), ")") else "")
  }
  msg <- gsub("(^|\n)[!ℹx] ", "\\1", msg)
  tip <- if (grepl("object '[^']*' not found", msg))
    "Tip: check the spelling, capitals included. To R, Cups and cups are different names."
  else if (grepl("could not find function", msg))
    "Tip: check the function's name. dplyr's (filter, mutate, summarise...) are already loaded."
  else if (grepl("non-numeric argument", msg))
    "Tip: that sum needs numbers. Is one of the columns text?"
  else ""
  paste0("Error: ", msg, if (nzchar(tip)) paste0("\n", tip) else "")
}
.qc_parse_error <- function(e) {
  msg <- conditionMessage(e)
  line <- regmatches(msg, regexpr("^<text>:[0-9]+", msg))
  where <- if (length(line)) paste0(" on line ", sub("<text>:", "", line)) else ""
  what <- sub("^<text>:[0-9]+:[0-9]+: ", "", strsplit(msg, "\n")[[1]][1])
  paste0("Error: R couldn't read your code", where, ": ", what, ".\n",
         "Tip: look for a missing comma, bracket or quote mark there, or on the line before.")
}

.qc_run <- function(code, check) {
  env <- new.env(parent = globalenv())
  out <- character()
  grids <- list()
  err <- NULL
  last <- NULL
  echo <- NULL
  emit <- function(txt) out <<- c(out, txt)
  one <- function(ex) withCallingHandlers(withVisible(eval(ex, env)),
    warning = function(w) { emit(paste("Warning:", conditionMessage(w))); invokeRestart("muffleWarning") },
    message = function(m) { emit(sub("\n$", "", conditionMessage(m))); invokeRestart("muffleMessage") })
  exprs <- tryCatch(parse(text = code, keep.source = FALSE), error = function(e) { err <<- .qc_parse_error(e); NULL })
  shown <- FALSE
  for (ex in as.list(exprs)) {
    r <- NULL
    printed <- utils::capture.output(r <- tryCatch(one(ex), error = function(e) { err <<- .qc_error(e); NULL }))
    emit(printed)
    if (!is.null(err)) break
    last <- r$value
    shown <- length(printed) > 0
    if (isTRUE(r$visible)) {
      txt <- tryCatch(utils::capture.output(print(r$value)), error = function(e) paste("Error:", conditionMessage(e)))
      emit(txt)
      shown <- TRUE
      if (is.data.frame(r$value) && length(grids) < 12) grids[[length(grids) + 1]] <- .qc_grid(r$value, txt)
    }
  }
  # Code that ends by storing something shows what it stored: busy <- filter(...)
  # prints nothing, and a right answer shouldn't come back looking empty.
  if (is.null(err) && length(exprs) && !shown) {
    ex <- exprs[[length(exprs)]]
    if (is.call(ex) && as.character(ex[[1]]) %in% c("<-", "=") && is.name(ex[[2]])) {
      name <- as.character(ex[[2]])
      val <- get(name, envir = env)
      txt <- utils::capture.output(print(val))
      if (length(txt) > 30) txt <- c(txt[1:30], "...")
      echo <- list(name = name, text = paste(txt, collapse = "\n"),
                   grid = if (is.data.frame(val)) .qc_grid(val, txt) else NULL)
    }
  }
  result <- NULL
  if (is.null(err) && nzchar(check)) {
    cenv <- new.env(parent = env)
    cenv$.out <- paste(out, collapse = "\n")
    cenv$.last <- last
    cenv$has <- function(name) exists(name, envir = env, inherits = FALSE)
    cenv$expect <- .qc_expect
    cenv$expect_table <- .qc_table
    cenv$out_has <- function(text) grepl(text, paste(out, collapse = "\n"), fixed = TRUE)
    cenv$fresh <- function(name) get(name, envir = globalenv())   # a table as loaded, before any changes
    result <- tryCatch({
      eval(parse(text = check, keep.source = FALSE), cenv)
      list(passed = TRUE, msg = "")
    }, qc_fail = function(e) list(passed = FALSE, msg = conditionMessage(e)),
       error = function(e) list(passed = FALSE, msg = paste0("I couldn't check that: ", conditionMessage(e))))
  }
  as.character(jsonlite::toJSON(list(
    ok = is.null(err), stdout = paste(out, collapse = "\n"), error = if (is.null(err)) "" else err,
    grids = grids, check = result, echo = echo
  ), auto_unbox = TRUE, null = "null", na = "string", digits = NA))
}
`;

async function boot() {
  say('Fetching R…');
  await new Promise((resolve) => python.whenReady(resolve));
  const { WebR, ChannelType } = await import(`${WEBR}webr.mjs`);
  const w = new WebR({ channelType: ChannelType.PostMessage, baseUrl: WEBR, interactive: false });
  await w.init();
  say('Installing dplyr…');
  await w.evalRVoid(`webr::install(c(${PACKAGES.map((p) => `"${p}"`).join(', ')}), quiet = TRUE)`);
  say('Setting the tables…');
  const data = await python.exportFrames(PRELUDE);
  if (!data || !data.ok) throw new Error((data && data.error) || "Couldn't get the tables from Python.");
  await w.FS.mkdir('/qc');
  for (const f of data.frames) await w.FS.writeFile(`/qc/${f.name}.csv`, new TextEncoder().encode(f.csv));
  const meta = JSON.stringify(data.frames.map((f) => ({ name: f.name, cols: f.cols, kinds: f.cols.map((c) => f.kinds[c]) })));
  await w.evalRVoid(`.qc_meta <- ${JSON.stringify(meta)}`);
  await w.evalRVoid(SETUP);
  webR = w;
  ready = true;
  say('');
  waiting.splice(0).forEach((fn) => fn());
}

function start() {
  if (!booting) {
    booting = boot().catch((err) => {
      booting = null;
      throw err;
    });
  }
  return booting;
}

// Charts come back as bitmaps; the lesson screens show PNGs, as they do for matplotlib.
async function png(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const g = canvas.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, bitmap.width, bitmap.height);
  g.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}

async function runNow({ code, check, timeoutMs }) {
  try {
    await start();
  } catch (err) {
    return { ok: false, stdout: '', images: [], check: null, judge: null, downloadFailed: true,
      error: `Couldn't start R: ${err.message || err}\nCheck your connection and run it again. It only downloads once.` };
  }
  const w = webR;
  const shelter = await new w.Shelter();
  let timer = null;
  try {
    const work = shelter.captureR('.qc_run(.qc_code, .qc_check)', {
      env: { '.qc_code': code || '', '.qc_check': check || '' },
      captureStreams: true, captureConditions: false, withAutoprint: false,
      captureGraphics: { width: 640, height: 400 },
    });
    const over = new Promise((resolve) => {
      if (timeoutMs) timer = setTimeout(() => resolve(null), timeoutMs);
    });
    const cap = await Promise.race([work, over]);
    if (!cap) {
      // No interrupting over postMessage: close R and start afresh on the next run.
      webR = null;
      ready = false;
      booting = null;
      try { w.close(); } catch { /* already gone */ }
      return { ok: false, timedOut: true, stdout: '', images: [], check: null, judge: null,
        error: `Still running after ${Math.round(timeoutMs / 1000)} seconds, so it was stopped.\nR is restarting itself - give it a moment.` };
    }
    const raw = (await cap.result.toArray())[0];
    const res = JSON.parse(raw);
    const images = [];
    for (const bitmap of cap.images || []) images.push(await png(bitmap));
    return {
      ok: res.ok, stdout: res.stdout || '', error: res.error || '', images,
      grids: res.grids || [], check: res.check || null, judge: null,
      echo: res.echo || undefined,
    };
  } catch (err) {
    return { ok: false, stdout: '', images: [], check: null, judge: null, error: `R went wrong: ${err.message || err}` };
  } finally {
    clearTimeout(timer);
    try { shelter.purge(); } catch { /* closed with R */ }
  }
}

export const rEngine = {
  get isReady() { return ready; },
  /** Start loading R now, if it isn't already: an R lesson calls this when it opens. */
  warm() { return start().catch(() => {}); },
  whenReady(fn) {
    if (ready) fn();
    else waiting.push(fn);
  },
  /** Loading progress, for the Run button while R comes in. */
  onStatus(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** One run at a time, in order. Same shape back as python.run. */
  run(opts) {
    const next = queue.then(() => runNow(opts));
    queue = next.catch(() => {});
    return next;
  },
};
