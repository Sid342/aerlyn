import { site } from '../config/site.js';
import { describePlate } from './plateConfig.js';

// jsPDF's built-in Helvetica can only encode WinAnsi (cp1252). Anything else — emoji, Devanagari —
// prints as garbage and breaks the spacing of its whole line, so it is removed.
const NOT_WIN_ANSI = /[^\x20-\x7E\xA0-\xFF€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g;
export const pdfSafe = (value) => String(value ?? '').replace(NOT_WIN_ANSI, '').replace(/\s+/g, ' ').trim();

// Every string the PDF prints. `roomName` is the room the designer was opened from, if any.
export function buildPlatePdfPayload(config, roomName = null, now = new Date()) {
  const choice = (v) => pdfSafe(v) || '—';
  const d = describePlate(config);
  return {
    title: 'Aerlyn — Switch plate design',
    room: pdfSafe(roomName) || null,
    date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    specs: [
      ['Model', choice(d.model)],
      ['Material', choice(d.material)],
      ['Size', choice(d.size)],
      ['Panel colour', choice(d.panel)],
      ...(d.frame ? [['Frame colour', choice(d.frame)]] : []),
      ['Remote', d.remote],
    ],
    accessories: d.accessories.map((a) => ({
      name: choice(a.name),
      modules: pdfSafe(a.modules),
      icons: a.icons.map(pdfSafe).join(', ') || '—',
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
export const BACKDROP = [240, 240, 244];

// Places the picture of the plate (see capturePlate) centred in the page width, top at `top`. Returns the y below it.
function drawPlate(pdf, image, top) {
  const k = Math.min((WIDTH - 12) / image.width, 84 / image.height); // mm per image pixel
  const w = image.width * k;
  const h = image.height * k;
  pdf.setFillColor(...BACKDROP);
  pdf.roundedRect(LEFT, top, WIDTH, h + 12, 3, 3, 'F');
  // 'FAST' deflates the pixels; left raw, a plate is close to 10 MB
  pdf.addImage(image.dataUrl, 'PNG', LEFT + (WIDTH - w) / 2, top + 6, w, h, undefined, 'FAST');
  return top + h + 12;
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

// Draws the whole document into a jsPDF instance. `image` is { dataUrl, width, height } or null.
export function drawPlatePdf(pdf, config, roomName = null, image = null, now = new Date()) {
  const p = buildPlatePdfPayload(config, roomName, now);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(...INK);
  pdf.text(p.title, LEFT, 24);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...GREY);
  pdf.text(pdf.splitTextToSize([p.room && `Room: ${p.room}`, p.date].filter(Boolean).join('   ·   '), WIDTH), LEFT, 31);

  let y = 38;
  if (image) y = drawPlate(pdf, image, y) + 12;

  y = heading(pdf, 'Specification', y);
  y = table(pdf, y, [50, WIDTH - 50], p.specs, { bold: 1 }) + 12;

  y = heading(pdf, 'Accessories', y);
  if (p.accessories.length) {
    // non-breaking spaces keep "Switch 9: Fan F1" on one line when the cell wraps
    const whole = (icons) => icons.split(', ').map((label) => label.replace(/ /g, '\u00A0')).join(', ');
    const rows = [['Accessory', 'Modules', 'Switch icons'], ...p.accessories.map((a) => [a.name, a.modules, whole(a.icons)])];
    table(pdf, y, [62, 34, WIDTH - 96], rows, { head: true });
  } else {
    table(pdf, y, [WIDTH], [['No accessory chosen.']]);
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

// html2canvas ignores object-fit and CSS filters, so every image on the plate (icons, logo) is redrawn
// here first: fitted into a square, and inked dark where the plate shows it dark (light panels).
function fitted(img, dark) {
  const size = 384;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const k = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const w = img.naturalWidth * k;
  const h = img.naturalHeight * k;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  if (dark) {
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = `rgb(${INK.join(',')})`;
    ctx.fillRect(0, 0, size, size);
  }
  return canvas.toDataURL('image/png');
}

// Rasterises the plate element as it is on screen, at full size and without its shadow.
// html2canvas is large (and jsPDF bundles it anyway), so it loads only when a download is asked for.
export async function capturePlate(element) {
  const { default: html2canvas } = await import('html2canvas');
  const dark = !!element.closest('.tpd-light');
  const images = [...element.querySelectorAll('img')];
  await Promise.all(images.map((img) => img.decode().catch(() => {})));
  const redrawn = images.map((img) => (img.naturalWidth ? fitted(img, dark && img.classList.contains('tpd-icon')) : null));
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: `rgb(${BACKDROP.join(',')})`,
    logging: false,
    onclone: (_doc, clone) => {
      clone.style.transform = 'none';
      clone.style.boxShadow = 'none';
      clone.querySelectorAll('img').forEach((img, i) => {
        if (redrawn[i]) img.src = redrawn[i];
        img.style.filter = 'none';
      });
    },
  });
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
}

const fileName = (config, ext) => `aerlyn-plate-${config.size || 'design'}-module-${Date.now()}.${ext}`;

export async function downloadPlatePdf(config, roomName, element) {
  const [{ jsPDF }, image] = await Promise.all([import('jspdf'), capturePlate(element)]);
  drawPlatePdf(new jsPDF('p', 'mm', 'a4'), config, roomName, image).save(fileName(config, 'pdf'));
}

export async function downloadPlateImage(config, element) {
  const { dataUrl } = await capturePlate(element);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName(config, 'png');
  link.click();
}
