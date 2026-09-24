// components/vocabulary/VocabTable.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabTable } from './VocabTable';
import { VocabItem } from '@/types/models';

const items: VocabItem[] = [
  { id: '1', english: 'mother', translation: 'мама', ipa: 'ˈmʌðər', example: 'My mother is at home.', category: 'Family', tags: [], dateAdded: '2026-09-24', review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
  { id: '2', english: 'chair', translation: 'стул', ipa: 'tʃer', example: 'This is a chair.', category: 'Home', tags: [], dateAdded: '2026-09-24', review: { status: 'new', level: 0, lastReviewed: null, nextReviewDate: null, correctCount: 0, mistakeCount: 0 } },
];

describe('VocabTable', () => {
  it('renders every item english and translation by default', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('mother')).toBeInTheDocument();
    expect(screen.getByText('мама')).toBeInTheDocument();
  });

  it('hides the English column and shows placeholders when toggled off', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.getAllByText('???').length).toBeGreaterThan(0);
  });

  it('keeps the column header visible when its column is toggled off', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    const table = screen.getByRole('table');
    const thead = table.querySelector('thead');
    expect(thead).toBeInTheDocument();
    expect(thead?.textContent).toContain('English');
  });

  it('reveals a hidden cell on click', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    fireEvent.click(screen.getAllByText('???')[0]);
    expect(screen.getByText('mother')).toBeInTheDocument();
  });

  it('Hide All hides every togglable column', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /hide all/i }));
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.queryByText('мама')).not.toBeInTheDocument();
  });

  it('filters items by search text', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'стул' } });
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.getByText('chair')).toBeInTheDocument();
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('reverts a previously-revealed cell to ??? after clicking Hide All', () => {
    render(<VocabTable items={items} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    fireEvent.click(screen.getAllByText('???')[0]);
    expect(screen.getByText('mother')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /hide all/i }));
    expect(screen.queryByText('mother')).not.toBeInTheDocument();
    expect(screen.getAllByText('???').length).toBeGreaterThan(0);
  });
});
