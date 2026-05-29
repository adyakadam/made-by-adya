import ReviewForm from './ReviewForm'

export const metadata = {
  title: 'Leave a Review',
  robots: { index: false },
}

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <ReviewForm token={token} />
}
