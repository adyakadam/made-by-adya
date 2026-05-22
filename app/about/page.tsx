import Link from 'next/link'
import { getSiteContent, getAboutImageUrl } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [c, aboutImageUrl] = await Promise.all([getSiteContent(), getAboutImageUrl()])
  return (
    <>
      <div className="about-hero">
        <div className="about-left">
          <h1>Hi, I'm <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Adya</em></h1>
          <p>{c.about_intro_1}</p>
          <br />
          <p>{c.about_intro_2}</p>
        </div>
        <div className="about-right" style={{ position: 'relative', overflow: 'hidden' }}>
          {aboutImageUrl
            ? <img src={aboutImageUrl} alt="Adya" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', position: 'absolute', inset: 0 }} />
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
