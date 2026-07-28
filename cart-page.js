/* Cart page rendering */
let shippingMethod = localStorage.getItem('candleist_shipping') || 'standard';

function renderCartPage() {
  const items = cartLineItems();
  const itemsWrap = document.getElementById('cart-items');
  const summaryWrap = document.getElementById('cart-summary');

  if (!items.length) {
    itemsWrap.innerHTML = `
      <div class="empty-cart">
        <p style="font-family:var(--serif);font-size:1.4rem;margin-bottom:14px;">Your cart is empty</p>
        <p style="margin-bottom:26px;">Find a scent for tonight.</p>
        <a href="shop.html" class="btn btn-primary">Shop Candles</a>
      </div>
    `;
    summaryWrap.innerHTML = '';
    return;
  }

  itemsWrap.innerHTML = items
    .map(
      (li) => `
      <div class="cart-item" data-key="${li.productId}|${li.sizeLabel}">
        ${renderJar(li.product.color, { flameSize: 14 })}
        <div>
          <p class="ci-name">${li.product.name}</p>
          <p class="ci-size">${li.sizeLabel}</p>
          <button class="ci-remove" data-remove>Remove</button>
        </div>
        <div class="qty-control">
          <button data-dec aria-label="Decrease quantity">−</button>
          <span>${li.qty}</span>
          <button data-inc aria-label="Increase quantity">+</button>
        </div>
        <span class="ci-price">${money(li.unitPrice * li.qty)}</span>
      </div>
    `
    )
    .join('');

  const subtotal = cartSubtotal();
  const { discount, matched } = detectBundleDiscount();
  const afterDiscount = subtotal - discount;
  const ship = shippingCost(shippingMethod, afterDiscount);
  const total = afterDiscount + ship;

  summaryWrap.innerHTML = `
    ${matched.length ? `<div class="bundle-banner">You've unlocked: ${matched.map((b) => b.name).join(', ')} bundle pricing</div>` : ''}
    <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    ${discount > 0 ? `<div class="summary-row"><span>Bundle discount</span><span>-${money(discount)}</span></div>` : ''}
    <label style="display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px;">Shipping</label>
    <select class="shipping-select" id="shipping-select">
      <option value="standard" ${shippingMethod === 'standard' ? 'selected' : ''}>${SHIPPING_RATES.standard.label} — ${afterDiscount >= FREE_SHIPPING_THRESHOLD ? 'Free' : money(SHIPPING_RATES.standard.price)}</option>
      <option value="express" ${shippingMethod === 'express' ? 'selected' : ''}>${SHIPPING_RATES.express.label} — ${money(SHIPPING_RATES.express.price)}</option>
    </select>
    <div class="summary-row"><span>Shipping</span><span>${ship === 0 ? 'Free' : money(ship)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
    <a href="checkout.html" class="btn btn-primary btn-block">Checkout</a>
    ${afterDiscount < FREE_SHIPPING_THRESHOLD ? `<p style="font-size:11.5px;color:var(--muted);margin-top:14px;">Add ${money(FREE_SHIPPING_THRESHOLD - afterDiscount)} more for free standard shipping</p>` : ''}
  `;

  document.getElementById('shipping-select').addEventListener('change', (e) => {
    shippingMethod = e.target.value;
    localStorage.setItem('candleist_shipping', shippingMethod);
    renderCartPage();
  });

  itemsWrap.querySelectorAll('.cart-item').forEach((row) => {
    const [productId, sizeLabel] = row.dataset.key.split('|');
    const li = items.find((i) => i.productId === productId && i.sizeLabel === sizeLabel);
    row.querySelector('[data-remove]').addEventListener('click', () => {
      removeFromCart(productId, sizeLabel);
      renderCartPage();
    });
    row.querySelector('[data-inc]').addEventListener('click', () => {
      updateCartQty(productId, sizeLabel, li.qty + 1);
      renderCartPage();
    });
    row.querySelector('[data-dec]').addEventListener('click', () => {
      if (li.qty <= 1) {
        removeFromCart(productId, sizeLabel);
      } else {
        updateCartQty(productId, sizeLabel, li.qty - 1);
      }
      renderCartPage();
    });
  });
}

renderCartPage();
