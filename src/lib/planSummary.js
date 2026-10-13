import { getDevice } from '../data/devices.js';
import { buildRooms } from '../data/templates.js';
import { ALL_GOALS, goalOf } from './goals.js';

// lights first, sockets last: the order of the goal chips
function rank(deviceId) {
  const goal = goalOf(deviceId);
  return goal === null ? ALL_GOALS.length : ALL_GOALS.indexOf(goal);
}

// "Lights, fan, AC, curtains and sockets": what a room gets, in plain words.
// Deliberately no quantities or switch counts; those go in the lead and the PDF.
export function roomSentence(room) {
  const ids = room.devices.map((d) => d.deviceId).filter(getDevice).sort((a, b) => rank(a) - rank(b));
  const words = [...new Set(ids.map((id) => getDevice(id).short))];
  if (!words.length) return 'Nothing yet';
  const text = words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words.at(-1)}` : words[0];
  return text[0].toUpperCase() + text.slice(1);
}

const shape = (rooms) => JSON.stringify(rooms.map((r) => [
  r.name, r.roomType, r.size, r.devices.map((d) => [d.deviceId, d.qty]), Object.values(r.switchOverrides || {}).map((v) => v ?? null),
]));

// True once the plan differs from what picking its home type gives: there are edits to lose.
export function isCustomised(plan) {
  return plan.customScenes.length > 0 || shape(plan.rooms) !== shape(buildRooms(plan.homeType));
}
