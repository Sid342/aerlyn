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

export function isEmail(raw) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw ?? '').trim());
}

// Checkout delivery details: contact + email, address, city, state, pincode.
// Returns { errors, phone } like validateContact.
export function validateOrder(form) {
  const { errors, phone } = validateContact(form);
  if (!isEmail(form.email)) errors.email = 'Please enter a valid email address.';
  if (!isName(form.address)) errors.address = 'Please enter your delivery address.';
  if (!isName(form.city)) errors.city = 'Please enter your city.';
  if (!isName(form.state)) errors.state = 'Please enter your state.';
  if (!isPincode(form.pincode)) errors.pincode = 'Please enter a valid 6-digit pincode.';
  return { errors, phone };
}
