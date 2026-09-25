import { Word } from '@/types/models';
import { createInitialReviewState } from '@/lib/learning/review';

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
  w({ english: 'I', translation: 'я', ipa: 'aɪ', ruPronunciation: 'ай', example: 'I am at home.', exampleTranslation: 'Я дома.', category: 'Pronouns' }),
  w({ english: 'you', translation: 'ты / вы', ipa: 'juː', ruPronunciation: 'ю', example: 'You are my friend.', exampleTranslation: 'Ты мой друг.', category: 'Pronouns' }),
  w({ english: 'he', translation: 'он', ipa: 'hiː', ruPronunciation: 'хи', example: 'He is 4 years old.', exampleTranslation: 'Ему 4 года.', category: 'Pronouns' }),
  w({ english: 'she', translation: 'она', ipa: 'ʃiː', ruPronunciation: 'ши', example: 'She was in the USA.', exampleTranslation: 'Она была в США.', category: 'Pronouns' }),
  w({ english: 'it', translation: 'это / оно', ipa: 'ɪt', ruPronunciation: 'ит', example: 'It is a chair.', exampleTranslation: 'Это стул.', category: 'Pronouns' }),
  w({ english: 'we', translation: 'мы', ipa: 'wiː', ruPronunciation: 'уи', example: "We weren't at home.", exampleTranslation: 'Нас не было дома.', category: 'Pronouns' }),
  w({ english: 'they', translation: 'они', ipa: 'ðeɪ', ruPronunciation: 'зэй', example: "They weren't ready.", exampleTranslation: 'Они не были готовы.', category: 'Pronouns' }),
  w({ english: 'me', translation: 'мне / меня', ipa: 'miː', ruPronunciation: 'ми', example: 'Can you help me, please?', exampleTranslation: 'Можешь мне помочь, пожалуйста?', category: 'Pronouns' }),

  // 4. Дом и квартира
  w({ english: 'flat', translation: 'квартира', ipa: 'flæt', ruPronunciation: 'флэт', example: 'My flat is small.', exampleTranslation: 'Моя квартира маленькая.', category: 'Home' }),
  w({ english: 'apartment', translation: 'квартира', ipa: 'əˈpɑːtmənt', ruPronunciation: 'эпАртмэнт', example: 'There are three rooms in the apartment.', exampleTranslation: 'В квартире три комнаты.', category: 'Home' }),
  w({ english: 'living room', translation: 'гостиная', ipa: 'ˈlɪvɪŋ ruːm', ruPronunciation: 'ливинг рум', example: 'The sofa is in the living room.', exampleTranslation: 'Диван в гостиной.', category: 'Home' }),
  w({ english: 'dining room', translation: 'столовая', ipa: 'ˈdaɪnɪŋ ruːm', ruPronunciation: 'дайнинг рум', example: 'The table is in the dining room.', exampleTranslation: 'Стол в столовой.', category: 'Home' }),
  w({ english: 'kitchen', translation: 'кухня', ipa: 'ˈkɪtʃɪn', ruPronunciation: 'китчен', example: 'The fridge is in the kitchen.', exampleTranslation: 'Холодильник на кухне.', category: 'Home' }),
  w({ english: 'bedroom', translation: 'спальня', ipa: 'ˈbedruːm', ruPronunciation: 'бэдрум', example: 'There is a bed in the bedroom.', exampleTranslation: 'В спальне есть кровать.', category: 'Home' }),
  w({ english: 'bathroom', translation: 'ванная / санузел', ipa: 'ˈbɑːθruːm', ruPronunciation: 'бАсрум', example: 'Where is the bathroom?', exampleTranslation: 'Где ванная?', category: 'Home' }),
  w({ english: 'bed', translation: 'кровать', ipa: 'bed', ruPronunciation: 'бэд', example: 'The cat is on the bed.', exampleTranslation: 'Кошка на кровати.', category: 'Home' }),
  w({ english: 'table', translation: 'стол', ipa: 'ˈteɪbəl', ruPronunciation: 'тэйбл', example: 'The book is on the table.', exampleTranslation: 'Книга на столе.', category: 'Home' }),
  w({ english: 'chair', translation: 'стул', ipa: 'tʃeə', ruPronunciation: 'чэа', example: 'There is a chair.', exampleTranslation: 'Есть стул.', category: 'Home' }),
  w({ english: 'sofa', translation: 'диван', ipa: 'ˈsəʊfə', ruPronunciation: 'сОуфа', example: 'Is there a sofa?', exampleTranslation: 'Есть ли диван?', category: 'Home' }),
  w({ english: 'fridge', translation: 'холодильник', ipa: 'frɪdʒ', ruPronunciation: 'фридж', example: 'The milk is in the fridge.', exampleTranslation: 'Молоко в холодильнике.', category: 'Home' }),
  w({ english: 'lamp', translation: 'лампа', ipa: 'læmp', ruPronunciation: 'лэмп', example: 'The lamp is next to the bed.', exampleTranslation: 'Лампа рядом с кроватью.', category: 'Home' }),
  w({ english: 'TV', translation: 'телевизор', ipa: 'ˌtiːˈviː', ruPronunciation: 'ти-вИ', example: 'The TV is opposite the sofa.', exampleTranslation: 'Телевизор напротив дивана.', category: 'Home' }),
  w({ english: 'rug', translation: 'коврик / ковёр', ipa: 'rʌɡ', ruPronunciation: 'раг', example: 'The rug is on the floor.', exampleTranslation: 'Ковёр на полу.', category: 'Home' }),
  w({ english: 'cupboard', translation: 'шкаф', ipa: 'ˈkʌbəd', ruPronunciation: 'кАбэд', example: 'The cups are in the cupboard.', exampleTranslation: 'Чашки в шкафу.', category: 'Home' }),
  w({ english: 'shelf', translation: 'полка', ipa: 'ʃelf', ruPronunciation: 'шэлф', example: 'The book is on the shelf.', exampleTranslation: 'Книга на полке.', category: 'Home' }),
  w({ english: 'floor', translation: 'пол', ipa: 'flɔː', ruPronunciation: 'флор', example: 'The toys are on the floor.', exampleTranslation: 'Игрушки на полу.', category: 'Home' }),

  // 5. Предлоги и место
  w({ english: 'in', translation: 'в / внутри', ipa: 'ɪn', ruPronunciation: 'ин', example: 'The sofa is in the living room.', exampleTranslation: 'Диван в гостиной.', category: 'Prepositions' }),
  w({ english: 'on', translation: 'на', ipa: 'ɒn', ruPronunciation: 'он', example: 'The book is on the table.', exampleTranslation: 'Книга на столе.', category: 'Prepositions' }),
  w({ english: 'under', translation: 'под', ipa: 'ˈʌndə', ruPronunciation: 'андэ', example: 'The cat is under the table.', exampleTranslation: 'Кошка под столом.', category: 'Prepositions' }),
  w({ english: 'in front of', translation: 'перед', ipa: 'ɪn frʌnt əv', ruPronunciation: 'ин франт оф', example: 'The rug is in front of the sofa.', exampleTranslation: 'Ковёр перед диваном.', category: 'Prepositions' }),
  w({ english: 'next to', translation: 'рядом с', ipa: 'nekst tuː', ruPronunciation: 'нэкст ту', example: 'The lamp is next to the bed.', exampleTranslation: 'Лампа рядом с кроватью.', category: 'Prepositions' }),
  w({ english: 'opposite', translation: 'напротив', ipa: 'ˈɒpəzɪt', ruPronunciation: 'Опэзит', example: 'The TV is opposite the sofa.', exampleTranslation: 'Телевизор напротив дивана.', category: 'Prepositions' }),
  w({ english: 'around', translation: 'вокруг', ipa: 'əˈraʊnd', ruPronunciation: 'эрАунд', example: 'There are chairs around the table.', exampleTranslation: 'Вокруг стола стулья.', category: 'Prepositions' }),
  w({ english: 'here', translation: 'здесь', ipa: 'hɪə', ruPronunciation: 'хиэ', example: 'They were here a few minutes ago.', exampleTranslation: 'Они были здесь несколько минут назад.', category: 'Prepositions' }),
  w({ english: 'there', translation: 'там', ipa: 'ðeə', ruPronunciation: 'зэа', example: "You weren't there.", exampleTranslation: 'Тебя там не было.', category: 'Prepositions' }),
  w({ english: 'back', translation: 'назад / обратно', ipa: 'bæk', ruPronunciation: 'бэк', example: 'Come back, please.', exampleTranslation: 'Вернись, пожалуйста.', category: 'Prepositions' }),

  // 8. Глаголы (can / can't)
  w({ english: 'speak', translation: 'говорить', ipa: 'spiːk', ruPronunciation: 'спик', example: 'I can speak English.', exampleTranslation: 'Я умею говорить по-английски.', category: 'Verbs' }),
  w({ english: 'jump', translation: 'прыгать', ipa: 'dʒʌmp', ruPronunciation: 'джамп', example: 'The cat can jump.', exampleTranslation: 'Кошка умеет прыгать.', category: 'Verbs' }),
  w({ english: 'swim', translation: 'плавать', ipa: 'swɪm', ruPronunciation: 'свим', example: 'Can you swim?', exampleTranslation: 'Ты умеешь плавать?', category: 'Verbs' }),
  w({ english: 'help', translation: 'помогать', ipa: 'help', ruPronunciation: 'хэлп', example: 'Can you help me, please?', exampleTranslation: 'Можешь мне помочь, пожалуйста?', category: 'Verbs' }),
  w({ english: 'hear', translation: 'слышать', ipa: 'hɪə', ruPronunciation: 'хиэ', example: "I can't hear you.", exampleTranslation: 'Я тебя не слышу.', category: 'Verbs' }),
  w({ english: 'understand', translation: 'понимать', ipa: 'ˌʌndəˈstænd', ruPronunciation: 'андэстЭнд', example: "I can't understand.", exampleTranslation: 'Я не могу понять.', category: 'Verbs' }),
  w({ english: 'write', translation: 'писать', ipa: 'raɪt', ruPronunciation: 'райт', example: 'He can write.', exampleTranslation: 'Он умеет писать.', category: 'Verbs' }),
  w({ english: 'read', translation: 'читать', ipa: 'riːd', ruPronunciation: 'рид', example: 'She can read.', exampleTranslation: 'Она умеет читать.', category: 'Verbs' }),
  w({ english: 'know', translation: 'знать', ipa: 'nəʊ', ruPronunciation: 'ноу', example: "I don't know where it is.", exampleTranslation: 'Я не знаю, где это.', category: 'Verbs' }),
  w({ english: 'ride', translation: 'ездить (верхом, на велосипеде, мотоцикле)', ipa: 'raɪd', ruPronunciation: 'райд', example: 'Can you ride a motorbike?', exampleTranslation: 'Ты умеешь ездить на мотоцикле?', category: 'Verbs' }),
  w({ english: 'motorbike', translation: 'мотоцикл', ipa: 'ˈməʊtəbaɪk', ruPronunciation: 'мОутэбайк', example: 'He can ride a motorbike.', exampleTranslation: 'Он умеет ездить на мотоцикле.', category: 'Verbs' }),
  w({ english: 'drive', translation: 'водить (машину)', ipa: 'draɪv', ruPronunciation: 'драйв', example: 'Can you drive a car?', exampleTranslation: 'Ты умеешь водить машину?', category: 'Verbs' }),
  w({ english: 'learn', translation: 'учить / изучать', ipa: 'lɜːn', ruPronunciation: 'лёрн', example: 'I learn English.', exampleTranslation: 'Я учу английский.', category: 'Verbs' }),
  w({ english: 'add', translation: 'добавлять', ipa: 'æd', ruPronunciation: 'эд', example: 'Can you add sugar?', exampleTranslation: 'Можешь добавить сахар?', category: 'Verbs' }),
  w({ english: 'sugar', translation: 'сахар', ipa: 'ˈʃʊɡə', ruPronunciation: 'шУгэ', example: 'No sugar, please.', exampleTranslation: 'Без сахара, пожалуйста.', category: 'Food' }),
  w({ english: 'repeat', translation: 'повторять', ipa: 'rɪˈpiːt', ruPronunciation: 'рипИт', example: 'Can you repeat, please?', exampleTranslation: 'Можешь повторить, пожалуйста?', category: 'Verbs' }),
  w({ english: 'show', translation: 'показывать', ipa: 'ʃəʊ', ruPronunciation: 'шоу', example: 'Can you show me, please?', exampleTranslation: 'Можешь показать мне, пожалуйста?', category: 'Verbs' }),
  w({ english: 'send', translation: 'отправлять', ipa: 'send', ruPronunciation: 'сэнд', example: 'Can you send me this?', exampleTranslation: 'Можешь отправить мне это?', category: 'Verbs' }),
  w({ english: 'wait', translation: 'ждать', ipa: 'weɪt', ruPronunciation: 'уэйт', example: 'Can you wait a minute?', exampleTranslation: 'Можешь подождать минуту?', category: 'Verbs' }),
  w({ english: 'want', translation: 'хотеть', ipa: 'wɒnt', ruPronunciation: 'уонт', example: 'Do you want coffee?', exampleTranslation: 'Ты хочешь кофе?', category: 'Verbs' }),
  w({ english: 'have', translation: 'иметь', ipa: 'hæv', ruPronunciation: 'хэв', example: 'Do you have a dog?', exampleTranslation: 'У тебя есть собака?', category: 'Verbs' }),
  w({ english: 'drink', translation: 'пить / напиток', ipa: 'drɪŋk', ruPronunciation: 'дринк', example: 'Do you drink coffee?', exampleTranslation: 'Ты пьёшь кофе?', category: 'Verbs' }),
  w({ english: 'work', translation: 'работа / работать', ipa: 'wɜːk', ruPronunciation: 'уёрк', example: 'Do you like your work?', exampleTranslation: 'Тебе нравится твоя работа?', category: 'Verbs' }),
  w({ english: 'give', translation: 'давать', ipa: 'ɡɪv', ruPronunciation: 'гив', example: 'Give me the book, please.', exampleTranslation: 'Дай мне книгу, пожалуйста.', category: 'Verbs' }),
  w({ english: 'prefer', translation: 'предпочитать', ipa: 'prɪˈfɜː', ruPronunciation: 'прифЁ', example: 'No, I prefer tea.', exampleTranslation: 'Нет, я предпочитаю чай.', category: 'Verbs' }),
  w({ english: 'wash', translation: 'мыть / умываться', ipa: 'wɒʃ', ruPronunciation: 'уош', example: 'I wash every morning.', exampleTranslation: 'Я умываюсь каждое утро.', category: 'Verbs' }),

  // 10. Дополнительные слова
  w({ english: 'slow', translation: 'медленный', ipa: 'sləʊ', ruPronunciation: 'слоу', example: 'The bus is slow.', exampleTranslation: 'Автобус медленный.', category: 'Basic' }),
  w({ english: 'slowly', translation: 'медленно', ipa: 'ˈsləʊli', ruPronunciation: 'слОули', example: 'Can you speak more slowly?', exampleTranslation: 'Можешь говорить помедленнее?', category: 'Basic' }),
  w({ english: 'really', translation: 'действительно / очень', ipa: 'ˈrɪəli', ruPronunciation: 'рИэли', example: 'I really like it.', exampleTranslation: 'Мне это очень нравится.', category: 'Basic' }),
  w({ english: 'well', translation: 'хорошо', ipa: 'wel', ruPronunciation: 'уэл', example: 'She can swim well.', exampleTranslation: 'Она хорошо плавает.', category: 'Basic' }),
  w({ english: 'minute', translation: 'минута', ipa: 'ˈmɪnɪt', ruPronunciation: 'мИнит', example: 'Can you wait a minute?', exampleTranslation: 'Можешь подождать минуту?', category: 'Basic' }),
  w({ english: 'lunch', translation: 'обед', ipa: 'lʌntʃ', ruPronunciation: 'ланч', example: 'I have lunch at home.', exampleTranslation: 'Я обедаю дома.', category: 'Food' }),
  w({ english: 'language', translation: 'язык (languages — языки)', ipa: 'ˈlæŋɡwɪdʒ', ruPronunciation: 'лЭнгуидж', example: 'I can speak two languages.', exampleTranslation: 'Я говорю на двух языках.', category: 'Basic' }),

  // 11. Природа
  w({ english: 'grass', translation: 'трава', ipa: 'ɡrɑːs', ruPronunciation: 'грас', example: 'The grass is green.', exampleTranslation: 'Трава зелёная.', category: 'Nature' }),
  w({ english: 'waterfall', translation: 'водопад', ipa: 'ˈwɔːtəfɔːl', ruPronunciation: 'уОтэфол', example: 'There is a waterfall.', exampleTranslation: 'Там есть водопад.', category: 'Nature' }),
  w({ english: 'bird', translation: 'птица', ipa: 'bɜːd', ruPronunciation: 'бёрд', example: 'The bird is in the tree.', exampleTranslation: 'Птица на дереве.', category: 'Nature' }),
  w({ english: 'mouse', translation: 'мышь', ipa: 'maʊs', ruPronunciation: 'маус', example: 'The mouse is under the table.', exampleTranslation: 'Мышь под столом.', category: 'Nature' }),
  w({ english: 'duck', translation: 'утка', ipa: 'dʌk', ruPronunciation: 'дак', example: 'There are two ducks.', exampleTranslation: 'Там две утки.', category: 'Nature' }),
  w({ english: 'tree', translation: 'дерево', ipa: 'triː', ruPronunciation: 'три', example: 'There is a tree next to the house.', exampleTranslation: 'Рядом с домом дерево.', category: 'Nature' }),

  // 14. Базовая лексика
  w({ english: 'a lot of', translation: 'много', ipa: 'ə lɒt əv', ruPronunciation: 'э лот оф', example: 'I drink a lot of water.', exampleTranslation: 'Я пью много воды.', category: 'Basic' }),
  w({ english: 'every', translation: 'каждый', ipa: 'ˈevri', ruPronunciation: 'Эври', example: 'I work every day.', exampleTranslation: 'Я работаю каждый день.', category: 'Basic' }),
  w({ english: 'every day', translation: 'каждый день', ipa: 'ˈevri deɪ', ruPronunciation: 'Эври дэй', example: 'Do you play games every day?', exampleTranslation: 'Ты играешь в игры каждый день?', category: 'Basic' }),
  w({ english: 'bottle', translation: 'бутылка (bottles — бутылки)', ipa: 'ˈbɒtəl', ruPronunciation: 'ботл', example: 'There are two bottles of water.', exampleTranslation: 'Есть две бутылки воды.', category: 'Basic' }),
  w({ english: 'husband', translation: 'муж', ipa: 'ˈhʌzbənd', ruPronunciation: 'хАзбэнд', example: 'My husband is at work.', exampleTranslation: 'Мой муж на работе.', category: 'People' }),
  w({ english: 'market', translation: 'рынок / магазин', ipa: 'ˈmɑːkɪt', ruPronunciation: 'мАркит', example: 'The market is next to the bank.', exampleTranslation: 'Рынок рядом с банком.', category: 'Basic' }),
  w({ english: 'toys', translation: 'игрушки', ipa: 'tɔɪz', ruPronunciation: 'тойз', example: 'The toys are on the floor.', exampleTranslation: 'Игрушки на полу.', category: 'Basic' }),
  w({ english: 'hungry', translation: 'голодный', ipa: 'ˈhʌŋɡri', ruPronunciation: 'хАнгри', example: 'I am hungry.', exampleTranslation: 'Я голодная.', category: 'Feelings' }),
  w({ english: 'tired', translation: 'уставший', ipa: 'ˈtaɪəd', ruPronunciation: 'тАйэд', example: 'I was very tired last night.', exampleTranslation: 'Вчера вечером я очень устала.', category: 'Feelings' }),
  w({ english: 'happy', translation: 'счастливый', ipa: 'ˈhæpi', ruPronunciation: 'хЭпи', example: 'We were happy.', exampleTranslation: 'Мы были счастливы.', category: 'Feelings' }),
  w({ english: 'sad', translation: 'грустный', ipa: 'sæd', ruPronunciation: 'сэд', example: 'He is sad.', exampleTranslation: 'Ему грустно.', category: 'Feelings' }),
  w({ english: 'at home', translation: 'дома', ipa: 'ət həʊm', ruPronunciation: 'эт хоум', example: 'I am at home.', exampleTranslation: 'Я дома.', category: 'Basic' }),
  w({ english: 'from', translation: 'из / от', ipa: 'frɒm', ruPronunciation: 'фром', example: 'I am from Kyrgyzstan.', exampleTranslation: 'Я из Кыргызстана.', category: 'Basic' }),

  // Распорядок дня
  w({ english: 'get up', translation: 'вставать', ipa: 'ɡet ʌp', ruPronunciation: 'гэт ап', example: 'I get up at 7.', exampleTranslation: 'Я встаю в 7.', category: 'Daily Routine' }),
  w({ english: 'have breakfast', translation: 'завтракать', ipa: 'hæv ˈbrekfəst', ruPronunciation: 'хэв брЭкфэст', example: 'I have breakfast at home.', exampleTranslation: 'Я завтракаю дома.', category: 'Daily Routine' }),
  w({ english: 'have lunch', translation: 'обедать', ipa: 'hæv lʌntʃ', ruPronunciation: 'хэв ланч', example: 'I have lunch at work.', exampleTranslation: 'Я обедаю на работе.', category: 'Daily Routine' }),
  w({ english: 'have dinner', translation: 'ужинать', ipa: 'hæv ˈdɪnə', ruPronunciation: 'хэв дИнэ', example: 'We have dinner at 7.', exampleTranslation: 'Мы ужинаем в 7.', category: 'Daily Routine' }),
  w({ english: 'go to bed', translation: 'идти спать', ipa: 'ɡəʊ tə bed', ruPronunciation: 'гоу ту бэд', example: 'I go to bed at 11.', exampleTranslation: 'Я ложусь спать в 11.', category: 'Daily Routine' }),
  w({ english: 'go home', translation: 'идти домой', ipa: 'ɡəʊ həʊm', ruPronunciation: 'гоу хоум', example: 'I go home after work.', exampleTranslation: 'Я иду домой после работы.', category: 'Daily Routine' }),

  // 17. Числа 0–10
  w({ english: 'zero', translation: '0', ipa: 'ˈzɪərəʊ', ruPronunciation: 'зИроу', category: 'Numbers' }),
  w({ english: 'one', translation: '1', ipa: 'wʌn', ruPronunciation: 'уан', category: 'Numbers' }),
  w({ english: 'two', translation: '2', ipa: 'tuː', ruPronunciation: 'ту', category: 'Numbers' }),
  w({ english: 'three', translation: '3', ipa: 'θriː', ruPronunciation: 'сри', category: 'Numbers' }),
  w({ english: 'four', translation: '4', ipa: 'fɔː', ruPronunciation: 'фо', category: 'Numbers' }),
  w({ english: 'five', translation: '5', ipa: 'faɪv', ruPronunciation: 'файв', category: 'Numbers' }),
  w({ english: 'six', translation: '6', ipa: 'sɪks', ruPronunciation: 'сикс', category: 'Numbers' }),
  w({ english: 'seven', translation: '7', ipa: 'ˈsevən', ruPronunciation: 'сэвн', category: 'Numbers' }),
  w({ english: 'eight', translation: '8', ipa: 'eɪt', ruPronunciation: 'эйт', category: 'Numbers' }),
  w({ english: 'nine', translation: '9', ipa: 'naɪn', ruPronunciation: 'найн', category: 'Numbers' }),
  w({ english: 'ten', translation: '10', ipa: 'ten', ruPronunciation: 'тэн', category: 'Numbers' }),
];
