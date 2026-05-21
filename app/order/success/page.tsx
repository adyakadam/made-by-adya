import Link from 'next/link'
import { getOrderBySessionId } from '@/lib/supabase'
import ClearCart from './ClearCart'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams
  const order = session_id ? await getOrderBySessionId(session_id) : null
  const orderNumber = order?.order_number ?? '#MBA-' + Math.floor(Math.random() * 90000 + 10000)

  return (
    <>
      <ClearCart />
      <div className="confirmation">
        <div className="confirm-icon">🎀</div>
        <h2 className="confirm-title">Order Placed!</h2>
        <p className="confirm-sub">
          Thank you so much for supporting handmade! Your piece is being lovingly prepared and will be shipped soon.
        </p>
        <div className="tracking-box">
          Your order number: <strong>{orderNumber}</strong>
        </div>
        <p className="confirm-sub" style={{ fontSize: 13 }}>
          You'll receive a confirmation email with tracking info. ✨
        </p>
        <Link href="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </>
  )
}
