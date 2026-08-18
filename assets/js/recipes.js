/* =============================================================
   recipes.js — filtering for the recipe hub (/recipes/)

   The cards are real HTML in the page. This only shows and hides
   them, so the library is fully visible to crawlers and to anyone
   with JS off — in that case the filter bar stays hidden (see the
   .rh-ready rule) rather than sitting there doing nothing.

   Within a group, selections are OR ("beginner or intermediate").
   Across groups they're AND ("beginner AND white flour").
   State is mirrored to the URL hash so a filtered view is
   shareable. The hash is used rather than a query string so
   search engines never treat these as separate pages.
   ============================================================= */

(function () {

  var root  = document.getElementById('rh-root');
  var grid  = document.getElementById('rh-grid');
  var count = document.getElementById('rh-count');
  var empty = document.getElementById('rh-empty');
  if (!root || !grid) return;

  var chips  = Array.prototype.slice.call(document.querySelectorAll('.rh-chip'));
  var cards  = Array.prototype.slice.call(grid.querySelectorAll('.rh-card'));
  var GROUPS = ['level', 'flour', 'form', 'time', 'origin'];
  if (!chips.length || !cards.length) return;

  // JS is running, so the filter UI is safe to reveal
  root.classList.add('rh-ready');

  var active = {};
  GROUPS.forEach(function (g) { active[g] = []; });

  /* ── read state from the URL hash ── */
  function readHash() {
    var h = window.location.hash.replace(/^#/, '');
    if (!h) return;
    h.split('&').forEach(function (pair) {
      var bits  = pair.split('=');
      var group = decodeURIComponent(bits[0] || '');
      var vals  = decodeURIComponent(bits[1] || '');
      if (GROUPS.indexOf(group) === -1 || !vals) return;
      active[group] = vals.split(',').filter(Boolean);
    });
  }

  function writeHash() {
    var parts = [];
    GROUPS.forEach(function (g) {
      if (active[g].length) parts.push(g + '=' + active[g].join(','));
    });
    var next = parts.length ? '#' + parts.join('&') : ' ';
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', parts.length ? next : window.location.pathname);
    }
  }

  /* ── does a card survive the current filters? ── */
  function matches(card) {
    for (var i = 0; i < GROUPS.length; i++) {
      var g = GROUPS[i];
      if (!active[g].length) continue;                    // group unset = no constraint
      var v = card.getAttribute('data-' + g);
      if (active[g].indexOf(v) === -1) return false;      // AND across groups
    }
    return true;
  }

  function label(n) {
    var total = cards.length;
    if (n === total) return total + ' recipes, everything we have so far.';
    if (n === 0)     return 'No matches.';
    if (n === 1)     return '1 recipe of ' + total + '.';
    return n + ' recipes of ' + total + '.';
  }

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var ok = matches(card);
      if (ok) { card.removeAttribute('hidden'); shown++; }
      else    { card.setAttribute('hidden', ''); }
    });

    var any = GROUPS.some(function (g) { return active[g].length > 0; });
    if (count) {
      count.textContent = label(shown);
      if (any) {
        var btn = document.createElement('button');
        btn.className = 'rh-reset';
        btn.type = 'button';
        btn.textContent = 'clear filters';
        btn.addEventListener('click', function () {
          GROUPS.forEach(function (g) { active[g] = []; });
          chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
          apply();
        });
        count.appendChild(btn);
      }
    }
    if (empty) empty.classList.toggle('rh-show', shown === 0);
    writeHash();
  }

  /* ── wire the chips ── */
  chips.forEach(function (chip) {
    var group = chip.getAttribute('data-group');
    var value = chip.getAttribute('data-value');
    if (GROUPS.indexOf(group) === -1) return;

    chip.addEventListener('click', function () {
      var list = active[group];
      var at   = list.indexOf(value);
      if (at === -1) { list.push(value); chip.setAttribute('aria-pressed', 'true'); }
      else           { list.splice(at, 1); chip.setAttribute('aria-pressed', 'false'); }
      apply();
    });
  });

  /* ── restore from hash, then render ── */
  readHash();
  chips.forEach(function (chip) {
    var group = chip.getAttribute('data-group');
    var value = chip.getAttribute('data-value');
    if (active[group] && active[group].indexOf(value) !== -1) {
      chip.setAttribute('aria-pressed', 'true');
    }
  });
  apply();

})();
