import type { Category, Product, Material, BlogPost, SiteSettings } from '@/types'
import { placeholderImage } from './placeholder'
import { DEFAULT_MATERIALS } from './constants'

const now = new Date().toISOString()
const id = (n: number) => `seed-${n.toString().padStart(3, '0')}`

export const seedCategories: Category[] = [
  { id: id(1), name: 'Home Decor & Lifestyle', slug: 'home-decor', description: '3D-printed decor that brings warmth and character to your space.', image_url: placeholderImage({ label: 'Home Decor', category: 'home-decor', seed: 'cat1' }), sort_order: 1, is_active: true, created_at: now },
  { id: id(2), name: 'Desk Accessories & Organizers', slug: 'desk-accessories', description: 'Keep your workspace tidy with printed organizers and holders.', image_url: placeholderImage({ label: 'Desk Accessories', category: 'desk-accessories', seed: 'cat2' }), sort_order: 2, is_active: true, created_at: now },
  { id: id(3), name: 'Tech Accessories', slug: 'tech-accessories', description: 'Charging docks, cable managers and tech-ready prints.', image_url: placeholderImage({ label: 'Tech Accessories', category: 'tech-accessories', seed: 'cat3' }), sort_order: 3, is_active: true, created_at: now },
  { id: id(4), name: 'Phone Stands & Holders', slug: 'phone-stands', description: 'Sturdy, stylish stands for every device.', image_url: placeholderImage({ label: 'Phone Stands', category: 'tech-accessories', seed: 'cat4' }), sort_order: 4, is_active: true, created_at: now },
  { id: id(5), name: 'Personalized Gifts', slug: 'personalized-gifts', description: 'Custom-engraved and personalized prints for every occasion.', image_url: placeholderImage({ label: 'Personalized Gifts', category: 'personalized-gifts', seed: 'cat5' }), sort_order: 5, is_active: true, created_at: now },
  { id: id(6), name: 'Keychains & Accessories', slug: 'keychains', description: 'Lightweight, durable everyday carry prints.', image_url: placeholderImage({ label: 'Keychains', category: 'keychains', seed: 'cat6' }), sort_order: 6, is_active: true, created_at: now },
  { id: id(7), name: 'Miniatures & Collectibles', slug: 'miniatures-models', description: 'High-detail miniatures and collectible models.', image_url: placeholderImage({ label: 'Miniatures', category: 'miniatures-models', seed: 'cat7' }), sort_order: 7, is_active: true, created_at: now },
  { id: id(8), name: 'Toys & Creative Models', slug: 'toys-creative', description: 'Articulated toys and creative play models.', image_url: placeholderImage({ label: 'Toys', category: 'toys-creative', seed: 'cat8' }), sort_order: 8, is_active: true, created_at: now },
  { id: id(9), name: 'Functional Tools & Utility', slug: 'functional-tools', description: 'Practical printed tools that solve real problems.', image_url: placeholderImage({ label: 'Tools', category: 'functional-tools', seed: 'cat9' }), sort_order: 9, is_active: true, created_at: now },
  { id: id(10), name: 'Custom 3D Printed Products', slug: 'custom-products', description: 'Upload your design and we print it for you.', image_url: placeholderImage({ label: 'Custom', category: 'custom', seed: 'cat10' }), sort_order: 10, is_active: true, created_at: now },
]

export const seedMaterials: Material[] = DEFAULT_MATERIALS.map((m, i) => ({
  ...m,
  id: id(100 + i),
  created_at: now,
}))

const COLORS = {
  espresso: { name: 'Espresso', hex: '#46351D' },
  olive: { name: 'Olive', hex: '#646F4B' },
  sageTeal: { name: 'Sage', hex: '#839D9A' },
  sky: { name: 'Sky Blue', hex: '#7BB2D9' },
  softSage: { name: 'Soft Sage', hex: '#BFD2BF' },
  white: { name: 'White', hex: '#FFFFFF' },
  black: { name: 'Charcoal', hex: '#222222' },
}

function img(label: string, category: string, seed: string, n = 4): string[] {
  return Array.from({ length: n }, (_, i) =>
    placeholderImage({ label, category, seed: `${seed}-${i}`, width: 800, height: 800 }),
  )
}

interface SeedProduct {
  title: string
  slug: string
  category_slug: string
  material_slug: string
  price: number
  discounted_price: number | null
  description: string
  colors: string[]
  dimensions: string
  weight: string
  printing_technology: string
  processing_time: string
  stock: number
  is_bestseller: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_customizable: boolean
  rating: number
  review_count: number
}

const seedProductDefs: SeedProduct[] = [
  { title: 'Geo Vase — Hexagon', slug: 'geo-vase-hexagon', category_slug: 'home-decor', material_slug: 'pla', price: 1290, discounted_price: 990, description: 'A faceted hexagonal vase printed in premium PLA with a smooth matte finish. Perfect for dried flowers or as a sculptural accent. Watertight liner compatible.', colors: ['olive', 'sageTeal', 'white', 'espresso'], dimensions: '180 × 180 × 240 mm', weight: '320 g', printing_technology: 'FDM (PLA)', processing_time: '2–3 days', stock: 24, is_bestseller: true, is_featured: true, is_new_arrival: false, is_customizable: true, rating: 4.8, review_count: 42 },
  { title: 'Modular Desk Organizer', slug: 'modular-desk-organizer', category_slug: 'desk-accessories', material_slug: 'petg', price: 1790, discounted_price: 1490, description: 'Stackable desk organizer with slots for pens, cards, and your phone. Snap-together modular design lets you expand as needed.', colors: ['espresso', 'sageTeal', 'softSage'], dimensions: '220 × 120 × 90 mm', weight: '410 g', printing_technology: 'FDM (PETG)', processing_time: '2–4 days', stock: 18, is_bestseller: true, is_featured: true, is_new_arrival: true, is_customizable: false, rating: 4.7, review_count: 31 },
  { title: 'Articulated Dragon Model', slug: 'articulated-dragon-model', category_slug: 'miniatures-models', material_slug: 'pla-plus', price: 2490, discounted_price: 1990, description: 'Fully articulated print-in-place dragon. Every joint moves — no assembly required. A showpiece for collectors and a delight for kids.', colors: ['olive', 'sageTeal', 'sky', 'espresso'], dimensions: '320 × 240 × 80 mm', weight: '260 g', printing_technology: 'FDM (PLA+)', processing_time: '3–5 days', stock: 12, is_bestseller: true, is_featured: true, is_new_arrival: true, is_customizable: false, rating: 4.9, review_count: 88 },
  { title: 'Floating Wall Planter', slug: 'floating-wall-planter', category_slug: 'home-decor', material_slug: 'pla', price: 890, discounted_price: 690, description: 'Minimal wall-mounted planter with a hidden reservoir. Brings greenery to any wall without the mess.', colors: ['softSage', 'white', 'sageTeal'], dimensions: '140 × 80 × 120 mm', weight: '150 g', printing_technology: 'FDM (PLA)', processing_time: '1–2 days', stock: 40, is_bestseller: false, is_featured: true, is_new_arrival: false, is_customizable: false, rating: 4.6, review_count: 19 },
  { title: 'Cable Management Clip Set (12)', slug: 'cable-management-clip-set', category_slug: 'tech-accessories', material_slug: 'tpu', price: 590, discounted_price: null, description: 'A set of 12 flexible TPU cable clips that snap onto desks and walls. Reusable and gentle on cables.', colors: ['espresso', 'olive', 'black'], dimensions: '40 × 25 × 25 mm each', weight: '90 g set', printing_technology: 'FDM (TPU)', processing_time: '1–2 days', stock: 80, is_bestseller: false, is_featured: false, is_new_arrival: false, is_customizable: false, rating: 4.5, review_count: 12 },
  { title: 'Magnetic Phone Stand', slug: 'magnetic-phone-stand', category_slug: 'phone-stands', material_slug: 'pla-plus', price: 790, discounted_price: 590, description: 'Sleek phone stand with an embedded magnet for MagSafe-compatible devices. Adjustable angle with satisfying detents.', colors: ['espresso', 'olive', 'sageTeal', 'sky'], dimensions: '70 × 60 × 45 mm', weight: '120 g', printing_technology: 'FDM (PLA+)', processing_time: '2–3 days', stock: 35, is_bestseller: true, is_featured: true, is_new_arrival: true, is_customizable: false, rating: 4.8, review_count: 56 },
  { title: 'Personalized Name Keychain', slug: 'personalized-name-keychain', category_slug: 'personalized-gifts', material_slug: 'pla', price: 350, discounted_price: 290, description: 'Custom name keychain with your choice of font and color. A perfect small gift or party favor.', colors: ['espresso', 'olive', 'sageTeal', 'sky', 'softSage', 'white'], dimensions: '80 × 30 × 6 mm', weight: '20 g', printing_technology: 'FDM (PLA)', processing_time: '1–2 days', stock: 200, is_bestseller: true, is_featured: true, is_new_arrival: false, is_customizable: true, rating: 4.9, review_count: 134 },
  { title: 'Resin Miniature — Fantasy Knight', slug: 'resin-miniature-fantasy-knight', category_slug: 'miniatures-models', material_slug: 'resin', price: 1890, discounted_price: 1590, description: 'Ultra-detailed 32mm resin knight miniature, primed and ready to paint. Sharp edges and crisp details only resin can deliver.', colors: ['espresso', 'sageTeal', 'sky'], dimensions: '40 × 35 × 45 mm', weight: '18 g', printing_technology: 'SLA (Resin)', processing_time: '3–5 days', stock: 25, is_bestseller: false, is_featured: false, is_new_arrival: true, is_customizable: false, rating: 4.7, review_count: 23 },
  { title: 'Articulated Octopus Toy', slug: 'articulated-octopus-toy', category_slug: 'toys-creative', material_slug: 'pla', price: 690, discounted_price: 550, description: 'Squishy articulated octopus that wiggles in your hand. A crowd favorite for kids and desks alike.', colors: ['sky', 'sageTeal', 'olive', 'softSage', 'espresso'], dimensions: '180 × 180 × 60 mm', weight: '70 g', printing_technology: 'FDM (PLA)', processing_time: '1–2 days', stock: 60, is_bestseller: true, is_featured: true, is_new_arrival: false, is_customizable: false, rating: 4.8, review_count: 97 },
  { title: 'Custom Photo Frame — Hex', slug: 'custom-photo-frame-hex', category_slug: 'personalized-gifts', material_slug: 'pla-plus', price: 990, discounted_price: 890, description: 'Hexagonal photo frame you can personalize with a name or date engraved into the surface.', colors: ['espresso', 'olive', 'sageTeal', 'softSage', 'white'], dimensions: '200 × 200 × 20 mm', weight: '180 g', printing_technology: 'FDM (PLA+)', processing_time: '2–3 days', stock: 30, is_bestseller: false, is_featured: true, is_new_arrival: true, is_customizable: true, rating: 4.7, review_count: 28 },
  { title: 'Adjustable Wrench Holder', slug: 'adjustable-wrench-holder', category_slug: 'functional-tools', material_slug: 'petg', price: 450, discounted_price: null, description: 'Mountable tool holder that flexes to grip wrenches of different sizes. Strong PETG construction.', colors: ['espresso', 'olive', 'black'], dimensions: '120 × 40 × 60 mm', weight: '60 g', printing_technology: 'FDM (PETG)', processing_time: '1–2 days', stock: 90, is_bestseller: false, is_featured: false, is_new_arrival: false, is_customizable: false, rating: 4.4, review_count: 8 },
  { title: 'Galaxy Coaster Set (4)', slug: 'galaxy-coaster-set', category_slug: 'home-decor', material_slug: 'pla', price: 690, discounted_price: 590, description: 'A set of four coasters with a swirling galaxy texture. Cork-free, self-drying matte surface.', colors: ['espresso', 'sageTeal', 'sky', 'olive'], dimensions: '95 × 95 × 8 mm each', weight: '180 g set', printing_technology: 'FDM (PLA)', processing_time: '2–3 days', stock: 45, is_bestseller: false, is_featured: false, is_new_arrival: true, is_customizable: true, rating: 4.6, review_count: 21 },
  { title: 'Laptop Riser — Ergo', slug: 'laptop-riser-ergo', category_slug: 'desk-accessories', material_slug: 'pla-plus', price: 1490, discounted_price: 1190, description: 'Ergonomic laptop riser with ventilation channels. Folds flat for travel. Fits 11–17 inch laptops.', colors: ['espresso', 'sageTeal', 'olive'], dimensions: '300 × 220 × 90 mm', weight: '520 g', printing_technology: 'FDM (PLA+)', processing_time: '3–4 days', stock: 16, is_bestseller: true, is_featured: true, is_new_arrival: false, is_customizable: false, rating: 4.8, review_count: 47 },
  { title: 'Headphone Stand — Arc', slug: 'headphone-stand-arc', category_slug: 'desk-accessories', material_slug: 'pla-plus', price: 1190, discounted_price: 990, description: 'Sweeping arc headphone stand that cradles any headset. Anti-slip base keeps it planted.', colors: ['espresso', 'olive', 'sageTeal', 'black'], dimensions: '110 × 110 × 230 mm', weight: '340 g', printing_technology: 'FDM (PLA+)', processing_time: '2–3 days', stock: 22, is_bestseller: false, is_featured: true, is_new_arrival: true, is_customizable: false, rating: 4.7, review_count: 33 },
  { title: 'Watch Stand — Mono', slug: 'watch-stand-mono', category_slug: 'desk-accessories', material_slug: 'pla', price: 550, discounted_price: 450, description: 'Minimal single-piece watch stand for nightstands and desks. Soft-touch finish protects your watch.', colors: ['espresso', 'olive', 'sageTeal', 'softSage'], dimensions: '90 × 70 × 70 mm', weight: '90 g', printing_technology: 'FDM (PLA)', processing_time: '1–2 days', stock: 50, is_bestseller: false, is_featured: false, is_new_arrival: false, is_customizable: true, rating: 4.5, review_count: 15 },
  { title: 'Geometric Bookends (Pair)', slug: 'geometric-bookends-pair', category_slug: 'home-decor', material_slug: 'petg', price: 1290, discounted_price: 1090, description: 'Weighty geometric bookends that hold your shelf together with style. Felt-padded bases.', colors: ['espresso', 'olive', 'sageTeal', 'black'], dimensions: '130 × 90 × 160 mm each', weight: '480 g pair', printing_technology: 'FDM (PETG)', processing_time: '3–4 days', stock: 14, is_bestseller: false, is_featured: true, is_new_arrival: false, is_customizable: false, rating: 4.6, review_count: 11 },
  { title: 'Plant Pot — Ribbed', slug: 'plant-pot-ribbed', category_slug: 'home-decor', material_slug: 'pla', price: 790, discounted_price: 690, description: 'Ribbed cylindrical planter with drainage tray. Available in earthy tones for a calm, natural shelf.', colors: ['softSage', 'espresso', 'olive', 'sageTeal'], dimensions: '130 × 130 × 140 mm', weight: '240 g', printing_technology: 'FDM (PLA)', processing_time: '2–3 days', stock: 28, is_bestseller: false, is_featured: false, is_new_arrival: true, is_customizable: false, rating: 4.5, review_count: 9 },
  { title: 'SD Card Vault (12-slot)', slug: 'sd-card-vault', category_slug: 'tech-accessories', material_slug: 'petg', price: 490, discounted_price: null, description: 'Compact vault holding 12 SD cards with friction-fit slots. Labeled for easy organization.', colors: ['espresso', 'olive', 'black'], dimensions: '70 × 50 × 20 mm', weight: '40 g', printing_technology: 'FDM (PETG)', processing_time: '1–2 days', stock: 70, is_bestseller: false, is_featured: false, is_new_arrival: true, is_customizable: false, rating: 4.6, review_count: 6 },
  { title: 'Custom Lithophane Night Light', slug: 'custom-lithophane-night-light', category_slug: 'personalized-gifts', material_slug: 'pla-plus', price: 1490, discounted_price: 1290, description: 'Upload a photo and we print a lithophane that reveals your image when backlit. A keepsake gift.', colors: ['white', 'espresso'], dimensions: '150 × 150 × 40 mm', weight: '160 g', printing_technology: 'FDM (PLA+)', processing_time: '3–5 days', stock: 20, is_bestseller: false, is_featured: true, is_new_arrival: true, is_customizable: true, rating: 4.9, review_count: 41 },
  { title: 'Miniature Terrain — Forest Cliff', slug: 'miniature-terrain-forest-cliff', category_slug: 'miniatures-models', material_slug: 'resin', price: 2190, discounted_price: 1890, description: 'Detailed tabletop terrain piece with rocky cliffs and tree slots. Scale 28mm. Ready for paint and flock.', colors: ['espresso', 'sageTeal', 'olive'], dimensions: '200 × 150 × 80 mm', weight: '320 g', printing_technology: 'SLA (Resin)', processing_time: '4–6 days', stock: 10, is_bestseller: false, is_featured: true, is_new_arrival: true, is_customizable: false, rating: 4.8, review_count: 17 },
  { title: 'Key Organizer — Swiss', slug: 'key-organizer-swiss', category_slug: 'keychains', material_slug: 'tpu', price: 450, discounted_price: 350, description: 'Slim key organizer that silences your keys and keeps them stacked. Holds up to 6 keys.', colors: ['espresso', 'olive', 'sageTeal', 'black'], dimensions: '70 × 18 × 8 mm', weight: '30 g', printing_technology: 'FDM (TPU)', processing_time: '1–2 days', stock: 65, is_bestseller: false, is_featured: false, is_new_arrival: false, is_customizable: true, rating: 4.4, review_count: 22 },
  { title: 'Geared Fidget Desk Toy', slug: 'geared-fidget-desk-toy', category_slug: 'toys-creative', material_slug: 'pla', price: 590, discounted_price: 490, description: 'Print-in-place geared fidget toy with mesmerizing motion. Quiet and satisfying.', colors: ['sky', 'sageTeal', 'olive', 'espresso'], dimensions: '90 × 90 × 12 mm', weight: '50 g', printing_technology: 'FDM (PLA)', processing_time: '1–2 days', stock: 55, is_bestseller: false, is_featured: true, is_new_arrival: true, is_customizable: false, rating: 4.7, review_count: 38 },
  { title: 'Wall-Mounted Cable Spool', slug: 'wall-mounted-cable-spool', category_slug: 'functional-tools', material_slug: 'petg', price: 690, discounted_price: null, description: 'Wall-mounted spool that dispenses and retracts your cables. Mounts with two screws.', colors: ['espresso', 'olive', 'sageTeal'], dimensions: '160 × 60 × 60 mm', weight: '120 g', printing_technology: 'FDM (PETG)', processing_time: '2–3 days', stock: 38, is_bestseller: false, is_featured: false, is_new_arrival: true, is_customizable: false, rating: 4.3, review_count: 7 },
  { title: 'Custom Wall Sign — 3D HUB', slug: 'custom-wall-sign', category_slug: 'custom-products', material_slug: 'pla-plus', price: 1990, discounted_price: null, description: 'Custom 3D wall sign with your text or logo. Tell us the size and we design and print it.', colors: ['espresso', 'olive', 'sageTeal', 'sky', 'softSage', 'white'], dimensions: 'Custom (up to 300 mm)', weight: 'Varies', printing_technology: 'FDM (PLA+)', processing_time: '5–7 days', stock: 999, is_bestseller: false, is_featured: true, is_new_arrival: true, is_customizable: true, rating: 4.8, review_count: 14 },
]

export const seedProducts: Product[] = seedProductDefs.map((p, i) => {
  const category = seedCategories.find((c) => c.slug === p.category_slug)!
  const material = seedMaterials.find((m) => m.slug === p.material_slug)!
  const colorObjs = p.colors.map((c) => COLORS[c as keyof typeof COLORS])
  return {
    id: id(200 + i),
    title: p.title,
    slug: p.slug,
    sku: `3DH-${(i + 1).toString().padStart(4, '0')}`,
    description: p.description,
    category_id: category.id,
    material_id: material.id,
    price: p.price,
    discounted_price: p.discounted_price,
    images: img(p.title, p.category_slug, p.slug),
    colors: colorObjs,
    dimensions: p.dimensions,
    weight: p.weight,
    printing_technology: p.printing_technology,
    processing_time: p.processing_time,
    stock: p.stock,
    is_customizable: p.is_customizable,
    is_bestseller: p.is_bestseller,
    is_featured: p.is_featured,
    is_new_arrival: p.is_new_arrival,
    is_active: true,
    rating: p.rating,
    review_count: p.review_count,
    created_at: now,
    category,
    material,
  }
})

export const seedBlogPosts: BlogPost[] = [
  {
    id: id(301),
    title: 'PLA vs PETG: Which Filament Should You Choose?',
    slug: 'pla-vs-petg',
    excerpt: 'A practical comparison of the two most popular 3D printing filaments and when to use each.',
    body: 'When choosing a filament, the decision between PLA and PETG usually comes down to the intended use. PLA is easy to print, looks beautiful with a matte finish, and is perfect for decor and display pieces. PETG is stronger, more heat resistant, and better suited for functional parts that need to take some abuse. For anything that will sit on a shelf, PLA is a safe and beautiful choice. For containers, tools, and outdoor items, reach for PETG.',
    cover_image: placeholderImage({ label: 'Filaments', category: 'custom', seed: 'blog1' }),
    author: '3D HUB Team',
    is_published: true,
    published_at: now,
    created_at: now,
  },
  {
    id: id(302),
    title: 'Designing for 3D Printing: 5 Rules for Better Prints',
    slug: 'designing-for-3d-printing',
    excerpt: 'Simple design choices that dramatically improve the quality and strength of your prints.',
    body: 'Good 3D design is about working with the process, not against it. Keep overhangs under 45 degrees to minimize supports, design flat first layers for better adhesion, and round your corners to prevent warping. Add a small chamfer where parts meet the bed. When in doubt, print a small test before committing to a full run.',
    cover_image: placeholderImage({ label: 'Design', category: 'functional-tools', seed: 'blog2' }),
    author: '3D HUB Team',
    is_published: true,
    published_at: now,
    created_at: now,
  },
  {
    id: id(303),
    title: 'Resin Printing Explained: When Detail Matters Most',
    slug: 'resin-printing-explained',
    excerpt: 'Why resin (SLA) printing produces the sharpest miniatures and what it costs in trade-offs.',
    body: 'Resin printing cures liquid resin layer by layer with UV light, producing details far finer than FDM. That makes it the go-to for miniatures, jewelry, and dental models. The trade-off is post-processing: parts need washing and curing, and resin is more brittle. For collectors who want crisp edges, nothing else comes close.',
    cover_image: placeholderImage({ label: 'Resin', category: 'miniatures-models', seed: 'blog3' }),
    author: '3D HUB Team',
    is_published: true,
    published_at: now,
    created_at: now,
  },
]

export const seedSettings: SiteSettings = {
  brand_name: '3D HUB',
  tagline: 'DESIGN. PRINT. CREATE.',
  logo_url: null,
  contact_email: 'hello@3dhub.example',
  contact_phone: '+91 98290 51866',
  address: '3D HUB Studio, Jaipur, India',
  social_links: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com',
  },
  shipping_flat_rate: 79,
  free_shipping_threshold: 999,
  return_policy: 'Returns accepted within 7 days for undamaged, unused products. Custom and personalized items are non-returnable.',
  privacy_policy: 'We respect your privacy and never sell your data. We store only what is needed to fulfill your orders.',
  terms: 'By ordering you agree to our production timelines and material tolerances. Custom designs remain your intellectual property.',
}

export const seedBanners = [
  { id: id(401), title: 'Custom 3D Printing, On Demand', subtitle: 'Upload your design — we handle the rest.', image_url: placeholderImage({ label: 'Custom Printing', category: 'custom', seed: 'banner1', width: 1200, height: 400 }), cta_text: 'Start a Project', cta_link: '/custom-printing', sort_order: 1, is_active: true },
  { id: id(402), title: 'New Miniatures Just Landed', subtitle: 'High-detail resin models for collectors.', image_url: placeholderImage({ label: 'New Arrivals', category: 'miniatures-models', seed: 'banner2', width: 1200, height: 400 }), cta_text: 'Shop Miniatures', cta_link: '/category/miniatures-models', sort_order: 2, is_active: true },
]
