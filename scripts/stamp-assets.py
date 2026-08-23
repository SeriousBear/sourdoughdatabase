#!/usr/bin/env python3
"""
stamp-assets.py — content-hash cache busting for CSS and JS

    python3 scripts/stamp-assets.py            # apply
    python3 scripts/stamp-assets.py --check    # report drift, change nothing

── Why this exists ──────────────────────────────────────────────────

Filenames here are not content-hashed, so the browser's only clue that
styles.css changed is the Cache-Control header. netlify.toml used to
serve /assets/* as `max-age=31536000, immutable`. A browser that visited
during that window keeps those files for a YEAR and will not even send a
revalidation request — so the header fix could never reach it.

Observed in the wild, August 2026: a phone was rendering the current
HTML with a components.js cached from before the header/footer moved
into real markup. The old script injected the OLD nav over the correct
one, and an equally stale styles.css had no .rh-* rules, so hub cards
rendered as bare stacked text. The site was fine. The browser was not.

The fix is to change the URL whenever the bytes change. `?v=<hash>` is a
different URL, so no cached entry — however aggressively cached — can
answer for it.

── How ──────────────────────────────────────────────────────────────

The token is the first 8 hex of the file's md5. Per file, so a CSS edit
does not bust the JS, and a byte-identical rebuild produces the same
token and therefore no diff.

Only CSS and JS are stamped. Images are served for a week and a stale
photo is cosmetic, not broken — stamping them would mean rewriting URLs
inside stylesheets too, for much less benefit.

── Where this sits in the workflow ──────────────────────────────────

    python3 scripts/build-css.py       # styles.css from src/
    python3 scripts/sync-chrome.py     # header/footer to every page
    python3 scripts/stamp-assets.py    # <- this, after the bytes settle
    python3 scripts/verify.py

Order matters only in that this must run LAST of the three: it hashes
files on disk, so anything that rewrites an asset must have already run.
`verify.py` fails if a page carries a stale or missing stamp, which is
what stops this from quietly rotting.
"""

import glob
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Asset directories whose files get a stamp. Images deliberately excluded.
STAMPED_DIRS = ('assets/css', 'assets/js')

# href="/assets/css/styles.css"  or  src="/assets/js/thing.js?v=abc12345"
REF = re.compile(r'(?P<attr>href|src)="(?P<path>/assets/(?:css|js)/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"')


def token(rel_path):
    """First 8 hex of the file's md5, or None if the file is missing."""
    full = os.path.join(ROOT, rel_path.lstrip('/'))
    if not os.path.isfile(full):
        return None
    with open(full, 'rb') as fh:
        return hashlib.md5(fh.read()).hexdigest()[:8]


def html_files():
    out = []
    for pat in ('*.html', '*/*.html'):
        out += glob.glob(os.path.join(ROOT, pat))
    return sorted(out)


def main():
    check_only = '--check' in sys.argv

    # Only stamp files that actually live in a stamped directory. A reference
    # to something outside them is left alone rather than silently skipped.
    known = set()
    for d in STAMPED_DIRS:
        for f in glob.glob(os.path.join(ROOT, d, '*')):
            if os.path.isfile(f):
                known.add('/' + os.path.relpath(f, ROOT).replace(os.sep, '/'))

    changed, stale, missing, total = [], [], set(), 0

    for path in html_files():
        with open(path, encoding='utf-8') as fh:
            src = fh.read()
        rel = os.path.relpath(path, ROOT)

        def sub(m):
            nonlocal total
            p = m.group('path')
            if p not in known:
                return m.group(0)
            t = token(p)
            if t is None:
                missing.add(p)
                return m.group(0)
            total += 1
            new = '%s="%s?v=%s"' % (m.group('attr'), p, t)
            if new != m.group(0):
                stale.append('%s  %s' % (rel, p))
            return new

        out = REF.sub(sub, src)
        if out != src:
            changed.append(rel)
            if not check_only:
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.write(out)

    if missing:
        print('MISSING asset(s) referenced by HTML:')
        for p in sorted(missing):
            print('   ', p)
        return 1

    if total == 0:
        # A check that finds nothing to inspect must fail, not pass quietly.
        print('FAIL — no CSS/JS references found in any page. Something is wrong.')
        return 1

    if check_only:
        if stale:
            print('%d stale or unstamped reference(s) across %d file(s):'
                  % (len(stale), len(changed)))
            for s in stale[:20]:
                print('   ', s)
            if len(stale) > 20:
                print('    ... and %d more' % (len(stale) - 20))
            print('\nrun: python3 scripts/stamp-assets.py')
            return 1
        print('OK — all %d CSS/JS references carry the current content hash' % total)
        return 0

    print('%d CSS/JS reference(s) checked, %d file(s) updated' % (total, len(changed)))
    for f in changed[:10]:
        print('   ', f)
    if len(changed) > 10:
        print('    ... and %d more' % (len(changed) - 10))
    return 0


if __name__ == '__main__':
    sys.exit(main())
