import { test, expect } from '@playwright/test'

/**
 * Promo code E2E tests — seed the cart via localStorage so we don't need
 * to click through the shop every time.
 */
async function seedCart(page: import('@playwright/test').Page) {
  await page.goto('/cart')
  await page.evaluate(() => {
    const item = { product_id: 'product-1', name: 'Lucy Bikini Top', price: 6800, qty: 1, size: 'S', color: '#ff0000', image_url: null, emoji: '🧶', bg_color: '#f2d9d0' }
    const cartState = { state: { items: [item], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false }, version: 0 }
    localStorage.setItem('mba-cart', JSON.stringify(cartState))
  })
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.cart-item').first()).toBeVisible({ timeout: 10000 })
}

test.describe('Promo code flows', () => {
  test('applying a valid promo shows discount row and lowers total', async ({ page }) => {
    await seedCart(page)

    const promoInput = page.locator('input[placeholder*="promo"], input[placeholder*="code"], input[name*="promo"]').first()
    await expect(promoInput).toBeVisible({ timeout: 5000 })

    // Get total before promo
    const totalBefore = await page.locator('[class*="total"]:not([class*="subtotal"])').last().textContent()

    await promoInput.fill('FAMILY30')
    await page.getByRole('button', { name: /apply/i }).click()

    // Discount row should appear
    await expect(page.getByText(/discount|saved|FAMILY30/i).first()).toBeVisible({ timeout: 5000 })

    // Total should be lower now
    const totalAfter = await page.locator('[class*="total"]:not([class*="subtotal"])').last().textContent()
    expect(totalBefore).not.toBe(totalAfter)
  })

  test('removing promo restores original total', async ({ page }) => {
    await seedCart(page)

    const promoInput = page.locator('input[placeholder*="promo"], input[placeholder*="code"], input[name*="promo"]').first()
    await promoInput.fill('FAMILY30')
    await page.getByRole('button', { name: /apply/i }).click()
    await expect(page.getByText(/FAMILY30/i).first()).toBeVisible({ timeout: 5000 })

    // Remove promo
    const removeBtn = page.getByRole('button', { name: /remove|×|clear/i }).first()
    await removeBtn.click()
    await expect(page.getByText(/FAMILY30/i)).toHaveCount(0, { timeout: 5000 })
  })

  test('invalid promo code shows error message', async ({ page }) => {
    await seedCart(page)

    const promoInput = page.locator('input[placeholder*="promo"], input[placeholder*="code"], input[name*="promo"]').first()
    await promoInput.fill('BADCODE')
    await page.getByRole('button', { name: /apply/i }).click()

    await expect(page.getByText(/invalid|not valid|not found/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('free shipping promo shows free shipping indicator', async ({ page }) => {
    await seedCart(page)

    const promoInput = page.locator('input[placeholder*="promo"], input[placeholder*="code"], input[name*="promo"]').first()
    await promoInput.fill('FREESHIP')
    await page.getByRole('button', { name: /apply/i }).click()

    await expect(page.getByText(/free/i).first()).toBeVisible({ timeout: 5000 })
  })
})
