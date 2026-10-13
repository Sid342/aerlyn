// Returns the 10-digit Indian mobile number, or null if invalid.
export function normalisePhone(raw) {
  let p = String(raw ?? '').replace(/[\s-]/g, '').replace(/^\+91/, '');
  if (p.length === 12 && p.startsWith('91')) p = p.slice(2);
  if (p.length === 11 && p.startsWith('0')) p = p.slice(1);
  return /^[6-9]\d{9}$/.test(p) ? p : null;
}

export function isName(raw) {
  return String(raw ?? '').trim().length > 0;
}

export function isPincode(raw) {
  return /^\d{6}$/.test(String(raw ?? '').trim());
}

// Name + phone check shared by every lead form.
// Returns { errors: { name?, phone? }, phone } — phone is normalised (or null).
export function validateContact({ name, phone }) {
  const errors = {};
  if (!isName(name)) errors.name = 'Please enter your name.';
  const normalised = normalisePhone(phone);
  if (!normalised) errors.phone = 'Please enter a valid 10-digit mobile number.';
  return { errors, phone: normalised };
}
