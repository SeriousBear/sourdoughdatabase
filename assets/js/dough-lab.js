/* =============================================================
   dough-lab.js — Choose Your Own Crumb
   /recipes/build-your-own.html

   GRAMS-NATIVE. Every ingredient is entered in grams and the
   percentages are derived, not the other way round. It used to
   work the other way — flour percentages plus a target finished
   dough weight — and that carried a real bug: the finished weight
   ignored the starter, so a dough set to 900 g came out at 1002 g.
   Entering what you actually put in the bowl has no such gap.

   Defaults are the Calibration Loaf (450 / 300 / 100 / 10), so a
   first-time visitor lands on a working recipe rather than an
   empty form, and WHITE_ANCHOR is set to that loaf's 70% so the
   tool agrees with the site's own beginner recipe on load.

   SCOPE, DELIBERATELY: this is the formula + consequences layer.
   It does NOT produce a timeline. Fermentation timing belongs in
   a shared assets/js/fermentation.js that this page and
   tools/schedule.html will both use — building it in one place
   twice is how they drift, and schedule.js is already silently
   hardcoded to white flour at 20% starter.

   Flour numbers below come from the Flour Compendium entries, so
   this tool can never contradict the site's own content. If you
   edit a flour entry, edit it here too.
   ============================================================= */

(function () {

  var DATA    = window.DOUGH_LAB_DATA || { FLOURS: {}, LIQUIDS: {}, EXTRAS: {}, LIQUID_NOTES: {}, EXTRA_NOTES: {} };
  var FLOURS  = DATA.FLOURS;
  var LIQUIDS = DATA.LIQUIDS;
  var EXTRAS  = DATA.EXTRAS;
  var TIPS    = window.DOUGH_LAB_TIPS || {};
  var WHOLEGRAIN = ['wholewheat', 'rye', 'einkorn'];

  /* The Calibration Loaf, which is what a first-time visitor should see. */
  var DEFAULTS = { flours: [{ id: 'white', g: 450 }], liquids: [{ id: 'water', g: 300 }], levain: 100, salt: 10 };

  var state = {
    flours:  [{ id: 'white', g: 450 }],
    liquids: [{ id: 'water',  g: 300 }],
    levain: 100,        // starter at 100% hydration: half flour, half water
    salt: 10,
    extras: [],
    touched: false      // has the reader changed anything yet?
  };

  var $ = function (id) { return document.getElementById(id); };
  var g0 = function (n) { return Math.round(n); };
  var g1 = function (n) { return Math.round(n * 10) / 10; };

  /* ── derived numbers, all in one place ── */
  function derive() {
    var flourG = state.flours.reduce(function (a, r) { return a + (+r.g || 0); }, 0);
    var levainFlour = (+state.levain || 0) / 2;
    var levainWater = (+state.levain || 0) / 2;
    // Extras bring water and take water. Net is what the dough actually
    // feels, and it is reported separately from hydration rather than folded
    // into it — hydration keeps its standard meaning everywhere on this site.
    var extraWeight = 0, extraNet = 0;
    state.extras.forEach(function (e) {
      var x = EXTRAS[e.id]; if (!x) return;
      extraWeight += (+e.g || 0);
      extraNet    += (+e.g || 0) * ((x.water || 0) - (x.absorb || 0));
    });
    var liquidWeight = 0, liquidWater = 0;
    state.liquids.forEach(function (l) {
      var x = LIQUIDS[l.id]; if (!x) return;
      liquidWeight += (+l.g || 0);
      liquidWater  += (+l.g || 0) * x.water;
    });
    var totalFlour = flourG + levainFlour;
    var totalWater = liquidWater + levainWater;
    return {
      flourG: flourG, levainFlour: levainFlour, levainWater: levainWater,
      liquidWeight: liquidWeight, liquidWater: liquidWater,
      extraWeight: extraWeight, extraNet: extraNet,
      totalFlour: totalFlour, totalWater: totalWater,
      hydration: totalFlour ? totalWater / totalFlour * 100 : 0,
      effective: totalFlour ? (totalWater + extraNet) / totalFlour * 100 : 0,
      saltPct: totalFlour ? (+state.salt || 0) / totalFlour * 100 : 0,
      starterPct: totalFlour ? (+state.levain || 0) / totalFlour * 100 : 0,
      dough: flourG + liquidWeight + (+state.levain || 0) + (+state.salt || 0) + extraWeight
    };
  }

  /* ── the recommendation: a weighted blend of each flour's own range ──
     Anchored at 70% for straight white flour, which is exactly the
     Calibration Loaf, so the tool never contradicts the site's own beginner
     recipe. Everything else moves off that anchor by how much water the flour
     actually absorbs, then gets clamped to the blend's own range. */
  var WHITE_ANCHOR = 70;

  function recommend() {
    var total = state.flours.reduce(function (a, r) { return a + (+r.g || 0); }, 0);
    if (!total) return WHITE_ANCHOR;
    var absorb = 0, lo = 0, hi = 0;
    state.flours.forEach(function (r) {
      var f = FLOURS[r.id]; if (!f) return;
      var w = (+r.g || 0) / total;
      absorb += f.absorb * w; lo += f.lo * w; hi += f.hi * w;
    });
    if (!absorb) return WHITE_ANCHOR;
    var target = WHITE_ANCHOR * absorb;
    return Math.max(Math.round(lo), Math.min(Math.round(hi), Math.round(target)));
  }

  /* Grams of water that would land you on a given true hydration, counting
     the water already arriving inside the starter and any wet extras. */
  function waterFor(hydPct) {
    var d = derive();
    // How much plain water would land you on this hydration, holding every
    // other liquid where it is. Can legitimately come out at zero — a dough
    // made entirely of beer is already wet enough.
    var fromOthers = 0;
    state.liquids.forEach(function (l) {
      var x = LIQUIDS[l.id]; if (!x || l.id === 'water') return;
      fromOthers += (+l.g || 0) * x.water;
    });
    return Math.max(0, Math.round(d.totalFlour * hydPct / 100 - d.levainWater - fromOthers));
  }

  /* What share of the liquid is coming from each kind of thing. This is what
     the tips read, so "half beer" and "all beer" say different things. */
  function liquidShare(noteType) {
    var total = state.liquids.reduce(function (a, l) { return a + (+l.g || 0); }, 0);
    if (!total) return 0;
    return state.liquids.reduce(function (a, l) {
      var x = LIQUIDS[l.id];
      return a + (x && x.note === noteType ? (+l.g || 0) : 0);
    }, 0) / total * 100;
  }

  function shareWords(p) {
    if (p >= 99) return 'All of your liquid';
    if (p >= 70) return 'Most of your liquid';
    if (p >= 40) return 'About half your liquid';
    if (p >= 20) return 'A good part of your liquid';
    return 'A splash of your liquid';
  }

  function flourPct(ids) {
    var total = state.flours.reduce(function (a, r) { return a + (+r.g || 0); }, 0);
    if (!total) return 0;
    return state.flours.reduce(function (a, r) {
      return a + (ids.indexOf(r.id) !== -1 ? (+r.g || 0) : 0);
    }, 0) / total * 100;
  }

  /* ── what your particular blend will actually do ── */
  function consequences() {
    var d = derive(), out = [];
    var hyd = Math.round(d.hydration);
    var wg = flourPct(WHOLEGRAIN), rye = flourPct(['rye']),
        ww = flourPct(['wholewheat']), ein = flourPct(['einkorn']),
        spelt = flourPct(['spelt']), ap = flourPct(['ap']);
    var starter = Math.round(d.starterPct), salt = d.saltPct;

    if (rye >= 20) out.push(['Heavy rye', 'Above about 20% rye the dough stops behaving like wheat — sticky, fast, and it will not build much gluten however you handle it. Expect a tighter, moister crumb and shape it wet-handed. <a href="/flour/rye-flour.html">Rye flour</a> · <a href="/atlas/sticky-dough.html">sticky dough</a>']);
    else if (rye >= 5) out.push(['A little rye', 'Even 5–10% rye speeds fermentation up noticeably and adds real depth. This is the most useful small addition in baking. <a href="/flour/rye-flour.html">Rye flour</a>']);

    if (ww >= 30) out.push(['Whole wheat over 30%', 'Ferments faster and drinks more water — the bran is doing both. Cut your bulk short of where a white loaf would end and expect a denser crumb. <a href="/flour/whole-wheat-flour.html">Whole wheat</a> · <a href="/techniques/reading-the-bulk.html">reading the bulk</a>']);

    if (ein >= 20) out.push(['Einkorn is not wheat', 'Einkorn gluten behaves unlike anything modern — it will not take a normal hydration and it will not hold tension the same way. Keep the water low, handle it gently, and expect a flatter loaf. <a href="/flour/einkorn-flour.html">Einkorn</a>']);

    if (spelt >= 30) out.push(['Spelt over 30%', 'Extensible and fragile. It stretches beautifully and then tears without warning, so go gentle on folds and stop shaping earlier than feels finished. <a href="/flour/spelt-flour.html">Spelt</a>']);

    if (wg >= 50) out.push(['Mostly whole grain', 'Above half whole grain the bran cuts the gluten network faster than it can build. This will be a dense, flavourful, honest loaf — not an open one. Worth doing on purpose, disappointing by accident.']);

    if (ap >= 60) out.push(['All-purpose as the base', 'Lower protein than bread flour, so it holds less water and less structure. Stay at the drier end and don\'t push the hydration up to match a bread-flour recipe. <a href="/flour/all-purpose-flour.html">All-purpose</a>']);

    if (hyd > 110) { /* the absurd note has this covered, louder */ }
    else if (hyd >= 80) out.push(['blue', 'High hydration', 'At ' + hyd + '% this dough is slack enough that a normal stretch and fold will tear it. Use <a href="/techniques/coil-folds.html">coil folds</a> instead, and expect it to be a handful on the bench.']);
    else if (hyd <= 62) out.push(['blue', 'On the dry side', 'At ' + hyd + '% this will be firm, easy to handle, and tighter in the crumb. A good place to be if you are still learning to shape. <a href="/techniques/shaping.html">Shaping</a>']);

    if (starter > 50) { /* the absurd note has this covered */ }
    else if (starter >= 25) out.push(['blue', 'A lot of starter', 'At ' + starter + '% the dough will move fast. Watch it rather than the clock, and be ready to cut the bulk short.']);
    else if (starter <= 12) out.push(['blue', 'Little starter', 'At ' + starter + '% this is a long, slow build — more flavour, more patience. Plan for a longer bulk than any recipe will tell you.']);

    if (salt > 5 || salt === 0) { /* the absurd note has this covered */ }
    else if (salt && salt < 1.4) out.push(['Light on salt', 'Under about 1.5% the dough ferments faster and slacker, and the loaf will taste flat in a way most people read as "something\'s missing". 2% is standard for a reason.']);
    else if (salt > 2.6) out.push(['Heavy on salt', 'Over about 2.5% salt starts holding the yeast back noticeably. The bulk will drag and the crumb will tighten. Fine if it\'s deliberate.']);

    return out.concat(liquidNotes(d)).concat(extraNotes(d));
  }

  /* ── the fun part: what happens when you start pouring odd things in ──
     These are tips, not physics. The flour absorption numbers are measured;
     what a bottle of cola does to a levain is "here is what usually goes
     wrong", and the page says so out loud in § 04. Each entry is written to
     read correctly whether it's a splash or a full swap, because the share
     word in front of it changes. */
  function liquidNotes(d) {
    var out = [], seen = {};
    state.liquids.forEach(function (l) {
      var x = LIQUIDS[l.id];
      if (!x || !x.note || seen[x.note] || !(+l.g > 0)) return;
      seen[x.note] = 1;
      var n = DATA.LIQUID_NOTES[x.note]; if (!n) return;
      var share = liquidShare(x.note);
      out.push(['blue', shareWords(share) + ' ' + n[0], n[1]]);
    });
    // The honest headline when there is no plain water left in the bowl.
    var plain = state.liquids.reduce(function (a, l) {
      return a + (l.id === 'water' ? (+l.g || 0) : 0);
    }, 0);
    if (d.liquidWeight > 0 && plain === 0) {
      out.push(['No water at all', 'Every drop in this dough is coming from something else. That is allowed and it is the interesting version, but the yeast is now working in whatever environment you have built for it — sugar, acid, alcohol, all of it. Assume the bulk runs longer than any timing on this site, and go by the dough.']);
    }
    return out;
  }


  function extraNotes(d) {
    var seen = {}, out = [];
    state.extras.forEach(function (e) {
      var x = EXTRAS[e.id]; if (!x || seen[x.note] || !(+e.g > 0)) return;
      seen[x.note] = 1;
      var n = DATA.EXTRA_NOTES[x.note];
      if (n) out.push(['blue', n[0], n[1]]);
    });
    // "we'll tell you when it's getting complicated" — the honest ceiling
    if (d.totalFlour && d.extraWeight / d.totalFlour > 0.25) {
      out.push(['This is getting adventurous', 'Your add-ins are over a quarter of the flour weight. That is no longer a sourdough with something in it — it is a different kind of bread that happens to be leavened with starter. Which is allowed, and fun, but do not judge the result against a plain loaf.']);
    }
    return out;
  }


  function isDefault() {
    return !state.touched;
  }

  function renderFlours() {
    var host = $('dl-rows'); if (!host) return;
    var total = state.flours.reduce(function (a, r) { return a + (+r.g || 0); }, 0);
    host.innerHTML = state.flours.map(function (r, i) {
      var pct = total ? Math.round((+r.g || 0) / total * 100) : 0;
      return '<div class="dl-row">' +
        '<select class="dl-select" data-i="' + i + '" data-k="id" aria-label="Flour type">' + TIPS.flourOptions(r.id) + '</select>' +
        '<input class="dl-num' + (isDefault() ? ' dl-preset' : '') + '" type="number" min="0" step="5" value="' + r.g + '" data-i="' + i + '" data-k="g" aria-label="Grams">' +
        '<span class="dl-pct">' + pct + '%</span>' +
        '<button class="dl-x" data-remove="' + i + '" aria-label="Remove this flour"' + (state.flours.length === 1 ? ' disabled' : '') + '>×</button>' +
        '</div>' +
        TIPS.tipFor(FLOURS[r.id], +r.g || 0, pct, 'blend', total, derive().totalFlour);
    }).join('');
  }

  /* Every liquid and every add-in carries its own guidance, and the guidance
     changes with the dose. `share` is percent of liquid for a liquid, percent
     of flour for an add-in; `band` is where "a splash" becomes "a lot". */
  /* A dose is only "a lot" if it is a large SHARE of its group *and* a real
     amount of dough. Share alone was the bug: one gram of vinegar in an
     otherwise empty liquid list is 100% of the liquid and 0.2% of the flour,
     and the tool was calling that a lot of vinegar. A band of 999 means the
     ingredient has no high state at all — water and white flour. */


  /* Typing grams deliberately does not rebuild the rows — that would steal
     focus mid-keystroke. So the percentages and the tips beside each row have
     to be repainted separately, or they sit there showing the old number
     while the totals above them move. */
  function repaintRows(hostId, rows, cat, basis, unitWord, totalFlour, ruinBasis) {
    var host = $(hostId); if (!host) return;
    var nodes = host.children, ri = 0;
    var shareOf = function (r) { return basis ? (+r.g || 0) / basis * 100 : 0; };
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.className.indexOf('dl-row') === 0) {
        var pctEl = node.querySelector('.dl-pct');
        if (pctEl && rows[ri]) pctEl.textContent = Math.round(shareOf(rows[ri])) + '%';
      } else if (node.className.indexOf('dl-tip') === 0) {
        var r = rows[ri];
        if (r) {
          var item = cat[r.id], share = shareOf(r);
          node.innerHTML = TIPS.tipInner(item, +r.g || 0, share, unitWord, ruinBasis, totalFlour);
          node.className = 'dl-tip' +
            (TIPS.isHighDose(item, share, +r.g || 0, totalFlour) ? ' dl-tip-high' : '');
        }
        ri++;
      }
    }
  }

  function liquidBasis() {
    var lt = state.liquids.reduce(function (a, l) { return a + (+l.g || 0); }, 0);
    var d = derive();
    var wanted = Math.max(0, d.totalFlour * recommend() / 100 - d.levainWater);
    return Math.max(lt, wanted);
  }


  function refreshRowReadouts() {
    var d = derive();
    var lt = state.liquids.reduce(function (a, l) { return a + (+l.g || 0); }, 0);
    var ft = state.flours.reduce(function (a, r) { return a + (+r.g || 0); }, 0);
    repaintRows('dl-rows',    state.flours,  FLOURS,  ft, 'blend',  d.totalFlour, ft);
    repaintRows('dl-liquids', state.liquids, LIQUIDS, lt, 'liquid', d.totalFlour, liquidBasis());
    repaintRows('dl-extras',  state.extras,  EXTRAS,  d.totalFlour, 'flour', d.totalFlour, d.totalFlour);
  }

  function renderLiquids() {
    var host = $('dl-liquids'); if (!host) return;
    var total = state.liquids.reduce(function (a, l) { return a + (+l.g || 0); }, 0);
    host.innerHTML = state.liquids.map(function (l, i) {
      var x = LIQUIDS[l.id] || {};
      var pctOfLiquid = total ? Math.round((+l.g || 0) / total * 100) : 0;
      return '<div class="dl-row">' +
        '<select class="dl-select" data-li="' + i + '" data-k="id" aria-label="Liquid">' + TIPS.liquidOptions(l.id) + '</select>' +
        '<input class="dl-num' + (isDefault() ? ' dl-preset' : '') + '" type="number" min="0" step="5" value="' + l.g + '" data-li="' + i + '" data-k="g" aria-label="Grams">' +
        '<span class="dl-pct">' + pctOfLiquid + '%</span>' +
        '<button class="dl-x" data-lremove="' + i + '" aria-label="Remove this liquid"' + (state.liquids.length === 1 ? ' disabled' : '') + '>×</button>' +
        '</div>' +
        TIPS.tipFor(x, +l.g || 0, pctOfLiquid, 'liquid', liquidBasis(), derive().totalFlour);
    }).join('');
  }

  function renderExtras() {
    var host = $('dl-extras'); if (!host) return;
    if (!state.extras.length) {
      host.innerHTML = '<p class="dl-empty">Nothing yet. Olive oil, walnuts, a splash of red wine, cold coffee — this is where the experiment goes.</p>';
      return;
    }
    var flourTotal = derive().totalFlour;
    host.innerHTML = state.extras.map(function (e, i) {
      var flourShare = flourTotal ? (+e.g || 0) / flourTotal * 100 : 0;
      return '<div class="dl-row">' +
        '<select class="dl-select" data-xi="' + i + '" data-k="id" aria-label="Ingredient">' + TIPS.extraOptions(e.id) + '</select>' +
        '<input class="dl-num" type="number" min="0" step="5" value="' + e.g + '" data-xi="' + i + '" data-k="g" aria-label="Grams">' +
        '<span class="dl-pct">' + pct(e.g, flourTotal) + '</span>' +
        '<button class="dl-x" data-xremove="' + i + '" aria-label="Remove this ingredient">×</button>' +
        '</div>' +
        TIPS.tipFor(EXTRAS[e.id], +e.g || 0, flourShare, 'flour', flourTotal, flourTotal);
    }).join('');
  }

  // the numeric readouts only — safe to call while a field has focus
  function refreshLive() {
    var d = derive(), rec = recommend(), hyd = Math.round(d.hydration);
    refreshRowReadouts();

    $('dl-flour-total').textContent = 'Flour on the bench: ' + g0(d.flourG) + ' g  ·  plus ' + g0(d.levainFlour) + ' g inside the starter = ' + g0(d.totalFlour) + ' g total';

    var lt = $('dl-liquid-total');
    if (lt) {
      lt.innerHTML = g0(d.liquidWeight) === g0(d.liquidWater)
        ? 'You are pouring in ' + g0(d.liquidWeight) + ' g of liquid, and all of it is water.'
        : 'You are pouring in ' + g0(d.liquidWeight) + ' g of liquid, but only <strong>' +
          g0(d.liquidWater) + ' g</strong> of that is water — the rest is sugar, alcohol and solids, ' +
          'which do not hydrate flour. The hydration below is worked out from the ' + g0(d.liquidWater) + ' g.';
    }
    setText('dl-levain-pct', pctLabel(state.levain, d.totalFlour));
    setText('dl-salt-pct', pctLabel(state.salt, d.totalFlour));

    // the recommendation block
    var want = waterFor(rec);
    $('dl-water-num').innerHTML = hyd + '<small>% hydration</small>';

    // What the add-ins do to the water once the dough is sitting there. Kept
    // out of the headline number so hydration still means what it means on
    // every other page of this site.
    var ht = $('dl-hyd-tip');
    if (ht) ht.innerHTML = TIPS.hydrationTip(hyd, rec);
    var st = $('dl-size-tip');
    if (st) st.innerHTML = TIPS.sizeTip(d.dough);

    var eff = Math.round(d.effective), fx = $('dl-effect');
    if (fx) {
      if (Math.abs(eff - hyd) < 2) fx.innerHTML = '';
      else if (eff < hyd) fx.innerHTML = '<strong>It will handle more like ' + eff + '%.</strong> ' +
        'Your add-ins soak up roughly ' + g0(Math.abs(d.extraNet)) + ' g of water once they are in the dough, ' +
        'so it will feel tighter on the bench than the number above suggests. Soak them first and this mostly goes away.';
      else fx.innerHTML = '<strong>It will handle more like ' + eff + '%.</strong> ' +
        'Your add-ins release roughly ' + g0(d.extraNet) + ' g of water into the dough, ' +
        'so expect it slacker than the number above suggests.';
    }
    var off = Math.abs(hyd - rec);
    $('dl-water-why').innerHTML = off <= 1
      ? 'That\'s where this blend wants to be. Each flour carries its own range from <a href="/flour-compendium.html">the Compendium</a>, weighted by how much of it you used.'
      : 'This blend suggests about <strong>' + rec + '%</strong>, which means <strong>' + want + ' g</strong> of plain water alongside everything else you\'ve poured. You\'re at ' + hyd + '%. Nothing wrong with that — just so you know. <button type="button" id="dl-accept" class="dl-add">set water to ' + want + ' g</button>';

    // the formula
    var rows = state.flours.filter(function (r) { return +r.g > 0; }).map(function (r) {
      var f = FLOURS[r.id];
      return row('<a href="' + f.url + '" class="content-link">' + f.name + '</a>', g0(r.g), pct(r.g, d.totalFlour));
    }).join('');
    state.liquids.filter(function (l) { return +l.g > 0 && LIQUIDS[l.id]; }).forEach(function (l) {
      rows += row(LIQUIDS[l.id].name, g0(l.g), pct(l.g, d.totalFlour));
    });
    rows += row('Active starter <span class="dl-hint">(100% hyd)</span>', g0(state.levain), pct(state.levain, d.totalFlour));
    rows += row('Fine sea salt', g1(state.salt), pct(state.salt, d.totalFlour));
    state.extras.filter(function (e) { return +e.g > 0 && EXTRAS[e.id]; }).forEach(function (e) {
      rows += row(EXTRAS[e.id].name, g0(e.g), pct(e.g, d.totalFlour));
    });
    $('dl-formula').innerHTML = rows +
      '<tr class="dl-out-total"><td>Total dough</td><td>' + g0(d.dough) + ' g</td><td>—</td></tr>';

    $('dl-note-total').innerHTML = 'Percentages are against the <em>total</em> ' + g0(d.totalFlour) +
      ' g of flour — the ' + g0(d.flourG) + ' g you weigh out plus the ' + g0(d.levainFlour) +
      ' g hiding inside your starter. Counting the water inside the starter and inside every liquid you poured, this dough is ' +
      g0(d.totalWater) + ' g of water to ' + g0(d.totalFlour) + ' g of flour: <strong>' + hyd +
      '% hydration</strong>. Everything in the bowl together comes to <strong>' + g0(d.dough) +
      ' g</strong> of finished dough. <a href="/tools/hydration.html">The hydration calculator</a> shows that working.';

    // consequences
    var cons = TIPS.absurdities(d).map(function (a) { return ['absurd', a[0], a[1]]; })
                .concat(consequences());
    $('dl-notes').innerHTML = cons.length ? cons.map(function (c) {
      var kind = (c[0] === 'blue' || c[0] === 'absurd') ? c[0] : '';
      var head = kind ? c[1] : c[0], body = kind ? c[2] : c[1];
      return '<div class="dl-note' + (kind ? ' dl-note-' + kind : '') + '">' +
             '<div class="dl-note-head">' + head + '</div>' +
             '<div class="dl-note-body">' + body + '</div></div>';
    }).join('') : '<p class="dl-note-empty">A straightforward white loaf — nothing here is going to surprise you. Add some whole grain, or a splash of something, and watch this fill up.</p>';

    var rf = $('dl-report-formula');
    if (rf) rf.value = formulaText();

    // the glance strip
    var blend = state.flours.length + (state.flours.length === 1 ? ' flour' : ' flours');
    flash({ 'g-hyd': hyd + '%', 'g-flour': g0(d.totalFlour) + ' g', 'g-dough': g0(d.dough) + ' g',
            'g-starter': Math.round(d.starterPct) + '%', 'g-wg': Math.round(flourPct(WHOLEGRAIN)) + '%',
            'g-count': blend });
  }

  /* A plain-text copy of the formula, carried along with a bake report so a
     submission arrives with the recipe attached rather than "I made the rye
     one". Hidden field, filled on every change. */
  function formulaText() {
    var d = derive(), lines = [];
    state.flours.forEach(function (r) {
      if (+r.g > 0 && FLOURS[r.id]) lines.push(FLOURS[r.id].name + ' ' + g0(r.g) + ' g');
    });
    state.liquids.forEach(function (l) {
      if (+l.g > 0 && LIQUIDS[l.id]) lines.push(LIQUIDS[l.id].name + ' ' + g0(l.g) + ' g');
    });
    lines.push('Starter (100% hyd) ' + g0(state.levain) + ' g');
    lines.push('Salt ' + g1(state.salt) + ' g');
    state.extras.forEach(function (e) {
      if (+e.g > 0 && EXTRAS[e.id]) lines.push(EXTRAS[e.id].name + ' ' + g0(e.g) + ' g');
    });
    return lines.join(' | ') +
      ' || total flour ' + g0(d.totalFlour) + ' g' +
      ' | hydration ' + Math.round(d.hydration) + '%' +
      ' | dough ' + g0(d.dough) + ' g';
  }

  function row(label, weight, pctStr) {
    return '<tr><td>' + label + '</td><td>' + weight + ' g</td><td>' + pctStr + '</td></tr>';
  }
  function pct(n, base) { return base ? Math.round((+n || 0) / base * 1000) / 10 + '%' : '—'; }
  function pctLabel(n, base) { return base ? pct(n, base) : ''; }
  function setText(id, v) { var el = $(id); if (el) el.textContent = v; }
  function setDisabled(id, v) { var el = $(id); if (el) el.disabled = v; }

  function flash(map) {
    Object.keys(map).forEach(function (k) {
      var el = $(k); if (!el || el.textContent === map[k]) return;
      el.textContent = map[k];
      el.classList.add('dl-flash');
      setTimeout(function () { el.classList.remove('dl-flash'); }, 260);
    });
  }

  function render(rebuild) {
    if (rebuild !== false) { renderFlours(); renderLiquids(); renderExtras(); }
    var note = $('dl-preset-note');
    if (note) note.style.display = isDefault() ? '' : 'none';
    // The three fixed inputs are static markup, so unlike the flour rows they
    // aren't re-rendered — their faded state has to be set here or "start over"
    // comes back looking like the reader had already edited it.
    ['levain', 'salt'].forEach(function (k) {
      var el = $('dl-' + k); if (!el) return;
      el.classList[isDefault() ? 'add' : 'remove']('dl-preset');
    });
    // one place decides whether each "+ add" is still available
    setDisabled('dl-add', state.flours.length >= 5);
    setDisabled('dl-liquid-add', state.liquids.length >= 4);
    setDisabled('dl-extra-add', state.extras.length >= 6);
    refreshLive();
  }

  /* Pull a row out and pour its grams into the biggest one left. Removing
     the water after adding beer means "make it all beer", not "make half as
     much dough" — the batch size should survive a swap. */
  function removeInto(list, i) {
    var gone = +list[i].g || 0;
    list.splice(i, 1);
    if (!list.length || !gone) return;
    var big = list.reduce(function (a, r) { return (+r.g || 0) > (+a.g || 0) ? r : a; }, list[0]);
    big.g = (+big.g || 0) + gone;
  }

  function touch() {
    if (state.touched) return;
    state.touched = true;
    // drop the faded preset styling the moment they make it theirs
    var els = document.querySelectorAll('.dl-preset');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('dl-preset');
    var note = $('dl-preset-note'); if (note) note.style.display = 'none';
  }

  /* ── wiring ── */
  function init() {
    if (!$('dl-rows')) return;
    render();

    $('dl-rows').addEventListener('input', onRowInput);
    $('dl-rows').addEventListener('change', onRowInput);
    $('dl-rows').addEventListener('click', function (e) {
      var i = e.target.getAttribute('data-remove');
      if (i === null) return;
      touch(); removeInto(state.flours, +i); render();
    });

    $('dl-liquids').addEventListener('input', onLiquidInput);
    $('dl-liquids').addEventListener('change', onLiquidInput);
    $('dl-liquids').addEventListener('click', function (e) {
      var i = e.target.getAttribute('data-lremove');
      if (i === null) return;
      touch(); removeInto(state.liquids, +i); render();
    });

    $('dl-liquid-add').addEventListener('click', function () {
      var used = state.liquids.map(function (l) { return l.id; });
      var next = Object.keys(LIQUIDS).filter(function (k) { return used.indexOf(k) === -1; })[0] || 'beer';
      // Same rule as the flours: pour the new one out of the biggest existing
      // liquid, so adding beer swaps for water rather than doubling the batch.
      var big = state.liquids.reduce(function (a, l) { return (+l.g || 0) > (+a.g || 0) ? l : a; }, state.liquids[0]);
      var share = Math.round((+big.g || 0) / 2 / 5) * 5;
      big.g = Math.max(0, (+big.g || 0) - share);
      state.liquids.push({ id: next, g: share });
      touch(); render();
    });

    $('dl-extras').addEventListener('input', onExtraInput);
    $('dl-extras').addEventListener('change', onExtraInput);
    $('dl-extras').addEventListener('click', function (e) {
      var i = e.target.getAttribute('data-xremove');
      if (i === null) return;
      touch(); state.extras.splice(+i, 1); render();
    });

    $('dl-add').addEventListener('click', function () {
      var used = state.flours.map(function (r) { return r.id; });
      var next = Object.keys(FLOURS).filter(function (k) { return used.indexOf(k) === -1; })[0] || 'rye';
      // Take the new flour's grams out of the biggest row rather than piling
      // more on top — adding a flour should change the blend, not the batch.
      var big = state.flours.reduce(function (a, r) { return (+r.g || 0) > (+a.g || 0) ? r : a; }, state.flours[0]);
      var share = Math.round((+big.g || 0) / 2 / 5) * 5;
      big.g = Math.max(0, (+big.g || 0) - share);
      state.flours.push({ id: next, g: share });
      touch(); render();
    });

    $('dl-extra-add').addEventListener('click', function () {
      var used = state.extras.map(function (e) { return e.id; });
      var next = Object.keys(EXTRAS).filter(function (k) { return used.indexOf(k) === -1; })[0] || 'oliveoil';
      state.extras.push({ id: next, g: 30 });
      touch(); render();
    });

    ['levain', 'salt'].forEach(function (k) {
      var el = $('dl-' + k); if (!el) return;
      el.addEventListener('input', function () {
        state[k] = +el.value || 0; touch(); render(false);
      });
    });

    $('dl-reset').addEventListener('click', function () {
      state.flours  = DEFAULTS.flours.map(function (r) { return { id: r.id, g: r.g }; });
      state.liquids = DEFAULTS.liquids.map(function (l) { return { id: l.id, g: l.g }; });
      state.levain = DEFAULTS.levain; state.salt = DEFAULTS.salt;
      state.extras = []; state.touched = false;
      $('dl-levain').value = state.levain;
      $('dl-salt').value = state.salt;
      render();
    });

    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'dl-accept') {
        var want = waterFor(recommend());
        var w = null;
        state.liquids.forEach(function (l) { if (l.id === 'water') w = l; });
        // They may have removed water entirely — put the row back rather than
        // silently doing nothing when the button says it will set the water.
        if (w) w.g = want; else state.liquids.unshift({ id: 'water', g: want });
        touch(); render();
      }
    });

    var pb = $('dl-print');
    if (pb) pb.addEventListener('click', function () { window.print(); });
  }

  function onRowInput(e) {
    var i = e.target.getAttribute('data-i'), k = e.target.getAttribute('data-k');
    if (i === null || !k) return;
    state.flours[+i][k] = k === 'g' ? (+e.target.value || 0) : e.target.value;
    touch();
    // typing grams must not rebuild the inputs — it would steal focus
    render(k !== 'g');
  }

  function onLiquidInput(e) {
    var i = e.target.getAttribute('data-li'), k = e.target.getAttribute('data-k');
    if (i === null || !k) return;
    state.liquids[+i][k] = k === 'g' ? (+e.target.value || 0) : e.target.value;
    touch();
    // typing grams must not rebuild the inputs — it would steal focus
    render(k !== 'g');
  }

  function onExtraInput(e) {
    var i = e.target.getAttribute('data-xi'), k = e.target.getAttribute('data-k');
    if (i === null || !k) return;
    state.extras[+i][k] = k === 'g' ? (+e.target.value || 0) : e.target.value;
    touch();
    render(k !== 'g');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
