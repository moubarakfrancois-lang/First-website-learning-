/* FAQ accordion */
const GENERAL_FAQ = [
  {
    q: 'What are Candleist candles made from?',
    a: 'Every candle is poured from 100% natural soy wax with a lead-free, cotton wick and phthalate-free fragrance oils. No paraffin, no synthetic dyes.',
  },
  {
    q: 'How long do they burn for?',
    a: 'Burn time depends on the size — most 8 oz candles run about 38–45 hours and 12 oz candles run longer. Exact burn time is listed on each product page.',
  },
  {
    q: 'How do I get the best burn out of my candle?',
    a: 'Trim the wick to 1/4" before every burn, let the wax pool reach the edges on the first light (about 2–3 hours), and keep burns under 4 hours at a time.',
  },
  {
    q: 'Are your candles safe around pets?',
    a: 'Our soy wax and fragrance oils are formulated to be pet-friendly when used as directed, but as with any open flame, never leave a lit candle unattended.',
  },
  {
    q: 'Do you offer wholesale or custom labels?',
    a: 'Yes — reach out at hello@candleist.com with your order size and we\'ll put together a wholesale quote.',
  },
];

const SHIPPING_FAQ = [
  {
    q: 'How much is shipping?',
    a: 'Standard shipping (3–5 business days) is $6.95, and it\'s free on orders over $75. Express shipping (1–2 business days) is a flat $14.95.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship within the countries listed at checkout. If yours isn\'t listed yet, email us — we\'re expanding coverage regularly.',
  },
  {
    q: 'What is your return policy?',
    a: 'Unused candles can be returned within 30 days of delivery for a full refund. If something arrived damaged, send us a photo and we\'ll replace it free of charge.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Orders can be changed or cancelled within 2 hours of purchase — email hello@candleist.com as soon as possible and we\'ll take care of it.',
  },
];

function renderFaqList(containerId, items) {
  const el = document.getElementById(containerId);
  el.innerHTML = items
    .map(
      (item, i) => `
      <div class="faq-item" data-i="${i}">
        <button class="faq-q">${item.q}<span class="plus">+</span></button>
        <div class="faq-a"><p>${item.a}</p></div>
      </div>
    `
    )
    .join('');

  el.querySelectorAll('.faq-item').forEach((itemEl) => {
    itemEl.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = itemEl.classList.contains('open');
      el.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) itemEl.classList.add('open');
    });
  });
}

renderFaqList('faq-general', GENERAL_FAQ);
renderFaqList('faq-shipping', SHIPPING_FAQ);
