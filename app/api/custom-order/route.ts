import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (supabaseAdmin) {
    try { await supabaseAdmin.from('custom_orders').insert({ ...body, status: 'new' }).throwOnError() } catch { /* ignore */ }
  }
  return Response.json({ ok: true })
}
