import { Word } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

// «Новое / не изученное»: words not yet covered in class, for learning ahead.
function w(partial: Omit<Word, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Word {
  return {
    id: `seed-word-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-25',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-25T00:00:00Z')),
    ...partial,
  };
}

export const seedExtraWords: Word[] = [
  // Числа 11–100
  w({ english: 'eleven', translation: '11', ipa: 'ɪˈlevən', ruPronunciation: 'илЭвн', category: 'numbers-11-100' }),
  w({ english: 'twelve', translation: '12', ipa: 'twelv', ruPronunciation: 'твэлв', category: 'numbers-11-100' }),
  w({ english: 'thirteen', translation: '13', ipa: 'ˌθɜːˈtiːn', ruPronunciation: 'сётИн', category: 'numbers-11-100' }),
  w({ english: 'fourteen', translation: '14', ipa: 'ˌfɔːˈtiːn', ruPronunciation: 'фотИн', category: 'numbers-11-100' }),
  w({ english: 'fifteen', translation: '15', ipa: 'ˌfɪfˈtiːn', ruPronunciation: 'фифтИн', category: 'numbers-11-100' }),
  w({ english: 'sixteen', translation: '16', ipa: 'ˌsɪkˈstiːn', ruPronunciation: 'сикстИн', category: 'numbers-11-100' }),
  w({ english: 'seventeen', translation: '17', ipa: 'ˌsevənˈtiːn', ruPronunciation: 'сэвэнтИн', category: 'numbers-11-100' }),
  w({ english: 'eighteen', translation: '18', ipa: 'ˌeɪˈtiːn', ruPronunciation: 'эйтИн', category: 'numbers-11-100' }),
  w({ english: 'nineteen', translation: '19', ipa: 'ˌnaɪnˈtiːn', ruPronunciation: 'найнтИн', category: 'numbers-11-100' }),
  w({ english: 'twenty', translation: '20', ipa: 'ˈtwenti', ruPronunciation: 'твЭнти', category: 'numbers-11-100' }),
  w({ english: 'twenty-one', translation: '21', ipa: 'ˌtwenti ˈwʌn', ruPronunciation: 'твЭнти уАн', notes: 'Так же строятся 22–99: twenty-two, thirty-five, ninety-nine.', category: 'numbers-11-100' }),
  w({ english: 'thirty', translation: '30', ipa: 'ˈθɜːti', ruPronunciation: 'сЁти', notes: 'thirteen (13) — ударение в конце, thirty (30) — в начале.', category: 'numbers-11-100' }),
  w({ english: 'forty', translation: '40', ipa: 'ˈfɔːti', ruPronunciation: 'фОти', notes: 'Пишется без u: forty, хотя four.', category: 'numbers-11-100' }),
  w({ english: 'fifty', translation: '50', ipa: 'ˈfɪfti', ruPronunciation: 'фИфти', category: 'numbers-11-100' }),
  w({ english: 'sixty', translation: '60', ipa: 'ˈsɪksti', ruPronunciation: 'сИксти', category: 'numbers-11-100' }),
  w({ english: 'seventy', translation: '70', ipa: 'ˈsevənti', ruPronunciation: 'сЭвэнти', category: 'numbers-11-100' }),
  w({ english: 'eighty', translation: '80', ipa: 'ˈeɪti', ruPronunciation: 'Эйти', category: 'numbers-11-100' }),
  w({ english: 'ninety', translation: '90', ipa: 'ˈnaɪnti', ruPronunciation: 'нАйнти', category: 'numbers-11-100' }),
  w({ english: 'one hundred', translation: '100', ipa: 'wʌn ˈhʌndrəd', ruPronunciation: 'уан хАндрэд', example: 'A hundred pounds.', exampleTranslation: 'Сто фунтов.', category: 'numbers-11-100' }),

  // Дни недели
  w({ english: 'Monday', translation: 'понедельник', ipa: 'ˈmʌndeɪ', ruPronunciation: 'мАндэй', example: 'I work on Monday.', exampleTranslation: 'Я работаю в понедельник.', category: 'days' }),
  w({ english: 'Tuesday', translation: 'вторник', ipa: 'ˈtjuːzdeɪ', ruPronunciation: 'тьЮздэй', example: 'See you on Tuesday.', exampleTranslation: 'Увидимся во вторник.', category: 'days' }),
  w({ english: 'Wednesday', translation: 'среда', ipa: 'ˈwenzdeɪ', ruPronunciation: 'уЭнздэй', notes: 'Первая d не читается.', example: 'Today is Wednesday.', exampleTranslation: 'Сегодня среда.', category: 'days' }),
  w({ english: 'Thursday', translation: 'четверг', ipa: 'ˈθɜːzdeɪ', ruPronunciation: 'сЁздэй', example: 'I have English on Thursday.', exampleTranslation: 'У меня английский в четверг.', category: 'days' }),
  w({ english: 'Friday', translation: 'пятница', ipa: 'ˈfraɪdeɪ', ruPronunciation: 'фрАйдэй', example: 'Where were you last Friday?', exampleTranslation: 'Где ты была в прошлую пятницу?', category: 'days' }),
  w({ english: 'Saturday', translation: 'суббота', ipa: 'ˈsætədeɪ', ruPronunciation: 'сЭтэдэй', example: 'We go to the market on Saturday.', exampleTranslation: 'В субботу мы ходим на рынок.', category: 'days' }),
  w({ english: 'Sunday', translation: 'воскресенье', ipa: 'ˈsʌndeɪ', ruPronunciation: 'сАндэй', example: 'I am at home on Sunday.', exampleTranslation: 'В воскресенье я дома.', category: 'days' }),

  // Месяцы
  w({ english: 'January', translation: 'январь', ipa: 'ˈdʒænjuəri', ruPronunciation: 'джЭнюэри', category: 'months' }),
  w({ english: 'February', translation: 'февраль', ipa: 'ˈfebruəri', ruPronunciation: 'фЭбруэри', category: 'months' }),
  w({ english: 'March', translation: 'март', ipa: 'mɑːtʃ', ruPronunciation: 'мАрч', category: 'months' }),
  w({ english: 'April', translation: 'апрель', ipa: 'ˈeɪprəl', ruPronunciation: 'Эйпрэл', category: 'months' }),
  w({ english: 'May', translation: 'май', ipa: 'meɪ', ruPronunciation: 'мэй', category: 'months' }),
  w({ english: 'June', translation: 'июнь', ipa: 'dʒuːn', ruPronunciation: 'джун', category: 'months' }),
  w({ english: 'July', translation: 'июль', ipa: 'dʒuˈlaɪ', ruPronunciation: 'джулАй', category: 'months' }),
  w({ english: 'August', translation: 'август', ipa: 'ˈɔːɡəst', ruPronunciation: 'Огэст', category: 'months' }),
  w({ english: 'September', translation: 'сентябрь', ipa: 'sepˈtembə', ruPronunciation: 'сэптЭмбэ', category: 'months' }),
  w({ english: 'October', translation: 'октябрь', ipa: 'ɒkˈtəʊbə', ruPronunciation: 'октОубэ', category: 'months' }),
  w({ english: 'November', translation: 'ноябрь', ipa: 'nəʊˈvembə', ruPronunciation: 'ноувЭмбэ', category: 'months' }),
  w({ english: 'December', translation: 'декабрь', ipa: 'dɪˈsembə', ruPronunciation: 'дисЭмбэ', category: 'months' }),

  // Цвета
  w({ english: 'red', translation: 'красный', ipa: 'red', ruPronunciation: 'рэд', example: 'The sofa is red.', exampleTranslation: 'Диван красный.', category: 'colors' }),
  w({ english: 'blue', translation: 'синий / голубой', ipa: 'bluː', ruPronunciation: 'блу', example: 'My car is blue.', exampleTranslation: 'Моя машина синяя.', category: 'colors' }),
  w({ english: 'green', translation: 'зелёный', ipa: 'ɡriːn', ruPronunciation: 'грин', example: 'The grass is green.', exampleTranslation: 'Трава зелёная.', category: 'colors' }),
  w({ english: 'yellow', translation: 'жёлтый', ipa: 'ˈjeləʊ', ruPronunciation: 'йЕлоу', example: 'The lamp is yellow.', exampleTranslation: 'Лампа жёлтая.', category: 'colors' }),
  w({ english: 'black', translation: 'чёрный', ipa: 'blæk', ruPronunciation: 'блэк', example: 'I drink black coffee.', exampleTranslation: 'Я пью чёрный кофе.', category: 'colors' }),
  w({ english: 'white', translation: 'белый', ipa: 'waɪt', ruPronunciation: 'уайт', example: 'The fridge is white.', exampleTranslation: 'Холодильник белый.', category: 'colors' }),
  w({ english: 'grey', translation: 'серый', ipa: 'ɡreɪ', ruPronunciation: 'грэй', example: 'The rug is grey.', exampleTranslation: 'Ковёр серый.', category: 'colors' }),
  w({ english: 'brown', translation: 'коричневый', ipa: 'braʊn', ruPronunciation: 'браун', example: 'The table is brown.', exampleTranslation: 'Стол коричневый.', category: 'colors' }),
  w({ english: 'orange', translation: 'оранжевый / апельсин', ipa: 'ˈɒrɪndʒ', ruPronunciation: 'Ориндж', example: 'I like orange juice.', exampleTranslation: 'Мне нравится апельсиновый сок.', category: 'colors' }),
  w({ english: 'pink', translation: 'розовый', ipa: 'pɪŋk', ruPronunciation: 'пинк', example: 'Her bag is pink.', exampleTranslation: 'Её сумка розовая.', category: 'colors' }),

  // Семья
  w({ english: 'mother', translation: 'мама', ipa: 'ˈmʌðə', ruPronunciation: 'мАзэ', example: 'My mother is at home.', exampleTranslation: 'Моя мама дома.', category: 'family' }),
  w({ english: 'father', translation: 'папа', ipa: 'ˈfɑːðə', ruPronunciation: 'фАзэ', example: 'My father can drive.', exampleTranslation: 'Мой папа умеет водить.', category: 'family' }),
  w({ english: 'parents', translation: 'родители', ipa: 'ˈpeərənts', ruPronunciation: 'пЭарэнтс', example: 'My parents live in Bishkek.', exampleTranslation: 'Мои родители живут в Бишкеке.', category: 'family' }),
  w({ english: 'sister', translation: 'сестра', ipa: 'ˈsɪstə', ruPronunciation: 'сИстэ', example: 'I have a sister.', exampleTranslation: 'У меня есть сестра.', category: 'family' }),
  w({ english: 'brother', translation: 'брат', ipa: 'ˈbrʌðə', ruPronunciation: 'брАзэ', example: 'My brother is 30 years old.', exampleTranslation: 'Моему брату 30 лет.', category: 'family' }),
  w({ english: 'wife', translation: 'жена', ipa: 'waɪf', ruPronunciation: 'уайф', example: 'His wife is a teacher.', exampleTranslation: 'Его жена — учительница.', category: 'family' }),
  w({ english: 'son', translation: 'сын', ipa: 'sʌn', ruPronunciation: 'сан', example: 'My son is 4 years old.', exampleTranslation: 'Моему сыну 4 года.', category: 'family' }),
  w({ english: 'daughter', translation: 'дочь', ipa: 'ˈdɔːtə', ruPronunciation: 'дОтэ', example: 'She has a daughter.', exampleTranslation: 'У неё есть дочь.', category: 'family' }),
  w({ english: 'children', translation: 'дети', ipa: 'ˈtʃɪldrən', ruPronunciation: 'чИлдрэн', notes: 'Единственное число: child — ребёнок.', example: 'The children are in the garden.', exampleTranslation: 'Дети в саду.', category: 'family' }),
  w({ english: 'grandmother', translation: 'бабушка', ipa: 'ˈɡrænmʌðə', ruPronunciation: 'грЭнмазэ', example: 'My grandmother lives with us.', exampleTranslation: 'Моя бабушка живёт с нами.', category: 'family' }),
  w({ english: 'grandfather', translation: 'дедушка', ipa: 'ˈɡrænfɑːðə', ruPronunciation: 'грЭнфазэ', example: 'My grandfather was a driver.', exampleTranslation: 'Мой дедушка был водителем.', category: 'family' }),

  // Еда и напитки
  w({ english: 'water', translation: 'вода', ipa: 'ˈwɔːtə', ruPronunciation: 'уОтэ', example: 'Can I have some water?', exampleTranslation: 'Можно мне воды?', category: 'food' }),
  w({ english: 'tea', translation: 'чай', ipa: 'tiː', ruPronunciation: 'ти', example: 'No, I prefer tea.', exampleTranslation: 'Нет, я предпочитаю чай.', category: 'food' }),
  w({ english: 'coffee', translation: 'кофе', ipa: 'ˈkɒfi', ruPronunciation: 'кОфи', example: 'Do you want coffee?', exampleTranslation: 'Ты хочешь кофе?', category: 'food' }),
  w({ english: 'milk', translation: 'молоко', ipa: 'mɪlk', ruPronunciation: 'милк', example: 'The milk is in the fridge.', exampleTranslation: 'Молоко в холодильнике.', category: 'food' }),
  w({ english: 'juice', translation: 'сок', ipa: 'dʒuːs', ruPronunciation: 'джус', example: 'I drink juice every day.', exampleTranslation: 'Я пью сок каждый день.', category: 'food' }),
  w({ english: 'bread', translation: 'хлеб', ipa: 'bred', ruPronunciation: 'брэд', example: 'There is some bread on the table.', exampleTranslation: 'На столе есть хлеб.', category: 'food' }),
  w({ english: 'cheese', translation: 'сыр', ipa: 'tʃiːz', ruPronunciation: 'чиз', example: 'Is there any cheese?', exampleTranslation: 'Есть сыр?', category: 'food' }),
  w({ english: 'egg', translation: 'яйцо', ipa: 'eɡ', ruPronunciation: 'эг', example: 'I have an egg for breakfast.', exampleTranslation: 'На завтрак я ем яйцо.', category: 'food' }),
  w({ english: 'meat', translation: 'мясо', ipa: 'miːt', ruPronunciation: 'мит', example: "I don't eat meat.", exampleTranslation: 'Я не ем мясо.', category: 'food' }),
  w({ english: 'fish', translation: 'рыба', ipa: 'fɪʃ', ruPronunciation: 'фиш', example: 'We have fish for dinner.', exampleTranslation: 'На ужин у нас рыба.', category: 'food' }),
  w({ english: 'rice', translation: 'рис', ipa: 'raɪs', ruPronunciation: 'райс', example: 'There is rice in the cupboard.', exampleTranslation: 'В шкафу есть рис.', category: 'food' }),
  w({ english: 'apple', translation: 'яблоко', ipa: 'ˈæpəl', ruPronunciation: 'Эпл', example: 'There are some apples on the table.', exampleTranslation: 'На столе несколько яблок.', category: 'food' }),
  w({ english: 'eat', translation: 'есть (кушать)', ipa: 'iːt', ruPronunciation: 'ит', example: 'Can I have something to eat?', exampleTranslation: 'Можно мне что-нибудь поесть?', category: 'food' }),
];
