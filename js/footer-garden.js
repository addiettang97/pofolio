/* ============================================
   Footer ASCII Garden
   Ported from demo-ascii-garden.html
   ============================================ */
(function () {
  var garden = document.getElementById('footerGarden');
  if (!garden) return;

  // Colors — adapt to theme
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';

  var G  = isLight ? 'rgb(0, 140, 140)'   : 'rgb(0, 210, 210)';
  var LG = isLight ? 'rgb(30, 160, 100)'   : 'rgb(80, 255, 180)';
  var Y  = isLight ? 'rgb(80, 80, 60)'     : 'rgb(220, 240, 255)';
  var PK = isLight ? 'rgb(200, 0, 80)'     : 'rgb(255, 0, 110)';
  var RD = isLight ? 'rgb(200, 40, 0)'     : 'rgb(255, 60, 0)';
  var MG = isLight ? 'rgb(140, 0, 200)'    : 'rgb(190, 0, 255)';
  var BL = isLight ? 'rgb(0, 100, 200)'    : 'rgb(0, 150, 255)';

  // Plant templates
  var GRASS = [[' \\ |/', G, false]];
  var CAT_R = [[' (*)', Y, false],[' >/', G, false]];
  var CAT_L = [['(*) ', Y, false],[' >\\', G, false]];

  var DOTS_A = [['  @', PK, true],[' \\|/', G, true],['^^^^', G, true],['  ..', PK, false]];
  var DOTS_B = [[' vVv', PK, true],[' (_)', PK, true],[' \\|/', G, true],['  ..', PK, false]];
  var DOTS_C = [[' ,,,', PK, true],[' ~Y~', PK, true],[' \\|/', G, true],['  ..', PK, false]];

  var SEED_V = [[' ,,,', BL, true],[' ~Y~', BL, true],['  v', BL, false],['  Y', LG, false],['^^^^^', LG, false]];
  var SEED_VVV = [[' ,,,', BL, true],[' ~Y~', BL, true],[' vvv', BL, false],['  Y', LG, false],['^^^^^', LG, false]];

  var SPROUT_MG = [[' (o)', MG, true],[' \\|/', G, true],['  .', MG, false],[' \\|', G, false]];
  var SPROUT_RD = [[' (o)', RD, true],[' \\|/', LG, true],['  .', RD, false],[' \\|', LG, false]];

  var BIG_FLOWER = [[' vVv', PK, true],[' (_)', PK, true],['  .', PK, false],[' \\|', G, false],[' ^^^', G, false]];
  var TULIP = [[' ,,,', RD, true],[' ~Y~', RD, true],[' vVv', RD, false],[' \\|/', LG, false],[' ^^^', LG, false]];

  var TALL_A = [[' ,,,', PK, true],[' ~Y~', PK, true],[' \\|/', G, true],['  ,', PK, false],['  |', G, false],[' ^^^', G, false]];
  var TALL_B = [[' ,,,', PK, true],[' ~Y~', G, true],[' \\|/', G, true],['  ,', PK, false],['  |', G, false],[' ^^^', G, false]];

  var O_FLOWER = [[' (o)', RD, false],[' \\|/', LG, false]];
  var CACTUS = [['  .', MG, false],['\\(| ', G, false],[' ,-', G, false],[' \\|/', G, false]];
  var BUG = [['  @', PK, false],[' \\|/', LG, false],[' ^^^', LG, false]];
  var DOT_ROOT = [['  .', PK, false],[' ^^^', G, false]];
  var FULL_GROWN = [['vVVVv', RD, false],['(___)', RD, false],[' ~Y~', LG, false],['  |/', LG, false],[' \\|', LG, false],['\\\\|//', LG, false],['^^^^^', LG, false]];

  // Bunny!
  var BUNNY = [
    ['(\\(\\', Y, false],
    ['( -.-)', Y, false],
    ['o_(")(") ', G, false]
  ];
  var BUNNY_ID = 'bunny';

  // Placements [left%, top%, template, sway]
  var placements = [
    [39,5,GRASS,'sw-a'],[27,12,DOTS_A,'sw-b'],[2,30,CAT_L,'sw-c'],[44,13,GRASS,'sw-d'],[78,25,CAT_R,'sw-e'],[70,14,DOTS_B,'sw-f'],
    [18,17,SEED_V,'sw-a'],[33,17,SPROUT_MG,'sw-b'],[53,20,TULIP,'sw-c'],[60,13,SEED_V,'sw-d'],[85,22,GRASS,'sw-e'],
    [8,42,SPROUT_RD,'sw-f'],[27,31,TALL_A,'sw-a'],[62,26,TALL_A,'sw-b'],
    [47,38,BIG_FLOWER,'sw-c'],[75,30,BIG_FLOWER,'sw-d'],[35,45,DOTS_C,'sw-e'],[65,42,GRASS,'sw-f'],
    [3,55,GRASS,'sw-a'],[12,51,O_FLOWER,'sw-b'],[22,47,BIG_FLOWER,'sw-c'],[54,53,CAT_R,'sw-d'],[73,53,GRASS,'sw-e'],[90,47,BIG_FLOWER,'sw-f'],
    [40,64,SEED_VVV,'sw-a'],[29,72,GRASS,'sw-b'],[80,60,CAT_R,'sw-c'],
    [5,76,TALL_B,'sw-d'],[22,82,CACTUS,'sw-e'],[55,82,BUG,'sw-f'],[46,92,DOT_ROOT,'sw-a'],[67,76,CACTUS,'sw-b'],[75,88,FULL_GROWN,'sw-c'],[80,78,O_FLOWER,'sw-d'],[93,76,TALL_A,'sw-e'],
    [50,45,BUNNY,'bunny-hop']
  ];

  // Build plants
  var plants = [];
  var wateredCount = 0;
  var growableCount = 0;

  // Progress counter
  var progressEl = document.createElement('div');
  progressEl.className = 'garden-progress';
  garden.appendChild(progressEl);

  placements.forEach(function (p) {
    var el = document.createElement('div');
    var isBunny = p[2] === BUNNY;
    el.className = 'plant ' + p[3];
    if (isBunny) el.id = 'gardenBunny';
    el.setAttribute('tabindex', '0');
    el.style.left = p[0] + '%';
    el.style.top = p[1] + '%';

    var hasHidden = false;
    p[2].forEach(function (line) {
      var span = document.createElement('span');
      span.className = 'ln';
      span.textContent = line[0];
      span.style.color = line[1];
      if (line[2]) {
        span.classList.add('hid');
        hasHidden = true;
      }
      el.appendChild(span);
    });

    el._watered = isBunny ? true : false; // bunny can't be watered
    el._isBunny = isBunny;
    el._hasHidden = hasHidden;
    if (hasHidden && !isBunny) growableCount++;
    garden.appendChild(el);
    plants.push(el);
  });

  updateProgress();

  // Watering
  function waterPlant(el) {
    if (el._watered) return;
    el._watered = true;

    el.classList.add('bloom');
    el.addEventListener('animationend', function handler() {
      el.classList.remove('bloom');
      el.classList.add('watered');
      el.removeEventListener('animationend', handler);
    });

    // Staggered reveal bottom-to-top
    var hiddenLines = Array.prototype.slice.call(el.querySelectorAll('.hid')).reverse();
    hiddenLines.forEach(function (ln, i) {
      ln.style.transition = 'opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1) ' + (i * 0.15) + 's';
    });

    spawnBurst(el);

    if (el._hasHidden) {
      wateredCount++;
      updateProgress();
    }
  }

  function updateProgress() {
    progressEl.textContent = wateredCount + ' / ' + growableCount + ' watered';
    if (wateredCount === growableCount && growableCount > 0) {
      progressEl.classList.add('done');
      for (var i = 0; i < 30; i++) {
        (function (idx) {
          setTimeout(function () {
            var d = document.createElement('span');
            d.className = 'drop splash';
            d.textContent = ['*', '~', '^', ',', '.'][Math.floor(Math.random() * 5)];
            d.style.color = [PK, G, LG, BL, RD][Math.floor(Math.random() * 5)];
            d.style.left = (Math.random() * 100) + '%';
            d.style.top = (Math.random() * 100) + '%';
            garden.appendChild(d);
            d.addEventListener('animationend', function () { d.remove(); });
          }, idx * 60);
        })(i);
      }
    }
  }

  function spawnBurst(el) {
    var gRect = garden.getBoundingClientRect();
    var pRect = el.getBoundingClientRect();
    var cx = pRect.left - gRect.left + pRect.width / 2;
    var cy = pRect.top - gRect.top;
    var chars = ['~', ',', '·', '.', '*', '^'];

    for (var i = 0; i < 6; i++) {
      var d = document.createElement('span');
      d.className = 'drop splash';
      d.textContent = chars[i];
      d.style.left = (cx + (Math.random() - 0.5) * 40) + 'px';
      d.style.top = (cy + Math.random() * 12 - 4) + 'px';
      d.style.animationDelay = (i * 0.06) + 's';
      garden.appendChild(d);
      d.addEventListener('animationend', function () { d.remove(); });
    }
  }

  // Cursor trail
  var lastDrop = 0;
  garden.addEventListener('mousemove', function (e) {
    var gRect = garden.getBoundingClientRect();
    var mx = e.clientX - gRect.left;
    var my = e.clientY - gRect.top;

    // Proximity check
    plants.forEach(function (p) {
      if (p._watered) { p.classList.remove('near'); return; }
      var r = p.getBoundingClientRect();
      var px = r.left - gRect.left + r.width / 2;
      var py = r.top - gRect.top + r.height / 2;
      var dist = Math.sqrt((mx - px) * (mx - px) + (my - py) * (my - py));

      if (dist < 55) {
        waterPlant(p);
        p.classList.remove('near');
      } else if (dist < 100) {
        p.classList.add('near');
      } else {
        p.classList.remove('near');
      }
    });

    // Water drops
    var now = Date.now();
    if (now - lastDrop > 60) {
      for (var i = 0; i < 2; i++) {
        var d = document.createElement('span');
        d.className = 'drop';
        d.textContent = [',', '~', '·', '.'][Math.floor(Math.random() * 4)];
        d.style.left = (mx + (Math.random() - 0.5) * 12) + 'px';
        d.style.top = (my + (Math.random() - 0.5) * 6) + 'px';
        d.style.animationDelay = (i * 0.05) + 's';
        garden.appendChild(d);
        d.addEventListener('animationend', function () { d.remove(); });
      }
      lastDrop = now;
    }
  });

  // Click to water
  garden.addEventListener('click', function (e) {
    var gRect = garden.getBoundingClientRect();
    var mx = e.clientX - gRect.left;
    var my = e.clientY - gRect.top;

    plants.forEach(function (p) {
      if (p._watered) return;
      var r = p.getBoundingClientRect();
      var px = r.left - gRect.left + r.width / 2;
      var py = r.top - gRect.top + r.height / 2;
      if (Math.sqrt((mx - px) * (mx - px) + (my - py) * (my - py)) < 80) {
        waterPlant(p);
      }
    });
  });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('plant')) {
      e.preventDefault();
      waterPlant(document.activeElement);
    }
  });

  // Double-click reset
  garden.addEventListener('dblclick', function (e) {
    if (e.target !== garden && !e.target.classList.contains('garden-progress')) return;
    plants.forEach(function (p) {
      if (p._isBunny) return;
      p._watered = false;
      p.classList.remove('watered', 'bloom', 'near');
      p.querySelectorAll('.hid').forEach(function (ln) {
        ln.style.transition = 'none';
        void ln.offsetHeight;
        ln.style.transition = '';
      });
    });
    wateredCount = 0;
    progressEl.classList.remove('done');
    updateProgress();
  });

  // Bunny speech bubble + random roaming
  var bunnyEl = document.getElementById('gardenBunny');
  if (bunnyEl) {
    var bubble = document.createElement('div');
    bubble.className = 'bunny-bubble';
    bubble.textContent = 'catch me!';
    bunnyEl.appendChild(bubble);

    bunnyEl.addEventListener('mouseenter', function () {
      bubble.classList.add('show');
    });
    bunnyEl.addEventListener('mouseleave', function () {
      bubble.classList.remove('show');
    });

    // Random roaming
    var currentLeft = 50;
    function bunnyRoam() {
      var newLeft = 5 + Math.random() * 85;
      var newTop = 10 + Math.random() * 75;

      // Mirror based on direction
      if (newLeft < currentLeft) {
        bunnyEl.classList.add('facing-left');
        bunnyEl.classList.remove('facing-right');
      } else {
        bunnyEl.classList.add('facing-right');
        bunnyEl.classList.remove('facing-left');
      }
      currentLeft = newLeft;

      bunnyEl.style.left = newLeft + '%';
      bunnyEl.style.top = newTop + '%';
    }

    setInterval(bunnyRoam, 5000);
  }

  // Re-color plants when theme changes
  function getColors() {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      G:  light ? 'rgb(0, 140, 140)'  : 'rgb(0, 210, 210)',
      LG: light ? 'rgb(30, 160, 100)' : 'rgb(80, 255, 180)',
      Y:  light ? 'rgb(80, 80, 60)'   : 'rgb(220, 240, 255)',
      PK: light ? 'rgb(200, 0, 80)'   : 'rgb(255, 0, 110)',
      RD: light ? 'rgb(200, 40, 0)'   : 'rgb(255, 60, 0)',
      MG: light ? 'rgb(140, 0, 200)'  : 'rgb(190, 0, 255)',
      BL: light ? 'rgb(0, 100, 200)'  : 'rgb(0, 150, 255)'
    };
  }

  var colorMap = {
    'rgb(0, 210, 210)': 'G', 'rgb(0, 140, 140)': 'G',
    'rgb(80, 255, 180)': 'LG', 'rgb(30, 160, 100)': 'LG',
    'rgb(220, 240, 255)': 'Y', 'rgb(80, 80, 60)': 'Y',
    'rgb(255, 0, 110)': 'PK', 'rgb(200, 0, 80)': 'PK',
    'rgb(255, 60, 0)': 'RD', 'rgb(200, 40, 0)': 'RD',
    'rgb(190, 0, 255)': 'MG', 'rgb(140, 0, 200)': 'MG',
    'rgb(0, 150, 255)': 'BL', 'rgb(0, 100, 200)': 'BL'
  };

  new MutationObserver(function () {
    var c = getColors();
    garden.querySelectorAll('.plant .ln').forEach(function (ln) {
      var key = colorMap[ln.style.color];
      if (key && c[key]) ln.style.color = c[key];
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
