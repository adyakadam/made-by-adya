import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder', {
  apiVersion: '2026-04-22.dahlia',
})

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function dollarsToStripe(cents: number): number {
  return cents // already in cents
}
