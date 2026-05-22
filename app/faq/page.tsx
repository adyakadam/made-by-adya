import FaqList from './FaqList'
import { getSiteContent } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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
