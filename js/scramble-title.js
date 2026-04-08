/**
 * ScrambledText - 鼠标悬停时附近字符变为乱码（.:），离开后恢复
 * 纯 JS 实现，灵感来自 reactbits.dev ScrambledText (GSAP ScrambleTextPlugin)
 *
 * 用法: 给元素加 data-scramble 属性
 * 可选属性:
 *   data-scramble-radius="100"    鼠标影响半径(px)
 *   data-scramble-chars=".:"      乱码使用的字符集
 *   data-scramble-speed="50"      恢复速度(ms/字符)
 */

class ScrambledText {
  constructor(el, options = {}) {
    this.el = el;
    this.radius = options.radius || 100;
    this.scrambleChars = options.chars || '.:';
    this.recoverySpeed = options.speed || 50;
    this.duration = options.duration || 800; // ms

    this.originalText = el.textContent;
    this.chars = []; // { span, original, scrambled, recovering, timer }
    this.isAccent = el.classList.contains('accent');

    this.init();
  }

  init() {
    // 将文本拆分为单字符 span
    this.el.textContent = '';
    for (const char of this.originalText) {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = 'scramble-char-item';
      if (char === ' ') {
        span.style.display = 'inline';
        span.innerHTML = '&nbsp;';
      } else {
        span.style.display = 'inline-block';
      }
      this.el.appendChild(span);
      this.chars.push({
        span,
        original: char,
        scrambled: false,
        timer: null,
        scrambleInterval: null
      });
    }

    // 监听鼠标移动
    this.handleMove = this.onPointerMove.bind(this);
    this.handleLeave = this.onPointerLeave.bind(this);
    this.el.addEventListener('pointermove', this.handleMove);
    this.el.addEventListener('pointerleave', this.handleLeave);
  }

  onPointerMove(e) {
    this.chars.forEach(item => {
      if (item.original === ' ') return;

      const rect = item.span.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.radius) {
        this.scrambleChar(item, dist);
      }
    });
  }

  onPointerLeave() {
    // 鼠标离开后恢复所有字符
    this.chars.forEach(item => {
      if (item.scrambled) {
        this.recoverChar(item);
      }
    });
  }

  scrambleChar(item, dist) {
    // 如果已经在乱码中，不重复触发
    if (item.scrambled) return;

    item.scrambled = true;

    // 清除之前的恢复定时器
    if (item.timer) {
      clearTimeout(item.timer);
      item.timer = null;
    }
    if (item.scrambleInterval) {
      clearInterval(item.scrambleInterval);
    }

    // 持续随机跳动
    item.span.textContent = this.randomChar();
    item.span.style.opacity = '0.5';

    item.scrambleInterval = setInterval(() => {
      item.span.textContent = this.randomChar();
    }, 60);

    // 根据距离计算恢复延迟：越近持续越久
    const proximity = 1 - (dist / this.radius);
    const delay = this.duration * proximity + 200;

    item.timer = setTimeout(() => {
      this.recoverChar(item);
    }, delay);
  }

  recoverChar(item) {
    if (item.scrambleInterval) {
      clearInterval(item.scrambleInterval);
      item.scrambleInterval = null;
    }

    // 快速闪烁几次后恢复
    let flicks = 0;
    const maxFlicks = 3 + Math.floor(Math.random() * 3);
    const flickInterval = setInterval(() => {
      if (flicks >= maxFlicks) {
        clearInterval(flickInterval);
        item.span.textContent = item.original;
        item.span.style.opacity = '1';
        item.scrambled = false;
        return;
      }
      item.span.textContent = this.randomChar();
      flicks++;
    }, this.recoverySpeed);

    if (item.timer) {
      clearTimeout(item.timer);
      item.timer = null;
    }
  }

  randomChar() {
    return this.scrambleChars[Math.floor(Math.random() * this.scrambleChars.length)];
  }

  destroy() {
    this.el.removeEventListener('pointermove', this.handleMove);
    this.el.removeEventListener('pointerleave', this.handleLeave);
    this.chars.forEach(item => {
      if (item.timer) clearTimeout(item.timer);
      if (item.scrambleInterval) clearInterval(item.scrambleInterval);
    });
    this.el.textContent = this.originalText;
  }
}

/**
 * 初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-scramble]');

  elements.forEach((el, index) => {
    // 入场动画：先让文字正常显示
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';

      new ScrambledText(el, {
        radius: parseInt(el.dataset.scrambleRadius) || 100,
        chars: el.dataset.scrambleChars || '.:',
        speed: parseInt(el.dataset.scrambleSpeed) || 50,
        duration: 800
      });
    }, 400 + index * 250);
  });
});
