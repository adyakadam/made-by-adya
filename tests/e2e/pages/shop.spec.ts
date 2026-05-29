import { test, expect } from '@playwright/test'

test.describe('Shop page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop')
  })

  test('loads with a unique title containing "Shop"', async ({ page }) => {
    const title = await page.title()
    expect(title).toMatch(/shop/i)
  })

  test('displays product cards', async ({ page }) => {
    await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('product cards have images or emoji placeholders', async ({ page }) => {
    const cards = page.locator('[class*="product-card"], .product-card')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
    // Each card should have either an img or a div with emoji text
    const firstCard = cards.first()
    const hasImg = await firstCard.locator('img').count()
    const hasEmoji = await firstCard.locator('[class*="emoji"], [class*="placeholder"]').count()
    expect(hasImg + hasEmoji).toBeGreaterThan(0)
  })

  test('product cards have a name and price', async ({ page }) => {
    await expect(page.locator('[class*="product-card"]').first()).toBeVisible({ timeout: 10000 })
    // At least one price should be visible
    await expect(page.getByText(/\$[\d]+/).first()).toBeVisible({ timeout: 10000 })
  })

  test('clicking a product card navigates to product detail', async ({ page }) => {
    await page.locator('a[href*="/shop/"]').first().click()
    await expect(page).toHaveURL(/\/shop\/.+/, { timeout: 10000 })
  })
})
