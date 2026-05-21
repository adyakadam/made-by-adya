'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart-store'

export default function ClearCart() {
  const clearCart = useCart((s) => s.clearCart)
  useEffect(() => { clearCart() }, [clearCart])
  return null
}
