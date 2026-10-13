import { describe, it, expect } from 'vitest';
import { planLink, whatsappShareUrl, planLeadFields, visitLeadFields } from '../planShare.js';
import { decodePlan } from '../planStorage.js';
import { homeReducer, initialHome, actions } from '../../context/homeReducer.js';

const home = homeReducer(initialHome, actions.setHomeType('2BHK'));
const contact = { name: 'Asha', phone: '9876543210', city: 'Hisar', notes: 'Call after 6', _gotcha: '' };
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
  it('carries the contact, the link and the full plan with quantities and the switch plan', () => {
    const f = planLeadFields(home, contact, link);
    expect(f).toMatchObject({ customerName: 'Asha', customerPhone: '9876543210', customerCity: 'Hisar', customerNotes: 'Call after 6', planLink: link, _gotcha: '' });
    expect(f._subject).toBe('Appointment request with 2BHK plan — Asha (9876543210)');
    const plan = JSON.parse(f.plan);
    expect(plan.homeType).toBe('2BHK');
    expect(plan.rooms).toHaveLength(home.rooms.length);
    const living = plan.rooms[0];
    expect(living.devices.find((d) => d.deviceId === 'cob-downlight').qty).toBe(6);
    expect(living.switchPlan.total).toBeGreaterThan(0);
    expect(living.switchPlan.plates.length).toBeGreaterThan(0);
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
  it('is name and phone, with city and notes as given: no property type, no timeline', () => {
    expect(visitLeadFields(contact)).toEqual({
      _subject: 'Appointment request — Asha (9876543210)',
      Name: 'Asha',
      Phone: '9876543210',
      Product: undefined,
      City: 'Hisar',
      Notes: 'Call after 6',
      _gotcha: '',
    });
    expect(Object.keys(JSON.parse(JSON.stringify(visitLeadFields({ ...contact, city: '', notes: '' }))))).toEqual(['_subject', 'Name', 'Phone', 'City', 'Notes', '_gotcha']);
  });

  it('names the product when the form was opened on a product page', () => {
    const f = visitLeadFields(contact, 'Aerlyn Retrofit 1-Switch');
    expect(f.Product).toBe('Aerlyn Retrofit 1-Switch');
    expect(f._subject).toBe('Appointment request — Asha (9876543210) — Aerlyn Retrofit 1-Switch');
  });
});
