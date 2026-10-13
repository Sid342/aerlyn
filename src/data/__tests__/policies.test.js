import { describe, it, expect } from 'vitest';
import { site } from '../../config/site.js';
import { policyDoc, productWarrantyText } from '../policies.js';

const text = (doc) => doc.sections.flatMap((s) => s.paragraphs).join('\n');

describe('productWarrantyText', () => {
  it('takes the product warranty from the product specs', () => {
    expect(productWarrantyText()).toContain('Aerlyn Retrofit 1-Switch carries a 1 year warranty.');
    expect(productWarrantyText({ ...site, products: site.products.map((p) => ({ ...p, specs: [] })) })).toBeNull();
  });
});

describe('terms', () => {
  it('renders complete text', () => {
    const doc = policyDoc('terms');
    expect(doc.title).toBe('Terms and Conditions');
    expect(doc.updated).toBe('13 October 2026');
    expect(doc.sections.length).toBeGreaterThan(2);
    for (const section of doc.sections) expect(section.paragraphs.length).toBeGreaterThan(0);
    expect(text(doc)).not.toMatch(/null|undefined|NaN/);
    expect(text(doc).toLowerCase()).not.toContain('draft');
  });

  it('names the seller and adds GSTIN only when set', () => {
    const body = text(policyDoc('terms'));
    expect(body).toContain(site.legalName);
    expect(body).toContain(site.address);
    expect(body).toContain('governed by the laws of India');
    expect(body).not.toContain('GSTIN');
    expect(text(policyDoc('terms', { ...site, gstin: '06ABCDE1234F1Z5' }))).toContain('GSTIN: 06ABCDE1234F1Z5.');
  });

  it('says nothing is sold online and states no amount or online-selling terms', () => {
    const doc = policyDoc('terms');
    const body = `${doc.description}\n${text(doc)}`;
    expect(body).toContain('Nothing is sold on this website.');
    expect(body).toContain('only after a home visit');
    expect(body).toContain('not an order and not a contract');
    expect(body).not.toMatch(/₹|price|refund|shipping|deliver|payment|checkout|cart/i);
  });
});
