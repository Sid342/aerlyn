import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { savePlan, loadPlan, encodePlan, decodePlan } from '../planStorage.js';
import { homeReducer, initialHome, emptyPlateConfig, actions } from '../../context/homeReducer.js';

const KEY = 'aerlyn_plan_v1';

function sampleHome() {
  let s = homeReducer(initialHome, actions.setHomeType('1BHK'));
  const room = s.rooms[0];
  s = homeReducer(s, actions.renameRoom(room.id, 'बैठक Living ✨'));
  s = homeReducer(s, actions.setDeviceQty(room.id, 'cob-downlight', 9));
  s = homeReducer(s, actions.setSwitchOverride(room.id, 'fan', 3));
  s = homeReducer(s, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Dinner' } });
  s = homeReducer(s, {
    type: 'SET_SCENE_DEVICE_STATE',
    payload: { sceneId: s.customScenes[0].id, deviceId: 'rgbw-strip', on: true },
  });
  s = homeReducer(s, actions.setPlateConfig({ ...emptyPlateConfig, model: '8 module', maxSlots: 8, material: 'Black' }));
  s = homeReducer(s, actions.setFloorPlan('data:image/png;base64,SECRET'));
  return { ...s, plateRoomId: s.rooms[1].id };
}

describe('savePlan / loadPlan', () => {
  let store;
  beforeEach(() => {
    store = {};
    globalThis.localStorage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
    };
  });
  afterEach(() => { delete globalThis.localStorage; });

  it('round-trips the plan', () => {
    const home = sampleHome();
    savePlan(home);
    const loaded = loadPlan();
    expect(loaded.homeType).toBe('1BHK');
    expect(loaded.rooms).toEqual(home.rooms);
    expect(loaded.customScenes).toEqual(home.customScenes);
    expect(loaded.plateConfig).toEqual(home.plateConfig);
    expect(loaded.plateRoomId).toBe(home.plateRoomId);
  });

  it('never stores the floor plan image or the mode', () => {
    savePlan({ ...sampleHome(), mode: 'play' });
    expect(store[KEY]).not.toContain('SECRET');
    expect(store[KEY]).not.toContain('floorPlanImage');
    const loaded = loadPlan();
    expect('floorPlanImage' in loaded).toBe(false);
    expect('mode' in loaded).toBe(false);
  });

  it('returns null when nothing is stored', () => {
    expect(loadPlan()).toBeNull();
  });

  it('ignores corrupt input', () => {
    for (const bad of ['{not json', 'null', '42', '{"v":1}', '{"v":1,"home":{"rooms":"nope","customScenes":[]}}',
      '{"v":1,"home":{"rooms":[{"name":"x"}],"customScenes":[]}}']) {
      store[KEY] = bad;
      expect(loadPlan()).toBeNull();
    }
  });

  it('ignores a plan saved by another version', () => {
    savePlan(sampleHome());
    store[KEY] = JSON.stringify({ ...JSON.parse(store[KEY]), v: 2 });
    expect(loadPlan()).toBeNull();
  });

  it('does not throw when storage is unavailable or full', () => {
    globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    expect(() => savePlan(sampleHome())).not.toThrow();
    delete globalThis.localStorage;
    expect(() => savePlan(sampleHome())).not.toThrow();
    expect(loadPlan()).toBeNull();
  });
});

describe('encodePlan / decodePlan', () => {
  it('produces a URL-safe string', () => {
    expect(encodePlan(sampleHome())).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('round-trips rooms, devices, overrides, scenes and plate config', () => {
    const home = sampleHome();
    const plan = decodePlan(encodePlan(home));
    expect(plan.homeType).toBe('1BHK');
    expect(plan.rooms).toHaveLength(home.rooms.length);
    plan.rooms.forEach((r, i) => {
      const src = home.rooms[i];
      expect([r.name, r.roomType, r.size]).toEqual([src.name, src.roomType, src.size]);
      expect(r.devices.map((d) => [d.deviceId, d.qty, !!d.edited]))
        .toEqual(src.devices.map((d) => [d.deviceId, d.qty, !!d.edited]));
      expect(r.switchOverrides).toEqual(src.switchOverrides);
    });
    expect(plan.rooms[0].name).toBe('बैठक Living ✨');
    expect(plan.rooms[0].devices.find((d) => d.deviceId === 'cob-downlight')).toMatchObject({ qty: 9, edited: true });
    expect(plan.rooms[0].switchOverrides.fan).toBe(3);
    expect(plan.customScenes).toHaveLength(1);
    expect(plan.customScenes[0]).toMatchObject({ name: 'Dinner', icon: '✨', deviceStates: { 'rgbw-strip': true } });
    expect(plan.plateConfig).toEqual(home.plateConfig);
  });

  it('gives rooms fresh unique ids and re-points the plate room', () => {
    const plan = decodePlan(encodePlan(sampleHome()));
    expect(new Set(plan.rooms.map((r) => r.id)).size).toBe(plan.rooms.length);
    expect(plan.plateRoomId).toBe(plan.rooms[1].id);
  });

  it('resets device on-state and leaves out the floor plan image', () => {
    let home = sampleHome();
    home = homeReducer(home, actions.toggleDevice(home.rooms[0].id, home.rooms[0].devices[0].deviceId));
    const plan = decodePlan(encodePlan(home));
    expect(plan.rooms.flatMap((r) => r.devices).every((d) => d.on === false)).toBe(true);
    expect('floorPlanImage' in plan).toBe(false);
  });

  it('omits the plate when none has been designed', () => {
    const plan = decodePlan(encodePlan(homeReducer(initialHome, actions.setHomeType('2BHK'))));
    expect('plateConfig' in plan).toBe(false);
    expect(plan.plateRoomId).toBeNull();
  });

  it('the decoded plan hydrates the reducer', () => {
    const s = homeReducer(initialHome, actions.hydrate(decodePlan(encodePlan(sampleHome()))));
    expect(s.homeType).toBe('1BHK');
    expect(s.mode).toBe('build');
    expect(s.floorPlanImage).toBeNull();
  });

  it('returns null for garbage or another version', () => {
    expect(decodePlan('')).toBeNull();
    expect(decodePlan('not-a-plan')).toBeNull();
    expect(decodePlan(btoa(JSON.stringify({ v: 2, t: '1BHK', r: [], s: [] })))).toBeNull();
    expect(decodePlan(btoa(JSON.stringify({ v: 1, t: '1BHK', r: 'x', s: [] })))).toBeNull();
  });
});
