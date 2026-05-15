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

// Greedy plate selection from standard Indian modular sizes.
const PLATE_SIZES = [12, 8, 6, 4, 2];
export function recommendPlates(total) {
  if (total <= 0) return { plates: [], spareModules: 0 };
  const plates = [];
  let remaining = total;
  while (remaining > 0) {
    const fit = PLATE_SIZES.find((s) => s <= remaining);
    if (fit) {
      plates.push(fit);
      remaining -= fit;
    } else {
      // remaining === 1 — pad with a 2-module plate, 1 spare
      plates.push(2);
      remaining = 0;
    }
  }
  const spareModules = plates.reduce((a, b) => a + b, 0) - total;
  return { plates, spareModules };
}

// Convenience composition.
export function planRoom(room) {
  const points = computeRoomPoints(room);
  return { ...points, ...recommendPlates(points.total) };
}
