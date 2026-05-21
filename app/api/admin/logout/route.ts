export async function POST() {
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', 'mba_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict')
  return res
}
