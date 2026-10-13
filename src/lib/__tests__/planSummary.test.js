import { describe, it, expect } from 'vitest';
import { planSummary, planSummaryText } from '../planSummary.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

const room = (devices) => ({ id: 'r', name: 'R', roomType: 'other', size: 'M', devices });

describe('planSummary', () => {
  it('is all zeros for an empty home', () => {
    expect(planSummary(initialHome)).toEqual({ rooms: 0, features: 0 });
  });

  it('counts rooms and distinct device types, not quantities', () => {
    const home = {
      ...initialHome,
      rooms: [
        room([{ deviceId: 'cct-light', qty: 3 }, { deviceId: 'bldc-fan', qty: 1 }, { deviceId: 'camera', qty: 2 }]),
        room([{ deviceId: 'power-socket', qty: 14 }, { deviceId: 'cct-light', qty: 5 }]),
        room([{ deviceId: 'geyser', qty: 1 }, { deviceId: 'not-a-device', qty: 9 }]),
      ],
    };
    expect(planSummary(home)).toEqual({ rooms: 3, features: 5 });
  });

  it('stays well below the quantity total for a template home', () => {
    const home = homeReducer(initialHome, actions.setHomeType('2BHK'));
    const { rooms, features } = planSummary(home);
    expect(rooms).toBe(6);
    expect(features).toBe(new Set(home.rooms.flatMap((r) => r.devices.map((d) => d.deviceId))).size);
    expect(features).toBeLessThan(home.rooms.flatMap((r) => r.devices).reduce((n, d) => n + d.qty, 0));
  });
});

describe('planSummaryText', () => {
  it('names the home type, rooms and smart features', () => {
    const home = homeReducer(initialHome, actions.setHomeType('2BHK'));
    expect(planSummaryText(home)).toBe(`Your 2BHK plan · 6 rooms · ${planSummary(home).features} smart features`);
  });

  it('handles singular forms', () => {
    const home = { ...initialHome, homeType: 'Villa', rooms: [room([{ deviceId: 'geyser', qty: 4 }])] };
    expect(planSummaryText(home)).toBe('Your Villa plan · 1 room · 1 smart feature');
  });
});
