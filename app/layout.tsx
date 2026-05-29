import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import { getSiteContent, getHeroImageUrl } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://madebyadya.com'

export async function generateMetadata(): Promise<Metadata> {
  const heroUrl = await getHeroImageUrl()
  const ogImage = heroUrl || `${BASE_URL}/og-default.jpg`

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
      template: '%s — Made by Adya',
    },
    description:
      'Every piece from Made by Adya is crafted entirely by hand — crocheted stitch by stitch or carefully sewn. Soft, sustainable, and completely one-of-a-kind slow fashion.',
    keywords: ['handmade', 'crochet', 'slow fashion', 'sewn clothing', 'custom clothing', 'made by adya'],
    authors: [{ name: 'Adya' }],
    creator: 'Made by Adya',
    openGraph: {
      type: 'website',
      siteName: 'Made by Adya',
      title: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
      description:
        'Every piece from Made by Adya is crafted entirely by hand — crocheted stitch by stitch or carefully sewn. Soft, sustainable, and completely one-of-a-kind slow fashion.',
      url: BASE_URL,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Made by Adya — Handcrafted Crochet & Sewn Clothing' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
      description:
        'Every piece from Made by Adya is crafted entirely by hand — crocheted stitch by stitch or carefully sewn.',
      creator: '@madebyadya',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
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
