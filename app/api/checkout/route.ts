import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPromoCodes } from '@/lib/supabase'
import type { CartItem, ShippingAddress } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { items, shipping, promoCode } = (await req.json()) as {
    items: CartItem[]
    shipping: ShippingAddress
    promoCode?: string
  }

  if (!items || items.length === 0) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // Validate promo code server-side
  let promoDiscountPct = 0
  let promoProductIds: string[] = []
  let validatedPromo = ''
  let promoFreeShipping = false
  if (promoCode) {
    const promos = await getPromoCodes()
    const match = promos.find((p) => p.code.toUpperCase() === promoCode.toUpperCase() && p.active)
    if (match) {
      promoDiscountPct = match.discount
      promoProductIds = match.product_ids ?? []
      validatedPromo = match.code
      promoFreeShipping = match.free_shipping ?? false
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const lineItems = items.map((item) => {
    const eligible = validatedPromo && (promoProductIds.length === 0 || promoProductIds.includes(item.product_id))
    const discountFactor = eligible ? 1 - promoDiscountPct / 100 : 1
    return {
      quantity: item.qty,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * discountFactor),
        product_data: {
          name: `${item.name} (Size: ${item.size})${eligible ? ` — ${validatedPromo} applied` : ''}`,
          description: `Made by Adya — handcrafted piece`,
          metadata: { product_id: item.product_id, size: item.size, color: item.color },
        },
      },
    }
  })

  const shippingOptions = promoFreeShipping
    ? [
        // Free shipping promo: standard is $0, express options remain paid
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: `Free Shipping`,
            delivery_estimate: {
              minimum: { unit: 'business_day' as const, value: 3 },
              maximum: { unit: 'business_day' as const, value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: 999, currency: 'usd' },
            display_name: 'USPS Priority Mail',
            delivery_estimate: {
              minimum: { unit: 'business_day' as const, value: 1 },
              maximum: { unit: 'business_day' as const, value: 3 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: 2999, currency: 'usd' },
            display_name: 'USPS Priority Mail Express',
            delivery_estimate: {
              minimum: { unit: 'business_day' as const, value: 1 },
              maximum: { unit: 'business_day' as const, value: 1 },
            },
          },
        },
      ]
    : [
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: 599, currency: 'usd' },
            display_name: 'USPS First Class',
            delivery_estimate: {
              minimum: { unit: 'business_day' as const, value: 3 },
              maximum: { unit: 'business_day' as const, value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: 999, currency: 'usd' },
            display_name: 'USPS Priority Mail',
            delivery_estimate: {
              minimum: { unit: 'business_day' as const, value: 1 },
              maximum: { unit: 'business_day' as const, value: 3 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: { amount: 2999, currency: 'usd' },
            display_name: 'USPS Priority Mail Express',
            delivery_estimate: {
              minimum: { unit: 'business_day' as const, value: 1 },
              maximum: { unit: 'business_day' as const, value: 1 },
            },
          },
        },
      ]

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: shipping.email,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      shipping_options: shippingOptions,
      success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: {
        items: JSON.stringify(items.map((i) => ({ product_id: i.product_id, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color, emoji: i.emoji }))),
        shipping: JSON.stringify(shipping),
      },
    })
    return Response.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    console.error('Stripe checkout error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
