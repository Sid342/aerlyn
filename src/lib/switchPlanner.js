import { getDevice } from '../data/devices.js';

// Compute per-room control-module totals broken down by type.
export function computeRoomPoints(room) {
  const tally = { gang: 0, fan: 0, curtain: 0, socket: 0 };
  for (const d of room.devices) {
    const meta = getDevice(d.deviceId);
    if (!meta || !meta.control) continue;
    const t = meta.control.type;
    if (!(t in tally)) continue;
    tally[t] += (meta.control.count || 1) * d.qty;
  }
  const total = tally.gang + tally.fan + tally.curtain + tally.socket;
  return { ...tally, total, byType: { ...tally } };
}

// Smallest-fit plate selection from standard Indian modular sizes.
const PLATE_SIZES_ASC = [2, 4, 6, 8, 12];
export function recommendPlates(total) {
  if (total === 0) return { plates: [], spareModules: 0 };
  const plates = [];
  let remaining = total;
  while (remaining > 0) {
    if (remaining === 1) remaining = 2; // pad lone remainder to smallest plate
    const fit = PLATE_SIZES_ASC.find((s) => s >= remaining) ?? 12;
    plates.push(fit);
    remaining -= fit;
  }
  const capacity = plates.reduce((a, b) => a + b, 0);
  return { plates, spareModules: capacity - total };
}

// Convenience composition.
export function planRoom(room) {
  const points = computeRoomPoints(room);
  return { ...points, ...recommendPlates(points.total) };
}
