import CustomForm from './CustomForm'
import WaitlistForm from './WaitlistForm'
import { getSiteContent, getCustomPhotos } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function CustomPage() {
  const [c, customPhotos] = await Promise.all([getSiteContent(), getCustomPhotos()])
  const photos = customPhotos.filter(Boolean)
  return (
    <>
      <div style={{ padding: '48px 48px 36px', borderBottom: '1px solid var(--warm-sand)' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, marginBottom: 8 }}>{c.custom_heading}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>{c.custom_sub}</p>
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${photos.length}, 1fr)`, gap: 16, padding: '32px 48px', borderBottom: '1px solid var(--warm-sand)' }}>
          {photos.map((url, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/5', position: 'relative' }}>
              <img src={url} alt={`Custom order example ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            </div>
          ))}
        </div>
      )}

      <div className="custom-page">
        <div className="custom-left">
          <p>{c.custom_desc}</p>
          <br />
          <ul className="custom-list">
            {c.custom_list.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <div className="waitlist-section">
            <h3>{c.custom_waitlist_heading}</h3>
            <p>{c.custom_waitlist_desc}</p>
            <WaitlistForm />
          </div>
        </div>
        <div className="custom-form">
          <h2>Request a Custom Piece</h2>
          <CustomForm />
        </div>
      </div>
    </>
  )
}
