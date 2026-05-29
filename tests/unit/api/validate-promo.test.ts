import { describe, test, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { FIXTURE_PROMOS } from '../mocks/handlers'

// ── Supabase mock ──────────────────────────────────────────────────────────
const { mockSavePromoCodes } = vi.hoisted(() => ({
  mockSavePromoCodes: vi.fn(async () => {}),
}))

vi.mock('@/lib/supabase', () => ({
  getPromoCodes: vi.fn(async () => FIXTURE_PROMOS),
  savePromoCodes: mockSavePromoCodes,
}))

import { GET } from '@/app/api/validate-promo/route'

function makeReq(code: string) {
  return new NextRequest(`http://localhost/api/validate-promo?code=${encodeURIComponent(code)}`)
}

describe('GET /api/validate-promo', () => {
  test('missing code → { valid: false }', async () => {
    const req = new NextRequest('http://localhost/api/validate-promo')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ valid: false })
  })

  test('unknown code → { valid: false }', async () => {
    const res = await GET(makeReq('NOTACODE'))
    expect(await res.json()).toMatchObject({ valid: false })
  })

  test('inactive code → { valid: false }', async () => {
    const res = await GET(makeReq('INACTIVE'))
    expect(await res.json()).toMatchObject({ valid: false })
  })

  test('expired code → { valid: false, reason: "expired" }', async () => {
    const res = await GET(makeReq('EXPIRED'))
    const body = await res.json()
    expect(body.valid).toBe(false)
    expect(body.reason).toBe('expired')
  })

  test('maxed-out code → { valid: false, reason: "limit_reached" }', async () => {
    const res = await GET(makeReq('MAXEDOUT'))
    const body = await res.json()
    expect(body.valid).toBe(false)
    expect(body.reason).toBe('limit_reached')
  })

  test('valid code → returns discount, label, product_ids, free_shipping', async () => {
    const res = await GET(makeReq('FAMILY30'))
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.discount).toBe(30)
    expect(body.label).toBe('Friends & Family')
    expect(body.product_ids).toEqual([])
    expect(body.free_shipping).toBe(false)
  })

  test('free shipping promo → free_shipping: true, discount: 0', async () => {
    const res = await GET(makeReq('FREESHIP'))
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.free_shipping).toBe(true)
    expect(body.discount).toBe(0)
  })

  test('code is case-insensitive', async () => {
    const res = await GET(makeReq('family30'))
    const body = await res.json()
    expect(body.valid).toBe(true)
  })

  test('increments use_count (fire-and-forget)', async () => {
    await GET(makeReq('FAMILY30'))
    // Give fire-and-forget a tick to execute
    await new Promise((r) => setTimeout(r, 20))
    expect(mockSavePromoCodes).toHaveBeenCalled()
  })
})
