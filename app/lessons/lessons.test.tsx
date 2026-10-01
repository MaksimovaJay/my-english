import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonsPage from './page';
import LessonPage from './[id]/page';
import { useLessonsStore } from '@/lib/storage/lessonsStore';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useTopicsStore } from '@/lib/storage/topicsStore';
import { buildLesson } from '@/lib/learning/lessons';

const params = { id: '' };
vi.mock('next/navigation', () => ({ useParams: () => params }));

beforeEach(() => {
  window.localStorage.clear();
  useLessonsStore.setState({ items: [], hydrated: true });
  useWordsStore.setState({ items: [], hydrated: true });
  usePhrasesStore.setState({ items: [], hydrated: true });
  useGrammarStore.setState({ items: [], hydrated: true });
  useTopicsStore.setState({ items: [], hydrated: true });
});

describe('LessonsPage', () => {
  it('lets the teacher create a lesson with words, rules and chosen games', () => {
    render(<LessonsPage />);
    fireEvent.click(screen.getByRole('button', { name: '+ Новый урок' }));
    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Past simple' } });
    fireEvent.change(screen.getByLabelText(/Слова/), { target: { value: 'noisy = шумный' } });
    fireEvent.change(screen.getByLabelText(/Правила/), { target: { value: 'was / were' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Буквы' }));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить урок' }));
    const [lesson] = useLessonsStore.getState().items;
    expect(lesson).toMatchObject({ number: 1, title: 'Past simple', rules: 'was / were', words: [{ english: 'noisy', translation: 'шумный' }] });
    expect(lesson.games).toContain('letters');
    expect(screen.getByRole('link', { name: /Урок 1 · Past simple/ })).toHaveAttribute('href', `/lessons/${lesson.id}`);
  });
});

describe('LessonPage', () => {
  function seed() {
    const lesson = buildLesson({ title: 'Past simple', date: '2026-10-02', images: [], words: 'noisy = шумный\nquiet = тихий', rules: 'was / were', conditions: 'Сначала слова', games: ['matching', 'letters'] }, 1);
    useLessonsStore.setState({ items: [lesson], hydrated: true });
    params.id = lesson.id;
    return lesson;
  }

  it('shows the lesson and only the games ticked for it', () => {
    seed();
    render(<LessonPage />);
    expect(screen.getByRole('heading', { name: '🎓 Урок 1 · Past simple' })).toBeInTheDocument();
    expect(screen.getByText('was / were')).toBeInTheDocument();
    expect(screen.getByText('Сначала слова')).toBeInTheDocument();
    expect(screen.getByText('noisy')).toBeInTheDocument();
    const modes = ['Найди пару', 'Буквы'];
    modes.forEach((m) => expect(screen.getByRole('button', { name: m })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Карточки' })).not.toBeInTheDocument();
  });

  it('moves the material into a new topic when the lesson is finished', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    seed();
    render(<LessonPage />);
    fireEvent.click(screen.getByRole('button', { name: '✅ Завершить урок' }));
    const [topic] = useTopicsStore.getState().items;
    expect(topic).toMatchObject({ title: 'Past simple', custom: true });
    expect(useWordsStore.getState().items.map((w) => [w.english, w.category])).toEqual([['noisy', topic.id], ['quiet', topic.id]]);
    expect(useGrammarStore.getState().items[0]).toMatchObject({ topicId: topic.id, title: 'Правило: Past simple' });
    expect(useLessonsStore.getState().items[0].status).toBe('completed');
    expect(screen.getByRole('link', { name: /открыть тему/ })).toHaveAttribute('href', `/topics/${topic.id}`);
  });
});
