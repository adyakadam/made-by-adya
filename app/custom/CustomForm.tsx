'use client'

import { useRef, useState } from 'react'
import { showToast } from '@/components/Toast'

const BLANK = {
  name: '', email: '', piece_type: 'Crochet Top', measurements: '',
  color_pref: '', vision: '', budget: '$60–$100',
}

interface RefPhoto { file: File; preview: string; url?: string; uploading: boolean; error?: string }

export default function CustomForm() {
  const [form, setForm] = useState(BLANK)
  const [photos, setPhotos] = useState<RefPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload-ref', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      return data.url as string
    } catch {
      return null
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const incoming = Array.from(files).slice(0, 5 - photos.length)
    if (incoming.length === 0) return

    const newPhotos: RefPhoto[] = incoming.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      uploading: true,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])

    for (let i = 0; i < incoming.length; i++) {
      const url = await uploadPhoto(incoming[i])
      setPhotos((prev) =>
        prev.map((p) =>
          p.file === incoming[i]
            ? { ...p, uploading: false, url: url ?? undefined, error: url ? undefined : 'Upload failed' }
            : p
        )
      )
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].preview)
      next.splice(idx, 1)
      return next
    })
  }

  async function submit() {
    if (!form.name || !form.email || !form.vision) {
      showToast('Please fill in name, email, and vision.')
      return
    }
    if (photos.some((p) => p.uploading)) {
      showToast('Photos are still uploading — please wait a moment.')
      return
    }

    setLoading(true)
    const reference_images = photos.filter((p) => p.url).map((p) => p.url!)
    await fetch('/api/custom-order', {
      method: 'POST',
      body: JSON.stringify({ ...form, reference_images }),
      headers: { 'Content-Type': 'application/json' },
    })
    setLoading(false)
    showToast('🌸 Request sent! I\'ll reply within 2 business days.')
    setForm(BLANK)
    photos.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
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

      {/* Reference photos */}
      <div className="form-group">
        <label>
          Reference Photos <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-light)' }}>(optional · up to 5 images)</span>
        </label>

        {/* Drop zone */}
        <div
          className="ref-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
          onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleFiles(e.dataTransfer.files) }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="ref-dropzone-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8, color: 'var(--accent)' }}>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>
              {photos.length === 0 ? 'Click or drag photos here' : photos.length < 5 ? `Add more (${photos.length}/5)` : '5 photos max'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>JPG, PNG, WEBP · max 10 MB each</span>
          </div>
        </div>

        {/* Previews */}
        {photos.length > 0 && (
          <div className="ref-previews">
            {photos.map((p, i) => (
              <div key={i} className="ref-preview">
                <img src={p.preview} alt={`Reference ${i + 1}`} />
                {p.uploading && (
                  <div className="ref-preview-overlay">
                    <span className="ref-spinner" />
                  </div>
                )}
                {p.error && (
                  <div className="ref-preview-overlay ref-preview-error">
                    <span style={{ fontSize: 10, color: 'white', textAlign: 'center', padding: 4 }}>Failed</span>
                  </div>
                )}
                {!p.uploading && (
                  <button className="ref-preview-remove" onClick={() => removePhoto(i)}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Budget Range</label>
        <select value={form.budget} onChange={(e) => set('budget', e.target.value)}>
          {['Under $60','$60–$100','$100–$150','$150–$200','$200+'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <button className="btn-primary" style={{ width: '100%' }} onClick={submit} disabled={loading || photos.some((p) => p.uploading)}>
        {loading ? 'Sending…' : photos.some((p) => p.uploading) ? 'Uploading photos…' : 'Send Request 🌸'}
      </button>
    </>
  )
}
