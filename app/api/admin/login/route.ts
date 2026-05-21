import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Incorrect password' }, { status: 401 })
  }
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', `mba_admin=1; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`)
  return res
}
