'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, Product, InstagramTile, Review, CustomOrderRequest } from '@/lib/types'
import { type SiteContent, DEFAULT_CONTENT } from '@/lib/content'
import type { PromoCode, CustomOrderExtra, NewsletterSubscriber } from '@/lib/supabase'
import { downloadCSV } from '@/lib/csv'

type ContentSection = 'general' | 'home' | 'about' | 'faq' | 'custom' | 'footer'

function swatchBg(color: string) {
  if (color.includes('|')) {
    const [a, b] = color.split('|')
    return `linear-gradient(135deg, ${a} 50%, ${b} 50%)`
  }
  return color
}

function SplitSwatch({ a, b, size = 18 }: { a: string; b: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, position: 'relative', border: '1px solid rgba(0,0,0,.1)' }}>
      <div style={{ position: 'absolute', inset: 0, background: a, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: b, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
    </div>
  )
}

function ColorPicker({ colors, onChange }: { colors: string[]; onChange: (c: string[]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [manualHex, setManualHex] = useState('')

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgSrc(URL.createObjectURL(file))
  }

  useEffect(() => {
    if (!imgSrc || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; ctx.drawImage(img, 0, 0) }
    img.src = imgSrc
  }, [imgSrc])

  function pickColor(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
    if (!colors.includes(hex)) onChange([...colors, hex])
  }

  function previewColor(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    setHovered(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`)
  }

  function addManual() {
    const h = manualHex.startsWith('#') ? manualHex : `#${manualHex}`
    if (/^#[0-9a-fA-F]{6}$/.test(h) && !colors.includes(h)) { onChange([...colors, h]); setManualHex('') }
  }

  return (
    <div>
      {/* Current swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {colors.map((c) => (
          <div key={c} title={c} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--cream)', borderRadius: 20, padding: '3px 10px 3px 6px', border: '1.5px solid var(--warm-sand)' }}>
            {c.includes('|') ? (() => { const [a,b]=c.split('|'); return <SplitSwatch a={a} b={b} /> })() : <div style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />}
            <span style={{ fontSize: 11, color: 'var(--text-mid)' }}>{c}</span>
            <button onClick={() => onChange(colors.filter((x) => x !== c))} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 13, lineHeight: 1, marginLeft: 2, padding: 0 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Upload image to pick from */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>
          Upload a photo to pick yarn/fabric colors from it:
        </label>
        <input type="file" accept="image/*" onChange={loadFile} style={{ fontSize: 13 }} />
      </div>

      {imgSrc && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 6 }}>
            Click anywhere on the image to add that color →{' '}
            {hovered && <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><span style={{ width:12, height:12, borderRadius:'50%', background:hovered, display:'inline-block', border:'1px solid #ccc' }} />{hovered}</span>}
          </p>
          <canvas
            ref={canvasRef}
            onClick={pickColor}
            onMouseMove={previewColor}
            style={{ cursor: 'crosshair', maxWidth: '100%', maxHeight: 240, borderRadius: 10, display: 'block', border: '1.5px solid var(--warm-sand)' }}
          />
        </div>
      )}

      {/* Manual hex fallback */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text" placeholder="#c4907a" value={manualHex}
          onChange={(e) => setManualHex(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManual()}
          style={{ width: 110, fontSize: 13 }}
        />
        {manualHex && <div style={{ width: 20, height: 20, borderRadius: '50%', background: manualHex.startsWith('#') ? manualHex : `#${manualHex}`, border: '1px solid #ccc' }} />}
        <button type="button" className="btn-outline btn-outline-sm" onClick={addManual}>Add color</button>
      </div>

    </div>
  )
}

interface MediaValue { url: string; isVideo: boolean }

function AboutMediaUpload({ value, onChange }: { value: MediaValue; onChange: (m: MediaValue) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      onChange({ url: data.url, isVideo: file.type.startsWith('video/') })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>Upload photo or video</label>
      <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleFile} disabled={uploading} style={{ fontSize: 13 }} />
      {uploading && <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>Uploading…</p>}
      {error && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 6 }}>{error}</p>}
      <div style={{ marginTop: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--text-mid)', display: 'block', marginBottom: 4 }}>Or paste a URL</label>
        <input type="url" placeholder="https://..." value={value.url} onChange={(e) => { const url = e.target.value; onChange({ url, isVideo: /\.(mp4|webm|mov|m4v)/i.test(url) }) }} style={{ width: '100%', fontSize: 13 }} />
      </div>
    </div>
  )
}

const CUSTOM_ORDER_STATUSES: { value: CustomOrderRequest['status']; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: '#e8b86d' },
  { value: 'quoted', label: 'Quoted', color: '#9b59b6' },
  { value: 'accepted', label: 'Accepted', color: '#c4907a' },
  { value: 'paid', label: 'Paid', color: '#16a34a' },
  { value: 'in_progress', label: 'In Progress', color: '#5b8dee' },
  { value: 'shipped', label: 'Shipped', color: '#2980b9' },
  { value: 'delivered', label: 'Delivered', color: '#27ae60' },
  { value: 'cancelled', label: 'Cancelled', color: '#e74c3c' },
]

function CustomOrderCard({
  order, extra, saving, onSave,
}: {
  order: CustomOrderRequest
  extra: CustomOrderExtra
  saving: boolean
  onSave: (status: string, notes: string, quote: string, estimatedTime: string, trackingNumber: string) => void
}) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(extra.admin_notes)
  const [quote, setQuote] = useState(extra.quote_amount)
  const [estimatedTime, setEstimatedTime] = useState(extra.estimated_time ?? '')
  const [trackingNumber, setTrackingNumber] = useState(extra.tracking_number ?? '')
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>(extra.payment_type ?? 'full')
  const [paymentLink, setPaymentLink] = useState(extra.payment_link ?? '')
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSendPaymentLink() {
    if (!quote) { window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Enter a quote amount first.' })); return }
    setSendingPaymentLink(true)
    try {
      const res = await fetch('/api/admin/custom-orders/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, quote_amount: quote.replace(/[^0-9.]/g, ''), payment_type: paymentType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setPaymentLink(data.url)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '💳 Payment link sent to customer!' }))
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Error: ${e instanceof Error ? e.message : 'Something went wrong'}` }))
    } finally {
      setSendingPaymentLink(false)
    }
  }

  async function handleResendEmail() {
    if (!paymentLink || !quote) return
    setSendingPaymentLink(true)
    try {
      const res = await fetch('/api/admin/custom-orders/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, quote_amount: quote.replace(/[^0-9.]/g, ''), payment_type: paymentType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setPaymentLink(data.url)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '💌 Payment email resent!' }))
    } catch (e) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Error: ${e instanceof Error ? e.message : 'Something went wrong'}` }))
    } finally {
      setSendingPaymentLink(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(paymentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const statusInfo = CUSTOM_ORDER_STATUSES.find((s) => s.value === status)

  return (
    <div style={{ background: 'var(--blush)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{order.name}</div>
          <a href={`mailto:${order.email}`} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>{order.email}</a>
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString()}</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: statusInfo?.color ?? '#ccc', color: 'white' }}>
          {statusInfo?.label ?? status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: 13, marginBottom: 14, color: 'var(--text-mid)' }}>
        <div><strong>Piece:</strong> {order.piece_type}</div>
        <div><strong>Budget:</strong> {order.budget}</div>
        <div><strong>Color Preference:</strong> {order.color_pref}</div>
        <div style={{ gridColumn: '1/-1' }}><strong>Vision:</strong> {order.vision}</div>
        {order.measurements && <div style={{ gridColumn: '1/-1' }}><strong>Measurements:</strong> {order.measurements}</div>}
        {extra.reference_images && extra.reference_images.length > 0 && (
          <div style={{ gridColumn: '1/-1', marginTop: 8 }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Reference Photos:</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {extra.reference_images.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Reference ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--warm-sand)', display: 'block' }} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as CustomOrderRequest['status'])}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--warm-sand)', background: 'white' }}>
            {CUSTOM_ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12 }}>Quote Amount</label>
          <input type="text" placeholder="e.g. $85" value={quote} onChange={(e) => setQuote(e.target.value)}
            style={{ width: 100, fontSize: 13 }} />
        </div>
        {/* Estimated time — shown when accepting */}
        {(status === 'accepted' || estimatedTime) && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Estimated Time</label>
            <input type="text" placeholder="e.g. 2–3 weeks" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)}
              style={{ width: 130, fontSize: 13 }} />
          </div>
        )}
        {/* Tracking number — shown when shipping */}
        {(status === 'shipped' || status === 'delivered' || trackingNumber) && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 12 }}>Tracking Number</label>
            <input type="text" placeholder="USPS tracking #" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ width: 160, fontSize: 13 }} />
          </div>
        )}
        <div className="form-group form-group-inline" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12 }}>Admin Notes</label>
          <textarea rows={2} placeholder="Internal notes…" value={notes} onChange={(e) => setNotes(e.target.value)}
            style={{ fontSize: 13, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button className="btn-primary" disabled={saving} onClick={() => onSave(status, notes, quote, estimatedTime, trackingNumber)}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <a href={`mailto:${order.email}?subject=Your%20custom%20order%20request`} className="btn-outline btn-outline-sm">
            Email
          </a>
        </div>
      </div>

      {/* Email reminder chips */}
      <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {status === 'accepted' && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#c4907a22', color: '#c4907a' }}>💌 Acceptance email will send on Save</span>}
        {status === 'in_progress' && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#5b8dee22', color: '#5b8dee' }}>💌 In-progress email will send on Save</span>}
        {status === 'shipped' && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#2980b922', color: '#2980b9' }}>💌 Shipping email will send on Save</span>}
        {status === 'delivered' && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#27ae6022', color: '#27ae60' }}>💌 Delivery + review email will send on Save</span>}
      </div>

      {/* Payment link section — shown when accepted or quoted */}
      {(status === 'accepted' || status === 'quoted') && (
        <div style={{ marginTop: 16, padding: '16px 18px', background: 'white', borderRadius: 12, border: '1.5px solid var(--warm-sand)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-mid)' }}>💳 Send Payment Link</div>

          {/* Full / Deposit toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['full', 'deposit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPaymentType(t)}
                style={{
                  padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1.5px solid var(--accent)',
                  background: paymentType === t ? 'var(--accent)' : 'transparent',
                  color: paymentType === t ? 'white' : 'var(--accent)',
                  fontWeight: paymentType === t ? 600 : 400,
                }}
              >
                {t === 'full' ? 'Full Amount' : '50% Deposit'}
              </button>
            ))}
            {quote && (
              <span style={{ fontSize: 12, color: 'var(--text-light)', alignSelf: 'center', marginLeft: 4 }}>
                = ${paymentType === 'deposit'
                  ? (parseFloat(quote.replace(/[^0-9.]/g, '')) / 2).toFixed(2)
                  : parseFloat(quote.replace(/[^0-9.]/g, '')).toFixed(2)}
              </span>
            )}
          </div>

          {/* Generate button or existing link */}
          {!paymentLink ? (
            <button
              className="btn-primary"
              disabled={sendingPaymentLink || !quote}
              onClick={handleSendPaymentLink}
              style={{ fontSize: 13 }}
            >
              {sendingPaymentLink ? 'Generating…' : 'Generate & Email Payment Link'}
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <input
                  type="text"
                  readOnly
                  value={paymentLink}
                  style={{ flex: 1, fontSize: 11, color: 'var(--text-mid)', background: 'var(--cream)', borderRadius: 8, padding: '6px 10px', border: '1.5px solid var(--warm-sand)' }}
                />
                <button className="btn-outline btn-outline-sm" onClick={copyLink} style={{ flexShrink: 0 }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button
                className="btn-outline btn-outline-sm"
                disabled={sendingPaymentLink}
                onClick={handleResendEmail}
                style={{ fontSize: 12 }}
              >
                {sendingPaymentLink ? 'Sending…' : '💌 Resend Email'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type Tab = 'orders' | 'products' | 'new-product' | 'home-grid' | 'reviews' | 'content' | 'promos' | 'custom-orders' | 'newsletter' | 'stock-alerts' | 'analytics'

const BLANK_REVIEW: Partial<Review> = {
  reviewer_name: '', avatar_letter: '', rating: 5, body: '', product_name: '',
}

const BLANK_TILE: InstagramTile = { image_url: '', link_url: '' }

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }

const BLANK_PRODUCT: Partial<Product> = {
  name: '', description: '', price: 0, images: [], emoji: '🧶', bg_color: '#f2d9d0',
  category: 'crochet', badge: 'Crochet', is_new: false, is_bestseller: false,
  stock: 1, rating: 5, review_count: 0, sizes: ['XS','S','M','L'], colors: ['#f2d9d0'], active: true,
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Partial<Product>>(BLANK_PRODUCT)
  const [tiles, setTiles] = useState<InstagramTile[]>(Array(6).fill(null).map(() => ({ ...BLANK_TILE })))
  const [heroImage, setHeroImage] = useState('')
  const [aboutMedia, setAboutMedia] = useState<{ url: string; isVideo: boolean }>({ url: '', isVideo: false })
  const [customPhotos, setCustomPhotos] = useState<{ url: string; caption: string }[]>([{ url: '', caption: '' }, { url: '', caption: '' }, { url: '', caption: '' }])
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingReview, setEditingReview] = useState<Partial<Review>>(BLANK_REVIEW)
  const [savingReview, setSavingReview] = useState(false)
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT)
  const [contentSection, setContentSection] = useState<ContentSection>('general')
  const [savingContent, setSavingContent] = useState(false)
  const [promos, setPromos] = useState<PromoCode[]>([{ code: 'FAMILY30', discount: 30, label: 'Friends & Family', active: true, product_ids: [], use_count: 0 }])
  const [savingPromos, setSavingPromos] = useState(false)
  const [newPromo, setNewPromo] = useState<PromoCode>({ code: '', discount: 10, label: '', active: true, product_ids: [], use_count: 0 })
  const [expandedPromo, setExpandedPromo] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingGrid, setSavingGrid] = useState(false)
  const [multiA, setMultiA] = useState('#f2d9d0')
  const [multiB, setMultiB] = useState('#c8d8c0')
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([])
  const [customOrderExtras, setCustomOrderExtras] = useState<Record<string, CustomOrderExtra>>({})
  const [savingCustomOrder, setSavingCustomOrder] = useState<string | null>(null)
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterSubscriber[]>([])
  const [stockAlerts, setStockAlerts] = useState<import('@/lib/supabase').StockNotification[]>([])
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)
  const [notifyingAlert, setNotifyingAlert] = useState<string | null>(null)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderTrackingInputs, setOrderTrackingInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/orders').then((r) => r.json()).then(setOrders).catch(() => null)
    fetch('/api/admin/custom-orders').then((r) => r.json()).then((d) => { if (d.orders) { setCustomOrders(d.orders); setCustomOrderExtras(d.extras ?? {}) } }).catch(() => null)
    fetch('/api/admin/newsletter').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setNewsletterSubs(d) }).catch(() => null)
    fetch('/api/admin/stock-alerts').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setStockAlerts(d) }).catch(() => null)
    fetch('/api/admin/products').then((r) => r.json()).then(setProducts).catch(() => null)
    fetch('/api/admin/reviews').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setReviews(d) }).catch(() => null)
    fetch('/api/admin/promos').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setPromos(d) }).catch(() => null)
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => {
      if (d.instagram_tiles?.length) {
        setTiles(Array(6).fill(null).map((_, i) => d.instagram_tiles[i] ?? { ...BLANK_TILE }))
      }
      if (d.hero_image_url) setHeroImage(d.hero_image_url)
      if (d.about_media) setAboutMedia(d.about_media)
      if (Array.isArray(d.custom_photos)) {
        const blank = { url: '', caption: '' }
        setCustomPhotos([0, 1, 2].map((i) => d.custom_photos[i] ?? blank))
      }
      if (d.site_content) setContent({ ...DEFAULT_CONTENT, ...d.site_content })
    }).catch(() => null)
  }, [])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  async function updateOrderStatus(id: string, status: string, tracking?: string) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      body: JSON.stringify({ id, status, tracking_number: tracking }),
      headers: { 'Content-Type': 'application/json' },
    })
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'], tracking_number: tracking ?? o.tracking_number } : o))
  }

  async function saveGrid() {
    setSavingGrid(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagram_tiles: tiles, hero_image_url: heroImage, about_media: aboutMedia, custom_photos: customPhotos }),
      })
      if (!res.ok) throw new Error('Failed to save')
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Home page saved!' }))
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Error saving.' }))
    } finally {
      setSavingGrid(false)
    }
  }


  async function savePromos(updated: PromoCode[]) {
    setSavingPromos(true)
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('Failed')
      setPromos(updated)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Promo codes saved!' }))
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Error saving promos.' }))
    } finally {
      setSavingPromos(false)
    }
  }

  async function saveContent() {
    setSavingContent(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_content: content }),
      })
      if (!res.ok) throw new Error('Failed')
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Content saved!' }))
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Error saving content.' }))
    } finally {
      setSavingContent(false)
    }
  }

  async function saveReview() {
    setSavingReview(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingReview,
          avatar_letter: editingReview.reviewer_name?.[0]?.toUpperCase() ?? '?',
        }),
      })
      const saved = await res.json()
      if (!res.ok) throw new Error(saved.error ?? 'Save failed')
      setReviews((prev) => {
        const i = prev.findIndex((r) => r.id === saved.id)
        return i >= 0 ? prev.map((r) => r.id === saved.id ? saved : r) : [saved, ...prev]
      })
      setEditingReview(BLANK_REVIEW)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Review saved!' }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }))
    } finally {
      setSavingReview(false)
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  async function saveCustomOrderChanges(id: string, status: string, notes: string, quote: string, estimatedTime: string, trackingNumber: string) {
    setSavingCustomOrder(id)
    try {
      const res = await fetch('/api/admin/custom-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, admin_notes: notes, quote_amount: quote, estimated_time: estimatedTime, tracking_number: trackingNumber }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setCustomOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as CustomOrderRequest['status'] } : o))
      setCustomOrderExtras((prev) => ({ ...prev, [id]: { admin_notes: notes, quote_amount: quote, estimated_time: estimatedTime, tracking_number: trackingNumber } }))
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Custom order updated!' }))
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Error saving.' }))
    } finally {
      setSavingCustomOrder(null)
    }
  }

  async function saveProduct() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
        headers: { 'Content-Type': 'application/json' },
      })
      const saved = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(saved))
      setProducts((prev) => {
        const i = prev.findIndex((p) => p.id === saved.id)
        return i >= 0 ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev]
      })
      setNewProduct(BLANK_PRODUCT)
      setTab('products')
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Product saved!' }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>made by <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>adya</span></h2>
        {(['orders', 'products', 'new-product', 'reviews', 'promos', 'custom-orders', 'newsletter', 'stock-alerts', 'analytics', 'content', 'home-grid'] as Tab[]).map((t) => (
          <button key={t} className={`admin-nav-link${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'orders' ? '📦 Orders' : t === 'products' ? '🛍️ Products' : t === 'new-product' ? '➕ New Product' : t === 'reviews' ? '⭐ Reviews' : t === 'promos' ? '🎟️ Promos' : t === 'custom-orders' ? '✂️ Custom Orders' : t === 'newsletter' ? '📧 Newsletter' : t === 'stock-alerts' ? '🔔 Stock Alerts' : t === 'analytics' ? '📊 Analytics' : t === 'content' ? '✏️ Content' : '🏠 Home Grid'}
          </button>
        ))}
        <button className="admin-nav-link" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.1)' }} onClick={logout}>
          🚪 Log Out
        </button>
      </div>

      <div className="admin-content">
        {/* ORDERS */}
        {tab === 'orders' && (() => {
          const STATUS_FILTERS: Array<'all' | Order['status']> = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled']

          const filteredOrders = orders.filter((o) => {
            const q = orderSearch.toLowerCase()
            const matchSearch = !q || o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q) || o.order_number.toLowerCase().includes(q)
            const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter
            return matchSearch && matchStatus
          })

          function statusCount(s: Order['status']) { return orders.filter((o) => o.status === s).length }

          function getTracking(order: Order) {
            return orderTrackingInputs[order.id] ?? order.tracking_number ?? ''
          }

          async function saveTracking(order: Order) {
            const tracking = getTracking(order)
            await updateOrderStatus(order.id, order.status, tracking || undefined)
            window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Tracking number saved' }))
          }

          return (
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ margin: 0 }}>Orders ({orders.length})</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="btn-outline btn-outline-sm"
                    onClick={() => {
                      const rows = orders.map((o) => ({
                        'Order #': o.order_number,
                        'Date': new Date(o.created_at).toLocaleDateString(),
                        'Customer Name': o.customer_name,
                        'Email': o.customer_email,
                        'Items': (o.items ?? []).map((i) => `${i.name} x${i.qty}${i.size ? ` (${i.size})` : ''}${i.color ? ` [${i.color}]` : ''}`).join(' | '),
                        'Subtotal': `$${(o.subtotal / 100).toFixed(2)}`,
                        'Tax': `$${(o.tax / 100).toFixed(2)}`,
                        'Total': `$${(o.total / 100).toFixed(2)}`,
                        'Status': o.status,
                        'Tracking': o.tracking_number ?? '',
                        'Shipping Address': o.shipping_address ? `${o.shipping_address.street}, ${o.shipping_address.city}, ${o.shipping_address.state} ${o.shipping_address.zip}, ${o.shipping_address.country}` : '',
                      }))
                      downloadCSV(rows, `orders-${new Date().toISOString().slice(0, 10)}.csv`)
                    }}
                  >
                    ↓ Export CSV
                  </button>
                  <input
                    type="text"
                    placeholder="Search by name, email, or order #…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ fontSize: 13, padding: '8px 14px', borderRadius: 20, border: '1.5px solid var(--warm-sand)', background: 'var(--cream)', width: 260, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Status filter pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setOrderStatusFilter(s)}
                    style={{
                      padding: '5px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 12, cursor: 'pointer',
                      fontWeight: orderStatusFilter === s ? 600 : 400,
                      background: orderStatusFilter === s ? 'var(--accent)' : 'var(--cream)',
                      color: orderStatusFilter === s ? 'white' : 'var(--text-mid)',
                      borderColor: orderStatusFilter === s ? 'var(--accent)' : 'var(--warm-sand)',
                    }}
                  >
                    {s === 'all' ? `All (${orders.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCount(s)})`}
                  </button>
                ))}
              </div>

              {orders.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No orders yet. Share the shop link to get your first sale! 🎉</p>
              ) : filteredOrders.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No orders match your search.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isExpanded = expandedOrder === order.id
                      const addr = order.shipping_address ?? {}
                      return (
                        <React.Fragment key={order.id}>
                          <tr
                            style={{ cursor: 'pointer', background: isExpanded ? 'var(--cream)' : undefined }}
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          >
                            <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                            <td>
                              <div>{order.customer_name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{order.customer_email}</div>
                            </td>
                            <td>{fmt(order.total)}</td>
                            <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                            <td style={{ color: 'var(--text-light)', fontSize: 12 }}>
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value
                                  const tracking = newStatus === 'shipped' ? prompt('Enter tracking number (optional):') ?? undefined : undefined
                                  updateOrderStatus(order.id, newStatus, tracking)
                                }}
                                style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--warm-sand)', background: 'var(--cream)' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ color: 'var(--text-light)', fontSize: 13 }}>
                              {isExpanded ? '▲' : '▼'}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr key={`${order.id}-detail`} style={{ background: 'var(--cream)' }}>
                              <td colSpan={7} style={{ padding: '0 0 16px' }}>
                                <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                                  {/* LEFT: Items + Totals */}
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 10 }}>Items Ordered</div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid var(--warm-sand)' }}>
                                          <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: 600, fontSize: 11, color: 'var(--text-light)' }}>Item</th>
                                          <th style={{ textAlign: 'center', padding: '4px 0', fontWeight: 600, fontSize: 11, color: 'var(--text-light)' }}>Qty</th>
                                          <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 600, fontSize: 11, color: 'var(--text-light)' }}>Price</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(order.items ?? []).map((item, i) => (
                                          <tr key={i} style={{ borderBottom: '1px solid var(--warm-sand)' }}>
                                            <td style={{ padding: '7px 0' }}>
                                              <div style={{ fontWeight: 500 }}>{item.name}</div>
                                              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                                                {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                                              </div>
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '7px 0', color: 'var(--text-mid)' }}>×{item.qty}</td>
                                            <td style={{ textAlign: 'right', padding: '7px 0' }}>{fmt(item.price * item.qty)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>

                                    {/* Totals */}
                                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                                        <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
                                      </div>
                                      {order.gift_wrap && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                                          <span>Gift wrap</span><span>{fmt(500)}</span>
                                        </div>
                                      )}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-mid)' }}>
                                        <span>Tax</span><span>{fmt(order.tax)}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, paddingTop: 6, borderTop: '1.5px solid var(--warm-sand)', marginTop: 2 }}>
                                        <span>Total</span><span style={{ color: 'var(--accent)' }}>{fmt(order.total)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* RIGHT: Shipping + Tracking */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>Ship to</div>
                                      <div style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7, background: 'white', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--warm-sand)' }}>
                                        {addr.first_name} {addr.last_name}<br />
                                        {addr.street}<br />
                                        {addr.city}, {addr.state} {addr.zip}<br />
                                        {addr.country}
                                      </div>
                                    </div>

                                    {order.gift_wrap && (
                                      <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 6 }}>Gift wrap</div>
                                        <span style={{ fontSize: 12, background: '#f5e6df', color: 'var(--accent)', padding: '3px 10px', borderRadius: 12 }}>🎁 Yes</span>
                                      </div>
                                    )}

                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>Tracking number</div>
                                      <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="text"
                                          placeholder="e.g. 9400111899223397990000"
                                          value={getTracking(order)}
                                          onChange={(e) => setOrderTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                          style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--warm-sand)', background: 'white', outline: 'none' }}
                                        />
                                        <button
                                          className="btn-outline btn-outline-sm"
                                          onClick={() => saveTracking(order)}
                                        >
                                          Save
                                        </button>
                                      </div>
                                      {order.tracking_number && (
                                        <a
                                          href={`https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${encodeURIComponent(order.tracking_number)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                                        >
                                          Track on USPS →
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )
        })()}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Products ({products.length})</h2>
              <button
                className="btn-outline btn-outline-sm"
                onClick={() => fetch('/api/admin/products').then((r) => r.json()).then(setProducts).catch(() => null)}
              >↻ Refresh Stock</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Stock</th><th>Category</th><th>Status</th><th>Edit</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 52, borderRadius: 8, background: p.bg_color, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                            : p.emoji}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.name}</div>
                          {p.is_new && <span className="status-badge paid" style={{ fontSize: 10 }}>New</span>}
                          {p.is_bestseller && <span className="status-badge" style={{ fontSize: 10, background: 'var(--lavender)' }}>Bestseller</span>}
                        </div>
                      </div>
                    </td>
                    <td>{fmt(p.price)}</td>
                    <td>
                      {/* Total stock */}
                      <div style={{ fontWeight: 600, color: p.stock <= 3 ? '#c0392b' : 'inherit', marginBottom: p.colors?.length && Object.keys(p.color_stock ?? {}).length > 0 ? 4 : 0 }}>
                        {p.stock} total
                      </div>
                      {/* Per-color breakdown */}
                      {p.colors?.length > 0 && Object.keys(p.color_stock ?? {}).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {p.colors.map((c) => {
                            const qty = (p.color_stock ?? {})[c]
                            if (qty === undefined) return null
                            const isSplit = c.includes('|')
                            const [ca, cb] = isSplit ? c.split('|') : [c, c]
                            return (
                              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {isSplit
                                  ? <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', position: 'relative', border: '1px solid rgba(0,0,0,.1)' }}>
                                      <div style={{ position: 'absolute', inset: 0, background: ca, clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
                                      <div style={{ position: 'absolute', inset: 0, background: cb, clipPath: 'polygon(100% 0,100% 100%,0 100%)' }} />
                                    </div>
                                  : <div style={{ width: 12, height: 12, borderRadius: '50%', background: c, flexShrink: 0, border: '1px solid rgba(0,0,0,.1)' }} />
                                }
                                <span style={{ fontSize: 11, color: qty === 0 ? '#c0392b' : qty <= 3 ? '#e67e22' : 'var(--text-mid)' }}>
                                  {qty === 0 ? 'sold out' : qty}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-mid)' }}>{p.category}</span></td>
                    <td><span className={`status-badge ${p.active ? 'paid' : 'cancelled'}`}>{p.active ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <button
                        className="btn-outline btn-outline-sm"
                        onClick={() => { setNewProduct(p); setTab('new-product') }}
                      >Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NEW / EDIT PRODUCT */}
        {tab === 'new-product' && (
          <div className="admin-card">
            <h2>{newProduct.id ? `Edit: ${newProduct.name}` : 'New Product'}</h2>
            <div className="form-grid">
              <div className="form-group form-group-inline"><label>Name</label><input type="text" value={newProduct.name ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group form-group-inline">
                <label>Photos <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(paste image URLs — first photo is the main one)</span></label>
                {(newProduct.images ?? []).map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <input type="url" placeholder="https://..." value={url} style={{ flex: 1 }}
                      onChange={(e) => setNewProduct((p) => ({ ...p, images: (p.images ?? []).map((u, j) => j === i ? e.target.value : u) }))} />
                    {url && <img src={url} alt="" style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6, border: '1.5px solid var(--warm-sand)', flexShrink: 0 }} />}
                    <button type="button" onClick={() => setNewProduct((p) => ({ ...p, images: (p.images ?? []).filter((_, j) => j !== i) }))}
                      style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn-outline btn-outline-sm" style={{ marginTop: 4 }}
                  onClick={() => setNewProduct((p) => ({ ...p, images: [...(p.images ?? []), ''] }))}>
                  + Add Photo
                </button>
              </div>
              <div className="form-group form-group-inline"><label>Description</label><textarea rows={2} value={newProduct.description ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-group"><label>Price (cents, e.g. 6800 = $68)</label><input type="number" value={newProduct.price ?? 0} onChange={(e) => setNewProduct((p) => ({ ...p, price: parseInt(e.target.value) }))} /></div>
              {(() => {
                const cs = newProduct.color_stock ?? {}
                const hasColorStock = Object.keys(cs).length > 0
                const calculatedTotal = hasColorStock ? Object.values(cs).reduce((s, n) => s + n, 0) : null
                return (
                  <div className="form-group">
                    <label>
                      Total Stock{' '}
                      {hasColorStock
                        ? <span style={{ fontWeight: 400, color: 'var(--accent)', fontSize: 12 }}>auto-calculated from colors = {calculatedTotal}</span>
                        : <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(set per-color below to auto-calculate)</span>}
                    </label>
                    <input
                      type="number"
                      value={hasColorStock ? calculatedTotal ?? 0 : (newProduct.stock ?? 0)}
                      readOnly={hasColorStock}
                      style={hasColorStock ? { background: 'var(--cream)', color: 'var(--text-light)', cursor: 'not-allowed' } : {}}
                      onChange={(e) => { if (!hasColorStock) setNewProduct((p) => ({ ...p, stock: parseInt(e.target.value) })) }}
                    />
                  </div>
                )
              })()}
              <div className="form-group"><label>Emoji</label><input type="text" value={newProduct.emoji ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, emoji: e.target.value }))} /></div>
              <div className="form-group"><label>Background Color (hex)</label><input type="text" value={newProduct.bg_color ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, bg_color: e.target.value }))} /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={newProduct.category ?? 'crochet'} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value as Product['category'] }))}>
                  <option value="crochet">Crochet</option>
                  <option value="sewn">Hand-Sewn</option>
                  <option value="sets">Sets</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div className="form-group"><label>Badge Label</label><input type="text" value={newProduct.badge ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, badge: e.target.value }))} /></div>
              <div className="form-group"><label>Sizes (comma-separated)</label><input type="text" value={(newProduct.sizes ?? []).join(',')} onChange={(e) => setNewProduct((p) => ({ ...p, sizes: e.target.value.split(',').map((s) => s.trim()) }))} /></div>
              <div className="form-group form-group-inline">
                <label>Yarn / Fabric Colors</label>
                <ColorPicker
                  colors={newProduct.colors ?? []}
                  onChange={(c) => setNewProduct((p) => ({ ...p, colors: c }))}
                />
              </div>
              <div className="form-group form-group-inline">
                <label>Add a Split (Multicolor) Swatch</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', background: 'var(--cream)', border: '1.5px solid var(--warm-sand)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(multiA) ? multiA : '#f2d9d0'} onChange={(e) => setMultiA(e.target.value)} style={{ width: 36, height: 28, cursor: 'pointer', borderRadius: 4, border: 'none' }} />
                    <input type="text" value={multiA} onChange={(e) => setMultiA(e.target.value)} placeholder="#f2d9d0" style={{ width: 80, fontSize: 12 }} />
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text-light)' }}>+</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(multiB) ? multiB : '#c8d8c0'} onChange={(e) => setMultiB(e.target.value)} style={{ width: 36, height: 28, cursor: 'pointer', borderRadius: 4, border: 'none' }} />
                    <input type="text" value={multiB} onChange={(e) => setMultiB(e.target.value)} placeholder="#c8d8c0" style={{ width: 80, fontSize: 12 }} />
                  </div>
                  <SplitSwatch a={multiA} b={multiB} size={28} />
                  <button
                    type="button"
                    className="btn-outline btn-outline-sm"
                    onClick={() => {
                      const a = multiA.startsWith('#') ? multiA : `#${multiA}`
                      const b = multiB.startsWith('#') ? multiB : `#${multiB}`
                      if (!/^#[0-9a-fA-F]{6}$/.test(a) || !/^#[0-9a-fA-F]{6}$/.test(b)) return
                      const val = `${a}|${b}`
                      if (!(newProduct.colors ?? []).includes(val)) {
                        setNewProduct((p) => ({ ...p, colors: [...(p.colors ?? []), val] }))
                      }
                    }}
                  >Add split swatch</button>
                </div>
              </div>
              {(newProduct.colors ?? []).length > 0 && (
                <div className="form-group form-group-inline">
                  <label>Stock per Color <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(leave blank to use the overall stock number)</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(newProduct.colors ?? []).map((color) => (
                      <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {color.includes('|') ? (() => { const [a,b]=color.split('|'); return <SplitSwatch a={a} b={b} size={22} /> })() : <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, border: '1.5px solid var(--warm-sand)', flexShrink: 0 }} />}
                        <span style={{ fontSize: 12, color: 'var(--text-mid)', width: 72 }}>{color}</span>
                        <input
                          type="number"
                          min={0}
                          placeholder="—"
                          value={(newProduct.color_stock ?? {})[color] ?? ''}
                          style={{ width: 80, fontSize: 13 }}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseInt(e.target.value)
                            setNewProduct((p) => {
                              const cs = { ...(p.color_stock ?? {}) }
                              if (val === undefined) { delete cs[color] } else { cs[color] = val }
                              return { ...p, color_stock: cs }
                            })
                          }}
                        />
                        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>in stock</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.is_new ?? false} onChange={(e) => setNewProduct((p) => ({ ...p, is_new: e.target.checked }))} /> New
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.is_bestseller ?? false} onChange={(e) => setNewProduct((p) => ({ ...p, is_bestseller: e.target.checked }))} /> Bestseller
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.active ?? true} onChange={(e) => setNewProduct((p) => ({ ...p, active: e.target.checked }))} /> Active
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn-primary" onClick={saveProduct} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
              <button className="btn-outline btn-outline-sm" onClick={() => { setNewProduct(BLANK_PRODUCT); setTab('products') }}>Cancel</button>
            </div>
          </div>
        )}
        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div className="admin-card">
            <h2>Reviews</h2>

            {/* Add / Edit form */}
            <div style={{ background: 'var(--blush)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>
                {editingReview.id ? 'Edit Review' : 'Add Review'}
              </h3>
              <div className="form-grid">
                <div className="form-group form-group-inline">
                  <label>Reviewer Name</label>
                  <input type="text" placeholder="Jane D." value={editingReview.reviewer_name ?? ''}
                    onChange={(e) => setEditingReview((r) => ({ ...r, reviewer_name: e.target.value }))} />
                </div>
                <div className="form-group form-group-inline">
                  <label>Product Name <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(what they bought)</span></label>
                  <input type="text" placeholder="Crochet Crop Top" value={editingReview.product_name ?? ''}
                    onChange={(e) => setEditingReview((r) => ({ ...r, product_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Rating (1–5)</label>
                  <input type="number" min={1} max={5} value={editingReview.rating ?? 5}
                    onChange={(e) => setEditingReview((r) => ({ ...r, rating: parseInt(e.target.value) }))} />
                </div>
                <div className="form-group form-group-inline">
                  <label>Review Text</label>
                  <textarea rows={3} placeholder="Write the review…" value={editingReview.body ?? ''}
                    onChange={(e) => setEditingReview((r) => ({ ...r, body: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-primary" onClick={saveReview} disabled={savingReview}>
                  {savingReview ? 'Saving…' : editingReview.id ? 'Update Review' : 'Add Review'}
                </button>
                {editingReview.id && (
                  <button className="btn-outline btn-outline-sm" onClick={() => setEditingReview(BLANK_REVIEW)}>Cancel</button>
                )}
              </div>
            </div>

            {/* Existing reviews list */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No reviews yet. Add one above.</p>
            ) : (
              <>{reviews.map((r) => (
                <div key={r.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid var(--warm-sand)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
                    {r.avatar_letter}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{r.reviewer_name} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>— {r.product_name}</span></div>
                    <div style={{ color: '#e8b86d', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{r.body}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn-outline btn-outline-sm" onClick={() => setEditingReview(r)}>Edit</button>
                    <button className="btn-outline btn-outline-sm" style={{ color: '#c0392b', borderColor: '#c0392b' }} onClick={() => deleteReview(r.id)}>Delete</button>
                  </div>
                </div>
              ))}</>
            )}
          </div>
        )}

        {/* PROMOS */}
        {tab === 'promos' && (
          <div className="admin-card">
            <h2>Promo Codes</h2>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
              Codes entered at checkout give the specified % off. Click <strong>Products</strong> on any code to restrict it to specific items — or leave all unchecked to apply to everything.
            </p>

            {/* Existing codes */}
            {promos.map((promo, i) => {
              const isExpired = !!promo.expires_at && new Date(promo.expires_at) < new Date()
              const useCount = promo.use_count ?? 0
              const limitReached = promo.max_uses != null && useCount >= promo.max_uses
              return (
                <div key={i} style={{ background: 'var(--blush)', borderRadius: 12, marginBottom: 10, overflow: 'hidden', opacity: isExpired || limitReached ? 0.7 : 1 }}>
                  {/* Row 1: code info + discount + active + actions */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 15, fontFamily: 'monospace', letterSpacing: '.06em' }}>{promo.code}</span>
                        {isExpired && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#c0392b', color: 'white', padding: '2px 7px', borderRadius: 8, letterSpacing: '.04em' }}>EXPIRED</span>
                        )}
                        {limitReached && !isExpired && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#7a6058', color: 'white', padding: '2px 7px', borderRadius: 8, letterSpacing: '.04em' }}>LIMIT REACHED</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                        {promo.label}
                        {promo.product_ids?.length > 0
                          ? ` · ${promo.product_ids.length} product${promo.product_ids.length !== 1 ? 's' : ''}`
                          : ' · All products'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="number" min={0} max={100} value={promo.discount} style={{ width: 56, fontSize: 13 }}
                        onChange={(e) => setPromos((prev) => prev.map((p, j) => j === i ? { ...p, discount: parseInt(e.target.value) || 0 } : p))} />
                      <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>% off</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={promo.free_shipping ?? false}
                        onChange={(e) => setPromos((prev) => prev.map((p, j) => j === i ? { ...p, free_shipping: e.target.checked } : p))} />
                      🚚 Free shipping
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={promo.active}
                        onChange={(e) => setPromos((prev) => prev.map((p, j) => j === i ? { ...p, active: e.target.checked } : p))} />
                      Active
                    </label>
                    <button onClick={() => setExpandedPromo(expandedPromo === i ? null : i)}
                      style={{ background: 'none', border: '1.5px solid var(--warm-sand)', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-mid)' }}>
                      {expandedPromo === i ? 'Hide' : 'Products'}
                    </button>
                    <button onClick={() => savePromos(promos.map((p, j) => j === i ? { ...p } : p))} disabled={savingPromos}
                      className="btn-outline btn-outline-sm">Save</button>
                    <button onClick={() => { const updated = promos.filter((_, j) => j !== i); savePromos(updated) }}
                      style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
                  </div>

                  {/* Row 2: expiry, max uses, uses remaining */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 16px 12px', borderTop: '1px solid rgba(196,144,122,.2)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>Expires</label>
                      <input
                        type="date"
                        value={promo.expires_at ? promo.expires_at.slice(0, 10) : ''}
                        style={{ fontSize: 12, padding: '3px 8px', borderRadius: 8, border: '1.5px solid var(--warm-sand)', background: 'white', color: isExpired ? '#c0392b' : 'var(--text-dark)' }}
                        onChange={(e) => setPromos((prev) => prev.map((p, j) => j === i
                          ? { ...p, expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined }
                          : p))}
                      />
                      {promo.expires_at && (
                        <button
                          title="Clear expiry"
                          onClick={() => setPromos((prev) => prev.map((p, j) => j === i ? { ...p, expires_at: undefined } : p))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                      )}
                      {!promo.expires_at && <span style={{ fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' }}>No expiry</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>Max uses</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="∞"
                        value={promo.max_uses ?? ''}
                        style={{ width: 72, fontSize: 12, padding: '3px 8px', borderRadius: 8, border: '1.5px solid var(--warm-sand)', background: 'white' }}
                        onChange={(e) => setPromos((prev) => prev.map((p, j) => j === i
                          ? { ...p, max_uses: e.target.value ? parseInt(e.target.value) : undefined }
                          : p))}
                      />
                      {!promo.max_uses && <span style={{ fontSize: 11, color: 'var(--text-light)', fontStyle: 'italic' }}>Unlimited</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-light)' }}>Uses:</span>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: '2px 9px', borderRadius: 10,
                        background: limitReached ? '#c0392b' : useCount > 0 ? 'var(--accent)' : 'var(--warm-sand)',
                        color: useCount > 0 || limitReached ? 'white' : 'var(--text-mid)',
                      }}>
                        {useCount}{promo.max_uses != null ? ` / ${promo.max_uses}` : ''}
                      </span>
                      {useCount > 0 && (
                        <button
                          title="Reset use count"
                          onClick={() => setPromos((prev) => prev.map((p, j) => j === i ? { ...p, use_count: 0 } : p))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: 11, padding: 0, textDecoration: 'underline' }}>reset</button>
                      )}
                    </div>
                  </div>

                  {expandedPromo === i && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--warm-sand)', background: 'rgba(255,255,255,0.5)' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 10 }}>
                        Select which products this code applies to. Leave all unchecked to apply to every product.
                      </p>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer', fontWeight: 500 }}>
                        <input type="checkbox"
                          checked={!promo.product_ids?.length}
                          onChange={() => setPromos((prev) => prev.map((p, j) => j === i ? { ...p, product_ids: [] } : p))} />
                        All products
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {products.map((product) => (
                          <label key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                            <input type="checkbox"
                              checked={promo.product_ids?.includes(product.id) ?? false}
                              onChange={(e) => setPromos((prev) => prev.map((p, j) => {
                                if (j !== i) return p
                                const ids = p.product_ids ?? []
                                return { ...p, product_ids: e.target.checked ? [...ids, product.id] : ids.filter((id) => id !== product.id) }
                              }))} />
                            <span style={{ fontSize: 16 }}>{product.emoji}</span>
                            {product.name}
                            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>${(product.price / 100).toFixed(0)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add new code */}
            <div style={{ marginTop: 24, padding: 16, background: 'var(--cream)', borderRadius: 12, border: '1.5px dashed var(--warm-sand)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Add New Code</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 12 }}>Code</label>
                  <input placeholder="SUMMER20" value={newPromo.code} style={{ width: 140, fontFamily: 'monospace', textTransform: 'uppercase' }}
                    onChange={(e) => setNewPromo((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 12 }}>Label</label>
                  <input placeholder="Summer Sale" value={newPromo.label} style={{ width: 160 }}
                    onChange={(e) => setNewPromo((p) => ({ ...p, label: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 12 }}>Discount %</label>
                  <input type="number" min={0} max={100} value={newPromo.discount} style={{ width: 70 }}
                    onChange={(e) => setNewPromo((p) => ({ ...p, discount: parseInt(e.target.value) || 0 }))} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginBottom: 0, alignSelf: 'flex-end', paddingBottom: 6 }}>
                  <input type="checkbox" checked={newPromo.free_shipping ?? false}
                    onChange={(e) => setNewPromo((p) => ({ ...p, free_shipping: e.target.checked }))} />
                  🚚 Free shipping
                </label>
                <button className="btn-primary"
                  disabled={!newPromo.code || !newPromo.label || savingPromos}
                  onClick={() => {
                    const updated = [...promos, { ...newPromo, active: true, use_count: 0 }]
                    savePromos(updated)
                    setNewPromo({ code: '', discount: 10, label: '', active: true, product_ids: [], use_count: 0, free_shipping: false })
                  }}>
                  + Add Code
                </button>
              </div>
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>Applies to (leave all unchecked for all products):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {products.map((product) => (
                    <label key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox"
                        checked={newPromo.product_ids?.includes(product.id) ?? false}
                        onChange={(e) => setNewPromo((p) => {
                          const ids = p.product_ids ?? []
                          return { ...p, product_ids: e.target.checked ? [...ids, product.id] : ids.filter((id) => id !== product.id) }
                        })} />
                      <span style={{ fontSize: 16 }}>{product.emoji}</span>
                      {product.name}
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>${(product.price / 100).toFixed(0)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM ORDERS */}
        {tab === 'custom-orders' && (
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ margin: 0 }}>Custom Orders ({customOrders.length})</h2>
              <button
                className="btn-outline btn-outline-sm"
                onClick={() => {
                  const rows = customOrders.map((o) => {
                    const extra = customOrderExtras[o.id] ?? {}
                    return {
                      'Date': new Date(o.created_at).toLocaleDateString(),
                      'Name': o.name,
                      'Email': o.email,
                      'Piece Type': o.piece_type,
                      'Budget': o.budget,
                      'Status': o.status,
                      'Vision': o.vision,
                      'Measurements': o.measurements,
                      'Color Pref': o.color_pref,
                      'Quote Amount': (extra as { quote_amount?: string }).quote_amount ?? '',
                    }
                  })
                  downloadCSV(rows, `custom-orders-${new Date().toISOString().slice(0, 10)}.csv`)
                }}
              >
                ↓ Export CSV
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
              Requests submitted through the custom order form. Update the status, add a quote amount, and leave admin notes for each request.
            </p>
            {customOrders.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No custom order requests yet.</p>
            ) : (
              customOrders.map((order) => {
                const extra = customOrderExtras[order.id] ?? { admin_notes: '', quote_amount: '' }
                return (
                  <CustomOrderCard
                    key={order.id}
                    order={order}
                    extra={extra}
                    saving={savingCustomOrder === order.id}
                    onSave={(status, notes, quote, estimatedTime, trackingNumber) => saveCustomOrderChanges(order.id, status, notes, quote, estimatedTime, trackingNumber)}
                  />
                )
              })
            )}
          </div>
        )}

        {/* NEWSLETTER */}
        {tab === 'newsletter' && (
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h2 style={{ margin: 0 }}>Newsletter Subscribers ({newsletterSubs.length})</h2>
              <button
                className="btn-outline btn-outline-sm"
                onClick={() => {
                  const rows = newsletterSubs.slice().reverse().map((s) => ({
                    'Email': s.email,
                    'Subscribed Date': new Date(s.created_at).toLocaleDateString(),
                  }))
                  downloadCSV(rows, `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`)
                }}
              >
                ↓ Export CSV
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
              Everyone who signed up through the homepage newsletter form or the custom order waitlist.
            </p>
            {newsletterSubs.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No subscribers yet.</p>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <a
                    href={`mailto:?bcc=${newsletterSubs.map((s) => s.email).join(',')}`}
                    className="btn-outline btn-outline-sm"
                    style={{ marginRight: 10 }}
                  >
                    ✉️ Email all ({newsletterSubs.length})
                  </a>
                  <button
                    className="btn-outline btn-outline-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(newsletterSubs.map((s) => s.email).join('\n'))
                      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Emails copied!' }))
                    }}
                  >
                    📋 Copy all emails
                  </button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr><th>Email</th><th>Subscribed</th></tr>
                  </thead>
                  <tbody>
                    {newsletterSubs.slice().reverse().map((s) => (
                      <tr key={s.email}>
                        <td><a href={`mailto:${s.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{s.email}</a></td>
                        <td style={{ color: 'var(--text-light)', fontSize: 12 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* STOCK ALERTS */}
        {tab === 'stock-alerts' && (() => {
          // Group notifications by product_name
          const grouped: Record<string, { product_name: string; product_id: string; emails: { email: string; created_at: string }[] }> = {}
          for (const n of stockAlerts) {
            if (!grouped[n.product_name]) grouped[n.product_name] = { product_name: n.product_name, product_id: n.product_id, emails: [] }
            grouped[n.product_name].emails.push({ email: n.email, created_at: n.created_at })
          }
          const groups = Object.values(grouped).sort((a, b) => b.emails.length - a.emails.length)

          async function markNotified(product_name: string) {
            setNotifyingAlert(product_name)
            await fetch('/api/admin/stock-alerts', {
              method: 'DELETE',
              body: JSON.stringify({ product_name }),
              headers: { 'Content-Type': 'application/json' },
            })
            setStockAlerts((prev) => prev.filter((n) => n.product_name !== product_name))
            setNotifyingAlert(null)
            window.dispatchEvent(new CustomEvent('show-toast', { detail: `✓ Cleared waitlist for ${product_name}` }))
          }

          return (
            <div className="admin-card">
              <h2>Stock Alerts {stockAlerts.length > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-light)' }}>({stockAlerts.length} signup{stockAlerts.length !== 1 ? 's' : ''})</span>}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 24 }}>
                Customers who signed up to be notified when a product is back in stock.
              </p>

              {groups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
                  <p style={{ fontSize: 14 }}>No stock alert signups yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {groups.map((g) => {
                    const isExpanded = expandedAlert === g.product_name
                    const emailList = g.emails.map((e) => e.email)
                    return (
                      <div key={g.product_name} style={{ border: '1px solid var(--warm-sand)', borderRadius: 12, overflow: 'hidden' }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'var(--cream)' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{g.product_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                              {g.emails.length} person{g.emails.length !== 1 ? 's' : ''} waiting
                            </div>
                          </div>

                          {/* Action buttons */}
                          <button
                            className="btn-outline btn-outline-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(emailList.join('\n'))
                              window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Emails copied!' }))
                            }}
                          >
                            📋 Copy emails
                          </button>
                          <a
                            href={`mailto:?bcc=${emailList.join(',')}&subject=Good news — ${g.product_name} is back in stock!`}
                            className="btn-outline btn-outline-sm"
                          >
                            ✉️ Email waitlist
                          </a>
                          <button
                            className="btn-outline btn-outline-sm"
                            style={{ color: '#c0392b', borderColor: '#c0392b' }}
                            disabled={notifyingAlert === g.product_name}
                            onClick={() => markNotified(g.product_name)}
                          >
                            {notifyingAlert === g.product_name ? 'Clearing…' : '✓ Mark notified'}
                          </button>
                          <button
                            className="btn-outline btn-outline-sm"
                            onClick={() => setExpandedAlert(isExpanded ? null : g.product_name)}
                          >
                            {isExpanded ? '▲ Hide' : '▼ Show'} emails
                          </button>
                        </div>

                        {/* Collapsible email list */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid var(--warm-sand)', padding: '12px 20px', background: 'white' }}>
                            <table className="admin-table" style={{ marginBottom: 0 }}>
                              <thead>
                                <tr><th>Email</th><th>Signed up</th></tr>
                              </thead>
                              <tbody>
                                {g.emails.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).map((e) => (
                                  <tr key={e.email}>
                                    <td>
                                      <a href={`mailto:${e.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{e.email}</a>
                                    </td>
                                    <td style={{ color: 'var(--text-light)', fontSize: 12 }}>
                                      {new Date(e.created_at).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* ANALYTICS */}
        {tab === 'analytics' && (() => {
          const now = new Date()
          const thisMonth = now.getMonth()
          const thisYear = now.getFullYear()
          const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
          const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

          const paidOrders = orders.filter((o) => o.status !== 'cancelled')
          const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0)
          const revenueThisMonth = paidOrders.filter((o) => {
            const d = new Date(o.created_at)
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear
          }).reduce((s, o) => s + o.total, 0)
          const revenueLastMonth = paidOrders.filter((o) => {
            const d = new Date(o.created_at)
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
          }).reduce((s, o) => s + o.total, 0)
          const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

          // Total product value sold (item prices × qty, no tax / gift wrap)
          const itemsValueAllTime = paidOrders.reduce((s, o) =>
            s + (o.items ?? []).reduce((ss, i) => ss + i.price * i.qty, 0), 0)
          const itemsValueThisMonth = paidOrders.filter((o) => {
            const d = new Date(o.created_at)
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear
          }).reduce((s, o) => s + (o.items ?? []).reduce((ss, i) => ss + i.price * i.qty, 0), 0)

          // Top products by units sold
          const productMap: Record<string, { name: string; units: number; revenue: number }> = {}
          for (const order of paidOrders) {
            for (const item of order.items ?? []) {
              if (!productMap[item.name]) productMap[item.name] = { name: item.name, units: 0, revenue: 0 }
              productMap[item.name].units += item.qty
              productMap[item.name].revenue += item.price * item.qty
            }
          }
          const topProducts = Object.values(productMap).sort((a, b) => b.units - a.units).slice(0, 5)
          const maxUnits = topProducts[0]?.units ?? 1

          // Status breakdown
          const STATUSES: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
          const STATUS_COLORS: Record<string, string> = {
            pending: '#e8c96a', paid: '#7ab8a8', shipped: '#c4907a',
            delivered: '#8faa7a', cancelled: '#c9a0a0',
          }
          const statusCounts = STATUSES.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length }))
          const maxStatusCount = Math.max(...statusCounts.map((s) => s.count), 1)

          const cardStyle: React.CSSProperties = {
            background: 'white', borderRadius: 16, padding: '20px 24px',
            border: '1px solid var(--warm-sand)', flex: 1, minWidth: 0,
          }
          const sectionLabel: React.CSSProperties = {
            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 16,
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* ── Revenue cards ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { label: 'Total Revenue', value: fmt(totalRevenue), sub: 'all orders · incl. tax' },
                  { label: 'Revenue This Month', value: fmt(revenueThisMonth), sub: now.toLocaleString('default', { month: 'long', year: 'numeric' }) },
                  { label: 'Revenue Last Month', value: fmt(revenueLastMonth), sub: new Date(lastMonthYear, lastMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) },
                  { label: 'Products Sold (All Time)', value: fmt(itemsValueAllTime), sub: 'catalog price · excl. tax' },
                  { label: 'Products Sold (This Month)', value: fmt(itemsValueThisMonth), sub: now.toLocaleString('default', { month: 'long', year: 'numeric' }) },
                  { label: 'Total Orders', value: String(orders.length), sub: `avg ${fmt(avgOrderValue)} / order` },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{ ...cardStyle, background: 'var(--blush)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 28, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'var(--accent)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* ── Top products ── */}
                <div style={cardStyle}>
                  <div style={sectionLabel}>Top Products by Units Sold</div>
                  {topProducts.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No sales data yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {topProducts.map((p, i) => (
                        <div key={p.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>
                              <span style={{ color: 'var(--text-light)', marginRight: 6, fontSize: 11 }}>#{i + 1}</span>
                              {p.name}
                            </span>
                            <span style={{ color: 'var(--text-mid)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                              {p.units} unit{p.units !== 1 ? 's' : ''} · {fmt(p.revenue)}
                            </span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--warm-sand)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 3,
                              width: `${(p.units / maxUnits) * 100}%`,
                              background: `hsl(${20 + i * 14}, 55%, ${68 - i * 4}%)`,
                              transition: 'width .4s ease',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Order status breakdown ── */}
                <div style={cardStyle}>
                  <div style={sectionLabel}>Order Status Breakdown</div>
                  {orders.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No orders yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {statusCounts.map(({ status, count }) => (
                        <div key={status}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status], display: 'inline-block', flexShrink: 0 }} />
                              <span style={{ textTransform: 'capitalize', color: 'var(--text-dark)', fontWeight: 500 }}>{status}</span>
                            </span>
                            <span style={{ color: 'var(--text-mid)' }}>{count} order{count !== 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--warm-sand)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 3,
                              width: count > 0 ? `${(count / maxStatusCount) * 100}%` : '0%',
                              background: STATUS_COLORS[status],
                              transition: 'width .4s ease',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Recent signups ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={cardStyle}>
                  <div style={sectionLabel}>Recent Newsletter Signups</div>
                  {newsletterSubs.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No subscribers yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <tbody>
                        {newsletterSubs.slice().reverse().slice(0, 5).map((s) => (
                          <tr key={s.email} style={{ borderBottom: '1px solid var(--warm-sand)' }}>
                            <td style={{ padding: '8px 0', color: 'var(--text-dark)' }}>{s.email}</td>
                            <td style={{ padding: '8px 0', color: 'var(--text-light)', fontSize: 11, textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {new Date(s.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {newsletterSubs.length > 5 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-light)' }}>
                      +{newsletterSubs.length - 5} more · <button onClick={() => setTab('newsletter')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0 }}>View all →</button>
                    </div>
                  )}
                </div>

                <div style={cardStyle}>
                  <div style={sectionLabel}>Recent Custom Order Requests</div>
                  {customOrders.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No custom requests yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <tbody>
                        {customOrders.slice(0, 5).map((o) => (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--warm-sand)' }}>
                            <td style={{ padding: '8px 0' }}>
                              <div style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{o.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{o.piece_type}</div>
                            </td>
                            <td style={{ padding: '8px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--blush)', color: 'var(--accent)', fontWeight: 500 }}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {customOrders.length > 5 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-light)' }}>
                      +{customOrders.length - 5} more · <button onClick={() => setTab('custom-orders')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: 0 }}>View all →</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )
        })()}

        {/* CONTENT */}
        {tab === 'content' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Site Content</h2>
              <button className="btn-primary" onClick={saveContent} disabled={savingContent}>
                {savingContent ? 'Saving…' : 'Save All Changes'}
              </button>
            </div>

            {/* Section nav */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {(['general','home','about','faq','custom','footer'] as ContentSection[]).map((s) => (
                <button key={s} onClick={() => setContentSection(s)}
                  style={{ padding: '6px 16px', borderRadius: 20, border: '1.5px solid var(--warm-sand)', background: contentSection === s ? 'var(--accent)' : 'var(--cream)', color: contentSection === s ? 'white' : 'var(--text-mid)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* GENERAL */}
            {contentSection === 'general' && (
              <div className="form-grid">
                <div className="form-group form-group-inline">
                  <label>Announce Bar Text</label>
                  <input value={content.announce_bar} onChange={(e) => setContent((c) => ({ ...c, announce_bar: e.target.value }))} />
                </div>
              </div>
            )}

            {/* HOME */}
            {contentSection === 'home' && (
              <div className="form-grid">
                <div className="form-group form-group-inline"><label>Hero Eyebrow</label><input value={content.hero_eyebrow} onChange={(e) => setContent((c) => ({ ...c, hero_eyebrow: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Hero Title</label><input value={content.hero_title} onChange={(e) => setContent((c) => ({ ...c, hero_title: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Hero Description</label><textarea rows={3} value={content.hero_desc} onChange={(e) => setContent((c) => ({ ...c, hero_desc: e.target.value }))} /></div>
                <div className="form-group"><label>Primary Button</label><input value={content.hero_cta_primary} onChange={(e) => setContent((c) => ({ ...c, hero_cta_primary: e.target.value }))} /></div>
                <div className="form-group"><label>Secondary Button</label><input value={content.hero_cta_secondary} onChange={(e) => setContent((c) => ({ ...c, hero_cta_secondary: e.target.value }))} /></div>
                <div className="form-group form-group-inline">
                  <label>4 Pillars</label>
                  {content.pillars.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input value={p.icon} onChange={(e) => setContent((c) => ({ ...c, pillars: c.pillars.map((x, j) => j === i ? { ...x, icon: e.target.value } : x) }))} style={{ width: 48 }} placeholder="Icon" />
                      <input value={p.title} onChange={(e) => setContent((c) => ({ ...c, pillars: c.pillars.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))} style={{ flex: 1 }} placeholder="Title" />
                      <input value={p.desc} onChange={(e) => setContent((c) => ({ ...c, pillars: c.pillars.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) }))} style={{ flex: 2 }} placeholder="Description" />
                    </div>
                  ))}
                </div>
                <div className="form-group form-group-inline"><label>Instagram Section Heading</label><input value={content.insta_heading} onChange={(e) => setContent((c) => ({ ...c, insta_heading: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Instagram Section Subtext</label><input value={content.insta_desc} onChange={(e) => setContent((c) => ({ ...c, insta_desc: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Newsletter Heading</label><input value={content.newsletter_heading} onChange={(e) => setContent((c) => ({ ...c, newsletter_heading: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Newsletter Subtext</label><input value={content.newsletter_desc} onChange={(e) => setContent((c) => ({ ...c, newsletter_desc: e.target.value }))} /></div>
              </div>
            )}

            {/* ABOUT */}
            {contentSection === 'about' && (
              <div className="form-grid">
                <div className="form-group form-group-inline"><label>Intro Paragraph 1</label><textarea rows={3} value={content.about_intro_1} onChange={(e) => setContent((c) => ({ ...c, about_intro_1: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Intro Paragraph 2</label><textarea rows={3} value={content.about_intro_2} onChange={(e) => setContent((c) => ({ ...c, about_intro_2: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Crochet Section Title</label><input value={content.about_crochet_title} onChange={(e) => setContent((c) => ({ ...c, about_crochet_title: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Crochet Description</label><textarea rows={3} value={content.about_crochet_desc} onChange={(e) => setContent((c) => ({ ...c, about_crochet_desc: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Sewing Section Title</label><input value={content.about_sewing_title} onChange={(e) => setContent((c) => ({ ...c, about_sewing_title: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Sewing Description</label><textarea rows={3} value={content.about_sewing_desc} onChange={(e) => setContent((c) => ({ ...c, about_sewing_desc: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Process Section Title</label><input value={content.about_process_title} onChange={(e) => setContent((c) => ({ ...c, about_process_title: e.target.value }))} /></div>
                <div className="form-group form-group-inline">
                  <label>Process Steps</label>
                  {content.about_steps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input value={s.title} onChange={(e) => setContent((c) => ({ ...c, about_steps: c.about_steps.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))} style={{ flex: 1 }} placeholder="Title" />
                      <input value={s.desc} onChange={(e) => setContent((c) => ({ ...c, about_steps: c.about_steps.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) }))} style={{ flex: 2 }} placeholder="Description" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {contentSection === 'faq' && (
              <div className="form-grid">
                <div className="form-group form-group-inline"><label>Page Heading</label><input value={content.faq_heading} onChange={(e) => setContent((c) => ({ ...c, faq_heading: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Subheading</label><input value={content.faq_sub} onChange={(e) => setContent((c) => ({ ...c, faq_sub: e.target.value }))} /></div>
                <div className="form-group form-group-inline">
                  <label>FAQ Items</label>
                  {content.faq_items.map((faq, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: 12, background: 'var(--blush)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>FAQ {i + 1}</span>
                        <button type="button" onClick={() => setContent((c) => ({ ...c, faq_items: c.faq_items.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 14 }}>✕ Remove</button>
                      </div>
                      <input placeholder="Question" value={faq.q} style={{ marginBottom: 6 }} onChange={(e) => setContent((c) => ({ ...c, faq_items: c.faq_items.map((x, j) => j === i ? { ...x, q: e.target.value } : x) }))} />
                      <textarea rows={2} placeholder="Answer" value={faq.a} onChange={(e) => setContent((c) => ({ ...c, faq_items: c.faq_items.map((x, j) => j === i ? { ...x, a: e.target.value } : x) }))} />
                    </div>
                  ))}
                  <button type="button" className="btn-outline btn-outline-sm" onClick={() => setContent((c) => ({ ...c, faq_items: [...c.faq_items, { q: '', a: '' }] }))}>+ Add FAQ</button>
                </div>
              </div>
            )}

            {/* CUSTOM ORDERS */}
            {contentSection === 'custom' && (
              <div className="form-grid">
                <div className="form-group form-group-inline"><label>Page Heading</label><input value={content.custom_heading} onChange={(e) => setContent((c) => ({ ...c, custom_heading: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Subheading</label><input value={content.custom_sub} onChange={(e) => setContent((c) => ({ ...c, custom_sub: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Description</label><textarea rows={3} value={content.custom_desc} onChange={(e) => setContent((c) => ({ ...c, custom_desc: e.target.value }))} /></div>
                <div className="form-group form-group-inline">
                  <label>Bullet Points</label>
                  {content.custom_list.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input value={item} style={{ flex: 1 }} onChange={(e) => setContent((c) => ({ ...c, custom_list: c.custom_list.map((x, j) => j === i ? e.target.value : x) }))} />
                      <button type="button" onClick={() => setContent((c) => ({ ...c, custom_list: c.custom_list.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="btn-outline btn-outline-sm" style={{ marginTop: 4 }} onClick={() => setContent((c) => ({ ...c, custom_list: [...c.custom_list, ''] }))}>+ Add Item</button>
                </div>
                <div className="form-group form-group-inline"><label>Waitlist Heading</label><input value={content.custom_waitlist_heading} onChange={(e) => setContent((c) => ({ ...c, custom_waitlist_heading: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Waitlist Subtext</label><input value={content.custom_waitlist_desc} onChange={(e) => setContent((c) => ({ ...c, custom_waitlist_desc: e.target.value }))} /></div>
              </div>
            )}

            {/* FOOTER */}
            {contentSection === 'footer' && (
              <div className="form-grid">
                <div className="form-group form-group-inline"><label>Tagline</label><textarea rows={2} value={content.footer_tagline} onChange={(e) => setContent((c) => ({ ...c, footer_tagline: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Contact Email</label><input type="email" value={content.footer_email} onChange={(e) => setContent((c) => ({ ...c, footer_email: e.target.value }))} /></div>
                <div className="form-group form-group-inline"><label>Copyright Line</label><input value={content.footer_copyright} onChange={(e) => setContent((c) => ({ ...c, footer_copyright: e.target.value }))} /></div>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <button className="btn-primary" onClick={saveContent} disabled={savingContent}>
                {savingContent ? 'Saving…' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}

        {/* HOME GRID */}
        {tab === 'home-grid' && (
          <div className="admin-card">
            <h2>Home Page</h2>

            {/* Hero image */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Hero Photo</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
                The big photo on the left side of the home page banner.
              </p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 100, height: 120, borderRadius: 10, overflow: 'hidden', background: 'var(--warm-sand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative' }}>
                  {heroImage
                    ? <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : '🧶'}
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Photo URL</label>
                  <input type="url" placeholder="https://..." value={heroImage} onChange={(e) => setHeroImage(e.target.value)} />
                </div>
              </div>
            </div>

            {/* About page photo/video */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>About Page Photo or Video</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
                Shown as a circle on the About page. Upload a photo or short video — MP4, MOV, WebM, or any image.
              </p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', background: 'var(--warm-sand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative' }}>
                  {aboutMedia.url
                    ? (aboutMedia.isVideo
                        ? <video src={aboutMedia.url} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                        : <img src={aboutMedia.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />)
                    : '🪡'}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <AboutMediaUpload value={aboutMedia} onChange={setAboutMedia} />
                </div>
              </div>
            </div>

            {/* Custom orders photos */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Custom Orders Gallery</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
                3 small photos at the bottom of the Custom Orders page. Add a caption that appears on hover.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {customPhotos.map((photo, i) => (
                  <div key={i} style={{ background: 'var(--blush)', borderRadius: 12, padding: 14 }}>
                    <div style={{ height: 175, borderRadius: 10, overflow: 'hidden', background: 'var(--warm-sand)', marginBottom: 10, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                      {photo.url
                        ? <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                        : `${i + 1}`}
                    </div>
                    <AboutMediaUpload
                      value={{ url: photo.url, isVideo: false }}
                      onChange={(m) => setCustomPhotos((prev) => prev.map((p, j) => j === i ? { ...p, url: m.url } : p))}
                    />
                    <div className="form-group" style={{ marginTop: 10, marginBottom: 0 }}>
                      <label style={{ fontSize: 12 }}>Hover caption</label>
                      <input
                        type="text"
                        placeholder="e.g. Custom crochet set in sage green"
                        value={photo.caption}
                        onChange={(e) => setCustomPhotos((prev) => prev.map((p, j) => j === i ? { ...p, caption: e.target.value } : p))}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instagram grid */}
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Instagram Grid</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 4 }}>
              For each tile: paste the Instagram post link, and separately paste the photo URL.
            </p>
            <p style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 16, background: 'var(--blush)', padding: '10px 14px', borderRadius: 8 }}>
              💡 To get a photo URL from Instagram: open the post on desktop, right-click the photo → "Copy image address". Paste that URL in the Photo URL field.
            </p>
            {tiles.map((tile, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16, padding: 16, background: 'var(--blush)', borderRadius: 12 }}>
                <div style={{ width: 64, height: 80, borderRadius: 10, overflow: 'hidden', background: 'var(--warm-sand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative' }}>
                  {tile.image_url
                    ? <img src={tile.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : (i + 1)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Instagram Post Link</label>
                    <input type="url" placeholder="https://instagram.com/p/..." value={tile.link_url}
                      onChange={(e) => setTiles((prev) => prev.map((t, j) => j === i ? { ...t, link_url: e.target.value } : t))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Photo URL</label>
                    <input type="url" placeholder="https://..." value={tile.image_url}
                      onChange={(e) => setTiles((prev) => prev.map((t, j) => j === i ? { ...t, image_url: e.target.value } : t))} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-primary" onClick={saveGrid} disabled={savingGrid}>
              {savingGrid ? 'Saving…' : 'Save Home Page'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
