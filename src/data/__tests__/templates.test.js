import { describe, it, expect } from 'vitest';
import { TEMPLATES, HOME_TYPES, seedDevices, buildRooms } from '../templates.js';

describe('templates', () => {
  it('exposes the four home types', () => {
    expect(HOME_TYPES).toEqual(['1BHK', '2BHK', '3BHK', 'Villa']);
  });
  it('every home type has a non-empty room template', () => {
    for (const t of HOME_TYPES) {
      expect(TEMPLATES[t].length).toBeGreaterThan(0);
    }
  });
  it('seedDevices returns devices whose defaultRooms include the roomType', () => {
    const seeded = seedDevices('bath');
    expect(seeded.some((d) => d.deviceId === 'geyser')).toBe(true);
    expect(seeded.every((d) => d.qty === 1 && d.on === false)).toBe(true);
  });
  it('buildRooms returns rooms with unique ids and seeded devices', () => {
    const rooms = buildRooms('2BHK');
    const ids = rooms.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(rooms.every((r) => Array.isArray(r.devices))).toBe(true);
  });
});
