import { describe, it, expect } from 'vitest';
import { DEVICES, getDevice, devicesInHome } from '../devices.js';

describe('device catalog', () => {
  it('has unique ids', () => {
    const ids = DEVICES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('has 23 devices', () => {
    expect(DEVICES.length).toBe(23);
  });
  it('every device has required fields', () => {
    for (const d of DEVICES) {
      expect(d.id && d.name && d.short && d.category && d.blurb).toBeTruthy();
      expect(d.name + d.blurb).not.toMatch(/—|\p{Emoji_Presentation}/u);
      expect(Array.isArray(d.defaultRooms)).toBe(true);
    }
  });
  it('smart-switch is no longer in the catalog', () => {
    expect(getDevice('smart-switch')).toBeUndefined();
  });
  it('getDevice resolves usb-charger', () => {
    const d = getDevice('usb-charger');
    expect(d).toBeDefined();
    expect(d.name).toBe('USB charging socket');
    expect(d.category).toBe('Power');
    expect(d.control).toEqual({ type: 'socket', count: 1 });
  });
  it('getDevice resolves power-socket', () => {
    const d = getDevice('power-socket');
    expect(d).toBeDefined();
    expect(d.name).toBe('Power socket');
    expect(d.category).toBe('Power');
    expect(d.control).toEqual({ type: 'socket', count: 1 });
  });
  it('getDevice returns undefined for unknown id', () => {
    expect(getDevice('nope')).toBeUndefined();
    for (const inherited of ['constructor', '__proto__', 'toString']) expect(getDevice(inherited)).toBeUndefined();
  });
  it('uses the plain names from the design', () => {
    const name = (id) => getDevice(id).name;
    expect(['bldc-fan', 'rgbw-strip', 'cob-downlight', 'ac-ir', 'cct-light'].map(name)).toEqual([
      'Smart fan', 'Colour-changing strip', 'Ceiling spotlights', 'AC control', 'Colour-temperature lights',
    ]);
  });
  it('all lighting ids resolve via getDevice', () => {
    const newIds = [
      'cob-downlight', 'track-light', 'surface-panel', 'pendant-light',
      'wall-sconce', 'profile-light', 'outdoor-light',
    ];
    for (const id of newIds) {
      expect(getDevice(id), `getDevice('${id}') should resolve`).toBeDefined();
    }
  });
  it('gang-type devices have correct control field', () => {
    const gangIds = [
      'cob-downlight', 'cct-light', 'rgbw-strip', 'profile-light',
      'pendant-light', 'wall-sconce', 'surface-panel', 'track-light', 'outdoor-light',
    ];
    for (const id of gangIds) {
      const d = getDevice(id);
      expect(d.control, `${id} should have control`).toBeDefined();
      expect(d.control.type).toBe('gang');
      expect(d.control.count).toBe(1);
    }
  });
  it('bldc-fan has fan control, curtain has curtain control', () => {
    expect(getDevice('bldc-fan').control).toEqual({ type: 'fan', count: 1 });
    expect(getDevice('curtain').control).toEqual({ type: 'curtain', count: 1 });
  });
  it('includes smart-speaker device', () => {
    const d = getDevice('smart-speaker');
    expect(d).toBeDefined();
    expect(d.category).toBe('Audio');
    expect(d.defaultRooms).toContain('living');
  });
  it('no-module devices have no control field', () => {
    const noControlIds = ['geyser', 'ac-ir', 'camera', 'motion-sensor', 'gas-sensor',
      'door-lock', 'energy-meter', 'scene-remote', 'voice'];
    for (const id of noControlIds) {
      const d = getDevice(id);
      expect(d, `${id} should exist`).toBeDefined();
      expect(d.control, `${id} should not have control`).toBeUndefined();
    }
  });
});

describe('devicesInHome', () => {
  it('returns nothing for a home with no rooms', () => {
    expect(devicesInHome([])).toEqual([]);
  });
  it('returns each present device once, in catalogue order, ignoring unknown ids', () => {
    const rooms = [
      { devices: [{ deviceId: 'geyser', qty: 1 }, { deviceId: 'cct-light', qty: 2 }] },
      { devices: [{ deviceId: 'cct-light', qty: 1 }, { deviceId: 'not-a-device', qty: 1 }] },
    ];
    expect(devicesInHome(rooms).map((d) => d.id)).toEqual(['cct-light', 'geyser']);
  });
});
