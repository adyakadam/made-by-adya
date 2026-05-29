import CustomForm from './CustomForm'
import WaitlistForm from './WaitlistForm'
import { getSiteContent, getCustomPhotos } from '@/lib/supabase'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Custom Orders',
  description:
    'Request a one-of-a-kind custom piece from Made by Adya — crochet tops, cardigans, sets, hand-sewn dresses, and more, made exactly to your vision and measurements.',
  openGraph: {
    title: 'Custom Orders — Made by Adya',
    description:
      'Request a custom crochet or sewn piece made exactly to your vision and measurements.',
    url: 'https://made-by-adya-9naj.vercel.app/custom',
  },
}

export default async function CustomPage() {
  const [c, customPhotos] = await Promise.all([getSiteContent(), getCustomPhotos()])
  const photos = customPhotos.filter((p) => p.url)
  return (
    <>
      <div style={{ padding: '48px 48px 36px', borderBottom: '1px solid var(--warm-sand)' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, marginBottom: 8 }}>{c.custom_heading}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>{c.custom_sub}</p>
      </div>

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

      {photos.length > 0 && (
        <div className="custom-gallery">
          <h2>Past Custom Orders</h2>
          <div className="custom-gallery-row">
            {photos.map((photo, i) => (
              <div key={i} className="custom-gallery-item">
                <img src={photo.url} alt={`Custom order example ${i + 1}`} />
                {photo.caption && (
                  <div className="custom-gallery-overlay">
                    <span>{photo.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
