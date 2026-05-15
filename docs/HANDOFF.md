# Handoff — Aerlyn Studio, Feature A (Interactive House Explorer)

**Date:** 2026-05-15
**Repo:** `https://github.com/Sid342/aerlyn.git`
**Main branch:** `main` — tagged `phase-1-complete`
**Next branch:** `feature-a/phase-2` (not yet created)

---

## 1. What this project is

Aerlyn Studio — a React + Vite smart-home configurator. Three features planned:
- **A: Interactive House Explorer** — in progress (Phase 1 complete, Phase 2 next)
- **B: Touch Plate Designer** — not started
- **C: Scene Builder** — not started

Source of truth:
- **PRD:** `docs/superpowers/specs/2026-05-14-aerlyn-studio-prd.md`
- **Plan:** `docs/superpowers/plans/2026-05-14-feature-a-house-explorer.md` — 23 tasks, 4 phases

Reference material (legacy site, source, handoff docx): `assets/reference/` — do not modify or stage.

---

## 2. Phase 1 — complete state

**All tests: 66/66 green. Build: clean.**

### Commit log (feature-a/phase-1 → merged to main)

```
a8d66e4  feat: scaffold Vite React app with brand styles                    T1
da11185  feat: device catalog with lookup                                   T2
0eebb06  feat: room templates and device seeding                            T3
f2edbef  feat: home reducer with full action set                            T4
e2f4883  feat: HomeContext provider and useHome hook                        T5
035bdbc  fix: addRoom size param + guard and test APPLY_SCENE               T4 review
af6228a  feat: home type picker wired to context                            T6
2546df0  fix: accessibility and styling cleanup on HomeTypePicker           T6 review
4d75370  feat: device row and add-device menu                               T7
[...]    fix: CSS import, aria-labels, sendToAerlyn error handling          T7–T11 reviews
[...]    feat: RoomCard, RoomList, ExportPanel, PDF export, Formspree       T8–T11
02fa44e  feat: expand lighting catalog + size-aware seeding                 T11.5
00d4de1  feat: duplicate-room action + Duplicate button                     T11.6
01db401  fix: icon overhaul — all 7 wrong icons corrected                   T11.7
a7e7a09  feat: switch-plate planner with auto-derive                        T11.8
6f30d84  fix: round-up plate algorithm, remove redundant planRoom call      T11.8 QA
3d74223  polish: visual de-clutter — compact rows, zero-count lines hidden  T11.9
76ea2f8  Phase 1 merge                                                      T12
```

### Architecture (what exists)

```
src/
  main.jsx
  App.jsx                          HomeProvider > header > HomeTypePicker > RoomList > ExportPanel
  styles/global.css                --teal #00C8B4, --bg #080810, brand tokens, .card, .app
  data/
    devices.js                     22 devices — DEVICES[] + getDevice(id)
    templates.js                   HOME_TYPES, TEMPLATES, seedDevices(), buildRooms(), makeRoom(), cloneRoom()
  context/
    homeReducer.js                 initialHome, 14 action creators, homeReducer (pure)
    HomeContext.jsx                HomeProvider + useHome() → { home, dispatch, actions }
  features/houseExplorer/
    HomeTypePicker.jsx / .css
    RoomList.jsx                   list + add-new-room form
    RoomCard.jsx / .css            name input, S/M/L size picker, Duplicate, Remove, SwitchPlanCard, device list
    DeviceRow.jsx                  build mode: stepper+delete  |  play mode: on/off toggle
    AddDeviceMenu.jsx              <select> filtered to devices not already in room
    SwitchPlanCard.jsx / .css      per-room switch-module count + plate recommendation (auto-derived)
    ExportPanel.jsx / .css         JSON download, PDF download, email via Formspree
  lib/
    switchPlanner.js               computeRoomPoints(), recommendPlates(), planRoom()
    exportJson.js                  buildExportPayload(), downloadJson()
    exportPdf.js                   downloadPdf() via jsPDF — room-by-room layout with switch summary
    sendFormspree.js               sendToAerlyn() with try/catch
```

### State shape

```js
home = {
  homeType: '1BHK' | '2BHK' | '3BHK' | 'Villa' | null,
  floorPlanImage: null,          // Phase 2: T20 uploads here
  mode: 'build' | 'play',
  rooms: [
    {
      id: string,
      name: string,
      roomType: 'living'|'bedroom'|'kitchen'|'bath'|'entrance'|'balcony'|'other',
      size: 'S' | 'M' | 'L',
      devices: [{ deviceId: string, qty: number, on: boolean }]
    }
  ]
}
```

### Device catalog fields

```js
{
  id, name, category, icon, blurb,
  defaultRooms: string[],          // roomTypes this device seeds into
  sizeRule?: { S, M, L },         // qty by room size (omit = 1 at all sizes)
  sizeWhitelist?: string[],        // if present, only seeds when room.size matches
  control?: { type, count }        // wall-module requirement for switch planning
    // type: 'gang' | 'fan' | 'curtain' | 'socket'
    // count: always 1
    // omit on devices with no wall module: geyser, ac-ir, camera, motion-sensor,
    //   gas-sensor, door-lock, energy-meter, scene-remote, voice
}
```

### Switch planner (switchPlanner.js)

- `computeRoomPoints(room)` — iterates `room.devices`, looks up `control` field, tallies gang/fan/curtain/socket/total/byType
- `recommendPlates(total)` — greedy round-UP: picks smallest plate ≥ remaining from `[2,4,6,8,12]`. Lone remainder of 1 is padded to 2. Returns `{ plates[], spareModules }`.
- `planRoom(room)` — composes both. Result attached to each room in `buildExportPayload`.

---

## 3. Open items / known gaps (carry into Phase 2)

### HIGH PRIORITY — user-specified before handoff

**a. Device blurbs / contextual help**
Each device has a `blurb` field (e.g. "Shifts warm-to-cool through the day — energising mornings, calm nights."). Currently unused in the UI. Users need to understand what each device does. Options:
- Tooltip/popover on hover over device name
- Info icon (ℹ) beside device name that expands the blurb inline
- DeviceInfo drawer (T21 in the plan already covers this — pull forward if needed)

**b. Text still too heavy**
Phase 1 reduced category labels and zero-count switch lines. Still heavy:
- ExportPanel intro text may be verbose
- Room cards in large homes (Villa = 10 rooms) feel dense
- Consider collapsible room cards (accordion) for play mode
- Consider "summary view" showing just totals rather than every device

**c. Switch customization — IMPORTANT**
Current model: 1 device = 1 module (always). But in practice:
- 2 COB downlights can share one gang switch
- Customer may want extra sockets beyond the auto-derived count
- A room might need a specific plate layout regardless of device count

Needed: per-room switch override UI. Current `qty` stepper covers device quantity, but not "how many switches control this device type". Two approaches to consider:

*Option A — per-device-type override:* After auto-derive, show editable fields for gang/fan/curtain/socket counts. User types directly. Stored in room state as `switchOverrides: { gang, fan, curtain, socket }`. Planner uses override when present, auto-derive when null.

*Option B — grouping flag:* On each DeviceRow, a "share switch" toggle that halves its module contribution (e.g. two COBs share one gang). More granular but more complex state.

Recommendation: **Option A** — simpler, direct, handles all override scenarios. Add `switchOverrides` to room state (nullable per field), show as editable number inputs in SwitchPlanCard. Auto value shown as placeholder. Reducer action: `SET_SWITCH_OVERRIDE(roomId, type, value|null)`.

---

## 4. Phase 2 — what's next (T13–T23)

Create branch: `git checkout -b feature-a/phase-2`

| Task | Type | Description |
|------|------|-------------|
| T13 | UI | HouseSvg — room layout SVG visualization |
| T14 | UI | Ambient animation — subtle pulse on active devices in play mode |
| T15 | boundary | Phase 2 boundary (merge + tag) |
| T16 | UI | ModeToggle — build/play switcher |
| T17 | UI | Play feedback — device on/off visual response |
| T18 | logic+UI | Scene builder — save/apply named scenes |
| T19 | boundary | Phase 3 boundary |
| T20 | UI | FloorPlanUpload — image upload, fit behind SVG |
| T21 | UI | DeviceInfo drawer — blurb + specs on tap |
| T22 | UI | Polish pass |
| T23 | boundary | Phase 4 / final boundary |

**Before starting T13:** implement the three open items above (a, b, c) as T11.10, T11.11, T11.12 on the phase-2 branch. They are foundational UX and should not wait.

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

### Phase boundary script
```bash
npm test && npm run build
git checkout main
git merge --no-ff feature-a/phase-2 -m "Phase 2: <summary>"
git tag phase-2-complete
# push only when user says "push"
```

---

## 6. Environment

- Node v26, npm 11.12 (`/opt/homebrew/bin`)
- `npm run dev` → localhost:5173 (dev server)
- `npm run preview` → localhost:4173 (built preview)
- `git config http.postBuffer 524288000` already set (needed for 5 MB reference asset)
- Formspree endpoint `https://formspree.io/f/mykokrdw` is a placeholder — swap before launch

---

## 7. TL;DR for next agent

1. Read PRD + plan.
2. Invoke `superpowers:subagent-driven-development`.
3. Create `feature-a/phase-2` branch.
4. Implement T11.10 (device blurbs/info), T11.11 (switch override UI per room), T11.12 (text de-clutter pass 2) before T13.
5. Then T13–T23 per plan. Merge to main at T15, T19, T23.
6. Apply UI conventions. Push only on user instruction.
