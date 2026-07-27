# SelectOption

Это building block, не полный Select.

```django
{% select_option value="ru" selected=True %}Русский{% endselect_option %}
```

```js
import { mountSelectOptions } from ".../select-option.js";
mountSelectOptions(document);
```

Отправляет `rui:activate`, затем `rui:change`.
