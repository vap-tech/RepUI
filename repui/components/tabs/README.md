# Tabs

```django
{% tabs %}
  {% tab_list %}
    {% tab panel="profile" selected=True %}Профиль{% endtab %}
    {% tab panel="security" %}Безопасность{% endtab %}
  {% endtab_list %}

  {% tab_panel id="profile" selected=True %}...{% endtab_panel %}
  {% tab_panel id="security" %}...{% endtab_panel %}
{% endtabs %}
```

```js
import { mountTabs } from ".../tabs.js";
mountTabs(document);
```

Изменение отправляет `rui:change`.
