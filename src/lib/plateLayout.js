import { MATERIAL_COLORS } from '../data/plateAccessories.js';
import { iconLabel } from '../data/plateIcons.js';

// Abstract plate units: one module is MODULE wide and ROW tall, with PAD of frame around the grid.
export const MODULE = 10;
export const ROW = 20;
export const PAD = 3;

const DEFAULT_FILL = '#d9dade'; // before a colour is chosen
const WEIGHT = { fan: 2, socket: 2, curtain: 1 }; // relative width of one control; two switches share 1
const MAX_CONTROLS = 24;

// "8 Switch 1 Socket (1-10A)" -> ['switch' x 8, 'socket']
export function parseAccessory(name) {
  const controls = [];
  const text = String(name).replace(/\(.*?\)/g, '');
  for (const [, n, kind] of text.matchAll(/(\d+)?\s*(switch|fan|curtain|socket)/gi)) {
    const count = Math.min(MAX_CONTROLS, Number(n) || 1);
    for (let i = 0; i < count && controls.length < MAX_CONTROLS; i++) controls.push(kind.toLowerCase());
  }
  return controls;
}

// 12-module plates are two rows of six; everything else is one row.
export function plateGrid(maxSlots) {
  const rows = maxSlots > 8 ? 2 : 1;
  return { cols: maxSlots / rows, rows };
}

// First free run of `nodeSize` modules that stays inside one row, or -1.
export function findStart(config, nodeSize) {
  const { cols, rows } = plateGrid(config.maxSlots);
  const taken = new Set(config.accessories.flatMap((a) => a.slots));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col + nodeSize <= cols; col++) {
      const start = row * cols + col;
      if (Array.from({ length: nodeSize }, (_, k) => start + k).every((s) => !taken.has(s))) return start;
    }
  }
  return -1;
}

export function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a, b, t) {
  const [x, y] = [hexRgb(a), hexRgb(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

// Dark symbols on a light plate, light symbols on a dark one.
export function inkFor(hex) {
  const [r, g, b] = hexRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5 ? '#1c1c22' : '#f3f3f6';
}

export function plateFill(config) {
  const known = MATERIAL_COLORS.find((c) => c.label === config.material);
  if (known) return known.code;
  return /^#[0-9a-f]{6}$/i.test(config.materialCode || '') ? config.materialCode : DEFAULT_FILL;
}

// "Modules 1–4", "Module 3", "Modules 1–2, 5"
export function modulesLabel(slots) {
  const sorted = [...slots].sort((a, b) => a - b);
  const runs = [];
  for (const s of sorted) {
    const last = runs[runs.length - 1];
    if (last && s === last[1] + 1) last[1] = s;
    else runs.push([s, s]);
  }
  const text = runs.map(([a, b]) => (a === b ? `${a + 1}` : `${a + 1}–${b + 1}`)).join(', ');
  return `${sorted.length === 1 ? 'Module' : 'Modules'} ${text}`;
}

function controlsFor(acc, box, icons, nextSwitch) {
  const groups = [];
  for (const kind of parseAccessory(acc.name)) {
    const last = groups[groups.length - 1];
    if (last && last.kind === kind) last.n += 1;
    else groups.push({ kind, n: 1 });
  }
  const weight = (g) => (g.kind === 'switch' ? Math.ceil(g.n / 2) : WEIGHT[g.kind] * g.n);
  const unit = box.w / (groups.reduce((sum, g) => sum + weight(g), 0) || 1);

  const controls = [];
  let x = box.x;
  let switchIndex = 0;
  for (const g of groups) {
    if (g.kind === 'switch') {
      const cols = Math.ceil(g.n / 2);
      const rows = g.n > 1 ? 2 : 1;
      for (let i = 0; i < g.n; i++) {
        const key = `${acc.id}.${switchIndex++}`;
        controls.push({
          kind: 'switch', key, n: nextSwitch(), icon: iconLabel(icons[key]) ? icons[key] : null,
          x: x + (i % cols) * unit, y: box.y + Math.floor(i / cols) * (box.h / rows), w: unit, h: box.h / rows,
        });
      }
    } else {
      const w = WEIGHT[g.kind] * unit;
      for (let i = 0; i < g.n; i++) controls.push({ kind: g.kind, x: x + i * w, y: box.y, w, h: box.h });
    }
    x += weight(g) * unit;
  }
  return controls;
}

// Everything needed to draw a plate, in plate units. null until a plate size is chosen.
export function plateLayout(config) {
  const total = config.maxSlots || 0;
  if (!total) return null;
  const { cols, rows } = plateGrid(total);
  const cell = (slot) => ({ x: PAD + (slot % cols) * MODULE, y: PAD + Math.floor(slot / cols) * ROW, w: MODULE, h: ROW });

  let switchCount = 0;
  const nextSwitch = () => ++switchCount;
  const used = new Set();
  const accessories = config.accessories
    .filter((a) => a.slots.length)
    .sort((a, b) => Math.min(...a.slots) - Math.min(...b.slots))
    .map((acc) => {
      const first = Math.min(...acc.slots);
      // ponytail: an accessory is drawn in its first row only. The designer never places one across
      // rows; a hand-made config that does loses the overflow modules in the drawing.
      const inRow = acc.slots.filter((s) => Math.floor(s / cols) === Math.floor(first / cols));
      acc.slots.forEach((s) => used.add(s));
      const box = { ...cell(first), w: inRow.length * MODULE };
      return { id: acc.id, name: acc.name, slots: acc.slots, ...box, controls: controlsFor(acc, box, config.icons || {}, nextSwitch) };
    });

  const fill = plateFill(config);
  const ink = inkFor(fill);
  return {
    w: cols * MODULE + 2 * PAD,
    h: rows * ROW + 2 * PAD,
    cols,
    rows,
    empty: Array.from({ length: total }, (_, s) => s).filter((s) => !used.has(s)).map(cell),
    accessories,
    controls: accessories.flatMap((a) => a.controls),
    switchCount,
    fill,
    ink,
    line: mix(fill, ink, 0.38),
    button: mix(fill, ink, 0.07),
  };
}

// Readable accessory rows for the lead, the summary and the PDF.
export function plateDetails(config) {
  const layout = plateLayout(config);
  return (layout ? layout.accessories : []).map((a) => ({
    name: a.name,
    modules: modulesLabel(a.slots),
    icons: a.controls.filter((c) => c.icon).map((c) => `Switch ${c.n}: ${iconLabel(c.icon)}`),
  }));
}

// One sentence describing the plate — the preview's accessible name.
export function plateSummary(config) {
  if (!config.model) return 'No plate size chosen yet';
  const parts = [`${config.model} switch plate`];
  if (config.material) parts.push(config.material);
  if (config.panel) parts.push(`${config.panel} finish`);
  if (config.frame) parts.push(`${config.frame} frame`);
  const accessories = plateDetails(config).map((a) => `${a.name} (${a.modules.toLowerCase()})`);
  return `${parts.join(', ')}: ${accessories.length ? accessories.join('; ') : 'no accessories placed'}`;
}
