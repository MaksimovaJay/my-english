import { describe, it, expect } from 'vitest';
import { shouldRemind, reminderMessage, localDate, subscriptionId } from './reminder';

describe('reminders', () => {
  it('reminds only when there was no activity today', () => {
    expect(shouldRemind({ lastActiveDate: '2026-09-25' }, '2026-09-25')).toBe(false);
    expect(shouldRemind({ lastActiveDate: '2026-09-24' }, '2026-09-25')).toBe(true);
    expect(shouldRemind(undefined, '2026-09-25')).toBe(true);
  });

  it('mentions the streak when there is one', () => {
    expect(reminderMessage(5).body).toContain('5 дней');
    expect(reminderMessage(1).body).toContain('1 день');
    expect(reminderMessage(0).body).not.toContain('Серия');
    expect(reminderMessage(0).title).toBe('MJay English');
  });

  it('computes the date in the reminder timezone', () => {
    // 20:30 UTC on the 25th is already the 26th in Bishkek (UTC+6)
    expect(localDate(new Date('2026-09-25T20:30:00Z'), 'Asia/Bishkek')).toBe('2026-09-26');
    expect(localDate(new Date('2026-09-25T14:00:00Z'), 'Asia/Bishkek')).toBe('2026-09-25');
  });

  it('derives a stable document id from the subscription endpoint', () => {
    const a = subscriptionId('https://push.example/abc');
    expect(a).toBe(subscriptionId('https://push.example/abc'));
    expect(a).not.toBe(subscriptionId('https://push.example/abd'));
    expect(a).toMatch(/^sub-[a-z0-9]+$/);
  });
});
