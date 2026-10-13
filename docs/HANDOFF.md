# Handoff — Aerlyn website

**Updated:** 2026-10-13
**Repo:** https://github.com/Sid342/aerlyn
**Branch:** `overhaul/site-cleanup-leadgen-seo` (not pushed, not merged)
**Spec / plan:** `docs/superpowers/specs/2026-10-13-site-overhaul-design.md`, `docs/superpowers/plans/2026-10-13-site-overhaul.md`

## 1. What the site is

The Aerlyn marketing site, a room-by-room smart-home planner that produces leads, and a small
storefront for two retrofit switch modules. React 18 + Vite 6, no router library, no backend,
no login, no online payment. Every route is prerendered to static HTML at build time and
hydrated in the browser. Hosted on Vercel as static files.

## 2. Routes

Defined in `src/routes.js`; pages in `src/pages/`; `<head>` per route in `src/seo/head.js`.

| Path | Page | Notes |
|---|---|---|
| `/` | Landing + planner | FAQ, lead forms, plan bar |
| `/products/retrofit-1-switch.html` | Product | from `site.products` |
| `/products/retrofit-2-switch.html` | Product | from `site.products` |
| `/products/checkout.html` | Checkout | `noindex`, not in the sitemap |
| `/privacy-policy.html` | Privacy policy | app + website section |
| `/terms.html` | Terms and Conditions | text from `src/data/policies.js` |
| `/refund-policy.html` | Refund and Return Policy | same |
| `/shipping-policy.html` | Shipping Policy | same |

**Play Store constraint:** `/privacy-policy.html`, `/products/retrofit-1-switch.html` and
`/products/retrofit-2-switch.html` are registered for Play Store verification. They must keep
emitting at exactly those paths (a test in `src/__tests__/routes.test.js` guards this). The
product paths come from each product's `slug` in config — do not rename the slugs.

Unknown paths fall back to the landing page on the client; there is no 404 page.

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

Hydration rule: nothing in a first render may differ between server and browser. Stored
state (plan, cart) is read in an effect after mount — see `HomeContext.jsx`, `CartContext.jsx`.

`vercel.json`: `www.aerlyn.in` → `aerlyn.in` redirect, `/assets/*` cached immutably, HTML uncached.

## 4. Config — `src/config/site.js`

The single source for brand, seller, contact, form endpoints, claims, policy commitments and
the product catalogue. `null` means "not known"; UI and structured data that depend on a null
value do not render, and policy pages fall back to "confirmed with you before your order is
finalised". Nothing in the site invents a value.

**The owner must fill or confirm, before launch:**

| Value | Now | Effect while unset |
|---|---|---|
| `phone` | `null` | no phone in footer / structured data |
| `whatsapp` | `null` | no WhatsApp link in footer; no WhatsApp fallback when a form fails |
| `gstin` | `null` | no GSTIN line (footer, policy pages, structured data) |
| `serviceArea` | `null` | no place named in the landing description / structured data |
| `legalName`, `address`, `email` | "Home Decor", Hisar address, a personal Gmail | confirm; a branded email is preferable |
| `products[1].price` / `mrp` (2-switch) | ₹2,300 / ₹3,286 — **same as the 1-switch** | confirm the real 2-switch price |
| `formspree.visit` / `.plan` / `.order` | all three are the legacy id `mykokrdw` | replace each with its production form id |
| `heroStats` | 500+ homes, <1 day, 40% energy saved, ₹0 subscription | unverified marketing claims — confirm or remove |
| `products[].badges` | ribbon "Best Seller"; trust row "1-Year Warranty / Easy Returns / Fast Shipping" | unverified — confirm, edit, or empty to hide |
| `policy.dispatchText` | "In stock · ships in 2–3 days" | confirm; `null` hides it and the policies say dispatch is confirmed before the order |
| `policy.returnWindowDays` | `null` | refund policy says the window is confirmed before the order |
| `policy.returnShippingPaidBy` | `null` (`'customer'` or `'seller'`) | same |
| `policy.refundDays` | `null` (working days) | same |
| `policy.shippingFee` | `null` (rupees per order; `0` = free) | shipping policy says charges are confirmed before the order |
| `policy.serviceableLocations` | `null` | shipping policy says deliverability is confirmed before the order |
| `policy.installationWarranty` | `null` | terms say installation warranty is confirmed before the order |

Note that "Easy Returns" and "Fast Shipping" badges are shown while the return window and
delivery terms are still unset — set the `policy.*` values or drop the badges.

Other claims that live in component copy rather than config, also unverified: the FAQ
(`src/data/faq.js`, restates site claims only), "4–8 hours" installation and "certified
technicians" (`HowItWorks.jsx`), "65% less power" (`WhyAutomate.jsx`), the hero eyebrow
"India's Most Comprehensive Home Automation".

## 5. Policy pages — need legal review

`/terms.html`, `/refund-policy.html` and `/shipping-policy.html` are **first drafts written
from facts the site already states. They have not been reviewed by a lawyer.** The same is
true of section 11 ("This website") added to the privacy policy. The pages do not say so —
this note is the record. Have them reviewed before launch.

What they assert: seller identity from config; products and prices as listed; no payment is
taken on the site and the order is finalised on confirmation; the dispatch line and the
1 Year warranty from the product pages; the free, no-obligation home visit; governing law
India. Sentences for unset `policy.*` values are produced by helpers in
`src/data/policies.js` (tested for both null and set values).

The privacy section states: what the three forms collect, Formspree as processor, plan and
cart kept in the visitor's browser storage, plan links carrying plan data only, Vercel Web
Analytics, Google Fonts, and deletion by email. Data retention for website submissions is
not stated because none is defined.

## 6. How leads flow

All three go through `submitLead(kind, fields)` in `src/lib/submitLead.js`: a JSON POST to the
Formspree form for that kind, success only on a 2xx response, never throws, honeypot field
`_gotcha`. On failure the form keeps the visitor's data, offers retry, and offers a WhatsApp
fallback if `whatsapp` is configured. Formspree emails the submission to the business.

| Kind | Where | Fields |
|---|---|---|
| `visit` | "Book free visit" modal (`LeadModal.jsx`); "Book a free home visit" after saving a plan | name, phone, city, property type, timeline, notes |
| `plan` | "Save my plan & get a free quote" (`SavePlanModal.jsx`) | name, phone, city, plan link, full plan as JSON |
| `order` | Checkout (`CheckoutPage.jsx`) | order id `AER-YYYYMMDDHHMMSS`, name, phone, email, address, items, total |

The cart is cleared only after an order is sent successfully. Prices are always looked up
from config by product id, never read from storage.

## 7. Plans

- Stored in the browser under `localStorage` key `aerlyn_plan_v1` (`src/lib/planStorage.js`),
  written on every change, restored on load. The cart uses `aerlyn_cart`.
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
| `visit_booked` | visit lead sent | `source`: `contact` or `saved_plan` |
| `order_placed` | order lead sent | `items`, `total` |

## 9. Accessibility conventions

- Every click target is a `<button type="button">` or `<a>`; focus styling is global
  (`src/styles/global.css`).
- Dialogs (lead modal, save modal, room drawer, cart drawer) use `useDialog(open, onClose)`
  from `src/lib/useDialog.js`: Escape closes, focus moves in, is trapped, and returns to the opener.
- No `window.confirm` / `alert`. Destructive actions use `features/shared/InlineConfirm.jsx`.
- PDF downloads load jsPDF on demand; `useDownload` (`src/lib/useDownload.js`) shows an
  inline message if that fails.

## 10. Known placeholders

- **Logo:** `assets/brand/aerlyn-logo.svg` is a raster image wrapped in an SVG, not a vector.
  The favicon and share image were generated from it. Replace with a real vector logo.
- **2-switch photo** reuses the 1-switch photo (`RETROFIT_IMAGE` in config).
- **2-switch price** equals the 1-switch price (see section 4).
- All three Formspree ids are the legacy form.

## 11. Deployment — owner steps

Today `aerlyn.in` serves a **legacy single-file page from Netlify, with a missing TLS
certificate**. None of this work is live until these are done:

1. Fill and confirm the config values in section 4; get the policy pages reviewed (section 5).
2. Vercel project: add `aerlyn.in` and `www.aerlyn.in` as domains.
3. Vercel project: enable Web Analytics.
4. DNS: move `aerlyn.in` from Netlify to Vercel; confirm the certificate is issued; retire the Netlify site.
5. After go-live, check the three Play Store URLs load at their exact paths.
6. Google Search Console: verify the domain and submit `https://aerlyn.in/sitemap.xml`.
7. Smoke-test one submission of each lead kind and confirm it arrives by email.
8. Recommended: Google Business Profile.

## 12. Deliberately out of scope

Online payments. Accounts or a database. The room-workspace ("studio") redesign. Price
estimates in the planner (no price list exists). Per-city landing pages.

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
