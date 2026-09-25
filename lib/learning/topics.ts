import { GrammarTopic, Topic, VocabItem } from '@/types/models';
import { OTHER_TOPIC } from '@/lib/seed/topics';
import { addDays, toISODate } from './date';

export interface TopicContent {
  topic: Topic;
  words: VocabItem[];
  phrases: VocabItem[];
  grammar: GrammarTopic[];
  exerciseCount: number;
}

export function buildTopicContents(
  topics: Topic[],
  words: VocabItem[],
  phrases: VocabItem[],
  grammar: GrammarTopic[]
): TopicContent[] {
  const known = new Set(topics.map((t) => t.id));
  const topicIdOf = (id: string | undefined) => (id && known.has(id) ? id : OTHER_TOPIC.id);

  return [...topics, OTHER_TOPIC]
    .sort((a, b) => a.order - b.order)
    .map((topic) => {
      const topicGrammar = grammar.filter((g) => topicIdOf(g.topicId) === topic.id);
      return {
        topic,
        words: words.filter((w) => topicIdOf(w.category) === topic.id),
        phrases: phrases.filter((p) => topicIdOf(p.category) === topic.id),
        grammar: topicGrammar,
        exerciseCount: topicGrammar.reduce((sum, g) => sum + g.practiceExercises.length, 0),
      };
    })
    .filter((c) => c.words.length + c.phrases.length + c.grammar.length > 0);
}

export function topicProgress(items: VocabItem[]): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.review.status === 'review' || i.review.status === 'known').length;
  return Math.round((done / items.length) * 100);
}

export function newThisWeek(contents: TopicContent[], today: Date = new Date()): { topic: Topic; count: number }[] {
  const since = toISODate(addDays(today, -6));
  return contents
    .map((c) => ({ topic: c.topic, count: [...c.words, ...c.phrases].filter((i) => i.dateAdded >= since).length }))
    .filter((x) => x.count > 0);
}
