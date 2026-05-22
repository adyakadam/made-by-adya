import { Suspense } from 'react'
import { getProducts } from '@/lib/supabase'
import { SEED_PRODUCTS } from '@/lib/seed-data'
import ShopClient from './ShopClient'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  let products = SEED_PRODUCTS
  try {
    const db = await getProducts()
    if (db.length > 0) products = db
  } catch {
    // fall back to seed
  }

  return (
    <Suspense>
      <ShopClient products={products} />
    </Suspense>
  )
}
