'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-store'
import { SEED_PRODUCTS } from '@/lib/seed-data'
import ProductCard from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import { useState } from 'react'
import type { Product } from '@/lib/types'

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }

export default function CartClient() {
  const { items, giftWrap, removeItem, updateQty, toggleGiftWrap, getSubtotal, getTax, getTotal } = useCart()
  const [modal, setModal] = useState<Product | null>(null)

  const subtotalBase = items.reduce((s, i) => s + i.price * i.qty, 0)
  const tax = getTax()
  const total = getTotal()

  const related = SEED_PRODUCTS.filter((p) => !items.find((i) => i.product_id === p.id)).slice(0, 4)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Your Cart</h1>
          <p>{items.length === 0 ? 'Your cart is empty' : `${items.reduce((s, i) => s + i.qty, 0)} item(s)`}</p>
        </div>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items-section">
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🧺</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <Link href="/shop" className="btn-primary">Browse the Collection</Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product_id}-${item.size}-${item.color}`} className="cart-item">
                <div className="cart-item-img" style={{ background: item.bg_color, position: 'relative', overflow: 'hidden' }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : item.emoji}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-sub">Size: {item.size} · Colour: <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', background:item.color, verticalAlign:'middle', marginLeft:2 }} /></div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, item.size, item.color, item.qty - 1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.product_id, item.size, item.color, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-price">{fmt(item.price * item.qty)}</div>
                <button className="remove-item" onClick={() => removeItem(item.product_id, item.size, item.color)}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotalBase)}</span></div>
          <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Calculated at checkout</span></div>
          <div className="summary-row"><span>Tax (8%)</span><span>{fmt(tax)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{fmt(total)}</span></div>

          <label className="gift-wrap-row">
            <input type="checkbox" checked={giftWrap} onChange={toggleGiftWrap} />
            <span className="gift-wrap-label">🎁 Add gift wrapping</span>
            <span className="gift-wrap-price">+$5</span>
          </label>

          <Link href="/checkout" className="btn-primary" style={{ width: '100%', marginTop: 8, display: 'block', textAlign: 'center' }}>
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="btn-outline" style={{ width: '100%', marginTop: 10, marginLeft: 0, display: 'block', textAlign: 'center' }}>
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="related-section">
          <h3>You might also love</h3>
          <div className="related-grid">
            {related.map((p) => (
              <div key={p.id} className="related-card" onClick={() => setModal(p)}>
                <div className="related-img" style={{ background: p.bg_color, position: 'relative', overflow: 'hidden' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : p.emoji}
                </div>
                <div className="related-info">
                  <div className="related-name">{p.name}</div>
                  <div className="related-price">${(p.price / 100).toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && <QuickViewModal product={modal} onClose={() => setModal(null)} />}
    </>
  )
}
