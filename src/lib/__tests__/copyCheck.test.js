import { describe, it, expect } from 'vitest';
import { visibleText, copyProblems, copyStats } from '../copyCheck.js';

const page = (body, head = '') => `<html><head><title>T</title>${head}</head><body>${body}</body></html>`;

describe('visibleText', () => {
  it('keeps what a visitor reads and drops the head, scripts, styles and tags', () => {
    const html = page('<h1>Plan my home</h1><script>var hidden = 1</script><style>.x{}</style><p>It&#x27;s free &amp; quick</p>', '<meta content="head words" />');
    expect(visibleText(html)).toBe("Plan my home It's free & quick");
  });
});

describe('copyProblems', () => {
  it('passes plain copy', () => {
    expect(copyProblems(page('<p>Pick your home. ₹0 · © 2026</p>'))).toEqual([]);
  });
  it('counts words and long dashes', () => {
    expect(copyStats(page('<p>one two — three · 4</p>'))).toEqual({ words: 4, longDashes: 1 });
    expect(copyProblems(page(`<p>${'word '.repeat(501)}</p>`))).toEqual(['501 words before interaction (limit 500)']);
    expect(copyProblems(page(`<p>${'a — '.repeat(7)}</p>`))).toEqual(['7 long dashes (limit 6)']);
  });
  it('finds banned phrases whatever the case or apostrophe', () => {
    expect(copyProblems(page('<p>It isn’t a luxury. COMPLETELY Seamless.</p>'))).toEqual([
      'banned phrase "isn\'t a luxury"', 'banned phrase "completely"', 'banned phrase "seamless"',
    ]);
  });
  it('finds emoji in visible text', () => {
    expect(copyProblems(page('<p>Lights 💡</p>'))).toEqual(['emoji in visible text: 💡']);
  });
});
