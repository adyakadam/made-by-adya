import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabaseAdmin()
  if (!db) return Response.json({ error: 'Storage not configured' }, { status: 500 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  // Create bucket if it doesn't exist yet
  await db.storage.createBucket('media', { public: true }).catch(() => null)

  const bytes = await file.arrayBuffer()
  const { error } = await db.storage.from('media').upload(filename, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = db.storage.from('media').getPublicUrl(filename)
  return Response.json({ url: publicUrl })
}
