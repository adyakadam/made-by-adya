import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getPromoCodes, savePromoCodes } from '@/lib/supabase'
import type { PromoCode } from '@/lib/supabase'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  return Response.json(await getPromoCodes())
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const codes = await req.json() as PromoCode[]
    await savePromoCodes(codes)
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
