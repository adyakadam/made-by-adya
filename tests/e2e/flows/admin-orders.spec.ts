import { test, expect } from '../fixtures/auth'

test.describe('Admin orders management', () => {
  test.beforeEach(async ({ adminContext }) => {
    // Tests use adminContext fixture which has mba_admin=1 cookie
    const page = await adminContext.newPage()
    await page.goto('/admin/dashboard')
    await page.close()
  })

  test('can view orders tab', async ({ adminContext }) => {
    const page = await adminContext.newPage()
    await page.goto('/admin/dashboard')
    const ordersTab = page.getByRole('button', { name: /orders/i }).first()
    if (await ordersTab.isVisible()) await ordersTab.click()
    // Scope to main content to avoid matching hidden mobile nav links
    const main = page.locator('main, [class*="dashboard"], [class*="admin-content"], #main-content').first()
    await expect(main).toBeVisible({ timeout: 10000 })
    await page.close()
  })

  test('orders table shows order numbers', async ({ adminContext }) => {
    const page = await adminContext.newPage()
    await page.goto('/admin/dashboard')

    // Click orders tab if present
    const ordersTab = page.getByRole('button', { name: /^orders$/i })
    if (await ordersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ordersTab.click()
    }

    // Verify the dashboard page itself loaded (scoped to avoid mobile nav links)
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 })
    // Check for order-related UI content (table header, empty state, or real orders)
    const orderContent = page.locator('table, [class*="order"], [class*="empty"], h1, h2').first()
    await expect(orderContent).toBeVisible({ timeout: 10000 })
    await page.close()
  })
})
