import { getDevice, sceneDevicesInHome } from '../data/devices.js';
import { planRoom } from './switchPlanner.js';
import { hasPlate, describePlate } from './plateConfig.js';
import { GOALS, applyGoals, cleanGoals } from './goals.js';

// null until something has been chosen in the plate designer
function platePayload(home) {
  if (!hasPlate(home.plateConfig)) return null;
  const room = home.rooms.find((r) => r.id === home.plateRoomId);
  // readable: { model, material, size, panel, frame, remote, accessories: [{ name, modules: 'Modules 1–5', icons: ['Switch 3: Fan F1'] }] }
  return { room: room ? room.name : null, ...describePlate(home.plateConfig) };
}

// Convert the live Home state into the canonical, B-compatible export payload.
// This is what a lead and the PDF carry: only the devices of the chosen goals.
export function buildExportPayload(plan) {
  const goals = cleanGoals(plan.goals);
  const home = { ...plan, rooms: applyGoals(plan.rooms, goals) };
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    homeType: home.homeType,
    wants: GOALS.filter((g) => goals.includes(g.id)).map((g) => g.label),
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
