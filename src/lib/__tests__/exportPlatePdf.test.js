import { describe, it, expect } from 'vitest';
import { buildPlatePdfPayload, pdfSafe } from '../exportPlatePdf.js';
import { PLATE_ACCESSORIES } from '../../data/plateCatalogue.js';
import { SNAP_ON_PLATES } from '../../data/plateSnapOn.js';
import { PLATE_ICON_CATEGORIES } from '../../data/plateIconLibrary.js';
import { emptyPlateConfig, plateButtons } from '../plateConfig.js';
import { site } from '../../config/site.js';

// what jsPDF's built-in Helvetica can encode: WinAnsi (cp1252)
const WIN_ANSI = /^[\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]*$/;
const strings = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);

const config = {
  ...emptyPlateConfig, model: 'full-glass', material: 'glass', size: 8, accessory: '8-switch-2-20a-1-socket-1-10a',
  icons: { '1.0.0': 'li-l1', '1.1.0': 'fa-f7' }, panel: 'titanium', frame: 'space-grey',
};
const when = new Date(2026, 9, 13, 17, 50);

describe('buildPlatePdfPayload', () => {
  it('has the title, room and an en-IN date', () => {
    const p = buildPlatePdfPayload(config, 'Master Bedroom', when);
    expect(p.title).toBe('Aerlyn — Switch plate design');
    expect(p.room).toBe('Master Bedroom');
    expect(p.date).toBe('13 October 2026');
  });

  it('lists the specification in order, with what the plate shows for anything not chosen', () => {
    expect(buildPlatePdfPayload(config).specs).toEqual([
      ['Model', 'Full Glass Touch'], ['Material', 'Glass'], ['Size', '8 module'], ['Panel colour', 'Titanium'], ['Frame colour', 'Space Grey'], ['Remote', 'No'],
    ]);
    const bare = buildPlatePdfPayload({ ...config, material: null, panel: null, frame: null });
    expect(bare.specs.slice(1, 5)).toEqual([['Material', '—'], ['Size', '8 module'], ['Panel colour', 'Black'], ['Frame colour', 'Silver']]);
    // only Full Glass Touch has a frame colour
    expect(buildPlatePdfPayload({ ...config, model: 'touch-plus', accessory: null }).specs.map((row) => row[0])).not.toContain('Frame colour');
  });

  it('gives the accessory its 1-based modules and per-switch icon labels', () => {
    expect(buildPlatePdfPayload(config).accessories).toEqual([
      { name: '8 Switch (2-20A) 1 Socket (1-10A)', modules: 'Modules 1–7', icons: 'Switch 1: Light L1, Switch 2: Fan F7' },
    ]);
    expect(buildPlatePdfPayload({ ...config, icons: {} }).accessories[0].icons).toBe('—');
    expect(buildPlatePdfPayload({ ...config, accessory: null, icons: {} }).accessories).toEqual([]);
  });

  it('has no room when the designer was not opened from one', () => {
    expect(buildPlatePdfPayload(config).room).toBeNull();
    expect(buildPlatePdfPayload(config, '✨').room).toBeNull();
  });

  it('ends with the site address and shows no prices or millimetre sizes', () => {
    const p = buildPlatePdfPayload(config, 'Hall', when);
    expect(p.footer).toContain(site.origin.replace('https://', ''));
    expect(strings(p).join(' ')).not.toMatch(/₹|Rs\.?\s|\bmm\b|\d\s*[x×]\s*\d/i);
  });

  it('only ever returns characters Helvetica can encode', () => {
    // every library icon, spread over the 20 switches of the largest accessory
    const big = { ...config, size: 12, accessory: '20-switch-4-20a', icons: {} };
    const keys = plateButtons(big).map((b) => b.key);
    const icons = PLATE_ICON_CATEGORIES.flatMap((c) => c.icons);
    for (let i = 0; i < icons.length; i += keys.length) {
      const p = buildPlatePdfPayload({ ...big, icons: Object.fromEntries(keys.map((key, k) => [key, icons[(i + k) % icons.length].id])) }, 'बैठक Living ✨ Room', when);
      for (const s of strings(p)) expect(s, s).toMatch(WIN_ANSI);
      expect(p.room).toBe('Living Room');
      expect(p.accessories[0].icons.split(', ')).toHaveLength(20);
    }
  });

  it('keeps every catalogue name printable', () => {
    for (const list of [...Object.values(PLATE_ACCESSORIES), ...Object.values(SNAP_ON_PLATES)]) {
      for (const { name } of list) expect(pdfSafe(name)).toBe(name);
    }
  });
});
