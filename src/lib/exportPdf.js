import jsPDF from 'jspdf';
import { buildExportPayload } from './exportJson.js';

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

  for (const room of payload.rooms) {
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
