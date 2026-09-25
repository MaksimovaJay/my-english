import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/config';
import { generateId } from '@/lib/utils';

const BUCKET = 'homework-images';

/**
 * Uploads a compressed screenshot (JPEG data URL) to Supabase Storage and returns its public URL,
 * so it is visible on every device. If the upload fails (offline, bucket missing) the data URL is
 * returned instead, so the screenshot is never lost — it just stays on this device.
 */
export async function uploadImage(dataUrl: string): Promise<string> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${new Date().toISOString().slice(0, 10)}/${generateId()}.jpg`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'image/jpeg' },
      body: blob,
    });
    if (!res.ok) return dataUrl;
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  } catch {
    return dataUrl;
  }
}
