EXAMPLES = {
    "docs_shell": """
{% container %}
  {% stack rows=20 %}
    {% container row=1 %}Header{% endcontainer %}
    {% container row=19 %}
      {% grid columns=5 %}
        {% container column=1 %}Sidebar{% endcontainer %}
        {% container column=4 %}HTMX content{% endcontainer %}
      {% endgrid %}
    {% endcontainer %}
  {% endstack %}
{% endcontainer %}
""",
    "pagination": """
{% grid columns=10 column_size='content' spacing='xs' %}
  {% for page in pages %}
    {% button size='sm' %}{{ page }}{% endbutton %}
  {% endfor %}
{% endgrid %}
""",
}
