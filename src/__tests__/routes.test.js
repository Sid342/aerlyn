import { describe, it, expect } from 'vitest';
import { routes, matchRoute } from '../routes.js';

describe('routes', () => {
  it('keeps the URLs registered for Play Store verification', () => {
    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/privacy-policy.html');
    expect(paths).toContain('/products/retrofit-1-switch.html');
    expect(paths).toContain('/products/retrofit-2-switch.html');
  });

  it('has the three policy pages', () => {
    expect(matchRoute('/terms.html').policy).toBe('terms');
    expect(matchRoute('/refund-policy.html').policy).toBe('refund');
    expect(matchRoute('/shipping-policy.html').policy).toBe('shipping');
  });

  it('has unique paths', () => {
    const paths = routes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('matches a known path and falls back to the landing page', () => {
    expect(matchRoute('/products/checkout.html').page).toBe('checkout');
    expect(matchRoute('/products/retrofit-2-switch.html').product.id).toBe('AER-SW2G-WiFi');
    expect(matchRoute('/nope').page).toBe('landing');
    expect(matchRoute('/index.html').page).toBe('landing');
  });
});
