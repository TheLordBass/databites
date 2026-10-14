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
let boots = 0;              // R's starts so far: a restart loses the Sandbox's space and its files
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

# The tables as loaded, and the options as set, put back before every run:
# code can reach the global environment (<<-, assign, rm, options), and one
# run's changes mustn't leak into the next, or into fresh().
.qc_pristine <- mget(ls(globalenv()), envir = globalenv())
.qc_options <- options()
.qc_reset <- function() {
  g <- globalenv()
  stray <- setdiff(ls(g), names(.qc_pristine))
  if (length(stray)) rm(list = stray, envir = g)
  for (n in names(.qc_pristine)) assign(n, .qc_pristine[[n]], envir = g)
  options(.qc_options)
  invisible(NULL)
}

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

# A value as practice shows it: a grid for a table with rows, text otherwise.
.qc_show <- function(x) paste(utils::capture.output(print(x)), collapse = "\n")
.qc_view <- function(x, label = NULL) {
  part <- if (is.null(label)) list() else list(label = label)
  if (is.data.frame(x) && nrow(x) > 0 && ncol(x) > 0) part$grid <- .qc_grid(x, utils::capture.output(print(x)))
  else part$text <- .qc_show(x)
  part
}

# What's wrong with an answer, by the problem's mode; NULL when it's right.
.qc_compare <- function(want, got, mode) {
  if (mode %in% c("frame", "frame_ordered")) return(.qc_problem(got, want, ordered = mode == "frame_ordered"))
  if (mode == "scalar") {
    if (is.data.frame(got) || length(got) != 1) return("That should be a single value.")
    if (is.numeric(want)) {
      if (!is.numeric(got) || is.na(got) || abs(got - want) > 1e-6)
        return(sprintf("Expected %s, got %s.", format(want), format(got)))
    } else if (!identical(as.character(got), as.character(want))) {
      return(sprintf("Expected %s, got %s.", format(want), format(got)))
    }
    return(NULL)
  }
  # vector: the same values, in the same order
  if (is.data.frame(got)) return("That should be a vector of values, not a table.")
  if (length(got) != length(want)) return(sprintf("There should be %d value%s. Yours has %d.", length(want), if (length(want) == 1) "" else "s", length(got)))
  if (!identical(.qc_key(got), .qc_key(want))) return("Right length, but some values differ.")
  NULL
}

# Practice: the learner's solution against the reference, case by case,
# with the same report shape Python's _judge gives the practice screen.
.qc_args <- function(args) {
  labels <- names(args)
  if (is.null(labels)) labels <- paste("arg", seq_along(args))
  list(input = paste(sprintf("%s =\n%s", labels, vapply(args, .qc_show, "")), collapse = "\n\n"),
       views = lapply(seq_along(args), function(k) .qc_view(args[[k]], labels[k])))
}
.qc_judge <- function(fn, ref, cases, mode = "frame", reveal = FALSE) {
  total <- length(cases)
  report <- list(ok = FALSE, passed = 0L, total = total, summary = "", case = NULL,
                 mode = if (reveal) "run" else "submit")
  if (!is.function(fn)) {
    report$summary <- "Define a function called solution: that's what gets tested."
    return(report)
  }
  for (i in seq_along(cases)) {
    args <- cases[[i]]
    label <- if (reveal) "Example" else sprintf("Test %d of %d", i, total)
    want <- do.call(ref, args)
    shown <- .qc_args(args)
    got <- tryCatch(do.call(fn, args), error = function(e) structure(list(msg = conditionMessage(e)), class = "qc_err"))
    if (inherits(got, "qc_err")) {
      report$summary <- sprintf("%s raised an error: %s", label, got$msg)
      report$case <- list(n = i, input = shown$input, expected = .qc_show(want), got = paste("Error:", got$msg),
                          inputView = shown$views, expectedView = list(.qc_view(want)))
      return(report)
    }
    problem <- .qc_compare(want, got, mode)
    if (!is.null(problem) || reveal)
      report$case <- list(n = i, input = shown$input, expected = .qc_show(want), got = .qc_show(got),
                          inputView = shown$views, expectedView = list(.qc_view(want)), gotView = list(.qc_view(got)))
    if (!is.null(problem)) {
      report$summary <- sprintf("%s failed. %s", label, problem)
      return(report)
    }
    report$passed <- report$passed + 1L
  }
  report$ok <- TRUE
  report$summary <- if (reveal) "Matches the expected output." else sprintf("All %d tests passed.", total)
  report
}
.qc_preview <- function(ref, args) {
  want <- do.call(ref, args)
  shown <- .qc_args(args)
  list(mode = "preview", input = shown$input, expected = .qc_show(want),
       inputView = shown$views, expectedView = list(.qc_view(want)))
}

# The Sandbox's space: variables stay put between runs, like a console. A
# lesson's run gets a new environment every time. Dot names, so .qc_reset
# leaves them be.
.qc_spaces <- new.env()
.qc_space <- function(space) {
  if (is.null(.qc_spaces[[space]])) assign(space, new.env(parent = globalenv()), envir = .qc_spaces)
  .qc_spaces[[space]]
}

# A CSV the learner picked, into a space as a tibble: the separator is the
# one the header line uses most, and text columns of ISO dates become dates,
# as the Python side does with the same file.
.qc_load <- function(space, name, text) {
  out <- tryCatch({
    head_line <- strsplit(text, "\n", fixed = TRUE)[[1]][1]
    seps <- c(",", ";", "\t", "|")
    counts <- vapply(seps, function(s) lengths(regmatches(head_line, gregexpr(s, head_line, fixed = TRUE))), 0)
    df <- utils::read.csv(text = text, sep = seps[which.max(counts)], check.names = FALSE,
                          stringsAsFactors = FALSE, na.strings = c("", "NA"))
    for (j in seq_along(df)) {
      x <- df[[j]]
      if (is.character(x) && any(!is.na(x)) && all(grepl("^[0-9]{4}-[0-9]{2}-[0-9]{2}$", x[!is.na(x)])))
        df[[j]] <- as.Date(x)
    }
    assign(name, dplyr::as_tibble(df), envir = .qc_space(space))
    list(ok = TRUE, name = name, rows = nrow(df))
  }, error = function(e) list(ok = FALSE, error = conditionMessage(e)))
  as.character(jsonlite::toJSON(out, auto_unbox = TRUE))
}

.qc_run <- function(code, check, space = "") {
  .qc_reset()
  env <- if (nzchar(space)) .qc_space(space) else new.env(parent = globalenv())
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
    if (is.call(ex) && is.name(ex[[1]]) && as.character(ex[[1]]) %in% c("<-", "=") && is.name(ex[[2]])) {
      name <- as.character(ex[[2]])
      val <- get(name, envir = env)
      txt <- utils::capture.output(print(val))
      if (length(txt) > 30) txt <- c(txt[1:30], "...")
      echo <- list(name = name, text = paste(txt, collapse = "\n"),
                   grid = if (is.data.frame(val)) .qc_grid(val, txt) else NULL)
    }
  }
  result <- NULL
  cenv <- NULL
  if (is.null(err) && nzchar(check)) {
    cenv <- new.env(parent = env)
    cenv$.out <- paste(out, collapse = "\n")
    cenv$.last <- last
    cenv$has <- function(name) exists(name, envir = env, inherits = FALSE)
    cenv$expect <- .qc_expect
    cenv$expect_table <- .qc_table
    cenv$out_has <- function(text) grepl(text, paste(out, collapse = "\n"), fixed = TRUE)
    cenv$fresh <- function(name) .qc_pristine[[name]]   # a table as loaded, before any changes
    cenv$.qc_judge <- .qc_judge                          # bound here, so code can't swap the judge
    cenv$.qc_preview <- .qc_preview
    result <- tryCatch({
      eval(parse(text = check, keep.source = FALSE), cenv)
      list(passed = TRUE, msg = "")
    }, qc_fail = function(e) list(passed = FALSE, msg = conditionMessage(e)),
       error = function(e) list(passed = FALSE, msg = paste0("I couldn't check that: ", conditionMessage(e))))
  }
  judge <- if (is.null(cenv)) NULL else get0("judge", envir = cenv, inherits = FALSE)
  as.character(jsonlite::toJSON(list(
    ok = is.null(err), stdout = paste(out, collapse = "\n"), error = if (is.null(err)) "" else err,
    grids = grids, check = result, echo = echo, judge = judge
  ), auto_unbox = TRUE, null = "null", na = "string", digits = NA))
}
`;

async function boot() {
  say('Fetching R…');
  await new Promise((resolve) => python.whenReady(resolve));
  const { WebR, ChannelType } = await import(`${WEBR}webr.mjs`);
  const w = new WebR({ channelType: ChannelType.PostMessage, baseUrl: WEBR, interactive: false });
  await w.init();
  try {
    await setUp(w);
  } catch (err) {
    try { w.close(); } catch { /* already gone */ }
    throw err;
  }
  webR = w;
  ready = true;
  boots += 1;
  say('');
  waiting.splice(0).forEach((fn) => fn());
}

async function setUp(w) {
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

async function runNow({ code, check, timeoutMs, space = '' }) {
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
    const work = shelter.captureR('.qc_run(.qc_code, .qc_check, .qc_space_name)', {
      env: { '.qc_code': code || '', '.qc_check': check || '', '.qc_space_name': space || '' },
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
      grids: res.grids || [], check: res.check || null, judge: res.judge || null,
      echo: res.echo || undefined,
    };
  } catch (err) {
    return { ok: false, stdout: '', images: [], check: null, judge: null, error: `R went wrong: ${err.message || err}` };
  } finally {
    clearTimeout(timer);
    Promise.resolve().then(() => shelter.purge()).catch(() => { /* closed with R */ });
  }
}

async function loadNow({ space, name, text }) {
  try {
    await start();
  } catch (err) {
    return { ok: false, error: `Couldn't start R: ${err.message || err}` };
  }
  const w = webR;
  const shelter = await new w.Shelter();
  try {
    const value = await shelter.evalR('.qc_load(.qc_space_name, .qc_name, .qc_text)', {
      env: { '.qc_space_name': space, '.qc_name': name, '.qc_text': text },
    });
    return JSON.parse((await value.toArray())[0]);
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  } finally {
    Promise.resolve().then(() => shelter.purge()).catch(() => { /* closed with R */ });
  }
}

export const rEngine = {
  get isReady() { return ready; },
  /** How many times R has started: the Sandbox reloads its files after a restart. */
  get boots() { return boots; },
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
  /** One run at a time, in order. Same shape back as python.run. A space
      (the Sandbox's) keeps its variables from one run to the next. */
  run(opts) {
    const next = queue.then(() => runNow(opts));
    queue = next.catch(() => {});
    return next;
  },
  /** A CSV's text into a space as a tibble called name: {ok, name, rows} or {ok: false, error}. */
  load(opts) {
    const next = queue.then(() => loadNow(opts));
    queue = next.catch(() => {});
    return next;
  },
};
