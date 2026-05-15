# Handoff — Aerlyn Studio

**Updated:** 2026-05-16
**Repo:** https://github.com/Sid342/aerlyn
**Live branch:** `main` — 89/89 tests, build clean

---

## 1. What shipped

| Feature | Status | Tests | Notes |
|---------|--------|-------|-------|
| A: Interactive House Explorer | ✅ merged to main | — | phases 1–4 complete |
| B: Live Home Control | ✅ merged to main | — | smart-speaker, RoomDrawer, scene-to-room |
| C: Scene Builder | ✅ merged to main | +11 | customScenes CRUD, exportScenesPdf |
| D: Marketing Shell | ✅ merged to main | — | SiteNav, Hero, WhyAutomate, DayInLife, HowItWorks, ContactCTA, LeadModal |
| **B (PRD): Touch Plate Designer** | ✅ merged to main | +5 | 8-step wizard, click-to-place slots, PDF export |

**Main: 89/89 tests. Build clean. All features complete.**

### Bug fixed this session
`HomeContext` exposed `addCustomScene`, `removeCustomScene`, `renameCustomScene`, `setSceneDeviceState` at context root only. `SceneBuilder` called them as `actions.X` → silent `undefined` → scene add/remove/rename broken. Fix: merged scene creators into the `actions` object before passing to context. Both `actions.addCustomScene(...)` and destructured `{ addCustomScene }` from `useHome()` now work.

---

## 2. Full page structure (App.jsx on main)

```
<HomeProvider>
  <SiteNav />                          fixed top nav, anchor links, mobile hamburger
  <Hero />                             headline + proof stats
  <WhyAutomate />                      6 pain cards + shift block
  <DayInLife />                        3-card accordion timeline
  <section id="planner">
    <AppInner />                       ← the full planning tool
      HomeTypePicker
      HouseSvg (onRoomClick → RoomDrawer)
      FloorPlanUpload
      ModeToggle
      ScenePresets
      RoomList
      ExportPanel
      SceneBuilder
      TouchPlateDesigner              ← new, renders below SceneBuilder
      RoomDrawer (conditional)
  </section>
  <HowItWorks />                       4-step process grid
  <ContactCTA />                       phone input → LeadModal (Formspree)
</HomeProvider>
```

---

## 3. Full source map

```
src/
  main.jsx
  App.jsx

  styles/
    global.css               brand tokens: --teal #00C8B4, --bg #080810
                             --fg/--muted/--card aliased to --text/--text-dim/--surface
                             scroll-padding-top: 72px; body padding-top: 56px (nav offset)

  data/
    devices.js               22 devices incl. smart-speaker — DEVICES[] + getDevice(id)
    templates.js             HOME_TYPES, TEMPLATES, seedDevices(), buildRooms(),
                             makeRoom(), cloneRoom()
                             All rooms include switchOverrides: {gang,fan,curtain,socket}
    scenes.js                SCENES[] — 3 presets: Good Morning, Movie Night, Good Night

  context/
    homeReducer.js           initialHome + homeReducer (pure)
    HomeContext.jsx          HomeProvider + useHome() → { home, dispatch, actions }
                             actions includes custom scene creators (merged in)

  features/
    houseExplorer/
      HomeTypePicker.jsx / .css
      HouseSvg.jsx / .css          dollhouse SVG: clickable zones, ambient pulse,
                                   play-mode lit zones
      FloorPlanUpload.jsx / .css   optional floor-plan image (base64 data-URL)
      ModeToggle.jsx / .css        Build/Play switcher
      ScenePresets.jsx / .css      3 preset scene buttons (play mode only)
      RoomList.jsx
      RoomCard.jsx / .css          build: name/size/duplicate/remove/SwitchPlanCard/devices
                                   play: collapsible, "N on" badge
      RoomDrawer.jsx               slide-in room detail panel (opened by HouseSvg click)
      DeviceRow.jsx                build: qty stepper + DeviceInfo; play: toggle
      DeviceInfo.jsx / .css        "i" popover with device blurb
      AddDeviceMenu.jsx            filtered device select
      SwitchPlanCard.jsx / .css    build: editable overrides; play: read-only + plate rec

    sceneBuilder/
      SceneBuilder.jsx             preset cards (read-only) + custom scene cards
                                   (add / rename inline / per-device toggles / remove)
                                   + Download Scenes PDF button
      SceneBuilder.css

    touchPlate/                    ← new feature
      TouchPlateDesigner.jsx       8-step wizard shell; local state only (no HomeContext)
      TouchPlateDesigner.css       .tpd-* tokens; uses --teal/--card/--border/--fg/--muted
      steps/
        StepModel.jsx              MODULE_OPTIONS (2/4/6/8/12 module) — resets accessories on change
        StepMaterial.jsx           MATERIAL_COLORS — 5 swatches with hex
        StepSize.jsx               Standard (86×86mm) / Slim (86×50mm)
        StepAccessories.jsx        ACCESSORIES keyed by model; click-to-place into slot grid;
                                   auto-places at first free contiguous block; remove by ✕
                                   12-module uses CSS grid 2-row (6 cols) layout
        StepIcons.jsx              emoji icon picker per switch/fan accessory; toggle off by re-click
        StepPanel.jsx              Matte / Gloss / Satin
        StepFrame.jsx              Square / Rounded / Minimal
        StepExport.jsx             Summary card + Download PDF (calls downloadPlatePdf)

    marketing/
      SiteNav.jsx / .css           fixed 56px nav
      Hero.jsx / .css              eyebrow + serif h1 + CTAs + proof stats
      WhyAutomate.jsx / .css       6 pain cards + shift CTA
      DayInLife.jsx / .css         vertical accordion timeline (3 cards)
      HowItWorks.jsx / .css        4-step grid
      ContactCTA.jsx / .css        phone → LeadModal + site footer
      LeadModal.jsx / .css         Formspree form, name+phone required, success state

  lib/
    switchPlanner.js         computeRoomPoints(), applyOverrides(), recommendPlates(),
                             planRoom()
    exportJson.js            buildExportPayload(), downloadJson()
    exportPdf.js             downloadPdf() — jsPDF room-by-room
    exportScenesPdf.js       buildScenesPdfPayload(customScenes), downloadScenesPdf()
    exportPlatePdf.js        buildPlatePdfPayload(config), downloadPlatePdf(config)
                             payload: model/material/size/panel/frame + accessories[{name,slots,icon}]
    sendFormspree.js         sendToAerlyn()
```

---

## 4. State shape

### Home state (HomeContext)

```js
home = {
  homeType: '1BHK' | '2BHK' | '3BHK' | 'Villa' | null,
  floorPlanImage: string | null,        // base64 data-URL
  mode: 'build' | 'play',
  rooms: [
    {
      id: string,
      name: string,
      roomType: 'living'|'bedroom'|'kitchen'|'bath'|'entrance'|'balcony'|'other',
      size: 'S' | 'M' | 'L',
      devices: [{ deviceId: string, qty: number, on: boolean }],
      switchOverrides: { gang: number|null, fan: number|null, curtain: number|null, socket: number|null }
    }
  ],
  customScenes: [
    {
      id: string,               // "scene-{timestamp}-{rand4}"
      name: string,
      icon: '✨',
      deviceStates: { [deviceId]: boolean }
    }
  ]
}
```

### Touch Plate config (local state in TouchPlateDesigner)

```js
config = {
  model: '2 module' | '4 module' | '6 module' | '8 module' | '12 module' | null,
  maxSlots: number,             // 2/4/6/8/12
  material: string | null,      // 'Black' | 'Space Grey' | 'Titanium' | 'White' | 'Gray'
  materialCode: string | null,  // hex
  size: 'Standard' | 'Slim' | null,
  accessories: [
    { id: string, name: string, nodeSize: number, slots: number[] }
  ],
  icons: { [accId]: string },   // emoji per accessory id
  panel: 'Matte' | 'Gloss' | 'Satin' | null,
  frame: 'Square' | 'Rounded' | 'Minimal' | null,
}
```

---

## 5. Reducer actions (18 total)

| Action | Payload | Effect |
|--------|---------|--------|
| SET_HOME_TYPE | homeType | set type + seed rooms from template |
| ADD_ROOM | name, roomType, size | append room |
| REMOVE_ROOM | roomId | filter out |
| DUPLICATE_ROOM | roomId | clone + insert after original |
| RENAME_ROOM | roomId, name | update name |
| SET_ROOM_SIZE | roomId, size | update size + re-derive device qtys via sizeRule |
| ADD_DEVICE | roomId, deviceId | append or increment qty |
| REMOVE_DEVICE | roomId, deviceId | filter out |
| SET_DEVICE_QTY | roomId, deviceId, qty | clamp to ≥1 |
| TOGGLE_DEVICE | roomId, deviceId | flip on boolean |
| SET_SWITCH_OVERRIDE | roomId, overrideType, value | per-field nullable override |
| SET_MODE | mode | 'build' \| 'play' |
| APPLY_SCENE | deviceStates | apply {deviceId: bool} to every room |
| APPLY_SCENE_TO_ROOM | roomId, deviceStates | apply to single room |
| ADD_CUSTOM_SCENE | payload.name | append scene with id + empty deviceStates |
| REMOVE_CUSTOM_SCENE | payload.id | filter out |
| RENAME_CUSTOM_SCENE | payload.id, payload.name | update name |
| SET_SCENE_DEVICE_STATE | payload.sceneId, payload.deviceId, payload.on | toggle device in custom scene |
| RESET | — | return initialHome |

---

## 6. Test suite (89 total)

Run: `npm test -- --run` (Vitest — `--watchAll` not supported)

| File | Tests |
|------|-------|
| homeReducer.test.js | 31 |
| exportPlatePdf.test.js | 5 — payload shape, icon mapping, null icon, empty accs, ISO date |
| exportScenesPdf.test.js | 3 |
| exportJson.test.js | 9 |
| switchPlanner.test.js | 14 |
| devices.test.js | 12 |
| templates.test.js | 10 |
| scenes.test.js | 5 |

---

## 7. Launch checklist

All features complete. Only pre-launch tasks remain:

- [ ] Swap Formspree endpoint — `src/features/marketing/LeadModal.jsx` line ~5
      replace `mykokrdw` with production endpoint
- [ ] `npm run build` → confirm clean (chunk size warning is pre-existing, not a blocker)
- [ ] Deploy `dist/` to static host
- [ ] Smoke-test lead modal on production (verify submission hits Formspree dashboard)
- [ ] Smoke-test Touch Plate Designer end-to-end → Download PDF on production

---

## 8. Conventions

**Every component:**
- `<button type="button">` always
- `aria-pressed` on toggles bound to state
- `window.confirm` for destructive actions (deliberate)
- No TypeScript, no Redux

**HomeContext pattern:**
- `useHome()` returns `{ home, dispatch, actions }` where `actions` is the full merged object
- Custom scene creators live in both `actions.X` and as direct destructures — both work
- TouchPlateDesigner is intentionally outside HomeContext — plate config is local/ephemeral

**Git:**
- New feature → new branch from `main`
- TDD per task: red → green → commit
- Push only on explicit user instruction

---

## 9. Environment

- Node v26, npm 11.12 (`/opt/homebrew/bin`)
- `npm run dev` → localhost:5173
- `npm run preview` → localhost:4173
- `git config http.postBuffer 524288000` already set
- Reference assets: `assets/reference/` — do not modify or stage
