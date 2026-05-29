import { describe, test, expect, beforeEach } from 'vitest'
import { useCart } from '@/lib/cart-store'
import type { CartItem } from '@/lib/types'

const ITEM_A: CartItem = { product_id: 'p1', name: 'Lucy Top', price: 6800, qty: 1, size: 'S', color: '#ff0', image_url: null, emoji: '🧶', bg_color: '#fff' }
const ITEM_B: CartItem = { product_id: 'p2', name: 'Cardigan', price: 9800, qty: 1, size: 'M', color: '#00f', image_url: null, emoji: '🧶', bg_color: '#fff' }
const ITEM_A_DIFF_SIZE: CartItem = { ...ITEM_A, size: 'M' }
const ITEM_A_DIFF_COLOR: CartItem = { ...ITEM_A, color: '#abc' }

function get() { return useCart.getState() }
function reset() {
  useCart.setState({
    items: [], giftWrap: false,
    promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [], promoFreeShipping: false,
  })
}

beforeEach(reset)

// ── addItem ────────────────────────────────────────────────────────────────
describe('addItem', () => {
  test('adds new item to empty cart', () => {
    get().addItem(ITEM_A)
    expect(useCart.getState().items).toHaveLength(1)
    expect(useCart.getState().items[0].product_id).toBe('p1')
  })

  test('increments qty when same product_id + size + color', () => {
    get().addItem(ITEM_A)
    get().addItem({ ...ITEM_A, qty: 2 })
    const items = useCart.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].qty).toBe(3)
  })

  test('adds separate entry for different size', () => {
    get().addItem(ITEM_A)
    get().addItem(ITEM_A_DIFF_SIZE)
    expect(useCart.getState().items).toHaveLength(2)
  })

  test('adds separate entry for different color', () => {
    get().addItem(ITEM_A)
    get().addItem(ITEM_A_DIFF_COLOR)
    expect(useCart.getState().items).toHaveLength(2)
  })

  test('adds two different products independently', () => {
    get().addItem(ITEM_A)
    get().addItem(ITEM_B)
    expect(useCart.getState().items).toHaveLength(2)
  })
})

// ── removeItem ─────────────────────────────────────────────────────────────
describe('removeItem', () => {
  test('removes matching item', () => {
    get().addItem(ITEM_A)
    get().removeItem('p1', 'S', '#ff0')
    expect(useCart.getState().items).toHaveLength(0)
  })

  test('leaves other items untouched', () => {
    get().addItem(ITEM_A)
    get().addItem(ITEM_B)
    get().removeItem('p1', 'S', '#ff0')
    const items = useCart.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].product_id).toBe('p2')
  })

  test('does nothing when item not in cart', () => {
    get().addItem(ITEM_A)
    get().removeItem('p99', 'S', '#ff0')
    expect(useCart.getState().items).toHaveLength(1)
  })
})

// ── updateQty ──────────────────────────────────────────────────────────────
describe('updateQty', () => {
  test('updates qty of matching item', () => {
    get().addItem(ITEM_A)
    get().updateQty('p1', 'S', '#ff0', 5)
    expect(useCart.getState().items[0].qty).toBe(5)
  })

  test('removes item when qty set to 0', () => {
    get().addItem(ITEM_A)
    get().updateQty('p1', 'S', '#ff0', 0)
    expect(useCart.getState().items).toHaveLength(0)
  })

  test('removes item when qty set to negative', () => {
    get().addItem(ITEM_A)
    get().updateQty('p1', 'S', '#ff0', -1)
    expect(useCart.getState().items).toHaveLength(0)
  })
})

// ── toggleGiftWrap ─────────────────────────────────────────────────────────
describe('toggleGiftWrap', () => {
  test('toggles from false to true', () => {
    get().toggleGiftWrap()
    expect(useCart.getState().giftWrap).toBe(true)
  })

  test('toggles back to false', () => {
    get().toggleGiftWrap()
    get().toggleGiftWrap()
    expect(useCart.getState().giftWrap).toBe(false)
  })
})

// ── applyPromo / removePromo ───────────────────────────────────────────────
describe('applyPromo', () => {
  test('sets all promo fields', () => {
    get().applyPromo('FAMILY30', 30, 'Friends & Family', ['p1'], false)
    const s = useCart.getState()
    expect(s.promoCode).toBe('FAMILY30')
    expect(s.promoDiscount).toBe(30)
    expect(s.promoLabel).toBe('Friends & Family')
    expect(s.promoProductIds).toEqual(['p1'])
    expect(s.promoFreeShipping).toBe(false)
  })

  test('sets freeShipping to true', () => {
    get().applyPromo('FREESHIP', 0, 'Free Shipping', [], true)
    expect(useCart.getState().promoFreeShipping).toBe(true)
    expect(useCart.getState().promoDiscount).toBe(0)
  })
})

describe('removePromo', () => {
  test('resets all promo state', () => {
    get().applyPromo('FAMILY30', 30, 'Friends & Family', ['p1'], true)
    get().removePromo()
    const s = useCart.getState()
    expect(s.promoCode).toBe('')
    expect(s.promoDiscount).toBe(0)
    expect(s.promoLabel).toBe('')
    expect(s.promoProductIds).toEqual([])
    expect(s.promoFreeShipping).toBe(false)
  })
})

// ── clearCart ──────────────────────────────────────────────────────────────
describe('clearCart', () => {
  test('empties items and resets all state', () => {
    get().addItem(ITEM_A)
    get().toggleGiftWrap()
    get().applyPromo('FAMILY30', 30, 'label', [], false)
    get().clearCart()
    const s = useCart.getState()
    expect(s.items).toHaveLength(0)
    expect(s.giftWrap).toBe(false)
    expect(s.promoCode).toBe('')
    expect(s.promoFreeShipping).toBe(false)
  })
})

// ── getCount ───────────────────────────────────────────────────────────────
describe('getCount', () => {
  test('returns sum of all item quantities', () => {
    get().addItem(ITEM_A)
    get().addItem({ ...ITEM_B, qty: 3 })
    expect(get().getCount()).toBe(4)
  })

  test('returns 0 for empty cart', () => {
    expect(get().getCount()).toBe(0)
  })
})

// ── getMerchandiseSubtotal ─────────────────────────────────────────────────
describe('getMerchandiseSubtotal', () => {
  test('returns sum of price × qty for all items', () => {
    get().addItem(ITEM_A)           // 6800 × 1 = 6800
    get().addItem({ ...ITEM_B, qty: 2 }) // 9800 × 2 = 19600
    expect(get().getMerchandiseSubtotal()).toBe(26400)
  })

  test('returns 0 for empty cart', () => {
    expect(get().getMerchandiseSubtotal()).toBe(0)
  })
})

// ── getDiscount ────────────────────────────────────────────────────────────
describe('getDiscount — global promo (empty productIds)', () => {
  test('returns 30% of full merchandise total', () => {
    get().addItem(ITEM_A) // 6800
    get().applyPromo('FAMILY30', 30, 'label', [], false)
    expect(get().getDiscount()).toBe(Math.round(6800 * 0.3)) // 2040
  })

  test('returns 0 when no promo active', () => {
    get().addItem(ITEM_A)
    expect(get().getDiscount()).toBe(0)
  })

  test('returns 0 when discount is 0% (free shipping only)', () => {
    get().addItem(ITEM_A)
    get().applyPromo('FREESHIP', 0, 'Free Shipping', [], true)
    expect(get().getDiscount()).toBe(0)
  })
})

describe('getDiscount — product-scoped promo', () => {
  test('only applies discount to matching products', () => {
    get().addItem(ITEM_A) // p1: 6800
    get().addItem(ITEM_B) // p2: 9800
    get().applyPromo('P1ONLY', 10, 'label', ['p1'], false)
    // Only 6800 is eligible → 10% of 6800 = 680
    expect(get().getDiscount()).toBe(680)
  })

  test('returns 0 when no items match promoProductIds', () => {
    get().addItem(ITEM_A) // p1
    get().applyPromo('P99ONLY', 20, 'label', ['p99'], false)
    expect(get().getDiscount()).toBe(0)
  })
})

// ── getSubtotal ────────────────────────────────────────────────────────────
describe('getSubtotal', () => {
  test('equals merchandise total when no discount, no gift wrap', () => {
    get().addItem(ITEM_A) // 6800
    expect(get().getSubtotal()).toBe(6800)
  })

  test('subtracts discount', () => {
    get().addItem(ITEM_A) // 6800
    get().applyPromo('FAMILY30', 30, 'label', [], false)
    // 6800 - 2040 = 4760
    expect(get().getSubtotal()).toBe(4760)
  })

  test('adds $5 gift wrap', () => {
    get().addItem(ITEM_A) // 6800
    get().toggleGiftWrap()
    expect(get().getSubtotal()).toBe(7300) // 6800 + 500
  })

  test('applies both discount and gift wrap', () => {
    get().addItem(ITEM_A) // 6800
    get().applyPromo('FAMILY30', 30, 'label', [], false)
    get().toggleGiftWrap()
    // (6800 - 2040) + 500 = 5260
    expect(get().getSubtotal()).toBe(5260)
  })
})

// ── getTax ─────────────────────────────────────────────────────────────────
describe('getTax', () => {
  test('is 8% of subtotal, rounded', () => {
    get().addItem(ITEM_A) // subtotal = 6800
    expect(get().getTax()).toBe(Math.round(6800 * 0.08)) // 544
  })

  test('is 0 for empty cart', () => {
    expect(get().getTax()).toBe(0)
  })
})

// ── getTotal ───────────────────────────────────────────────────────────────
describe('getTotal', () => {
  test('equals subtotal + tax', () => {
    get().addItem(ITEM_A)
    expect(get().getTotal()).toBe(get().getSubtotal() + get().getTax())
  })

  test('full end-to-end: 2 items, 30% promo, gift wrap', () => {
    get().addItem(ITEM_A)           // 6800
    get().addItem({ ...ITEM_B, qty: 2 }) // 9800 × 2 = 19600
    get().applyPromo('FAMILY30', 30, 'label', [], false)
    get().toggleGiftWrap()
    // merch = 26400, discount = 7920, after = 18480, + gift 500 = 18980
    const subtotal = 18980
    const tax = Math.round(subtotal * 0.08) // 1518
    expect(get().getTotal()).toBe(subtotal + tax) // 20498
  })
})
