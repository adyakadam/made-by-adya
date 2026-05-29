import ContactForm from './ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Policies & Contact',
  description:
    'Read the Made by Adya shipping, returns, privacy, and small-batch policies. Get in touch via our contact form for questions or support.',
  openGraph: {
    title: 'Policies & Contact — Made by Adya',
    description:
      'Shipping, returns, privacy policies, and contact form.',
    url: 'https://made-by-adya-9naj.vercel.app/policies',
  },
}

export default function PoliciesPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Policies &amp; Contact</h1>
          <p>Our commitments to you</p>
        </div>
      </div>
      <div className="policies-page">
        {[
          { icon: '🚚', title: 'Shipping Policy', text: 'Shipping is calculated at checkout based on your location and chosen USPS service. Available options include USPS First Class, Priority Mail, and Priority Mail Express. Orders are packaged and dispatched within 2–3 business days of purchase.' },
          { icon: '🔄', title: 'Returns & Exchanges', text: 'Due to the handmade nature of each piece, all sales are final. However, if your item arrives damaged or is significantly different from what was described, please reach out within 7 days of delivery and I will make it right — either with a replacement or full refund. I want you to love your piece!' },
          { icon: '🔒', title: 'Privacy Policy', text: 'Your personal information is never sold or shared with third parties. I collect only what\'s needed to process and ship your order. Payment information is handled securely via Stripe and never stored on this site. You may request deletion of your data at any time by emailing me directly.' },
          { icon: '💛', title: 'Small Batch', text: 'Made by Adya is committed to slow fashion. I produce in small batches so every piece gets the time and care it deserves. No mass production, no cutting corners — just handmade with love.' },
        ].map((p) => (
          <div key={p.title} className="policy-card">
            <div className="policy-icon">{p.icon}</div>
            <div className="policy-title">{p.title}</div>
            <div className="policy-text">{p.text}</div>
          </div>
        ))}
      </div>
      <div className="contact-section">
        <h2>Get in Touch</h2>
        <ContactForm />
      </div>
    </>
  )
}
