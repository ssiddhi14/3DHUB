import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Star, Heart, ShoppingBag, Zap, Truck, ShieldCheck, RotateCcw, Minus, Plus, Check } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchProductBySlug, fetchRelatedProducts, fetchReviews, createReview } from '@/services/data'
import { SmartImage } from '@/components/ui/SmartImage'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/PageLoader'
import { formatPrice, discountPercent, cn } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'

export function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { data: product, loading } = useAsync(() => fetchProductBySlug(slug!), [slug])
  const { data: related } = useAsync(() => (product ? fetchRelatedProducts(product) : Promise.resolve([])), [product?.id])
  const { data: reviews } = useAsync(() => (product ? fetchReviews(product.id, true) : Promise.resolve([])), [product?.id])

  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState<string | undefined>(undefined)
  const [wished, setWished] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description')

  if (loading) return <div className="container-page py-20"><ProductGridSkeleton count={1} /></div>
  if (!product) {
    return (
      <div className="container-page py-20">
        <EmptyState title="Product not found" description="This product may have been removed." action={<Link to="/shop"><Button>Browse all products</Button></Link>} />
      </div>
    )
  }

  const price = product.discounted_price ?? product.price
  const off = product.discounted_price ? discountPercent(product.price, product.discounted_price) : 0
  const selectedColor = color ?? product.colors[0]?.name

  const addToCart = () => {
    if (product.stock <= 0) return
    addItem(product, qty, selectedColor)
    toast(`${product.title} added to cart`, 'success')
  }

  const buyNow = () => {
    addItem(product, qty, selectedColor)
    navigate('/checkout')
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast('Please sign in to leave a review', 'info'); navigate('/login'); return }
    await createReview({ product_id: product.id, user_id: user.id, user_name: user.full_name || user.email, rating: reviewForm.rating, title: reviewForm.title, body: reviewForm.body })
    toast('Review submitted! It will appear after approval.', 'success')
    setReviewForm({ rating: 5, title: '', body: '' })
  }

  return (
    <div>
      {/* breadcrumb */}
      <div className="border-b border-espresso-100 bg-softSage-50">
        <div className="container-page py-3">
          <nav className="flex items-center gap-1.5 text-xs text-espresso-400">
            <Link to="/" className="hover:text-olive">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-olive">Shop</Link>
            {product.category && <><ChevronRight className="h-3 w-3" /><Link to={`/category/${product.category.slug}`} className="hover:text-olive">{product.category.name}</Link></>}
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-espresso">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-3xl">
              <SmartImage src={product.images[activeImage]} alt={product.title} aspect="square" label={product.title} category={product.category?.slug} className="bg-softSage-50" />
              {off > 0 && <div className="absolute left-4 top-4"><Badge variant="sale">Save {off}%</Badge></div>}
            </div>
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={cn('h-20 w-20 overflow-hidden rounded-xl border-2 transition', activeImage === i ? 'border-olive' : 'border-transparent hover:border-espresso-200')}>
                  <img src={img} alt={`${product.title} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.is_bestseller && <Badge variant="olive">Bestseller</Badge>}
              {product.is_new_arrival && <Badge variant="sky">New arrival</Badge>}
              {product.is_customizable && <Badge variant="teal">Customizable</Badge>}
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold text-espresso sm:text-3xl">{product.title}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < Math.round(product.rating) ? 'fill-sky-300 text-sky-300' : 'text-espresso-100')} />)}</div>
              <span className="text-sm text-espresso-400">{product.rating || 'New'} · {product.review_count} reviews · SKU {product.sku}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-heading text-3xl font-bold text-espresso">{formatPrice(price)}</span>
              {product.discounted_price && <span className="text-lg text-espresso-300 line-through">{formatPrice(product.price)}</span>}
              {off > 0 && <span className="text-sm font-semibold text-olive">You save {formatPrice(product.price - product.discounted_price!)}</span>}
            </div>

            <p className="mt-4 text-espresso-600 leading-relaxed">{product.description}</p>

            {/* colors */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-espresso">Color: <span className="font-normal text-espresso-400">{selectedColor}</span></p>
                <div className="flex gap-2.5">
                  {product.colors.map((c) => (
                    <button key={c.hex} onClick={() => setColor(c.name)} title={c.name} className={cn('h-9 w-9 rounded-full border-2 transition', selectedColor === c.name ? 'border-olive ring-2 ring-olive/20' : 'border-espresso-100')}>
                      <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* stock */}
            <div className="mt-5 flex items-center gap-2 text-sm">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-olive"><Check className="h-4 w-4" /> In stock {product.stock < 6 && <span className="text-sky-700">— only {product.stock} left</span>}</span>
              ) : (
                <span className="font-medium text-red-500">Out of stock</span>
              )}
            </div>

            {/* qty + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-espresso-100">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5 text-espresso-400 hover:text-olive"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2.5 text-espresso-400 hover:text-olive"><Plus className="h-4 w-4" /></button>
              </div>
              <Button onClick={addToCart} disabled={product.stock <= 0} className="flex-1 sm:flex-none"><ShoppingBag className="h-4 w-4" /> Add to Cart</Button>
              <Button variant="outline" onClick={buyNow} disabled={product.stock <= 0}><Zap className="h-4 w-4" /> Buy Now</Button>
              <button onClick={() => { setWished((w) => !w); toast(wished ? 'Removed from wishlist' : 'Added to wishlist', 'info') }} className={cn('flex h-11 w-11 items-center justify-center rounded-xl border border-espresso-100 transition', wished ? 'border-olive bg-olive/5 text-olive' : 'text-espresso-400 hover:text-olive')} aria-label="Wishlist">
                <Heart className={cn('h-5 w-5', wished && 'fill-olive')} />
              </button>
            </div>

            {/* trust badges */}
            <div className="mt-7 grid grid-cols-3 gap-3 rounded-2xl bg-softSage-50 p-4">
              {[
                { icon: Truck, label: 'Free shipping ₹999+' },
                { icon: ShieldCheck, label: 'Secure checkout' },
                { icon: RotateCcw, label: '7-day returns' },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center gap-1.5 text-center text-xs text-espresso-500">
                  <t.icon className="h-5 w-5 text-olive" />
                  {t.label}
                </div>
              ))}
            </div>

            {/* quick specs */}
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {product.material && <Spec label="Material" value={product.material.name} />}
              {product.printing_technology && <Spec label="Printing" value={product.printing_technology} />}
              {product.dimensions && <Spec label="Dimensions" value={product.dimensions} />}
              {product.weight && <Spec label="Weight" value={product.weight} />}
              {product.processing_time && <Spec label="Processing" value={product.processing_time} />}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-espresso-100">
            {(['description', 'specs', 'reviews'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-3 text-sm font-semibold capitalize transition', tab === t ? 'border-b-2 border-olive text-olive' : 'text-espresso-400 hover:text-espresso')}>
                {t}{t === 'reviews' && ` (${reviews?.length ?? 0})`}
              </button>
            ))}
          </div>
          <div className="py-6">
            {tab === 'description' && <p className="max-w-3xl leading-relaxed text-espresso-600">{product.description} Each piece is printed to order with attention to detail and quality checked before shipping.</p>}
            {tab === 'specs' && (
              <div className="max-w-2xl">
                <dl className="divide-y divide-espresso-100 rounded-2xl border border-espresso-100">
                  {product.material && <SpecRow label="Material" value={product.material.name} />}
                  {product.printing_technology && <SpecRow label="Printing Technology" value={product.printing_technology} />}
                  {product.dimensions && <SpecRow label="Dimensions" value={product.dimensions} />}
                  {product.weight && <SpecRow label="Weight" value={product.weight} />}
                  {product.processing_time && <SpecRow label="Processing Time" value={product.processing_time} />}
                  <SpecRow label="SKU" value={product.sku} />
                  <SpecRow label="Customizable" value={product.is_customizable ? 'Yes' : 'No'} />
                </dl>
              </div>
            )}
            {tab === 'reviews' && (
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  {reviews && reviews.length > 0 ? reviews.map((r) => (
                    <div key={r.id} className="border-b border-espresso-100 py-4 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-sky-300 text-sky-300" />)}</div>
                        <span className="text-sm font-semibold text-espresso">{r.user_name}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-espresso">{r.title}</p>
                      <p className="mt-1 text-sm text-espresso-500">{r.body}</p>
                    </div>
                  )) : <p className="text-sm text-espresso-400">No reviews yet. Be the first!</p>}

                  <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-espresso-100 p-5">
                    <h3 className="font-heading text-base font-bold text-espresso">Write a review</h3>
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button type="button" key={i} onClick={() => setReviewForm((f) => ({ ...f, rating: i + 1 }))}>
                          <Star className={cn('h-5 w-5', i < reviewForm.rating ? 'fill-sky-300 text-sky-300' : 'text-espresso-100')} />
                        </button>
                      ))}
                    </div>
                    <input value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} placeholder="Review title" required className="input-field mt-3" />
                    <textarea value={reviewForm.body} onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))} placeholder="Share your thoughts..." required className="input-field mt-3 min-h-[100px]" />
                    <Button type="submit" className="mt-3">Submit Review</Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-heading text-2xl font-bold text-espresso">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-espresso-400">{label}</dt>
      <dd className="font-medium text-espresso">{value}</dd>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-4 py-3 text-sm">
      <dt className="text-espresso-400">{label}</dt>
      <dd className="font-medium text-espresso">{value}</dd>
    </div>
  )
}
