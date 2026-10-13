import { describe, it, expect } from 'vitest';
import { planSummary } from '../planSummary.js';
import { planRoom } from '../switchPlanner.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

const room = (devices, switchOverrides) => ({ id: 'r', name: 'R', roomType: 'other', size: 'M', devices, switchOverrides });

describe('planSummary', () => {
  it('is all zeros for an empty home', () => {
    expect(planSummary(initialHome)).toEqual({ rooms: 0, devices: 0, plates: 0 });
  });

  it('counts rooms, sums device quantities and switch plates', () => {
    const home = {
      ...initialHome,
      rooms: [
        // 3 gangs + 1 fan = 4 modules → one 4-module plate
        room([{ deviceId: 'cct-light', qty: 3 }, { deviceId: 'bldc-fan', qty: 1 }, { deviceId: 'camera', qty: 2 }]),
        // 14 sockets → a 12-module and a 2-module plate
        room([{ deviceId: 'power-socket', qty: 14 }]),
        // nothing that needs a wall module → no plate
        room([{ deviceId: 'geyser', qty: 1 }]),
      ],
    };
    expect(planSummary(home)).toEqual({ rooms: 3, devices: 21, plates: 3 });
  });

  it('follows switch overrides', () => {
    const home = { ...initialHome, rooms: [room([{ deviceId: 'cct-light', qty: 1 }], { gang: 13 })] };
    expect(planSummary(home).plates).toBe(2);
  });

  it('agrees with the switch planner for a template home', () => {
    const home = homeReducer(initialHome, actions.setHomeType('3BHK'));
    const s = planSummary(home);
    expect(s.rooms).toBe(home.rooms.length);
    expect(s.devices).toBe(home.rooms.flatMap((r) => r.devices).reduce((n, d) => n + d.qty, 0));
    expect(s.plates).toBe(home.rooms.reduce((n, r) => n + planRoom(r).plates.length, 0));
    expect(s.plates).toBeGreaterThan(0);
  });
});
