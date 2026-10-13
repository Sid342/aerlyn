import { site } from './config/site.js';

export const productPath = (product) => `/products/${product.slug}.html`;
export const PRIVACY_PATH = '/privacy-policy.html';
// The policy key is also the id in data/policies.js.
export const POLICY_PATHS = {
  terms: '/terms.html',
};

// Path → page map. The client picks from location.pathname; the prerender walks this list.
// The privacy and product paths are registered for Play Store verification — do not change them.
export const routes = [
  { path: '/', page: 'landing' },
  ...site.products.map((product) => ({ path: productPath(product), page: 'product', product })),
  { path: PRIVACY_PATH, page: 'privacy' },
  ...Object.entries(POLICY_PATHS).map(([policy, path]) => ({ path, page: 'policy', policy })),
];

// Unknown paths fall back to the landing page.
export function matchRoute(pathname) {
  return routes.find((r) => r.path === pathname) || routes[0];
}
