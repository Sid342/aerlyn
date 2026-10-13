import { getDevice } from '../data/devices.js';

// What a visitor can ask for, in the order the chips are shown.
export const GOALS = [
  { id: 'lighting', label: 'Lighting' },
  { id: 'climate', label: 'Fans & AC' },
  { id: 'curtains', label: 'Curtains' },
  { id: 'security', label: 'Security' },
  { id: 'energy', label: 'Geyser & energy' },
  { id: 'voice', label: 'Voice & music' },
];
export const ALL_GOALS = GOALS.map((g) => g.id);

const BY_CATEGORY = {
  Lighting: 'lighting', Comfort: 'climate', Security: 'security',
  Water: 'energy', Energy: 'energy', Control: 'voice', Audio: 'voice',
};

// The goal a device belongs to. null for power sockets and USB points: they are part of any
// install, so no chip removes them.
export function goalOf(deviceId) {
  if (deviceId === 'curtain') return 'curtains';
  return BY_CATEGORY[getDevice(deviceId)?.category] ?? null;
}

// The rooms with only the devices of the chosen goals. Nothing is deleted: the full rooms stay
// in the plan, so choosing a goal again brings its devices back as they were.
export function applyGoals(rooms, goals) {
  if (ALL_GOALS.every((g) => goals.includes(g))) return rooms;
  return rooms.map((room) => ({
    ...room,
    devices: room.devices.filter((d) => {
      const goal = goalOf(d.deviceId);
      return goal === null || goals.includes(goal);
    }),
  }));
}

// Known goals in chip order. Anything that is not a list (a plan saved before goals existed) means all of them.
export function cleanGoals(value) {
  return Array.isArray(value) ? ALL_GOALS.filter((g) => value.includes(g)) : ALL_GOALS;
}

// One small number for a plan link: bit i is set when goal i is chosen.
export const goalsToBits = (goals) => ALL_GOALS.reduce((bits, g, i) => (goals.includes(g) ? bits | (1 << i) : bits), 0);
export const bitsToGoals = (bits) => ALL_GOALS.filter((_, i) => (Number(bits) >> i) & 1);
