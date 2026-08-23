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

### CSS — edit `src/`, never `styles.css`

The source is **eight files** in `assets/css/src/`, concatenated in filename
order into the single `assets/css/styles.css` the site serves:

    00-base.css            tokens, reset, body, binding, header
    01-home.css            homepage sections, animations, 404
    02-page-furniture.css  prose, section labels/headings, shared page chrome
    03-article.css         about, starter detail, journal, privacy
    04-atlas.css           Trouble Atlas hub + problem pages
    05-calculators.css     the three tools, crumb analyzer, schedule builder
    06-flour-pantry.css    Flour Compendium entries, The Pantry
    07-recipes-hubs.css    rc- recipe pages, rh- hubs, nav dropdowns

    python3 scripts/build-css.py            # after any CSS edit
    python3 scripts/build-css.py --check    # is styles.css stale?

`styles.css` is generated and committed. **Never edit it directly** —
`scripts/verify.py` fails if it drifts from `src/`.

**Do not "optimise" this into per-page stylesheets.** It was attempted and
rejected on evidence, August 2026. This stylesheet's section boundaries do not
match page boundaries:

- The sitewide **mobile nav and footer rules** —
  `@media (max-width:640px){ .binding,.holes{display:none} .nav{...}
  .foot-grid{...} }` — sit inside the *TOOLS / CALCULATORS* section. Ship that
  only to tool pages and every other page loses its mobile layout.
- `.prose`, `.section-label`, `.section-heading`, `.opener` are defined in the
  *ABOUT PAGE* section and used by all 13 Atlas pages.
- 35 more classes live in one surface and are used by three.

The prize was ~15 KB gzipped on a first visit. Every one of those breakages
renders clean in a static checker — `verify.py` would have said all-green.
Revisit only after the shared furniture is extracted into its own layer.

- **Target: no source file over ~1,500 lines.** Split at a section boundary and
  add the new file to `src/` with the right number prefix.
- Keep the `/* ============ SECTION ============ */` headers. Clear seams let an
  edit target a span by grep instead of reading the whole file — that matters
  as much as raw size.

### JavaScript

- **No inline `<script>` blocks over ~50 lines.** Anything bigger moves to
  `assets/js/<page-name>.js` and loads with `defer`, after `components.js`.
  Inline JS ships inside the HTML document, which is served
  `max-age=0, must-revalidate` — so it is re-downloaded on every visit and
  never cached. External JS is cached. All four tool pages were extracted in
  August 2026; the GA4 snippet in `<head>` is the one deliberate exception.
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

### Nav — six top-level, two dropdowns

    start · recipes · learn ▾ · tools ▾ · the pantry · about

Every top-level destination is a **real page**, never a homepage anchor. Three
nav items used to point at `/#starters`, `/#tools` and `/#journal`, which meant
the Trouble Atlas and the calculators had no page to accumulate authority on.
`/tools/`, `/starters/` and `/journal/` are now real hubs.

Rules for the dropdowns:

- **Panel links are always in the DOM.** They're hidden with CSS, never absent.
  Crawlers read and follow them normally.
- **They work without JavaScript** — `:hover` and `:focus-within` open the
  panel, so keyboard and mouse users are fine with JS off. `components.js` adds
  click/tap toggling, which hover cannot do on touch screens.
- Panels are `position: static` under 640px, because an absolute panel
  overflows a wrapped nav.
- Adding a seventh top-level item means removing one. Six is the budget.

### Don't point navigation at homepage anchors

An anchor can't rank, can't be a canonical destination, and can't receive
internal links properly. If a section is worth a nav slot, it's worth a page.

## Trouble Atlas

`/atlas/<slug>.html`, hub at `/tools/trouble-atlas.html`. Fixed structure —
copy an existing entry rather than inventing a layout:

`problem-id` → `problem-title` → `problem-tagline` → `quick-stats` (4 items)
→ §01 symptom → `visual-block` (YouTube facade + hidden `own-photo` figure)
→ §02 `cause-list` **ranked by likelihood** → §03 `fix-steps` **ordered by
least effort first** → `quick-checklist` → `related-grid`.

**Adding an entry means three edits, not one.** Miss any and it's orphaned:

1. The page itself
2. A `problem-card` in the right `atlas-category` section on the hub — and bump
   that section's `cat-count`
3. An entry in the `PROBLEMS` array in the hub's inline JS, or it won't appear
   in search

Ranking causes by likelihood is the point of the format. "Most common" first,
exotic last. Where a symptom is commonly confused with a harmless one, lead
with what it *isn't* — `contamination.html` spends its first two causes on
hooch and dried crust because far more starters are thrown away by mistake
than are ever actually contaminated.

**Namespace caution:** atlas related-cards use `.rc-cat` and `.rc-name`, which
predate the recipe `rc-` namespace. They don't currently collide, but check
before adding any new `rc-` rule with a short suffix.

## Flour Compendium entries

`/flour/<slug>-flour.html`, ~730 lines, hub at `flour-compendium.html`.

Adding one touches **three** places: the page, a `fc-flour-card` on the hub
(plus the quick-reference table row), and the `flour-pill` strip that appears
on every sibling flour page — use a scripted replace for that last one.

**These pages carry a "Recommended Buy" card with a named brand and a Top Pick
badge.** That's a personal product endorsement tied to affiliate revenue.
**Never invent one.** If Kyle hasn't said what he recommends, leave the card as
a clearly-marked placeholder comment and tell him it needs filling — the same
rule as recipes he hasn't baked.

### The generated method on /recipes/build-your-own.html

§ 05 is written by `dough-lab-method.js` from whatever is on the bench, using
`fermentation.js` for the timings. Two rules:

- **The default method is pre-rendered into the served HTML.** A crawler and a
  no-JS reader must both get a complete, readable recipe — the section was
  briefly JS-only, which silently dropped ten steps of indexable content. If
  you change `DEFAULTS` in `dough-lab.js`, regenerate that static block by
  running `dough-lab-method.js` against the new defaults in node and pasting
  the result back into `#dl-steps`.
- **The method does not follow the bench live, on purpose.** A ten-step
  walkthrough rewriting itself mid-slider-drag is disorienting, and pressing
  the button is the moment the reader commits to a dough. `signature()`
  deliberately ignores changes too small to alter the method.
- **The bar has three states, and the button label follows them.** Untouched
  is `.is-default` — dashed and pencil-coloured, saying out loud that these
  steps are the Calibration Loaf and not something the reader asked for, with
  the button reading *Write my recipe*. After an edit it is `.is-stale` (red,
  *Update my recipe*), and after pressing it, plain blue. The static copy in
  the page must match the default branch of `refreshRegen()`, and **"start
  over" has to call `writeMethod()` as well as `render()`** — otherwise the bar
  claims the default while § 05 still shows the last dough.

`fermentation.js` is the one place fermentation timing may live. Both this page
and `tools/schedule.html` use it. The schedule builder held its own copy of the
same three tables until August 2026 and was silently hardcoded to white flour
at 20% starter, so the two tools disagreed by about 90 minutes on a rye dough.
**Never copy those tables into a page.** If a timing needs a new input, add it
to `speedFactor()` and both tools get it.

## One source of truth

The site has no build step, so nothing stops the same fact being written twice.
That is the failure mode to watch for — not file count. Splitting a file into
four is fine and often right; having two files that both claim to know how fast
rye ferments is not.

Two rounds of this have already been cleaned up:

- **Fermentation tables** — were in `schedule.js` and `fermentation.js`. Merged.
- **Four inline behaviours** — the YouTube facade was pasted into 10 Atlas
  entries, the scroll reveal into 3 flour pages, and the reading-progress bar
  and copy-link into 3 journal files. All four now live in `components.js`,
  each guarded so it no-ops when its markup is absent. Three Atlas pages
  carried `data-video-id` but had never been given the script — adding a real
  video ID to them would have silently done nothing.

Genuine one-offs stay inline and that is correct: the protein-bar animation on
`flour/white-bread-flour.html` and the starter-age line on `about.html` each
appear on exactly one page.

**Before pasting a `<script>` into a page, check whether a second page will
ever want it.** If yes, it belongs in `components.js` behind a markup guard.

### The featured slot

`/recipes/` has one `.rh-feature` block above the filter bar, currently
**Choose Your Own Crumb**. It sits **outside `#rh-grid` deliberately** —
`recipes.js` filters everything inside the grid, and the builder is relevant to
every filter. It was inside once; picking "rye" made it vanish. Anything that
should always be visible goes outside the grid, and the `rh-count` totals stay
correct because `recipes.js` counts `grid.querySelectorAll('.rh-card')`.

## Hub chrome is shared

`rh-` styles live in `styles.css`, not inline. They were inline in
`recipes/index.html` until Starter School needed the same cards; moved rather
than duplicated. Any future hub uses `rh-` too.

## Hubs

Every library has a real hub at a directory index: `/recipes/`, `/techniques/`,
`/starter-school/`, `/tools/`, `/starters/`, `/journal/`, plus
`/flour-compendium.html` (older, at the root).

Hubs use `rh-` classes from `styles.css`. A new hub is a head, a `.rh-hero`, an
intro paragraph that links sideways to the other libraries, and a `.rh-grid` of
`.rh-card`s. Cards are real HTML — never rendered from JSON.

Each hub's intro should point at its neighbours ("if you'd rather diagnose than
learn, that's the Atlas"). That cross-linking is what keeps the libraries from
reading as separate silos.

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

Five forms exist: `newsletter` (on `index.html` and `about.html`), `contact`,
`privacy-contact`, and `crumb-report` (the bake report-back at the foot of
`/recipes/build-your-own.html`). All POST to `/thanks.html`.

`crumb-report` carries a hidden `formula` field that `dough-lab.js` fills
with the reader's current bench state, so a submission arrives with the
actual recipe attached. With JS off it submits empty, which is fine.
Photo upload is not wired up yet — it needs `enctype="multipart/form-data"`
and a `file` input, and Netlify counts uploads against a separate quota.

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

### Every page is a landing page

Assume the reader arrived from a search result and has never seen another page
on this site. Most traffic here will be exactly that. So:

- **No insider references in instructional copy.** Kyle's starter is named Oso,
  and that name belongs on `about.html`, in Field Notes, and in the footer —
  places where it's introduced or is clearly Kyle talking about himself. In a
  recipe or a technique guide, write **"your starter"** or **"mine"**. A reader
  who hits `create-a-starter.html` from Google has no idea who Oso is, and a
  proper noun they can't resolve reads as a mistake.
- Same rule for any running joke, nickname, or callback that depends on having
  read something else. If it needs setup the page doesn't provide, cut it.
- **The voice is not the in-jokes.** Warm, wry and observational survives fine
  without them — it's carried by sentence rhythm and by being willing to say
  what's actually true. Keep the register; drop the references.
