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

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(limit = 6): Promise<Review[]> {
  try {
    const db = getSupabaseAdmin() ?? getSupabase()
    const { data, error } = await db
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
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
  const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminUpsertProduct(product: Partial<Product> & { id?: string }): Promise<Product> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const { data, error } = await db.from('products').upsert(product).select().single()
  if (error) throw new Error(`Supabase error: ${error.message} (code: ${error.code})`)
  return data
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

export interface PromoCode { code: string; discount: number; label: string; active: boolean; product_ids: string[] }

const DEFAULT_PROMOS: PromoCode[] = [
  { code: 'FAMILY30', discount: 30, label: 'Friends & Family', active: true, product_ids: [] },
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

export async function adminGetCustomOrders(): Promise<CustomOrderRequest[]> {
  const db = getSupabaseAdmin()
  if (!db) throw new Error('Service role key not configured')
  const { data, error } = await db.from('custom_orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
