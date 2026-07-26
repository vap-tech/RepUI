from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Example:
    slug: str
    title: str
    description: str
    template: str

EXAMPLES = (
    Example(
        "variants",
        "Варианты",
        "Все варианты показаны на primary intent.",
r"""{% load repui %}
<div class="rui-demo-grid">
  {% button variant="filled" color="primary" %}Filled{% endbutton %}
  {% button variant="outlined" color="primary" %}Outlined{% endbutton %}
  {% button variant="soft" color="primary" %}Soft{% endbutton %}
  {% button variant="text" color="primary" %}Text{% endbutton %}
</div>"""
    ),
    Example(
        "colors",
        "Цвета",
        "Все semantic colors в filled варианте.",
r"""{% load repui %}
<div class="rui-demo-grid">
  {% button color="default" %}Default{% endbutton %}
  {% button color="primary" %}Primary{% endbutton %}
  {% button color="secondary" %}Secondary{% endbutton %}
  {% button color="success" %}Success{% endbutton %}
  {% button color="warning" %}Warning{% endbutton %}
  {% button color="danger" %}Danger{% endbutton %}
</div>"""
    ),
    Example(
        "color-matrix",
        "Матрица цветов",
        "Проверка outlined, soft и text на всех цветах.",
r"""{% load repui %}
<div class="rui-demo-stack">
  <div class="rui-demo-grid">
    {% button variant="outlined" color="primary" %}Primary{% endbutton %}
    {% button variant="outlined" color="secondary" %}Secondary{% endbutton %}
    {% button variant="outlined" color="success" %}Success{% endbutton %}
    {% button variant="outlined" color="warning" %}Warning{% endbutton %}
    {% button variant="outlined" color="danger" %}Danger{% endbutton %}
  </div>
  <div class="rui-demo-grid">
    {% button variant="soft" color="primary" %}Primary{% endbutton %}
    {% button variant="soft" color="secondary" %}Secondary{% endbutton %}
    {% button variant="soft" color="success" %}Success{% endbutton %}
    {% button variant="soft" color="warning" %}Warning{% endbutton %}
    {% button variant="soft" color="danger" %}Danger{% endbutton %}
  </div>
  <div class="rui-demo-grid">
    {% button variant="text" color="primary" %}Primary{% endbutton %}
    {% button variant="text" color="secondary" %}Secondary{% endbutton %}
    {% button variant="text" color="success" %}Success{% endbutton %}
    {% button variant="text" color="warning" %}Warning{% endbutton %}
    {% button variant="text" color="danger" %}Danger{% endbutton %}
  </div>
</div>"""
    ),
    Example(
        "sizes",
        "Размеры",
        "XS, SM, MD, LG и XL.",
r"""{% load repui %}
<div class="rui-demo-grid rui-demo-grid--baseline">
  {% button size="xs" color="primary" %}XS{% endbutton %}
  {% button size="sm" color="primary" %}SM{% endbutton %}
  {% button size="md" color="primary" %}MD{% endbutton %}
  {% button size="lg" color="primary" %}LG{% endbutton %}
  {% button size="xl" color="primary" %}XL{% endbutton %}
</div>"""
    ),
    Example(
        "states",
        "Состояния",
        "Disabled, loading, full-width и link.",
r"""{% load repui %}
<div class="rui-demo-stack">
  <div class="rui-demo-grid">
    {% button disabled=True %}Disabled default{% endbutton %}
    {% button disabled=True color="primary" %}Disabled primary{% endbutton %}
    {% button loading=True color="primary" %}Загрузка{% endbutton %}
    {% button href="/docs/" variant="outlined" color="primary" %}Ссылка{% endbutton %}
  </div>
  {% button full_width=True color="primary" %}На всю ширину{% endbutton %}
</div>"""
    ),
)
