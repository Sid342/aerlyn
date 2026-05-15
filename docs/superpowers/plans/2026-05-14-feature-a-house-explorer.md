# Feature A — Interactive House Explorer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Interactive House Explorer — sales/education tool where a user picks a home type, shapes the room list, declares devices per room, plays with them, and exports an order.

**Architecture:** React + Vite single-page app, client-side only. One `HomeContext` (useReducer) holds the entire `Home` model. Pure-logic modules (reducer, templates, exporters) are unit-tested with Vitest; UI components are verified by `npm run build` + manual browser check — mirroring the nRF54L05 "implement step → build → bench-validate" cadence. Built in 4 phases; Phase 1 alone is a usable ordering tool.

**Tech Stack:** React 18, Vite, Vitest, jsPDF (PDF export), Formspree (email), plain CSS with brand custom properties. JavaScript (not TypeScript) — matches the feturtles source and keeps the build simple.

---

## Conventions

- **Repo:** `/Users/sid/Documents/Home Decor/Aerlyn`, branch `main`, remote `origin`.
- **Per-phase branches:** each phase is developed on `feature-a/phase-N`, merged to `main` at the phase boundary, then pushed. Mirrors the 54L05 step-branch workflow.
- **Commits:** every task ends with a commit. Phase-boundary commits also push.
- **Testing:** logic tasks are TDD (write failing test → see it fail → implement → see it pass). UI tasks end with `npm run build` (must succeed) + a stated manual browser check.
- **Brand tokens** (used everywhere): teal `#00C8B4`, amber `#F59E0B`, rose `#F43F5E`, bg `#080810`, surface `#0f0f1a`. Fonts: DM Serif Display (headings), Outfit (body), DM Mono (numbers).

---

## File Structure

```
Aerlyn/
  index.html                       Vite entry HTML
  package.json                     deps + scripts
  vite.config.js                   Vite + Vitest config
  src/
    main.jsx                       React mount
    App.jsx                        layout: header + house + rooms + export
    styles/
      global.css                   brand tokens, resets, fonts
    data/
      devices.js                   device catalog (DEVICES, getDevice)
      templates.js                 BHK templates, seedDevices()
    context/
      HomeContext.jsx              HomeProvider, useHome, reducer, actions
      homeReducer.js               pure reducer (unit-tested)
    lib/
      exportJson.js                Home -> export payload + download
      exportPdf.js                 Home -> PDF summary
      sendFormspree.js             Home -> email POST
    features/houseExplorer/
      HomeTypePicker.jsx           pick 1/2/3BHK/Villa
      RoomList.jsx                 add/remove rooms, renders RoomCards
      RoomCard.jsx                 one room: name, size, device list
      DeviceRow.jsx                one device: qty stepper / play toggle
      AddDeviceMenu.jsx            pick a device to add to a room
      HouseSvg.jsx                 stylized dollhouse header
      ModeToggle.jsx               Build / Play switch
      ScenePresets.jsx             Good Morning / Movie / Good Night
      FloorPlanUpload.jsx          reference-image upload panel
      ExportPanel.jsx              review + export actions
      DeviceInfo.jsx               "what this enables" tooltip
  src/**/__tests__/*.test.js       Vitest specs
```

---

# PHASE 1 — Working Skeleton

End state: app boots, pick home type → editable rooms with seeded devices → adjust quantities → export JSON + PDF + email. No animation.

---

### Task 1: Scaffold the Vite React app

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles/global.css`

- [ ] **Step 1: Create the branch**

```bash
cd "/Users/sid/Documents/Home Decor/Aerlyn"
git checkout -b feature-a/phase-1
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "aerlyn-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "jspdf": "^2.5.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, no error exit.

- [ ] **Step 4: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.js'],
  },
});
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <title>Aerlyn Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/styles/global.css`**

```css
:root {
  --teal: #00C8B4;
  --amber: #F59E0B;
  --rose: #F43F5E;
  --bg: #080810;
  --surface: #0f0f1a;
  --surface-2: #16162a;
  --text: #ECECF1;
  --text-dim: #9A9AB0;
  --border: #26263c;
  --font-head: 'DM Serif Display', Georgia, serif;
  --font-body: 'Outfit', system-ui, sans-serif;
  --font-mono: 'DM Mono', ui-monospace, monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { font-family: var(--font-head); font-weight: 400; }
button { font-family: var(--font-body); cursor: pointer; }
.num { font-family: var(--font-mono); }
.app { max-width: 1100px; margin: 0 auto; padding: 24px 20px 96px; }
.app-header { padding: 12px 0 28px; }
.app-header h1 { font-size: 2rem; color: var(--teal); }
.app-header p { color: var(--text-dim); margin-top: 4px; }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
}
```

- [ ] **Step 7: Create `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 8: Create `src/App.jsx` (placeholder)**

```jsx
export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Aerlyn Studio</h1>
        <p>Interactive House Explorer</p>
      </header>
      <div className="card">Scaffold OK.</div>
    </div>
  );
}
```

- [ ] **Step 9: Verify build + dev server**

Run: `npm run build`
Expected: PASS — `dist/` created, no errors.
Run: `npm run dev`, open the printed localhost URL.
Expected: page shows "Aerlyn Studio" heading in teal and a "Scaffold OK." card on near-black bg.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/
git commit -m "feat: scaffold Vite React app with brand styles"
```

---

### Task 2: Device catalog

**Files:**
- Create: `src/data/devices.js`
- Test: `src/data/__tests__/devices.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/data/__tests__/devices.test.js
import { describe, it, expect } from 'vitest';
import { DEVICES, getDevice } from '../devices.js';

describe('device catalog', () => {
  it('has unique ids', () => {
    const ids = DEVICES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every device has required fields', () => {
    for (const d of DEVICES) {
      expect(d.id && d.name && d.category && d.icon && d.blurb).toBeTruthy();
      expect(Array.isArray(d.defaultRooms)).toBe(true);
    }
  });
  it('getDevice resolves by id', () => {
    expect(getDevice('smart-switch').name).toBe('Smart Switch / Dimmer');
  });
  it('getDevice returns undefined for unknown id', () => {
    expect(getDevice('nope')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- devices`
Expected: FAIL — cannot resolve `../devices.js`.

- [ ] **Step 3: Create `src/data/devices.js`**

```js
// roomType values: living | bedroom | kitchen | bath | entrance | balcony | other
export const DEVICES = [
  { id: 'smart-switch', name: 'Smart Switch / Dimmer', category: 'Lighting', icon: '\u{1F4A1}',
    blurb: 'Control any light or appliance — tap, app, voice, or schedule.',
    defaultRooms: ['living', 'bedroom', 'kitchen', 'bath', 'entrance', 'balcony', 'other'] },
  { id: 'cct-light', name: 'Tunable White Light', category: 'Lighting', icon: '\u{1F506}',
    blurb: 'Shifts warm-to-cool through the day — energising mornings, calm nights.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'rgbw-strip', name: 'RGBW Strip Light', category: 'Lighting', icon: '\u{1F308}',
    blurb: 'Accent and mood lighting in any colour for scenes and movie nights.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'bldc-fan', name: 'BLDC Smart Fan', category: 'Comfort', icon: '\u{1F300}',
    blurb: 'Speed control by app, schedule, or scene — sleeps when you sleep.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'ac-ir', name: 'AC (IR Controller)', category: 'Comfort', icon: '❄️',
    blurb: 'Makes any IR-remote AC smart — pre-cool the room before you walk in.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'curtain', name: 'Motorised Curtain', category: 'Comfort', icon: '\u{1FA9F}',
    blurb: 'Curtains that open to the sunrise and close at dusk on their own.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'geyser', name: 'Smart Geyser Control', category: 'Water', icon: '\u{1F6BF}',
    blurb: 'Hot water ready exactly when you need it — never left on by mistake.',
    defaultRooms: ['bath'] },
  { id: 'door-lock', name: 'Smart Door Lock', category: 'Security', icon: '\u{1F512}',
    blurb: 'Keyless entry, remote unlock for guests, and a full entry log.',
    defaultRooms: ['entrance'] },
  { id: 'camera', name: '5MP Camera', category: 'Security', icon: '\u{1F4F7}',
    blurb: 'See your home live from anywhere, with motion alerts.',
    defaultRooms: ['entrance', 'living'] },
  { id: 'motion-sensor', name: 'Motion Sensor', category: 'Security', icon: '\u{1F6B6}',
    blurb: 'Triggers lights and scenes automatically — and watches while you are away.',
    defaultRooms: ['entrance', 'living', 'bath'] },
  { id: 'gas-sensor', name: 'Gas / Smoke Sensor', category: 'Security', icon: '\u{1F525}',
    blurb: 'Early warning for gas leaks and smoke — safety that never sleeps.',
    defaultRooms: ['kitchen'] },
  { id: 'energy-meter', name: 'Smart Energy Meter', category: 'Energy', icon: '⚡',
    blurb: 'See exactly what is consuming power, in real time.',
    defaultRooms: ['other'] },
  { id: 'scene-remote', name: 'Scene Remote', category: 'Control', icon: '\u{1F39B}️',
    blurb: 'One-tap scenes on the wall — no phone needed.',
    defaultRooms: ['living', 'bedroom', 'entrance'] },
  { id: 'voice', name: 'Voice Control', category: 'Control', icon: '\u{1F5E3}️',
    blurb: 'Works with Alexa, Google, and Siri — just say it.',
    defaultRooms: ['living', 'bedroom'] },
];

const BY_ID = Object.fromEntries(DEVICES.map((d) => [d.id, d]));
export function getDevice(id) {
  return BY_ID[id];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- devices`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/data/devices.js src/data/__tests__/devices.test.js
git commit -m "feat: device catalog with lookup"
```

---

### Task 3: Room templates + device seeding

**Files:**
- Create: `src/data/templates.js`
- Test: `src/data/__tests__/templates.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/data/__tests__/templates.test.js
import { describe, it, expect } from 'vitest';
import { TEMPLATES, HOME_TYPES, seedDevices, buildRooms } from '../templates.js';

describe('templates', () => {
  it('exposes the four home types', () => {
    expect(HOME_TYPES).toEqual(['1BHK', '2BHK', '3BHK', 'Villa']);
  });
  it('every home type has a non-empty room template', () => {
    for (const t of HOME_TYPES) {
      expect(TEMPLATES[t].length).toBeGreaterThan(0);
    }
  });
  it('seedDevices returns devices whose defaultRooms include the roomType', () => {
    const seeded = seedDevices('bath');
    expect(seeded.some((d) => d.deviceId === 'geyser')).toBe(true);
    expect(seeded.every((d) => d.qty === 1 && d.on === false)).toBe(true);
  });
  it('buildRooms returns rooms with unique ids and seeded devices', () => {
    const rooms = buildRooms('2BHK');
    const ids = rooms.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(rooms.every((r) => Array.isArray(r.devices))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- templates`
Expected: FAIL — cannot resolve `../templates.js`.

- [ ] **Step 3: Create `src/data/templates.js`**

```js
import { DEVICES } from './devices.js';

export const HOME_TYPES = ['1BHK', '2BHK', '3BHK', 'Villa'];

// each template entry: [displayName, roomType, size]
export const TEMPLATES = {
  '1BHK': [
    ['Living Room', 'living', 'L'],
    ['Bedroom', 'bedroom', 'M'],
    ['Kitchen', 'kitchen', 'S'],
    ['Bathroom', 'bath', 'S'],
    ['Entrance', 'entrance', 'S'],
  ],
  '2BHK': [
    ['Living Room', 'living', 'L'],
    ['Master Bedroom', 'bedroom', 'M'],
    ['Bedroom 2', 'bedroom', 'M'],
    ['Kitchen', 'kitchen', 'M'],
    ['Bathroom', 'bath', 'S'],
    ['Entrance', 'entrance', 'S'],
  ],
  '3BHK': [
    ['Living Room', 'living', 'L'],
    ['Master Bedroom', 'bedroom', 'L'],
    ['Bedroom 2', 'bedroom', 'M'],
    ['Bedroom 3', 'bedroom', 'M'],
    ['Kitchen', 'kitchen', 'M'],
    ['Bathroom 1', 'bath', 'S'],
    ['Bathroom 2', 'bath', 'S'],
    ['Entrance', 'entrance', 'S'],
  ],
  'Villa': [
    ['Living Room', 'living', 'L'],
    ['Master Bedroom', 'bedroom', 'L'],
    ['Bedroom 2', 'bedroom', 'M'],
    ['Bedroom 3', 'bedroom', 'M'],
    ['Kitchen', 'kitchen', 'L'],
    ['Bathroom 1', 'bath', 'S'],
    ['Bathroom 2', 'bath', 'S'],
    ['Entrance', 'entrance', 'M'],
    ['Balcony', 'balcony', 'M'],
    ['Study', 'other', 'M'],
  ],
};

// devices whose defaultRooms include this roomType, each at qty 1, off
export function seedDevices(roomType) {
  return DEVICES.filter((d) => d.defaultRooms.includes(roomType)).map((d) => ({
    deviceId: d.id,
    qty: 1,
    on: false,
  }));
}

let roomCounter = 0;
function nextId() {
  roomCounter += 1;
  return `room-${roomCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildRooms(homeType) {
  return (TEMPLATES[homeType] || []).map(([name, roomType, size]) => ({
    id: nextId(),
    name,
    roomType,
    size,
    devices: seedDevices(roomType),
  }));
}

// exported for use by the reducer when the user adds a blank room
export function makeRoom(name, roomType, size = 'M') {
  return { id: nextId(), name, roomType, size, devices: seedDevices(roomType) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- templates`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/data/templates.js src/data/__tests__/templates.test.js
git commit -m "feat: room templates and device seeding"
```

---

### Task 4: Home reducer

**Files:**
- Create: `src/context/homeReducer.js`
- Test: `src/context/__tests__/homeReducer.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/context/__tests__/homeReducer.test.js
import { describe, it, expect } from 'vitest';
import { homeReducer, initialHome, actions } from '../homeReducer.js';

function withHome(type = '2BHK') {
  return homeReducer(initialHome, actions.setHomeType(type));
}

describe('homeReducer', () => {
  it('starts with no home type and no rooms', () => {
    expect(initialHome.homeType).toBe(null);
    expect(initialHome.rooms).toEqual([]);
    expect(initialHome.mode).toBe('build');
  });
  it('setHomeType loads the template rooms', () => {
    const s = withHome('1BHK');
    expect(s.homeType).toBe('1BHK');
    expect(s.rooms.length).toBe(5);
  });
  it('addRoom appends a room', () => {
    const s = homeReducer(withHome(), actions.addRoom('Pooja Room', 'other'));
    expect(s.rooms[s.rooms.length - 1].name).toBe('Pooja Room');
  });
  it('removeRoom deletes by id', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.removeRoom(id));
    expect(s1.rooms.find((r) => r.id === id)).toBeUndefined();
  });
  it('renameRoom changes the name', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.renameRoom(id, 'Drawing Room'));
    expect(s1.rooms.find((r) => r.id === id).name).toBe('Drawing Room');
  });
  it('setRoomSize updates size', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.setRoomSize(id, 'S'));
    expect(s1.rooms.find((r) => r.id === id).size).toBe('S');
  });
  it('addDevice adds a device at qty 1; adding again bumps qty', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.addDevice(id, 'energy-meter'));
    const dev = s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === 'energy-meter');
    expect(dev.qty).toBe(1);
    const s2 = homeReducer(s1, actions.addDevice(id, 'energy-meter'));
    expect(s2.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === 'energy-meter').qty).toBe(2);
  });
  it('setDeviceQty clamps to >= 1', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const dId = s0.rooms[0].devices[0].deviceId;
    const s1 = homeReducer(s0, actions.setDeviceQty(id, dId, 0));
    expect(s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === dId).qty).toBe(1);
  });
  it('removeDevice removes the device entry', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const dId = s0.rooms[0].devices[0].deviceId;
    const s1 = homeReducer(s0, actions.removeDevice(id, dId));
    expect(s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === dId)).toBeUndefined();
  });
  it('toggleDevice flips the on flag', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const dId = s0.rooms[0].devices[0].deviceId;
    const s1 = homeReducer(s0, actions.toggleDevice(id, dId));
    expect(s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === dId).on).toBe(true);
  });
  it('setMode switches mode', () => {
    const s1 = homeReducer(withHome(), actions.setMode('play'));
    expect(s1.mode).toBe('play');
  });
  it('setFloorPlan stores the image data url', () => {
    const s1 = homeReducer(withHome(), actions.setFloorPlan('data:image/png;base64,xxx'));
    expect(s1.floorPlanImage).toBe('data:image/png;base64,xxx');
  });
  it('reset returns to initialHome', () => {
    const s1 = homeReducer(withHome(), actions.reset());
    expect(s1).toEqual(initialHome);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- homeReducer`
Expected: FAIL — cannot resolve `../homeReducer.js`.

- [ ] **Step 3: Create `src/context/homeReducer.js`**

```js
import { buildRooms, makeRoom } from '../data/templates.js';

export const initialHome = {
  homeType: null,
  floorPlanImage: null,
  mode: 'build', // 'build' | 'play'
  rooms: [],
};

export const actions = {
  setHomeType: (homeType) => ({ type: 'SET_HOME_TYPE', homeType }),
  addRoom: (name, roomType) => ({ type: 'ADD_ROOM', name, roomType }),
  removeRoom: (roomId) => ({ type: 'REMOVE_ROOM', roomId }),
  renameRoom: (roomId, name) => ({ type: 'RENAME_ROOM', roomId, name }),
  setRoomSize: (roomId, size) => ({ type: 'SET_ROOM_SIZE', roomId, size }),
  addDevice: (roomId, deviceId) => ({ type: 'ADD_DEVICE', roomId, deviceId }),
  removeDevice: (roomId, deviceId) => ({ type: 'REMOVE_DEVICE', roomId, deviceId }),
  setDeviceQty: (roomId, deviceId, qty) => ({ type: 'SET_DEVICE_QTY', roomId, deviceId, qty }),
  toggleDevice: (roomId, deviceId) => ({ type: 'TOGGLE_DEVICE', roomId, deviceId }),
  setMode: (mode) => ({ type: 'SET_MODE', mode }),
  setFloorPlan: (image) => ({ type: 'SET_FLOOR_PLAN', image }),
  applyScene: (deviceStates) => ({ type: 'APPLY_SCENE', deviceStates }),
  reset: () => ({ type: 'RESET' }),
};

// map over rooms, replacing the one matching roomId
function mapRoom(state, roomId, fn) {
  return { ...state, rooms: state.rooms.map((r) => (r.id === roomId ? fn(r) : r)) };
}

export function homeReducer(state, action) {
  switch (action.type) {
    case 'SET_HOME_TYPE':
      return { ...state, homeType: action.homeType, rooms: buildRooms(action.homeType) };

    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, makeRoom(action.name, action.roomType)] };

    case 'REMOVE_ROOM':
      return { ...state, rooms: state.rooms.filter((r) => r.id !== action.roomId) };

    case 'RENAME_ROOM':
      return mapRoom(state, action.roomId, (r) => ({ ...r, name: action.name }));

    case 'SET_ROOM_SIZE':
      return mapRoom(state, action.roomId, (r) => ({ ...r, size: action.size }));

    case 'ADD_DEVICE':
      return mapRoom(state, action.roomId, (r) => {
        const existing = r.devices.find((d) => d.deviceId === action.deviceId);
        if (existing) {
          return {
            ...r,
            devices: r.devices.map((d) =>
              d.deviceId === action.deviceId ? { ...d, qty: d.qty + 1 } : d
            ),
          };
        }
        return { ...r, devices: [...r.devices, { deviceId: action.deviceId, qty: 1, on: false }] };
      });

    case 'REMOVE_DEVICE':
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.filter((d) => d.deviceId !== action.deviceId),
      }));

    case 'SET_DEVICE_QTY':
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.map((d) =>
          d.deviceId === action.deviceId ? { ...d, qty: Math.max(1, action.qty | 0) } : d
        ),
      }));

    case 'TOGGLE_DEVICE':
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.map((d) =>
          d.deviceId === action.deviceId ? { ...d, on: !d.on } : d
        ),
      }));

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_FLOOR_PLAN':
      return { ...state, floorPlanImage: action.image };

    case 'APPLY_SCENE':
      // deviceStates: { [deviceId]: boolean } applied to every room
      return {
        ...state,
        rooms: state.rooms.map((r) => ({
          ...r,
          devices: r.devices.map((d) =>
            action.deviceStates[d.deviceId] === undefined
              ? d
              : { ...d, on: action.deviceStates[d.deviceId] }
          ),
        })),
      };

    case 'RESET':
      return initialHome;

    default:
      return state;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- homeReducer`
Expected: PASS — all reducer tests green.

- [ ] **Step 5: Commit**

```bash
git add src/context/homeReducer.js src/context/__tests__/homeReducer.test.js
git commit -m "feat: home reducer with full action set"
```

---

### Task 5: HomeContext provider + hook

**Files:**
- Create: `src/context/HomeContext.jsx`

- [ ] **Step 1: Create `src/context/HomeContext.jsx`**

```jsx
import { createContext, useContext, useReducer } from 'react';
import { homeReducer, initialHome, actions } from './homeReducer.js';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [home, dispatch] = useReducer(homeReducer, initialHome);
  return (
    <HomeContext.Provider value={{ home, dispatch, actions }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHome must be used within HomeProvider');
  return ctx;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: PASS — no errors (file is imported in Task 6; build still must succeed standalone).

- [ ] **Step 3: Commit**

```bash
git add src/context/HomeContext.jsx
git commit -m "feat: HomeContext provider and useHome hook"
```

---

### Task 6: HomeTypePicker component

**Files:**
- Create: `src/features/houseExplorer/HomeTypePicker.jsx`, `src/features/houseExplorer/HomeTypePicker.css`

- [ ] **Step 1: Create `src/features/houseExplorer/HomeTypePicker.css`**

```css
.htp { display: flex; gap: 10px; flex-wrap: wrap; }
.htp-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 10px;
  padding: 14px 22px;
  font-size: 1rem;
  transition: border-color 0.15s, transform 0.1s;
}
.htp-btn:hover { border-color: var(--teal); }
.htp-btn.active {
  border-color: var(--teal);
  box-shadow: inset 0 0 0 1px var(--teal);
  color: var(--teal);
}
```

- [ ] **Step 2: Create `src/features/houseExplorer/HomeTypePicker.jsx`**

```jsx
import { HOME_TYPES } from '../../data/templates.js';
import { useHome } from '../../context/HomeContext.jsx';
import './HomeTypePicker.css';

export default function HomeTypePicker() {
  const { home, dispatch, actions } = useHome();

  function pick(type) {
    if (
      home.homeType &&
      home.homeType !== type &&
      !window.confirm('Switching home type rebuilds the room list. Continue?')
    ) {
      return;
    }
    dispatch(actions.setHomeType(type));
  }

  return (
    <div className="card">
      <h3>1. Pick the home</h3>
      <p style={{ color: 'var(--text-dim)', margin: '4px 0 14px' }}>
        Start from the closest match — you can reshape every room next.
      </p>
      <div className="htp">
        {HOME_TYPES.map((t) => (
          <button
            key={t}
            className={`htp-btn${home.homeType === t ? ' active' : ''}`}
            onClick={() => pick(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into `src/App.jsx`**

```jsx
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
      </div>
    </HomeProvider>
  );
}
```

- [ ] **Step 4: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`, open the URL.
Expected: four buttons (1BHK/2BHK/3BHK/Villa); clicking one highlights it in teal. Clicking a different one after a selection shows a confirm dialog.

- [ ] **Step 5: Commit**

```bash
git add src/features/houseExplorer/HomeTypePicker.jsx src/features/houseExplorer/HomeTypePicker.css src/App.jsx
git commit -m "feat: home type picker wired to context"
```

---

### Task 7: DeviceRow + AddDeviceMenu components

**Files:**
- Create: `src/features/houseExplorer/DeviceRow.jsx`, `src/features/houseExplorer/AddDeviceMenu.jsx`, `src/features/houseExplorer/RoomCard.css`

- [ ] **Step 1: Create `src/features/houseExplorer/RoomCard.css`** (shared styles for room card, device row, add menu)

```css
.room-card { margin-top: 14px; }
.room-card-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.room-name-input {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  font-family: var(--font-head); font-size: 1.15rem; padding: 6px 10px; border-radius: 8px;
  flex: 1; min-width: 160px;
}
.room-size-group { display: flex; gap: 4px; }
.room-size-group button {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim);
  width: 32px; height: 32px; border-radius: 8px;
}
.room-size-group button.active { border-color: var(--teal); color: var(--teal); }
.room-remove-btn {
  background: transparent; border: 1px solid var(--border); color: var(--text-dim);
  border-radius: 8px; padding: 6px 10px;
}
.room-remove-btn:hover { border-color: var(--rose); color: var(--rose); }
.device-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--border);
}
.device-row:last-child { border-bottom: none; }
.device-icon { font-size: 1.3rem; width: 28px; text-align: center; }
.device-name { flex: 1; }
.device-cat { color: var(--text-dim); font-size: 0.8rem; }
.qty-stepper { display: flex; align-items: center; gap: 6px; }
.qty-stepper button {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  width: 28px; height: 28px; border-radius: 6px;
}
.qty-val { min-width: 24px; text-align: center; }
.device-del {
  background: transparent; border: none; color: var(--text-dim); font-size: 1rem;
}
.device-del:hover { color: var(--rose); }
.add-device { margin-top: 10px; }
.add-device select {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  padding: 8px 10px; border-radius: 8px; font-family: var(--font-body);
}
.play-toggle {
  width: 46px; height: 26px; border-radius: 13px; border: 1px solid var(--border);
  background: var(--surface-2); position: relative; transition: background 0.2s;
}
.play-toggle.on { background: var(--teal); border-color: var(--teal); }
.play-toggle::after {
  content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
  border-radius: 50%; background: var(--text); transition: transform 0.2s;
}
.play-toggle.on::after { transform: translateX(20px); }
```

- [ ] **Step 2: Create `src/features/houseExplorer/DeviceRow.jsx`**

```jsx
import { getDevice } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';

export default function DeviceRow({ roomId, device }) {
  const { home, dispatch, actions } = useHome();
  const meta = getDevice(device.deviceId);
  if (!meta) return null;

  if (home.mode === 'play') {
    return (
      <div className="device-row">
        <span className="device-icon">{meta.icon}</span>
        <span className="device-name">
          {meta.name} <span className="device-cat">×{device.qty}</span>
        </span>
        <button
          className={`play-toggle${device.on ? ' on' : ''}`}
          aria-label={`Toggle ${meta.name}`}
          onClick={() => dispatch(actions.toggleDevice(roomId, device.deviceId))}
        />
      </div>
    );
  }

  return (
    <div className="device-row">
      <span className="device-icon">{meta.icon}</span>
      <span className="device-name">
        {meta.name} <span className="device-cat">· {meta.category}</span>
      </span>
      <div className="qty-stepper">
        <button
          aria-label="Decrease quantity"
          onClick={() => dispatch(actions.setDeviceQty(roomId, device.deviceId, device.qty - 1))}
        >
          −
        </button>
        <span className="qty-val num">{device.qty}</span>
        <button
          aria-label="Increase quantity"
          onClick={() => dispatch(actions.setDeviceQty(roomId, device.deviceId, device.qty + 1))}
        >
          +
        </button>
      </div>
      <button
        className="device-del"
        aria-label={`Remove ${meta.name}`}
        onClick={() => dispatch(actions.removeDevice(roomId, device.deviceId))}
      >
        ×
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/features/houseExplorer/AddDeviceMenu.jsx`**

```jsx
import { useState } from 'react';
import { DEVICES } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';

export default function AddDeviceMenu({ roomId, presentIds }) {
  const { dispatch, actions } = useHome();
  const [value, setValue] = useState('');
  const available = DEVICES.filter((d) => !presentIds.includes(d.id));

  function onChange(e) {
    const id = e.target.value;
    if (!id) return;
    dispatch(actions.addDevice(roomId, id));
    setValue('');
  }

  if (available.length === 0) {
    return <div className="add-device device-cat">All devices added.</div>;
  }

  return (
    <div className="add-device">
      <select value={value} onChange={onChange}>
        <option value="">+ Add a device…</option>
        {available.map((d) => (
          <option key={d.id} value={d.id}>
            {d.icon} {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS — components compile (not yet rendered; RoomCard in Task 8 uses them).

- [ ] **Step 5: Commit**

```bash
git add src/features/houseExplorer/DeviceRow.jsx src/features/houseExplorer/AddDeviceMenu.jsx src/features/houseExplorer/RoomCard.css
git commit -m "feat: device row and add-device menu"
```

---

### Task 8: RoomCard + RoomList components

**Files:**
- Create: `src/features/houseExplorer/RoomCard.jsx`, `src/features/houseExplorer/RoomList.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/houseExplorer/RoomCard.jsx`**

```jsx
import DeviceRow from './DeviceRow.jsx';
import AddDeviceMenu from './AddDeviceMenu.jsx';
import { useHome } from '../../context/HomeContext.jsx';

const SIZES = ['S', 'M', 'L'];

export default function RoomCard({ room }) {
  const { home, dispatch, actions } = useHome();
  const presentIds = room.devices.map((d) => d.deviceId);

  return (
    <div className="card room-card" id={`room-${room.id}`}>
      <div className="room-card-head">
        <input
          className="room-name-input"
          value={room.name}
          onChange={(e) => dispatch(actions.renameRoom(room.id, e.target.value))}
          aria-label="Room name"
        />
        <div className="room-size-group">
          {SIZES.map((s) => (
            <button
              key={s}
              className={room.size === s ? 'active' : ''}
              onClick={() => dispatch(actions.setRoomSize(room.id, s))}
              aria-label={`Size ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          className="room-remove-btn"
          onClick={() => {
            if (window.confirm(`Remove ${room.name}?`)) {
              dispatch(actions.removeRoom(room.id));
            }
          }}
        >
          Remove
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        {room.devices.length === 0 && (
          <div className="device-cat">No devices in this room yet.</div>
        )}
        {room.devices.map((d) => (
          <DeviceRow key={d.deviceId} roomId={room.id} device={d} />
        ))}
      </div>

      {home.mode === 'build' && <AddDeviceMenu roomId={room.id} presentIds={presentIds} />}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/features/houseExplorer/RoomList.jsx`**

```jsx
import { useState } from 'react';
import RoomCard from './RoomCard.jsx';
import { useHome } from '../../context/HomeContext.jsx';

const ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bath', 'entrance', 'balcony', 'other'];

export default function RoomList() {
  const { home, dispatch, actions } = useHome();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('other');

  if (!home.homeType) return null;

  function addRoom() {
    const name = newName.trim();
    if (!name) return;
    dispatch(actions.addRoom(name, newType));
    setNewName('');
    setNewType('other');
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>2. Shape the rooms</h3>
      <p style={{ color: 'var(--text-dim)', margin: '4px 0 8px' }}>
        Rename, resize, add or remove rooms to match the real home. Each room is pre-filled
        with the devices it usually needs — adjust freely.
      </p>

      {home.rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}

      {home.mode === 'build' && (
        <div className="card room-card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="room-name-input"
            placeholder="New room name (e.g. Pooja Room)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRoom()}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: 8,
              padding: '0 10px',
            }}
          >
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button className="htp-btn" onClick={addRoom}>
            Add room
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire into `src/App.jsx`**

```jsx
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
        <RoomList />
      </div>
    </HomeProvider>
  );
}
```

- [ ] **Step 4: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: pick "2BHK" → 6 room cards appear, each pre-filled with devices. Can rename a room, change S/M/L, change device quantities, remove a device, add a device from the dropdown, add a new room, remove a room (with confirm).

- [ ] **Step 5: Commit**

```bash
git add src/features/houseExplorer/RoomCard.jsx src/features/houseExplorer/RoomList.jsx src/App.jsx
git commit -m "feat: room cards and editable room list"
```

---

### Task 9: Export library — JSON payload

**Files:**
- Create: `src/lib/exportJson.js`
- Test: `src/lib/__tests__/exportJson.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/lib/__tests__/exportJson.test.js
import { describe, it, expect } from 'vitest';
import { buildExportPayload } from '../exportJson.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

function sampleHome() {
  let s = homeReducer(initialHome, actions.setHomeType('1BHK'));
  s = homeReducer(s, actions.toggleDevice(s.rooms[0].id, s.rooms[0].devices[0].deviceId));
  return s;
}

describe('buildExportPayload', () => {
  it('includes schema version, home type and rooms', () => {
    const p = buildExportPayload(sampleHome());
    expect(p.schemaVersion).toBe(1);
    expect(p.homeType).toBe('1BHK');
    expect(p.rooms.length).toBe(5);
  });
  it('strips the on flag from devices', () => {
    const p = buildExportPayload(sampleHome());
    const everyDevice = p.rooms.flatMap((r) => r.devices);
    expect(everyDevice.every((d) => !('on' in d))).toBe(true);
  });
  it('resolves device name and category from the catalog', () => {
    const p = buildExportPayload(sampleHome());
    const dev = p.rooms[0].devices[0];
    expect(dev.deviceId && dev.name && dev.category && dev.qty).toBeTruthy();
  });
  it('omits internal room ids', () => {
    const p = buildExportPayload(sampleHome());
    expect(p.rooms.every((r) => !('id' in r))).toBe(true);
  });
  it('includes an ISO exportedAt timestamp', () => {
    const p = buildExportPayload(sampleHome());
    expect(() => new Date(p.exportedAt).toISOString()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- exportJson`
Expected: FAIL — cannot resolve `../exportJson.js`.

- [ ] **Step 3: Create `src/lib/exportJson.js`**

```js
import { getDevice } from '../data/devices.js';

// Convert the live Home state into the canonical, B-compatible export payload.
export function buildExportPayload(home) {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    homeType: home.homeType,
    rooms: home.rooms.map((room) => ({
      name: room.name,
      roomType: room.roomType,
      size: room.size,
      devices: room.devices.map((d) => {
        const meta = getDevice(d.deviceId);
        return {
          deviceId: d.deviceId,
          name: meta ? meta.name : d.deviceId,
          category: meta ? meta.category : 'Unknown',
          qty: d.qty,
        };
      }),
    })),
  };
}

// Trigger a browser download of the payload as a .json file.
export function downloadJson(home) {
  const payload = buildExportPayload(home);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aerlyn-${home.homeType || 'home'}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- exportJson`
Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportJson.js src/lib/__tests__/exportJson.test.js
git commit -m "feat: JSON export payload builder and download"
```

---

### Task 10: Export library — PDF + Formspree

**Files:**
- Create: `src/lib/exportPdf.js`, `src/lib/sendFormspree.js`

- [ ] **Step 1: Create `src/lib/exportPdf.js`**

```js
import jsPDF from 'jspdf';
import { buildExportPayload } from './exportJson.js';

// Render a readable room-by-room summary PDF and trigger a download.
export function downloadPdf(home) {
  const payload = buildExportPayload(home);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 14;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Aerlyn — Home Device Plan', left, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Home type: ${payload.homeType}`, left, y);
  y += 5;
  pdf.text(`Generated: ${new Date(payload.exportedAt).toLocaleString()}`, left, y);
  y += 8;

  for (const room of payload.rooms) {
    if (y > 270) {
      pdf.addPage();
      y = 18;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${room.name}  (${room.roomType}, size ${room.size})`, left, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    if (room.devices.length === 0) {
      pdf.text('   — no devices', left, y);
      y += 5;
    }
    for (const d of room.devices) {
      pdf.text(`   ${d.qty} × ${d.name}  (${d.category})`, left, y);
      y += 5;
      if (y > 285) {
        pdf.addPage();
        y = 18;
      }
    }
    y += 3;
  }

  pdf.save(`aerlyn-${payload.homeType || 'home'}-${Date.now()}.pdf`);
}
```

- [ ] **Step 2: Create `src/lib/sendFormspree.js`**

```js
import { buildExportPayload } from './exportJson.js';

// Formspree endpoint — reuses the same provider as the legacy Aerlyn site.
// Replace with the production form id before launch.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykokrdw';

// POST the export payload to Formspree. Resolves to true on success.
export async function sendToAerlyn(home, contact) {
  const payload = buildExportPayload(home);
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `Aerlyn Studio order — ${payload.homeType}`,
      customerName: contact.name || '',
      customerPhone: contact.phone || '',
      customerCity: contact.city || '',
      notes: contact.notes || '',
      plan: JSON.stringify(payload, null, 2),
    }),
  });
  return res.ok;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS — jsPDF bundles, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/exportPdf.js src/lib/sendFormspree.js
git commit -m "feat: PDF export and Formspree submission"
```

---

### Task 11: ExportPanel component

**Files:**
- Create: `src/features/houseExplorer/ExportPanel.jsx`, `src/features/houseExplorer/ExportPanel.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/features/houseExplorer/ExportPanel.css`**

```css
.export-panel { margin-top: 24px; }
.export-panel h3 { margin-bottom: 4px; }
.export-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
.export-fields input, .export-fields textarea {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  border-radius: 8px; padding: 10px; font-family: var(--font-body); width: 100%;
}
.export-fields textarea { grid-column: 1 / -1; resize: vertical; min-height: 60px; }
.export-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.export-actions button {
  border-radius: 10px; padding: 12px 20px; font-size: 0.95rem; border: 1px solid var(--border);
}
.btn-primary { background: var(--teal); color: #04201d; border-color: var(--teal); font-weight: 600; }
.btn-secondary { background: var(--surface-2); color: var(--text); }
.export-status { margin-top: 10px; font-size: 0.9rem; }
.export-status.ok { color: var(--teal); }
.export-status.err { color: var(--rose); }
@media (max-width: 600px) { .export-fields { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Create `src/features/houseExplorer/ExportPanel.jsx`**

```jsx
import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { downloadJson } from '../../lib/exportJson.js';
import { downloadPdf } from '../../lib/exportPdf.js';
import { sendToAerlyn } from '../../lib/sendFormspree.js';
import './ExportPanel.css';

export default function ExportPanel() {
  const { home } = useHome();
  const [contact, setContact] = useState({ name: '', phone: '', city: '', notes: '' });
  const [status, setStatus] = useState(null); // { ok: boolean, msg: string }
  const [sending, setSending] = useState(false);

  if (!home.homeType) return null;

  function set(field) {
    return (e) => setContact((c) => ({ ...c, [field]: e.target.value }));
  }

  async function emailOrder() {
    setSending(true);
    setStatus(null);
    try {
      const ok = await sendToAerlyn(home, contact);
      setStatus(
        ok
          ? { ok: true, msg: 'Sent to Aerlyn. A copy was not downloaded — use the buttons above for that.' }
          : { ok: false, msg: 'Send failed. Try downloading the file and emailing it.' }
      );
    } catch {
      setStatus({ ok: false, msg: 'Network error. Try downloading the file instead.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card export-panel">
      <h3>3. Place the order</h3>
      <p style={{ color: 'var(--text-dim)' }}>
        Download the plan, or send it straight to Aerlyn.
      </p>

      <div className="export-fields">
        <input placeholder="Customer name" value={contact.name} onChange={set('name')} />
        <input placeholder="Phone" value={contact.phone} onChange={set('phone')} />
        <input placeholder="City" value={contact.city} onChange={set('city')} />
        <textarea placeholder="Notes (optional)" value={contact.notes} onChange={set('notes')} />
      </div>

      <div className="export-actions">
        <button className="btn-secondary" onClick={() => downloadJson(home)}>
          Download JSON
        </button>
        <button className="btn-secondary" onClick={() => downloadPdf(home)}>
          Download PDF
        </button>
        <button className="btn-primary" onClick={emailOrder} disabled={sending}>
          {sending ? 'Sending…' : 'Send to Aerlyn'}
        </button>
      </div>

      {status && (
        <div className={`export-status ${status.ok ? 'ok' : 'err'}`}>{status.msg}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire into `src/App.jsx`**

```jsx
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
        <RoomList />
        <ExportPanel />
      </div>
    </HomeProvider>
  );
}
```

- [ ] **Step 4: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: after picking a home type, an export panel shows. "Download JSON" downloads a `.json` file with the room/device plan. "Download PDF" downloads a readable PDF. "Send to Aerlyn" POSTs to Formspree and shows a success or error message.

- [ ] **Step 5: Commit**

```bash
git add src/features/houseExplorer/ExportPanel.jsx src/features/houseExplorer/ExportPanel.css src/App.jsx
git commit -m "feat: export panel with JSON, PDF and email"
```

---

### Task 11.5: Catalog expansion + size-aware seeding

Approved scope amendment to Phase 1, implemented before T12 boundary.

**New lighting SKUs (7 added):**

| id | name | defaultRooms |
|---|---|---|
| cob-downlight | COB Downlight | living, bedroom, kitchen, bath, entrance |
| track-light | Track Light | living, kitchen, other |
| surface-panel | Surface Panel | kitchen, bath, balcony, entrance, other |
| pendant-light | Pendant Light | living, kitchen |
| wall-sconce | Wall Sconce | living, bedroom, balcony |
| profile-light | Profile / Cove LED | living, bedroom |
| outdoor-light | Outdoor Facade Light | balcony, entrance |

**sizeRule table (qty by room size):**

| id | S | M | L |
|---|---|---|---|
| smart-switch | 1 | 2 | 3 |
| cob-downlight | 2 | 4 | 6 |
| cct-light | 1 | 1 | 2 |
| rgbw-strip | 1 | 1 | 2 |
| profile-light | 1 | 1 | 2 |
| bldc-fan | 1 | 1 | 2 |
| curtain | 1 | 1 | 2 |

**sizeWhitelist table (only seeds when room.size matches):**

| id | sizeWhitelist |
|---|---|
| track-light | M, L |
| pendant-light | M, L |

**Note:** `SET_ROOM_SIZE` deliberately does not re-seed — preserves user customisation. homeReducer.js unchanged.

**Files:** `devices.js`, `templates.js`, `devices.test.js`, `templates.test.js`

**Status:** implemented mid-Phase-1, before T12 boundary.

---

### Task 11.6: Duplicate room

**Goal:** Add a Duplicate button on each room that clones it (devices, size, name + (copy)) and inserts after the source.

**Files:**
- `cloneRoom` helper added to `src/data/templates.js`
- `DUPLICATE_ROOM` reducer case + `duplicateRoom` action creator added to `src/context/homeReducer.js`
- `Duplicate` button (`.room-dup-btn`) added between size buttons and Remove in `src/features/houseExplorer/RoomCard.jsx`
- `.room-dup-btn` CSS rule added to `src/features/houseExplorer/RoomCard.css`
- 6 new reducer tests added to `src/context/__tests__/homeReducer.test.js`

**Decisions:** Devices are deep-copied so mutating the copy doesn't affect the source. Copy is inserted immediately after the source for predictability.

**Status:** implemented mid-Phase-1, before T12 boundary.

---

### Task 11.8: Switch-plate planner + Power SKUs

**Goal:** Auto-derive switch-plate count from controllable devices per room, display a per-room breakdown card, attach the plan to JSON export, and add USB charger + power socket to the catalog.

**Catalog changes:**
- Removed: `smart-switch` (derived, not user-selectable)
- Added: `usb-charger` (USB Charging Socket, Power category), `power-socket` (Power Socket, Power category)
- Total catalog: 22 devices

**`control` field schema** added to devices.js (documented in file header):
- `control.type`: `'gang'` | `'fan'` | `'curtain'` | `'socket'`
- `control.count`: integer modules per unit
- Omitted on 9 standalone devices: geyser, ac-ir, camera, motion-sensor, gas-sensor, door-lock, energy-meter, scene-remote, voice

**Plate-size algorithm:** Greedy selection from `[12, 8, 6, 4, 2]`. If remaining === 1, pad to a 2-module plate (1 spare). 1-module pads to 2 by design.

**Files affected:**
- `src/data/devices.js` — remove smart-switch, add control fields, add 2 Power SKUs
- `src/data/__tests__/devices.test.js` — updated count (22), removed smart-switch asserts, added new SKU + control asserts
- `src/data/__tests__/templates.test.js` — replaced smart-switch byId refs with usb-charger / power-socket
- `src/context/__tests__/homeReducer.test.js` — replaced smart-switch applyScene test with bldc-fan
- `src/lib/switchPlanner.js` — new library: `computeRoomPoints`, `recommendPlates`, `planRoom`
- `src/lib/__tests__/switchPlanner.test.js` — 12 TDD tests (written before implementation)
- `src/lib/exportJson.js` — attach `switchPlan` (gang/fan/curtain/socket/total/plates/spareModules) per room
- `src/lib/__tests__/exportJson.test.js` — assert switchPlan shape + byType stripped
- `src/lib/exportPdf.js` — print compact switch-plan summary lines after room title
- `src/features/houseExplorer/SwitchPlanCard.jsx` — new UI card component
- `src/features/houseExplorer/SwitchPlanCard.css` — card styles
- `src/features/houseExplorer/RoomCard.jsx` — render SwitchPlanCard after room-card-head

**Status:** implemented mid-Phase-1, before T12 boundary.

---

### Task 12: Phase 1 boundary — merge + push

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all Vitest specs green (devices, templates, homeReducer, exportJson).

- [ ] **Step 2: Run a clean build**

Run: `npm run build`
Expected: PASS — `dist/` produced, no warnings that fail the build.

- [ ] **Step 3: Manual smoke test**

Run: `npm run preview`, open the URL. Confirm the full flow: pick 3BHK → reshape a room → change quantities → add a room → download JSON + PDF → send to Aerlyn.

- [ ] **Step 4: Merge to main and push**

```bash
git checkout main
git merge --no-ff feature-a/phase-1 -m "Phase 1: Working skeleton — House Explorer ordering flow"
git push origin main
git tag phase-1-complete
git push origin phase-1-complete
```

---

# PHASE 2 — The House Visual

End state: a stylized SVG dollhouse header shows every room as a labeled zone with an ambient idle animation; clicking a zone scrolls to that room card.

---

### Task 13: HouseSvg component — static zones

**Files:**
- Create: `src/features/houseExplorer/HouseSvg.jsx`, `src/features/houseExplorer/HouseSvg.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feature-a/phase-2
```

- [ ] **Step 2: Create `src/features/houseExplorer/HouseSvg.css`**

```css
.house-svg-wrap { margin: 16px 0 8px; }
.house-svg { width: 100%; height: auto; display: block; }
.house-zone { cursor: pointer; }
.house-zone-rect {
  fill: var(--surface-2); stroke: var(--border); stroke-width: 1.5;
  transition: fill 0.2s, stroke 0.2s;
}
.house-zone:hover .house-zone-rect { stroke: var(--teal); }
.house-zone-label {
  fill: var(--text-dim); font-family: var(--font-body); font-size: 9px;
}
.house-roof { fill: none; stroke: var(--teal); stroke-width: 2; }
.house-dot { fill: var(--amber); }
```

- [ ] **Step 3: Create `src/features/houseExplorer/HouseSvg.jsx`**

```jsx
import { useHome } from '../../context/HomeContext.jsx';
import './HouseSvg.css';

// Lay rooms out on a simple responsive grid inside the house body.
function layout(rooms) {
  const cols = rooms.length <= 4 ? 2 : 3;
  const cellW = 120;
  const cellH = 70;
  const gap = 10;
  return rooms.map((room, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      room,
      x: 20 + col * (cellW + gap),
      y: 70 + row * (cellH + gap),
      w: cellW,
      h: cellH,
    };
  });
}

export default function HouseSvg() {
  const { home } = useHome();
  if (!home.homeType || home.rooms.length === 0) return null;

  const cells = layout(home.rooms);
  const cols = home.rooms.length <= 4 ? 2 : 3;
  const rows = Math.ceil(home.rooms.length / cols);
  const width = 20 + cols * 130 + 10;
  const height = 70 + rows * 80 + 20;

  function focusRoom(roomId) {
    const el = document.getElementById(`room-${roomId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="house-svg-wrap card">
      <svg
        className="house-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Your home overview"
      >
        {/* roof */}
        <polyline className="house-roof" points={`10,60 ${width / 2},15 ${width - 10},60`} />
        {/* rooms */}
        {cells.map(({ room, x, y, w, h }) => (
          <g
            key={room.id}
            className="house-zone"
            onClick={() => focusRoom(room.id)}
          >
            <rect className="house-zone-rect" x={x} y={y} width={w} height={h} rx="6" />
            <text className="house-zone-label" x={x + 8} y={y + 18}>
              {room.name}
            </text>
            <text className="house-zone-label" x={x + 8} y={y + 32}>
              {room.devices.length} devices
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Wire into `src/App.jsx`** (between HomeTypePicker and RoomList)

```jsx
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
        <HouseSvg />
        <RoomList />
        <ExportPanel />
      </div>
    </HomeProvider>
  );
}
```

- [ ] **Step 5: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: after picking a home type, a house drawing appears with a teal roof and one labelled rectangle per room. Clicking a rectangle smooth-scrolls the page to that room's card.

- [ ] **Step 6: Commit**

```bash
git add src/features/houseExplorer/HouseSvg.jsx src/features/houseExplorer/HouseSvg.css src/App.jsx
git commit -m "feat: stylized SVG house with clickable room zones"
```

---

### Task 14: Ambient idle animation

**Files:**
- Modify: `src/features/houseExplorer/HouseSvg.css`, `src/features/houseExplorer/HouseSvg.jsx`

- [ ] **Step 1: Add ambient animation CSS to `src/features/houseExplorer/HouseSvg.css`**

Append:

```css
@keyframes ambient-glow {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
.house-dot.ambient {
  animation: ambient-glow 3.2s ease-in-out infinite;
}
.house-dot.ambient:nth-of-type(even) { animation-delay: 1.4s; }
```

- [ ] **Step 2: Add an ambient dot per room in `src/features/houseExplorer/HouseSvg.jsx`**

Inside the `cells.map(...)` `<g>`, after the second `<text>`, add:

```jsx
            <circle
              className="house-dot ambient"
              cx={x + w - 14}
              cy={y + 14}
              r="4"
            />
```

- [ ] **Step 3: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: each room zone has a small amber dot that gently pulses (fades in and out), staggered between rooms — the house looks "alive".

- [ ] **Step 4: Commit**

```bash
git add src/features/houseExplorer/HouseSvg.jsx src/features/houseExplorer/HouseSvg.css
git commit -m "feat: ambient pulsing animation on house zones"
```

---

### Task 15: Phase 2 boundary — merge + push

- [ ] **Step 1: Run tests + build**

Run: `npm test` — Expected: PASS (no logic changed; specs still green).
Run: `npm run build` — Expected: PASS.

- [ ] **Step 2: Manual smoke test**

Run: `npm run preview`. Confirm: house renders, zones are clickable and scroll to room cards, dots pulse, full Phase 1 flow still works.

- [ ] **Step 3: Merge to main and push**

```bash
git checkout main
git merge --no-ff feature-a/phase-2 -m "Phase 2: Stylized SVG house with ambient animation"
git push origin main
git tag phase-2-complete
git push origin phase-2-complete
```

---

# PHASE 3 — Play Mode

End state: a Build/Play toggle; in Play mode devices toggle on/off with animation in room cards and in the SVG house; one-tap scene presets flip groups of devices.

---

### Task 16: ModeToggle component

**Files:**
- Create: `src/features/houseExplorer/ModeToggle.jsx`, `src/features/houseExplorer/ModeToggle.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feature-a/phase-3
```

- [ ] **Step 2: Create `src/features/houseExplorer/ModeToggle.css`**

```css
.mode-toggle { display: inline-flex; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.mode-toggle button {
  background: var(--surface-2); color: var(--text-dim); border: none;
  padding: 8px 18px; font-size: 0.9rem;
}
.mode-toggle button.active { background: var(--teal); color: #04201d; font-weight: 600; }
.mode-hint { color: var(--text-dim); font-size: 0.85rem; margin-top: 6px; }
```

- [ ] **Step 3: Create `src/features/houseExplorer/ModeToggle.jsx`**

```jsx
import { useHome } from '../../context/HomeContext.jsx';
import './ModeToggle.css';

export default function ModeToggle() {
  const { home, dispatch, actions } = useHome();
  if (!home.homeType) return null;

  return (
    <div style={{ margin: '14px 0' }}>
      <div className="mode-toggle">
        <button
          className={home.mode === 'build' ? 'active' : ''}
          onClick={() => dispatch(actions.setMode('build'))}
        >
          Build
        </button>
        <button
          className={home.mode === 'play' ? 'active' : ''}
          onClick={() => dispatch(actions.setMode('play'))}
        >
          Play
        </button>
      </div>
      <div className="mode-hint">
        {home.mode === 'build'
          ? 'Build mode — add, remove and count the devices in each room.'
          : 'Play mode — tap devices on and off to see automation in action.'}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire into `src/App.jsx`** (between HouseSvg and RoomList)

```jsx
import { HomeProvider } from './context/HomeContext.jsx';
import HomeTypePicker from './features/houseExplorer/HomeTypePicker.jsx';
import HouseSvg from './features/houseExplorer/HouseSvg.jsx';
import ModeToggle from './features/houseExplorer/ModeToggle.jsx';
import RoomList from './features/houseExplorer/RoomList.jsx';
import ExportPanel from './features/houseExplorer/ExportPanel.jsx';

export default function App() {
  return (
    <HomeProvider>
      <div className="app">
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
        </header>
        <HomeTypePicker />
        <HouseSvg />
        <ModeToggle />
        <RoomList />
        <ExportPanel />
      </div>
    </HomeProvider>
  );
}
```

- [ ] **Step 5: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: a Build/Play toggle appears. In Play mode the device rows show on/off toggles (already implemented in DeviceRow Task 7) instead of qty steppers, and the "add device" / "add room" controls disappear. Switching back to Build restores editing.

- [ ] **Step 6: Commit**

```bash
git add src/features/houseExplorer/ModeToggle.jsx src/features/houseExplorer/ModeToggle.css src/App.jsx
git commit -m "feat: Build/Play mode toggle"
```

---

### Task 17: Play-mode visual feedback in the house

**Files:**
- Modify: `src/features/houseExplorer/HouseSvg.jsx`, `src/features/houseExplorer/HouseSvg.css`

- [ ] **Step 1: Add "active room" styling to `src/features/houseExplorer/HouseSvg.css`**

Append:

```css
.house-zone-rect.lit {
  fill: rgba(0, 200, 180, 0.22);
  stroke: var(--teal);
}
.house-zone-count { fill: var(--teal); font-family: var(--font-mono); font-size: 9px; }
```

- [ ] **Step 2: Light up zones with devices on, in `src/features/houseExplorer/HouseSvg.jsx`**

Replace the `<rect>` and second `<text>` inside `cells.map(...)` with logic that counts `on` devices:

```jsx
        {cells.map(({ room, x, y, w, h }) => {
          const onCount = room.devices.filter((d) => d.on).length;
          const lit = home.mode === 'play' && onCount > 0;
          return (
            <g key={room.id} className="house-zone" onClick={() => focusRoom(room.id)}>
              <rect
                className={`house-zone-rect${lit ? ' lit' : ''}`}
                x={x}
                y={y}
                width={w}
                height={h}
                rx="6"
              />
              <text className="house-zone-label" x={x + 8} y={y + 18}>
                {room.name}
              </text>
              {home.mode === 'play' ? (
                <text className="house-zone-count" x={x + 8} y={y + 32}>
                  {onCount} on
                </text>
              ) : (
                <text className="house-zone-label" x={x + 8} y={y + 32}>
                  {room.devices.length} devices
                </text>
              )}
              <circle className="house-dot ambient" cx={x + w - 14} cy={y + 14} r="4" />
            </g>
          );
        })}
```

- [ ] **Step 3: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: in Play mode, toggling devices on in a room tints that room's zone teal and shows a live "N on" count; Build mode still shows the "N devices" count.

- [ ] **Step 4: Commit**

```bash
git add src/features/houseExplorer/HouseSvg.jsx src/features/houseExplorer/HouseSvg.css
git commit -m "feat: house zones light up in play mode"
```

---

### Task 18: Scene presets

**Files:**
- Create: `src/data/scenes.js`, `src/features/houseExplorer/ScenePresets.jsx`, `src/features/houseExplorer/ScenePresets.css`
- Test: `src/data/__tests__/scenes.test.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Write the failing test**

```js
// src/data/__tests__/scenes.test.js
import { describe, it, expect } from 'vitest';
import { SCENES } from '../scenes.js';
import { getDevice } from '../devices.js';

describe('scene presets', () => {
  it('has at least three scenes', () => {
    expect(SCENES.length).toBeGreaterThanOrEqual(3);
  });
  it('every scene has a name, icon and deviceStates map', () => {
    for (const s of SCENES) {
      expect(s.name && s.icon).toBeTruthy();
      expect(typeof s.deviceStates).toBe('object');
    }
  });
  it('every deviceStates key is a real device id', () => {
    for (const s of SCENES) {
      for (const id of Object.keys(s.deviceStates)) {
        expect(getDevice(id)).toBeDefined();
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- scenes`
Expected: FAIL — cannot resolve `../scenes.js`.

- [ ] **Step 3: Create `src/data/scenes.js`**

```js
// Each scene maps device ids to a desired on/off state. APPLY_SCENE ignores
// devices not present in a given room, so a scene is safe across any home.
export const SCENES = [
  {
    id: 'good-morning',
    name: 'Good Morning',
    icon: '\u{1F305}',
    deviceStates: {
      'cct-light': true,
      'smart-switch': true,
      'curtain': true,
      'geyser': true,
      'bldc-fan': false,
      'rgbw-strip': false,
    },
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    icon: '\u{1F37F}',
    deviceStates: {
      'cct-light': false,
      'smart-switch': false,
      'rgbw-strip': true,
      'curtain': false,
      'bldc-fan': true,
      'ac-ir': true,
    },
  },
  {
    id: 'good-night',
    name: 'Good Night',
    icon: '\u{1F634}',
    deviceStates: {
      'cct-light': false,
      'smart-switch': false,
      'rgbw-strip': false,
      'curtain': false,
      'bldc-fan': true,
      'door-lock': true,
      'camera': true,
      'gas-sensor': true,
    },
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- scenes`
Expected: PASS — 3 tests green.

- [ ] **Step 5: Create `src/features/houseExplorer/ScenePresets.css`**

```css
.scene-presets { display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0; }
.scene-btn {
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  border-radius: 10px; padding: 10px 16px; font-size: 0.92rem;
}
.scene-btn:hover { border-color: var(--amber); }
.scene-btn .scene-icon { margin-right: 6px; }
```

- [ ] **Step 6: Create `src/features/houseExplorer/ScenePresets.jsx`**

```jsx
import { SCENES } from '../../data/scenes.js';
import { useHome } from '../../context/HomeContext.jsx';
import './ScenePresets.css';

export default function ScenePresets() {
  const { home, dispatch, actions } = useHome();
  if (!home.homeType || home.mode !== 'play') return null;

  return (
    <div>
      <div className="mode-hint">Try a scene — one tap sets the whole home:</div>
      <div className="scene-presets">
        {SCENES.map((s) => (
          <button
            key={s.id}
            className="scene-btn"
            onClick={() => dispatch(actions.applyScene(s.deviceStates))}
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

- [ ] **Step 7: Wire into `src/App.jsx`** (immediately after `<ModeToggle />`)

```jsx
import ScenePresets from './features/houseExplorer/ScenePresets.jsx';
```

and in the JSX:

```jsx
        <ModeToggle />
        <ScenePresets />
        <RoomList />
```

- [ ] **Step 8: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: in Play mode, three scene buttons appear (Good Morning / Movie Night / Good Night). Tapping one flips the matching devices across every room at once; the house zones update their lit state and "N on" counts.

- [ ] **Step 9: Commit**

```bash
git add src/data/scenes.js src/data/__tests__/scenes.test.js src/features/houseExplorer/ScenePresets.jsx src/features/houseExplorer/ScenePresets.css src/App.jsx
git commit -m "feat: one-tap scene presets in play mode"
```

---

### Task 19: Phase 3 boundary — merge + push

- [ ] **Step 1: Run tests + build**

Run: `npm test` — Expected: PASS (devices, templates, homeReducer, exportJson, scenes).
Run: `npm run build` — Expected: PASS.

- [ ] **Step 2: Manual smoke test**

Run: `npm run preview`. Confirm: Build/Play toggle works, Play mode shows toggles + scene buttons, scenes flip devices and light the house, Build mode still edits and exports.

- [ ] **Step 3: Merge to main and push**

```bash
git checkout main
git merge --no-ff feature-a/phase-3 -m "Phase 3: Play mode with device toggles and scene presets"
git push origin main
git tag phase-3-complete
git push origin phase-3-complete
```

---

# PHASE 4 — Upload + Polish

End state: floor-plan reference upload panel, device "what this enables" tooltips, brand/mobile polish.

---

### Task 20: FloorPlanUpload component

**Files:**
- Create: `src/features/houseExplorer/FloorPlanUpload.jsx`, `src/features/houseExplorer/FloorPlanUpload.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feature-a/phase-4
```

- [ ] **Step 2: Create `src/features/houseExplorer/FloorPlanUpload.css`**

```css
.floorplan { margin-top: 16px; }
.floorplan-drop {
  border: 1px dashed var(--border); border-radius: 10px; padding: 20px;
  text-align: center; color: var(--text-dim); cursor: pointer;
}
.floorplan-drop:hover { border-color: var(--teal); color: var(--text); }
.floorplan-preview { margin-top: 12px; position: relative; }
.floorplan-preview img {
  max-width: 100%; border-radius: 10px; border: 1px solid var(--border); display: block;
}
.floorplan-clear {
  margin-top: 8px; background: transparent; border: 1px solid var(--border);
  color: var(--text-dim); border-radius: 8px; padding: 6px 12px;
}
.floorplan-clear:hover { border-color: var(--rose); color: var(--rose); }
```

- [ ] **Step 3: Create `src/features/houseExplorer/FloorPlanUpload.jsx`**

```jsx
import { useRef } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import './FloorPlanUpload.css';

export default function FloorPlanUpload() {
  const { home, dispatch, actions } = useHome();
  const inputRef = useRef(null);
  if (!home.homeType) return null;

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => dispatch(actions.setFloorPlan(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="card floorplan">
      <h3>Floor plan (optional)</h3>
      <p style={{ color: 'var(--text-dim)', margin: '4px 0 10px' }}>
        Upload the customer's floor plan as a reference while shaping the rooms. It is
        shown here only — it is not read automatically.
      </p>

      {!home.floorPlanImage && (
        <div className="floorplan-drop" onClick={() => inputRef.current.click()}>
          Click to upload an image of the floor plan
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFile}
      />

      {home.floorPlanImage && (
        <div className="floorplan-preview">
          <img src={home.floorPlanImage} alt="Uploaded floor plan reference" />
          <button
            className="floorplan-clear"
            onClick={() => dispatch(actions.setFloorPlan(null))}
          >
            Remove floor plan
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Wire into `src/App.jsx`** (after `<HouseSvg />`, before `<ModeToggle />`)

```jsx
import FloorPlanUpload from './features/houseExplorer/FloorPlanUpload.jsx';
```

and in the JSX:

```jsx
        <HouseSvg />
        <FloorPlanUpload />
        <ModeToggle />
```

- [ ] **Step 5: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: after picking a home type, a floor-plan card shows an upload area. Selecting an image displays it as a preview; "Remove floor plan" clears it.

- [ ] **Step 6: Commit**

```bash
git add src/features/houseExplorer/FloorPlanUpload.jsx src/features/houseExplorer/FloorPlanUpload.css src/App.jsx
git commit -m "feat: floor-plan reference image upload"
```

---

### Task 21: DeviceInfo tooltip — "what this enables"

**Files:**
- Create: `src/features/houseExplorer/DeviceInfo.jsx`, `src/features/houseExplorer/DeviceInfo.css`
- Modify: `src/features/houseExplorer/DeviceRow.jsx`

- [ ] **Step 1: Create `src/features/houseExplorer/DeviceInfo.css`**

```css
.device-info { position: relative; display: inline-flex; }
.device-info-btn {
  background: transparent; border: 1px solid var(--border); color: var(--text-dim);
  width: 20px; height: 20px; border-radius: 50%; font-size: 0.7rem; line-height: 1;
}
.device-info-btn:hover { border-color: var(--teal); color: var(--teal); }
.device-info-pop {
  position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%);
  width: 220px; background: var(--surface-2); border: 1px solid var(--teal);
  border-radius: 8px; padding: 10px; font-size: 0.8rem; color: var(--text);
  z-index: 10; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
```

- [ ] **Step 2: Create `src/features/houseExplorer/DeviceInfo.jsx`**

```jsx
import { useState } from 'react';
import './DeviceInfo.css';

export default function DeviceInfo({ blurb }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="device-info"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="device-info-btn"
        aria-label="What this enables"
        onClick={() => setOpen((o) => !o)}
      >
        i
      </button>
      {open && <span className="device-info-pop">{blurb}</span>}
    </span>
  );
}
```

- [ ] **Step 3: Add the tooltip to `src/features/houseExplorer/DeviceRow.jsx`**

Add the import at the top:

```jsx
import DeviceInfo from './DeviceInfo.jsx';
```

In **both** the play-mode and build-mode returns, change the `device-name` span to include the tooltip. Build-mode version:

```jsx
      <span className="device-name">
        {meta.name} <span className="device-cat">· {meta.category}</span>{' '}
        <DeviceInfo blurb={meta.blurb} />
      </span>
```

Play-mode version:

```jsx
        <span className="device-name">
          {meta.name} <span className="device-cat">×{device.qty}</span>{' '}
          <DeviceInfo blurb={meta.blurb} />
        </span>
```

- [ ] **Step 4: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`.
Expected: every device row has a small "i" button; hovering or tapping it shows a popover with that device's "what this enables" blurb.

- [ ] **Step 5: Commit**

```bash
git add src/features/houseExplorer/DeviceInfo.jsx src/features/houseExplorer/DeviceInfo.css src/features/houseExplorer/DeviceRow.jsx
git commit -m "feat: device info tooltips explaining each device"
```

---

### Task 22: Brand + mobile polish

**Files:**
- Modify: `src/styles/global.css`, `src/App.jsx`

- [ ] **Step 1: Add responsive + polish rules to `src/styles/global.css`**

Append:

```css
.app-intro { color: var(--text-dim); max-width: 620px; margin: 6px 0 18px; line-height: 1.5; }
.section-num { color: var(--teal); font-family: var(--font-mono); margin-right: 6px; }
@media (max-width: 600px) {
  .app { padding: 16px 14px 80px; }
  .app-header h1 { font-size: 1.6rem; }
  .room-card-head { gap: 8px; }
  .htp-btn { padding: 12px 16px; }
}
@media (max-width: 420px) {
  .htp { flex-direction: column; }
  .htp-btn { width: 100%; }
}
```

- [ ] **Step 2: Add an intro line in `src/App.jsx`**

In the header block, add below the existing `<p>`:

```jsx
        <header className="app-header">
          <h1>Aerlyn Studio</h1>
          <p>Interactive House Explorer</p>
          <p className="app-intro">
            Build your home room by room, see what automation feels like in Play mode,
            and send the plan straight to Aerlyn — no guesswork.
          </p>
        </header>
```

- [ ] **Step 3: Verify build + browser**

Run: `npm run build` — Expected: PASS.
Run: `npm run dev`. Resize the browser narrow (or use device emulation).
Expected: layout holds at mobile widths — home-type buttons stack, room card headers wrap cleanly, export fields go single-column (from Task 11 CSS), intro text reads well.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/App.jsx
git commit -m "feat: brand polish and mobile responsive pass"
```

---

### Task 23: Phase 4 boundary — merge + push + final tag

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — devices, templates, homeReducer, exportJson, scenes all green.

- [ ] **Step 2: Clean build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Full manual regression**

Run: `npm run preview`. Walk the whole flow on desktop and a narrow viewport: pick each home type, reshape rooms, upload a floor plan, switch to Play, run scenes, check device info tooltips, switch to Build, export JSON + PDF, send to Aerlyn.

- [ ] **Step 4: Merge to main, push, tag**

```bash
git checkout main
git merge --no-ff feature-a/phase-4 -m "Phase 4: Floor-plan upload, device info tooltips, brand polish"
git push origin main
git tag feature-a-complete
git push origin feature-a-complete
```

---

## Self-Review Notes

**Spec coverage** (against PRD §4):
- §4.2 decision 1 (template + editable rooms) → Tasks 3, 6, 8.
- §4.2 decision 2 (floor-plan upload, reference only) → Task 20.
- §4.2 decision 3 (hybrid SVG house + room cards) → Tasks 8, 13, 14.
- §4.2 decision 4 (Build/Play modes) → Tasks 7, 16, 17.
- §4.2 decision 5 (no pricing) → honoured; no price fields anywhere.
- §4.2 decision 6 (export JSON + PDF + email, B-compatible) → Tasks 9, 10, 11.
- §4.3 data model → Tasks 3, 4.
- §4.4 device catalog → Task 2.
- §4.5 room templates → Task 3.
- §4.6 architecture → file structure honoured throughout.
- §4.7 phases 1–4 → Phase sections 1–4.
- §4.8 out of scope → no backend, accounts, pricing, or floor-plan parsing introduced.

**Type consistency:** action creators in `actions` (Task 4) are used with identical signatures in Tasks 6, 7, 8, 11, 16, 17, 18, 20. `buildExportPayload` (Task 9) consumed by Tasks 10, 11. `getDevice` (Task 2) consumed by Tasks 7, 9, 18. `useHome` shape `{ home, dispatch, actions }` consistent across all components.

**Placeholder scan:** no TBD/TODO; every code step contains complete code.

**Known follow-up (not a gap):** the Formspree endpoint in Task 10 reuses the legacy site's form id as a documented placeholder — flagged in-code to swap for a production form id before launch. This matches PRD §9.
