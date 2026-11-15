import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/PageLoader'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'
import { validateCoupon, applyCoupon as applyCouponCalc } from '@/services/data'
import { useAuth } from '@/context/AuthContext'

export function Cart() {
  const { items, updateQuantity, removeItem, subtotal, shipping, total, itemCount, appliedCouponCode, couponDiscount, clearCoupon } = useCart()
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    const coupon = await validateCoupon(couponInput, subtotal)
    setApplying(false)
    if (!coupon) {
      toast('Invalid or expired coupon', 'error')
      return
    }
    const discount = applyCouponCalc(coupon, subtotal)
    // store applied coupon in localStorage so checkout can read it
    localStorage.setItem('3dhub-coupon', JSON.stringify(coupon))
    localStorage.setItem('3dhub-coupon-disc', String(discount))
    localStorage.setItem('3dhub-coupon-code', coupon.code)
    // force a refresh of the cart context's coupon discount
    clearCoupon()
    setTimeout(() => window.dispatchEvent(new Event('storage')), 0)
    toast(`Coupon ${coupon.code} applied — you save ${formatPrice(discount)}`, 'success')
  }

  if (itemCount === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added any 3D-printed goodies yet."
          icon={<ShoppingBag className="h-6 w-6" />}
          action={<Link to="/shop"><Button>Start Shopping <ArrowRight className="h-4 w-4" /></Button></Link>}
        />
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-heading text-3xl font-bold text-espresso">Shopping Cart</h1>
      <p className="mt-1 text-espresso-400">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* items */}
        <div className="space-y-4">
          {items.map((item) => {
            const price = item.product.discounted_price ?? item.product.price
            const lineTotal = price * item.quantity
            return (
              <div key={`${item.product_id}-${item.color}`} className="card flex gap-4 p-4">
                <Link to={`/product/${item.product.slug}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-softSage-50">
                  <img src={item.product.images[0]} alt={item.product.title} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link to={`/product/${item.product.slug}`} className="font-heading text-sm font-bold text-espresso hover:text-olive">{item.product.title}</Link>
                    <button onClick={() => removeItem(item.product_id, item.color)} className="text-espresso-300 hover:text-red-500" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-espresso-400">{item.product.material?.name}{item.color ? ` · ${item.color}` : ''}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-espresso-100">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.color)} className="px-2.5 py-1.5 text-espresso-400 hover:text-olive"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.color)} className="px-2.5 py-1.5 text-espresso-400 hover:text-olive"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="text-right">
                      <span className="font-heading text-base font-bold text-espresso">{formatPrice(lineTotal)}</span>
                      {item.product.discounted_price && <p className="text-xs text-espresso-300 line-through">{formatPrice(item.product.price * item.quantity)}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-olive hover:text-olive-600">← Continue shopping</Link>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-espresso">Order Summary</h2>

            {/* coupon */}
            <div className="mt-4">
              {appliedCouponCode && couponDiscount > 0 ? (
                <div className="flex items-center justify-between rounded-xl bg-softSage-50 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-olive"><Tag className="h-4 w-4" /> {appliedCouponCode}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-olive">−{formatPrice(couponDiscount)}</span>
                    <button onClick={clearCoupon} className="text-espresso-300 hover:text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
                  <Button variant="secondary" onClick={applyCoupon} loading={applying}>Apply</Button>
                </div>
              )}
              <p className="mt-2 text-xs text-espresso-400">Try WELCOME10 or HUB500</p>
            </div>

            <div className="mt-5 space-y-3 border-t border-espresso-100 pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {couponDiscount > 0 && <Row label="Discount" value={`− ${formatPrice(couponDiscount)}`} accent />}
              <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
              <div className="flex items-center justify-between border-t border-espresso-100 pt-3">
                <span className="font-heading text-base font-bold text-espresso">Total</span>
                <span className="font-heading text-xl font-bold text-espresso">{formatPrice(total)}</span>
              </div>
            </div>

            <Button onClick={() => navigate(user ? '/checkout' : '/login?redirect=/checkout')} size="lg" className="mt-5 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            {!user && <p className="mt-2 text-center text-xs text-espresso-400">Sign in or continue as guest at checkout</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-espresso-400">{label}</span>
      <span className={accent ? 'font-semibold text-olive' : 'font-medium text-espresso'}>{value}</span>
    </div>
  )
}
