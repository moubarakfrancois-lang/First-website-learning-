/* Checkout page */
const shippingMethodCheckout = localStorage.getItem('candleist_shipping') || 'standard';

function renderCheckoutSummary() {
  const items = cartLineItems();
  const summary = document.getElementById('checkout-summary');

  if (!items.length) {
    document.getElementById('checkout-body').innerHTML = `
      <div class="empty-cart">
        <p style="font-family:var(--serif);font-size:1.4rem;margin-bottom:14px;">Your cart is empty</p>
        <a href="shop.html" class="btn btn-primary">Shop Candles</a>
      </div>
    `;
    return null;
  }

  const subtotal = cartSubtotal();
  const { discount, matched } = detectBundleDiscount();
  const afterDiscount = subtotal - discount;
  const ship = shippingCost(shippingMethodCheckout, afterDiscount);
  const total = afterDiscount + ship;

  summary.innerHTML = `
    <h3 style="font-family:var(--serif);font-size:1.2rem;margin:0 0 18px;">Order Summary</h3>
    ${items
      .map(
        (li) => `
      <div class="summary-row"><span>${li.product.name} × ${li.qty} (${li.sizeLabel})</span><span>${money(li.unitPrice * li.qty)}</span></div>
    `
      )
      .join('')}
    ${matched.length ? `<div class="bundle-banner">${matched.map((b) => b.name).join(', ')} bundle applied</div>` : ''}
    <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    ${discount > 0 ? `<div class="summary-row"><span>Bundle discount</span><span>-${money(discount)}</span></div>` : ''}
    <div class="summary-row"><span>Shipping (${SHIPPING_RATES[shippingMethodCheckout].label.split(' (')[0]})</span><span>${ship === 0 ? 'Free' : money(ship)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
  `;
  return total;
}

let orderTotal = renderCheckoutSummary();

/* Payment method switching */
document.querySelectorAll('.pay-method').forEach((label) => {
  label.addEventListener('click', () => {
    document.querySelectorAll('.pay-method').forEach((l) => l.classList.remove('active'));
    label.classList.add('active');
    label.querySelector('input').checked = true;
    document.getElementById('card-fields').classList.toggle('show', label.dataset.method === 'card');
  });
});

/* Simulated order submission — no real payment is processed */
const form = document.getElementById('shipping-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!orderTotal) return;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing…';
    setTimeout(() => {
      const orderNumber = 'CL-' + Math.floor(100000 + Math.random() * 900000);
      document.getElementById('confirm-text').textContent =
        `Order #${orderNumber} confirmed. Total charged: ${money(orderTotal)} (demo only — no real payment was taken). A confirmation email would be sent to the address you entered.`;
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      document.getElementById('checkout-body').style.display = 'none';
      document.querySelector('.checkout-steps').innerHTML = '<span class="active">1. Shipping</span><span class="active">2. Payment</span><span class="active">3. Confirmation</span>';
      document.getElementById('order-confirm').style.display = 'block';
    }, 1200);
  });
}
