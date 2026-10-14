(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------------- header scroll state + scroll progress ---------------- */
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('scrollProgressBar');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 20);
    backToTop.classList.toggle('visible', y > 500);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- scrollspy ---------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks)
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === id));
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );
  sections.forEach((s) => spyObserver.observe(s));

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('in-view'), (i % 6) * 70);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- typing effect ---------------- */
  const typeTarget = document.getElementById('typeTarget');
  const roles = ['Software Engineer.', 'System Architect.', 'AI/ML Engineer.', 'RAG & LLM Builder.'];

  if (typeTarget) {
    if (reduceMotion) {
      typeTarget.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const current = roles[roleIndex];
        if (!deleting) {
          charIndex++;
          typeTarget.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, 1400);
            return;
          }
        } else {
          charIndex--;
          typeTarget.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
          }
        }
        setTimeout(tick, deleting ? 40 : 75);
      };
      tick();
    }
  }

  /* ---------------- tabs ---------------- */
  document.querySelectorAll('.tabs').forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    const panels = tabGroup.querySelectorAll('.tabs__panel');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        panels.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        tabGroup.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      });
    });
  });

  /* ---------------- animated counters ---------------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (reduceMotion) entry.target.textContent = entry.target.dataset.count;
          else animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------------- timeline fill ---------------- */
  const timelineFill = document.getElementById('timelineFill');
  const timelineEl = document.querySelector('.timeline');
  if (timelineFill && timelineEl) {
    const updateTimeline = () => {
      const rect = timelineEl.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height;
      const visible = Math.min(Math.max(viewportH * 0.75 - rect.top, 0), total);
      const pct = total > 0 ? (visible / total) * 100 : 0;
      timelineFill.style.height = pct + '%';
    };
    window.addEventListener('scroll', updateTimeline, { passive: true });
    window.addEventListener('resize', updateTimeline);
    updateTimeline();
  }

  /* ---------------- tilt effect on project cards ---------------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach((card) => {
      let frame;
      card.addEventListener('mousemove', (e) => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ---------------- custom cursor ---------------- */
  if (!isTouch && !reduceMotion) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let activated = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!activated) { activated = true; document.body.classList.add('has-cursor'); }
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll('a, button, .tilt, .chip, .tab-btn').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  }

  /* ---------------- hero particle network canvas ---------------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let particles = [];
    let w, h, dpr;
    const mouse = { x: null, y: null };

    const PARTICLE_COUNT_BASE = 70;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(PARTICLE_COUNT_BASE * Math.min(w / 1400, 1.3));
      particles = Array.from({ length: Math.max(count, 30) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const LINK_DIST = 140;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const force = (130 - dist) / 130;
            p.x += (dx / dist) * force * 1.2;
            p.y += (dy / dist) * force * 1.2;
          }
        }
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.14 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    resize();
    draw();
  }

  /* ---------------- footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
