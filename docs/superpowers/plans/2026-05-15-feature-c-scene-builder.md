# Feature C: Scene Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Scene Builder tab where users can view preset scenes and create custom scenes, then export all scenes to a PDF.

**Architecture:** Extend `home` state with `customScenes[]`. Four new reducer actions handle CRUD. A new `SceneBuilder` feature component renders preset + custom scene cards. A new `exportScenesPdf` lib function generates the PDF download.

**Tech Stack:** React 18 + Vite, Vitest, jsPDF (already installed), CSS custom properties.

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/features/sceneBuilder/SceneBuilder.jsx` |
| Create | `src/features/sceneBuilder/SceneBuilder.css` |
| Create | `src/lib/exportScenesPdf.js` |
| Create | `src/lib/__tests__/exportScenesPdf.test.js` |
| Modify | `src/context/homeReducer.js` — add `customScenes` to `initialHome` + 4 new cases |
| Modify | `src/context/HomeContext.jsx` — 4 new action creators |
| Modify | `src/context/__tests__/homeReducer.test.js` — tests for new actions |
| Modify | `src/App.jsx` — render SceneBuilder below ExportPanel |

---

### Task 1: customScenes in initialHome + ADD_CUSTOM_SCENE

**Files:**
- Modify: `src/context/homeReducer.js`
- Modify: `src/context/__tests__/homeReducer.test.js`

- [ ] **Step 1: Write failing test**

Open `src/context/__tests__/homeReducer.test.js`. Add at the bottom of the file:

```js
// --- customScenes ---
describe('ADD_CUSTOM_SCENE', () => {
  it('adds a scene with given name and empty deviceStates', () => {
    const state = homeReducer(initialHome, {
      type: 'ADD_CUSTOM_SCENE',
      payload: { name: 'Dinner Party' },
    });
    expect(state.customScenes).toHaveLength(1);
    expect(state.customScenes[0].name).toBe('Dinner Party');
    expect(state.customScenes[0].deviceStates).toEqual({});
    expect(state.customScenes[0].id).toMatch(/^scene-/);
    expect(state.customScenes[0].icon).toBe('✨');
  });

  it('initialHome has empty customScenes array', () => {
    expect(initialHome.customScenes).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — confirm FAIL**

```
npm test -- homeReducer
```

Expected: FAIL — `Cannot read properties of undefined (reading 'customScenes')`

- [ ] **Step 3: Add `customScenes` to initialHome and ADD_CUSTOM_SCENE case**

In `src/context/homeReducer.js`, find `initialHome` and add `customScenes: []` to it:

```js
export const initialHome = {
  homeType: null,
  floorPlanImage: null,
  mode: 'build',
  rooms: [],
  customScenes: [],          // ← add this line
};
```

Then in the `homeReducer` switch, add before the `default:` case:

```js
case 'ADD_CUSTOM_SCENE': {
  const id = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    ...state,
    customScenes: [
      ...state.customScenes,
      { id, name: action.payload.name, icon: '✨', deviceStates: {} },
    ],
  };
}
```

- [ ] **Step 4: Run test — confirm PASS**

```
npm test -- homeReducer
```

Expected: all existing tests + new 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/homeReducer.js src/context/__tests__/homeReducer.test.js
git commit -m "feat: add customScenes to initialHome + ADD_CUSTOM_SCENE reducer"
```

---

### Task 2: REMOVE_CUSTOM_SCENE + RENAME_CUSTOM_SCENE

**Files:**
- Modify: `src/context/homeReducer.js`
- Modify: `src/context/__tests__/homeReducer.test.js`

- [ ] **Step 1: Write failing tests**

Add to `homeReducer.test.js`:

```js
describe('REMOVE_CUSTOM_SCENE', () => {
  it('removes a scene by id', () => {
    const base = homeReducer(initialHome, {
      type: 'ADD_CUSTOM_SCENE',
      payload: { name: 'Test Scene' },
    });
    const id = base.customScenes[0].id;
    const state = homeReducer(base, { type: 'REMOVE_CUSTOM_SCENE', payload: { id } });
    expect(state.customScenes).toHaveLength(0);
  });

  it('leaves other scenes intact', () => {
    let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'A' } });
    state = homeReducer(state, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'B' } });
    const id = state.customScenes[0].id;
    state = homeReducer(state, { type: 'REMOVE_CUSTOM_SCENE', payload: { id } });
    expect(state.customScenes).toHaveLength(1);
    expect(state.customScenes[0].name).toBe('B');
  });
});

describe('RENAME_CUSTOM_SCENE', () => {
  it('updates name of matching scene', () => {
    let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Old' } });
    const id = state.customScenes[0].id;
    state = homeReducer(state, { type: 'RENAME_CUSTOM_SCENE', payload: { id, name: 'New' } });
    expect(state.customScenes[0].name).toBe('New');
  });
});
```

- [ ] **Step 2: Run test — confirm FAIL**

```
npm test -- homeReducer
```

Expected: FAIL — unknown action type

- [ ] **Step 3: Add cases to homeReducer**

```js
case 'REMOVE_CUSTOM_SCENE':
  return {
    ...state,
    customScenes: state.customScenes.filter((s) => s.id !== action.payload.id),
  };

case 'RENAME_CUSTOM_SCENE':
  return {
    ...state,
    customScenes: state.customScenes.map((s) =>
      s.id === action.payload.id ? { ...s, name: action.payload.name } : s
    ),
  };
```

- [ ] **Step 4: Run test — confirm PASS**

```
npm test -- homeReducer
```

- [ ] **Step 5: Commit**

```bash
git add src/context/homeReducer.js src/context/__tests__/homeReducer.test.js
git commit -m "feat: REMOVE_CUSTOM_SCENE + RENAME_CUSTOM_SCENE reducers"
```

---

### Task 3: SET_SCENE_DEVICE_STATE

**Files:**
- Modify: `src/context/homeReducer.js`
- Modify: `src/context/__tests__/homeReducer.test.js`

- [ ] **Step 1: Write failing test**

```js
describe('SET_SCENE_DEVICE_STATE', () => {
  it('sets a device on/off inside a custom scene', () => {
    let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Test' } });
    const id = state.customScenes[0].id;
    state = homeReducer(state, {
      type: 'SET_SCENE_DEVICE_STATE',
      payload: { sceneId: id, deviceId: 'cct-light', on: true },
    });
    expect(state.customScenes[0].deviceStates['cct-light']).toBe(true);
  });

  it('updates existing device state', () => {
    let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Test' } });
    const id = state.customScenes[0].id;
    state = homeReducer(state, {
      type: 'SET_SCENE_DEVICE_STATE',
      payload: { sceneId: id, deviceId: 'cct-light', on: true },
    });
    state = homeReducer(state, {
      type: 'SET_SCENE_DEVICE_STATE',
      payload: { sceneId: id, deviceId: 'cct-light', on: false },
    });
    expect(state.customScenes[0].deviceStates['cct-light']).toBe(false);
  });

  it('does not mutate other scenes', () => {
    let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'A' } });
    state = homeReducer(state, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'B' } });
    const idA = state.customScenes[0].id;
    state = homeReducer(state, {
      type: 'SET_SCENE_DEVICE_STATE',
      payload: { sceneId: idA, deviceId: 'cct-light', on: true },
    });
    expect(state.customScenes[1].deviceStates['cct-light']).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test — confirm FAIL**

```
npm test -- homeReducer
```

- [ ] **Step 3: Add case**

```js
case 'SET_SCENE_DEVICE_STATE':
  return {
    ...state,
    customScenes: state.customScenes.map((s) => {
      if (s.id !== action.payload.sceneId) return s;
      return {
        ...s,
        deviceStates: { ...s.deviceStates, [action.payload.deviceId]: action.payload.on },
      };
    }),
  };
```

- [ ] **Step 4: Run test — confirm PASS**

```
npm test -- homeReducer
```

- [ ] **Step 5: Commit**

```bash
git add src/context/homeReducer.js src/context/__tests__/homeReducer.test.js
git commit -m "feat: SET_SCENE_DEVICE_STATE reducer"
```

---

### Task 4: Action creators in HomeContext

**Files:**
- Modify: `src/context/HomeContext.jsx`

- [ ] **Step 1: Open HomeContext.jsx**

Find the `actions` object returned by `useHome()` (or the actions spread in `HomeProvider`). The existing actions look like:

```js
const actions = {
  setHomeType: (homeType) => dispatch({ type: 'SET_HOME_TYPE', payload: { homeType } }),
  // ...
};
```

- [ ] **Step 2: Add 4 new action creators**

```js
addCustomScene: (name) =>
  dispatch({ type: 'ADD_CUSTOM_SCENE', payload: { name } }),
removeCustomScene: (id) =>
  dispatch({ type: 'REMOVE_CUSTOM_SCENE', payload: { id } }),
renameCustomScene: (id, name) =>
  dispatch({ type: 'RENAME_CUSTOM_SCENE', payload: { id, name } }),
setSceneDeviceState: (sceneId, deviceId, on) =>
  dispatch({ type: 'SET_SCENE_DEVICE_STATE', payload: { sceneId, deviceId, on } }),
```

- [ ] **Step 3: Run all tests — confirm still PASS**

```
npm test
```

- [ ] **Step 4: Commit**

```bash
git add src/context/HomeContext.jsx
git commit -m "feat: addCustomScene / removeCustomScene / renameCustomScene / setSceneDeviceState action creators"
```

---

### Task 5: exportScenesPdf

**Files:**
- Create: `src/lib/exportScenesPdf.js`
- Create: `src/lib/__tests__/exportScenesPdf.test.js`

- [ ] **Step 1: Write failing test**

Create `src/lib/__tests__/exportScenesPdf.test.js`:

```js
import { vi } from 'vitest';
import { buildScenesPdfPayload } from '../exportScenesPdf.js';
import { SCENES } from '../../data/scenes.js';

describe('buildScenesPdfPayload', () => {
  it('returns preset scenes labelled preset:true', () => {
    const result = buildScenesPdfPayload([]);
    expect(result).toHaveLength(SCENES.length);
    expect(result[0].preset).toBe(true);
    expect(result[0].name).toBe('Good Morning');
  });

  it('appends custom scenes after presets, labelled preset:false', () => {
    const custom = [{ id: 'c1', name: 'Party', icon: '🎉', deviceStates: { 'rgbw-strip': true } }];
    const result = buildScenesPdfPayload(custom);
    expect(result).toHaveLength(SCENES.length + 1);
    const last = result[result.length - 1];
    expect(last.name).toBe('Party');
    expect(last.preset).toBe(false);
    expect(last.deviceStates['rgbw-strip']).toBe(true);
  });

  it('empty custom scenes returns only presets', () => {
    const result = buildScenesPdfPayload([]);
    expect(result.every((s) => s.preset)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — confirm FAIL**

```
npm test -- exportScenesPdf
```

Expected: FAIL — `buildScenesPdfPayload` not defined

- [ ] **Step 3: Create exportScenesPdf.js**

Create `src/lib/exportScenesPdf.js`:

```js
import jsPDF from 'jspdf';
import { SCENES } from '../data/scenes.js';

export function buildScenesPdfPayload(customScenes) {
  return [
    ...SCENES.map((s) => ({ ...s, preset: true })),
    ...customScenes.map((s) => ({ ...s, preset: false })),
  ];
}

export function downloadScenesPdf(customScenes) {
  const scenes = buildScenesPdfPayload(customScenes);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 14;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Aerlyn — Scenes & Automations', left, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y);
  y += 10;

  for (const scene of scenes) {
    if (y > 260) { pdf.addPage(); y = 18; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    const label = scene.preset ? ` ${scene.name}  (preset)` : ` ${scene.name}  (custom)`;
    pdf.text(label, left, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const entries = Object.entries(scene.deviceStates);
    if (entries.length === 0) {
      pdf.text('   — no devices configured', left, y);
      y += 5;
    }
    for (const [deviceId, on] of entries) {
      pdf.text(`   ${deviceId}: ${on ? 'ON' : 'OFF'}`, left, y);
      y += 5;
      if (y > 280) { pdf.addPage(); y = 18; }
    }
    y += 4;
  }

  pdf.save(`aerlyn-scenes-${Date.now()}.pdf`);
}
```

- [ ] **Step 4: Run test — confirm PASS**

```
npm test -- exportScenesPdf
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportScenesPdf.js src/lib/__tests__/exportScenesPdf.test.js
git commit -m "feat: exportScenesPdf — buildScenesPdfPayload + downloadScenesPdf"
```

---

### Task 6: SceneBuilder component — preset scene cards

**Files:**
- Create: `src/features/sceneBuilder/SceneBuilder.jsx`
- Create: `src/features/sceneBuilder/SceneBuilder.css`

- [ ] **Step 1: Create SceneBuilder.css**

Create `src/features/sceneBuilder/SceneBuilder.css`:

```css
.scene-builder { padding: 24px 0; }
.scene-builder h2 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--fg); margin: 0 0 4px; }
.scene-builder .sb-sub { font-size: 0.82rem; color: var(--muted); margin: 0 0 20px; }

.sb-section-label { font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--teal); font-weight: 600; margin: 24px 0 10px; }

.sb-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }

.sb-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
.sb-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sb-card-icon { font-size: 1.5rem; }
.sb-card-name { font-weight: 600; font-size: 0.95rem; color: var(--fg); flex: 1; }
.sb-card-name input { background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--fg); font-size: 0.95rem; font-weight: 600; width: 100%; outline: none; padding: 2px 0; }

.sb-device-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 0.82rem; color: var(--muted); }
.sb-device-row:last-child { border-bottom: none; }
.sb-device-name { flex: 1; }
.sb-device-state { font-weight: 600; }
.sb-device-state.on { color: var(--teal); }
.sb-device-state.off { color: var(--muted); }

.sb-device-toggle { background: none; border: 1px solid var(--border); border-radius: 20px; padding: 3px 10px; font-size: 0.75rem; cursor: pointer; color: var(--muted); transition: all 0.15s; }
.sb-device-toggle[aria-pressed="true"] { background: var(--teal); border-color: var(--teal); color: #000; }

.sb-remove-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.8rem; padding: 4px 8px; border-radius: 8px; margin-top: 10px; }
.sb-remove-btn:hover { color: var(--rose, #F43F5E); }

.sb-add-form { display: flex; gap: 8px; margin-top: 8px; }
.sb-add-input { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--fg); font-size: 0.9rem; outline: none; }
.sb-add-input:focus { border-color: var(--teal); }
.sb-add-btn { background: var(--teal); color: #000; border: none; border-radius: 10px; padding: 8px 16px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }

.sb-export-row { margin-top: 20px; display: flex; justify-content: flex-end; }
.sb-export-btn { background: var(--teal); color: #000; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 700; font-size: 0.9rem; cursor: pointer; }
```

- [ ] **Step 2: Create SceneBuilder.jsx — preset cards only**

Create `src/features/sceneBuilder/SceneBuilder.jsx`:

```jsx
import { SCENES } from '../../data/scenes.js';
import { DEVICES } from '../../data/devices.js';
import './SceneBuilder.css';

function deviceName(deviceId) {
  const d = DEVICES.find((x) => x.id === deviceId);
  return d ? d.name : deviceId;
}

function PresetSceneCard({ scene }) {
  const entries = Object.entries(scene.deviceStates);
  return (
    <div className="sb-card">
      <div className="sb-card-header">
        <span className="sb-card-icon">{scene.icon}</span>
        <span className="sb-card-name">{scene.name}</span>
      </div>
      {entries.map(([deviceId, on]) => (
        <div key={deviceId} className="sb-device-row">
          <span className="sb-device-name">{deviceName(deviceId)}</span>
          <span className={`sb-device-state ${on ? 'on' : 'off'}`}>{on ? 'ON' : 'OFF'}</span>
        </div>
      ))}
      {entries.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No devices</p>}
    </div>
  );
}

export default function SceneBuilder() {
  return (
    <div className="scene-builder">
      <h2>Scene Builder</h2>
      <p className="sb-sub">View preset automations and create your own custom scenes.</p>

      <div className="sb-section-label">Preset Scenes</div>
      <div className="sb-cards">
        {SCENES.map((scene) => (
          <PresetSceneCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into App.jsx temporarily to verify render**

In `src/App.jsx`, import SceneBuilder and render it below ExportPanel:

```jsx
import SceneBuilder from './features/sceneBuilder/SceneBuilder.jsx';
// ...
// in the JSX, after <ExportPanel />:
<SceneBuilder />
```

- [ ] **Step 4: Run dev server — visually verify preset cards render**

```
npm run dev
```

Open localhost:5173. Scroll down — three preset scene cards (Good Morning, Movie Night, Good Night) should appear with their device rows.

- [ ] **Step 5: Run all tests — confirm PASS**

```
npm test
```

- [ ] **Step 6: Commit**

```bash
git add src/features/sceneBuilder/ src/App.jsx
git commit -m "feat: SceneBuilder component — preset scene cards"
```

---

### Task 7: Custom scene creation + device toggles

**Files:**
- Modify: `src/features/sceneBuilder/SceneBuilder.jsx`

- [ ] **Step 1: Add CustomSceneCard and scene creation form to SceneBuilder.jsx**

Replace the contents of `SceneBuilder.jsx` with:

```jsx
import { useState } from 'react';
import { SCENES } from '../../data/scenes.js';
import { DEVICES } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import './SceneBuilder.css';

function deviceName(deviceId) {
  const d = DEVICES.find((x) => x.id === deviceId);
  return d ? d.name : deviceId;
}

function PresetSceneCard({ scene }) {
  const entries = Object.entries(scene.deviceStates);
  return (
    <div className="sb-card">
      <div className="sb-card-header">
        <span className="sb-card-icon">{scene.icon}</span>
        <span className="sb-card-name">{scene.name}</span>
      </div>
      {entries.map(([deviceId, on]) => (
        <div key={deviceId} className="sb-device-row">
          <span className="sb-device-name">{deviceName(deviceId)}</span>
          <span className={`sb-device-state ${on ? 'on' : 'off'}`}>{on ? 'ON' : 'OFF'}</span>
        </div>
      ))}
      {entries.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No devices</p>}
    </div>
  );
}

function CustomSceneCard({ scene }) {
  const { actions } = useHome();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(scene.name);

  function handleNameBlur() {
    if (draftName.trim()) actions.renameCustomScene(scene.id, draftName.trim());
    setEditing(false);
  }

  function handleRemove() {
    if (window.confirm(`Remove scene "${scene.name}"?`)) {
      actions.removeCustomScene(scene.id);
    }
  }

  return (
    <div className="sb-card">
      <div className="sb-card-header">
        <span className="sb-card-icon">{scene.icon}</span>
        <span className="sb-card-name">
          {editing ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            />
          ) : (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {scene.name}
            </span>
          )}
        </span>
      </div>
      {DEVICES.map((device) => {
        const on = scene.deviceStates[device.id] ?? false;
        return (
          <div key={device.id} className="sb-device-row">
            <span className="sb-device-name">{device.name}</span>
            <button
              type="button"
              className="sb-device-toggle"
              aria-pressed={on}
              onClick={() => actions.setSceneDeviceState(scene.id, device.id, !on)}
            >
              {on ? 'ON' : 'OFF'}
            </button>
          </div>
        );
      })}
      <button type="button" className="sb-remove-btn" onClick={handleRemove}>
        Remove scene
      </button>
    </div>
  );
}

function AddSceneForm() {
  const { actions } = useHome();
  const [name, setName] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    actions.addCustomScene(trimmed);
    setName('');
  }

  return (
    <div className="sb-add-form">
      <input
        type="text"
        className="sb-add-input"
        placeholder="Scene name (e.g. Dinner Party)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button type="button" className="sb-add-btn" onClick={handleAdd}>
        + Add Scene
      </button>
    </div>
  );
}

export default function SceneBuilder() {
  const { home } = useHome();

  return (
    <div className="scene-builder">
      <h2>Scene Builder</h2>
      <p className="sb-sub">View preset automations and create your own custom scenes.</p>

      <div className="sb-section-label">Preset Scenes</div>
      <div className="sb-cards">
        {SCENES.map((scene) => (
          <PresetSceneCard key={scene.id} scene={scene} />
        ))}
      </div>

      <div className="sb-section-label">Custom Scenes</div>
      <div className="sb-cards">
        {home.customScenes.map((scene) => (
          <CustomSceneCard key={scene.id} scene={scene} />
        ))}
      </div>
      <AddSceneForm />
    </div>
  );
}
```

- [ ] **Step 2: Run dev server — test custom scene flow**

```
npm run dev
```

1. Scroll to Scene Builder
2. Type a scene name, press Enter or click "+ Add Scene"
3. Card appears with all devices as OFF toggles
4. Click toggles — they switch ON/OFF
5. Click scene name — inline edit, rename
6. Click "Remove scene" — confirm dialog, card disappears

- [ ] **Step 3: Run all tests — confirm PASS**

```
npm test
```

- [ ] **Step 4: Commit**

```bash
git add src/features/sceneBuilder/SceneBuilder.jsx
git commit -m "feat: custom scene creation, rename, device toggles, remove"
```

---

### Task 8: PDF export + App.jsx final wiring + regression

**Files:**
- Modify: `src/features/sceneBuilder/SceneBuilder.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add PDF export button to SceneBuilder**

In `SceneBuilder.jsx`, import `downloadScenesPdf`:

```jsx
import { downloadScenesPdf } from '../../lib/exportScenesPdf.js';
```

At the bottom of `SceneBuilder()`, after `<AddSceneForm />`, add:

```jsx
<div className="sb-export-row">
  <button
    type="button"
    className="sb-export-btn"
    onClick={() => downloadScenesPdf(home.customScenes)}
  >
    Download Scenes PDF
  </button>
</div>
```

- [ ] **Step 2: Run dev server — test PDF export**

```
npm run dev
```

1. Click "Download Scenes PDF"
2. PDF downloads — opens in viewer
3. Verify: Good Morning, Movie Night, Good Night with device states; any custom scenes appended

- [ ] **Step 3: Run full test suite**

```
npm test
```

All tests must PASS.

- [ ] **Step 4: Run build — confirm clean**

```
npm run build
```

Expected: no errors, dist/ generated.

- [ ] **Step 5: Tag and update HANDOFF**

```bash
git tag feature-c-complete
```

Update `docs/HANDOFF.md` — change Feature C status from "not started" to "COMPLETE", note 73+ tests passing, feature-c branch tag.

- [ ] **Step 6: Commit**

```bash
git add src/features/sceneBuilder/SceneBuilder.jsx src/App.jsx docs/HANDOFF.md
git commit -m "feat: Scene Builder PDF export + feature-c-complete tag"
```
