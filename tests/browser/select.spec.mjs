import { expect, test } from "@playwright/test";

test("Select keeps native value in sync with keyboard selection", async ({
  page,
}) => {
  await page.goto("/docs/component/select/");

  const select = page.locator('select[name="city_demo"]');
  const wrapper = page.locator(".rui-select").filter({ has: select });
  const trigger = wrapper.getByRole("combobox");

  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("option", { name: "Москва" }))
    .toHaveAttribute("data-active", "true");

  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Санкт-Петербург" }))
    .toHaveAttribute("data-active", "true");

  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(select).toHaveValue("spb");
  await expect(trigger).toContainText("Санкт-Петербург");
});

test("Multiple Select keeps its popup open and supports typeahead", async ({
  page,
}) => {
  await page.goto("/docs/component/select/");

  const select = page.locator('select[name="skills_demo"]');
  const wrapper = page.locator(".rui-select").filter({ has: select });
  const trigger = wrapper.getByRole("combobox");

  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("p");
  await expect(page.getByRole("option", { name: "Python" }))
    .toHaveAttribute("data-active", "true");

  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await select.evaluate(
    (element) => [...element.selectedOptions].map((option) => option.value),
  )).toEqual(["python", "django", "sql"]);
});
