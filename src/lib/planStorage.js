import { nextId, HOME_TYPES } from '../data/templates.js';
import { getDevice } from '../data/devices.js';
import { MODULE_OPTIONS } from '../data/plateAccessories.js';

const KEY = 'aerlyn_plan_v1';
const VERSION = 1;
const OVERRIDE_KEYS = ['gang', 'fan', 'curtain', 'socket'];
const ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bath', 'entrance', 'balcony', 'other'];
const SIZES = ['S', 'M', 'L'];
// limits for plans that arrive in a link
const MAX_ROOMS = 40;
const MAX_SCENES = 20;
const MAX_QTY = 99;
const MAX_TEXT = 60;

function isPlan(h) {
  return !!h && typeof h === 'object'
    && Array.isArray(h.rooms)
    && h.rooms.every((r) => r && typeof r.name === 'string' && Array.isArray(r.devices))
    && Array.isArray(h.customScenes);
}

// The part of home state that is a "plan". Deliberately leaves out floorPlanImage and mode.
function planOf(home) {
  const plan = {
    homeType: home.homeType,
    rooms: home.rooms,
    customScenes: home.customScenes,
    plateRoomId: home.plateRoomId ?? null,
  };
  if (home.plateConfig && typeof home.plateConfig === 'object') plan.plateConfig = home.plateConfig;
  return plan;
}

// --- browser storage ---

export function savePlan(home) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, home: planOf(home) }));
  } catch {
    // storage unavailable or full — the plan just isn't remembered
  }
}

// Returns the stored plan, or null if there is none or it is corrupt / another version.
export function loadPlan() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (!data || data.v !== VERSION || !isPlan(data.home)) return null;
    return planOf(data.home);
  } catch {
    return null;
  }
}

// --- plan link (/#plan=…) ---

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodePlan(home) {
  const compact = {
    v: VERSION,
    t: home.homeType,
    r: home.rooms.map((r) => {
      const o = r.switchOverrides || {};
      const row = [
        r.name, r.roomType, r.size,
        r.devices.map((d) => (d.edited ? [d.deviceId, d.qty, 1] : [d.deviceId, d.qty])),
      ];
      if (OVERRIDE_KEYS.some((k) => o[k] != null)) row.push(OVERRIDE_KEYS.map((k) => o[k] ?? null));
      return row;
    }),
    s: home.customScenes.map((s) => [s.name, s.icon, s.deviceStates]),
  };
  if (home.plateConfig && home.plateConfig.model) {
    compact.p = home.plateConfig;
    compact.pr = home.rooms.findIndex((r) => r.id === home.plateRoomId);
  }
  return toBase64Url(JSON.stringify(compact));
}

// --- a plan link is untrusted input: everything below keeps only what the planner knows how to show ---

const isText = (v) => typeof v === 'string' && v.length <= MAX_TEXT;
const textOr = (v, fallback) => (typeof v === 'string' && v.trim() ? v.slice(0, MAX_TEXT) : fallback);
const clampInt = (v, min, max) => Math.min(max, Math.max(min, Math.trunc(Number(v)) || min));

function cleanDevices(list) {
  const seen = new Set();
  const devices = [];
  for (const entry of Array.isArray(list) ? list : []) {
    const [deviceId, qty, edited] = Array.isArray(entry) ? entry : [];
    if (typeof deviceId !== 'string' || !getDevice(deviceId) || seen.has(deviceId)) continue;
    seen.add(deviceId);
    devices.push({ deviceId, qty: clampInt(qty, 1, MAX_QTY), on: false, ...(edited ? { edited: true } : {}) });
  }
  return devices;
}

function cleanDeviceStates(states) {
  if (!states || typeof states !== 'object') return {};
  return Object.fromEntries(
    Object.entries(states).filter(([id]) => getDevice(id)).map(([id, on]) => [id, !!on])
  );
}

// Returns a full plate config, or null if any part of it is not what the designer produces.
function cleanPlate(p) {
  if (!p || typeof p !== 'object') return null;
  const option = MODULE_OPTIONS.find((o) => o.label === p.model);
  if (!option) return null;
  const choices = ['material', 'size', 'panel', 'frame'];
  if (!choices.every((k) => p[k] == null || isText(p[k]))) return null;
  if (p.materialCode != null && !(typeof p.materialCode === 'string' && /^#[0-9a-f]{6}$/i.test(p.materialCode))) return null;

  const isSlot = (n) => Number.isInteger(n) && n >= 0 && n < option.maxSlots;
  const isAccessory = (a) => !!a && typeof a === 'object' && isText(a.id) && isText(a.name)
    && isSlot(a.nodeSize - 1) && Array.isArray(a.slots) && a.slots.length <= option.maxSlots && a.slots.every(isSlot);
  if (!Array.isArray(p.accessories) || p.accessories.length > option.maxSlots || !p.accessories.every(isAccessory)) return null;

  if (!p.icons || typeof p.icons !== 'object' || Array.isArray(p.icons)) return null;
  const ids = new Set(p.accessories.map((a) => a.id));
  const icons = Object.entries(p.icons).filter(([id]) => ids.has(id));
  if (!icons.every(([, icon]) => icon == null || (typeof icon === 'string' && icon.length <= 8))) return null;

  return {
    model: option.label,
    maxSlots: option.maxSlots,
    material: p.material ?? null,
    materialCode: p.materialCode ?? null,
    size: p.size ?? null,
    accessories: p.accessories.map(({ id, name, nodeSize, slots }) => ({ id, name, nodeSize, slots })),
    icons: Object.fromEntries(icons),
    panel: p.panel ?? null,
    frame: p.frame ?? null,
  };
}

// Returns a plan ready for HYDRATE (rooms and scenes get fresh ids), or null if the string is not a valid plan.
// Unknown devices are dropped, quantities clamped, rooms and scenes capped; a bad plate is dropped on its own.
export function decodePlan(str) {
  try {
    const c = JSON.parse(fromBase64Url(str));
    if (!c || c.v !== VERSION || !HOME_TYPES.includes(c.t)) return null;
    if (!Array.isArray(c.r) || !c.r.every(Array.isArray) || !Array.isArray(c.s)) return null;
    const rooms = c.r.slice(0, MAX_ROOMS).map(([name, roomType, size, devices, overrides]) => ({
      id: nextId(),
      name: textOr(name, 'Room'),
      roomType: ROOM_TYPES.includes(roomType) ? roomType : 'other',
      size: SIZES.includes(size) ? size : 'M',
      devices: cleanDevices(devices),
      switchOverrides: Object.fromEntries(OVERRIDE_KEYS.map((k, i) => [
        k, Array.isArray(overrides) && overrides[i] != null ? clampInt(overrides[i], 0, MAX_QTY) : null,
      ])),
    }));
    const plan = {
      homeType: c.t,
      rooms,
      customScenes: c.s.filter(Array.isArray).slice(0, MAX_SCENES).map(([name, icon, deviceStates], i) => ({
        id: `scene-link-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name: textOr(name, 'Scene'),
        icon: typeof icon === 'string' && icon.length <= 8 ? icon : '✨',
        deviceStates: cleanDeviceStates(deviceStates),
      })),
      plateRoomId: null,
    };
    const plate = cleanPlate(c.p);
    if (plate) {
      plan.plateConfig = plate;
      plan.plateRoomId = rooms[c.pr] ? rooms[c.pr].id : null;
    }
    return isPlan(plan) ? plan : null;
  } catch {
    return null;
  }
}

// --- first load ---

// Decide what the planner opens with. `hash` is location.hash, `stored` is loadPlan().
// Pure, and only ever called after mount — the first render is always the empty planner,
// so server-rendered and client HTML match.
//   plan        — plan to HYDRATE now, or null
//   pendingLink — a linked plan that differs from the stored one; needs the customer's OK before it replaces it
//   notice      — 'restored' | 'badlink' | null
//   clearHash   — the link has been dealt with; take it out of the URL
export function planOnLoad(hash, stored) {
  const current = stored && stored.homeType ? stored : null;
  const isLink = hash.startsWith('#plan=');
  const linked = isLink ? decodePlan(hash.slice('#plan='.length)) : null;
  if (linked && current && encodePlan(linked) !== encodePlan(current)) {
    return { plan: current, pendingLink: linked, notice: null, clearHash: false };
  }
  if (linked) return { plan: linked, pendingLink: null, notice: 'restored', clearHash: true };
  return { plan: current, pendingLink: null, notice: isLink ? 'badlink' : current ? 'restored' : null, clearHash: isLink };
}
