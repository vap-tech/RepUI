# CodeBlock

Многострочная поверхность для показа исходного кода с необязательным
заголовком, языком и копированием.

## Public API

```django
{% code_block language="django" title="пример.html" %}
  {% button %}Сохранить{% endbutton %}
{% endcode_block %}
```

Поддерживаются `language`, `title`, `copy`, `width`, `height`, `class_name` и
`attrs`. Значения по умолчанию: `language="text"`, `copy=True`, `width="full"`,
`height="md"`.

## Runtime API

`mountCodeBlocks(root)` подключает копирование явно и идемпотентно. Auto-init
нет; после HTMX swap нужно вызвать mount для нового root.

## Theme contract

Компонент использует токены `--rui-code-block-*` из темы RepUI. Пользовательская
тема подключается после базовой темы.

## Composition

Внутри передаётся текст исходного кода. Содержимое экранируется на сервере;
подсветка является декоративным представлением и не меняет исходный текст.

## HTMX contract

Допустимы `innerHTML` и `outerHTML` swaps. После появления нового CodeBlock
вызовите `mountCodeBlocks(target)`. При уничтожении runtime очищает свои
обработчики.

## Manual checks

- [ ] Текст кода экранируется и отображается в одну или несколько строк.
- [ ] Подсветка не меняет исходное содержимое при копировании.
- [ ] Кнопка копирования работает после повторного mount.
- [ ] Light и dark отображаются корректно.
- [ ] HTMX swap не создаёт дублированных обработчиков.
