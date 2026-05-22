'use client'

import type { Product } from '@/lib/types'
import CustomBadge from './CustomBadge'

interface Props {
  product: Product
  onOpen: (product: Product) => void
  showCustomBadge?: boolean
}

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => (i < Math.round(n) ? '★' : '☆')).join('')
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

export default function ProductCard({ product, onOpen, showCustomBadge }: Props) {
  return (
    <div className="product-card" data-id={product.id} onClick={() => onOpen(product)}>
      <div className="product-img" style={{ background: product.bg_color }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', position: 'absolute', inset: 0 }} />
          : product.emoji}
        {product.images?.length > 1 && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: 10, borderRadius: 20, padding: '2px 7px', zIndex: 2 }}>
            1/{product.images.length}
          </div>
        )}
        {showCustomBadge && <CustomBadge />}
        <div className="product-badges">
          <span className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>{product.badge}</span>
          {product.is_new && <span className="product-badge new">New</span>}
          {product.is_bestseller && <span className="product-badge bestseller">Bestseller</span>}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="product-badge low">Only {product.stock} left</span>
          )}
        </div>
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-desc">{product.description}</div>
        <div className="star-row">
          <span className="stars">{stars(product.rating)}</span>
          <span className="star-count">({product.review_count})</span>
        </div>
        {product.stock === 0 ? (
          <div className="stock-indicator">Out of stock</div>
        ) : product.stock <= 3 ? (
          <div className="stock-indicator">Only {product.stock} left!</div>
        ) : (
          <div className="stock-indicator stock-ok">In stock</div>
        )}
        <div className="product-footer">
          <span className="product-price">{fmt(product.price)}</span>
          <button
            className="add-to-cart"
            disabled={product.stock === 0}
            onClick={(e) => { e.stopPropagation(); onOpen(product) }}
          >
            {product.stock === 0 ? 'Sold Out' : 'Quick View'}
          </button>
        </div>
      </div>
    </div>
  )
}
