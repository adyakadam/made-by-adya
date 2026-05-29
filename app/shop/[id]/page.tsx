import { getProductById, getProducts, getReviews } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetail from './ProductDetail'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return {}
  return {
    title: `${product.name} — Made by Adya`,
    description: product.description ?? undefined,
    openGraph: { images: product.images?.[0] ? [product.images[0]] : [] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, allProducts, reviews] = await Promise.all([
    getProductById(id),
    getProducts(),
    getReviews(50),
  ])
  if (!product || !product.active) notFound()
  const productReviews = reviews
    .filter((r) => r.product_id === product.id || r.product_name === product.name)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
  const related = allProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://madebyadya.com'
  const productUrl = `${BASE_URL}/shop/${product.id}`
  const priceFormatted = (product.price / 100).toFixed(2)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images ?? [],
    brand: { '@type': 'Brand', name: 'Made by Adya' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: priceFormatted,
      availability: product.active
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Made by Adya' },
    },
    ...(product.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.review_count,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${BASE_URL}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetail product={product} related={related} reviews={productReviews} />
    </>
  )
}
