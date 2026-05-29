'use client'

import { useEffect, useState } from 'react'

interface OrderItem { product_id: string; name: string }

export default function ReviewForm({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'used' | 'submitted'>('loading')
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/review?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error === 'This review link has already been used') {
          setStatus('used')
        } else if (data.error) {
          setStatus('invalid')
        } else {
          setOrderNumber(data.order_number)
          setCustomerName(data.customer_name)
          setName(data.customer_name || '')
          const orderItems: OrderItem[] = data.items ?? []
          setItems(orderItems)
          // Auto-select if only one item
          if (orderItems.length === 1) setSelectedProduct(orderItems[0])
          setStatus('ready')
        }
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!body.trim()) { setError('Please write a short review.'); return }
    if (items.length > 1 && !selectedProduct) { setError('Please select which item you are reviewing.'); return }
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        reviewer_name: name || customerName,
        rating,
        body,
        product_id: selectedProduct?.product_id ?? null,
        product_name: selectedProduct?.name ?? null,
      }),
    })
    const data = await res.json()
    if (data.ok) {
      setStatus('submitted')
    } else {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const accent = '#c4907a'
  const blush = '#fdf0ec'
  const textDark = '#3a2e28'
  const textMid = '#6b5a52'

  const cardStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdf0ec 0%, #f5eef8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  }

  const boxStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 8px 40px rgba(196,144,122,.15)',
    padding: '48px 40px',
    maxWidth: 520,
    width: '100%',
    textAlign: 'center',
  }

  if (status === 'loading') {
    return (
      <div style={cardStyle}>
        <div style={boxStyle}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🧶</div>
          <p style={{ color: textMid, fontSize: 15 }}>Loading your review page…</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div style={cardStyle}>
        <div style={boxStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h2 style={{ fontFamily: 'Georgia, serif', color: textDark, fontSize: 26, marginBottom: 12 }}>
            Invalid Link
          </h2>
          <p style={{ color: textMid, fontSize: 15, lineHeight: 1.7 }}>
            This review link is invalid or has expired. If you believe this is a mistake, please reach out at{' '}
            <a href="mailto:hello@madebyadya.com" style={{ color: accent }}>hello@madebyadya.com</a>.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'used') {
    return (
      <div style={cardStyle}>
        <div style={boxStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Georgia, serif', color: textDark, fontSize: 26, marginBottom: 12 }}>
            Already Reviewed
          </h2>
          <p style={{ color: textMid, fontSize: 15, lineHeight: 1.7 }}>
            You&apos;ve already submitted a review using this link. Thank you so much — it means the world! 💕
          </p>
        </div>
      </div>
    )
  }

  if (status === 'submitted') {
    return (
      <div style={cardStyle}>
        <div style={boxStyle}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌸</div>
          <h2 style={{ fontFamily: 'Georgia, serif', color: textDark, fontSize: 28, marginBottom: 12, fontWeight: 400 }}>
            Thank you, {name || customerName}!
          </h2>
          <p style={{ color: textMid, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Your review has been submitted and means so much to a small handmade business.
            I read every single one 💕
          </p>
          <p style={{ color: textMid, fontSize: 13 }}>
            Don&apos;t forget to tag{' '}
            <a href="https://www.instagram.com/madebyadya" target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
              @madebyadya
            </a>{' '}
            on Instagram!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={boxStyle}>
        {/* Header */}
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎀</div>
        <h1 style={{ fontFamily: 'Georgia, serif', color: textDark, fontSize: 28, fontWeight: 400, margin: '0 0 8px' }}>
          Leave a Review
        </h1>
        <p style={{ color: textMid, fontSize: 14, marginBottom: 4 }}>made by adya</p>
        {orderNumber && (
          <p style={{ fontSize: 12, color: '#b0a09a', marginBottom: 24 }}>Order {orderNumber}</p>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>

          {/* Product selector — only shown if multiple items */}
          {items.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: textMid, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Which item are you reviewing?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item) => (
                  <button
                    key={item.product_id}
                    type="button"
                    onClick={() => setSelectedProduct(item)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: `2px solid ${selectedProduct?.product_id === item.product_id ? accent : '#e8ddd9'}`,
                      background: selectedProduct?.product_id === item.product_id ? blush : '#fff',
                      color: textDark,
                      fontSize: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    {item.name}
                    {selectedProduct?.product_id === item.product_id && (
                      <span style={{ float: 'right', color: accent }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single item — show which product */}
          {items.length === 1 && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: blush, borderRadius: 10, border: `1px solid ${accent}30` }}>
              <p style={{ margin: 0, fontSize: 13, color: textMid }}>
                Reviewing: <strong style={{ color: textDark }}>{items[0].name}</strong>
              </p>
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: textMid, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we display your name?"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                border: '1.5px solid #e8ddd9', borderRadius: 10, fontSize: 14,
                color: textDark, outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Star Rating */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: textMid, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Rating
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: 36, lineHeight: 1,
                    filter: star <= (hovered || rating) ? 'none' : 'grayscale(1) opacity(0.3)',
                    transform: star <= (hovered || rating) ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform .15s, filter .15s',
                  }}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ fontSize: 12, color: accent, marginTop: 6 }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing! 🌸'][rating]}
              </p>
            )}
          </div>

          {/* Review body */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: textMid, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Your Review
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us about your experience — the quality, fit, how it made you feel… ✨"
              rows={4}
              maxLength={600}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                border: '1.5px solid #e8ddd9', borderRadius: 10, fontSize: 14,
                color: textDark, outline: 'none', fontFamily: 'inherit',
                resize: 'vertical', lineHeight: 1.6,
              }}
            />
            <p style={{ fontSize: 11, color: '#b0a09a', textAlign: 'right', margin: '4px 0 0' }}>
              {body.length}/600
            </p>
          </div>

          {error && (
            <p style={{ color: '#e05c5c', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '14px', background: submitting ? '#d4a898' : accent,
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.04em', transition: 'background .2s',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Review 🌸'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#b0a09a', marginTop: 20, lineHeight: 1.6 }}>
          This link is unique to your order and can only be used once.
        </p>
      </div>
    </div>
  )
}
