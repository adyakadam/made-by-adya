import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getInstagramTiles, saveInstagramTiles } from '@/lib/supabase'
import type { InstagramTile } from '@/lib/types'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const tiles = await getInstagramTiles()
  return Response.json({ instagram_tiles: tiles })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { instagram_tiles } = await req.json() as { instagram_tiles: InstagramTile[] }
    await saveInstagramTiles(instagram_tiles)
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to save' }, { status: 500 })
  }
}
