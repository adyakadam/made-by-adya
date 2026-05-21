import TrackingForm from './TrackingForm'

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
