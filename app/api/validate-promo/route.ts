import { NextRequest } from 'next/server'
import { getPromoCodes, savePromoCodes } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
  if (!code) return Response.json({ valid: false })

  const promos = await getPromoCodes()
  const idx = promos.findIndex((p) => p.code.toUpperCase() === code && p.active)
  if (idx === -1) return Response.json({ valid: false })

  const match = promos[idx]

  // Check expiry
  if (match.expires_at && new Date(match.expires_at) < new Date()) {
    return Response.json({ valid: false, reason: 'expired' })
  }

  // Check usage limit
  const useCount = match.use_count ?? 0
  if (match.max_uses != null && useCount >= match.max_uses) {
    return Response.json({ valid: false, reason: 'limit_reached' })
  }

  // Increment use_count and persist (fire-and-forget — don't block the response)
  const updated = promos.map((p, i) =>
    i === idx ? { ...p, use_count: useCount + 1 } : p
  )
  savePromoCodes(updated).catch((err) => console.error('Failed to increment promo use_count:', err))

  return Response.json({
    valid: true,
    discount: match.discount,
    label: match.label,
    product_ids: match.product_ids ?? [],
    free_shipping: match.free_shipping ?? false,
  })
}
