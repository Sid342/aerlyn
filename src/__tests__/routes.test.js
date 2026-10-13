import { describe, it, expect } from 'vitest';
import { routes, matchRoute } from '../routes.js';

describe('routes', () => {
  it('keeps the URLs registered for Play Store verification', () => {
    const paths = routes.map((r) => r.path);
    expect(paths).toContain('/privacy-policy.html');
    expect(paths).toContain('/products/retrofit-1-switch.html');
    expect(paths).toContain('/products/retrofit-2-switch.html');
  });

  it('is exactly the landing page, two product pages, privacy and terms', () => {
    expect(routes.map((r) => r.path)).toEqual([
      '/',
      '/products/retrofit-1-switch.html',
      '/products/retrofit-2-switch.html',
      '/privacy-policy.html',
      '/terms.html',
    ]);
    expect(matchRoute('/terms.html').policy).toBe('terms');
  });

  it('has unique paths', () => {
    const paths = routes.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('matches a known path and falls back to the landing page', () => {
    expect(matchRoute('/products/checkout.html').page).toBe('landing');
    expect(matchRoute('/products/retrofit-2-switch.html').product.id).toBe('AER-SW2G-WiFi');
    expect(matchRoute('/nope').page).toBe('landing');
    expect(matchRoute('/index.html').page).toBe('landing');
  });

  it('matches a page without .html or with a trailing slash', () => {
    expect(matchRoute('/products/retrofit-1-switch').product.id).toBe('AER-SW1G-WiFi');
    expect(matchRoute('/products/retrofit-2-switch/').product.id).toBe('AER-SW2G-WiFi');
    expect(matchRoute('/privacy-policy').page).toBe('privacy');
    expect(matchRoute('/terms').policy).toBe('terms');
    expect(matchRoute('/').page).toBe('landing');
  });
});
