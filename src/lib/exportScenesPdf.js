import jsPDF from 'jspdf';
import { SCENES } from '../data/scenes.js';

export function buildScenesPdfPayload(customScenes) {
  return [
    ...SCENES.map((s) => ({ ...s, preset: true })),
    ...customScenes.map((s) => ({ ...s, preset: false })),
  ];
}

export function downloadScenesPdf(customScenes) {
  const scenes = buildScenesPdfPayload(customScenes);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const left = 14;
  let y = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Aerlyn — Scenes & Automations', left, y);
  y += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y);
  y += 10;

  for (const scene of scenes) {
    if (y > 260) { pdf.addPage(); y = 18; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    const label = scene.preset ? ` ${scene.name}  (preset)` : ` ${scene.name}  (custom)`;
    pdf.text(label, left, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const entries = Object.entries(scene.deviceStates);
    if (entries.length === 0) {
      pdf.text('   — no devices configured', left, y);
      y += 5;
    }
    for (const [deviceId, on] of entries) {
      pdf.text(`   ${deviceId}: ${on ? 'ON' : 'OFF'}`, left, y);
      y += 5;
      if (y > 280) { pdf.addPage(); y = 18; }
    }
    y += 4;
  }

  pdf.save(`aerlyn-scenes-${Date.now()}.pdf`);
}
