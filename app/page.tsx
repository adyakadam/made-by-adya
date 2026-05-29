import Link from 'next/link'
import { getInstagramTiles, getHeroImageUrl, getSiteContent } from '@/lib/supabase'
import NewsletterForm from '@/components/NewsletterForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://madebyadya.com'

export async function generateMetadata(): Promise<Metadata> {
  const heroUrl = await getHeroImageUrl()
  const ogImage = heroUrl || undefined
  return {
    title: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
    description:
      'Shop handcrafted crochet tops, cardigans, hand-sewn dresses, and one-of-a-kind sets made with love. Slow fashion, made by hand, one stitch at a time.',
    openGraph: {
      title: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
      description:
        'Shop handcrafted crochet tops, cardigans, hand-sewn dresses, and one-of-a-kind sets made with love.',
      url: BASE_URL,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: 'Made by Adya' }] }),
    },
    twitter: {
      card: 'summary_large_image',
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

const FALLBACK_TILES = [
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#f2d9d0', emoji: '🌸' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#c8d8c0', emoji: '🧶' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#dcd3e8', emoji: '☁️' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#e8ddd0', emoji: '🌿' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#e8c4bc', emoji: '🎀' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#f2d9d0', emoji: '🪡' },
]

export default async function HomePage() {
  const [savedTiles, heroImageUrl, c] = await Promise.all([getInstagramTiles(), getHeroImageUrl(), getSiteContent()])

  const tiles = FALLBACK_TILES.map((fallback, i) => ({
    ...fallback,
    ...(savedTiles[i] ?? {}),
  }))

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          {heroImageUrl
            ? <img src={heroImageUrl} alt="Made by Adya" />
            : <div className="hero-left-placeholder">🧶</div>}
        </div>
        <div className="hero-right">
          <p className="hero-eyebrow">{c.hero_eyebrow}</p>
          <div className="hero-brand">made by <em>adya</em></div>
          <h1 className="hero-title">{c.hero_title}</h1>
          <p className="hero-desc">{c.hero_desc}</p>
          <div>
            <Link href="/shop" className="btn-primary">{c.hero_cta_primary}</Link>
            <Link href="/about" className="btn-outline">{c.hero_cta_secondary}</Link>
          </div>
        </div>
      </div>

      {/* PILLARS */}
      <div className="features">
        {c.pillars.map((p, i) => (
          <div key={i} className="feature-item">
            <div className="feature-icon">{p.icon}</div>
            <div className="feature-title">{p.title}</div>
            <div className="feature-desc">{p.desc}</div>
          </div>
        ))}
      </div>

      {/* INSTAGRAM GRID */}
      <div className="insta-strip">
        <h3>{c.insta_heading}</h3>
        <p>{c.insta_desc}</p>
        <div className="insta-grid">
          {tiles.map((tile, i) => (
            <a
              key={i}
              href={tile.link_url || 'https://instagram.com/madebyadya'}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-tile"
              style={{ background: tile.color, position: 'relative', overflow: 'hidden', display: 'block' }}
            >
              {tile.image_url
                ? <img src={tile.image_url} alt={`@madebyadya post ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                : tile.emoji}
              <div className="insta-overlay">@madebyadya</div>
            </a>
          ))}
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="newsletter">
        <h3>{c.newsletter_heading}</h3>
        <p>{c.newsletter_desc}</p>
        <NewsletterForm />
      </div>
    </>
  )
}
