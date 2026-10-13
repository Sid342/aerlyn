import jsPDF from 'jspdf';
import { SCENES } from '../data/scenes.js';
import { getDevice, sceneDevicesInHome } from '../data/devices.js';

// Each scene gains `devices: [{ name, on }]` with catalogue names for printing.
// Custom scenes list only devices that are still in the home.
export function buildScenesPdfPayload(customScenes, rooms) {
  return [
    ...SCENES.map((s) => ({
      ...s,
      preset: true,
      devices: Object.entries(s.deviceStates).map(([id, on]) => ({ name: getDevice(id).name, on })),
    })),
    ...customScenes.map((s) => ({
      ...s,
      preset: false,
      devices: sceneDevicesInHome(s, rooms).map(({ name, on }) => ({ name, on })),
    })),
  ];
}

export function downloadScenesPdf(customScenes, rooms) {
  const scenes = buildScenesPdfPayload(customScenes, rooms);
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
    if (scene.devices.length === 0) {
      pdf.text('   — no devices configured', left, y);
      y += 5;
    }
    for (const { name, on } of scene.devices) {
      pdf.text(`   ${name}: ${on ? 'ON' : 'OFF'}`, left, y);
      y += 5;
      if (y > 280) { pdf.addPage(); y = 18; }
    }
    y += 4;
  }

  pdf.save(`aerlyn-scenes-${Date.now()}.pdf`);
}
