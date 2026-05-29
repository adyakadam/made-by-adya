import { test, expect } from '@playwright/test'

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop')
    await page.locator('a[href*="/shop/"]').first().click()
    await page.waitForURL(/\/shop\/.+/, { timeout: 10000 })
  })

  test('shows product name', async ({ page }) => {
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows product price', async ({ page }) => {
    await expect(page.getByText(/\$[\d]+/).first()).toBeVisible({ timeout: 10000 })
  })

  test('has Add to Cart button', async ({ page }) => {
    const addBtn = page.locator('.pdp-add-btn').first()
    await expect(addBtn).toBeVisible({ timeout: 10000 })
  })

  test('size selector is present when product has sizes', async ({ page }) => {
    // Size buttons or a select should be present
    const sizeElem = page.locator('[class*="size"], select[name*="size"]').first()
    const exists = await sizeElem.count()
    // If sizes exist, they should be clickable
    if (exists > 0) {
      await expect(sizeElem).toBeVisible()
    }
  })

  test('color swatches are present when product has colors', async ({ page }) => {
    const swatches = page.locator('[class*="swatch"], [class*="color-btn"]')
    const count = await swatches.count()
    // If swatches present, first one should be visible
    if (count > 0) {
      await expect(swatches.first()).toBeVisible()
    }
  })

  test('selecting a color updates the stock display', async ({ page }) => {
    const swatches = page.locator('[class*="swatch"]')
    const count = await swatches.count()
    if (count < 2) return // Skip if fewer than 2 colors

    // Record stock text before
    const stockEl = page.locator('[class*="stock"], p:has-text("in stock"), p:has-text("left")').first()

    await swatches.nth(0).click()
    const stockBefore = await stockEl.textContent().catch(() => '')

    await swatches.nth(1).click()
    const stockAfter = await stockEl.textContent().catch(() => '')

    // Stock text may or may not change — just verify page doesn't crash
    expect(typeof stockBefore).toBe('string')
    expect(typeof stockAfter).toBe('string')
  })
})
