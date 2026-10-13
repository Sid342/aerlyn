import { site } from './config/site.js';

export const productPath = (product) => `/products/${product.slug}.html`;
export const PRIVACY_PATH = '/privacy-policy.html';
export const PLATE_PATH = '/plate-designer.html';
// The policy key is also the id in data/policies.js.
export const POLICY_PATHS = {
  terms: '/terms.html',
};

// Path → page map. The client picks from location.pathname; the prerender walks this list.
// The privacy and product paths are registered for Play Store verification — do not change them.
export const routes = [
  { path: '/', page: 'landing' },
  { path: PLATE_PATH, page: 'plate' },
  ...site.products.map((product) => ({ path: productPath(product), page: 'product', product })),
  { path: PRIVACY_PATH, page: 'privacy' },
  ...Object.entries(POLICY_PATHS).map(([policy, path]) => ({ path, page: 'policy', policy })),
];

// Unknown paths fall back to the landing page.
// Hosts with "pretty URLs" (Netlify) also serve and link pages without `.html` or with a
// trailing slash, so those forms must resolve to the same page.
export function matchRoute(pathname) {
  const bare = (p) => p.replace(/\/+$/, '').replace(/\.html$/, '') || '/';
  return routes.find((r) => bare(r.path) === bare(pathname)) || routes[0];
}
