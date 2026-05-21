import { NextRequest } from 'next/server'
import { adminGetAllOrders, adminUpdateOrderStatus } from '@/lib/supabase'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await adminGetAllOrders()
  return Response.json(orders)
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, tracking_number } = await req.json()
  await adminUpdateOrderStatus(id, status, tracking_number)
  return Response.json({ ok: true })
}
