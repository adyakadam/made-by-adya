import FaqList from './FaqList'
import { getSiteContent } from '@/lib/supabase'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Got questions about Made by Adya? Find answers about shipping, sizing, custom orders, care instructions, returns, and more.',
  openGraph: {
    title: 'FAQ — Made by Adya',
    description:
      'Find answers about shipping, sizing, custom orders, care instructions, returns, and more.',
    url: 'https://made-by-adya-9naj.vercel.app/faq',
  },
}

export default async function FaqPage() {
  const c = await getSiteContent()
  return (
    <div className="faq-page">
      <h1>{c.faq_heading}</h1>
      <p className="faq-sub">{c.faq_sub}</p>
      <FaqList faqs={c.faq_items} />
    </div>
  )
}
