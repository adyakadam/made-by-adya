import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getInstagramTiles, saveInstagramTiles, getHeroImageUrl, saveHeroImageUrl } from '@/lib/supabase'
import type { InstagramTile } from '@/lib/types'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const [tiles, heroImageUrl] = await Promise.all([getInstagramTiles(), getHeroImageUrl()])
  return Response.json({ instagram_tiles: tiles, hero_image_url: heroImageUrl })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json() as { instagram_tiles?: InstagramTile[]; hero_image_url?: string }
    const saves: Promise<void>[] = []
    if (body.instagram_tiles) saves.push(saveInstagramTiles(body.instagram_tiles))
    if (body.hero_image_url !== undefined) saves.push(saveHeroImageUrl(body.hero_image_url))
    await Promise.all(saves)
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to save' }, { status: 500 })
  }
}
