import { formspreeUrl } from '../config/site.js';

// Send a lead to the Formspree form for `kind` ('visit' | 'plan' | 'order').
// Resolves { ok: true } only on a 2xx response; never throws.
// `_gotcha` is the honeypot: a bot that fills it gets a fake success and nothing is sent.
export async function submitLead(kind, { _gotcha, ...fields }) {
  if (_gotcha) return { ok: true };
  try {
    const res = await fetch(formspreeUrl(kind), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(fields),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
