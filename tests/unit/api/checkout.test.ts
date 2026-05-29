import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { FIXTURE_PROMOS } from '../mocks/handlers'

// ── Stripe mock ────────────────────────────────────────────────────────────
const { mockCreateSession } = vi.hoisted(() => ({
  mockCreateSession: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: mockCreateSession } },
  },
}))

// ── Supabase mock ──────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', () => ({
  getPromoCodes: vi.fn(async () => FIXTURE_PROMOS),
}))

import { POST } from '@/app/api/checkout/route'

const SHIPPING = {
  first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com',
  address: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US',
}

const ITEM = { product_id: 'p1', name: 'Lucy Top', price: 6800, qty: 1, size: 'S', color: '#ff0', image_url: null, emoji: '🧶', bg_color: '#fff' }

function makeReq(body: object) {
  return new NextRequest('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateSession.mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
})

describe('POST /api/checkout', () => {
  test('empty items → 400', async () => {
    const res = await POST(makeReq({ items: [], shipping: SHIPPING, giftWrap: false }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/empty/i)
  })

  test('no promo: first shipping option is standard $5.99', async () => {
    await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: false }))
    const { shipping_options } = mockCreateSession.mock.calls[0][0]
    const first = shipping_options[0].shipping_rate_data
    expect(first.fixed_amount.amount).toBe(599)
    expect(first.display_name).toMatch(/first class/i)
  })

  test('free_shipping promo: first shipping option is $0', async () => {
    await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: false, promoCode: 'FREESHIP' }))
    const { shipping_options } = mockCreateSession.mock.calls[0][0]
    const first = shipping_options[0].shipping_rate_data
    expect(first.fixed_amount.amount).toBe(0)
    expect(first.display_name).toMatch(/free/i)
  })

  test('gift wrap adds a $5.00 line item', async () => {
    await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: true }))
    const { line_items } = mockCreateSession.mock.calls[0][0]
    const giftItem = line_items.find((li: { price_data: { unit_amount: number } }) => li.price_data.unit_amount === 500)
    expect(giftItem).toBeDefined()
    expect(giftItem.price_data.product_data.name).toMatch(/gift/i)
  })

  test('stripe error → 500 with actual error message', async () => {
    mockCreateSession.mockRejectedValue(new Error('Card declined by bank'))
    const res = await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: false }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Card declined by bank')
  })

  test('metadata contains serialised items and shipping', async () => {
    await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: false }))
    const { metadata } = mockCreateSession.mock.calls[0][0]
    expect(metadata.items).toBeTruthy()
    expect(metadata.shipping).toBeTruthy()
    const parsedItems = JSON.parse(metadata.items)
    expect(parsedItems[0].product_id).toBe('p1')
  })

  test('discount applied to eligible item price', async () => {
    await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: false, promoCode: 'FAMILY30' }))
    const { line_items } = mockCreateSession.mock.calls[0][0]
    // 30% off 6800 = 4760
    expect(line_items[0].price_data.unit_amount).toBe(4760)
  })

  test('returns checkout url on success', async () => {
    const res = await POST(makeReq({ items: [ITEM], shipping: SHIPPING, giftWrap: false }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://checkout.stripe.com/test')
  })
})
