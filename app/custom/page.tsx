import CustomForm from './CustomForm'
import WaitlistForm from './WaitlistForm'

export default function CustomPage() {
  return (
    <>
      <div style={{ padding: '48px 48px 36px', borderBottom: '1px solid var(--warm-sand)' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, marginBottom: 8 }}>Custom Orders</h1>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Something made exactly for you</p>
      </div>
      <div className="custom-page">
        <div className="custom-left">
          <p>Want something made just for you? Custom orders are open in limited slots each batch. I announce custom availability on Instagram (@madebyadya) along with every new drop — slots fill up fast, so follow along to catch them.</p>
          <br />
          <ul className="custom-list">
            <li>Limited slots per batch — availability announced on Instagram</li>
            <li>Custom sizing to fit your exact measurements</li>
            <li>Choose your yarn color or fabric</li>
            <li>Request a specific stitch pattern or silhouette</li>
            <li>Personalized touches like monograms or embroidery</li>
            <li>2–4 week turnaround depending on complexity</li>
            <li>Price quote provided before work begins</li>
          </ul>
          <div className="waitlist-section">
            <h3>Get Notified for the Next Batch</h3>
            <p>Leave your email and I'll reach out when custom slots open up in the next batch.</p>
            <WaitlistForm />
          </div>
        </div>
        <div className="custom-form">
          <h2>Request a Custom Piece</h2>
          <CustomForm />
        </div>
      </div>
    </>
  )
}
