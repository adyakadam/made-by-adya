import { test as base, type BrowserContext } from '@playwright/test'

/**
 * Pre-authenticated admin fixture.
 * Injects the mba_admin=1 HttpOnly cookie so tests can access /admin
 * without going through the login flow every time.
 */
export const test = base.extend<{ adminContext: BrowserContext }>({
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext()
    await context.addCookies([
      {
        name: 'mba_admin',
        value: '1',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
      },
    ])
    await use(context)
    await context.close()
  },
})

export { expect } from '@playwright/test'
