import { NextRequest } from 'next/server'
import { addNewsletterSubscriber } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email' }, { status: 400 })
    }
    await addNewsletterSubscriber(email.trim().toLowerCase())
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
