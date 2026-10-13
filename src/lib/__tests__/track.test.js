import { describe, it, expect, afterEach } from 'vitest';
import { track } from '../track.js';

afterEach(() => { delete globalThis.window; });

describe('track', () => {
  it('sends a named event with its props to Vercel Analytics', () => {
    const calls = [];
    globalThis.window = { va: (...args) => calls.push(args) };
    track('plan_saved', { homeType: '2BHK' });
    expect(calls).toEqual([['event', { name: 'plan_saved', data: { homeType: '2BHK' } }]]);
  });

  it('does nothing without the analytics script or without a window', () => {
    expect(() => track('plan_started')).not.toThrow();
    globalThis.window = {};
    expect(() => track('plan_started')).not.toThrow();
  });
});
