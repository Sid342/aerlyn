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
  it('falls back to deviceId and Unknown category for an unknown deviceId', () => {
    const home = {
      ...initialHome,
      homeType: '1BHK',
      rooms: [
        {
          id: 'r1',
          name: 'Test',
          roomType: 'other',
          size: 'M',
          devices: [{ deviceId: 'FAKE-999', qty: 2, on: false }],
        },
      ],
    };
    const p = buildExportPayload(home);
    expect(p.rooms[0].devices[0]).toEqual({
      deviceId: 'FAKE-999',
      name: 'FAKE-999',
      category: 'Unknown',
      qty: 2,
    });
  });
  it('handles an empty home (no rooms, no homeType)', () => {
    const p = buildExportPayload(initialHome);
    expect(p.schemaVersion).toBe(1);
    expect(p.homeType).toBeNull();
    expect(p.rooms).toEqual([]);
  });
  it('includes custom scenes with device names', () => {
    let home = homeReducer(sampleHome(), { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Dinner' } });
    home = homeReducer(home, {
      type: 'SET_SCENE_DEVICE_STATE',
      payload: { sceneId: home.customScenes[0].id, deviceId: 'rgbw-strip', on: true },
    });
    expect(buildExportPayload(home).customScenes).toEqual([
      { name: 'Dinner', devices: [{ deviceId: 'rgbw-strip', name: 'RGBW Strip Light', on: true }] },
    ]);
  });
  it('leaves out scene entries for devices that are no longer in the home', () => {
    let home = homeReducer(sampleHome(), { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Dinner' } });
    const sceneId = home.customScenes[0].id;
    for (const deviceId of ['rgbw-strip', 'geyser']) {
      home = homeReducer(home, { type: 'SET_SCENE_DEVICE_STATE', payload: { sceneId, deviceId, on: true } });
    }
    for (const r of home.rooms) home = homeReducer(home, actions.removeDevice(r.id, 'geyser'));
    expect(buildExportPayload(home).customScenes[0].devices.map((d) => d.deviceId)).toEqual(['rgbw-strip']);
  });
  it('plate is null until a model is chosen', () => {
    expect(buildExportPayload(sampleHome()).plate).toBeNull();
    expect(buildExportPayload(initialHome).customScenes).toEqual([]);
  });
  it('includes the plate config and the room it was designed for', () => {
    let home = sampleHome();
    home = homeReducer(home, actions.designPlate(home.rooms[1].id, 4));
    home = homeReducer(home, actions.setPlateConfig({
      ...home.plateConfig, material: 'Black', size: 'Standard', panel: 'Matte', frame: 'Square',
      accessories: [{ id: 'a1', name: '4 Switch', nodeSize: 2, slots: [0, 1] }], icons: { a1: '💡' },
    }));
    expect(buildExportPayload(home).plate).toEqual({
      room: home.rooms[1].name,
      model: '4 module', material: 'Black', size: 'Standard', panel: 'Matte', frame: 'Square',
      accessories: [{ name: '4 Switch', slots: [0, 1], icon: '💡' }],
    });
  });
  it('never includes the floor plan image', () => {
    const home = homeReducer(sampleHome(), actions.setFloorPlan('data:image/png;base64,SECRET'));
    expect(JSON.stringify(buildExportPayload(home))).not.toContain('SECRET');
  });
  it('each room has switchPlan with expected fields', () => {
    const p = buildExportPayload(sampleHome());
    for (const room of p.rooms) {
      expect(room.switchPlan).toBeDefined();
      expect(typeof room.switchPlan.gang).toBe('number');
      expect(typeof room.switchPlan.fan).toBe('number');
      expect(typeof room.switchPlan.curtain).toBe('number');
      expect(typeof room.switchPlan.socket).toBe('number');
      expect(typeof room.switchPlan.total).toBe('number');
      expect(Array.isArray(room.switchPlan.plates)).toBe(true);
      expect(typeof room.switchPlan.spareModules).toBe('number');
    }
  });
  it('switchPlan byType is stripped from export payload', () => {
    const p = buildExportPayload(sampleHome());
    for (const room of p.rooms) {
      expect(room.switchPlan.byType).toBeUndefined();
    }
  });
});
