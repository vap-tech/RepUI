# Select contract

## Native source of truth

Select всегда содержит настоящий `<select>`. Именно он:

- отправляет данные формы;
- участвует в browser validation;
- хранит selected/disabled;
- отправляет `input` и `change`.

Custom UI является представлением нативного select.

## Progressive enhancement

До mount отображается обычный нативный select.

После mount:

```text
data-rui-mounted="true"
```

скрывает native control визуально, но оставляет его в форме.

## Multiple

Multiple не является отдельным компонентом.

```django
{% select multiple=True %}
```

- `value` runtime становится массивом строк;
- Enter/Space переключают option;
- popup не закрывается после выбора;
- listbox получает `aria-multiselectable="true"`.

## Runtime

```js
mountSelects(root)
```

Возвращает экземпляры:

```js
{
  element,
  open(),
  close(),
  toggle(),
  focus(),
  refresh(),
  destroy(),
  value
}
```

## Events

```text
rui:open
rui:close
rui:change
```

`rui:change.detail.value`:

- string для single;
- string[] для multiple.

## Явный lifecycle

Нет auto-init, глобального класса в `window` и скрытого mount.
