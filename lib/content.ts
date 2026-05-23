export interface SiteContent {
  // Nav
  announce_bar: string
  // Home – hero
  hero_eyebrow: string
  hero_title: string
  hero_desc: string
  hero_cta_primary: string
  hero_cta_secondary: string
  // Home – pillars (fixed 4)
  pillars: { icon: string; title: string; desc: string }[]
  // Home – instagram strip
  insta_heading: string
  insta_desc: string
  // Home – newsletter
  newsletter_heading: string
  newsletter_desc: string
  // About
  about_intro_1: string
  about_intro_2: string
  about_crochet_title: string
  about_crochet_desc: string
  about_sewing_title: string
  about_sewing_desc: string
  about_process_title: string
  about_steps: { n: string; title: string; desc: string }[]
  // FAQ
  faq_heading: string
  faq_sub: string
  faq_items: { q: string; a: string }[]
  // Custom orders
  custom_heading: string
  custom_sub: string
  custom_desc: string
  custom_list: string[]
  custom_waitlist_heading: string
  custom_waitlist_desc: string
  // Footer
  footer_tagline: string
  footer_email: string
  footer_copyright: string
}

export const DEFAULT_CONTENT: SiteContent = {
  announce_bar: '🎀 Limited drops — follow @madebyadya on Instagram for batch announcements · Ships via USPS',
  hero_eyebrow: '✦ Crochet & Hand-Sewn — Crafted with love',
  hero_title: 'Wear something made by hand',
  hero_desc: "Every piece from Made by Adya is crafted entirely by hand — whether crocheted stitch by stitch or carefully sewn from fabric. Released in limited batches, announced on Instagram. Once they're gone, they're gone.",
  hero_cta_primary: 'Shop Collection',
  hero_cta_secondary: 'Our Story',
  pillars: [
    { icon: '🧶', title: 'Crochet & Hand-Sewn', desc: "From crocheted textures to sewn fabrics — all made by Adya's hands." },
    { icon: '🎨', title: 'Colorful & Fun', desc: 'Bright acrylic yarns in every shade — bold, soft, and built to last.' },
    { icon: '✨', title: 'Limited Drops', desc: "Released in small batches — when they sell out, they're gone." },
    { icon: '📦', title: 'Ships via USPS', desc: 'Beautifully packaged and shipped right to your door.' },
  ],
  insta_heading: '@madebyadya',
  insta_desc: "Follow for behind-the-scenes & batch drop announcements — that's where I announce every new release",
  newsletter_heading: 'Join the Adya Circle',
  newsletter_desc: 'Be first to know when the next batch drops — I announce every release on Instagram first.',
  about_intro_1: "I've been crocheting since I was twelve, and hand-sewing since fifteen. What started as a hobby quickly became a passion — and eventually, a small business built entirely from my bedroom floor, surrounded by yarn and fabric swatches.",
  about_intro_2: "Every single piece I make is done by hand, with intention. I take my time on each item — because I believe the clothes you wear should feel like they were made for you. Because they were.",
  about_crochet_title: 'The Crochet Process',
  about_crochet_desc: "Each crochet piece starts with a hand-drawn sketch. I then pick my yarn colors and begin stitching. A single top can take 8–14 hours to complete. Every loop is placed with care, creating texture and structure that you simply can't machine-replicate.",
  about_sewing_title: 'The Sewing Process',
  about_sewing_desc: "My sewn pieces are cut and constructed by hand from soft, flowing fabrics like chiffon and cotton voile. I draft my own patterns, which means each silhouette is thoughtfully designed for both comfort and beauty. No mass-production templates — just original cuts made with love.",
  about_process_title: 'From Idea to Your Wardrobe',
  about_steps: [
    { n: '01', title: 'Sketch & Design', desc: 'Every piece starts as a pencil sketch in my design notebook.' },
    { n: '02', title: 'Pick Materials', desc: 'I choose yarns and fabrics for color, texture, and feel.' },
    { n: '03', title: 'Craft by Hand', desc: 'Hours of stitching, sewing, and adjusting until it feels perfect.' },
    { n: '04', title: 'Quality Check', desc: 'I wear-test or closely inspect every piece before it ships.' },
    { n: '05', title: 'Wrap & Ship', desc: 'Packed in tissue paper with a handwritten note, just for you.' },
  ],
  faq_heading: 'FAQs',
  faq_sub: 'Everything you need to know about ordering from Made by Adya',
  faq_items: [
    { q: 'How does the drop system work?', a: "Everything is made in small batches. I announce each new batch on Instagram (@madebyadya) before the shop goes live — follow me there to be the first to know. Once a batch sells out, those exact pieces won't be restocked." },
    { q: 'When is the next drop?', a: "All batch release dates are announced on Instagram (@madebyadya). I don't have a fixed schedule — drops happen when the batch is ready. Follow along so you don't miss it!" },
    { q: 'Can I request a custom piece?', a: 'Yes! Custom orders are open in limited slots per batch. Fill out the Custom Orders form to submit your request. Availability is announced on Instagram along with each batch.' },
    { q: 'Can I get a listed product in a different color?', a: "Absolutely! Each product is made by hand, so color variations are possible through a custom order. If you love a listed piece but want it in a different yarn color or fabric shade, head to the Custom Orders page and describe what you have in mind. Custom slots are limited per batch, so fill out the form to get on the waitlist." },
    { q: 'How much does shipping cost?', a: 'Shipping is calculated at checkout based on your location. I ship via USPS — you can choose from First Class ($5.99, 3–7 days), Priority Mail ($9.99, 1–3 days), or Priority Mail Express ($29.99, overnight). Orders are dispatched within 2–3 business days.' },
    { q: 'Do you accept returns or exchanges?', a: 'Due to the handmade, limited-batch nature of each piece, all sales are final. However, if something arrives damaged or incorrect, please contact me within 7 days and I\'ll make it right.' },
    { q: "What's the difference between your crochet and hand-sewn pieces?", a: 'Crochet pieces are made entirely from yarn — they have texture, stretch, and that signature handmade look. Hand-sewn pieces are constructed from fabric (chiffon, cotton voile) and follow more traditional construction techniques. Both are made entirely by hand!' },
    { q: 'How do I care for my piece?', a: 'All pieces should be washed in cold water on a gentle cycle and laid flat to dry. Avoid the dryer for crochet items. Full care instructions are on the Size Guide & Care page.' },
    { q: 'Do you ship internationally?', a: 'Yes! I ship worldwide. International shipping rates are calculated at checkout. Please note customs fees may apply depending on your country.' },
    { q: 'How do I track my order?', a: "Once your order ships, you'll receive a tracking number by email. You can also use the Track Order page on this site to enter your order number and see its status." },
    { q: 'Do you offer gift wrapping?', a: 'Yes! You can add gift wrapping at checkout for $5. Your order will arrive in tissue paper with a ribbon and a handwritten note.' },
  ],
  custom_heading: 'Custom Orders',
  custom_sub: 'Something made exactly for you',
  custom_desc: "Want something made just for you? Custom orders are open in limited slots each batch. I announce custom availability on Instagram (@madebyadya) along with every new drop — slots fill up fast, so follow along to catch them.",
  custom_list: [
    'Limited slots per batch — availability announced on Instagram',
    'Custom sizing to fit your exact measurements',
    'Want a listed piece in a different color? Request it here!',
    'Choose your yarn color or fabric from scratch',
    'Request a specific stitch pattern or silhouette',
    'Personalized touches like monograms or embroidery',
    '2–4 week turnaround depending on complexity',
    'Price quote provided before work begins',
  ],
  custom_waitlist_heading: 'Get Notified for the Next Batch',
  custom_waitlist_desc: "Leave your email and I'll reach out when custom slots open up in the next batch.",
  footer_tagline: 'Slow fashion, handcrafted with love. Each piece is crocheted or hand-sewn by Adya — a little bit of heart made just for you.',
  footer_email: 'hello@madebyadya.com',
  footer_copyright: '© 2025 Made by Adya · Handcrafted with love 🧶',
}

export function mergeContent(stored: unknown): SiteContent {
  if (!stored || typeof stored !== 'object') return DEFAULT_CONTENT
  return { ...DEFAULT_CONTENT, ...(stored as Partial<SiteContent>) }
}
