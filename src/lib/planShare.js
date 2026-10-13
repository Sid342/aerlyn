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

// Fields of the 'plan' lead. `contact` is already validated: { name, phone, city, _gotcha }.
export function planLeadFields(home, contact, link) {
  const payload = buildExportPayload(home);
  return {
    _subject: `Aerlyn plan — ${payload.homeType} — ${contact.name} (${contact.phone})`,
    customerName: contact.name,
    customerPhone: contact.phone,
    customerCity: contact.city,
    planLink: link,
    plan: JSON.stringify(payload, null, 2),
    _gotcha: contact._gotcha,
  };
}

// Short 'visit' lead sent from the saved-plan view, reusing the saved contact.
export function visitLeadFields(contact, link) {
  return {
    _subject: `New Home Visit Request — ${contact.name} (${contact.phone})`,
    Name: contact.name,
    Phone: contact.phone,
    City: contact.city,
    Notes: `Requested after saving a plan: ${link}`,
    _gotcha: contact._gotcha,
  };
}
