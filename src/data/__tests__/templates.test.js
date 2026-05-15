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
    const seeded = seedDevices('bath', 'M');
    expect(seeded.some((d) => d.deviceId === 'geyser')).toBe(true);
    expect(seeded.every((d) => d.on === false)).toBe(true);
  });
  it('buildRooms returns rooms with unique ids and seeded devices', () => {
    const rooms = buildRooms('2BHK');
    const ids = rooms.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(rooms.every((r) => Array.isArray(r.devices))).toBe(true);
  });

  // T11.5: size-aware seeding tests
  describe('size-aware seeding', () => {
    it('seedDevices living L has correct qtys and includes whitelisted devices', () => {
      const seeded = seedDevices('living', 'L');
      const byId = Object.fromEntries(seeded.map((d) => [d.deviceId, d]));
      expect(byId['cob-downlight'].qty).toBe(6);
      expect(byId['smart-switch'].qty).toBe(3);
      expect(byId['cct-light'].qty).toBe(2);
      expect(byId['track-light']).toBeDefined();
      expect(byId['pendant-light']).toBeDefined();
    });

    it('seedDevices living S excludes sizeWhitelist devices and uses correct qtys', () => {
      const seeded = seedDevices('living', 'S');
      const byId = Object.fromEntries(seeded.map((d) => [d.deviceId, d]));
      expect(byId['track-light']).toBeUndefined();
      expect(byId['pendant-light']).toBeUndefined();
      expect(byId['cob-downlight'].qty).toBe(2);
      expect(byId['smart-switch'].qty).toBe(1);
    });

    it('seedDevices living M includes whitelisted devices and uses correct qtys', () => {
      const seeded = seedDevices('living', 'M');
      const byId = Object.fromEntries(seeded.map((d) => [d.deviceId, d]));
      expect(byId['track-light']).toBeDefined();
      expect(byId['pendant-light']).toBeDefined();
      expect(byId['smart-switch'].qty).toBe(2);
      expect(byId['cob-downlight'].qty).toBe(4);
    });

    it('buildRooms 3BHK Living Room (L) seeds cob-downlight at qty 6', () => {
      const rooms = buildRooms('3BHK');
      const living = rooms.find((r) => r.name === 'Living Room');
      expect(living).toBeDefined();
      expect(living.size).toBe('L');
      const cobDownlight = living.devices.find((d) => d.deviceId === 'cob-downlight');
      expect(cobDownlight).toBeDefined();
      expect(cobDownlight.qty).toBe(6);
    });
  });
});
