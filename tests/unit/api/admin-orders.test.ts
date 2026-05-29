import { describe, test, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { FIXTURE_ORDERS } from '../mocks/handlers'

// ── Auth mock ──────────────────────────────────────────────────────────────
const { mockCookieGet } = vi.hoisted(() => ({ mockCookieGet: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}))

// ── Supabase mock ──────────────────────────────────────────────────────────
const { mockGetAllOrders, mockUpdateOrderStatus, mockGetOrderById } = vi.hoisted(() => ({
  mockGetAllOrders: vi.fn(async () => FIXTURE_ORDERS),
  mockUpdateOrderStatus: vi.fn(async () => {}),
  mockGetOrderById: vi.fn(async () => FIXTURE_ORDERS[0]),
}))

vi.mock('@/lib/supabase', () => ({
  adminGetAllOrders: mockGetAllOrders,
  adminUpdateOrderStatus: mockUpdateOrderStatus,
  adminGetOrderById: mockGetOrderById,
}))

// ── Email mocks ────────────────────────────────────────────────────────────
const { mockSendShipping, mockSendDelivery } = vi.hoisted(() => ({
  mockSendShipping: vi.fn().mockResolvedValue(undefined),
  mockSendDelivery: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email', () => ({
  sendShippingNotification: mockSendShipping,
  sendDeliveryNotification: mockSendDelivery,
}))

import { GET, PATCH } from '@/app/api/admin/orders/route'

function setAuth(value: string | undefined) {
  mockCookieGet.mockReturnValue(value ? { value } : undefined)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetAllOrders.mockResolvedValue(FIXTURE_ORDERS)
  mockUpdateOrderStatus.mockResolvedValue(undefined)
  mockGetOrderById.mockResolvedValue(FIXTURE_ORDERS[0])
  mockSendShipping.mockResolvedValue(undefined)
  mockSendDelivery.mockResolvedValue(undefined)
})

function patchReq(body: object) {
  return new NextRequest('http://localhost/api/admin/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── GET ────────────────────────────────────────────────────────────────────
describe('GET /api/admin/orders', () => {
  test('unauthenticated → 401', async () => {
    setAuth(undefined)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  test('authenticated → returns order list', async () => {
    setAuth('1')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(FIXTURE_ORDERS.length)
    expect(body[0].order_number).toBe('#MBA-12345')
  })
})

// ── PATCH ──────────────────────────────────────────────────────────────────
describe('PATCH /api/admin/orders', () => {
  test('unauthenticated → 401', async () => {
    setAuth(undefined)
    const res = await PATCH(patchReq({ id: 'order-1', status: 'shipped' }))
    expect(res.status).toBe(401)
  })

  test('authenticated → calls updateOrderStatus', async () => {
    setAuth('1')
    await PATCH(patchReq({ id: 'order-1', status: 'paid' }))
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-1', 'paid', undefined)
  })

  test('status=shipped → sends shipping notification email', async () => {
    setAuth('1')
    await PATCH(patchReq({ id: 'order-1', status: 'shipped', tracking_number: '9400111' }))
    expect(mockSendShipping).toHaveBeenCalledWith(
      expect.objectContaining({ tracking_number: '9400111' })
    )
  })

  test('status=delivered → sends delivery notification email', async () => {
    setAuth('1')
    await PATCH(patchReq({ id: 'order-1', status: 'delivered' }))
    expect(mockSendDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ order_number: '#MBA-12345' })
    )
  })

  test('status=paid → no shipping or delivery email', async () => {
    setAuth('1')
    await PATCH(patchReq({ id: 'order-1', status: 'paid' }))
    expect(mockSendShipping).not.toHaveBeenCalled()
    expect(mockSendDelivery).not.toHaveBeenCalled()
  })

  test('returns { ok: true } on success', async () => {
    setAuth('1')
    const res = await PATCH(patchReq({ id: 'order-1', status: 'shipped' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true })
  })
})
