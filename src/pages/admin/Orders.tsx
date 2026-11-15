import { useState } from 'react'
import { Search, Package, Eye, ChevronDown } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchOrders, updateOrder } from '@/services/data'
import { AdminPageHeader, AdminTable, AdminSearchInput } from '@/components/admin/AdminUI'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import type { Order, OrderStatus } from '@/types'

const PAYMENT_LABELS: Record<string, string> = { pending: 'Pending', paid: 'Paid', failed: 'Failed', refunded: 'Refunded' }

export function Orders() {
  const { toast } = useToast()
  const { data: orders, loading } = useAsync(() => fetchOrders())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [tracking, setTracking] = useState('')

  const filtered = (orders ?? []).filter((o) =>
    (o.order_number.toLowerCase().includes(search.toLowerCase()) || o.shipping_address?.full_name?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || o.status === statusFilter),
  )

  const updateStatus = async (id: string, status: OrderStatus) => {
    await updateOrder(id, { status, tracking_number: tracking || undefined })
    toast('Order updated', 'success')
    setSelected(null)
  }

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${orders?.length ?? 0} total orders`} />
      <div className="mb-4 flex flex-wrap gap-3">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search order # or customer..." />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-espresso-100 px-4 py-2 text-sm focus:border-olive focus:outline-none">
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div> : filtered.length ? (
        <AdminTable headers={['Order', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Action']}>
          {filtered.map((o) => (
            <tr key={o.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3 font-medium text-espresso">{o.order_number}</td>
              <td className="px-4 py-3 text-espresso-500">{o.shipping_address?.full_name ?? 'Guest'}</td>
              <td className="px-4 py-3 text-espresso-400">{formatDate(o.created_at)}</td>
              <td className="px-4 py-3 text-espresso-400">{o.items.length}</td>
              <td className="px-4 py-3 font-semibold text-espresso">{formatPrice(o.total)}</td>
              <td className="px-4 py-3"><span className={cn('badge', o.payment_status === 'paid' ? 'bg-olive-100 text-olive-700' : 'bg-sky-100 text-sky-700')}>{PAYMENT_LABELS[o.payment_status]}</span></td>
              <td className="px-4 py-3"><span className={cn('badge', ORDER_STATUS_COLORS[o.status])}>{ORDER_STATUS_LABELS[o.status]}</span></td>
              <td className="px-4 py-3"><button onClick={() => { setSelected(o); setTracking(o.tracking_number ?? '') }} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Eye className="h-4 w-4" /></button></td>
            </tr>
          ))}
        </AdminTable>
      ) : <div className="rounded-2xl border border-dashed border-espresso-100 py-16 text-center text-espresso-400">No orders yet. They'll appear here when customers check out.</div>}

      {/* order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.order_number ?? ''}`} size="lg">
        {selected && (
          <div className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-espresso-400">Placed on {formatDate(selected.created_at)}</p>
                <p className="text-sm text-espresso-400">Payment: <span className="font-medium text-espresso">{PAYMENT_LABELS[selected.payment_status]}</span></p>
              </div>
              <span className={cn('badge', ORDER_STATUS_COLORS[selected.status])}>{ORDER_STATUS_LABELS[selected.status]}</span>
            </div>

            {/* items */}
            <div className="space-y-3 rounded-xl border border-espresso-100 p-4">
              {selected.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={it.product_image} alt={it.product_title} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-espresso">{it.product_title}</p>
                    <p className="text-xs text-espresso-400">Qty {it.quantity}{it.color ? ` · ${it.color}` : ''}</p>
                  </div>
                  <span className="text-sm font-semibold text-espresso">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-espresso-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-espresso-400">Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between"><span className="text-espresso-400">Discount</span><span className="text-olive">−{formatPrice(selected.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-espresso-400">Shipping</span><span>{selected.shipping === 0 ? 'Free' : formatPrice(selected.shipping)}</span></div>
                <div className="flex justify-between font-bold"><span className="text-espresso">Total</span><span>{formatPrice(selected.total)}</span></div>
              </div>
            </div>

            {/* address */}
            {selected.shipping_address && (
              <div className="rounded-xl bg-softSage-50 p-4 text-sm text-espresso-500">
                <p className="font-semibold text-espresso">Shipping address</p>
                <p className="mt-1">{selected.shipping_address.full_name}<br />{selected.shipping_address.line1}{selected.shipping_address.line2 && `, ${selected.shipping_address.line2}`}<br />{selected.shipping_address.city}, {selected.shipping_address.state} {selected.shipping_address.pincode}<br />{selected.shipping_address.phone}</p>
              </div>
            )}

            {/* status update */}
            <div className="rounded-xl border border-espresso-100 p-4">
              <h3 className="font-heading text-sm font-bold text-espresso">Update order</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Select label="Status" value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value as OrderStatus })}>
                  {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
                <Input label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="AWB number" />
              </div>
              <Button className="mt-3" onClick={() => updateStatus(selected.id, selected.status)}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
