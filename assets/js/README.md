# assets/js/ — vanilla scripts, no build step

Classic `<script>` tags sharing one global scope. No bundler, no modules, no
`import`/`export`. Each file wraps its work in an IIFE so nothing leaks.

## The files

| File | Loads on | Contains |
|---|---|---|
| `components.js` | every page (`defer`) | active-nav highlighting + the Learn/Tools dropdowns |
| `recipes.js` | `/recipes/` (`defer`) | faceted filtering of the recipe cards |
| `dough-lab-data.js` | `/recipes/build-your-own.html` (`defer`, **before** `dough-lab.js`) | the ingredient catalogue: every flour, liquid and add-in with its water/absorb figures, dose-aware guidance, and `ruinPct` ceiling. Adding an ingredient means editing this file only — every entry needs `blurb`, `band`, `low` and `high` |
| `dough-lab-tips.js` | `/recipes/build-your-own.html` (`defer`, **after** data, **before** the engine) | pure presentation: turns a catalogue entry plus numbers into tip HTML. Reads no page state, touches no DOM — safe to unit-test in node |
| `dough-lab.js` | `/recipes/build-your-own.html` (`defer`) | grams-native formula engine: state, arithmetic and DOM wiring. Copy lives in `-data`, tip rendering in `-tips`. **No timeline** — that lands in a shared `fermentation.js` |
| `schedule.js` | `tools/schedule.html` (`defer`) | bake schedule builder |
| `crumb-analyzer.js` | `tools/crumb-analyzer.html` (`defer`) | crumb reference tool |
| `hydration.js` | `tools/hydration.html` (`defer`) | hydration + baker's percentage calculators |
| `trouble-atlas.js` | `tools/trouble-atlas.html` (`defer`) | Atlas search and autocomplete |

`components.js` loads first on every page; page scripts follow. Deferred
scripts run in document order, so that ordering is guaranteed.

## Conventions

- **Target 200–600 lines per file; hard ceiling ~800 → split** at the next
  natural concern boundary, never mid-function. Don't split below ~100 lines
  without a reason.
- **No inline `<script>` block over ~50 lines.** Bigger than that moves here as
  `<page-name>.js` and loads with `defer`. Inline JS lives in the HTML
  document, which is served `max-age=0` — it is re-downloaded on every visit.
- **Load order is dependency order.** A file that reads a global defined
  elsewhere must load after it. References *inside* function bodies are fine
  either way, since they resolve at call time.
- Shared behavior goes in a shared file, not copy-pasted into two pages.
- **Update this table** whenever a file is added, split, or renamed.

## Inline JS is extracted

All four tool pages had large inline `<script>` blocks. They're now external
and deferred. The reason isn't page weight — it's caching: HTML is served
`max-age=0, must-revalidate`, so inline JS was re-downloaded on **every** visit
and could never be cached. As external files they cache like any other asset.

Keep it that way. The rule in `CLAUDE.md` is no inline `<script>` over ~50
lines; the GA4 snippet in `<head>` is the deliberate exception.

## Header and footer are real HTML now

They used to be written by `components.js` with `innerHTML`, which meant the
site's navigation didn't exist for any crawler that doesn't execute JavaScript.
They're now static markup inside `<div id="site-header">` / `<div
id="site-footer">` on all 36 pages, and `components.js` only adds the `active`
class to the current nav link.

The tradeoff: the nav and footer are duplicated 36 times. **Change them with a
scripted find-and-replace across every page**, never by editing one file and
hoping. A verification pass should assert that all 36 pages hash to a single
distinct header and a single distinct footer.

Don't reintroduce the old pattern for anything crawlable.
