# Django integration

Подключите `repui.css`, `repui.js` и `rui-core.min.js` из static files. Django templates и optional template tags находятся в `django/`; backend может перенести их в собственный app и namespace.

## Form values

- `Select` отправляет значение через `<input type="hidden" name="...">`;
- `Combobox` хранит query в text input, а выбранный value — в `<input data-rui-value type="hidden">`;
- `native_select` отправляет обычный `<select>` и оставляет selection browser-owned.

Server validation остаётся authoritative. После ошибки формы сервер должен вернуть template с исходными `value`, `selected_label` и field error.

## Current template contract

Options передаются как объекты с полями:

- `value` — form value;
- `label` — отображаемый текст;
- `description` — необязательное пояснение;
- `keywords` — дополнительные слова для Combobox filtering;
- `disabled` — недоступный option.

Текущий Select намеренно не поддерживает `searchable`: поиск временно убран до отдельной реализации в core.

## HTML pass-through и block tags

Для custom HTML attributes используйте template tags:

```django
{% load repui_tags %}
{% repui_card_block
    title="Заказ такси"
    hx_get="/taxi/status/"
    hx_trigger="every 5s"
    aria_label="Статус заказа"
%}
  <p>Состояние заказа</p>
{% endrepui_card_block %}
```

Имена kwargs переводятся из Python-style в HTML-style: `hx_get` становится `hx-get`, `data_state` — `data-state`, `class_` — `class`. Значения экранируются, а служебные `data-rui-*` и ARIA attributes нельзя случайно перезаписать.

Для компонентов с вложенным content используйте block tag:

```django
{% load repui_tags %}
<label for="requested-time-type">Когда нужна машина</label>
{% repui_combobox name="requested_time_type" %}
  <button data-rui-option data-value="now">Сейчас</button>
  <button data-rui-option data-value="later">Позже</button>
{% endrepui_combobox %}
```

Сейчас block API добавлен для Card и Combobox. Для Card header/body/footer пока передаётся обычный body; отдельные anatomy slots добавим следующим шагом.

Для `Dropdown` используйте block tag. Вложенное содержимое обязано содержать хотя бы один элемент с `data-rui-menuitem`:

Dropdown может содержать один или несколько `menuitem`, но каждый `menuitem` должен иметь видимый label или доступное имя через `aria-label`. Технически проверка пропустит:

```html
<button data-rui-menuitem></button>
```

Но это плохая разметка: item будет недоступен для пользователя и плохо восприниматься screen reader.

Рабочий вариант примерно такой:

```django
{% load repui_tags %}
{% repui_dropdown label="Действия" %}
  <button data-rui-menuitem data-value="archive">Архивировать</button>
{% endrepui_dropdown %}
```

Проверка выполняется намеренно на Django-слое. `data-rui-menuitem` связывает
HTML с core state machine: без него меню может выглядеть корректно, но не
получит keyboard navigation, active state и selection. Обходить проверку не
следует — это скрывает ошибку markup contract.
