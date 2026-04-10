/* ============================================
   Target Cursor - Vanilla JS (adapted from react-bits)
   ============================================ */
(function () {
  const CONFIG = {
    targetSelector: 'a, button, .work-card, .nav-link, .footer-link, .nav-logo',
    spinDuration: 2,
    hideDefaultCursor: true,
    hoverDuration: 0.2,
    parallaxOn: true,
    borderWidth: 1.5,
    cornerSize: 6
  };

  // Mobile detection
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobile = (hasTouchScreen && isSmallScreen) || mobileRegex.test(userAgent.toLowerCase());

  if (isMobile) return;

  // Create cursor DOM
  const cursor = document.createElement('div');
  cursor.className = 'target-cursor-wrapper';
  cursor.innerHTML = `
    <div class="target-cursor-dot"></div>
    <div class="target-cursor-corner corner-tl"></div>
    <div class="target-cursor-corner corner-tr"></div>
    <div class="target-cursor-corner corner-br"></div>
    <div class="target-cursor-corner corner-bl"></div>
  `;
  document.body.appendChild(cursor);

  const dot = cursor.querySelector('.target-cursor-dot');
  const corners = cursor.querySelectorAll('.target-cursor-corner');

  let activeTarget = null;
  let currentLeaveHandler = null;
  let resumeTimeout = null;
  let spinTl = null;
  let isActive = false;
  let targetCornerPositions = null;
  let activeStrength = { current: 0 };
  let tickerFn = null;

  // Hide default cursor
  if (CONFIG.hideDefaultCursor) {
    document.body.style.cursor = 'none';
    // Also hide cursor on all interactive elements
    const style = document.createElement('style');
    style.textContent = `
      a, button, input, textarea, select, [role="button"] { cursor: none !important; }
    `;
    document.head.appendChild(style);
  }

  // Init position
  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  // Spin animation
  function createSpinTimeline() {
    if (spinTl) spinTl.kill();
    spinTl = gsap.timeline({ repeat: -1 })
      .to(cursor, { rotation: '+=360', duration: CONFIG.spinDuration, ease: 'none' });
  }
  createSpinTimeline();

  // Move cursor
  function moveCursor(x, y) {
    gsap.to(cursor, { x, y, duration: 0.1, ease: 'power3.out' });
  }

  // Ticker for parallax corner tracking
  tickerFn = function () {
    if (!targetCornerPositions || !corners.length) return;

    const strength = activeStrength.current;
    if (strength === 0) return;

    const cursorX = gsap.getProperty(cursor, 'x');
    const cursorY = gsap.getProperty(cursor, 'y');

    corners.forEach(function (corner, i) {
      const currentX = gsap.getProperty(corner, 'x');
      const currentY = gsap.getProperty(corner, 'y');

      const targetX = targetCornerPositions[i].x - cursorX;
      const targetY = targetCornerPositions[i].y - cursorY;

      const finalX = currentX + (targetX - currentX) * strength;
      const finalY = currentY + (targetY - currentY) * strength;

      const duration = strength >= 0.99 ? (CONFIG.parallaxOn ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? 'none' : 'power1.out',
        overwrite: 'auto'
      });
    });
  };

  // Cleanup target listeners
  function cleanupTarget(target) {
    if (currentLeaveHandler) {
      target.removeEventListener('mouseleave', currentLeaveHandler);
    }
    currentLeaveHandler = null;
  }

  // Mouse move
  window.addEventListener('mousemove', function (e) {
    moveCursor(e.clientX, e.clientY);
  });

  // Scroll handler
  window.addEventListener('scroll', function () {
    if (!activeTarget) return;
    const mouseX = gsap.getProperty(cursor, 'x');
    const mouseY = gsap.getProperty(cursor, 'y');
    const el = document.elementFromPoint(mouseX, mouseY);
    const isStillOver = el && (el === activeTarget || el.closest(CONFIG.targetSelector) === activeTarget);
    if (!isStillOver && currentLeaveHandler) {
      currentLeaveHandler();
    }
  }, { passive: true });

  // Mouse down/up
  window.addEventListener('mousedown', function () {
    gsap.to(dot, { scale: 0.7, duration: 0.3 });
    gsap.to(cursor, { scale: 0.9, duration: 0.2 });
  });

  window.addEventListener('mouseup', function () {
    gsap.to(dot, { scale: 1, duration: 0.3 });
    gsap.to(cursor, { scale: 1, duration: 0.2 });
  });

  // Hover enter
  window.addEventListener('mouseover', function (e) {
    var directTarget = e.target;
    var allTargets = [];
    var current = directTarget;

    while (current && current !== document.body) {
      try {
        if (current.matches && current.matches(CONFIG.targetSelector)) {
          allTargets.push(current);
        }
      } catch (err) { /* ignore */ }
      current = current.parentElement;
    }

    var target = allTargets[0] || null;
    if (!target || !corners.length) return;
    if (activeTarget === target) return;

    if (activeTarget) {
      cleanupTarget(activeTarget);
    }
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }

    activeTarget = target;
    corners.forEach(function (corner) { gsap.killTweensOf(corner); });

    gsap.killTweensOf(cursor, 'rotation');
    if (spinTl) spinTl.pause();
    gsap.set(cursor, { rotation: 0 });

    var rect = target.getBoundingClientRect();
    var cursorX = gsap.getProperty(cursor, 'x');
    var cursorY = gsap.getProperty(cursor, 'y');

    targetCornerPositions = [
      { x: rect.left - CONFIG.borderWidth, y: rect.top - CONFIG.borderWidth },
      { x: rect.right + CONFIG.borderWidth - CONFIG.cornerSize, y: rect.top - CONFIG.borderWidth },
      { x: rect.right + CONFIG.borderWidth - CONFIG.cornerSize, y: rect.bottom + CONFIG.borderWidth - CONFIG.cornerSize },
      { x: rect.left - CONFIG.borderWidth, y: rect.bottom + CONFIG.borderWidth - CONFIG.cornerSize }
    ];

    isActive = true;
    gsap.ticker.add(tickerFn);

    gsap.to(activeStrength, {
      current: 1,
      duration: CONFIG.hoverDuration,
      ease: 'power2.out'
    });

    corners.forEach(function (corner, i) {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cursorX,
        y: targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    var leaveHandler = function () {
      gsap.ticker.remove(tickerFn);

      isActive = false;
      targetCornerPositions = null;
      gsap.set(activeStrength, { current: 0, overwrite: true });
      activeTarget = null;

      if (corners.length) {
        gsap.killTweensOf(corners);
        var positions = [
          { x: -CONFIG.cornerSize * 1.5, y: -CONFIG.cornerSize * 1.5 },
          { x: CONFIG.cornerSize * 0.5, y: -CONFIG.cornerSize * 1.5 },
          { x: CONFIG.cornerSize * 0.5, y: CONFIG.cornerSize * 0.5 },
          { x: -CONFIG.cornerSize * 1.5, y: CONFIG.cornerSize * 0.5 }
        ];
        var tl = gsap.timeline();
        corners.forEach(function (corner, index) {
          tl.to(corner, {
            x: positions[index].x,
            y: positions[index].y,
            duration: 0.3,
            ease: 'power3.out'
          }, 0);
        });
      }

      resumeTimeout = setTimeout(function () {
        if (!activeTarget && cursor && spinTl) {
          var currentRotation = gsap.getProperty(cursor, 'rotation');
          var normalizedRotation = currentRotation % 360;
          spinTl.kill();
          spinTl = gsap.timeline({ repeat: -1 })
            .to(cursor, { rotation: '+=360', duration: CONFIG.spinDuration, ease: 'none' });
          gsap.to(cursor, {
            rotation: normalizedRotation + 360,
            duration: CONFIG.spinDuration * (1 - normalizedRotation / 360),
            ease: 'none',
            onComplete: function () {
              if (spinTl) spinTl.restart();
            }
          });
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    };

    currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  }, { passive: true });

  // Hide custom cursor in footer garden area (watering can only)
  var footer = document.querySelector('.footer');
  if (footer) {
    footer.addEventListener('mouseenter', function () {
      gsap.to(cursor, { opacity: 0, duration: 0.15 });
    });
    footer.addEventListener('mouseleave', function () {
      gsap.to(cursor, { opacity: 1, duration: 0.15 });
    });
  }
})();
