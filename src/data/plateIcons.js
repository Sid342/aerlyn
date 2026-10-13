// Line symbols for the plate, drawn in a 24 x 24 box. Each symbol is a list of shapes with only
// two primitives — { pts, closed } polylines and { c: [cx, cy, r] } circles — so the SVG preview
// and the PDF draw exactly the same thing.

const r2 = (n) => Math.round(n * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;

// angles in degrees, 0 = right, 90 = down
function arc(cx, cy, r, a0, a1, n = 16) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = rad(a0 + ((a1 - a0) * i) / n);
    return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
  });
}

function quad([x0, y0], [x1, y1], [x2, y2], n = 10) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [r2(u * u * x0 + 2 * u * t * x1 + t * t * x2), r2(u * u * y0 + 2 * u * t * y1 + t * t * y2)];
  });
}

const line = (...pts) => ({ pts });
const circle = (cx, cy, r) => ({ c: [cx, cy, r] });
const rrect = (x, y, w, h, r) => ({
  closed: true,
  pts: [
    ...arc(x + w - r, y + r, r, -90, 0, 4), ...arc(x + w - r, y + h - r, r, 0, 90, 4),
    ...arc(x + r, y + h - r, r, 90, 180, 4), ...arc(x + r, y + r, r, 180, 270, 4),
  ],
});

function fanBlade(deg) {
  const a = rad(deg);
  const at = ([u, v]) => [12 + u * Math.cos(a) - v * Math.sin(a), 12 + u * Math.sin(a) + v * Math.cos(a)];
  return {
    closed: true,
    pts: [...quad(at([2, 0]), at([4, -5.5]), at([9.5, -2])), ...quad(at([9.5, -2]), at([8.5, 3]), at([2, 0])).slice(1, -1)],
  };
}

const socket = [rrect(3.5, 3.5, 17, 17, 3.5), circle(12, 8.5, 1.4), circle(8.2, 14.8, 1.4), circle(15.8, 14.8, 1.4)];
const fan = [circle(12, 12, 2), fanBlade(-90), fanBlade(30), fanBlade(150)];
const curtain = [
  line([2.5, 4], [21.5, 4]),
  { pts: [[4.5, 4], [4.5, 20.5], [8, 20.5], ...quad([8, 20.5], [8.5, 10], [11, 4])] },
  { pts: [[19.5, 4], [19.5, 20.5], [16, 20.5], ...quad([16, 20.5], [15.5, 10], [13, 4])] },
];

export const SYMBOLS = {
  // default for a switch button: power ring
  switch: [{ pts: arc(12, 13, 7, -55, 235, 20) }, line([12, 3.5], [12, 11.5])],
  fan,
  socket,
  curtain,
  light: [
    { pts: [[9.6, 18], ...arc(12, 10, 6.5, 125, 415, 20), [14.4, 18], [9.6, 18]] },
    line([10.2, 21], [13.8, 21]),
  ],
  ac: [rrect(2.5, 5.5, 19, 8.5, 2), line([6, 10.5], [18, 10.5]), line([8, 17], [7, 20.5]), line([12, 17], [12, 20.5]), line([16, 17], [17, 20.5])],
  tv: [rrect(2.5, 4.5, 19, 12.5, 1.5), line([12, 17], [12, 20.5]), line([8, 20.5], [16, 20.5])],
  music: [circle(7.5, 17.5, 2.6), circle(16, 15.5, 2.6), line([10.1, 17.5], [10.1, 5.5], [18.6, 3.5], [18.6, 15.5])],
  geyser: [rrect(7, 2.5, 10, 15.5, 4.5), circle(12, 10, 2), line([10, 18], [10, 21.5]), line([14, 18], [14, 21.5])],
  lock: [rrect(5, 11, 14, 10, 2), { pts: [[8, 11], ...arc(12, 8, 4, 180, 360, 12), [16, 11]] }, circle(12, 16, 1.3)],
  night: [{ closed: true, pts: [...arc(12, 12, 8.5, -25, 250, 24), ...quad([9.09, 4.01], [11.5, 12.5], [19.7, 8.41]).slice(1, -1)] }],
  scene: [{ closed: true, pts: [[12, 2.5], [14, 10], [21.5, 12], [14, 14], [12, 21.5], [10, 14], [2.5, 12], [10, 10]] }],
};

// Icons a customer can put on a switch button. Stored by id.
export const PLATE_ICONS = [
  { id: 'light', label: 'Light' },
  { id: 'fan', label: 'Fan' },
  { id: 'socket', label: 'Socket' },
  { id: 'ac', label: 'AC' },
  { id: 'tv', label: 'TV' },
  { id: 'music', label: 'Music' },
  { id: 'curtain', label: 'Curtain' },
  { id: 'geyser', label: 'Geyser' },
  { id: 'lock', label: 'Lock' },
  { id: 'night', label: 'Night' },
  { id: 'scene', label: 'Scene' },
];

export const iconLabel = (id) => PLATE_ICONS.find((i) => i.id === id)?.label ?? null;

// A symbol scaled to `size` and centred on (cx, cy), in the caller's units.
export function placeSymbol(name, cx, cy, size) {
  const k = size / 24;
  const px = (x) => r2(cx + (x - 12) * k);
  const py = (y) => r2(cy + (y - 12) * k);
  return (SYMBOLS[name] || SYMBOLS.switch).map((s) =>
    s.c ? { c: [px(s.c[0]), py(s.c[1]), r2(s.c[2] * k)] } : { closed: !!s.closed, pts: s.pts.map(([x, y]) => [px(x), py(y)]) }
  );
}
