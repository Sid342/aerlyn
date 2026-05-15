# Handoff — Aerlyn Studio

**Updated:** 2026-05-16
**Repo:** `https://github.com/Sid342/aerlyn.git`
**Main branch:** `main` — tagged `feature-a-complete`

---

## 1. Project state at a glance

Aerlyn Studio — React + Vite smart-home configurator + marketing landing page, replacing the legacy `aerlyn_website.html`.

| Feature | Status | Branch / Tag | Tests | Plan |
|---------|--------|-------------|-------|------|
| **A: Interactive House Explorer** | ✅ COMPLETE | `main`, `feature-a-complete` | 69/69 | `plans/2026-05-14-feature-a-house-explorer.md` |
| **"Live Home Control"** (unplanned extra) | ✅ COMPLETE | `feature-b`, PR #1 open | 72/72 | `plans/2026-05-15-feature-b-live-control.md` |
| **C: Scene Builder** | ✅ COMPLETE | `feature-c`, `feature-c-complete` | 80/80 | `plans/2026-05-15-feature-c-scene-builder.md` |
| **D: Marketing Shell** | ✅ COMPLETE | `feature-d`, `feature-d-marketing-complete` | 69/69 | `plans/2026-05-15-feature-d-marketing-shell.md` |
| **B (PRD): Touch Plate Designer** | 🔲 NOT STARTED | — | — | `plans/2026-05-15-feature-b-touch-plate.md` |

**Merge order before launch:**
1. PR #1: `feature-b` → `main` (https://github.com/Sid342/aerlyn/pull/1)
2. `feature-c` → `main`
3. `feature-d` → `main`
4. Implement Touch Plate Designer (feature-b PRD)
5. Launch prep: swap Formspree endpoint → `npm run build` → deploy `dist/`

All plan files: `docs/superpowers/plans/`
PRD: `docs/superpowers/specs/2026-05-14-aerlyn-studio-prd.md`
Reference assets (legacy site, feturtles src): `assets/reference/` — do not modify or stage.

---

## 2. Full architecture (post feature-c + feature-d)

```
src/
  main.jsx
  App.jsx                          SiteNav > Hero > WhyAutomate > DayInLife >
                                   section#planner (HomeProvider > HomeTypePicker >
                                   HouseSvg > FloorPlanUpload > ModeToggle > ScenePresets >
                                   RoomList > ExportPanel > SceneBuilder) >
                                   HowItWorks > ContactCTA (+ LeadModal)
  styles/global.css                --teal #00C8B4, --bg #080810, brand tokens, .card, .app
                                   --fg/--muted/--card aliased to --text/--text-dim/--surface
                                   scroll-padding-top: 72px; body padding-top: 56px
                                   responsive @600px / @420px

  data/
    devices.js                     22 devices — DEVICES[] + getDevice(id)
    templates.js                   HOME_TYPES, TEMPLATES, seedDevices(), buildRooms(),
                                   makeRoom(), cloneRoom()
                                   All rooms include switchOverrides: {gang,fan,curtain,socket}
    scenes.js                      SCENES[] — 3 presets (Good Morning, Movie Night, Good Night)

  context/
    homeReducer.js                 initialHome, homeReducer (pure)
                                   Actions: SET_HOME_TYPE, SET_FLOOR_PLAN_IMAGE, SET_MODE,
                                   ADD_ROOM, REMOVE_ROOM, UPDATE_ROOM, SET_ROOM_SIZE,
                                   ADD_DEVICE, REMOVE_DEVICE, TOGGLE_DEVICE, SET_SWITCH_OVERRIDE,
                                   ADD_CUSTOM_SCENE, REMOVE_CUSTOM_SCENE, RENAME_CUSTOM_SCENE,
                                   SET_SCENE_DEVICE_STATE
    HomeContext.jsx                HomeProvider + useHome() → { home, dispatch, actions }
                                   action creators include: addCustomScene, removeCustomScene,
                                   renameCustomScene, setSceneDeviceState

  features/
    houseExplorer/
      HomeTypePicker.jsx / .css
      HouseSvg.jsx / .css          Dollhouse SVG: clickable zones, ambient pulse dots,
                                   play-mode lit zones (teal fill + "N on" label)
      FloorPlanUpload.jsx / .css   Optional floor-plan image; stored as data-URL
      ModeToggle.jsx / .css        Build/Play switcher with aria-pressed + mode hint
      ScenePresets.jsx / .css      3 preset scene buttons, visible in play mode only
      RoomList.jsx
      RoomCard.jsx / .css          Build: name, S/M/L size, Duplicate, Remove, SwitchPlanCard,
                                   device list
                                   Play: collapsible (default collapsed), "N on" badge
      DeviceRow.jsx                Build: icon + name + DeviceInfo tooltip + qty stepper + delete
                                   Play: icon + name×qty + DeviceInfo tooltip + on/off toggle
      DeviceInfo.jsx / .css        "i" button popover showing device blurb (hover+click)
      AddDeviceMenu.jsx            <select> filtered to devices not already in room
      SwitchPlanCard.jsx / .css    Build: editable number inputs per type
                                   Play: read-only tally + plate recommendation

    sceneBuilder/
      SceneBuilder.jsx             Preset scene cards (read-only) + Custom scene cards
                                   (add, rename inline, per-device toggles, remove with confirm)
                                   + "Download Scenes PDF" button
      SceneBuilder.css

    marketing/
      SiteNav.jsx / .css           Fixed top nav (56px), anchor links, mobile hamburger
      Hero.jsx / .css              Eyebrow + serif h1 + sub + dual CTAs + 4 proof stats
      WhyAutomate.jsx / .css       6 pain cards (auto-fill grid) + shift CTA block
      DayInLife.jsx / .css         Vertical timeline, 3 accordion cards (before/after + devices)
      HowItWorks.jsx / .css        4-step grid (Understand → Visit → Install → Live)
      ContactCTA.jsx / .css        Phone input → opens LeadModal; site footer
      LeadModal.jsx / .css         Formspree form (name+phone required, 4 selects, textarea)
                                   Success state. Endpoint: mykokrdw (swap before launch)

  lib/
    switchPlanner.js               computeRoomPoints(), applyOverrides(), recommendPlates(),
                                   planRoom()
    exportJson.js                  buildExportPayload(), downloadJson()
    exportPdf.js                   downloadPdf() via jsPDF
    exportScenesPdf.js             buildScenesPdfPayload(customScenes), downloadScenesPdf()
    sendFormspree.js               sendToAerlyn() with try/catch
```

---

## 3. State shape

```js
home = {
  homeType: '1BHK' | '2BHK' | '3BHK' | 'Villa' | null,
  floorPlanImage: string | null,        // base64 data-URL from FileReader
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

## 4. Test suite

| File | Tests | What it covers |
|------|-------|---------------|
| `homeReducer.test.js` | 42 | All reducer actions incl. customScenes CRUD |
| `exportScenesPdf.test.js` | 3 | buildScenesPdfPayload preset/custom labelling |
| `exportJson.test.js` | ~10 | JSON export payload |
| `switchPlanner.test.js` | ~10 | Switch point computation + applyOverrides |
| `devices.test.js` | ~10 | Device data integrity |
| `scenes.test.js` | ~5 | Scene preset structure |

Run all: `npm test -- --run` (Vitest, not Jest — `--watchAll` unsupported)

---

## 5. What's left

### Touch Plate Designer (Feature B — PRD)

Plan: `docs/superpowers/plans/2026-05-15-feature-b-touch-plate.md`
Source to port: `assets/reference/feturtles_src/StepperComponent.js` (4299 lines, 8-step wizard)

Key decisions already made in plan:
- MUI → Aerlyn CSS (no new dependencies)
- react-dnd → click-to-place slots (no new dependencies)
- New lib: `exportPlatePdf.js`
- Renders as new tab/section below SceneBuilder in App.jsx

### Launch prep (after all features merged)

1. Swap Formspree endpoint in `src/features/marketing/LeadModal.jsx` line ~5: replace `mykokrdw` with production endpoint
2. `npm run build` → confirm clean
3. Deploy `dist/` to static host
4. Smoke-test lead modal on production

---

## 6. Workflow conventions

**Development:**
- New feature → new branch from `main` (or latest merged state)
- TDD: write failing test → implement → pass → commit
- Commit per task (not per file)
- Push only on explicit user instruction

**UI rules (every component):**
- Every `<button>` has `type="button"`
- Toggle/selected-state buttons have `aria-pressed` bound to state
- `window.confirm` for destructive actions — deliberate
- No TypeScript, no Redux

**Subagent workflow:**
- `superpowers:executing-plans` or `superpowers:subagent-driven-development`
- Provide full task text to subagent — don't make it read the plan file itself
- `superpowers:verification-before-completion` before any PR

---

## 7. Environment

- Node v26, npm 11.12 (`/opt/homebrew/bin`)
- `npm run dev` → localhost:5173
- `npm run preview` → localhost:4173
- `git config http.postBuffer 524288000` already set (large reference asset)
- Worktrees at `.worktrees/feature-b`, `.worktrees/feature-c`, `.worktrees/feature-d`

---

## 8. TL;DR for next agent

1. Features A + Live Control + C (Scene Builder) + D (Marketing Shell) are complete.
2. PR #1 (`feature-b` live control) is open — merge it first.
3. Then merge `feature-c` and `feature-d`.
4. Remaining feature: Touch Plate Designer — plan is written, ready to execute.
5. Read `docs/superpowers/plans/2026-05-15-feature-b-touch-plate.md`.
6. Create `feature-touch-plate` branch, invoke `superpowers:executing-plans`.
7. After Touch Plate ships: launch prep (Formspree swap → build → deploy).
