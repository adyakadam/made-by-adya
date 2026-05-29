import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminGetCustomOrders, saveCustomOrderExtra, getCustomOrderExtras, supabaseAdmin } from '@/lib/supabase'
import {
  sendCustomOrderAccepted,
  sendCustomOrderInProgress,
  sendCustomOrderShipped,
  sendCustomOrderDelivered,
} from '@/lib/email'

async function checkAuth() {
  const store = await cookies()
  return store.get('mba_admin')?.value === '1'
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [orders, extras] = await Promise.all([adminGetCustomOrders(), getCustomOrderExtras()])
  return NextResponse.json({ orders, extras })
}

export async function PATCH(req: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, admin_notes, quote_amount, estimated_time, tracking_number } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = supabaseAdmin()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  // Fetch order before updating for email data
  const orders = await adminGetCustomOrders()
  const order = orders.find((o) => o.id === id)

  if (status) {
    const { error } = await db.from('custom_orders').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Save extras (notes, quote, estimated time, tracking)
  if (admin_notes !== undefined || quote_amount !== undefined || estimated_time !== undefined || tracking_number !== undefined) {
    const extras = await getCustomOrderExtras()
    const existing = extras[id] ?? { admin_notes: '', quote_amount: '' }
    await saveCustomOrderExtra(id, {
      ...existing,
      ...(admin_notes !== undefined && { admin_notes }),
      ...(quote_amount !== undefined && { quote_amount }),
      ...(estimated_time !== undefined && { estimated_time }),
      ...(tracking_number !== undefined && { tracking_number }),
    })
  }

  // Send emails on status transitions
  if (status && order?.email) {
    const extras = await getCustomOrderExtras()
    const extra = extras[id] ?? {}

    if (status === 'accepted') {
      sendCustomOrderAccepted({
        customer_email: order.email,
        customer_name: order.name,
        piece_type: order.piece_type,
        estimated_time: estimated_time ?? extra.estimated_time,
      }).catch((e) => console.error('Custom order accepted email error:', e))
    }

    if (status === 'in_progress') {
      sendCustomOrderInProgress({
        customer_email: order.email,
        customer_name: order.name,
        piece_type: order.piece_type,
      }).catch((e) => console.error('Custom order in-progress email error:', e))
    }

    if (status === 'shipped') {
      sendCustomOrderShipped({
        customer_email: order.email,
        customer_name: order.name,
        piece_type: order.piece_type,
        tracking_number: tracking_number ?? extra.tracking_number,
      }).catch((e) => console.error('Custom order shipped email error:', e))
    }

    if (status === 'delivered') {
      sendCustomOrderDelivered({
        customer_email: order.email,
        customer_name: order.name,
        piece_type: order.piece_type,
      }).catch((e) => console.error('Custom order delivered email error:', e))
    }
  }

  return NextResponse.json({ ok: true })
}
