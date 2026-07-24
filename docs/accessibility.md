# Accessibility

## Общие правила

- используйте native semantics и правильные ARIA roles;
- у composite widget должен быть один keyboard owner;
- `active` и `selected` — разные состояния;
- disabled option не должен становиться active или selected;
- после закрытия popup focus возвращается на trigger/input;
- Escape закрывает popup без selection;
- outside click закрывает popup, но не меняет form value.

## Active ownership

Keyboard и pointer могут менять один и тот же active item. Визуальный компонент не должен одновременно рисовать два независимых hover/focus состояния на соседних options.

## Focus

Managed collections оставляют focus на input/trigger и используют `aria-activedescendant`. Standalone Listbox может владеть focus сам. После selection или close focus должен сохраняться предсказуемо.

## Keyboard quality gate

Каждый interactive component проверяется с помощью `Tab`, `Shift+Tab`, `Enter`, `Space` и `Escape`, если эти клавиши применимы к его поведению.

Для composite widgets дополнительно проверяются arrow keys, `Home` и `End`. Browser-reserved shortcuts описываются только как подсказки и никогда не являются обязательным interaction path.
