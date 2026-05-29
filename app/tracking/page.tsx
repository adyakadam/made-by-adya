import TrackingForm from './TrackingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Order',
  description:
    'Track the status of your Made by Adya order. Enter your order number to check shipping status and get updates.',
  openGraph: {
    title: 'Track Your Order — Made by Adya',
    description:
      'Enter your order number to check shipping status and get updates.',
    url: 'https://made-by-adya-9naj.vercel.app/tracking',
  },
  robots: { index: false },
}

export default function TrackingPage() {
  return (
    <div className="tracking-page">
      <h1>Track Your Order</h1>
      <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 36 }}>
        Enter your order number to see its status. Your order number was emailed to you at checkout.
      </p>
      <TrackingForm />
    </div>
  )
}
