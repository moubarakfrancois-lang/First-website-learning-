/* Home page rendering */

/* ---------- Hero smoke: colored particle plume rising from the flame ---------- */
const heroSmoke = (function () {
  const canvas = document.getElementById('hero-smoke');
  const heroSection = document.querySelector('.hero');
  if (!canvas || !heroSection) return { setColor() {} };

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  let smokeColor = '255,138,61';

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
    const flameEl = document.querySelector('#hero-jar .flame');
    const heroRect = heroSection.getBoundingClientRect();
    if (!flameEl) return { x: width / 2, y: height * 0.3 };
    const fr = flameEl.getBoundingClientRect();
    return { x: fr.left + fr.width / 2 - heroRect.left, y: fr.top - heroRect.top };
  }

  function spawn() {
    const p = sourcePoint();
    return {
      x: p.x + (Math.random() - 0.5) * 16,
      y: p.y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.5 + 0.35),
      wobble: Math.random() * Math.PI * 2,
      r: Math.random() * 16 + 10,
      life: 0,
      maxLife: Math.random() * 100 + 110,
      color: smokeColor,
    };
  }

  function step() {
    if (particles.length < 80) {
      particles.push(spawn());
      particles.push(spawn());
    }
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.life++;
      p.wobble += 0.05;
      p.x += p.vx + Math.sin(p.wobble) * 0.35;
      p.y += p.vy;
      p.vy *= 0.997;
      const t = p.life / p.maxLife;
      const alpha = t < 0.12 ? t / 0.12 : Math.max(0, 1 - (t - 0.12) / 0.88);
      const radius = p.r * (0.6 + t * 1.8);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, `rgba(${p.color}, ${alpha * 0.65})`);
      grad.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    particles = particles.filter((p) => p.life < p.maxLife && p.y > -60);
    requestAnimationFrame(step);
  }

  function hexToRgbString(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);

  return {
    setColor(hex) {
      smokeColor = hexToRgbString(hex);
    },
  };
})();

/* ---------- Hero: cycling featured candle showcase ---------- */
const heroCandles = PRODUCTS.slice(0, 6);
const heroJarEl = document.getElementById('hero-jar');
const heroNameEl = document.getElementById('hero-name');
const heroTagEl = document.getElementById('hero-tag');
const heroDotsEl = document.getElementById('hero-dots');

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
  heroTagEl.style.opacity = 0;

  setTimeout(() => {
    heroJarEl.innerHTML = renderJar(c.color, { flameSize: 30 });
    heroNameEl.textContent = c.name;
    heroNameEl.dataset.text = c.name;
    heroTagEl.textContent = `${c.category} · ${c.notes}`;
    heroTagEl.style.opacity = 1;
    heroSmoke.setColor(c.color);
  }, 150);

  setTimeout(() => heroNameEl.classList.remove('glitching'), 500);

  [...heroDotsEl.children].forEach((d, i) => d.classList.toggle('active', i === heroIndex));

  if (userTriggered) {
    clearInterval(heroTimer);
    startHeroTimer();
  }
}

function startHeroTimer() {
  heroTimer = setInterval(() => {
    showHeroCandle((heroIndex + 1) % heroCandles.length);
  }, 4200);
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
