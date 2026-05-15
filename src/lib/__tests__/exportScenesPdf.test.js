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

  it('empty custom scenes returns only presets', () => {
    const result = buildScenesPdfPayload([]);
    expect(result.every((s) => s.preset)).toBe(true);
  });
});
