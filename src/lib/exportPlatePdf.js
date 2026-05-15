import jsPDF from 'jspdf';

export function buildPlatePdfPayload(config) {
  return {
    model: config.model,
    material: config.material,
    size: config.size,
    panel: config.panel,
    frame: config.frame,
    accessories: (config.accessories || []).map((a) => ({
      name: a.name,
      slots: a.slots,
      icon: config.icons[a.id] || null,
    })),
    exportedAt: new Date().toISOString(),
  };
}

export function downloadPlatePdf(config) {
  const p = buildPlatePdfPayload(config);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 14;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Aerlyn — Touch Plate Configuration', left, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date(p.exportedAt).toLocaleString()}`, left, y);
  y += 10;

  const specs = [
    ['Plate Model', p.model || '—'],
    ['Material', p.material || '—'],
    ['Size / Profile', p.size || '—'],
    ['Panel Finish', p.panel || '—'],
    ['Frame Style', p.frame || '—'],
  ];

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Specifications', left, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  for (const [label, value] of specs) {
    pdf.text(`${label}: ${value}`, left, y);
    y += 5;
  }
  y += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Accessories', left, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  if (p.accessories.length === 0) {
    pdf.text('   — none', left, y);
    y += 5;
  }
  for (const acc of p.accessories) {
    const iconStr = acc.icon ? ` ${acc.icon}` : '';
    pdf.text(`   ${acc.name}${iconStr}  (slots ${(acc.slots || []).join(', ')})`, left, y);
    y += 5;
  }

  const slug = (p.model || 'plate').replace(/\s+/g, '-').toLowerCase();
  pdf.save(`aerlyn-plate-${slug}-${Date.now()}.pdf`);
}
