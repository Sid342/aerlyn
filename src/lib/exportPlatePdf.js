import { site } from '../config/site.js';
import { placeSymbol } from '../data/plateIcons.js';
import { plateLayout, plateDetails, hexRgb } from './plateLayout.js';

// jsPDF's built-in Helvetica can only encode WinAnsi (cp1252). Anything else — emoji, Devanagari —
// prints as garbage and breaks the spacing of its whole line, so it is removed.
const NOT_WIN_ANSI = /[^\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g;
export const pdfSafe = (value) => String(value ?? '').replace(NOT_WIN_ANSI, '').replace(/\s+/g, ' ').trim();

// Every string the PDF prints. `roomName` is the room the designer was opened from, if any.
export function buildPlatePdfPayload(config, roomName = null, now = new Date()) {
  const choice = (v) => pdfSafe(v) || '—';
  return {
    title: 'Aerlyn — Switch plate design',
    room: pdfSafe(roomName) || null,
    date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    specs: [
      ['Plate size', choice(config.model)],
      ['Colour', choice(config.material)],
      ['Profile', choice(config.size)],
      ['Finish', choice(config.panel)],
      ['Frame', choice(config.frame)],
    ],
    accessories: plateDetails(config).map((a) => ({
      name: choice(a.name),
      modules: a.modules,
      icons: a.icons.join(', ') || '—',
    })),
    footer: `${site.origin.replace(/^https?:\/\//, '')} · Illustration only, not to scale.`,
  };
}

const LEFT = 16;
const WIDTH = 178; // A4 minus margins
const BOTTOM = 272;
const INK = [28, 28, 34];
const GREY = [110, 110, 122];
const RULE = [214, 214, 222];

function drawShapes(pdf, shapes, at) {
  for (const s of shapes) {
    if (s.c) {
      pdf.circle(at.x(s.c[0]), at.y(s.c[1]), s.c[2] * at.k, 'S');
    } else {
      const deltas = s.pts.slice(1).map((p, i) => [(p[0] - s.pts[i][0]) * at.k, (p[1] - s.pts[i][1]) * at.k]);
      pdf.lines(deltas, at.x(s.pts[0][0]), at.y(s.pts[0][1]), [1, 1], 'S', !!s.closed);
    }
  }
}

// Draws the plate centred in the page width, top at `top`. Returns the y below it.
function drawPlate(pdf, layout, top) {
  const k = Math.min(2.4, (WIDTH - 20) / layout.w, 72 / layout.h); // mm per plate unit
  const at = { k, x: (u) => LEFT + (WIDTH - layout.w * k) / 2 + u * k, y: (u) => top + 8 + u * k };
  const rect = (r, radius, style) => pdf.roundedRect(at.x(r.x), at.y(r.y), r.w * k, r.h * k, radius * k, radius * k, style);
  const line = hexRgb(layout.line);

  pdf.setFillColor(240, 240, 244);
  pdf.roundedRect(LEFT, top, WIDTH, layout.h * k + 16, 3, 3, 'F');

  pdf.setLineJoin('round');
  pdf.setLineCap('round');
  pdf.setFillColor(...hexRgb(layout.fill));
  pdf.setDrawColor(...line);
  pdf.setLineWidth((layout.bezel ? 0.5 : 0.2) * k);
  rect({ x: 0, y: 0, w: layout.w, h: layout.h }, layout.radius, 'FD');
  pdf.setLineWidth(0.25 * k);
  if (layout.bezel) rect({ x: 1.3, y: 1.3, w: layout.w - 2.6, h: layout.h - 2.6 }, Math.max(0, layout.radius - 1.1), 'S');

  pdf.setLineDashPattern([1.2 * k, 1.2 * k], 0);
  for (const m of layout.empty) rect({ x: m.x + 1, y: m.y + 1, w: m.w - 2, h: m.h - 2 }, 1, 'S');
  pdf.setLineDashPattern([], 0);

  for (const c of layout.controls) {
    pdf.setFillColor(...hexRgb(layout.button));
    pdf.setDrawColor(...line);
    pdf.setLineWidth(0.3 * k);
    rect(c.button, c.button.r, 'FD');
    pdf.setDrawColor(...hexRgb(layout.ink));
    pdf.setLineWidth(c.symbol.stroke * k);
    drawShapes(pdf, placeSymbol(c.symbol.name, c.symbol.cx, c.symbol.cy, c.symbol.size), at);
  }
  return top + layout.h * k + 16;
}

function heading(pdf, text, y) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...INK);
  pdf.text(text, LEFT, y);
  return y + 3;
}

// Rows of wrapped cells with a rule under each. `bold` is the index of the emphasised column.
function table(pdf, y, widths, rows, { head = false, bold = -1 } = {}) {
  pdf.setFontSize(10);
  pdf.setDrawColor(...RULE);
  pdf.setLineWidth(0.2);
  rows.forEach((row, r) => {
    const isHead = head && r === 0;
    const cells = row.map((text, i) => {
      pdf.setFont('helvetica', isHead || i === bold ? 'bold' : 'normal');
      return pdf.splitTextToSize(text, widths[i] - 4);
    });
    const height = Math.max(...cells.map((c) => c.length)) * 4.6 + 3.4;
    if (y + height > BOTTOM) {
      pdf.addPage();
      y = 20;
    }
    let x = LEFT;
    cells.forEach((lines, i) => {
      pdf.setFont('helvetica', isHead || i === bold ? 'bold' : 'normal');
      pdf.setTextColor(...(isHead || (bold >= 0 && i !== bold) ? GREY : INK));
      pdf.text(lines, x + 1, y + 5);
      x += widths[i];
    });
    y += height;
    pdf.line(LEFT, y, LEFT + WIDTH, y);
  });
  return y;
}

// Draws the whole document into a jsPDF instance.
export function drawPlatePdf(pdf, config, roomName = null, now = new Date()) {
  const p = buildPlatePdfPayload(config, roomName, now);
  const layout = plateLayout(config);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(...INK);
  pdf.text(p.title, LEFT, 24);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...GREY);
  pdf.text(pdf.splitTextToSize([p.room && `Room: ${p.room}`, p.date].filter(Boolean).join('   ·   '), WIDTH), LEFT, 31);

  let y = 38;
  if (layout) y = drawPlate(pdf, layout, y) + 12;

  y = heading(pdf, 'Specification', y);
  y = table(pdf, y, [50, WIDTH - 50], p.specs, { bold: 1 }) + 12;

  y = heading(pdf, 'Accessories', y);
  if (p.accessories.length) {
    // non-breaking spaces keep "Switch 9: Lock" on one line when the cell wraps
    const whole = (icons) => icons.split(', ').map((label) => label.replace(/ /g, '\u00A0')).join(', ');
    const rows = [['Accessory', 'Modules', 'Button icons'], ...p.accessories.map((a) => [a.name, a.modules, whole(a.icons)])];
    table(pdf, y, [62, 34, WIDTH - 96], rows, { head: true });
  } else {
    table(pdf, y, [WIDTH], [['No accessories placed.']]);
  }

  for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...GREY);
    pdf.text(p.footer, LEFT, 286);
  }
  return pdf;
}

// jsPDF is large, so it loads only when a PDF is actually asked for.
export async function downloadPlatePdf(config, roomName = null) {
  const { jsPDF } = await import('jspdf');
  const pdf = drawPlatePdf(new jsPDF('p', 'mm', 'a4'), config, roomName);
  const slug = (config.model || 'plate').replace(/\s+/g, '-').toLowerCase();
  pdf.save(`aerlyn-plate-${slug}-${Date.now()}.pdf`);
}
