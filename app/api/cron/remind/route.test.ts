// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { sendNotification } = vi.hoisted(() => ({ sendNotification: vi.fn() }));
vi.mock('web-push', () => ({ default: { setVapidDetails: vi.fn(), sendNotification } }));

import { GET } from './route';

const sub = { endpoint: 'https://push.example/1', keys: { p256dh: 'p', auth: 'a' } };

function stubSupabase(lastActiveDate: string | null) {
  const calls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    calls.push(`${init?.method ?? 'GET'} ${url}`);
    if (url.includes('collection=eq.settings')) return Response.json([{ collection: 'settings', id: 'singleton', data: { lastActiveDate, streak: 4 } }]);
    if (url.includes('collection=eq.push-subs') && !init?.method) return Response.json([{ collection: 'push-subs', id: 'sub-1', data: { id: 'sub-1', subscription: sub } }]);
    return new Response(null, { status: 204 });
  }));
  return calls;
}

const req = (auth?: string) => new Request('https://x/api/cron/remind', { headers: auth ? { authorization: auth } : {} });

describe('GET /api/cron/remind', () => {
  beforeEach(() => {
    sendNotification.mockReset();
    process.env.VAPID_PRIVATE_KEY = 'test-private';
    process.env.CRON_SECRET = 's3cret';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('rejects calls without the cron secret', async () => {
    stubSupabase(null);
    expect((await GET(req())).status).toBe(401);
  });

  it('sends the reminder with the streak when there was no activity today', async () => {
    stubSupabase('2000-01-01');
    const res = await GET(req('Bearer s3cret'));
    expect(await res.json()).toMatchObject({ sent: 1 });
    expect(sendNotification).toHaveBeenCalledWith(sub, expect.stringContaining('Серия 4 дня'), expect.anything());
  });

  it('stays quiet when already studied today', async () => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bishkek', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    stubSupabase(today);
    expect(await (await GET(req('Bearer s3cret'))).json()).toMatchObject({ sent: 0 });
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('forgets subscriptions the browser has dropped', async () => {
    const calls = stubSupabase(null);
    sendNotification.mockRejectedValueOnce(Object.assign(new Error('gone'), { statusCode: 410 }));
    expect(await (await GET(req('Bearer s3cret'))).json()).toMatchObject({ sent: 0, removed: ['sub-1'] });
    expect(calls.some((c) => c.startsWith('DELETE') && c.includes('id=eq.sub-1'))).toBe(true);
  });
});
