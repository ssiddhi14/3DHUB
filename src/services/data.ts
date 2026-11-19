/**
 * Data service layer.
 *
 * Every function first checks `supabaseReady`. When Supabase is configured it
 * queries Postgres (with Realtime subscriptions where useful). Otherwise it
 * reads/writes the in-memory store so the app is fully functional in demo mode.
 *
 * Components consume these through the hooks in hooks/useData.ts which handle
 * loading states and re-fetching on store mutations.
 */

import { supabase, supabaseReady, BUCKETS } from '@/lib/supabase'
import { getStore, mutate, genId } from './store'
import { slugify } from '@/lib/utils'
import { placeholderImage } from '@/lib/placeholder'
import { uploadToCloudinary, uploadRawToCloudinary, cloudinaryReady, type CloudinaryFolder } from '@/lib/cloudinary'
import type {
  Product,
  Category,
  Material,
  BlogPost,
  Banner,
  Coupon,
  Order,
  OrderItem,
  CustomPrintRequest,
  CustomPrintFile,
  Quotation,
  Review,
  SiteSettings,
  DashboardStats,
} from '@/types'

const joinProduct = (p: Product): Product => {
  const store = getStore()
  return {
    ...p,
    category: store.categories.find((c) => c.id === p.category_id) ?? undefined,
    material: store.materials.find((m) => m.id === p.material_id) ?? undefined,
  }
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export async function fetchCategories(): Promise<Category[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data as Category[]
  }
  return [...getStore().categories].sort((a, b) => a.sort_order - b.sort_order)
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return (data as Category) ?? null
  }
  return getStore().categories.find((c) => c.slug === slug) ?? null
}

export async function createCategory(input: Partial<Category>): Promise<Category> {
  const order = getStore().categories.length + 1
  const category: Category = {
    id: genId('cat'),
    name: input.name || 'New Category',
    slug: input.slug || slugify(input.name || 'new-category'),
    description: input.description ?? null,
    image_url: input.image_url ?? placeholderImage({ label: input.name || 'Category', category: 'custom', seed: input.name }),
    sort_order: input.sort_order ?? order,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString(),
  }
  if (supabaseReady && supabase) {
    // Let Postgres generate the uuid — don't send demo genId()
    const { id: _id, created_at: _ca, ...insertData } = category
    const { data, error } = await supabase.from('categories').insert(insertData).select().single()
    if (error) throw error
    return data as Category
  }
  mutate((s) => void s.categories.push(category))
  return category
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('categories').update(patch).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const cat = s.categories.find((c) => c.id === id)
    if (cat) Object.assign(cat, patch)
  })
}

export async function deleteCategory(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.categories.splice(s.categories.findIndex((c) => c.id === id), 1))
}

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

export async function fetchMaterials(): Promise<Material[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('materials').select('*').order('name')
    if (error) throw error
    return data as Material[]
  }
  return [...getStore().materials]
}

export async function createMaterial(input: Partial<Material>): Promise<Material> {
  const material: Material = {
    id: genId('mat'),
    name: input.name || 'New Material',
    slug: input.slug || slugify(input.name || 'new-material'),
    description: input.description ?? null,
    properties: input.properties ?? null,
    recommended_usage: input.recommended_usage ?? null,
    colors: input.colors ?? [],
    price_per_gram: input.price_per_gram ?? 1,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString(),
  }
  if (supabaseReady && supabase) {
    const { id: _id, created_at: _ca, ...insertData } = material
    const { data, error } = await supabase.from('materials').insert(insertData).select().single()
    if (error) throw error
    return data as Material
  }
  mutate((s) => void s.materials.push(material))
  return material
}

export async function updateMaterial(id: string, patch: Partial<Material>): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('materials').update(patch).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const m = s.materials.find((m) => m.id === id)
    if (m) Object.assign(m, patch)
  })
}

export async function deleteMaterial(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('materials').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.materials.splice(s.materials.findIndex((m) => m.id === id), 1))
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export async function fetchProducts(opts?: {
  categorySlug?: string
  search?: string
  bestseller?: boolean
  featured?: boolean
  newArrival?: boolean
  limit?: number
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular'
  minPrice?: number
  maxPrice?: number
  materialSlug?: string
  inStockOnly?: boolean
}): Promise<Product[]> {
  if (supabaseReady && supabase) {
    let query = supabase.from('products').select('*, category:categories(*), material:materials(*)')

    // Filter by category slug — first get category id, then filter products
    if (opts?.categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', opts.categorySlug)
        .maybeSingle()
      if (cat) {
        query = query.eq('category_id', cat.id)
      } else {
        return [] // category not found — return empty
      }
    }
    if (opts?.bestseller) query = query.eq('is_bestseller', true)
    if (opts?.featured) query = query.eq('is_featured', true)
    if (opts?.newArrival) query = query.eq('is_new_arrival', true)
    if (opts?.inStockOnly) query = query.gt('stock', 0)
    if (opts?.limit) query = query.limit(opts.limit)
    const { data, error } = await query
    if (error) throw error
    let products = data as Product[]
    if (opts?.search) {
      const q = opts.search.toLowerCase()
      products = products.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    return applySort(products, opts?.sort)
  }
  let products = [...getStore().products].map(joinProduct)
  if (opts?.categorySlug) products = products.filter((p) => p.category?.slug === opts.categorySlug)
  if (opts?.bestseller) products = products.filter((p) => p.is_bestseller)
  if (opts?.featured) products = products.filter((p) => p.is_featured)
  if (opts?.newArrival) products = products.filter((p) => p.is_new_arrival)
  if (opts?.inStockOnly) products = products.filter((p) => p.stock > 0)
  if (opts?.materialSlug) products = products.filter((p) => p.material?.slug === opts.materialSlug)
  if (typeof opts?.minPrice === 'number') products = products.filter((p) => effectivePrice(p) >= opts.minPrice!)
  if (typeof opts?.maxPrice === 'number') products = products.filter((p) => effectivePrice(p) <= opts.maxPrice!)
  if (opts?.search) {
    const q = opts.search.toLowerCase()
    products = products.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  products = applySort(products, opts?.sort)
  if (opts?.limit) products = products.slice(0, opts.limit)
  return products
}

function applySort(products: Product[], sort?: string): Product[] {
  const arr = [...products]
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => effectivePrice(a) - effectivePrice(b))
    case 'price-desc':
      return arr.sort((a, b) => effectivePrice(b) - effectivePrice(a))
    case 'popular':
      return arr.sort((a, b) => b.review_count - a.review_count)
    case 'newest':
    default:
      return arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  }
}

export function effectivePrice(p: Product): number {
  return p.discounted_price ?? p.price
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), material:materials(*)')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return (data as Product) ?? null
  }
  return getStore().products.map(joinProduct).find((p) => p.slug === slug) ?? null
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), material:materials(*)')
      .neq('id', product.id)
      .limit(limit)
    if (error) throw error
    return (data as Product[]) ?? []
  }
  return getStore()
    .products.map(joinProduct)
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.material_id === product.material_id))
    .slice(0, limit)
}

export async function createProduct(input: Partial<Product>): Promise<Product> {
  const product: Product = {
    id: genId('prod'),
    title: input.title || 'New Product',
    slug: input.slug || slugify(input.title || 'new-product'),
    sku: input.sku || `3DH-${Math.floor(Math.random() * 10000)}`,
    description: input.description || '',
    // Convert empty strings to null so Postgres uuid columns don't error
    category_id: input.category_id || null,
    material_id: input.material_id || null,
    price: input.price ?? 0,
    discounted_price: input.discounted_price || null,
    images: input.images && input.images.length ? input.images : [placeholderImage({ label: input.title || 'Product', category: 'custom', seed: input.title })],
    colors: input.colors ?? [{ name: 'Espresso', hex: '#46351D' }],
    dimensions: input.dimensions || null,
    weight: input.weight || null,
    printing_technology: input.printing_technology || null,
    processing_time: input.processing_time || '2–3 days',
    stock: input.stock ?? 0,
    is_customizable: input.is_customizable ?? false,
    is_bestseller: input.is_bestseller ?? false,
    is_featured: input.is_featured ?? false,
    is_new_arrival: input.is_new_arrival ?? true,
    is_active: input.is_active ?? true,
    rating: 0,
    review_count: 0,
    created_at: new Date().toISOString(),
  }
  if (supabaseReady && supabase) {
    // Strip client-side joined fields and demo id before insert
    const { category: _c, material: _m, id: _id, created_at: _ca, ...insertData } = product as any
    const { data, error } = await supabase.from('products').insert(insertData).select().single()
    if (error) throw error
    return data as Product
  }
  mutate((s) => void s.products.push(product))
  return product
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  if (supabaseReady && supabase) {
    // Strip joined/computed fields that don't belong in the DB
    const { category: _c, material: _m, ...cleanPatch } = patch as any
    // Convert empty strings to null for uuid fields
    if (cleanPatch.category_id === '') cleanPatch.category_id = null
    if (cleanPatch.material_id === '') cleanPatch.material_id = null
    if (cleanPatch.discounted_price === '') cleanPatch.discounted_price = null
    const { error } = await supabase.from('products').update(cleanPatch).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const p = s.products.find((p) => p.id === id)
    if (p) Object.assign(p, patch)
  })
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.products.splice(s.products.findIndex((p) => p.id === id), 1))
}

/* ------------------------------------------------------------------ */
/* Banners                                                             */
/* ------------------------------------------------------------------ */

export async function fetchBanners(): Promise<Banner[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('banners').select('*').eq('is_active', true).order('sort_order')
    if (error) throw error
    return data as Banner[]
  }
  return [...getStore().banners].filter((b) => b.is_active).sort((a, b) => a.sort_order - b.sort_order)
}

export async function fetchAllBanners(): Promise<Banner[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('banners').select('*').order('sort_order')
    if (error) throw error
    return data as Banner[]
  }
  return [...getStore().banners]
}

export async function saveBanner(banner: Partial<Banner>): Promise<void> {
  if (supabaseReady && supabase) {
    if (banner.id) {
      const { error } = await supabase.from('banners').update(banner).eq('id', banner.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('banners').insert(banner)
      if (error) throw error
    }
    return
  }
  mutate((s) => {
    if (banner.id) {
      const b = s.banners.find((b) => b.id === banner.id)
      if (b) Object.assign(b, banner)
    } else {
      s.banners.push({ id: genId('ban'), title: banner.title || 'Banner', subtitle: banner.subtitle ?? null, image_url: banner.image_url || '', cta_text: banner.cta_text ?? null, cta_link: banner.cta_link ?? null, sort_order: banner.sort_order ?? s.banners.length + 1, is_active: banner.is_active ?? true })
    }
  })
}

export async function deleteBanner(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.banners.splice(s.banners.findIndex((b) => b.id === id), 1))
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export async function fetchOrders(): Promise<Order[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false })
    if (error) throw error
    return data as Order[]
  }
  return [...getStore().orders]
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data as Order[]
  }
  return getStore().orders.filter((o) => o.user_id === userId)
}

export async function createOrder(input: {
  user_id: string | null
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon_code: string | null
  shipping_address: any
  payment_status: Order['payment_status']
  status: Order['status']
}): Promise<Order> {
  const order: Order = {
    id: genId('ord'),
    user_id: input.user_id,
    order_number: `HUB-${Date.now().toString().slice(-6)}`,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    shipping: input.shipping,
    total: input.total,
    coupon_code: input.coupon_code,
    status: input.status,
    payment_status: input.payment_status,
    tracking_number: null,
    shipping_address: input.shipping_address,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (supabaseReady && supabase) {
    const { data: orderRow, error: oErr } = await supabase.from('orders').insert({
      // No id — let Postgres generate a proper UUID
      user_id: order.user_id,
      order_number: order.order_number,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      coupon_code: order.coupon_code,
      status: order.status,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
    }).select().single()
    if (oErr) throw oErr
    const savedOrder = orderRow as unknown as Order
    // Use the DB-generated UUID for order items
    const rows = order.items.map((it) => ({
      order_id: savedOrder.id,
      product_id: it.product_id || null,
      product_title: it.product_title,
      product_image: it.product_image,
      quantity: it.quantity,
      price: it.price,
      color: it.color,
    }))
    const { error: iErr } = await supabase.from('order_items').insert(rows)
    if (iErr) throw iErr
    return savedOrder
  }
  mutate((s) => {
    s.orders.unshift(order)
    // decrement stock
    for (const item of order.items) {
      const p = s.products.find((p) => p.id === item.product_id)
      if (p) p.stock = Math.max(0, p.stock - item.quantity)
    }
  })
  return order
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('orders').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const o = s.orders.find((o) => o.id === id)
    if (o) Object.assign(o, patch, { updated_at: new Date().toISOString() })
  })
}

/* ------------------------------------------------------------------ */
/* Custom print requests                                               */
/* ------------------------------------------------------------------ */

export async function fetchCustomRequests(): Promise<CustomPrintRequest[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('custom_print_requests').select('*, material:materials(*), files:custom_print_files(*)').order('created_at', { ascending: false })
    if (error) throw error
    return data as CustomPrintRequest[]
  }
  return [...getStore().customRequests].map((r) => ({ ...r, material: getStore().materials.find((m) => m.id === r.material_id) }))
}

export async function fetchUserCustomRequests(userId: string): Promise<CustomPrintRequest[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('custom_print_requests').select('*, material:materials(*), files:custom_print_files(*)').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data as CustomPrintRequest[]
  }
  return getStore().customRequests.filter((r) => r.user_id === userId)
}

export async function createCustomRequest(input: {
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
  files: CustomPrintFile[]
}): Promise<CustomPrintRequest> {
  const request: CustomPrintRequest = {
    id: genId('cpr'),
    request_number: `CPR-${Date.now().toString().slice(-6)}`,
    user_id: input.user_id,
    customer_name: input.customer_name,
    email: input.email,
    phone: input.phone,
    description: input.description,
    material_id: input.material_id,
    color: input.color,
    dimensions: input.dimensions,
    quantity: input.quantity,
    instructions: input.instructions,
    status: 'submitted',
    files: input.files,
    created_at: new Date().toISOString(),
    material: input.material_id ? getStore().materials.find((m) => m.id === input.material_id) : undefined,
  }
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('custom_print_requests').insert({
      request_number: request.request_number,
      user_id: request.user_id,
      customer_name: request.customer_name,
      email: request.email,
      phone: request.phone,
      description: request.description,
      material_id: request.material_id,
      color: request.color,
      dimensions: request.dimensions,
      quantity: request.quantity,
      instructions: request.instructions,
      status: request.status,
    }).select().single()
    if (error) throw error
    if (input.files.length) {
      await supabase.from('custom_print_files').insert(input.files.map((f) => ({ ...f, request_id: (data as CustomPrintRequest).id })))
    }
    return { ...(data as CustomPrintRequest), files: input.files }
  }
  mutate((s) => void s.customRequests.unshift(request))
  return request
}

export async function updateCustomRequest(id: string, patch: Partial<CustomPrintRequest>): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('custom_print_requests').update(patch).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const r = s.customRequests.find((r) => r.id === id)
    if (r) Object.assign(r, patch)
  })
}

/* ------------------------------------------------------------------ */
/* Quotations                                                          */
/* ------------------------------------------------------------------ */

export async function fetchQuotations(): Promise<Quotation[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('quotations').select('*, request:custom_print_requests(*)').order('created_at', { ascending: false })
    if (error) throw error
    return data as Quotation[]
  }
  return [...getStore().quotations]
}

export async function createQuotation(input: { request_id: string; price: number; estimated_days: number; notes: string | null }): Promise<Quotation> {
  const quotation: Quotation = {
    id: genId('quo'),
    request_id: input.request_id,
    price: input.price,
    estimated_days: input.estimated_days,
    notes: input.notes,
    status: 'pending',
    created_at: new Date().toISOString(),
  }
  if (supabaseReady && supabase) {
    const { id: _id, created_at: _ca, request: _r, ...insertData } = quotation as any
    const { data, error } = await supabase.from('quotations').insert(insertData).select().single()
    if (error) throw error
    await supabase.from('custom_print_requests').update({ status: 'quoted' }).eq('id', input.request_id)
    return data as Quotation
  }
  mutate((s) => {
    s.quotations.unshift(quotation)
    const r = s.customRequests.find((r) => r.id === input.request_id)
    if (r) r.status = 'quoted'
  })
  return quotation
}

export async function respondToQuotation(id: string, status: 'accepted' | 'rejected'): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('quotations').update({ status }).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const q = s.quotations.find((q) => q.id === id)
    if (q) q.status = status
  })
}

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */

export async function fetchCoupons(): Promise<Coupon[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Coupon[]
  }
  return [...getStore().coupons]
}

export async function validateCoupon(code: string, subtotal: number): Promise<Coupon | null> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).maybeSingle()
    if (error) throw error
    const c = data as Coupon
    if (!c) return null
    if (subtotal < c.min_order) return null
    return c
  }
  return getStore().coupons.find((c) => c.code === code.toUpperCase() && c.is_active && subtotal >= c.min_order) ?? null
}

export function applyCoupon(coupon: Coupon, subtotal: number): number {
  if (coupon.type === 'percentage') return Math.round((subtotal * coupon.value) / 100)
  return Math.min(coupon.value, subtotal)
}

export async function saveCoupon(coupon: Partial<Coupon>): Promise<void> {
  if (supabaseReady && supabase) {
    if (coupon.id) {
      const { error } = await supabase.from('coupons').update(coupon).eq('id', coupon.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('coupons').insert(coupon)
      if (error) throw error
    }
    return
  }
  mutate((s) => {
    if (coupon.id) {
      const c = s.coupons.find((c) => c.id === coupon.id)
      if (c) Object.assign(c, coupon)
    } else {
      s.coupons.push({ id: genId('cpn'), code: coupon.code || 'CODE', description: coupon.description ?? null, type: coupon.type || 'percentage', value: coupon.value || 0, min_order: coupon.min_order ?? 0, max_uses: coupon.max_uses ?? null, used_count: 0, expires_at: coupon.expires_at ?? null, is_active: coupon.is_active ?? true })
    }
  })
}

export async function deleteCoupon(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.coupons.splice(s.coupons.findIndex((c) => c.id === id), 1))
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function fetchReviews(productId?: string, onlyApproved = false): Promise<Review[]> {
  if (supabaseReady && supabase) {
    let query = supabase.from('reviews').select('*')
    if (productId) query = query.eq('product_id', productId)
    if (onlyApproved) query = query.eq('is_approved', true)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data as Review[]
  }
  return getStore().reviews.filter((r) => (!productId || r.product_id === productId) && (!onlyApproved || r.is_approved))
}

export async function createReview(review: Partial<Review>): Promise<void> {
  const full: Review = {
    id: genId('rev'),
    product_id: review.product_id || '',
    user_id: review.user_id || 'guest',
    user_name: review.user_name || 'Anonymous',
    rating: review.rating || 5,
    title: review.title || '',
    body: review.body || '',
    photo_url: review.photo_url ?? null,
    product_name: review.product_name ?? null,
    is_approved: false,
    created_at: new Date().toISOString(),
  }
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('reviews').insert(full)
    if (error) throw error
    return
  }
  mutate((s) => void s.reviews.unshift(full))
}

export async function saveReview(review: Partial<Review>): Promise<void> {
  if (supabaseReady && supabase) {
    const payload = {
      ...review,
      product_id: review.product_id || '00000000-0000-0000-0000-000000000000',
      user_id: review.user_id || '00000000-0000-0000-0000-000000000000',
    }
    if (review.id) {
      const { id: _id, created_at: _ca, ...updateData } = payload as any
      const { error } = await supabase.from('reviews').update(updateData).eq('id', review.id)
      if (error) throw error
    } else {
      const { id: _id, created_at: _ca, ...insertData } = payload as any
      const { error } = await supabase.from('reviews').insert(insertData)
      if (error) throw error
    }
    return
  }
  mutate((s) => {
    if (review.id) {
      const r = s.reviews.find((r) => r.id === review.id)
      if (r) Object.assign(r, review)
    } else {
      s.reviews.unshift({
        id: genId('rev'),
        product_id: review.product_id || '',
        user_id: review.user_id || 'admin',
        user_name: review.user_name || 'Customer',
        rating: review.rating || 5,
        title: review.title || '',
        body: review.body || '',
        photo_url: review.photo_url ?? null,
        product_name: review.product_name ?? null,
        is_approved: review.is_approved ?? true,
        created_at: new Date().toISOString(),
      })
    }
  })
}

export async function deleteReview(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.reviews.splice(s.reviews.findIndex((r) => r.id === id), 1))
}

export async function setReviewApproval(id: string, approved: boolean): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('reviews').update({ is_approved: approved }).eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => {
    const r = s.reviews.find((r) => r.id === id)
    if (r) r.is_approved = approved
  })
}

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export async function fetchBlogPosts(onlyPublished = false): Promise<BlogPost[]> {
  if (supabaseReady && supabase) {
    let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    if (onlyPublished) query = query.eq('is_published', true)
    const { data, error } = await query
    if (error) throw error
    return data as BlogPost[]
  }
  return getStore().blogPosts.filter((b) => !onlyPublished || b.is_published)
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return (data as BlogPost) ?? null
  }
  return getStore().blogPosts.find((b) => b.slug === slug) ?? null
}

export async function saveBlogPost(post: Partial<BlogPost>): Promise<void> {
  if (supabaseReady && supabase) {
    if (post.id) {
      const { error } = await supabase.from('blog_posts').update(post).eq('id', post.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('blog_posts').insert(post)
      if (error) throw error
    }
    return
  }
  mutate((s) => {
    if (post.id) {
      const b = s.blogPosts.find((b) => b.id === post.id)
      if (b) Object.assign(b, post)
    } else {
      s.blogPosts.unshift({ id: genId('blog'), title: post.title || 'Untitled', slug: post.slug || slugify(post.title || 'untitled'), excerpt: post.excerpt || '', body: post.body || '', cover_image: post.cover_image ?? null, author: post.author || '3D HUB Team', is_published: post.is_published ?? false, published_at: post.is_published ? new Date().toISOString() : null, created_at: new Date().toISOString() })
    }
  })
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) throw error
    return
  }
  mutate((s) => void s.blogPosts.splice(s.blogPosts.findIndex((b) => b.id === id), 1))
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function fetchSettings(): Promise<SiteSettings> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
    if (error) throw error
    return (data as SiteSettings) ?? getStore().settings
  }
  return getStore().settings
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('site_settings').update(patch).neq('brand_name', '__none__')
    if (error) {
      // settings row may not exist yet — upsert instead
      const { error: e2 } = await supabase.from('site_settings').upsert({ ...getStore().settings, ...patch })
      if (e2) throw e2
    }
    return
  }
  mutate((s) => Object.assign(s.settings, patch))
}

/* ------------------------------------------------------------------ */
/* Analytics / dashboard stats                                         */
/* ------------------------------------------------------------------ */

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (supabaseReady && supabase) {
    const [orders, products, profiles, requests, quotations] = await Promise.all([
      supabase.from('orders').select('total, status').eq('payment_status', 'paid'),
      supabase.from('products').select('stock'),
      supabase.from('profiles').select('id, role').eq('role', 'customer'),
      supabase.from('custom_print_requests').select('status'),
      supabase.from('quotations').select('status').eq('status', 'pending'),
    ])
    const totalRevenue = (orders.data as Pick<Order, 'total' | 'status'>[]).reduce((s, o) => s + o.total, 0)
    const lowStock = (products.data as Pick<Product, 'stock'>[]).filter((p) => p.stock < 5).length
    return {
      totalRevenue,
      totalOrders: orders.data?.length ?? 0,
      totalCustomers: profiles.data?.length ?? 0,
      totalProducts: products.data?.length ?? 0,
      pendingOrders: (orders.data as Pick<Order, 'status'>[]).filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
      customRequests: requests.data?.length ?? 0,
      pendingQuotations: quotations.data?.length ?? 0,
      lowStockProducts: lowStock,
    }
  }
  const s = getStore()
  const paidOrders = s.orders.filter((o) => o.payment_status === 'paid')
  return {
    totalRevenue: paidOrders.reduce((acc, o) => acc + o.total, 0),
    totalOrders: s.orders.length,
    totalCustomers: s.profiles.filter((p) => p.role === 'customer').length,
    totalProducts: s.products.length,
    pendingOrders: s.orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
    customRequests: s.customRequests.length,
    pendingQuotations: s.quotations.filter((q) => q.status === 'pending').length,
    lowStockProducts: s.products.filter((p) => p.stock < 5).length,
  }
}

export async function fetchSalesSeries(months = 6): Promise<{ label: string; revenue: number; orders: number }[]> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.from('orders').select('total, created_at').eq('payment_status', 'paid')
    if (error) throw error
    return aggregateSales(data as Pick<Order, 'total' | 'created_at'>[], months)
  }
  return aggregateSales(getStore().orders.filter((o) => o.payment_status === 'paid'), months)
}

function aggregateSales(orders: Pick<Order, 'total' | 'created_at'>[], months: number) {
  const buckets: { label: string; revenue: number; orders: number; key: string }[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-IN', { month: 'short' }), revenue: 0, orders: 0 })
  }
  for (const o of orders) {
    const d = new Date(o.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const b = buckets.find((b) => b.key === key)
    if (b) {
      b.revenue += o.total
      b.orders += 1
    }
  }
  return buckets.map(({ label, revenue, orders }) => ({ label, revenue, orders }))
}

/* ------------------------------------------------------------------ */
/* File uploads                                                        */
/* ------------------------------------------------------------------ */

// Map Supabase bucket names → Cloudinary folder names
const BUCKET_TO_FOLDER: Record<keyof typeof BUCKETS, CloudinaryFolder> = {
  products: 'products',
  banners: 'banners',
  customRequests: 'custom-requests',
  avatars: 'avatars',
}

export async function uploadFile(bucket: keyof typeof BUCKETS, _path: string, file: File): Promise<string | null> {
  // 1. Cloudinary — preferred for all image uploads
  if (cloudinaryReady) {
    const folder = BUCKET_TO_FOLDER[bucket]
    return uploadToCloudinary(file, folder)
  }

  // 2. Supabase Storage fallback
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.storage.from(BUCKETS[bucket]).upload(_path, file, { upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage.from(BUCKETS[bucket]).getPublicUrl(data.path)
    return urlData.publicUrl
  }

  // 3. Demo mode — local preview only, resets on refresh
  return URL.createObjectURL(file)
}

export async function uploadProductImage(productId: string, file: File): Promise<string | null> {
  if (cloudinaryReady) {
    return uploadToCloudinary(file, 'products')
  }
  const ext = file.name.split('.').pop()
  const path = `${productId}/${Date.now()}.${ext}`
  return uploadFile('products', path, file)
}

/** Upload a 3D design file (STL/OBJ/3MF/STEP) or reference image for custom print requests */
export async function uploadCustomPrintFile(file: File): Promise<string | null> {
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(file.name)

  if (cloudinaryReady) {
    return isImage
      ? uploadToCloudinary(file, 'custom-requests')
      : uploadRawToCloudinary(file, 'custom-requests')
  }

  if (supabaseReady && supabase) {
    const path = `requests/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from(BUCKETS.customRequests)
      .upload(path, file, { upsert: true })
    if (error) throw error
    // Private bucket — return path, not public URL
    return data.path
  }

  return URL.createObjectURL(file)
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export async function subscribeNewsletter(email: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email })
    if (error) throw error
    return
  }
  // demo mode: no-op (would store in seed in a real run)
}
