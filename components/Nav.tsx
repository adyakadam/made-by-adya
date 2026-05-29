'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import { useWishlist } from '@/lib/wishlist-store'
import { useState, useEffect } from 'react'
import { CartIcon, HeartIcon } from './icons'

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/shop',      label: 'Shop' },
  { href: '/about',     label: 'About' },
  { href: '/custom',    label: 'Custom Orders' },
  { href: '/faq',       label: 'FAQ' },
  { href: '/tracking',  label: 'Track Order' },
  { href: '/policies',  label: 'Policies' },
  { href: '/size-guide',label: 'Size Guide' },
]

export default function Nav({ announceBar }: { announceBar?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const count = useCart((s) => s.getCount())
  const wishCount = useWishlist((s) => s.count())
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <a
        href="https://www.instagram.com/madebyadya"
        target="_blank"
        rel="noopener noreferrer"
        className="announce-bar"
        style={{ display: 'block', textDecoration: 'none', cursor: 'pointer' }}
      >
        {announceBar ?? '🎀 Limited drops — follow @madebyadya on Instagram for batch announcements · Ships via USPS'}
      </a>
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
            <Link href="/wishlist" className="nav-icon-btn" aria-label="Wishlist">
              <HeartIcon size={22} />
              {wishCount > 0 && <span className="cart-count">{wishCount}</span>}
            </Link>
            <Link href="/cart" className="nav-icon-btn" aria-label="Cart">
              <CartIcon size={22} />
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
            {/* Hamburger — mobile only */}
            <button
              className="hamburger-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                /* X icon */
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={isActive(href) ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu overlay backdrop */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-logo">made by <em>adya</em></span>
          <button
            className="mobile-menu-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-menu-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`mobile-menu-link${isActive(href) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <Link href="/wishlist" className="mobile-menu-icon-row" onClick={() => setMenuOpen(false)}>
            <HeartIcon size={18} />
            Wishlist {wishCount > 0 && <span className="mobile-menu-badge">{wishCount}</span>}
          </Link>
          <Link href="/cart" className="mobile-menu-icon-row" onClick={() => setMenuOpen(false)}>
            <CartIcon size={18} />
            Cart {count > 0 && <span className="mobile-menu-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </>
  )
}
