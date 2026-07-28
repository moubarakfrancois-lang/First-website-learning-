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

/* ---------- Hero cycling text ---------- */
const heroCycle = document.getElementById('hero-cycle');
const phrases = ['VOID STUDIO', 'DIGITAL CRAFT', 'WEB EXPERIENCES', 'INTERACTIVE ART'];
let phraseIndex = 0;
setInterval(() => {
  phraseIndex = (phraseIndex + 1) % phrases.length;
  heroCycle.style.opacity = 0;
  setTimeout(() => {
    heroCycle.textContent = phrases[phraseIndex];
    heroCycle.style.opacity = 1;
  }, 400);
}, 3200);
heroCycle.style.transition = 'opacity 0.4s ease';

/* ---------- Work grid content ---------- */
const projects = [
  { title: 'Pulse Racer', tag: 'Websites · WebGL', gradient: 'linear-gradient(135deg,#1c1f3d,#05050a)' },
  { title: 'Harmonic State', tag: 'Installations', gradient: 'linear-gradient(135deg,#2a1c3d,#05050a)' },
  { title: 'Deep Field', tag: 'XR / VR / AI', gradient: 'linear-gradient(135deg,#12303a,#05050a)' },
  { title: 'Nightrunner', tag: 'Games', gradient: 'linear-gradient(135deg,#3a1c22,#05050a)' },
  { title: 'Colony', tag: 'Multiplayer', gradient: 'linear-gradient(135deg,#1c3a2e,#05050a)' },
  { title: 'Signal Lab', tag: 'Websites · Prototype', gradient: 'linear-gradient(135deg,#3a2f1c,#05050a)' },
];

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
