# Aerlyn website

Marketing site, room-by-room smart-home planner and product information pages for Aerlyn home
automation. Nothing is sold online — the site produces leads for a free home visit. React 18 + Vite 6; every route is prerendered to static HTML at build time and
deployed as static files on Vercel. No backend: leads are sent by Formspree.

```
npm install
npm run dev      # local dev server
npm test         # Vitest
npm run build    # client build + SSR build + prerender + dist check
npx vite preview # serve the built site
```

- Business details, form ids, claims and the product catalogue (no prices): `src/config/site.js`.
- Routes: `src/routes.js`. Three paths are registered for Play Store verification and must not change.
- Everything else — structure, owner to-do list, deployment steps: `docs/HANDOFF.md`.
