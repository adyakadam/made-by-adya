import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getInstagramTiles, saveInstagramTiles, getHeroImageUrl, saveHeroImageUrl, getSiteContent, saveSiteContent } from '@/lib/supabase'
import type { InstagramTile } from '@/lib/types'
import type { SiteContent } from '@/lib/content'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const [tiles, heroImageUrl, siteContent] = await Promise.all([getInstagramTiles(), getHeroImageUrl(), getSiteContent()])
  return Response.json({ instagram_tiles: tiles, hero_image_url: heroImageUrl, site_content: siteContent })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json() as { instagram_tiles?: InstagramTile[]; hero_image_url?: string; site_content?: SiteContent }
    const saves: Promise<void>[] = []
    if (body.instagram_tiles) saves.push(saveInstagramTiles(body.instagram_tiles))
    if (body.hero_image_url !== undefined) saves.push(saveHeroImageUrl(body.hero_image_url))
    if (body.site_content) saves.push(saveSiteContent(body.site_content))
    await Promise.all(saves)
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to save' }, { status: 500 })
  }
}
