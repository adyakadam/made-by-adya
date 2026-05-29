import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '72vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 24px',
      background: 'var(--cream)',
    }}>
      {/* Large 404 */}
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(96px, 18vw, 180px)',
        fontWeight: 300,
        lineHeight: 1,
        color: 'var(--accent)',
        letterSpacing: '-0.02em',
        opacity: 0.35,
        userSelect: 'none',
        marginBottom: 8,
      }}>
        404
      </div>

      {/* Blush card */}
      <div style={{
        background: 'var(--blush)',
        borderRadius: 24,
        padding: '40px 48px',
        maxWidth: 480,
        width: '100%',
        marginTop: -20,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🪡</div>

        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(24px, 4vw, 34px)',
          fontWeight: 300,
          color: 'var(--text-dark)',
          marginBottom: 12,
          letterSpacing: '0.01em',
        }}>
          This page doesn't exist
        </h1>

        <p style={{
          fontSize: 14,
          color: 'var(--text-mid)',
          lineHeight: 1.75,
          marginBottom: 32,
          maxWidth: 340,
          margin: '0 auto 32px',
        }}>
          Looks like this thread went astray. The page you're looking for may have moved,
          or the link might be a little tangled.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" className="btn-primary">
            Browse the Collection
          </Link>
          <Link href="/" className="btn-outline">
            Go Home
          </Link>
        </div>
      </div>

      {/* Subtle brand footer */}
      <p style={{
        marginTop: 36,
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 16,
        color: 'var(--text-light)',
        letterSpacing: '0.06em',
      }}>
        made by <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>adya</em>
      </p>
    </div>
  )
}
