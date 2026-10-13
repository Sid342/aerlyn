import { devicesInHome } from '../data/devices.js';

// What the plan bar shows: the room count and the number of distinct device types in the home.
// Deliberately no quantity totals — the full quantities go in the lead and the PDF.
export function planSummary(home) {
  return { rooms: home.rooms.length, features: devicesInHome(home.rooms).length };
}

const count = (n, one) => `${n} ${one}${n === 1 ? '' : 's'}`;

// "Your 2BHK plan · 6 rooms · 14 smart features"
export function planSummaryText(home) {
  const { rooms, features } = planSummary(home);
  return `Your ${home.homeType} plan · ${count(rooms, 'room')} · ${count(features, 'smart feature')}`;
}
