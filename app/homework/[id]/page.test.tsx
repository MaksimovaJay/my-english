import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeworkRunnerPage from './page';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { initHomeworkProgress } from '@/lib/learning/homework';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'hw1' }),
}));

const exercises = [{ id: 'ex1', type: 'fill-blank' as const, instruction: 'Fill was/were.', items: [{ text: 'She ___ 22.', blanks: [['was']] }] }];

describe('HomeworkRunnerPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useHomeworkStore.setState({
      items: [{ id: 'hw1', title: 'Unit 11', assignedDate: '2026-09-24', status: 'not-started', exercises, progress: initHomeworkProgress(exercises) }],
      hydrated: true,
    });
  });

  it('marks the homework in-progress after the first answer change', () => {
    render(<HomeworkRunnerPage />);
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    expect(useHomeworkStore.getState().items[0].status).toBe('in-progress');
  });

  it('enables SUBMIT only once every item is checked, then records the score', () => {
    render(<HomeworkRunnerPage />);
    expect(screen.getByRole('button', { name: /submit homework/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.getByRole('button', { name: /submit homework/i })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /submit homework/i }));
    const updated = useHomeworkStore.getState().items[0];
    expect(updated.status).toBe('completed');
    expect(updated.score).toEqual({ correct: 1, total: 1 });
  });
});
