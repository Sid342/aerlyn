import { describe, it, expect } from 'vitest';
import { homeReducer, initialHome, emptyPlateConfig, fullPlateConfig, actions } from '../homeReducer.js';

function withHome(type = '2BHK') {
  return homeReducer(initialHome, actions.setHomeType(type));
}

describe('homeReducer', () => {
  it('starts with no home type and no rooms', () => {
    expect(initialHome.homeType).toBe(null);
    expect(initialHome.rooms).toEqual([]);
    expect(initialHome.mode).toBe('build');
  });
  it('setHomeType loads the template rooms', () => {
    const s = withHome('1BHK');
    expect(s.homeType).toBe('1BHK');
    expect(s.rooms.length).toBe(5);
  });
  it('addRoom appends a room', () => {
    const s = homeReducer(withHome(), actions.addRoom('Pooja Room', 'other'));
    expect(s.rooms[s.rooms.length - 1].name).toBe('Pooja Room');
  });
  it('removeRoom deletes by id', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.removeRoom(id));
    expect(s1.rooms.find((r) => r.id === id)).toBeUndefined();
  });
  it('renameRoom changes the name', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.renameRoom(id, 'Drawing Room'));
    expect(s1.rooms.find((r) => r.id === id).name).toBe('Drawing Room');
  });
  it('setRoomSize updates size', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.setRoomSize(id, 'S'));
    expect(s1.rooms.find((r) => r.id === id).size).toBe('S');
  });
  it('addDevice adds a device at qty 1; adding again bumps qty', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const s1 = homeReducer(s0, actions.addDevice(id, 'energy-meter'));
    const dev = s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === 'energy-meter');
    expect(dev.qty).toBe(1);
    const s2 = homeReducer(s1, actions.addDevice(id, 'energy-meter'));
    expect(s2.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === 'energy-meter').qty).toBe(2);
  });
  it('setDeviceQty clamps to >= 1', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const dId = s0.rooms[0].devices[0].deviceId;
    const s1 = homeReducer(s0, actions.setDeviceQty(id, dId, 0));
    expect(s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === dId).qty).toBe(1);
  });
  it('removeDevice removes the device entry', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const dId = s0.rooms[0].devices[0].deviceId;
    const s1 = homeReducer(s0, actions.removeDevice(id, dId));
    expect(s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === dId)).toBeUndefined();
  });
  it('toggleDevice flips the on flag', () => {
    const s0 = withHome();
    const id = s0.rooms[0].id;
    const dId = s0.rooms[0].devices[0].deviceId;
    const s1 = homeReducer(s0, actions.toggleDevice(id, dId));
    expect(s1.rooms.find((r) => r.id === id).devices.find((d) => d.deviceId === dId).on).toBe(true);
  });
  it('setMode switches mode', () => {
    const s1 = homeReducer(withHome(), actions.setMode('play'));
    expect(s1.mode).toBe('play');
  });
  it('reset returns to initialHome', () => {
    const s1 = homeReducer(withHome(), actions.reset());
    expect(s1).toEqual(initialHome);
  });

  describe('DUPLICATE_ROOM', () => {
    it('returns state unchanged when roomId is unknown', () => {
      const s0 = withHome();
      const s1 = homeReducer(s0, actions.duplicateRoom('non-existent-id'));
      expect(s1).toBe(s0);
    });

    it('inserts the copy directly after the source room, not at the end', () => {
      const s0 = withHome(); // 2BHK: 6 rooms
      const sourceIdx = 1;
      const sourceId = s0.rooms[sourceIdx].id;
      const s1 = homeReducer(s0, actions.duplicateRoom(sourceId));
      expect(s1.rooms.length).toBe(s0.rooms.length + 1);
      expect(s1.rooms[sourceIdx].id).toBe(sourceId);
      expect(s1.rooms[sourceIdx + 1].name).toContain('(copy)');
      // room that was at sourceIdx+1 before should now be at sourceIdx+2
      expect(s1.rooms[sourceIdx + 2].id).toBe(s0.rooms[sourceIdx + 1].id);
    });

    it("copy's id differs from source's id", () => {
      const s0 = withHome();
      const source = s0.rooms[0];
      const s1 = homeReducer(s0, actions.duplicateRoom(source.id));
      const copy = s1.rooms[1];
      expect(copy.id).not.toBe(source.id);
    });

    it("copy's name is `${source.name} (copy)`", () => {
      const s0 = withHome();
      const source = s0.rooms[0];
      const s1 = homeReducer(s0, actions.duplicateRoom(source.id));
      const copy = s1.rooms[1];
      expect(copy.name).toBe(`${source.name} (copy)`);
    });

    it("copy's devices are a separate array — mutating copy.devices[0].qty doesn't affect source", () => {
      const s0 = withHome();
      const source = s0.rooms[0];
      const s1 = homeReducer(s0, actions.duplicateRoom(source.id));
      const copy = s1.rooms[1];
      // ensure they are not the same array reference
      expect(copy.devices).not.toBe(source.devices);
      // mutate copy's device qty and verify source is unaffected
      copy.devices[0].qty = 99;
      expect(s1.rooms[0].devices[0].qty).not.toBe(99);
    });

    it("copy's size and roomType match the source", () => {
      const s0 = withHome();
      const source = s0.rooms[0];
      const s1 = homeReducer(s0, actions.duplicateRoom(source.id));
      const copy = s1.rooms[1];
      expect(copy.size).toBe(source.size);
      expect(copy.roomType).toBe(source.roomType);
    });
  });

  // --- customScenes ---
  describe('ADD_CUSTOM_SCENE', () => {
    it('adds a scene with given name and empty deviceStates', () => {
      const state = homeReducer(initialHome, {
        type: 'ADD_CUSTOM_SCENE',
        payload: { name: 'Dinner Party' },
      });
      expect(state.customScenes).toHaveLength(1);
      expect(state.customScenes[0].name).toBe('Dinner Party');
      expect(state.customScenes[0].deviceStates).toEqual({});
      expect(state.customScenes[0].id).toMatch(/^scene-/);
      expect(state.customScenes[0].icon).toBe('✨');
    });

    it('initialHome has empty customScenes array', () => {
      expect(initialHome.customScenes).toEqual([]);
    });
  });

  describe('REMOVE_CUSTOM_SCENE', () => {
    it('removes a scene by id', () => {
      const base = homeReducer(initialHome, {
        type: 'ADD_CUSTOM_SCENE',
        payload: { name: 'Test Scene' },
      });
      const id = base.customScenes[0].id;
      const state = homeReducer(base, { type: 'REMOVE_CUSTOM_SCENE', payload: { id } });
      expect(state.customScenes).toHaveLength(0);
    });

    it('leaves other scenes intact', () => {
      let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'A' } });
      state = homeReducer(state, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'B' } });
      const id = state.customScenes[0].id;
      state = homeReducer(state, { type: 'REMOVE_CUSTOM_SCENE', payload: { id } });
      expect(state.customScenes).toHaveLength(1);
      expect(state.customScenes[0].name).toBe('B');
    });
  });

  describe('RENAME_CUSTOM_SCENE', () => {
    it('updates name of matching scene', () => {
      let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Old' } });
      const id = state.customScenes[0].id;
      state = homeReducer(state, { type: 'RENAME_CUSTOM_SCENE', payload: { id, name: 'New' } });
      expect(state.customScenes[0].name).toBe('New');
    });
  });

  describe('SET_SCENE_DEVICE_STATE', () => {
    it('sets a device on/off inside a custom scene', () => {
      let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Test' } });
      const id = state.customScenes[0].id;
      state = homeReducer(state, {
        type: 'SET_SCENE_DEVICE_STATE',
        payload: { sceneId: id, deviceId: 'cct-light', on: true },
      });
      expect(state.customScenes[0].deviceStates['cct-light']).toBe(true);
    });

    it('updates existing device state', () => {
      let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Test' } });
      const id = state.customScenes[0].id;
      state = homeReducer(state, {
        type: 'SET_SCENE_DEVICE_STATE',
        payload: { sceneId: id, deviceId: 'cct-light', on: true },
      });
      state = homeReducer(state, {
        type: 'SET_SCENE_DEVICE_STATE',
        payload: { sceneId: id, deviceId: 'cct-light', on: false },
      });
      expect(state.customScenes[0].deviceStates['cct-light']).toBe(false);
    });

    it('does not mutate other scenes', () => {
      let state = homeReducer(initialHome, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'A' } });
      state = homeReducer(state, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'B' } });
      const idA = state.customScenes[0].id;
      state = homeReducer(state, {
        type: 'SET_SCENE_DEVICE_STATE',
        payload: { sceneId: idA, deviceId: 'cct-light', on: true },
      });
      expect(state.customScenes[1].deviceStates['cct-light']).toBeUndefined();
    });
  });

  describe('applyScene', () => {
    // 2BHK template: every room seeds bldc-fan in living/bedroom; only bath seeds geyser
    it('sets on flag for devices present in the deviceStates map', () => {
      const s0 = withHome('2BHK');
      // turn bldc-fan on everywhere it appears
      const s1 = homeReducer(s0, actions.applyScene({ 'bldc-fan': true }));
      const roomsWithFan = s1.rooms.filter((r) => r.devices.some((d) => d.deviceId === 'bldc-fan'));
      expect(roomsWithFan.length).toBeGreaterThan(0);
      roomsWithFan.forEach((r) => {
        const fan = r.devices.find((d) => d.deviceId === 'bldc-fan');
        expect(fan).toBeDefined();
        expect(fan.on).toBe(true);
      });
    });

    it('leaves devices not in the map untouched (same object reference)', () => {
      const s0 = withHome('2BHK');
      // apply a scene that only touches geyser — bldc-fan should be untouched
      const s1 = homeReducer(s0, actions.applyScene({ 'geyser': true }));
      s1.rooms.forEach((r) => {
        const fan0 = s0.rooms.find((rx) => rx.id === r.id).devices.find((d) => d.deviceId === 'bldc-fan');
        const fan1 = r.devices.find((d) => d.deviceId === 'bldc-fan');
        // device entry for bldc-fan must be the same reference (reducer returns d unchanged)
        expect(fan1).toBe(fan0);
      });
    });

    it('does not throw and returns rooms with devices unchanged when deviceStates is omitted', () => {
      const s0 = withHome('2BHK');
      let s1;
      expect(() => { s1 = homeReducer(s0, actions.applyScene()); }).not.toThrow();
      // every device entry must be the same reference (pure no-op)
      s1.rooms.forEach((r) => {
        const r0 = s0.rooms.find((rx) => rx.id === r.id);
        r.devices.forEach((d, i) => {
          expect(d).toBe(r0.devices[i]);
        });
      });
    });
  });

  describe('APPLY_SCENE_TO_ROOM', () => {
    it('applies scene only to specified room', () => {
      const state = {
        ...initialHome,
        rooms: [
          { id: 'r1', name: 'Living', roomType: 'living', size: 'M',
            devices: [{ deviceId: 'cct-light', qty: 1, on: false }],
            switchOverrides: { gang: null, fan: null, curtain: null, socket: null } },
          { id: 'r2', name: 'Bedroom', roomType: 'bedroom', size: 'M',
            devices: [{ deviceId: 'cct-light', qty: 1, on: false }],
            switchOverrides: { gang: null, fan: null, curtain: null, socket: null } },
        ],
      };
      const next = homeReducer(state, actions.applySceneToRoom('r1', { 'cct-light': true }));
      expect(next.rooms[0].devices[0].on).toBe(true);
      expect(next.rooms[1].devices[0].on).toBe(false);
    });
  });

  describe('SET_FLOOR_PLAN', () => {
    it('starts with no floor plan image', () => {
      expect(initialHome.floorPlanImage).toBeNull();
    });
    it('stores the image and clears it with null', () => {
      const s1 = homeReducer(withHome(), actions.setFloorPlan('data:image/png;base64,AAAA'));
      expect(s1.floorPlanImage).toBe('data:image/png;base64,AAAA');
      const s2 = homeReducer(s1, actions.setFloorPlan(null));
      expect(s2.floorPlanImage).toBeNull();
    });
  });

  describe('SET_ROOM_SIZE keeps edited quantities', () => {
    // 2BHK living room (L) seeds cob-downlight ×6 and power-socket ×4
    it('re-seeds quantities the user has not touched', () => {
      const s0 = withHome();
      const id = s0.rooms[0].id;
      const s1 = homeReducer(s0, actions.setRoomSize(id, 'S'));
      const qty = (dId) => s1.rooms[0].devices.find((d) => d.deviceId === dId).qty;
      expect(qty('cob-downlight')).toBe(2);
      expect(qty('power-socket')).toBe(2);
    });
    it('setDeviceQty marks the device as edited', () => {
      const s0 = withHome();
      const s1 = homeReducer(s0, actions.setDeviceQty(s0.rooms[0].id, 'cob-downlight', 9));
      const dev = s1.rooms[0].devices.find((d) => d.deviceId === 'cob-downlight');
      expect(dev.edited).toBe(true);
      expect(s1.rooms[0].devices.find((d) => d.deviceId === 'power-socket').edited).toBeUndefined();
    });
    it('does not overwrite a quantity the user edited', () => {
      const s0 = withHome();
      const id = s0.rooms[0].id;
      const s1 = homeReducer(s0, actions.setDeviceQty(id, 'cob-downlight', 9));
      const s2 = homeReducer(s1, actions.setRoomSize(id, 'S'));
      const qty = (dId) => s2.rooms[0].devices.find((d) => d.deviceId === dId).qty;
      expect(s2.rooms[0].size).toBe('S');
      expect(qty('cob-downlight')).toBe(9);
      expect(qty('power-socket')).toBe(2);
    });
    it('adding a device that is already present counts as an edit', () => {
      const s0 = withHome();
      const id = s0.rooms[0].id;
      const s1 = homeReducer(s0, actions.addDevice(id, 'cob-downlight'));
      const s2 = homeReducer(s1, actions.setRoomSize(id, 'S'));
      expect(s2.rooms[0].devices.find((d) => d.deviceId === 'cob-downlight').qty).toBe(7);
    });
  });

  describe('SET_PLATE_CONFIG', () => {
    it('starts with an empty plate config and no plate room', () => {
      expect(initialHome.plateConfig).toEqual(emptyPlateConfig);
      expect(initialHome.plateRoomId).toBeNull();
    });
    it('replaces the plate config', () => {
      const config = { ...emptyPlateConfig, model: '4 module', maxSlots: 4 };
      const s1 = homeReducer(withHome(), actions.setPlateConfig(config));
      expect(s1.plateConfig).toEqual(config);
    });
  });

  describe('DESIGN_PLATE', () => {
    it('presets the model to the given size and remembers the room', () => {
      const s0 = withHome();
      const s1 = homeReducer(s0, actions.designPlate(s0.rooms[2].id, 8));
      expect(s1.plateRoomId).toBe(s0.rooms[2].id);
      expect(s1.plateConfig.model).toBe('8 module');
      expect(s1.plateConfig.maxSlots).toBe(8);
    });
    it('clears accessories and icons but keeps the chosen finish', () => {
      const s0 = homeReducer(withHome(), actions.setPlateConfig({
        ...emptyPlateConfig, model: '4 module', maxSlots: 4, material: 'Black', panel: 'Matte',
        accessories: [{ id: 'a1', name: '4 Switch', nodeSize: 2, slots: [0, 1] }], icons: { a1: '💡' },
      }));
      const s1 = homeReducer(s0, actions.designPlate(s0.rooms[0].id, 12));
      expect(s1.plateConfig.accessories).toEqual([]);
      expect(s1.plateConfig.icons).toEqual({});
      expect(s1.plateConfig.material).toBe('Black');
      expect(s1.plateConfig.panel).toBe('Matte');
    });
  });

  describe('HYDRATE', () => {
    it('replaces the plan with the saved one', () => {
      const saved = withHome('1BHK');
      const s1 = homeReducer(withHome('Villa'), actions.hydrate({ homeType: saved.homeType, rooms: saved.rooms }));
      expect(s1.homeType).toBe('1BHK');
      expect(s1.rooms).toBe(saved.rooms);
    });
    it('fills anything missing from the saved plan with defaults', () => {
      const dirty = homeReducer(homeReducer(withHome(), actions.setMode('play')), actions.setFloorPlan('data:x'));
      const s1 = homeReducer(dirty, actions.hydrate({ homeType: '1BHK', rooms: [] }));
      expect(s1.mode).toBe('build');
      expect(s1.customScenes).toEqual([]);
      expect(s1.plateConfig).toEqual(emptyPlateConfig);
      expect(s1.floorPlanImage).toBeNull();
    });

    it('fills out a plate config with missing fields', () => {
      const s1 = homeReducer(initialHome, actions.hydrate({ homeType: '1BHK', rooms: [], plateConfig: { model: '4 module' } }));
      expect(s1.plateConfig).toEqual({ ...emptyPlateConfig, model: '4 module' });
    });
  });

  describe('fullPlateConfig', () => {
    it('gives the empty config for anything that is not a config', () => {
      for (const bad of [undefined, null, 'x', 7]) expect(fullPlateConfig(bad)).toEqual(emptyPlateConfig);
    });

    it('repairs accessories and icons of the wrong shape', () => {
      const good = { id: 'a1', name: 'Fan', nodeSize: 2, slots: [0, 1] };
      const c = fullPlateConfig({ model: '4 module', maxSlots: 4, accessories: [good, null, { name: 'no slots' }, { slots: [] }], icons: 'x' });
      expect(c.accessories).toEqual([good]);
      expect(c.icons).toEqual({});
      expect(fullPlateConfig({ accessories: 'x' }).accessories).toEqual([]);
    });

    it('keeps a complete config as it is', () => {
      const full = { ...emptyPlateConfig, model: '2 module', maxSlots: 2, icons: { a: '💡' } };
      expect(fullPlateConfig(full)).toEqual(full);
    });
  });
});
