'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function login() {
    setLoading(true); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    })
    setLoading(false)
    if (res.ok) router.push('/admin/dashboard')
    else setError('Incorrect password. Please try again.')
  }

  return (
    <>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          autoFocus
        />
      </div>
      {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <button className="btn-primary" style={{ width: '100%' }} onClick={login} disabled={loading}>
        {loading ? 'Logging in…' : 'Log In'}
      </button>
    </>
  )
}
