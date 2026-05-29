import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: 'Only image files are allowed' }, { status: 400 })
    if (file.size > MAX_SIZE) return Response.json({ error: 'File too large (max 10 MB)' }, { status: 400 })

    const safeName = `ref-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const blob = await put(safeName, file, { access: 'public' })
    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
