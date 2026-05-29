import type { Review } from '@/lib/types'

function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => (i < Math.round(n) ? '★' : '☆')).join('')
}

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-avatar">{review.avatar_letter}</div>
        <div>
          <div className="review-name">{review.reviewer_name}</div>
          <div className="review-date">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>
      <div className="review-stars">{stars(review.rating)}</div>
      <div className="review-text">{review.body}</div>
      <div className="review-product">{review.product_name}</div>
    </div>
  )
}
