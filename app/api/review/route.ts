import { NextRequest } from 'next/server'
import { getReviewToken, markReviewTokenUsed, supabaseAdmin } from '@/lib/supabase'

// GET /api/review?token=xxx — validate token and return order info
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return Response.json({ error: 'Missing token' }, { status: 400 })

  const data = await getReviewToken(token)
  if (!data) return Response.json({ error: 'Invalid or expired link' }, { status: 404 })
  if (data.used) return Response.json({ error: 'This review link has already been used' }, { status: 410 })

  return Response.json({
    order_number: data.order_number,
    customer_name: data.customer_name,
    items: data.items ?? [],
  })
}

// POST /api/review — submit a review
export async function POST(req: NextRequest) {
  const { token, reviewer_name, rating, body, product_id, product_name } = await req.json()
  if (!token || !reviewer_name || !rating || !body) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const tokenData = await getReviewToken(token)
  if (!tokenData) return Response.json({ error: 'Invalid or expired link' }, { status: 404 })
  if (tokenData.used) return Response.json({ error: 'This review link has already been used' }, { status: 410 })

  const db = supabaseAdmin()
  if (!db) return Response.json({ error: 'Server error' }, { status: 500 })

  const { error } = await db.from('reviews').insert({
    reviewer_name: reviewer_name.trim(),
    avatar_letter: reviewer_name.trim()[0]?.toUpperCase() ?? '?',
    rating: Number(rating),
    body: body.trim(),
    product_id: product_id ?? null,
    product_name: product_name ?? 'Verified Purchase',
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await markReviewTokenUsed(token)

  return Response.json({ ok: true })
}
