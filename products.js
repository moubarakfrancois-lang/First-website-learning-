/* Candleist product catalog — replace with your real products, prices and photos. */
const PRODUCTS = [
  {
    id: 'amber-oud',
    name: 'Amber & Oud',
    category: 'Woody',
    notes: 'Dark amber, oud wood, smoked vanilla',
    price: 28,
    color: '#c9762f',
    burnTime: '45 hrs',
    sizes: [
      { label: '8 oz', price: 28 },
      { label: '12 oz', price: 36 },
    ],
  },
  {
    id: 'vanilla-bean-noir',
    name: 'Vanilla Bean Noir',
    category: 'Sweet',
    notes: 'Madagascar vanilla, brown sugar, tonka bean',
    price: 24,
    color: '#e0b464',
    burnTime: '40 hrs',
    sizes: [
      { label: '8 oz', price: 24 },
      { label: '12 oz', price: 32 },
    ],
  },
  {
    id: 'sea-salt-driftwood',
    name: 'Sea Salt & Driftwood',
    category: 'Fresh',
    notes: 'Ocean air, weathered driftwood, sea salt',
    price: 26,
    color: '#7fa9b8',
    burnTime: '42 hrs',
    sizes: [
      { label: '8 oz', price: 26 },
      { label: '12 oz', price: 34 },
    ],
  },
  {
    id: 'cedarwood-cabin',
    name: 'Cedarwood Cabin',
    category: 'Woody',
    notes: 'Cedar, fireside smoke, sandalwood',
    price: 28,
    color: '#8a5a3b',
    burnTime: '45 hrs',
    sizes: [
      { label: '8 oz', price: 28 },
      { label: '12 oz', price: 36 },
    ],
  },
  {
    id: 'lavender-fields',
    name: 'Lavender Fields',
    category: 'Floral',
    notes: 'French lavender, chamomile, soft musk',
    price: 22,
    color: '#a992d1',
    burnTime: '38 hrs',
    sizes: [
      { label: '8 oz', price: 22 },
      { label: '12 oz', price: 30 },
    ],
  },
  {
    id: 'spiced-chai',
    name: 'Spiced Chai',
    category: 'Spiced',
    notes: 'Cardamom, clove, black tea, warm milk',
    price: 25,
    color: '#b8703f',
    burnTime: '42 hrs',
    sizes: [
      { label: '8 oz', price: 25 },
      { label: '12 oz', price: 33 },
    ],
  },
  {
    id: 'winter-pine',
    name: 'Winter Pine',
    category: 'Seasonal',
    notes: 'Fraser fir, frosted pine, cedarwood',
    price: 27,
    color: '#4f7a5c',
    burnTime: '44 hrs',
    sizes: [
      { label: '8 oz', price: 27 },
      { label: '12 oz', price: 35 },
    ],
  },
  {
    id: 'fig-honey',
    name: 'Fig & Honey',
    category: 'Sweet',
    notes: 'Ripe fig, wild honey, golden amber',
    price: 26,
    color: '#a4632f',
    burnTime: '40 hrs',
    sizes: [
      { label: '8 oz', price: 26 },
      { label: '12 oz', price: 34 },
    ],
  },
  {
    id: 'black-fig-leather',
    name: 'Black Fig & Leather',
    category: 'Woody',
    notes: 'Black fig, worn leather, dark musk',
    price: 30,
    color: '#5b3b52',
    burnTime: '46 hrs',
    sizes: [
      { label: '8 oz', price: 30 },
      { label: '12 oz', price: 38 },
    ],
  },
  {
    id: 'citrus-grove',
    name: 'Citrus Grove',
    category: 'Fresh',
    notes: 'Blood orange, grapefruit, mint leaf',
    price: 22,
    color: '#e08a3d',
    burnTime: '38 hrs',
    sizes: [
      { label: '8 oz', price: 22 },
      { label: '12 oz', price: 30 },
    ],
  },
  {
    id: 'midnight-jasmine',
    name: 'Midnight Jasmine',
    category: 'Floral',
    notes: 'Night jasmine, white tea, soft vanilla',
    price: 27,
    color: '#8b7fc7',
    burnTime: '43 hrs',
    sizes: [
      { label: '8 oz', price: 27 },
      { label: '12 oz', price: 35 },
    ],
  },
  {
    id: 'toasted-marshmallow',
    name: 'Toasted Marshmallow',
    category: 'Sweet',
    notes: 'Toasted sugar, cream, campfire warmth',
    price: 23,
    color: '#e8c79a',
    burnTime: '38 hrs',
    sizes: [
      { label: '8 oz', price: 23 },
      { label: '12 oz', price: 31 },
    ],
  },
];

const BUNDLES = [
  {
    id: 'cozy-trio',
    name: 'The Cozy Trio',
    desc: 'Vanilla Bean Noir, Spiced Chai & Toasted Marshmallow — three warm scents for slow evenings.',
    productIds: ['vanilla-bean-noir', 'spiced-chai', 'toasted-marshmallow'],
    price: 60,
  },
  {
    id: 'fresh-start-duo',
    name: 'Fresh Start Duo',
    desc: 'Sea Salt & Driftwood paired with Citrus Grove for a bright, airy home.',
    productIds: ['sea-salt-driftwood', 'citrus-grove'],
    price: 42,
  },
  {
    id: 'build-your-own',
    name: 'Build-Your-Own 3-Pack',
    desc: 'Pick any three candles from the full collection — mix and match your favorites.',
    productIds: null,
    price: 65,
    custom: true,
  },
];

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function bundleOriginalPrice(bundle) {
  if (!bundle.productIds) return null;
  return bundle.productIds.reduce((sum, id) => sum + getProduct(id).price, 0);
}
