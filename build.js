/* Build page: drives the scroll-journey scene, then wires the configurator. */
import { createBuildScene } from './build-scene.js';
import { createCandleScene } from './candle3d.js';

/* ---------- Scroll-driven journey (Room A: Ingredients, Room B: The Pour) ---------- */
const canvas = document.getElementById('build-canvas');
const journey = createBuildScene(canvas, { waxColor: PRODUCTS[0].color });

const roomA = document.getElementById('room-a');
const roomB = document.getElementById('room-b');

function computeProgress() {
  const ref = window.scrollY + window.innerHeight * 0.5;
  const aTop = roomA.offsetTop;
  const aBottom = aTop + roomA.offsetHeight;
  const bTop = roomB.offsetTop;
  const bBottom = bTop + roomB.offsetHeight;

  let progress;
  if (ref < aBottom) {
    progress = Math.max(0, (ref - aTop) / (aBottom - aTop));
  } else {
    const bProg = Math.max(0, Math.min(1, (ref - bTop) / (bBottom - bTop)));
    progress = 1 + bProg;
  }
  journey.setProgress(progress);

  const pastJourney = window.scrollY > bBottom + 200;
  canvas.style.opacity = pastJourney ? 0 : 1;
  journey.setActive(!pastJourney || ref < bBottom + 400);
}

window.addEventListener('scroll', () => requestAnimationFrame(computeProgress));
window.addEventListener('resize', computeProgress);
computeProgress();

/* ---------- Configurator ---------- */
const configScents = PRODUCTS.slice(0, 8);
let selectedScent = configScents[0];
let selectedSize = selectedScent.sizes[0];

const configScene = createCandleScene(document.getElementById('config-jar'), {
  waxColor: selectedScent.color,
  interactive: true,
  autoSpin: true,
});

const swatchWrap = document.getElementById('scent-swatches');
swatchWrap.innerHTML = configScents
  .map(
    (p, i) => `<button class="scent-swatch${i === 0 ? ' active' : ''}" data-id="${p.id}" style="--swatch-color:${p.color}" title="${p.name}"></button>`
  )
  .join('');

const nameEl = document.getElementById('config-name');
const notesEl = document.getElementById('config-notes');
const priceEl = document.getElementById('config-price');
const sizeWrap = document.getElementById('config-sizes');
const jarStage = document.getElementById('config-jar');

function renderSizes() {
  sizeWrap.innerHTML = selectedScent.sizes
    .map((s, i) => `<button class="size-chip${s.label === selectedSize.label ? ' active' : ''}" data-size="${s.label}">${s.label} — ${money(s.price)}</button>`)
    .join('');
}

function updateConfigInfo() {
  nameEl.textContent = selectedScent.name;
  notesEl.textContent = `${selectedScent.category} · ${selectedScent.notes}`;
  priceEl.textContent = money(selectedSize.price);
  renderSizes();
}

updateConfigInfo();

swatchWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('.scent-swatch');
  if (!btn) return;
  swatchWrap.querySelectorAll('.scent-swatch').forEach((s) => s.classList.remove('active'));
  btn.classList.add('active');
  selectedScent = getProduct(btn.dataset.id);
  selectedSize = selectedScent.sizes[0];
  configScene.setColor(selectedScent.color);
  jarStage.style.animation = 'none';
  void jarStage.offsetWidth;
  jarStage.style.animation = '';
  updateConfigInfo();
});

sizeWrap.addEventListener('click', (e) => {
  const btn = e.target.closest('.size-chip');
  if (!btn) return;
  selectedSize = selectedScent.sizes.find((s) => s.label === btn.dataset.size);
  updateConfigInfo();
});

document.getElementById('config-add').addEventListener('click', () => {
  addToCart(selectedScent.id, selectedSize.label, 1);
  showToast(`${selectedScent.name} (${selectedSize.label}) added to cart`);
});
