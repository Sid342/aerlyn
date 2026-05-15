# Feature B (PRD): Touch Plate Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the 8-step Aerlyn touch-plate configurator from `assets/reference/feturtles_src/StepperComponent.js` into Aerlyn Studio, replacing MUI and feturtles CSS with Aerlyn's CSS custom-property conventions, then export the configured plate to PDF.

**Architecture:** Self-contained feature at `src/features/touchPlate/`. State is local to the feature (no home context needed). 8-step wizard: Model → Material → Size → Accessories → Icons → Panel → Frame → Export. Each step is its own sub-component. PDF export via jsPDF (already installed).

**Tech Stack:** React 18 + Vite, CSS custom properties (no MUI, no react-dnd — use CSS grid + click-to-place), jsPDF.

**Source reference:** `assets/reference/feturtles_src/StepperComponent.js` (4299 lines) — read each section before implementing its step. Do not modify or stage.

---

## Before Starting: Read the Source

Before writing Task 1, read the full source:

```
assets/reference/feturtles_src/StepperComponent.js
```

Key things to extract from the source:
- `moduleOptions` array — plate size options (2/4/6/8/12 module) with `maxNodeSize`
- `colors` array — material color options with hex codes and labels
- `accessories` object — keyed by module size, each entry is a list of accessory options with `name`, `nodeSize`, `className`
- `icons` data — what icons are available per switch type
- `panel` and `frame` step data

The source uses MUI `<Stepper>`, `<Step>`, `<Button>` etc. Replace all MUI components with plain HTML + Aerlyn CSS. Replace react-dnd drag behaviour with click-to-select / click-to-place.

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/features/touchPlate/TouchPlateDesigner.jsx` |
| Create | `src/features/touchPlate/TouchPlateDesigner.css` |
| Create | `src/features/touchPlate/steps/StepModel.jsx` |
| Create | `src/features/touchPlate/steps/StepMaterial.jsx` |
| Create | `src/features/touchPlate/steps/StepSize.jsx` |
| Create | `src/features/touchPlate/steps/StepAccessories.jsx` |
| Create | `src/features/touchPlate/steps/StepIcons.jsx` |
| Create | `src/features/touchPlate/steps/StepPanel.jsx` |
| Create | `src/features/touchPlate/steps/StepFrame.jsx` |
| Create | `src/features/touchPlate/steps/StepExport.jsx` |
| Create | `src/features/touchPlate/PlatePreview.jsx` |
| Create | `src/features/touchPlate/PlatePreview.css` |
| Create | `src/lib/exportPlatePdf.js` |
| Create | `src/lib/__tests__/exportPlatePdf.test.js` |
| Modify | `src/App.jsx` — add TouchPlateDesigner tab |

---

## Data constants (define in TouchPlateDesigner.jsx, used by all steps)

Extract these from `StepperComponent.js` and define as plain JS constants:

```js
export const MODULE_OPTIONS = [
  { label: '2 module', maxSlots: 2 },
  { label: '4 module', maxSlots: 4 },
  { label: '6 module', maxSlots: 6 },
  { label: '8 module', maxSlots: 8 },
  { label: '12 module', maxSlots: 6 },  // 2-row layout
];

export const MATERIAL_COLORS = [
  { code: '#000000', label: 'Black' },
  { code: '#bfc6cb', label: 'Space Grey' },
  { code: '#f4debe', label: 'Titanium' },
  { code: '#ffffff', label: 'White' },
  { code: '#616161', label: 'Gray' },
];

// Accessories per plate size — extract full list from source
// Each: { name: string, nodeSize: number }
// nodeSize = how many slots this accessory occupies
export const ACCESSORIES = {
  '2 module': [...],   // fill from source
  '4 module': [...],
  '6 module': [...],
  '8 module': [...],
  '12 module': [...],
};
```

---

### Task 1: Stepper shell + Step 1 (Model)

**Files:**
- Create: `src/features/touchPlate/TouchPlateDesigner.jsx`
- Create: `src/features/touchPlate/TouchPlateDesigner.css`
- Create: `src/features/touchPlate/steps/StepModel.jsx`

- [ ] **Step 1: Read source — extract moduleOptions**

Open `assets/reference/feturtles_src/StepperComponent.js`. Find `const moduleOptions`. Note all 5 plate sizes and their `maxNodeSize` values.

- [ ] **Step 2: Create TouchPlateDesigner.css**

```css
.tpd { padding: 24px 0; }
.tpd h2 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--fg); margin: 0 0 4px; }
.tpd-sub { font-size: 0.82rem; color: var(--muted); margin: 0 0 20px; }

.tpd-stepper { display: flex; gap: 0; margin-bottom: 28px; overflow-x: auto; }
.tpd-step { flex: 1; min-width: 70px; text-align: center; padding: 8px 4px; font-size: 0.72rem; color: var(--muted); border-bottom: 2px solid var(--border); cursor: pointer; white-space: nowrap; }
.tpd-step.active { color: var(--teal); border-bottom-color: var(--teal); font-weight: 700; }
.tpd-step.done { color: var(--teal); border-bottom-color: var(--teal); opacity: 0.6; }

.tpd-nav { display: flex; justify-content: space-between; margin-top: 24px; }
.tpd-nav-btn { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 20px; color: var(--fg); font-size: 0.9rem; cursor: pointer; }
.tpd-nav-btn.primary { background: var(--teal); border-color: var(--teal); color: #000; font-weight: 700; }
.tpd-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.tpd-option-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
.tpd-option { background: var(--card); border: 2px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: border-color 0.15s; }
.tpd-option:hover { border-color: var(--teal); }
.tpd-option.selected { border-color: var(--teal); background: color-mix(in srgb, var(--teal) 10%, transparent); }
.tpd-option-label { font-size: 0.85rem; font-weight: 600; color: var(--fg); margin-top: 8px; }
.tpd-option-sub { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

.tpd-color-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.tpd-color-swatch { width: 52px; height: 52px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: border-color 0.15s; }
.tpd-color-swatch.selected { border-color: var(--teal); }
.tpd-color-label { font-size: 0.72rem; text-align: center; margin-top: 4px; color: var(--muted); }
```

- [ ] **Step 3: Create StepModel.jsx**

```jsx
export const MODULE_OPTIONS = [
  { label: '2 module', maxSlots: 2 },
  { label: '4 module', maxSlots: 4 },
  { label: '6 module', maxSlots: 6 },
  { label: '8 module', maxSlots: 8 },
  { label: '12 module', maxSlots: 12 },
];

export default function StepModel({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose plate size</div>
      <div className="tpd-option-grid">
        {MODULE_OPTIONS.map((opt) => (
          <div
            key={opt.label}
            className={`tpd-option${config.model === opt.label ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, model: opt.label, maxSlots: opt.maxSlots, accessories: [], icons: {} })}
          >
            <div className="tpd-option-label">{opt.label}</div>
            <div className="tpd-option-sub">{opt.maxSlots} slots</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create TouchPlateDesigner.jsx**

```jsx
import { useState } from 'react';
import StepModel from './steps/StepModel.jsx';
import './TouchPlateDesigner.css';

const STEP_LABELS = ['Model', 'Material', 'Size', 'Accessories', 'Icons', 'Panel', 'Frame', 'Export'];

const emptyConfig = {
  model: null,
  maxSlots: 0,
  material: null,
  size: null,
  accessories: [],   // [{ name, nodeSize, slots: [slotIndex] }]
  icons: {},         // { slotIndex: iconLabel }
  panel: null,
  frame: null,
};

export default function TouchPlateDesigner() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(emptyConfig);

  function canAdvance() {
    if (step === 0) return !!config.model;
    if (step === 1) return !!config.material;
    if (step === 2) return !!config.size;
    return true;
  }

  function renderStep() {
    if (step === 0) return <StepModel config={config} onChange={setConfig} />;
    return <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Step {STEP_LABELS[step]} — coming soon</div>;
  }

  return (
    <div className="tpd">
      <h2>Touch Plate Designer</h2>
      <p className="tpd-sub">Configure and visualise your Aerlyn smart switch plate.</p>

      <div className="tpd-stepper">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`tpd-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            onClick={() => i < step && setStep(i)}
          >
            {i < step ? '✓ ' : ''}{label}
          </div>
        ))}
      </div>

      {renderStep()}

      <div className="tpd-nav">
        <button type="button" className="tpd-nav-btn" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Back
        </button>
        {step < STEP_LABELS.length - 1 && (
          <button type="button" className="tpd-nav-btn primary" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add to App.jsx temporarily**

```jsx
import TouchPlateDesigner from './features/touchPlate/TouchPlateDesigner.jsx';
// render after SceneBuilder:
<TouchPlateDesigner />
```

- [ ] **Step 6: Run dev server — verify stepper renders, Model step works**

```
npm run dev
```

1. Scroll to Touch Plate Designer
2. 5 plate size options appear
3. Click one — it highlights
4. "Next" becomes enabled
5. Clicking a completed step header navigates back

- [ ] **Step 7: Run all tests**

```
npm test
```

All must PASS (no new tests yet — pure UI).

- [ ] **Step 8: Commit**

```bash
git add src/features/touchPlate/ src/App.jsx
git commit -m "feat: TouchPlateDesigner shell + Step 1 Model"
```

---

### Task 2: Step 2 (Material) + Step 3 (Size)

**Files:**
- Create: `src/features/touchPlate/steps/StepMaterial.jsx`
- Create: `src/features/touchPlate/steps/StepSize.jsx`
- Modify: `src/features/touchPlate/TouchPlateDesigner.jsx`

- [ ] **Step 1: Read source — extract colors and size options**

In `StepperComponent.js`, find `const colors` and any size step data.

- [ ] **Step 2: Create StepMaterial.jsx**

```jsx
export const MATERIAL_COLORS = [
  { code: '#000000', label: 'Black' },
  { code: '#bfc6cb', label: 'Space Grey' },
  { code: '#f4debe', label: 'Titanium' },
  { code: '#ffffff', label: 'White' },
  { code: '#616161', label: 'Gray' },
];

export default function StepMaterial({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose material / colour</div>
      <div className="tpd-color-grid">
        {MATERIAL_COLORS.map((c) => (
          <div key={c.label} style={{ textAlign: 'center' }}>
            <div
              className={`tpd-color-swatch${config.material === c.label ? ' selected' : ''}`}
              style={{ background: c.code, boxShadow: c.code === '#ffffff' ? '0 0 0 1px var(--border)' : 'none' }}
              onClick={() => onChange({ ...config, material: c.label, materialCode: c.code })}
              title={c.label}
            />
            <div className="tpd-color-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create StepSize.jsx**

```jsx
const SIZE_OPTIONS = ['Standard', 'Slim'];

export default function StepSize({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose plate profile</div>
      <div className="tpd-option-grid">
        {SIZE_OPTIONS.map((s) => (
          <div
            key={s}
            className={`tpd-option${config.size === s ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, size: s })}
          >
            <div className="tpd-option-label">{s}</div>
            <div className="tpd-option-sub">{s === 'Standard' ? '86 × 86 mm' : '86 × 50 mm'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire steps into TouchPlateDesigner.jsx**

```jsx
import StepMaterial from './steps/StepMaterial.jsx';
import StepSize from './steps/StepSize.jsx';

// in renderStep():
if (step === 1) return <StepMaterial config={config} onChange={setConfig} />;
if (step === 2) return <StepSize config={config} onChange={setConfig} />;
```

- [ ] **Step 5: Run dev server — verify steps 2 and 3 work**

```
npm run dev
```

1. Model → Next → Material swatches appear
2. Select colour → Next → Size options appear
3. Back navigation works

- [ ] **Step 6: Run all tests**

```
npm test
```

- [ ] **Step 7: Commit**

```bash
git add src/features/touchPlate/
git commit -m "feat: TouchPlateDesigner Step 2 Material + Step 3 Size"
```

---

### Task 3: Step 4 (Accessories) — click-to-place into slots

**Files:**
- Create: `src/features/touchPlate/steps/StepAccessories.jsx`
- Modify: `src/features/touchPlate/TouchPlateDesigner.jsx`

- [ ] **Step 1: Read source — extract accessories data**

In `StepperComponent.js`, find `const accessories`. Note the full structure:
```js
accessories = {
  "2 module": [{ name, nodeSize, ... }, ...],
  ...
}
```

Extract all entries for all plate sizes. The `nodeSize` field is how many slots the accessory occupies.

- [ ] **Step 2: Create StepAccessories.jsx**

Replace the `[...]` below with the full accessories data extracted from the source.

```jsx
const ACCESSORIES = {
  '2 module': [
    { name: '1 Switch', nodeSize: 1 },
    { name: '2 Switch', nodeSize: 2 },
    // ... fill from source
  ],
  '4 module': [
    // fill from source
  ],
  '6 module': [],
  '8 module': [],
  '12 module': [],
};

export default function StepAccessories({ config, onChange }) {
  const available = ACCESSORIES[config.model] || [];
  const totalSlots = config.maxSlots;

  // slots is an array of length totalSlots, each null or { name, nodeSize }
  const slots = Array(totalSlots).fill(null).map((_, i) => {
    const acc = config.accessories.find((a) => a.slots.includes(i));
    return acc || null;
  });

  const usedSlots = config.accessories.reduce((sum, a) => sum + a.nodeSize, 0);
  const freeSlots = totalSlots - usedSlots;

  function addAccessory(acc) {
    if (acc.nodeSize > freeSlots) return;
    // Find first free contiguous block of acc.nodeSize slots
    let startSlot = -1;
    outer: for (let i = 0; i <= totalSlots - acc.nodeSize; i++) {
      for (let j = 0; j < acc.nodeSize; j++) {
        if (slots[i + j]) continue outer;
      }
      startSlot = i;
      break;
    }
    if (startSlot === -1) return;
    const newAcc = { ...acc, id: `${acc.name}-${Date.now()}`, slots: Array.from({ length: acc.nodeSize }, (_, i) => startSlot + i) };
    onChange({ ...config, accessories: [...config.accessories, newAcc] });
  }

  function removeAccessory(id) {
    onChange({ ...config, accessories: config.accessories.filter((a) => a.id !== id) });
  }

  return (
    <div>
      <div className="tpd-section-label">Add accessories ({freeSlots} slot{freeSlots !== 1 ? 's' : ''} free)</div>

      <div className="tpd-acc-plate">
        {slots.map((slot, i) => (
          <div key={i} className={`tpd-slot${slot ? ' occupied' : ' empty'}`}>
            {slot ? slot.name : '·'}
          </div>
        ))}
      </div>

      <div className="tpd-section-label" style={{ marginTop: 16 }}>Available</div>
      <div className="tpd-option-grid">
        {available.map((acc) => (
          <div
            key={acc.name}
            className={`tpd-option${acc.nodeSize > freeSlots ? ' disabled' : ''}`}
            onClick={() => addAccessory(acc)}
          >
            <div className="tpd-option-label">{acc.name}</div>
            <div className="tpd-option-sub">{acc.nodeSize} slot{acc.nodeSize !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {config.accessories.length > 0 && (
        <>
          <div className="tpd-section-label" style={{ marginTop: 16 }}>Placed</div>
          {config.accessories.map((a) => (
            <div key={a.id} className="tpd-placed-row">
              <span>{a.name}</span>
              <button type="button" className="tpd-remove-acc" onClick={() => removeAccessory(a.id)}>✕</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
```

Add to `TouchPlateDesigner.css`:

```css
.tpd-acc-plate { display: flex; gap: 6px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 4px; }
.tpd-slot { flex: 1; min-height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; text-align: center; }
.tpd-slot.empty { border: 1px dashed var(--border); color: var(--muted); }
.tpd-slot.occupied { background: color-mix(in srgb, var(--teal) 20%, transparent); border: 1px solid var(--teal); color: var(--fg); font-weight: 600; }
.tpd-option.disabled { opacity: 0.4; cursor: not-allowed; }
.tpd-placed-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; color: var(--fg); }
.tpd-remove-acc { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.9rem; }
.tpd-section-label { font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--teal); font-weight: 600; margin: 16px 0 8px; }
```

- [ ] **Step 3: Wire into TouchPlateDesigner**

```jsx
import StepAccessories from './steps/StepAccessories.jsx';
// in renderStep():
if (step === 3) return <StepAccessories config={config} onChange={setConfig} />;
```

- [ ] **Step 4: Run dev server — test accessories flow**

1. Complete steps 1-3
2. Step 4: available accessories list shows for chosen plate size
3. Click an accessory — it appears in the plate slots visualisation
4. Adding fills slots; accessories with insufficient free slots are disabled
5. Placed accessories list shows with remove button

- [ ] **Step 5: Run all tests**

```
npm test
```

- [ ] **Step 6: Commit**

```bash
git add src/features/touchPlate/
git commit -m "feat: TouchPlateDesigner Step 4 Accessories — click-to-place slot system"
```

---

### Task 4: Steps 5–7 (Icons, Panel, Frame)

**Files:**
- Create: `src/features/touchPlate/steps/StepIcons.jsx`
- Create: `src/features/touchPlate/steps/StepPanel.jsx`
- Create: `src/features/touchPlate/steps/StepFrame.jsx`
- Modify: `src/features/touchPlate/TouchPlateDesigner.jsx`

- [ ] **Step 1: Read source — extract icons, panel, frame data**

In `StepperComponent.js`:
- Find the icons section — what icon labels/emojis are available per switch type
- Find panel options — finish choices (Matte, Gloss, etc.)
- Find frame options — frame styles

- [ ] **Step 2: Create StepIcons.jsx**

Icons step assigns a label/emoji to each placed switch accessory in `config.accessories`.

```jsx
const SWITCH_ICONS = ['💡', '🌡️', '🔌', '🎵', '📺', '❄️', '💧', '🔒', '🔆', '🌙', '⬆️', '⬇️'];

export default function StepIcons({ config, onChange }) {
  const switches = config.accessories.filter((a) => a.name.toLowerCase().includes('switch'));

  if (switches.length === 0) {
    return (
      <div>
        <div className="tpd-section-label">Icons</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No switch accessories placed — skip this step.</p>
      </div>
    );
  }

  function setIcon(accId, icon) {
    onChange({ ...config, icons: { ...config.icons, [accId]: icon } });
  }

  return (
    <div>
      <div className="tpd-section-label">Assign icons to switches</div>
      {switches.map((sw) => (
        <div key={sw.id} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--fg)', marginBottom: 8 }}>{sw.name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SWITCH_ICONS.map((icon) => (
              <button
                type="button"
                key={icon}
                aria-pressed={config.icons[sw.id] === icon}
                onClick={() => setIcon(sw.id, icon)}
                style={{
                  fontSize: '1.4rem', background: 'var(--card)', border: `2px solid ${config.icons[sw.id] === icon ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '4px 8px', cursor: 'pointer'
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create StepPanel.jsx**

```jsx
const PANEL_OPTIONS = ['Matte', 'Gloss', 'Satin'];

export default function StepPanel({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Panel finish</div>
      <div className="tpd-option-grid">
        {PANEL_OPTIONS.map((p) => (
          <div
            key={p}
            className={`tpd-option${config.panel === p ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, panel: p })}
          >
            <div className="tpd-option-label">{p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create StepFrame.jsx**

```jsx
const FRAME_OPTIONS = ['Square', 'Rounded', 'Minimal'];

export default function StepFrame({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Frame style</div>
      <div className="tpd-option-grid">
        {FRAME_OPTIONS.map((f) => (
          <div
            key={f}
            className={`tpd-option${config.frame === f ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, frame: f })}
          >
            <div className="tpd-option-label">{f}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire all three into TouchPlateDesigner**

```jsx
import StepIcons from './steps/StepIcons.jsx';
import StepPanel from './steps/StepPanel.jsx';
import StepFrame from './steps/StepFrame.jsx';

// in renderStep():
if (step === 4) return <StepIcons config={config} onChange={setConfig} />;
if (step === 5) return <StepPanel config={config} onChange={setConfig} />;
if (step === 6) return <StepFrame config={config} onChange={setConfig} />;
```

- [ ] **Step 6: Run dev server — complete steps 1–7**

Walk through the full wizard. All 7 steps must be reachable and functional.

- [ ] **Step 7: Run all tests**

```
npm test
```

- [ ] **Step 8: Commit**

```bash
git add src/features/touchPlate/
git commit -m "feat: TouchPlateDesigner Steps 5-7 Icons, Panel, Frame"
```

---

### Task 5: exportPlatePdf + Step 8 (Export)

**Files:**
- Create: `src/lib/exportPlatePdf.js`
- Create: `src/lib/__tests__/exportPlatePdf.test.js`
- Create: `src/features/touchPlate/steps/StepExport.jsx`
- Modify: `src/features/touchPlate/TouchPlateDesigner.jsx`

- [ ] **Step 1: Write failing test**

Create `src/lib/__tests__/exportPlatePdf.test.js`:

```js
import { buildPlatePdfPayload } from '../exportPlatePdf.js';

describe('buildPlatePdfPayload', () => {
  const config = {
    model: '4 module',
    material: 'Black',
    materialCode: '#000000',
    size: 'Standard',
    accessories: [{ id: 'a1', name: '2 Switch', nodeSize: 2, slots: [0, 1] }],
    icons: { a1: '💡' },
    panel: 'Matte',
    frame: 'Square',
  };

  it('returns all config fields in payload', () => {
    const p = buildPlatePdfPayload(config);
    expect(p.model).toBe('4 module');
    expect(p.material).toBe('Black');
    expect(p.size).toBe('Standard');
    expect(p.panel).toBe('Matte');
    expect(p.frame).toBe('Square');
    expect(p.accessories).toHaveLength(1);
    expect(p.accessories[0].name).toBe('2 Switch');
    expect(p.accessories[0].icon).toBe('💡');
  });
});
```

- [ ] **Step 2: Run test — confirm FAIL**

```
npm test -- exportPlatePdf
```

- [ ] **Step 3: Create exportPlatePdf.js**

```js
import jsPDF from 'jspdf';

export function buildPlatePdfPayload(config) {
  return {
    model: config.model,
    material: config.material,
    size: config.size,
    panel: config.panel,
    frame: config.frame,
    accessories: config.accessories.map((a) => ({
      name: a.name,
      slots: a.slots,
      icon: config.icons[a.id] || null,
    })),
    exportedAt: new Date().toISOString(),
  };
}

export function downloadPlatePdf(config) {
  const p = buildPlatePdfPayload(config);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 14;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Aerlyn — Touch Plate Configuration', left, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date(p.exportedAt).toLocaleString()}`, left, y);
  y += 10;

  const specs = [
    ['Plate Model', p.model],
    ['Material', p.material],
    ['Size / Profile', p.size],
    ['Panel Finish', p.panel || '—'],
    ['Frame Style', p.frame || '—'],
  ];

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Specifications', left, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  for (const [label, value] of specs) {
    pdf.text(`${label}: ${value}`, left, y);
    y += 5;
  }
  y += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Accessories', left, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  if (p.accessories.length === 0) {
    pdf.text('   — none', left, y);
    y += 5;
  }
  for (const acc of p.accessories) {
    const iconStr = acc.icon ? ` ${acc.icon}` : '';
    pdf.text(`   ${acc.name}${iconStr}  (slots ${acc.slots.join(', ')})`, left, y);
    y += 5;
  }

  pdf.save(`aerlyn-plate-${config.model.replace(' ', '-')}-${Date.now()}.pdf`);
}
```

- [ ] **Step 4: Run test — confirm PASS**

```
npm test -- exportPlatePdf
```

- [ ] **Step 5: Create StepExport.jsx**

```jsx
import { downloadPlatePdf } from '../../../lib/exportPlatePdf.js';

export default function StepExport({ config }) {
  const specs = [
    ['Model', config.model],
    ['Material', config.material],
    ['Size', config.size],
    ['Accessories', config.accessories.map((a) => a.name).join(', ') || '—'],
    ['Panel', config.panel || '—'],
    ['Frame', config.frame || '—'],
  ];

  return (
    <div>
      <div className="tpd-section-label">Your configuration</div>
      <div className="tpd-summary-card">
        {specs.map(([label, value]) => (
          <div key={label} className="tpd-summary-row">
            <span className="tpd-summary-label">{label}</span>
            <span className="tpd-summary-value">{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="tpd-nav-btn primary" onClick={() => downloadPlatePdf(config)}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
```

Add to `TouchPlateDesigner.css`:

```css
.tpd-summary-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
.tpd-summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.88rem; }
.tpd-summary-row:last-child { border-bottom: none; }
.tpd-summary-label { color: var(--muted); }
.tpd-summary-value { color: var(--fg); font-weight: 600; }
```

- [ ] **Step 6: Wire Step 8 into TouchPlateDesigner**

```jsx
import StepExport from './steps/StepExport.jsx';
// in renderStep():
if (step === 7) return <StepExport config={config} />;
```

- [ ] **Step 7: Run dev server — complete full wizard and download PDF**

1. Complete all 8 steps
2. Step 8 shows configuration summary
3. "Download PDF" triggers a PDF with all plate specs

- [ ] **Step 8: Run all tests**

```
npm test
```

- [ ] **Step 9: Run build**

```
npm run build
```

- [ ] **Step 10: Tag + update HANDOFF**

```bash
git tag feature-b-touch-plate-complete
```

Update `docs/HANDOFF.md` — mark Touch Plate Designer complete.

- [ ] **Step 11: Commit**

```bash
git add src/features/touchPlate/ src/lib/exportPlatePdf.js src/lib/__tests__/exportPlatePdf.test.js src/App.jsx docs/HANDOFF.md
git commit -m "feat: TouchPlateDesigner Step 8 Export + PDF download — feature-b-touch-plate-complete"
```
