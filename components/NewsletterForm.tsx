'use client'

import { useState } from 'react'
import { showToast } from './Toast'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')

  async function subscribe() {
    if (!email || !email.includes('@')) { showToast('Please enter a valid email.'); return }
    await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } })
    showToast('🎀 You\'re subscribed! Welcome to the Adya Circle.')
    setEmail('')
  }

  return (
    <div className="newsletter-form">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && subscribe()}
      />
      <button className="btn-primary btn-sm" onClick={subscribe}>Subscribe</button>
    </div>
  )
}
