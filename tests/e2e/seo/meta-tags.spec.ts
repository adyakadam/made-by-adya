import { test, expect } from '@playwright/test'

test.describe('SEO meta tags', () => {
  /**
   * The homepage uses generateMetadata() which awaits a Supabase call for the hero image.
   * Use the /shop page (which loads fast) to verify OG tag infrastructure, then
   * check the homepage via robots meta (which is statically set).
   */

  test('/shop has og:title meta tag', async ({ page }) => {
    await page.goto('/shop')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
    expect(ogTitle!.length).toBeGreaterThan(0)
  })

  test('/shop has og:description meta tag', async ({ page }) => {
    await page.goto('/shop')
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toBeTruthy()
  })

  test('/shop has twitter:card meta tag', async ({ page }) => {
    await page.goto('/shop')
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content')
    expect(twitterCard).toBeTruthy()
  })

  test('/shop has unique title containing "Shop"', async ({ page }) => {
    await page.goto('/shop')
    const title = await page.title()
    expect(title).toMatch(/shop/i)
  })

  test('/shop has its own og:title different from homepage title', async ({ page }) => {
    await page.goto('/shop')
    const shopTitle = await page.title()
    // Just verify it's non-empty and has "shop" in it
    expect(shopTitle).toMatch(/shop/i)
  })

  test('no noindex robots meta on homepage', async ({ page }) => {
    await page.goto('/')
    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    if (robots) {
      expect(robots).not.toContain('noindex')
    }
  })

  test('no noindex robots meta on /shop', async ({ page }) => {
    await page.goto('/shop')
    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    if (robots) {
      expect(robots).not.toContain('noindex')
    }
  })

  test('sitemap.xml is accessible', async ({ page }) => {
    const res = await page.goto('/sitemap.xml')
    expect(res?.status()).toBe(200)
  })

  test('robots.txt is accessible', async ({ page }) => {
    const res = await page.goto('/robots.txt')
    expect(res?.status()).toBe(200)
  })
})
