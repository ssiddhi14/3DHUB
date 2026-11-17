import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Boxes, Palette, Truck, ShieldCheck,
  PenTool, MousePointerClick, Printer, PackageCheck, Star,
  Quote, Check,
} from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchProducts, fetchBanners, fetchReviews } from '@/services/data'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { CinematicHero } from '@/components/CinematicHero'
import type { Product } from '@/types'

export function Home() {
  const { data: bestSellers, loading: bsLoading } = useAsync(() => fetchProducts({ bestseller: true, limit: 8 }))
  const { data: newArrivals } = useAsync(() => fetchProducts({ newArrival: true, limit: 8 }))
  const { data: featured } = useAsync(() => fetchProducts({ featured: true, limit: 4 }))
  const { data: banners } = useAsync(() => fetchBanners())

  return (
    <div className="overflow-x-hidden">
      {/* ── Cinematic hero (video + rolling text + scroll-shrink + category reveal) */}
      <CinematicHero />

      {/* ── Rest of the page scrolls in normally after the pin releases ── */}
      <TrustBar />
      <ProductSection
        title="Best Sellers"
        subtitle="Loved by thousands of makers and collectors"
        products={bestSellers}
        loading={bsLoading}
        viewAllLink="/shop?sort=popular"
      />
      <BannerStrip banners={banners ?? []} />
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh off the print bed this week"
        products={newArrivals}
        viewAllLink="/shop?sort=newest"
      />
      <CustomPrintingCTA />
      <PersonalizedSection products={featured ?? []} />
      <ProcessSection />
      <ReviewsSection />
      <PersonalizedBanner />
    </div>
  )
}

/* ---------------------------------------------------- */

function TrustBar() {
  const items = [
    { icon: Truck, label: 'Free shipping over ₹999' },
    { icon: ShieldCheck, label: 'Secure checkout' },
    { icon: Palette, label: '6 premium materials' },
    { icon: PackageCheck, label: '7-day easy returns' },
  ]
  return (
    <div className="border-b border-espresso-100 bg-white">
      <div className="container-page grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2.5 text-sm text-espresso-500">
            <it.icon className="h-5 w-5 flex-shrink-0 text-olive" />
            {it.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductSection({ title, subtitle, products, loading, viewAllLink }: { title: string; subtitle?: string; products?: Product[]; loading?: boolean; viewAllLink?: string }) {
  return (
    <section className="py-12">
      <div className="container-page">
        <SectionHeading title={title} subtitle={subtitle} link={viewAllLink} />
        {loading || !products ? <ProductGridSkeleton /> : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function BannerStrip({ banners }: { banners: any[] }) {
  if (!banners.length) return null
  return (
    <section className="py-12">
      <div className="container-page grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="group relative overflow-hidden rounded-3xl">
            <SmartImage src={b.image_url} alt={b.title} aspect="wide" label={b.title} category="custom" className="bg-sageTeal-100" />
            <div className="absolute inset-0 bg-gradient-to-r from-espresso-900/80 via-espresso-900/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8">
              <h3 className="max-w-xs font-heading text-2xl font-bold text-white">{b.title}</h3>
              <p className="mt-1.5 max-w-xs text-sm text-softSage-100">{b.subtitle}</p>
              {b.cta_link && (
                <Link to={b.cta_link}>
                  <Button size="sm" className="mt-4">{b.cta_text} <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CustomPrintingCTA() {
  return (
    <section className="py-12">
      <div className="container-page">
        <div className="overflow-hidden rounded-3xl bg-sageTeal-100">
          <div className="grid items-center gap-8 p-8 md:p-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-sageTeal-700">
                <PenTool className="h-3.5 w-3.5" /> Custom 3D Printing Service
              </span>
              <h2 className="mt-4 font-heading text-3xl font-bold text-espresso sm:text-4xl text-balance">
                Got an idea? We'll print it.
              </h2>
              <p className="mt-4 max-w-md text-espresso-600">
                Upload your 3D model or just describe what you need. Our team reviews every request, sends a quote, and prints it in your choice of premium materials.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/custom-printing">
                  <Button size="lg">Start a Project <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link to="/shop?category=custom-products">
                  <Button variant="white" size="lg">View Examples</Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: MousePointerClick, label: '1. Submit', desc: 'Upload files & details' },
                { icon: Quote, label: '2. Quote', desc: 'Get price & timeline' },
                { icon: PackageCheck, label: '3. Print', desc: 'We print & ship' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/70 p-4 text-center backdrop-blur">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-olive text-white"><s.icon className="h-5 w-5" /></div>
                  <p className="mt-2 text-sm font-bold text-espresso">{s.label}</p>
                  <p className="text-xs text-espresso-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PersonalizedSection({ products }: { products: Product[] }) {
  return (
    <section className="py-10">
      <div className="container-page">
        {/* Banner — full image */}
        <Link to="/shop" className="relative block overflow-hidden rounded-3xl" style={{ minHeight: '220px' }}>
          <img
            src="/image.png"
            alt="Trending 3D Prints"
            className="h-full w-full object-cover"
            style={{ mixBlendMode: 'multiply' }}
          />
        </Link>

        {/* Product cards below */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

function WhyChooseUs() {
  const reasons = [
    { icon: Boxes, title: 'Premium Materials', desc: 'Six carefully selected filaments and resins, each chosen for its strengths.' },
    { icon: PenTool, title: 'Custom Design', desc: 'No model? No problem. Tell us what you want and we design it for you.' },
    { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'Every print is inspected. Not happy? We reprint or refund.' },
    { icon: Truck, title: 'Fast & Safe Shipping', desc: 'Carefully packed and shipped to your door across India.' },
  ]
  return (
    <section className="py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-espresso">Why choose 3D HUB?</h2>
          <p className="mt-3 text-espresso-500">We obsess over the details so your prints turn out exactly as imagined.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title} className="card p-6 text-center transition hover:shadow-cardHover">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-softSage-100 text-olive"><r.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-heading text-base font-bold text-espresso">{r.title}</h3>
              <p className="mt-1.5 text-sm text-espresso-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    { icon: MousePointerClick, title: 'Browse & Choose', desc: 'Pick a ready-made product or start a custom project.' },
    { icon: PenTool, title: 'Customize', desc: 'Select material, color and personalize where available.' },
    { icon: Printer, title: 'We Print', desc: 'Your item is printed with precision and quality checked.' },
    { icon: PackageCheck, title: 'Delivered', desc: 'Carefully packed and shipped to your doorstep.' },
  ]
  return (
    <section className="bg-espresso py-16 text-white">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold">Our Printing Process</h2>
          <p className="mt-3 text-softSage-200">From idea to your hands in four simple steps.</p>
        </div>
        <div className="relative mt-14 grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 md:block" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-olive text-white ring-8 ring-espresso">
                <s.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-softSage">Step {i + 1}</p>
              <h3 className="mt-1 font-heading text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-softSage-200">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewsSection() {
  const { data: dbReviews } = useAsync(() => fetchReviews(undefined, true))

  // Static fallback reviews (shown when DB has none)
  const fallback = [
    { id: '1', product_id: '', user_id: '', user_name: 'Aarav S.', rating: 5, title: '', body: 'The detail is unreal. Every joint moves perfectly. My kids fight over it.', photo_url: null, product_name: 'Articulated Dragon Model', is_approved: true, created_at: '' },
    { id: '2', product_id: '', user_id: '', user_name: 'Priya M.', rating: 5, title: '', body: 'I gifted this to my mom with our family photo. She cried. Worth every rupee.', photo_url: null, product_name: 'Custom Lithophane Night Light', is_approved: true, created_at: '' },
    { id: '3', product_id: '', user_id: '', user_name: 'Rohan K.', rating: 5, title: '', body: 'Clean design, sturdy print. My desk has never looked this organized.', photo_url: null, product_name: 'Modular Desk Organizer', is_approved: true, created_at: '' },
  ]

  const reviews = (dbReviews && dbReviews.length > 0 ? dbReviews : fallback).slice(0, 6)

  return (
    <section className="py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold text-espresso">Loved by makers</h2>
          <p className="mt-3 text-espresso-500">Real reviews from real customers.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl shadow-card">
              {/* Top — customer photo or placeholder */}
              <div className="relative aspect-[4/3] bg-softSage-200">
                {r.photo_url ? (
                  <img src={r.photo_url} alt="Customer photo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-softSage-200 to-sageTeal-200">
                    <div className="flex gap-2">
                      {[32, 48, 28].map((h, i) => (
                        <div key={i} className="rounded-xl border-2 border-white/60" style={{ width: h * 0.65, height: h }} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Customer photo badge */}
                <span className="absolute bottom-3 left-3 rounded-full bg-espresso/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Customer photo
                </span>
              </div>

              {/* Bottom — review */}
              <div className="bg-espresso-800 p-5" style={{ backgroundColor: '#2A2011' }}>
                <p className="text-sm leading-relaxed text-softSage-100">
                  "{r.body}"
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-olive text-sm font-bold text-white">
                    {r.user_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{r.user_name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-olive-400" style={{ color: '#a3b880' }}>
                        <Check className="h-3 w-3" /> Verified buyer
                      </span>
                    </div>
                    <p className="truncate text-xs text-softSage-300">{r.product_name || 'Verified purchase'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PersonalizedBanner() {
  return (
    <section className="bg-softSage-100 py-16">
      <div className="container-page">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-softSage-300 to-sageTeal-100 p-8 text-center md:p-12 lg:flex-row lg:text-left">
          <div>
            <h2 className="font-heading text-2xl font-bold text-espresso sm:text-3xl">Ready to print something unique?</h2>
            <p className="mt-2 text-espresso-600">Join thousands of happy customers. Free shipping over ₹999.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/shop"><Button size="lg" className="bg-espresso text-white hover:bg-espresso-800">Shop Now</Button></Link>
            <Link to="/custom-printing"><Button variant="white" size="lg">Custom Project</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ title, subtitle, link }: { title: string; subtitle?: string; link?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-heading text-2xl font-bold text-espresso sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-espresso-400">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className="hidden items-center gap-1 text-sm font-semibold text-olive hover:text-olive-600 sm:flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
