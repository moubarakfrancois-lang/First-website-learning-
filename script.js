/* ---------- Preloader ---------- */
const preloader = document.getElementById('preloader');
const preloaderCount = document.getElementById('preloader-count');
let progress = 0;
const loadTimer = setInterval(() => {
  progress += Math.floor(Math.random() * 12) + 4;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadTimer);
    preloader.classList.add('done');
  }
  preloaderCount.textContent = progress;
}, 90);

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Mobile menu toggle ---------- */
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

/* ---------- Ask form (decorative) ---------- */
const askForm = document.getElementById('ask-form');
const askInput = document.getElementById('ask-input');
askForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!askInput.value.trim()) return;
  const original = askInput.placeholder;
  askInput.value = '';
  askInput.placeholder = "Thanks — we'll be in touch…";
  setTimeout(() => (askInput.placeholder = original), 2500);
});

/* ---------- Shared project data ---------- */
/* Replace title/tag/gradient/color with your own work — this is placeholder content. */
const projects = [
  { title: 'Aurora Drive', tag: 'Websites · WebGL', gradient: 'linear-gradient(135deg,#1c1f3d,#05050a)', color: '#7c8cff' },
  { title: 'Glass Garden', tag: 'Installations', gradient: 'linear-gradient(135deg,#2a1c3d,#05050a)', color: '#c76cff' },
  { title: 'Echo Chamber', tag: 'XR / VR / AI', gradient: 'linear-gradient(135deg,#12303a,#05050a)', color: '#5be3ff' },
  { title: 'Night Signal', tag: 'Games', gradient: 'linear-gradient(135deg,#3a1c22,#05050a)', color: '#ff5c8a' },
  { title: 'Paper Planet', tag: 'Multiplayer', gradient: 'linear-gradient(135deg,#1c3a2e,#05050a)', color: '#4fffb0' },
  { title: 'Static Bloom', tag: 'Websites · Prototype', gradient: 'linear-gradient(135deg,#3a2f1c,#05050a)', color: '#ffd76c' },
];

/* ---------- Hero showcase: auto-cycling glitch transition ---------- */
const heroEl = document.getElementById('home');
const heroTitle = document.getElementById('hero-title');
const heroTag = document.getElementById('hero-tag');
const heroDots = document.getElementById('hero-dots');

projects.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => showProject(i, true));
  heroDots.appendChild(dot);
});

let heroIndex = 0;
let heroTimer;

function showProject(index, userTriggered) {
  heroIndex = index;
  const p = projects[heroIndex];

  heroTitle.classList.add('glitching');
  heroTag.style.opacity = 0;

  setTimeout(() => {
    heroTitle.textContent = p.title;
    heroTitle.dataset.text = p.title;
    heroTag.textContent = p.tag;
    heroTag.style.opacity = 1;
    heroEl.style.setProperty('--hero-color', p.color);
  }, 150);

  setTimeout(() => heroTitle.classList.remove('glitching'), 500);

  [...heroDots.children].forEach((d, i) => d.classList.toggle('active', i === heroIndex));

  if (userTriggered) {
    clearInterval(heroTimer);
    startHeroTimer();
  }
}

function startHeroTimer() {
  heroTimer = setInterval(() => {
    showProject((heroIndex + 1) % projects.length);
  }, 3500);
}

showProject(0);
startHeroTimer();

/* ---------- Work grid content ---------- */
const grid = document.getElementById('work-grid');
projects.forEach((p) => {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.setProperty('--card-gradient', p.gradient);
  card.innerHTML = `
    <span class="card-tag">${p.tag}</span>
    <span class="card-title">${p.title}</span>
  `;
  grid.appendChild(card);
});

/* ---------- Stats count-up ---------- */
const stats = document.querySelectorAll('.stat strong');
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = Math.floor(t * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
stats.forEach((el) => statObserver.observe(el));

/* ---------- Background particle field ---------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height, dpr;
let particles = [];
const mouse = { x: null, y: null, radius: 140 };

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
  const count = Math.min(140, Math.floor((width * height) / 12000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.6 + 0.4,
  }));
}

function step() {
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    if (mouse.x !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.x += (dx / dist) * force * 1.6;
        p.y += (dy / dist) * force * 1.6;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(124, 140, 255, 0.55)';
    ctx.fill();
  }

  // connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(140, 150, 200, ${0.12 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});
window.addEventListener('resize', resize);

resize();
requestAnimationFrame(step);
