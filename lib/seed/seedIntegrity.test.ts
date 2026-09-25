import { describe, it, expect } from 'vitest';
import { seedWords } from './words';
import { seedPhrases } from './phrases';
import { seedGrammarTopics } from './grammar';
import { TOPICS } from './topics';

describe('seed integrity', () => {
  const topicIds = new Set(TOPICS.map((t) => t.id));

  it('has unique ids', () => {
    for (const list of [seedWords, seedPhrases, seedGrammarTopics]) {
      const ids = list.map((i) => i.id);
      expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    }
  });

  it('assigns every seed item to an existing topic', () => {
    expect([...seedWords, ...seedPhrases].filter((i) => !topicIds.has(i.category)).map((i) => i.id)).toEqual([]);
    expect(seedGrammarTopics.filter((g) => !g.topicId || !topicIds.has(g.topicId)).map((g) => g.id)).toEqual([]);
  });

  it('only has words (no rules) in extra topics', () => {
    const extra = new Set(TOPICS.filter((t) => t.group === 'extra').map((t) => t.id));
    expect(seedGrammarTopics.filter((g) => extra.has(g.topicId!))).toEqual([]);
  });
});
