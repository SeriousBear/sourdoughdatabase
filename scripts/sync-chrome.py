#!/usr/bin/env python3
"""
sync-chrome.py — propagate the header and footer to every page.

    python3 scripts/sync-chrome.py            # apply
    python3 scripts/sync-chrome.py --check    # report drift, change nothing

There's no build step, so the header and footer are physically duplicated in
every HTML file. Editing one page's nav by hand silently desyncs the site.
This makes the duplication safe: edit the nav ONCE in the source page below,
run this, and every page matches.

It also fills <!--HEADER--> / <!--FOOTER--> markers, so a new page can be
written with markers and never carries a stale copy of the chrome. Three
separate bugs in this repo came from pasting a cached snapshot of the header
into a new page; this removes the opportunity.

Indentation is preserved per file — the flour pages sit 8 spaces deep, most
others at zero.
"""
import re, sys, glob

SOURCE = 'index.html'          # the one true copy of the chrome

def extract(s, wid):
    m = re.search(r'^([ \t]*)<div id="%s">\n' % wid, s, re.M)
    if not m: return None
    close = re.compile(r'^%s</div>' % re.escape(m.group(1)), re.M)
    c = close.search(s, m.end())
    if not c: return None
    ind = m.group(1)
    raw = s[m.start():c.end()]
    return "\n".join(l[len(ind):] if l.startswith(ind) else l for l in raw.split("\n"))

def reindent(block, ind):
    return "\n".join(ind + l if l.strip() else l for l in block.split("\n"))

def main():
    check = '--check' in sys.argv
    src = open(SOURCE, encoding='utf-8').read()
    hdr, ftr = extract(src, 'site-header'), extract(src, 'site-footer')
    if not hdr or not ftr:
        print("FATAL: could not read chrome from %s" % SOURCE); return 2
    nav = re.search(r'<nav class="nav">(.*?)</nav>', hdr, re.S)
    print("source: %s — %d nav items\n" % (SOURCE, len(re.findall(r'<a ', nav.group(1)))))

    changed, drifted = [], []
    for f in sorted(glob.glob('**/*.html', recursive=True)):
        s = open(f, encoding='utf-8').read(); o = s
        for wid, block in (('site-header', hdr), ('site-footer', ftr)):
            marker = '<!--%s-->' % wid.split('-')[1].upper()
            mk = re.search(r'^([ \t]*)' + re.escape(marker), s, re.M)
            if mk:
                s = s.replace(mk.group(0), reindent(block, mk.group(1)).lstrip(), 1)
                continue
            m = re.search(r'^([ \t]*)<div id="%s">\n' % wid, s, re.M)
            if not m:
                if f != SOURCE: drifted.append((f, 'no %s' % wid))
                continue
            ind = m.group(1)
            c = re.compile(r'^%s</div>' % re.escape(ind), re.M).search(s, m.end())
            if not c: drifted.append((f, 'unterminated %s' % wid)); continue
            s = s[:m.start()] + reindent(block, ind) + s[c.end():]
        if s != o:
            changed.append(f)
            if not check: open(f, 'w').write(s)

    if check:
        print("%d file(s) would change: %s" % (len(changed), changed[:8] or 'none'))
    else:
        print("%d file(s) updated" % len(changed))
        for f in changed[:12]: print("   ", f)
        if len(changed) > 12: print("    ... and %d more" % (len(changed) - 12))
    if drifted:
        print("PROBLEMS: %s" % drifted)
    return 1 if (check and changed) or drifted else 0

if __name__ == '__main__':
    sys.exit(main())
