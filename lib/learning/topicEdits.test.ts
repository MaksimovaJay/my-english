import { describe, it, expect } from 'vitest';
import { effectiveTopics, newTopicDoc } from './topicEdits';
import { Topic } from '@/types/models';

const base: Topic[] = [
  { id: 'home', title: 'Дом', emoji: '🏠', group: 'class', order: 3 },
  { id: 'nature', title: 'Природа', emoji: '🌳', group: 'class', order: 11 },
  { id: 'days', title: 'Дни недели', emoji: '📅', group: 'extra', order: 102 },
];

describe('effectiveTopics', () => {
  it('applies renames, hides deleted topics and adds custom ones', () => {
    const topics = effectiveTopics(base, [
      { id: 'home', title: 'Моя квартира', emoji: '🛋️' },
      { id: 'nature', hidden: true },
      { id: 'custom-1', title: 'Работа', emoji: '💼', group: 'class', order: 12, custom: true },
    ]);
    expect(topics.map((t) => [t.id, t.title, t.emoji])).toEqual([
      ['home', 'Моя квартира', '🛋️'],
      ['custom-1', 'Работа', '💼'],
      ['days', 'Дни недели', '📅'],
    ]);
  });

  it('can move a topic to the other group', () => {
    const [home] = effectiveTopics(base, [{ id: 'home', group: 'extra' }]).filter((t) => t.id === 'home');
    expect(home.group).toBe('extra');
  });
});

describe('newTopicDoc', () => {
  it('puts a new topic at the end of its group', () => {
    const doc = newTopicDoc({ title: '  Работа ', emoji: '', group: 'class' }, base);
    expect(doc).toMatchObject({ title: 'Работа', emoji: '📁', group: 'class', order: 12, custom: true });
    expect(doc.id).toMatch(/^topic-/);
  });
});
