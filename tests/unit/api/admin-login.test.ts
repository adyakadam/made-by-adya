import { describe, test, expect } from 'vitest'
import { NextRequest } from 'next/server'

import { POST } from '@/app/api/admin/login/route'

function makeReq(password: string) {
  return new NextRequest('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

describe('POST /api/admin/login', () => {
  test('correct password → 200 with Set-Cookie header', async () => {
    const res = await POST(makeReq('testpass123'))
    expect(res.status).toBe(200)
    const cookie = res.headers.get('set-cookie')
    expect(cookie).toContain('mba_admin=1')
  })

  test('cookie is HttpOnly', async () => {
    const res = await POST(makeReq('testpass123'))
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie.toLowerCase()).toContain('httponly')
  })

  test('cookie has 7-day Max-Age (604800 seconds)', async () => {
    const res = await POST(makeReq('testpass123'))
    const cookie = res.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('604800')
  })

  test('wrong password → 401', async () => {
    const res = await POST(makeReq('wrongpassword'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/incorrect/i)
  })

  test('empty password → 401', async () => {
    const res = await POST(makeReq(''))
    expect(res.status).toBe(401)
  })
})
