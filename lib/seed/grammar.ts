import { Exercise, GrammarTopic } from '@/types/models';

// Murphy, Essential Grammar in Use, Unit 11 (11.2–11.4). Shared by the was/were topic and ДЗ 1.
export const unit11Exercises: Exercise[] = [
  {
    id: 'seed-grammar-was-were-ex-11-2',
    type: 'fill-blank',
    instruction: '11.2 Заполните пропуски, используя am/is/are (настоящее время) или was/were (прошедшее время).',
    items: [
      { text: 'Last year she ___ 22, so she ___ 23 now.', blanks: [['was'], ['is']] },
      { text: 'Today the weather ___ nice, but yesterday it ___ very cold.', blanks: [['is'], ['was']] },
      { text: 'I ___ hungry. Can I have something to eat?', blanks: [['am']] },
      { text: 'I feel fine this morning, but I ___ very tired last night.', blanks: [['was']] },
      { text: "Where ___ you at 11 o'clock last Friday morning?", blanks: [['were']] },
      { text: "Don't buy those shoes. They ___ very expensive.", blanks: [['are']] },
      { text: 'I like your new jacket. ___ it expensive?', blanks: [['Was']] },
      { text: 'This time last year I ___ in Paris.', blanks: [['was']] },
      { text: "'Where ___ Sam and Joe?' — 'I don't know. They ___ here a few minutes ago.'", blanks: [['are'], ['were']] },
    ],
  },
  {
    id: 'seed-grammar-was-were-ex-11-3',
    type: 'fill-blank',
    instruction: "11.3 Заполните пропуски, используя was/were или wasn't/weren't.",
    items: [
      { text: "We weren't happy with the hotel. Our room ___ very small and it ___ clean.", blanks: [['was'], ["wasn't", 'was not']] },
      { text: "Mark ___ at work last week because he ___ ill. He's better now.", blanks: [["wasn't", 'was not'], ['was']] },
      { text: "Yesterday ___ a public holiday, so the banks ___ closed. They're open today.", blanks: [['was'], ['were']] },
      { text: "'___ Kate and Ben at the party?' — 'Kate ___ there, but Ben ___.'", blanks: [['Were'], ['was'], ["wasn't", 'was not']] },
      { text: "Where are my keys? They ___ on the table, but they're not there now.", blanks: [['were']] },
      { text: 'You ___ at home last night. Where ___ you?', blanks: [["weren't", 'were not'], ['were']] },
    ],
  },
  {
    id: 'seed-grammar-was-were-ex-11-4',
    type: 'fill-blank',
    instruction: '11.4 Составьте вопросы из слов + was/were, соблюдая правильный порядок слов. Пример: (late / you / this morning / why?) → Why were you late this morning?',
    items: [
      { text: '(difficult / your exam?) → ___ — No, it was easy.', blanks: [['Was your exam difficult?']] },
      { text: '(last week / where / Sue and Chris?) → ___ — They were on holiday.', blanks: [['Where were Sue and Chris last week?']] },
      { text: '(your new camera / how much?) → ___ — A hundred pounds.', blanks: [['How much was your new camera?']] },
      { text: '(angry / you / yesterday / why?) → ___ — Because you were late.', blanks: [['Why were you angry yesterday?']] },
      { text: '(nice / the weather / last week?) → ___ — Yes, it was beautiful.', blanks: [['Was the weather nice last week?']] },
    ],
  },
];


export const seedGrammarTopics: GrammarTopic[] = [
  {
    id: 'seed-grammar-to-be-present',
    topicId: 'pronouns-to-be',
    title: 'to be: am / is / are',
    explanation:
      'am — с I.\nis — с he / she / it.\nare — с you / we / they.\n\nI am · you are · he is · she is · it is · we are · they are',
    examples: ['I am at home.', 'He is 4 years old.', 'We are from Kyrgyzstan.'],
    practiceExercises: [
      {
        id: 'seed-grammar-to-be-present-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите am / is / are.',
        items: [
          { question: 'I ___ hungry.', options: ['am', 'is', 'are'], correctIndex: 0 },
          { question: 'She ___ my friend.', options: ['am', 'is', 'are'], correctIndex: 1 },
          { question: 'They ___ at home.', options: ['am', 'is', 'are'], correctIndex: 2 },
          { question: 'It ___ a chair.', options: ['am', 'is', 'are'], correctIndex: 1 },
          { question: 'You ___ tired.', options: ['am', 'is', 'are'], correctIndex: 2 },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-was-were',
    topicId: 'was-were',
    title: 'was / were (прошедшее время to be)',
    explanation:
      'was — с I / he / she / it.\nwere — с you / we / they.\n\nwasn\'t = was not\nweren\'t = were not\n\nВ вопросе was/were ставится перед подлежащим: Why were you late? Was your exam difficult?',
    examples: ['I was hungry.', 'She was in the USA.', "You weren't there.", "They weren't ready.", 'Why were you late this morning?'],
    practiceExercises: unit11Exercises,
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-there-is-are',
    topicId: 'there-is-are',
    title: 'There is / There are',
    explanation:
      'There is + один предмет.\nThere are + несколько предметов.\n\nThere isn\'t — нет одного предмета.\nThere aren\'t — нет нескольких предметов.\n\nIs there ...? / Are there ...? — Есть ли ...?',
    examples: ['There is a chair.', 'There are two chairs.', "There isn't a chair.", "There aren't any chairs.", 'Is there a sofa?', 'Are there any chairs?'],
    practiceExercises: [
      {
        id: 'seed-grammar-there-is-are-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите правильный вариант.',
        items: [
          { question: '___ a sofa in the living room.', options: ['There is', 'There are'], correctIndex: 0 },
          { question: '___ three books on the shelf.', options: ['There is', 'There are'], correctIndex: 1 },
          { question: '___ any chairs in the kitchen?', options: ['Is there', 'Are there'], correctIndex: 1 },
          { question: '___ a fridge in the kitchen?', options: ['Is there', 'Are there'], correctIndex: 0 },
          { question: "There ___ any toys on the floor.", options: ["isn't", "aren't"], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-some-any',
    topicId: 'there-is-are',
    title: 'some / any',
    explanation: 'some — обычно в утверждениях.\nany — часто в вопросах и отрицаниях.',
    examples: ['There are some chairs.', 'Are there any chairs?', "There aren't any chairs."],
    practiceExercises: [
      {
        id: 'seed-grammar-some-any-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите some или any.',
        items: [
          { question: 'There are ___ books on the table.', options: ['some', 'any'], correctIndex: 0 },
          { question: 'Are there ___ cups in the cupboard?', options: ['some', 'any'], correctIndex: 1 },
          { question: "There aren't ___ chairs in the bedroom.", options: ['some', 'any'], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-can',
    topicId: 'can',
    title: "can / can't",
    explanation:
      "can / can't + глагол без to.\n\nI can swim. — Я умею плавать.\nI can't drive. — Я не умею водить.\n\nВопрос и просьба: Can you ...?",
    examples: ['Can you swim?', 'Can you help me, please?', 'Can you speak more slowly?', 'Can you wait a minute?'],
    practiceExercises: [
      {
        id: 'seed-grammar-can-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите правильный вариант.',
        items: [
          { question: 'I can ___ English.', options: ['speak', 'to speak'], correctIndex: 0 },
          { question: "She can't ___ a car.", options: ['to drive', 'drive'], correctIndex: 1 },
          { question: '___ help me, please?', options: ['You can', 'Can you'], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-prepositions',
    topicId: 'prepositions',
    title: 'Предлоги места: in / on / under ...',
    explanation:
      'in — в / внутри\non — на\nunder — под\nin front of — перед\nnext to — рядом с\nopposite — напротив\naround — вокруг',
    examples: ['The book is on the table.', 'The cat is under the table.', 'The sofa is in the living room.'],
    practiceExercises: [
      {
        id: 'seed-grammar-prepositions-ex1',
        type: 'fill-blank',
        instruction: 'Вставьте предлог: in / on / under.',
        items: [
          { text: 'The book is ___ the table. (на)', blanks: [['on']] },
          { text: 'The cat is ___ the table. (под)', blanks: [['under']] },
          { text: 'The sofa is ___ the living room. (в)', blanks: [['in']] },
          { text: 'The lamp is ___ the bed. (рядом с)', blanks: [['next to']] },
          { text: 'The TV is ___ the sofa. (напротив)', blanks: [['opposite']] },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-do-you',
    topicId: 'present-simple',
    title: 'Do you ...? (Present Simple)',
    explanation: 'В вопросе Do you ...? используется базовая форма глагола (без -s и без to).\n\nОтветы: Yes, I do. / No, I don\'t. / No, I prefer tea.',
    examples: ['Do you work?', 'Do you live in Bishkek?', 'Do you drink coffee?', 'No, I prefer tea.'],
    practiceExercises: [
      {
        id: 'seed-grammar-do-you-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите правильный вопрос.',
        items: [
          { question: 'Ты пьёшь кофе?', options: ['Do you drink coffee?', 'You drink coffee?', 'Do you drinks coffee?'], correctIndex: 0 },
          { question: 'У тебя есть собака?', options: ['Are you have a dog?', 'Do you have a dog?', 'Do you has a dog?'], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-where-word-order',
    topicId: 'directions',
    title: "I don't know where it is",
    explanation:
      'После where внутри предложения порядок слов как в утверждении: where + подлежащее + глагол.\n\n✔ I don\'t know where it is.\n✘ I don\'t know where is it.',
    examples: ["I don't know where it is. — Я не знаю, где это."],
    practiceExercises: [
      {
        id: 'seed-grammar-where-word-order-ex1',
        type: 'multiple-choice',
        instruction: 'Выберите правильный вариант.',
        items: [
          { question: 'Я не знаю, где это.', options: ["I don't know where is it.", "I don't know where it is."], correctIndex: 1 },
        ],
      },
    ],
    dateAdded: '2026-09-25',
  },
  {
    id: 'seed-grammar-main-rules',
    topicId: 'rules',
    title: 'Главные правила (шпаргалка)',
    explanation:
      "1) После can/can't — глагол без to.\n2) am — с I; is — с he/she/it; are — с you/we/they.\n3) В прошедшем: was — I/he/she/it; were — you/we/they.\n4) wasn't = was not; weren't = were not.\n5) There is — один предмет; There are — несколько.\n6) some — в утверждениях; any — в вопросах и отрицаниях.\n7) В вопросах Do you...? — базовая форма глагола.\n8) I don't know where it is — where + подлежащее + глагол.\n9) in = в, on = на, under = под; in front of, next to, opposite.",
    examples: [],
    practiceExercises: [],
    dateAdded: '2026-09-25',
  },
];
