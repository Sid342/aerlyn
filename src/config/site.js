// Single source of truth for brand, contact, form endpoints, claims and products.
// null = not known yet. UI that depends on a null value must not render.
// Owner: fill the null values and confirm the rest before launch.

const RETROFIT_FEATURES = [
  'Capacitive touch controls',
  'Scene & schedule automation',
  'App + voice control (Alexa / Google Home)',
  'No-neutral-wire installation',
  'Child lock & overload protection',
];

// One photo for both modules for now — the 2-switch photo is a placeholder until a real one exists.
const RETROFIT_IMAGE = { image: '/products/assets/retrofit-switch.webp', imageWidth: 861, imageHeight: 465 };

// Marketing badges on the product pages — owner to confirm. Empty values render nothing.
const RETROFIT_BADGES = { ribbon: 'Best Seller', trust: ['1-Year Warranty', 'Easy Returns', 'Fast Shipping'] };

function retrofitSpecs(model, load) {
  return [
    ['Model', model],
    ['Connectivity', 'WiFi 2.4 GHz 802.11 b/g/n'],
    ['Load capacity', load],
    ['Voltage', '100–240 V AC, 50/60 Hz'],
    ['Panel material', 'Tempered Glass + ABS'],
    ['Warranty', '1 Year'],
  ];
}

export const site = {
  brand: 'Aerlyn',
  legalName: 'Home Decor',
  address: '216, Green Square Market, Hisar – 125001',
  email: 'shaurya.goel.34@gmail.com',
  phone: null,
  whatsapp: null, // digits with country code, e.g. 9198XXXXXXXX
  gstin: null,
  serviceArea: null,
  origin: 'https://aerlyn.in',

  // Formspree form IDs per form kind. All three share the legacy form for now —
  // owner replaces each with its production form ID.
  formspree: {
    visit: 'mykokrdw',
    plan: 'mykokrdw',
    order: 'mykokrdw',
  },

  // Marketing claims — owner to confirm.
  heroStats: [
    { number: '500+', label: 'Homes automated' },
    { number: '<1 day', label: 'Full installation' },
    { number: '40%', label: 'Avg. energy saved' },
    { number: '₹0', label: 'Subscription fee, ever' },
  ],

  // Commitments shown on product and policy pages. While a value is null the policy pages say
  // that detail is confirmed with the customer before the order is finalised.
  policy: {
    dispatchText: 'In stock · ships in 2–3 days', // line under the buy button; null hides it
    returnWindowDays: null, // number of days after delivery
    returnShippingPaidBy: null, // 'customer' | 'seller'
    refundDays: null, // working days to refund after a return is approved
    shippingFee: null, // rupees per order; 0 = free delivery
    serviceableLocations: null, // e.g. 'all pincodes in India'
    installationWarranty: null, // e.g. 'a 1-year workmanship warranty'
  },

  products: [
    {
      id: 'AER-SW1G-WiFi',
      slug: 'retrofit-1-switch',
      name: 'Aerlyn Retrofit 1-Switch',
      tagline: 'Smart Wi-Fi retrofit module — make one existing switch app & voice controlled.',
      price: 2300,
      mrp: 3286,
      ...RETROFIT_IMAGE,
      badges: RETROFIT_BADGES,
      features: RETROFIT_FEATURES,
      specs: retrofitSpecs('AER-SW1G-WiFi', '800 W (1 gang)'),
    },
    {
      id: 'AER-SW2G-WiFi',
      slug: 'retrofit-2-switch',
      name: 'Aerlyn Retrofit 2-Switch',
      tagline: 'Smart Wi-Fi retrofit module — make two existing switches app & voice controlled.',
      price: 2300,
      mrp: 3286,
      ...RETROFIT_IMAGE,
      badges: RETROFIT_BADGES,
      features: RETROFIT_FEATURES,
      specs: retrofitSpecs('AER-SW2G-WiFi', '800 W per gang (2 gang)'),
    },
  ],
};

export function formspreeUrl(kind) {
  return `https://formspree.io/f/${site.formspree[kind]}`;
}

// wa.me link to the business number with a prefilled message; null until whatsapp is configured.
export function whatsappUrl(text) {
  return site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : null;
}
