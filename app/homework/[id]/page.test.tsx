import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeworkRunnerPage from './page';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { initHomeworkProgress, buildAssignedHomework } from '@/lib/learning/homework';

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
    expect(screen.getByRole('button', { name: /сдать домашку/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('blank-0-0'), { target: { value: 'was' } });
    fireEvent.click(screen.getByRole('button', { name: /^проверить$/i }));
    expect(screen.getByRole('button', { name: /сдать домашку/i })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /сдать домашку/i }));
    const updated = useHomeworkStore.getState().items[0];
    expect(updated.status).toBe('completed');
    expect(updated.score).toEqual({ correct: 1, total: 1 });
  });
});

describe('HomeworkRunnerPage with free-text homework', () => {
  it('shows notes, saves a typed answer, and submits for review', () => {
    const hw = buildAssignedHomework({ bookNumbers: ['12.1'], teacherNotes: 'Письменно в тетради', images: [], assignedDate: '2026-09-26', dueDate: '' }, 2);
    useHomeworkStore.setState({ items: [{ ...hw, id: 'hw1' }], hydrated: true });
    render(<HomeworkRunnerPage />);
    expect(screen.getByRole('link', { name: /Ко всем домашкам/ })).toHaveAttribute('href', '/homework');
    expect(screen.getByText('Письменно в тетради')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Ответ: Упражнение 12.1'), { target: { value: 'I was at home.' } });
    expect(useHomeworkStore.getState().items[0].status).toBe('in-progress');
    fireEvent.click(screen.getByRole('button', { name: /сдать домашку/i }));
    expect(screen.getByText('✅ Отправлено на проверку')).toBeInTheDocument();
  });
});
