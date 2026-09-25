import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/config';

export interface RemoteDoc {
  collection: string;
  id: string;
  data: { id: string };
}

export interface Remote {
  pullAll(): Promise<RemoteDoc[]>;
  upsert(docs: RemoteDoc[], opts?: { keepalive?: boolean }): Promise<void>;
  remove(collection: string, id: string, opts?: { keepalive?: boolean }): Promise<void>;
}

const PAGE = 1000;

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...extra };
}

async function check(res: Response): Promise<Response> {
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => '')}`);
  return res;
}

/** PostgREST calls on public.documents(collection, id, data). */
export const supabaseRemote: Remote = {
  async pullAll() {
    const all: RemoteDoc[] = [];
    for (let from = 0; ; from += PAGE) {
      const res = await check(
        await fetch(`${SUPABASE_URL}/rest/v1/documents?select=collection,id,data&order=collection,id`, {
          headers: headers({ Range: `${from}-${from + PAGE - 1}` }),
          cache: 'no-store',
        })
      );
      const page = (await res.json()) as RemoteDoc[];
      all.push(...page);
      if (page.length < PAGE) return all;
    }
  },
  async upsert(docs, opts) {
    if (docs.length === 0) return;
    const body = docs.map((d) => ({ ...d, updated_at: new Date().toISOString() }));
    await check(
      await fetch(`${SUPABASE_URL}/rest/v1/documents?on_conflict=collection,id`, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(body),
        keepalive: opts?.keepalive,
      })
    );
  },
  async remove(collection, id, opts) {
    await check(
      await fetch(`${SUPABASE_URL}/rest/v1/documents?collection=eq.${encodeURIComponent(collection)}&id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: headers(),
        keepalive: opts?.keepalive,
      })
    );
  },
};
