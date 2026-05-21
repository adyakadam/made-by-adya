import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (supabaseAdmin) {
    try { await supabaseAdmin.from('subscribers').upsert({ email }).throwOnError() } catch { /* ignore */ }
  }
  return Response.json({ ok: true })
}
