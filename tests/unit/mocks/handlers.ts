import { http, HttpResponse } from 'msw'

const SUPABASE_URL = 'http://localhost:54321'

export const FIXTURE_PROMOS = [
  { code: 'FAMILY30', discount: 30, label: 'Friends & Family', active: true, product_ids: [], use_count: 0 },
  { code: 'INACTIVE', discount: 10, label: 'Inactive', active: false, product_ids: [], use_count: 0 },
  { code: 'EXPIRED', discount: 20, label: 'Expired', active: true, product_ids: [], use_count: 0, expires_at: '2020-01-01T00:00:00.000Z' },
  { code: 'MAXEDOUT', discount: 15, label: 'Maxed', active: true, product_ids: [], use_count: 10, max_uses: 10 },
  { code: 'FREESHIP', discount: 0, label: 'Free Shipping', active: true, product_ids: [], use_count: 0, free_shipping: true },
]

export const FIXTURE_COLOR_STOCKS: Record<string, Record<string, number>> = {
  'product-1': { '#ff0000': 4, '#0000ff': 2 },
}

export const FIXTURE_PRODUCTS = [
  { id: 'product-1', name: 'Lucy Bikini Top', price: 6800, stock: 6, active: true, category: 'crochet', colors: ['#ff0000', '#0000ff'], sizes: ['XS', 'S', 'M'], images: ['https://example.com/img.jpg'], emoji: '🧶', bg_color: '#f2d9d0', rating: 5, review_count: 3, is_new: true, is_bestseller: false, color_stock: { '#ff0000': 4, '#0000ff': 2 } },
  { id: 'product-2', name: 'Crochet Cardigan', price: 9800, stock: 0, active: true, category: 'crochet', colors: ['#fff'], sizes: ['S', 'M', 'L'], images: [], emoji: '🧶', bg_color: '#e8ddd0', rating: 4.5, review_count: 1, is_new: false, is_bestseller: true, color_stock: { '#fff': 0 } },
]

export const FIXTURE_ORDERS = [
  { id: 'order-1', order_number: '#MBA-12345', customer_email: 'test@test.com', customer_name: 'Test User', status: 'paid', total: 7528, subtotal: 6800, tax: 544, items: [{ product_id: 'product-1', name: 'Lucy Bikini Top', qty: 1, size: 'S', color: '#ff0000', price: 6800 }], created_at: '2026-01-01T00:00:00Z', shipping_address: { first_name: 'Test', last_name: 'User', email: 'test@test.com', address: '123 Main St', city: 'NYC', state: 'NY', zip: '10001', country: 'US' } },
]

export const handlers = [
  // Products
  http.get(`${SUPABASE_URL}/rest/v1/products`, () =>
    HttpResponse.json(FIXTURE_PRODUCTS)
  ),
  http.patch(`${SUPABASE_URL}/rest/v1/products`, () =>
    HttpResponse.json({})
  ),

  // Orders
  http.get(`${SUPABASE_URL}/rest/v1/orders`, () =>
    HttpResponse.json(FIXTURE_ORDERS)
  ),
  http.post(`${SUPABASE_URL}/rest/v1/orders`, () =>
    HttpResponse.json({ id: 'new-order-1' })
  ),
  http.patch(`${SUPABASE_URL}/rest/v1/orders`, () =>
    HttpResponse.json({})
  ),

  // Settings (promo codes, color stocks, etc.)
  http.get(`${SUPABASE_URL}/rest/v1/settings`, ({ request }) => {
    const url = new URL(request.url)
    const key = url.searchParams.get('key')?.replace('eq.', '')
    if (key === 'promo_codes') return HttpResponse.json([{ key: 'promo_codes', value: FIXTURE_PROMOS }])
    if (key === 'color_stocks') return HttpResponse.json([{ key: 'color_stocks', value: FIXTURE_COLOR_STOCKS }])
    if (key === 'stock_notifications') return HttpResponse.json([{ key: 'stock_notifications', value: [] }])
    if (key === 'custom_order_extras') return HttpResponse.json([{ key: 'custom_order_extras', value: {} }])
    return HttpResponse.json([])
  }),
  http.post(`${SUPABASE_URL}/rest/v1/settings`, () =>
    HttpResponse.json({})
  ),

  // Custom orders
  http.get(`${SUPABASE_URL}/rest/v1/custom_orders`, () =>
    HttpResponse.json([])
  ),
  http.patch(`${SUPABASE_URL}/rest/v1/custom_orders`, () =>
    HttpResponse.json({})
  ),

  // RPC (decrement_stock)
  http.post(`${SUPABASE_URL}/rest/v1/rpc/decrement_stock`, () =>
    HttpResponse.json(null)
  ),
]
