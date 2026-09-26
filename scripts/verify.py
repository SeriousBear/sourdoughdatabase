#!/usr/bin/env python3
"""
verify.py — invariant checks for The Sourdough Database.

Run from the repo root:   python3 scripts/verify.py
Exits non-zero if anything fails, so it can gate a commit.

This exists because ad-hoc verification lied twice: a regex that matched a
nested </div> reported "one header everywhere" while two pages had a stale
nav, and a substring check matched a breadcrumb link instead of the nav link.
A check you can't trust is worse than no check. Every assertion here is
written to fail loudly rather than pass vacuously — note the "found nothing
to check" guards.
"""
import re, sys, json, glob, hashlib, collections, os
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param',
        'source','track','wbr','path','line','circle','ellipse','rect','text',
        'polygon','use','stop'}

fails = []
def check(ok, label, detail=''):
    print(("  PASS  " if ok else "  FAIL  ") + label + (("  — " + str(detail)) if detail else ''))
    if not ok: fails.append(label)

def pages():
    return sorted(glob.glob('**/*.html', recursive=True))

# ── header / footer, at any indentation ──────────────────────────────
def block(s, wid):
    m = re.search(r'^([ \t]*)<div id="%s">\n' % wid, s, re.M)
    if not m: return None
    close = re.compile(r'^%s</div>' % re.escape(m.group(1)), re.M)
    c = close.search(s, m.end())
    return s[m.end():c.start()] if c else None

def norm(x): return re.sub(r'\s+', ' ', x or '').strip()

def check_chrome(files):
    hs, fs, missing = collections.defaultdict(list), collections.defaultdict(list), []
    for f in files:
        s = open(f, encoding='utf-8').read()
        h, ft = block(s, 'site-header'), block(s, 'site-footer')
        if h is None or ft is None: missing.append(f); continue
        hs[hashlib.md5(norm(h).encode()).hexdigest()].append(f)
        fs[hashlib.md5(norm(ft).encode()).hexdigest()].append(f)
    check(not missing, "every page has a header and footer block", missing[:5])
    check(len(hs) == 1, "one distinct header across all pages",
          {k[:8]: len(v) for k, v in hs.items()} if len(hs) != 1 else '')
    check(len(fs) == 1, "one distinct footer across all pages",
          {k[:8]: len(v) for k, v in fs.items()} if len(fs) != 1 else '')
    # nav counted INSIDE <nav> only — a breadcrumb link must never satisfy this
    counts = collections.Counter()
    for f in files:
        s = open(f, encoding='utf-8').read()
        nv = re.search(r'<nav class="nav">(.*?)</nav>', s, re.S)
        counts[len(re.findall(r'<a ', nv.group(1))) if nv else -1] += 1
    check(len(counts) == 1 and -1 not in counts, "every nav has the same item count", dict(counts))

# ── html well-formedness ─────────────────────────────────────────────
class P(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.stack=[]; s.err=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.stack.append(t)
    def handle_endtag(s,t):
        if t in VOID: return
        if t in s.stack:
            while s.stack and s.stack.pop() != t: pass
        else: s.err.append(t)

def check_parse(files):
    bad = []
    for f in files:
        p = P()
        try: p.feed(open(f, encoding='utf-8').read())
        except Exception as e: bad.append((f, str(e)[:40])); continue
        if p.err or p.stack: bad.append((f, "stray=%s unclosed=%s" % (p.err[:2], p.stack[:2])))
    check(not bad, "all pages parse with balanced tags", bad[:4])

# ── structured data ──────────────────────────────────────────────────
def check_schema(files):
    total = bad = 0
    recipes = []
    for f in files:
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
            total += 1
            try: d = json.loads(m.group(1))
            except Exception as e: bad += 1; print("        invalid JSON-LD in %s: %s" % (f, str(e)[:50])); continue
            if d.get('@type') == 'Recipe' and '_template' not in f:
                recipes.append((f, d, s))
    check(total > 0, "found JSON-LD to check", total)
    check(bad == 0, "all JSON-LD parses", "%d invalid" % bad)
    req = ['name','description','image','author','recipeIngredient','recipeInstructions','datePublished']
    for f, d, s in recipes:
        miss = [k for k in req if not d.get(k)]
        check(not miss, "Recipe schema complete: %s" % f, miss)
        ids = set(re.findall(r'id="(step-\d+)"', s))
        urls = {u.split('#')[-1] for st in d.get('recipeInstructions', []) for u in [st.get('url','')] if '#' in u}
        check(urls and urls <= ids, "step ids match HowToStep urls: %s" % f, sorted(urls - ids))
        ph = [k for k, v in d.items() if isinstance(v, str) and v.startswith('[')]
        check(not ph, "no unfilled [placeholders] in schema: %s" % f, ph)

# ── links ────────────────────────────────────────────────────────────
def urlset(files):
    known = {'/' + f for f in files} | {'/'}
    for f in files:
        if os.path.basename(f) == 'index.html':
            d = os.path.dirname(f)
            known.add('/' + d + '/' if d else '/')     # '' -> '/', not '//'
    return known

# Atlas problem pages ship a hidden <figure class="own-photo" style="display:none">
# placeholder pointing at a photo Kyle hasn't taken yet. It is never rendered or
# requested, so it is not a broken link. Strip hidden figures before scanning.
HIDDEN = re.compile(r'<figure[^>]*style="display:none;?"[^>]*>.*?</figure>', re.S)
# Commented-out markup (e.g. the photo slots on /techniques/) is not a live
# reference and must not be scanned — the browser never requests it.
COMMENT = re.compile(r'<!--.*?-->', re.S)

def check_links(files):
    known = urlset(files)
    miss = collections.defaultdict(set)
    for f in files:
        if '_template' in f: continue          # templates hold deliberate placeholders
        s = COMMENT.sub('', HIDDEN.sub('', open(f, encoding='utf-8').read()))
        # Strip the ?v=<hash> cache-busting stamp before resolving. Without
        # this the regex simply wouldn't match a stamped reference, so every
        # stamped asset would silently drop out of the check — the vacuous-pass
        # failure mode this file exists to prevent.
        refs = re.findall(r'href="(/[^"#\s]*)"', s) + re.findall(r'src="(/[^"#\s]*)"', s)
        for u in (r.split('?')[0] for r in refs):
            if u.startswith('/assets'):
                if not os.path.exists(u[1:]): miss[u].add(f)
            elif u not in known: miss[u].add(f)
    check(not miss, "every internal link resolves", {k: len(v) for k, v in list(miss.items())[:6]})

# ── sitemap ──────────────────────────────────────────────────────────
def check_sitemap(files):
    sm = set(re.findall(r'<loc>https://sourdoughdatabase\.com(/[^<]*)</loc>', open('sitemap.xml').read()))
    check(bool(sm), "sitemap has entries", len(sm))
    known = urlset(files)
    dead = sorted(u for u in sm if u not in known)
    check(not dead, "no sitemap entry points at a missing page", dead)
    noindex, skip = set(), {'/index.html'}
    for f in files:
        if re.search(r'name="robots"[^>]*noindex', open(f, encoding='utf-8').read()):
            noindex.add('/' + f)
    absent = sorted(u for u in known - sm - noindex - skip
                    if not (u.endswith('/index.html') and u[:-10] in sm))
    check(not absent, "every indexable page is in the sitemap", absent)

# ── assets ───────────────────────────────────────────────────────────
def check_css_build():
    """styles.css is generated from assets/css/src/ — fail if it has drifted."""
    parts = sorted(glob.glob('assets/css/src/*.css'))
    check(len(parts) > 0, "css sources present in assets/css/src/", len(parts))
    if not parts: return
    built = "".join(open(x, encoding='utf-8').read() for x in parts)
    current = open('assets/css/styles.css', encoding='utf-8').read()
    check(built == current,
          "styles.css matches its sources (run scripts/build-css.py)",
          "" if built == current else "%d built vs %d on disk" % (len(built), len(current)))

def check_index():
    """The homepage Index panel must match what build-index.py produces.

    Counts and the 'last filed' dateline are generated, not typed. Without
    this check the panel would quietly go stale the first time a page is
    added — and a reference site advertising numbers that are wrong is worse
    than one advertising none.
    """
    import subprocess
    r = subprocess.run([sys.executable, 'scripts/build-index.py', '--check'],
                       capture_output=True, text=True)
    detail = (r.stdout + r.stderr).strip().splitlines()
    check(r.returncode == 0,
          "homepage Index matches the repo (run scripts/build-index.py)",
          detail[0] if detail else '')

def check_stamps():
    """Every CSS/JS reference must carry its file's current content hash.

    Filenames are not content-hashed, so `?v=<md5>` is the only thing that can
    reach a browser holding an asset cached under the old `immutable` header —
    it will not revalidate, but it has never seen the new URL. A stale stamp
    means a returning visitor keeps running old code against new HTML.
    """
    ref = re.compile(r'(href|src)="(/assets/(?:css|js)/[^"?]+\.(?:css|js))(?:\?v=([0-9a-f]+))?"')
    seen, bad = 0, []
    for f in pages():   # includes the templates; they ship too
        for _, path, stamp in ref.findall(open(f, encoding='utf-8').read()):
            disk = path[1:]
            if not os.path.exists(disk):
                bad.append('%s -> %s (missing)' % (f, path)); continue
            seen += 1
            want = hashlib.md5(open(disk, 'rb').read()).hexdigest()[:8]
            if stamp != want:
                bad.append('%s -> %s (%s)' % (f, path, stamp or 'unstamped'))
    # Must fail when it finds nothing to inspect, or it passes vacuously.
    check(seen > 0, "found CSS/JS references to stamp-check", seen)
    check(not bad, "every CSS/JS reference carries the current content hash "
                   "(run scripts/stamp-assets.py)", bad[:6])

def check_assets():
    tom = open('netlify.toml').read()
    active = re.findall(r'^\s*Cache-Control = "([^"]+)"', tom, re.M)
    check(active and not any('immutable' in c for c in active),
          "no immutable cache header (filenames are not hashed)", active)
    urls = set(re.findall(r'https://fonts\.googleapis\.com/css2\?[^"\s]+', "\n".join(
        open(f, encoding='utf-8').read() for f in pages())))
    check(len(urls) == 1, "one font URL sitewide", len(urls))

if __name__ == '__main__':
    files = pages()
    print("Verifying %d pages\n" % len(files))
    check_parse(files); check_chrome(files); check_schema(files)
    check_links(files); check_sitemap(files); check_assets(); check_css_build()
    check_stamps(); check_index()
    print()
    if fails:
        print("%d FAILED: %s" % (len(fails), fails)); sys.exit(1)
    print("all checks passed"); sys.exit(0)
