/**
 * webhook.test.ts — Most critical money-flow test.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Stripe mock ────────────────────────────────────────────────────────────
const { mockConstructEvent } = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
  },
}))

// ── Supabase mock ──────────────────────────────────────────────────────────
const { mockInsert, mockRpc, mockDecrementColorStock, mockSupabaseAdmin } = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null })
  const mockRpc = vi.fn().mockResolvedValue({ error: null })
  const dbMock = {
    from: vi.fn(() => ({ insert: mockInsert })),
    rpc: mockRpc,
  }
  const mockSupabaseAdmin = vi.fn(() => dbMock)
  const mockDecrementColorStock = vi.fn().mockResolvedValue(undefined)
  return { mockInsert, mockRpc, mockDecrementColorStock, mockSupabaseAdmin }
})

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabaseAdmin,
  decrementColorStock: mockDecrementColorStock,
}))

// ── Email mock ─────────────────────────────────────────────────────────────
const { mockSendOrderConfirmation } = vi.hoisted(() => ({
  mockSendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email', () => ({
  sendOrderConfirmation: mockSendOrderConfirmation,
}))

import { POST } from '@/app/api/webhooks/stripe/route'

// ── Helpers ────────────────────────────────────────────────────────────────
const ITEMS = [
  { product_id: 'p1', name: 'Lucy Top', qty: 1, size: 'S', color: '#ff0', price: 6800, emoji: '🧶' },
  { product_id: 'p2', name: 'Cardigan', qty: 2, size: 'M', color: '', price: 9800, emoji: '🧶' },
]

const SHIPPING = {
  first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com',
  address: '123 Main', city: 'NYC', state: 'NY', zip: '10001', country: 'US',
}

function makeSession(overrides: object = {}) {
  return {
    id: 'cs_test_123',
    payment_intent: 'pi_test_456',
    customer_email: 'jane@example.com',
    amount_subtotal: 26400,
    amount_total: 28512,
    total_details: { amount_tax: 2112 },
    metadata: {
      items: JSON.stringify(ITEMS),
      shipping: JSON.stringify(SHIPPING),
      gift_wrap: 'false',
    },
    ...overrides,
  }
}

function makeEvent(type: string, session: object) {
  return { type, data: { object: session } }
}

function makeReq(body: string, sig = 'valid-sig') {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': sig, 'Content-Type': 'application/json' },
    body,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockInsert.mockResolvedValue({ error: null })
  mockRpc.mockResolvedValue({ error: null })
  mockDecrementColorStock.mockResolvedValue(undefined)
  mockSendOrderConfirmation.mockResolvedValue(undefined)
  const dbMock = { from: vi.fn(() => ({ insert: mockInsert })), rpc: mockRpc }
  mockSupabaseAdmin.mockReturnValue(dbMock)
})

// ── Tests ──────────────────────────────────────────────────────────────────
describe('POST /api/webhooks/stripe', () => {
  test('bad signature → 400', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature mismatch')
    })
    const res = await POST(makeReq('{}', 'bad-sig'))
    expect(res.status).toBe(400)
  })

  test('unknown event type → 200, no side effects', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.created', {}))
    const res = await POST(makeReq('{}'))
    expect(res.status).toBe(200)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  test('checkout.session.completed → inserts order with status="paid"', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    const res = await POST(makeReq('{}'))
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paid', customer_email: 'jane@example.com' })
    )
  })

  test('inserts correct subtotal, tax, total from session', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    await POST(makeReq('{}'))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 26400, tax: 2112, total: 28512 })
    )
  })

  test('calls decrement_stock RPC for each item', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    await POST(makeReq('{}'))
    expect(mockRpc).toHaveBeenCalledTimes(2)
    expect(mockRpc).toHaveBeenCalledWith('decrement_stock', { product_id: 'p1', qty: 1 })
    expect(mockRpc).toHaveBeenCalledWith('decrement_stock', { product_id: 'p2', qty: 2 })
  })

  test('calls decrementColorStock for items with color only', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    await POST(makeReq('{}'))
    // Only p1 has a color; p2 has empty color string
    expect(mockDecrementColorStock).toHaveBeenCalledTimes(1)
    expect(mockDecrementColorStock).toHaveBeenCalledWith('p1', '#ff0', 1)
  })

  test('sends confirmation email after order saved', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    await POST(makeReq('{}'))
    expect(mockSendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: 'jane@example.com' })
    )
  })

  test('continues if email throws — still returns 200', async () => {
    mockSendOrderConfirmation.mockRejectedValue(new Error('Email service down'))
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    const res = await POST(makeReq('{}'))
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalled()
  })

  test('handles null supabaseAdmin gracefully — no crash', async () => {
    mockSupabaseAdmin.mockReturnValueOnce(null)
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', makeSession()))
    const res = await POST(makeReq('{}'))
    expect(res.status).toBe(200)
  })

  test('gift_wrap flag parsed correctly from metadata', async () => {
    const session = makeSession({
      metadata: {
        items: JSON.stringify(ITEMS),
        shipping: JSON.stringify(SHIPPING),
        gift_wrap: 'true',
      },
    })
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', session))
    await POST(makeReq('{}'))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ gift_wrap: true }))
  })
})
