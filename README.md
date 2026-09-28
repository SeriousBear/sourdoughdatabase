# The Sourdough Database

A recipe notebook for bakers — built to be obsessive, beautiful, and free to use.

🌐 **Live site:** https://sourdoughdatabase.com
🤖 **Working conventions:** see `CLAUDE.md` — read it before editing anything
📁 **Hosting:** Netlify (free tier)
🗄️ **Database (when needed):** Supabase (free tier)
🔧 **Stack:** Static HTML/CSS/JS — no build step yet

---

## Project structure

```
sourdoughdatabase/
├── index.html              # Homepage
├── about.html              # The mom story
├── pantry.html             # Affiliate gear picks
├── flour-compendium.html   # Flour hub
├── privacy.html            # Privacy policy
├── thanks.html             # Form success page
├── 404.html                # Custom 404 page
├── _template.html          # Starting point for a new page
├── flour/                  # Flour entries (7 pages)
├── atlas/                  # Trouble Atlas problem pages (10 pages)
├── tools/                  # Calculators + Trouble Atlas hub
├── starters/               # Named culture histories (3 pages)
├── journal/                # Long-form essays + article template
├── netlify.toml            # Netlify config (security headers, caching)
├── robots.txt              # Search engine instructions
├── sitemap.xml             # Helps Google find your pages
├── CLAUDE.md               # Conventions for AI sessions in this repo
├── README.md               # This file
└── assets/
    ├── css/
    │   └── styles.css      # Shared stylesheet — every page uses this
    ├── js/
    │   ├── components.js   # Shared header + footer + active nav
    │   └── README.md       # JS module map and conventions
    └── images/
        ├── favicon.svg     # Browser tab icon (modern browsers)
        ├── favicon.ico     # Browser tab icon (older browsers)
        ├── apple-touch-icon.png  # iOS home-screen icon
        ├── og-image.png    # Social-share preview (1200×630)
        ├── mom-sourdough.jpg
        └── crumb/          # Crumb analyzer reference photos
```

---

## How to run this locally

You don't need anything fancy. Just open `index.html` in your browser.

For a slightly nicer dev experience (auto-reload on save), if you have Node.js installed:

```bash
npx serve .
```

That spins up a local server at `http://localhost:3000`.

---

## How to make changes

1. Edit a file — HTML in the root, **CSS in `assets/css/src/`** (never
   `styles.css`; that file is generated)
2. Run the three generators, in this order:

       python3 scripts/build-css.py       # rebuild styles.css from src/
       python3 scripts/sync-chrome.py     # push header/footer to every page
       python3 scripts/build-index.py     # refresh the homepage Index counts

3. Check it: `python3 scripts/verify.py` — it fails if any of the above was
   skipped
4. Refresh your browser
5. When happy, commit and push (see "Deploying" below)

**Don't skip step 2.** `verify.py` fails if any of it was missed.

Cache-busting is **not** in that list any more. Netlify runs `stamp-assets.py`
at deploy instead (see `netlify.toml`), so the stamps never get committed.
Doing it locally meant a one-line CSS edit produced a 68-file commit.

### Adding a new page

1. Copy `_template.html` and rename it
2. Fill in the full SEO block — title, description, canonical, OG, JSON-LD
3. Write the `<body>` content
4. Add the new URL to `sitemap.xml`
5. Link to it from a hub page, and link back
6. Commit and push — it goes live automatically

The full checklist lives in `CLAUDE.md`.

---

## Deploying

The project is connected to Netlify via Git. Every time you push to GitHub, Netlify automatically rebuilds and deploys the site within ~30 seconds.

**To deploy a change:** commit and push in GitHub Desktop. That's it — watch
the deploy in your Netlify dashboard.

Commit messages use the imperative mood: "Add einkorn flour entry," not
"Added einkorn flour entry." Short and specific enough that future-you
understands the change six months from now.

---

## The newsletter form

The email signup on the homepage uses **Netlify Forms** (free). Submissions appear in your Netlify dashboard under **Forms → newsletter**.

You can hook it up to send notification emails to yourself from Netlify's settings.

---

## When you're ready for Supabase

Supabase isn't connected yet because the site is still static. Add it when you build the first feature that needs a database:

- User accounts and login
- Bake logs that save and persist
- Comments on starters
- Anything that needs to remember data between visits

Setup is straightforward:
1. Create a Supabase project at https://supabase.com
2. Add your Supabase URL and anon key to a `.env` file (NEVER commit this)
3. Add the same as environment variables in Netlify dashboard
4. Use the JavaScript client: `import { createClient } from '@supabase/supabase-js'`

---

## Brand & design tokens

Defined as CSS variables at the top of `assets/css/styles.css`:

| Variable               | Value      | Use                                  |
| ---------------------- | ---------- | ------------------------------------ |
| `--paper`              | `#f4ead0`  | Main background                      |
| `--paper-warm`         | `#efe1bd`  | Slightly darker paper sections       |
| `--ink`                | `#2a1f14`  | Primary text                         |
| `--ink-soft`           | `#4a3a28`  | Secondary text                       |
| `--pencil`             | `#5c4a36`  | Tertiary text, captions              |
| `--pen-blue`           | `#2a4774`  | Annotations, links                   |
| `--pen-red`            | `#a53020`  | Accents, important callouts          |
| `--rule-pink-strong`   | `#c47878`  | Margin lines, rule lines             |

**Fonts:**
- Headlines & handwriting: **Caveat** (Google Fonts)
- Typewriter / data: **Special Elite** (Google Fonts)
- Body text: **Crimson Pro** (Google Fonts)
- Margin notes: **Kalam** (Google Fonts)

---

## Roadmap (rough)

- [x] Homepage
- [x] Deployment via Netlify + Git
- [x] About page (mom story, longer-form)
- [x] Hydration calculator
- [x] Individual starter detail pages
- [x] Bake schedule builder
- [x] Crumb analyzer
- [x] Trouble Atlas (hub + 10 problem pages)
- [x] Flour Compendium (hub + 7 entries)
- [x] The Pantry (affiliate picks)
- [x] Field Notes (journal)
- [ ] Split `styles.css` and extract inline tool JS
- [ ] Recipe library with `Recipe` structured data
- [ ] Ask-anything sourdough chatbot
- [ ] User accounts + bake logs (this is when Supabase comes in)

---

## Help

If something breaks, your three best friends are:
1. **Browser DevTools** (right-click → Inspect)
2. **Netlify deploy logs** (in dashboard, when a deploy fails)
3. **Git status** (`git status` shows what's changed and what state you're in)
