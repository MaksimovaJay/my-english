import { describe, it, expect } from 'vitest';
import { toISODate, addDays } from './date';

describe('toISODate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-09-24T15:30:00Z'))).toBe('2026-09-24');
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const result = addDays(new Date('2026-09-24T00:00:00Z'), 3);
    expect(toISODate(result)).toBe('2026-09-27');
  });

  it('supports negative days', () => {
    const result = addDays(new Date('2026-09-24T00:00:00Z'), -1);
    expect(toISODate(result)).toBe('2026-09-23');
  });
});
