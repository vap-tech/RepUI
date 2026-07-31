Ты не обязательно неправ. **Серый Tooltip — нормальное осознанное решение**, особенно если хочешь, чтобы он ощущался как нейтральная служебная подсказка, а не как брендовый акцент.

Проблема, похоже, была не в самой серости, а в том, что в default-теме Tooltip, Select, Menu и surfaces жили на разных цветовых логиках. Из-за этого зелёный Tooltip на зелёной теме выглядел слишком «тон в тон» и терял мягкую глубину.

Я бы зафиксировал правило:

```text
Tooltip — нейтральный inverse surface
Select/Menu/Popover — raised surface активной темы
Accent — только focus, selected, active и статусы
```

То есть Tooltip не обязан наследовать primary.

Для Mineral dark:

```css
--rui-tooltip-background:
  color-mix(
    in oklch,
    var(--rui-color-surface-raised) 72%,
    var(--rui-color-text) 28%
  );

--rui-tooltip-foreground:
  var(--rui-color-text-inverse);

--rui-tooltip-border-color:
  color-mix(
    in oklch,
    var(--rui-color-border-strong) 72%,
    transparent
  );

--rui-tooltip-shadow:
  var(--rui-shadow-overlay);
```

Но я бы даже сделал Tooltip отдельной нейтральной поверхностью в semantic contract:

```css
--rui-color-inverse-surface
--rui-color-on-inverse-surface
--rui-color-inverse-border
```

Тогда component mapping будет простым:

```css
--rui-tooltip-background:
  var(--rui-color-inverse-surface);

--rui-tooltip-foreground:
  var(--rui-color-on-inverse-surface);

--rui-tooltip-border-color:
  var(--rui-color-inverse-border);
```

Для Mineral dark это может быть не «серый» в буквальном смысле, а очень слабый сливово-графитовый:

```css
[data-rui-theme="mineral"][data-rui-color-scheme="dark"] {
  --rui-color-inverse-surface:
    oklch(30% 0.028 292);

  --rui-color-on-inverse-surface:
    oklch(96% 0.012 285);

  --rui-color-inverse-border:
    oklch(47% 0.035 292);
}
```

Для Mineral light — тёмный чернильно-графитовый:

```css
[data-rui-theme="mineral"][data-rui-color-scheme="light"] {
  --rui-color-inverse-surface:
    oklch(27% 0.035 292);

  --rui-color-on-inverse-surface:
    oklch(97% 0.01 80);

  --rui-color-inverse-border:
    oklch(40% 0.045 292);
}
```

Так Tooltip остаётся нейтральным, но всё равно принадлежит Mineral-палитре. Он не выглядит случайным чисто-серым блоком и не становится очередной фиолетовой карточкой.

Ещё важное различие:

```text
Tooltip — плотный, контрастный, маленький
Popover — мягкий raised surface
Menu — интерактивный raised surface
Select listbox — интерактивный raised surface
```

Поэтому Tooltip вполне может быть темнее и нейтральнее остальных overlays. На твоём скриншоте это скорее плюс: он будет быстро отделяться от карточек и меню.

Для default-зелёной темы я бы исправлял не Tooltip в сторону зелёного, а добавил нейтральный inverse surface с лёгким холодным или графитовым подтоном. Именно «зелень на зелени» была несогласованностью: брендовый цвет использовался там, где нужна нейтральная служебная поверхность.
