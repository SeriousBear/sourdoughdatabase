/* =============================================================
   dough-lab-tips.js — the presentation layer for Choose Your Own
   Crumb. Loaded between dough-lab-data.js and dough-lab.js on
   /recipes/build-your-own.html

   Split out of dough-lab.js in August 2026 at 740 lines. The
   boundary is deliberate: everything in here is a PURE function
   that turns numbers plus a catalogue entry into reader-facing
   HTML. Nothing here reads page state, touches the DOM, or knows
   what the reader has typed — it is handed values and returns a
   string.

   That is what makes it safe to test in isolation and safe to
   rewrite without breaking the bench.

   STILL IN dough-lab.js, on purpose: consequences(), liquidNotes()
   and extraNotes(). They read `state` directly, so moving them
   means inventing a context object to pass around, and that is a
   refactor with real regression risk for no immediate gain. If
   this file needs splitting again, make those pure first and move
   them here — that is the next seam, not an arbitrary line count.
   ============================================================= */

window.DOUGH_LAB_TIPS = (function () {

  var DATA = window.DOUGH_LAB_DATA || {};
  var FLOURS     = DATA.FLOURS     || {};
  var LIQUIDS    = DATA.LIQUIDS    || {};
  var EXTRAS     = DATA.EXTRAS     || {};
  var HYDRATION  = DATA.HYDRATION  || [];
  var DOUGH_SIZE = DATA.DOUGH_SIZE || [];
  var ABSURD     = DATA.ABSURD     || {};

  var g0 = function (n) { return Math.round(n); };

  var REAL_DOSE = 2;   // percent of total flour, below which nothing is "a lot"


  /* ── render ── */
  function flourOptions(sel) {
    return Object.keys(FLOURS).map(function (k) {
      return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + FLOURS[k].name + '</option>';
    }).join('');
  }


  function liquidOptions(sel) {
    return Object.keys(LIQUIDS).map(function (k) {
      return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + LIQUIDS[k].name + '</option>';
    }).join('');
  }


  function extraOptions(sel) {
    var groups = {}, order = [];
    Object.keys(EXTRAS).forEach(function (k) {
      var gname = EXTRAS[k].group;
      if (!groups[gname]) { groups[gname] = []; order.push(gname); }
      groups[gname].push(k);
    });
    return order.map(function (gname) {
      return '<optgroup label="' + gname + '">' + groups[gname].map(function (k) {
        return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + EXTRAS[k].name + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }


  function isHighDose(item, share, grams, totalFlour) {
    if (!item || item.band >= 999) return false;
    if (totalFlour && grams / totalFlour * 100 < REAL_DOSE) return false;
    return share >= item.band;
  }


  function sentence(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }


  /* The ceiling line: the point where this ingredient stops being a choice
     and starts being a problem, expressed in grams for the dough actually on
     the bench rather than as an abstract percentage. */
  function ruinLine(item, share, basis, grams, totalFlour) {
    if (!item || !item.ruin) return '';
    // Same floor as the dose test. Without it, one gram of vinegar in an
    // otherwise empty liquid list reads as 100% and trips the ceiling at
    // "about 0 g", which is both wrong and faintly insulting.
    var real = !totalFlour || grams / totalFlour * 100 >= REAL_DOSE;
    var past = real && share >= item.ruinPct;
    var at = basis ? 'about ' + g0(basis * item.ruinPct / 100) + ' g in this dough'
                   : item.ruinPct + '% of the group';
    return '<div class="dl-tip-ruin' + (past ? ' dl-tip-ruin-hit' : '') + '">' +
      '<span class="dl-tip-dose-label">' +
      (past ? 'You are past the ceiling — ' : 'Ceiling · ') + at + '</span>' +
      sentence(item.ruin) + '</div>';
  }


  function tipInner(item, grams, share, unitWord, basis, totalFlour) {
    if (!item || !item.blurb) return '';
    var over = isHighDose(item, share, grams, totalFlour);
    return '<div class="dl-tip-blurb">' + item.blurb + '</div>' +
      '<div class="dl-tip-dose"><span class="dl-tip-dose-label">' +
        g0(grams) + ' g — ' + Math.round(share) + '% of your ' + unitWord +
        (over ? ', which is a lot' : '') + '</span> ' + (over ? item.high : item.low) +
      '</div>' + ruinLine(item, share, basis, grams, totalFlour);
  }


  function tipFor(item, grams, share, unitWord, basis, totalFlour) {
    var inner = tipInner(item, grams, share, unitWord, basis, totalFlour);
    if (!inner) return '';
    return '<div class="dl-tip' +
      (isHighDose(item, share, grams, totalFlour) ? ' dl-tip-high' : '') +
      '">' + inner + '</div>';
  }


  function band(list, v) {
    for (var i = 0; i < list.length; i++) if (v <= list[i].max) return list[i];
    return list[list.length - 1];
  }


  /* Hydration gets the same treatment as any ingredient: what this number
     means for how the dough behaves, not just what the number is. */
  function hydrationTip(hyd, rec) {
    var b = band(HYDRATION, hyd);
    if (!b) return '';
    var off = '';
    if (hyd - rec >= 6) off = ' Your blend suggests about ' + rec + '%, so this is <strong>' +
      Math.round(hyd - rec) + ' points wetter</strong> than these flours want.';
    else if (rec - hyd >= 6) off = ' Your blend suggests about ' + rec + '%, so this is <strong>' +
      Math.round(rec - hyd) + ' points drier</strong> than these flours want.';
    return '<div class="dl-tip' + (b.warn ? ' dl-tip-high' : '') + '">' +
      '<div class="dl-tip-dose"><span class="dl-tip-dose-label">' + hyd + '% — ' + b.label +
      '</span>' + b.body + off + '</div></div>';
  }


  /* Finished weight is the number that decides whether this fits the kit the
     reader actually owns. Nobody else tells them that. */
  function sizeTip(dough) {
    var b = band(DOUGH_SIZE, dough);
    if (!b) return '';
    return '<div class="dl-tip' + (b.warn ? ' dl-tip-high' : '') + '">' +
      '<div class="dl-tip-dose"><span class="dl-tip-dose-label">' + g0(dough) + ' g — ' + b.label +
      '</span>' + b.body + '</div></div>';
  }


  /* The point where the numbers stop describing bread. */
  function absurdities(d) {
    var out = [], flourG = d.flourG;
    if (!flourG) { out.push(ABSURD.noflour); return out; }
    if (d.saltPct > 5) out.push(ABSURD.salt);
    else if (d.saltPct === 0) out.push(ABSURD.nosalt);
    if (d.starterPct > 50) out.push(ABSURD.starter);
    if (d.hydration > 110) out.push(ABSURD.hydration);
    if (d.extraWeight > d.totalFlour) out.push(ABSURD.extras);
    return out.filter(Boolean);
  }

  return {
    flourOptions: flourOptions,
    liquidOptions: liquidOptions,
    extraOptions: extraOptions,
    isHighDose: isHighDose,
    ruinLine: ruinLine,
    tipInner: tipInner,
    tipFor: tipFor,
    hydrationTip: hydrationTip,
    sizeTip: sizeTip,
    absurdities: absurdities
  };

})();
