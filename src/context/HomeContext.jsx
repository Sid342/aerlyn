import { createContext, useContext, useReducer } from 'react';
import { homeReducer, initialHome, actions } from './homeReducer.js';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [home, dispatch] = useReducer(homeReducer, initialHome);
  const setFloorPlan = (img) => dispatch({ type: 'SET_FLOOR_PLAN', img });
  const addCustomScene = (roomId, name) =>
    dispatch({ type: 'ADD_CUSTOM_SCENE', payload: { roomId, name } });
  const removeCustomScene = (id) =>
    dispatch({ type: 'REMOVE_CUSTOM_SCENE', payload: { id } });
  const renameCustomScene = (id, name) =>
    dispatch({ type: 'RENAME_CUSTOM_SCENE', payload: { id, name } });
  const setSceneDeviceState = (sceneId, deviceId, on) =>
    dispatch({ type: 'SET_SCENE_DEVICE_STATE', payload: { sceneId, deviceId, on } });
  const setPlateConfig = (roomId, config) =>
    dispatch({ type: 'SET_PLATE_CONFIG', roomId, config });
  const mergedActions = {
    ...actions,
    setFloorPlan,
    addCustomScene,
    removeCustomScene,
    renameCustomScene,
    setSceneDeviceState,
    setPlateConfig,
  };
  return (
    <HomeContext.Provider value={{ home, dispatch, actions: mergedActions }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHome must be used within HomeProvider');
  return ctx;
}
