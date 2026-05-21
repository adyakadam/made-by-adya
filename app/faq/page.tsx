import FaqList from './FaqList'

const FAQS = [
  { q: 'How does the drop system work?', a: 'Everything is made in small batches. I announce each new batch on Instagram (@madebyadya) before the shop goes live — follow me there to be the first to know. Once a batch sells out, those exact pieces won\'t be restocked.' },
  { q: 'When is the next drop?', a: 'All batch release dates are announced on Instagram (@madebyadya). I don\'t have a fixed schedule — drops happen when the batch is ready. Follow along so you don\'t miss it!' },
  { q: 'Can I request a custom piece?', a: 'Yes! Custom orders are open in limited slots per batch. Fill out the Custom Orders form to submit your request. Availability is announced on Instagram along with each batch.' },
  { q: 'How much does shipping cost?', a: 'Shipping is calculated at checkout based on your location. I ship via USPS — you can choose from First Class ($5.99, 3–7 days), Priority Mail ($9.99, 1–3 days), or Priority Mail Express ($29.99, overnight). Orders are dispatched within 2–3 business days.' },
  { q: 'Do you accept returns or exchanges?', a: 'Due to the handmade, limited-batch nature of each piece, all sales are final. However, if something arrives damaged or incorrect, please contact me within 7 days and I\'ll make it right.' },
  { q: 'What\'s the difference between your crochet and hand-sewn pieces?', a: 'Crochet pieces are made entirely from yarn — they have texture, stretch, and that signature handmade look. Hand-sewn pieces are constructed from fabric (chiffon, cotton voile) and follow more traditional construction techniques. Both are made entirely by hand!' },
  { q: 'How do I care for my piece?', a: 'All pieces should be washed in cold water on a gentle cycle and laid flat to dry. Avoid the dryer for crochet items. Full care instructions are on the Size Guide & Care page.' },
  { q: 'Do you ship internationally?', a: 'Yes! I ship worldwide. International shipping rates are calculated at checkout. Please note customs fees may apply depending on your country.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number by email. You can also use the Track Order page on this site to enter your order number and see its status.' },
  { q: 'Do you offer gift wrapping?', a: 'Yes! You can add gift wrapping at checkout for $5. Your order will arrive in tissue paper with a ribbon and a handwritten note.' },
]

export default function FaqPage() {
  return (
    <div className="faq-page">
      <h1>FAQs</h1>
      <p className="faq-sub">Everything you need to know about ordering from Made by Adya</p>
      <FaqList faqs={FAQS} />
    </div>
  )
}
