import { describe, it, expect, afterEach } from 'vitest';
import {
  CART_KEY, cleanCart, addToCart, removeFromCart, cartLines, cartTotal, cartCount,
  loadCart, saveCart, inr, orderId, orderItemsText,
} from '../cart.js';

const PRODUCTS = [
  { id: 'A', name: 'Alpha', price: 100 },
  { id: 'B', name: 'Beta', price: 250 },
];

describe('cleanCart', () => {
  it('returns an empty cart for anything that is not an array', () => {
    for (const raw of [null, undefined, 'x', 5, { id: 'A', qty: 1 }]) {
      expect(cleanCart(raw, PRODUCTS)).toEqual([]);
    }
  });

  it('drops unknown ids and malformed lines', () => {
    expect(cleanCart([{ id: 'Z', qty: 2 }, null, 'A', { qty: 3 }, { id: 'A', qty: 2 }], PRODUCTS))
      .toEqual([{ id: 'A', qty: 2 }]);
  });

  it('keeps only id and qty — a stored name or price is ignored', () => {
    expect(cleanCart([{ id: 'A', qty: 1, name: '<img onerror=x>', price: 1 }], PRODUCTS))
      .toEqual([{ id: 'A', qty: 1 }]);
  });

  it('clamps qty to 1–99', () => {
    const qty = (q) => cleanCart([{ id: 'A', qty: q }], PRODUCTS)[0].qty;
    expect(qty(0)).toBe(1);
    expect(qty(-4)).toBe(1);
    expect(qty('abc')).toBe(1);
    expect(qty(2.9)).toBe(2);
    expect(qty('7')).toBe(7);
    expect(qty(1000)).toBe(99);
  });

  it('merges repeated lines for one product', () => {
    expect(cleanCart([{ id: 'A', qty: 2 }, { id: 'A', qty: 3 }], PRODUCTS)).toEqual([{ id: 'A', qty: 5 }]);
    expect(cleanCart([{ id: 'A', qty: 60 }, { id: 'A', qty: 60 }], PRODUCTS)).toEqual([{ id: 'A', qty: 99 }]);
  });
});

describe('cart operations', () => {
  it('adds a new line, tops up an existing one, and does not mutate the input', () => {
    const cart = [{ id: 'A', qty: 1 }];
    expect(addToCart(cart, 'B', 2, PRODUCTS)).toEqual([{ id: 'A', qty: 1 }, { id: 'B', qty: 2 }]);
    expect(addToCart(cart, 'A', 2, PRODUCTS)).toEqual([{ id: 'A', qty: 3 }]);
    expect(addToCart(cart, 'Z', 1, PRODUCTS)).toEqual([{ id: 'A', qty: 1 }]);
    expect(cart).toEqual([{ id: 'A', qty: 1 }]);
  });

  it('removes a line', () => {
    expect(removeFromCart([{ id: 'A', qty: 1 }, { id: 'B', qty: 2 }], 'A')).toEqual([{ id: 'B', qty: 2 }]);
  });

  it('prices lines from the catalogue, never from the cart', () => {
    const lines = cartLines([{ id: 'B', qty: 2, price: 1, name: 'Free' }, { id: 'Z', qty: 1 }], PRODUCTS);
    expect(lines).toEqual([{ id: 'B', name: 'Beta', price: 250, qty: 2, lineTotal: 500 }]);
    expect(cartTotal(lines)).toBe(500);
  });

  it('counts units', () => {
    expect(cartCount([])).toBe(0);
    expect(cartCount([{ id: 'A', qty: 2 }, { id: 'B', qty: 3 }])).toBe(5);
  });
});

describe('cart storage', () => {
  const real = globalThis.localStorage;
  afterEach(() => { globalThis.localStorage = real; });

  function fakeStorage(initial = {}) {
    const data = { ...initial };
    globalThis.localStorage = {
      getItem: (k) => (k in data ? data[k] : null),
      setItem: (k, v) => { data[k] = v; },
      removeItem: (k) => { delete data[k]; },
    };
    return data;
  }

  it('loads and cleans the stored cart against the real catalogue', () => {
    fakeStorage({ [CART_KEY]: JSON.stringify([{ id: 'AER-SW1G-WiFi', name: 'x', price: 1, qty: 2 }, { id: 'nope', qty: 1 }]) });
    expect(loadCart()).toEqual([{ id: 'AER-SW1G-WiFi', qty: 2 }]);
  });

  it('returns an empty cart for corrupt or missing storage', () => {
    fakeStorage({ [CART_KEY]: '{not json' });
    expect(loadCart()).toEqual([]);
    fakeStorage();
    expect(loadCart()).toEqual([]);
    globalThis.localStorage = { getItem() { throw new Error('blocked'); } };
    expect(loadCart()).toEqual([]);
  });

  it('saves the cart and removes the key when it is empty', () => {
    const data = fakeStorage();
    saveCart([{ id: 'A', qty: 1 }]);
    expect(JSON.parse(data[CART_KEY])).toEqual([{ id: 'A', qty: 1 }]);
    saveCart([]);
    expect(CART_KEY in data).toBe(false);
  });

  it('does not throw when storage is unavailable', () => {
    globalThis.localStorage = { setItem() { throw new Error('full'); }, removeItem() { throw new Error('full'); } };
    expect(() => saveCart([{ id: 'A', qty: 1 }])).not.toThrow();
  });
});

describe('order helpers', () => {
  it('formats rupees with Indian grouping', () => {
    expect(inr(2300)).toBe('₹2,300');
    expect(inr(123456)).toBe('₹1,23,456');
  });

  it('builds the order id from the given time', () => {
    expect(orderId(new Date(2026, 9, 3, 4, 5, 6))).toBe('AER-20261003040506');
    expect(orderId()).toMatch(/^AER-\d{14}$/);
  });

  it('lists order items one per line', () => {
    const lines = cartLines([{ id: 'A', qty: 2 }, { id: 'B', qty: 1 }], PRODUCTS);
    expect(orderItemsText(lines)).toBe('Alpha (A) x2 = ₹200\nBeta (B) x1 = ₹250');
  });
});
