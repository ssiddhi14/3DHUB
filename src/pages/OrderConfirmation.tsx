import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Package, Truck, ArrowRight } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchOrders } from '@/services/data'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/PageLoader'
import { formatPrice, formatDate } from '@/lib/utils'

export function OrderConfirmation() {
  const { id } = useParams()
  const { data: orders } = useAsync(() => fetchOrders())
  const order = orders?.find((o) => o.id === id)

  if (!orders) return <div className="container-page py-20"><div className="h-40 skeleton" /></div>
  if (!order) {
    return <div className="container-page py-16"><EmptyState title="Order not found" description="We couldn't find this order." action={<Link to="/shop"><Button>Continue Shopping</Button></Link>} /></div>
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-softSage-100 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-olive text-white"><CheckCircle2 className="h-8 w-8" /></div>
          <h1 className="mt-5 font-heading text-2xl font-bold text-espresso sm:text-3xl">Thank you for your order!</h1>
          <p className="mt-2 text-espresso-500">Your order has been confirmed. We'll start printing right away.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 shadow-card">
            <span className="text-sm text-espresso-400">Order</span>
            <span className="font-heading text-lg font-bold text-olive">{order.order_number}</span>
          </div>
        </div>

        {/* status timeline */}
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between">
            {[
              { icon: CheckCircle2, label: 'Confirmed', done: true },
              { icon: Package, label: 'Printing', done: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' },
              { icon: Truck, label: 'Shipped', done: order.status === 'shipped' || order.status === 'delivered' },
              { icon: Package, label: 'Delivered', done: order.status === 'delivered' },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex flex-1 flex-col items-center text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${s.done ? 'bg-olive text-white' : 'bg-espresso-50 text-espresso-300'}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className={`mt-2 text-xs font-medium ${s.done ? 'text-olive' : 'text-espresso-300'}`}>{s.label}</p>
                {i < arr.length - 1 && <div className={`hidden sm:block absolute`} />}
              </div>
            ))}
          </div>
        </div>

        {/* items */}
        <div className="mt-8 card p-6">
          <h2 className="font-heading text-base font-bold text-espresso">Items</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.product_image} alt={it.product_title} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-espresso">{it.product_title}</p>
                  <p className="text-xs text-espresso-400">Qty {it.quantity}{it.color ? ` · ${it.color}` : ''}</p>
                </div>
                <span className="text-sm font-semibold text-espresso">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-espresso-100 pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`− ${formatPrice(order.discount)}`} accent />}
            <Row label="Shipping" value={order.shipping === 0 ? 'Free' : formatPrice(order.shipping)} />
            <div className="flex items-center justify-between border-t border-espresso-100 pt-3">
              <span className="font-heading font-bold text-espresso">Total</span>
              <span className="font-heading text-lg font-bold text-espresso">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* shipping address */}
        {order.shipping_address && (
          <div className="mt-8 card p-6">
            <h2 className="font-heading text-base font-bold text-espresso">Shipping to</h2>
            <p className="mt-2 text-sm text-espresso-500">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.line1}{order.shipping_address.line2 && `, ${order.shipping_address.line2}`}<br />
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}<br />
              {order.shipping_address.phone}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/account?tab=orders"><Button>View Orders</Button></Link>
          <Link to="/shop"><Button variant="outline">Continue Shopping <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        <p className="mt-4 text-center text-xs text-espresso-400">Order placed on {formatDate(order.created_at)}</p>
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
