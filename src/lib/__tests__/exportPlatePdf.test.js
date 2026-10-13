import { describe, it, expect } from 'vitest';
import { buildPlatePdfPayload, pdfSafe } from '../exportPlatePdf.js';
import { ACCESSORIES } from '../../data/plateAccessories.js';
import { PLATE_ICONS } from '../../data/plateIcons.js';
import { site } from '../../config/site.js';

// what jsPDF's built-in Helvetica can encode: WinAnsi (cp1252)
const WIN_ANSI = /^[\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]*$/;
const strings = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);

const config = {
  model: '8 module', maxSlots: 8, material: 'Titanium', materialCode: '#f4debe', size: 'Standard', panel: 'Matte', frame: 'Rounded',
  accessories: [{ id: 'a0', name: '8 Switch 1 Socket', nodeSize: 7, slots: [0, 1, 2, 3, 4, 5, 6] }],
  icons: { 'a0.0': 'light', 'a0.2': 'fan' },
};
const when = new Date(2026, 9, 13, 17, 50);

describe('buildPlatePdfPayload', () => {
  it('has the title, room and an en-IN date', () => {
    const p = buildPlatePdfPayload(config, 'Master Bedroom', when);
    expect(p.title).toBe('Aerlyn — Switch plate design');
    expect(p.room).toBe('Master Bedroom');
    expect(p.date).toBe('13 October 2026');
  });

  it('lists the five specifications in order, with a dash for anything not chosen', () => {
    expect(buildPlatePdfPayload(config).specs).toEqual([
      ['Plate size', '8 module'], ['Colour', 'Titanium'], ['Profile', 'Standard'], ['Finish', 'Matte'], ['Frame', 'Rounded'],
    ]);
    const bare = buildPlatePdfPayload({ ...config, panel: null, frame: null });
    expect(bare.specs.slice(3)).toEqual([['Finish', '—'], ['Frame', '—']]);
  });

  it('gives each accessory its 1-based modules and per-button icon labels', () => {
    expect(buildPlatePdfPayload(config).accessories).toEqual([
      { name: '8 Switch 1 Socket', modules: 'Modules 1–7', icons: 'Switch 1: Light, Switch 3: Fan' },
    ]);
    expect(buildPlatePdfPayload({ ...config, icons: {} }).accessories[0].icons).toBe('—');
    expect(buildPlatePdfPayload({ ...config, accessories: [], icons: {} }).accessories).toEqual([]);
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
    const everyIcon = Object.fromEntries(PLATE_ICONS.map((icon, i) => [`a0.${i}`, icon.id]));
    const hostile = {
      ...config, model: '12 module', maxSlots: 12, material: 'Black 🖤', size: 'स्लिम', panel: 'Gloss ✨', frame: 'Rounded™',
      accessories: [
        { id: 'a0', name: '20 Switch (4-20A)', nodeSize: 5, slots: [0, 1, 2, 3, 4] },
        { id: 'a6', name: '8 Switch 💡 4 Fan', nodeSize: 5, slots: [6, 7, 8, 9, 10] },
      ],
      icons: { ...everyIcon, a0: '💡', 'a6.0': '🔌' }, // includes icons an old plan stored as emoji
    };
    const p = buildPlatePdfPayload(hostile, 'बैठक Living ✨ Room', when);
    for (const s of strings(p)) expect(s, s).toMatch(WIN_ANSI);
    expect(p.room).toBe('Living Room');
    expect(p.accessories[0].icons).toContain('Switch 11: Scene');
    expect(p.accessories[1].icons).toBe('—');
  });

  it('keeps every catalogue accessory name printable', () => {
    for (const list of Object.values(ACCESSORIES)) for (const { name } of list) expect(pdfSafe(name)).toBe(name);
  });
});
