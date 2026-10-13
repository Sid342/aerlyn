# Aerlyn site overhaul — design

**Date:** 2026-10-13
**Branch:** `overhaul/site-cleanup-leadgen-seo`
**Source:** code audit of `main` @ `b0ccbe5` (33 gaps) + owner decisions below.

## Decisions (owner-approved)

| Topic | Decision |
|---|---|
| Save-my-plan | Phone-gated save link. No backend, no login. |
| SEO depth | Keep React + Vite; prerender every route to static HTML at build. |
| Studio Redesign (May spec) | Not built. Fix the current stacked layout instead. |
| Business details | One config file with current values; owner fills real values before launch. Nothing invented. |

## Goals

1. No lead or order is ever silently lost.
2. A customer can save what they built and come back to it; saving produces a lead.
3. Every page is crawlable static HTML with correct metadata and structured data.
4. One source of truth for brand, contact, products, and form endpoints.

## Non-goals

Payment gateway. Accounts or a database. The room-workspace redesign. Per-city landing pages. Price estimates in the planner (no price list exists).

## Hard constraints

- These URLs are registered for Play Store verification and must keep working unchanged:
  `/privacy-policy.html`, `/products/retrofit-1-switch.html`, `/products/retrofit-2-switch.html`.
- No new runtime dependencies. Build-time code uses what is installed (Vite, React, `react-dom/server`).
- Static hosting only (Vercel).

## Architecture

### Single config — `src/config/site.js`

Holds: brand name, legal seller name, address, email, phone, WhatsApp number, service area, canonical origin (`https://aerlyn.in`), Formspree form IDs, marketing claims (hero stats), and the product catalogue (`id`, `slug`, `name`, `price`, `mrp`, `image`, specs). Every page and every form reads from it. Values that are unknown today (`phone`, `whatsapp`, `gstin`) are `null`; UI that depends on a `null` value does not render.

### Routes — one app, prerendered

A plain path→page map in `src/routes.js` (no router library):

| Path | Page |
|---|---|
| `/` | Landing + planner |
| `/products/retrofit-1-switch.html`, `/products/retrofit-2-switch.html` | Product page (one template, data from config) |
| `/products/checkout.html` | Checkout |
| `/privacy-policy.html` | Privacy policy (app + website) |
| `/terms.html`, `/refund-policy.html`, `/shipping-policy.html` | New policy pages |

`scripts/prerender.mjs` runs after `vite build`: it loads the SSR bundle (`vite build --ssr src/entry-server.jsx`), renders each route with `renderToString`, and writes `dist/<path>` with that route's `<title>`, description, canonical, Open Graph/Twitter tags and JSON-LD injected into `<head>`. It also writes `sitemap.xml` and `robots.txt`. The client entry hydrates and picks the page from `location.pathname`.

The hand-copied static pages in `public/` are deleted; their content moves into React pages that share `SiteNav`, `SiteFooter`, and the cart.

### Lead submission — `src/lib/submitLead.js`

One function used by every form (lead modal, save-plan, checkout).

- Posts JSON to the Formspree ID for that form kind (`visit`, `plan`, `order`).
- Returns `{ ok: true }` only on a 2xx response; otherwise `{ ok: false }`. Never throws.
- Includes a hidden honeypot field; if filled, returns `{ ok: true }` without sending.
- On failure the UI keeps the user's data, shows a retry, and offers a WhatsApp fallback (prefilled message to the business number) when `whatsapp` is configured.

Checkout no longer shows success on failure and no longer clears the cart until the send succeeds.

### Validation — `src/lib/validate.js`

`normalisePhone(raw)` strips spaces, dashes, `+91`/`0` prefix and accepts `^[6-9]\d{9}$`. Name required. Pincode `^\d{6}$`. Inline error text under the field; no `alert()`.

### Persistence — `src/lib/planStorage.js`

- `savePlan(home)` / `loadPlan()` — versioned `localStorage` key `aerlyn_plan_v1`; written on every reducer change, restored on load. Corrupt or unknown-version data is ignored.
- `encodePlan(home)` / `decodePlan(str)` — compact JSON (rooms, devices `[id, qty]`, overrides, custom scenes, plate config) as base64url, carried in `/#plan=…`. A link overrides stored state after an in-page confirm.

## Phase 1 — Stop the leaks

| Audit # | Change |
|---|---|
| A1, A2 | All forms go through `submitLead`; success only on 2xx. |
| A3 | Formspree IDs in config, one per form kind. |
| A4, A5 | Name + phone validation on every form; `type="tel"`. |
| A6 | Planner state persisted and restored. |
| A7 | Honeypot on every form. |
| B8 | `SET_FLOOR_PLAN` action + `floorPlanImage` state. Image stays in memory only (not persisted, not sent). |
| B9 | Room card open state resets when mode changes. |
| B10 | Play mode lists custom scenes after presets. |
| B11 | Lead payload includes custom scenes and plate config. |
| B12 | Each room's switch plan gets "Design this plate", opening the designer preset to the recommended size. |
| B13 | Scenes PDF prints device names. |
| B14 | Size change only re-seeds quantities the user has not edited. |
| B15 | Scene Builder and Touch Plate render only after a home type is picked; custom scenes list only devices present in the home. |

## Phase 2 — Save-my-plan CTA

**Plan bar.** Once a home type is picked, a sticky bar shows live totals — rooms, devices, switch plates — and one button: **Save my plan & get a free quote**.

**Save modal.** Name, phone, city (optional), a consent line linking to the privacy policy. On submit the full plan goes through `submitLead('plan')`.

**After save.** The modal switches to:
- the plan link with **Copy link**;
- **Send to my WhatsApp** (`wa.me/?text=` with the link, so they can forward it to themselves or family);
- **Download PDF**;
- **Book a free home visit** — sends a second, short `visit` lead reusing the saved name and phone.

If the send fails, the customer still gets their link and PDF, plus retry and the WhatsApp fallback.

**Returning.** Opening a plan link or returning on the same browser restores the plan and shows "Welcome back — your plan is restored."

**CTA cleanup.** Hero, nav, and the "why" block all point to the planner. The bottom contact section keeps the simpler "Book free visit" form. `ExportPanel` is removed; its PDF download lives in the save flow. The JSON download button is removed (the payload builder stays — it feeds the lead).

## Phase 3 — SEO

- **Crawlable HTML** for every route via prerender.
- **Per-route head:** title, description, canonical, `og:*`, `twitter:*`, `lang="en-IN"`.
- **Structured data:** `Organization`/`LocalBusiness` (from config; fields that are `null` are omitted), `Product` + `Offer` on product pages, `FAQPage` for a new FAQ section, `BreadcrumbList` on product and policy pages.
- **FAQ section** on the landing page answering real pre-sale questions (wiring changes, installation time, works without internet, warranty, voice assistants). Copy drafted from existing page claims only.
- **Semantics:** one `<h1>` per page, one footer, `<main>`/`<nav>` landmarks, descriptive `alt` text, real `<button>`/`<a>` for every click target.
- **Sitemap + robots** generated from the route map.
- **Canonical host:** `aerlyn.in`; `www` redirects to apex in `vercel.json`.
- **Assets:** favicon and 1200×630 share image from the existing Aerlyn logo; product photo converted to WebP with explicit dimensions.
- **Speed:** jsPDF loaded on demand; hashed `/assets/*` cached immutably, HTML uncached; fonts trimmed to used weights with `display=swap`.
- **Analytics:** Vercel Web Analytics script (no dependency). Events for plan started, plan saved, visit booked, order placed. Needs enabling in the Vercel dashboard.

Ranking cannot be guaranteed by on-page work. Owner actions that matter as much: Google Search Console verification + sitemap submission, Google Business Profile, reviews.

## Phase 4 — Storefront and cleanup

- Product pages render from the catalogue; "Products" added to the nav; cart is one shared module, escaped output, prices looked up from config by product id (never trusted from `localStorage`).
- Privacy policy extended with a website section (enquiry, plan, and order data; Formspree as processor; browser storage). New Terms, Refund, and Shipping pages — **drafts for owner/legal review**, marked as such in the handoff, not in the page.
- Footer shows brand, legal name, address, and whichever contact fields are configured.
- Modals: Escape closes, focus is trapped and restored. `window.confirm` replaced by inline confirm.
- `docs/HANDOFF.md` rewritten for the new structure; May redesign spec/plan moved to `docs/superpowers/archive/`.

## Testing

Vitest, existing style. New unit tests: `submitLead` (2xx, 4xx, network error, honeypot), `validate`, `planStorage` (round-trip, corrupt input, version mismatch), reducer cases added in Phase 1, prerender output (each route file exists, has one `<h1>`, a canonical, and parseable JSON-LD). Final check per phase: `npm test`, `npm run build`, and a browser pass over the save flow and checkout.

## Owner actions (cannot be done from code)

1. Fill `src/config/site.js`: phone, WhatsApp, branded email, legal name, GSTIN, 2-switch price, production Formspree IDs, confirm hero claims.
2. Vercel: add `aerlyn.in` + `www.aerlyn.in` to the project; enable Web Analytics.
3. DNS: point `aerlyn.in` at Vercel; retire the Netlify site.
4. Review the three new policy drafts.
5. Search Console + Business Profile.

## Addendum — 2026-10-13: online selling removed

**Decision (owner):** "Remove pricing from everywhere. We do not sell anything online. This will
all be sold through the visit." Separately: the plan bar's device count ("100 devices" for a
default 2BHK) puts customers off and must change.

This addendum supersedes the following parts of the spec above; the original text is left as
written for the record.

- **Routes:** `/products/checkout.html`, `/refund-policy.html` and `/shipping-policy.html` no
  longer exist. The site is five pages: landing, two product pages, privacy, terms.
  `/products/checkout.html` redirects permanently to `/#contact`.
- **Lead submission:** the form kinds are `visit` and `plan` only. There is no `order` kind, no
  checkout form and no cart, so the "no order is silently lost" and "cart is cleared only after
  a successful send" requirements no longer apply.
- **Config:** no `price` / `mrp`, no sales badges, no `policy` block. The owner action "2-switch
  price" is void.
- **Product pages:** information pages, not a storefront. Actions are "Book a free home visit"
  (visit lead carrying the product name) and "Plan your home". Product structured data has no
  `offers`.
- **Policies:** only Terms and Privacy remain. Terms are rewritten for a site that sells nothing
  online; the privacy website section drops the checkout / order / cart text. "Review the three
  new policy drafts" becomes "review the Terms and the privacy website section".
- **Analytics:** the order event is removed; `visit_booked` gains `source: product`.
- **Plan bar:** shows home type, room count and the number of distinct device types ("smart
  features") instead of total device quantity and switch-plate count. The lead and the PDF
  still carry full quantities and the switch plan.
- **Out of scope** now also covers any price, cart or checkout on the site, not only a payment
  gateway.
