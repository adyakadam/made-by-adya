import { describe, test, expect, vi, beforeEach } from 'vitest'

// ── Auth mock ──────────────────────────────────────────────────────────────
const { mockCookieGet } = vi.hoisted(() => ({ mockCookieGet: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}))

// ── Supabase mock ──────────────────────────────────────────────────────────
const FIXTURE_CUSTOM_ORDERS = [
  { id: 'co-1', customer_name: 'Alice', customer_email: 'alice@test.com', piece_type: 'Top', budget: '50-100', status: 'pending', created_at: '2026-01-01T00:00:00Z' },
]

const { mockFrom, mockUpdate } = vi.hoisted(() => {
  const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
  const mockFrom = vi.fn(() => ({ update: mockUpdate }))
  return { mockFrom, mockUpdate }
})

vi.mock('@/lib/supabase', () => ({
  adminGetCustomOrders: vi.fn(async () => FIXTURE_CUSTOM_ORDERS),
  getCustomOrderExtras: vi.fn(async () => ({})),
  saveCustomOrderExtra: vi.fn(async () => {}),
  supabaseAdmin: vi.fn(() => ({ from: mockFrom })),
}))

// ── Email mocks ────────────────────────────────────────────────────────────
vi.mock('@/lib/email', () => ({
  sendCustomOrderAccepted: vi.fn().mockResolvedValue(undefined),
  sendCustomOrderInProgress: vi.fn().mockResolvedValue(undefined),
  sendCustomOrderShipped: vi.fn().mockResolvedValue(undefined),
  sendCustomOrderDelivered: vi.fn().mockResolvedValue(undefined),
}))

import { GET } from '@/app/api/admin/custom-orders/route'

function setAuth(value: string | undefined) {
  mockCookieGet.mockReturnValue(value ? { value } : undefined)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
  mockFrom.mockReturnValue({ update: mockUpdate })
})

describe('GET /api/admin/custom-orders', () => {
  test('unauthenticated → 401', async () => {
    setAuth(undefined)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  test('authenticated → returns orders and extras', async () => {
    setAuth('1')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.orders).toHaveLength(1)
    expect(body.orders[0].customer_name).toBe('Alice')
    expect(body.extras).toBeDefined()
  })
})
