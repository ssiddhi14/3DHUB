import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Lock, Check, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'
import { createOrder } from '@/services/data'
import { openRazorpayCheckout } from '@/lib/razorpay'
import type { OrderItem } from '@/types'

export function Checkout() {
  const { items, subtotal, shipping, total, clearCart, couponDiscount, appliedCouponCode } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [address, setAddress] = useState({
    full_name: user?.full_name ?? '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => setAddress((a) => ({ ...a, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    for (const k of ['full_name', 'phone', 'line1', 'city', 'state', 'pincode']) {
      if (!address[k as keyof typeof address].trim()) e[k] = 'Required'
    }
    if (address.phone && !/^\d{10}$/.test(address.phone)) e.phone = 'Enter a 10-digit number'
    if (address.pincode && !/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const placeOrder = async () => {
    if (!validate()) { toast('Please fill in all required fields', 'error'); return }
    if (items.length === 0) return
    setPlacing(true)

    const orderItems: OrderItem[] = items.map((it) => ({
      id: '',
      order_id: '',
      product_id: it.product_id,
      product_title: it.product.title,
      product_image: it.product.images[0],
      quantity: it.quantity,
      price: it.product.discounted_price ?? it.product.price,
      color: it.color ?? null,
    }))

    try {
      // In production: first create a Razorpay order server-side using the
      // secret key, then pass its order_id to openRazorpayCheckout so the
      // signature can be verified. Here we open checkout with the total.
      await openRazorpayCheckout({
        amount: Math.round(total * 100),
        name: '3D HUB',
        description: `Order of ${items.length} item(s)`,
        prefill: { name: address.full_name, email: user?.email ?? '', contact: address.phone },
        onSuccess: async (payment) => {
          try {
            const order = await createOrder({
              user_id: user?.id ?? null,
              items: orderItems,
              subtotal,
              discount: couponDiscount,
              shipping,
              total,
              coupon_code: appliedCouponCode,
              shipping_address: address,
              payment_status: 'paid',
              status: 'confirmed',
            })
            clearCart()
            toast('Payment successful!', 'success')
            navigate(`/order/${order.id}`)
          } catch (err: any) {
            toast(err?.message ?? 'Could not save order', 'error')
            setPlacing(false)
          }
        },
        onFailure: (err) => {
          toast(err?.description ?? 'Payment failed or cancelled', 'error')
          setPlacing(false)
        },
      })
    } catch (err: any) {
      toast(err?.message ?? 'Something went wrong', 'error')
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-espresso">Your cart is empty</h1>
        <Link to="/shop"><Button className="mt-4">Browse Products</Button></Link>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-olive hover:text-olive-600 mb-4"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
      <h1 className="font-heading text-3xl font-bold text-espresso">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* shipping form */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-espresso">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Full name" name="full_name" value={address.full_name} onChange={(e) => set('full_name', e.target.value)} error={errors.full_name} />
              <Input label="Phone" name="phone" value={address.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} placeholder="10-digit mobile" />
              <Input label="Address line 1" name="line1" value={address.line1} onChange={(e) => set('line1', e.target.value)} error={errors.line1} className="sm:col-span-2" />
              <Input label="Address line 2 (optional)" name="line2" value={address.line2} onChange={(e) => set('line2', e.target.value)} className="sm:col-span-2" />
              <Input label="City" name="city" value={address.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
              <Input label="State" name="state" value={address.state} onChange={(e) => set('state', e.target.value)} error={errors.state} />
              <Input label="Pincode" name="pincode" value={address.pincode} onChange={(e) => set('pincode', e.target.value)} error={errors.pincode} placeholder="6-digit" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-espresso">Payment</h2>
            <p className="mt-1 text-sm text-espresso-400">Secure payment via Razorpay. UPI, cards, and wallets supported.</p>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-softSage-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive text-white"><Lock className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-espresso">Razorpay Secure Checkout</p>
                <p className="text-xs text-espresso-400">Your payment information is encrypted and never stored on our servers.</p>
              </div>
            </div>
            {(!import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID.includes('yourkeyid')) && (
              <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">Demo mode: payment will simulate success. Add a Razorpay key to enable live payments.</p>
            )}
          </div>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="font-heading text-lg font-bold text-espresso">Order Summary</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((it) => (
                <div key={`${it.product_id}-${it.color}`} className="flex gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-softSage-50">
                    <img src={it.product.images[0]} alt={it.product.title} className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso px-1 text-[10px] font-bold text-white">{it.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-espresso">{it.product.title}</p>
                    <p className="text-xs text-espresso-400">{it.color}</p>
                  </div>
                  <span className="text-sm font-medium text-espresso">{formatPrice((it.product.discounted_price ?? it.product.price) * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2.5 border-t border-espresso-100 pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {couponDiscount > 0 && <Row label="Discount" value={`− ${formatPrice(couponDiscount)}`} accent />}
              <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
              <div className="flex items-center justify-between border-t border-espresso-100 pt-3">
                <span className="font-heading text-base font-bold text-espresso">Total</span>
                <span className="font-heading text-xl font-bold text-espresso">{formatPrice(total)}</span>
              </div>
            </div>
            <Button onClick={placeOrder} loading={placing} size="lg" className="mt-5 w-full"><Check className="h-4 w-4" /> Place Order</Button>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-espresso-400"><ShieldCheck className="h-3.5 w-3.5 text-olive" /> Secure 256-bit SSL encryption</div>
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
