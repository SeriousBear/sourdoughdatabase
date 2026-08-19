/* =============================================================
   trouble-atlas.js — extracted from tools/trouble-atlas.html

   Was an inline <script> in the page. HTML is served
   max-age=0, so inline JS was re-downloaded on every visit and
   never cached; as an external file it caches like any asset.
   Loaded with defer, after components.js.
   ============================================================= */

// ── Trouble Atlas search with autocomplete ─────────────────────────────────────
(function () {
  'use strict';

  // All problem entries — keywords are matched against search input
  var PROBLEMS = [
    { name: 'Gummy Crumb', cat: 'Crumb', url: '/atlas/gummy-crumb.html', snippet: 'wet, dense, almost raw inside', keys: 'gummy wet dense raw inside crumb moist sticky translucent' },
    { name: 'No Oven Spring', cat: 'Rise', url: '/atlas/no-oven-spring.html', snippet: 'goes in flat, comes out flat', keys: 'no oven spring flat no rise didn\'t rise score didn\'t open ear bloom' },
    { name: 'Flat / Spreading Loaf', cat: 'Rise', url: '/atlas/flat-loaf.html', snippet: 'spreads sideways, wide and low', keys: 'flat spreading wide sideways pancake focaccia slumps won\'t hold shape' },
    { name: 'Dense Crumb', cat: 'Crumb', url: '/atlas/dense-crumb.html', snippet: 'heavy, tight, no holes', keys: 'dense heavy brick tight crumb no holes close crumb' },
    { name: 'Too Sour', cat: 'Flavor', url: '/atlas/too-sour.html', snippet: 'vineoso, overwhelming acidity', keys: 'too sour acidic vineoso sharp overwhelming reduce sourness' },
    { name: 'Not Sour Enough', cat: 'Flavor', url: '/atlas/not-sour-enough.html', snippet: 'mild, no tang, tastes like regular bread', keys: 'not sour not tangy no flavor bland mild increase tang' },
    { name: 'Starter Won\'t Rise', cat: 'Starter', url: '/atlas/starter-not-rising.html', snippet: 'flat, no bubbles, no activity', keys: 'starter not rising not bubbling won\'t rise dead inactive no activity' },
    { name: 'Hooch / Liquid on Top', cat: 'Starter', url: '/atlas/hooch.html', snippet: 'gray liquid on starter surface', keys: 'hooch liquid on top starter gray grey dark liquid smells alcohol acetone hungry' },
    { name: 'Overproofed Dough', cat: 'Rise', url: '/atlas/overproofed.html', snippet: 'slack, sticky, deflated, won\'t spring back', keys: 'overproofed too long slack sticky deflated collapsed poke test stays' },
    { name: 'Underproofed Dough', cat: 'Rise', url: '/atlas/underproofed.html', snippet: 'dense, burst sides, needed more time', keys: 'underproofed not enough time dense tight burst sides crust tears' },
    { name: 'Mold and Pink Streaks', cat: 'Starter', url: '/atlas/contamination.html', snippet: 'fuzzy growth or pink streaks — discard', keys: 'mold mould pink orange red streaks fuzzy contamination throw out discard unsafe serratia safe to eat' },
    { name: 'Burnt Bottom', cat: 'Bake', url: '/atlas/burnt-bottom.html', snippet: 'black bitter base, perfect top', keys: 'burnt bottom black base bitter scorched burned underneath dutch oven rack position' },
    { name: 'Dough Too Sticky', cat: 'Handling', url: '/atlas/sticky-dough.html', snippet: 'glued to hands and counter', keys: 'sticky dough wet hands glued counter unmanageable slack too wet handling shaping add flour' },
  ];

  var input = document.getElementById('atlas-search');
  var dropdown = document.getElementById('atlas-autocomplete');
  var allCards = document.querySelectorAll('.problem-card');

  function score(problem, query) {
    var q = query.toLowerCase();
    var s = 0;
    if (problem.name.toLowerCase().includes(q)) s += 10;
    if (problem.snippet.toLowerCase().includes(q)) s += 5;
    var words = q.split(/\s+/);
    words.forEach(function(w) {
      if (w.length < 2) return;
      if (problem.keys.includes(w)) s += 3;
    });
    return s;
  }

  function updateDropdown(query) {
    if (!query || query.length < 2) {
      dropdown.innerHTML = '';
      dropdown.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    var results = PROBLEMS
      .map(function(p) { return { p: p, s: score(p, query) }; })
      .filter(function(r) { return r.s > 0; })
      .sort(function(a, b) { return b.s - a.s; })
      .slice(0, 6);

    if (!results.length) {
      dropdown.innerHTML = '<div class="autocomplete-item"><span class="ac-name" style="color:var(--pencil);font-style:italic;">No match — try different words</span></div>';
      dropdown.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      return;
    }

    dropdown.innerHTML = results.map(function(r) {
      return '<a class="autocomplete-item" href="' + r.p.url + '" role="option">' +
        '<span class="ac-cat">' + r.p.cat + '</span>' +
        '<span class="ac-name">' + r.p.name + '</span>' +
        '<span class="ac-snippet">' + r.p.snippet + '</span>' +
      '</a>';
    }).join('');
    dropdown.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
  }

  function filterCards(query) {
    var q = (query || '').toLowerCase().trim();
    if (!q) {
      allCards.forEach(function(c) { c.closest('.atlas-category') && (c.style.display = ''); c.style.display = ''; });
      document.querySelectorAll('.atlas-category').forEach(function(s) { s.style.display = ''; });
      return;
    }
    var visibleCats = new Set();
    allCards.forEach(function(card) {
      var keys = (card.getAttribute('data-keywords') || '') + ' ' + card.querySelector('.pc-name').textContent;
      var words = q.split(/\s+/);
      var match = words.some(function(w) { return w.length > 1 && keys.toLowerCase().includes(w); });
      card.style.display = match ? '' : 'none';
      if (match) {
        var cat = card.closest('.atlas-category');
        if (cat) visibleCats.add(cat);
      }
    });
    document.querySelectorAll('.atlas-category').forEach(function(s) {
      s.style.display = visibleCats.has(s) ? '' : 'none';
    });
  }

  input.addEventListener('input', function() {
    var q = input.value.trim();
    updateDropdown(q);
    filterCards(q);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdown.innerHTML = '';
      dropdown.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      filterCards('');
      input.value = '';
    }
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard navigation in dropdown
  input.addEventListener('keydown', function(e) {
    var items = dropdown.querySelectorAll('.autocomplete-item[href]');
    if (!items.length) return;
    var focused = dropdown.querySelector('.autocomplete-item:focus');
    var idx = Array.from(items).indexOf(focused);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = items[idx + 1] || items[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = items[idx - 1] || items[items.length - 1];
      prev.focus();
    } else if (e.key === 'Enter' && focused) {
      e.preventDefault();
      window.location = focused.href;
    }
  });

})();
