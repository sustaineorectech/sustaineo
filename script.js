/* ============================================================
   SUSTAINEO - Deep-Tech Landing Page
   script.js - Interactions, Animations & Particle System
   ============================================================ */

'use strict';

const SECTION_ROUTES = {
  '/': 'hero',
  '/home': 'hero',
  '/theproblem': 'problem',
  '/technology': 'technology',
  '/metrics': 'metrics',
  '/materials': 'materials',
  '/feedstockstreams': 'streams',
  '/whysustaineo': 'why',
  '/industries': 'industries',
  '/r&d': 'innovation',
  '/r%26d': 'innovation',
  '/impact': 'impact',
  '/partnerwithus': 'contact'
};

const ROUTES_BY_SECTION = Object.entries(SECTION_ROUTES).reduce((routes, [path, id]) => {
  if (!routes[id]) routes[id] = path;
  return routes;
}, {});

function getBasePath() {
  var base = document.querySelector('base');
  return base ? base.getAttribute('href').replace(/\/+$/, '') || '/' : '/';
}

function fullPath(route) {
  var base = getBasePath();
  return base === '/' ? route : base + route;
}

function stripBase(path) {
  var base = getBasePath();
  if (base !== '/' && path.startsWith(base)) {
    path = path.substring(base.length) || '/';
  }
  return path;
}

function getRoutePath(url) {
  try {
    var path = new URL(url, window.location.origin).pathname;
    return stripBase(path);
  } catch {
    return '';
  }
}

function scrollToSection(sectionId, updateUrl) {
  const target = document.getElementById(sectionId);
  if (!target) return false;

  const offset = sectionId === 'hero' ? 0 : 80;
  const currentScroll = window.__ss ? window.__ss.current : window.scrollY;
  const top = target.getBoundingClientRect().top + currentScroll - offset;

  if (window.__ss) {
    window.__ss.scrollTo(Math.max(top, 0));
  } else {
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }

  if (updateUrl) {
    var route = ROUTES_BY_SECTION[sectionId] || '/home';
    window.history.replaceState({ sectionId }, '', fullPath(route));
  }

  return true;
}

/* ============================================================
    SMOOTH SCROLL ENGINE - GPU-accelerated scrollTop based
   ============================================================ */
(function initSmoothScrollEngine() {
  if (prefersReducedMotion()) return;

  var wrapper = document.getElementById('smooth-wrapper');
  if (!wrapper) return;

  document.documentElement.classList.add('smooth');

  var ss = {
    target: 0,
    current: 0,
    velocity: 0,
    maxScroll: 0,
    isAnimating: false,
    scrollTo: function(pos) {
      ss.target = Math.max(0, Math.min(pos || 0, ss.maxScroll));
      if (!ss.isAnimating) { ss.isAnimating = true; requestAnimationFrame(tick); }
    }
  };
  window.__ss = ss;

  function updateMaxScroll() {
    ss.maxScroll = Math.max(0, wrapper.scrollHeight - window.innerHeight);
    ss.target = Math.min(ss.target, ss.maxScroll);
  }

  function tick() {
    var diff = ss.target - ss.current;
    ss.velocity += diff * 0.08;
    ss.velocity *= 0.82;

    if (Math.abs(diff) < 0.3 && Math.abs(ss.velocity) < 0.1) {
      ss.current = ss.target;
      ss.velocity = 0;
      apply();
      ss.isAnimating = false;
      return;
    }

    ss.current += ss.velocity;
    if (ss.current < 0) { ss.current = 0; ss.velocity = 0; }
    if (ss.current > ss.maxScroll) { ss.current = ss.maxScroll; ss.velocity = 0; }
    apply();
    requestAnimationFrame(tick);
  }

  function apply() {
    wrapper.scrollTop = Math.round(ss.current);
    window.dispatchEvent(new CustomEvent('smoothscroll', {
      detail: { scrollY: ss.current, maxScroll: ss.maxScroll }
    }));
  }

  function start() { if (!ss.isAnimating) { ss.isAnimating = true; requestAnimationFrame(tick); } }

  // --- Input interception ---

  window.addEventListener('wheel', function(e) {
    e.preventDefault();
    ss.target = Math.max(0, Math.min(ss.target + e.deltaY, ss.maxScroll));
    start();
  }, { passive: false });

  var touchStartY = 0, touchStartScroll = 0;
  window.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].clientY;
    touchStartScroll = ss.current;
  }, { passive: true });

  window.addEventListener('touchmove', function(e) {
    var deltaY = touchStartY - e.changedTouches[0].clientY;
    ss.target = Math.max(0, Math.min(touchStartScroll + deltaY, ss.maxScroll));
    ss.current = ss.target;
    wrapper.scrollTop = Math.round(ss.current);
    if (!ss.isAnimating) start();
  }, { passive: true });

  window.addEventListener('touchend', function(e) {
    var deltaY = touchStartY - e.changedTouches[0].clientY;
    var mom = deltaY * 0.2;
    if (Math.abs(mom) > 10) { ss.velocity = mom; start(); }
  }, { passive: true });

  window.addEventListener('keydown', function(e) {
    var t = (e.target || {}).tagName || '';
    if (t.match(/^(INPUT|TEXTAREA|SELECT|BUTTON)$/)) return;
    var step = 0;
    if (e.key === 'ArrowDown') { step = 120; e.preventDefault(); }
    else if (e.key === 'ArrowUp') { step = -120; e.preventDefault(); }
    else if (e.key === 'PageDown') { step = window.innerHeight * 0.9; e.preventDefault(); }
    else if (e.key === 'PageUp') { step = -window.innerHeight * 0.9; e.preventDefault(); }
    else if (e.key === 'Home') { ss.target = 0; e.preventDefault(); start(); return; }
    else if (e.key === 'End') { ss.target = ss.maxScroll; e.preventDefault(); start(); return; }
    else if (e.key === ' ' && !e.target.matches('input, textarea, [contenteditable]')) {
      step = window.innerHeight * 0.8; e.preventDefault();
    }
    if (step) { ss.target = Math.max(0, Math.min(ss.target + step, ss.maxScroll)); if (!ss.isAnimating) start(); }
  });

  // --- Init ---
  updateMaxScroll();
  window.addEventListener('resize', updateMaxScroll);

  ss.target = Math.min(window.scrollY || 0, ss.maxScroll);
  ss.current = ss.target;
  wrapper.scrollTop = Math.round(ss.current);

  // Handle initial route from URL hash / 404 redirect
  var params = new URLSearchParams(window.location.search);
  var redirectedRoute = params.get('route');
  var currentPath = stripBase(redirectedRoute || window.location.pathname);
  var initialSection = SECTION_ROUTES[currentPath];

  if (initialSection && currentPath !== '/') {
    if (redirectedRoute) window.history.replaceState({ sectionId: initialSection }, '', fullPath(currentPath));
    setTimeout(function() {
      var el = document.getElementById(initialSection);
      if (el) {
        var off = initialSection === 'hero' ? 0 : 80;
        ss.target = Math.max(0, Math.min(el.getBoundingClientRect().top + ss.current - off, ss.maxScroll));
        start();
      }
    }, 150);
  }
}());

/* ============================================================
   1. NAV - Scroll state + hamburger
   ============================================================ */
(function initNav() {
  const nav         = document.getElementById('mainNav');
  const hamburger   = document.getElementById('hamburgerBtn');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  // Scroll class - listens to native and smooth scroll
  var ticking = false;
  function applyNavScroll() {
    var y = window.__ss ? window.__ss.current : window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(applyNavScroll);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('smoothscroll', onScroll);
  onScroll();

  // Open menu
  function openMenu() {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileClose.focus();
  }

  // Close menu
  function closeMenu() {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
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

  // Focus trap inside mobile menu
  mobileMenu.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var focusable = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}());

/* ============================================================
   2. HERO PARTICLE + FLOW-LINE CANVAS
   ============================================================ */
(function initParticles() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var W, H, particles = [], lines = [], animId;

  if (prefersReducedMotion()) { canvas.style.display = 'none'; return; }

  function spawn() {
    var dotCount  = Math.min(50,  Math.floor(W / 28));
    var lineCount = Math.min(14,  Math.floor(W / 100));
    var nodeCount = Math.min(10,  Math.floor(W / 140));
    particles = Array.from({ length: dotCount  }, function() { return new Particle(); });
    lines     = Array.from({ length: lineCount }, function() { return new FlowLine(); });
    var nodes = Array.from({ length: nodeCount }, function() { return new Node(); });
    canvas._nodes = nodes;
  }

  function loop() {
    if (canvas._paused) {
      animId = requestAnimationFrame(loop);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    lines.forEach(function(l) { l.update(); l.draw(); });
    (canvas._nodes || []).forEach(function(n) { n.update(); n.draw(); });
    particles.forEach(function(p) { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  // Pause when hero not visible
  var heroObserver = new IntersectionObserver(function(entries) {
    canvas._paused = !entries[0].isIntersecting;
  }, { threshold: 0 });
  heroObserver.observe(canvas);

  resize(); spawn(); loop();
  var ro = new ResizeObserver(function() { cancelAnimationFrame(animId); resize(); spawn(); loop(); });
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
  var tabs = document.querySelectorAll('.stream-tab');
  if (!tabs.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var targetId = tab.getAttribute('aria-controls');
      if (!targetId) return;

      tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.stream-content').forEach(function(c) { c.classList.remove('active'); });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var target = document.getElementById(targetId);
      if (target) target.classList.add('active');

      var reveals = (target || document).querySelectorAll('.reveal:not(.visible)');
      reveals.forEach(function(el, idx) {
        setTimeout(function() { el.classList.add('visible'); }, idx * 80);
      });
    });
  });
}());

/* ============================================================
    6. ROUTE NAVIGATION (anchor clicks + popstate)
    ============================================================ */
(function initRouteNav() {
  document.querySelectorAll('a[href]').forEach(function(anchor) {
    var href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('javascript')) return;

    anchor.addEventListener('click', function(e) {
      const sectionId = href.startsWith('#')
        ? href.slice(1)
        : SECTION_ROUTES[getRoutePath(href)];

      if (sectionId) {
        e.preventDefault();
        scrollToSection(sectionId, !href.startsWith('#'));
      }
    });
  });

  window.addEventListener('popstate', () => {
    const sectionId = SECTION_ROUTES[stripBase(window.location.pathname)] || 'hero';
    scrollToSection(sectionId, false);
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
  const navLinks = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const match = getRoutePath(link.getAttribute('href')) === ROUTES_BY_SECTION[id];
          link.style.color = match ? 'var(--emerald-d)' : '';
          link.setAttribute('aria-current', match ? 'page' : 'false');
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
   17. PAGE LOAD FADE-IN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
});

/* ============================================================
   18. TECH SVG SCHEMATIC - Container Parallax
   ============================================================ */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

(function initTechSVG() {
  if (prefersReducedMotion()) return;
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
  if (prefersReducedMotion()) return;
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

/* ============================================================
   20. EMAIL & ADDRESS OBFUSCATION (bot protection)
   ============================================================ */
(function decodeProtectedInfo() {
  var key = 0x5A;
  var emailHex = [0x29,0x2F,0x29,0x2E,0x3B,0x33,0x34,0x3F,0x35,0x28,0x3F,0x39,0x2E,0x3F,0x39,0x32,0x1A,0x3D,0x37,0x3B,0x33,0x36,0x74,0x39,0x35,0x37];
  var addressHex = [0x09,0x0F,0x09,0x0E,0x1B,0x13,0x14,0x1F,0x15,0x7A,0x08,0x1F,0x19,0x03,0x19,0x16,0x13,0x14,0x1D,0x7A,0x0E,0x1F,0x19,0x12,0x14,0x15,0x16,0x15,0x1D,0x13,0x1F,0x09,0x7A,0x0A,0x08,0x13,0x0C,0x1B,0x0E,0x1F,0x7A,0x16,0x13,0x17,0x13,0x0E,0x1F,0x1E,0x66,0x38,0x28,0x64,0x12,0x74,0x34,0x35,0x7A,0x6B,0x68,0x77,0x68,0x77,0x6B,0x6C,0x6A,0x7A,0x0A,0x74,0x34,0x35,0x7A,0x6B,0x6D,0x7A,0x69,0x76,0x7A,0x17,0x3B,0x36,0x36,0x33,0x31,0x3B,0x28,0x30,0x2F,0x34,0x3B,0x7A,0x14,0x3B,0x3D,0x3B,0x28,0x76,0x7A,0x1D,0x29,0x33,0x72,0x09,0x28,0x73,0x7A,0x18,0x3B,0x34,0x3E,0x36,0x3B,0x3D,0x2F,0x3E,0x3B,0x76,0x66,0x38,0x28,0x64,0x12,0x3B,0x23,0x3B,0x2E,0x32,0x34,0x3B,0x3D,0x3B,0x28,0x76,0x7A,0x12,0x23,0x3E,0x3F,0x28,0x3B,0x38,0x3B,0x3E,0x77,0x7A,0x6F,0x6A,0x6A,0x6A,0x6C,0x62,0x76,0x7A,0x0E,0x3F,0x36,0x3B,0x34,0x3D,0x3B,0x34,0x3B];
  function decode(hex) {
    var chars = [];
    for (var i = 0; i < hex.length; i++) {
      chars.push(String.fromCharCode(hex[i] ^ key));
    }
    return chars.join('');
  }
  var email = decode(emailHex);
  var addressHTML = decode(addressHex);

  var links = document.querySelectorAll('[data-email-target]');
  for (var i = 0; i < links.length; i++) {
    var el = links[i];
    var subject = el.getAttribute('data-subject') || '';
    el.href = 'mailto:' + email + (subject ? '?subject=' + encodeURIComponent(subject) : '');
    if (el.getAttribute('data-show-email') === 'true') {
      el.textContent = email;
    }
  }

  var addrEls = document.querySelectorAll('[data-address-target]');
  for (var i = 0; i < addrEls.length; i++) {
    addrEls[i].innerHTML = addressHTML;
  }
}());
