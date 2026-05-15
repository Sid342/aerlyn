// src/lib/__tests__/exportJson.test.js
import { describe, it, expect } from 'vitest';
import { buildExportPayload } from '../exportJson.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

function sampleHome() {
  let s = homeReducer(initialHome, actions.setHomeType('1BHK'));
  s = homeReducer(s, actions.toggleDevice(s.rooms[0].id, s.rooms[0].devices[0].deviceId));
  return s;
}

describe('buildExportPayload', () => {
  it('includes schema version, home type and rooms', () => {
    const p = buildExportPayload(sampleHome());
    expect(p.schemaVersion).toBe(1);
    expect(p.homeType).toBe('1BHK');
    expect(p.rooms.length).toBe(5);
  });
  it('strips the on flag from devices', () => {
    const p = buildExportPayload(sampleHome());
    const everyDevice = p.rooms.flatMap((r) => r.devices);
    expect(everyDevice.every((d) => !('on' in d))).toBe(true);
  });
  it('resolves device name and category from the catalog', () => {
    const p = buildExportPayload(sampleHome());
    const dev = p.rooms[0].devices[0];
    expect(dev.deviceId && dev.name && dev.category && dev.qty).toBeTruthy();
  });
  it('omits internal room ids', () => {
    const p = buildExportPayload(sampleHome());
    expect(p.rooms.every((r) => !('id' in r))).toBe(true);
  });
  it('includes an ISO exportedAt timestamp', () => {
    const p = buildExportPayload(sampleHome());
    expect(() => new Date(p.exportedAt).toISOString()).not.toThrow();
  });
});
