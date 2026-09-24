import { GrammarTopic } from '@/types/models';

export const seedGrammarTopics: GrammarTopic[] = [
  {
    id: 'seed-grammar-there-is-are',
    title: 'There is / There are',
    explanation: 'There is используется с одним предметом (единственное число). There are используется с несколькими предметами (множественное число).',
    examples: ['There is a chair in the room.', 'There are two chairs in the room.'],
    practiceExercises: [
      {
        id: 'seed-grammar-there-is-are-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите правильный вариант.',
        items: [
          { question: '___ a sofa in the room.', options: ['There is', 'There are'], correctIndex: 0 },
          { question: '___ three books on the table.', options: ['There is', 'There are'], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-24',
  },
  {
    id: 'seed-grammar-was-were',
    title: 'was / were (Past Simple of "to be")',
    explanation: 'was используется с I/he/she/it, were — с you/we/they. В вопросах и отрицаниях were/wasn\'t /weren\'t ставится перед подлежащим или после него по тем же правилам.',
    examples: ['She was 22 last year.', 'They were here a few minutes ago.'],
    practiceExercises: [
      {
        id: 'seed-grammar-was-were-ex1',
        type: 'fill-blank',
        instruction: 'Заполните пропуски, используя was/were.',
        items: [
          { text: 'Last year she ___ 22, so she is 23 now.', blanks: [['was']] },
          { text: 'They ___ very expensive.', blanks: [['were']] },
        ],
      },
    ],
  },
];
