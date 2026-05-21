'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { useCart } from '@/lib/cart-store'
import { showToast } from './Toast'

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

  if (!product) return null

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
      image_url: product!.image_url ?? null,
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
        <div className="modal-img" style={{ background: product.bg_color, position: 'relative', overflow: 'hidden' }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            : product.emoji}
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
              <button
                key={s}
                className={`size-opt${selectedSize === s ? ' selected' : ''}`}
                onClick={() => setSelectedSize(s)}
              >{s}</button>
            ))}
          </div>

          <div className="color-label">Yarn / Colour</div>
          <div className="color-row">
            {product.colors.map((c) => (
              <div
                key={c}
                className={`color-swatch${selectedColor === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>

          {product.stock === 0 ? (
            <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>Out of stock</div>
          ) : product.stock <= 3 ? (
            <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>Only {product.stock} left!</div>
          ) : null}

          <div className="modal-actions">
            <button
              className="btn-primary"
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
