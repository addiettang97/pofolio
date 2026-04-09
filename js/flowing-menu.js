/* ============================================
   Flowing Menu — Vanilla JS
   Single "Contact Me" bar with marquee reveal
   ============================================ */
(function () {
  var item = document.querySelector('.menu__item');
  if (!item) return;

  var marquee = item.querySelector('.marquee');
  var inner = item.querySelector('.marquee__inner');
  var SPEED = 20;

  var contactParts = [
    'Tel: 18520720801',
    'Mail: 462701060@qq.com',
    'WeChat: 462701060'
  ];

  function fillMarquee() {
    inner.innerHTML = '';
    // Build one set
    var testSet = document.createElement('div');
    testSet.style.display = 'inline-flex';
    testSet.style.position = 'absolute';
    testSet.style.visibility = 'hidden';
    contactParts.forEach(function (t) {
      var part = document.createElement('div');
      part.className = 'marquee__part';
      part.innerHTML = '<span>' + t + '</span><span class="marquee__dot">●</span>';
      testSet.appendChild(part);
    });
    document.body.appendChild(testSet);
    var setW = testSet.offsetWidth || 600;
    document.body.removeChild(testSet);

    var reps = Math.ceil((window.innerWidth * 2) / setW) + 2;
    for (var r = 0; r < reps; r++) {
      contactParts.forEach(function (t) {
        var part = document.createElement('div');
        part.className = 'marquee__part';
        part.innerHTML = '<span>' + t + '</span><span class="marquee__dot">●</span>';
        inner.appendChild(part);
      });
    }
  }

  fillMarquee();
  window.addEventListener('resize', fillMarquee);

  // Hide initially
  gsap.set(marquee, { y: '101%' });

  var loopAnim = null;

  function startLoop() {
    if (loopAnim) loopAnim.kill();
    // Width of one full set of 3 parts
    var allParts = inner.querySelectorAll('.marquee__part');
    var oneSetW = 0;
    for (var i = 0; i < contactParts.length && i < allParts.length; i++) {
      oneSetW += allParts[i].offsetWidth;
    }
    if (!oneSetW) return;
    gsap.set(inner, { x: 0 });
    loopAnim = gsap.to(inner, {
      x: -oneSetW,
      duration: SPEED,
      ease: 'none',
      repeat: -1
    });
  }

  // Edge detection
  function getEdge(el, e) {
    var rect = el.getBoundingClientRect();
    var y = e.clientY - rect.top;
    var dTop = y;
    var dBottom = rect.height - y;
    return dTop < dBottom ? 'top' : 'bottom';
  }

  item.addEventListener('mouseenter', function (e) {
    var edge = getEdge(item, e);
    var from = edge === 'top' ? '-101%' : '101%';
    startLoop();
    gsap.fromTo(marquee,
      { y: from },
      { y: '0%', duration: 0.4, ease: 'power3.out' }
    );
  });

  item.addEventListener('mouseleave', function (e) {
    var edge = getEdge(item, e);
    var to = edge === 'top' ? '-101%' : '101%';
    gsap.to(marquee, {
      y: to,
      duration: 0.3,
      ease: 'power3.in',
      onComplete: function () {
        if (loopAnim) loopAnim.kill();
      }
    });
  });
})();
