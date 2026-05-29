import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads and shows hero section', async ({ page }) => {
    await expect(page.locator('[class*="hero"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('hero has a primary CTA button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /shop|collection/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('nav bar is visible', async ({ page }) => {
    await expect(page.locator('nav, header').first()).toBeVisible({ timeout: 10000 })
  })

  test('announcement bar is present', async ({ page }) => {
    await expect(page.locator('[class*="announce"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('page title is set', async ({ page }) => {
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
    expect(title).toContain('Adya')
  })

  test('footer is visible', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('footer').first()).toBeVisible({ timeout: 10000 })
  })
})
