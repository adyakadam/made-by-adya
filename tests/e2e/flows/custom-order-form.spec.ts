import { test, expect } from '@playwright/test'

test.describe('Custom order form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/custom')
  })

  test('custom page loads with a heading', async ({ page }) => {
    // Scope to main content to avoid matching hidden mobile nav links
    const heading = page.locator('main h1, main h2, [class*="custom"] h1, [class*="custom"] h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('form has name and email fields', async ({ page }) => {
    await expect(page.locator('input[type="email"], input[name*="email"]').first()).toBeVisible({ timeout: 10000 })
    // A name input or first text input should exist
    await expect(page.locator('input[type="text"], input[name*="name"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('form has a description or vision textarea', async ({ page }) => {
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10000 })
  })

  test('submit button is present', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /submit|send|request/i }).first()
    await expect(submitBtn).toBeVisible({ timeout: 10000 })
  })
})
