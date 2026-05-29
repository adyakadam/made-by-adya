import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, decrementColorStock } from '@/lib/supabase'
import { sendOrderConfirmation, sendCustomOrderPaymentConfirmation, sendAdminCustomOrderPaid, sendAdminNewOrder } from '@/lib/email'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.metadata?.type === 'custom_order') {
      await handleCustomOrderPayment(session)
    } else {
      await handleCheckoutComplete(session)
    }
  }

  return new Response('OK', { status: 200 })
}

async function handleCustomOrderPayment(session: Stripe.Checkout.Session) {
  const db = supabaseAdmin()
  if (!db) { console.error('supabaseAdmin not configured'); return }

  const meta = session.metadata ?? {}
  const customOrderId = meta.custom_order_id
  const paymentType = (meta.payment_type ?? 'full') as 'full' | 'deposit'
  const amountPaid = session.amount_total ?? 0

  if (!customOrderId) { console.error('No custom_order_id in metadata'); return }

  // Update custom order status to 'paid'
  const { error } = await db.from('custom_orders').update({ status: 'paid' }).eq('id', customOrderId)
  if (error) { console.error('Failed to update custom order status:', error); return }

  // Fetch order details for emails
  const { data: orderData } = await db.from('custom_orders').select('*').eq('id', customOrderId).single()
  if (!orderData) return

  // Email customer confirmation
  sendCustomOrderPaymentConfirmation({
    customer_email: orderData.email,
    customer_name: orderData.name,
    piece_type: orderData.piece_type,
    amount_paid: amountPaid,
    payment_type: paymentType,
  }).catch((e) => console.error('Custom order payment confirmation email error:', e))

  // Email admin notification
  sendAdminCustomOrderPaid({
    customer_name: orderData.name,
    customer_email: orderData.email,
    piece_type: orderData.piece_type,
    amount_paid: amountPaid,
    order_id: customOrderId,
  }).catch((e) => console.error('Admin custom order paid email error:', e))
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const db = supabaseAdmin()
  if (!db) {
    console.error('supabaseAdmin not configured — cannot save order')
    return
  }

  const meta = session.metadata ?? {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let shipping: any = {}
  try { items = JSON.parse(meta.items ?? '[]') } catch { console.error('Failed to parse items metadata') }
  try { shipping = JSON.parse(meta.shipping ?? '{}') } catch { console.error('Failed to parse shipping metadata') }

  const subtotal = session.amount_subtotal ?? 0
  const tax = session.total_details?.amount_tax ?? 0
  const total = session.amount_total ?? 0

  const orderNumber = `#MBA-${Date.now().toString().slice(-5)}`

  const { error } = await db.from('orders').insert({
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string | null,
    customer_email: session.customer_email ?? shipping.email,
    customer_name: `${shipping.first_name ?? ''} ${shipping.last_name ?? ''}`.trim(),
    shipping_address: shipping,
    items,
    subtotal,
    tax,
    total,
    status: 'paid',
    order_number: orderNumber,
  })

  if (error) {
    console.error('Failed to save order to Supabase:', error)
    return
  }

  for (const item of items) {
    // Decrement overall product stock
    const { error: rpcError } = await db.rpc('decrement_stock', { product_id: item.product_id, qty: item.qty })
    if (rpcError) console.error('decrement_stock RPC error:', rpcError)
    // Decrement per-color stock if a color was selected
    if (item.color) {
      await decrementColorStock(item.product_id, item.color, item.qty)
    }
  }

  // Notify admin of new order
  sendAdminNewOrder({
    order_number: orderNumber,
    customer_name: `${shipping.first_name ?? ''} ${shipping.last_name ?? ''}`.trim(),
    customer_email: session.customer_email ?? shipping.email,
    total,
    items,
  }).catch((err) => console.error('Admin new order email error:', err))

  // Send order confirmation email (non-blocking — don't let email failure break webhook)
  const customerEmail = session.customer_email ?? shipping.email
  if (customerEmail) {
    await sendOrderConfirmation({
      customer_email: customerEmail,
      customer_name: `${shipping.first_name ?? ''} ${shipping.last_name ?? ''}`.trim(),
      order_number: orderNumber,
      items,
      subtotal,
      tax,
      total,
      shipping_address: shipping,
    }).catch((err) => console.error('Order confirmation email error:', err))
  }
}
