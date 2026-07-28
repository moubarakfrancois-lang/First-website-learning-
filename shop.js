/* Shop page rendering */
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

const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];
const filterBar = document.getElementById('shop-filter-bar');
const grid = document.getElementById('shop-grid');

function renderGrid(category) {
  const list = category === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
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

/* Bundles */
const bundleGrid = document.getElementById('bundle-grid');
bundleGrid.innerHTML = BUNDLES.map((b) => {
  const jars = (b.productIds || PRODUCTS.slice(0, 3).map((p) => p.id))
    .map((id, i) => renderJar(getProduct(id).color, { flameSize: 14, delay: i * 120 }))
    .join('');
  const original = bundleOriginalPrice(b);
  return `
    <div class="bundle-card" id="bundle-${b.id}">
      <div class="bundle-jars">${jars}</div>
      <h3 class="bundle-name">${b.name}</h3>
      <p class="bundle-desc">${b.desc}</p>
      <div class="bundle-price-row">
        <span class="bundle-price">${money(b.price)}</span>
        ${original ? `<span class="bundle-was">${money(original)}</span>` : ''}
      </div>
      <p class="bundle-save">${original ? `Save ${money(original - b.price)}` : 'Custom picks'}</p>
      <button class="btn btn-primary btn-block" data-bundle-add="${b.id}">Add Bundle to Cart</button>
    </div>
  `;
}).join('');

bundleGrid.querySelectorAll('[data-bundle-add]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const bundle = BUNDLES.find((b) => b.id === btn.dataset.bundleAdd);
    const ids = bundle.productIds || PRODUCTS.slice(0, 3).map((p) => p.id);
    ids.forEach((id) => {
      const product = getProduct(id);
      addToCart(product.id, product.sizes[0].label, 1);
    });
    showToast(`${bundle.name} added to cart`);
  });
});

/* Jump to a bundle via #bundle-id hash from other pages */
if (location.hash.startsWith('#bundle-')) {
  const target = document.querySelector(location.hash);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
}
