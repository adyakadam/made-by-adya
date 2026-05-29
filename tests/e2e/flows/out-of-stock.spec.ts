import { test, expect } from '@playwright/test'

test.describe('Out-of-stock behavior', () => {
  test('shop page loads with product cards', async ({ page }) => {
    await page.goto('/shop')
    await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 })
    const cardCount = await page.locator('[class*="product-card"], .product-card').count()
    expect(cardCount).toBeGreaterThan(0)
  })

  test('product detail page has a .pdp-add-btn button', async ({ page }) => {
    await page.goto('/shop')
    const cards = page.locator('a[href*="/shop/"]')
    const count = await cards.count()
    if (count === 0) return

    await cards.first().click()
    await page.waitForURL(/\/shop\/.+/, { timeout: 10000 })

    // Select first size if available
    const sizeBtn = page.locator('.size-opt').first()
    if (await sizeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sizeBtn.click()
    }

    // Select first color if available
    const colorBtn = page.locator('.color-swatch').first()
    if (await colorBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colorBtn.click()
    }

    // The .pdp-add-btn is always rendered (either "Sold Out" or "+ Add to Cart")
    await expect(page.locator('.pdp-add-btn').first()).toBeVisible({ timeout: 10000 })
  })
})
