/* =============================================================
   hydration.js — extracted from tools/hydration.html

   Was an inline <script> in the page. HTML is served
   max-age=0, so inline JS was re-downloaded on every visit and
   never cached; as an external file it caches like any asset.
   Loaded with defer, after components.js.
   ============================================================= */

(function() {
  'use strict';

  // ============ TAB SWITCHER ============
  const tabs = document.querySelectorAll('.tab-strip .tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      panels.forEach(p => {
        p.classList.toggle('active', p.id === 'panel-' + target);
      });
    });
  });

  // ============ STARTER CALCULATOR ============
  const starterFlour = document.getElementById('starter-flour');
  const starterWater = document.getElementById('starter-water');
  const starterPct = document.getElementById('starter-pct');
  const starterFlourOut = document.getElementById('starter-flour-out');
  const starterWaterOut = document.getElementById('starter-water-out');
  const starterTotalOut = document.getElementById('starter-total-out');
  const starterInterp = document.getElementById('starter-interp');

  function interpretStarterHyd(pct) {
    if (pct < 50) {
      return ['Very stiff', 'This is dryer than typical pasta dough — borderline impossible to mix by hand. Double-check your numbers, or you\'ve invented a new bread.'];
    } else if (pct < 70) {
      return ['Stiff starter (lievito madre territory)', 'Italian style. Slow fermentation, mild flavor, holds for 24+ hours between feeds. Excellent for panettone and brioche, gentle for everyday loaves.'];
    } else if (pct < 90) {
      return ['Firm liquid starter', 'In between. Slower than 100%, faster than stiff. Holds well, behaves predictably. A great middle ground.'];
    } else if (pct <= 110) {
      return ['Standard liquid starter', 'You\'ve got the all-purpose American sourdough starter. Fast, predictable, peaks in 4–6 hours at room temp. What 90% of online recipes assume.'];
    } else if (pct <= 140) {
      return ['Wet starter (rye-friendly)', 'On the wetter end. Common for rye starters, which need extra water to stay active. Faster fermentation, wider window between under and over.'];
    } else {
      return ['Soup', 'This is more water than flour, by a lot. Which is fine for some experimental rye or "old levain" methods, but unusual. Make sure you didn\'t reverse the numbers.'];
    }
  }

  function updateStarter() {
    const f = parseFloat(starterFlour.value) || 0;
    const w = parseFloat(starterWater.value) || 0;
    const pct = f > 0 ? (w / f) * 100 : 0;

    starterPct.textContent = pct.toFixed(0);
    starterFlourOut.textContent = f.toFixed(0);
    starterWaterOut.textContent = w.toFixed(0);
    starterTotalOut.textContent = (f + w).toFixed(0);

    const [title, body] = interpretStarterHyd(pct);
    starterInterp.innerHTML = '<strong>' + title + '</strong>' + body;
  }

  starterFlour.addEventListener('input', updateStarter);
  starterWater.addEventListener('input', updateStarter);

  // Starter presets
  document.querySelectorAll('.preset[data-tab="starter"]').forEach(btn => {
    btn.addEventListener('click', () => {
      starterFlour.value = btn.dataset.flour;
      starterWater.value = btn.dataset.water;
      updateStarter();
    });
  });

  // ============ REVERSE STARTER (advanced) ============
  const reverseFlour = document.getElementById('reverse-flour');
  const reverseTarget = document.getElementById('reverse-target');
  const reverseWater = document.getElementById('reverse-water');
  const reverseFlourOut = document.getElementById('reverse-flour-out');
  const reverseWaterOut = document.getElementById('reverse-water-out');
  const reverseTotal = document.getElementById('reverse-total');

  function updateReverse() {
    const f = parseFloat(reverseFlour.value) || 0;
    const t = parseFloat(reverseTarget.value) || 0;
    const w = (f * t) / 100;

    reverseWater.textContent = w.toFixed(0);
    reverseFlourOut.textContent = f.toFixed(0);
    reverseWaterOut.textContent = w.toFixed(0);
    reverseTotal.textContent = (f + w).toFixed(0);
  }

  reverseFlour.addEventListener('input', updateReverse);
  reverseTarget.addEventListener('input', updateReverse);

  // ============ DOUGH CALCULATOR ============
  const doughFlour = document.getElementById('dough-flour');
  const doughWater = document.getElementById('dough-water');
  const doughStarter = document.getElementById('dough-starter');
  const doughStarterHyd = document.getElementById('dough-starter-hyd');
  const doughSalt = document.getElementById('dough-salt');

  const doughPct = document.getElementById('dough-pct');
  const doughTotalFlour = document.getElementById('dough-total-flour');
  const doughTotalWater = document.getElementById('dough-total-water');
  const doughSaltPct = document.getElementById('dough-salt-pct');
  const doughLevainPct = document.getElementById('dough-levain-pct');
  const doughTotal = document.getElementById('dough-total');
  const doughInterp = document.getElementById('dough-interp');

  function interpretDoughHyd(pct) {
    if (pct < 60) {
      return ['Very tight', 'This is bagel/pretzel territory. Excellent for chewy, dense breads but not what most country loaves want. If this was supposed to be sandwich bread, add water.'];
    } else if (pct < 68) {
      return ['Tight & forgiving', 'Easy to handle, tighter crumb, dense slice. Good for sandwich loaves, focaccia bases, beginners. Won\'t blow up like a balloon — won\'t fight you either.'];
    } else if (pct < 75) {
      return ['Beginner sweet spot', 'Where most home bakers find their groove. Manageable, with enough water for visible openness. Bake 5 of these before you push higher.'];
    } else if (pct < 82) {
      return ['Open crumb territory', '76–80% is where most modern country loaves live. Wet enough for big airy holes, dry enough to handle if you\'ve practiced your stretches and folds.'];
    } else if (pct < 90) {
      return ['High hydration', 'Slack dough, big bubbles, demands skill. The crumb that wins Instagram. Use a bench scraper, work cold, and trust the process — even if it looks like soup at first.'];
    } else if (pct < 100) {
      return ['Very wet — ciabatta land', 'Pancake-batter consistency. You\'re not shaping this so much as guiding it. Common for ciabatta, focaccia, and English muffins.'];
    } else {
      return ['Effectively a batter', 'Above 100% the dough won\'t hold any shape on its own. This is for poured doughs — crumpets, certain rye breads, pancakes. Probably not what you wanted for sandwich bread.'];
    }
  }

  function updateDough() {
    const flour = parseFloat(doughFlour.value) || 0;
    const water = parseFloat(doughWater.value) || 0;
    const starter = parseFloat(doughStarter.value) || 0;
    const starterHyd = parseFloat(doughStarterHyd.value) || 0;
    const salt = parseFloat(doughSalt.value) || 0;

    // Starter breakdown: hydration is water/flour, so
    // starter weight = flour_in_starter + water_in_starter
    // water_in_starter = flour_in_starter * (hyd/100)
    // -> flour_in_starter = starter / (1 + hyd/100)
    const starterFlourPart = starter / (1 + starterHyd / 100);
    const starterWaterPart = starter - starterFlourPart;

    const totalFlour = flour + starterFlourPart;
    const totalWater = water + starterWaterPart;
    const totalDough = totalFlour + totalWater + salt;

    const hyd = totalFlour > 0 ? (totalWater / totalFlour) * 100 : 0;
    const saltPct = totalFlour > 0 ? (salt / totalFlour) * 100 : 0;
    const levainPct = totalFlour > 0 ? (starter / totalFlour) * 100 : 0;

    doughPct.textContent = hyd.toFixed(0);
    doughTotalFlour.textContent = totalFlour.toFixed(0);
    doughTotalWater.textContent = totalWater.toFixed(0);
    doughSaltPct.textContent = saltPct.toFixed(2);
    doughLevainPct.textContent = levainPct.toFixed(1);
    doughTotal.textContent = totalDough.toFixed(0);

    // Update the starter contribution line
    const contribRow = document.querySelector('#panel-dough .breakdown .row:nth-child(3) .val');
    if (contribRow) {
      contribRow.textContent = '+' + starterFlourPart.toFixed(0) + ' g flour, +' + starterWaterPart.toFixed(0) + ' g water';
    }

    const [title, body] = interpretDoughHyd(hyd);
    doughInterp.innerHTML = '<strong>' + title + '</strong>' + body;

    updateBakersPct();
  }

  [doughFlour, doughWater, doughStarter, doughStarterHyd, doughSalt].forEach(el => {
    el.addEventListener('input', updateDough);
  });

  // ============ MULTI-FLOUR BLEND (advanced) ============
  const flourRows = document.getElementById('flour-rows');
  const addFlourBtn = document.getElementById('add-flour');
  const bakersPct = document.getElementById('bakers-pct');

  function refreshRowListeners() {
    flourRows.querySelectorAll('.flour-amount, .flour-name-input').forEach(input => {
      input.removeEventListener('input', updateBakersPct);
      input.addEventListener('input', updateBakersPct);
    });
    flourRows.querySelectorAll('.remove-row').forEach(btn => {
      btn.onclick = () => {
        const visibleRows = flourRows.querySelectorAll('.flour-row:not(.header)');
        if (visibleRows.length > 1) {
          btn.closest('.flour-row').remove();
          updateBakersPct();
        }
      };
    });
  }

  addFlourBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'flour-row';
    row.innerHTML = `
      <input type="text" class="flour-input flour-name-input" placeholder="e.g. Rye">
      <input type="number" class="flour-input flour-amount" value="0" min="0" step="1">
      <button class="remove-row" title="Remove">×</button>
    `;
    flourRows.appendChild(row);
    refreshRowListeners();
  });

  function updateBakersPct() {
    const rows = Array.from(flourRows.querySelectorAll('.flour-row:not(.header)'));
    const flours = rows.map(r => ({
      name: r.querySelector('.flour-name-input').value || 'Flour',
      amount: parseFloat(r.querySelector('.flour-amount').value) || 0
    }));

    const totalFlour = flours.reduce((s, f) => s + f.amount, 0);
    const water = parseFloat(doughWater.value) || 0;
    const starter = parseFloat(doughStarter.value) || 0;
    const starterHyd = parseFloat(doughStarterHyd.value) || 0;
    const salt = parseFloat(doughSalt.value) || 0;

    const starterFlourPart = starter / (1 + starterHyd / 100);
    const starterWaterPart = starter - starterFlourPart;
    const grandTotalFlour = totalFlour + starterFlourPart;
    const totalWater = water + starterWaterPart;

    let html = '';
    flours.forEach(f => {
      const pct = grandTotalFlour > 0 ? (f.amount / grandTotalFlour) * 100 : 0;
      html += '<div class="row"><span class="label">' + f.name + '</span><span class="val">' + f.amount.toFixed(0) + ' g · ' + pct.toFixed(1) + '%</span></div>';
    });
    if (starterFlourPart > 0) {
      const pct = grandTotalFlour > 0 ? (starterFlourPart / grandTotalFlour) * 100 : 0;
      html += '<div class="row"><span class="label">Starter (flour portion)</span><span class="val">' + starterFlourPart.toFixed(0) + ' g · ' + pct.toFixed(1) + '%</span></div>';
    }
    html += '<div class="row total"><span class="label">Total flour</span><span class="val">' + grandTotalFlour.toFixed(0) + ' g · 100%</span></div>';
    html += '<div class="row"><span class="label">Total water</span><span class="val">' + totalWater.toFixed(0) + ' g · ' + (grandTotalFlour > 0 ? (totalWater / grandTotalFlour * 100).toFixed(1) : 0) + '%</span></div>';
    html += '<div class="row"><span class="label">Salt</span><span class="val">' + salt.toFixed(1) + ' g · ' + (grandTotalFlour > 0 ? (salt / grandTotalFlour * 100).toFixed(2) : 0) + '%</span></div>';
    html += '<div class="row"><span class="label">Starter (whole)</span><span class="val">' + starter.toFixed(0) + ' g · ' + (grandTotalFlour > 0 ? (starter / grandTotalFlour * 100).toFixed(1) : 0) + '%</span></div>';

    bakersPct.innerHTML = html;
  }

  refreshRowListeners();

  // ============ INITIALIZE ============
  updateStarter();
  updateReverse();
  updateDough();

})();
