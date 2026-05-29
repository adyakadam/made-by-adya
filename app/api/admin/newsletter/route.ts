import { cookies } from 'next/headers'
import { getNewsletterSubscribers } from '@/lib/supabase'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const subscribers = await getNewsletterSubscribers()
  return Response.json(subscribers)
}
