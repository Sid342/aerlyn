import { site } from './config/site.js';

export const productPath = (product) => `/products/${product.slug}.html`;
export const CHECKOUT_PATH = '/products/checkout.html';
export const PRIVACY_PATH = '/privacy-policy.html';

// Path → page map. The client picks from location.pathname; the prerender walks this list.
// The privacy and product paths are registered for Play Store verification — do not change them.
export const routes = [
  { path: '/', page: 'landing' },
  ...site.products.map((product) => ({ path: productPath(product), page: 'product', product })),
  { path: CHECKOUT_PATH, page: 'checkout', noindex: true },
  { path: PRIVACY_PATH, page: 'privacy' },
];

// Unknown paths fall back to the landing page.
export function matchRoute(pathname) {
  return routes.find((r) => r.path === pathname) || routes[0];
}
