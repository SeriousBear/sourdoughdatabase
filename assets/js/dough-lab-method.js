/* =============================================================
   dough-lab-method.js — writes § 05 from what is on the bench
   /recipes/build-your-own.html

   Loaded after dough-lab-data.js, dough-lab-tips.js and
   fermentation.js, before dough-lab.js.

   This is the piece the "Rewrite the method" button was waiting
   for. It takes a snapshot of the bench, asks fermentation.js how
   fast this particular dough will move, and returns the ten steps
   with the weights, the timings and the warnings already filled
   in for that dough.

   Times are ELAPSED, counted from the moment you mix — not wall
   clock. Wall clock needs a target bake time, which is what
   /tools/schedule.html is for, and inventing "2:00 pm" here would
   be false precision.

   Every conditional note carries the reason it fired, in the
   reader's own numbers. A warning with no stated cause is just
   noise, and the reader cannot tell whether it applies to them.
   ============================================================= */

window.DOUGH_LAB_METHOD = (function () {

  var F = window.FERMENTATION;

  function g0(n) { return Math.round(n); }

  /* Elapsed-time cursor, rendered as +H:MM from the mix. */
  function Clock() { this.m = 0; }
  Clock.prototype.at = function () {
    var h = Math.floor(this.m / 60), m = Math.round(this.m % 60);
    return '+' + h + ':' + (m < 10 ? '0' : '') + m;
  };
  Clock.prototype.add = function (mins) { this.m += mins; return this; };

  function mins(n) {
    if (n < 60) return Math.round(n) + ' min';
    var h = n / 60;
    return (Math.round(h * 10) / 10).toString().replace(/\.0$/, '') + ' hr';
  }

  /* A conditional note. `why` is the trigger stated in the reader's numbers. */
  function note(why, body, warn) {
    return '<div class="dl-cond' + (warn ? ' dl-cond-warn' : '') + '">' +
      '<span class="dl-cond-tag">' + why + '</span>' +
      '<div class="dl-cond-body">' + body + '</div></div>';
  }

  function callout(title, body) {
    return '<div class="rc-callout rc-callout-tool"><strong>' + title + '</strong>' + body + '</div>';
  }

  function step(id, title, time, body) {
    return '<li class="rc-step" id="step-' + id + '">' +
      '<div class="rc-step-title">' + title + '</div>' +
      '<div class="rc-step-time">' + time + '</div>' +
      '<div class="rc-step-body">' + body + '</div></li>';
  }

  /* ── the build ── */
  function build(c) {
    if (!F) return '';

    var opts = {
      starterPct: c.starterPct, ryePct: c.ryePct, wholeGrainPct: c.wholeGrainPct,
      hydration: c.hydration, acidSharePct: c.acidSharePct,
      sugarPct: c.sugarPct, saltPct: c.saltPct
    };
    var bulkR  = F.bulk(c.tempF, opts);
    var peakR  = F.starterPeak(c.tempF, opts);
    var factor = bulkR.factor;

    var wet = c.hydration >= 78;
    var veryWet = c.hydration >= 85;
    var heavyRye = c.ryePct >= 20;
    var heavyWG = c.wholeGrainPct >= 40;

    // Autolyse: shorter when there is little gluten to develop.
    var autolyse = (heavyRye || heavyWG) ? 30 : 60;

    // Fold sets scale with how fast the bulk is running.
    var sets = bulkR.center < 200 ? 3 : 4;

    var clock = new Clock();
    var out = [];

    /* 1 — feed the starter */
    out.push(step(1, 'Feed the starter',
      'Before you mix · ' + F.span(peakR) + ' ahead',
      '<p>You need <strong>' + g0(c.levain) + ' g</strong> of starter at peak, so feed at least <strong>' +
      g0(c.levain * 1.2) + ' g</strong> to leave yourself a margin and something to keep. A 1:1:1 by weight at room temperature gets you there in roughly ' +
      F.span(peakR) + ' at ' + c.tempF + '°F.</p>' +
      '<p>Peak means roughly doubled, domed, smelling yeasty rather than sharp. Past peak it has spent its rise and your bulk will crawl.</p>' +
      callout("Don't have a starter yet?",
        ' Nothing else here works without one. <a href="/starter-school/create-a-starter.html">Make one from scratch</a> — flour, water, and about two weeks.') +
      (c.starterPct >= 25
        ? note('Because you are at ' + Math.round(c.starterPct) + '% starter',
            'That is a big dose, and it is why the bulk below is short. Everything will move fast — be ready to cut it earlier than you think. <a href="/starter-school/feeding-and-ratios.html">Feeding and ratios</a>')
        : c.starterPct <= 12
        ? note('Because you are at ' + Math.round(c.starterPct) + '% starter',
            'A small dose means a long, slow build — more flavour, more patience. The bulk below already accounts for it. <a href="/starter-school/feeding-and-ratios.html">Feeding and ratios</a>')
        : '')
    ));

    /* 2 — mix */
    out.push(step(2, 'Mix the flour and the liquid',
      clock.at() + ' · 5 minutes, then ' + mins(autolyse) + ' rest',
      '<p>Whisk <strong>' + g0(c.flourG) + ' g of flour</strong> and <strong>' + c.liquidClause +
      '</strong> together until no dry flour is left anywhere. It will look shaggy and unpromising. That is correct.</p>' +
      '<p>Cover it and leave it ' + mins(autolyse) + '. The flour hydrates fully and the gluten starts organising itself without you kneading anything.</p>' +
      (autolyse === 30
        ? note(heavyRye ? 'Because you used ' + Math.round(c.ryePct) + '% rye'
                        : 'Because you are at ' + Math.round(c.wholeGrainPct) + '% whole grain',
            'The autolyse is cut to <strong>30 minutes</strong>. There is little gluten here to develop and the enzymes are already busy — a long rest just gets you a stickier dough with nothing to show for it. <a href="/techniques/autolyse.html">The full case, both ways</a>')
        : callout('Why an hour, and when to skip it',
            ' Autolyse is optional and behaves differently with whole grain — <a href="/techniques/autolyse.html">the full case, both ways</a>.')) +
      (veryWet
        ? note('Because you are at ' + Math.round(c.hydration) + '% hydration',
            'Hold back about <strong>' + g0(c.liquidWeight * 0.1) + ' g</strong> of the liquid and add it after the salt. It is far easier to loosen a stiff dough than to rescue a soup.', true)
        : '') +
      (c.hasEnzymeRisk
        ? note('Because you used raw fruit juice',
            'If that juice is pineapple, papaya or kiwi, <strong>stop</strong>. Those carry proteases that dissolve gluten outright — not a small risk, a ruined dough. Heat the juice first to kill the enzyme, or use apple, grape or orange.', true)
        : '')
    ));
    clock.add(autolyse);

    /* 3 — starter and salt */
    out.push(step(3, 'Add the starter and the salt',
      clock.at() + ' · 3 minutes',
      '<p>Add <strong>' + g0(c.levain) + ' g</strong> of peaked starter and <strong>' + c.saltLabel +
      '</strong> of salt straight on top. Wet one hand and squeeze the dough repeatedly, folding it over itself, until there are no streaks. About three minutes.</p>' +
      '<p>It will feel slack and slightly wrong. It is supposed to. Do not add flour.</p>' +
      (c.fatPct > 0
        ? note('Because you added fat',
            'Hold the ' + c.fatNames + ' back until the gluten has built — the end of the second fold. Fat added at the mix coats the strands before they can link up, and you lose structure you cannot get back.')
        : '')
    ));
    clock.add(5);

    /* 4 — bulk */
    var foldEvery = Math.round(bulkR.center / (sets + 2) / 5) * 5;
    var foldList = [];
    for (var i = 1; i <= sets; i++) foldList.push(mins(foldEvery * i));
    out.push(step(4, 'Bulk ferment, with folds',
      clock.at() + ' · ' + F.span(bulkR) + ' · ' + sets + ' sets',
      '<p>Cover and leave it at <strong>' + c.tempF + '°F</strong>. Do one set of folds at ' +
      foldList.slice(0, -1).join(', ') + ' and ' + foldList[foldList.length - 1] +
      ', then leave it completely alone.</p>' +
      '<p>This blend runs <strong>' + F.pace(factor) + '</strong>' +
      (Math.abs(factor - 1) > 0.08
        ? ' — about ' + Math.round(Math.abs(1 - factor) * 100) + '% ' + (factor < 1 ? 'faster' : 'slower') + '.'
        : '.') +
      ' The bracket above is where to start looking, not a timer.</p>' +
      (wet
        ? note('Because you are at ' + Math.round(c.hydration) + '% hydration',
            'Use <strong>coil folds</strong>, not stretch and folds. At this slack a normal stretch tears the dough rather than building it. <a href="/techniques/coil-folds.html">How to coil fold</a>', veryWet)
        : callout('New to folding?',
            ' How hard to pull, when to stop, and why more sets are not better — <a href="/techniques/stretch-and-fold.html">stretch and fold</a>.')) +
      (heavyRye
        ? note('Because you used ' + Math.round(c.ryePct) + '% rye',
            'Rye ferments quickly and it will not warn you politely. That is why there are ' + sets + ' sets here rather than four, and why the bracket above is shorter than a white loaf would get.')
        : '') +
      (c.acidSharePct >= 25
        ? note('Because ' + Math.round(c.acidSharePct) + '% of your liquid is acidic',
            'Acid slows the yeast more than the bacteria, so this will take longer and taste sharper than the timing alone suggests. It also weakens the gluten the whole way through — go gentler on every fold.', c.acidSharePct >= 50)
        : '') +
      (c.sugarPct > 10
        ? note('Because you added ' + Math.round(c.sugarPct) + '% sugar',
            'Past about 10% of flour weight, sugar pulls water out of the yeast rather than feeding it, so the bulk gets <em>slower</em>, not faster. That surprises people every time.', c.sugarPct > 20)
        : '')
    ));
    clock.add(bulkR.center);

    /* 5 — judge it */
    var riseTarget = (c.wholeGrainPct >= 30 || heavyRye) ? '40–50%' : '50%';
    out.push(step(5, 'Judge the bulk — the one that matters',
      clock.at() + ' · volume, not the clock',
      '<p>This is the skill. Everything else here is mechanical; this is the part you are actually learning.</p>' +
      '<p>Stop when three things are true: the dough has risen about <strong>' + riseTarget +
      '</strong>, the edges where it meets the bowl are domed rather than sunken, and the whole mass jiggles as one soft body when you shake it.</p>' +
      '<p>If the bracket has run out and it has not done that, wait. If it got there early, move on.</p>' +
      callout('This is the skill',
        ' Volume, dome, jiggle, and the aliquot-jar trick that turns "' + riseTarget + '" from a guess into a measurement — <a href="/techniques/reading-the-bulk.html">reading the bulk</a>.') +
      (c.wholeGrainPct >= 30
        ? note('Because you are at ' + Math.round(c.wholeGrainPct) + '% whole grain',
            'Aim for the lower end. Whole grain doughs hit their ceiling earlier and collapse harder past it, and the bran hides the surface bubbles you would normally read.')
        : '')
    ));

    /* 6 — preshape */
    out.push(step(6, 'Pre-shape and rest',
      clock.at() + ' · 5 minutes, then 20 rest',
      '<p>Tip the dough onto an unfloured counter — you need the friction. Fold the edges in, flip it seam-side down, and drag it toward you a few times to tighten the surface. Leave it uncovered for twenty minutes.</p>'
    ));
    clock.add(25);

    /* 7 — shape */
    out.push(step(7, 'Shape',
      clock.at() + ' · 5 minutes',
      '<p>Flour the top, flip it, and shape into a boule or a bâtard. What you are building is surface tension — a skin tight enough to hold the loaf up while it springs. Seam side up into a floured banneton.</p>' +
      callout('Tension, not decoration',
        ' The three shapes and how to know you have enough tension — <a href="/techniques/shaping.html">shaping</a>.') +
      (heavyRye
        ? note('Because you used ' + Math.round(c.ryePct) + '% rye',
            'Go <strong>gentler and faster</strong>, hands wet rather than floured. There is less gluten here to build tension with, and over-handling degasses it for nothing. A slightly loose shape beats a torn skin.')
        : '') +
      (c.einkornPct >= 20 || c.speltPct >= 30
        ? note('Because of the ' + (c.einkornPct >= 20 ? 'einkorn' : 'spelt'),
            'This gluten tears without warning and does not come back. Stop shaping earlier than feels finished.', true)
        : '') +
      (c.inclusionNames
        ? note('Because you added ' + c.inclusionNames,
            'Fold those in now if you have not already — at the last set, not at the mix. They cut the gluten as they go through, so the later they arrive the less damage they do.')
        : '') +
      (c.doughSizeWarn ? note('Because this is a ' + g0(c.dough) + ' g dough', c.doughSizeWarn, true) : '')
    ));
    clock.add(5);

    /* 8 — retard */
    var retardHi = heavyRye ? 12 : 16;
    out.push(step(8, 'Cold retard',
      clock.at() + ' · 12–' + retardHi + ' hours',
      '<p>Straight into the fridge. This buys flavour, makes the loaf far easier to score, and puts the bake on your schedule instead of the dough\'s.</p>' +
      callout('What the cold is doing',
        ' Cold slows yeast far more than bacteria, which is why you get flavour without extra rise — <a href="/techniques/cold-retard.html">the cold retard</a>.') +
      (heavyRye
        ? note('Because you used ' + Math.round(c.ryePct) + '% rye',
            'Cap it at <strong>12 hours</strong>. Rye keeps working in the cold longer than wheat does, and a sixteen-hour retard on this dough comes out slack and sour rather than sharp.')
        : '') +
      (veryWet
        ? note('Because you are at ' + Math.round(c.hydration) + '% hydration',
            'The retard is doing more than flavour here — it is the only thing that will make this dough firm enough to score. Do not skip it.', true)
        : '')
    ));

    /* 9 — bake, scaled to the actual loaf */
    var b = c.dough < 500  ? [15, 18] :
            c.dough < 1100 ? [20, 23] :
            c.dough < 1500 ? [22, 28] : [25, 32];
    out.push(step(9, 'Score and bake',
      'Next morning · ' + b[0] + ' min covered, ' + b[1] + ' min uncovered',
      '<p>Preheat the Dutch oven to 500°F / 260°C for a full hour. Turn the cold loaf out onto parchment, score it decisively in one motion, and get the lid on. <strong>' +
      b[0] + ' minutes covered</strong>, then drop to 450°F / 230°C, lid off, for another <strong>' + b[1] +
      '</strong>. Internal temperature should read 205–210°F / 96–99°C.</p>' +
      '<p>Take it darker than feels comfortable. Pale crust is the most common self-inflicted wound in sourdough.</p>' +
      callout('Steam is the whole trick',
        ' Why covered-then-uncovered works, and what to do with no Dutch oven — <a href="/techniques/steam.html">steam and the bake</a>.') +
      (heavyRye
        ? note('Because you used ' + Math.round(c.ryePct) + '% rye',
            'Score <strong>shallow</strong>, or skip it and let the loaf burst where it wants. Rye does not spring the way wheat does, and a deep ear-style cut just opens a flat wound.')
        : '') +
      (c.sugarPct > 5 || c.hasDairy
        ? note('Because of the ' + (c.sugarPct > 5 ? 'sugar' : 'dairy'),
            'The crust will colour much earlier than the middle is done. Tent it with foil once it looks right and keep baking to temperature, not to colour.', true)
        : '') +
      (c.hasCheese
        ? note('Because you added cheese',
            'Anything touching the base of the pot will burn there before the loaf is done. Keep it off the bottom, and hold some back for the top.', true)
        : '')
    ));

    /* 10 — cool */
    out.push(step(10, 'Cool — properly',
      'At least 2 hours' + (heavyRye ? ' · overnight for this one' : ''),
      '<p>On a rack, not a board. The loaf is still cooking as it cools and the crumb is still setting. Cutting it hot gums it, and you will blame the recipe.</p>' +
      (heavyRye
        ? note('Because you used ' + Math.round(c.ryePct) + '% rye',
            'Wait <strong>overnight</strong> if you can stand to. Rye crumb sets slowly and improves for a full day — cutting it at two hours is where most "gummy rye" complaints actually come from. <a href="/atlas/gummy-crumb.html">Gummy crumb</a>')
        : '')
    ));

    return {
      steps: '<ol class="rc-steps">' + out.join('') + '</ol>',
      summary: 'Written for <strong>' + g0(c.totalFlour) + ' g of flour at ' + Math.round(c.hydration) +
        '% hydration</strong>, finishing at about <strong>' + g0(c.dough) + ' g</strong> of dough. ' +
        'Times are counted from the moment you mix, at <strong>' + c.tempF + '°F / ' +
        Math.round((c.tempF - 32) * 5 / 9) + '°C</strong> — this dough runs ' + F.pace(factor) +
        '. <a href="/tools/schedule.html" class="content-link">Turn it into a wall clock</a> if you need it out of the oven at a particular time.',
      label: c.blendLabel + ' at ' + Math.round(c.hydration) + '%'
    };
  }

  return { build: build };

})();
