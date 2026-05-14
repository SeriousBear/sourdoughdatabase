/**
 * The Sourdough Database — Shared Components
 *
 * This file controls the nav and footer across every page on the site.
 * Change something here once and it updates everywhere.
 *
 * TO UPDATE THE NAV:    Edit the NAV_HTML string below.
 * TO UPDATE THE FOOTER: Edit the FOOTER_HTML string below.
 * TO ADD A NAV LINK:    Add an <a> tag to the <nav class="nav"> block.
 *
 * Active nav state is detected automatically from the page URL —
 * you never need to add class="active" to a link manually.
 */

(function () {
  'use strict';

  // ── NAV ──────────────────────────────────────────────────────────
  // Includes the binding spine and hole-punch elements that are part
  // of the notebook aesthetic on every page.

  var NAV_HTML = [
    '<div class="binding"></div>',
    '<div class="holes">',
    '  <div class="hole"></div>',
    '  <div class="hole"></div>',
    '  <div class="hole"></div>',
    '  <div class="hole"></div>',
    '  <div class="hole"></div>',
    '  <div class="hole"></div>',
    '</div>',
    '<header>',
    '  <a href="/" class="logo">The Sourdough Database<span class="dot"></span></a>',
    '  <nav class="nav">',
    '    <a href="/">home</a>',
    '    <a href="/#starters">cultures</a>',
    '    <a href="/#flours">flours</a>',
    '    <a href="/#tools">tools</a>',
    '    <a href="/#journal">journal</a>',
    '    <a href="/about.html">about</a>',
    '  </nav>',
    '</header>'
  ].join('\n');

  // ── FOOTER ───────────────────────────────────────────────────────
  // Update links here as new pages are added to the site.

  var FOOTER_HTML = [
    '<footer>',
    '  <div class="foot-grid">',
    '    <div>',
    '      <div class="foot-brand">The Sourdough Database</div>',
    '      <p class="foot-tag">A recipe notebook for bakers who treat the loaf as both inquiry and inheritance.</p>',
    '    </div>',
    '    <div class="foot-col">',
    '      <h5>The Database</h5>',
    '      <ul>',
    '        <li><a href="/#starters">culture index</a></li>',
    '        <li><a href="/#flours">flours</a></li>',
    '        <li><a href="/#journal">journal</a></li>',
    '      </ul>',
    '    </div>',
    '    <div class="foot-col">',
    '      <h5>Tools</h5>',
    '      <ul>',
    '        <li><a href="/tools/hydration.html">hydration solver</a></li>',
    '        <li><a href="/tools/schedule.html">bake schedule</a></li>',
    '        <li><a href="/tools/trouble-atlas.html">trouble atlas</a></li>',
    '        <li><a href="/tools/crumb-analyzer.html">crumb analyzer</a></li>',
    '      </ul>',
    '    </div>',
    '    <div class="foot-col">',
    '      <h5>About</h5>',
    '      <ul>',
    '        <li><a href="/about.html">the story</a></li>',
    '        <li><a href="/privacy.html">privacy</a></li>',
    '      </ul>',
    '    </div>',
    '  </div>',
    '  <div class="colophon">',
    '    <span>\u00a9 MMXXVI \u00b7 The Sourdough Database</span>',
    '    <span><a href="https://kylewebear.com" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">a slow-fermented kylewebear.com project</a></span>',
    '    <span>made with flour on our hands</span>',
    '  </div>',
    '</footer>'
  ].join('\n');

  // ── INJECT ───────────────────────────────────────────────────────

  var headerEl = document.getElementById('site-header');
  var footerEl = document.getElementById('site-footer');

  if (headerEl) headerEl.innerHTML = NAV_HTML;
  if (footerEl) footerEl.innerHTML = FOOTER_HTML;

  // ── ACTIVE NAV STATE ─────────────────────────────────────────────
  // Automatically highlights the correct nav link based on the current URL.
  // No need to manually add class="active" to any page.
  //
  // Rules:
  //   /                     → home
  //   /starters/*           → cultures
  //   /atlas/* or /tools/*  → tools
  //   /about.html           → about

  function setActiveNav() {
    var path = window.location.pathname;
    var navLinks = document.querySelectorAll('nav.nav a');

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var isActive = false;

      if (href === '/' && path === '/') {
        isActive = true;
      } else if (href === '/about.html' && path === '/about.html') {
        isActive = true;
      } else if (href.indexOf('#starters') !== -1 && path.indexOf('/starters/') === 0) {
        isActive = true;
      } else if (href.indexOf('#tools') !== -1 &&
                (path.indexOf('/tools/') === 0 || path.indexOf('/atlas/') === 0)) {
        isActive = true;
      } else if (href.indexOf('#journal') !== -1 && path.indexOf('/journal/') === 0) {
        isActive = true;
      } else if (href.indexOf('#flours') !== -1 && path.indexOf('/flours/') === 0) {
        isActive = true;
      }

      link.classList.toggle('active', isActive);
    });
  }

  setActiveNav();

})();
