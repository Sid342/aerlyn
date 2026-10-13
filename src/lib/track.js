// Custom event for Vercel Web Analytics. A no-op when the script is absent (dev, tests,
// prerender, blocked). Never pass personal data in `props`.
export function track(name, props) {
  if (typeof window !== 'undefined') window.va?.('event', { name, data: props });
}
