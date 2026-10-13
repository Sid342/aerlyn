import { describe, it, expect } from 'vitest';
import { planLink, whatsappShareUrl, planLeadFields, visitLeadFields } from '../planShare.js';
import { decodePlan } from '../planStorage.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

const home = homeReducer(initialHome, actions.setHomeType('2BHK'));
const contact = { name: 'Asha', phone: '9876543210', city: 'Hisar', _gotcha: '' };
const link = planLink('https://aerlyn.in', home);

describe('planLink', () => {
  it('is origin + /#plan= + a plan that decodes back', () => {
    expect(link.startsWith('https://aerlyn.in/#plan=')).toBe(true);
    const plan = decodePlan(link.split('#plan=')[1]);
    expect(plan.homeType).toBe('2BHK');
    expect(plan.rooms).toHaveLength(home.rooms.length);
  });
});

describe('whatsappShareUrl', () => {
  it('has no phone number and carries the link in the message', () => {
    const url = new URL(whatsappShareUrl(link));
    expect(url.origin + url.pathname).toBe('https://wa.me/');
    expect(url.searchParams.get('text')).toContain(link);
  });
});

describe('planLeadFields', () => {
  it('carries the contact, the link and the full plan', () => {
    const f = planLeadFields(home, contact, link);
    expect(f).toMatchObject({ customerName: 'Asha', customerPhone: '9876543210', customerCity: 'Hisar', planLink: link, _gotcha: '' });
    expect(f._subject).toBe('Aerlyn plan — 2BHK — Asha (9876543210)');
    const plan = JSON.parse(f.plan);
    expect(plan.homeType).toBe('2BHK');
    expect(plan.rooms).toHaveLength(home.rooms.length);
  });

  it('passes the honeypot through so submitLead can drop bots', () => {
    expect(planLeadFields(home, { ...contact, _gotcha: 'bot' }, link)._gotcha).toBe('bot');
  });

  it('strips scene entries for devices no longer in the home', () => {
    let h = homeReducer(home, { type: 'ADD_CUSTOM_SCENE', payload: { name: 'Away' } });
    const sceneId = h.customScenes[0].id;
    for (const deviceId of ['door-lock', 'cct-light']) {
      h = homeReducer(h, { type: 'SET_SCENE_DEVICE_STATE', payload: { sceneId, deviceId, on: true } });
    }
    for (const r of h.rooms) h = homeReducer(h, actions.removeDevice(r.id, 'door-lock'));
    const scenes = JSON.parse(planLeadFields(h, contact, link).plan).customScenes;
    expect(scenes[0].devices.map((d) => d.deviceId)).toEqual(['cct-light']);
  });
});

describe('visitLeadFields', () => {
  it('reuses the saved name and phone', () => {
    expect(visitLeadFields(contact, link)).toEqual({
      _subject: 'New Home Visit Request — Asha (9876543210)',
      Name: 'Asha',
      Phone: '9876543210',
      City: 'Hisar',
      Notes: `Requested after saving a plan: ${link}`,
      _gotcha: '',
    });
  });
});
