import { describe, it, expect } from 'vitest';
import { cn, generateId, pluralRu } from './utils';

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('lets tailwind-merge resolve conflicting utility classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

describe('generateId', () => {
  it('returns a non-empty unique string', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(0);
  });
});

describe('pluralRu', () => {
  it('picks the Russian plural form', () => {
    const forms: [string, string, string] = ['слово', 'слова', 'слов'];
    expect([1, 2, 5, 11, 21, 22, 25, 111].map((n) => pluralRu(n, forms))).toEqual(
      ['слово', 'слова', 'слов', 'слов', 'слово', 'слова', 'слов', 'слов']
    );
  });
});
