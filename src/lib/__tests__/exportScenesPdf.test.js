import { vi, describe, it, expect } from 'vitest';
import { buildScenesPdfPayload } from '../exportScenesPdf.js';
import { SCENES } from '../../data/scenes.js';

const rooms = [{ devices: [{ deviceId: 'rgbw-strip', qty: 1 }, { deviceId: 'bldc-fan', qty: 1 }] }];

describe('buildScenesPdfPayload', () => {
  it('returns preset scenes labelled preset:true', () => {
    const result = buildScenesPdfPayload([], rooms);
    expect(result).toHaveLength(SCENES.length);
    expect(result[0].preset).toBe(true);
    expect(result[0].name).toBe('Good Morning');
  });

  it('appends custom scenes after presets, labelled preset:false', () => {
    const custom = [{ id: 'c1', name: 'Party', icon: '🎉', deviceStates: { 'rgbw-strip': true } }];
    const result = buildScenesPdfPayload(custom, rooms);
    expect(result).toHaveLength(SCENES.length + 1);
    const last = result[result.length - 1];
    expect(last.name).toBe('Party');
    expect(last.preset).toBe(false);
    expect(last.deviceStates['rgbw-strip']).toBe(true);
  });

  it('resolves device ids to catalogue names for printing', () => {
    const custom = [{ id: 'c1', name: 'Party', icon: '🎉', deviceStates: { 'rgbw-strip': true, 'bldc-fan': false } }];
    const result = buildScenesPdfPayload(custom, rooms);
    expect(result[result.length - 1].devices).toEqual([
      { name: 'RGBW Strip Light', on: true },
      { name: 'BLDC Smart Fan', on: false },
    ]);
    expect(result[0].devices.every((d) => !/^[a-z]+(-[a-z]+)+$/.test(d.name))).toBe(true);
  });

  it('drops custom-scene entries for devices that are no longer in the home', () => {
    const custom = [{ id: 'c1', name: 'X', deviceStates: { 'rgbw-strip': true, 'curtain': true, 'gone-device': true } }];
    const result = buildScenesPdfPayload(custom, rooms);
    expect(result[result.length - 1].devices).toEqual([{ name: 'RGBW Strip Light', on: true }]);
    expect(buildScenesPdfPayload(custom, [])[SCENES.length].devices).toEqual([]);
  });

  it('empty custom scenes returns only presets', () => {
    const result = buildScenesPdfPayload([], rooms);
    expect(result.every((s) => s.preset)).toBe(true);
  });
});
