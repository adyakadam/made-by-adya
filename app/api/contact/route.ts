import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json()
  if (!name || !email || !message) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (supabaseAdmin) {
    try { await supabaseAdmin.from('contact_messages').insert({ name, email, message }).throwOnError() } catch { /* ignore */ }
  }
  return Response.json({ ok: true })
}
