'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-store'
import QuickViewModal from '@/components/QuickViewModal'
import { useState } from 'react'
import type { Product } from '@/lib/types'

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }

export default function CartClient({ products }: { products: Product[] }) {
  const { items, giftWrap, removeItem, updateQty, toggleGiftWrap, getTax, getTotal,
    getMerchandiseSubtotal, getDiscount, promoCode, promoDiscount, promoLabel, promoFreeShipping, applyPromo, removePromo } = useCart()
  const [modal, setModal] = useState<Product | null>(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [checkingPromo, setCheckingPromo] = useState(false)

  const merchandiseSubtotal = getMerchandiseSubtotal()
  const discount = getDiscount()
  const tax = getTax()
  const total = getTotal()

  async function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setCheckingPromo(true)
    setPromoError('')
    try {
      const res = await fetch(`/api/validate-promo?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.valid) {
        applyPromo(code, data.discount, data.label, data.product_ids ?? [], data.free_shipping ?? false)
        setPromoInput('')
      } else {
        setPromoError('Invalid or inactive code.')
      }
    } catch {
      setPromoError('Could not check code. Try again.')
    } finally {
      setCheckingPromo(false)
    }
  }

  const related = products.filter((p) => p.active && !items.find((i) => i.product_id === p.id)).slice(0, 4)

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
                  <div className="cart-item-sub">Size: {item.size} · Color: <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', background:item.color, verticalAlign:'middle', marginLeft:2 }} /></div>
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
          <div className="summary-row"><span>Subtotal</span><span>{fmt(merchandiseSubtotal)}</span></div>
          {discount > 0 && (
            <div className="summary-row" style={{ color: '#27ae60' }}>
              <span>{promoLabel} ({promoDiscount}% off)</span>
              <span>−{fmt(discount)}</span>
            </div>
          )}
          {promoFreeShipping && (
            <div className="summary-row" style={{ color: '#27ae60' }}>
              <span>🚚 Free Shipping ({promoCode})</span>
              <span>−$5.99</span>
            </div>
          )}
          {!promoFreeShipping ? (
            <details style={{ marginBottom: 4 }}>
              <summary style={{ fontSize: 13, color: 'var(--text-mid)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--text-light)', fontSize: 13 }}>from $5.99 ▾</span>
              </summary>
              <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--cream)', borderRadius: 10, fontSize: 12, color: 'var(--text-mid)', lineHeight: 2 }}>
                <div>📦 First Class — $5.99 · 3–7 days</div>
                <div>📦 Priority Mail — $9.99 · 1–3 days</div>
                <div>📦 Priority Express — $29.99 · overnight</div>
                <div style={{ color: 'var(--text-light)', marginTop: 4, fontSize: 11 }}>Exact rate calculated at checkout based on your location.</div>
              </div>
            </details>
          ) : (
            <div className="summary-row" style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 4 }}>
              <span>Shipping</span>
              <span style={{ color: '#27ae60', fontWeight: 500 }}>Free</span>
            </div>
          )}
          <div className="summary-row"><span>Tax (8%)</span><span>{fmt(tax)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{fmt(total)}</span></div>

          {/* Promo code */}
          {promoCode ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eafaf1', border: '1.5px solid #27ae60', borderRadius: 10, padding: '8px 14px', marginBottom: 12, fontSize: 13 }}>
              <span style={{ color: '#27ae60', fontWeight: 500 }}>✓ {promoCode} applied{promoFreeShipping ? ' · Free shipping!' : ''}{promoDiscount > 0 ? ` · ${promoDiscount}% off` : ''}</span>
              <button onClick={removePromo} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 13 }}>Remove</button>
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--warm-sand)', fontFamily: 'DM Sans, sans-serif' }}
                />
                <button onClick={handleApplyPromo} disabled={checkingPromo || !promoInput.trim()} className="btn-outline btn-outline-sm" style={{ whiteSpace: 'nowrap' }}>
                  {checkingPromo ? '…' : 'Apply'}
                </button>
              </div>
              {promoError && <p style={{ color: '#c0392b', fontSize: 12, marginTop: 4 }}>{promoError}</p>}
            </div>
          )}

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
