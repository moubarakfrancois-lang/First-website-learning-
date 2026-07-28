/* Home page rendering */
import { createCandleScene } from './candle3d.js';

/* ---------- Hero smoke: colored particle atmosphere + plume rising from the flame ---------- */
const heroSmoke = (function () {
  const canvas = document.getElementById('hero-smoke');
  const heroSection = document.querySelector('.hero');
  if (!canvas || !heroSection) return { setColor() {} };

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  let smokeColor = '255,138,61';
  let secondaryColor = '91,227,255';
  const mouse = { x: null, y: null };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = heroSection.clientWidth;
    height = heroSection.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function sourcePoint() {
    const jarEl = document.getElementById('hero-jar');
    const heroRect = heroSection.getBoundingClientRect();
    if (!jarEl) return { x: width / 2, y: height * 0.3 };
    const jr = jarEl.getBoundingClientRect();
    return { x: jr.left + jr.width / 2 - heroRect.left, y: jr.top - heroRect.top + jr.height * 0.18 };
  }

  function spawnPlume() {
    const p = sourcePoint();
    return {
      type: 'plume',
      x: p.x + (Math.random() - 0.5) * 20,
      y: p.y,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.7 + 0.5),
      wobble: Math.random() * Math.PI * 2,
      r: Math.random() * 22 + 14,
      life: 0,
      maxLife: Math.random() * 110 + 120,
      color: smokeColor,
    };
  }

  function spawnAmbient() {
    const useSecondary = Math.random() < 0.4;
    return {
      type: 'ambient',
      x: Math.random() * width,
      y: height + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.25 + 0.12),
      wobble: Math.random() * Math.PI * 2,
      r: Math.random() * 50 + 40,
      life: 0,
      maxLife: Math.random() * 260 + 260,
      color: useSecondary ? secondaryColor : smokeColor,
    };
  }

  function step() {
    const plumeCount = particles.filter((p) => p.type === 'plume').length;
    const ambientCount = particles.filter((p) => p.type === 'ambient').length;
    if (plumeCount < 90) {
      particles.push(spawnPlume());
      particles.push(spawnPlume());
    }
    if (ambientCount < 22) particles.push(spawnAmbient());

    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.life++;
      p.wobble += 0.045;
      let vx = p.vx + Math.sin(p.wobble) * (p.type === 'plume' ? 0.4 : 0.12);
      let vy = p.vy;
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const radius = p.type === 'plume' ? 160 : 220;
        if (dist < radius && dist > 0.001) {
          const force = ((radius - dist) / radius) * (p.type === 'plume' ? 1.4 : 0.6);
          vx += (dx / dist) * force;
          vy += (dy / dist) * force * 0.6;
        }
      }
      p.x += vx;
      p.y += vy;
      p.vy *= 0.998;
      const t = p.life / p.maxLife;
      const fadeIn = p.type === 'plume' ? 0.12 : 0.2;
      const alpha = t < fadeIn ? t / fadeIn : Math.max(0, 1 - (t - fadeIn) / (1 - fadeIn));
      const growth = p.type === 'plume' ? 1.8 : 1.3;
      const radius = p.r * (0.6 + t * growth);
      const peak = p.type === 'plume' ? 0.65 : 0.22;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, `rgba(${p.color}, ${alpha * peak})`);
      grad.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    particles = particles.filter((p) => p.life < p.maxLife && p.y > -80);
    requestAnimationFrame(step);
  }

  function hexToRgbString(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  heroSection.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);

  return {
    setColor(hex, secondaryHex) {
      smokeColor = hexToRgbString(hex);
      if (secondaryHex) secondaryColor = hexToRgbString(secondaryHex);
    },
  };
})();

/* ---------- Hero: real WebGL 3D candle (glass jar, animated flame, mouse parallax) ---------- */
const heroCandleScene = createCandleScene(document.getElementById('hero-jar'), {
  waxColor: PRODUCTS[0].color,
  interactive: true,
  autoSpin: true,
});

/* ---------- Hero: cycling featured candle showcase ---------- */
const heroCandles = PRODUCTS.slice(0, 6);
const heroSectionEl = document.querySelector('.hero');
const heroStageEl = document.querySelector('.hero-stage');
const heroNameEl = document.getElementById('hero-name');
const heroTagEl = document.getElementById('hero-tag');
const heroDotsEl = document.getElementById('hero-dots');
const heroFlashEl = document.getElementById('hero-flash');
const heroAccents = ['#5be3ff', '#ff5fb8', '#8b7fc7', '#4fffb0', '#ffd76c', '#ff6c6c'];

heroCandles.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => showHeroCandle(i, true));
  heroDotsEl.appendChild(dot);
});

let heroIndex = 0;
let heroTimer;

function showHeroCandle(index, userTriggered) {
  heroIndex = index;
  const c = heroCandles[heroIndex];

  heroNameEl.classList.add('glitching');
  heroStageEl.classList.add('glitching');
  heroTagEl.style.opacity = 0;
  heroFlashEl.classList.remove('pulse');
  void heroFlashEl.offsetWidth;
  heroFlashEl.classList.add('pulse');

  setTimeout(() => {
    heroCandleScene.setColor(c.color);
    heroNameEl.textContent = c.name;
    heroNameEl.dataset.text = c.name;
    heroTagEl.textContent = `${c.category} · ${c.notes}`;
    heroTagEl.style.opacity = 1;
    heroSectionEl.style.setProperty('--hero-color', c.color);
    heroSmoke.setColor(c.color, heroAccents[heroIndex % heroAccents.length]);

    const burnEl = document.querySelector('#float-burn strong');
    if (burnEl) burnEl.textContent = c.burnTime;
    document.querySelectorAll('.float-card').forEach((card) => {
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = '';
    });
  }, 180);

  setTimeout(() => {
    heroNameEl.classList.remove('glitching');
    heroStageEl.classList.remove('glitching');
  }, 700);

  [...heroDotsEl.children].forEach((d, i) => d.classList.toggle('active', i === heroIndex));

  if (userTriggered) {
    clearInterval(heroTimer);
    startHeroTimer();
  }
}

function startHeroTimer() {
  heroTimer = setInterval(() => {
    showHeroCandle((heroIndex + 1) % heroCandles.length);
  }, 4400);
}

showHeroCandle(0);
startHeroTimer();

/* Marquee of scent names */
const marqueeNames = PRODUCTS.map((p) => p.name);
const marqueeHtml = marqueeNames.map((n) => `<span>${n} <span class="dot">&#10022;</span></span>`).join('');
document.getElementById('marquee-track').innerHTML = marqueeHtml + marqueeHtml;

/* Featured grid with category filter */
const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
const filterBar = document.getElementById('home-filter-bar');
const grid = document.getElementById('featured-grid');

function productCardHtml(p, i) {
  return `
    <article class="product-card" data-id="${p.id}">
      ${renderJar(p.color, { delay: (i % 4) * 90 })}
      <p class="card-cat">${p.category}</p>
      <h3 class="card-name">${p.name}</h3>
      <p class="card-notes">${p.notes}</p>
      <div class="card-footer">
        <span class="card-price">${money(p.price)}</span>
        <button class="card-add" data-add="${p.id}">Add</button>
      </div>
    </article>
  `;
}

function renderGrid(category) {
  const list = category === 'All' ? PRODUCTS.slice(0, 8) : PRODUCTS.filter((p) => p.category === category);
  grid.innerHTML = list.map(productCardHtml).join('');
  wireCardEvents(grid);
}

filterBar.innerHTML = categories
  .map((c, i) => `<button class="filter-chip${i === 0 ? ' active' : ''}" data-cat="${c}">${c}</button>`)
  .join('');
filterBar.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  filterBar.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  renderGrid(chip.dataset.cat);
});
renderGrid('All');

function wireCardEvents(scope) {
  scope.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const product = getProduct(btn.dataset.add);
      addToCart(product.id, product.sizes[0].label, 1);
      btn.textContent = 'Added';
      btn.classList.add('added');
      showToast(`${product.name} added to cart`);
      setTimeout(() => {
        btn.textContent = 'Add';
        btn.classList.remove('added');
      }, 1400);
    });
  });
  scope.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', () => {
      location.href = `product.html?id=${card.dataset.id}`;
    });
  });
}

/* Bundle grid */
const bundleGrid = document.getElementById('bundle-grid');
bundleGrid.innerHTML = BUNDLES.map((b) => {
  const jars = (b.productIds || PRODUCTS.slice(0, 3).map((p) => p.id))
    .map((id, i) => renderJar(getProduct(id).color, { flameSize: 14, delay: i * 120 }))
    .join('');
  const original = bundleOriginalPrice(b);
  return `
    <div class="bundle-card">
      <div class="bundle-jars">${jars}</div>
      <h3 class="bundle-name">${b.name}</h3>
      <p class="bundle-desc">${b.desc}</p>
      <div class="bundle-price-row">
        <span class="bundle-price">${money(b.price)}</span>
        ${original ? `<span class="bundle-was">${money(original)}</span>` : ''}
      </div>
      <p class="bundle-save">${original ? `Save ${money(original - b.price)}` : 'Custom picks'}</p>
      <a href="shop.html${b.custom ? '' : '#bundle-' + b.id}" class="btn btn-ghost btn-block">${b.custom ? 'Choose Your Three' : 'Shop This Bundle'}</a>
    </div>
  `;
}).join('');
