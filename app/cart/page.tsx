import CartClient from './CartClient'
import { getProducts } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const products = await getProducts()
  return <CartClient products={products} />
}
