// Deterministic mock catalog for Cadence Audio.
// Generated once at module load so MSW handlers and tests see the same data.

const CATEGORIES = ['Turntables', 'Headphones', 'Amplifiers', 'Speakers', 'Cartridges', 'Cables'];

const BRANDS = [
  'Meridian & Vale', 'Northline', 'Oscura', 'Ferrous', 'Palewave',
  'Solstice Audio', 'Kindred Sound', 'Vantage', 'Amberline', 'Lowfield',
];

const ADJECTIVES = [
  'Heritage', 'Studio', 'Field', 'Reference', 'Compact', 'Signature',
  'Analog', 'Session', 'Atlas', 'Drift', 'Ember', 'Halcyon',
];

const NOUNS = {
  Turntables: ['Deck', 'Spinner', 'Plinth', 'Belt-Drive', 'Direct-Drive'],
  Headphones: ['Cans', 'Monitors', 'Open-Backs', 'Closed-Backs', 'Buds'],
  Amplifiers: ['Amp', 'Integrated', 'Preamp', 'Power Stage', 'Tube Amp'],
  Speakers: ['Monitors', 'Bookshelf', 'Tower', 'Standmount', 'Sub'],
  Cartridges: ['MM Cartridge', 'MC Cartridge', 'Stylus', 'Headshell'],
  Cables: ['Interconnect', 'Phono Cable', 'Speaker Cable', 'Tonearm Cable'],
};

// Simple seeded PRNG so the catalog is stable across reloads (mulberry32).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100;

function specsFor(category) {
  switch (category) {
    case 'Turntables':
      return {
        'Drive type': pick(['Belt-drive', 'Direct-drive']),
        'Wow & flutter': `${range(0.05, 0.25)}%`,
        'Speeds': pick(['33⅓ / 45 rpm', '33⅓ / 45 / 78 rpm']),
      };
    case 'Headphones':
      return {
        'Driver size': `${Math.round(range(32, 50))}mm`,
        'Impedance': `${Math.round(range(16, 300))}Ω`,
        'Frequency response': '15Hz–25kHz',
      };
    case 'Amplifiers':
      return {
        'Power output': `${Math.round(range(20, 150))}W/ch`,
        'THD': `${range(0.001, 0.05)}%`,
        'Inputs': pick(['3x RCA, 1x XLR', '4x RCA', '2x RCA, 1x Phono']),
      };
    case 'Speakers':
      return {
        'Frequency response': `${Math.round(range(35, 60))}Hz–20kHz`,
        'Sensitivity': `${Math.round(range(84, 92))}dB`,
        'Impedance': pick(['4Ω', '6Ω', '8Ω']),
      };
    case 'Cartridges':
      return {
        'Type': pick(['Moving Magnet', 'Moving Coil']),
        'Output voltage': `${range(0.3, 5)}mV`,
        'Tracking force': `${range(1.2, 2.5)}g`,
      };
    case 'Cables':
      return {
        'Length': pick(['0.5m', '1m', '1.5m', '2m']),
        'Conductor': pick(['OFC Copper', 'Silver-plated Copper']),
        'Connector': pick(['RCA', 'XLR', 'Banana Plug']),
      };
    default:
      return {};
  }
}

function buildProduct(id) {
  const category = CATEGORIES[id % CATEGORIES.length];
  const brand = pick(BRANDS);
  const adjective = pick(ADJECTIVES);
  const noun = pick(NOUNS[category]);
  const name = `${adjective} ${noun}`;
  const price = category === 'Cables'
    ? range(19, 249)
    : category === 'Cartridges'
      ? range(49, 899)
      : range(89, 2499);
  const inStock = rand() > 0.18;
  const rating = Math.round(range(3.4, 5.0) * 10) / 10;

  // Picsum gives real photographs (not category-matched, since this is a mock
  // catalog with no real product photography) but seeded so the same product
  // always gets the same image across reloads — a placeholder, not random noise.
  const image = `https://picsum.photos/seed/cadence-${category}-${id}/600/600`;

  return {
    id,
    name,
    brand,
    category,
    price,
    inStock,
    rating,
    image,
    reviewCount: Math.floor(range(4, 380)),
    description: `The ${brand} ${name} is built for listeners who care about the details — precise engineering, honest materials, and a sound signature that stays out of the way of the music.`,
    specs: specsFor(category),
    colorway: pick(['Matte Black', 'Walnut', 'Brushed Copper', 'Slate Grey', 'Cream']),
  };
}

export const PRODUCTS = Array.from({ length: 64 }, (_, i) => buildProduct(i + 1));

export const CATEGORY_LIST = CATEGORIES;
