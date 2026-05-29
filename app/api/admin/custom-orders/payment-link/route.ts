import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { adminGetCustomOrders, getCustomOrderExtras, saveCustomOrderExtra } from '@/lib/supabase'
import { sendCustomOrderPaymentRequest } from '@/lib/email'

async function checkAuth() {
  const store = await cookies()
  return store.get('mba_admin')?.value === '1'
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, quote_amount, payment_type } = await req.json() as {
    id: string
    quote_amount: string
    payment_type: 'full' | 'deposit'
  }

  if (!id || !quote_amount) {
    return NextResponse.json({ error: 'Missing id or quote_amount' }, { status: 400 })
  }

  // Find the custom order
  const orders = await adminGetCustomOrders()
  const order = orders.find((o) => o.id === id)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Parse quote amount (stored as string like "120" or "120.00")
  const quoteCents = Math.round(parseFloat(quote_amount) * 100)
  if (isNaN(quoteCents) || quoteCents <= 0) {
    return NextResponse.json({ error: 'Invalid quote amount' }, { status: 400 })
  }

  const amountCents = payment_type === 'deposit' ? Math.round(quoteCents * 0.5) : quoteCents
  const label = payment_type === 'deposit'
    ? `Custom ${order.piece_type} — 50% Deposit`
    : `Custom ${order.piece_type} — Full Payment`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: order.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: label,
              description: `Handcrafted by Adya — ${order.vision?.slice(0, 100) ?? ''}`,
            },
          },
        },
      ],
      metadata: {
        type: 'custom_order',
        custom_order_id: id,
        payment_type,
      },
      success_url: `${siteUrl}/order/success?custom=1`,
      cancel_url: `${siteUrl}/custom`,
    })

    const paymentLink = session.url!

    // Save link + type to extras
    const extras = await getCustomOrderExtras()
    const existing = extras[id] ?? { admin_notes: '', quote_amount }
    await saveCustomOrderExtra(id, {
      ...existing,
      quote_amount,
      payment_link: paymentLink,
      payment_type,
    })

    // Email the customer
    await sendCustomOrderPaymentRequest({
      customer_email: order.email,
      customer_name: order.name,
      piece_type: order.piece_type,
      amount: amountCents,
      payment_type,
      payment_link: paymentLink,
    }).catch((e) => console.error('Payment request email error:', e))

    return NextResponse.json({ url: paymentLink })
  } catch (err) {
    console.error('Stripe payment link error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Stripe error' }, { status: 500 })
  }
}
