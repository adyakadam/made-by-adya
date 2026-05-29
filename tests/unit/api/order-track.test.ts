import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { FIXTURE_ORDERS } from '../mocks/handlers'

// ── Supabase mock ──────────────────────────────────────────────────────────
const { mockGetOrderByNumber } = vi.hoisted(() => ({
  mockGetOrderByNumber: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getOrderByNumber: mockGetOrderByNumber,
}))

import { GET } from '@/app/api/orders/track/route'

function makeReq(num: string) {
  return new NextRequest(`http://localhost/api/orders/track?num=${encodeURIComponent(num)}`)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetOrderByNumber.mockResolvedValue(FIXTURE_ORDERS[0])
})

describe('GET /api/orders/track', () => {
  test('missing num param → 400', async () => {
    const res = await GET(new NextRequest('http://localhost/api/orders/track'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/missing/i)
  })

  test('order not found → { order: null }', async () => {
    mockGetOrderByNumber.mockResolvedValue(null)
    const res = await GET(makeReq('#MBA-99999'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.order).toBeNull()
  })

  test('found order → returns order object', async () => {
    const res = await GET(makeReq('#MBA-12345'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.order.order_number).toBe('#MBA-12345')
    expect(body.order.status).toBe('paid')
  })

  test('strips # prefix before querying', async () => {
    await GET(makeReq('#MBA-12345'))
    expect(mockGetOrderByNumber).toHaveBeenCalledWith('MBA-12345')
  })

  test('works without # prefix too', async () => {
    await GET(makeReq('MBA-12345'))
    expect(mockGetOrderByNumber).toHaveBeenCalledWith('MBA-12345')
  })
})
