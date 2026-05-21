import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Made by Adya — Handcrafted Crochet & Sewn Clothing',
  description:
    'Every piece from Made by Adya is crafted entirely by hand — crocheted stitch by stitch or carefully sewn. Soft, sustainable, and completely one-of-a-kind slow fashion.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <Toast />
      </body>
    </html>
  )
}
