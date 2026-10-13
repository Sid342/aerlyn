import { getDevice, sceneDevicesInHome } from '../data/devices.js';
import { planRoom } from './switchPlanner.js';

// null until a plate model has been chosen in the designer
function platePayload(home) {
  const c = home.plateConfig;
  if (!c || !c.model) return null;
  const room = home.rooms.find((r) => r.id === home.plateRoomId);
  return {
    room: room ? room.name : null,
    model: c.model,
    material: c.material,
    size: c.size,
    panel: c.panel,
    frame: c.frame,
    accessories: c.accessories.map((a) => ({ name: a.name, slots: a.slots, icon: c.icons[a.id] || null })),
  };
}

// Convert the live Home state into the canonical, B-compatible export payload.
// This is what a lead carries — the floor plan image is deliberately not part of it.
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
    customScenes: (home.customScenes || []).map((scene) => ({
      name: scene.name,
      devices: sceneDevicesInHome(scene, home.rooms),
    })),
    plate: platePayload(home),
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
