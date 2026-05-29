export default function HomeLoading() {
  return (
    <div style={{ minHeight: '88vh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
      {/* Left image pane */}
      <div className="skeleton" style={{ minHeight: '88vh', borderRadius: 0 }} />

      {/* Right content pane */}
      <div style={{
        padding: '80px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--blush) 0%, var(--lavender) 100%)',
        gap: 20,
      }}>
        <div className="skeleton skeleton-text" style={{ width: 120, marginBottom: 4 }} />
        <div className="skeleton skeleton-block" style={{ width: '60%', height: 24 }} />
        <div className="skeleton skeleton-title" style={{ width: '90%', height: 56 }} />
        <div className="skeleton skeleton-title" style={{ width: '75%', height: 56 }} />
        <div className="skeleton skeleton-text" style={{ width: '85%' }} />
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        <div className="skeleton skeleton-text" style={{ width: '78%', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="skeleton skeleton-block" style={{ width: 160, height: 44 }} />
          <div className="skeleton skeleton-block" style={{ width: 140, height: 44 }} />
        </div>
      </div>
    </div>
  )
}
