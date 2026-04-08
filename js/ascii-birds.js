/* ============================================
   ASCII Birds Animation Player
   ============================================ */
(function () {
  var container = document.getElementById('asciiBirds');
  if (!container) return;

  var pre = container.querySelector('pre');
  var currentFrame = 0;
  var totalFrames = BIRD_FRAMES.length;

  function renderFrame() {
    pre.textContent = BIRD_FRAMES[currentFrame];
    var duration = BIRD_DURATIONS[currentFrame] || 67;
    currentFrame = (currentFrame + 1) % totalFrames;
    setTimeout(renderFrame, duration);
  }

  renderFrame();
})();
