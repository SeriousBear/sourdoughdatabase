/* =============================================================
   components.js — The Sourdough Database
   Renders shared header + footer on every page.
   Drop <div id="site-header"></div> and <div id="site-footer"></div>
   into any page, then load this script before </body>.

   Active nav rules:
     /                          → home
     /starters/*                → cultures
     /atlas/* or /tools/*       → tools
     /journal/*                 → field notes
     /flour-compendium.html
       or /flour/*              → flour
     /about.html                → about
   ============================================================= */

(function () {

  /* ── HEADER ─────────────────────────────────────────────── */
  var headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.innerHTML = [
      '<div class="binding"></div>',
      '<div class="holes">',
      '  <span class="hole"></span><span class="hole"></span><span class="hole"></span>',
      '  <span class="hole"></span><span class="hole"></span><span class="hole"></span>',
      '</div>',
      '<header>',
      '  <a href="/" class="logo">',
      '    The Sourdough<br>Database',
      '    <span class="dot"></span>',
      '  </a>',
      '  <nav class="nav">',
      '    <a href="/#starters">cultures</a>',
      '    <a href="/flour-compendium.html">flour</a>',
      '    <a href="/#tools">tools</a>',
      '    <a href="/#journal">field notes</a>',
      '    <a href="/about.html">about</a>',
      '  </nav>',
      '  <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">',
      '    <span></span><span></span><span></span>',
      '  </button>',
      '</header>',
    ].join('\n');
  }

  /* ── FOOTER ─────────────────────────────────────────────── */
  var footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.innerHTML = [
      '<footer>',
      '  <div class="foot-grid">',
      '    <div>',
      '      <span class="foot-brand">The Sourdough Database<span class="amp">.</span></span>',
      '      <p class="foot-tag">A field guide for obsessive bakers. Built in NYC. Powered by Oso.</p>',
      '    </div>',
      '    <div class="foot-col">',
      '      <h5>Reference</h5>',
      '      <ul>',
      '        <li><a href="/#starters">Starter Cultures</a></li>',
      '        <li><a href="/flour-compendium.html">Flour Compendium</a></li>',
      '        <li><a href="/#tools">Tools</a></li>',
      '        <li><a href="/tools/trouble-atlas.html">Trouble Atlas</a></li>',
      '      </ul>',
      '    </div>',
      '    <div class="foot-col">',
      '      <h5>Reading</h5>',
      '      <ul>',
      '        <li><a href="/#journal">Field Notes</a></li>',
      '        <li><a href="/journal/the-culture-she-kept.html">The Culture She Kept</a></li>',
      '        <li><a href="/journal/seventeen-tabs.html">Seventeen Tabs Open</a></li>',
      '      </ul>',
      '    </div>',
      '    <div class="foot-col">',
      '      <h5>Site</h5>',
      '      <ul>',
      '        <li><a href="/about.html">About</a></li>',
      '        <li><a href="/contact.html">Contact</a></li>',
      '        <li><a href="/privacy.html">Privacy</a></li>',
      '      </ul>',
      '    </div>',
      '  </div>',
      '  <div class="colophon">',
      '    <span>© 2026 Kyle Weber · sourdoughdatabase.com</span>',
      '    <span>Some links are Amazon affiliate links. All recommendations are my own.</span>',
      '  </div>',
      '</footer>',
    ].join('\n');
  }

  /* ── MOBILE NAV TOGGLE ──────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.nav-toggle');
    if (!toggle) return;
    var nav = document.querySelector('nav.nav');
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    if (nav) nav.classList.toggle('nav--open', !expanded);
  });

  /* ── ACTIVE NAV ─────────────────────────────────────────── */
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
      } else if (href === '/flour-compendium.html' &&
                (path === '/flour-compendium.html' || path.indexOf('/flour/') === 0)) {
        isActive = true;
      }

      link.classList.toggle('active', isActive);
    });
  }

  setActiveNav();

})();
