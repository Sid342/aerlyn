# Handoff — Aerlyn website

**Updated:** 2026-10-13
**Repo:** https://github.com/Sid342/aerlyn
**Branch:** `overhaul/site-cleanup-leadgen-seo` (not pushed, not merged)
**Spec / plan:** `docs/superpowers/specs/2026-10-13-site-overhaul-design.md`, `docs/superpowers/plans/2026-10-13-site-overhaul.md`

## Change log — 2026-10-13: online selling removed

Owner decision: "Remove pricing from everywhere. We do not sell anything online. This will all
be sold through the visit."

- Removed: every price and MRP, the cart, the checkout page and the `order` lead kind, the
  `order_placed` event, the "Best Seller" ribbon and "Easy Returns / Fast Shipping" trust row,
  the "In stock · ships in 2–3 days" line, the Refund and Shipping policy pages, `offers` in
  the Product structured data, and the whole `policy` block in config.
- Product pages are information pages (name, tagline, photo, features, specs). Their primary
  action opens the visit form and sends the product name with the lead.
- Terms rewritten for a site that sells nothing online; the privacy website section no longer
  mentions checkout or a cart.
- `/products/checkout.html` now redirects permanently to `/#contact` (`vercel.json`).
  `/refund-policy.html` and `/shipping-policy.html` were never deployed, so they have no redirect.
- The plan bar shows "Your 2BHK plan · 6 rooms · N smart features" (distinct device types)
  instead of device-quantity and switch-plate totals.
- Do not add prices, a cart or "buy" wording back. Amounts are given only in the written quote.

## 1. What the site is

The Aerlyn marketing site, a room-by-room smart-home planner that produces leads, and
information pages for two retrofit switch modules. Nothing is sold on the site: products and
installation are sold through the free home visit. React 18 + Vite 6, no router library, no
backend, no login. Every route is prerendered to static HTML at build time and
hydrated in the browser. Hosted on Vercel as static files.

## 2. Routes

Defined in `src/routes.js`; pages in `src/pages/`; `<head>` per route in `src/seo/head.js`.

| Path | Page | Notes |
|---|---|---|
| `/` | Landing + planner | FAQ, lead forms, plan bar |
| `/products/retrofit-1-switch.html` | Product information | from `site.products`; "Book a free home visit" + "Plan your home" |
| `/products/retrofit-2-switch.html` | Product information | same |
| `/privacy-policy.html` | Privacy policy | app + website section |
| `/terms.html` | Terms and Conditions | text from `src/data/policies.js` |

**Play Store constraint:** `/privacy-policy.html`, `/products/retrofit-1-switch.html` and
`/products/retrofit-2-switch.html` are registered for Play Store verification. They must keep
emitting at exactly those paths (a test in `src/__tests__/routes.test.js` guards this). The
product paths come from each product's `slug` in config — do not rename the slugs.

Five pages in all; every one is indexable and in the sitemap. Unknown paths fall back to the
landing page on the client; there is no 404 page.

## 3. Build pipeline

`npm run build` runs four commands; the first three produce the site, the last checks it:

1. `vite build` — client bundle into `dist/`.
2. `vite build --ssr src/entry-server.jsx --outDir dist-ssr` — server bundle.
3. `node scripts/prerender.mjs` — renders every route into `dist/<path>` with its head tags
   and JSON-LD, and writes `sitemap.xml` and `robots.txt`.
4. `node scripts/check-dist.mjs` — fails the build if a page is missing or malformed (one
   `<h1>`, one `<main>`, canonical, description, parseable JSON-LD, images with alt and size,
   sitemap/robots up to date).

Other commands: `npm run dev` (no prerender — renders from an empty root), `npm test`
(Vitest, node environment, logic only), `npx vite preview` to serve `dist/`.

Hydration rule: nothing in a first render may differ between server and browser. The stored
plan is read in an effect after mount — see `HomeContext.jsx`.

`vercel.json`: `www.aerlyn.in` → `aerlyn.in` redirect, `/products/checkout.html` → `/#contact`
redirect, `/assets/*` cached immutably, HTML uncached.

## 4. Config — `src/config/site.js`

The single source for brand, seller, contact, form endpoints, claims and the product catalogue
(name, tagline, photo, features, specs — no prices). `null` means "not known"; UI and
structured data that depend on a null value do not render. Nothing in the site invents a value.

**The owner must fill or confirm, before launch:**

| Value | Now | Effect while unset |
|---|---|---|
| `phone` | `null` | no phone in footer / structured data |
| `whatsapp` | `null` | no WhatsApp link in footer; no WhatsApp fallback when a form fails |
| `gstin` | `null` | no GSTIN line (footer, policy pages, structured data) |
| `serviceArea` | `null` | no place named in the landing description / structured data |
| `legalName`, `address`, `email` | "Home Decor", Hisar address, a personal Gmail | confirm; a branded email is preferable |
| `formspree.visit` / `.plan` | both are the legacy id `mykokrdw` | replace each with its production form id |
| `heroStats` | 500+ homes, <1 day, 40% energy saved, ₹0 subscription | unverified marketing claims — confirm or remove. "₹0 — Subscription fee, ever" is the only rupee figure left on the site; it is a subscription claim, not a product price — keep or drop |

Other claims that live in component copy rather than config, also unverified: the FAQ
(`src/data/faq.js`, restates site claims only), "4–8 hours" installation and "certified
technicians" (`HowItWorks.jsx`), "65% less power" (`WhyAutomate.jsx`), the hero eyebrow
"India's Most Comprehensive Home Automation".

## 5. Policy pages — need legal review

`/terms.html` is a **first draft written from facts the site already states. It has not been
reviewed by a lawyer.** The same is true of section 11 ("This website") of the privacy policy.
The pages do not say so — this note is the record. Have them reviewed before launch.

What the Terms assert: seller identity from config (GSTIN once set); nothing is sold on the
website; the planner's suggestions are a starting point; a plan or quote is an estimate /
proposal and not a contract; the home visit is free with no obligation; products and
installation are sold only after a home visit and a written quote agreed with the customer;
the 1 Year product warranty from the product specs; governing law India. Nothing about
installation warranty is stated, because none is defined.

The privacy section states: what the two forms collect, Formspree as processor, the plan kept
in the visitor's browser storage, plan links carrying plan data only, Vercel Web Analytics,
Google Fonts, and deletion by email. Data retention for website submissions is not stated
because none is defined.

## 6. How leads flow

Both kinds go through `submitLead(kind, fields)` in `src/lib/submitLead.js`: a JSON POST to the
Formspree form for that kind, success only on a 2xx response, never throws, honeypot field
`_gotcha`. On failure the form keeps the visitor's data, offers retry, and offers a WhatsApp
fallback if `whatsapp` is configured. Formspree emails the submission to the business.

| Kind | Where | Fields |
|---|---|---|
| `visit` | "Book free visit" modal (`LeadModal.jsx`) on the landing page and on each product page; "Book a free home visit" after saving a plan | name, phone, city, property type, timeline, notes; from a product page also `Product` (the product name, repeated in the subject) |
| `plan` | "Save my plan & get a free quote" (`SavePlanModal.jsx`) | name, phone, city, plan link, full plan as JSON (full quantities and switch plan) |

## 7. Plans

- Stored in the browser under `localStorage` key `aerlyn_plan_v1` (`src/lib/planStorage.js`),
  written on every change, restored on load. The old cart key `aerlyn_cart` is no longer
  read or written; it is removed on the next visit to the landing page.
- **Plan link:** `https://aerlyn.in/#plan=<base64url>` — compact JSON of home type, rooms,
  devices, overrides, custom scenes and plate config. No name or phone. Decoding is
  size-limited and validated; a bad link shows a notice. A link that differs from the stored
  plan asks before replacing it.
- The uploaded floor-plan image stays in memory only; it is not stored and not sent.

## 8. Analytics

Vercel Web Analytics, loaded from `/_vercel/insights/script.js` in `index.html` (no
dependency). It 404s locally and until Web Analytics is enabled in Vercel — harmless.
Custom events via `src/lib/track.js`, never with personal data:

| Event | Fired | Props |
|---|---|---|
| `plan_started` | first home type picked | `homeType` |
| `plan_saved` | plan lead sent | `homeType` |
| `visit_booked` | visit lead sent | `source`: `contact`, `product` or `saved_plan` |

## 9. Accessibility conventions

- Every click target is a `<button type="button">` or `<a>`; focus styling is global
  (`src/styles/global.css`).
- Dialogs (lead modal, save modal, room drawer) use `useDialog(open, onClose)`
  from `src/lib/useDialog.js`: Escape closes, focus moves in, is trapped, and returns to the opener.
- No `window.confirm` / `alert`. Destructive actions use `features/shared/InlineConfirm.jsx`.
- PDF downloads load jsPDF on demand; `useDownload` (`src/lib/useDownload.js`) shows an
  inline message if that fails.

## 10. Known placeholders

- **Logo:** `assets/brand/aerlyn-logo.svg` is a raster image wrapped in an SVG, not a vector.
  The favicon and share image were generated from it. Replace with a real vector logo.
- **2-switch photo** reuses the 1-switch photo (`RETROFIT_IMAGE` in config).
- Both Formspree ids are the legacy form.

## 11. Deployment — owner steps

Today `aerlyn.in` serves a **legacy single-file page from Netlify, with a missing TLS
certificate**. None of this work is live until these are done:

1. Fill and confirm the config values in section 4; get the Terms and privacy pages reviewed (section 5).
2. Vercel project: add `aerlyn.in` and `www.aerlyn.in` as domains.
3. Vercel project: enable Web Analytics.
4. DNS: move `aerlyn.in` from Netlify to Vercel; confirm the certificate is issued; retire the Netlify site.
5. After go-live, check the three Play Store URLs load at their exact paths.
6. Google Search Console: verify the domain and submit `https://aerlyn.in/sitemap.xml`.
7. Smoke-test one submission of each lead kind (visit, plan) and confirm it arrives by email;
   check that `/products/checkout.html` redirects to `/#contact`.
8. Recommended: Google Business Profile.

## 12. Deliberately out of scope

Any online selling: prices, cart, checkout, payments (owner decision, 2026-10-13). Accounts or
a database. The room-workspace ("studio") redesign. Price estimates in the planner. Per-city
landing pages.

## 13. Not verified

- Lighthouse was not run (no CLI installed; not added as a dependency).
- The PDF-failure message is unit-tested but was not reproduced offline in a browser.
- Browser checks were at 500 px (the narrowest the Chrome window allows) plus 400 px and
  360 px iframes; not on a physical phone, and not with a screen reader.
- The May 2026 studio-redesign spec and plan were to be archived, but neither file exists in
  this repository or its history, so nothing was moved.

## 14. Environment

Node 26, npm. `npm run dev` → localhost:5173. Reference material in `assets/reference/` —
do not modify. Commit locally; push only on instruction.
