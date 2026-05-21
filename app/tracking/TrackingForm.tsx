'use client'

import { useState } from 'react'
import type { Order } from '@/lib/types'

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Placed',     sub: 'Your order has been received.' },
  { key: 'paid',      label: 'Payment Confirmed', sub: 'Payment processed successfully.' },
  { key: 'shipped',   label: 'Shipped',           sub: 'Your package is on its way.' },
  { key: 'delivered', label: 'Delivered',         sub: 'Your piece has arrived!' },
]

function stepIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status)
}

export default function TrackingForm() {
  const [input, setInput]   = useState('')
  const [order, setOrder]   = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading]   = useState(false)

  async function track() {
    const num = input.trim()
    if (!num) return
    setLoading(true); setNotFound(false); setOrder(null)
    const res = await fetch(`/api/orders/track?num=${encodeURIComponent(num)}`)
    const data = await res.json()
    setLoading(false)
    if (data.order) setOrder(data.order)
    else setNotFound(true)
  }

  const current = order ? stepIndex(order.status) : -1

  return (
    <>
      <div className="tracking-form">
        <input
          type="text"
          placeholder="e.g. #MBA-12345"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && track()}
        />
        <button className="btn-primary" onClick={track} disabled={loading}>
          {loading ? '…' : 'Track'}
        </button>
      </div>

      {notFound && (
        <p style={{ color: 'var(--text-light)', fontSize: 14 }}>
          No order found for that number. Check your confirmation email and try again.
        </p>
      )}

      {order && (
        <div className="tracking-result">
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
            Order <strong style={{ color: 'var(--accent)' }}>{order.order_number}</strong>
            {order.tracking_number && <> · Tracking: <strong>{order.tracking_number}</strong></>}
          </p>
          {STATUS_STEPS.map((step, i) => (
            <div key={step.key} className="track-step-row">
              <div className={`track-dot${i < current ? ' done' : i === current ? ' active' : ''}`} />
              <div>
                <div className="track-info-title">{step.label}</div>
                <div className="track-info-sub">{i <= current ? step.sub : 'Pending'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
