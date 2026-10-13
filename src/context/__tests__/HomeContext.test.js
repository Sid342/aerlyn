import { describe, it, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { HomeProvider, useHome } from '../HomeContext.jsx';
import { savePlan } from '../../lib/planStorage.js';
import { homeReducer, initialHome, actions } from '../homeReducer.js';

function Probe() {
  const { home, restore } = useHome();
  return createElement('p', null, `type:${home.homeType} rooms:${home.rooms.length} notice:${restore.notice}`);
}

describe('HomeProvider first render', () => {
  afterEach(() => { delete globalThis.localStorage; });

  // Effects do not run in renderToString, so this is exactly the server render and the first client render.
  it('is the empty planner and does not touch browser storage, even when a plan is stored', () => {
    const store = {};
    const calls = [];
    globalThis.localStorage = {
      getItem: (k) => { calls.push(`get ${k}`); return k in store ? store[k] : null; },
      setItem: (k, v) => { calls.push(`set ${k}`); store[k] = String(v); },
    };
    savePlan(homeReducer(initialHome, actions.setHomeType('3BHK')));
    const stored = { ...store };
    calls.length = 0;

    const html = renderToString(createElement(HomeProvider, null, createElement(Probe)));

    expect(html).toContain('type:null rooms:0 notice:null');
    expect(calls).toEqual([]);
    expect(store).toEqual(stored);
  });
});
