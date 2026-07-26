# Репьёвка — unofficial: дизайн главной

Статический UI-прототип без фреймворков и внешнего API. Подходит как основа для Django templates.

## Файлы
- `index.html` — структура страницы и переиспользуемые паттерны компонентов.
- `styles.css` — дизайн-система, светлая/тёмная темы, адаптивность.
- `script.js` — переключатель темы, мобильное меню, modal, scroll-spy и анимации.

## Запуск
Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python -m http.server 8000
```

## Перенос в Django
1. Разнести секции по partials: `components/navbar.html`, `components/card.html`, `components/footer.html`.
2. Поместить CSS/JS в `static/portal/`.
3. Заменить демо-контент на Django template tags и queryset-контекст.
4. Кнопку входа связать с `{% url 'login' %}`; для авторизованного пользователя показывать avatar/menu.
5. Для темы можно оставить localStorage, серверная логика не требуется.

## Дизайн-принципы
- крупная типографика и свободное пространство;
- мягкие стеклянные поверхности без перегруза;
- компоненты в духе Material UI, но без зависимости от MUI;
- доступные состояния focus/hover, reduced motion, semantic HTML;
- mobile-first адаптация до 320 px.


## Component playground

Откройте `components.html` — это интерактивный каталог дизайн-системы. В нём собраны кнопки, поля ввода, tabs, alerts, toast, modal, dropdown, chips, badges, таблицы, skeleton и состояния страниц.

Файлы библиотеки:

- `components.html` — документация и примеры компонентов;
- `components.css` — стили компонентов и документации;
- `components.js` — демо-интерактивность.

Рекомендуемая следующая стадия интеграции с Django: разнести компоненты по `templates/ui/`, например `button.html`, `alert.html`, `field.html`, `modal.html`, а значения токенов оставить в общем CSS-слое.
