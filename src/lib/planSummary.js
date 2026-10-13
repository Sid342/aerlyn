import { planRoom } from './switchPlanner.js';

// Live totals for the plan bar: rooms, total device quantity, switch plates across all rooms.
export function planSummary(home) {
  let devices = 0;
  let plates = 0;
  for (const room of home.rooms) {
    for (const d of room.devices) devices += d.qty;
    plates += planRoom(room).plates.length;
  }
  return { rooms: home.rooms.length, devices, plates };
}
