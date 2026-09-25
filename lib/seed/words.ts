import { Word } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';
import { seedExtraWords } from './extraWords';

function w(partial: Omit<Word, 'id' | 'dateAdded' | 'review' | 'tags'> & { tags?: string[] }): Word {
  return {
    id: `seed-word-${partial.english.replace(/\s+/g, '-').toLowerCase()}`,
    dateAdded: '2026-09-25',
    tags: partial.tags ?? [],
    review: createInitialReviewState(new Date('2026-09-25T00:00:00Z')),
    ...partial,
  };
}

export const seedWords: Word[] = [
  // 1. Местоимения
  w({ english: 'I', translation: 'я', ipa: 'aɪ', ruPronunciation: 'ай', example: 'I am at home.', exampleTranslation: 'Я дома.', category: 'pronouns-to-be' }),
  w({ english: 'you', translation: 'ты / вы', ipa: 'juː', ruPronunciation: 'ю', example: 'You are my friend.', exampleTranslation: 'Ты мой друг.', category: 'pronouns-to-be' }),
  w({ english: 'he', translation: 'он', ipa: 'hiː', ruPronunciation: 'хи', example: 'He is 4 years old.', exampleTranslation: 'Ему 4 года.', category: 'pronouns-to-be' }),
  w({ english: 'she', translation: 'она', ipa: 'ʃiː', ruPronunciation: 'ши', example: 'She was in the USA.', exampleTranslation: 'Она была в США.', category: 'pronouns-to-be' }),
  w({ english: 'it', translation: 'это / оно', ipa: 'ɪt', ruPronunciation: 'ит', example: 'It is a chair.', exampleTranslation: 'Это стул.', category: 'pronouns-to-be' }),
  w({ english: 'we', translation: 'мы', ipa: 'wiː', ruPronunciation: 'уи', example: "We weren't at home.", exampleTranslation: 'Нас не было дома.', category: 'pronouns-to-be' }),
  w({ english: 'they', translation: 'они', ipa: 'ðeɪ', ruPronunciation: 'зэй', example: "They weren't ready.", exampleTranslation: 'Они не были готовы.', category: 'pronouns-to-be' }),
  w({ english: 'me', translation: 'мне / меня', ipa: 'miː', ruPronunciation: 'ми', example: 'Can you help me, please?', exampleTranslation: 'Можешь мне помочь, пожалуйста?', category: 'pronouns-to-be' }),

  // 4. Дом и квартира
  w({ english: 'flat', translation: 'квартира', ipa: 'flæt', ruPronunciation: 'флэт', example: 'My flat is small.', exampleTranslation: 'Моя квартира маленькая.', category: 'home' }),
  w({ english: 'apartment', translation: 'квартира', ipa: 'əˈpɑːtmənt', ruPronunciation: 'эпАртмэнт', example: 'There are three rooms in the apartment.', exampleTranslation: 'В квартире три комнаты.', category: 'home' }),
  w({ english: 'living room', translation: 'гостиная', ipa: 'ˈlɪvɪŋ ruːm', ruPronunciation: 'ливинг рум', example: 'The sofa is in the living room.', exampleTranslation: 'Диван в гостиной.', category: 'home' }),
  w({ english: 'dining room', translation: 'столовая', ipa: 'ˈdaɪnɪŋ ruːm', ruPronunciation: 'дайнинг рум', example: 'The table is in the dining room.', exampleTranslation: 'Стол в столовой.', category: 'home' }),
  w({ english: 'kitchen', translation: 'кухня', ipa: 'ˈkɪtʃɪn', ruPronunciation: 'китчен', example: 'The fridge is in the kitchen.', exampleTranslation: 'Холодильник на кухне.', category: 'home' }),
  w({ english: 'bedroom', translation: 'спальня', ipa: 'ˈbedruːm', ruPronunciation: 'бэдрум', example: 'There is a bed in the bedroom.', exampleTranslation: 'В спальне есть кровать.', category: 'home' }),
  w({ english: 'bathroom', translation: 'ванная / санузел', ipa: 'ˈbɑːθruːm', ruPronunciation: 'бАсрум', example: 'Where is the bathroom?', exampleTranslation: 'Где ванная?', category: 'home' }),
  w({ english: 'bed', translation: 'кровать', ipa: 'bed', ruPronunciation: 'бэд', example: 'The cat is on the bed.', exampleTranslation: 'Кошка на кровати.', category: 'home' }),
  w({ english: 'table', translation: 'стол', ipa: 'ˈteɪbəl', ruPronunciation: 'тэйбл', example: 'The book is on the table.', exampleTranslation: 'Книга на столе.', category: 'home' }),
  w({ english: 'chair', translation: 'стул', ipa: 'tʃeə', ruPronunciation: 'чэа', example: 'There is a chair.', exampleTranslation: 'Есть стул.', category: 'home' }),
  w({ english: 'sofa', translation: 'диван', ipa: 'ˈsəʊfə', ruPronunciation: 'сОуфа', example: 'Is there a sofa?', exampleTranslation: 'Есть ли диван?', category: 'home' }),
  w({ english: 'fridge', translation: 'холодильник', ipa: 'frɪdʒ', ruPronunciation: 'фридж', example: 'The milk is in the fridge.', exampleTranslation: 'Молоко в холодильнике.', category: 'home' }),
  w({ english: 'lamp', translation: 'лампа', ipa: 'læmp', ruPronunciation: 'лэмп', example: 'The lamp is next to the bed.', exampleTranslation: 'Лампа рядом с кроватью.', category: 'home' }),
  w({ english: 'TV', translation: 'телевизор', ipa: 'ˌtiːˈviː', ruPronunciation: 'ти-вИ', example: 'The TV is opposite the sofa.', exampleTranslation: 'Телевизор напротив дивана.', category: 'home' }),
  w({ english: 'rug', translation: 'коврик / ковёр', ipa: 'rʌɡ', ruPronunciation: 'раг', example: 'The rug is on the floor.', exampleTranslation: 'Ковёр на полу.', category: 'home' }),
  w({ english: 'cupboard', translation: 'шкаф', ipa: 'ˈkʌbəd', ruPronunciation: 'кАбэд', example: 'The cups are in the cupboard.', exampleTranslation: 'Чашки в шкафу.', category: 'home' }),
  w({ english: 'shelf', translation: 'полка', ipa: 'ʃelf', ruPronunciation: 'шэлф', example: 'The book is on the shelf.', exampleTranslation: 'Книга на полке.', category: 'home' }),
  w({ english: 'floor', translation: 'пол', ipa: 'flɔː', ruPronunciation: 'флор', example: 'The toys are on the floor.', exampleTranslation: 'Игрушки на полу.', category: 'home' }),

  // 5. Предлоги и место
  w({ english: 'in', translation: 'в / внутри', ipa: 'ɪn', ruPronunciation: 'ин', example: 'The sofa is in the living room.', exampleTranslation: 'Диван в гостиной.', category: 'prepositions' }),
  w({ english: 'on', translation: 'на', ipa: 'ɒn', ruPronunciation: 'он', example: 'The book is on the table.', exampleTranslation: 'Книга на столе.', category: 'prepositions' }),
  w({ english: 'under', translation: 'под', ipa: 'ˈʌndə', ruPronunciation: 'андэ', example: 'The cat is under the table.', exampleTranslation: 'Кошка под столом.', category: 'prepositions' }),
  w({ english: 'in front of', translation: 'перед', ipa: 'ɪn frʌnt əv', ruPronunciation: 'ин франт оф', example: 'The rug is in front of the sofa.', exampleTranslation: 'Ковёр перед диваном.', category: 'prepositions' }),
  w({ english: 'next to', translation: 'рядом с', ipa: 'nekst tuː', ruPronunciation: 'нэкст ту', example: 'The lamp is next to the bed.', exampleTranslation: 'Лампа рядом с кроватью.', category: 'prepositions' }),
  w({ english: 'opposite', translation: 'напротив', ipa: 'ˈɒpəzɪt', ruPronunciation: 'Опэзит', example: 'The TV is opposite the sofa.', exampleTranslation: 'Телевизор напротив дивана.', category: 'prepositions' }),
  w({ english: 'around', translation: 'вокруг', ipa: 'əˈraʊnd', ruPronunciation: 'эрАунд', example: 'There are chairs around the table.', exampleTranslation: 'Вокруг стола стулья.', category: 'prepositions' }),
  w({ english: 'here', translation: 'здесь', ipa: 'hɪə', ruPronunciation: 'хиэ', example: 'They were here a few minutes ago.', exampleTranslation: 'Они были здесь несколько минут назад.', category: 'prepositions' }),
  w({ english: 'there', translation: 'там', ipa: 'ðeə', ruPronunciation: 'зэа', example: "You weren't there.", exampleTranslation: 'Тебя там не было.', category: 'prepositions' }),
  w({ english: 'back', translation: 'назад / обратно', ipa: 'bæk', ruPronunciation: 'бэк', example: 'Come back, please.', exampleTranslation: 'Вернись, пожалуйста.', category: 'prepositions' }),

  // 12. Направления
  w({ english: 'left', translation: 'налево / слева', ipa: 'left', ruPronunciation: 'лэфт', example: 'Turn left.', exampleTranslation: 'Поверните налево.', category: 'directions' }),
  w({ english: 'right', translation: 'направо / справа', ipa: 'raɪt', ruPronunciation: 'райт', example: 'On the right.', exampleTranslation: 'Справа.', category: 'directions' }),
  w({ english: 'straight on', translation: 'прямо', ipa: 'streɪt ɒn', ruPronunciation: 'стрэйт он', example: 'Go straight on.', exampleTranslation: 'Идите прямо.', category: 'directions' }),
  w({ english: 'corner', translation: 'угол', ipa: 'ˈkɔːnə', ruPronunciation: 'кОнэ', example: 'On the corner.', exampleTranslation: 'На углу.', category: 'directions' }),
  w({ english: 'cross', translation: 'переходить', ipa: 'krɒs', ruPronunciation: 'крос', example: 'Cross the street.', exampleTranslation: 'Перейдите улицу.', category: 'directions' }),

  // 8. Глаголы (can / can't)
  w({ english: 'speak', translation: 'говорить', ipa: 'spiːk', ruPronunciation: 'спик', example: 'I can speak English.', exampleTranslation: 'Я умею говорить по-английски.', category: 'can' }),
  w({ english: 'jump', translation: 'прыгать', ipa: 'dʒʌmp', ruPronunciation: 'джамп', example: 'The cat can jump.', exampleTranslation: 'Кошка умеет прыгать.', category: 'can' }),
  w({ english: 'swim', translation: 'плавать', ipa: 'swɪm', ruPronunciation: 'свим', example: 'Can you swim?', exampleTranslation: 'Ты умеешь плавать?', category: 'can' }),
  w({ english: 'help', translation: 'помогать', ipa: 'help', ruPronunciation: 'хэлп', example: 'Can you help me, please?', exampleTranslation: 'Можешь мне помочь, пожалуйста?', category: 'can' }),
  w({ english: 'hear', translation: 'слышать', ipa: 'hɪə', ruPronunciation: 'хиэ', example: "I can't hear you.", exampleTranslation: 'Я тебя не слышу.', category: 'can' }),
  w({ english: 'understand', translation: 'понимать', ipa: 'ˌʌndəˈstænd', ruPronunciation: 'андэстЭнд', example: "I can't understand.", exampleTranslation: 'Я не могу понять.', category: 'can' }),
  w({ english: 'write', translation: 'писать', ipa: 'raɪt', ruPronunciation: 'райт', example: 'He can write.', exampleTranslation: 'Он умеет писать.', category: 'can' }),
  w({ english: 'read', translation: 'читать', ipa: 'riːd', ruPronunciation: 'рид', example: 'She can read.', exampleTranslation: 'Она умеет читать.', category: 'can' }),
  w({ english: 'know', translation: 'знать', ipa: 'nəʊ', ruPronunciation: 'ноу', example: "I don't know where it is.", exampleTranslation: 'Я не знаю, где это.', category: 'can' }),
  w({ english: 'ride', translation: 'ездить (верхом, на велосипеде, мотоцикле)', ipa: 'raɪd', ruPronunciation: 'райд', example: 'Can you ride a motorbike?', exampleTranslation: 'Ты умеешь ездить на мотоцикле?', category: 'can' }),
  w({ english: 'motorbike', translation: 'мотоцикл', ipa: 'ˈməʊtəbaɪk', ruPronunciation: 'мОутэбайк', example: 'He can ride a motorbike.', exampleTranslation: 'Он умеет ездить на мотоцикле.', category: 'can' }),
  w({ english: 'drive', translation: 'водить (машину)', ipa: 'draɪv', ruPronunciation: 'драйв', example: 'Can you drive a car?', exampleTranslation: 'Ты умеешь водить машину?', category: 'can' }),
  w({ english: 'learn', translation: 'учить / изучать', ipa: 'lɜːn', ruPronunciation: 'лёрн', example: 'I learn English.', exampleTranslation: 'Я учу английский.', category: 'can' }),
  w({ english: 'add', translation: 'добавлять', ipa: 'æd', ruPronunciation: 'эд', example: 'Can you add sugar?', exampleTranslation: 'Можешь добавить сахар?', category: 'can' }),
  w({ english: 'sugar', translation: 'сахар', ipa: 'ˈʃʊɡə', ruPronunciation: 'шУгэ', example: 'No sugar, please.', exampleTranslation: 'Без сахара, пожалуйста.', category: 'basic' }),
  w({ english: 'repeat', translation: 'повторять', ipa: 'rɪˈpiːt', ruPronunciation: 'рипИт', example: 'Can you repeat, please?', exampleTranslation: 'Можешь повторить, пожалуйста?', category: 'can' }),
  w({ english: 'show', translation: 'показывать', ipa: 'ʃəʊ', ruPronunciation: 'шоу', example: 'Can you show me, please?', exampleTranslation: 'Можешь показать мне, пожалуйста?', category: 'can' }),
  w({ english: 'send', translation: 'отправлять', ipa: 'send', ruPronunciation: 'сэнд', example: 'Can you send me this?', exampleTranslation: 'Можешь отправить мне это?', category: 'can' }),
  w({ english: 'wait', translation: 'ждать', ipa: 'weɪt', ruPronunciation: 'уэйт', example: 'Can you wait a minute?', exampleTranslation: 'Можешь подождать минуту?', category: 'can' }),
  w({ english: 'want', translation: 'хотеть', ipa: 'wɒnt', ruPronunciation: 'уонт', example: 'Do you want coffee?', exampleTranslation: 'Ты хочешь кофе?', category: 'can' }),
  w({ english: 'have', translation: 'иметь', ipa: 'hæv', ruPronunciation: 'хэв', example: 'Do you have a dog?', exampleTranslation: 'У тебя есть собака?', category: 'can' }),
  w({ english: 'drink', translation: 'пить / напиток', ipa: 'drɪŋk', ruPronunciation: 'дринк', example: 'Do you drink coffee?', exampleTranslation: 'Ты пьёшь кофе?', category: 'can' }),
  w({ english: 'work', translation: 'работа / работать', ipa: 'wɜːk', ruPronunciation: 'уёрк', example: 'Do you like your work?', exampleTranslation: 'Тебе нравится твоя работа?', category: 'can' }),
  w({ english: 'give', translation: 'давать', ipa: 'ɡɪv', ruPronunciation: 'гив', example: 'Give me the book, please.', exampleTranslation: 'Дай мне книгу, пожалуйста.', category: 'can' }),
  w({ english: 'prefer', translation: 'предпочитать', ipa: 'prɪˈfɜː', ruPronunciation: 'прифЁ', example: 'No, I prefer tea.', exampleTranslation: 'Нет, я предпочитаю чай.', category: 'can' }),
  w({ english: 'wash', translation: 'мыть / умываться', ipa: 'wɒʃ', ruPronunciation: 'уош', example: 'I wash every morning.', exampleTranslation: 'Я умываюсь каждое утро.', category: 'can' }),

  // 10. Дополнительные слова
  w({ english: 'slow', translation: 'медленный', ipa: 'sləʊ', ruPronunciation: 'слоу', example: 'The bus is slow.', exampleTranslation: 'Автобус медленный.', category: 'basic' }),
  w({ english: 'slowly', translation: 'медленно', ipa: 'ˈsləʊli', ruPronunciation: 'слОули', example: 'Can you speak more slowly?', exampleTranslation: 'Можешь говорить помедленнее?', category: 'basic' }),
  w({ english: 'really', translation: 'действительно / очень', ipa: 'ˈrɪəli', ruPronunciation: 'рИэли', example: 'I really like it.', exampleTranslation: 'Мне это очень нравится.', category: 'basic' }),
  w({ english: 'well', translation: 'хорошо', ipa: 'wel', ruPronunciation: 'уэл', example: 'She can swim well.', exampleTranslation: 'Она хорошо плавает.', category: 'basic' }),
  w({ english: 'minute', translation: 'минута', ipa: 'ˈmɪnɪt', ruPronunciation: 'мИнит', example: 'Can you wait a minute?', exampleTranslation: 'Можешь подождать минуту?', category: 'basic' }),
  w({ english: 'lunch', translation: 'обед', ipa: 'lʌntʃ', ruPronunciation: 'ланч', example: 'I have lunch at home.', exampleTranslation: 'Я обедаю дома.', category: 'basic' }),
  w({ english: 'language', translation: 'язык (languages — языки)', ipa: 'ˈlæŋɡwɪdʒ', ruPronunciation: 'лЭнгуидж', example: 'I can speak two languages.', exampleTranslation: 'Я говорю на двух языках.', category: 'basic' }),

  // 11. Природа
  w({ english: 'grass', translation: 'трава', ipa: 'ɡrɑːs', ruPronunciation: 'грас', example: 'The grass is green.', exampleTranslation: 'Трава зелёная.', category: 'nature' }),
  w({ english: 'waterfall', translation: 'водопад', ipa: 'ˈwɔːtəfɔːl', ruPronunciation: 'уОтэфол', example: 'There is a waterfall.', exampleTranslation: 'Там есть водопад.', category: 'nature' }),
  w({ english: 'bird', translation: 'птица', ipa: 'bɜːd', ruPronunciation: 'бёрд', example: 'The bird is in the tree.', exampleTranslation: 'Птица на дереве.', category: 'nature' }),
  w({ english: 'mouse', translation: 'мышь', ipa: 'maʊs', ruPronunciation: 'маус', example: 'The mouse is under the table.', exampleTranslation: 'Мышь под столом.', category: 'nature' }),
  w({ english: 'duck', translation: 'утка', ipa: 'dʌk', ruPronunciation: 'дак', example: 'There are two ducks.', exampleTranslation: 'Там две утки.', category: 'nature' }),
  w({ english: 'tree', translation: 'дерево', ipa: 'triː', ruPronunciation: 'три', example: 'There is a tree next to the house.', exampleTranslation: 'Рядом с домом дерево.', category: 'nature' }),

  // 14. Базовая лексика
  w({ english: 'a lot of', translation: 'много', ipa: 'ə lɒt əv', ruPronunciation: 'э лот оф', example: 'I drink a lot of water.', exampleTranslation: 'Я пью много воды.', category: 'basic' }),
  w({ english: 'every', translation: 'каждый', ipa: 'ˈevri', ruPronunciation: 'Эври', example: 'I work every day.', exampleTranslation: 'Я работаю каждый день.', category: 'basic' }),
  w({ english: 'every day', translation: 'каждый день', ipa: 'ˈevri deɪ', ruPronunciation: 'Эври дэй', example: 'Do you play games every day?', exampleTranslation: 'Ты играешь в игры каждый день?', category: 'basic' }),
  w({ english: 'bottle', translation: 'бутылка (bottles — бутылки)', ipa: 'ˈbɒtəl', ruPronunciation: 'ботл', example: 'There are two bottles of water.', exampleTranslation: 'Есть две бутылки воды.', category: 'basic' }),
  w({ english: 'husband', translation: 'муж', ipa: 'ˈhʌzbənd', ruPronunciation: 'хАзбэнд', example: 'My husband is at work.', exampleTranslation: 'Мой муж на работе.', category: 'basic' }),
  w({ english: 'market', translation: 'рынок / магазин', ipa: 'ˈmɑːkɪt', ruPronunciation: 'мАркит', example: 'The market is next to the bank.', exampleTranslation: 'Рынок рядом с банком.', category: 'basic' }),
  w({ english: 'toys', translation: 'игрушки', ipa: 'tɔɪz', ruPronunciation: 'тойз', example: 'The toys are on the floor.', exampleTranslation: 'Игрушки на полу.', category: 'basic' }),
  w({ english: 'hungry', translation: 'голодный', ipa: 'ˈhʌŋɡri', ruPronunciation: 'хАнгри', example: 'I am hungry.', exampleTranslation: 'Я голодная.', category: 'basic' }),
  w({ english: 'tired', translation: 'уставший', ipa: 'ˈtaɪəd', ruPronunciation: 'тАйэд', example: 'I was very tired last night.', exampleTranslation: 'Вчера вечером я очень устала.', category: 'basic' }),
  w({ english: 'happy', translation: 'счастливый', ipa: 'ˈhæpi', ruPronunciation: 'хЭпи', example: 'We were happy.', exampleTranslation: 'Мы были счастливы.', category: 'basic' }),
  w({ english: 'sad', translation: 'грустный', ipa: 'sæd', ruPronunciation: 'сэд', example: 'He is sad.', exampleTranslation: 'Ему грустно.', category: 'basic' }),
  w({ english: 'at home', translation: 'дома', ipa: 'ət həʊm', ruPronunciation: 'эт хоум', example: 'I am at home.', exampleTranslation: 'Я дома.', category: 'basic' }),
  w({ english: 'from', translation: 'из / от', ipa: 'frɒm', ruPronunciation: 'фром', example: 'I am from Kyrgyzstan.', exampleTranslation: 'Я из Кыргызстана.', category: 'basic' }),

  // Распорядок дня
  w({ english: 'get up', translation: 'вставать', ipa: 'ɡet ʌp', ruPronunciation: 'гэт ап', example: 'I get up at 7.', exampleTranslation: 'Я встаю в 7.', category: 'present-simple' }),
  w({ english: 'have breakfast', translation: 'завтракать', ipa: 'hæv ˈbrekfəst', ruPronunciation: 'хэв брЭкфэст', example: 'I have breakfast at home.', exampleTranslation: 'Я завтракаю дома.', category: 'present-simple' }),
  w({ english: 'have lunch', translation: 'обедать', ipa: 'hæv lʌntʃ', ruPronunciation: 'хэв ланч', example: 'I have lunch at work.', exampleTranslation: 'Я обедаю на работе.', category: 'present-simple' }),
  w({ english: 'have dinner', translation: 'ужинать', ipa: 'hæv ˈdɪnə', ruPronunciation: 'хэв дИнэ', example: 'We have dinner at 7.', exampleTranslation: 'Мы ужинаем в 7.', category: 'present-simple' }),
  w({ english: 'go to bed', translation: 'идти спать', ipa: 'ɡəʊ tə bed', ruPronunciation: 'гоу ту бэд', example: 'I go to bed at 11.', exampleTranslation: 'Я ложусь спать в 11.', category: 'present-simple' }),
  w({ english: 'go home', translation: 'идти домой', ipa: 'ɡəʊ həʊm', ruPronunciation: 'гоу хоум', example: 'I go home after work.', exampleTranslation: 'Я иду домой после работы.', category: 'present-simple' }),

  // 17. Числа 0–10
  w({ english: 'zero', translation: '0', ipa: 'ˈzɪərəʊ', ruPronunciation: 'зИроу', category: 'numbers' }),
  w({ english: 'one', translation: '1', ipa: 'wʌn', ruPronunciation: 'уан', category: 'numbers' }),
  w({ english: 'two', translation: '2', ipa: 'tuː', ruPronunciation: 'ту', category: 'numbers' }),
  w({ english: 'three', translation: '3', ipa: 'θriː', ruPronunciation: 'сри', category: 'numbers' }),
  w({ english: 'four', translation: '4', ipa: 'fɔː', ruPronunciation: 'фо', category: 'numbers' }),
  w({ english: 'five', translation: '5', ipa: 'faɪv', ruPronunciation: 'файв', category: 'numbers' }),
  w({ english: 'six', translation: '6', ipa: 'sɪks', ruPronunciation: 'сикс', category: 'numbers' }),
  w({ english: 'seven', translation: '7', ipa: 'ˈsevən', ruPronunciation: 'сэвн', category: 'numbers' }),
  w({ english: 'eight', translation: '8', ipa: 'eɪt', ruPronunciation: 'эйт', category: 'numbers' }),
  w({ english: 'nine', translation: '9', ipa: 'naɪn', ruPronunciation: 'найн', category: 'numbers' }),
  w({ english: 'ten', translation: '10', ipa: 'ten', ruPronunciation: 'тэн', category: 'numbers' }),
  ...seedExtraWords,
];
