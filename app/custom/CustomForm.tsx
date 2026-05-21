'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'

export default function CustomForm() {
  const [form, setForm] = useState({
    name: '', email: '', piece_type: 'Crochet Top', measurements: '',
    color_pref: '', vision: '', budget: '$60–$100',
  })
  const [loading, setLoading] = useState(false)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit() {
    if (!form.name || !form.email || !form.vision) { showToast('Please fill in name, email, and vision.'); return }
    setLoading(true)
    await fetch('/api/custom-order', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    setLoading(false)
    showToast('🌸 Request sent! I\'ll reply within 2 business days.')
    setForm({ name: '', email: '', piece_type: 'Crochet Top', measurements: '', color_pref: '', vision: '', budget: '$60–$100' })
  }

  return (
    <>
      <div className="form-group"><label>Your Name</label><input type="text" placeholder="Emma Johnson" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="form-group"><label>Email</label><input type="email" placeholder="emma@email.com" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
      <div className="form-group">
        <label>Type of Piece</label>
        <select value={form.piece_type} onChange={(e) => set('piece_type', e.target.value)}>
          {['Crochet Top','Crochet Cardigan','Crochet Set','Hand-Sewn Dress','Hand-Sewn Skirt','Hand-Sewn Set','Accessory (Hat, Bag)','Something else...'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group"><label>Your Measurements (optional)</label><input type="text" placeholder="Bust: 36in, Waist: 28in, Hip: 38in" value={form.measurements} onChange={(e) => set('measurements', e.target.value)} /></div>
      <div className="form-group"><label>Color / Yarn / Fabric Preference</label><input type="text" placeholder="e.g. Dusty rose cotton, sage green yarn..." value={form.color_pref} onChange={(e) => set('color_pref', e.target.value)} /></div>
      <div className="form-group"><label>Describe Your Vision</label><textarea rows={4} placeholder="Tell me everything! Silhouette, details, vibe, inspo..." value={form.vision} onChange={(e) => set('vision', e.target.value)} /></div>
      <div className="form-group">
        <label>Budget Range</label>
        <select value={form.budget} onChange={(e) => set('budget', e.target.value)}>
          {['Under $60','$60–$100','$100–$150','$150–$200','$200+'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading}>
        {loading ? 'Sending…' : 'Send Request 🌸'}
      </button>
    </>
  )
}
