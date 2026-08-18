# assets/js/ — vanilla scripts, no build step

Classic `<script>` tags sharing one global scope. No bundler, no modules, no
`import`/`export`. Each file wraps its work in an IIFE so nothing leaks.

## The files

| File | Loads on | Contains |
|---|---|---|
| `components.js` | every page (`defer`) | active-nav highlighting only |

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

## Pending extractions

These pages still carry large inline scripts and should move here:

| Page | Inline JS | Target file |
|---|---|---|
| `tools/schedule.html` | ~26 KB | `schedule.js` |
| `tools/crumb-analyzer.html` | ~13 KB | `crumb-analyzer.js` |
| `tools/hydration.html` | ~12 KB | `hydration.js` |
| `tools/trouble-atlas.html` | ~6 KB | `trouble-atlas.js` |

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
