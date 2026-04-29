# The Sourdough Database

A recipe notebook for bakers — built to be obsessive, beautiful, and free to use.

🌐 **Live site:** https://sourdoughdatabase.com (after deploy)
📁 **Hosting:** Netlify (free tier)
🗄️ **Database (when needed):** Supabase (free tier)
🔧 **Stack:** Static HTML/CSS/JS — no build step yet

---

## Project structure

```
sourdoughdatabase/
├── index.html              # Homepage
├── 404.html                # Custom 404 page
├── netlify.toml            # Netlify config (security headers, caching)
├── robots.txt              # Search engine instructions
├── sitemap.xml             # Helps Google find your pages
├── .gitignore              # Files Git should ignore
├── README.md               # This file
└── assets/
    ├── css/
    │   └── styles.css      # Shared stylesheet — every page uses this
    ├── js/                 # JavaScript (when we add interactivity)
    ├── images/
    │   ├── favicon.svg     # Browser tab icon (modern browsers)
    │   ├── favicon.ico     # Browser tab icon (older browsers)
    │   ├── apple-touch-icon.png  # iOS home-screen icon
    │   └── og-image.png    # Social-share preview (1200×630)
    └── fonts/              # Self-hosted fonts (when we add them)
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

1. Edit a file (HTML in the root, CSS in `assets/css/styles.css`)
2. Save
3. Refresh your browser
4. When happy, commit and push (see "Deploying" below)

### Adding a new page

1. Copy `index.html` and rename it (e.g. `about.html`)
2. Update the `<title>` and `<meta description>`
3. Replace the `<body>` content with your new page content
4. Add the new URL to `sitemap.xml`
5. Commit and push — it goes live automatically

---

## Deploying

The project is connected to Netlify via Git. Every time you push to GitHub, Netlify automatically rebuilds and deploys the site within ~30 seconds.

**To deploy a change:**

```bash
git add .
git commit -m "what you changed"
git push
```

That's it. Watch the deploy in your Netlify dashboard.

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
- [ ] About page (mom story, longer-form)
- [ ] Hydration calculator (interactive tool)
- [ ] Individual starter detail pages
- [ ] Bake schedule builder
- [ ] User accounts + bake logs (this is when Supabase comes in)
- [ ] Crumb analyzer
- [ ] Trouble Atlas

---

## Help

If something breaks, your three best friends are:
1. **Browser DevTools** (right-click → Inspect)
2. **Netlify deploy logs** (in dashboard, when a deploy fails)
3. **Git status** (`git status` shows what's changed and what state you're in)
