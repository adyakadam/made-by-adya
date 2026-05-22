import { NextRequest } from 'next/server'
import { getPromoCodes } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
  if (!code) return Response.json({ valid: false })
  const promos = await getPromoCodes()
  const match = promos.find((p) => p.code.toUpperCase() === code && p.active)
  if (!match) return Response.json({ valid: false })
  return Response.json({ valid: true, discount: match.discount, label: match.label })
}
