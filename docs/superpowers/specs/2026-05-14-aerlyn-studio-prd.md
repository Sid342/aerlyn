# Aerlyn Studio — Product Requirements Document

**Date:** 2026-05-14
**Status:** Draft for review
**Owner:** Siddharth (Aerlyn)
**Repo:** https://github.com/Sid342/aerlyn.git

---

## 1. Vision

Aerlyn Studio is a rebuilt, interactive web app that replaces the current single-file
marketing site (`aerlyn_website.html`). It serves two audiences with one tool:

- **Customers** — understand what home automation actually *is*, and see what their own
  home could become.
- **Aerlyn sales staff** — walk a customer through their home, capture requirements, and
  place an order directly from the app.

It is the seed of a larger "Studio" product: three features ship under one roof.

### 1.1 The three customer-facing goals

1. **Explain automation properly.** Not "control things from your phone" — the full
   picture: scenes, schedules, sensors, security, energy, voice. Education is woven into
   the product, not bolted on as a brochure.
2. **Figure out the devices a home needs.** Highly interactive, home-shaped. Pick a home
   type, shape it to the real flat, and the app builds the device list.
3. **Let customers design and own their setup.** Design their own switch plates; build
   their own scenes; export it all so it can be imported into the Aerlyn app later.

---

## 2. Product scope

Aerlyn Studio is **three features** plus a shared order/export layer. Each feature is an
independent subsystem with its own brainstorm → spec → plan → implementation cycle.

| Feature | Name | Status in this PRD |
|---|---|---|
| **A** | Interactive House Explorer | **Fully specified** (Section 4) — built first |
| **B** | Touch Plate Designer | Sketched (Section 5) — needs own brainstorm cycle |
| **C** | Scene Builder | Sketched (Section 6) — needs own brainstorm cycle |
| — | Order & Export layer | Defined inline (Section 7) — shared across A/B/C |

**Build order:** A → B → C. A is the most concrete and delivers immediate sales value.
B has existing source to port (the `feturtles` configurator). C depends on knowing the
Aerlyn app's import format and is therefore last.

---

## 3. Technical foundation (shared)

- **Stack:** React + Vite. Component-based, single-page app, client-side only.
- **Backend:** None. No accounts, no database, no server. State lives in the browser;
  output leaves via email and file download.
- **Hosting:** Static. `npm run build` produces a `dist/` folder served from any static
  host (same class of hosting as the current site and `touch.feturtles.com`).
- **Order destination:** Formspree (same pattern as the legacy site) for email, plus
  client-side file download (JSON + PDF).
- **Brand:** Teal `#00C8B4` primary; amber `#F59E0B` and rose `#F43F5E` accents;
  near-black `#080810` background. Fonts: DM Serif Display (headings), Outfit (body),
  DM Mono (numbers). Carried over from the legacy site for visual continuity.
- **Repo layout:** monorepo-style single Vite app; features live under `src/features/`.

### 3.1 Existing assets

- `aerlyn_website.html` — legacy single-file site. Has a working text-based room planner
  and a **broken/truncated** "Day in Your Life" journey section. Reference only; not
  carried forward as code. Content (copy, brand, journey scenes) is reused.
- `aerlyn_handoff.docx` — handoff doc describing the journey section and brand context.
- `feturtles` source — the existing React touch-plate configurator
  (`touch.feturtles.com`), recovered from its source map. Lives in
  `assets/reference/feturtles_src/`. This is the basis for Feature B.

### 3.2 Known blocker

`node`/`npm` are **not installed** on the development machine. Required before any Vite
work. Resolution: `brew install node` (Homebrew is present). Tracked separately.

---

## 4. Feature A — Interactive House Explorer

### 4.1 Summary

A sales tool and customer-education surface. The user picks a home type, shapes the room
list to match the real flat, and declares what devices each room has. The app builds a
clean room-by-room device list and exports it. A stylized animated house makes the
experience visual — the customer *sees* automation, not a spreadsheet.

Goal mapping: the house visual + Play mode serve goal #1 (explain automation); the
room/device builder serves goal #2 (figure out devices); export serves goal #3 and the
sales-staff order flow.

### 4.2 Decisions (locked during brainstorming)

| # | Decision |
|---|---|
| 1 | **House model:** template + editable rooms. Start from a BHK/villa template, then add / remove / rename rooms, set a per-room size (S/M/L). No floor-plan drawing. |
| 2 | **Floor-plan upload:** customer may upload a floor-plan image/PDF. It is shown as a **reference image** in a side panel only — never auto-parsed. Staff eyeballs it to shape the room list. |
| 3 | **House visual:** hybrid — a stylized SVG "dollhouse" header (overview + ambient animation) plus room cards below for the actual editing. |
| 4 | **Device interaction:** two modes. **Build mode** = add/remove/set quantity/size of devices. **Play mode** = same house, toggling devices runs scene-like animations. Same data, two lenses. |
| 5 | **Pricing:** none. Quantities only. Staff prices offline. |
| 6 | **Output:** both — Formspree email *and* downloadable file (JSON + PDF). Data structure kept compatible with Feature B (room device counts → plate module size). |

### 4.3 Data model

```
Home
 ├ homeType         "1BHK" | "2BHK" | "3BHK" | "Villa"
 ├ floorPlanImage   uploaded reference image (optional, not parsed)
 └ rooms[]
     ├ id           stable unique id
     ├ name         display name, renamable ("Master Bedroom")
     ├ roomType     bedroom | living | kitchen | bath | entrance | balcony | other
     ├ size         "S" | "M" | "L"
     └ devices[]
         ├ deviceId  reference into the device catalog
         ├ qty       integer ≥ 1
         └ on        boolean — Play mode only, NOT exported
```

The exported payload is this `Home` object with all `on` flags stripped.

### 4.4 Device catalog

Derived from the `feturtles` configurator and the journey handoff doc. Grouped:

- **Lighting** — smart switch / dimmer, tunable-white (CCT) light, RGBW strip
- **Comfort** — BLDC smart fan, AC (via IR controller), motorized curtain / blind
- **Water** — smart geyser control
- **Security** — smart door lock, 5MP camera, motion sensor, gas/smoke sensor
- **Energy** — smart energy meter
- **Control** — scene remote, voice (Alexa / Google / Siri)

Each catalog entry has: `id`, `name`, `category`, `icon`, a one-line *"what this enables"*
blurb (the embedded education layer), and a list of default rooms it belongs to.

### 4.5 Room templates

| Home type | Default rooms |
|---|---|
| 1BHK | Living Room, Bedroom, Kitchen, Bathroom, Entrance |
| 2BHK | + Bedroom 2 |
| 3BHK | + Bedroom 3, Bathroom 2 |
| Villa | Living Room, Master Bedroom, Bedroom 2, Bedroom 3, Kitchen, 2× Bathroom, Entrance, Balcony, Study/Pooja |

Templates are starting points only — every room is editable, removable, renamable.

### 4.6 Application architecture

React + Vite. State held in a single `HomeContext` backed by `useReducer` — no Redux or
other state library (deliberately not overengineered).

```
src/
  data/
    devices.js          device catalog
    templates.js        BHK → default room presets
  context/
    HomeContext.jsx     home state + reducer actions
  features/houseExplorer/
    HomeTypePicker.jsx  pick 1/2/3BHK/Villa
    RoomList.jsx        add/remove/rename rooms
    RoomCard.jsx        one room: devices, qty, size
    DeviceRow.jsx       one device line (qty stepper / Play toggle)
    HouseSvg.jsx        stylized dollhouse header + animation
    ModeToggle.jsx      Build / Play switch
    FloorPlanUpload.jsx reference-image upload panel
    ExportPanel.jsx     review + export actions
  lib/
    exportJson.js       Home → JSON download
    exportPdf.js        Home → readable PDF summary
    sendFormspree.js    Home → email submission
```

### 4.7 Implementation phases (build order)

Phased "walking skeleton first" — each phase ships something working and browser-testable,
following the same step-by-step cadence as the nRF54L05 firmware campaign.

**Phase 1 — Working skeleton.** Vite app boots. Home-type picker → template rooms.
Add/remove/rename rooms, set S/M/L. Room card opens → add devices with qty steppers.
Export → downloads JSON + PDF and emails via Formspree. No animation yet. *Sales staff
can place a complete order at the end of Phase 1.*

**Phase 2 — The house visual.** Stylized SVG dollhouse header. Rooms the user added
appear as labeled zones. Ambient idle animation (a light glows, a curtain sways). Clicking
a zone scrolls to that room's card.

**Phase 3 — Play mode.** Build/Play toggle. In Play mode, devices toggle on/off with
animation — lights dim, curtains slide, AC glows, fan spins — both in the room cards and
in the SVG house. Optional one-tap scene presets (Good Morning / Movie / Good Night) that
flip several devices at once — a teaser for Feature C.

**Phase 4 — Upload + polish.** Floor-plan upload/reference panel beside the room editor.
Device *"what this enables"* blurbs surfaced as tooltips/info. Visual polish, mobile pass,
full brand alignment.

### 4.8 Out of scope (Feature A)

No pricing or quotes. No floor-plan parsing or room auto-detection. No accounts or login.
No backend or database. No live two-way sync with the Aerlyn app — export is a one-way
file. No multi-floor CAD or true architectural drawing.

---

## 5. Feature B — Touch Plate Designer (sketch — needs own brainstorm)

Port the existing `feturtles` 8-step configurator into Aerlyn Studio as a feature:

`Model → Material → Size → Accessories → Icons → Panel → Frame → Cart`

The `feturtles` app is already React (`StepperComponent.js`, ~4,300 lines, plus
`CartDropDown.js`), so this is a **port-and-adapt**, not a rewrite. It uses `react-dnd`
for icon drag-drop, `jsPDF` + `html2canvas` for order PDFs, and MUI for the stepper.

**Confirmed intent from discussion:**
- Icon visualisation must be **fully visible and interactive** on the plate preview.
- Order placement reuses the shared Order & Export layer (Section 7) — Formspree email +
  file download. The current `feturtles` app only downloads a PDF; Aerlyn adds email.
- Feature A's exported room data should be able to seed Feature B (a room's switch count
  suggests a plate module size).

**Open questions for B's own brainstorm cycle:** which `feturtles` data/state survives
the port vs. gets rebuilt; how the placeholder module images get replaced with real
assets; how MUI/`react-dnd` dependencies are reconciled with Aerlyn Studio's stack;
how the admin view is handled.

---

## 6. Feature C — Scene Builder (sketch — needs own brainstorm)

Let customers and staff compose automation **scenes** (e.g. "Good Morning", "Movie Night",
"Good Night"), browse an idea library for inspiration, and export the scenes as a file
that can be imported into the Aerlyn app.

**Confirmed intent from discussion:**
- "A complete import of things would work for now" — the export is a full scene definition
  file; deeper/customisable integration comes later.
- An idea library teaches customers *how* automation gets used — directly serving goal #1.

**Open questions for C's own brainstorm cycle:** the Aerlyn app's actual scene import
format (this gates the whole feature); how scenes reference devices from Feature A's
home model; whether scenes are per-room or whole-home; trigger types (time, sensor,
manual, voice).

---

## 7. Order & Export layer (shared across A/B/C)

A single shared module handles getting work *out* of the Studio:

- **Email** — Formspree submission, same approach as the legacy site. Sends a structured
  summary to Aerlyn.
- **File download** — JSON (machine-readable, the canonical export) + PDF (human-readable
  summary for customer and staff).
- **Compatibility** — every feature's export uses a shared, versioned schema so Feature A
  output can seed Feature B, and Feature C can reference both.

No payment, no order tracking, no fulfilment workflow — "sales staff places the order"
means the structured requirement leaves the app and reaches Aerlyn. Everything downstream
is handled offline for now.

---

## 8. Roadmap

| Stage | Deliverable |
|---|---|
| 0 | Repo + this PRD + `node`/`npm` installed |
| 1 | Feature A — implementation plan (writing-plans), then Phases 1–4 in steps |
| 2 | Feature B — own brainstorm → spec → plan → port in steps |
| 3 | Feature C — own brainstorm (after app import format is known) → spec → plan → build |
| 4 | Cutover — Aerlyn Studio replaces `aerlyn_website.html`; legacy content (journey scenes, copy) folded in |

---

## 9. Open items

- **Blocker:** install `node`/`npm` (`brew install node`).
- Legacy "Day in Your Life" journey section is broken in `aerlyn_website.html`; its
  content is reused in Studio but the broken code is not carried forward.
- Aerlyn app scene/device import format is unknown — gates Feature C.
- Real module images for Feature B (currently placeholders in `feturtles`).
