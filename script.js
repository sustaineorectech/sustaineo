/* ============================================================
   SUSTAINEO - Deep-Tech Landing Page
   script.js - Interactions, Animations & Particle System
   ============================================================ */

'use strict';

/* ============================================================
   1. NAV - Scroll state + hamburger
   ============================================================ */
(function initNav() {
  const nav         = document.getElementById('mainNav');
  const hamburger   = document.getElementById('hamburgerBtn');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  // Scroll class
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Open menu
  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  // Close menu
  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ESC key closes menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}());

/* ============================================================
   2. HERO PARTICLE + FLOW-LINE CANVAS
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], lines = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  /* ---- Floating dot particles ---- */
  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x    = (W * 0.35) + Math.random() * (W * 0.65);
      this.y    = initial ? Math.random() * H : H + 10;
      this.vx   = (Math.random() - 0.5) * 0.5;
      this.vy   = -(0.25 + Math.random() * 0.55);
      this.r    = 1.5 + Math.random() * 2;
      this.life = initial ? Math.random() * 300 : 0;
      this.maxL = 250 + Math.random() * 200;
      const pick = Math.random();
      // Natural malachite / verdigris / copper palette
      this.rgb  = pick > 0.6  ? '61,123,88'    /* malachite    */
                : pick > 0.3  ? '42,94,66'     /* deep malachite */
                :                '46,112,112';  /* verdigris    */
    }
    get alpha() {
      const t = this.life / this.maxL;
      return t < 0.1 ? t / 0.1 : t > 0.8 ? (1 - t) / 0.2 : 1;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life >= this.maxL) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.rgb},${this.alpha * 0.45})`;
      ctx.fill();
    }
  }

  /* ---- Animated horizontal flow-lines (mimics process arrows) ---- */
  class FlowLine {
    constructor() { this.reset(); }
    reset() {
      this.y     = (H * 0.15) + Math.random() * (H * 0.70);
      this.x     = (W * 0.40) + Math.random() * (W * 0.25);
      this.len   = 40 + Math.random() * 90;
      this.speed = 0.4 + Math.random() * 0.7;
      this.prog  = 0;
      this.life  = 0;
      this.maxL  = Math.round(this.len / this.speed) + 60;
      this.rgb   = Math.random() > 0.5 ? '61,123,88' : '46,112,112';  /* malachite / verdigris */
      this.w     = 1 + Math.random() * 1.2;
    }
    get alpha() {
      const t = this.life / this.maxL;
      return t < 0.15 ? t / 0.15 : t > 0.75 ? (1 - t) / 0.25 : 1;
    }
    update() { this.prog += this.speed; this.life++; if (this.life >= this.maxL) this.reset(); }
    draw() {
      const tail  = Math.max(0, this.prog - this.len);
      const head  = this.prog;
      const alpha = this.alpha * 0.5;
      const grad  = ctx.createLinearGradient(this.x + tail, this.y, this.x + head, this.y);
      grad.addColorStop(0, `rgba(${this.rgb},0)`);
      grad.addColorStop(1, `rgba(${this.rgb},${alpha})`);
      ctx.beginPath();
      ctx.moveTo(this.x + tail, this.y);
      ctx.lineTo(this.x + head, this.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = this.w;
      ctx.stroke();
      // Arrowhead
      if (this.prog > 12) {
        const tip = this.x + head;
        ctx.beginPath();
        ctx.moveTo(tip, this.y);
        ctx.lineTo(tip - 6, this.y - 3);
        ctx.lineTo(tip - 6, this.y + 3);
        ctx.fillStyle = `rgba(${this.rgb},${alpha * 0.9})`;
        ctx.fill();
      }
    }
  }

  /* ---- Pulsing node circles ---- */
  class Node {
    constructor() { this.reset(); }
    reset() {
      this.x     = (W * 0.38) + Math.random() * (W * 0.55);
      this.y     = (H * 0.12) + Math.random() * (H * 0.76);
      this.r     = 3 + Math.random() * 4;
      this.pulse = 0;
      this.speed = 0.018 + Math.random() * 0.012;
      this.life  = Math.random() * Math.PI * 2;
      this.rgb   = Math.random() > 0.5 ? '61,123,88' : '150,80,40';  /* malachite / copper */
    }
    update() { this.life += this.speed; }
    draw() {
      const scale = 1 + 0.3 * Math.sin(this.life);
      const alpha = 0.12 + 0.1 * Math.sin(this.life);
      // Outer glow ring
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * scale * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.rgb},${alpha * 0.4})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
      // Core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.rgb},${alpha * 1.6})`;
      ctx.fill();
    }
  }

  function spawn() {
    const dotCount  = Math.min(50,  Math.floor(W / 28));
    const lineCount = Math.min(14,  Math.floor(W / 100));
    const nodeCount = Math.min(10,  Math.floor(W / 140));
    particles = Array.from({ length: dotCount  }, () => new Particle());
    lines     = Array.from({ length: lineCount }, () => new FlowLine());
    const nodes = Array.from({ length: nodeCount }, () => new Node());
    // Attach nodes to the global so loop can access
    canvas._nodes = nodes;
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    lines.forEach(l => { l.update(); l.draw(); });
    (canvas._nodes || []).forEach(n => { n.update(); n.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  resize(); spawn(); loop();
  const ro = new ResizeObserver(() => { cancelAnimationFrame(animId); resize(); spawn(); loop(); });
  ro.observe(canvas);
}());


/* ============================================================
   3. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}());

/* ============================================================
   4. ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 1800; // ms
    let start      = null;

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = target * easeOutExpo(progress);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Trigger when metric cards enter viewport
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target.querySelector('[data-target]') || entry.target;
        if (counter.dataset.target) animateCounter(counter);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  // Observe parent metric cards
  document.querySelectorAll('.metric-card').forEach(card => io.observe(card));
}());

/* ============================================================
   5. STREAM TABS
   ============================================================ */
(function initTabs() {
  const tabs     = document.querySelectorAll('.stream-tab');
  const contents = document.querySelectorAll('.stream-content');
  if (!tabs.length) return;

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      contents.forEach(c => c.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      contents[i].classList.add('active');

      // Re-trigger reveals inside newly visible content
      const reveals = contents[i].querySelectorAll('.reveal:not(.visible)');
      reveals.forEach((el, idx) => {
        setTimeout(() => el.classList.add('visible'), idx * 80);
      });
    });
  });
}());

/* ============================================================
   6. SMOOTH SCROLL (for older browsers)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}());

/* ============================================================
   7. MATERIAL CARD HOVER - Subtle tilt effect
   ============================================================ */
(function initTilt() {
  const cards = document.querySelectorAll('.material-card, .metric-card, .why-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -5;
      const tiltY  = dx *  5;
      card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
    });
  });
}());

/* ============================================================
   8. ACTIVE NAV SECTION HIGHLIGHT
   ============================================================ */
(function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--emerald-d)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => io.observe(s));
}());



/* ============================================================
   10. HERO HEADLINE - Character stagger reveal
   ============================================================ */
(function initHeroStagger() {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;

  // Only runs once on load - text is already in DOM, just CSS animates it
  // Add a subtle glowing shimmer to the gradient text after 2s
  setTimeout(() => {
    const gradText = headline.querySelector('em');
    if (!gradText) return;
    gradText.style.animation = 'shimmer 4s linear infinite';
    gradText.style.backgroundSize = '200% auto';
  }, 2000);
}());

/* ============================================================
   11. PROCESS FLOW - Animate lines on scroll
   ============================================================ */
(function initProcessFlow() {
  const lines = document.querySelectorAll('.process-step-line');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.background = 'linear-gradient(to bottom, var(--emerald), rgba(16,185,129,0.15))';
        entry.target.style.opacity = '1';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  lines.forEach(line => {
    line.style.opacity = '0.2';
    line.style.transition = 'opacity 0.6s ease';
    io.observe(line);
  });
}());

/* ============================================================
   12. IMPACT SECTION - Particle burst effect on stat hover
   ============================================================ */
(function initImpactHover() {
  const stats = document.querySelectorAll('.impact-stat');

  stats.forEach(stat => {
    stat.addEventListener('mouseenter', () => {
      stat.style.borderColor = 'rgba(61,123,88,0.35)';
      stat.style.boxShadow   = '0 0 28px rgba(61,123,88,0.14)';
    });
    stat.addEventListener('mouseleave', () => {
      stat.style.borderColor = '';
      stat.style.boxShadow   = '';
    });
  });
}());

/* ============================================================
   13. PROBLEM CARDS - Sequential entrance
   ============================================================ */
(function initProblemCards() {
  const cards = document.querySelectorAll('.problem-card');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 120);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(c => io.observe(c));
}());

/* ============================================================
   14. WHY CARDS - Glowing border on hover
   ============================================================ */
(function initWhyCards() {
  const cards = document.querySelectorAll('.why-card');

  const colors = [
    'rgba(61,123,88,0.35)',   /* malachite */
    'rgba(46,112,112,0.30)', /* verdigris */
    'rgba(168,120,40,0.30)', /* gold ore  */
    'rgba(150,80,40,0.28)',  /* copper    */
    'rgba(61,123,88,0.35)',
    'rgba(46,112,112,0.30)',
  ];

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px ${colors[i] || colors[0]}`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '';
    });
  });
}());

/* ============================================================
   15. R&D DOTS - Pulse on hover
   ============================================================ */
(function initRndDots() {
  const phases = document.querySelectorAll('.rnd-phase');

  phases.forEach(phase => {
    const dot = phase.querySelector('.rnd-dot');
    if (!dot) return;
    phase.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(1.2)';
      dot.style.transition = 'transform 0.3s ease';
    });
    phase.addEventListener('mouseleave', () => {
      dot.style.transform = '';
    });
  });
}());

/* ============================================================
   16. INDUSTRY CARDS - Enhanced hover state
   ============================================================ */
(function initIndustryCards() {
  const cards = document.querySelectorAll('.industry-card');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.industry-icon');
      if (icon) {
        icon.style.transform = 'scale(1.15) rotate(-5deg)';
        icon.style.transition = 'transform 0.3s ease';
        icon.style.display = 'inline-block';
      }
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.industry-icon');
      if (icon) icon.style.transform = '';
    });
  });
}());



/* ============================================================
   18. TECH SVG SCHEMATIC - Container Parallax
   ============================================================ */
(function initTechSVG() {
  const obj = document.querySelector('.tech-schematic-svg');
  const container = document.querySelector('.tech-schematic-container');
  if (!obj || !container) return;

  // --- 1. Mouse Parallax Tracking ---
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = x;
    targetY = y;
  });

  container.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
  });

  function renderParallax() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    
    obj.style.transform = `
      rotateX(${currentY * -4}deg)
      rotateY(${currentX * 4}deg)
      translateX(${currentX * -10}px)
      translateY(${currentY * -10}px)
      scale(1.02)
    `;
    requestAnimationFrame(renderParallax);
  }
  requestAnimationFrame(renderParallax);
}());

/* ============================================================
   19. CUSTOM ANIMATED CURSOR
   ============================================================ */
(function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const follower = document.getElementById('cursorFollower');
  
  if (!cursor || !follower || window.innerWidth <= 768) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    // Fast ease for inner dot
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;
    
    // Smooth trailing ease for outer ring
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;

    cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
    follower.style.transform = `translate(calc(${followerX}px - 50%), calc(${followerY}px - 50%))`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Add hover states to interactive elements
  const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .stream-tab, .contact-option, .mobile-close');
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}());
