/**
 * TextScramble - 文字乱码动画
 * 灵感来自 pacolui.com 的文字切换效果
 * 使用 requestAnimationFrame 驱动，随机字符过渡后显示最终文字
 */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}+*^?#~@$%&=';
    this.frameRate = 30; // 每个字符的乱码帧数
    this.frame = 0;
    this.queue = [];
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  /**
   * 设置新文字，返回 Promise（动画完成时 resolve）
   */
  setText(newText) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));

    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      // 每个字符的动画起始帧和结束帧略有差异，产生波浪效果
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20) + 10;
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();

    return promise;
  }

  /**
   * 逐帧更新
   */
  update() {
    let output = '';
    let complete = 0;

    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        // 动画结束，显示目标字符
        complete++;
        output += to;
      } else if (this.frame >= start) {
        // 动画进行中，显示随机字符
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        // 尚未开始，显示原字符
        output += from;
      }
    }

    this.el.innerHTML = output;
    this.frame++;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
    }
  }

  /**
   * 返回随机字符
   */
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

/**
 * 初始化文字循环切换
 */
function initTextScramble() {
  const el = document.getElementById('scrambleText');
  if (!el) return;

  const phrases = [
    'Designing products that people love to use.',
    'Clean code, clean design, clean experience.',
    'Open to new opportunities and collaborations.',
    'Turning complex problems into simple solutions.',
    'Currently based in Toronto, Canada.',
    'Fueled by coffee and good music.',
    'Passionate about accessible design.',
    'Building bridges between design and code.'
  ];

  const fx = new TextScramble(el);
  let counter = 0;

  const next = () => {
    fx.setText(phrases[counter]).then(() => {
      setTimeout(next, 3000); // 每 3 秒切换一次
    });
    counter = (counter + 1) % phrases.length;
  };

  // 延迟启动，等待页面入场动画完成
  setTimeout(next, 1200);
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initTextScramble);
