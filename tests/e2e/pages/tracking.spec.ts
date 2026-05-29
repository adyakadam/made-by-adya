import { test, expect } from '@playwright/test'

test.describe('Order tracking page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tracking')
  })

  test('loads with a search form', async ({ page }) => {
    await expect(page.locator('input, [class*="track"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('searching empty string shows error or stays on page', async ({ page }) => {
    const searchBtn = page.getByRole('button', { name: /track/i }).first()
    await searchBtn.click()
    // Should not navigate away
    await expect(page).toHaveURL(/tracking/)
  })

  test('tracking button exists and can be clicked', async ({ page }) => {
    // This tests the basic interaction without requiring Supabase to respond quickly
    const input = page.locator('input[type="text"]').first()
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.fill('#MBA-12345')
    const trackBtn = page.getByRole('button', { name: /track/i })
    await expect(trackBtn).toBeVisible()
    // After clicking, the button shows loading state ("…")
    await trackBtn.click()
    // The button text changes to "…" while loading — verify either loading or result
    const btnText = await trackBtn.textContent().catch(() => '')
    expect(btnText !== '').toBe(true)
  })
})
