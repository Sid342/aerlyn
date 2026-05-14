# Handoff — Aerlyn Studio, Feature A (Interactive House Explorer)

**Date:** 2026-05-14
**For:** the next agent continuing this build
**Repo:** `/Users/sid/Documents/Home Decor/Aerlyn` · remote `https://github.com/Sid342/aerlyn.git`
**Working branch:** `feature-a/phase-1`

---

## 1. What this project is

Rebuilding the Aerlyn smart-home website as **Aerlyn Studio** — a React + Vite app. Three
features planned (A: Interactive House Explorer, B: Touch Plate Designer, C: Scene Builder).
**Only Feature A is being built right now.** B and C are sketched in the PRD and need their
own brainstorm cycles later.

Read these two documents first — they are the source of truth:
- **PRD:** `docs/superpowers/specs/2026-05-14-aerlyn-studio-prd.md`
- **Plan:** `docs/superpowers/plans/2026-05-14-feature-a-house-explorer.md` — 23 tasks, 4 phases. The plan contains complete code for every task.

Reference material (legacy site, feturtles source, handoff docx) is in `assets/reference/` — do not modify or stage it.

---

## 2. Current state

**Environment:** node v26, npm 11.12 (`/opt/homebrew/bin`). Installed and working.

**Branches:**
- `main` — `ccabba2` (repo init: PRD + refs), `1512f20` (plan). Nothing else.
- `feature-a/phase-1` — current working branch, 9 commits ahead of main (see below).

**`feature-a/phase-1` commit log (oldest → newest):**
```
a8d66e4  feat: scaffold Vite React app with brand styles        (Task 1)
da11185  feat: device catalog with lookup                       (Task 2)
0eebb06  feat: room templates and device seeding                (Task 3)
f2edbef  feat: home reducer with full action set                (Task 4)
e2f4883  feat: HomeContext provider and useHome hook            (Task 5)
035bdbc  fix: addRoom size param + guard and test APPLY_SCENE   (Task 4 review fix)
af6228a  feat: home type picker wired to context                (Task 6)
2546df0  fix: accessibility and styling cleanup on HomeTypePicker (Task 6 review fix)
4d75370  feat: device row and add-device menu                   (Task 7)
```

**Build + tests:** `npm run build` clean. `npm test` = 24 passing (3 files: devices 4, templates 4, homeReducer 16).

**Task progress (23 total):**
- ✅ **T1–T6 complete** — implemented, spec-reviewed, code-quality-reviewed, review fixes applied.
- 🔶 **T7 in progress** — implemented (`4d75370`), **spec review PASSED**, **code-quality review NOT yet done**. This is where you resume.
- ⬜ **T8–T23 not started.**

---

## 3. How to resume — the workflow

Execution follows the **superpowers:subagent-driven-development** skill. Invoke it. Per task:

1. **Dispatch an implementer subagent** (general-purpose, model `sonnet`). Paste the FULL task text from the plan into the prompt — never make the subagent read the plan file. Include the scene-setting context (what exists, what this task feeds).
2. **Dispatch a spec-compliance reviewer** (general-purpose, `sonnet`) — verifies code matches the task spec exactly, nothing missing/extra. Independent verification, don't trust the implementer report.
3. **Only after spec review passes — dispatch a code-quality reviewer** (`superpowers:code-reviewer` agent). Give it BASE_SHA / HEAD_SHA.
4. **If a reviewer finds issues** — dispatch a fix back to an implementer subagent, then re-verify. Critical/Important issues must be fixed; Minor issues are noted and may be deferred.
5. **Mark the task complete** in TodoWrite, move on.

**Immediate next step:** run the code-quality review for **Task 7** (BASE_SHA `2546df0`, HEAD_SHA `4d75370`), apply any Critical/Important fixes, then proceed to Task 8.

### Pacing rule (decided with the user)
"**Batch logic, review UI.**"
- **Pure logic / data tasks** (reducers, data modules, export libs) — batch several into one implementer dispatch, then one review pass over the batch. Faster.
- **UI / integration tasks** (components, wiring) — strict one-at-a-time: implement → spec review → code review.
- Remaining tasks by type:
  - T8 RoomCard+RoomList → **UI, strict**
  - T9 exportJson + T10 exportPdf/Formspree → **logic, batch together**
  - T11 ExportPanel → **UI, strict**
  - T12 → phase boundary (controller does it, see §4)
  - T13 HouseSvg, T14 ambient anim → UI; T16 ModeToggle, T17 play feedback, T18 scenes (T18 has a data+test part — can batch its logic); T20 FloorPlanUpload, T21 DeviceInfo, T22 polish → UI

### Project UI conventions (apply on top of plan code for every UI task)
The plan's component code predates these — add them when implementing any component:
1. **Every `<button>` gets `type="button"`** (no forms yet, but prevents copy-paste submit bugs).
2. **Toggle / selected-state buttons get `aria-pressed`** bound to their state (e.g. play-toggle → `aria-pressed={device.on}`, room size buttons → `aria-pressed` for the active size, ModeToggle buttons similarly).
Tell each UI implementer subagent these conventions explicitly.

### Deliberate decisions (do NOT "fix" these)
- **`window.confirm` stays.** Used for destructive actions (switch home type, remove room). A custom themed confirm modal was considered and rejected as overengineering for this MVP. If the user later wants it, that's a polish task.
- **JavaScript, not TypeScript** — matches the feturtles source, keeps the build simple.
- **No Redux** — single `HomeContext` + `useReducer` is the chosen state model.
- **No pricing anywhere** — quantities only.

---

## 4. Phase boundaries (controller does these, not a subagent)

At the end of each phase (T12, T15, T19, T23):
```bash
npm test          # must pass
npm run build     # must pass
git checkout main
git merge --no-ff feature-a/phase-N -m "Phase N: <summary>"
git push origin main
git tag phase-N-complete && git push origin phase-N-complete
# then create the next phase branch when starting it: git checkout -b feature-a/phase-(N+1)
```
**Push cadence:** only at phase boundaries (user preference — commit locally as you go, push at step boundaries). Note: `git config http.postBuffer 524288000` is already set on this repo (the 5 MB legacy reference file needed it).

**User checkpoint:** the plan's UI tasks have "manual browser check" steps a subagent cannot perform. Surface task results to the user as you go; at minimum, ask the user to browser-test (`npm run preview`) at each phase boundary before merging.

---

## 5. Architecture quick map (what exists after T1–T7)

```
src/
  main.jsx                         React mount
  App.jsx                          HomeProvider > header > HomeTypePicker  (grows each UI task)
  styles/global.css                brand tokens (--teal #00C8B4, --bg #080810, fonts), .card, .app
  data/
    devices.js                     DEVICES (14 devices) + getDevice(id)
    templates.js                   HOME_TYPES, TEMPLATES, seedDevices(), buildRooms(), makeRoom()
  context/
    homeReducer.js                 initialHome, actions (13 creators), homeReducer (pure, immutable)
    HomeContext.jsx                HomeProvider + useHome() -> { home, dispatch, actions }
  features/houseExplorer/
    HomeTypePicker.jsx / .css       pick 1/2/3BHK/Villa  (wired into App)
    DeviceRow.jsx                   one device row — qty stepper (build mode) / play toggle (play mode)
    AddDeviceMenu.jsx               <select> to add a device to a room
    RoomCard.css                    shared styles for RoomCard/DeviceRow/AddDeviceMenu
```
`home` state shape: `{ homeType, floorPlanImage, mode ('build'|'play'), rooms[] }`.
`room`: `{ id, name, roomType, size, devices[] }`. `device`: `{ deviceId, qty, on }`.

DeviceRow and AddDeviceMenu are built but **not yet rendered** — Task 8 (RoomCard/RoomList) wires them in.

---

## 6. Open / deferred items (none are blockers)

- Minor review notes deferred for velocity: `getDevice` `__proto__` edge case + no id-count test (devices.js); `templates.test.js` doesn't assert roomType enum; `HomeProvider` context `value` not memoized (fine until provider gains other state); room id random suffix can be ragged-width (counter carries uniqueness, so safe).
- **Formspree endpoint** in Task 10 (`https://formspree.io/f/mykokrdw`) is the legacy site's form id, used as a documented placeholder — must be swapped for a real Aerlyn form id before launch (also noted in PRD §9).
- Features B and C — not started, need their own brainstorm → spec → plan cycles.

---

## 7. TL;DR for the next agent

1. Read the PRD and the plan.
2. Invoke `superpowers:subagent-driven-development`.
3. Resume at **Task 7's code-quality review** (BASE `2546df0`, HEAD `4d75370`).
4. Then T8 (UI, strict) → T9+T10 (logic, batched) → T11 (UI, strict) → T12 (phase-1 boundary: merge to main, push, tag, user browser-check).
5. Apply the UI conventions (§3) and respect the deliberate decisions (§3). Push only at phase boundaries.
