import { cloneRoom, makeRoom, buildRooms } from '../data/templates.js';

export const initialHome = {
  homeType: null,
  floorPlanImage: null,
  mode: 'build', // 'build' | 'play'
  rooms: [],
};

export const actions = {
  setHomeType: (homeType) => ({ type: 'SET_HOME_TYPE', homeType }),
  addRoom: (name, roomType, size) => ({ type: 'ADD_ROOM', name, roomType, size }),
  removeRoom: (roomId) => ({ type: 'REMOVE_ROOM', roomId }),
  renameRoom: (roomId, name) => ({ type: 'RENAME_ROOM', roomId, name }),
  setRoomSize: (roomId, size) => ({ type: 'SET_ROOM_SIZE', roomId, size }),
  addDevice: (roomId, deviceId) => ({ type: 'ADD_DEVICE', roomId, deviceId }),
  removeDevice: (roomId, deviceId) => ({ type: 'REMOVE_DEVICE', roomId, deviceId }),
  setDeviceQty: (roomId, deviceId, qty) => ({ type: 'SET_DEVICE_QTY', roomId, deviceId, qty }),
  toggleDevice: (roomId, deviceId) => ({ type: 'TOGGLE_DEVICE', roomId, deviceId }),
  setMode: (mode) => ({ type: 'SET_MODE', mode }),
  setFloorPlan: (image) => ({ type: 'SET_FLOOR_PLAN', image }),
  applyScene: (deviceStates) => ({ type: 'APPLY_SCENE', deviceStates }),
  reset: () => ({ type: 'RESET' }),
  duplicateRoom: (roomId) => ({ type: 'DUPLICATE_ROOM', roomId }),
};

// map over rooms, replacing the one matching roomId
function mapRoom(state, roomId, fn) {
  return { ...state, rooms: state.rooms.map((r) => (r.id === roomId ? fn(r) : r)) };
}

export function homeReducer(state, action) {
  switch (action.type) {
    case 'SET_HOME_TYPE':
      return { ...state, homeType: action.homeType, rooms: buildRooms(action.homeType) };

    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, makeRoom(action.name, action.roomType, action.size)] };

    case 'REMOVE_ROOM':
      return { ...state, rooms: state.rooms.filter((r) => r.id !== action.roomId) };

    case 'DUPLICATE_ROOM': {
      const idx = state.rooms.findIndex((r) => r.id === action.roomId);
      if (idx < 0) return state;
      const copy = cloneRoom(state.rooms[idx]);
      // Insert the copy immediately after the original.
      const next = state.rooms.slice();
      next.splice(idx + 1, 0, copy);
      return { ...state, rooms: next };
    }

    case 'RENAME_ROOM':
      return mapRoom(state, action.roomId, (r) => ({ ...r, name: action.name }));

    case 'SET_ROOM_SIZE':
      return mapRoom(state, action.roomId, (r) => ({ ...r, size: action.size }));

    case 'ADD_DEVICE':
      return mapRoom(state, action.roomId, (r) => {
        const existing = r.devices.find((d) => d.deviceId === action.deviceId);
        if (existing) {
          return {
            ...r,
            devices: r.devices.map((d) =>
              d.deviceId === action.deviceId ? { ...d, qty: d.qty + 1 } : d
            ),
          };
        }
        return { ...r, devices: [...r.devices, { deviceId: action.deviceId, qty: 1, on: false }] };
      });

    case 'REMOVE_DEVICE':
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.filter((d) => d.deviceId !== action.deviceId),
      }));

    case 'SET_DEVICE_QTY':
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.map((d) =>
          d.deviceId === action.deviceId ? { ...d, qty: Math.max(1, action.qty | 0) } : d
        ),
      }));

    case 'TOGGLE_DEVICE':
      return mapRoom(state, action.roomId, (r) => ({
        ...r,
        devices: r.devices.map((d) =>
          d.deviceId === action.deviceId ? { ...d, on: !d.on } : d
        ),
      }));

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_FLOOR_PLAN':
      return { ...state, floorPlanImage: action.image };

    case 'APPLY_SCENE': {
      // deviceStates: { [deviceId]: boolean } applied to every room
      // guard: if payload is missing/malformed, degrade to no-op
      const deviceStates = action.deviceStates || {};
      return {
        ...state,
        rooms: state.rooms.map((r) => ({
          ...r,
          devices: r.devices.map((d) =>
            deviceStates[d.deviceId] === undefined
              ? d
              : { ...d, on: deviceStates[d.deviceId] }
          ),
        })),
      };
    }

    case 'RESET':
      return initialHome;

    default:
      return state;
  }
}
