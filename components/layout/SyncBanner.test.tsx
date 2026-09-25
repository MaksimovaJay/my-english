import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncBanner } from './SyncBanner';
import { useSyncStatus } from '@/lib/sync/syncStatus';

describe('SyncBanner', () => {
  it('is silent when everything is synced', () => {
    useSyncStatus.setState({ status: 'ok', pending: 0 });
    const { container } = render(<SyncBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('explains offline changes are kept', () => {
    useSyncStatus.setState({ status: 'offline', pending: 3 });
    render(<SyncBanner />);
    expect(screen.getByRole('status')).toHaveTextContent('Нет связи с базой. 3 изменения сохранены здесь и отправятся, когда появится интернет.');
  });
});
