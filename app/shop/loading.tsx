function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(58,46,40,.06)',
    }}>
      {/* Image placeholder — 3:4 ratio matching product card */}
      <div className="skeleton skeleton-block" style={{ aspectRatio: '3/4', borderRadius: 0 }} />
      {/* Card body */}
      <div style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        <div className="skeleton skeleton-text" style={{ width: '45%', height: 12 }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          {[0, 1, 2].map((k) => (
            <div key={k} className="skeleton skeleton-circle" style={{ width: 18, height: 18 }} />
          ))}
        </div>
        <div className="skeleton skeleton-block" style={{ width: '55%', height: 18, marginTop: 4 }} />
      </div>
    </div>
  )
}

export default function ShopLoading() {
  return (
    <>
      {/* Page header skeleton */}
      <div style={{
        padding: '28px 48px 20px',
        borderBottom: '1px solid var(--warm-sand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton skeleton-title" style={{ width: 180, height: 34 }} />
          <div className="skeleton skeleton-text"  style={{ width: 260 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} className="skeleton skeleton-block" style={{ width: 72, height: 32 }} />
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: 24,
        padding: '36px 48px',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  )
}
