import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicPractice } from './TopicPractice';
import { createInitialReviewState } from '@/lib/learning/review';

const items = ['chair', 'table', 'sofa', 'bed', 'lamp'].map((e) => ({
  id: e, english: e, translation: `ru-${e}`, category: 'home', tags: [], dateAdded: '2026-09-25', review: createInitialReviewState(),
}));

describe('TopicPractice', () => {
  it('offers all practice modes and switches between them', () => {
    render(<TopicPractice items={items} onUpdateItem={vi.fn()} />);
    for (const name of ['Карточки', 'Написание', 'На слух', 'Найди пару', 'Лови слова']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Написание' }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
