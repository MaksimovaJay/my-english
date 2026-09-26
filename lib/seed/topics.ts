import { Topic } from '@/types/models';

// Words and phrases join a topic via `category === topic.id`; grammar via `topicId`.
export const TOPICS: Topic[] = [
  // Пройдено на уроках
  { id: 'my-words', title: 'Мои слова', emoji: '✍️', group: 'class', order: 0 }, // added with «+ слово»; hidden while empty
  { id: 'pronouns-to-be', title: 'Местоимения и to be', emoji: '🙋', group: 'class', order: 1 },
  { id: 'about-me', title: 'О себе', emoji: '🪪', group: 'class', order: 2 },
  { id: 'home', title: 'Дом и квартира', emoji: '🏠', group: 'class', order: 3 },
  { id: 'prepositions', title: 'Предлоги места', emoji: '📍', group: 'class', order: 4 },
  { id: 'there-is-are', title: 'There is / There are, some / any', emoji: '🪑', group: 'class', order: 5 },
  { id: 'can', title: 'Can и глаголы', emoji: '💪', group: 'class', order: 6 },
  { id: 'present-simple', title: 'Do you…? и распорядок дня', emoji: '⏰', group: 'class', order: 7 },
  { id: 'directions', title: 'Направления', emoji: '🧭', group: 'class', order: 8 },
  { id: 'was-were', title: 'was / were', emoji: '⏪', group: 'class', order: 9 },
  { id: 'basic', title: 'Базовые слова', emoji: '🧱', group: 'class', order: 10 },
  { id: 'nature', title: 'Природа', emoji: '🌳', group: 'class', order: 11 },
  { id: 'numbers', title: 'Числа 0–10', emoji: '🔢', group: 'class', order: 12 },
  { id: 'rules', title: 'Главные правила', emoji: '📌', group: 'class', order: 13 },

  // Новое / не изученное
  { id: 'numbers-11-100', title: 'Числа 11–100', emoji: '💯', group: 'extra', order: 101 },
  { id: 'days', title: 'Дни недели', emoji: '📅', group: 'extra', order: 102 },
  { id: 'months', title: 'Месяцы', emoji: '🗓️', group: 'extra', order: 103 },
  { id: 'colors', title: 'Цвета', emoji: '🎨', group: 'extra', order: 104 },
  { id: 'family', title: 'Семья', emoji: '👨‍👩‍👧', group: 'extra', order: 105 },
  { id: 'food', title: 'Еда и напитки', emoji: '🍎', group: 'extra', order: 106 },
];

export const OTHER_TOPIC: Topic = { id: 'other', title: 'Другое', emoji: '📦', group: 'class', order: 999 };
