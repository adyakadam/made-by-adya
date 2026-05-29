import { getProducts } from '@/lib/supabase'
import WishlistClient from './WishlistClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Your saved Made by Adya pieces — revisit the items you love and shop when you\'re ready.',
  openGraph: {
    title: 'Wishlist — Made by Adya',
    description: 'Your saved Made by Adya pieces.',
    url: 'https://made-by-adya-9naj.vercel.app/wishlist',
  },
  robots: { index: false },
}

export default async function WishlistPage() {
  const products = await getProducts()
  return <WishlistClient products={products} />
}
