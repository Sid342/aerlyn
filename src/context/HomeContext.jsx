import { createContext, useContext, useReducer } from 'react';
import { homeReducer, initialHome, actions } from './homeReducer.js';

const HomeContext = createContext(null);

export function HomeProvider({ children }) {
  const [home, dispatch] = useReducer(homeReducer, initialHome);
  return (
    <HomeContext.Provider value={{ home, dispatch, actions }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error('useHome must be used within HomeProvider');
  return ctx;
}
