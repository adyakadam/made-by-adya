'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Product, Review } from '@/lib/types'
import { useCart } from '@/lib/cart-store'
import { showToast } from '@/components/Toast'
import NotifyStock from '@/components/NotifyStock'
import { trackView } from '@/components/RecentlyViewed'
import WishlistButton from '@/components/WishlistButton'

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => (i < Math.round(n) ? '★' : '☆')).join('')
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

function SwatchInner({ color }: { color: string }) {
  if (!color.includes('|')) return null
  const [a, b] = color.split('|')
  return (
    <>
      <span style={{ position: 'absolute', inset: 0, background: a, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <span style={{ position: 'absolute', inset: 0, background: b, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
    </>
  )
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="pdp-accordion">
      <button className="pdp-accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="pdp-accordion-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="pdp-accordion-body">{children}</div>}
    </div>
  )
}

export default function ProductDetail({ product, related, reviews }: { product: Product; related: Product[]; reviews: Review[] }) {
  const addItem = useCart((s) => s.addItem)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [imgIndex, setImgIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const images = product.images ?? []

  useEffect(() => { trackView(product.id) }, [product.id])

  const closeZoom = useCallback(() => setZoomed(false), [])
  useEffect(() => {
    if (!zoomed) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeZoom()
      if (e.key === 'ArrowRight') setImgIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setImgIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed, images.length, closeZoom])

  function handleAdd() {
    if (!selectedSize) { showToast('Please select a size.'); return }
    if (!selectedColor) { showToast('Please select a color.'); return }
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      size: selectedSize,
      color: selectedColor,
      image_url: images[0] ?? null,
      emoji: product.emoji,
      bg_color: product.bg_color,
    })
    showToast(`✓ ${product.name} added to cart!`)
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const colorQty = selectedColor ? product.color_stock?.[selectedColor] : undefined
  const isSoldOut = colorQty !== undefined ? colorQty === 0 : product.stock === 0
  const lowStock = colorQty !== undefined ? colorQty : product.stock

  const categoryLabel: Record<string, string> = {
    crochet: 'Crochet', sewn: 'Hand-Sewn', sets: 'Sets', accessories: 'Accessories',
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb">
        <Link href="/shop">Shop</Link>
        <span>›</span>
        <Link href={`/shop?filter=${product.category}`}>{categoryLabel[product.category] ?? product.category}</Link>
        <span>›</span>
        <span>{product.name}</span>
      </nav>

      <div className="pdp-layout">
        {/* ── Gallery ── */}
        <div className="pdp-gallery">
          {/* Vertical thumbnail strip */}
          {images.length > 1 && (
            <div className="pdp-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  className={`pdp-thumb${i === imgIndex ? ' active' : ''}`}
                  onClick={() => setImgIndex(i)}
                >
                  <img src={src} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="pdp-main-img" style={{ background: product.bg_color }}>
            {images.length > 0
              ? images.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={product.name}
                    className={`pdp-main-img-slide${i === imgIndex ? ' active' : ''}`}
                    onClick={() => setZoomed(true)}
                    style={{ cursor: 'zoom-in' }}
                  />
                ))
              : <span style={{ fontSize: 100 }}>{product.emoji}</span>}

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button className="pdp-arrow pdp-arrow-prev" onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}>‹</button>
                <button className="pdp-arrow pdp-arrow-next" onClick={() => setImgIndex((i) => (i + 1) % images.length)}>›</button>
              </>
            )}

            {/* Badges overlay */}
            <div className="pdp-img-badges">
              {product.is_new && <span className="product-badge new">New</span>}
              {product.is_bestseller && <span className="product-badge bestseller">Bestseller</span>}
            </div>

            {/* Zoom hint */}
            {images.length > 0 && (
              <div className="pdp-zoom-hint">🔍 Click to zoom</div>
            )}
          </div>
        </div>

        {/* ── Info Panel ── */}
        <div className="pdp-info">
          {/* Brand + rating row */}
          <div className="pdp-brand-row">
            <span className="pdp-brand">made by adya</span>
            <div className="pdp-rating">
              <span style={{ color: '#e8b86d', fontSize: 13, letterSpacing: 1 }}>{stars(product.rating)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>({product.review_count})</span>
            </div>
          </div>

          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-price">{fmt(product.price)}</div>

          {/* Color selector */}
          <div className="pdp-section-label">
            Color{selectedColor ? <span className="pdp-selected-value">&nbsp;— {selectedColor}</span> : ''}
          </div>
          <div className="color-row" style={{ marginBottom: 8 }}>
            {product.colors.map((c) => {
              const qty = product.color_stock?.[c]
              const soldOut = qty !== undefined && qty === 0
              return (
                <div key={c} className="color-swatch-wrap">
                  <div
                    className={`color-swatch${selectedColor === c ? ' selected' : ''}${soldOut ? ' sold-out' : ''}`}
                    style={c.includes('|') ? { position: 'relative' } : { background: c }}
                    onClick={() => { if (!soldOut) setSelectedColor(c) }}
                    title={c}
                  >
                    <SwatchInner color={c} />
                  </div>
                  {qty !== undefined && (
                    <span className="color-stock-label">{soldOut ? 'sold out' : `${qty} left`}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Dynamic stock indicator */}
          {(() => {
            const stockToShow = colorQty !== undefined ? colorQty : product.stock
            const hasColorStock = colorQty !== undefined
            if (stockToShow === 0) return null // handled below by NotifyStock
            return (
              <p style={{ fontSize: 12, color: stockToShow <= 3 ? '#c0392b' : 'var(--text-light)', marginBottom: 6, fontWeight: stockToShow <= 3 ? 600 : 400 }}>
                {stockToShow <= 3
                  ? `⚠ Only ${stockToShow} left${hasColorStock && selectedColor ? ' in this color' : ''}!`
                  : `${stockToShow} in stock${hasColorStock && selectedColor ? ' in this color' : ''}`}
              </p>
            )
          })()}

          <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 20 }}>
            Different color? <Link href="/custom" className="size-guide-link">Request a custom order →</Link>
          </p>

          {/* Size selector */}
          <div className="pdp-section-label" style={{ justifyContent: 'space-between' }}>
            <span>Size{selectedSize ? <span className="pdp-selected-value">&nbsp;— {selectedSize}</span> : ''}</span>
            <Link href="/size-guide" className="size-guide-link">Size Guide</Link>
          </div>
          <div className="size-row" style={{ marginBottom: 20 }}>
            {product.sizes.map((s) => (
              <button key={s} className={`size-opt${selectedSize === s ? ' selected' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>

          {/* Sold out — notify form */}
          {(colorQty !== undefined ? colorQty : product.stock) === 0 && (
            <NotifyStock productId={product.id} productName={product.name} />
          )}

          {/* CTA */}
          <button
            className="btn-primary pdp-add-btn"
            onClick={handleAdd}
            disabled={isSoldOut}
          >
            {isSoldOut ? 'Sold Out' : '+ Add to Cart'}
          </button>
          <Link href="/cart" className="btn-outline pdp-cart-btn">View Cart</Link>

          {/* Share + Wishlist */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
            <button className="pdp-share" onClick={handleShare} style={{ flex: 1 }}>
              {copied ? '✓ Link copied!' : '↗ Share this piece'}
            </button>
            <WishlistButton productId={product.id} productName={product.name} size="lg" />
          </div>

          {/* Accordions */}
          <div className="pdp-accordions">
            <Accordion title="Product Details" defaultOpen>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.9 }}>{product.description}</p>
              <ul className="pdp-detail-list">
                <li>Handmade by Adya</li>
                <li>Category: {categoryLabel[product.category] ?? product.category}</li>
                <li>Badge: {product.badge}</li>
              </ul>
            </Accordion>

            <Accordion title="Sizing & Fit">
              <ul className="pdp-detail-list">
                <li>Available in: {product.sizes.join(', ')}</li>
                <li>Fit may vary — see our <Link href="/size-guide" className="size-guide-link">Size Guide</Link> for measurements</li>
                <li>Custom sizing available via <Link href="/custom" className="size-guide-link">custom order</Link></li>
              </ul>
            </Accordion>

            <Accordion title="Shipping & Returns">
              <ul className="pdp-detail-list">
                <li>📦 Ships via USPS within 2–3 business days</li>
                <li>First Class — $5.99 · 3–7 days</li>
                <li>Priority Mail — $9.99 · 1–3 days</li>
                <li>Priority Express — $29.99 · overnight</li>
                <li>All sales are final — <Link href="/policies" className="size-guide-link">see full policy</Link></li>
              </ul>
            </Accordion>

            <Accordion title="Care Instructions">
              <ul className="pdp-detail-list">
                <li>Hand wash cold, gentle cycle</li>
                <li>Lay flat to dry — do not tumble dry</li>
                <li>Do not bleach or iron directly on fabric</li>
                <li>Store folded, away from direct sunlight</li>
              </ul>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="pdp-sticky-cta">
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</div>
          <div style={{ color: 'var(--accent)', fontSize: 13 }}>{fmt(product.price)}</div>
        </div>
        <button className="btn-primary" onClick={handleAdd} disabled={isSoldOut} style={{ flexShrink: 0 }}>
          {isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="pdp-reviews-section">
          <div className="pdp-reviews-header">
            <h2 className="pdp-section-title">Customer Reviews</h2>
            <div className="pdp-reviews-avg">
              <span style={{ color: '#e8b86d', fontSize: 22 }}>{stars(product.rating)}</span>
              <span style={{ fontSize: 14, color: 'var(--text-mid)', marginLeft: 8 }}>{product.rating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="pdp-reviews-grid">
            {reviews.map((r) => (
              <div key={r.id} className="pdp-review-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="pdp-review-avatar">{r.avatar_letter}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.reviewer_name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#e8b86d', fontSize: 12 }}>{stars(r.rating)}</span>
                      <span style={{ color: 'var(--text-light)', fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.75, margin: 0 }}>{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image zoom lightbox */}
      {zoomed && images.length > 0 && (
        <div className="pdp-lightbox" onClick={closeZoom}>
          <button className="pdp-lightbox-close" onClick={closeZoom}>✕</button>
          <div className="pdp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={images[imgIndex]} alt={product.name} className="pdp-lightbox-img" />
            {images.length > 1 && (
              <>
                <button className="pdp-arrow pdp-arrow-prev" style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 1001 }}
                  onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + images.length) % images.length) }}>‹</button>
                <button className="pdp-arrow pdp-arrow-next" style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', zIndex: 1001 }}
                  onClick={(e) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % images.length) }}>›</button>
                <div className="pdp-lightbox-dots">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                      style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === imgIndex ? 'white' : 'rgba(255,255,255,.45)', padding: 0 }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* You might also love */}
      {related.length > 0 && (
        <section className="pdp-related-section">
          <h2 className="pdp-section-title">You might also love</h2>
          <div className="pdp-related-grid">
            {related.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="pdp-related-card">
                <div className="pdp-related-img" style={{ background: p.bg_color }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : <span style={{ fontSize: 52 }}>{p.emoji}</span>}
                  {p.is_new && <span className="product-badge new" style={{ position: 'absolute', top: 10, left: 10 }}>New</span>}
                </div>
                <div className="pdp-related-info">
                  <div className="pdp-related-name">{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="pdp-related-price">{fmt(p.price)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-light)', letterSpacing: '.05em' }}>{categoryLabel[p.category] ?? p.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
