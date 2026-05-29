'use client'

import { useWishlist } from '@/lib/wishlist-store'
import { showToast } from './Toast'
import { HeartIcon } from './icons'

interface Props {
  productId: string
  productName: string
  size?: 'sm' | 'lg'
  className?: string
}

export default function WishlistButton({ productId, productName, size = 'sm', className }: Props) {
  const toggle = useWishlist((s) => s.toggle)
  const has = useWishlist((s) => s.has)
  const saved = has(productId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
    showToast(saved ? `Removed from wishlist` : `${productName} saved to wishlist!`)
  }

  const px = size === 'lg' ? 20 : 16

  return (
    <button
      onClick={handleClick}
      className={`wishlist-btn${saved ? ' saved' : ''}${className ? ` ${className}` : ''}`}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <HeartIcon size={px} filled={saved} />
    </button>
  )
}
