/* =============================================================
   fermentation.js — the shared timing engine

   The one place fermentation timing lives. Used by
   /recipes/build-your-own.html and tools/schedule.html. Both pages
   held their own copy of these tables once; the schedule builder's
   copy was silently hardcoded to white flour at 20% starter, so the
   two tools disagreed by about 90 minutes on a rye dough. Merged
   August 2026. Do not copy these tables anywhere — import this.

   ── Where the numbers come from ──────────────────────────────

   The three tables are lifted verbatim from schedule.js, which
   has been serving them since before this file existed. Each row
   is [temperature °F, centre minutes, half-range minutes], and
   `interpolate` reads between rows.

   The BASE tables assume the reference dough: white flour, 20%
   starter, around 70% hydration, nothing else in the bowl. That
   assumption used to be invisible. Everything below it is the
   correction for a dough that is not that.

   ── What the multipliers are, honestly ───────────────────────

   Estimates. They are the direction and rough magnitude that
   bakers consistently report, not measurements: whole grain and
   rye ferment faster, more starter is faster, acid and heavy
   sugar are slower. The shape of each curve is chosen so the
   reference dough returns exactly 1.0 and nothing runs away at
   the extremes.

   Treat the output as a starting bracket to check the dough
   against, never as a clock to obey. The page says so too.
   ============================================================= */

window.FERMENTATION = (function () {

  var BULK_DATA = [
    [64, 540, 60], [66, 465, 45], [68, 405, 45], [70, 352, 37],
    [72, 307, 37], [74, 270, 30], [76, 240, 30], [78, 210, 28],
    [80, 187, 22], [82, 165, 15], [84, 150, 15], [86, 132, 12]
  ];

  var STARTER_PEAK_DATA = [
    [64, 600, 120], [66, 510, 90], [68, 450, 90], [70, 390, 75],
    [72, 330, 60], [74, 300, 60], [76, 255, 45], [78, 210, 45],
    [80, 180, 30], [82, 150, 30], [84, 120, 25], [86, 90, 20]
  ];

  var SAME_DAY_PROOF_DATA = [
    [64, 180, 30], [66, 165, 27], [68, 150, 25], [70, 135, 22],
    [72, 120, 20], [74, 105, 18], [76, 90, 15], [78, 78, 12],
    [80, 68, 10], [82, 58, 8], [84, 50, 8], [86, 42, 7]
  ];

  function interpolate(data, tempF) {
    if (tempF <= data[0][0]) return { center: data[0][1], range: data[0][2] };
    var last = data[data.length - 1];
    if (tempF >= last[0]) return { center: last[1], range: last[2] };
    for (var i = 0; i < data.length - 1; i++) {
      if (tempF >= data[i][0] && tempF <= data[i + 1][0]) {
        var t = (tempF - data[i][0]) / (data[i + 1][0] - data[i][0]);
        return {
          center: Math.round(data[i][1] + t * (data[i + 1][1] - data[i][1])),
          range:  Math.round(data[i][2] + t * (data[i + 1][2] - data[i][2]))
        };
      }
    }
    return { center: 300, range: 30 };
  }

  var REF = { starterPct: 20, hydration: 70 };

  /* How much faster or slower this dough runs than the reference one.
     Below 1 is faster. Each term is independent and multiplied together. */
  function speedFactor(o) {
    o = o || {};
    var f = 1;

    // More starter, more organisms, faster. Square-root curve so doubling the
    // starter does not halve the time — it does not, in practice.
    var st = Math.max(1, +o.starterPct || REF.starterPct);
    f *= Math.sqrt(REF.starterPct / st);

    // Whole grain carries more of everything the culture eats, plus enzymes.
    f *= 1 - 0.0030 * Math.min(100, +o.wholeGrainPct || 0);

    // Rye is faster again on top of that.
    f *= 1 - 0.0040 * Math.min(100, +o.ryePct || 0);

    // Wetter dough moves a little faster; drier a little slower.
    var hyd = +o.hydration || REF.hydration;
    f *= 1 - 0.0035 * Math.max(-25, Math.min(30, hyd - REF.hydration));

    // Acid slows the yeast down more than it slows the bacteria.
    f *= 1 + 0.0045 * Math.min(100, +o.acidSharePct || 0);

    // Sugar feeds the yeast at low doses and dehydrates it at high ones. Only
    // the high end shows up as a timing change worth predicting.
    f *= 1 + 0.020 * Math.max(0, (+o.sugarPct || 0) - 10);

    // Salt above the standard 2% holds things back.
    f *= 1 + 0.10 * Math.max(0, (+o.saltPct || 2) - 2);

    // Never claim something absurd at the extremes.
    return Math.max(0.35, Math.min(3.0, f));
  }

  function scaled(data, tempF, o) {
    var b = interpolate(data, tempF);
    var f = speedFactor(o);
    var center = Math.round(b.center * f);
    var range  = Math.round(b.range * f);
    return { center: center, range: range, lo: center - range, hi: center + range, factor: f };
  }

  function bulk(tempF, o)        { return scaled(BULK_DATA, tempF, o); }
  function starterPeak(tempF, o) { return scaled(STARTER_PEAK_DATA, tempF, o); }
  function sameDayProof(tempF, o){ return scaled(SAME_DAY_PROOF_DATA, tempF, o); }

  /* Formatting helpers, so every caller says it the same way. */
  function hours(minutes) {
    var h = minutes / 60;
    if (h < 1) return Math.round(minutes) + ' min';
    return (Math.round(h * 10) / 10).toString().replace(/\.0$/, '') + ' hr';
  }

  function span(r) {
    var lo = r.lo / 60, hi = r.hi / 60;
    var f = function (n) { return (Math.round(n * 10) / 10).toString().replace(/\.0$/, ''); };
    return f(lo) + '–' + f(hi) + ' hrs';
  }

  /* A plain-language read on how far off the reference this dough is. */
  function pace(f) {
    // Always comparative at the SAME temperature. Without that clause, "faster
    // than a plain white loaf" sitting next to a six-hour bulk in a cold
    // kitchen reads as a contradiction.
    var tail = ' than a plain white loaf in the same kitchen';
    if (f <= 0.75) return 'much faster' + tail;
    if (f <= 0.90) return 'faster' + tail;
    if (f < 1.10)  return 'at about the pace of a plain white loaf';
    if (f < 1.35)  return 'slower' + tail;
    return 'much slower' + tail;
  }

  return {
    interpolate: interpolate,
    speedFactor: speedFactor,
    bulk: bulk,
    starterPeak: starterPeak,
    sameDayProof: sameDayProof,
    hours: hours,
    span: span,
    pace: pace,
    REFERENCE: REF,
    TABLES: { BULK: BULK_DATA, STARTER_PEAK: STARTER_PEAK_DATA, PROOF: SAME_DAY_PROOF_DATA }
  };

})();
