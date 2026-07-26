# AppBar в `/docs`

При выборе AppBar слева покажите назначение, параметры, runtime API, токены темы и ручные проверки.

## Runtime controls

- static
- sticky
- default
- solid
- transparent
- glass

## Checklist

- [ ] AppBar занимает всю ширину.
- [ ] `static` уезжает при прокрутке.
- [ ] `sticky` остаётся сверху.
- [ ] Переключение не создаёт рывок высоты страницы.
- [ ] `default` читается в light и dark.
- [ ] `transparent` показывает фон страницы.
- [ ] `glass` показывает прозрачность и blur.
- [ ] Внутренний Grid сохраняет колонки.
- [ ] В AppBar можно поместить Button, Panel и Card.
- [ ] Runtime-кнопки работают после HTMX swap.
- [ ] После нескольких swap обработчики не срабатывают дважды.
- [ ] `repui:appbarchange` содержит актуальные behavior и surface.
- [ ] При `prefers-reduced-motion` переходы отключены.
