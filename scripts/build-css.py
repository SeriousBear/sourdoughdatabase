#!/usr/bin/env python3
"""
build-css.py — concatenate assets/css/src/*.css into assets/css/styles.css

    python3 scripts/build-css.py            # build
    python3 scripts/build-css.py --check    # fail if styles.css is stale

Why this exists: styles.css was one 7,400-line file, which made every edit a
scroll hunt. The source is now eight files. They are concatenated **in
filename order** into the single styles.css the site actually serves, so the
output is byte-identical to the old monolith and the cascade cannot change.

Why not serve the eight files directly and load only what each page needs?
It was tried and rejected on evidence. The section boundaries in this
stylesheet do not match page boundaries:

  · @media (max-width:640px) { .binding,.holes{display:none} .nav{...}
    .foot-grid{...} } — the sitewide MOBILE NAV AND FOOTER rules — sits
    physically inside the TOOLS / CALCULATORS section. Ship tools.css only to
    tool pages and every other page loses its mobile layout.
  · .prose, .section-label, .section-heading, .opener are defined inside the
    ABOUT PAGE section and used by all 13 Atlas pages.
  · 35 further classes live in one surface and are used by three.

The byte win was ~15 KB gzipped on a first visit. Not worth a class of bug
that renders fine in a static checker. If the shared furniture is ever
extracted into its own layer, revisit.

EDIT THE FILES IN src/. Never edit styles.css directly — it is generated and
scripts/verify.py will fail the build if it drifts.
"""
import sys, os, glob, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC  = os.path.join(ROOT, 'assets', 'css', 'src')
OUT  = os.path.join(ROOT, 'assets', 'css', 'styles.css')

def build():
    parts = sorted(glob.glob(os.path.join(SRC, '*.css')))
    if not parts:
        print("FATAL: no sources in assets/css/src/"); sys.exit(2)
    return "".join(open(p, encoding='utf-8').read() for p in parts), parts

if __name__ == '__main__':
    built, parts = build()
    current = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else None
    same = current == built
    if '--check' in sys.argv:
        print("%s  %d source files -> %d bytes" %
              ("OK — styles.css matches src/" if same else "STALE — run: python3 scripts/build-css.py",
               len(parts), len(built)))
        sys.exit(0 if same else 1)
    open(OUT, 'w', encoding='utf-8').write(built)
    print("built styles.css from %d sources: %d bytes  (%s)" %
          (len(parts), len(built), "unchanged" if same else "CHANGED"))
    for p in parts:
        print("   %-26s %7d" % (os.path.basename(p), os.path.getsize(p)))
