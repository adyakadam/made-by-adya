import Link from 'next/link'
import { getSiteContent, getAboutMedia } from '@/lib/supabase'
import AboutMedia from '@/components/AboutMedia'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet Adya — the maker behind Made by Adya. Every crochet and sewn piece is crafted by hand with love, care, and a passion for slow, sustainable fashion.',
  openGraph: {
    title: 'About — Made by Adya',
    description:
      'Meet Adya — the maker behind Made by Adya. Handcrafted crochet and sewn clothing made with love.',
    url: 'https://madebyadya.com/about',
  },
}

export default async function AboutPage() {
  const [c, aboutMedia] = await Promise.all([getSiteContent(), getAboutMedia()])
  return (
    <>
      <div className="about-hero">
        <div className="about-left">
          <h1>Hi, I'm <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>adya</em></h1>
          <p>{c.about_intro_1}</p>
          <br />
          <p>{c.about_intro_2}</p>
        </div>
        <div className="about-right" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
          {aboutMedia.url
            ? <AboutMedia url={aboutMedia.url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🪡'}
        </div>
      </div>

      <div className="craft-split">
        <div className="craft-half">
          <div className="craft-icon">🧶</div>
          <h3>{c.about_crochet_title}</h3>
          <p>{c.about_crochet_desc}</p>
        </div>
        <div className="craft-half">
          <div className="craft-icon">🪡</div>
          <h3>{c.about_sewing_title}</h3>
          <p>{c.about_sewing_desc}</p>
        </div>
      </div>

      <div className="process-section">
        <h2>{c.about_process_title}</h2>
        <div className="process-grid">
          {c.about_steps.map((step) => (
            <div key={step.n} className="process-card">
              <div className="process-num">{step.n}</div>
              <div className="process-title">{step.title}</div>
              <div className="process-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 60 }}>
        <Link href="/shop" className="btn-primary">Shop the Collection</Link>
      </div>
    </>
  )
}
