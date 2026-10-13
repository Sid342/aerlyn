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
| `/products/retrofit-1-switch.html` | Product information | from `site.products`; "Book an appointment" + "Plan your home" |
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
| `visit` | "Book an appointment" modal (`LeadModal.jsx`) on the landing page and on each product page; "Book an appointment" after saving a plan | name, phone, city, property type, timeline, notes; from a product page also `Product` (the product name, repeated in the subject) |
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

## 7a. Touch plate designer

Lives below the planner on the landing page (`src/features/touchPlate/`); opened for a room by
"Design this plate" on its switch-plan card, which presets the plate size, puts the room's name
in the heading and the PDF, and moves the designer to the first step still to do.

It is a **port of the configurator at https://touch.feturtles.com** (the "reference"): same
steps, options, rules and plate drawing, in Aerlyn's own chrome and without anything to do with
selling.

**Copied from the reference — the owner must confirm the right to use these:**

- **The plate stylesheet rules** in `src/features/touchPlate/reference.css` were copied from
  touch.feturtles.com (`/static/css/main.251d01ce.css`), each selector prefixed with `.tpd-ref`
  so nothing leaks into the rest of the site, together with the images those rules point at
  (`src/features/touchPlate/media/`: the dimmer dots, the 10 A socket, the Snap On button mark;
  the `-dark` files are recoloured copies for light panels. `socket-16a.png` and `curtain.png`
  are still named by reference.css but are overridden and no longer drawn — see below).
- **The 209 icon files** in `public/plate-icons/` were copied from touch.feturtles.com
  (`/assets/<Category>/…svg`), renamed to URL-safe names. Each file's `viewBox` was then squared
  onto its artwork (the originals leave up to two thirds of the box empty and off-centre) so an
  icon fills the box it is drawn in; the artwork itself is untouched.
- **The catalogue** — models, materials, sizes, colours, every accessory with its node structure
  and CSS classes (`src/data/plateCatalogue.js`), the Snap On plates in millimetres
  (`src/data/plateSnapOn.js`) and the icon list (`src/data/plateIconLibrary.js`) — was taken
  from the reference's JavaScript (its source map).

How it is built:

- **Config** (`src/lib/plateConfig.js`, pure and tested) is catalogue ids only:
  `{ model, material, size, accessory, icons, panel, frame, remote }`. One accessory per plate,
  as in the reference. `icons` maps a switch key to an icon id: `'<panel>.<node>.<sub-node>'`
  (panel 1 = upper, 2 = lower on 12 module plates) or `'s<element index>'` on Snap On plates.
  Nodes the reference flags `noIcon` (dimmer, sockets, the curtain graphic) get no key.
  Switches are numbered in reading order for people ("Switch 3"), whatever their key.
- **Rules ported:** steps Model → Material → Size → Accessories → Icons → Panel → Frame →
  Summary; the Frame step and frame colour exist only for Full Glass Touch; Touch Plus has no
  border, its own colours (Black / White / Gray) and only the accessories flagged for it; Snap On
  has its own plates (none in 12 module); Next is blocked until a model, material and size are
  chosen; a new size clears the accessory and icons; a second accessory is refused until the
  first is removed with the bin under the plate (Snap On plates swap directly); logo upload with
  four positions and the remote option sit on the last step; Reset selection clears everything.
- **Drawing:** `Plate.jsx` renders the reference's markup and class names, so reference.css
  draws it; the plate is laid out at the reference's full size and scaled as one piece
  (`transform: scale`) to at most the reference's 75 %, less when the column is narrower.
  Measured against the live reference element by element (see §13).
- **`TouchPlateDesigner.css`** holds Aerlyn's chrome and, in its last block, everything the port
  adds to or changes in the drawing. Deliberate differences from the reference:
  - A placed icon fills the ring it replaces (the reference draws it at about a third of the
    ring) and stays on its switch when you move between steps (the reference loses it on Back).
  - Light panels (Space Grey, Titanium, White) get dark outlines, graphics and icons; the
    reference draws them white on white. Gray keeps the reference's white and blue.
  - 12 module plates: the reference has no rule for `.scene12`, so there twenty rings run down
    one column and off the plate. Here the upper and lower panel each take half the plate.
  - The reference's two curtain buttons have no size and cannot be seen or used; here they are
    rings like the switches.
  - **Accessories that no longer follow the reference's positions** (`isRelaid` in
    `plateConfig.js` puts `.tpd-relaid` on their panel; the rules are in the "misplaces" block of
    `TouchPlateDesigner.css`). The reference pushes every socket 16 mm to the right of its column
    and gives it no room of its own, which on these plates put it on top of switches or another
    socket, or across the panel outline:
    - every 8 module accessory with a socket (7 Full Glass, of which 2 are also Touch Plus);
    - every 12 module accessory with a socket (8 Full Glass "…2 Socket", 2 Touch Plus "…3 Socket");
    - 6 module "2 Switch 2 Socket", "4 Switch 2 Socket" and "6 Switch 1 Socket 1 Curtain".
    There the socket stands in the row as a column of its own, 10 mm clear of its neighbours, and
    the row is centred in the panel (the reference keeps 6 module rows to the left; these three
    are centred). 8 module plates with seven columns use a 22 mm column pitch instead of 24.8 mm,
    or they would not fit. Ring sizes, strokes and the switch/fan/curtain columns are the
    reference's. Everything else — all 2 and 4 module plates, the other 6, 8 and 12 module
    plates, Snap On — is still drawn by the reference's rules, untouched.
  - The curtain graphic of "6 Switch 1 Socket 1 Curtain" (two small blue pictures in the
    reference) is two rings, like the curtain buttons of the other accessories; it still takes
    no icon. "Socket 16A" (a picture of filled, overlapping blobs in the reference) is three
    outlined circles like the 10 A socket, with larger pads and wider spacing
    (`media/socket-16a.svg`); it sits where "Socket 10A" does.
  - The 10 A socket drawing has 0.4 mm of clear space around its pads and its box is that much
    larger: the pads are where they were and as large, but their strokes are no longer cut at
    the box edge. This is the only change to plates that are otherwise untouched.
  - Back and Next are one row under the stepper, beside the step title, rendered once by
    `TouchPlateDesigner` (`.tpd-bar`): they are in the same place on every step and never move
    with the height of a step. The "Choose a model to continue." hint appears to their left. The
    last step has no Next; an empty slot keeps Back where it was. Under 600 px the title takes
    its own line and the buttons sit below it. (The reference has them under the step.)
  - No cart, prices, quantity, admin view, laser/DXF export or user icon. The last step is
    "Summary": the plate, its specification, PDF and PNG download.
- **Checking the plate layouts:** `scripts/plate-layout-check.js` runs in the browser, not in
  the build. `npm run build`, copy it into `dist/`, `npx vite preview`, open the page, pick a
  home type so the designer shows, then in the console
  `await import('/plate-layout-check.js'); await plateCheck.run()`. It places every accessory
  of every model and size through the UI (removing the last one with the bin first) and fails a
  plate when a control is under 4 px from the panel outline or two controls are under 1 px
  apart. `plateCheck.sheet('Full Glass Touch', 12)` shows every plate of a size on one screen —
  look at it, the numbers do not judge balance. `plateCheck.places()` / `plateCheck.moved()`
  compare two builds control by control. Last run: 88 plates, 0 failing (20 before the fix).
- **Icons step:** native HTML5 drag-and-drop from the library onto one switch, or pick a switch
  (click, or Tab + Enter) and then an icon (click, or arrow keys + Enter); Delete/Backspace on a
  switch or "Remove icon" clears it. The library tiles are not `<button>`s — browsers will not
  start a drag from one.
- **Persistence:** the config is in home state, saved to localStorage and packed into `#plan=`
  links as `['p3', model, material, size, accessory, panel, frame, remote, icons]`.
  `cleanPlateConfig` runs on everything that comes in: unknown ids are dropped one by one, and
  the two older shapes (emoji icons; home-made icon ids) load with their size, colour and — when
  it was a single accessory the catalogue still has — accessory, without icons. The step is kept
  in sessionStorage so a reload stays where it was. **The uploaded logo is component state only:
  never stored, never in a link, never in a lead.** (It is on the plate in a PDF or PNG the visitor downloads.)
- **Lead payload:** `plate` is `describePlate()` plus the room: `{ room, model, material, size,
  panel, frame, remote, accessories: [{ name, modules: 'Modules 1–7', icons: ['Switch 3: Fan F7'] }] }`.
- **PDF / PNG** (`src/lib/exportPlatePdf.js`): the plate element itself is rasterised with
  html2canvas at 3× (loaded with `import()` on click, like jsPDF). html2canvas ignores
  `object-fit` and CSS filters, so icons and the logo are first redrawn onto canvases
  (`fitted`). Text passes through `pdfSafe` — Helvetica only encodes WinAnsi.

**Open questions for the owner:**

- Confirm the right to use the copied stylesheet rules, graphics, icon files and catalogue
  (above). If the icons cannot be used, `plateIconLibrary.js` + `public/plate-icons/` are the
  only things to replace.
- Icon names are the reference's file names ("Fan F7", "Home Appliances 18"). They appear in
  the summary, the lead and the PDF. Real names would need someone to name 209 icons.
- Snap On: the reference skips the Frame step going forward but shows it on the way back and in
  the stepper. Ported as "no Frame step, default silver border". Confirm.
- Model, material and remote are recorded but change nothing in the drawing (same in the
  reference). Should Acrylic or Snap On look different?
- Several reference layouts overlap or run past the inner outline (e.g. 8 module "4 Switch
  2 Fan 1 Socket", 6 module "… 1 Socket 1 Curtain"). They are ported as they are.

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
- Plate designer (branch `feat/plate-designer-preview`): compared with the live reference in
  Chrome at 1500 px by measuring every plate element's box on both sites — identical for 2
  module "2 Switch", 4 module "2 Switch 1 Fan", 6 module "10 Switch" and "… 1 Curtain", 8 module
  "8 Switch 1 Socket", Touch Plus and Snap On 4 module plates, panel/frame colours and the logo
  in two corners. Checked in 360 / 414 / 768 / 1200 / 1667 px iframes on all eight steps (no
  horizontal scroll, plate scaled inside its stage), real mouse drag-and-drop, a keyboard-only
  run through every step, and PDFs for an 8- and a 12-module plate were generated and read.
  Not checked: real browser zoom (only CSS zoom 90 % / 125 % and the equivalent viewport
  widths), a physical phone, touch input, a screen reader, Safari/Firefox, or a printed PDF.
- The PDF-failure message is unit-tested but was not reproduced offline in a browser.
- Browser checks were at 500 px (the narrowest the Chrome window allows) plus 400 px and
  360 px iframes; not on a physical phone, and not with a screen reader.
- The May 2026 studio-redesign spec and plan were to be archived, but neither file exists in
  this repository or its history, so nothing was moved.

## 14. Environment

Node 26, npm. `npm run dev` → localhost:5173. Reference material in `assets/reference/` —
do not modify. Commit locally; push only on instruction.
