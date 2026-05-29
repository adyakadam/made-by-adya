'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import type { ShippingAddress } from '@/lib/types'
import { showToast } from '@/components/Toast'

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }

const BLANK_ADDR: ShippingAddress = {
  first_name: '', last_name: '', email: '', street: '', city: '', state: '', zip: '', country: 'United States',
}

export default function CheckoutClient() {
  const router = useRouter()
  const { items, giftWrap, promoCode, getSubtotal, getTax, getTotal } = useCart()
  const [step, setStep] = useState(1)
  const [addr, setAddr] = useState<ShippingAddress>(BLANK_ADDR)
  const [loading, setLoading] = useState(false)

  function setField(key: keyof ShippingAddress, val: string) {
    setAddr((a) => ({ ...a, [key]: val }))
  }

  function validateShipping() {
    const { first_name, last_name, email, street, city, state, zip } = addr
    if (!first_name || !last_name || !email || !street || !city || !state || !zip) {
      showToast('Please fill in all shipping fields.')
      return false
    }
    return true
  }

  async function handleCheckout() {
    if (!validateShipping()) return
    if (items.length === 0) { showToast('Your cart is empty.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: addr, giftWrap, promoCode: promoCode || undefined }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        showToast(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      showToast('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const subtotal = getSubtotal()
  const tax = getTax()
  const total = getTotal()

  return (
    <div className="checkout-layout">
      {/* Form */}
      <div className="checkout-form-section">
        <div className="checkout-steps">
          <div className={`step${step >= 1 ? ' active' : ''}${step > 1 ? ' done' : ''}`}>
            <div className="step-num">{step > 1 ? '✓' : '1'}</div>
            <span className="step-label">Shipping</span>
          </div>
          <div className={`step${step >= 2 ? ' active' : ''}`}>
            <div className="step-num">2</div>
            <span className="step-label">Review</span>
          </div>
        </div>

        {step === 1 && (
          <>
            <p className="form-section-title">Shipping Information</p>
            <div className="form-grid">
              <div className="form-group"><label>First Name</label><input type="text" value={addr.first_name} onChange={(e) => setField('first_name', e.target.value)} placeholder="Emma" /></div>
              <div className="form-group"><label>Last Name</label><input type="text" value={addr.last_name} onChange={(e) => setField('last_name', e.target.value)} placeholder="Johnson" /></div>
              <div className="form-group form-group-inline"><label>Email Address</label><input type="email" value={addr.email} onChange={(e) => setField('email', e.target.value)} placeholder="emma@email.com" /></div>
              <div className="form-group form-group-inline"><label>Street Address</label><input type="text" value={addr.street} onChange={(e) => setField('street', e.target.value)} placeholder="123 Maple Lane" /></div>
              <div className="form-group"><label>City</label><input type="text" value={addr.city} onChange={(e) => setField('city', e.target.value)} placeholder="Brooklyn" /></div>
              <div className="form-group"><label>State</label><input type="text" value={addr.state} onChange={(e) => setField('state', e.target.value)} placeholder="NY" /></div>
              <div className="form-group"><label>ZIP Code</label><input type="text" value={addr.zip} onChange={(e) => setField('zip', e.target.value)} placeholder="11201" /></div>
              <div className="form-group">
                <label>Country</label>
                <select value={addr.country} onChange={(e) => setField('country', e.target.value)}>
                  <option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option><option>Other</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={() => { if (validateShipping()) setStep(2) }}>
              Review Order →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="form-section-title">Review Your Order</p>
            <div style={{ marginBottom: 20 }}>
              {items.map((item) => (
                <div key={`${item.product_id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--warm-sand)', fontSize: 14 }}>
                  <span>{item.name} × {item.qty} <span style={{ color: 'var(--text-light)', fontSize: 12 }}>(Size: {item.size})</span></span>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--blush)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
              <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--text-light)', fontSize: 13 }}>Selected on Stripe</span></div>
              {giftWrap && <div className="summary-row"><span>Gift Wrap</span><span>$5.00</span></div>}

              <div className="summary-row"><span>Tax (8%)</span><span>{fmt(tax)}</span></div>
              <div className="summary-row total"><span>Total Due</span><span>{fmt(total)}</span></div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline btn-outline-sm" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Redirecting to Stripe…' : 'Pay with Stripe 🔒'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 12 }}>
              You will be redirected to Stripe's secure checkout to complete payment.
            </p>
          </>
        )}
      </div>

      {/* Order Summary Panel */}
      <div className="checkout-summary-panel">
        <h3 className="summary-title">Your Items</h3>
        {items.map((item) => (
          <div key={`${item.product_id}-${item.size}`} className="mini-cart-item">
            <div className="mini-item-img" style={{ background: item.bg_color, position: 'relative', overflow: 'hidden' }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : item.emoji}
              </div>
            <div>
              <div className="mini-item-name">{item.name}</div>
              <div className="mini-item-sub">Size: {item.size} · Qty: {item.qty}</div>
            </div>
            <span className="mini-item-price">{fmt(item.price * item.qty)}</span>
          </div>
        ))}
        <div style={{ marginTop: 16, borderTop: '1px solid var(--warm-sand)', paddingTop: 14 }}>
          <div className="summary-row total"><span>Total</span><span>{fmt(total)}</span></div>
        </div>
      </div>
    </div>
  )
}
