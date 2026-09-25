import { describe, it, expect } from 'vitest';
import { buildTopicContents, topicProgress, newThisWeek } from './topics';
import { GrammarTopic, Topic, VocabItem } from '@/types/models';
import { createInitialReviewState } from './review';

const topics: Topic[] = [
  { id: 'nature', title: 'Природа', emoji: '🌳', group: 'class', order: 2 },
  { id: 'home', title: 'Дом', emoji: '🏠', group: 'class', order: 1 },
  { id: 'empty', title: 'Пусто', emoji: '∅', group: 'extra', order: 3 },
];

function item(id: string, category: string, status: VocabItem['review']['status'] = 'new', dateAdded = '2026-09-01'): VocabItem {
  return { id, english: id, translation: id, category, tags: [], dateAdded, review: { ...createInitialReviewState(), status } };
}

const grammar: GrammarTopic = {
  id: 'g1', title: 'Rule', explanation: '', examples: [], dateAdded: '2026-09-01', topicId: 'home',
  practiceExercises: [
    { id: 'e1', type: 'fill-blank', instruction: '', items: [] },
    { id: 'e2', type: 'fill-blank', instruction: '', items: [] },
  ],
};

describe('buildTopicContents', () => {
  const contents = buildTopicContents(topics, [item('chair', 'home'), item('tree', 'nature'), item('mother', 'Family')], [], [grammar]);

  it('groups items and grammar by topic, sorted by order, dropping empty topics', () => {
    expect(contents.map((c) => c.topic.id)).toEqual(['home', 'nature', 'other']);
    expect(contents[0].words.map((w) => w.id)).toEqual(['chair']);
    expect(contents[0].grammar).toEqual([grammar]);
    expect(contents[0].exerciseCount).toBe(2);
  });

  it('puts items with an unknown category under "other"', () => {
    expect(contents[2].topic.title).toBe('Другое');
    expect(contents[2].words.map((w) => w.id)).toEqual(['mother']);
  });

  it('omits "other" when nothing falls into it', () => {
    const c = buildTopicContents(topics, [item('chair', 'home')], [], []);
    expect(c.map((x) => x.topic.id)).toEqual(['home']);
  });
});

describe('topicProgress', () => {
  it('is the share of items in review or known status', () => {
    expect(topicProgress([item('a', 'home', 'review'), item('b', 'home', 'new')])).toBe(50);
    expect(topicProgress([item('a', 'home', 'known')])).toBe(100);
    expect(topicProgress([])).toBe(0);
  });
});

describe('newThisWeek', () => {
  it('counts items added in the last 7 days including today', () => {
    const contents = buildTopicContents(topics, [item('a', 'home', 'new', '2026-09-19'), item('b', 'home', 'new', '2026-09-18')], [], []);
    const result = newThisWeek(contents, new Date('2026-09-25T12:00:00'));
    expect(result).toEqual([{ topic: expect.objectContaining({ id: 'home' }), count: 1 }]);
  });
});
