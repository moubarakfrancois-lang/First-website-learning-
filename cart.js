/* Cart state — persisted in localStorage. Client-side only; no real transactions happen here. */
const CART_KEY = 'candleist_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, sizeLabel, qty = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId && i.sizeLabel === sizeLabel);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, sizeLabel, qty });
  }
  saveCart(cart);
}

function removeFromCart(productId, sizeLabel) {
  const cart = getCart().filter((i) => !(i.productId === productId && i.sizeLabel === sizeLabel));
  saveCart(cart);
}

function updateCartQty(productId, sizeLabel, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId && i.sizeLabel === sizeLabel);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(cart);
}

function cartItemCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartLineItems() {
  return getCart().map((i) => {
    const product = getProduct(i.productId);
    const size = product.sizes.find((s) => s.label === i.sizeLabel) || product.sizes[0];
    return { ...i, product, unitPrice: size.price };
  });
}

function cartSubtotal() {
  return cartLineItems().reduce((sum, li) => sum + li.unitPrice * li.qty, 0);
}

/* Detects fixed bundles fully present in the cart (each bundle item qty >= 1) and
   returns the total discount those bundles earn over buying items individually. */
function detectBundleDiscount() {
  const cart = getCart();
  const ids = new Set(cart.map((i) => i.productId));
  let discount = 0;
  const matched = [];
  BUNDLES.forEach((b) => {
    if (!b.productIds) return;
    const allPresent = b.productIds.every((id) => ids.has(id));
    if (allPresent) {
      const original = bundleOriginalPrice(b);
      discount += Math.max(0, original - b.price);
      matched.push(b);
    }
  });
  return { discount, matched };
}

const SHIPPING_RATES = {
  standard: { label: 'Standard (3–5 business days)', price: 6.95 },
  express: { label: 'Express (1–2 business days)', price: 14.95 },
};
const FREE_SHIPPING_THRESHOLD = 75;

function shippingCost(method, subtotalAfterDiscount) {
  if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD && method === 'standard') return 0;
  return SHIPPING_RATES[method]?.price ?? 0;
}

function updateCartBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    const count = cartItemCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function money(n) {
  return '$' + n.toFixed(2);
}
