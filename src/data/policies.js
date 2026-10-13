import { site } from '../config/site.js';

// The Terms page, built from config. Nothing is sold on this website: products and installation
// are sold only after a home visit and a written quote. Never add a number or promise here that
// is not in config or already on the site.

const UPDATED = '13 October 2026';

// "… carries a 1 year warranty", from the Warranty row of the product specs; null if there is none.
export function productWarrantyText(s = site) {
  const withWarranty = s.products
    .map((p) => [p.name, p.specs.find(([label]) => label === 'Warranty')?.[1]])
    .filter(([, warranty]) => warranty);
  if (!withWarranty.length) return null;
  return withWarranty.map(([name, warranty]) => `${name} carries a ${warranty.toLowerCase()} warranty.`).join(' ');
}

function terms(s) {
  const seller = `This website is operated by ${s.legalName}, ${s.address}, under the ${s.brand} name.`;
  return {
    title: 'Terms and Conditions',
    description: `The terms for using the ${s.brand} website and planner, and how plans, quotes, home visits and product warranty work.`,
    sections: [
      {
        heading: '1. Who we are',
        paragraphs: [
          s.gstin ? `${seller} GSTIN: ${s.gstin}.` : seller,
          'These terms apply when you use this website or its planner, or ask for a home visit or a quote.',
        ],
      },
      {
        heading: '2. Using this website and the planner',
        paragraphs: [
          `This website describes ${s.brand} home automation and its products, and lets you plan your home room by room. Nothing is sold on this website.`,
          'The planner helps you work out what your home may need. What it suggests is a starting point, and is reviewed with you during the home visit.',
        ],
      },
      {
        heading: '3. Plans and quotes',
        paragraphs: [
          'A plan you build or save on this website is an estimate of what your home may need. It is not an order and not a contract.',
          'A quote we give you is a proposal. Neither a plan nor a quote commits you or us to anything until a written quote has been agreed between you and us.',
        ],
      },
      {
        heading: '4. Home visits and how we sell',
        paragraphs: [
          'The home visit is free and carries no obligation. During the visit we assess your wiring, confirm compatibility and design a solution for your home.',
          'Products and installation are sold only after a home visit, and only on the basis of a written quote agreed with you.',
        ],
      },
      {
        heading: '5. Warranty',
        paragraphs: ['Product warranty is as stated on the product pages of this website.', productWarrantyText(s)].filter(Boolean),
      },
      {
        heading: '6. Governing law',
        paragraphs: ['These terms are governed by the laws of India.'],
      },
    ],
  };
}

const DOCS = { terms };

// { title, description, updated, sections: [{ heading, paragraphs }] } for one policy page.
export function policyDoc(key, s = site) {
  return { ...DOCS[key](s), updated: UPDATED };
}
