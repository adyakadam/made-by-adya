import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import { getSiteContent } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
  description:
    'Every piece from Made by Adya is crafted entirely by hand — crocheted stitch by stitch or carefully sewn. Soft, sustainable, and completely one-of-a-kind slow fashion.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent()
  return (
    <html lang="en">
      <body>
        <Nav announceBar={content.announce_bar} />
        <main>{children}</main>
        <Footer tagline={content.footer_tagline} email={content.footer_email} copyright={content.footer_copyright} />
        <Toast />
      </body>
    </html>
  )
}
