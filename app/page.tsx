import Link from 'next/link'
import ReviewCard from '@/components/ReviewCard'
import { SEED_REVIEWS } from '@/lib/seed-data'
import NewsletterForm from '@/components/NewsletterForm'

const INSTA = [
  { emoji: '🌸', color: '#f2d9d0' },
  { emoji: '🧶', color: '#c8d8c0' },
  { emoji: '☁️', color: '#dcd3e8' },
  { emoji: '🌿', color: '#e8ddd0' },
  { emoji: '🎀', color: '#e8c4bc' },
  { emoji: '🪡', color: '#f2d9d0' },
]

export default function HomePage() {
  const reviews = SEED_REVIEWS.slice(0, 3)

  return (
    <>
      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
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
        <div className="hero-right">
          <div className="hero-illustration">
            <div className="crochet-motif">🧶</div>
            <p className="hero-tagline">&ldquo;Every stitch &amp; seam tells a story.&rdquo;</p>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="features">
        <div className="feature-item"><div className="feature-icon">🧶</div><div className="feature-title">Crochet &amp; Hand-Sewn</div><div className="feature-desc">From crocheted textures to sewn fabrics — all made by Adya's hands.</div></div>
        <div className="feature-item"><div className="feature-icon">🎨</div><div className="feature-title">Colorful &amp; Fun</div><div className="feature-desc">Bright acrylic yarns in every shade — bold, soft, and built to last.</div></div>
        <div className="feature-item"><div className="feature-icon">✨</div><div className="feature-title">Limited Drops</div><div className="feature-desc">Released in small batches — when they sell out, they're gone.</div></div>
        <div className="feature-item"><div className="feature-icon">📦</div><div className="feature-title">Ships via USPS</div><div className="feature-desc">Beautifully packaged and shipped right to your door.</div></div>
      </div>

      {/* REVIEWS */}
      <div className="reviews-section">
        <h3>What customers are saying</h3>
        <div className="review-cards">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      </div>

      {/* INSTAGRAM */}
      <div className="insta-strip">
        <h3>@madebyadya</h3>
        <p>Follow for behind-the-scenes &amp; batch drop announcements — that's where I announce every new release</p>
        <div className="insta-grid">
          {INSTA.map((tile, i) => (
            <div key={i} className="insta-tile" style={{ background: tile.color }}>
              {tile.emoji}
              <div className="insta-overlay">@madebyadya</div>
            </div>
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
