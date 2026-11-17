/**
 * 3D HUB — Shared domain types.
 * These mirror the database tables defined in supabase/migrations.
 */

export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Material {
  id: string
  name: string
  slug: string
  description: string | null
  properties: string | null
  recommended_usage: string | null
  colors: string[] // hex or named colors
  price_per_gram: number
  is_active: boolean
  created_at: string
}

export interface ProductColor {
  name: string
  hex: string
}

export interface Product {
  id: string
  title: string
  slug: string
  sku: string
  description: string
  category_id: string | null
  material_id: string | null
  price: number
  discounted_price: number | null
  images: string[]
  colors: ProductColor[]
  dimensions: string | null
  weight: string | null
  printing_technology: string | null
  processing_time: string | null
  stock: number
  is_customizable: boolean
  is_bestseller: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_active: boolean
  rating: number
  review_count: number
  created_at: string
  // joined fields
  category?: Category
  material?: Material
}

export interface CartItem {
  product_id: string
  product: Product
  quantity: number
  color?: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  is_default: boolean
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_title: string
  product_image: string
  quantity: number
  price: number
  color: string | null
}

export interface Order {
  id: string
  user_id: string | null
  order_number: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon_code: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  tracking_number: string | null
  shipping_address: Address | null
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  type: 'percentage' | 'fixed'
  value: number
  min_order: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
}

export type CustomPrintStatus =
  | 'submitted'
  | 'under_review'
  | 'quoted'
  | 'approved'
  | 'rejected'
  | 'in_production'
  | 'completed'

export interface CustomPrintFile {
  id: string
  request_id: string
  file_name: string
  file_path: string
  file_type: 'design' | 'reference'
  file_size: number | null
  mime_type: string | null
}

export interface CustomPrintRequest {
  id: string
  request_number: string
  user_id: string | null
  customer_name: string
  email: string
  phone: string
  description: string
  material_id: string | null
  color: string | null
  dimensions: string | null
  quantity: number
  instructions: string | null
  status: CustomPrintStatus
  files: CustomPrintFile[]
  created_at: string
  material?: Material
}

export interface Quotation {
  id: string
  request_id: string
  price: number
  estimated_days: number
  notes: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  request?: CustomPrintRequest
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  title: string
  body: string
  photo_url: string | null
  product_name: string | null
  is_approved: boolean
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  cta_text: string | null
  cta_link: string | null
  sort_order: number
  is_active: boolean
}

export interface HomepageSection {
  id: string
  key: string
  title: string
  subtitle: string | null
  sort_order: number
  is_active: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  cover_image: string | null
  author: string
  is_published: boolean
  published_at: string | null
  created_at: string
}

export interface SiteSettings {
  brand_name: string
  tagline: string
  logo_url: string | null
  contact_email: string
  contact_phone: string
  address: string
  social_links: Record<string, string>
  shipping_flat_rate: number
  free_shipping_threshold: number
  return_policy: string
  privacy_policy: string
  terms: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  customRequests: number
  pendingQuotations: number
  lowStockProducts: number
}
