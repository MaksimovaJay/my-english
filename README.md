# MJay English

Персональный интерактивный учебник английского. Работает полностью локально, без бэкенда — все данные хранятся в localStorage браузера.

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## Тесты

```bash
npm run test
```

## Добавление Homework

1. Пришлите скриншот/фото задания в чат Claude Code.
2. Claude сформирует JSON-файл с заданием (структура — см. `types/models.ts`, тип `Homework`/`Exercise`).
3. Откройте раздел Homework → Import Homework (JSON) → выберите файл.
4. Выполните задание в приложении, преподаватель проверит результат отдельно.

## Экспорт/импорт своих данных

Раздел Progress → Export JSON / Import JSON / Import Vocabulary CSV.
