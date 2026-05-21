import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <footer>
        <div className="footer-brand">
          <h3>made by adya</h3>
          <p>Slow fashion, handcrafted with love. Each piece is crocheted or hand-sewn by Adya — a little bit of heart made just for you.</p>
          <div className="footer-social">
            <button className="social-btn" aria-label="Instagram">📷</button>
            <button className="social-btn" aria-label="TikTok">🎵</button>
            <button className="social-btn" aria-label="Pinterest">📌</button>
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link href="/shop">All Pieces</Link>
          <Link href="/custom">Custom Orders</Link>
          <Link href="/size-guide">Size Guide</Link>
        </div>
        <div className="footer-col">
          <h4>Info</h4>
          <Link href="/about">About Adya</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/tracking">Track Order</Link>
          <Link href="/policies">Policies</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <a href="mailto:hello@madebyadya.com">hello@madebyadya.com</a>
          <a href="https://instagram.com/madebyadya" target="_blank" rel="noopener noreferrer">@madebyadya</a>
          <Link href="/">Home</Link>
        </div>
      </footer>
      <div className="footer-bottom">© 2025 Made by Adya · Handcrafted with love 🧶</div>
    </>
  )
}
