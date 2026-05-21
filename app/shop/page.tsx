import { Suspense } from 'react'
import { getProducts } from '@/lib/supabase'
import { SEED_PRODUCTS } from '@/lib/seed-data'
import ShopClient from './ShopClient'

export default async function ShopPage() {
  let products = SEED_PRODUCTS
  try {
    const db = await getProducts()
    if (db.length > 0) products = db
  } catch {
    // Supabase not yet configured — fall back to seed data
  }

  return (
    <Suspense>
      <ShopClient products={products} />
    </Suspense>
  )
}
