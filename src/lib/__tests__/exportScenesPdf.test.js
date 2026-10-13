import { vi, describe, it, expect } from 'vitest';
import { buildScenesPdfPayload } from '../exportScenesPdf.js';
import { SCENES } from '../../data/scenes.js';

describe('buildScenesPdfPayload', () => {
  it('returns preset scenes labelled preset:true', () => {
    const result = buildScenesPdfPayload([]);
    expect(result).toHaveLength(SCENES.length);
    expect(result[0].preset).toBe(true);
    expect(result[0].name).toBe('Good Morning');
  });

  it('appends custom scenes after presets, labelled preset:false', () => {
    const custom = [{ id: 'c1', name: 'Party', icon: '🎉', deviceStates: { 'rgbw-strip': true } }];
    const result = buildScenesPdfPayload(custom);
    expect(result).toHaveLength(SCENES.length + 1);
    const last = result[result.length - 1];
    expect(last.name).toBe('Party');
    expect(last.preset).toBe(false);
    expect(last.deviceStates['rgbw-strip']).toBe(true);
  });

  it('resolves device ids to catalogue names for printing', () => {
    const custom = [{ id: 'c1', name: 'Party', icon: '🎉', deviceStates: { 'rgbw-strip': true, 'bldc-fan': false } }];
    const result = buildScenesPdfPayload(custom);
    expect(result[result.length - 1].devices).toEqual([
      { name: 'RGBW Strip Light', on: true },
      { name: 'BLDC Smart Fan', on: false },
    ]);
    expect(result[0].devices.every((d) => !/^[a-z]+(-[a-z]+)+$/.test(d.name))).toBe(true);
  });

  it('falls back to the id for a device that is not in the catalogue', () => {
    const result = buildScenesPdfPayload([{ id: 'c1', name: 'X', deviceStates: { 'gone-device': true } }]);
    expect(result[result.length - 1].devices).toEqual([{ name: 'gone-device', on: true }]);
  });

  it('empty custom scenes returns only presets', () => {
    const result = buildScenesPdfPayload([]);
    expect(result.every((s) => s.preset)).toBe(true);
  });
});
