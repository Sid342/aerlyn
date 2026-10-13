import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { savePlan, loadPlan, encodePlan, decodePlan, planOnLoad } from '../planStorage.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';
import { emptyPlateConfig } from '../plateConfig.js';
import { ALL_GOALS } from '../goals.js';

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
  s = homeReducer(s, actions.setPlateConfig({
    ...emptyPlateConfig, model: 'full-glass', material: 'glass', size: 8, accessory: '8-switch-2-20a-1-socket-1-10a',
    icons: { '1.0.0': 'li-l1', '1.3.1': 'fa-f7' }, panel: 'black', frame: 'titanium', remote: true,
  }));
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

  it('stores the chosen goals with every device, and reads a plan saved before goals existed as all goals', () => {
    const home = homeReducer(sampleHome(), actions.toggleGoal('lighting'));
    savePlan(home);
    const loaded = loadPlan();
    expect(loaded.goals).toEqual(ALL_GOALS.filter((g) => g !== 'lighting'));
    expect(loaded.rooms).toEqual(home.rooms);

    const { goals, ...old } = loaded;
    store[KEY] = JSON.stringify({ v: 1, home: old });
    expect(loadPlan().goals).toEqual(ALL_GOALS);
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

  it('resets device on-state', () => {
    const home = homeReducer(sampleHome(), actions.applyScene({ 'cct-light': true }));
    expect(home.rooms.flatMap((r) => r.devices).some((d) => d.on)).toBe(true);
    const plan = decodePlan(encodePlan(home));
    expect(plan.rooms.flatMap((r) => r.devices).every((d) => d.on === false)).toBe(true);
  });

  it('carries the chosen goals as one small number, and every device so a goal can come back', () => {
    const home = homeReducer(homeReducer(sampleHome(), actions.toggleGoal('curtains')), actions.toggleGoal('voice'));
    const compact = JSON.parse(Buffer.from(encodePlan(home), 'base64url').toString());
    expect(compact.g).toBe(0b011011);
    const plan = decodePlan(encodePlan(home));
    expect(plan.goals).toEqual(['lighting', 'climate', 'security', 'energy']);
    expect(plan.rooms[0].devices.map((d) => d.deviceId)).toEqual(home.rooms[0].devices.map((d) => d.deviceId));
    expect(decodePlan(encodePlan(plan)).goals).toEqual(plan.goals);
  });

  it('writes no goals while all are chosen, so the link is the same as before goals existed', () => {
    const compact = JSON.parse(Buffer.from(encodePlan(sampleHome()), 'base64url').toString());
    expect('g' in compact).toBe(false);
  });

  it('loads a link made before goals existed with every goal chosen', () => {
    const old = Buffer.from(JSON.stringify({ v: 1, t: '2BHK', r: [['Living Room', 'living', 'L', [['cct-light', 2], ['curtain', 2, 1]]]], s: [] })).toString('base64url');
    const plan = decodePlan(old);
    expect(plan.goals).toEqual(ALL_GOALS);
    expect(plan.rooms[0].devices).toEqual([{ deviceId: 'cct-light', qty: 2, on: false }, { deviceId: 'curtain', qty: 2, on: false, edited: true }]);
  });

  it('drops goal bits it does not know', () => {
    const link = Buffer.from(JSON.stringify({ v: 1, t: '1BHK', r: [], s: [], g: 0b11000001 })).toString('base64url');
    expect(decodePlan(link).goals).toEqual(['lighting']);
    const junk = Buffer.from(JSON.stringify({ v: 1, t: '1BHK', r: [], s: [], g: 'x' })).toString('base64url');
    expect(decodePlan(junk).goals).toEqual([]);
  });

  it('omits the plate when none has been designed', () => {
    const plan = decodePlan(encodePlan(homeReducer(initialHome, actions.setHomeType('2BHK'))));
    expect('plateConfig' in plan).toBe(false);
    expect(plan.plateRoomId).toBeNull();
  });

  it('the decoded plan hydrates the reducer', () => {
    const s = homeReducer(initialHome, actions.hydrate(decodePlan(encodePlan(sampleHome()))));
    expect(s.homeType).toBe('1BHK');
    expect(s.goals).toEqual(ALL_GOALS);
  });

  it('returns null for garbage or another version', () => {
    expect(decodePlan('')).toBeNull();
    expect(decodePlan('not-a-plan')).toBeNull();
    expect(decodePlan(btoa(JSON.stringify({ v: 2, t: '1BHK', r: [], s: [] })))).toBeNull();
    expect(decodePlan(btoa(JSON.stringify({ v: 1, t: '1BHK', r: 'x', s: [] })))).toBeNull();
  });
});

// what a hand-edited link would carry
const link = (compact) => Buffer.from(JSON.stringify({ v: 1, t: '1BHK', r: [], s: [], ...compact })).toString('base64url');
const linkRoom = (devices, extra = []) => ['Hall', 'living', 'M', devices, ...extra];

describe('decodePlan — untrusted links', () => {
  it('rejects an unknown home type', () => {
    expect(decodePlan(link({ t: 'Castle' }))).toBeNull();
    expect(decodePlan(link({ t: null }))).toBeNull();
  });

  it('rejects rooms or scenes that are not lists', () => {
    expect(decodePlan(link({ r: [{ name: 'x' }] }))).toBeNull();
    expect(decodePlan(link({ r: ['room'] }))).toBeNull();
    expect(decodePlan(link({ s: 'x' }))).toBeNull();
  });

  it('drops devices that are not in the catalogue, and duplicates', () => {
    const plan = decodePlan(link({
      r: [linkRoom([['cct-light', 2], ['FAKE-999', 1], ['constructor', 1], ['__proto__', 1], [['camera'], 1], 'junk', null, ['cct-light', 5]])],
    }));
    expect(plan.rooms[0].devices).toEqual([{ deviceId: 'cct-light', qty: 2, on: false }]);
  });

  it('treats a missing or malformed device list as no devices', () => {
    expect(decodePlan(link({ r: [['Hall', 'living', 'M'], linkRoom('nope')] })).rooms.map((r) => r.devices)).toEqual([[], []]);
  });

  it('clamps quantities to whole numbers from 1 to 99', () => {
    const qtyOf = (qty) => decodePlan(link({ r: [linkRoom([['camera', qty]])] })).rooms[0].devices[0].qty;
    expect([0, -4, 2.9, 99, 100, 1e9, '7', 'lots', null, {}].map(qtyOf)).toEqual([1, 1, 2, 99, 99, 99, 7, 1, 1, 1]);
  });

  it('clamps switch overrides and keeps unset ones null', () => {
    const plan = decodePlan(link({ r: [linkRoom([], [[5000, -2, null, 'x']]), linkRoom([], ['junk'])] }));
    expect(plan.rooms[0].switchOverrides).toEqual({ gang: 99, fan: 0, curtain: null, socket: 0 });
    expect(plan.rooms[1].switchOverrides).toEqual({ gang: null, fan: null, curtain: null, socket: null });
  });

  it('caps the number of rooms at 40 and scenes at 20', () => {
    const plan = decodePlan(link({
      r: Array.from({ length: 500 }, () => linkRoom([])),
      s: Array.from({ length: 500 }, () => ['Scene', '✨', {}]),
    }));
    expect(plan.rooms).toHaveLength(40);
    expect(plan.customScenes).toHaveLength(20);
  });

  it('repairs room fields it does not recognise', () => {
    const plan = decodePlan(link({ r: [[{ evil: 1 }, 'dungeon', 'XXL', []], ['x'.repeat(500), 'bath', 'S', []]] }));
    expect(plan.rooms[0]).toMatchObject({ name: 'Room', roomType: 'other', size: 'M' });
    expect(plan.rooms[1].name).toHaveLength(60);
  });

  it('keeps only known devices in scenes and makes their states booleans', () => {
    const plan = decodePlan(link({ s: [['Away', '🚪', { 'door-lock': 1, 'cct-light': 0, 'FAKE': true, toString: true }], [7, { big: 1 }, 'x'], 'junk'] }));
    expect(plan.customScenes).toHaveLength(2);
    expect(plan.customScenes[0]).toMatchObject({ name: 'Away', icon: '🚪', deviceStates: { 'door-lock': true, 'cct-light': false } });
    expect(plan.customScenes[1]).toMatchObject({ name: 'Scene', icon: '✨', deviceStates: {} });
  });

  describe('plate', () => {
    const goodPlate = {
      ...emptyPlateConfig, model: 'full-glass', material: 'acrylic', size: 4, accessory: '4-switch', icons: { '1.0.0': 'li-l1' }, panel: 'space-grey',
    };
    const decodeWithPlate = (p) => decodePlan(link({ r: [linkRoom([['camera', 1]])], p, pr: 0 }));
    const compactOf = (plateConfig) => {
      const home = homeReducer(homeReducer(initialHome, actions.setHomeType('1BHK')), actions.setPlateConfig(plateConfig));
      return JSON.parse(Buffer.from(encodePlan(home), 'base64url').toString());
    };

    it('writes the plate into a link compactly, icons by short id on their switch', () => {
      expect(compactOf(goodPlate).p).toEqual(['p3', 'full-glass', 'acrylic', 4, '4-switch', 'space-grey', null, 0, { '1.0.0': 'li-l1' }]);
    });

    it('keeps a well-formed plate and its room', () => {
      const plan = decodeWithPlate(compactOf(goodPlate).p);
      expect(plan.plateConfig).toEqual(goodPlate);
      expect(plan.plateRoomId).toBe(plan.rooms[0].id);
    });

    it('drops unknown ids and icons on no switch — the plate survives', () => {
      const plan = decodeWithPlate(['p3', 'full-glass', 'granite', 4, '4-switch', 'pink', null, 0, { '1.0.0': 'li-l1', '1.0.1': '💡', '5.0.0': 'li-l1' }]);
      expect(plan.plateConfig).toEqual({ ...goodPlate, material: null, panel: null });
    });

    it('loads a link made before the reference port: size, colour and a single accessory', () => {
      const plan = decodeWithPlate([4, 'Black', 'Standard', 'Matte', 'Square', [['4 Switch', 2]], { 'a2.1': 'ac' }]);
      expect(plan.plateConfig).toEqual({ ...emptyPlateConfig, size: 4, panel: 'black', accessory: '4-switch' });
    });

    it.each([
      ['a stored plate with emoji icons', { model: '4 module', maxSlots: 4, material: 'Black', accessories: [{ id: 'a1', name: '4 Switch', nodeSize: 2, slots: [0, 1] }], icons: { a1: '💡' } }],
      ['a stored plate with the home-made icon ids', { model: '4 module', maxSlots: 4, material: 'Black', accessories: [{ id: 'a1', name: '4 Switch', nodeSize: 2, slots: [0, 1] }], icons: { 'a1.0': 'light' } }],
    ])('loads %s without its icons', (_, old) => {
      expect(decodeWithPlate(old).plateConfig).toEqual({ ...emptyPlateConfig, size: 4, panel: 'black', accessory: '4-switch' });
    });

    it.each([
      ['unknown plate size', [5, 'Black', null, null, null, [], {}]],
      ['nothing recognisable', { model: '99 module', accessories: 'x' }],
      ['a string', '8 module'],
      ['an empty new-shape plate', ['p3', null, null, null, null, null, null, 0, {}]],
    ])('drops the plate but keeps the rest: %s', (_, bad) => {
      const plan = decodeWithPlate(bad);
      expect(plan).not.toBeNull();
      expect('plateConfig' in plan).toBe(false);
      expect(plan.plateRoomId).toBeNull();
      expect(plan.rooms[0].devices).toEqual([{ deviceId: 'camera', qty: 1, on: false }]);
    });
  });
});

describe('planOnLoad', () => {
  const stored = homeReducer(initialHome, actions.setHomeType('2BHK'));
  const other = sampleHome();
  const hashOf = (home) => `#plan=${encodePlan(home)}`;

  it('opens empty when there is no link and nothing stored', () => {
    for (const nothing of [null, initialHome]) {
      expect(planOnLoad('', nothing)).toEqual({ plan: null, pendingLink: null, notice: null, clearHash: false });
    }
  });

  it('restores the stored plan and leaves other hashes alone', () => {
    expect(planOnLoad('#planner', stored)).toEqual({ plan: stored, pendingLink: null, notice: 'restored', clearHash: false });
  });

  it('opens a link straight away when nothing is stored', () => {
    const r = planOnLoad(hashOf(other), null);
    expect(r).toMatchObject({ pendingLink: null, notice: 'restored', clearHash: true });
    expect(r.plan.homeType).toBe('1BHK');
    expect(planOnLoad(hashOf(other), initialHome).plan.homeType).toBe('1BHK');
  });

  it('asks before a link replaces a different stored plan', () => {
    const r = planOnLoad(hashOf(other), stored);
    expect(r.plan).toBe(stored);
    expect(r.pendingLink.homeType).toBe('1BHK');
    expect(r.notice).toBeNull();
    expect(r.clearHash).toBe(false);
  });

  it('does not ask when the link is the plan already stored', () => {
    const r = planOnLoad(hashOf(stored), stored);
    expect(r).toMatchObject({ pendingLink: null, notice: 'restored', clearHash: true });
    expect(r.plan.rooms).toHaveLength(stored.rooms.length);
  });

  it('a damaged link keeps the stored plan and says so', () => {
    expect(planOnLoad('#plan=garbage', stored)).toEqual({ plan: stored, pendingLink: null, notice: 'badlink', clearHash: true });
    expect(planOnLoad('#plan=', null)).toEqual({ plan: null, pendingLink: null, notice: 'badlink', clearHash: true });
  });
});
