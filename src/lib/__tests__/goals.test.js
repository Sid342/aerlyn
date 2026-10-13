import { describe, it, expect } from 'vitest';
import { GOALS, ALL_GOALS, goalOf, applyGoals, cleanGoals, goalsToBits, bitsToGoals } from '../goals.js';
import { DEVICES } from '../../data/devices.js';
import { buildRooms } from '../../data/templates.js';

const rooms = buildRooms('Villa');
const ids = (list) => [...new Set(list.flatMap((r) => r.devices.map((d) => d.deviceId)))];
const without = (goal) => ALL_GOALS.filter((g) => g !== goal);

describe('goalOf', () => {
  it('puts every device under the goal of the design, and sockets under none', () => {
    const byGoal = Object.groupBy(DEVICES, (d) => goalOf(d.id));
    expect(byGoal.climate.map((d) => d.id)).toEqual(['bldc-fan', 'ac-ir']);
    expect(byGoal.curtains.map((d) => d.id)).toEqual(['curtain']);
    expect(byGoal.energy.map((d) => d.id)).toEqual(['geyser', 'energy-meter']);
    expect(byGoal.voice.map((d) => d.id)).toEqual(['scene-remote', 'voice', 'smart-speaker']);
    expect(byGoal.security.map((d) => d.id)).toEqual(['door-lock', 'camera', 'motion-sensor', 'gas-sensor']);
    expect(byGoal.lighting.every((d) => d.category === 'Lighting')).toBe(true);
    expect(byGoal.null.map((d) => d.id)).toEqual(['usb-charger', 'power-socket']);
    expect(GOALS.map((g) => g.label)).toEqual(['Lighting', 'Fans & AC', 'Curtains', 'Security', 'Geyser & energy', 'Voice & music']);
  });
});

describe('applyGoals', () => {
  it('returns the rooms untouched while every goal is chosen', () => {
    expect(applyGoals(rooms, ALL_GOALS)).toBe(rooms);
  });

  it('takes the devices of a goal out of every room and nothing else', () => {
    for (const { id } of GOALS) {
      const left = applyGoals(rooms, without(id));
      expect(ids(left).some((d) => goalOf(d) === id), id).toBe(false);
      expect(ids(left)).toEqual(ids(rooms).filter((d) => goalOf(d) !== id));
      expect(left.map((r) => [r.id, r.name, r.size])).toEqual(rooms.map((r) => [r.id, r.name, r.size]));
    }
  });

  it('always keeps power sockets and USB points', () => {
    const left = applyGoals(rooms, []);
    expect(ids(left).sort()).toEqual(['power-socket', 'usb-charger']);
    expect(left.every((r) => r.devices.some((d) => d.deviceId === 'power-socket'))).toBe(true);
  });

  it('does not change the rooms it is given, so switching a goal back on restores its devices', () => {
    const before = JSON.stringify(rooms);
    applyGoals(rooms, without('lighting'));
    expect(JSON.stringify(rooms)).toBe(before);
    expect(applyGoals(rooms, ALL_GOALS)).toEqual(JSON.parse(before));
  });

  it('keeps quantities and edits of the devices that stay', () => {
    const edited = rooms.map((r) => ({ ...r, devices: r.devices.map((d) => ({ ...d, qty: 7, edited: true })) }));
    expect(applyGoals(edited, without('curtains')).flatMap((r) => r.devices).every((d) => d.qty === 7 && d.edited)).toBe(true);
  });
});

describe('goals in storage and links', () => {
  it('cleans a stored list and treats a missing one as every goal', () => {
    expect(cleanGoals(['voice', 'x', 'lighting'])).toEqual(['lighting', 'voice']);
    expect(cleanGoals(undefined)).toEqual(ALL_GOALS);
    expect(cleanGoals([])).toEqual([]);
  });

  it('packs into one number and back', () => {
    expect(goalsToBits(ALL_GOALS)).toBe(63);
    expect(goalsToBits([])).toBe(0);
    for (const { id } of GOALS) expect(bitsToGoals(goalsToBits(without(id)))).toEqual(without(id));
  });
});
