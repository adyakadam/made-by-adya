'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'

export default function ContactForm() {
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!name || !email || !message) { showToast('Please fill in all fields.'); return }
    setLoading(true)
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message }),
      headers: { 'Content-Type': 'application/json' },
    })
    setLoading(false)
    showToast('💌 Message sent! I\'ll get back to you soon.')
    setName(''); setEmail(''); setMessage('')
  }

  return (
    <>
      <div className="form-group"><label>Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
      <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" /></div>
      <div className="form-group"><label>Message</label><textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Questions, feedback, or just say hi!" /></div>
      <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? 'Sending…' : 'Send Message 💌'}</button>
    </>
  )
}
