import { NextRequest } from 'next/server'
import { getStockNotifications, deleteStockNotificationsByProduct } from '@/lib/supabase'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const notifications = await getStockNotifications()
  return Response.json(notifications)
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { product_name } = await req.json()
  if (!product_name) return Response.json({ error: 'product_name required' }, { status: 400 })
  await deleteStockNotificationsByProduct(product_name)
  return Response.json({ ok: true })
}
