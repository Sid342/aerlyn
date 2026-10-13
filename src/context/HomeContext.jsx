import { createContext, useContext, useEffect, useReducer } from 'react';
import { homeReducer, initialHome, actions } from './homeReducer.js';
import { loadPlan, savePlan } from '../lib/planStorage.js';

const HomeContext = createContext(null);

// start from the plan saved in this browser, if there is one
function restore(initial) {
  const saved = loadPlan();
  return saved ? homeReducer(initial, actions.hydrate(saved)) : initial;
}

export function HomeProvider({ children }) {
  const [home, dispatch] = useReducer(homeReducer, initialHome, restore);
  useEffect(() => savePlan(home), [home]);
  const addCustomScene = (name) =>
    dispatch({ type: 'ADD_CUSTOM_SCENE', payload: { name } });
  const removeCustomScene = (id) =>
    dispatch({ type: 'REMOVE_CUSTOM_SCENE', payload: { id } });
  const renameCustomScene = (id, name) =>
    dispatch({ type: 'RENAME_CUSTOM_SCENE', payload: { id, name } });
  const setSceneDeviceState = (sceneId, deviceId, on) =>
    dispatch({ type: 'SET_SCENE_DEVICE_STATE', payload: { sceneId, deviceId, on } });
  const mergedActions = { ...actions, addCustomScene, removeCustomScene, renameCustomScene, setSceneDeviceState };
  return (
    <HomeContext.Provider
      value={{ home, dispatch, actions: mergedActions, addCustomScene, removeCustomScene, renameCustomScene, setSceneDeviceState }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHome must be used within HomeProvider');
  return ctx;
}
