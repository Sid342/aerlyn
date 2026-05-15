# Feature B — Live Home Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform play mode into a live smart-home controller — dollhouse SVG shows per-device state, tapping a room opens a bottom drawer with individual toggles and switchboard summary, scenes visible alongside the SVG, speakers added, floor plan removed, mobile responsive throughout.

**Architecture:** SVG stays as persistent overview; room tap opens a bottom-sheet drawer (CSS transform slide-up, no library) that renders device toggles for that room. Scene pill strip sits between header and SVG. All state lives in existing homeReducer — only new UI components added.

**Tech Stack:** React 18, Vite, CSS custom properties (no new deps)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/data/devices.js` | Add `smart-speaker` device |
| Modify | `src/data/scenes.js` | Add speaker to Movie Night; add per-room scene support |
| Modify | `src/context/homeReducer.js` | Remove SET_FLOOR_PLAN; add APPLY_SCENE_TO_ROOM |
| Modify | `src/context/__tests__/homeReducer.test.js` | Tests for new action, removed action |
| Delete | `src/features/houseExplorer/FloorPlanUpload.jsx` | Remove |
| Delete | `src/features/houseExplorer/FloorPlanUpload.css` | Remove |
| Modify | `src/features/houseExplorer/HouseSvg.jsx` | Device icons inside cells; tap → open drawer |
| Modify | `src/features/houseExplorer/HouseSvg.css` | Cell icon layout, device-on glow states |
| Create | `src/features/houseExplorer/RoomDrawer.jsx` | Bottom sheet: device toggles + switchboard + per-room scenes |
| Create | `src/features/houseExplorer/RoomDrawer.css` | Slide-up animation, overlay, mobile safe-area |
| Modify | `src/features/houseExplorer/ScenePresets.jsx` | Horizontal scroll pill strip; accept optional roomId prop |
| Modify | `src/features/houseExplorer/ScenePresets.css` | Horizontal scroll, pill style |
| Modify | `src/App.jsx` | Remove FloorPlanUpload; add RoomDrawer; reorder play layout |
| Modify | `src/styles/global.css` | Mobile breakpoints for drawer, SVG, scene strip |
| Modify | `src/lib/__tests__/exportJson.test.js` | Remove floorPlanImage assertions |
| Modify | `src/lib/exportJson.js` | Remove floorPlanImage from export payload |

---

### Task T1: Add smart-speaker device + update scenes

**Files:**
- Modify: `src/data/devices.js`
- Modify: `src/data/scenes.js`
- Modify: `src/data/__tests__/devices.test.js`
- Modify: `src/data/__tests__/scenes.test.js`

- [ ] **Step 1: Write failing device test**

Add to `src/data/__tests__/devices.test.js`:
```js
it('includes smart-speaker device', () => {
  const d = getDevice('smart-speaker');
  expect(d).toBeDefined();
  expect(d.category).toBe('Audio');
  expect(d.defaultRooms).toContain('living');
});
```

- [ ] **Step 2: Run — expect FAIL**
```bash
cd "/Users/sid/Documents/Home Decor/Aerlyn" && npx vitest run src/data/__tests__/devices.test.js
```
Expected: FAIL "Cannot read properties of undefined"

- [ ] **Step 3: Add device to `src/data/devices.js`**

After the `voice` entry (line ~57), before the `// --- New lighting SKUs` comment, add:
```js
  { id: 'smart-speaker', name: 'Smart Speaker', category: 'Audio', icon: '🔊',
    blurb: 'Plays music, responds to voice, and triggers scenes — room by room.',
    defaultRooms: ['living', 'bedroom'] },
```

- [ ] **Step 4: Run — expect PASS**
```bash
npx vitest run src/data/__tests__/devices.test.js
```

- [ ] **Step 5: Write failing scenes test**

Add to `src/data/__tests__/scenes.test.js`:
```js
it('movie-night enables smart-speaker', () => {
  const scene = SCENES.find(s => s.id === 'movie-night');
  expect(scene.deviceStates['smart-speaker']).toBe(true);
});
it('good-night disables smart-speaker', () => {
  const scene = SCENES.find(s => s.id === 'good-night');
  expect(scene.deviceStates['smart-speaker']).toBe(false);
});
```

- [ ] **Step 6: Run — expect FAIL**
```bash
npx vitest run src/data/__tests__/scenes.test.js
```

- [ ] **Step 7: Update `src/data/scenes.js`**

In `movie-night` deviceStates add: `'smart-speaker': true,`
In `good-night` deviceStates add: `'smart-speaker': false,`
In `good-morning` deviceStates add: `'smart-speaker': false,`

- [ ] **Step 8: Run — expect PASS**
```bash
npx vitest run src/data/__tests__/scenes.test.js
```

- [ ] **Step 9: Commit**
```bash
git add src/data/devices.js src/data/scenes.js src/data/__tests__/devices.test.js src/data/__tests__/scenes.test.js
git commit -m "feat: add smart-speaker device; wire into scenes"
```

---

### Task T2: Add APPLY_SCENE_TO_ROOM reducer action; remove SET_FLOOR_PLAN

**Files:**
- Modify: `src/context/homeReducer.js`
- Modify: `src/context/__tests__/homeReducer.test.js`

- [ ] **Step 1: Write failing reducer tests**

Add to `src/context/__tests__/homeReducer.test.js`:
```js
describe('APPLY_SCENE_TO_ROOM', () => {
  it('applies scene only to specified room', () => {
    const state = {
      ...initialHome,
      rooms: [
        { id: 'r1', name: 'Living', roomType: 'living', size: 'M',
          devices: [{ deviceId: 'cct-light', qty: 1, on: false }],
          switchOverrides: { gang: null, fan: null, curtain: null, socket: null } },
        { id: 'r2', name: 'Bedroom', roomType: 'bedroom', size: 'M',
          devices: [{ deviceId: 'cct-light', qty: 1, on: false }],
          switchOverrides: { gang: null, fan: null, curtain: null, socket: null } },
      ],
    };
    const next = homeReducer(state, actions.applySceneToRoom('r1', { 'cct-light': true }));
    expect(next.rooms[0].devices[0].on).toBe(true);
    expect(next.rooms[1].devices[0].on).toBe(false);
  });
});

describe('SET_FLOOR_PLAN removed', () => {
  it('setFloorPlan action does not exist', () => {
    expect(actions.setFloorPlan).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**
```bash
npx vitest run src/context/__tests__/homeReducer.test.js
```

- [ ] **Step 3: Update `src/context/homeReducer.js`**

In `initialHome`, remove `floorPlanImage: null,`.

In `actions` object:
- Remove: `setFloorPlan: (image) => ({ type: 'SET_FLOOR_PLAN', image }),`
- Add: `applySceneToRoom: (roomId, deviceStates) => ({ type: 'APPLY_SCENE_TO_ROOM', roomId, deviceStates }),`

In `homeReducer` switch:
- Remove the `case 'SET_FLOOR_PLAN':` block entirely.
- Add after `case 'APPLY_SCENE':`:
```js
    case 'APPLY_SCENE_TO_ROOM': {
      const deviceStates = action.deviceStates || {};
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.map((d) =>
          deviceStates[d.deviceId] === undefined ? d : { ...d, on: deviceStates[d.deviceId] }
        ),
      }));
    }
```

- [ ] **Step 4: Run — expect PASS**
```bash
npx vitest run src/context/__tests__/homeReducer.test.js
```

- [ ] **Step 5: Commit**
```bash
git add src/context/homeReducer.js src/context/__tests__/homeReducer.test.js
git commit -m "feat: add applySceneToRoom; remove floorPlan from state"
```

---

### Task T3: Remove FloorPlanUpload; clean up export

**Files:**
- Delete: `src/features/houseExplorer/FloorPlanUpload.jsx`
- Delete: `src/features/houseExplorer/FloorPlanUpload.css`
- Modify: `src/lib/exportJson.js`
- Modify: `src/lib/__tests__/exportJson.test.js`

- [ ] **Step 1: Delete FloorPlanUpload files**
```bash
rm "/Users/sid/Documents/Home Decor/Aerlyn/src/features/houseExplorer/FloorPlanUpload.jsx"
rm "/Users/sid/Documents/Home Decor/Aerlyn/src/features/houseExplorer/FloorPlanUpload.css"
```

- [ ] **Step 2: Remove from `src/App.jsx`**

Remove import line: `import FloorPlanUpload from './features/houseExplorer/FloorPlanUpload.jsx';`
Remove JSX tag: `<FloorPlanUpload />`

- [ ] **Step 3: Update `src/lib/exportJson.js`**

In `buildExportPayload`, remove the `floorPlanImage` field from the returned object.

- [ ] **Step 4: Update export test**

In `src/lib/__tests__/exportJson.test.js`, remove any assertion referencing `floorPlanImage`.

- [ ] **Step 5: Run full suite — expect PASS**
```bash
npx vitest run
```

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "chore: remove floor plan upload feature"
```

---

### Task T4: SVG room cells — device state icons

**Files:**
- Modify: `src/features/houseExplorer/HouseSvg.jsx`
- Modify: `src/features/houseExplorer/HouseSvg.css`

No reducer changes. No tests (pure render). Visual verification only.

- [ ] **Step 1: Update `HouseSvg.jsx`**

Replace the full file content with:

```jsx
import { useHome } from '../../context/HomeContext.jsx';
import { getDevice } from '../../data/devices.js';
import './HouseSvg.css';

// Returns up to 3 icons for devices that are ON, plus overflow count
function activeIcons(devices) {
  const on = devices.filter((d) => d.on);
  const icons = on.slice(0, 3).map((d) => {
    const meta = getDevice(d.deviceId);
    return meta ? meta.icon : null;
  }).filter(Boolean);
  const overflow = on.length > 3 ? on.length - 3 : 0;
  return { icons, overflow };
}

function layout(rooms) {
  const cols = rooms.length <= 4 ? 2 : 3;
  const cellW = 120;
  const cellH = 80;
  const gap = 10;
  return rooms.map((room, i) => ({
    room,
    x: 20 + (i % cols) * (cellW + gap),
    y: 70 + Math.floor(i / cols) * (cellH + gap),
    w: cellW,
    h: cellH,
  }));
}

export default function HouseSvg({ onRoomClick }) {
  const { home } = useHome();
  if (!home.homeType || home.rooms.length === 0) return null;

  const cells = layout(home.rooms);
  const cols = home.rooms.length <= 4 ? 2 : 3;
  const rows = Math.ceil(home.rooms.length / cols);
  const width = 20 + cols * 130 + 10;
  const height = 70 + rows * 90 + 20;
  const isPlay = home.mode === 'play';

  return (
    <div className="house-svg-wrap card">
      <svg
        className="house-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Your home overview"
      >
        <polyline className="house-roof" points={`10,60 ${width / 2},15 ${width - 10},60`} />
        {cells.map(({ room, x, y, w, h }) => {
          const onCount = room.devices.filter((d) => d.on).length;
          const isLit = isPlay && onCount > 0;
          const { icons, overflow } = activeIcons(room.devices);

          return (
            <g
              key={room.id}
              className="house-zone"
              onClick={() => isPlay && onRoomClick && onRoomClick(room.id)}
              style={{ cursor: isPlay ? 'pointer' : 'default' }}
            >
              <rect
                className={`house-zone-rect${isLit ? ' active' : ''}`}
                x={x} y={y} width={w} height={h} rx="6"
              />
              <text className="house-zone-label" x={x + 8} y={y + 16}>{room.name}</text>

              {isPlay && icons.length > 0 ? (
                <>
                  <text className="house-zone-icons" x={x + 8} y={y + 38}>
                    {icons.join(' ')}{overflow > 0 ? ` +${overflow}` : ''}
                  </text>
                  <text className="house-zone-on-label" x={x + 8} y={y + 56}>
                    {onCount} on — tap to control
                  </text>
                </>
              ) : (
                <text className="house-zone-label" x={x + 8} y={y + 34}>
                  {room.devices.length} devices
                </text>
              )}

              <circle
                className={`house-dot${isLit ? ' lit' : ' ambient'}`}
                cx={x + w - 14}
                cy={y + 14}
                r="4"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Update `HouseSvg.css`**

Replace full file:
```css
.house-svg-wrap { margin: 16px 0 8px; }
.house-svg { width: 100%; height: auto; display: block; }
.house-zone { cursor: pointer; }
.house-zone-rect {
  fill: var(--surface-2); stroke: var(--border); stroke-width: 1.5;
  transition: fill 0.3s, stroke 0.3s;
}
.house-zone:hover .house-zone-rect { stroke: var(--teal); }
.house-zone-label {
  fill: var(--text-dim); font-family: var(--font-body); font-size: 9px;
}
.house-zone-icons {
  fill: var(--text); font-family: var(--font-body); font-size: 13px;
}
.house-roof { fill: none; stroke: var(--teal); stroke-width: 2; }
.house-dot { fill: var(--amber); }

@keyframes ambient-glow {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
.house-dot.ambient { animation: ambient-glow 3.2s ease-in-out infinite; }
.house-dot.ambient:nth-of-type(even) { animation-delay: 1.4s; }
.house-zone-rect.active { fill: rgba(0, 200, 180, 0.12); stroke: var(--teal); }
.house-dot.lit { fill: var(--teal); opacity: 1; animation: none; }
.house-zone-on-label { fill: var(--teal); font-family: var(--font-body); font-size: 7.5px; }
```

- [ ] **Step 3: Verify visually — run dev server and check play mode SVG shows device icons**
```bash
cd "/Users/sid/Documents/Home Decor/Aerlyn" && npm run dev
```
Open `http://localhost:5173`, pick home type, switch to Play, toggle a device, confirm its icon appears in SVG cell.

- [ ] **Step 4: Commit**
```bash
git add src/features/houseExplorer/HouseSvg.jsx src/features/houseExplorer/HouseSvg.css
git commit -m "feat: SVG room cells show live device icons in play mode"
```

---

### Task T5: ScenePresets — horizontal scroll pill strip

**Files:**
- Modify: `src/features/houseExplorer/ScenePresets.jsx`
- Modify: `src/features/houseExplorer/ScenePresets.css`

- [ ] **Step 1: Update `ScenePresets.jsx`**

Replace full file:
```jsx
import { SCENES } from '../../data/scenes.js';
import { useHome } from '../../context/HomeContext.jsx';
import './ScenePresets.css';

// roomId: if provided, applies scene only to that room via applySceneToRoom
// if null, applies globally via applyScene
export default function ScenePresets({ roomId = null }) {
  const { home, dispatch, actions } = useHome();
  if (!home.homeType || home.mode !== 'play') return null;

  function handleScene(deviceStates) {
    if (roomId) {
      dispatch(actions.applySceneToRoom(roomId, deviceStates));
    } else {
      dispatch(actions.applyScene(deviceStates));
    }
  }

  return (
    <div className="scene-strip">
      {!roomId && <div className="scene-strip-label">Set whole home:</div>}
      <div className="scene-pills">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="scene-btn"
            onClick={() => handleScene(s.deviceStates)}
          >
            <span className="scene-icon">{s.icon}</span>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `ScenePresets.css`**

Replace full file:
```css
.scene-strip { margin: 8px 0; }
.scene-strip-label {
  font-size: 11px; color: var(--text-dim); margin-bottom: 6px; padding: 0 2px;
}
.scene-pills {
  display: flex; gap: 8px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  scrollbar-width: none; padding-bottom: 4px;
}
.scene-pills::-webkit-scrollbar { display: none; }
.scene-btn {
  flex-shrink: 0;
  display: flex; align-items: center; gap: 6px;
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--text); border-radius: 20px;
  padding: 6px 14px; font-size: 13px; cursor: pointer;
  white-space: nowrap; transition: border-color 0.15s, background 0.15s;
}
.scene-btn:hover { border-color: var(--teal); background: rgba(0,200,180,0.08); }
.scene-icon { font-size: 16px; }
```

- [ ] **Step 3: Verify — run dev, play mode, confirm scene pills scroll horizontally on narrow window**

- [ ] **Step 4: Commit**
```bash
git add src/features/houseExplorer/ScenePresets.jsx src/features/houseExplorer/ScenePresets.css
git commit -m "feat: scene strip horizontal scroll; support per-room roomId prop"
```

---

### Task T6: RoomDrawer — bottom sheet component

**Files:**
- Create: `src/features/houseExplorer/RoomDrawer.jsx`
- Create: `src/features/houseExplorer/RoomDrawer.css`

- [ ] **Step 1: Create `RoomDrawer.css`**

```css
.drawer-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.45);
  animation: fade-in 0.18s ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.drawer {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 101;
  background: var(--surface-1, #12121e);
  border-radius: 18px 18px 0 0;
  max-height: 65vh; overflow-y: auto;
  padding: 0 0 env(safe-area-inset-bottom, 16px);
  animation: slide-up 0.22s cubic-bezier(0.32,0.72,0,1);
  -webkit-overflow-scrolling: touch;
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.drawer-handle {
  width: 36px; height: 4px;
  background: var(--border); border-radius: 2px;
  margin: 12px auto 0;
}

.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--border);
}
.drawer-title { font-size: 16px; font-weight: 600; color: var(--text); }
.drawer-close {
  background: none; border: none; color: var(--text-dim);
  font-size: 20px; cursor: pointer; padding: 4px 8px; line-height: 1;
}

.drawer-body { padding: 12px 16px; }

.drawer-device-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--border);
}
.drawer-device-row:last-child { border-bottom: none; }
.drawer-device-icon { font-size: 20px; flex-shrink: 0; }
.drawer-device-name { flex: 1; font-size: 14px; color: var(--text); }
.drawer-device-qty { font-size: 12px; color: var(--text-dim); margin-left: 4px; }

/* Toggle pill */
.device-toggle {
  position: relative; width: 44px; height: 24px;
  background: var(--border); border-radius: 12px;
  border: none; cursor: pointer; flex-shrink: 0;
  transition: background 0.2s;
}
.device-toggle.on { background: var(--teal, #00C8B4); }
.device-toggle::after {
  content: ''; position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  background: #fff; border-radius: 50%;
  transition: transform 0.2s;
}
.device-toggle.on::after { transform: translateX(20px); }

.drawer-switchboard {
  margin-top: 12px; padding: 10px 12px;
  background: var(--surface-2); border-radius: 8px;
  font-size: 12px; color: var(--text-dim);
}
.drawer-switchboard strong { color: var(--text); }

.drawer-scenes { margin-top: 12px; }
.drawer-scenes-label {
  font-size: 11px; color: var(--text-dim); margin-bottom: 6px;
}
```

- [ ] **Step 2: Create `RoomDrawer.jsx`**

```jsx
import { useHome } from '../../context/HomeContext.jsx';
import { getDevice } from '../../data/devices.js';
import { planRoom } from '../../lib/switchPlanner.js';
import ScenePresets from './ScenePresets.jsx';
import './RoomDrawer.css';

export default function RoomDrawer({ roomId, onClose }) {
  const { home, dispatch, actions } = useHome();
  const room = home.rooms.find((r) => r.id === roomId);
  if (!room) return null;

  const plan = planRoom(room);

  const switchboardParts = [
    plan.gang > 0 && `${plan.gang}-gang`,
    plan.fan > 0 && `${plan.fan} fan`,
    plan.curtain > 0 && `${plan.curtain} curtain`,
    plan.socket > 0 && `${plan.socket} socket`,
  ].filter(Boolean);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-label={`${room.name} controls`}>
        <div className="drawer-handle" />
        <div className="drawer-header">
          <span className="drawer-title">{room.name}</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="drawer-body">
          {room.devices.length === 0 && (
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No devices in this room.</p>
          )}
          {room.devices.map((d) => {
            const meta = getDevice(d.deviceId);
            if (!meta) return null;
            return (
              <div key={d.deviceId} className="drawer-device-row">
                <span className="drawer-device-icon">{meta.icon}</span>
                <span className="drawer-device-name">
                  {meta.name}
                  {d.qty > 1 && <span className="drawer-device-qty">×{d.qty}</span>}
                </span>
                <button
                  type="button"
                  className={`device-toggle${d.on ? ' on' : ''}`}
                  aria-pressed={d.on}
                  aria-label={`Toggle ${meta.name}`}
                  onClick={() => dispatch(actions.toggleDevice(room.id, d.deviceId))}
                />
              </div>
            );
          })}

          {switchboardParts.length > 0 && (
            <div className="drawer-switchboard">
              <strong>Switchboard:</strong> {switchboardParts.join(' · ')}
            </div>
          )}

          <div className="drawer-scenes">
            <div className="drawer-scenes-label">Quick scenes for this room:</div>
            <ScenePresets roomId={room.id} />
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build compiles cleanly**
```bash
cd "/Users/sid/Documents/Home Decor/Aerlyn" && npm run build 2>&1 | tail -5
```
Expected: `✓ built in`

- [ ] **Step 4: Commit**
```bash
git add src/features/houseExplorer/RoomDrawer.jsx src/features/houseExplorer/RoomDrawer.css
git commit -m "feat: RoomDrawer bottom sheet with device toggles, switchboard, per-room scenes"
```

---

### Task T7: Wire drawer into App + HouseSvg; mobile global CSS

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Update `src/App.jsx`**

Replace full file:
```jsx
import { useState } from 'react';
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import RoomDrawer from './features/houseExplorer/RoomDrawer.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';

function AppInner() {
  const [drawerRoomId, setDrawerRoomId] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Aerlyn Studio</h1>
        <p>Interactive House Explorer</p>
        <p className="app-intro">
          Build your home room by room, see what automation feels like in Play mode,
          and send the plan straight to Aerlyn — no guesswork.
        </p>
      </header>
      <HomeTypePicker />
      <ModeToggle />
      <ScenePresets />
      <HouseSvg onRoomClick={(id) => setDrawerRoomId(id)} />
      <RoomList />
      <ExportPanel />
      {drawerRoomId && (
        <RoomDrawer roomId={drawerRoomId} onClose={() => setDrawerRoomId(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HomeProvider>
      <AppInner />
    </HomeProvider>
  );
}
```

- [ ] **Step 2: Add mobile breakpoints to `src/styles/global.css`**

Append to end of file:
```css
/* Mobile — drawer + SVG + scene strip */
@media (max-width: 480px) {
  .house-svg-wrap { margin: 8px 0 4px; }
  .scene-pills { gap: 6px; }
  .scene-btn { padding: 5px 10px; font-size: 12px; }
  .drawer { max-height: 72vh; }
  h1 { font-size: 22px; }
}
@media (max-width: 360px) {
  .scene-btn { padding: 4px 8px; font-size: 11px; }
}
```

- [ ] **Step 3: Run full test suite**
```bash
npx vitest run
```
Expected: 69+ tests passing (T1 added tests, total may be 72+)

- [ ] **Step 4: Visual smoke test**
```bash
npm run dev
```
- Pick home type → switch to Play
- Confirm: ModeToggle at top, scene pills below, SVG below that showing device icons when toggled
- Tap a room in SVG → drawer slides up with device toggles + switchboard + per-room scenes
- Tap backdrop → drawer closes
- Resize window to 375px → confirm nothing overflows

- [ ] **Step 5: Commit**
```bash
git add src/App.jsx src/styles/global.css
git commit -m "feat: wire RoomDrawer into App; scene strip above SVG; mobile breakpoints"
```

---

### Task T8: Full regression + tag

**Files:** none

- [ ] **Step 1: Run full suite**
```bash
cd "/Users/sid/Documents/Home Decor/Aerlyn" && npx vitest run
```
Expected: all tests pass. Fix any failures before continuing.

- [ ] **Step 2: Build check**
```bash
npm run build 2>&1 | tail -8
```
Expected: `✓ built in`

- [ ] **Step 3: Tag**
```bash
git tag feature-b-complete
```

- [ ] **Step 4: Update HANDOFF.md**

In `docs/HANDOFF.md`:
- Mark Feature B as COMPLETE
- Update test count
- Update commit log section with T1–T8 commits
- Update architecture file map
- Update state shape (remove `floorPlanImage`, note `applySceneToRoom`)
- Update TL;DR to point to Feature C

- [ ] **Step 5: Commit HANDOFF**
```bash
git add docs/HANDOFF.md
git commit -m "docs: Feature B complete — live control, drawer, speakers, no floor plan"
```
