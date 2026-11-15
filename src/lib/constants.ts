import type { Material } from '@/types'

export const BRAND = {
  name: '3D HUB',
  tagline: 'DESIGN. PRINT. CREATE.',
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop All', to: '/shop' },
  { label: 'Home & Decor', to: '/category/home-decor' },
  { label: 'Desk Accessories', to: '/category/desk-accessories' },
  { label: 'Gadgets & Utility', to: '/category/gadgets-utility' },
  { label: 'Personalized Gifts', to: '/category/personalized-gifts' },
  { label: 'Miniatures & Models', to: '/category/miniatures-models' },
  { label: 'Custom 3D Printing', to: '/custom-printing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const

export const MAX_FILE_SIZE_MB = 50
export const MAX_IMAGE_SIZE_MB = 10
export const ALLOWED_3D_EXTENSIONS = ['stl', 'obj', '3mf', 'step', 'stp']
export const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif']

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-sky-100 text-sky-700',
  confirmed: 'bg-sageTeal-100 text-sageTeal-700',
  processing: 'bg-olive-100 text-olive-700',
  shipped: 'bg-softSage-200 text-espresso-700',
  delivered: 'bg-olive-500 text-white',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-espresso-100 text-espresso-600',
}

export const PRINT_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  quoted: 'Quotation Sent',
  approved: 'Approved',
  rejected: 'Rejected',
  in_production: 'In Production',
  completed: 'Completed',
}

export const PRINT_STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-sky-100 text-sky-700',
  under_review: 'bg-sageTeal-100 text-sageTeal-700',
  quoted: 'bg-olive-100 text-olive-700',
  approved: 'bg-olive-500 text-white',
  rejected: 'bg-red-100 text-red-700',
  in_production: 'bg-softSage-200 text-espresso-700',
  completed: 'bg-espresso-700 text-white',
}

/** Default materials shown on the custom-printing form. */
export const DEFAULT_MATERIALS: Omit<Material, 'id' | 'created_at'>[] = [
  {
    name: 'PLA',
    slug: 'pla',
    description: 'Biodegradable, easy to print, great for prototypes and decorative items.',
    properties: 'Low warpage, matte finish, food-safe variants available.',
    recommended_usage: 'Decor, figurines, prototyping, display pieces.',
    colors: ['#46351D', '#646F4B', '#839D9A', '#7BB2D9', '#BFD2BF', '#FFFFFF', '#111111'],
    price_per_gram: 0.8,
    is_active: true,
  },
  {
    name: 'PLA+',
    slug: 'pla-plus',
    description: 'Tougher than standard PLA with improved layer adhesion.',
    properties: 'Higher impact resistance, smoother finish.',
    recommended_usage: 'Functional parts, phone stands, light-load tools.',
    colors: ['#46351D', '#646F4B', '#839D9A', '#BFD2BF', '#FFFFFF'],
    price_per_gram: 1.1,
    is_active: true,
  },
  {
    name: 'PETG',
    slug: 'petg',
    description: 'Durable, chemical resistant, good for functional prints.',
    properties: 'Strong, slightly flexible, water resistant.',
    recommended_usage: 'Containers, mechanical parts, outdoor items.',
    colors: ['#46351D', '#646F4B', '#839D9A', '#7BB2D9', '#FFFFFF'],
    price_per_gram: 1.3,
    is_active: true,
  },
  {
    name: 'ABS',
    slug: 'abs',
    description: 'Tough engineering plastic, heat resistant.',
    properties: 'High impact strength, heat resistant up to ~100°C.',
    recommended_usage: 'Functional tools, enclosures, mechanical parts.',
    colors: ['#46351D', '#111111', '#FFFFFF', '#839D9A'],
    price_per_gram: 1.0,
    is_active: true,
  },
  {
    name: 'TPU',
    slug: 'tpu',
    description: 'Flexible rubber-like filament for parts that need to bend.',
    properties: 'Flexible, abrasion resistant, shock absorbing.',
    recommended_usage: 'Gaskets, phone cases, grips, wearable parts.',
    colors: ['#46351D', '#646F4B', '#839D9A', '#111111'],
    price_per_gram: 1.6,
    is_active: true,
  },
  {
    name: 'Resin',
    slug: 'resin',
    description: 'High-detail resin printing for miniatures and fine models.',
    properties: 'Ultra-fine detail, smooth surface, brittle if thin.',
    recommended_usage: 'Miniatures, jewelry, detailed models, molds.',
    colors: ['#46351D', '#839D9A', '#7BB2D9', '#BFD2BF', '#FFFFFF'],
    price_per_gram: 2.4,
    is_active: true,
  },
]
