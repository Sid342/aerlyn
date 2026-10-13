import { buildExportPayload } from './exportJson.js';
import { formspreeUrl } from '../config/site.js';

const FORMSPREE_ENDPOINT = formspreeUrl('plan');

// POST the export payload to Formspree. Resolves to true on success,
// false on network failure or non-2xx response (never throws).
export async function sendToAerlyn(home, contact) {
  try {
    const payload = buildExportPayload(home);
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Aerlyn Studio order — ${payload.homeType}`,
        customerName: contact.name || '',
        customerPhone: contact.phone || '',
        customerCity: contact.city || '',
        notes: contact.notes || '',
        plan: JSON.stringify(payload, null, 2),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
