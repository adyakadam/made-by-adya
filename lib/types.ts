export interface Product {
  id: string
  name: string
  description: string
  price: number // in cents (e.g. 6800 = $68.00)
  images: string[]
  emoji: string
  bg_color: string
  category: 'crochet' | 'sewn' | 'sets' | 'accessories'
  badge: string
  is_new: boolean
  is_bestseller: boolean
  stock: number
  color_stock?: Record<string, number>
  rating: number
  review_count: number
  sizes: string[]
  colors: string[]
  active: boolean
  created_at: string
}

export interface CartItem {
  product_id: string
  name: string
  price: number // in cents
  qty: number
  size: string
  color: string
  image_url: string | null  // first image, used as thumbnail
  emoji: string
  bg_color: string
}

export interface ShippingAddress {
  first_name: string
  last_name: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Order {
  id: string
  stripe_session_id: string
  stripe_payment_intent: string | null
  customer_email: string
  customer_name: string
  shipping_address: ShippingAddress
  items: OrderItem[]
  subtotal: number // in cents
  tax: number
  total: number
  gift_wrap: boolean
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  order_number: string
  tracking_number: string | null
  created_at: string
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  qty: number
  size: string
  color: string
  emoji: string
}

export interface Review {
  id: string
  product_id: string | null
  reviewer_name: string
  avatar_letter: string
  rating: number
  body: string
  product_name: string
  created_at: string
}

export interface CustomOrderRequest {
  id: string
  name: string
  email: string
  piece_type: string
  measurements: string
  color_pref: string
  vision: string
  budget: string
  status: 'new' | 'quoted' | 'accepted' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
}

export interface InstagramTile {
  image_url: string
  link_url: string
}

export type ProductCategory = 'all' | 'crochet' | 'sewn' | 'sets' | 'accessories'
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'new' | 'rating'
