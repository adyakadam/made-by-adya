'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

const TAX_RATE = 0.08
const GIFT_WRAP_PRICE = 500 // cents

interface CartStore {
  items: CartItem[]
  giftWrap: boolean
  addItem: (item: CartItem) => void
  removeItem: (product_id: string, size: string, color: string) => void
  updateQty: (product_id: string, size: string, color: string, qty: number) => void
  toggleGiftWrap: () => void
  clearCart: () => void
  getCount: () => number
  getSubtotal: () => number
  getTax: () => number
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      giftWrap: false,

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

      clearCart: () => set({ items: [], giftWrap: false }),

      getCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getSubtotal: () => {
        const { items, giftWrap } = get()
        let sub = items.reduce((sum, i) => sum + i.price * i.qty, 0)
        if (giftWrap) sub += GIFT_WRAP_PRICE
        return sub
      },

      getTax: () => {
        return Math.round(get().getSubtotal() * TAX_RATE)
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax()
      },
    }),
    {
      name: 'mba-cart',
    }
  )
)
