import { buildExportPayload } from './exportJson.js';

// Formspree endpoint — reuses the same provider as the legacy Aerlyn site.
// Replace with the production form id before launch.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykokrdw';

// POST the export payload to Formspree. Resolves to true on success.
export async function sendToAerlyn(home, contact) {
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
}
