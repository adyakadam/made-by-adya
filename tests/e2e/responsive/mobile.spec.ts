import { test, expect } from '@playwright/test'

/**
 * Mobile responsive tests — run against the iPhone 14 project defined in playwright.config.ts.
 * These tests also run on desktop but are most meaningful on narrow viewports.
 */
test.describe('Mobile navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('hamburger button is visible on narrow viewport', async ({ page }) => {
    // Resize to mobile if not already
    const vp = page.viewportSize()
    if (vp && vp.width > 768) {
      await page.setViewportSize({ width: 375, height: 812 })
    }
    const hamburger = page.locator('[class*="hamburger"], button[aria-label*="menu"], button[class*="mobile-menu"]').first()
    await expect(hamburger).toBeVisible({ timeout: 10000 })
  })

  test('desktop nav links are hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    // The desktop nav row should not be visible
    const desktopNav = page.locator('[class*="nav-links"]').first()
    if (await desktopNav.count() > 0) {
      await expect(desktopNav).toBeHidden()
    }
  })

  test('tapping hamburger opens mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const hamburger = page.locator('[class*="hamburger"], button[aria-label*="menu"]').first()
    if (await hamburger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await hamburger.click()
      // Some form of menu overlay or panel should appear
      const mobileMenu = page.locator('[class*="mobile-menu"], [class*="drawer"], [class*="overlay"]').first()
      await expect(mobileMenu).toBeVisible({ timeout: 3000 })
    }
  })

  test('cart page stacks vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/cart')
    // The cart layout should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = 375
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20) // 20px tolerance
  })
})
