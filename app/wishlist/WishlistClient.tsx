'use client'

import Link from 'next/link'
import { useWishlist } from '@/lib/wishlist-store'
import type { Product } from '@/lib/types'
import WishlistButton from '@/components/WishlistButton'
import { HeartIcon } from '@/components/icons'

function fmt(cents: number) { return `$${(cents / 100).toFixed(0)}` }

export default function WishlistClient({ products }: { products: Product[] }) {
  const ids = useWishlist((s) => s.ids)
  const saved = products.filter((p) => ids.includes(p.id))

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Wishlist</h1>
          <p>{saved.length === 0 ? 'No saved pieces yet' : `${saved.length} saved piece${saved.length !== 1 ? 's' : ''}`}</p>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="empty-cart" style={{ padding: '80px 48px' }}>
          <div style={{ marginBottom: 20, color: 'var(--warm-sand)' }}><HeartIcon size={56} /></div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 28 }}>Nothing saved yet</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>Heart a piece in the shop to save it here.</p>
          <Link href="/shop" className="btn-primary">Browse the Collection</Link>
        </div>
      ) : (
        <div className="products-grid" style={{ padding: '0 48px 64px' }}>
          {saved.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="product-img" style={{ background: p.bg_color }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', position: 'absolute', inset: 0 }} />
                  : p.emoji}
                <div className="product-badges">
                  <span className={`product-badge ${p.badge.toLowerCase().replace(' ', '-')}`}>{p.badge}</span>
                  {p.is_new && <span className="product-badge new">New</span>}
                </div>
                <WishlistButton productId={p.id} productName={p.name} className="wishlist-btn-card" />
              </div>
              <div className="product-info">
                <div className="product-name-link">{p.name}</div>
                <div className="product-desc">{p.description}</div>
                <div className="product-footer">
                  <span className="product-price">{fmt(p.price)}</span>
                  <span style={{ fontSize: 12, color: p.stock === 0 ? '#c0392b' : 'var(--text-light)' }}>
                    {p.stock === 0 ? 'Sold out' : 'In stock'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
