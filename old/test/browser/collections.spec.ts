import { expect, test } from '@playwright/test';

test.describe('collections examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collections.html');
    await page.locator('#select [data-rui-select-trigger]').waitFor();
  });

  test('Select keeps the active option visible in its bounded list', async ({ page }) => {
    const example = page.locator('#select .rui-example');
    const trigger = example.locator('[data-rui-select-trigger]');
    await trigger.click();
    const panel = page.locator('[data-rui-select-content]');
    await expect(panel).toBeVisible();
    await trigger.press('End');
    const active = panel.locator('[data-active]');
    await expect(active).toBeVisible();
    const metrics = await active.evaluate((element) => {
      const item = element.getBoundingClientRect();
      const list = element.parentElement!.getBoundingClientRect();
      return { itemBottom: item.bottom, listBottom: list.bottom, scrollTop: element.parentElement!.scrollTop };
    });
    expect(metrics.scrollTop).toBeGreaterThan(0);
    expect(metrics.itemBottom).toBeLessThanOrEqual(metrics.listBottom + 1);
  });

  test('Select stays inside the viewport at the edge', async ({ page }) => {
    await page.locator('#select').scrollIntoViewIfNeeded();
    await page.locator('#select [data-rui-select-trigger]').click();
    const box = await page.locator('[data-rui-select-content]').boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual((await page.evaluate(() => innerHeight)) + 1);
  });

  test('Combobox filters its list and selects the visible result', async ({ page }) => {
    const combo = page.locator('#combobox');
    const input = combo.locator('[data-rui-input]');
    await input.fill('библи');
    const visibleOptions = page.locator('.rui-combobox__list [data-rui-option]:visible');
    await expect(visibleOptions).toHaveCount(2);
    await expect(visibleOptions.first()).toContainText('Центральная библиотека');
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(combo.locator('[data-rui-value]')).toHaveValue('library');
  });
});
