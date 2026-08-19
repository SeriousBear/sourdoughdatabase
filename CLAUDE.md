# CLAUDE.md — working conventions for The Sourdough Database

Guidance for any AI session working in this repo. Read before editing.

Companion docs: `README.md` (setup + deploy), `assets/js/README.md` (JS module
map), `~/Desktop/Projects/webear-system.md` (cross-project brand, voice, and
Webear-wide conventions — this file wins where the two disagree).

---

## What this is

A static content site — no build step, no framework. Plain HTML, one shared
stylesheet, vanilla JS. Deployed on Netlify from GitHub; every push auto-deploys.

The site is a **reference library**, not an app. That makes organic search the
main way people arrive, so **SEO and page speed are functional requirements,
not polish.** Treat a page that ranks badly or loads slowly as broken.

```
/                        homepage
/about.html              the mom story
/pantry.html             affiliate gear picks
/flour-compendium.html   flour hub  → /flour/*.html      entries
/tools/trouble-atlas.html  problem hub → /atlas/*.html    problem pages
/tools/*.html            calculators (hydration, schedule, crumb analyzer)
/starters/*.html         named culture histories
/journal/*.html          long-form essays
/_template.html          starting point for a new page
/journal/_template-article.html  starting point for a new essay
```

---

## Guardrails

- **Repo is the source of truth** — read the current file before editing it.
  Don't reconstruct a page from memory or from an older chat.
- **Edit in place.** No zips, no pasted code blocks for Kyle to copy.
- **Don't run git commands** and don't touch `.git/` — Kyle commits and pushes
  via GitHub Desktop.
- **No real secrets in committed files** — placeholders only. The repo is
  public. Anything needing a key goes through a Netlify function.
- **Surgical, minimal edits.** Don't reformat, re-indent, or "tidy" code you
  weren't asked to touch. A diff should be readable.
- **Flag risky changes and manual steps** — deploys, DNS, cache headers,
  anything needing a browser check.

---

## File size & splitting

The whole point is that an edit should be cheap: a targeted read of one file,
not a 7,000-line scroll.

### CSS

`assets/css/styles.css` is currently ~7,000 lines and loads on **every** page.
It is over budget.

- **Target: no single stylesheet over ~1,500 lines.**
- Split by concern, loaded per-page:
  - `core.css` — `:root` tokens, reset, body/paper texture, typography,
    binding, header, footer, links, animations. Loads on every page.
  - Then one file per surface: `tools.css`, `flour.css`, `atlas.css`,
    `article.css`, `pantry.css`, `home.css`.
- A page loads `core.css` plus **only** the surfaces it uses.
- Keep the `/* ============ SECTION ============ */` headers. Clear seams let an
  edit target a span by grep instead of reading the whole file — that matters
  as much as raw size.

### JavaScript

- **No inline `<script>` blocks over ~50 lines.** Anything bigger moves to
  `assets/js/<page-name>.js` and loads with `defer`.
  Inline JS ships inside the HTML document, which is served
  `max-age=0, must-revalidate` — so it is re-downloaded on every visit and
  never cached. External JS is cached.
- **Target 200–600 lines per JS file; hard ceiling ~800 → split** at the next
  natural concern boundary, never mid-function.
- **Don't split below ~100 lines** without a reason — tiny files add load-order
  surface for little gain.
- Shared behavior used by more than one page belongs in a shared file
  (`components.js` or a new one), not copy-pasted.
- Vanilla JS in an IIFE. No frameworks, no bundler, no `import`/`export`
  (there's no build step — these are classic scripts sharing global scope).
- Update the table in `assets/js/README.md` whenever you add or split a file.

### HTML

- Pages over ~900 lines are usually carrying content that belongs in a data
  structure or a partial. Flag it rather than growing it further.

---

## Styling — tokens and classes, never hardcoded

- **No hardcoded design values.** Colors come from the `:root` tokens at the
  top of `styles.css`: `var(--paper)`, `var(--ink)`, `var(--pen-blue)`,
  `var(--pen-red)`, `var(--pencil)`, `var(--rule)`, `var(--tape)`. Never write
  a literal like `#a53020` or `color:#666` in a page or a new rule.
- **If a value repeats, it's a class**, in the appropriate stylesheet — not
  copy-pasted inline.
- **Inline `style` is only for genuinely dynamic per-element values** (a
  computed bar width, a chart fill). Even then, inject a CSS variable
  (`style="--w:62%"`) and read it in a class.
- Before adding a token or class, check whether one already exists. One source
  of truth.

---

## SEO — required on every new page

Copy `_template.html` (or `journal/_template-article.html`) rather than
hand-rolling a head. Every published page needs all of:

- [ ] Unique `<title>` — under ~60 chars, primary term first
- [ ] Unique `<meta name="description">` — 140–160 chars, written for a human
- [ ] `<link rel="canonical">` with the full absolute URL
- [ ] Open Graph: `og:type`, `og:url`, `og:title`, `og:description`,
      `og:image` (absolute URL, 1200×630)
- [ ] Twitter card: `summary_large_image`
- [ ] JSON-LD structured data — pick the right type:
      `Article` for journal entries, guides and procedures; `Recipe` for
      recipes; `CollectionPage` for hubs; `BreadcrumbList` on any page below
      the root; `WebApplication` for the calculators
      - **Don't use `HowTo` or `FAQPage` on new pages.** Google retired HowTo
        rich results in 2023 and removed FAQPage rich results in May 2026.
        Both are still valid markup that validators accept, but they earn zero
        search treatment — which makes them a trap, since everything looks
        fine. Use `Article` for step-by-step guides instead.
      - `tools/hydration.html` and `tools/schedule.html` still carry
        `FAQPage`. Leave them: removing it gains nothing and risks breaking
        working pages. Just don't add more.
- [ ] Exactly one `<h1>`, then a sane `h2`/`h3` outline — never skip levels
- [ ] Breadcrumb markup **and** a visible breadcrumb on sub-pages
- [ ] Descriptive `alt` on every image (what it shows, not "image of bread")
- [ ] Added to `sitemap.xml` with a real `lastmod`
- [ ] Internal links **in the body prose** to 2–3 related pages — hub → entry
      and entry → hub, both directions

**Don't hide content behind JS.** Header and footer are now real HTML in every
page (they used to be injected by `components.js` — that was fixed so crawlers
which don't run JS can see the navigation). Keep it that way: article text, FAQ
answers, tables, and links must all be in the served HTML.

---

## Performance rules

- **Nothing render-blocking that doesn't have to be.** Scripts get `defer`.
- **Images:** WebP (or AVIF) with a JPEG/PNG fallback, explicit `width` and
  `height` on every `<img>` to reserve layout space, `loading="lazy"` on
  anything below the fold, `fetchpriority="high"` on the LCP image only.
  Keep photographic assets under ~150 KB. Ship WebP next to the original and
  reference it through `<picture>` (or an `onerror` fallback where the tag is
  built in JS) — and **resize to the display box first**; re-encoding a
  1100px image that renders at 280px saves far less than resizing it does.
- **Fonts:** three Google families (Caveat, Crimson Pro, Special Elite),
  ~229 KB total, `display=swap`. Don't add a fourth.
  - **All 36 pages must request the identical URL.** It's the one in every
    `<head>` — copy it exactly. Three different variants had drifted in, which
    made the request impossible to change in one place.
  - **Don't pin discrete weights to "save bytes."** Measured August 2026:
    `Crimson+Pro:ital,wght@0,300..900;1,300..900` and the pinned
    `0,300;0,400;0,600;...` form download *the same files* — Google serves the
    variable font either way. Pinning buys nothing.
  - A font is only downloaded when a glyph on the page needs it, so an unused
    family costs nothing on pages that don't use it — and 14 KB on the ones
    that do. Kalam was removed for exactly this: two rules containing only
    `★` and spaces.
  - The real remaining win is self-hosted subsetted `woff2` (~229 KB → 70–90 KB).
    Not done; it trades a third-party dependency for a manual step on font
    changes.
- **Caching:** filenames aren't content-hashed, so nothing may be served
  `immutable`. `netlify.toml` gives CSS/JS `max-age=0, must-revalidate` (a
  ~200-byte 304 when unchanged) and images a week. Don't "optimize" that back
  to a long immutable cache unless a build step with hashed filenames lands
  first — that bug shipped once already.
- Budget for a new page: **under 100 KB** of HTML+CSS+JS transferred, LCP under
  2.5s on a mid-range phone.

---

## Adding a new page

1. Copy `_template.html` (or the journal template for essays).
2. Fill in the full SEO block above — title, description, canonical, OG,
   JSON-LD, breadcrumb.
3. Copy the `<div id="site-header">…</div>` and `<div id="site-footer">…</div>`
   blocks verbatim from any existing page — they are real markup now, not
   placeholders — and load `components.js` with `defer` before `</body>`.
4. If it needs a nav entry: the nav is **duplicated in all 36 pages** by
   design (no build step). Change it with a scripted find-and-replace across
   every page, never by hand in one file, and update the matching rule in
   `assets/js/components.js` (which now only sets the active class).
5. Add page-specific CSS to the right stylesheet, using existing tokens.
6. Add the URL to `sitemap.xml`.
7. Link to it from at least one hub page's body prose, and link back.

---

## Recipes

`/recipes/` is the hub; entries are `/recipes/<slug>.html`. Start from
`_template-recipe.html`, which covers both types.

### The copyright rule — not optional

- **A formula is a fact.** Ingredients, weights, percentages, times, and
  temperatures carry no copyright. Restating them is fine.
- **The writing is not.** Method prose, headnotes, and narrative are protected
  expression. Never reuse anyone's sentences, paraphrase closely, or "reword"
  their method. Write it from our own bake or don't publish it.
- **Credit is courtesy, not a licence.** Attribution prevents plagiarism; it
  does not make copying lawful. Adapted recipes get a visible `.rc-credit`
  block, an `isBasedOn` in the schema, and a real link to the original.

### Two types, one URL space

| | Original ("ours") | Adapted |
|---|---|---|
| Badge | `.rc-badge-original` | `.rc-badge-adapted` |
| Credit block | delete it | required, with real name + URL |
| `.rc-notes` | required — the long-form/opinion space | optional, keep short |
| Schema | `author` = Kyle Weber | plus `isBasedOn` |
| Hub card tag | `.rh-tag-ours` | `.rh-tag-adapted` |

Both live under `/recipes/` so the SEO consolidates. Don't split them into
separate directories.

### Every recipe must

- Carry full `Recipe` JSON-LD. **`image` must be a real photo of the finished
  bake, 1200px+** — Google shows no recipe rich result without one.
  `og-image.png` is a placeholder and will not earn a rich result.
- Give each step a unique `id="step-N"` matching the `url` on its `HowToStep`.
- Link out to at least one **Atlas** page at the point of failure, one
  **calculator**, and one **flour** entry. Cross-linking is the point of the
  library, not decoration — put the links where a baker would actually stumble.
- Be added to `sitemap.xml` and get a card on `/recipes/index.html` with the
  full `data-level`, `data-flour`, `data-form`, `data-time`, `data-origin`
  attribute set, or the filter will silently drop it.

### The hub filter

Cards are **real HTML**; `recipes.js` only shows and hides them. Never render
cards from JSON — that would repeat the header/footer mistake and hide the
library from crawlers. The filter bar is CSS-hidden until JS adds `.rh-ready`,
so a no-JS visitor sees every recipe and no dead controls.

## Starter School

`/starter-school/` is the hub; guides are `/starter-school/<slug>.html`. It
covers the *life of a starter* — creating, feeding, reviving, storing.

**Keep it separate from `/starters/`.** That directory is the Culture Index:
field reports on documented cultures (Carl Griffith 1847, Poilâne), explicitly
"not formulas". Two different jobs, two different intents. Don't merge them and
don't cross-post — link between them instead.

Guides reuse the `rc-` classes from the recipe pages (hero, glance, steps,
callouts, trouble table, notes, next-cards) rather than defining a parallel
namespace. The hub reuses `rh-`. If a guide needs something genuinely new, add
it to the `rc-` section rather than starting an `ss-` prefix.

## Techniques

`/techniques/` is the hub; entries are `/techniques/<slug>.html`. These cover
the *physical mechanics* — folds, shaping, scoring, autolyse, retard, steam.

**Recipes link here instead of re-explaining.** A recipe should describe what to
do at that step and link out for the full technique. That keeps recipes lean
and means a technique is explained once, well, in one place.

Three libraries, three intents — don't blur them:

| | Answers |
|---|---|
| `/techniques/` | "how do I do this move, and what is it for" |
| `/atlas/` | "it already went wrong, what caused it" |
| `/recipes/` | "make this specific thing" |

Entries reuse `rc-` classes; the hub reuses `rh-`.

### Photo slots

Technique pages carry placeholders where a photo should go. They are a
`<div class="rc-photo rc-photo-missing">` plus an HTML **comment** holding the
exact `<figure>` to paste in once the shot exists.

**Never leave a live `<img>` pointing at a photo that isn't there.** It fires a
404 on every page load, fills the console with errors, and costs a round trip.
`scripts/verify.py` will fail the build for it — that check earned its keep the
first time it ran against this page.

Shot specs and file naming live in the local photo guide outside the repo at
`~/Desktop/Projects/sourdough-photo-guide/`.

### Nav is full

Eight items is the ceiling for the current header. Techniques is reached from
the footer, the recipe hub, and contextual links inside recipes and Atlas
pages — not the top nav. Adding a ninth needs an IA change (grouping under a
"Learn" menu, or a hub-of-hubs landing page), not another `<a>`.

## Hub chrome is shared

`rh-` styles live in `styles.css`, not inline. They were inline in
`recipes/index.html` until Starter School needed the same cards; moved rather
than duplicated. Any future hub uses `rh-` too.

## scripts/sync-chrome.py — the only way to change the nav

    python3 scripts/sync-chrome.py            # apply
    python3 scripts/sync-chrome.py --check    # report drift, change nothing

`index.html` holds the one true copy of the header and footer. Edit the nav
**there**, run this, and all pages match. Indentation is preserved per file.

It also fills `<!--HEADER-->` and `<!--FOOTER-->` markers, so **write new pages
with those markers** and run sync-chrome instead of pasting chrome in by hand.

Three separate bugs in this repo came from pasting a cached copy of the header
into a new page and not noticing it was a nav item behind. There is now no
reason to ever paste it manually.

## scripts/verify.py — run it before every commit

    python3 scripts/verify.py

Checks tag balance, JSON-LD validity, Recipe schema completeness, step-id/URL
agreement, unfilled `[placeholders]`, internal link resolution, sitemap
coverage both ways, cache headers, single font URL, and — the one that matters
most here — that all pages share **one** header and **one** footer with the
same nav item count.

That last check exists because two hand-rolled versions of it silently passed
while two pages carried a stale nav. One matched a nested `</div>` and compared
only the first few lines; the other looked for a nav link with a substring that
also appears in a breadcrumb. **A check that can pass vacuously is worse than
no check** — it converts an unknown into a false certainty. If you add
assertions here, make sure each one fails when it finds nothing to inspect.

## Netlify Forms

Four forms exist: `newsletter` (on `index.html` and `about.html`), `contact`,
and `privacy-contact`. All POST to `/thanks.html`.

- Mark the form `data-netlify="true"` and `netlify-honeypot="bot-field"` —
  **not** `data-netlify-honeypot`. Only the un-prefixed spelling is in
  Netlify's docs; the `data-` variant is a widely-copied guess that silently
  does nothing, which means no spam protection.
- Include a hidden `<input type="hidden" name="form-name" value="...">` whose
  value exactly matches the form's `name`.
- Wrap the honeypot input in a hidden `<p>` (`class="privacy-form-honey"` or
  `style="display:none"`).
- **Netlify detects forms by parsing HTML at deploy time.** A new or renamed
  form does not exist in the dashboard until the next successful deploy — and
  a form removed from the HTML stops accepting submissions after one.
- Two forms sharing a `name` share one submission inbox. That's intentional for
  `newsletter`; give any genuinely separate form its own name.

## Verify before claiming done

There's no test suite yet, so verification is manual and non-negotiable:

- **Parse-check every HTML file touched** — unclosed tags in a static site fail
  silently in the browser.
- **JSON-LD must be valid JSON.** Parse it, don't eyeball it.
- **No broken internal links.** Every `href="/..."` must resolve to a file that
  exists — including links inside `components.js`, which appear on every page.
- **Sitemap matches reality** — every public page listed, no dead entries.
- **Say what needs a browser check** and what needs a deploy, explicitly.

Never report a change as done on the strength of having written it.

---

## Voice

Warm, wry, observational, never corporate. Field-guide-meets-recipe-card, on
paper stock, in pencil and pen. Brevity beats thoroughness. Full voice rules
live in `webear-system.md` — match it, don't reinvent it.

The starter is named Gary.
