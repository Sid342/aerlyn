import { nextId } from '../data/templates.js';

const KEY = 'aerlyn_plan_v1';
const VERSION = 1;
const OVERRIDE_KEYS = ['gang', 'fan', 'curtain', 'socket'];

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

// Returns a plan ready for HYDRATE (rooms and scenes get fresh ids), or null if the string is not a valid plan.
export function decodePlan(str) {
  try {
    const c = JSON.parse(fromBase64Url(str));
    if (!c || c.v !== VERSION) return null;
    const rooms = c.r.map(([name, roomType, size, devices, overrides]) => ({
      id: nextId(),
      name, roomType, size,
      devices: devices.map(([deviceId, qty, edited]) => ({
        deviceId, qty, on: false, ...(edited ? { edited: true } : {}),
      })),
      switchOverrides: Object.fromEntries(OVERRIDE_KEYS.map((k, i) => [k, overrides ? overrides[i] : null])),
    }));
    const plan = {
      homeType: c.t,
      rooms,
      customScenes: c.s.map(([name, icon, deviceStates], i) => ({
        id: `scene-link-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name, icon, deviceStates: deviceStates || {},
      })),
      plateRoomId: null,
    };
    if (c.p && typeof c.p === 'object') {
      plan.plateConfig = c.p;
      plan.plateRoomId = rooms[c.pr] ? rooms[c.pr].id : null;
    }
    return isPlan(plan) ? plan : null;
  } catch {
    return null;
  }
}
