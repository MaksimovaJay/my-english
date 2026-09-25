'use client';

import { CloudOff, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '@/lib/sync/syncStatus';
import { pluralRu } from '@/lib/utils';

export function SyncBanner() {
  const { status, pending } = useSyncStatus();

  if (status === 'offline') {
    return (
      <div role="status" className="mb-3 flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
        <CloudOff size={16} className="shrink-0" />
        <span>
          Нет связи с базой.
          {pending > 0 && ` ${pending} ${pluralRu(pending, ['изменение сохранено здесь и отправится', 'изменения сохранены здесь и отправятся', 'изменений сохранено здесь и отправятся'])}, когда появится интернет.`}
        </span>
      </div>
    );
  }
  if (status === 'syncing') {
    return (
      <div role="status" className="mb-3 flex items-center gap-2 text-xs text-gray-500">
        <RefreshCw size={12} className="animate-spin" /> Синхронизация…
      </div>
    );
  }
  return null;
}
