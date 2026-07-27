# Select

```django
{% load repui %}

{% select
  name="city"
  id="city"
  placeholder="Выберите город"
%}
  {% select_option value="" disabled=True selected=True %}
    Выберите город
  {% endselect_option %}
  {% select_option value="msk" %}Москва{% endselect_option %}
  {% select_option value="spb" %}Санкт-Петербург{% endselect_option %}
{% endselect %}
```

## Multiple

```django
{% select
  name="skills"
  multiple=True
  placeholder="Выберите навыки"
%}
  {% select_option value="python" %}Python{% endselect_option %}
  {% select_option value="django" selected=True %}Django{% endselect_option %}
  {% select_option value="js" %}JavaScript{% endselect_option %}
{% endselect %}
```

```python
skills = request.POST.getlist("skills")
```

## Runtime

```js
import { mountSelects }
  from "/static/repui/components/select/select.js";

const [select] = mountSelects(document);

select.open();
select.close();
select.value = ["python", "django"];
select.refresh();
select.destroy();
```

## Events

```js
document.addEventListener("rui:change", (event) => {
  console.log(event.detail.value);
});
```

- single: string;
- multiple: string[].
