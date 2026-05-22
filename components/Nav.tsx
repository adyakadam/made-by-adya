'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import { useState } from 'react'

export default function Nav({ announceBar }: { announceBar?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const count = useCart((s) => s.getCount())
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <div className="announce-bar">
        {announceBar ?? '🎀 Limited drops — follow @madebyadya on Instagram for batch announcements · Ships via USPS'}
      </div>
      <nav>
        <div className="nav-top">
          <Link href="/" className="nav-logo">
            made by <span>adya</span>
          </Link>
          <div className="nav-right">
            <form className="nav-search" onSubmit={handleSearch}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search pieces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <Link href="/cart" className="cart-btn">
              🧺 Cart <span className="cart-count">{count}</span>
            </Link>
          </div>
        </div>
        <div className="nav-links">
          <Link href="/"            className={isActive('/')            ? 'active' : ''}>Home</Link>
          <Link href="/shop"        className={isActive('/shop')        ? 'active' : ''}>Shop</Link>
          <Link href="/about"       className={isActive('/about')       ? 'active' : ''}>About</Link>
          <Link href="/custom"      className={isActive('/custom')      ? 'active' : ''}>Custom Orders</Link>
          <Link href="/cart"        className={isActive('/cart')        ? 'active' : ''}>Cart</Link>
          <Link href="/faq"         className={isActive('/faq')         ? 'active' : ''}>FAQ</Link>
          <Link href="/tracking"    className={isActive('/tracking')    ? 'active' : ''}>Track Order</Link>
          <Link href="/policies"    className={isActive('/policies')    ? 'active' : ''}>Policies</Link>
        </div>
      </nav>
    </>
  )
}
