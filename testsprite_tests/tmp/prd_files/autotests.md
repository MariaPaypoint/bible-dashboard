# Рекомендации для TestSprite

1. **Селекторы**: Всегда используй `data-testid` вместо XPath. Это критично для стабильности.
2. **Login & Nav**: После логина приложение всегда редиректит на `/`. Если тест для другой страницы — делай `page.goto('/target')` **после** успешного логина.
3. **PrimeVue Inputs**: Для компонентов типа `Password` или `InputNumber` с `data-testid` на обертке, вводи текст в инпут внутри: `locator('[data-testid="..."] input').fill(...)`.
4. **PrimeVue Select**: Для выпадающих списков (Select) сначала кликни по элементу с `data-testid`, затем выбери опцию из `.p-select-overlay .p-select-option`.
5. **Assertions**: Проверяй наличие уникальных элементов UI (заголовки, лейблы), а не общий текст "Success".
6. **Headless**: Тесты должны стабильно работать в headless режиме (ждать элементы через `wait_for_selector`, а не фиксированные таймуты).

## Доступные data-testid для фильтров

- `voice-filter` - фильтр выбора голоса
- `book-filter` - фильтр выбора книги
- `anomaly-type-filter` - фильтр типа аномалии
- `status-filter` - фильтр статуса
