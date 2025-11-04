# Разработка

## Требования

- Node.js v18.19.1
- npm

## Установка

```bash
npm install
```

## Конфигурация

Создайте `.env` файл:
```env
cp .env.example .env
```
и сконфигурируйте его. 

## Запуск

```bash
# Development сервер (порт 5173)
npm run dev

# Production сборка
npm run build

# Preview production сборки
npm run preview

# Форматирование кода
npm run format
```

## Структура проекта

```
/src
  /Components       - Vue компоненты
  /composables      - Vue composables (useApi, useAuth, useAlignmentTasks)
  /services         - API сервисы (api.ts, auth.ts)
  /config           - Конфигурация (api.ts)
  /utils            - Утилиты (audio.ts)
  /types            - TypeScript типы
  /assets           - Статические ресурсы
```

## Технологии

- **Vue 3** - фреймворк
- **TypeScript** - типизация
- **Vite** - сборщик (v5.4.19)
- **PrimeVue** - UI компоненты
- **TailwindCSS** - стилизация
- **Axios** - HTTP клиент
- **Lucide** - иконки

## API эндпоинты

### Bible API (`/bible-api`)
- Переводы, языки, книги
- Главы и отрывки с выравниванием
- Аудиофайлы
- Управление голосами и аномалиями

### Alignment API (`/alignment-api`)
- Задачи выравнивания
- MFA модели
- Поддерживаемые языки

## Компоненты

- **BaseLayout** - основной layout с навигацией
- **Login** - страница авторизации
- **BibleVoices** - управление голосами
- **BibleAnomalies** - работа с аномалиями
- **BibleInspect** - просмотр и проверка глав
- **AlignmentTasks** - задачи выравнивания
- **AlignmentTaskDialog** - создание задач

## Авторизация

См. [AUTH.md](./AUTH.md)

## Известные особенности

- Аудио файлы используют query параметр для API ключа (ограничение браузера)
- JWT токены хранятся в localStorage
- Темная тема определяется автоматически по системным настройкам
