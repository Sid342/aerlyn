import { getDevice } from '../data/devices.js';
import { planRoom } from './switchPlanner.js';

// Convert the live Home state into the canonical, B-compatible export payload.
export function buildExportPayload(home) {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    homeType: home.homeType,
    rooms: home.rooms.map((room) => {
      const { gang, fan, curtain, socket, total, plates, spareModules } = planRoom(room);
      return {
        name: room.name,
        roomType: room.roomType,
        size: room.size,
        devices: room.devices.map((d) => {
          const meta = getDevice(d.deviceId);
          return {
            deviceId: d.deviceId,
            name: meta ? meta.name : d.deviceId,
            category: meta ? meta.category : 'Unknown',
            qty: d.qty,
          };
        }),
        switchPlan: { gang, fan, curtain, socket, total, plates, spareModules },
      };
    }),
  };
}

// Trigger a browser download of the payload as a .json file.
export function downloadJson(home) {
  const payload = buildExportPayload(home);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aerlyn-${home.homeType || 'home'}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
