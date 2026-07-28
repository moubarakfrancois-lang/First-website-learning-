/* Shared across every page: preloader, header/nav wiring, ember background, toast, jar illustration. */

function renderJar(color, opts = {}) {
  const flameSize = opts.flameSize || 20;
  return `
    <div class="jar" style="--wax:${color}">
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
