import { pluralRu } from '@/lib/utils';

export function shouldRemind(settings: { lastActiveDate: string | null } | undefined, today: string): boolean {
  return settings?.lastActiveDate !== today;
}

export function reminderMessage(streak: number): { title: string; body: string } {
  return {
    title: 'MJay English',
    body: streak > 0
      ? `🔥 Серия ${streak} ${pluralRu(streak, ['день', 'дня', 'дней'])} — не прерывай! 10 минут английского?`
      : '🐱 Котик ждёт! 10 минут английского сегодня?',
  };
}

/** YYYY-MM-DD of `now` in the given IANA timezone. */
export function localDate(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Short stable id for a push subscription (endpoints are long URLs). */
export function subscriptionId(endpoint: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1234567;
  for (let i = 0; i < endpoint.length; i++) {
    const c = endpoint.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c, 2246822519);
  }
  return `sub-${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
}
