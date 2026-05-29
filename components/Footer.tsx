import Link from 'next/link'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.771 0 3.135-1.867 3.135-4.561 0-2.386-1.715-4.054-4.163-4.054-2.837 0-4.5 2.127-4.5 4.326 0 .856.33 1.775.741 2.276a.3.3 0 0 1 .069.286c-.076.312-.244.995-.277 1.134-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  )
}

export default function Footer({ tagline, email, copyright }: { tagline?: string; email?: string; copyright?: string }) {
  return (
    <>
      <footer>
        <div className="footer-brand">
          <h3>made by adya</h3>
          <p>{tagline ?? 'Slow fashion, handcrafted with love. Each piece is crocheted or hand-sewn by Adya — a little bit of heart made just for you.'}</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/madebyadya" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://www.tiktok.com/@madebyadya" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="TikTok">
              <TikTokIcon />
            </a>
            <a href="https://www.pinterest.com/madebyadya" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Pinterest">
              <PinterestIcon />
            </a>
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
          <a href={`mailto:${email ?? 'hello@madebyadya.com'}`}>{email ?? 'hello@madebyadya.com'}</a>
          <a href="https://instagram.com/madebyadya" target="_blank" rel="noopener noreferrer">@madebyadya</a>
          <Link href="/">Home</Link>
        </div>
      </footer>
      <div className="footer-bottom">{copyright ?? '© 2025 Made by Adya · Handcrafted with love 🧶'}</div>
    </>
  )
}
