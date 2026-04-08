/**
 * Main.js - 页面交互逻辑
 * - 导航栏滚动效果
 * - 移动端菜单
 * - GSAP 滚动动画
 * - 平滑锚点滚动
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initSmoothScroll();
});

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // 滚动时导航栏背景模糊
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });

  // 移动端菜单开关
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // 点击链接后关闭菜单
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // 更新当前激活的导航链接
  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive: true });
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollY = window.scrollY + 200;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* ============================================
   GSAP Scroll Animations
   ============================================ */
function initScrollAnimations() {
  // 确保 GSAP 和 ScrollTrigger 已加载
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---- 文字逐行显现动画 ----
  const revealTexts = document.querySelectorAll('.reveal-text');

  revealTexts.forEach(el => {
    // 使用 SplitType 拆分文字（如果可用）
    if (typeof SplitType !== 'undefined') {
      const split = new SplitType(el, {
        types: 'lines,words',
        lineClass: 'line',
        wordClass: 'word'
      });

      // 为每个行添加 overflow hidden 容器
      split.lines.forEach(line => {
        const wrapper = document.createElement('div');
        wrapper.style.overflow = 'hidden';
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });

      gsap.fromTo(
        split.words,
        {
          y: '100%',
          opacity: 0
        },
        {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          ease: 'circ.out',
          stagger: 0.03,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    } else {
      // 降级动画：整块淡入上移
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'circ.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  });

  // ---- Section Label 动画 ----
  gsap.utils.toArray('.section-label').forEach(label => {
    gsap.fromTo(
      label,
      { x: -20, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: label,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // ---- 作品卡片入场动画 ----
  // Projects header
  gsap.fromTo(
    '.projects-header',
    { y: 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.projects-header',
        start: 'top 90%',
        toggleActions: 'play none none reverse'
      }
    }
  );

  // Project cards
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.fromTo(
      card,
      {
        y: 60,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // ---- About 详情动画 ----
  gsap.utils.toArray('.about-detail-group').forEach((group, i) => {
    gsap.fromTo(
      group,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: i * 0.15,
        scrollTrigger: {
          trigger: group,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // ---- Footer 动画 ----
  gsap.fromTo(
    '.footer-heading',
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'circ.out',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
}

/* ============================================
   Smooth Scroll
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}
