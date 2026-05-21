import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <div className="about-hero">
        <div className="about-left">
          <h1>Hi, I'm <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Adya</em></h1>
          <p>I've been crocheting since I was twelve, and hand-sewing since fifteen. What started as a hobby quickly became a passion — and eventually, a small business built entirely from my bedroom floor, surrounded by yarn and fabric swatches.</p>
          <br />
          <p>Every single piece I make is done by hand, with intention. I take my time on each item — because I believe the clothes you wear should feel like they were made for you. Because they were.</p>
        </div>
        <div className="about-right">🪡</div>
      </div>

      <div className="craft-split">
        <div className="craft-half">
          <div className="craft-icon">🧶</div>
          <h3>The Crochet Process</h3>
          <p>Each crochet piece starts with a hand-drawn sketch. I then pick my yarn colors and begin stitching. A single top can take 8–14 hours to complete. Every loop is placed with care, creating texture and structure that you simply can't machine-replicate.</p>
        </div>
        <div className="craft-half">
          <div className="craft-icon">🪡</div>
          <h3>The Sewing Process</h3>
          <p>My sewn pieces are cut and constructed by hand from soft, flowing fabrics like chiffon and cotton voile. I draft my own patterns, which means each silhouette is thoughtfully designed for both comfort and beauty. No mass-production templates — just original cuts made with love.</p>
        </div>
      </div>

      <div className="process-section">
        <h2>From Idea to Your Wardrobe</h2>
        <div className="process-grid">
          {[
            { n: '01', title: 'Sketch & Design',  desc: 'Every piece starts as a pencil sketch in my design notebook.' },
            { n: '02', title: 'Pick Materials', desc: 'I choose yarns and fabrics for color, texture, and feel.' },
            { n: '03', title: 'Craft by Hand',    desc: 'Hours of stitching, sewing, and adjusting until it feels perfect.' },
            { n: '04', title: 'Quality Check',    desc: 'I wear-test or closely inspect every piece before it ships.' },
            { n: '05', title: 'Wrap & Ship',      desc: 'Packed in tissue paper with a handwritten note, just for you.' },
          ].map((step) => (
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
