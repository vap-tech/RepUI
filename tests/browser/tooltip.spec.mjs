import { expect, test } from "@playwright/test";

test("Tooltip opens on focus and closes with Escape", async ({ page }) => {
  await page.goto("/docs/component/tooltip/");

  const trigger = page.getByRole("button", { name: "Слева" });
  await expect(trigger).toHaveAttribute("aria-describedby", /rui-tooltip-/);
  const tooltipId = await trigger.getAttribute("aria-describedby");
  const tooltip = page.locator(`#${tooltipId}`);

  await trigger.focus();
  await expect(tooltip).toBeVisible({ timeout: 1_500 });
  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
});

test("Tooltip portal inherits and releases a local theme context", async ({
  page,
}) => {
  await page.goto("/docs/component/tooltip/");

  const trigger = page.getByRole("button", { name: "Слева" });
  await expect(trigger).toHaveAttribute("aria-describedby", /rui-tooltip-/);
  const tooltipId = await trigger.getAttribute("aria-describedby");
  const tooltip = page.locator(`#${tooltipId}`);

  await trigger.evaluate((element) => {
    const scope = element.closest("[data-rui-tooltip]");
    scope.dataset.ruiTheme = "ocean-deep";
    scope.dataset.ruiColorScheme = "dark";
  });

  await trigger.focus();
  await expect(tooltip).toBeVisible({ timeout: 1_500 });
  await expect(tooltip).toHaveAttribute("data-rui-theme", "ocean-deep");
  await expect(tooltip).toHaveAttribute("data-rui-color-scheme", "dark");

  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(tooltip).not.toHaveAttribute("data-rui-theme");
  await expect(tooltip).not.toHaveAttribute("data-rui-color-scheme");
});
