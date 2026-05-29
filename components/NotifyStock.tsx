'use client'

import { useState } from 'react'

export default function NotifyStock({ productId, productName }: { productId: string; productName: string }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/notify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product_id: productId, product_name: productName }),
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <p style={{ fontSize: 13, color: '#27ae60', marginBottom: 16, padding: '10px 14px', background: '#eafaf1', borderRadius: 10, border: '1.5px solid #27ae60' }}>
      ✓ We'll email you when this is back in stock!
    </p>
  )

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 8 }}>Get notified when this is back in stock:</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, fontSize: 13, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--warm-sand)', fontFamily: 'DM Sans, sans-serif', background: 'var(--cream)' }}
          required
        />
        <button type="submit" disabled={loading} className="btn-outline btn-outline-sm" style={{ whiteSpace: 'nowrap' }}>
          {loading ? '…' : 'Notify me'}
        </button>
      </div>
    </form>
  )
}
