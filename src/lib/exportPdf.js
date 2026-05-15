import jsPDF from 'jspdf';
import { buildExportPayload } from './exportJson.js';
import { planRoom } from './switchPlanner.js';

// Render a readable room-by-room summary PDF and trigger a download.
export function downloadPdf(home) {
  const payload = buildExportPayload(home);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 14;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Aerlyn — Home Device Plan', left, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Home type: ${payload.homeType}`, left, y);
  y += 5;
  pdf.text(`Generated: ${new Date(payload.exportedAt).toLocaleString()}`, left, y);
  y += 8;

  for (let i = 0; i < payload.rooms.length; i++) {
    const room = payload.rooms[i];
    const rawRoom = home.rooms[i];
    if (y > 270) {
      pdf.addPage();
      y = 18;
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${room.name}  (${room.roomType}, size ${room.size})`, left, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    // Switch plan summary
    const sp = planRoom(rawRoom);
    if (sp.total > 0) {
      const breakdown = `   Switch plan: ${sp.gang} gangs · ${sp.fan} fan · ${sp.curtain} curtain · ${sp.socket} sockets = ${sp.total} modules`;
      pdf.text(breakdown, left, y);
      y += 5;
      const plateParts = Object.entries(
        sp.plates.reduce((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {})
      )
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([size, count]) => `${count}× ${size}-mod`)
        .join(' + ');
      const spareStr = sp.spareModules > 0 ? ` (spare: ${sp.spareModules})` : '';
      pdf.text(`   Plates: ${plateParts}${spareStr}`, left, y);
      y += 5;
      if (y > 285) {
        pdf.addPage();
        y = 18;
      }
    }

    if (room.devices.length === 0) {
      pdf.text('   — no devices', left, y);
      y += 5;
    }
    for (const d of room.devices) {
      pdf.text(`   ${d.qty} × ${d.name}  (${d.category})`, left, y);
      y += 5;
      if (y > 285) {
        pdf.addPage();
        y = 18;
      }
    }
    y += 3;
  }

  pdf.save(`aerlyn-${payload.homeType || 'home'}-${Date.now()}.pdf`);
}
