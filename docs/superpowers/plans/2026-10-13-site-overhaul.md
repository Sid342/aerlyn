# Aerlyn site overhaul — implementation plan

**Spec:** `docs/superpowers/specs/2026-10-13-site-overhaul-design.md`
**Branch:** `overhaul/site-cleanup-leadgen-seo` (commit locally per task; push only on instruction)
**Per-task gate:** `npm test` green + `npm run build` clean before commit.

## Phase 1 — Stop the leaks

- [x] **1.0 Dependencies.** `npm audit` reports 3 production advisories (1 critical), all reached through `jspdf` (`dompurify`, `fflate`). Upgrade `jspdf` to the current major; re-run PDF export tests; confirm `npm audit --omit=dev` is clean.
- [x] **1.1 Config.** `src/config/site.js` with brand, legal, contact, origin, Formspree IDs per form kind, claims, product catalogue. Replace hardcoded values in `SiteFooter`, `Hero`, `LeadModal`, `sendFormspree`.
- [x] **1.2 Validation.** `src/lib/validate.js` + tests (`normalisePhone`, name, pincode).
- [x] **1.3 submitLead.** `src/lib/submitLead.js` + tests (2xx, 4xx, network error, honeypot). Delete `sendFormspree.js`.
- [x] **1.4 Lead modal.** Use `submitLead` + `validate`; inline errors; retry on failure; honeypot; `type="tel"`.
- [x] **1.5 Reducer fixes.** `SET_FLOOR_PLAN` + `floorPlanImage`; per-device `edited` flag so size change keeps edited quantities; `plateConfig` in state; `HYDRATE` action. Tests for each.
- [x] **1.6 Persistence.** `src/lib/planStorage.js` (`savePlan`/`loadPlan`/`encodePlan`/`decodePlan`) + tests; wire into `HomeProvider`.
- [x] **1.7 UI bugs.** Room card open state follows mode; custom scenes in Play; Scene Builder + Touch Plate gated on home type; custom scenes list only present devices; scenes PDF uses device names.
- [x] **1.8 Plate link.** "Design this plate" on `SwitchPlanCard` presets the designer; designer config stored in home state; payload builder includes scenes + plate.

## Phase 2 — Save-my-plan CTA

- [x] **2.1 Plan totals.** `src/lib/planSummary.js` (rooms, devices, plates) + tests.
- [x] **2.2 Plan bar.** Sticky `PlanBar` with totals + "Save my plan & get a free quote".
- [x] **2.3 Save modal.** Form → `submitLead('plan')` → success view: copy link, send to my WhatsApp, download PDF, book free visit. Failure view keeps link + PDF, adds retry and WhatsApp fallback.
- [x] **2.4 Restore.** Read `#plan=` on load, inline confirm if a stored plan exists, "plan restored" notice.
- [x] **2.5 CTA cleanup.** Remove `ExportPanel` and JSON button; point hero/nav/why CTAs at planner; merge the duplicate footer; fix planner heading (single `<h1>` on page).

## Phase 3 — SEO

- [x] **3.1 Routes + pages.** `src/routes.js`; move product, checkout, privacy pages from `public/` into React pages using shared nav/footer/cart; cart prices from config; escaped output.
- [x] **3.2 Prerender.** `src/entry-server.jsx`, `scripts/prerender.mjs`, `build` script chain; client hydrates. Verify the three Play Store URLs resolve to the same paths.
- [x] **3.3 Head + structured data.** `src/seo/head.js` builds per-route title, description, canonical, OG/Twitter, JSON-LD (Organization/LocalBusiness, Product+Offer, FAQPage, BreadcrumbList). Test: every route file exists, one `<h1>`, canonical present, JSON-LD parses.
- [x] **3.4 FAQ section** on landing page (copy from existing claims only).
- [x] **3.5 Sitemap, robots, redirects, caching.** Generated `sitemap.xml`/`robots.txt`; `vercel.json`: `www`→apex, immutable `/assets/*`, uncached HTML.
- [x] **3.6 Assets + speed.** Favicon + share image from logo; product photo → WebP with dimensions; dynamic-import jsPDF; trim font weights.
- [ ] **3.7 Analytics.** Vercel Web Analytics script + four events.

## Phase 4 — Storefront and cleanup

- [x] **4.1 Checkout.** `submitLead('order')`, full validation, cart cleared only on success, retry on failure.
- [ ] **4.2 Policies.** Privacy policy website section; Terms, Refund, Shipping drafts; footer links.
- [ ] **4.3 Nav + footer.** "Products" in nav; footer from config.
- [ ] **4.4 Accessibility.** Buttons for all click targets; modal Escape + focus trap; inline confirms replace `window.confirm`.
- [ ] **4.5 Docs.** Rewrite `docs/HANDOFF.md`; archive May redesign spec/plan; README update.
- [ ] **4.6 Final verification.** Full test run, build, browser pass (plan → save → restore from link; add to cart → checkout; failure paths with network blocked), Lighthouse on prerendered output.

## After merge (owner)

Fill config values · add domain in Vercel + enable analytics · switch DNS from Netlify · review policy drafts · Search Console + Business Profile.
