import { encodePlan } from './planStorage.js';
import { buildExportPayload } from './exportJson.js';

// Link that reopens this plan in any browser.
export function planLink(origin, home) {
  return `${origin}/#plan=${encodePlan(home)}`;
}

// wa.me link with no number — the customer picks the chat (themselves, family).
export function whatsappShareUrl(link) {
  return `https://wa.me/?text=${encodeURIComponent(`My Aerlyn smart home plan: ${link}`)}`;
}

// Fields of the 'plan' lead: an appointment request that carries the whole plan.
// `contact` is already validated: { name, phone, city, notes, _gotcha }.
export function planLeadFields(home, contact, link) {
  const payload = buildExportPayload(home);
  return {
    _subject: `Appointment request with ${payload.homeType} plan — ${contact.name} (${contact.phone})`,
    customerName: contact.name,
    customerPhone: contact.phone,
    customerCity: contact.city,
    customerNotes: contact.notes,
    planLink: link,
    plan: JSON.stringify(payload, null, 2),
    _gotcha: contact._gotcha,
  };
}

// Fields of the 'visit' lead: an appointment request without a plan.
// `product` is the product name when the form was opened on a product page.
export function visitLeadFields(contact, product) {
  return {
    _subject: `Appointment request — ${contact.name} (${contact.phone})${product ? ` — ${product}` : ''}`,
    Name: contact.name,
    Phone: contact.phone,
    Product: product,
    City: contact.city,
    Notes: contact.notes,
    _gotcha: contact._gotcha,
  };
}
