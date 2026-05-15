import { describe, it, expect } from 'vitest';
import { buildPlatePdfPayload } from '../exportPlatePdf.js';

describe('buildPlatePdfPayload', () => {
  const config = {
    model: '4 module',
    material: 'Black',
    materialCode: '#000000',
    size: 'Standard',
    accessories: [{ id: 'a1', name: '2 Switch', nodeSize: 2, slots: [0, 1] }],
    icons: { a1: '💡' },
    panel: 'Matte',
    frame: 'Square',
  };

  it('returns all config fields in payload', () => {
    const p = buildPlatePdfPayload(config);
    expect(p.model).toBe('4 module');
    expect(p.material).toBe('Black');
    expect(p.size).toBe('Standard');
    expect(p.panel).toBe('Matte');
    expect(p.frame).toBe('Square');
    expect(p.accessories).toHaveLength(1);
    expect(p.accessories[0].name).toBe('2 Switch');
    expect(p.accessories[0].icon).toBe('💡');
  });

  it('maps icon from icons map via accessory id', () => {
    const p = buildPlatePdfPayload(config);
    expect(p.accessories[0].icon).toBe('💡');
  });

  it('returns null icon when no icon assigned', () => {
    const cfg = { ...config, icons: {} };
    const p = buildPlatePdfPayload(cfg);
    expect(p.accessories[0].icon).toBeNull();
  });

  it('handles empty accessories', () => {
    const cfg = { ...config, accessories: [], icons: {} };
    const p = buildPlatePdfPayload(cfg);
    expect(p.accessories).toHaveLength(0);
  });

  it('exportedAt is an ISO string', () => {
    const p = buildPlatePdfPayload(config);
    expect(() => new Date(p.exportedAt)).not.toThrow();
    expect(p.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
