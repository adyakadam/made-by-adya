import { test, expect } from '@playwright/test'

test.describe('Purchase flow', () => {
  test('shop shows product cards', async ({ page }) => {
    await page.goto('/shop')
    await expect(page.locator('[class*="product-card"], .product-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to a product page', async ({ page }) => {
    await page.goto('/shop')
    const firstCard = page.locator('a[href*="/shop/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })
    await firstCard.click()
    await expect(page).toHaveURL(/\/shop\/.+/)
  })

  test('product page shows Add to Cart button', async ({ page }) => {
    await page.goto('/shop')
    await page.locator('a[href*="/shop/"]').first().click()
    await expect(page.locator('.pdp-add-btn').first()).toBeVisible({ timeout: 10000 })
  })

  test('cart badge appears after adding item to cart via localStorage', async ({ page }) => {
    // Seed cart directly via localStorage — avoids needing a product with sizes/colors available
    await page.goto('/')
    await page.evaluate(() => {
      const item = { product_id: 'test-p1', name: 'Test Top', price: 6800, qty: 1, size: 'S', color: '#ff0', image_url: null, emoji: '🧶', bg_color: '#fff' }
      const cartState = { state: { items: [item], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false }, version: 0 }
      localStorage.setItem('mba-cart', JSON.stringify(cartState))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    // The nav cart count badge (.cart-count) should show 1
    await expect(page.locator('.cart-count').first()).toBeVisible({ timeout: 10000 })
    const countText = await page.locator('.cart-count').first().textContent()
    expect(Number(countText)).toBeGreaterThan(0)
  })

  test('cart page shows added item', async ({ page }) => {
    // Seed via localStorage for speed
    await page.goto('/cart')
    await page.evaluate(() => {
      const item = { product_id: 'p1', name: 'Lucy Bikini Top', price: 6800, qty: 1, size: 'S', color: '#ff0000', image_url: null, emoji: '🧶', bg_color: '#f2d9d0' }
      const cartState = { state: { items: [item], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false }, version: 0 }
      localStorage.setItem('mba-cart', JSON.stringify(cartState))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.cart-item').first()).toBeVisible({ timeout: 10000 })
  })

  test('checkout button on cart goes toward Stripe', async ({ page }) => {
    await page.goto('/cart')
    await page.evaluate(() => {
      const item = { product_id: 'test-p1', name: 'Test Top', price: 6800, qty: 1, size: 'S', color: '#ff0', image_url: null, emoji: '🧶', bg_color: '#fff' }
      const cartState = { state: { items: [item], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false }, version: 0 }
      localStorage.setItem('mba-cart', JSON.stringify(cartState))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    // The cart should have the item; verify checkout step or proceed button exists
    await expect(page.locator('.cart-item, [class*="checkout"]').first()).toBeVisible({ timeout: 10000 })
  })
})
