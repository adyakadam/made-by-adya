'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-store'
import { showToast } from './Toast'
import VariantWhisper from './VariantWhisper'
import HesitationNudge from './HesitationNudge'

interface Props {
  product: Product | null
  onClose: () => void
}

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => (i < Math.round(n) ? '★' : '☆')).join('')
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export default function QuickViewModal({ product, onClose }: Props) {
  const addItem = useCart((s) => s.addItem)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [imgIndex, setImgIndex] = useState(0)

  if (!product) return null

  const images = product.images ?? []
  const hasImages = images.length > 0

  function prev() { setImgIndex((i) => (i - 1 + images.length) % images.length) }
  function next() { setImgIndex((i) => (i + 1) % images.length) }

  function handleAdd() {
    if (!selectedSize) { showToast('Please select a size.'); return }
    if (!selectedColor) { showToast('Please select a colour.'); return }
    addItem({
      product_id: product!.id,
      name: product!.name,
      price: product!.price,
      qty: 1,
      size: selectedSize,
      color: selectedColor,
      image_url: images[0] ?? null,
      emoji: product!.emoji,
      bg_color: product!.bg_color,
    })
    showToast(`✓ ${product!.name} added to cart!`)
    onClose()
  }

  const badgeClass = product.badge.toLowerCase().replace(' ', '-')

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Image area */}
        <div className="modal-img" style={{ background: 'white' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden', background: product.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100 }}>
            {hasImages ? (
              <>
                {images.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: i === imgIndex ? 1 : 0, transition: 'opacity 0.2s ease' }}
                  />
                ))}
                {images.length > 1 && (
                  <>
                    <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
                    <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
                    <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 2 }}>
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIndex(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === imgIndex ? 'white' : 'rgba(255,255,255,0.5)', padding: 0 }} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : product.emoji}
          </div>
        </div>

        <div className="modal-info">
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="modal-badge-row">
            <span className={`product-badge ${badgeClass}`}>{product.badge}</span>
            {product.is_new && <span className="product-badge new">New</span>}
            {product.is_bestseller && <span className="product-badge bestseller">Bestseller</span>}
          </div>
          <div className="modal-name">{product.name}</div>
          <div className="modal-price">{fmt(product.price)}</div>
          <div className="modal-stars">
            <span className="stars" style={{ color: '#e8b86d' }}>{stars(product.rating)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>({product.review_count} reviews)</span>
          </div>
          <div className="modal-desc">{product.description}</div>

          <div className="size-label">
            Select Size
            <Link href="/size-guide" className="size-guide-link" onClick={onClose}>Size Guide</Link>
          </div>
          <div className="size-row">
            {product.sizes.map((s) => (
              <button key={s} className={`size-opt${selectedSize === s ? ' selected' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>

          <div className="color-label">Yarn / Colour</div>
          <div className="color-row">
            {product.colors.map((c) => {
              const qty = product.color_stock?.[c]
              const soldOut = qty !== undefined && qty === 0
              return (
                <div key={c} className="color-swatch-wrap">
                  <div
                    className={`color-swatch${selectedColor === c ? ' selected' : ''}${soldOut ? ' sold-out' : ''}`}
                    style={{ background: c }}
                    onClick={() => { if (!soldOut) setSelectedColor(c) }}
                  />
                  {qty !== undefined && (
                    <span className="color-stock-label">
                      {soldOut ? 'sold out' : `${qty} left`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: -12, marginBottom: 16 }}>
            Want a different color? <Link href="/custom" className="size-guide-link" onClick={onClose}>Request a custom order →</Link>
          </p>
          <VariantWhisper />

          {(() => {
            const colorQty = selectedColor ? product.color_stock?.[selectedColor] : undefined
            const qty = colorQty !== undefined ? colorQty : product.stock
            if (qty === 0) return <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>Out of stock{selectedColor ? ' in this colour' : ''}</div>
            if (qty <= 3) return <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>Only {qty} left{selectedColor ? ' in this colour' : ''}!</div>
            return null
          })()}

          <div className="modal-actions">
            <HesitationNudge>
              {(() => {
                const colorQty = selectedColor ? product.color_stock?.[selectedColor] : undefined
                const soldOut = colorQty !== undefined ? colorQty === 0 : product.stock === 0
                return (
                  <button className="btn-primary" onClick={handleAdd} disabled={soldOut}>
                    {soldOut ? 'Sold Out' : '+ Add to Cart'}
                  </button>
                )
              })()}
            </HesitationNudge>
          </div>
        </div>
      </div>
    </div>
  )
}
