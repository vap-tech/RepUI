import { expect, test } from "@playwright/test";

test("HTMX swaps mount the incoming component runtime without console errors", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/docs/component/tooltip/");
  await page.evaluate(() => window.__repuiRuntimeReady);

  const tooltipTrigger = page.getByRole("button", { name: "Слева" });
  await expect(tooltipTrigger).toHaveAttribute("aria-describedby", /rui-tooltip-/);

  await page.getByRole("button", { name: "Dialog", exact: true }).click();
  const dialogTrigger = page.getByRole("button", { name: "Открыть Dialog" });
  await expect(dialogTrigger).toBeVisible();
  await dialogTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Tooltip", exact: true }).click();
  await expect(tooltipTrigger).toBeVisible();
  await expect(tooltipTrigger).toHaveAttribute("aria-describedby", /rui-tooltip-/);

  expect(errors).toEqual([]);
});
