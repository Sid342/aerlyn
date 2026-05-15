# Handoff — Aerlyn Studio

**Updated:** 2026-05-15
**Repo:** `https://github.com/Sid342/aerlyn.git`
**Main branch:** `main` — tagged `feature-a-complete`
**All previous branches:** `feature-a/phase-1`, `feature-a/phase-2` (merged to main), `feature-b` (PR #1 open — not yet merged)

---

## 1. What this project is

Aerlyn Studio — React + Vite smart-home configurator replacing the legacy `aerlyn_website.html` marketing site.

| Feature | Status | Branch / Tag | Plan |
|---------|--------|-------------|------|
| **A: Interactive House Explorer** | ✅ COMPLETE | `main`, tagged `feature-a-complete` | `docs/superpowers/plans/2026-05-14-feature-a-house-explorer.md` |
| **"Live Home Control"** (unplanned extra) | ✅ COMPLETE | `feature-b`, PR #1 open | `docs/superpowers/plans/2026-05-15-feature-b-live-control.md` |
| **C: Scene Builder** | ✅ COMPLETE | `feature-c`, tagged `feature-c-complete` | `docs/superpowers/plans/2026-05-15-feature-c-scene-builder.md` |
| **B (PRD): Touch Plate Designer** | 🔲 NOT STARTED | — | `docs/superpowers/plans/2026-05-15-feature-b-touch-plate.md` |
| **D: Marketing Shell** | 🔲 NOT STARTED | — | `docs/superpowers/plans/2026-05-15-feature-d-marketing-shell.md` |

**Recommended build order:**
1. Merge PR #1 (feature-b → main)
2. Feature C — Scene Builder (simple, fully unblocked)
3. Feature B (PRD) — Touch Plate Designer (complex port)
4. Feature D — Marketing Shell (full landing page)
5. Launch: swap Formspree endpoint → deploy

Source of truth:
- **PRD:** `docs/superpowers/specs/2026-05-14-aerlyn-studio-prd.md`
- **Plan:** `docs/superpowers/plans/2026-05-14-feature-a-house-explorer.md` — 23 tasks, 4 phases (all done)

Reference material (legacy site, source, handoff docx): `assets/reference/` — do not modify or stage.

---

## 2. Feature A — complete state

**All tests: 80/80 green. Build: clean.**

### Commit log (feature-a — all merged to main, tagged feature-a-complete)

```
9f94421  feat: device info popover on hover/click (T11.10)
8c8fe15  feat: per-room switch override inputs in SwitchPlanCard (T11.11)
0b98afb  feat: collapsible room cards in play mode, trim export status text (T11.12)
4f821b8  Phase 2 merge: SVG house, device tooltips, switch overrides, collapsible rooms, ambient animation
12ef95e  feat: SVG house with clickable zones + ambient pulsing animation (T13, T14)
ba797fd  feat: Build/Play mode toggle + play-mode SVG zone feedback (T16, T17)
cbf096e  feat: one-tap scene presets in play mode (T18)
f489ccf  Phase 3 merge: Play mode, scene presets, mode toggle
bf5947c  feat: floor-plan reference image upload (T20)
3256a16  feat: brand polish and mobile responsive pass (T22)
a88c6df  Phase 4 merge: Floor-plan upload, brand polish, mobile responsive
```

Tags on main: `phase-1-complete`, `phase-2-complete`, `phase-3-complete`, `feature-a-complete`

### Architecture (full final state)

```
src/
  main.jsx
  App.jsx                          HomeProvider > header (with app-intro) > HomeTypePicker >
                                   HouseSvg > FloorPlanUpload > ModeToggle > ScenePresets >
                                   RoomList > ExportPanel
  styles/global.css                --teal #00C8B4, --bg #080810, brand tokens, .card, .app
                                   + responsive breakpoints @600px / @420px
  data/
    devices.js                     22 devices — DEVICES[] + getDevice(id)
    templates.js                   HOME_TYPES, TEMPLATES, seedDevices(), buildRooms(), makeRoom(), cloneRoom()
                                   All rooms now include switchOverrides: {gang,fan,curtain,socket}
    scenes.js                      SCENES[] — 3 presets (Good Morning, Movie Night, Good Night)
  context/
    homeReducer.js                 initialHome, 15 action creators, homeReducer (pure)
                                   New: setSwitchOverride / SET_SWITCH_OVERRIDE
    HomeContext.jsx                HomeProvider + useHome() → { home, dispatch, actions }
  features/houseExplorer/
    HomeTypePicker.jsx / .css
    HouseSvg.jsx / .css            Dollhouse SVG: clickable zones, ambient pulse dots,
                                   play-mode lit zones (teal fill + "N on" label)
    FloorPlanUpload.jsx / .css     Optional floor-plan image upload; stored as data-URL in home.floorPlanImage
    ModeToggle.jsx / .css          Build/Play switcher with aria-pressed and mode hint text
    ScenePresets.jsx / .css        3 preset scene buttons, visible in play mode only
    RoomList.jsx                   list + add-new-room form
    RoomCard.jsx / .css            Build mode: name input, S/M/L size picker, Duplicate, Remove, SwitchPlanCard, device list
                                   Play mode: collapsible (default collapsed), "N on" badge when closed, no editing controls
    DeviceRow.jsx                  Build mode: icon + name + DeviceInfo tooltip + qty stepper + delete
                                   Play mode: icon + name×qty + DeviceInfo tooltip + on/off toggle
    DeviceInfo.jsx / .css          "i" button popover showing device blurb (hover+click)
    AddDeviceMenu.jsx              <select> filtered to devices not already in room
    SwitchPlanCard.jsx / .css      Build: editable number inputs (placeholder = auto-derived) per type
                                   Play: read-only tally + plate recommendation
                                   Both: hides if total = 0 with no overrides
  lib/
    switchPlanner.js               computeRoomPoints(), applyOverrides(), recommendPlates(), planRoom()
    exportJson.js                  buildExportPayload(), downloadJson()
    exportPdf.js                   downloadPdf() via jsPDF
    sendFormspree.js               sendToAerlyn() with try/catch
```

### State shape

```js
home = {
  homeType: '1BHK' | '2BHK' | '3BHK' | 'Villa' | null,
  floorPlanImage: string | null,    // base64 data-URL from FileReader
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
  ]
}
```

### switchPlanner.js additions

- `applyOverrides(points, overrides)` — merges `room.switchOverrides` on top of auto-derived points. Per-field nullable: null = use auto, number = use that value. Returns merged points with recalculated total.
- `planRoom(room)` now calls `applyOverrides` automatically.

---

## 3. Open items / known gaps

None from Feature A. All T11.10 / T11.11 / T11.12 items from Phase 1 handoff are resolved.

Minor known fact: the Formspree endpoint `https://formspree.io/f/mykokrdw` is a placeholder — swap before launch (noted in-code and PRD §9).

---

## 4. Remaining features — what's next

**Step 0:** Merge PR #1 (`feature-b` → `main`) at https://github.com/Sid342/aerlyn/pull/1

**Feature C — Scene Builder** (`docs/superpowers/plans/2026-05-15-feature-c-scene-builder.md`)
- 8 tasks. View preset scenes + create custom scenes + PDF export.
- New state: `home.customScenes[]`. 4 new reducer actions. `exportScenesPdf.js`.
- No new dependencies.

**Feature B (PRD) — Touch Plate Designer** (`docs/superpowers/plans/2026-05-15-feature-b-touch-plate.md`)
- 5 tasks. 8-step wizard porting `assets/reference/feturtles_src/StepperComponent.js`.
- MUI replaced with Aerlyn CSS. react-dnd replaced with click-to-place slots.
- New lib: `exportPlatePdf.js`.

**Feature D — Marketing Shell** (`docs/superpowers/plans/2026-05-15-feature-d-marketing-shell.md`)
- 6 tasks. Full landing page: SiteNav + Hero + WhyAutomate + DayInLife + HowItWorks + ContactCTA + LeadModal.
- Content ported from `assets/reference/aerlyn_website.html` (do not modify or stage).
- Lead modal sends to Formspree — swap endpoint before launch.

**Launch prep**
- Swap `mykokrdw` Formspree endpoint in `src/features/marketing/LeadModal.jsx`
- `npm run build` → deploy `dist/` to static host

---

## 5. Workflow

Follows **superpowers:subagent-driven-development**:
1. Implementer subagent per task (provide full task text, don't make subagent read plan)
2. Spec-compliance reviewer
3. Code-quality reviewer (`superpowers:code-reviewer`)
4. Fix → re-review for any Critical/Important issues
5. TodoWrite to track

### UI conventions (apply to every component)
- Every `<button>` has `type="button"`
- Toggle / selected-state buttons have `aria-pressed` bound to state
- `window.confirm` for destructive actions — deliberate, not a bug
- No TypeScript, no Redux
- Push only at phase boundaries, only on explicit user instruction

---

## 6. Environment

- Node v26, npm 11.12 (`/opt/homebrew/bin`)
- `npm run dev` → localhost:5173 (dev server)
- `npm run preview` → localhost:4173 (built preview)
- `git config http.postBuffer 524288000` already set (needed for 5 MB reference asset)
- Formspree endpoint `https://formspree.io/f/mykokrdw` is a placeholder — swap before launch

---

## 7. TL;DR for next agent

1. Feature A is complete — 69/69 tests, build clean, tagged `feature-a-complete`.
2. Read PRD for Feature B (Touch Plate Designer).
3. Write a plan in `docs/superpowers/plans/` before starting.
4. Invoke `superpowers:subagent-driven-development`.
5. Create a new feature branch, implement per plan, merge at phase boundaries.
6. Apply UI conventions. Push only on user instruction.
