import { describe, it, expect, afterEach } from 'vitest';
import { submitLead } from '../submitLead.js';
import { site } from '../../config/site.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function mockFetch(impl) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return impl();
  };
  return calls;
}

describe('submitLead', () => {
  it('returns ok on a 2xx response and posts JSON to the form for that kind', async () => {
    const calls = mockFetch(() => ({ ok: true, status: 200 }));
    const res = await submitLead('visit', { name: 'Asha', phone: '9876543210' });
    expect(res).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(`https://formspree.io/f/${site.formspree.visit}`);
    expect(calls[0].init.method).toBe('POST');
    expect(JSON.parse(calls[0].init.body)).toEqual({ name: 'Asha', phone: '9876543210' });
  });

  it('returns not ok on a 4xx response', async () => {
    mockFetch(() => ({ ok: false, status: 422 }));
    expect(await submitLead('plan', { name: 'Asha' })).toEqual({ ok: false });
  });

  it('returns not ok on a network error instead of throwing', async () => {
    mockFetch(() => { throw new TypeError('Failed to fetch'); });
    expect(await submitLead('visit', { name: 'Asha' })).toEqual({ ok: false });
  });

  it('pretends success without sending when the honeypot is filled', async () => {
    const calls = mockFetch(() => ({ ok: true, status: 200 }));
    expect(await submitLead('visit', { name: 'bot', _gotcha: 'http://spam' })).toEqual({ ok: true });
    expect(calls).toHaveLength(0);
  });

  it('never sends the honeypot field', async () => {
    const calls = mockFetch(() => ({ ok: true, status: 200 }));
    await submitLead('visit', { name: 'Asha', _gotcha: '' });
    expect('_gotcha' in JSON.parse(calls[0].init.body)).toBe(false);
  });
});
