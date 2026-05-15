# Handoff — Aerlyn Studio, Feature B (Live Home Control)

**Date:** 2026-05-15
**Repo:** `https://github.com/Sid342/aerlyn.git`
**Main branch:** `main` — tagged `feature-a-complete`
**Feature B branch:** `feature-b` — tagged `feature-b-complete`

---

## 1. What this project is

Aerlyn Studio — a React + Vite smart-home configurator. Three features planned:
- **A: Interactive House Explorer** — **COMPLETE** (all 23 tasks done across 4 phases)
- **B: Live Home Control** — **COMPLETE** (8 tasks, feature-b branch, tagged feature-b-complete)
- **C: Scene Builder** — not started

Source of truth:
- **PRD:** `docs/superpowers/specs/2026-05-14-aerlyn-studio-prd.md`
- **Plan:** `docs/superpowers/plans/2026-05-14-feature-a-house-explorer.md` — 23 tasks, 4 phases (all done)

Reference material (legacy site, source, handoff docx): `assets/reference/` — do not modify or stage.

---

## 2. Feature A — complete state

**Tests: 69/69 green. Build: clean.**

Tags on main: `phase-1-complete`, `phase-2-complete`, `phase-3-complete`, `feature-a-complete`

---

## 3. Feature B — complete state

**Tests: 73/73 green. Build: clean. Branch: `feature-b`. Tag: `feature-b-complete`.**

### What Feature B added

- **Smart Speaker device** — id `smart-speaker`, category Audio, wired into Movie Night / Good Night / Good Morning scenes
- **Live SVG room cells** — play mode shows up to 3 device icons per room + "{N} on — tap to control" label; cells glow teal when devices are on
- **RoomDrawer** — bottom sheet slides up on room tap; shows per-device toggles, switchboard summary, per-room scene strip; backdrop tap closes
- **ScenePresets pill strip** — horizontal scroll, `roomId` prop for per-room vs whole-home scope
- **FloorPlanUpload removed** — component deleted, `floorPlanImage` removed from state, export payload cleaned
- **APPLY_SCENE_TO_ROOM** — new reducer action; `SET_FLOOR_PLAN` removed
- **Mobile breakpoints** — 480px and 360px rules for drawer, SVG, scene strip

### Commit log (feature-b)

```
815e800  feat: wire RoomDrawer into App; scene strip above SVG; mobile breakpoints  (T7)
c5390e0  feat: RoomDrawer bottom sheet with device toggles, switchboard, per-room scenes  (T6)
b430be7  feat: scene strip horizontal scroll; support per-room roomId prop  (T5)
e8b29a8  fix: add role=button and aria-label to interactive SVG room cells  (T4 fix)
b01327d  feat: SVG room cells show live device icons in play mode  (T4)
c738c6b  chore: remove floor plan upload feature  (T3)
0dc7acc  feat: add applySceneToRoom; remove floorPlan from state  (T2)
5182085  feat: add smart-speaker device; wire into scenes  (T1)
```

### Architecture (feature-b final state)

```
src/
  main.jsx
  App.jsx                          HomeProvider > AppInner
                                   AppInner: header > HomeTypePicker > ModeToggle > ScenePresets >
                                   HouseSvg > RoomList > ExportPanel > RoomDrawer (conditional)
  styles/global.css                brand tokens + @600px/@420px + @480px/@360px (Feature B)
  data/
    devices.js                     23 devices — smart-speaker added (Audio category)
    templates.js                   (unchanged from Feature A)
    scenes.js                      3 scenes — smart-speaker wired into all 3
  context/
    homeReducer.js                 initialHome (no floorPlanImage), 15 action creators
                                   Removed: setFloorPlan / SET_FLOOR_PLAN
                                   Added: applySceneToRoom / APPLY_SCENE_TO_ROOM
    HomeContext.jsx                (unchanged)
  features/houseExplorer/
    HomeTypePicker.jsx / .css      (unchanged)
    HouseSvg.jsx / .css            Full rewrite — activeIcons(), layout(), onRoomClick prop
                                   Play: icons + "N on — tap to control", teal glow, role=button
                                   Plan: device count only
    ModeToggle.jsx / .css          (unchanged)
    ScenePresets.jsx / .css        Horizontal scroll pill strip; roomId prop for per-room scope
    RoomDrawer.jsx / .css          NEW — bottom sheet; device toggles, switchboard, ScenePresets
    RoomList.jsx                   (unchanged)
    RoomCard.jsx / .css            (unchanged)
    DeviceRow.jsx                  (unchanged)
    DeviceInfo.jsx / .css          (unchanged)
    AddDeviceMenu.jsx              (unchanged)
    SwitchPlanCard.jsx / .css      (unchanged)
  lib/
    switchPlanner.js               (unchanged — planRoom() called by RoomDrawer)
    exportJson.js                  floorPlanImage removed from export payload
    exportPdf.js                   (unchanged)
    sendFormspree.js               (unchanged)
```

### State shape (Feature B)

```js
home = {
  homeType: '1BHK' | '2BHK' | '3BHK' | 'Villa' | null,
  // floorPlanImage REMOVED in Feature B
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

---

## 4. Open items / known gaps

- Formspree endpoint `https://formspree.io/f/mykokrdw` is a placeholder — swap before launch.
- feature-b branch not yet merged to main — merge on user instruction.
- RoomDrawer scene strip shows scenes that include devices the room doesn't have (applies silently, no visual mismatch — by design).

---

## 5. Feature C — what's next

**Scene Builder** — not started. No branch or plan exists yet.

Before starting: create a new plan in `docs/superpowers/plans/` following the same format as prior feature plans.

---

## 6. Workflow

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

## 7. Environment

- Node v26, npm 11.12 (`/opt/homebrew/bin`)
- `npm run dev` → localhost:5173 (dev server)
- `npm run preview` → localhost:4173 (built preview)
- `git config http.postBuffer 524288000` already set (needed for 5 MB reference asset)
- Formspree endpoint `https://formspree.io/f/mykokrdw` is a placeholder — swap before launch

---

## 8. TL;DR for next agent

1. Feature A complete — 69 tests, tagged `feature-a-complete` on main.
2. Feature B complete — 73 tests, tagged `feature-b-complete` on `feature-b` branch (not yet merged to main).
3. Next: Feature C (Scene Builder). Read PRD first.
4. Write a plan in `docs/superpowers/plans/` before coding.
5. Invoke `superpowers:subagent-driven-development`.
6. Create a new `feature-c` branch, implement per plan.
7. Apply UI conventions (type="button", aria-pressed, no TypeScript). Push only on user instruction.
