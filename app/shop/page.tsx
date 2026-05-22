import { Suspense } from 'react'
import { getProducts, getReviews } from '@/lib/supabase'
import ReviewCard from '@/components/ReviewCard'
import { SEED_PRODUCTS, SEED_REVIEWS } from '@/lib/seed-data'
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

  const fetchedReviews = await getReviews(6)
  const reviews = fetchedReviews.length > 0 ? fetchedReviews : SEED_REVIEWS.slice(0, 3)

  return (
    <>
      <Suspense>
        <ShopClient products={products} />
      </Suspense>

      <div className="reviews-section">
        <h3>What customers are saying</h3>
        <div className="review-cards">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      </div>
    </>
  )
}
