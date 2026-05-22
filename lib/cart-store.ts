'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

const TAX_RATE = 0.08
const GIFT_WRAP_PRICE = 500 // cents

interface CartStore {
  items: CartItem[]
  giftWrap: boolean
  promoCode: string
  promoDiscount: number  // percentage, e.g. 30
  promoLabel: string
  promoProductIds: string[]  // empty = all products
  addItem: (item: CartItem) => void
  removeItem: (product_id: string, size: string, color: string) => void
  updateQty: (product_id: string, size: string, color: string, qty: number) => void
  toggleGiftWrap: () => void
  applyPromo: (code: string, discount: number, label: string, productIds?: string[]) => void
  removePromo: () => void
  clearCart: () => void
  getCount: () => number
  getMerchandiseSubtotal: () => number
  getDiscount: () => number
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      giftWrap: false,
      promoCode: '',
      promoDiscount: 0,
      promoLabel: '',
      promoProductIds: [],

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === incoming.product_id && i.size === incoming.size && i.color === incoming.color
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === incoming.product_id && i.size === incoming.size && i.color === incoming.color
                  ? { ...i, qty: i.qty + incoming.qty }
                  : i
              ),
            }
          }
          return { items: [...state.items, incoming] }
        })
      },

      removeItem: (product_id, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === product_id && i.size === size && i.color === color)
          ),
        }))
      },

      updateQty: (product_id, size, color, qty) => {
        if (qty <= 0) {
          get().removeItem(product_id, size, color)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id && i.size === size && i.color === color ? { ...i, qty } : i
          ),
        }))
      },

      toggleGiftWrap: () => set((state) => ({ giftWrap: !state.giftWrap })),

      applyPromo: (code, discount, label, productIds = []) => set({ promoCode: code, promoDiscount: discount, promoLabel: label, promoProductIds: productIds }),
      removePromo: () => set({ promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [] }),

      clearCart: () => set({ items: [], giftWrap: false, promoCode: '', promoDiscount: 0, promoLabel: '', promoProductIds: [] }),

      getCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getMerchandiseSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      getDiscount: () => {
        const { items, promoDiscount, promoProductIds } = get()
        if (!promoDiscount) return 0
        const eligibleTotal = items.reduce((sum, i) => {
          if (promoProductIds.length === 0 || promoProductIds.includes(i.product_id)) {
            return sum + i.price * i.qty
          }
          return sum
        }, 0)
        return Math.round(eligibleTotal * (promoDiscount / 100))
      },

      getSubtotal: () => {
        const { getMerchandiseSubtotal, getDiscount, giftWrap } = get()
        const discounted = getMerchandiseSubtotal() - getDiscount()
        return discounted + (giftWrap ? GIFT_WRAP_PRICE : 0)
      },

      getTax: () => Math.round(get().getSubtotal() * TAX_RATE),

      getTotal: () => get().getSubtotal() + get().getTax(),
    }),
    { name: 'mba-cart' }
  )
)
