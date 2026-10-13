import { describe, it, expect } from 'vitest';
import { ACCESSORIES, MATERIAL_COLORS, MODULE_OPTIONS } from '../../data/plateAccessories.js';
import { PLATE_ICONS, SYMBOLS, placeSymbol } from '../../data/plateIcons.js';
import {
  parseAccessory, plateGrid, findStart, plateLayout, plateDetails, plateSummary, modulesLabel, inkFor, MODULE, ROW, PAD,
} from '../plateLayout.js';

const count = (name) => parseAccessory(name).reduce((acc, k) => ({ ...acc, [k]: (acc[k] || 0) + 1 }), {});
const plate = (maxSlots, accessories = [], extra = {}) => ({
  model: `${maxSlots} module`, maxSlots, material: null, materialCode: null, accessories, icons: {}, ...extra,
});
const acc = (name, start, nodeSize) => ({
  id: `a${start}`, name, nodeSize, slots: Array.from({ length: nodeSize }, (_, k) => start + k),
});

describe('parseAccessory', () => {
  it.each([
    ['8 Switch 1 Socket (1-10A)', { switch: 8, socket: 1 }],
    ['2 Switch 1 Fan 1 Curtain', { switch: 2, fan: 1, curtain: 1 }],
    ['Fan', { fan: 1 }],
    ['2 Fan', { fan: 2 }],
    ['1 Curtain', { curtain: 1 }],
    ['Socket 16A', { socket: 1 }],
    ['4 Switch + 2 Fan', { switch: 4, fan: 2 }],
    ['20 Switch (4-20A)', { switch: 20 }],
    ['Fan 1 Socket (1-10A)', { fan: 1, socket: 1 }],
  ])('%s', (name, expected) => {
    expect(count(name)).toEqual(expected);
  });

  it('parses every accessory in the catalogue into at least one control', () => {
    for (const list of Object.values(ACCESSORIES)) {
      for (const { name } of list) expect(parseAccessory(name).length, name).toBeGreaterThan(0);
    }
  });

  it('caps the controls of a made-up name', () => {
    expect(parseAccessory('99999999 Switch').length).toBeLessThanOrEqual(24);
    expect(parseAccessory('nothing here')).toEqual([]);
  });
});

describe('plate grid and placement', () => {
  it('puts 12 modules on two rows and the rest on one', () => {
    expect(plateGrid(8)).toEqual({ cols: 8, rows: 1 });
    expect(plateGrid(12)).toEqual({ cols: 6, rows: 2 });
  });

  it('finds the first free run', () => {
    expect(findStart(plate(8), 7)).toBe(0);
    expect(findStart(plate(8, [acc('4 Switch', 0, 2)]), 5)).toBe(2);
    expect(findStart(plate(8, [acc('8 Switch 1 Socket', 0, 7)]), 2)).toBe(-1);
  });

  it('never places an accessory across the two rows of a 12-module plate', () => {
    const one = plate(12, [acc('20 Switch (4-20A)', 0, 5)]);
    expect(findStart(one, 5)).toBe(6);
    expect(findStart(plate(12, [...one.accessories, acc('12 Switch 2 Fan', 6, 5)]), 5)).toBe(-1);
  });
});

describe('plateLayout', () => {
  it('is null until a plate size is chosen', () => {
    expect(plateLayout(plate(0))).toBeNull();
  });

  it('sizes the plate from the module count', () => {
    for (const { maxSlots } of MODULE_OPTIONS) {
      const l = plateLayout(plate(maxSlots));
      expect(l.w).toBe(l.cols * MODULE + 2 * PAD);
      expect(l.h).toBe(l.rows * ROW + 2 * PAD);
      expect(l.empty).toHaveLength(maxSlots);
    }
    expect(plateLayout(plate(12)).rows).toBe(2);
  });

  it('lays out "8 Switch 1 Socket" as eight numbered buttons and a socket', () => {
    const l = plateLayout(plate(8, [acc('8 Switch 1 Socket', 0, 7)]));
    expect(l.empty).toHaveLength(1);
    expect(l.controls.filter((c) => c.kind === 'switch').map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(l.controls.filter((c) => c.kind === 'socket')).toHaveLength(1);
    expect(l.switchCount).toBe(8);
  });

  it('numbers switches across accessories in plate order', () => {
    const l = plateLayout(plate(8, [acc('4 Switch', 5, 2), acc('6 Switch 1 Fan', 0, 5)]));
    expect(l.accessories.map((a) => a.name)).toEqual(['6 Switch 1 Fan', '4 Switch']);
    expect(l.accessories[1].controls.map((c) => c.n)).toEqual([7, 8, 9, 10]);
  });

  it('keeps every control of every catalogue accessory inside its accessory and the plate', () => {
    for (const [model, list] of Object.entries(ACCESSORIES)) {
      const maxSlots = parseInt(model, 10);
      for (const item of list) {
        const l = plateLayout(plate(maxSlots, [acc(item.name, 0, item.nodeSize)]));
        const a = l.accessories[0];
        expect(a.controls.length, item.name).toBe(parseAccessory(item.name).length);
        for (const c of a.controls) {
          expect(c.w, item.name).toBeGreaterThan(0);
          expect(c.x, item.name).toBeGreaterThanOrEqual(a.x - 1e-9);
          expect(c.x + c.w, item.name).toBeLessThanOrEqual(a.x + a.w + 1e-9);
          expect(c.y + c.h, item.name).toBeLessThanOrEqual(l.h - PAD + 1e-9);
        }
      }
    }
  });

  it('puts chosen icons on their buttons and ignores unknown ones', () => {
    const l = plateLayout(plate(4, [acc('4 Switch', 0, 2)], { icons: { 'a0.1': 'fan', 'a0.2': '💡', 'a0.9': 'tv' } }));
    expect(l.controls.map((c) => c.icon)).toEqual([null, 'fan', null, null]);
  });

  it('uses the material colour, and a readable symbol colour on it', () => {
    for (const { label, code } of MATERIAL_COLORS) {
      const l = plateLayout(plate(4, [], { material: label }));
      expect(l.fill).toBe(code);
      expect(l.ink).toBe(inkFor(code));
    }
    expect(inkFor('#000000')).toBe('#f3f3f6');
    expect(inkFor('#616161')).toBe('#f3f3f6');
    expect(inkFor('#ffffff')).toBe('#1c1c22');
    expect(inkFor('#f4debe')).toBe('#1c1c22');
    expect(inkFor('#bfc6cb')).toBe('#1c1c22');
  });
});

describe('plate wording', () => {
  it('names modules from 1', () => {
    expect(modulesLabel([0, 1, 2, 3])).toBe('Modules 1–4');
    expect(modulesLabel([2])).toBe('Module 3');
    expect(modulesLabel([0, 1, 4])).toBe('Modules 1–2, 5');
  });

  it('lists accessories with their modules and button icons', () => {
    const config = plate(8, [acc('8 Switch 1 Socket', 0, 7)], { icons: { 'a0.0': 'light', 'a0.2': 'fan' } });
    expect(plateDetails(config)).toEqual([
      { name: '8 Switch 1 Socket', modules: 'Modules 1–7', icons: ['Switch 1: Light', 'Switch 3: Fan'] },
    ]);
  });

  it('summarises the plate in a sentence', () => {
    const config = plate(4, [acc('4 Switch', 0, 2)], { material: 'Black', panel: 'Matte', frame: 'Square' });
    expect(plateSummary(config)).toBe('4 module switch plate, Black, Matte finish, Square frame: 4 Switch (modules 1–2)');
    expect(plateSummary(plate(0, [], { model: null }))).toBe('No plate size chosen yet');
  });
});

describe('plate symbols', () => {
  it('has a drawing for every icon and every control kind', () => {
    for (const id of [...PLATE_ICONS.map((i) => i.id), 'switch', 'fan', 'socket', 'curtain']) {
      expect(SYMBOLS[id]?.length, id).toBeGreaterThan(0);
    }
  });

  it('draws every symbol inside its 24-unit box', () => {
    for (const [id, shapes] of Object.entries(SYMBOLS)) {
      for (const s of shapes) {
        const pts = s.c ? [[s.c[0] - s.c[2], s.c[1] - s.c[2]], [s.c[0] + s.c[2], s.c[1] + s.c[2]]] : s.pts;
        for (const [x, y] of pts) {
          expect(Number.isFinite(x) && Number.isFinite(y), id).toBe(true);
          expect(Math.min(x, y), id).toBeGreaterThanOrEqual(1);
          expect(Math.max(x, y), id).toBeLessThanOrEqual(23);
        }
      }
    }
  });

  it('scales and centres a symbol', () => {
    const [ring] = placeSymbol('socket', 100, 50, 12);
    const xs = ring.pts.map((p) => p[0]);
    expect(Math.min(...xs)).toBeCloseTo(100 - 4.25, 1);
    expect(Math.max(...xs)).toBeCloseTo(100 + 4.25, 1);
  });
});
