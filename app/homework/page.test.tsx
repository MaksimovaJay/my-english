import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeworkPage from './page';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { initHomeworkProgress } from '@/lib/learning/homework';

const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }];

describe('HomeworkPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useHomeworkStore.setState({ items: [], hydrated: true });
  });

  it('shows an empty state with no homework', () => {
    render(<HomeworkPage />);
    expect(screen.getByText(/домашек пока нет/i)).toBeInTheDocument();
  });

  it('lists an existing homework with its progress and status', () => {
    useHomeworkStore.setState({
      items: [{ id: 'hw1', number: 1, title: 'Unit 11', assignedDate: '2026-09-24', status: 'not-started', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
    render(<HomeworkPage />);
    expect(screen.getByRole('link', { name: 'ДЗ 1 · Unit 11' })).toHaveAttribute('href', '/homework/hw1');
    expect(screen.getByText('0 / 1')).toBeInTheDocument();
    expect(screen.getByText(/не начато/i)).toBeInTheDocument();
  });

  it('imports a homework JSON file and adds it to the store', async () => {
    render(<HomeworkPage />);
    const file = new File(
      [JSON.stringify({ title: 'Unit 12', exercises: [{ type: 'fill-blank', instruction: 'Fill it.', items: [{ text: 'a ___ b', blanks: [['x']] }] }] })],
      'unit12.json',
      { type: 'application/json' }
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(useHomeworkStore.getState().items.some((h) => h.title === 'Unit 12')).toBe(true);
  });

  it('shows an error message for an invalid file', async () => {
    render(<HomeworkPage />);
    const file = new File([JSON.stringify({ title: 'Bad' })], 'bad.json', { type: 'application/json' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(screen.getByText(/invalid homework file/i)).toBeInTheDocument();
  });
});
