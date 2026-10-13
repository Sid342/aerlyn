import { describe, it, expect } from 'vitest';
import { site } from '../../config/site.js';
import {
  policyDoc, returnWindowText, returnShippingText, refundTimeText, shippingFeeText,
  serviceAreaText, dispatchText, installationWarrantyText, productWarrantyText,
} from '../policies.js';

const withPolicy = (policy) => ({ ...site, policy: { ...site.policy, ...policy } });
const UNKNOWN = withPolicy({
  dispatchText: null, returnWindowDays: null, returnShippingPaidBy: null, refundDays: null,
  shippingFee: null, serviceableLocations: null, installationWarranty: null,
});
const HELPERS = [returnWindowText, returnShippingText, refundTimeText, shippingFeeText, serviceAreaText, dispatchText, installationWarrantyText];
const text = (doc) => doc.sections.flatMap((s) => [...s.paragraphs, ...(s.list || [])]).join('\n');

describe('policy sentences', () => {
  it('say the detail is confirmed before the order, with the contact email, while unknown', () => {
    for (const helper of HELPERS) {
      const sentence = helper(UNKNOWN);
      expect(sentence).toContain('confirmed with you before your order is finalised');
      expect(sentence).toContain(site.email);
      expect(sentence.replace(site.email, '')).not.toMatch(/null|undefined|\d/);
    }
  });

  it('state the configured value once it is set', () => {
    expect(returnWindowText(withPolicy({ returnWindowDays: 7 }))).toBe('You can ask to return a product within 7 days of delivery.');
    expect(returnWindowText(withPolicy({ returnWindowDays: 1 }))).toContain('within 1 day of');
    expect(returnShippingText(withPolicy({ returnShippingPaidBy: 'customer' }))).toContain('paid by you');
    expect(returnShippingText(withPolicy({ returnShippingPaidBy: 'seller' }))).toContain('paid by us');
    expect(refundTimeText(withPolicy({ refundDays: 5 }))).toContain('within 5 working days');
    expect(shippingFeeText(withPolicy({ shippingFee: 0 }))).toBe('Delivery is free.');
    expect(shippingFeeText(withPolicy({ shippingFee: 80 }))).toContain('₹80');
    expect(serviceAreaText(withPolicy({ serviceableLocations: 'all of Haryana' }))).toBe('We deliver to all of Haryana.');
    expect(dispatchText(withPolicy({ dispatchText: 'Ships in 2–3 days' }))).toContain('“Ships in 2–3 days”');
    expect(installationWarrantyText(withPolicy({ installationWarranty: 'a 1-year workmanship warranty' }))).toBe('Installation work is covered by a 1-year workmanship warranty.');
  });

  it('drop the email when none is configured', () => {
    expect(returnWindowText({ ...UNKNOWN, email: null })).toContain('contact us if you would like');
  });

  it('take the product warranty from the product specs', () => {
    expect(productWarrantyText()).toContain('Aerlyn Retrofit 1-Switch carries a 1 year warranty.');
    expect(productWarrantyText({ ...site, products: site.products.map((p) => ({ ...p, specs: [] })) })).toBeNull();
  });
});

describe('policyDoc', () => {
  it.each(['terms', 'refund', 'shipping'])('%s renders complete text for unknown and known config', (key) => {
    const known = withPolicy({ returnWindowDays: 7, returnShippingPaidBy: 'seller', refundDays: 5, shippingFee: 0, serviceableLocations: 'all of India', installationWarranty: 'a 1-year warranty' });
    for (const s of [site, UNKNOWN, known]) {
      const doc = policyDoc(key, s);
      expect(doc.title).toBeTruthy();
      expect(doc.updated).toBe('13 October 2026');
      expect(doc.sections.length).toBeGreaterThan(2);
      for (const section of doc.sections) expect(section.paragraphs.length).toBeGreaterThan(0);
      expect(text(doc)).not.toMatch(/null|undefined|NaN/);
      expect(text(doc).toLowerCase()).not.toContain('draft');
    }
  });

  it('names the seller, lists products with config prices and adds GSTIN only when set', () => {
    const body = text(policyDoc('terms'));
    expect(body).toContain(site.legalName);
    expect(body).toContain(site.address);
    expect(body).toContain('Aerlyn Retrofit 1-Switch — ₹2,300');
    expect(body).toContain('No payment is taken on this website');
    expect(body).toContain('governed by the laws of India');
    expect(body).not.toContain('GSTIN');
    expect(text(policyDoc('terms', { ...site, gstin: '06ABCDE1234F1Z5' }))).toContain('GSTIN: 06ABCDE1234F1Z5.');
  });

  it('uses the configured commitments in the refund and shipping pages', () => {
    expect(text(policyDoc('refund'))).toContain('The return window is confirmed with you');
    expect(text(policyDoc('refund', withPolicy({ returnWindowDays: 10 })))).toContain('within 10 days of delivery');
    expect(text(policyDoc('refund', withPolicy({ returnWindowDays: 10 })))).not.toContain('The return window is confirmed');
    expect(text(policyDoc('shipping', withPolicy({ shippingFee: 0 })))).toContain('Delivery is free.');
    expect(text(policyDoc('shipping'))).toContain(site.policy.dispatchText);
  });
});
