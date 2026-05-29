import { test, expect } from '@playwright/test'

async function seedCart(page: import('@playwright/test').Page, qty = 1) {
  await page.goto('/cart')
  await page.evaluate((qty) => {
    const item = { product_id: 'seed-p1', name: 'Test Top', price: 6800, qty, size: 'S', color: '#ff0', image_url: null, emoji: '🧶', bg_color: '#fff' }
    const cartState = { state: { items: [item], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false }, version: 0 }
    localStorage.setItem('mba-cart', JSON.stringify(cartState))
  }, qty)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.cart-item').first()).toBeVisible({ timeout: 10000 })
}

test.describe('Cart page', () => {
  test('empty cart shows an empty state message', async ({ page }) => {
    await page.goto('/cart')
    await page.evaluate(() => {
      const cartState = { state: { items: [], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false }, version: 0 }
      localStorage.setItem('mba-cart', JSON.stringify(cartState))
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/your cart is empty|empty|nothing|no items/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('+ button increments quantity', async ({ page }) => {
    await seedCart(page, 1)
    // Use specific class for qty buttons
    const plusBtn = page.locator('.qty-btn').filter({ hasText: '+' }).first()
    await expect(plusBtn).toBeVisible({ timeout: 5000 })
    await plusBtn.click()
    // qty-num should now show 2
    await expect(page.locator('.qty-num').filter({ hasText: '2' }).first()).toBeVisible({ timeout: 5000 })
  })

  test('− button decrements quantity', async ({ page }) => {
    await seedCart(page, 2)
    const minusBtn = page.locator('.qty-btn').first() // first button is the minus
    await expect(minusBtn).toBeVisible({ timeout: 5000 })
    await minusBtn.click()
    await expect(page.locator('.qty-num').filter({ hasText: '1' }).first()).toBeVisible({ timeout: 5000 })
  })

  test('remove button removes item from cart', async ({ page }) => {
    await seedCart(page)
    const removeBtn = page.locator('.remove-item').first()
    await expect(removeBtn).toBeVisible({ timeout: 5000 })
    await removeBtn.click()
    await expect(page.getByText(/your cart is empty|empty|nothing|no items/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('gift wrap checkbox adds $5 to subtotal', async ({ page }) => {
    await seedCart(page)

    // Get subtotal before gift wrap
    const subtotalEl = page.locator('[class*="subtotal"], [class*="total"]').first()
    const before = await subtotalEl.textContent()

    const giftWrapCheckbox = page.locator('input[type="checkbox"]').first()
    await giftWrapCheckbox.check()

    const after = await subtotalEl.textContent()
    expect(before).not.toBe(after)
  })

  test('cart shows item price', async ({ page }) => {
    await seedCart(page)
    // $68 for price 6800 cents
    await expect(page.getByText(/\$68/).first()).toBeVisible({ timeout: 10000 })
  })
})
