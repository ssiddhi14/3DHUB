import { useState } from 'react'
import { Search, Mail, Phone, ShoppingBag, FileBox, Eye } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchOrders, fetchCustomRequests } from '@/services/data'
import { AdminPageHeader, AdminTable, AdminSearchInput } from '@/components/admin/AdminUI'
import { Modal } from '@/components/ui/Modal'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PRINT_STATUS_LABELS, PRINT_STATUS_COLORS } from '@/lib/constants'
import { getStore } from '@/services/store'

export function Customers() {
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const { data: orders } = useAsync(() => fetchOrders())
  const { data: requests } = useAsync(() => fetchCustomRequests())

  const profiles = getStore().profiles

  const customers = profiles.map((p) => {
    const userOrders = (orders ?? []).filter((o) => o.user_id === p.id)
    const userRequests = (requests ?? []).filter((r) => r.user_id === p.id)
    return {
      profile: p,
      orders: userOrders,
      requests: userRequests,
      totalSpent: userOrders.reduce((s, o) => s + o.total, 0),
    }
  }).filter((c) => c.profile.role === 'customer')

  const filtered = customers.filter((c) => c.profile.email.toLowerCase().includes(search.toLowerCase()) || (c.profile.full_name ?? '').toLowerCase().includes(search.toLowerCase()))

  const selected = customers.find((c) => c.profile.email === selectedEmail)

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} registered customers`} />
      <div className="mb-4"><AdminSearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." /></div>
      {filtered.length ? (
        <AdminTable headers={['Customer', 'Email', 'Orders', 'Requests', 'Total spent', 'Joined', 'Actions']}>
          {filtered.map((c) => (
            <tr key={c.profile.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive/10 text-xs font-bold text-olive">{(c.profile.full_name || c.profile.email)[0].toUpperCase()}</div>
                  <span className="font-medium text-espresso">{c.profile.full_name || '—'}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-espresso-400">{c.profile.email}</td>
              <td className="px-4 py-3 text-espresso-400">{c.orders.length}</td>
              <td className="px-4 py-3 text-espresso-400">{c.requests.length}</td>
              <td className="px-4 py-3 font-medium text-espresso">{formatPrice(c.totalSpent)}</td>
              <td className="px-4 py-3 text-espresso-400">{formatDate(c.profile.created_at)}</td>
              <td className="px-4 py-3"><button onClick={() => setSelectedEmail(c.profile.email)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Eye className="h-4 w-4" /></button></td>
            </tr>
          ))}
        </AdminTable>
      ) : <div className="rounded-2xl border border-dashed border-espresso-100 py-16 text-center text-espresso-400">No customers yet. Sign-ups will appear here.</div>}

      <Modal open={!!selected} onClose={() => setSelectedEmail(null)} title={selected?.profile.full_name || selected?.profile.email || ''} size="lg">
        {selected && (
          <div className="space-y-5 p-6">
            <div className="grid gap-4 rounded-xl bg-softSage-50 p-4 text-sm sm:grid-cols-2">
              <div><p className="text-xs text-espresso-400">Email</p><p className="font-medium text-espresso">{selected.profile.email}</p></div>
              <div><p className="text-xs text-espresso-400">Phone</p><p className="font-medium text-espresso">{selected.profile.phone || '—'}</p></div>
              <div><p className="text-xs text-espresso-400">Total spent</p><p className="font-medium text-espresso">{formatPrice(selected.totalSpent)}</p></div>
              <div><p className="text-xs text-espresso-400">Joined</p><p className="font-medium text-espresso">{formatDate(selected.profile.created_at)}</p></div>
            </div>

            <div>
              <h3 className="font-heading text-sm font-bold text-espresso">Orders ({selected.orders.length})</h3>
              <div className="mt-2 space-y-2">
                {selected.orders.length ? selected.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-espresso-50 px-3 py-2">
                    <div><p className="text-sm font-medium text-espresso">{o.order_number}</p><p className="text-xs text-espresso-400">{formatDate(o.created_at)}</p></div>
                    <div className="flex items-center gap-2"><span className={cn('badge', ORDER_STATUS_COLORS[o.status])}>{ORDER_STATUS_LABELS[o.status]}</span><span className="text-sm font-bold text-espresso">{formatPrice(o.total)}</span></div>
                  </div>
                )) : <p className="text-sm text-espresso-400">No orders</p>}
              </div>
            </div>

            <div>
              <h3 className="font-heading text-sm font-bold text-espresso">Custom requests ({selected.requests.length})</h3>
              <div className="mt-2 space-y-2">
                {selected.requests.length ? selected.requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-espresso-50 px-3 py-2">
                    <div><p className="text-sm font-medium text-espresso">{r.request_number}</p><p className="line-clamp-1 text-xs text-espresso-400">{r.description}</p></div>
                    <span className={cn('badge', PRINT_STATUS_COLORS[r.status])}>{PRINT_STATUS_LABELS[r.status]}</span>
                  </div>
                )) : <p className="text-sm text-espresso-400">No custom requests</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
