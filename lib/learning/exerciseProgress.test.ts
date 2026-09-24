import { describe, it, expect } from 'vitest';
import { initFillBlankAnswers, initMultipleChoiceAnswers, scoreFillBlank, scoreMultipleChoice } from './exerciseProgress';

describe('initFillBlankAnswers', () => {
  it('creates an empty-string slot per blank per item', () => {
    const items = [{ text: 'a ___ b ___ c', blanks: [['x'], ['y']] }, { text: 'd ___ e', blanks: [['z']] }];
    expect(initFillBlankAnswers(items)).toEqual([['', ''], ['']]);
  });
});

describe('initMultipleChoiceAnswers', () => {
  it('creates a null slot per item', () => {
    const items = [{ question: 'q1', options: ['a', 'b'], correctIndex: 0 }, { question: 'q2', options: ['a', 'b'], correctIndex: 1 }];
    expect(initMultipleChoiceAnswers(items)).toEqual([null, null]);
  });
});

describe('scoreFillBlank', () => {
  it('counts items where every blank matches', () => {
    const items = [{ text: 'she ___ 22', blanks: [['was']] }, { text: 'they ___ here', blanks: [['were']] }];
    expect(scoreFillBlank(items, [['was'], ['are']])).toEqual({ correct: 1, total: 2 });
  });
});

describe('scoreMultipleChoice', () => {
  it('counts items where the selected index matches correctIndex', () => {
    const items = [{ question: 'q1', options: ['a', 'b'], correctIndex: 0 }, { question: 'q2', options: ['a', 'b'], correctIndex: 1 }];
    expect(scoreMultipleChoice(items, [0, 0])).toEqual({ correct: 1, total: 2 });
  });
});
