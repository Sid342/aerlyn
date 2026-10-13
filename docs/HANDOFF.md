# Handoff — Aerlyn website

**Updated:** 2026-10-14
**Repo:** https://github.com/Sid342/aerlyn
**Branch:** `redesign/simple-guided` (not pushed, not merged)
**Spec:** `docs/superpowers/specs/2026-10-14-simple-guided-site-design.md` (its addendum overrides section 2). Earlier: `docs/superpowers/specs/2026-10-13-site-overhaul-design.md`.

## Change log — 2026-10-14: simpler, guided site

Owner: "too wordy and too difficult to use", "looks too AI in terms of the text", "even planning
is very long and tedious".

- **Two actions, two wordings, everywhere:** "Plan my home" and "Book an appointment". Do not add a
  third wording for either.
- **Header on every page:** logo, Plan my home, How it works, Products, FAQ, and a "Book an
  appointment" button. On phones the links are in the menu and one bar at the bottom of the screen
  carries the next step (`features/savePlan/StickyAction.jsx`): "Plan my home" until a plan exists,
  then "Book an appointment". There is no other bottom bar; wider screens have none.
- **Home page:** hero, planner, "What it does for you", "How it works", "Aerlyn so far", FAQ,
  appointment. About 410 words. `WhyAutomate` and `DayInLife` are deleted.
- **Copy rules** (spec section 3) are enforced for the home page by the build: `src/lib/copyCheck.js`
  runs from `scripts/check-dist.mjs` over `dist/index.html` and fails on more than 500 words before
  interaction, more than 6 long dashes, a banned phrase or an emoji.
- **One-tap planner:** "What's your home?" with four tiles; a tap shows the plan below (section 7).
- **One appointment form** (`LeadModal.jsx`): name and phone, city and a note optional.
- **Plate designer** moved to its own page, `/plate-designer.html`. The custom scene builder is
  under Customise. The Build/Play toggle, the floor-plan upload and the room drawer are gone.
- Device display names are plain words and there are no emoji icons (`src/data/devices.js`; ids
  unchanged). Dropped until the owner confirms them: "certified technicians", "65% less power",
  "India's Most Comprehensive", "4–8 hours".

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
- `/products/checkout.html` now redirects permanently to `/#contact` (`public/_redirects`).
  `/refund-policy.html` and `/shipping-policy.html` were never deployed, so they have no redirect.
- (The plan bar this change introduced was removed on 2026-10-14; see above.)
- Do not add prices, a cart or "buy" wording back. Amounts are given only in the written quote.

## 1. What the site is

The Aerlyn marketing site, a room-by-room smart-home planner that produces leads, and
information pages for two retrofit switch modules. Nothing is sold on the site: products and
installation are sold through the free home visit. React 18 + Vite 6, no router library, no
backend, no login. Every route is prerendered to static HTML at build time and
hydrated in the browser. Hosted on Netlify as static files.

## 2. Routes

Defined in `src/routes.js`; pages in `src/pages/`; `<head>` per route in `src/seo/head.js`.

| Path | Page | Notes |
|---|---|---|
| `/` | Home + planner | FAQ, appointment form |
| `/plate-designer.html` | Switch plate designer | optional; `?room=<position>` opens it for a room of the plan |
| `/products/retrofit-1-switch.html` | Product information | from `site.products`; "Book an appointment" + "Plan my home" |
| `/products/retrofit-2-switch.html` | Product information | same |
| `/privacy-policy.html` | Privacy policy | app + website section |
| `/terms.html` | Terms and Conditions | text from `src/data/policies.js` |

**Play Store constraint:** `/privacy-policy.html`, `/products/retrofit-1-switch.html` and
`/products/retrofit-2-switch.html` are registered for Play Store verification. They must keep
emitting at exactly those paths (a test in `src/__tests__/routes.test.js` guards this). The
product paths come from each product's `slug` in config — do not rename the slugs.

Six pages in all; every one is indexable and in the sitemap. Unknown paths fall back to the
landing page on the client; there is no 404 page. Every page is wrapped in `HomeProvider`
(`App.jsx`), because the header button and the bottom bar depend on whether a plan exists.

Paths also resolve without `.html` and with a trailing slash (`matchRoute`). The prerender stamps
each page's root with `data-path`; `main.jsx` hydrates only when that matches the address, and
renders from scratch otherwise (a host that answers an unknown address with the home page's HTML
would cause a hydration mismatch).

## 3. Build pipeline

`npm run build` runs four commands; the first three produce the site, the last checks it:

1. `vite build` — client bundle into `dist/`.
2. `vite build --ssr src/entry-server.jsx --outDir dist-ssr` — server bundle.
3. `node scripts/prerender.mjs` — renders every route into `dist/<path>` with its head tags
   and JSON-LD, and writes `sitemap.xml` and `robots.txt`.
4. `node scripts/check-dist.mjs` — fails the build if a page is missing or malformed (one
   `<h1>`, one `<main>`, canonical, description, parseable JSON-LD, images with alt and size,
   sitemap/robots up to date), or if the home page copy breaks its limits (`src/lib/copyCheck.js`).

Other commands: `npm run dev` (no prerender — renders from an empty root), `npm test`
(Vitest, node environment, logic only), `npx vite preview` to serve `dist/`.

Hydration rule: nothing in a first render may differ between server and browser. The stored
plan is read in an effect after mount — see `HomeContext.jsx`.

Netlify: `netlify.toml` holds the build command and publish dir; `public/_redirects` has
`/products/checkout.html` → `/#contact`; `public/_headers` caches `/assets/*` immutably (HTML
uses Netlify's default revalidation). Both files are copied into `dist/`, so drag-and-drop deploys
of `dist` work too. The www → apex redirect is Netlify's own domain-alias behaviour.

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
| `heroStats` | 500+ homes, <1 day, 40% energy saved, ₹0 subscription | owner approved (2026-10-14); shown in "Aerlyn so far". "₹0 Subscription fee" is the only rupee figure on the site; it is a subscription claim, not a product price |
| `photos` | `[]` | install photos `{ src, width, height, alt }`; no photo block while empty |
| `brands` | `[]` | brand names fitted; no "We fit …" line while empty |
| `testimonial` | `null` | real customer feedback `{ quote, name, place }`; no quote while null |

`serviceArea`, `photos`, `brands` and `testimonial` all render in `features/marketing/Proof.jsx`,
each only when filled. Do not put invented values in them.

Claims that live in copy rather than config: the FAQ (`src/data/faq.js`) and `HowItWorks.jsx` say
"less than a day" (from the approved stat), "no civil work", "free visit", and that the modules
need no neutral wire (a product feature). The device blurbs in `src/data/devices.js` describe what
each device does.

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
in the visitor's browser storage, plan links carrying plan data only, Netlify hosting,
Google Fonts, and deletion by email. Data retention for website submissions is not stated
because none is defined.

## 6. How leads flow

Both kinds go through `submitLead(kind, fields)` in `src/lib/submitLead.js`: a JSON POST to the
Formspree form for that kind, success only on a 2xx response, never throws, honeypot field
`_gotcha`. On failure the form keeps the visitor's data, offers retry, and offers a WhatsApp
fallback if `whatsapp` is configured. Formspree emails the submission to the business.

| Kind | Where | Fields |
|---|---|---|
| `visit` | "Book an appointment" when there is no plan, and always on a product page | `visitLeadFields`: Name, Phone, City, Notes; on a product page also `Product` (repeated in the subject) |
| `plan` | "Book an appointment" once a home has been picked | `planLeadFields`: customerName, customerPhone, customerCity, customerNotes, planLink, and `plan`: the full plan as JSON with quantities, the switch plan per room, `wants` (the goals left on), custom scenes and the plate |

There is one form, `features/marketing/LeadModal.jsx`, opened by every "Book an appointment"
button through `Booking.jsx` (`BookingProvider` in `Shell`, `BookButton` wherever a button is
needed). After a `plan` lead succeeds it says when we will call and offers the plan link, WhatsApp
and the PDF (`features/savePlan/ShareOptions.jsx`). "Save or share" under the plan shows the same
three options without any form; nothing is sent to Aerlyn from there.

## 7. The planner and plans

`features/houseExplorer/Planner.jsx`. One question, "What's your home?", four tiles. A tap builds
the rooms from `data/templates.js` and shows the plan under the tiles: "Book an appointment", six
goal chips, one plain line per room, and a row of links: Save or share, Customise, See it in
action, Design a switch plate. Changing the home is one tap unless rooms were edited
(`isCustomised`), in which case it asks first.

- **Goals** (`src/lib/goals.js`, pure and tested): Lighting, Fans & AC, Curtains, Security,
  Geyser & energy, Voice & music. `home.goals` is the list that is on. `applyGoals(rooms, goals)`
  filters devices; power sockets and USB points have no goal and always stay. Nothing is deleted
  when a chip is switched off: the reducer keeps every device, `HomeContext` exposes `home` (the
  filtered view every component shows and edits) and `plan` (the full state, which is what is
  stored and put in links). The lead and the PDF go through `buildExportPayload`, which applies the
  goals itself.
- **Room lines** come from `roomSentence` in `src/lib/planSummary.js`, using each device's `short`
  word. No quantities or switch counts are shown to the customer; they are in the lead and PDF.
- **Customise** (`RoomList`, `RoomCard`): a closed row per room; inside, the name, devices with
  quantities (taking the last one away removes the device), add a device (only from goals that are
  on), duplicate and remove. Room size, switch overrides, plates and "Design this plate" are under
  the closed "Installer details". "Your own scenes" (`SceneBuilder`) is the last row.
- **See it in action** (`Demo.jsx`): the three preset scenes, and any of the visitor's own, light
  up the rooms of the house. There is no Build/Play mode.
- Stored in the browser under `localStorage` key `aerlyn_plan_v1` (`src/lib/planStorage.js`),
  written on every change, restored on load. A plate designed without picking a home is kept too.
- **Plan link:** `https://aerlyn.in/#plan=<base64url>`: compact JSON of home type, rooms, devices,
  overrides, custom scenes, plate config and, when not all are on, the goals as one number (`g`,
  bit i = goal i). Links made before goals existed have no `g` and load with every goal on. No
  name or phone. Decoding is size-limited and validated; a bad link shows a notice in the planner.
  A link that differs from the stored plan asks before replacing it (`PlanNotice.jsx`).

## 7a. Touch plate designer

Lives on its own page, `/plate-designer.html` (`pages/PlateDesignerPage.jsx`,
`src/features/touchPlate/`), reached from "Design a switch plate" under the plan. "Design this
plate" in a room's Installer details links to `/plate-designer.html?room=<position>`; the designer
then presets the plate size that room needs, puts the room's name in the heading and the PDF,
moves to the first step still to do, and drops the query so a reload does not reset the plate.
It works without a plan too. The stored step is read after mount, because the page is prerendered
on its first step.

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
  `await import('/plate-layout-check.js'); await plateCheck.run()` (written when the designer was
  on the home page: open `/plate-designer.html` instead). It places every accessory
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

No analytics is installed. Netlify Analytics is a paid dashboard add-on needing no code.

## 9. Accessibility conventions

- Every click target is a `<button type="button">`, `<a>` or `<summary>`; focus styling is global
  (`src/styles/global.css`). Buttons and fields are at least 44 px tall. Spacing uses the
  `--s1`…`--s8` scale and `.btn` / `.btn.quiet` are the only button styles outside the designer.
- The appointment dialog uses `useDialog(open, onClose)`
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
2. GoDaddy: set the domain's nameservers to exactly the four listed in Netlify → Domains → aerlyn.in → Name servers. The registry currently delegates to dns1–4.p04.nsone.net while the Netlify zone's own NS records say dns1–4.p02.nsone.net; this mismatch is the likely reason Netlify's Let's Encrypt certificate fails.
3. Netlify → site → Domain management → HTTPS → Verify DNS configuration → Provision certificate, then Force HTTPS.
4. Deploy this repo to the existing Netlify site: either link the GitHub repo `Sid342/aerlyn` (branch `main`; build settings come from `netlify.toml`) or drag-and-drop the built `dist` folder.
5. After go-live, check the three Play Store URLs load at their exact paths. The June version with the Play Store privacy page is still live at aerlyn.vercel.app: check which URL is registered in Play Console, switch it to https://aerlyn.in/privacy-policy.html once the new site is live, and only then retire that Vercel project.
6. Google Search Console: verify the domain and submit `https://aerlyn.in/sitemap.xml`.
7. Smoke-test one submission of each lead kind (visit, plan) and confirm it arrives by email;
   check that `/products/checkout.html` redirects to `/#contact`.
8. Recommended: Google Business Profile.

## 12. Deliberately out of scope

Any online selling: prices, cart, checkout, payments (owner decision, 2026-10-13). Accounts or
a database. The room-workspace ("studio") redesign. Price estimates in the planner. Per-city
landing pages.

## 13. Not verified

- 2026-10-14 redesign: checked in headless Chrome (puppeteer-core, outside the repo) at 360, 414
  and 1280 px against the built site: two taps from landing to the appointment form, a booking
  with the Formspree request stubbed (fail, retry, success), goals off and on, edits and goals
  across a reload and a plan link, an old-format link, header, menu, bottom bar, product booking,
  the plate page from both links and directly, a keyboard-only run, console and horizontal scroll
  on every route. Not checked: a physical phone, Safari/Firefox, a screen reader, a real Formspree
  submission, the plan PDF contents, Netlify's own handling of addresses without `.html`.
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
