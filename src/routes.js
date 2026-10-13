// Path → page map. The client picks from location.pathname; the prerender walks this list.
export const routes = [
  { path: '/', page: 'landing' },
];

// Unknown paths fall back to the landing page.
export function matchRoute(pathname) {
  return routes.find((r) => r.path === pathname) || routes[0];
}
