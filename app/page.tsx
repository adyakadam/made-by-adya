import Link from 'next/link'
import ReviewCard from '@/components/ReviewCard'
import { SEED_REVIEWS } from '@/lib/seed-data'
import { getInstagramTiles, getHeroImageUrl } from '@/lib/supabase'
import NewsletterForm from '@/components/NewsletterForm'

export const dynamic = 'force-dynamic'

const FALLBACK_TILES = [
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#f2d9d0', emoji: '🌸' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#c8d8c0', emoji: '🧶' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#dcd3e8', emoji: '☁️' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#e8ddd0', emoji: '🌿' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#e8c4bc', emoji: '🎀' },
  { image_url: '', link_url: 'https://instagram.com/madebyadya', color: '#f2d9d0', emoji: '🪡' },
]

export default async function HomePage() {
  const reviews = SEED_REVIEWS.slice(0, 3)
  const [savedTiles, heroImageUrl] = await Promise.all([getInstagramTiles(), getHeroImageUrl()])

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
          <p className="hero-eyebrow">✦ Crochet &amp; Hand-Sewn — Crafted with love</p>
          <h1 className="hero-title">Wear something <em>made</em> by hand</h1>
          <p className="hero-desc">
            Every piece from Made by Adya is crafted entirely by hand — whether crocheted stitch by stitch
            or carefully sewn from fabric. Released in limited batches, announced on Instagram. Once they're gone, they're gone.
          </p>
          <div>
            <Link href="/shop" className="btn-primary">Shop Collection</Link>
            <Link href="/about" className="btn-outline">Our Story</Link>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="reviews-section">
        <h3>What customers are saying</h3>
        <div className="review-cards">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      </div>

      {/* INSTAGRAM GRID */}
      <div className="insta-strip">
        <h3>@madebyadya</h3>
        <p>Follow for behind-the-scenes &amp; batch drop announcements — that's where I announce every new release</p>
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
        <h3>Join the Adya Circle</h3>
        <p>Be first to know when the next batch drops — I announce every release on Instagram first.</p>
        <NewsletterForm />
      </div>
    </>
  )
}
