#!/usr/bin/env python3
"""
build-index.py — the homepage Index panel, generated from the repo

    python3 scripts/build-index.py            # apply
    python3 scripts/build-index.py --check    # report drift, change nothing

── Why this is generated ────────────────────────────────────────────

The hero's right-hand panel is a contents page: each library, how many
entries it holds, and the most recent thing published. Hand-typed, every
one of those numbers is wrong the moment a page is added — and a
reference site whose own index is stale is worse than one with no index,
because it looks maintained and isn't.

So nothing in that panel is typed. Counts come from the filesystem, the
dateline comes from the newest `datePublished` in any page's JSON-LD.
`verify.py` fails if the block on disk has drifted from what this
produces, which is what keeps it honest.

── What appears, and what doesn't ───────────────────────────────────

Every library in LIBRARIES below is counted. A library is SHOWN when it
has at least MIN_ENTRIES, and the panel shows at most MAX_ROWS of them,
largest first.

That rule is doing real work in both directions:

  * A thin library stays off the front page until it has something to
    say. Recipes sits at 2 right now and is correctly absent — it will
    appear on its own the day a third one is baked, with no edit here.
  * The panel can't grow past MAX_ROWS and wreck the hero layout, no
    matter how much gets written.

ADDING A LIBRARY: append one entry to LIBRARIES and run this. Don't
touch index.html — the rows are generated between markers.
"""

import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MIN_ENTRIES = 3      # below this a library is real but not front-page material
MAX_ROWS    = 7      # the hero panel's design ceiling — see the module docstring

# label, where the row links, which files to count. Order here is the
# tie-break when two libraries hold the same number of entries.
LIBRARIES = [
    dict(label='Ways a loaf goes wrong', href='/tools/trouble-atlas.html',
         pattern='atlas/*.html'),
    dict(label='Techniques, explained', href='/techniques/',
         pattern='techniques/*.html', drop=('index.html',)),
    dict(label='Starter, start to finish', href='/starter-school/',
         pattern='starter-school/*.html', drop=('index.html',)),
    dict(label='Flours, profiled', href='/flour-compendium.html',
         pattern='flour/*.html'),
    # trouble-atlas.html is dropped here on purpose: it is the Atlas HUB, and
    # its 13 entries already have their own row. Counting it again would say
    # the site has one more tool than it does.
    # plus=1 is the Dough Lab, which lives at /recipes/build-your-own.html but
    # is a tool by every other measure. Counted here, not under Recipes.
    dict(label='Calculators and tools', href='/tools/',
         pattern='tools/*.html', drop=('index.html', 'trouble-atlas.html'), plus=1),
    dict(label='Cultures with histories', href='/starters/',
         pattern='starters/*.html', drop=('index.html',)),
    dict(label='Field notes', href='/journal/',
         pattern='journal/*.html', drop=('index.html',)),
    dict(label='Recipes, written', href='/recipes/',
         pattern='recipes/*.html', drop=('index.html',)),
]

ROWS_OPEN,  ROWS_CLOSE  = '<!--INDEX:ROWS-->',  '<!--/INDEX:ROWS-->'
LAST_OPEN,  LAST_CLOSE  = '<!--INDEX:LAST-->',  '<!--/INDEX:LAST-->'

MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def count(lib):
    drop = set(lib.get('drop', ()))
    n = 0
    for f in glob.glob(os.path.join(ROOT, lib['pattern'])):
        name = os.path.basename(f)
        if name in drop or name.startswith('_'):
            continue
        n += 1
    return n + lib.get('plus', 0)


def shown():
    rows = [(count(l), i, l) for i, l in enumerate(LIBRARIES)]
    rows = [r for r in rows if r[0] >= MIN_ENTRIES]
    rows.sort(key=lambda r: (-r[0], r[1]))          # biggest first, registry order breaks ties
    return rows[:MAX_ROWS]


def last_filed():
    """Newest `datePublished` across the site, with that page's short name.

    datePublished is the honest signal: sitemap lastmod moves when a page is
    merely edited, and file mtime is reset by a fresh checkout. Ties are
    broken by path so two pages published the same day can't make the build
    flap between them.
    """
    best = None
    for f in glob.glob(os.path.join(ROOT, '**', '*.html'), recursive=True):
        if os.path.basename(f).startswith('_'):
            continue
        s = open(f, encoding='utf-8').read()
        m = re.search(r'"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})"', s)
        if not m:
            continue
        key = (m.group(1), os.path.relpath(f, ROOT))
        if best is None or key > best[0]:
            best = (key, s, f)
    if not best:
        return None

    (date, rel), s, _ = best
    name = None
    h = re.search(r'"headline"\s*:\s*"([^"]+)"', s)          # short, curated
    if h:
        name = h.group(1)
    if not name:
        h = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)        # fall back to the page's own h1
        if h:
            name = re.sub(r'<[^>]+>', '', h.group(1)).strip()
    if not name:
        name = rel

    href = '/' + rel.replace(os.sep, '/')
    y, mo, d = date.split('-')
    return {'href': href, 'name': name, 'when': '%d %s' % (int(d), MONTHS[int(mo) - 1])}


def render_rows():
    out = []
    for n, _, lib in shown():
        out.append(
            '            <li><a href="%s"><span class="t">%s</span>'
            '<span class="leader"></span><span class="n">%d</span></a></li>'
            % (lib['href'], lib['label'], n))
    return '\n'.join(out)


def render_last():
    lf = last_filed()
    if not lf:
        return '            <span class="idx-last">Filed by hand, in a kitchen in NYC.</span>'
    return ('            <span class="idx-last">Last filed &mdash; '
            '<a href="%s">%s</a>, %s</span>' % (lf['href'], lf['name'], lf['when']))


def splice(s, open_tag, close_tag, body):
    a, b = s.index(open_tag), s.index(close_tag)
    return s[:a + len(open_tag)] + '\n' + body + '\n            ' + s[b:]


def main():
    check = '--check' in sys.argv
    p = os.path.join(ROOT, 'index.html')
    src = open(p, encoding='utf-8').read()

    for tag in (ROWS_OPEN, ROWS_CLOSE, LAST_OPEN, LAST_CLOSE):
        if src.count(tag) != 1:
            print('FAIL — index.html must contain exactly one %s (found %d).'
                  % (tag, src.count(tag)))
            print('       The Index panel markers are missing or duplicated.')
            return 1

    rows = shown()
    if not rows:
        # A check that finds nothing to inspect must fail, not pass quietly.
        print('FAIL — no library reached MIN_ENTRIES (%d). Nothing to render.' % MIN_ENTRIES)
        return 1

    out = splice(src, ROWS_OPEN, ROWS_CLOSE, render_rows())
    out = splice(out, LAST_OPEN, LAST_CLOSE, render_last())

    if check:
        if out != src:
            print('STALE — the homepage Index does not match the repo.')
            print('run: python3 scripts/build-index.py')
            return 1
        print('OK — homepage Index matches the repo  (%d rows)' % len(rows))
        return 0

    if out == src:
        print('no change — %d rows, already current' % len(rows))
    else:
        open(p, 'w', encoding='utf-8').write(out)
        print('index panel rebuilt — %d rows' % len(rows))

    for n, _, lib in rows:
        print('    %-26s %3d' % (lib['label'], n))
    hidden = [(count(l), l['label']) for l in LIBRARIES if count(l) < MIN_ENTRIES]
    for n, label in hidden:
        print('    %-26s %3d   (below MIN_ENTRIES, not shown)' % (label, n))
    lf = last_filed()
    if lf:
        print('    last filed: %s, %s' % (lf['name'], lf['when']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
