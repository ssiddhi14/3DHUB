/**
 * In-memory mutable store used as the data backend when Supabase is not yet
 * configured (no real env credentials). It is seeded from lib/seed.ts and
 * supports the same CRUD operations the Supabase-backed service layer offers,
 * so the entire site — including the admin dashboard — stays interactive.
 *
 * When Supabase IS configured, the service layer talks to Postgres instead and
 * this store is bypassed.
 */

import {
  seedProducts,
  seedCategories,
  seedMaterials,
  seedBlogPosts,
  seedSettings,
  seedBanners,
} from '@/lib/seed'
import type {
  Product,
  Category,
  Material,
  BlogPost,
  SiteSettings,
  Banner,
  Coupon,
  Order,
  CustomPrintRequest,
  Quotation,
  Review,
  Profile,
} from '@/types'

export interface DataStore {
  products: Product[]
  categories: Category[]
  materials: Material[]
  blogPosts: BlogPost[]
  settings: SiteSettings
  banners: Banner[]
  coupons: Coupon[]
  orders: Order[]
  customRequests: CustomPrintRequest[]
  quotations: Quotation[]
  reviews: Review[]
  profiles: Profile[]
}

const listeners = new Set<() => void>()

const store: DataStore = {
  products: structuredCloneSafe(seedProducts),
  categories: structuredCloneSafe(seedCategories),
  materials: structuredCloneSafe(seedMaterials),
  blogPosts: structuredCloneSafe(seedBlogPosts),
  settings: structuredCloneSafe(seedSettings),
  banners: structuredCloneSafe(seedBanners) as Banner[],
  coupons: [
    { id: 'seed-c1', code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10, min_order: 0, max_uses: null, used_count: 14, expires_at: null, is_active: true },
    { id: 'seed-c2', code: 'HUB500', description: '₹500 off orders over ₹2999', type: 'fixed', value: 500, min_order: 2999, max_uses: 100, used_count: 3, expires_at: null, is_active: true },
  ],
  orders: [],
  customRequests: [],
  quotations: [],
  reviews: [],
  profiles: [],
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

export function getStore(): DataStore {
  return store
}

export function mutate<T>(fn: (s: DataStore) => T): T {
  const result = fn(store)
  listeners.forEach((l) => l())
  return result
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function genId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
