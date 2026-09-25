import webpush from 'web-push';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/config';
import { PUSH_SUBS_COLLECTION, REMINDER_TIMEZONE, VAPID_PUBLIC_KEY, VAPID_SUBJECT } from '@/lib/push/config';
import { localDate, reminderMessage, shouldRemind } from '@/lib/push/reminder';

export const dynamic = 'force-dynamic';

interface Doc<T> { collection: string; id: string; data: T }
interface Settings { lastActiveDate: string | null; streak: number }
interface StoredSubscription { id: string; subscription: webpush.PushSubscription }

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function fetchDocs<T>(filter: string): Promise<Doc<T>[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/documents?select=collection,id,data&${filter}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

/** Called daily by Vercel Cron (vercel.json): push a reminder if there was no activity today. */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) return Response.json({ error: 'VAPID_PRIVATE_KEY is not set' }, { status: 500 });

  const today = localDate(new Date(), REMINDER_TIMEZONE);
  const [settingsDocs, subDocs] = await Promise.all([
    fetchDocs<Settings>('collection=eq.settings&id=eq.singleton'),
    fetchDocs<StoredSubscription>(`collection=eq.${PUSH_SUBS_COLLECTION}`),
  ]);
  const settings = settingsDocs[0]?.data;
  // ?test=1 (still requires the cron secret) sends even after studying today, to check pushes end to end.
  const test = new URL(request.url).searchParams.get('test') === '1';
  if (!test && !shouldRemind(settings, today)) return Response.json({ sent: 0, reason: 'already studied today' });

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, privateKey);
  const payload = JSON.stringify({ ...reminderMessage(settings?.streak ?? 0), url: '/' });
  let sent = 0;
  const removed: string[] = [];
  for (const doc of subDocs) {
    try {
      await webpush.sendNotification(doc.data.subscription, payload, { TTL: 60 * 60 * 3 });
      sent++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        // The browser dropped this subscription (app removed, permission revoked): forget it.
        await fetch(`${SUPABASE_URL}/rest/v1/documents?collection=eq.${PUSH_SUBS_COLLECTION}&id=eq.${encodeURIComponent(doc.id)}`, { method: 'DELETE', headers });
        removed.push(doc.id);
      }
    }
  }
  return Response.json({ sent, removed, today });
}
