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

// devices whose defaultRooms include this roomType, filtered and qty'd by size.
// sizeWhitelist: missing or empty array = seed at all sizes.
// sizeRule[size]: nullish = qty 1 (a literal 0 is honoured as qty 0).
export function seedDevices(roomType, size) {
  return DEVICES
    .filter((d) => d.defaultRooms.includes(roomType))
    .filter((d) => !d.sizeWhitelist || d.sizeWhitelist.length === 0 || d.sizeWhitelist.includes(size))
    .map((d) => ({
      deviceId: d.id,
      qty: d.sizeRule && d.sizeRule[size] != null ? d.sizeRule[size] : 1,
      on: false,
    }));
}

let roomCounter = 0;
function nextId() {
  roomCounter += 1;
  return `room-${roomCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_OVERRIDES = { gang: null, fan: null, curtain: null, socket: null };

export function buildRooms(homeType) {
  return (TEMPLATES[homeType] || []).map(([name, roomType, size]) => ({
    id: nextId(),
    name,
    roomType,
    size,
    devices: seedDevices(roomType, size),
    switchOverrides: { ...DEFAULT_OVERRIDES },
  }));
}

// exported for use by the reducer when the user adds a blank room
export function makeRoom(name, roomType, size = 'M') {
  return {
    id: nextId(), name, roomType, size,
    devices: seedDevices(roomType, size),
    switchOverrides: { ...DEFAULT_OVERRIDES },
  };
}

// Clone a room into a new room with a fresh id and " (copy)" suffix on the name.
// Devices are deep-copied (so toggling the copy's qty/on doesn't affect the original).
export function cloneRoom(room) {
  return {
    ...room,
    id: nextId(),
    name: `${room.name} (copy)`,
    devices: room.devices.map((d) => ({ ...d })),
    switchOverrides: { ...(room.switchOverrides || DEFAULT_OVERRIDES) },
  };
}
