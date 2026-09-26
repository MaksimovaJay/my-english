import { describe, it, expect } from 'vitest';
import { isSpokenMatch, normalizeSpoken } from './recognize';

describe('speech matching', () => {
  it('ignores case, punctuation and apostrophes', () => {
    expect(normalizeSpoken("Wasn't it?")).toBe('wasnt it');
    expect(isSpokenMatch(['i was hungry'], 'I was hungry.')).toBe(true);
  });

  it('accepts any of the alternatives', () => {
    expect(isSpokenMatch(['sofa bed', 'sofa'], 'sofa')).toBe(true);
    expect(isSpokenMatch(['so far'], 'sofa')).toBe(false);
  });
});
