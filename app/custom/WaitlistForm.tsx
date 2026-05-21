'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')

  async function join() {
    if (!email || !email.includes('@')) { showToast('Please enter a valid email.'); return }
    await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email, list: 'waitlist' }), headers: { 'Content-Type': 'application/json' } })
    showToast('✓ You\'re on the list! I\'ll reach out when custom slots open.')
    setEmail('')
  }

  return (
    <div className="waitlist-form">
      <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && join()} />
      <button className="btn-primary btn-sm" onClick={join}>Join</button>
    </div>
  )
}
