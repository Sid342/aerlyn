import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { homeReducer, initialHome, actions } from './homeReducer.js';
import { loadPlan, savePlan, planOnLoad } from '../lib/planStorage.js';

const HomeContext = createContext(null);
const NOTHING_RESTORED = { notice: null, pendingLink: null };

function dropPlanHash() {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

function showPlanner() {
  document.getElementById('planner')?.scrollIntoView();
}

export function HomeProvider({ children }) {
  // The first render is always the empty planner. The stored plan / plan link is read
  // after mount, so a server-rendered page hydrates without a mismatch.
  const [home, dispatch] = useReducer(homeReducer, initialHome);
  const [restore, setRestore] = useState(null); // null until the first load has run
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice; a second pass would miss the cleared link
    started.current = true;
    const { plan, pendingLink, notice, clearHash } = planOnLoad(window.location.hash, loadPlan());
    if (plan) dispatch(actions.hydrate(plan));
    if (clearHash) {
      dropPlanHash();
      if (plan) showPlanner();
    }
    setRestore({ notice, pendingLink });
    try { localStorage.removeItem('aerlyn_cart'); } catch { /* storage blocked */ } // left over from the removed cart
  }, []);

  // Not before the first load: that would overwrite the stored plan with the empty initial state.
  const loaded = restore !== null;
  useEffect(() => {
    if (loaded) savePlan(home);
  }, [home, loaded]);

  function openLinkedPlan() {
    dispatch(actions.hydrate(restore.pendingLink));
    dropPlanHash();
    setRestore({ notice: 'restored', pendingLink: null });
    showPlanner();
  }
  function dismissRestore() {
    if (restore.pendingLink) dropPlanHash();
    setRestore(NOTHING_RESTORED);
  }

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
      value={{ home, dispatch, actions: mergedActions, restore: restore || NOTHING_RESTORED, openLinkedPlan, dismissRestore, addCustomScene, removeCustomScene, renameCustomScene, setSceneDeviceState }}
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
