import { site } from '../config/site.js';
import { inr } from '../lib/cart.js';

// Terms, refund and shipping pages, built from config. Every commitment that config does not
// state (policy.* is null) renders as "confirmed with you before your order is finalised" —
// never add a number or promise here that is not in config or already on the site.

const UPDATED = '13 October 2026';
const contactUs = (s) => (s.email ? `contact us at ${s.email}` : 'contact us');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// `subject` ends with its verb: "The return window is", "Delivery charges are".
export function confirmedBeforeOrder(subject, s = site) {
  return `${subject} confirmed with you before your order is finalised — ${contactUs(s)} if you would like to know in advance.`;
}

export function returnWindowText(s = site) {
  const days = s.policy.returnWindowDays;
  return days == null
    ? confirmedBeforeOrder('The return window is', s)
    : `You can ask to return a product within ${plural(days, 'day')} of delivery.`;
}

export function returnShippingText(s = site) {
  const by = s.policy.returnShippingPaidBy;
  if (by === 'customer') return 'The cost of sending a product back to us is paid by you.';
  if (by === 'seller') return 'The cost of sending a product back to us is paid by us.';
  return confirmedBeforeOrder('Who pays to send a product back is', s);
}

export function refundTimeText(s = site) {
  const days = s.policy.refundDays;
  return days == null
    ? confirmedBeforeOrder('The time a refund takes is', s)
    : `Once a return is approved, the refund is made within ${plural(days, 'working day')}.`;
}

export function shippingFeeText(s = site) {
  const fee = s.policy.shippingFee;
  if (fee == null) return confirmedBeforeOrder('Delivery charges are', s);
  return fee === 0 ? 'Delivery is free.' : `A delivery charge of ${inr(fee)} applies to each order.`;
}

export function serviceAreaText(s = site) {
  const where = s.policy.serviceableLocations;
  return where
    ? `We deliver to ${where}.`
    : confirmedBeforeOrder('Whether we can deliver to your address is', s);
}

export function dispatchText(s = site) {
  const text = s.policy.dispatchText;
  return text
    ? `Each product page shows its current availability and dispatch time — at present: “${text}”.`
    : confirmedBeforeOrder('The dispatch time is', s);
}

export function installationWarrantyText(s = site) {
  const terms = s.policy.installationWarranty;
  return terms
    ? `Installation work is covered by ${terms}.`
    : confirmedBeforeOrder('Warranty terms for installation work are', s);
}

// "… carry a 1 year warranty", from the Warranty row of the product specs; null if there is none.
export function productWarrantyText(s = site) {
  const withWarranty = s.products
    .map((p) => [p.name, p.specs.find(([label]) => label === 'Warranty')?.[1]])
    .filter(([, warranty]) => warranty);
  if (!withWarranty.length) return null;
  return withWarranty.map(([name, warranty]) => `${name} carries a ${warranty.toLowerCase()} warranty.`).join(' ');
}

function terms(s) {
  const seller = `This website is operated by ${s.legalName}, ${s.address}, selling under the ${s.brand} name.`;
  return {
    title: 'Terms and Conditions',
    description: `The terms for ordering ${s.brand} products and booking a home visit on this website: prices, payment, delivery, returns and warranty.`,
    sections: [
      {
        heading: '1. Who we are',
        paragraphs: [
          s.gstin ? `${seller} GSTIN: ${s.gstin}.` : seller,
          'These terms apply when you use this website, place an order request or ask for a home visit or quote.',
        ],
      },
      {
        heading: '2. Products and prices',
        paragraphs: ['Products, specifications and prices are as listed on the product pages when you place your order request. Prices are in Indian rupees. The products sold on this website today are:'],
        list: s.products.map((p) => `${p.name} — ${inr(p.price)}`),
      },
      {
        heading: '3. Ordering and payment',
        paragraphs: [
          'Checking out on this website sends us an order request with your name, phone number, email, delivery address and the items you chose. No payment is taken on this website.',
          'After we receive your request we contact you to confirm delivery and arrange payment. Your order is finalised only once we have confirmed it with you.',
        ],
      },
      {
        heading: '4. Delivery',
        paragraphs: [dispatchText(s), 'Delivery charges and the places we deliver to are covered in the Shipping Policy.'],
      },
      {
        heading: '5. Returns and refunds',
        paragraphs: ['Returns and refunds are covered in the Refund Policy.'],
      },
      {
        heading: '6. Warranty',
        paragraphs: [productWarrantyText(s), installationWarrantyText(s)].filter(Boolean),
      },
      {
        heading: '7. Home visits, plans and quotes',
        paragraphs: [
          `The planner on this website helps you work out what your home needs. A plan you build or save is not an order and not a quotation.`,
          'The home visit is free and carries no obligation. During the visit we assess your wiring, confirm compatibility and design a solution for your home. A quote for an installation is given to you separately, and an installation goes ahead only once you have agreed to that quote.',
        ],
      },
      {
        heading: '8. Governing law',
        paragraphs: ['These terms are governed by the laws of India.'],
      },
    ],
  };
}

function refund(s) {
  return {
    title: 'Refund and Return Policy',
    description: `How returns and refunds work for ${s.brand} products ordered on this website, and who to contact about a faulty product.`,
    sections: [
      {
        heading: '1. Returning a product',
        paragraphs: [
          returnWindowText(s),
          returnShippingText(s),
          `To ask for a return, ${contactUs(s)} with your order number — it starts with “AER-” and is shown when your order request is placed.`,
        ],
      },
      {
        heading: '2. Refunds',
        paragraphs: [
          refundTimeText(s),
          'No payment is taken on this website, so a refund applies only to an amount you have already paid us for the order.',
        ],
      },
      {
        heading: '3. Faulty or damaged products',
        paragraphs: [
          productWarrantyText(s),
          `If a product arrives damaged or stops working, ${contactUs(s)} with your order number and a description of the problem.`,
        ].filter(Boolean),
      },
      {
        heading: '4. Installations',
        paragraphs: [
          'Home automation installations are quoted individually after the free home visit.',
          confirmedBeforeOrder('Cancellation and refund terms for an installation are', s),
        ],
      },
    ],
  };
}

function shipping(s) {
  return {
    title: 'Shipping Policy',
    description: `Dispatch times, delivery charges and delivery areas for ${s.brand} products ordered on this website.`,
    sections: [
      { heading: '1. Dispatch', paragraphs: [dispatchText(s)] },
      { heading: '2. Delivery charges', paragraphs: [shippingFeeText(s)] },
      { heading: '3. Where we deliver', paragraphs: [serviceAreaText(s)] },
      {
        heading: '4. Your delivery address',
        paragraphs: ['We deliver to the address you give at checkout. After you place an order request we contact you to confirm delivery and arrange payment before anything is sent.'],
      },
      {
        heading: '5. Installations',
        paragraphs: ['Home automation installations are not shipped. They are fitted at your home by our technicians, and we call you to schedule the work.'],
      },
    ],
  };
}

const DOCS = { terms, refund, shipping };

// { title, description, updated, sections: [{ heading, paragraphs, list? }] } for one policy page.
export function policyDoc(key, s = site) {
  return { ...DOCS[key](s), updated: UPDATED };
}
