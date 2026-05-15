import { describe, it, expect } from 'vitest';
import { DEVICES, getDevice } from '../devices.js';

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
      expect(d.id && d.name && d.category && d.icon && d.blurb).toBeTruthy();
      expect(Array.isArray(d.defaultRooms)).toBe(true);
    }
  });
  it('smart-switch is no longer in the catalog', () => {
    expect(getDevice('smart-switch')).toBeUndefined();
  });
  it('getDevice resolves usb-charger', () => {
    const d = getDevice('usb-charger');
    expect(d).toBeDefined();
    expect(d.name).toBe('USB Charging Socket');
    expect(d.category).toBe('Power');
    expect(d.control).toEqual({ type: 'socket', count: 1 });
  });
  it('getDevice resolves power-socket', () => {
    const d = getDevice('power-socket');
    expect(d).toBeDefined();
    expect(d.name).toBe('Power Socket');
    expect(d.category).toBe('Power');
    expect(d.control).toEqual({ type: 'socket', count: 1 });
  });
  it('getDevice returns undefined for unknown id', () => {
    expect(getDevice('nope')).toBeUndefined();
  });
  it('all T11.5 lighting ids resolve via getDevice', () => {
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
