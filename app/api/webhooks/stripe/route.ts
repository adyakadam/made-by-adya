import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
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
    await handleCheckoutComplete(session)
  }

  return new Response('OK', { status: 200 })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (!supabaseAdmin) {
    console.error('supabaseAdmin not configured — cannot save order')
    return
  }

  const meta = session.metadata ?? {}
  const items = JSON.parse(meta.items ?? '[]')
  const shipping = JSON.parse(meta.shipping ?? '{}')
  const giftWrap = meta.gift_wrap === 'true'

  const subtotal = session.amount_subtotal ?? 0
  const tax = session.total_details?.amount_tax ?? 0
  const total = session.amount_total ?? 0

  const orderNumber = `#MBA-${Date.now().toString().slice(-5)}`

  const { error } = await supabaseAdmin.from('orders').insert({
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string | null,
    customer_email: session.customer_email ?? shipping.email,
    customer_name: `${shipping.first_name ?? ''} ${shipping.last_name ?? ''}`.trim(),
    shipping_address: shipping,
    items,
    subtotal,
    tax,
    total,
    gift_wrap: giftWrap,
    status: 'paid',
    order_number: orderNumber,
  })

  if (error) {
    console.error('Failed to save order to Supabase:', error)
    return
  }

  // Decrement stock for each product
  for (const item of items) {
    await supabaseAdmin.rpc('decrement_stock', { product_id: item.product_id, qty: item.qty })
  }
}
