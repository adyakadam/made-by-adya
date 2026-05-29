import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Product, Order, Review, CustomOrderRequest, InstagramTile } from './types'
import { type SiteContent, DEFAULT_CONTENT, mergeContent } from './content'

// Clients are created lazily on first use so module evaluation never throws,
// even when env vars are missing at build time.
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient(url, key)
  }
  return _supabase
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(url, key, { auth: { persistSession: false } })
  }
  return _supabaseAdmin
}

export { getSupabaseAdmin as supabaseAdmin }

// ── Products ──────────────────────────────────────────────────────────────────

async function getColorStocks(): Promise<Record<string, Record<string, number>>> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'color_stocks').single()
    return (data?.value as Record<string, Record<string, number>>) ?? {}
  } catch { return {} }
}

async function saveColorStock(productId: string, colorStock: Record<string, number>): Promise<void> {
  const db = getSupabaseAdmin() ?? getSupabase()
  const stocks = await getColorStocks()
  stocks[productId] = colorStock
  await db.from('settings').upsert({ key: 'color_stocks', value: stocks })
}

function mergeColorStocks(products: Product[], stocks: Record<string, Record<string, number>>): Product[] {
  return products.map((p) => ({ ...p, color_stock: stocks[p.id] ?? p.color_stock ?? {} }))
}

export async function decrementColorStock(productId: string, color: string, qty: number): Promise<void> {
  try {
    const db = getSupabaseAdmin()
    if (!db) return
    const stocks = await getColorStocks()
    const productStock = stocks[productId]
    if (!productStock || !(color in productStock)) return
    productStock[color] = Math.max(0, (productStock[color] ?? 0) - qty)
    stocks[productId] = productStock
    await db.from('settings').upsert({ key: 'color_stocks', value: stocks })
    // Keep product.stock in sync as the sum of all color stocks
    const newTotal = Object.values(productStock).reduce((sum, n) => sum + n, 0)
    await db.from('products').update({ stock: newTotal }).eq('id', productId)
  } catch (e) {
    console.error('decrementColorStock error:', e)
  }
}

/** Recalculate product.stock as sum of color_stock values and save both. */
export async function syncStockFromColors(productId: string, colorStock: Record<string, number>): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) return
  const total = Object.values(colorStock).reduce((sum, n) => sum + n, 0)
  await Promise.all([
    saveColorStock(productId, colorStock),
    db.from('products').update({ stock: total }).eq('id', productId),
  ])
}

export async function getProducts(): Promise<Product[]> {
  const [{ data, error }, stocks] = await Promise.all([
    getSupabase().from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
    getColorStocks(),
  ])
  if (error) throw error
  return mergeColorStocks(data ?? [], stocks)
}

export async function getProductById(id: string): Promise<Product | null> {
  const [{ data, error }, stocks] = await Promise.all([
    getSupabase().from('products').select('*').eq('id', id).single(),
    getColorStocks(),
  ])
  if (error) return null
  return { ...data, color_stock: stocks[data.id] ?? data.color_stock ?? {} }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(limit = 6, orderBy: 'created_at' | 'rating' = 'created_at'): Promise<Review[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data, error } = await db
      .from('reviews')
      .select('*')
      .order(orderBy, { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  } catch { return [] }
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()
  if (error) return null
  return data
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()
  if (error) return null
  return data
}

// ── Admin (service role only) ─────────────────────────────────────────────────

export async function adminGetAllOrders(): Promise<Order[]> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const { data, error } = await db.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminGetAllProducts(): Promise<Product[]> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const [{ data, error }, stocks] = await Promise.all([
    db.from('products').select('*').order('created_at', { ascending: false }),
    getColorStocks(),
  ])
  if (error) throw error
  return mergeColorStocks(data ?? [], stocks)
}

export async function adminUpsertProduct(product: Partial<Product> & { id?: string }): Promise<Product> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const { color_stock, ...rest } = product

  // Auto-calculate total stock as sum of color stocks when color stocks are provided
  if (color_stock && Object.keys(color_stock).length > 0) {
    rest.stock = Object.values(color_stock).reduce((sum, n) => sum + n, 0)
  }

  console.log('upsert payload keys:', Object.keys(rest))
  const { data, error } = await db.from('products').upsert(rest).select().single()
  if (error) throw new Error(`Supabase error: ${error.message} (code: ${error.code})`)
  if (color_stock !== undefined && data?.id) {
    await saveColorStock(data.id, color_stock)
  }
  return { ...data, color_stock }
}

export async function adminGetOrderById(id: string): Promise<Order | null> {
  const db = getSupabaseAdmin()
  if (!db) return null
  const { data } = await db.from('orders').select('*').eq('id', id).single()
  return data ?? null
}

export async function adminUpdateOrderStatus(id: string, status: Order['status'], trackingNumber?: string): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const update: Partial<Order> = { status }
  if (trackingNumber) update.tracking_number = trackingNumber
  const { error } = await db.from('orders').update(update).eq('id', id)
  if (error) throw error
}

export async function getInstagramTiles(): Promise<InstagramTile[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'instagram_tiles').single()
    return (data?.value as InstagramTile[]) ?? []
  } catch { return [] }
}

export async function saveInstagramTiles(tiles: InstagramTile[]): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  await db.from('settings').upsert({ key: 'instagram_tiles', value: tiles })
}

export async function getHeroImageUrl(): Promise<string> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'hero_image_url').single()
    return (data?.value as string) ?? ''
  } catch { return '' }
}

export async function saveHeroImageUrl(url: string): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  await db.from('settings').upsert({ key: 'hero_image_url', value: url })
}

export interface AboutMedia { url: string; isVideo: boolean }

export async function getAboutMedia(): Promise<AboutMedia> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'about_image_url').single()
    const val = data?.value
    if (!val) return { url: '', isVideo: false }
    // backwards-compat: old stored values were plain strings
    if (typeof val === 'string') return { url: val, isVideo: /\.(mp4|webm|mov|m4v)/i.test(val) }
    return val as AboutMedia
  } catch { return { url: '', isVideo: false } }
}

export async function saveAboutMedia(media: AboutMedia): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  await db.from('settings').upsert({ key: 'about_image_url', value: media })
}

export interface CustomPhoto { url: string; caption: string }

const BLANK_PHOTOS: CustomPhoto[] = [
  { url: '', caption: '' },
  { url: '', caption: '' },
  { url: '', caption: '' },
]

export async function getCustomPhotos(): Promise<CustomPhoto[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'custom_photos').single()
    const val = data?.value
    if (!val) return BLANK_PHOTOS
    // backwards compat: old data was string[]
    if (Array.isArray(val) && typeof val[0] === 'string') {
      return (val as string[]).map((url) => ({ url, caption: '' }))
    }
    return val as CustomPhoto[]
  } catch { return BLANK_PHOTOS }
}

export async function saveCustomPhotos(photos: CustomPhoto[]): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  await db.from('settings').upsert({ key: 'custom_photos', value: photos })
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'site_content').single()
    return mergeContent(data?.value)
  } catch { return DEFAULT_CONTENT }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  await db.from('settings').upsert({ key: 'site_content', value: content })
}

export interface PromoCode {
  code: string
  discount: number
  label: string
  active: boolean
  product_ids: string[]
  free_shipping?: boolean  // if true, adds $0 shipping option at checkout
  expires_at?: string      // ISO date string, optional — no expiry if absent
  max_uses?: number        // optional — unlimited if absent
  use_count: number        // defaults to 0
}

const DEFAULT_PROMOS: PromoCode[] = [
  { code: 'FAMILY30', discount: 30, label: 'Friends & Family', active: true, product_ids: [], use_count: 0 },
]

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'promo_codes').single()
    return (data?.value as PromoCode[]) ?? DEFAULT_PROMOS
  } catch { return DEFAULT_PROMOS }
}

export async function savePromoCodes(codes: PromoCode[]): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  await db.from('settings').upsert({ key: 'promo_codes', value: codes })
}

export interface StockNotification { email: string; product_id: string; product_name: string; created_at: string }

export async function getStockNotifications(): Promise<StockNotification[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'stock_notifications').single()
    return (data?.value as StockNotification[]) ?? []
  } catch { return [] }
}

export async function addStockNotification(n: Omit<StockNotification, 'created_at'>): Promise<void> {
  const db = getSupabaseAdmin() ?? getSupabase()
  const existing = await getStockNotifications()
  if (existing.find((e) => e.email === n.email && e.product_id === n.product_id)) return
  await db.from('settings').upsert({ key: 'stock_notifications', value: [...existing, { ...n, created_at: new Date().toISOString() }] })
}

export async function deleteStockNotificationsByProduct(product_name: string): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const existing = await getStockNotifications()
  const filtered = existing.filter((n) => n.product_name !== product_name)
  await db.from('settings').upsert({ key: 'stock_notifications', value: filtered })
}

export interface NewsletterSubscriber { email: string; created_at: string }

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'newsletter_subscribers').single()
    return (data?.value as NewsletterSubscriber[]) ?? []
  } catch { return [] }
}

export async function addNewsletterSubscriber(email: string): Promise<void> {
  const db = getSupabaseAdmin() ?? getSupabase()
  const existing = await getNewsletterSubscribers()
  if (existing.find((s) => s.email === email)) return
  await db.from('settings').upsert({ key: 'newsletter_subscribers', value: [...existing, { email, created_at: new Date().toISOString() }] })
}

export interface CustomOrderExtra { admin_notes: string; quote_amount: string; reference_images?: string[]; estimated_time?: string; tracking_number?: string; payment_link?: string; payment_type?: 'full' | 'deposit' }

export async function getCustomOrderExtras(): Promise<Record<string, CustomOrderExtra>> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', 'custom_order_extras').single()
    return (data?.value as Record<string, CustomOrderExtra>) ?? {}
  } catch { return {} }
}

export async function saveCustomOrderExtra(id: string, extra: CustomOrderExtra): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const extras = await getCustomOrderExtras()
  extras[id] = extra
  await db.from('settings').upsert({ key: 'custom_order_extras', value: extras })
}

// ─── Review Tokens ───────────────────────────────────────────────────────────
export interface ReviewToken {
  order_number: string
  customer_name: string
  customer_email: string
  items: { product_id: string; name: string }[]
  used: boolean
  created_at: string
}

export async function saveReviewToken(token: string, data: Omit<ReviewToken, 'used' | 'created_at'>): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const payload: ReviewToken = { ...data, used: false, created_at: new Date().toISOString() }
  await db.from('settings').upsert({ key: `review_token_${token}`, value: payload })
}

export async function getReviewToken(token: string): Promise<ReviewToken | null> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data } = await db.from('settings').select('value').eq('key', `review_token_${token}`).single()
    return (data?.value as ReviewToken) ?? null
  } catch { return null }
}

export async function markReviewTokenUsed(token: string): Promise<void> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const existing = await getReviewToken(token)
  if (!existing) return
  await db.from('settings').upsert({ key: `review_token_${token}`, value: { ...existing, used: true } })
}

export async function adminGetCustomOrders(): Promise<CustomOrderRequest[]> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const { data, error } = await db.from('custom_orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
