import { describe, it, expect } from 'vitest';
import { wrapTarget } from '../useDialog.js';
import { succeeded } from '../useDownload.js';

describe('wrapTarget', () => {
  const [a, b, c] = ['a', 'b', 'c'];
  const items = [a, b, c];

  it('wraps from the last item to the first, and back', () => {
    expect(wrapTarget(items, c, false)).toBe(a);
    expect(wrapTarget(items, a, true)).toBe(c);
  });

  it('leaves Tab alone in the middle', () => {
    expect(wrapTarget(items, b, false)).toBeNull();
    expect(wrapTarget(items, b, true)).toBeNull();
    expect(wrapTarget(items, a, false)).toBeNull();
    expect(wrapTarget(items, c, true)).toBeNull();
  });

  it('pulls focus back in when it is outside the dialog', () => {
    expect(wrapTarget(items, 'elsewhere', false)).toBe(a);
    expect(wrapTarget(items, 'elsewhere', true)).toBe(c);
  });

  it('has nowhere to go in an empty dialog', () => {
    expect(wrapTarget([], a, false)).toBeNull();
  });
});

describe('succeeded', () => {
  it('is true when the download runs', async () => {
    expect(await succeeded(async () => {})).toBe(true);
  });

  it('is false when it rejects or throws, e.g. the PDF chunk cannot load offline', async () => {
    expect(await succeeded(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')))).toBe(false);
    expect(await succeeded(() => { throw new Error('boom'); })).toBe(false);
  });
});
