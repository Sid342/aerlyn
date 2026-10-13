// Single source of truth for brand, contact, form endpoints, claims and products.
// null = not known yet. UI that depends on a null value must not render.
// Owner: fill the null values and confirm the rest before launch.

const RETROFIT_FEATURES = [
  'Touch controls',
  'Scenes and schedules',
  'App and voice control (Alexa, Google Home)',
  'Works without a neutral wire',
  'Child lock and overload protection',
];

// One photo for both modules for now — the 2-switch photo is a placeholder until a real one exists.
const RETROFIT_IMAGE = { image: '/products/assets/retrofit-switch.webp', imageWidth: 861, imageHeight: 465 };

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
  serviceArea: null, // e.g. 'Hisar and nearby towns'
  origin: 'https://aerlyn.in',

  // Shown in the "Aerlyn so far" section of the home page, each only when filled.
  photos: [], // install photos: { src, width, height, alt }
  brands: [], // brand names fitted, e.g. ['Brand A', 'Brand B']
  testimonial: null, // real customer feedback: { quote, name, place }

  // Formspree form IDs per form kind. Both share the legacy form for now —
  // owner replaces each with its production form ID.
  formspree: {
    visit: 'mykokrdw',
    plan: 'mykokrdw',
  },

  // Marketing claims — owner to confirm.
  heroStats: [
    { number: '500+', label: 'Homes automated' },
    { number: '<1 day', label: 'Full installation' },
    { number: '40%', label: 'Avg. energy saved' },
    { number: '₹0', label: 'Subscription fee' },
  ],

  // Nothing is sold on this website — products and installation are sold through the home
  // visit. Product entries are information only; do not add amounts here.
  products: [
    {
      id: 'AER-SW1G-WiFi',
      slug: 'retrofit-1-switch',
      name: 'Aerlyn Retrofit 1-Switch',
      tagline: 'Wi-Fi module that makes one existing switch work from the app and by voice.',
      ...RETROFIT_IMAGE,
      features: RETROFIT_FEATURES,
      specs: retrofitSpecs('AER-SW1G-WiFi', '800 W (1 gang)'),
    },
    {
      id: 'AER-SW2G-WiFi',
      slug: 'retrofit-2-switch',
      name: 'Aerlyn Retrofit 2-Switch',
      tagline: 'Wi-Fi module that makes two existing switches work from the app and by voice.',
      ...RETROFIT_IMAGE,
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
