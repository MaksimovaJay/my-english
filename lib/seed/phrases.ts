import { Phrase } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

function p(partial: Omit<Phrase, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Phrase {
  return {
    id: `seed-phrase-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-25',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-25T00:00:00Z')),
    ...partial,
  };
}

export const seedPhrases: Phrase[] = [
  // was / were
  p({ english: 'I was hungry.', translation: 'Я была голодная.', category: 'was-were' }),
  p({ english: 'He was my friend.', translation: 'Он был моим другом.', category: 'was-were' }),
  p({ english: 'She was in the USA.', translation: 'Она была в США.', category: 'was-were' }),
  p({ english: "I wasn't hungry.", translation: 'Я не была голодной.', category: 'was-were' }),
  p({ english: "He wasn't my friend.", translation: 'Он не был моим другом.', category: 'was-were' }),
  p({ english: "You weren't there.", translation: 'Тебя / вас там не было.', category: 'was-were' }),
  p({ english: "We weren't at home.", translation: 'Нас не было дома.', category: 'was-were' }),
  p({ english: "They weren't ready.", translation: 'Они не были готовы.', category: 'was-were' }),

  // Предлоги
  p({ english: 'The book is on the table.', translation: 'Книга на столе.', category: 'prepositions' }),
  p({ english: 'The cat is under the table.', translation: 'Кошка под столом.', category: 'prepositions' }),
  p({ english: 'The sofa is in the living room.', translation: 'Диван в гостиной.', category: 'prepositions' }),

  // There is / There are
  p({ english: 'There is a chair.', translation: 'Есть стул.', category: 'there-is-are' }),
  p({ english: 'There are two chairs.', translation: 'Есть два стула.', category: 'there-is-are' }),
  p({ english: "There isn't a chair.", translation: 'Нет стула.', category: 'there-is-are' }),
  p({ english: "There aren't any chairs.", translation: 'Нет стульев.', category: 'there-is-are' }),
  p({ english: 'Is there a sofa?', translation: 'Есть ли диван?', category: 'there-is-are' }),
  p({ english: 'Are there any chairs?', translation: 'Есть ли стулья?', category: 'there-is-are' }),
  p({ english: 'There are some chairs.', translation: 'Есть несколько стульев.', category: 'there-is-are' }),

  // Вопросы и просьбы с can
  p({ english: 'Can you drive a car?', translation: 'Ты умеешь водить машину?', category: 'can' }),
  p({ english: 'Can you swim?', translation: 'Ты умеешь плавать?', category: 'can' }),
  p({ english: 'Can you help me, please?', translation: 'Можешь мне помочь, пожалуйста?', category: 'can' }),
  p({ english: 'Can you repeat, please?', translation: 'Можешь повторить, пожалуйста?', category: 'can' }),
  p({ english: 'Can you speak more slowly?', translation: 'Можешь говорить помедленнее?', category: 'can' }),
  p({ english: 'Can you show me, please?', translation: 'Можешь показать мне, пожалуйста?', category: 'can' }),
  p({ english: 'Can you send me this?', translation: 'Можешь отправить мне это?', category: 'can' }),
  p({ english: 'Can you wait a minute?', translation: 'Можешь подождать минуту?', category: 'can' }),

  // Направления
  p({ english: 'Go straight on.', translation: 'Идите прямо.', category: 'directions' }),
  p({ english: 'Turn left.', translation: 'Поверните налево.', category: 'directions' }),
  p({ english: 'Turn right.', translation: 'Поверните направо.', category: 'directions' }),
  p({ english: 'Go past the bank.', translation: 'Пройдите мимо банка.', category: 'directions' }),
  p({ english: 'Cross the street.', translation: 'Перейдите улицу.', category: 'directions' }),
  p({ english: 'On the corner.', translation: 'На углу.', category: 'directions' }),
  p({ english: 'On the left.', translation: 'Слева.', category: 'directions' }),
  p({ english: 'On the right.', translation: 'Справа.', category: 'directions' }),
  p({ english: "I don't know where it is.", translation: 'Я не знаю, где это.', notes: 'После where порядок слов как в утверждении: where it is, а не where is it.', category: 'directions' }),

  // Present Simple: Do you...?
  p({ english: 'Do you work?', translation: 'Ты работаешь?', category: 'present-simple' }),
  p({ english: 'Do you live in Bishkek?', translation: 'Ты живёшь в Бишкеке?', category: 'present-simple' }),
  p({ english: 'Do you drink coffee?', translation: 'Ты пьёшь кофе?', category: 'present-simple' }),
  p({ english: 'Do you like your work?', translation: 'Тебе нравится твоя работа?', category: 'present-simple' }),
  p({ english: 'Do you want coffee?', translation: 'Ты хочешь кофе?', category: 'present-simple' }),
  p({ english: 'Do you have a dog?', translation: 'У тебя есть собака?', category: 'present-simple' }),
  p({ english: 'Do you go to work?', translation: 'Ты ходишь на работу?', category: 'present-simple' }),
  p({ english: 'Do you play games every day?', translation: 'Ты играешь в игры каждый день?', category: 'present-simple' }),
  p({ english: 'No, I prefer tea.', translation: 'Нет, я предпочитаю чай.', category: 'present-simple' }),
  p({ english: 'Give me the book, please.', translation: 'Дай мне книгу, пожалуйста.', category: 'present-simple' }),

  // О себе
  p({ english: 'I am 27 years old.', translation: 'Мне 27 лет.', category: 'about-me' }),
  p({ english: 'I am at home.', translation: 'Я дома.', category: 'about-me' }),
  p({ english: 'I am hungry.', translation: 'Я голодная.', category: 'about-me' }),
  p({ english: 'My name is Julia.', translation: 'Меня зовут Юлия.', category: 'about-me' }),
  p({ english: 'I am Jenya.', translation: 'Я Женя.', category: 'about-me' }),
  p({ english: 'I am from Kyrgyzstan.', translation: 'Я из Кыргызстана.', category: 'about-me' }),
  p({ english: 'I live in Kyrgyzstan.', translation: 'Я живу в Кыргызстане.', category: 'about-me' }),
  p({ english: 'He is 4 years old.', translation: 'Ему 4 года.', category: 'about-me' }),
];
