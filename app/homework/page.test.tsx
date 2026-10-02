import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeworkPage from './page';
import { useHomeworkStore } from '@/lib/storage/homeworkStore';
import { useWordsStore } from '@/lib/storage/wordsStore';
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
    expect(screen.getByText('чт 24.09 · 0 / 1 · Не начато')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Неделя 21–27 сентября' })).toBeInTheDocument();
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

describe('HomeworkPage assign', () => {
  it('creates the next numbered homework from the form', () => {
    useHomeworkStore.setState({ items: [{ id: 'hw1', number: 1, title: 'Unit 11', assignedDate: '2026-09-24', status: 'not-started', exercises, progress: initHomeworkProgress(exercises) }], hydrated: true });
    render(<HomeworkPage />);
    fireEvent.click(screen.getByRole('button', { name: '+ Задать домашку' }));
    fireEvent.change(screen.getByLabelText('Номер 1'), { target: { value: '12.1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByRole('link', { name: 'ДЗ 2 · Упражнения 12.1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Сохранить' })).not.toBeInTheDocument();
  });
});

describe('HomeworkPage assign with words', () => {
  it('adds the new words to the base and makes a «📚 Слова» homework', () => {
    useWordsStore.setState({ items: [], hydrated: true });
    useHomeworkStore.setState({ items: [], hydrated: true });
    render(<HomeworkPage />);
    fireEvent.click(screen.getByRole('button', { name: '+ Задать домашку' }));
    fireEvent.change(screen.getByLabelText(/Слова для изучения/), { target: { value: 'window = окно\ndoor' } });
    expect(screen.getByText(/без перевода, не добавятся: door/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(useWordsStore.getState().items).toEqual([expect.objectContaining({ english: 'window', translation: 'окно', category: 'homework-words' })]);
    expect(screen.getByRole('link', { name: 'ДЗ 1 · 📚 Слова' })).toBeInTheDocument();
  });
});

describe('HomeworkPage sections', () => {
  const mk = (id: string, number: number, status: 'not-started' | 'completed', score?: { correct: number; total: number }) => ({
    id, number, title: `Unit ${number}`, assignedDate: '2026-10-01', status, exercises, progress: initHomeworkProgress(exercises), score,
  });

  it('splits homework into «Задано» and «Сделано» and announces the one just handed in', () => {
    window.history.pushState({}, '', '/homework?done=h2');
    useHomeworkStore.setState({ items: [mk('h1', 1, 'not-started'), mk('h2', 2, 'completed', { correct: 1, total: 1 })], hydrated: true });
    render(<HomeworkPage />);
    const todo = screen.getByRole('heading', { name: '📝 Задано' });
    const done = screen.getByRole('heading', { name: '✅ Сделано' });
    expect(todo.compareDocumentPosition(done) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('status')).toHaveTextContent('ДЗ 2 · Unit 2 сдано и перенесено в «Сделано».');
    expect(screen.getByText(/Результат 1 \/ 1/)).toBeInTheDocument();
    window.history.pushState({}, '', '/');
  });

  it('celebrates when nothing is left to do', () => {
    useHomeworkStore.setState({ items: [mk('h2', 2, 'completed')], hydrated: true });
    render(<HomeworkPage />);
    expect(screen.getByText('🎉 Все домашки сделаны!')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '📝 Задано' })).not.toBeInTheDocument();
  });
});
