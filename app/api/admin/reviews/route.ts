import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import type { Review } from '@/lib/types'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  if (!db) return Response.json({ error: 'Service role key not configured' }, { status: 500 })
  const { data, error } = await db.from('reviews').select('*').order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  if (!db) return Response.json({ error: 'Service role key not configured' }, { status: 500 })
  try {
    const review = await req.json() as Partial<Review>
    const { data, error } = await db.from('reviews').upsert(review).select().single()
    if (error) throw error
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  if (!db) return Response.json({ error: 'Service role key not configured' }, { status: 500 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await db.from('reviews').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
