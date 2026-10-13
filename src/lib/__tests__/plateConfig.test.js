import { describe, it, expect } from 'vitest';
import {
  emptyPlateConfig, cleanPlateConfig, hasPlate, plateSteps, accessoriesFor, coloursFor, plateAccessory, platePanels, plateButtons,
  describePlate, encodePlate, decodePlate, hasFrame, hasBorder, isLightPanel,
} from '../plateConfig.js';

const ACC = '8-switch-2-20a-1-socket-1-10a';
const full = {
  ...emptyPlateConfig, model: 'full-glass', material: 'glass', size: 8, accessory: ACC,
  icons: { '1.0.0': 'sh-circle', '1.1.1': 'fa-f7', '1.3.0': 'nu-9' }, panel: 'titanium', frame: 'space-grey', remote: true,
};
const stepIds = (config) => plateSteps(config).map((s) => s.id);

describe('steps and model rules', () => {
  it('follows the reference: eight steps, the Frame step only for Full Glass Touch', () => {
    expect(stepIds({ model: 'full-glass' })).toEqual(['model', 'material', 'size', 'accessories', 'icons', 'panel', 'frame', 'summary']);
    for (const model of ['touch-plus', 'snap-on', null]) expect(stepIds({ model })).not.toContain('frame');
    expect([hasFrame({ model: 'snap-on' }), hasBorder({ model: 'snap-on' }), hasBorder({ model: 'touch-plus' })]).toEqual([false, true, false]);
  });

  it('filters colours by model', () => {
    expect(coloursFor({ model: 'full-glass' }).map((c) => c.label)).toEqual(['Black', 'Space Grey', 'Titanium']);
    expect(coloursFor({ model: 'snap-on' }).map((c) => c.label)).toEqual(['Black', 'Space Grey', 'Titanium']);
    expect(coloursFor({ model: 'touch-plus' }).map((c) => c.label)).toEqual(['Black', 'White', 'Gray']);
  });

  it('filters accessories by model and size', () => {
    const names = (model, size) => accessoriesFor({ model, size }).map((a) => a.name);
    expect(names('full-glass', 2)).toHaveLength(7);
    expect(names('touch-plus', 2)).toEqual(['2 Switch(1-25A)', '4 Switch', 'Fan']);
    // on 12 module plates the Touch Plus accessories are Touch Plus only
    expect(names('touch-plus', 12).length).toBeGreaterThan(0);
    for (const name of names('touch-plus', 12)) expect(names('full-glass', 12)).not.toContain(name);
    expect(names('snap-on', 2)[0]).toBe('2 Switch');
    expect(names('snap-on', 12)).toEqual([]);
    expect(names('full-glass', null)).toEqual([]);
  });

  it('knows a light panel from a dark one', () => {
    expect(['black', 'gray', null].map((panel) => isLightPanel({ panel }))).toEqual([false, false, false]);
    expect(['space-grey', 'titanium', 'white'].map((panel) => isLightPanel({ panel }))).toEqual([true, true, true]);
  });
});

describe('buttons', () => {
  it('numbers every switch that takes an icon, skipping nodes flagged noIcon', () => {
    const buttons = plateButtons(full);
    expect(buttons.map((b) => b.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]); // eight switches; the socket takes none
    expect(buttons[0]).toEqual({ key: '1.0.0', n: 1, icon: 'sh-circle' });
    // reading order: the top row is 1–4, the bottom row 5–8
    expect(buttons.map((b) => b.key)).toEqual(['1.0.0', '1.1.0', '1.2.0', '1.3.0', '1.0.1', '1.1.1', '1.2.1', '1.3.1']);
    expect(buttons[5]).toEqual({ key: '1.1.1', n: 6, icon: 'fa-f7' });
    expect(platePanels(full)).toHaveLength(1);
    expect(platePanels(full)[0].at(-1).subs[0].key).toBeNull();
  });

  it('lays a 12 module accessory out on an upper and a lower panel', () => {
    const config = { ...emptyPlateConfig, model: 'full-glass', size: 12, accessory: '20-switch-4-20a' };
    expect(platePanels(config).map((nodes) => nodes.length)).toEqual([5, 5]);
    const keys = plateButtons(config).map((b) => b.key);
    expect(keys).toHaveLength(20);
    expect([keys[0], keys[10], keys[19]]).toEqual(['1.0.0', '2.0.0', '2.4.1']);
  });

  it('takes the icon-taking buttons of a Snap On plate from its drawing', () => {
    const config = { ...emptyPlateConfig, model: 'snap-on', size: 2, accessory: accessoriesFor({ model: 'snap-on', size: 2 })[0].id };
    expect(plateButtons(config).map((b) => b.key)).toEqual(['s0', 's1']);
    expect(platePanels(config)).toEqual([]);
  });
});

describe('cleanPlateConfig', () => {
  it('gives the empty config for anything that is not a config', () => {
    for (const bad of [undefined, null, 'x', 7, [], ['p3']]) expect(cleanPlateConfig(bad)).toEqual(emptyPlateConfig);
    expect(hasPlate(emptyPlateConfig)).toBe(false);
  });

  it('keeps a complete config as it is', () => {
    expect(cleanPlateConfig(full)).toEqual(full);
    expect(cleanPlateConfig({ ...full, junk: 1, maxSlots: 99 })).toEqual(full);
  });

  it('drops unknown ids one by one, keeping the rest', () => {
    expect(cleanPlateConfig({ ...full, model: 'nope' })).toMatchObject({ model: null, size: 8, accessory: ACC, frame: null });
    expect(cleanPlateConfig({ ...full, material: { a: 1 }, size: 5 })).toMatchObject({ material: null, size: null, accessory: null, icons: {} });
    expect(cleanPlateConfig({ ...full, panel: 'url(x)', frame: 'white', remote: 'yes' })).toMatchObject({ panel: null, frame: null, remote: false });
    expect(cleanPlateConfig({ ...full, accessory: '40-switch' })).toMatchObject({ accessory: null, icons: {} });
  });

  it('drops what the model does not offer', () => {
    // a Full Glass accessory and colour on a Touch Plus plate
    expect(cleanPlateConfig({ ...full, model: 'touch-plus', accessory: '10-switch-2-20a-1-socket-1-10a' })).toMatchObject({ accessory: null, panel: null, frame: null });
    expect(cleanPlateConfig({ ...full, model: 'snap-on' })).toMatchObject({ accessory: null, icons: {}, panel: 'titanium', frame: null });
  });

  it('keeps an icon only if it is a library icon on a switch the accessory has', () => {
    const icons = { '1.0.0': 'sh-circle', '1.0.1': '💡', '1.1.0': 'light', '1.4.0': 'fa-f7', '9.9.9': 'nu-9', '1.2.0': { html: '<b>' }, x: 'nu-9' };
    expect(cleanPlateConfig({ ...full, icons }).icons).toEqual({ '1.0.0': 'sh-circle' });
    expect(cleanPlateConfig({ ...full, icons: 'x' }).icons).toEqual({});
    expect(cleanPlateConfig({ ...full, accessory: null }).icons).toEqual({});
  });

  describe('older shapes', () => {
    const old = {
      model: '4 module', maxSlots: 4, material: 'Black', materialCode: '#000000', size: 'Standard', panel: 'Matte', frame: 'Square',
      accessories: [{ id: 'a1', name: '4 Switch', nodeSize: 2, slots: [0, 1] }],
    };
    const migrated = { ...emptyPlateConfig, size: 4, panel: 'black', accessory: '4-switch' };

    it('loads a plate saved with emoji icons: size, colour and accessory survive, the icons do not', () => {
      expect(cleanPlateConfig({ ...old, icons: { a1: '💡' } })).toEqual(migrated);
    });

    it('loads a plate saved with the home-made icon ids the same way', () => {
      expect(cleanPlateConfig({ ...old, icons: { 'a1.0': 'light', 'a1.2': 'fan' } })).toEqual(migrated);
    });

    it('drops what cannot be mapped without crashing', () => {
      expect(cleanPlateConfig({ ...old, material: 'Pearl White', accessories: [{ name: '40 Switch' }] })).toEqual({ ...emptyPlateConfig, size: 4 });
      expect(cleanPlateConfig({ ...old, accessories: [old.accessories[0], old.accessories[0]] }).accessory).toBeNull(); // one per plate now
      expect(cleanPlateConfig({ model: '99 module', accessories: 'x', icons: 7 })).toEqual(emptyPlateConfig);
      expect(cleanPlateConfig({ model: '8 module' })).toEqual({ ...emptyPlateConfig, size: 8 });
    });
  });
});

describe('describePlate', () => {
  it('reads out the whole plate, with 1-based modules and each switch\'s icon label', () => {
    expect(describePlate(full)).toEqual({
      model: 'Full Glass Touch', material: 'Glass', size: '8 module', panel: 'Titanium', frame: 'Space Grey', remote: 'Yes',
      accessories: [{
        name: '8 Switch (2-20A) 1 Socket (1-10A)',
        modules: `Modules 1–${plateAccessory(full).nodeSize}`,
        icons: ['Switch 1: Shapes Circle', 'Switch 4: Numbers 9', 'Switch 6: Fan F7'],
      }],
    });
  });

  it('falls back to what the plate shows before anything is picked', () => {
    expect(describePlate({ ...emptyPlateConfig, model: 'full-glass', size: 2 })).toEqual({
      model: 'Full Glass Touch', material: null, size: '2 module', panel: 'Black', frame: 'Silver', remote: 'No', accessories: [],
    });
    expect(describePlate({ ...full, model: 'touch-plus' }).frame).toBeNull();
  });
});

describe('plan link', () => {
  it('round-trips a plate with per-switch icons, compactly', () => {
    const packed = encodePlate(full);
    expect(packed).toEqual(['p3', 'full-glass', 'glass', 8, ACC, 'titanium', 'space-grey', 1, { '1.0.0': 'sh-circle', '1.1.1': 'fa-f7', '1.3.0': 'nu-9' }]);
    expect(decodePlate(JSON.parse(JSON.stringify(packed)))).toEqual(full);
    expect(JSON.stringify(packed).length).toBeLessThan(160);
  });

  it('round-trips a Snap On plate and a bare size', () => {
    const snap = cleanPlateConfig({ model: 'snap-on', material: 'acrylic', size: 2, accessory: accessoriesFor({ model: 'snap-on', size: 2 })[0].id, icons: { s1: 'sh-square' } });
    expect(snap.icons).toEqual({ s1: 'sh-square' });
    expect(decodePlate(encodePlate(snap))).toEqual(snap);
    const bare = { ...emptyPlateConfig, size: 6 };
    expect(decodePlate(encodePlate(bare))).toEqual(bare);
  });

  it('cleans a tampered link instead of trusting it', () => {
    const plate = decodePlate(['p3', 'full-glass', '<script>', 8, ACC, 'javascript:1', null, 1, { '1.0.0': 'sh-circle', '1.0.1': '../../etc', '7.7.7': 'sh-circle' }]);
    expect(plate).toEqual({ ...full, material: null, panel: null, frame: null, icons: { '1.0.0': 'sh-circle' } });
  });

  it('reads the previous link shape, keeping size, colour and a single accessory', () => {
    expect(decodePlate([4, 'Black', 'Standard', 'Matte', 'Square', [['4 Switch', 2]], { 'a2.1': 'ac' }]))
      .toEqual({ ...emptyPlateConfig, size: 4, panel: 'black', accessory: '4-switch' });
    expect(decodePlate([8, 'Titanium', null, null, null, [['8 Switch 1 Socket', 0], ['Fan', 7]], {}]))
      .toEqual({ ...emptyPlateConfig, size: 8, panel: 'titanium' });
  });

  it('returns null when there is no plate in it', () => {
    for (const nothing of [null, undefined, '8 module', 7, [], [5, 'Black', null, null, null, [], {}], { model: null }, { model: '99 module' }]) {
      expect(decodePlate(nothing)).toBeNull();
    }
  });
});
