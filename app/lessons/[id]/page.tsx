'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Homework, SentenceOrderItem, VocabItem } from '@/types/models';
import { useLessonsStore } from '@/lib/storage/lessonsStore';
import { useWordsStore } from '@/lib/storage/wordsStore';
import { usePhrasesStore } from '@/lib/storage/phrasesStore';
import { useGrammarStore } from '@/lib/storage/grammarStore';
import { useTopicsStore } from '@/lib/storage/topicsStore';
import { completeLesson, lessonDeletion } from '@/lib/learning/lessons';
import { pluralRu } from '@/lib/utils';
import { createInitialReviewState } from '@/lib/learning/review';
import { isQuotaError, QUOTA_MESSAGE } from '@/lib/learning/images';
import { useTopics } from '@/components/topics/useTopicContents';
import { VocabCardList } from '@/components/topics/VocabCardList';
import { TopicPractice } from '@/components/topics/TopicPractice';
import { ImagePicker } from '@/components/homework/ImagePicker';
import { HomeworkExercises } from '@/components/homework/HomeworkExercises';
import { BackLink } from '@/components/shared/BackLink';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = useLessonsStore((s) => s.items.find((l) => l.id === id));
  const updateLesson = useLessonsStore((s) => s.update);
  const topics = useTopics();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Lesson words are not in the base yet: practice runs on temporary cards (answers here don't touch review).
  const practiceItems: VocabItem[] = useMemo(() => {
    if (!lesson) return [];
    const words = lesson.words.map((w, i) => ({
      id: `${lesson.id}-w${i}`, english: w.english, translation: w.translation, example: w.example, exampleTranslation: w.exampleTranslation, category: 'lesson', tags: [], dateAdded: lesson.date, review: createInitialReviewState(),
    }));
    const sentences = lesson.practice.exercises
      .filter((ex) => ex.type === 'sentence-order')
      .flatMap((ex) => ex.items as SentenceOrderItem[])
      .map((s, i) => ({
        id: `${lesson.id}-s${i}`, english: s.sentence, translation: s.translation ?? '', category: 'lesson', tags: [], dateAdded: lesson.date, review: createInitialReviewState(),
      }));
    return [...words, ...sentences];
  }, [lesson]);

  if (!lesson) {
    return (
      <div>
        <BackLink href="/lessons" label="Ко всем урокам" />
        <p className="text-sm text-gray-500">Урок не найден.</p>
      </div>
    );
  }

  function save(next: typeof lesson) {
    try {
      updateLesson(next!);
      setError(null);
    } catch (err) {
      setError(isQuotaError(err) ? QUOTA_MESSAGE : 'Не удалось сохранить.');
    }
  }

  function finish() {
    if (!window.confirm('Завершить урок? Слова, предложения, правило и упражнения перейдут в раздел «Темы».')) return;
    const result = completeLesson(lesson!, useWordsStore.getState().items, topics);
    useTopicsStore.getState().add(result.topic);
    result.newWords.forEach((w) => useWordsStore.getState().add(w));
    result.phrases.forEach((p) => usePhrasesStore.getState().add(p));
    if (result.grammar) useGrammarStore.getState().add(result.grammar);
    save(result.lesson);
  }

  function remove() {
    const plan = lessonDeletion(lesson!);
    const topicTitle = plan.topicId && topics.find((t) => t.id === plan.topicId)?.title;
    const parts = [
      topicTitle && `тема «${topicTitle}»`,
      plan.wordIds.length > 0 && `${plan.wordIds.length} ${pluralRu(plan.wordIds.length, ['слово', 'слова', 'слов'])}`,
      plan.phraseIds.length > 0 && `${plan.phraseIds.length} ${pluralRu(plan.phraseIds.length, ['фраза', 'фразы', 'фраз'])}`,
      plan.grammarId && 'правило и упражнения урока',
    ].filter(Boolean);
    const extra = parts.length ? ` Вместе с ним удалятся: ${parts.join(', ')}.` : '';
    if (!window.confirm(`Удалить урок «${lesson!.title}»?${extra} Это удалится на всех устройствах.`)) return;

    const words = useWordsStore.getState();
    const phrases = usePhrasesStore.getState();
    plan.wordIds.forEach((wid) => words.items.some((w) => w.id === wid) && words.remove(wid));
    plan.phraseIds.forEach((pid) => phrases.items.some((p) => p.id === pid) && phrases.remove(pid));
    if (plan.grammarId && useGrammarStore.getState().items.some((g) => g.id === plan.grammarId)) useGrammarStore.getState().remove(plan.grammarId);
    if (plan.topicId) {
      // Words the learner moved into this topic by hand were not created by the lesson: keep them in «Мои слова».
      useWordsStore.getState().items.filter((w) => w.category === plan.topicId).forEach((w) => useWordsStore.getState().update({ ...w, category: 'my-words', edited: true }));
      usePhrasesStore.getState().items.filter((p) => p.category === plan.topicId).forEach((p) => usePhrasesStore.getState().update({ ...p, category: 'my-words', edited: true }));
      if (useTopicsStore.getState().items.some((d) => d.id === plan.topicId)) useTopicsStore.getState().remove(plan.topicId);
    }
    useLessonsStore.getState().remove(lesson!.id);
    router.push('/lessons');
  }

  const done = lesson.status === 'completed';

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/lessons" label="Ко всем урокам" />
      <h1 className="text-xl font-bold">🎓 Урок {lesson.number} · {lesson.title}</h1>
      <p className="mb-4 text-xs text-gray-500">{lesson.date} · {done ? '✅ проведён' : 'запланирован'}</p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {done && lesson.topicId && (
        <Link href={`/topics/${lesson.topicId}`} className="card mb-6 block p-3 text-sm hover:border-pink-400">
          Материал урока теперь в разделе «Темы» — <strong>открыть тему →</strong>
        </Link>
      )}

      {lesson.description && <p className="mb-6 whitespace-pre-line">{lesson.description}</p>}

      {(lesson.images?.length || !done) && (
        <Section title="🖼 Картинки">
          <ImagePicker images={lesson.images ?? []} onChange={(images) => save({ ...lesson, images })} />
        </Section>
      )}

      {lesson.conditions && (
        <Section title="📋 Условия">
          <p className="card whitespace-pre-line p-3 text-sm">{lesson.conditions}</p>
        </Section>
      )}

      {lesson.rules && (
        <Section title="📖 Правило">
          <p className="card whitespace-pre-line p-3 text-sm">{lesson.rules}</p>
        </Section>
      )}

      {lesson.words.length > 0 && (
        <Section title={`📚 Слова (${lesson.words.length})`}>
          <VocabCardList items={practiceItems.slice(0, lesson.words.length)} />
        </Section>
      )}

      {lesson.practice.exercises.length > 0 && (
        <Section title="✏️ Упражнения">
          <HomeworkExercises homework={lesson.practice} onUpdate={(practice: Homework) => save({ ...lesson, practice })} />
        </Section>
      )}

      {lesson.games.length > 0 && practiceItems.length > 0 && (
        <Section title="🎮 Игры урока">
          <TopicPractice items={practiceItems} onUpdateItem={() => {}} modes={lesson.games} />
        </Section>
      )}

      {!done && (
        <button
          type="button"
          className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-600 to-pink-500 py-3 text-lg font-extrabold text-white shadow-lg shadow-pink-500/30"
          onClick={finish}
        >
          ✅ Завершить урок
        </button>
      )}

      <button type="button" className="mt-8 flex items-center gap-1 text-sm text-gray-500 hover:text-red-600" onClick={remove}>
        <Trash2 size={14} /> Удалить урок
      </button>
    </div>
  );
}
