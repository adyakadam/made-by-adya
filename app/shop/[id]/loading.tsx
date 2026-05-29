export default function ProductLoading() {
  return (
    <>
      {/* Breadcrumb */}
      <div style={{
        padding: '14px 48px',
        borderBottom: '1px solid var(--warm-sand)',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}>
        {[100, 40, 140].map((w, i) => (
          <div key={i} className="skeleton skeleton-text" style={{ width: w, height: 12 }} />
        ))}
      </div>

      {/* PDP layout: 58% / 42% */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '58% 42%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '24px 0 80px',
        alignItems: 'start',
      }}>

        {/* Left — gallery */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 0 48px' }}>
          {/* Thumbnails strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="skeleton skeleton-block" style={{ width: 72, height: 90 }} />
            ))}
          </div>
          {/* Main image */}
          <div className="skeleton skeleton-block" style={{ flex: 1, aspectRatio: '3/4', minHeight: 0 }} />
        </div>

        {/* Right — product info */}
        <div style={{
          padding: '0 48px 0 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          {/* Badge + name */}
          <div className="skeleton skeleton-block" style={{ width: 72, height: 22 }} />
          <div className="skeleton skeleton-title" style={{ width: '90%', height: 42 }} />
          <div className="skeleton skeleton-title" style={{ width: '65%', height: 42 }} />

          {/* Rating */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="skeleton skeleton-block" style={{ width: 100, height: 18 }} />
            <div className="skeleton skeleton-text" style={{ width: 60 }} />
          </div>

          {/* Price */}
          <div className="skeleton skeleton-title" style={{ width: 100, height: 34 }} />

          {/* Color swatches */}
          <div>
            <div className="skeleton skeleton-text" style={{ width: 80, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="skeleton skeleton-circle" style={{ width: 32, height: 32 }} />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="skeleton skeleton-text" style={{ width: 60, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['XS', 'S', 'M', 'L'].map((s) => (
                <div key={s} className="skeleton skeleton-block" style={{ width: 52, height: 38 }} />
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div className="skeleton skeleton-block" style={{ flex: 1, height: 52 }} />
            <div className="skeleton skeleton-block" style={{ width: 52, height: 52 }} />
          </div>

          {/* Accordion stubs */}
          {[0, 1, 2].map((k) => (
            <div key={k} className="skeleton skeleton-block" style={{ width: '100%', height: 44 }} />
          ))}
        </div>
      </div>
    </>
  )
}
