import { NextRequest } from 'next/server'
import { supabaseAdmin, getCustomOrderExtras, saveCustomOrderExtra } from '@/lib/supabase'
import { sendAdminNewCustomOrder } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { reference_images, ...orderFields } = body

  const db = supabaseAdmin()
  if (db) {
    try {
      const { data } = await db
        .from('custom_orders')
        .insert({ ...orderFields, status: 'new' })
        .select('id')
        .single()

      if (data?.id && Array.isArray(reference_images) && reference_images.length > 0) {
        const extras = await getCustomOrderExtras()
        const existing = extras[data.id] ?? { admin_notes: '', quote_amount: '' }
        await saveCustomOrderExtra(data.id, { ...existing, reference_images })
      }
    } catch { /* ignore */ }

    // Notify admin of new custom order request
    sendAdminNewCustomOrder({
      customer_name: orderFields.name,
      customer_email: orderFields.email,
      piece_type: orderFields.piece_type,
      budget: orderFields.budget,
      vision: orderFields.vision,
    }).catch((e) => console.error('Admin new custom order email error:', e))
  }
  return Response.json({ ok: true })
}
