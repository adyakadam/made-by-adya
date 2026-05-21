import { NextRequest } from 'next/server'
import { getOrderByNumber } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const num = req.nextUrl.searchParams.get('num') ?? ''
  if (!num) return Response.json({ error: 'Missing order number' }, { status: 400 })

  const order = await getOrderByNumber(num.replace('#', '').trim())
  if (!order) return Response.json({ order: null })
  return Response.json({ order })
}
