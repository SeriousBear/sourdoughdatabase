/* =============================================================
   dough-lab-data.js — the catalogue behind Choose Your Own Crumb
   Loaded before dough-lab.js on /recipes/build-your-own.html

   Split out of dough-lab.js in August 2026 when the engine hit
   ~600 lines and most of the growth was copy, not logic. Adding
   an ingredient should mean editing one object in this file and
   nothing else.

   ── The two numbers on every ingredient ──────────────────────

   water   fraction of its weight that behaves as water in the
           dough. Ordinary composition figures — beer really is
           about 93% water — rounded to two places.

   absorb  fraction of its weight it TAKES BACK OUT of the dough.
           Dry seeds and oats drink; sugar binds water osmotically;
           olives give water up. These are estimates from what
           bakers report, not lab numbers, and the page says so
           out loud in § 04. Treat them as the right order of
           magnitude, not a measurement.

   Net effect on free water is weight * (water - absorb). That is
   what feeds the "handles more like X%" line, which is separate
   from the headline hydration on purpose: hydration keeps its
   standard definition (flour, water, starter) so the number means
   the same thing here as everywhere else on the site.

   ── The copy on every ingredient ─────────────────────────────

   blurb   what it is and what it does, one or two sentences
   band    the dose that separates "a splash" from "a lot".
           Liquids: percent of total liquid. Extras: percent of
           total flour weight.
   low     what to expect below the band
   high    what to expect at or above it

   Every entry needs all four. An ingredient with no guidance is
   worse than no ingredient — it implies the tool checked.
   ============================================================= */

window.DOUGH_LAB_DATA = (function () {

  /* Hydration ranges and absorption are lifted from the Flour Compendium
     entries so this tool can never contradict the site's own pages. Edit a
     flour entry, edit it here too. Bands are percent of the flour blend. */
  var FLOURS = {
    white: {
      name: 'White bread flour', lo: 68, hi: 85, absorb: 1.00, band: 999,
      url: '/flour/white-bread-flour.html',
      blurb: 'The baseline. High protein, predictable, forgiving — everything else on this list is measured against how it behaves.',
      low:  'There is no such thing as too much of this one. If you are learning to read fermentation, keep the blend here and change something else instead.',
      high: 'There is no such thing as too much of this one.'
    },
    ap: {
      name: 'All-purpose', lo: 65, hi: 75, absorb: 0.95, band: 60,
      url: '/flour/all-purpose-flour.html',
      blurb: 'Two or three points less protein than bread flour, which sounds trivial and is not. Less gluten means less structure and less water held.',
      low:  'A minority share softens the crumb slightly and costs you nothing.',
      high: 'With all-purpose as your base, stay at the drier end of the range and do not chase a bread-flour recipe&rsquo;s hydration — this dough will not hold it. Expect a softer, tighter crumb and a loaf that spreads a little more.',
      ruinPct: 90,
      ruin: 'an almost pure all-purpose loaf at high hydration is the most common cause of a pancake. Drop the water four or five points.'
    },
    wholewheat: {
      name: 'Whole wheat', lo: 72, hi: 82, absorb: 1.12, band: 30,
      url: '/flour/whole-wheat-flour.html',
      blurb: 'Bran and germ still in. It drinks more water, ferments faster, and the bran physically cuts the gluten network as it forms.',
      low:  'Up to about a third adds real flavour and colour for very little structural cost. This is the sweet spot most bakers land on.',
      high: 'Past a third you need more water and less time. Cut the bulk short of where a white loaf would end — the bran speeds fermentation up and hides the surface bubbles you would normally read.',
      ruinPct: 70,
      ruin: 'above 70% you are baking a different kind of bread. Dense, moist, excellent toasted, and never open.'
    },
    rye: {
      name: 'Rye', lo: 70, hi: 80, absorb: 1.18, band: 20,
      url: '/flour/rye-flour.html',
      blurb: 'Barely any usable gluten, and a lot of pentosans that hold water without building structure. The fastest-fermenting flour in the cupboard.',
      low:  'Five to ten percent is the most useful small addition in baking — noticeably faster fermentation and real depth of flavour, at no handling cost.',
      high: 'Past 20% the dough stops behaving like wheat. Sticky, fast, and it will not build gluten however you handle it. Shape it wet-handed, expect a tighter and moister crumb, and stop the bulk earlier than feels right.',
      ruinPct: 40,
      ruin: 'above 40% conventional shaping stops working. Traditional high-rye breads are baked in tins for exactly this reason — use one.'
    },
    spelt: {
      name: 'Spelt', lo: 68, hi: 76, absorb: 0.98, band: 30,
      url: '/flour/spelt-flour.html',
      blurb: 'An ancient wheat whose gluten is plentiful but fragile. It stretches beautifully and then tears without warning.',
      low:  'A minority share adds a sweet, nutty note and a little extensibility. Handle it as normal.',
      high: 'Past about a third, go gentle. Fewer folds, softer hands, and stop shaping earlier than feels finished — spelt gives no warning before it tears, and once torn it does not come back.',
      ruinPct: 70,
      ruin: 'a mostly-spelt dough over-ferments fast and then collapses. Stop the bulk at 30–40% rise, not 50%.'
    },
    einkorn: {
      name: 'Einkorn', lo: 60, hi: 70, absorb: 0.85, band: 20,
      url: '/flour/einkorn-flour.html',
      blurb: 'The oldest cultivated wheat, and it does not behave like modern wheat at all. Its gluten will not form a proper network no matter what you do to it.',
      low:  'Even a small share brings a golden colour and a distinctly sweet flavour. Take the hydration down a little to match.',
      high: 'Einkorn will not take a normal hydration and will not hold tension. Keep the water well below what the other flours suggest, handle it as little as you can, and expect a flatter, denser, very yellow loaf.',
      ruinPct: 50,
      ruin: 'past half einkorn, a free-standing loaf is not realistically on the table. Bake it in a tin and it is lovely.'
    },
    khorasan: {
      name: 'Khorasan', lo: 68, hi: 78, absorb: 1.02, band: 30,
      url: '/flour/khorasan-flour.html',
      blurb: 'Also sold as Kamut. High protein, but the gluten is more extensible than elastic — it stretches easily and springs back poorly.',
      low:  'A minority share gives a buttery flavour and a rich yellow crumb with no handling penalty.',
      high: 'At this much the dough feels strong and then refuses to hold a shape. Build tension in several smaller stages rather than one hard shaping, and give it a shorter final proof.',
      ruinPct: 70,
      ruin: 'a mostly-khorasan loaf spreads. Use a banneton, keep the hydration modest, and bake it straight from the fridge.'
    }
  };

  var LIQUIDS = {
    water: {
      name: 'Water', water: 1.00, band: 999,   // 999 = no "that's a lot" state
      blurb: 'The default, and the only one where nothing else comes along for the ride.',
      low:  'Temperature is the one variable that matters here. 85–90°F / 29–32°C gets the ferment moving without shocking the starter; straight from a cold tap it will take noticeably longer to get going.',
      high: 'Temperature is the one variable that matters here. 85–90°F / 29–32°C gets the ferment moving without shocking the starter. If your water is heavily chlorinated, <a href="/starter-school/create-a-starter.html">let it stand or treat it</a> — chloramine in particular does not gas off on its own.'
    },
    beer: {
      name: 'Beer', water: 0.93, note: 'booze', band: 30,
      blurb: 'Water carrying malt sugar, a little acid, and hop bitterness. The alcohol bakes off; the malt is what stays.',
      low:  'At this much it reads as a faint maltiness and nothing else really changes. A cheap way to make a plain loaf taste like it took longer than it did.',
      high: 'At this much you get real depth and a darker crust, and a bulk that runs maybe a tenth longer. Pick a dark, low-hop beer — a stout or a brown ale. IPA bitterness concentrates as the loaf bakes and turns harsh.',
      ruinPct: 70,
      ruin: 'a full swap is fine. There is no dose of beer that ruins a loaf — it just becomes a beer loaf.'
    },
    wine: {
      name: 'Red wine', water: 0.86, note: 'acid', band: 25,
      blurb: 'Acid, tannin, sugar and colour. The acid works against your gluten the entire time.',
      low:  'A splash tints the crumb faintly purple-grey and adds a fruit note. Structurally you will not notice it.',
      high: 'At this much the acid is doing real damage to the gluten — expect a tighter, denser crumb and a bulk that drags. It is a good loaf, but it is a flatbread-adjacent loaf. Shape it earlier than feels right and do not chase an open crumb.',
      ruinPct: 50,
      ruin: 'past half your liquid the acid outpaces anything fermentation can build. The dough tears on the bench and the loaf will not rise.'
    },
    soda: {
      name: 'Cola or Dr Pepper', water: 0.89, note: 'soda', band: 25,
      blurb: 'Sugar and phosphoric acid in the same glass, so you are doing both of those things at once. Let it go flat first — the carbonation does nothing but make it awkward to weigh.',
      low:  'A quarter or less mostly shows up as a faster, darker crust and a crumb that stays soft an extra day. The sugar is feeding the yeast at this dose, not fighting it.',
      high: 'Past a quarter the sugar starts pulling water out of the yeast rather than feeding it, and the acid is slackening your gluten at the same time. Slow bulk, dark crust, soft dense crumb. Deeply silly, properly fun, and you should pull it from the oven earlier than the colour suggests.',
      ruinPct: 60,
      ruin: 'past about 60% the sugar load stalls the yeast outright. Still bakeable, but plan on commercial yeast to help it along.'
    },
    juice: {
      name: 'Fruit juice', water: 0.88, note: 'acid', band: 25,
      blurb: 'Sugar plus acid, and depending on the fruit, enzymes. Pineapple, papaya and kiwi contain proteases that will dissolve your gluten outright — those are not a small risk, they are a ruined dough.',
      low:  'A splash of apple or orange adds sweetness and a faster crust. Harmless.',
      high: 'At this much you are running sugar and acid together and the bulk will drag. Stick to apple, grape or orange. Avoid raw pineapple, papaya and kiwi entirely unless the juice has been heated, which kills the enzyme.',
      ruinPct: 50,
      ruin: 'past half, sugar and acid together drag the bulk out badly. Give it hours longer than you think — and never use raw pineapple, papaya or kiwi at any dose.'
    },
    citrus: {
      name: 'Citrus juice', water: 0.90, note: 'acid', band: 8,
      blurb: 'Almost pure acid as far as the dough is concerned. A little goes a very long way here.',
      low:  'A small amount — under about 8% of your liquid — is the classic dodge for a weak starter: it lowers the pH and tightens a slack dough. Used deliberately, this is a fix, not a flavour.',
      high: 'This is a lot of citrus. Past roughly a tenth of your liquid the acid degrades gluten faster than fermentation builds it, and you will get a dough that tears when you shape it and a loaf that will not rise. If you want the flavour, use zest instead — all of the aroma, none of the acid.',
      ruinPct: 20,
      ruin: 'past a fifth of your liquid this stops being bread. The gluten will not form, and no amount of extra time fixes it.'
    },
    vinegar: {
      name: 'Vinegar', water: 0.95, note: 'acid', band: 4,
      blurb: 'Acetic acid and water. This is a seasoning-scale ingredient, not a liquid you pour by the cup.',
      low:  'A teaspoon or two — a few percent of your liquid — sharpens the sour note and firms up a slack dough. Common in commercial bakeries for exactly that reason.',
      high: 'You have poured in far more vinegar than anyone means to. Past about 5% of your liquid the yeast slows hard and the gluten gives up. If this was deliberate, respect, but expect a brick.',
      ruinPct: 10,
      ruin: 'past a tenth of your liquid the yeast is effectively pickled. This is a brick, and a sour one.'
    },
    milk: {
      name: 'Milk', water: 0.87, note: 'dairy', band: 30,
      blurb: 'Fat, sugar and protein together. Softer crumb, browner crust, a slightly slower rise.',
      low:  'A third or less gives you a softer crumb and better browning without pushing the loaf toward sandwich bread.',
      high: 'At this much you have made an enriched dough, and it will behave like one — soft, tight-crumbed, quick to colour. Use it scalded or UHT: raw milk carries an enzyme that visibly weakens gluten, and the dough will go slack on you an hour in.',
      ruinPct: 100,
      ruin: 'a full swap is a classic enriched loaf. Nothing breaks — it just stops being a lean sourdough.'
    },
    buttermilk: {
      name: 'Buttermilk', water: 0.90, note: 'culturedairy', band: 30,
      blurb: 'Dairy and acid at the same time — the softness of milk with the gluten problems of vinegar.',
      low:  'A modest amount buys you tang and a tender crumb, and the acid is too dilute to cause trouble.',
      high: 'Past about a third the acid is working against you all the way through. Go gentler on the folds, expect a tighter crumb than the hydration suggests, and stop the bulk earlier than usual.',
      ruinPct: 70,
      ruin: 'past about 70% the acid costs you more structure than the tang is worth.'
    },
    yogurt: {
      name: 'Yogurt, thinned', water: 0.85, note: 'culturedairy', band: 25,
      blurb: 'The same trade as buttermilk with more fat and more body. Thin it with water first or you cannot mix it evenly.',
      low:  'A quarter or less gives real tang and a soft, close crumb. Very good with whole wheat.',
      high: 'At this much the acid and the fat are both limiting your gluten. This makes a lovely soft loaf and a hopeless open crumb — pick one.',
      ruinPct: 60,
      ruin: 'past about 60% you have a very soft, very tangy, very closed crumb. Good bread. Not open bread.'
    },
    coffee: {
      name: 'Brewed coffee', water: 0.99, note: 'coffee', band: 30,
      blurb: 'Acid and tannin, both of which tighten gluten. It also darkens the crumb noticeably.',
      low:  'A third or less mostly adds colour and a background bitterness that reads as depth. Good against rye and chocolate, odd in a plain white loaf.',
      high: 'A full swap gives you a properly dark, bitter loaf. Brew it strong and use it cold — hot coffee will kill starter on contact, and weak coffee just makes the bread look grey for no reward.',
      ruinPct: 100,
      ruin: 'a full swap works. The limit here is your tolerance for bitterness, not the dough&rsquo;s.'
    },
    tea: {
      name: 'Brewed tea', water: 0.99, note: 'tea', band: 40,
      blurb: 'Mostly tannin, which tightens the gluten and stains the crumb.',
      low:  'A modest amount adds a dry, faintly astringent note. Earl Grey with dried fruit is the version of this that actually works.',
      high: 'A full swap tightens the crumb and turns it brown-grey. Worth it with fruit and spice. Pointless in a plain loaf, where it mostly just makes the bread look older than it is.',
      ruinPct: 100,
      ruin: 'a full swap works. Tannin tightens the crumb, but nothing actually fails.'
    },
    potato: {
      name: 'Potato cooking water', water: 0.96, note: 'starchy', band: 30,
      blurb: 'Gelatinised starch in suspension. It holds onto moisture and keeps the crumb soft for days.',
      low:  'Even a small amount helps. There is no downside to this one.',
      high: 'A full swap gives you a soft, moist, long-keeping loaf — the old bakery trick, and it still works. Cool it to room temperature first, and do not salt the potatoes if you are planning to use the water.',
      ruinPct: 100,
      ruin: 'a full swap is the traditional version and it is excellent. No ceiling on this one.'
    }
  };

  var EXTRAS = {
    oliveoil: {
      name: 'Olive oil', group: 'Fat', note: 'fat', water: 0, absorb: 0, band: 5,
      blurb: 'Coats the gluten strands and stops them linking up. It does not change the water in the dough at all — it changes what the dough does with it.',
      low:  'Under about 5% of flour weight it softens the crumb and extends the keeping time without costing you structure. Add it after the gluten has built, not at the mix.',
      high: 'Past 5% you are in enriched-bread territory: a tender, close crumb, a slower rise, and no chance of the open interior. Which is the right call for focaccia and the wrong one for a boule.',
      ruinPct: 15,
      ruin: 'past 15% of flour weight the gluten cannot link up enough to hold a boule. That is focaccia, and focaccia is great, but know which one you are making.'
    },
    butter: {
      name: 'Butter, softened', group: 'Fat', note: 'fat', water: 0.16, absorb: 0, band: 5,
      blurb: 'Fat plus about a sixth of its weight in water. Same gluten-coating effect as oil, with a little hydration along for the ride.',
      low:  'A small amount gives a softer crumb and better keeping. Soften it properly — cold butter will not distribute and you will find streaks.',
      high: 'Past 5% of flour weight this is an enriched dough. Slower rise, tight tender crumb, and it wants a lower oven than a lean loaf does.',
      ruinPct: 15,
      ruin: 'past 15% this is brioche-adjacent and wants a tin, a lower oven, and commercial yeast alongside the starter.'
    },
    honey: {
      name: 'Honey', group: 'Sweetener', note: 'sugar', water: 0.17, absorb: 0.10, band: 8,
      blurb: 'Sugar the yeast can use immediately, plus a little water. It is also hygroscopic, so it holds moisture in the finished loaf.',
      low:  'Under about 8% of flour weight it speeds the ferment up slightly and browns the crust earlier. Mostly it just tastes good.',
      high: 'Past that the sugar starts working against the yeast osmotically rather than feeding it, and the bulk slows down instead of speeding up. Watch the crust — it will be dark long before the middle is done, so tent it with foil.',
      ruinPct: 20,
      ruin: 'past 20% the osmotic drag on the yeast is severe. Expect the bulk to roughly double in length, and tent the crust early.'
    },
    sugar: {
      name: 'Sugar', group: 'Sweetener', note: 'sugar', water: 0, absorb: 0.15, band: 8,
      blurb: 'Feeds the yeast at low doses and starves it at high ones, because dissolved sugar pulls water out of the yeast cells. It also ties up water the flour wanted.',
      low:  'A small amount gets the ferment going faster and browns the crust. No downside worth worrying about.',
      high: 'Past roughly 8–10% of flour weight the bulk gets slower, not faster — that is the osmotic effect, and it surprises people every time. The dough will also feel tighter than the hydration says, because the sugar is holding water the flour cannot get to.',
      ruinPct: 20,
      ruin: 'past 20% a wild starter alone will struggle to lift it. Sweet enriched breads at this level normally use commercial yeast for a reason.'
    },
    walnuts: {
      name: 'Walnuts or pecans', group: 'Inclusion', note: 'nuts', water: 0.04, absorb: 0.10, band: 15,
      blurb: 'Roughly 60% fat, and they have edges. Both of those cut gluten strands, so timing matters more than quantity.',
      low:  'Fold them in at the last set rather than at the mix. Toast them first — ten minutes in the oven roughly doubles what they taste like.',
      high: 'At this much the nuts are physically interrupting the crumb structure, so expect a shorter, denser loaf that slices into something closer to a fruit bread. Walnut skins also bleed a purple-grey into the crumb, which is normal and looks alarming the first time.',
      ruinPct: 35,
      ruin: 'past about a third of the flour weight the inclusions outnumber the crumb. It will not hold together when sliced.'
    },
    seeds: {
      name: 'Mixed seeds', group: 'Inclusion', note: 'seeds', water: 0.06, absorb: 0.60, band: 12,
      blurb: 'Seeds drink, and they drink from the dough. Dropped in dry they pull water straight out and you will swear the hydration was wrong.',
      low:  'Even a handful is worth soaking — cover them in water for twenty minutes, drain properly, then fold them in. Toasting first adds a lot and costs nothing.',
      high: 'At this much, soaking is not optional. Dry seeds at this dose will take a 75% dough down to something that feels like 60% by the time you shape it. Flax and chia are the extreme cases — they hold several times their own weight.',
      ruinPct: 25,
      ruin: 'past a quarter, unsoaked seeds will take the dough somewhere unworkable. Soak them, and count the soaking water as liquid.'
    },
    oats: {
      name: 'Rolled oats', group: 'Inclusion', note: 'grain', water: 0.10, absorb: 1.00, band: 10,
      blurb: 'Oats absorb roughly their own weight in water, and they do it slowly — which is why the dough tightens an hour after you thought you had finished.',
      low:  'Soak them first, in water you have counted. A small amount gives a soft, moist crumb and a rustic top if you roll the loaf in a few before proofing.',
      high: 'At this much you must soak them, and you should expect a heavy, moist, close-crumbed loaf. Oats bring no gluten, so this is diluting your structure as well as your water.',
      ruinPct: 25,
      ruin: 'past a quarter you have lost too much gluten to the dilution. Bake it in a tin and enjoy it for what it is.'
    },
    olives: {
      name: 'Olives', group: 'Inclusion', note: 'wet', water: 0.75, absorb: 0, band: 15,
      blurb: 'About three-quarters water, and carrying salt you did not weigh. They give water to the dough rather than taking it.',
      low:  'Pat them dry, halve them, and fold them in at the last set. Take your salt down a little to account for the brine.',
      high: 'At this much the brine is a real factor — cut the salt in the formula by roughly a fifth, and expect a slacker dough than the numbers suggest. Whole olives also tear the crumb as it expands, so halve or quarter them.',
      ruinPct: 35,
      ruin: 'past a third the brine slackens the dough past shaping and the salt starts holding the yeast back. Cut the formula salt hard.'
    },
    cheese: {
      name: 'Hard cheese', group: 'Inclusion', note: 'cheese', water: 0.37, absorb: 0, band: 15,
      blurb: 'Fat, salt and about a third water. It softens the crumb, seasons the loaf, and burns readily on the crust.',
      low:  'Fold it in at the last set. Cut the salt in the formula slightly — hard cheese brings a surprising amount.',
      high: 'At this much, cut the formula salt by a quarter and keep some cheese back for the top, where it is the only part anyone photographs. Watch the base: cheese that reaches the bottom of the pot will burn there before the loaf is done.',
      ruinPct: 30,
      ruin: 'past 30% the fat and salt together stall the rise, and anything touching the pot will burn before the middle is done.'
    },
    fruit: {
      name: 'Dried fruit', group: 'Inclusion', note: 'dried', water: 0.20, absorb: 0.35, band: 20,
      blurb: 'Works in reverse: it pulls water out of the dough while putting sugar in. Both of those change the loaf.',
      low:  'Soak it, drain it well, and fold it in late. Unsoaked fruit rehydrates itself from your dough and leaves you dry.',
      high: 'At this much the sugar is also slowing the bulk down, so give it longer than you think and stop trusting the clock. Fold it in at the very last set — dried fruit tears the gluten if it goes through the shaping.',
      ruinPct: 40,
      ruin: 'past 40% the sugar and the physical bulk together make this a fruit loaf. Tin it, and give it far longer than you think.'
    }
  };


  /* ── § 04 copy: the grouped consequence notes ──────────────────
     These fire once per KIND of thing, so wine and vinegar together
     produce one acid note rather than two. Per-ingredient guidance
     lives on the ingredient above; this is the summary layer.
     ------------------------------------------------------------ */
  var LIQUID_NOTES = {
    booze:        ['is beer', 'Beer is water carrying malt sugar, a little acid and some hop bitterness. The alcohol bakes off; the malt stays, and it is very good against rye. Expect a slightly slower rise and a darker crust than the same dough made with water.'],
    acid:         ['is acidic', 'Wine, juice, citrus and vinegar all bring acid, and acid degrades gluten while slowing the yeast down. Tighter crumb, longer bulk. A splash is flavour. A full swap is a different loaf — denser, tangier, and it will not spring the way you are expecting.'],
    soda:         ['is soda', 'Cola and Dr Pepper are sugar and phosphoric acid in the same glass, so you are doing both of those things at once. Fast dark crust, slow bulk, and a crumb that stays soft for days. Deeply silly. Worth doing once.'],
    dairy:        ['is milk', 'Milk brings fat, sugar and protein together: softer crumb, darker crust, slightly slower ferment. Use it scalded or UHT — raw milk carries enzymes that visibly weaken gluten, and the dough will go slack on you an hour in.'],
    culturedairy: ['is cultured dairy', 'Buttermilk and yogurt bring dairy and acid at the same time — soft crumb and real tang, but the acid is working against your gluten the whole way. Go gentler on the folds and expect it tighter than the hydration suggests.'],
    coffee:       ['is coffee', 'Coffee is acidic and full of tannin, and both tighten gluten. It darkens the crumb and adds a bitterness that reads as depth alongside rye and as a mistake in a plain white loaf. Cold and strong beats hot and weak.'],
    tea:          ['is tea', 'Tea is mostly tannin, which tightens the gluten and colours the crumb. It earns its place with dried fruit and spice. In a plain loaf it mostly just makes the bread look older than it is.'],
    starchy:      ['is potato water', 'Gelatinised starch holds onto water and keeps the crumb soft for days — one of the very few things on this list with no real downside. Old trick, still works.']
  };

  var EXTRA_NOTES = {
    fat:    ['You\'re adding fat', 'Fat coats the gluten strands and stops them linking up, which is exactly why enriched breads are soft and exactly why they do not get an open crumb. Add it after the gluten has built, not at the mix, and expect a slower rise past about 5% of flour weight.'],
    sugar:  ['You\'re adding sugar', 'A little feeds the yeast. A lot starves it — sugar pulls water out of the cells osmotically, so past roughly 10% of flour weight the bulk slows down instead of speeding up. Either way the crust darkens much earlier, so pull it sooner than the colour tells you to.'],
    nuts:   ['You\'re adding nuts', 'Nuts are roughly 60% fat and they have edges. Both cut gluten strands, so fold them in at the last set rather than at the mix. Toast them first — it costs ten minutes and doubles what they taste like.'],
    seeds:  ['You\'re adding seeds', 'Seeds drink. Dropped in dry they pull water straight out of the dough and you will swear the hydration was wrong. Soak them, drain them, then fold them in.'],
    grain:  ['You\'re adding whole grain pieces', 'Rolled oats and cracked grain absorb far more than their weight in flour would suggest, and slowly. Soak them first or the dough will tighten up on you an hour after you thought you had finished.'],
    wet:    ['You\'re adding something brined', 'Olives carry salt and water you did not weigh. Pat them dry, add them at the last fold, and take your salt down — the loaf is already getting some from them.'],
    cheese: ['You\'re adding cheese', 'Hard cheese brings fat and a fair amount of salt. Cut the salt in the formula, add the cheese at the last fold, and keep some back for the top if you want the crust anyone actually photographs.'],
    dried:  ['You\'re adding dried fruit', 'Dried fruit works in reverse: it pulls water out of the dough while putting sugar in. Soak it, drain it well, and fold it in late or it will tear the gluten as you shape.']
  };


  /* ── HYDRATION BANDS ──────────────────────────────────────────
     What the dough will actually be like to handle at a given true
     hydration, and where it stops being worth it. Sourced against
     two people worth listening to:

     Maurizio Leo (The Perfect Loaf) publishes at 80% and says
     plainly that "shaping becomes incredibly difficult as you get
     up past 80%".

     Trevor J. Wilson (Open Crumb Mastery) argues the opposite of
     what most people assume — that hydration is "a distant third"
     behind fermentation and handling, and that telling a beginner
     to just add water "leads only to flat bread and frustration".
     Both of those are in the copy below, because the honest answer
     to "how high can I go" is "higher than you can currently
     handle, and it will not give you what you think".
     ------------------------------------------------------------ */
  var HYDRATION = [
    { max: 58, label: 'Very stiff',
      body: 'This is bagel and pretzel territory. It will be hard work to mix, it will barely rise, and the crumb will be tight and chewy. Nothing wrong with that if it is what you want — but for a boule this is under-watered, and the loaf will come out dense and pale.' },
    { max: 65, label: 'Firm and forgiving',
      body: 'Easy to handle, holds its shape well, tight and even crumb. This is a good place to learn to shape, and a good place to be with low-protein flour. You will not get an open crumb here, and that is the trade you are making.' },
    { max: 72, label: 'The comfortable middle',
      body: 'Slightly tacky, shapes cleanly, rises predictably. Most of the sourdough anyone actually eats lives here. If something is going wrong with your bread, it is almost certainly not the hydration at this level.' },
    { max: 78, label: 'Getting slack',
      body: 'Sticky enough to want wet hands and a bench scraper. Shaping needs to be quick and confident rather than careful — hesitate and it spreads. Worth the step up if your shaping is solid, frustrating if it is not.' },
    { max: 85, label: 'High hydration',
      body: 'Past 80%, <a href="/flour/white-bread-flour.html">strong bread flour</a> stops being optional and <a href="/techniques/coil-folds.html">coil folds</a> replace stretch and folds entirely — a normal stretch will tear this. Maurizio Leo of The Perfect Loaf, who bakes at 80% deliberately, puts it plainly: shaping becomes incredibly difficult past that mark. A <a href="/techniques/cold-retard.html">cold retard</a> is close to mandatory, because this dough is unscoreable at room temperature.',
      warn: true },
    { max: 92, label: 'Very high — ciabatta country',
      body: 'This barely behaves like dough. It wants a mixer or a very great deal of folding, it will not hold a free-standing shape without serious skill, and it belongs in a tin or a couche more than a banneton. Bakers do work here and get spectacular results. They also have years of practice and better flour than most of us.',
      warn: true },
    { max: 999, label: 'That is batter',
      body: 'Above about 92% you have left bread dough behind. It will not hold gas, it will not hold a shape, and it will bake into something closer to a crumpet than a loaf. Worth knowing: Trevor J. Wilson, who wrote the book on open crumb, ranks hydration a <em>distant third</em> behind fermentation and handling — and warns that telling a new baker to just add water "leads only to flat bread and frustration". If you are chasing big holes, this is the wrong lever.',
      warn: true }
  ];

  /* ── DOUGH SIZE BANDS ─────────────────────────────────────────
     What the finished weight means in practice — whether it fits
     the banneton and the pot you own, and how the bake changes.
     Figures are for common home equipment: a 9-inch round banneton
     takes roughly 750–1000 g, a 10-inch oval a little more, and a
     4–6 quart Dutch oven is comfortable up to about 1200 g.
     ------------------------------------------------------------ */
  var DOUGH_SIZE = [
    { max: 300, label: 'That is a roll',
      body: 'Under 300 g is one large roll, not a loaf. It will bake in roughly half the time — start checking at 20 minutes — and it will go from pale to burnt very quickly. Fine on a tray with a bowl over it; a Dutch oven is overkill.',
      warn: true },
    { max: 500, label: 'A small loaf',
      body: 'A proper mini boule. Fits any banneton with room to spare, and bakes in about 35 minutes rather than 45. Good for testing a formula before you commit a full bag of flour to it.' },
    { max: 1100, label: 'One standard loaf',
      body: 'The normal size, and what almost every recipe and every piece of home equipment is built around. Fits a 9-inch banneton, fits a 4–6 quart Dutch oven, bakes in the usual 20 covered plus 20–25 uncovered.' },
    { max: 1500, label: 'A big loaf',
      body: 'This needs a 10-inch banneton and at least a 6-quart pot — in a 4-quart it will touch the sides and burn there. Add roughly 10 minutes covered, and check the internal temperature rather than the clock. A miche this size is a real thing, just make sure your kit fits it.',
      warn: true },
    { max: 2400, label: 'That is two loaves',
      body: 'Divide it after the bulk. No home banneton takes this in one piece and no home oven bakes it evenly — the crust would be black before the middle hit temperature. Split it, shape two, and bake them one after the other.',
      warn: true },
    { max: 999999, label: 'You are running a bakery now',
      body: 'This is a commercial batch. Your mixer will not take it, your fridge will not fit it, and your oven certainly will not. Divide by four and start there — or do open a bakery, we are not the boss of you.',
      warn: true }
  ];

  /* ── ABSURDITY ────────────────────────────────────────────────
     For when the numbers stop describing bread. The engine decides
     which of these fire; the copy lives here with everything else.
     The point is not to stop anyone. It is to be honest about what
     is about to come out of the oven.
     ------------------------------------------------------------ */
  var ABSURD = {
    salt:     ['You have invented the salt lick', 'Past about 5% salt the yeast is not slowed down so much as buried. The dough will barely rise and the loaf will be inedible — not "acquired taste" inedible, actually inedible. Two percent is standard. Three is bold. This is neither.'],
    starter:  ['That is mostly starter', 'Past about half the flour weight in starter, you have skipped the dough and gone straight to a very large pancake batter with ambitions. It will ferment absurdly fast, taste sharply sour, and collapse before you get near the oven.'],
    hydration:['This is soup', 'You are past the point where flour and water make dough. Pour this in a pan and you have a very sad crêpe. If you meant to do this, respect — but the oven is going to hand it straight back to you.'],
    extras:   ['The bread is now a garnish', 'Your add-ins outweigh your flour. Whatever this is, it is held together by hope and a small amount of gluten. It may well taste good. It will not slice, it will not rise, and calling it bread is a stretch that a court would not uphold.'],
    nosalt:   ['No salt at all', 'Salt-free bread is a real thing — pane sciocco in Tuscany, on purpose, for centuries. It also ferments noticeably faster and tastes, to most people who did not grow up with it, like something is missing. Deliberate: good. Forgotten: you will know at the first bite.'],
    noflour:  ['There is no flour here', 'Bread needs flour. This is the one ingredient the tool cannot talk you out of. Add some and everything below will start making sense again.']
  };

  return { FLOURS: FLOURS, LIQUIDS: LIQUIDS, EXTRAS: EXTRAS,
           LIQUID_NOTES: LIQUID_NOTES, EXTRA_NOTES: EXTRA_NOTES,
           HYDRATION: HYDRATION, DOUGH_SIZE: DOUGH_SIZE, ABSURD: ABSURD };

})();
