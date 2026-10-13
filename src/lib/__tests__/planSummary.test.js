import { describe, it, expect } from 'vitest';
import { roomSentence, isCustomised } from '../planSummary.js';
import { applyGoals } from '../goals.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

const room = (...ids) => ({ devices: ids.map((deviceId) => ({ deviceId, qty: 3 })) });
const home = homeReducer(initialHome, actions.setHomeType('2BHK'));

describe('roomSentence', () => {
  it('lists what a room gets in plain words, lights first and sockets last', () => {
    expect(roomSentence(home.rooms[0])).toBe('Lights, fan, AC, curtains, camera, motion sensor, scene remote, voice control, speaker and sockets');
    expect(roomSentence(home.rooms.find((r) => r.roomType === 'bath'))).toBe('Lights, motion sensor, geyser and sockets');
  });

  it('names each kind once, whatever the quantity or the order in the room', () => {
    expect(roomSentence(room('power-socket', 'usb-charger', 'gas-sensor', 'cob-downlight', 'cct-light'))).toBe('Lights, gas and smoke sensor and sockets');
  });

  it('has no numbers in it', () => {
    for (const r of home.rooms) expect(roomSentence(r)).not.toMatch(/\d/);
  });

  it('reads well with one or two things, and says so when a room is empty', () => {
    expect(roomSentence(room('ac-ir'))).toBe('AC');
    expect(roomSentence(room('geyser', 'bldc-fan'))).toBe('Fan and geyser');
    expect(roomSentence(room())).toBe('Nothing yet');
    expect(roomSentence(room('not-a-device'))).toBe('Nothing yet');
  });

  it('follows the goals', () => {
    const [living] = applyGoals(home.rooms, ['lighting']);
    expect(roomSentence(living)).toBe('Lights and sockets');
    expect(roomSentence(applyGoals(home.rooms, [])[0])).toBe('Sockets');
  });
});

describe('isCustomised', () => {
  it('is false for a freshly picked home, also with goals switched off', () => {
    expect(isCustomised(home)).toBe(false);
    expect(isCustomised(homeReducer(home, actions.toggleGoal('lighting')))).toBe(false);
  });

  it('is true once a room, a quantity, an override or a scene has changed', () => {
    const id = home.rooms[0].id;
    for (const action of [
      actions.renameRoom(id, 'Hall'), actions.removeRoom(id), actions.setDeviceQty(id, 'cob-downlight', 9),
      actions.removeDevice(id, 'curtain'), actions.setSwitchOverride(id, 'fan', 2), actions.setRoomSize(id, 'S'),
      { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Dinner' } },
    ]) expect(isCustomised(homeReducer(home, action)), action.type).toBe(true);
  });
});
