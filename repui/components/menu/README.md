# Menu

```django
{% menu %}
  {% menu_item value="edit" %}Редактировать{% endmenu_item %}
  {% menu_item value="delete" %}Удалить{% endmenu_item %}
{% endmenu %}
```

```js
import { mountMenus } from ".../menu.js";
mountMenus(document);
```

Arrow keys, Home и End обслуживает roving primitive. Активация отправляет
`rui:activate`.
