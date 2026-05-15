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

// devices whose defaultRooms include this roomType, filtered and qty'd by size
export function seedDevices(roomType, size) {
  return DEVICES
    .filter((d) => d.defaultRooms.includes(roomType))
    .filter((d) => !d.sizeWhitelist || d.sizeWhitelist.includes(size))
    .map((d) => ({
      deviceId: d.id,
      qty: (d.sizeRule && d.sizeRule[size]) || 1,
      on: false,
    }));
}

let roomCounter = 0;
function nextId() {
  roomCounter += 1;
  return `room-${roomCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildRooms(homeType) {
  return (TEMPLATES[homeType] || []).map(([name, roomType, size]) => ({
    id: nextId(),
    name,
    roomType,
    size,
    devices: seedDevices(roomType, size),
  }));
}

// exported for use by the reducer when the user adds a blank room
export function makeRoom(name, roomType, size = 'M') {
  return { id: nextId(), name, roomType, size, devices: seedDevices(roomType, size) };
}
