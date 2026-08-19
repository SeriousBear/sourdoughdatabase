/* =============================================================
   components.js — The Sourdough Database

   The header and footer are now REAL HTML in every page, not
   injected here — crawlers that don't run JS need to see the
   navigation. This file only marks the current section in the nav.

   If you change the nav or footer, you must change it in all
   pages (they're duplicated on purpose) AND update the rules
   below. See CLAUDE.md.

   Active nav rules:
     /                          → home
     /starters/*                → cultures
     /atlas/* or /tools/*       → tools
     /journal/*                 → field notes
     /flour-compendium.html
       or /flour/*              → flour
     /pantry.html               → the pantry
     /recipes/*                 → recipes
     /starter-school/*          → starter
     /about.html                → about
   ============================================================= */

(function () {

  var path = window.location.pathname;
  var navLinks = document.querySelectorAll('nav.nav a');
  if (!navLinks.length) return;

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var isActive = false;

    if (href === '/' && path === '/') {
      isActive = true;
    } else if (href === '/about.html' && path === '/about.html') {
      isActive = true;
    } else if (href === '/pantry.html' && path === '/pantry.html') {
      isActive = true;
    } else if (href === '/recipes/' && path.indexOf('/recipes') === 0) {
      isActive = true;
    } else if (href === '/starter-school/' && path.indexOf('/starter-school') === 0) {
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

})();
