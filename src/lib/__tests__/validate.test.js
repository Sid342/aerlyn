import { describe, it, expect } from 'vitest';
import { normalisePhone, isName, isPincode, validateContact, isEmail, validateOrder } from '../validate.js';

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

describe('isPincode', () => {
  it('accepts exactly six digits', () => {
    expect(isPincode('125001')).toBe(true);
    expect(isPincode(' 125001 ')).toBe(true);
  });
  it('rejects anything else', () => {
    expect(isPincode('12500')).toBe(false);
    expect(isPincode('1250011')).toBe(false);
    expect(isPincode('12500a')).toBe(false);
    expect(isPincode('')).toBe(false);
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

describe('isEmail', () => {
  it('accepts a plain address', () => {
    expect(isEmail('asha@example.com')).toBe(true);
    expect(isEmail(' asha.k+home@mail.example.in ')).toBe(true);
  });
  it('rejects anything else', () => {
    for (const bad of ['', 'asha', 'asha@', '@example.com', 'asha@example', 'a b@example.com', undefined]) {
      expect(isEmail(bad)).toBe(false);
    }
  });
});

describe('validateOrder', () => {
  const valid = {
    name: 'Asha', phone: '98765 43210', email: 'asha@example.com',
    address: '12 MG Road', city: 'Hisar', state: 'Haryana', pincode: '125001',
  };
  it('returns no errors and the normalised phone for valid input', () => {
    expect(validateOrder(valid)).toEqual({ errors: {}, phone: '9876543210' });
  });
  it('reports every missing field', () => {
    const { errors, phone } = validateOrder({});
    expect(Object.keys(errors).sort()).toEqual(['address', 'city', 'email', 'name', 'phone', 'pincode', 'state']);
    expect(phone).toBeNull();
  });
  it('reports only the field that is wrong', () => {
    expect(Object.keys(validateOrder({ ...valid, email: 'asha@' }).errors)).toEqual(['email']);
    expect(Object.keys(validateOrder({ ...valid, pincode: '1250' }).errors)).toEqual(['pincode']);
  });
});
