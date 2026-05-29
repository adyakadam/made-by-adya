import { describe, test, expect, vi, beforeEach } from 'vitest'
import { FIXTURE_PRODUCTS } from '../mocks/handlers'

// ── Auth mock ──────────────────────────────────────────────────────────────
const { mockCookieGet } = vi.hoisted(() => ({ mockCookieGet: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}))

// ── Supabase mock ──────────────────────────────────────────────────────────
const { mockGetAllProducts, mockUpsertProduct } = vi.hoisted(() => ({
  mockGetAllProducts: vi.fn(async () => FIXTURE_PRODUCTS),
  mockUpsertProduct: vi.fn(async (p: object) => p),
}))

vi.mock('@/lib/supabase', () => ({
  adminGetAllProducts: mockGetAllProducts,
  adminUpsertProduct: mockUpsertProduct,
}))

import { GET, POST } from '@/app/api/admin/products/route'
import { NextRequest } from 'next/server'

function setAuth(value: string | undefined) {
  mockCookieGet.mockReturnValue(value ? { value } : undefined)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetAllProducts.mockResolvedValue(FIXTURE_PRODUCTS)
  mockUpsertProduct.mockImplementation(async (p) => p)
})

function postReq(body: object) {
  return new NextRequest('http://localhost/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/admin/products', () => {
  test('unauthenticated → 401', async () => {
    setAuth(undefined)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  test('authenticated → returns product list', async () => {
    setAuth('1')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(FIXTURE_PRODUCTS.length)
    expect(body[0].name).toBe('Lucy Bikini Top')
  })
})

describe('POST /api/admin/products', () => {
  test('unauthenticated → 401', async () => {
    setAuth(undefined)
    const res = await POST(postReq({ name: 'New Product' }))
    expect(res.status).toBe(401)
  })

  test('authenticated → calls upsertProduct and returns result', async () => {
    setAuth('1')
    const product = { id: 'new-1', name: 'Test Product', price: 5000 }
    mockUpsertProduct.mockResolvedValue(product)
    const res = await POST(postReq(product))
    expect(res.status).toBe(200)
    expect(mockUpsertProduct).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Product' }))
  })

  test('upsertProduct throws → 500 with error message', async () => {
    setAuth('1')
    mockUpsertProduct.mockRejectedValue(new Error('Unique constraint violation'))
    const res = await POST(postReq({ name: 'Dupe' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('Unique constraint')
  })
})
