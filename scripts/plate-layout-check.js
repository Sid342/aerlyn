// In-browser check of the Touch Plate Designer's drawing. Not part of the build: load it in a page that
// shows the designer (see docs/HANDOFF.md, "Checking the plate layouts") and run
//   await plateCheck.run()        // places every accessory of every model and size, measures each plate
//   plateCheck.sheet('Full Glass Touch', 12)   // every measured plate of that model and size on one screen
//   plateCheck.sheet('Snap On')                // ... of that model in every size
//   plateCheck.moved(placesFromAnotherBuild)   // the plates whose controls are not where plateCheck.places() had them
// A row fails when a control is less than MARGIN px inside the panel outline or two controls are less
// than GAP px apart. A control is one ring or one graphic (socket, dimmer); graphics are measured by
// the pixels they actually draw, not by their box.
(() => {
  const MARGIN = 4;
  const GAP = 1;
  const tick = (ms = 60) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = () => $('#plate-designer');
  const plates = []; // { model, size, name, node, row }

  async function click(el) {
    el.click();
    await tick();
  }

  // Bounding box of the opaque pixels of an image, as fractions of its size.
  const inked = new Map();
  function inkBox(url) {
    if (!inked.has(url)) {
      inked.set(url, new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const k = Math.max(1, 600 / (img.naturalWidth || 300)); // an SVG's own size is a few px: too coarse to measure
          const w = Math.round((img.naturalWidth || 300) * k);
          const h = Math.round((img.naturalHeight || 300) * k);
          const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
          const g = c.getContext('2d');
          g.drawImage(img, 0, 0, w, h);
          const d = g.getImageData(0, 0, w, h).data;
          let x0 = w, y0 = h, x1 = -1, y1 = -1;
          for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            if (d[(y * w + x) * 4 + 3] > 40) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
          resolve({ x0: x0 / w, y0: y0 / h, x1: (x1 + 1) / w, y1: (y1 + 1) / h, ratio: w / h });
        };
        img.onerror = reject;
        img.src = url;
      }));
    }
    return inked.get(url);
  }

  // What a control draws, in viewport px: its box if it is a ring, else the ink of its background image.
  async function drawn(el) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const url = /^url\("(.*)"\)$/.exec(cs.backgroundImage)?.[1].replace(/\\(.)/g, '$1'); // a data: URL may hold brackets and quotes
    if (!url || parseFloat(cs.borderTopWidth) > 0 || el.classList.contains('snapon-btn')) return { l: r.left, t: r.top, r: r.right, b: r.bottom };
    const ink = await inkBox(url);
    let w = r.width;
    let h = r.height;
    if (cs.backgroundSize === 'cover' || cs.backgroundSize === 'contain') {
      const wide = ink.ratio > r.width / r.height;
      if ((cs.backgroundSize === 'cover') === wide) w = h * ink.ratio;
      else h = w / ink.ratio;
    }
    const x = r.left + (r.width - w) / 2;
    const y = r.top + (r.height - h) / 2;
    return { l: x + ink.x0 * w, t: y + ink.y0 * h, r: x + ink.x1 * w, b: y + ink.y1 * h };
  }

  async function measure() {
    const plate = $('.module-display', root());
    const panel = ($('[class^="sub-module-"]', plate) || plate).getBoundingClientRect();
    const els = $$('.nodeSize > *, .snapon-surface > *', plate);
    const boxes = await Promise.all(els.map(drawn));
    const origin = plate.getBoundingClientRect();
    const at = boxes.map((b) => [b.l - origin.left, b.t - origin.top, b.r - origin.left, b.b - origin.top].map((v) => +v.toFixed(1)));
    let margin = Infinity;
    let gap = Infinity;
    const bad = [];
    boxes.forEach((a, i) => {
      const m = Math.min(a.l - panel.left, a.t - panel.top, panel.right - a.r, panel.bottom - a.b);
      margin = Math.min(margin, m);
      if (m < MARGIN) bad.push(`#${i + 1} ${els[i].className.split(' ')[0]} ${m.toFixed(1)}px from the outline`);
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j];
        const g = Math.max(b.l - a.r, a.l - b.r, b.t - a.b, a.t - b.b);
        gap = Math.min(gap, g);
        if (g < GAP) bad.push(`#${i + 1}/#${j + 1} ${g < 0 ? 'overlap' : 'touch'} (${g.toFixed(1)}px)`);
      }
    });
    return { controls: els.length, margin: +margin.toFixed(1), gap: +gap.toFixed(1), pass: els.length > 0 && bad.length === 0, bad, at };
  }

  const stepIndex = (label) => $$('.tpd-step-label', root()).findIndex((s) => s.textContent === label);
  async function goTo(label) {
    for (let guard = 0; guard < 12; guard++) {
      const at = $$('.tpd-step', root()).findIndex((li) => li.classList.contains('active'));
      const to = stepIndex(label);
      if (at === to) return;
      await click(at > to ? $$('.tpd-step button', root())[to] : $('.tpd-nav .primary', root()));
    }
    throw new Error(`cannot reach the ${label} step`);
  }
  const cards = () => $$('.tpd-card', root());

  async function run({ models = null, sizes = null } = {}) {
    plates.length = 0;
    await goTo('Model');
    for (const model of cards().map((c) => c.getAttribute('aria-label'))) {
      if (models && !models.includes(model)) continue;
      await goTo('Model');
      await click(cards().find((c) => c.getAttribute('aria-label') === model));
      await goTo('Material');
      await click(cards()[0]);
      await goTo('Size');
      for (const size of cards().map((c) => parseInt(c.getAttribute('aria-label'), 10))) {
        if (sizes && !sizes.includes(size)) continue;
        await goTo('Size');
        await click(cards().find((c) => parseInt(c.getAttribute('aria-label'), 10) === size));
        await goTo('Accessories');
        const count = $$('.tpd-accessory', root()).length;
        for (let i = 0; i < count; i++) {
          // one accessory per plate: the last one has to go (the bin) before the next can be placed
          const bin = $('.tpd-bin', root());
          if (bin) await click(bin);
          const button = $$('.tpd-accessory', root())[i];
          await click(button);
          if (button.getAttribute('aria-pressed') !== 'true') throw new Error(`${model} ${size}: "${button.textContent}" was not placed`);
          await tick(120);
          const node = $('.tpd-ref', root()).cloneNode(true);
          $('.tpd-bin', node)?.remove();
          plates.push({ model, size, name: button.textContent, node, row: await measure() });
        }
        const bin = $('.tpd-bin', root());
        if (bin) await click(bin);
      }
    }
    const rows = plates.map(({ model, size, name, row: { at, bad, ...row } }) => ({ model, size, accessory: name, ...row, bad: bad.join('; ') }));
    console.table(rows);
    return { rows: rows.length, failing: rows.filter((r) => !r.pass).length, table: rows };
  }

  // Every measured plate of a model and size on one screen (Escape or sheet() with no arguments closes it).
  function sheet(model, size, zoom = 0.5) {
    $('#plate-sheet')?.remove();
    const list = plates.filter((p) => p.model === model && (size == null || p.size === size));
    if (!list.length) return 0;
    const sheetEl = document.createElement('div');
    sheetEl.id = 'plate-sheet';
    sheetEl.style.cssText = 'position:fixed;inset:0;z-index:99999;overflow:auto;background:#2b2b33;display:flex;flex-wrap:wrap;gap:10px;padding:10px;align-content:flex-start;';
    const title = document.createElement('h1');
    title.textContent = `${model}, ${size == null ? 'every size' : `${size} module`} —${list.filter((p) => !p.row.pass).length} of ${list.length} failing`;
    title.style.cssText = 'flex-basis:100%;margin:0;font:600 14px system-ui;color:#fff;';
    sheetEl.append(title);
    for (const p of list) {
      const cell = document.createElement('figure');
      cell.style.cssText = `margin:0;zoom:${zoom};`;
      const cap = document.createElement('figcaption');
      cap.textContent = `${size == null ? `${p.size}M: ` : ''}${p.name} —${p.row.pass ? 'pass' : 'FAIL'}`;
      cap.style.cssText = `font:600 ${12 / zoom}px system-ui;color:${p.row.pass ? '#cfd' : '#f88'};padding:0 0 ${4 / zoom}px;`;
      cell.append(cap, p.node.cloneNode(true));
      sheetEl.append(cell);
    }
    document.body.append(sheetEl);
    return list.length;
  }
  addEventListener('keydown', (e) => e.key === 'Escape' && $('#plate-sheet')?.remove());

  // Where every control of every measured plate is drawn, as { 'model|size|accessory': [[l, t, r, b]…] } from the
  // plate's corner. Keep it from one build and pass it to moved() on another to list the plates that changed.
  const places = () => Object.fromEntries(plates.map((p) => [`${p.model}|${p.size}|${p.name}`, p.row.at]));
  const moved = (before) => Object.entries(places()).filter(([key, at]) => JSON.stringify(before[key]) !== JSON.stringify(at)).map(([key]) => key);

  window.plateCheck = { run, sheet, measure, places, moved, plates };
})();
