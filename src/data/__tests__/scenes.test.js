import { describe, it, expect } from 'vitest';
import { SCENES } from '../scenes.js';
import { getDevice } from '../devices.js';

describe('scene presets', () => {
  it('has at least three scenes', () => {
    expect(SCENES.length).toBeGreaterThanOrEqual(3);
  });
  it('every scene has a name, icon and deviceStates map', () => {
    for (const s of SCENES) {
      expect(s.name && s.icon).toBeTruthy();
      expect(typeof s.deviceStates).toBe('object');
    }
  });
  it('every deviceStates key is a real device id', () => {
    for (const s of SCENES) {
      for (const id of Object.keys(s.deviceStates)) {
        expect(getDevice(id)).toBeDefined();
      }
    }
  });
});
