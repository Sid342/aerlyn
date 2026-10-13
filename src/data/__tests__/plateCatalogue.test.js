import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { PLATE_MODELS, PLATE_SIZES, PLATE_COLOURS, PLATE_ACCESSORIES, UNSTYLED_CLASSES } from '../plateCatalogue.js';
import { SNAP_ON_PLATES } from '../plateSnapOn.js';
import { PLATE_ICON_CATEGORIES, plateIcon, plateIconSrc } from '../plateIconLibrary.js';
import { accessoriesFor, coloursFor } from '../../lib/plateConfig.js';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const css = (read('../../features/touchPlate/reference.css') + read('../../features/touchPlate/TouchPlateDesigner.css')).replace(/\/\*[\s\S]*?\*\//g, '');
const styled = new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
const everyAccessory = Object.values(PLATE_ACCESSORIES).flat();
const icons = PLATE_ICON_CATEGORIES.flatMap((c) => c.icons);

describe('plate stylesheet', () => {
  it('scopes every copied rule under .tpd-ref', () => {
    const rules = read('../../features/touchPlate/reference.css').replace(/\/\*[\s\S]*?\*\//g, '').split('}').filter((r) => r.includes('{'));
    expect(rules.length).toBeGreaterThan(60);
    for (const rule of rules) for (const selector of rule.split('{')[0].split(',')) expect(selector.trim()).toMatch(/^\.tpd-ref /);
  });

  it('styles every class the accessories use, bar the ones the reference leaves unstyled too', () => {
    const used = new Set(everyAccessory.flatMap((a) => [a.className, ...a.nodes.flatMap((n) => n.classes.flatMap((c) => c.split(' ')))]));
    const missing = [...used].filter((c) => !styled.has(c)).sort();
    expect(missing).toEqual([...UNSTYLED_CLASSES].sort());
    for (const size of PLATE_SIZES) for (const c of [`module-${size}`, `sub-module-${size}`]) expect(styled.has(c), c).toBe(true);
  });

  it('has every image the stylesheets point at', () => {
    const urls = [...css.matchAll(/url\(\.\/(media\/[^)]+)\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThanOrEqual(8);
    for (const url of urls) expect(fs.existsSync(new URL(`../../features/touchPlate/${url}`, import.meta.url)), url).toBe(true);
  });
});

describe('plate catalogue', () => {
  it('has unique accessory ids per size and at least one icon-less or icon-taking node each', () => {
    for (const [size, list] of Object.entries({ ...PLATE_ACCESSORIES })) {
      expect(PLATE_SIZES).toContain(Number(size));
      expect(new Set(list.map((a) => a.id)).size, size).toBe(list.length);
      for (const a of list) {
        expect(a.name.trim()).toBe(a.name);
        expect(a.nodes.length).toBeGreaterThan(0);
        for (const node of a.nodes) expect(node.classes.length).toBeGreaterThan(0);
      }
    }
  });

  it('puts every 12 module node on a panel, and no other size on one', () => {
    for (const [size, list] of Object.entries(PLATE_ACCESSORIES)) {
      for (const node of list.flatMap((a) => a.nodes)) expect(!!(node.panel1 || node.panel2), size).toBe(size === '12');
    }
  });

  it('offers every accessory, Snap On plate and colour under at least one model', () => {
    const reachable = new Set();
    const colours = new Set();
    for (const { id: model } of PLATE_MODELS) {
      for (const c of coloursFor({ model })) colours.add(c.id);
      for (const size of PLATE_SIZES) for (const a of accessoriesFor({ model, size })) reachable.add(`${model === 'snap-on'}/${size}/${a.id}`);
    }
    for (const [size, list] of Object.entries(PLATE_ACCESSORIES)) for (const a of list) expect(reachable.has(`false/${size}/${a.id}`), `${size} ${a.name}`).toBe(true);
    for (const [size, list] of Object.entries(SNAP_ON_PLATES)) for (const a of list) expect(reachable.has(`true/${size}/${a.id}`), `${size} ${a.name}`).toBe(true);
    expect([...colours].sort()).toEqual(PLATE_COLOURS.map((c) => c.id).sort());
  });

  it('keeps every Snap On element inside its panel', () => {
    for (const plate of Object.values(SNAP_ON_PLATES).flat()) {
      expect(plate.elements.some((el) => el.drop)).toBe(true);
      for (const el of plate.elements) {
        expect(el.cx > 0 && el.cx < plate.panel.w && el.cy > 0 && el.cy < plate.panel.h, `${plate.name}`).toBe(true);
      }
    }
  });
});

describe('plate icon library', () => {
  it('has the 209 icons of the reference in 12 categories, with unique short ids', () => {
    expect(PLATE_ICON_CATEGORIES).toHaveLength(12);
    expect(icons).toHaveLength(209);
    expect(new Set(icons.map((i) => i.id)).size).toBe(209);
    for (const icon of icons) {
      expect(icon.id).toMatch(/^[a-z0-9-]{3,24}$/);
      expect(icon.label.trim().length).toBeGreaterThan(2);
      expect(plateIcon(icon.id)).toBe(icon);
    }
    expect(plateIcon('nope')).toBeNull();
    expect(plateIconSrc('nope')).toBeNull();
  });

  it('maps every icon to a clean-named SVG file that exists in public/', () => {
    const onDisk = fs.readdirSync(new URL('../../../public/plate-icons', import.meta.url), { recursive: true }).filter((f) => String(f).endsWith('.svg'));
    expect(onDisk).toHaveLength(209);
    for (const icon of icons) {
      expect(icon.file).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+\.svg$/);
      expect(plateIconSrc(icon.id)).toBe(`/plate-icons/${icon.file}`);
      const svg = fs.readFileSync(new URL(`../../../public/plate-icons/${icon.file}`, import.meta.url), 'utf8');
      // an intrinsic size (so it can be drawn to a canvas) and nothing that runs or loads
      expect(svg, icon.file).toMatch(/<svg[^>]*\swidth="[\d.]+"[^>]*>/);
      expect(svg, icon.file).not.toMatch(/<script|\son\w+=|javascript:|<foreignObject/i);
    }
  });
});
