# Aerlyn website

Marketing site, room-by-room smart-home planner and a small storefront for Aerlyn home
automation. React 18 + Vite 6; every route is prerendered to static HTML at build time and
deployed as static files on Vercel. No backend: leads and orders are sent by Formspree.

```
npm install
npm run dev      # local dev server
npm test         # Vitest
npm run build    # client build + SSR build + prerender + dist check
npx vite preview # serve the built site
```

- Business details, prices, form ids, claims and policy commitments: `src/config/site.js`.
- Routes: `src/routes.js`. Three paths are registered for Play Store verification and must not change.
- Everything else — structure, owner to-do list, deployment steps: `docs/HANDOFF.md`.
