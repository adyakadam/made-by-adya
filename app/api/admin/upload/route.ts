import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { put } from '@vercel/blob'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  try {
    const blob = await put(file.name, file, { access: 'public' })
    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
