import { NextRequest } from 'next/server'
import { addStockNotification } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, product_id, product_name } = await req.json() as { email: string; product_id: string; product_name: string }
    if (!email || !product_id) return Response.json({ error: 'Missing fields' }, { status: 400 })
    await addStockNotification({ email, product_id, product_name })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to save' }, { status: 500 })
  }
}
