/* Home page rendering */
document.getElementById('hero-jar').innerHTML = renderJar(PRODUCTS[0].color, { flameSize: 26 });

/* Marquee of scent names */
const marqueeNames = PRODUCTS.map((p) => p.name);
const marqueeHtml = marqueeNames.map((n) => `<span>${n} <span class="dot">&#10022;</span></span>`).join('');
document.getElementById('marquee-track').innerHTML = marqueeHtml + marqueeHtml;

/* Featured grid with category filter */
const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
const filterBar = document.getElementById('home-filter-bar');
const grid = document.getElementById('featured-grid');

function productCardHtml(p) {
  return `
    <article class="product-card" data-id="${p.id}">
      ${renderJar(p.color)}
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
    .map((id) => renderJar(getProduct(id).color, { flameSize: 14 }))
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
