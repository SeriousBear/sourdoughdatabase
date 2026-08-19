/* =============================================================
   components.js — The Sourdough Database

   Two jobs, both progressive enhancements:
     1. mark the current section in the nav
     2. click-toggle the Learn / Tools dropdowns

   The header and footer are real HTML in every page — never
   injected here. Change them in index.html and run
   scripts/sync-chrome.py. See CLAUDE.md.

   The dropdown panels are always in the DOM (crawlable) and are
   revealed by CSS on :hover and :focus-within, so they work with
   JavaScript disabled. This file adds click/tap toggling, which
   hover can't provide on touch screens.
   ============================================================= */

(function () {

  var path = window.location.pathname;

  /* ── ACTIVE SECTION ─────────────────────────────────────── */
  // Longest matching prefix wins, so /tools/hydration.html marks the
  // hydration item rather than every link starting with /tools/.
  function activate() {
    var links = Array.prototype.slice.call(document.querySelectorAll('nav.nav a'));
    if (!links.length) return;

    var best = null, bestLen = -1;
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '/') return;
      var match =
        href === '/'      ? path === '/' :
        /\/$/.test(href)  ? path.indexOf(href) === 0 :
                            path === href;
      if (match && href.length > bestLen) { best = link; bestLen = href.length; }
    });
    if (!best) return;

    best.classList.add('active');

    // if the match lives inside a dropdown, light up its parent too
    var group = best.closest ? best.closest('.nav-group') : null;
    if (group) {
      var top = group.querySelector('.nav-top');
      if (top) top.classList.add('active');
    }
  }

  /* ── DROPDOWNS ──────────────────────────────────────────── */
  function dropdowns() {
    var groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
    if (!groups.length) return;

    function closeAll(except) {
      groups.forEach(function (g) {
        if (g === except) return;
        g.classList.remove('open');
        var b = g.querySelector('.nav-top');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    groups.forEach(function (g) {
      var btn = g.querySelector('.nav-top');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = g.classList.contains('open');
        closeAll(g);
        g.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
      });
    });

    document.addEventListener('click', function (e) {
      var inside = groups.some(function (g) { return g.contains(e.target); });
      if (!inside) closeAll(null);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.keyCode !== 27) return;
      var open = groups.filter(function (g) { return g.classList.contains('open'); });
      if (!open.length) return;
      closeAll(null);
      var btn = open[0].querySelector('.nav-top');
      if (btn) btn.focus();
    });
  }

  activate();
  dropdowns();

})();
