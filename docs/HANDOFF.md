# Handoff — Aerlyn Studio

**Updated:** 2026-05-16
**Repo:** https://github.com/Sid342/aerlyn
**Live branch:** `main` — 84/84 tests, build clean

---

## 1. What shipped

| Feature | Status | Tests | Notes |
|---------|--------|-------|-------|
| A: Interactive House Explorer | ✅ merged to main | — | phases 1–4 complete |
| Live Home Control (feature-b) | ✅ merged to main | — | smart-speaker, RoomDrawer, scene-to-room |
| C: Scene Builder | ✅ merged to main | +11 | customScenes CRUD, exportScenesPdf |
| D: Marketing Shell | ✅ merged to main | — | SiteNav, Hero, WhyAutomate, DayInLife, HowItWorks, ContactCTA, LeadModal |
| **B (PRD): Touch Plate Designer** | 🔲 NOT STARTED | — | plan written, unblocked |

**Main: 84/84 tests. Build clean.**

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
    sendFormspree.js         sendToAerlyn()
```

---

## 4. State shape

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

---

## 5. Reducer actions

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

## 6. Test suite (84 total)

Run: `npm test -- --run` (Vitest — `--watchAll` not supported)

| File | Tests |
|------|-------|
| homeReducer.test.js | 42 — all reducer actions |
| exportScenesPdf.test.js | 3 — preset/custom labelling |
| exportJson.test.js | ~10 |
| switchPlanner.test.js | ~10 |
| devices.test.js | ~10 |
| scenes.test.js | ~5 |
| + feature-b tests | ~4 |

---

## 7. What's left before launch

### Touch Plate Designer (only remaining feature)

Plan: `docs/superpowers/plans/2026-05-15-feature-b-touch-plate.md`
Source to port: `assets/reference/feturtles_src/StepperComponent.js` (4299 lines, 8-step wizard)

Decisions already locked in the plan:
- MUI → Aerlyn CSS (no new deps)
- react-dnd → click-to-place slots (no new deps)
- New lib: `exportPlatePdf.js`
- Renders in App.jsx below SceneBuilder (inside `#planner` section)

### Launch checklist

- [ ] Swap Formspree endpoint in `src/features/marketing/LeadModal.jsx` line ~5
      replace `mykokrdw` with production endpoint
- [ ] `npm run build` → confirm clean
- [ ] Deploy `dist/` to static host
- [ ] Smoke-test lead modal on production (verify submission hits Formspree dashboard)

---

## 8. Conventions

**Every component:**
- `<button type="button">` always
- `aria-pressed` on toggles bound to state
- `window.confirm` for destructive actions (deliberate)
- No TypeScript, no Redux

**Git:**
- New feature → new branch from `main`
- TDD per task: red → green → commit
- Push only on explicit user instruction
- `superpowers:executing-plans` or `superpowers:subagent-driven-development` for implementation

---

## 9. Environment

- Node v26, npm 11.12 (`/opt/homebrew/bin`)
- `npm run dev` → localhost:5173
- `npm run preview` → localhost:4173
- `git config http.postBuffer 524288000` already set
- Reference assets: `assets/reference/` — do not modify or stage
