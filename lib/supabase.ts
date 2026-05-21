import { createClient } from '@supabase/supabase-js'
import type { Product, Order, Review, CustomOrderRequest } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Browser / server-component client (read-only public data)
export const supabase = createClient(url, anonKey)

// Server-only admin client (bypasses RLS — only use in API routes / server actions)
export const supabaseAdmin = serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(limit = 6): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()
  if (error) return null
  return data
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single()
  if (error) return null
  return data
}

// ── Admin (service role only) ─────────────────────────────────────────────────

export async function adminGetAllOrders(): Promise<Order[]> {
  if (!supabaseAdmin) throw new Error('Service role key not configured')
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminGetAllProducts(): Promise<Product[]> {
  if (!supabaseAdmin) throw new Error('Service role key not configured')
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminUpsertProduct(product: Partial<Product> & { id?: string }): Promise<Product> {
  if (!supabaseAdmin) throw new Error('Service role key not configured')
  const { data, error } = await supabaseAdmin
    .from('products')
    .upsert(product)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adminUpdateOrderStatus(id: string, status: Order['status'], trackingNumber?: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Service role key not configured')
  const update: Partial<Order> = { status }
  if (trackingNumber) update.tracking_number = trackingNumber
  const { error } = await supabaseAdmin.from('orders').update(update).eq('id', id)
  if (error) throw error
}

export async function adminGetCustomOrders(): Promise<CustomOrderRequest[]> {
  if (!supabaseAdmin) throw new Error('Service role key not configured')
  const { data, error } = await supabaseAdmin
    .from('custom_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
