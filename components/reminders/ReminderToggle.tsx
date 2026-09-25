'use client';

import { useEffect, useState } from 'react';
import { disableReminders, enableReminders, isReminderOn, pushSupport, PushSupport, testReminder } from '@/lib/push/client';

export interface ReminderApi {
  support: () => PushSupport;
  isOn: () => Promise<boolean>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  test: () => Promise<void>;
}

const browserApi: ReminderApi = { support: pushSupport, isOn: isReminderOn, enable: enableReminders, disable: disableReminders, test: testReminder };

export function ReminderToggle({ api = browserApi }: { api?: ReminderApi }) {
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = api.support();
    setSupport(s);
    if (s === 'ok') api.isOn().then(setOn).catch(() => setOn(false));
  }, [api]);

  async function run(action: () => Promise<void>, next: boolean) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setOn(next);
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'denied'
          ? 'Разрешите уведомления для этого сайта в настройках браузера или телефона и попробуйте ещё раз.'
          : 'Не получилось. Проверьте интернет и попробуйте ещё раз.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-6 p-4">
      <h2 className="mb-1 font-semibold">🔔 Напоминания</h2>
      <p className="mb-3 text-sm text-gray-500">Каждый вечер около 20:00, если в этот день вы ещё не занимались.</p>

      {support === 'ios-needs-install' && (
        <p className="text-sm">
          На iPhone напоминания работают, только если сайт добавлен на экран «Домой»: в Safari нажмите «Поделиться» → «На экран Домой»,
          откройте приложение оттуда и включите напоминания здесь.
        </p>
      )}
      {support === 'unsupported' && <p className="text-sm">Этот браузер не поддерживает уведомления. Попробуйте Chrome или Safari.</p>}

      {support === 'ok' &&
        (on ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">✅ Напоминания включены на этом устройстве</span>
            <button type="button" disabled={busy} className="rounded-full border px-3 py-1 text-sm" onClick={() => void api.test()}>
              Проверить
            </button>
            <button type="button" disabled={busy} className="text-sm text-gray-500 underline" onClick={() => void run(api.disable, false)}>
              Выключить
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/20 hover:brightness-110 disabled:opacity-50"
            onClick={() => void run(api.enable, true)}
          >
            🔔 Включить напоминания
          </button>
        ))}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
