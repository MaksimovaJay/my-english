import { Word } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

function w(partial: Omit<Word, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Word {
  return {
    id: `seed-word-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-24',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-24T00:00:00Z')),
    ...partial,
  };
}

export const seedWords: Word[] = [
  w({ english: 'mother', translation: 'мама', ipa: 'ˈmʌðər', ruPronunciation: 'мадэр / мазэр', example: 'My mother is at home.', exampleTranslation: 'Моя мама дома.', category: 'Family' }),
  w({ english: 'father', translation: 'папа', ipa: 'ˈfɑːðər', ruPronunciation: 'фазэр', example: 'My father works a lot.', exampleTranslation: 'Мой папа много работает.', category: 'Family' }),
  w({ english: 'chair', translation: 'стул', ipa: 'tʃer', ruPronunciation: 'чэйр', example: 'This is a chair.', exampleTranslation: 'Это стул.', category: 'Home' }),
  w({ english: 'table', translation: 'стол', ipa: 'ˈteɪbəl', ruPronunciation: 'тэйбл', example: 'The book is on the table.', exampleTranslation: 'Книга на столе.', category: 'Home' }),
  w({ english: 'fridge', translation: 'холодильник', ipa: 'frɪdʒ', ruPronunciation: 'фридж', example: 'The milk is in the fridge.', exampleTranslation: 'Молоко в холодильнике.', category: 'Home' }),
  w({ english: 'window', translation: 'окно', ipa: 'ˈwɪndoʊ', ruPronunciation: 'уиндоу', example: 'Open the window, please.', exampleTranslation: 'Открой окно, пожалуйста.', category: 'Home' }),
  w({ english: 'bread', translation: 'хлеб', ipa: 'bred', ruPronunciation: 'брэд', example: 'I need to buy some bread.', exampleTranslation: 'Мне нужно купить хлеб.', category: 'Food' }),
  w({ english: 'water', translation: 'вода', ipa: 'ˈwɔːtər', ruPronunciation: 'уотэр', example: 'Can I have some water?', exampleTranslation: 'Можно мне воды?', category: 'Food' }),
  w({ english: 'friend', translation: 'друг', ipa: 'frend', ruPronunciation: 'фрэнд', example: 'She is my best friend.', exampleTranslation: 'Она моя лучшая подруга.', category: 'People' }),
  w({ english: 'teacher', translation: 'учитель', ipa: 'ˈtiːtʃər', ruPronunciation: 'тичэр', example: 'My teacher is very kind.', exampleTranslation: 'Мой учитель очень добрый.', category: 'People' }),
  w({ english: 'street', translation: 'улица', ipa: 'striːt', ruPronunciation: 'стрит', example: 'We live on a quiet street.', exampleTranslation: 'Мы живём на тихой улице.', category: 'Travel' }),
  w({ english: 'airport', translation: 'аэропорт', ipa: 'ˈerpɔːrt', ruPronunciation: 'эаропорт', example: 'The airport is far from here.', exampleTranslation: 'Аэропорт далеко отсюда.', category: 'Travel' }),
  w({ english: 'left', translation: 'налево', ipa: 'left', ruPronunciation: 'лэфт', example: 'Turn left at the corner.', exampleTranslation: 'Поверни налево на углу.', category: 'Directions' }),
  w({ english: 'right', translation: 'направо', ipa: 'raɪt', ruPronunciation: 'райт', example: 'Turn right at the light.', exampleTranslation: 'Поверни направо на светофоре.', category: 'Directions' }),
  w({ english: 'meeting', translation: 'встреча', ipa: 'ˈmiːtɪŋ', ruPronunciation: 'митинг', example: 'The meeting starts at 9.', exampleTranslation: 'Встреча начинается в 9.', category: 'Work' }),
  w({ english: 'deadline', translation: 'срок сдачи', ipa: 'ˈdedlaɪn', ruPronunciation: 'дэдлайн', example: 'The deadline is Friday.', exampleTranslation: 'Срок сдачи — пятница.', category: 'Work' }),
  w({ english: 'morning', translation: 'утро', ipa: 'ˈmɔːrnɪŋ', ruPronunciation: 'морнинг', example: 'I run every morning.', exampleTranslation: 'Я бегаю каждое утро.', category: 'Daily Life' }),
  w({ english: 'tired', translation: 'уставший', ipa: 'ˈtaɪərd', ruPronunciation: 'тайэрд', example: "I'm tired today.", exampleTranslation: 'Я устал сегодня.', category: 'Daily Life' }),
];
