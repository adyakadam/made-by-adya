import { Suspense } from 'react'
import { getProducts, getReviews } from '@/lib/supabase'
import ReviewCard from '@/components/ReviewCard'
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

  const reviews = await getReviews(6)

  return (
    <>
      <Suspense>
        <ShopClient products={products} />
      </Suspense>

      {reviews.length > 0 && (
        <div className="reviews-section">
          <h3>What customers are saying</h3>
          <div className="review-cards">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>
      )}
    </>
  )
}
