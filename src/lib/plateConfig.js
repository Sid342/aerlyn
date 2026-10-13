import { PLATE_MODELS, PLATE_MATERIALS, PLATE_SIZES, PLATE_COLOURS, PLATE_ACCESSORIES } from '../data/plateCatalogue.js';
import { SNAP_ON_PLATES } from '../data/plateSnapOn.js';
import { plateIcon } from '../data/plateIconLibrary.js';

// Everything is stored as catalogue ids. `icons` maps a button key (see plateButtons) to an icon id.
export const emptyPlateConfig = {
  model: null,
  material: null,
  size: null, // module count
  accessory: null,
  icons: {},
  panel: null, // colour id; the plate is black until one is picked
  frame: null, // colour id; the frame is silver until one is picked
  remote: false,
};

const byId = (list, id) => list.find((o) => o.id === id) ?? null;
export const plateModel = (id) => byId(PLATE_MODELS, id);
export const plateMaterial = (id) => byId(PLATE_MATERIALS, id);
export const plateColour = (id) => byId(PLATE_COLOURS, id);
export const hasPlate = (config) => !!config && (config.model != null || config.size != null);

const isSnapOn = (config) => config.model === 'snap-on';
// As in the reference: only Full Glass Touch gets a Frame step and a frame colour; Touch Plus is drawn
// with no border at all; Snap On keeps the default silver border.
export const hasFrame = (config) => config.model === 'full-glass';
export const hasBorder = (config) => config.model !== 'touch-plus';
// Light panels get dark outlines and icons — the reference draws white on white.
export function isLightPanel(config) {
  const [r, g, b] = (plateColour(config.panel)?.code ?? '#000000').match(/\w\w/g).map((h) => parseInt(h, 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

const STEPS = [
  { id: 'model', label: 'Model' },
  { id: 'material', label: 'Material' },
  { id: 'size', label: 'Size' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'icons', label: 'Icons' },
  { id: 'panel', label: 'Panel' },
  { id: 'frame', label: 'Frame' },
  { id: 'summary', label: 'Summary' },
];
export const plateSteps = (config) => STEPS.filter((s) => s.id !== 'frame' || hasFrame(config));

// The accessories offered for the chosen model and size.
export function accessoriesFor(config) {
  if (isSnapOn(config)) return SNAP_ON_PLATES[config.size] || [];
  const list = PLATE_ACCESSORIES[config.size] || [];
  if (config.model === 'touch-plus') return list.filter((a) => a.touchPlus);
  return config.size === 12 ? list.filter((a) => !a.touchPlus) : list;
}

export const coloursFor = (config) => PLATE_COLOURS.filter((c) => (config.model === 'touch-plus' ? c.touchPlus : c.others));

// The chosen accessory's catalogue entry, or null if the model and size do not offer it.
export const plateAccessory = (config) => byId(accessoriesFor(config), config.accessory);

// The reference's own positions put the sockets of these on top of other controls or outside the panel:
// any 8 or 12 module accessory with a socket, and 6 module ones with two sockets or the curtain graphic.
// They are laid out by the .tpd-relaid rules in TouchPlateDesigner.css instead.
export function isRelaid(config) {
  const accessory = plateAccessory(config);
  if (!accessory || isSnapOn(config)) return false;
  const count = (cls) => accessory.nodes.filter((node) => node.classes.some((c) => c.split(' ').includes(cls))).length;
  const sockets = count('sixampImage');
  return config.size === 6 ? sockets > 1 || count('curtainImage') > 0 : config.size >= 8 && sockets > 0;
}

// How the reference lays an accessory out: panels (two on a 12 module plate) of nodes (columns) of
// sub-nodes (one button or graphic each). `key` is set on sub-nodes that take an icon.
export function platePanels(config) {
  const accessory = plateAccessory(config);
  if (!accessory || isSnapOn(config)) return [];
  const twoPanels = config.size === 12;
  return (twoPanels ? [1, 2] : [1]).map((panel) =>
    accessory.nodes
      .map((node, n) => ({ node, n }))
      .filter(({ node }) => !twoPanels || node[`panel${panel}`])
      .map(({ node, n }) => ({
        id: `${panel}.${n}`,
        subs: node.classes.map((className, s) => ({ className, key: node.noIcon ? null : `${panel}.${n}.${s}` })),
      }))
  );
}

// Every button that takes an icon, numbered in reading order (left to right, top row first, upper panel
// first): [{ key, n (1-based), icon (id or null) }].
export function plateButtons(config) {
  const accessory = plateAccessory(config);
  if (!accessory) return [];
  const keys = isSnapOn(config)
    ? accessory.elements.flatMap((el, i) => (el.drop ? [`s${i}`] : [])) // in the order of the drawing
    : platePanels(config).flatMap((nodes) => {
        const rows = Math.max(...nodes.map((node) => node.subs.length));
        return Array.from({ length: rows }, (_, row) => nodes.flatMap((node) => (node.subs[row]?.key ? [node.subs[row].key] : []))).flat();
      });
  return keys.map((key, i) => ({ key, n: i + 1, icon: (config.icons && config.icons[key]) || null }));
}

const squash = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');

// The two older shapes: { model: '8 module', material: 'Black' (a colour), accessories: [{ name, slots }], icons }.
// Their icons (emoji, then home-made icon ids on buttons that were numbered differently) cannot be mapped.
function fromLegacy(p, size) {
  const [only, ...others] = Array.isArray(p.accessories) ? p.accessories : [];
  const match = only && others.length === 0 && typeof only.name === 'string'
    ? (PLATE_ACCESSORIES[size] || []).find((a) => squash(a.name) === squash(only.name))
    : null;
  return {
    size,
    panel: PLATE_COLOURS.find((c) => c.label === p.material)?.id,
    accessory: match ? match.id : null,
  };
}

// Turns anything — a stored config in any of the three shapes, a config from a link, junk — into a full,
// valid config. Unknown ids are dropped; icons are kept only on buttons the accessory really has.
export function cleanPlateConfig(raw) {
  const p = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const legacy = typeof p.model === 'string' && /^(\d+) module$/.exec(p.model);
  const c = legacy ? fromLegacy(p, Number(legacy[1])) : p;
  const config = {
    ...emptyPlateConfig,
    model: plateModel(c.model)?.id ?? null,
    material: plateMaterial(c.material)?.id ?? null,
    size: PLATE_SIZES.includes(c.size) ? c.size : null,
    remote: c.remote === true,
  };
  const colour = (id) => byId(coloursFor(config), id)?.id ?? null;
  config.panel = colour(c.panel);
  config.frame = hasFrame(config) ? colour(c.frame) : null;
  if (typeof c.accessory === 'string' && plateAccessory({ ...config, accessory: c.accessory })) config.accessory = c.accessory;
  const icons = c.icons && typeof c.icons === 'object' ? c.icons : {};
  config.icons = Object.fromEntries(
    plateButtons(config).flatMap(({ key }) => (typeof icons[key] === 'string' && plateIcon(icons[key]) ? [[key, icons[key]]] : []))
  );
  return config;
}

// Readable description of a plate: what the summary, the lead and the PDF all show.
export function describePlate(config) {
  const accessory = plateAccessory(config);
  // the reference places one accessory per plate, starting at the first module
  const span = accessory ? Math.min(config.size, accessory.nodeSize ?? config.size) : 0;
  return {
    model: plateModel(config.model)?.label ?? null,
    material: plateMaterial(config.material)?.label ?? null,
    size: config.size ? `${config.size} module` : null,
    panel: (plateColour(config.panel) ?? plateColour('black')).label,
    frame: hasFrame(config) ? plateColour(config.frame)?.label ?? 'Silver' : null,
    remote: config.remote ? 'Yes' : 'No',
    accessories: accessory
      ? [{
          name: accessory.name,
          modules: span > 1 ? `Modules 1–${span}` : 'Module 1',
          icons: plateButtons(config).filter((b) => b.icon).map((b) => `Switch ${b.n}: ${plateIcon(b.icon).label}`),
        }]
      : [],
  };
}

// --- plan link: ['p3', model, material, size, accessory, panel, frame, remote, icons] ---

const TAG = 'p3';

export function encodePlate(c) {
  return [TAG, c.model, c.material, c.size, c.accessory, c.panel, c.frame, c.remote ? 1 : 0, c.icons || {}];
}

// Accepts the array above, the older array ([modules, colour, profile, finish, frame, [[accessory, start]…], icons])
// or a config object. Returns a clean config, or null when there is no plate in it.
export function decodePlate(p) {
  let raw = p;
  if (Array.isArray(p)) {
    if (p[0] === TAG) {
      const [, model, material, size, accessory, panel, frame, remote, icons] = p;
      raw = { model, material, size, accessory, panel, frame, remote: remote === 1, icons };
    } else {
      const list = Array.isArray(p[5]) ? p[5] : [];
      raw = { model: `${p[0]} module`, material: p[1], accessories: list.map((entry) => ({ name: Array.isArray(entry) ? entry[0] : null })) };
    }
  }
  const config = cleanPlateConfig(raw);
  return hasPlate(config) ? config : null;
}
