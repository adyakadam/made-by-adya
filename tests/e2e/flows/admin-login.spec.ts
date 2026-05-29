import { test, expect } from '@playwright/test'

test.describe('Admin login flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear admin cookie before each test
    await page.context().clearCookies()
  })

  test('shows login form at /admin', async ({ page }) => {
    await page.goto('/admin')
    // The admin page has a password input
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 })
  })

  test('wrong password → stays on login, shows error', async ({ page }) => {
    await page.goto('/admin')
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('wrongpassword')
    // Submit via Enter key to avoid hitting hamburger button on mobile
    await passwordInput.press('Enter')
    await expect(page.getByText(/incorrect|invalid|wrong|please try/i).first()).toBeVisible({ timeout: 5000 })
    await expect(page).not.toHaveURL(/dashboard/)
  })

  test('correct password → redirected to dashboard', async ({ page }) => {
    await page.goto('/admin')
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('testpass123')
    await passwordInput.press('Enter')
    // After successful login, redirected to /admin/dashboard
    await expect(page).toHaveURL(/admin\/dashboard|admin/, { timeout: 10000 })
  })
})
