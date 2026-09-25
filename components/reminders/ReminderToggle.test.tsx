import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReminderToggle, ReminderApi } from './ReminderToggle';

function api(overrides: Partial<ReminderApi> = {}): ReminderApi {
  return {
    support: () => 'ok',
    isOn: vi.fn(async () => false),
    enable: vi.fn(async () => {}),
    disable: vi.fn(async () => {}),
    test: vi.fn(async () => {}),
    ...overrides,
  };
}

describe('ReminderToggle', () => {
  it('explains how to install on iPhone first', async () => {
    render(<ReminderToggle api={api({ support: () => 'ios-needs-install' })} />);
    expect(await screen.findByText(/на экран «Домой»/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Включить/ })).not.toBeInTheDocument();
  });

  it('turns reminders on and off', async () => {
    const a = api();
    render(<ReminderToggle api={a} />);
    fireEvent.click(await screen.findByRole('button', { name: '🔔 Включить напоминания' }));
    await waitFor(() => expect(screen.getByText(/Напоминания включены/)).toBeInTheDocument());
    expect(a.enable).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(a.test).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Выключить' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '🔔 Включить напоминания' })).toBeInTheDocument());
  });

  it('tells how to allow notifications when permission is denied', async () => {
    render(<ReminderToggle api={api({ enable: vi.fn(async () => { throw new Error('denied'); }) })} />);
    fireEvent.click(await screen.findByRole('button', { name: '🔔 Включить напоминания' }));
    expect(await screen.findByText(/Разрешите уведомления/)).toBeInTheDocument();
  });
});
