import { NextRequest } from 'next/server'
import { adminGetAllOrders, adminUpdateOrderStatus, adminGetOrderById } from '@/lib/supabase'
import { sendShippingNotification, sendDeliveryNotification } from '@/lib/email'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await adminGetAllOrders()
  return Response.json(orders)
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, tracking_number } = await req.json()

  // Fetch the order before updating so we have customer details for emails
  const order = (status === 'shipped' || status === 'delivered') ? await adminGetOrderById(id) : null

  await adminUpdateOrderStatus(id, status, tracking_number)

  // Send shipping notification when status flips to "shipped"
  if (status === 'shipped' && order?.customer_email) {
    await sendShippingNotification({
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      order_number: order.order_number,
      tracking_number: tracking_number ?? order.tracking_number,
    }).catch((err) => console.error('Shipping notification email error:', err))
  }

  // Send delivery + review request when status flips to "delivered"
  if (status === 'delivered' && order?.customer_email) {
    await sendDeliveryNotification({
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      order_number: order.order_number,
      items: order.items?.map((i) => ({ product_id: i.product_id, name: i.name })) ?? [],
    }).catch((err) => console.error('Delivery notification email error:', err))
  }

  return Response.json({ ok: true })
}
