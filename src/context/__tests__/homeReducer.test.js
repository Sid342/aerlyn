import { describe, it, expect } from 'vitest';
import { homeReducer, initialHome, actions } from '../homeReducer.js';

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
  it('setFloorPlan stores the image data url', () => {
    const s1 = homeReducer(withHome(), actions.setFloorPlan('data:image/png;base64,xxx'));
    expect(s1.floorPlanImage).toBe('data:image/png;base64,xxx');
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

  describe('applyScene', () => {
    // 2BHK template: every room seeds smart-switch; only bath seeds geyser
    it('sets on flag for devices present in the deviceStates map', () => {
      const s0 = withHome('2BHK');
      // turn smart-switch on everywhere
      const s1 = homeReducer(s0, actions.applyScene({ 'smart-switch': true }));
      s1.rooms.forEach((r) => {
        const sw = r.devices.find((d) => d.deviceId === 'smart-switch');
        expect(sw).toBeDefined();
        expect(sw.on).toBe(true);
      });
    });

    it('leaves devices not in the map untouched (same object reference)', () => {
      const s0 = withHome('2BHK');
      // apply a scene that only touches geyser — smart-switch should be untouched
      const s1 = homeReducer(s0, actions.applyScene({ 'geyser': true }));
      s1.rooms.forEach((r) => {
        const sw0 = s0.rooms.find((rx) => rx.id === r.id).devices.find((d) => d.deviceId === 'smart-switch');
        const sw1 = r.devices.find((d) => d.deviceId === 'smart-switch');
        // device entry for smart-switch must be the same reference (reducer returns d unchanged)
        expect(sw1).toBe(sw0);
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
});
