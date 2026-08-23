/* =============================================================
   components.js — The Sourdough Database

   Progressive enhancements shared by every page:
     1. mark the current section in the nav
     2. click-toggle the Learn / Tools dropdowns
     3. YouTube facades   — any [data-video-id]
     4. scroll reveal     — any .flour-reveal
     5. reading progress  — #read-progress + #article-body
     6. copy-link button  — #copy-btn

   Items 3–6 were copy-pasted inline into 16 pages before August
   2026: the video facade into 10 Atlas entries, the reveal into 3
   flour pages, and the progress bar and copy button into 3 journal
   files. Three Atlas pages carried the data attribute but had
   never received the script, so adding a real video ID to them
   would have silently done nothing.

   Each one is keyed off markup and no-ops when that markup is
   absent, which is what makes it safe to run everywhere.

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

  /* ── YouTube facade ──────────────────────────────────────────────
     Swap the placeholder for a real thumbnail when a video ID is set. No
     iframe until the reader clicks, so nothing is loaded from YouTube — and
     nothing at all happens while the attribute is empty.

     TO ADD A VIDEO: put data-video-id="THE_ID" on the .video-reference div.
     Nothing else to change, on any page. */
  function videoFacades() {
    var refs = document.querySelectorAll('[data-video-id]');
    for (var i = 0; i < refs.length; i++) {
      var ref = refs[i];
      var id = ref.getAttribute('data-video-id');
      if (!id) continue;
      var a = ref.querySelector('a');
      if (!a) continue;
      a.href = 'https://www.youtube.com/watch?v=' + id;
      a.className = 'video-card';
      a.innerHTML =
        '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" ' +
        'alt="Video thumbnail" loading="lazy" width="480" height="360">' +
        '<span class="video-play" aria-hidden="true">▶</span>';
    }
  }

  /* ── scroll reveal ── */
  function scrollReveal() {
    var els = document.querySelectorAll('.flour-reveal');
    if (!els.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = (i % 4) * 0.08 + 's';
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    for (var i = 0; i < els.length; i++) obs.observe(els[i]);
  }

  /* ── reading progress ── */
  function readProgress() {
    var bar = document.getElementById('read-progress');
    var body = document.getElementById('article-body');
    if (!bar || !body) return;
    window.addEventListener('scroll', function () {
      var rect = body.getBoundingClientRect();
      var pct = Math.min(100, Math.max(0,
        (-rect.top + window.innerHeight) / body.offsetHeight * 100));
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── copy link ──────────────────────────────────────────────────
     Still exposed as a global because the journal articles call it from an
     inline onclick. A delegated listener is also wired, so new markup can
     just use id="copy-btn" and drop the attribute. */
  function copyLink() {
    var btn = document.getElementById('copy-btn');
    if (!btn || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(function () {
      btn.textContent = 'copied \u2713';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = 'copy link';
        btn.classList.remove('copied');
      }, 2200);
    });
  }
  window.copyLink = copyLink;

  function copyButton() {
    var btn = document.getElementById('copy-btn');
    if (btn && !btn.getAttribute('onclick')) btn.addEventListener('click', copyLink);
  }

  activate();
  dropdowns();
  videoFacades();
  scrollReveal();
  readProgress();
  copyButton();

})();
