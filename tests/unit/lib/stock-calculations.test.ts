/**
 * Tests for decrementColorStock and syncStockFromColors.
 *
 * We mock @supabase/supabase-js so the Supabase module uses our fake client.
 * The mock must expose a `.from()` method that chains: select().eq().single()
 * and also upsert() and update().eq().
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'

// ── Build a chainable Supabase mock ────────────────────────────────────────
// colorStocksFixture is mutable so tests can change the "DB" state.
let colorStocksFixture: Record<string, Record<string, number>> = {}

const mockSingle = vi.fn()
const mockSelectEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockSelectEq }))
const mockUpsert = vi.fn().mockResolvedValue({ error: null })
const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  upsert: mockUpsert,
  update: mockUpdate,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

// Import AFTER mock is set up
import { decrementColorStock, syncStockFromColors } from '@/lib/supabase'

beforeEach(() => {
  vi.clearAllMocks()

  // Default fixture: product-1 has 2 colors
  colorStocksFixture = { 'product-1': { '#ff0000': 4, '#0000ff': 2 } }

  // Wire select chain to return colorStocksFixture
  mockSingle.mockImplementation(async () => ({
    data: { value: colorStocksFixture },
  }))
  mockSelectEq.mockReturnValue({ single: mockSingle })
  mockSelect.mockReturnValue({ eq: mockSelectEq })

  // Reset upsert/update
  mockUpsert.mockResolvedValue({ error: null })
  mockUpdateEq.mockResolvedValue({ error: null })
  mockUpdate.mockReturnValue({ eq: mockUpdateEq })
  mockFrom.mockReturnValue({ select: mockSelect, upsert: mockUpsert, update: mockUpdate })
})

// ── decrementColorStock ────────────────────────────────────────────────────
describe('decrementColorStock', () => {
  test('decrements the correct color stock', async () => {
    await decrementColorStock('product-1', '#ff0000', 1)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'color_stocks',
        value: expect.objectContaining({
          'product-1': expect.objectContaining({ '#ff0000': 3, '#0000ff': 2 }),
        }),
      })
    )
  })

  test('floors stock at 0 — does not go negative', async () => {
    colorStocksFixture = { 'product-1': { '#ff0000': 1 } }
    await decrementColorStock('product-1', '#ff0000', 99)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        value: expect.objectContaining({
          'product-1': expect.objectContaining({ '#ff0000': 0 }),
        }),
      })
    )
  })

  test('calls products update with new total stock', async () => {
    // '#ff0000': 4→3, '#0000ff': 2 → total 5
    await decrementColorStock('product-1', '#ff0000', 1)
    expect(mockUpdate).toHaveBeenCalledWith({ stock: 5 })
  })

  test('no-op when productId not found in color stocks', async () => {
    await decrementColorStock('unknown-product', '#ff0000', 1)
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  test('no-op when color not found for product', async () => {
    await decrementColorStock('product-1', '#green', 1)
    expect(mockUpsert).not.toHaveBeenCalled()
  })
})

// ── syncStockFromColors ────────────────────────────────────────────────────
describe('syncStockFromColors', () => {
  test('saves color_stock and sets total stock to sum of values', async () => {
    const colorStock = { '#ff0000': 3, '#0000ff': 2 }
    await syncStockFromColors('product-1', colorStock)
    expect(mockUpsert).toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith({ stock: 5 })
  })

  test('handles empty colorStock → total 0', async () => {
    await syncStockFromColors('product-1', {})
    expect(mockUpdate).toHaveBeenCalledWith({ stock: 0 })
  })
})
