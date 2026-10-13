import { site } from '../config/site.js';

export const CART_KEY = 'aerlyn_cart';
const MAX_QTY = 99;

export function clampQty(raw) {
  return Math.min(MAX_QTY, Math.max(1, Math.floor(Number(raw)) || 1));
}

// Any stored value → [{ id, qty }] for known products only. Names and prices are never
// taken from storage; they are looked up from the catalogue by id.
export function cleanCart(raw, products = site.products) {
  if (!Array.isArray(raw)) return [];
  const cart = [];
  for (const line of raw) {
    if (!line || !products.some((p) => p.id === line.id)) continue;
    const existing = cart.find((l) => l.id === line.id);
    if (existing) existing.qty = clampQty(existing.qty + clampQty(line.qty));
    else cart.push({ id: line.id, qty: clampQty(line.qty) });
  }
  return cart;
}

export function addToCart(cart, id, qty, products = site.products) {
  return cleanCart([...cart, { id, qty }], products);
}

export function removeFromCart(cart, id) {
  return cart.filter((l) => l.id !== id);
}

// Priced lines for display and for the order: [{ id, name, price, qty, lineTotal }].
export function cartLines(cart, products = site.products) {
  return cleanCart(cart, products).map(({ id, qty }) => {
    const { name, price } = products.find((p) => p.id === id);
    return { id, name, price, qty, lineTotal: price * qty };
  });
}

export function cartTotal(lines) {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}

export function cartCount(cart) {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

export function loadCart() {
  try {
    return cleanCart(JSON.parse(localStorage.getItem(CART_KEY)));
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  try {
    if (cart.length) localStorage.setItem(CART_KEY, JSON.stringify(cart));
    else localStorage.removeItem(CART_KEY);
  } catch {
    // storage unavailable — the cart lives for this page only
  }
}

export function inr(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// AER-YYYYMMDDHHMMSS in local time.
export function orderId(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `AER-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function orderItemsText(lines) {
  return lines.map((l) => `${l.name} (${l.id}) x${l.qty} = ${inr(l.lineTotal)}`).join('\n');
}
