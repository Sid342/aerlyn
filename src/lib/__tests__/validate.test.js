import { describe, it, expect } from 'vitest';
import { normalisePhone, isName, validateContact } from '../validate.js';

describe('normalisePhone', () => {
  it('accepts a plain 10-digit mobile', () => {
    expect(normalisePhone('9876543210')).toBe('9876543210');
  });
  it('strips spaces, dashes, +91 and leading 0', () => {
    expect(normalisePhone('+91 98765-43210')).toBe('9876543210');
    expect(normalisePhone('098765 43210')).toBe('9876543210');
    expect(normalisePhone('919876543210')).toBe('9876543210');
  });
  it('rejects numbers not starting 6-9', () => {
    expect(normalisePhone('5876543210')).toBeNull();
    expect(normalisePhone('0123456789')).toBeNull();
  });
  it('rejects wrong lengths, letters and empty input', () => {
    expect(normalisePhone('98765')).toBeNull();
    expect(normalisePhone('98765432101')).toBeNull();
    expect(normalisePhone('98765abcde')).toBeNull();
    expect(normalisePhone('')).toBeNull();
    expect(normalisePhone(undefined)).toBeNull();
  });
});

describe('isName', () => {
  it('requires a non-blank name', () => {
    expect(isName('Asha')).toBe(true);
    expect(isName('   ')).toBe(false);
    expect(isName('')).toBe(false);
    expect(isName(undefined)).toBe(false);
  });
});

describe('validateContact', () => {
  it('returns no errors and the normalised phone for valid input', () => {
    expect(validateContact({ name: 'Asha', phone: '+91 98765 43210' })).toEqual({ errors: {}, phone: '9876543210' });
  });
  it('reports both fields when empty', () => {
    const { errors, phone } = validateContact({ name: '', phone: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(phone).toBeNull();
  });
});
