'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product, ProductCategory, SortOption } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import QuickViewModal from '@/components/QuickViewModal'
import RecentlyViewed from '@/components/RecentlyViewed'


const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Crochet',     value: 'crochet' },
  { label: 'Hand-Sewn',   value: 'sewn' },
  { label: 'Sets',        value: 'sets' },
  { label: 'Accessories', value: 'accessories' },
]

export default function ShopClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<ProductCategory>('all')
  const [sort, setSort]     = useState<SortOption>('default')
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [modal, setModal]   = useState<Product | null>(null)

  const displayed = useMemo(() => {
    let items = [...products]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.includes(q)
      )
    } else if (filter !== 'all') {
      items = items.filter((p) => p.category === filter)
    }
    if (sort === 'price-asc')  items.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') items.sort((a, b) => b.price - a.price)
    if (sort === 'new')        items.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0))
    if (sort === 'rating')     items.sort((a, b) => b.rating - a.rating)
    return items
  }, [products, filter, sort, search])

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>The Collection</h1>
          <p>Handcrafted crochet &amp; hand-sewn pieces, ready to wear</p>
        </div>
        <div className="shop-controls">
          <div className="filter-bar">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={`filter-btn${filter === c.value && !search ? ' active' : ''}`}
                onClick={() => { setFilter(c.value); setSearch('') }}
              >{c.label}</button>
            ))}
          </div>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="new">Newest First</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {search && (
        <div className="search-banner">
          <span>
            {displayed.length > 0
              ? <><strong>{displayed.length}</strong> result{displayed.length !== 1 ? 's' : ''} for &ldquo;<strong>{search}</strong>&rdquo;</>
              : <>No results for &ldquo;<strong>{search}</strong>&rdquo;</>}
          </span>
          <button className="search-clear" onClick={() => setSearch('')}>✕ Clear search</button>
        </div>
      )}

      {displayed.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-light)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-mid)', marginBottom: 10 }}>No pieces found</div>
          <div style={{ fontSize: 14 }}>Try searching for something else, like &ldquo;crochet&rdquo; or &ldquo;dress&rdquo;</div>
        </div>
      ) : (
        <div className="products-grid">
          {displayed.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={setModal} />
          ))}
        </div>
      )}

      {modal && <QuickViewModal product={modal} onClose={() => setModal(null)} />}
      <RecentlyViewed products={products} />
    </>
  )
}
