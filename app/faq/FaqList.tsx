'use client'

import { useState } from 'react'

interface Faq { q: string; a: string }

export default function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} className="faq-item">
          <div
            className={`faq-q${open === i ? ' open' : ''}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {faq.q}
            <span className="faq-icon">+</span>
          </div>
          <div className={`faq-a${open === i ? ' open' : ''}`}>{faq.a}</div>
        </div>
      ))}
    </div>
  )
}
