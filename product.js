/* Product detail page */
const params = new URLSearchParams(location.search);
const product = getProduct(params.get('id')) || PRODUCTS[0];
document.title = `${product.name} — Candleist`;

let selectedSize = product.sizes[0];
let qty = 1;

function renderDetail() {
  document.getElementById('product-detail').innerHTML = `
    ${renderJar(product.color, { flameSize: 30 })}
    <div class="pd-info">
      <p class="pd-cat">${product.category}</p>
      <h1 class="pd-name">${product.name}</h1>
      <p class="pd-notes">${product.notes}. Poured in small batches with 100% soy wax and a lead-free cotton wick. Approx. burn time ${product.burnTime}.</p>
      <p class="pd-price" id="pd-price">${money(selectedSize.price)}</p>

      <div class="size-options" id="size-options">
        ${product.sizes
          .map(
            (s, i) =>
              `<button class="size-chip${i === 0 ? ' active' : ''}" data-size="${s.label}">${s.label} — ${money(s.price)}</button>`
          )
          .join('')}
      </div>

      <div class="pd-actions">
        <div class="qty-control">
          <button data-qty="dec" aria-label="Decrease quantity">−</button>
          <span id="qty-value">1</span>
          <button data-qty="inc" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-primary" id="pd-add">Add to Cart</button>
      </div>

      <div class="pd-meta">
        <span>&#9679; Ships in 1–2 business days</span>
        <span>&#9679; Free shipping on orders over ${money(FREE_SHIPPING_THRESHOLD)}</span>
        <span>&#9679; Burn time: ${product.burnTime}</span>
      </div>

      <div class="pd-ingredients">
        <h3 class="pd-ingredients-title">What's Inside</h3>
        <div class="ingredient-tags">
          ${(product.ingredients || [])
            .map((ing, i) => `<span class="ingredient-tag" style="--tag-delay:${i * 90}ms">${ing}</span>`)
            .join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('size-options').addEventListener('click', (e) => {
    const chip = e.target.closest('.size-chip');
    if (!chip) return;
    document.querySelectorAll('.size-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    selectedSize = product.sizes.find((s) => s.label === chip.dataset.size);
    document.getElementById('pd-price').textContent = money(selectedSize.price);
  });

  document.querySelectorAll('[data-qty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qty = btn.dataset.qty === 'inc' ? qty + 1 : Math.max(1, qty - 1);
      document.getElementById('qty-value').textContent = qty;
    });
  });

  document.getElementById('pd-add').addEventListener('click', () => {
    addToCart(product.id, selectedSize.label, qty);
    showToast(`${qty} × ${product.name} added to cart`);
  });
}
renderDetail();

/* Related products: same category, excluding current */
const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
const relatedList = related.length ? related : PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

document.getElementById('related-grid').innerHTML = relatedList
  .map(
    (p, i) => `
    <article class="product-card" data-id="${p.id}">
      ${renderJar(p.color, { delay: i * 90 })}
      <p class="card-cat">${p.category}</p>
      <h3 class="card-name">${p.name}</h3>
      <p class="card-notes">${p.notes}</p>
      <div class="card-footer">
        <span class="card-price">${money(p.price)}</span>
        <button class="card-add" data-add="${p.id}">Add</button>
      </div>
    </article>
  `
  )
  .join('');

document.querySelectorAll('#related-grid [data-add]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const p = getProduct(btn.dataset.add);
    addToCart(p.id, p.sizes[0].label, 1);
    showToast(`${p.name} added to cart`);
  });
});
document.querySelectorAll('#related-grid .product-card').forEach((card) => {
  card.addEventListener('click', () => {
    location.href = `product.html?id=${card.dataset.id}`;
  });
});
