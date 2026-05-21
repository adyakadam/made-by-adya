import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const db = supabaseAdmin()
  if (db) {
    try { await db.from('custom_orders').insert({ ...body, status: 'new' }).throwOnError() } catch { /* ignore */ }
  }
  return Response.json({ ok: true })
}
