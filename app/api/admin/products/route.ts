import { NextRequest } from 'next/server'
import { adminGetAllProducts, adminUpsertProduct } from '@/lib/supabase'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const jar = await cookies()
  return jar.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await adminGetAllProducts()
  return Response.json(products)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const product = await adminUpsertProduct(body)
    return Response.json(product)
  } catch (err) {
    console.error('Save product error:', err)
    return Response.json({ error: err instanceof Error ? err.message : 'Failed to save product' }, { status: 500 })
  }
}
