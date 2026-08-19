/* =============================================================
   crumb-analyzer.js — extracted from tools/crumb-analyzer.html

   Was an inline <script> in the page. HTML is served
   max-age=0, so inline JS was re-downloaded on every visit and
   never cached; as an external file it caches like any asset.
   Loaded with defer, after components.js.
   ============================================================= */

// ═══════════════════════════════════════════════════════════════════
//  THE SOURDOUGH DATABASE — CRUMB ANALYZER
//  Interactive proofing level reference tool
// ═══════════════════════════════════════════════════════════════════

// Image paths relative to site root
var IMG_BASE = '/assets/images/crumb/';

// Polaroid dimensions
var PW = 280, PH = 225; // photo size (px)
var PAD = 12, BOT = 52; // padding
var PTW = PW + PAD * 2;  // polaroid total width
var PTH = PH + PAD + BOT; // polaroid total height

// These will be computed after first render since we need the container width
var PX0 = 0, PY0 = 38;

// Specimen data
var SPECIMENS = [
  {
    id: 'nicely-proofed',
    title: 'Nicely Proofed',
    stars: '★ ★ ★ ★ ★',
    rot: -3,
    img: IMG_BASE + 'nicely-proofed.webp',
    anns: [
      { t: 'lacy gluten\nnetwork',  ty: 108, side: 'L', eyOffset: 155, cpOffset: 82 },
      { t: 'even\ndistribution',    ty: 228, side: 'L', eyOffset: 275, cpOffset: 208 },
      { t: 'large open\nair cells', ty: 78,  side: 'R', eyOffset: 115, cpOffset: 74  },
      { t: 'good oven\nspring',     ty: 28,  side: 'R', eyOffset: 72,  cpOffset: 34  },
    ],
    obs: 'Large, irregular air cells distributed evenly throughout the crumb. Thin, lacy gluten walls between holes. Strong dome with good crust structure — the loaf held its shape and sprang well in the oven.',
    diag: 'Bulk fermentation completed at the right moment. The yeast produced sufficient gas, the gluten network stayed intact through cold proof, and the structure firmed up before baking.',
    actionLabel: 'TO REPLICATE',
    steps: [
      'Bulk until 50–75% volume increase — jiggly when shaken, domed surface, bubbles visible on sides',
      'Cold proof 10–14 hours in the fridge immediately after shaping',
      'Bake straight from cold at 500°F → 450°F, Dutch oven covered 20 min then uncovered 22 min',
    ],
    links: [
      { label: 'Bake Schedule Builder', url: '/tools/schedule.html' },
      { label: 'Hydration Tool', url: '/tools/hydration.html' },
      { label: 'The Sourdough Journey ↗', url: 'https://thesourdoughjourney.com', ext: true },
    ]
  },
  {
    id: 'slightly-underproofed',
    title: 'Slightly Underproofed',
    stars: '★ ★ ★ ☆ ☆',
    rot: 2,
    img: IMG_BASE + 'slightly-underproofed.webp',
    anns: [
      { t: 'uneven large\ntunnels',  ty: 88,  side: 'L', eyOffset: 120, cpOffset: 68  },
      { t: 'dense tight\nbase',      ty: 218, side: 'L', eyOffset: 260, cpOffset: 200 },
      { t: 'flattened\nprofile',     ty: 30,  side: 'R', eyOffset: 68,  cpOffset: 34  },
    ],
    obs: 'A few large, irregular tunnels near the top — but dense, tight crumb near the base. Flattened profile suggests the loaf didn\'t have enough internal structure to hold its dome.',
    diag: 'Bulk fermentation was cut short. The gluten hadn\'t fully relaxed and the yeast hadn\'t generated enough gas for an even rise. Often a cooler kitchen than expected, or a starter at less than full activity.',
    actionLabel: 'NEXT BAKE FIX',
    steps: [
      'Extend bulk by 30–45 minutes — use the poke test, not the clock',
      'Verify starter doubles within 4–6 hours of feeding before you mix',
      'If kitchen is under 70°F, find a warmer spot — fermentation slows significantly below 68°F',
    ],
    links: [
      { label: 'Bake Schedule', url: '/tools/schedule.html' },
      { label: 'Dense Crumb →', url: '/atlas/dense-crumb.html' },
      { label: 'Starter Won\'t Rise →', url: '/atlas/starter-not-rising.html' },
    ]
  },
  {
    id: 'significantly-underproofed',
    title: 'Significantly Underproofed',
    stars: '★ ★ ☆ ☆ ☆',
    rot: -2,
    img: IMG_BASE + 'significantly-underproofed.webp',
    anns: [
      { t: 'very few\nair pockets',  ty: 118, side: 'L', eyOffset: 172, cpOffset: 96  },
      { t: 'low, flat\nrise',        ty: 34,  side: 'R', eyOffset: 70,  cpOffset: 32  },
    ],
    obs: 'Very few, very small air pockets. Dense and heavy throughout. Almost no internal structure visible. Likely gummy inside despite a fully baked-looking exterior.',
    diag: 'Significantly underfermented. The yeast hadn\'t produced sufficient gas and the gluten hadn\'t relaxed enough for the dough to expand in the oven. Common causes: weak or young starter, very cold kitchen, dramatically short bulk.',
    actionLabel: 'NEXT BAKE FIX',
    steps: [
      'Check starter health: should reliably double within 5 hours at 72°F. If not, feed daily for 3+ days before baking again',
      'Add at least 1–2 hours to bulk fermentation time — this crumb needs significantly more fermentation',
      'A proofing box or oven with the light on can stabilise fermentation temperature and speed things up',
    ],
    links: [
      { label: 'Starter Won\'t Rise →', url: '/atlas/starter-not-rising.html' },
      { label: 'Dense Crumb →', url: '/atlas/dense-crumb.html' },
      { label: 'Bake Schedule', url: '/tools/schedule.html' },
    ]
  },
  {
    id: 'slightly-overproofed',
    title: 'Slightly Overproofed',
    stars: '★ ★ ★ ☆ ☆',
    rot: 1.5,
    img: IMG_BASE + 'slightly-overproofed.webp',
    anns: [
      { t: 'weakening\ngluten walls', ty: 108, side: 'L', eyOffset: 152, cpOffset: 88  },
      { t: 'merging\ncaverns',        ty: 78,  side: 'R', eyOffset: 115, cpOffset: 74  },
    ],
    obs: 'Holes beginning to merge into larger, irregular caverns. Gluten walls are thinning and starting to weaken. The structure is still holding but beginning to degrade. Profile may be slightly flat at the sides.',
    diag: 'Bulk ran a bit too long, or the kitchen was warmer than expected. The yeast began to exhaust its available food, and accumulated acid started softening the gluten network before baking.',
    actionLabel: 'NEXT BAKE FIX',
    steps: [
      'Reduce bulk by 20–30 minutes — catch it before the holes start merging',
      'Poke test: an indent should spring back slowly over 2–3 seconds. Too fast = underproofed. Doesn\'t spring = overproofed',
      'Track kitchen temperature — every 2°F warmer = roughly 15 minutes faster fermentation',
    ],
    links: [
      { label: 'Overproofed Dough →', url: '/atlas/overproofed.html' },
      { label: 'Too Sour →', url: '/atlas/too-sour.html' },
      { label: 'Bake Schedule', url: '/tools/schedule.html' },
    ]
  },
  {
    id: 'significantly-overproofed',
    title: 'Significantly Overproofed',
    stars: '★ ☆ ☆ ☆ ☆',
    rot: -4,
    img: IMG_BASE + 'significantly-overproofed.webp',
    anns: [
      { t: 'extreme voids\n+ caverns',   ty: 88,  side: 'L', eyOffset: 128, cpOffset: 68  },
      { t: 'collapsed\nstructure',       ty: 148, side: 'R', eyOffset: 178, cpOffset: 145 },
    ],
    obs: 'Extreme, chaotic caverns throughout. The structure has significantly collapsed — the dough likely spread before baking. A dense, gummy band near the bottom crust is common with this profile.',
    diag: 'Well past peak fermentation. The yeast exhausted its food supply and accumulated acid degraded the gluten network. Most common with a warm kitchen, a particularly active starter, or bulk that ran 1–2 hours too long.',
    actionLabel: 'RESCUE + FIX',
    steps: [
      'Rescue this loaf: bake immediately from cold. Don\'t let it come to room temperature. Accept a denser crumb',
      'Next time: cut bulk by 45–60 minutes. Mix with cold water to slow fermentation from the start',
      'Shape and go straight to the fridge — cold proofing is far more forgiving than room-temperature final proof',
    ],
    links: [
      { label: 'Overproofed Dough →', url: '/atlas/overproofed.html' },
      { label: 'Flat Loaf →', url: '/atlas/flat-loaf.html' },
      { label: 'Bake Schedule', url: '/tools/schedule.html' },
    ]
  },
];

// ── RENDERING ──────────────────────────────────────────────────────

var currentIdx = 0;

function getContainerWidth() {
  var zone = document.getElementById('ca-annotation-zone');
  return zone ? zone.offsetWidth : 700;
}

function drawArrow(svg, lx1, ly1, cpx, cpy, ex, ey) {
  var ddx = ex - cpx, ddy = ey - cpy;
  var len = Math.sqrt(ddx * ddx + ddy * ddy);
  ddx /= len; ddy /= len;

  // Shorten path to leave room for arrowhead
  var pex = ex - 6 * ddx, pey = ey - 6 * ddy;

  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M' + r(lx1) + ',' + r(ly1) + ' Q' + r(cpx) + ',' + r(cpy) + ' ' + r(pex) + ',' + r(pey));
  path.setAttribute('stroke', '#2a4774');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  var tipX = r(ex), tipY = r(ey);
  var w1x = r(ex - 9 * ddx - 5 * ddy), w1y = r(ey - 9 * ddy + 5 * ddx);
  var w2x = r(ex - 9 * ddx + 5 * ddy), w2y = r(ey - 9 * ddy - 5 * ddx);
  var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', w1x + ',' + w1y + ' ' + tipX + ',' + tipY + ' ' + w2x + ',' + w2y);
  poly.setAttribute('fill', '#2a4774');
  svg.appendChild(poly);
}

function r(v) { return Math.round(v * 10) / 10; }

function renderSpecimen(idx) {
  var d = SPECIMENS[idx];
  var zone = document.getElementById('ca-annotation-zone');
  var svg  = document.getElementById('ca-svg');

  // Clear old elements
  zone.querySelectorAll('.ca-polaroid-wrap, .ca-ann').forEach(function(el) { el.remove(); });
  svg.innerHTML = '';

  // Compute polaroid position
  var containerW = zone.offsetWidth || 700;
  PX0 = Math.round((containerW - PTW) / 2);

  // Polaroid
  var pw = document.createElement('div');
  pw.className = 'ca-polaroid-wrap';
  pw.style.cssText = 'left:' + PX0 + 'px;top:' + PY0 + 'px;transform:rotate(' + d.rot + 'deg);';
  pw.innerHTML =
    '<div class="ca-polaroid">' +
    '<div class="ca-pol-tape"></div>' +
    '<div class="ca-pol-img" style="width:' + PW + 'px;height:' + PH + 'px;">' +
    '<img src="' + d.img + '" alt="' + d.title + ' sourdough crumb cross-section" loading="lazy" ' +
    'onerror="this.onerror=null;this.src=this.src.replace(&quot;.webp&quot;,&quot;.png&quot;)"></div>' +
    '<div class="ca-pol-caption">' +
    '<div class="ca-pol-name">' + d.title + '</div>' +
    '<div class="ca-pol-stars">' + d.stars + '</div>' +
    '</div></div>';
  zone.appendChild(pw);

  // Annotations
  d.anns.forEach(function(ann) {
    var lines = ann.t.split('\n');
    var div = document.createElement('div');
    div.className = 'ca-ann' + (ann.side === 'R' ? ' right' : '');
    if (ann.side === 'L') {
      div.style.cssText = 'left:8px;top:' + ann.ty + 'px;';
    } else {
      div.style.cssText = 'right:8px;top:' + ann.ty + 'px;';
    }
    div.innerHTML = lines.join('<br>');
    zone.appendChild(div);

    // Compute line geometry
    var lh = lines.length * 23;
    var midY = ann.ty + lh / 2;
    var lx1 = ann.side === 'L' ? 172 : containerW - 172;
    var ex  = ann.side === 'L' ? PX0 : PX0 + PTW;
    var ey  = PY0 + ann.eyOffset;
    var cpx = ann.side === 'L' ? 165 : containerW - 165;
    var cpy = PY0 + ann.cpOffset;

    drawArrow(svg, lx1, midY, cpx, cpy, ex, ey);
  });

  // Update annotation zone height to fit polaroid
  var neededH = PY0 + PTH + 40;
  zone.style.minHeight = Math.max(neededH, 460) + 'px';
}

function renderSpectrum(idx) {
  var el = document.getElementById('ca-spectrum');
  el.innerHTML = SPECIMENS.map(function(s, i) {
    return '<div class="ca-sp-item' + (i === idx ? ' active' : '') + '" onclick="selectSpecimen(' + i + ')">' +
      '<div class="ca-sp-dot"></div>' + s.title + '</div>';
  }).join('');
}

function renderReport(d) {
  var stepsHTML = d.steps.map(function(s, i) {
    return '<li class="ca-step"><span class="ca-step-num">' + (i + 1) + '</span><span>' + s + '</span></li>';
  }).join('');

  var linksHTML = d.links.map(function(l) {
    return '<a class="ca-sa-link' + (l.ext ? ' external' : '') + '" href="' + l.url + '"' +
      (l.ext ? ' target="_blank" rel="noopener"' : '') + '>' + l.label + '</a>';
  }).join('');

  document.getElementById('ca-field-report').innerHTML =
    '<div class="ca-report-header">' +
    '<span class="ca-report-id">Field Report · ' + d.id + '</span>' +
    '<span class="ca-report-name">' + d.title + '</span>' +
    '<span class="ca-report-stars">' + d.stars + '</span>' +
    '</div>' +
    '<div class="ca-report-body">' +
    '<div class="ca-report-col">' +
    '<div class="ca-report-section-label">What you\'re seeing</div>' +
    '<p class="ca-report-prose">' + d.obs + '</p>' +
    '<div class="ca-report-section-label" style="margin-top:18px">Why it happened</div>' +
    '<p class="ca-report-prose">' + d.diag + '</p>' +
    '</div>' +
    '<div class="ca-report-col">' +
    '<div class="ca-report-section-label">' + d.actionLabel + '</div>' +
    '<ul class="ca-steps">' + stepsHTML + '</ul>' +
    '</div>' +
    '</div>' +
    '<div class="ca-see-also">' +
    '<span class="ca-sa-label">See also →</span>' +
    linksHTML +
    '</div>';
}

function selectSpecimen(idx) {
  currentIdx = idx;
  renderSpecimen(idx);
  renderSpectrum(idx);
  renderReport(SPECIMENS[idx]);
}

// Init
selectSpecimen(0);
