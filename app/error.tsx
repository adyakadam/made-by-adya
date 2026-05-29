'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 24px',
      background: 'var(--cream)',
    }}>
      <div style={{
        background: 'var(--blush)',
        borderRadius: 24,
        padding: '40px 48px',
        maxWidth: 440,
        width: '100%',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🧶</div>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 30,
          fontWeight: 300,
          color: 'var(--text-dark)',
          marginBottom: 12,
        }}>
          Something went wrong
        </h2>

        <p style={{
          fontSize: 14,
          color: 'var(--text-mid)',
          lineHeight: 1.75,
          marginBottom: 28,
        }}>
          A stitch slipped somewhere. Please try again — if the problem persists, reach out through our{' '}
          <a href="/policies" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact page</a>.
        </p>

        <button
          className="btn-primary"
          onClick={reset}
          style={{ minWidth: 140 }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
