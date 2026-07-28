/* Shared across every page: preloader, header/nav wiring, ember background, toast, jar illustration. */

/* ---------- Sitewide ambient atmosphere (persists on every page, not just the hero) ---------- */
(function siteAurora() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="site-aurora" aria-hidden="true">
      <div class="site-blob site-blob-a"></div>
      <div class="site-blob site-blob-b"></div>
      <div class="site-blob site-blob-c"></div>
    </div>`
  );
})();

/* ---------- Custom reactive cursor ---------- */
(function customCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);

  let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
  document.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.classList.add('visible');
  });
  document.addEventListener('mouseleave', () => dot.classList.remove('visible'));

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .product-card, input, select, .filter-chip')) {
      dot.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .product-card, input, select, .filter-chip')) {
      dot.classList.remove('hovering');
    }
  });

  function loop() {
    cx += (x - cx) * 0.18;
    cy += (y - cy) * 0.18;
    dot.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------- Scroll reveal: sections and cards animate in as they enter view ---------- */
(function scrollReveal() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -10% 0px' }
  );

  function markAndObserve(root) {
    root.querySelectorAll('.page-section:not(.reveal), .bundle-card:not(.reveal)').forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  markAndObserve(document);

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('.bundle-card')) {
          node.classList.add('reveal');
          revealObserver.observe(node);
        } else if (node.querySelectorAll) {
          markAndObserve(node);
        }
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();

/* ---------- Product card 3D tilt on hover ---------- */
(function cardTilt() {
  function wireTilt(card) {
    if (card.dataset.tiltWired) return;
    card.dataset.tiltWired = 'true';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', (-py * 10).toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', (px * 10).toFixed(2) + 'deg');
      card.style.setProperty('--glow-x', `${px * 100 + 50}%`);
      card.style.setProperty('--glow-y', `${py * 100 + 50}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }

  function wireAll(root) {
    root.querySelectorAll('.product-card, .bundle-card').forEach(wireTilt);
  }

  wireAll(document);

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches && (node.matches('.product-card') || node.matches('.bundle-card'))) {
          wireTilt(node);
        } else if (node.querySelectorAll) {
          wireAll(node);
        }
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();

function renderJar(color, opts = {}) {
  const flameSize = opts.flameSize || 20;
  const delay = opts.delay || 0;
  return `
    <div class="jar" style="--wax:${color};--jar-delay:${delay}ms">
      <div class="jar-glow"></div>
      <div class="jar-lid"></div>
      <div class="jar-glass">
        <div class="jar-wax"></div>
      </div>
      <div class="jar-wick"></div>
      <div class="flame" style="--size:${flameSize}px"><span class="flame-core"></span></div>
    </div>
  `;
}

/* ---------- Candle build-in animation ---------- */
/* Every .jar starts "unbuilt" (CSS) and smoothly fills/lights up once it
   scrolls into view. A MutationObserver catches jars injected later by
   page scripts (product grids, cart, etc.) so no page needs to call this. */
(function candleBuild() {
  const jarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('built');
          jarObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
  );

  function observeNewJars(root) {
    root.querySelectorAll('.jar:not(.built)').forEach((jar) => {
      if (jar.dataset.observed) return;
      jar.dataset.observed = 'true';
      jarObserver.observe(jar);
    });
  }

  observeNewJars(document);

  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('.jar')) {
          if (!node.dataset.observed) {
            node.dataset.observed = 'true';
            jarObserver.observe(node);
          }
        } else if (node.querySelectorAll) {
          observeNewJars(node);
        }
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();

/* ---------- Preloader ---------- */
(function preloader() {
  const el = document.getElementById('preloader');
  if (!el) return;
  window.addEventListener('load', () => {
    setTimeout(() => el.classList.add('done'), 400);
  });
  setTimeout(() => el.classList.add('done'), 1800);
})();

/* ---------- Footer year ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* ---------- Mobile nav ---------- */
(function mobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
})();

/* ---------- Active nav link ---------- */
(function activeNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, #mobile-nav a').forEach((a) => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();

/* ---------- Cart badge on load ---------- */
if (typeof updateCartBadge === 'function') updateCartBadge();

/* ---------- Toast ---------- */
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ---------- Ambient ember particles ---------- */
(function embers() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  const colors = ['255,138,61', '255,207,107', '255,107,107'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = Math.min(70, Math.floor((width * height) / 22000));
    particles = Array.from({ length: count }, () => spawn(Math.random() * height));
  }

  function spawn(y) {
    return {
      x: Math.random() * width,
      y: y ?? height + 20,
      r: Math.random() * 2 + 0.6,
      speed: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift;
      p.flicker += 0.05;
      if (p.y < -20) Object.assign(p, spawn(height + 20));
      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${a})`;
      ctx.fill();
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();
