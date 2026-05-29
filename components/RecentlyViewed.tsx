'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/types'

const KEY = 'mba_recently_viewed'
const MAX = 6

export function trackView(productId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    const updated = [productId, ...stored.filter((id) => id !== productId)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {}
}

export default function RecentlyViewed({ products }: { products: Product[] }) {
  const [viewed, setViewed] = useState<Product[]>([])

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
      const items = ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => !!p)
      setViewed(items)
    } catch {}
  }, [products])

  if (viewed.length === 0) return null

  return (
    <div className="related-section">
      <h3>Recently Viewed</h3>
      <div className="related-grid">
        {viewed.map((p) => (
          <Link key={p.id} href={`/shop/${p.id}`} className="related-card">
            <div className="related-img" style={{ background: p.bg_color, position: 'relative', overflow: 'hidden' }}>
              {p.images?.[0]
                ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                : p.emoji}
            </div>
            <div className="related-info">
              <div className="related-name">{p.name}</div>
              <div className="related-price">${(p.price / 100).toFixed(0)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
