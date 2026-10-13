// roomType values: living | bedroom | kitchen | bath | entrance | balcony | other
// short: the word used for the device in a room's one-line summary (several devices can share one)
// optional device fields:
//   sizeRule: { S: n, M: n, L: n } — qty by room size for seeding (omit = qty 1 all sizes)
//   sizeWhitelist: ['M','L'] — if present, device only seeds when room.size matches (omit = all sizes OK)
//   control: { type, count } — wall-module requirement for switch-plate planning
//     type: 'gang' | 'fan' | 'curtain' | 'socket'
//     count: integer modules per unit (almost always 1)
//     omit on devices that need no wall module (geyser, ac-ir, camera, motion-sensor,
//     gas-sensor, door-lock, energy-meter, scene-remote, voice)
export const DEVICES = [
  { id: 'cct-light', name: 'Colour-temperature lights', short: 'lights', category: 'Lighting',
    blurb: 'Warm light in the evening and cool white in the day.',
    defaultRooms: ['living', 'bedroom'],
    sizeRule: { S: 1, M: 1, L: 2 },
    control: { type: 'gang', count: 1 } },
  { id: 'rgbw-strip', name: 'Colour-changing strip', short: 'lights', category: 'Lighting',
    blurb: 'Accent lighting in any colour.',
    defaultRooms: ['living', 'bedroom'],
    sizeRule: { S: 1, M: 1, L: 2 },
    control: { type: 'gang', count: 1 } },
  { id: 'bldc-fan', name: 'Smart fan', short: 'fan', category: 'Comfort',
    blurb: 'Set the speed from the app or on a schedule.',
    defaultRooms: ['living', 'bedroom'],
    sizeRule: { S: 1, M: 1, L: 2 },
    control: { type: 'fan', count: 1 } },
  { id: 'ac-ir', name: 'AC control', short: 'AC', category: 'Comfort',
    blurb: 'Works with any AC that has a remote. Turn it on before you get home.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'curtain', name: 'Motorised curtain', short: 'curtains', category: 'Comfort',
    blurb: 'Opens and closes on a schedule or from the app.',
    defaultRooms: ['living', 'bedroom'],
    sizeRule: { S: 1, M: 1, L: 2 },
    control: { type: 'curtain', count: 1 } },
  { id: 'geyser', name: 'Geyser control', short: 'geyser', category: 'Water',
    blurb: 'Heats water on a schedule and switches itself off.',
    defaultRooms: ['bath'] },
  { id: 'door-lock', name: 'Smart door lock', short: 'door lock', category: 'Security',
    blurb: 'Unlock without a key, let guests in from your phone and see who came in.',
    defaultRooms: ['entrance'] },
  { id: 'camera', name: 'Camera', short: 'camera', category: 'Security',
    blurb: 'A 5MP camera you can watch live on your phone, with motion alerts.',
    defaultRooms: ['entrance', 'living'] },
  { id: 'motion-sensor', name: 'Motion sensor', short: 'motion sensor', category: 'Security',
    blurb: 'Turns lights on when someone walks in and alerts you when you are away.',
    defaultRooms: ['entrance', 'living', 'bath'] },
  { id: 'gas-sensor', name: 'Gas and smoke sensor', short: 'gas and smoke sensor', category: 'Security',
    blurb: 'Warns you early about a gas leak or smoke.',
    defaultRooms: ['kitchen'] },
  { id: 'energy-meter', name: 'Energy meter', short: 'energy meter', category: 'Energy',
    blurb: 'Shows what is using power right now.',
    defaultRooms: ['other'] },
  { id: 'scene-remote', name: 'Scene remote', short: 'scene remote', category: 'Control',
    blurb: 'A wall button that runs a scene with one tap.',
    defaultRooms: ['living', 'bedroom', 'entrance'] },
  { id: 'voice', name: 'Voice control', short: 'voice control', category: 'Control',
    blurb: 'Works with Alexa, Google and Siri.',
    defaultRooms: ['living', 'bedroom'] },
  { id: 'cob-downlight', name: 'Ceiling spotlights', short: 'lights', category: 'Lighting',
    blurb: 'Recessed ceiling lights that light the room evenly.',
    defaultRooms: ['living', 'bedroom', 'kitchen', 'bath', 'entrance'],
    sizeRule: { S: 2, M: 4, L: 6 },
    control: { type: 'gang', count: 1 } },
  { id: 'track-light', name: 'Track lights', short: 'lights', category: 'Lighting',
    blurb: 'Spotlights on a rail that you can point where you need them.',
    defaultRooms: ['living', 'kitchen', 'other'],
    sizeWhitelist: ['M', 'L'],
    control: { type: 'gang', count: 1 } },
  { id: 'surface-panel', name: 'Ceiling panel light', short: 'lights', category: 'Lighting',
    blurb: 'A flat ceiling light for kitchens, bathrooms and utility areas.',
    defaultRooms: ['kitchen', 'bath', 'balcony', 'entrance', 'other'],
    control: { type: 'gang', count: 1 } },
  { id: 'pendant-light', name: 'Hanging light', short: 'lights', category: 'Lighting',
    blurb: 'A hanging light for a dining table or kitchen counter.',
    defaultRooms: ['living', 'kitchen'],
    sizeWhitelist: ['M', 'L'],
    control: { type: 'gang', count: 1 } },
  { id: 'wall-sconce', name: 'Wall light', short: 'lights', category: 'Lighting',
    blurb: 'A soft side light for a sofa or bedside.',
    defaultRooms: ['living', 'bedroom', 'balcony'],
    control: { type: 'gang', count: 1 } },
  { id: 'profile-light', name: 'Cove lighting', short: 'lights', category: 'Lighting',
    blurb: 'A hidden LED strip in a false ceiling.',
    defaultRooms: ['living', 'bedroom'],
    sizeRule: { S: 1, M: 1, L: 2 },
    control: { type: 'gang', count: 1 } },
  { id: 'outdoor-light', name: 'Outdoor light', short: 'lights', category: 'Lighting',
    blurb: 'A weatherproof light for a balcony or entrance.',
    defaultRooms: ['balcony', 'entrance'],
    control: { type: 'gang', count: 1 } },
  { id: 'usb-charger', name: 'USB charging socket', short: 'sockets', category: 'Power',
    blurb: 'USB-A and USB-C fast charging at the wall.',
    defaultRooms: ['living', 'bedroom', 'kitchen', 'entrance'],
    sizeRule: { S: 1, M: 2, L: 2 },
    control: { type: 'socket', count: 1 } },
  { id: 'power-socket', name: 'Power socket', short: 'sockets', category: 'Power',
    blurb: 'A 5A / 15A socket point.',
    defaultRooms: ['living', 'bedroom', 'kitchen', 'bath', 'balcony', 'entrance', 'other'],
    sizeRule: { S: 2, M: 3, L: 4 },
    control: { type: 'socket', count: 1 } },
  { id: 'smart-speaker', name: 'Smart speaker', short: 'speaker', category: 'Audio',
    blurb: 'Plays music, answers voice commands and can start scenes.',
    defaultRooms: ['living', 'bedroom'] },
];

const BY_ID = Object.fromEntries(DEVICES.map((d) => [d.id, d]));
export function getDevice(id) {
  // own keys only — ids can come from a plan link, and 'constructor' is not a device
  return Object.hasOwn(BY_ID, id) ? BY_ID[id] : undefined;
}

// catalogue devices that appear in at least one room, in catalogue order
export function devicesInHome(rooms) {
  const present = new Set(rooms.flatMap((r) => r.devices.map((d) => d.deviceId)));
  return DEVICES.filter((d) => present.has(d.id));
}

// a scene's on/off entries for devices that are still in the home, in catalogue order
export function sceneDevicesInHome(scene, rooms) {
  const states = scene.deviceStates || {};
  return devicesInHome(rooms)
    .filter((d) => d.id in states)
    .map((d) => ({ deviceId: d.id, name: d.name, on: !!states[d.id] }));
}
