import { describe, it, expect } from 'vitest';
import { DEVICES, getDevice } from '../devices.js';

describe('device catalog', () => {
  it('has unique ids', () => {
    const ids = DEVICES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every device has required fields', () => {
    for (const d of DEVICES) {
      expect(d.id && d.name && d.category && d.icon && d.blurb).toBeTruthy();
      expect(Array.isArray(d.defaultRooms)).toBe(true);
    }
  });
  it('getDevice resolves by id', () => {
    expect(getDevice('smart-switch').name).toBe('Smart Switch / Dimmer');
  });
  it('getDevice returns undefined for unknown id', () => {
    expect(getDevice('nope')).toBeUndefined();
  });
});
