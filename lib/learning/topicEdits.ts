import { Topic } from '@/types/models';
import { generateId } from '@/lib/utils';

/**
 * A user change to a topic, synced as the `topics` collection: a rename / new emoji / other group for a
 * built-in topic, `hidden` for a deleted one, or a whole new topic (`custom`).
 */
export interface TopicDoc {
  id: string;
  title?: string;
  emoji?: string;
  group?: Topic['group'];
  order?: number;
  hidden?: boolean;
  custom?: boolean;
}

export function effectiveTopics(base: Topic[], docs: TopicDoc[]): Topic[] {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const builtIn = base.map((t) => ({ topic: t, doc: byId.get(t.id) }));
  const custom = docs
    .filter((d) => d.custom && !base.some((t) => t.id === d.id))
    .map((d) => ({ topic: { id: d.id, title: d.title ?? 'Без названия', emoji: d.emoji ?? '📁', group: d.group ?? 'class', order: d.order ?? 500 }, doc: d }));
  return [...builtIn, ...custom]
    .filter(({ doc }) => !doc?.hidden)
    .map(({ topic, doc }) => ({
      ...topic,
      title: doc?.title ?? topic.title,
      emoji: doc?.emoji ?? topic.emoji,
      group: doc?.group ?? topic.group,
    }))
    .sort((a, b) => a.order - b.order);
}

export function newTopicDoc(input: { title: string; emoji: string; group: Topic['group'] }, topics: Topic[]): TopicDoc & Topic {
  const inGroup = topics.filter((t) => t.group === input.group).map((t) => t.order);
  return {
    id: `topic-${generateId()}`,
    title: input.title.trim(),
    emoji: input.emoji.trim() || '📁',
    group: input.group,
    order: (inGroup.length ? Math.max(...inGroup) : input.group === 'class' ? 0 : 100) + 1,
    custom: true,
  };
}
