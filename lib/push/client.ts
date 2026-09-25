import { supabaseRemote } from '@/lib/sync/remote';
import { PUSH_SUBS_COLLECTION, VAPID_PUBLIC_KEY } from './config';
import { subscriptionId } from './reminder';

export type PushSupport = 'ok' | 'ios-needs-install' | 'unsupported';

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function pushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  // iOS only allows web push for sites added to the home screen.
  if (ios && !isStandalone()) return 'ios-needs-install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
  return 'ok';
}

function base64UrlToBytes(base64Url: string): ArrayBuffer {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

export async function isReminderOn(): Promise<boolean> {
  if (pushSupport() !== 'ok' || Notification.permission !== 'granted') return false;
  return Boolean(await (await registration()).pushManager.getSubscription());
}

export async function enableReminders(): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('denied');
  const reg = await registration();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY) }));
  const id = subscriptionId(sub.endpoint);
  await supabaseRemote.upsert([
    { collection: PUSH_SUBS_COLLECTION, id, data: { id, subscription: sub.toJSON(), device: navigator.userAgent, createdAt: new Date().toISOString() } as { id: string } },
  ]);
}

export async function disableReminders(): Promise<void> {
  const sub = await (await registration()).pushManager.getSubscription();
  if (!sub) return;
  await supabaseRemote.remove(PUSH_SUBS_COLLECTION, subscriptionId(sub.endpoint));
  await sub.unsubscribe();
}

/** Shows a reminder right now (locally), to check notifications work on this device. */
export async function testReminder(): Promise<void> {
  await (await registration()).showNotification('MJay English', {
    body: '🐱 Так будет выглядеть напоминание!',
    icon: '/icons/icon-192.png',
    tag: 'test-reminder',
  });
}
