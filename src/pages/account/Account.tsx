import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  User as UserIcon, Package, Heart, FileBox, MapPin, LogOut, ChevronRight,
  Settings, ShoppingBag,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useData'
import { useWishlist } from '@/context/WishlistContext'
import { fetchUserOrders, fetchUserCustomRequests, respondToQuotation, fetchQuotations } from '@/services/data'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/PageLoader'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PRINT_STATUS_LABELS, PRINT_STATUS_COLORS } from '@/lib/constants'

type Tab = 'profile' | 'orders' | 'wishlist' | 'custom' | 'addresses'

export function Account() {
  const { user, signOut, updateProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { items: wishlistItems, toggle: toggleWishlist } = useWishlist()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'profile')
  const { data: orders } = useAsync(() => (user ? fetchUserOrders(user.id) : Promise.resolve([])), [user?.id])
  const { data: requests } = useAsync(() => (user ? fetchUserCustomRequests(user.id) : Promise.resolve([])), [user?.id])
  const { data: quotations } = useAsync(() => fetchQuotations(), [])
  const [profileEdit, setProfileEdit] = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' })
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'custom', label: 'Custom Requests', icon: FileBox },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ]

  const selectTab = (t: Tab) => { setTab(t); setParams({ tab: t }, { replace: true }) }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await updateProfile({ ...user, full_name: profileEdit.full_name, phone: profileEdit.phone })
    setSaving(false)
    toast(error ? 'Could not save' : 'Profile updated', error ? 'error' : 'success')
  }

  const wishlist = wishlistItems // real wishlist from context

  return (
    <div className="bg-softSage-50 min-h-[calc(100vh-4rem)]">
      <div className="container-page py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive text-white font-heading text-xl font-bold">
            {(user.full_name || user.email)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-espresso">{user.full_name || 'Welcome'}</h1>
            <p className="text-sm text-espresso-400">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="card p-2">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => selectTab(t.id)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', tab === t.id ? 'bg-olive text-white' : 'text-espresso-500 hover:bg-softSage-100')}>
                  <t.icon className="h-4.5 w-4.5" /> {t.label}
                </button>
              ))}
              <button onClick={async () => { await signOut(); navigate('/') }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50">
                <LogOut className="h-4.5 w-4.5" /> Sign out
              </button>
            </div>
          </aside>

          {/* content */}
          <div>
            {tab === 'profile' && (
              <div className="card p-6">
                <h2 className="font-heading text-lg font-bold text-espresso">Profile details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="Full name" value={profileEdit.full_name} onChange={(e) => setProfileEdit({ ...profileEdit, full_name: e.target.value })} />
                  <Input label="Email" value={user.email} disabled className="opacity-60" />
                  <Input label="Phone" value={profileEdit.phone} onChange={(e) => setProfileEdit({ ...profileEdit, phone: e.target.value })} />
                </div>
                <Button onClick={saveProfile} loading={saving} className="mt-5">Save Changes</Button>
              </div>
            )}

            {tab === 'orders' && (
              <div className="space-y-4">
                {orders && orders.length ? orders.map((o) => (
                  <Link key={o.id} to={`/order/${o.id}`} className="card flex items-center justify-between p-5 transition hover:shadow-cardHover">
                    <div>
                      <p className="font-heading text-sm font-bold text-espresso">{o.order_number}</p>
                      <p className="text-xs text-espresso-400">{formatDate(o.created_at)} · {o.items.length} item(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('badge', ORDER_STATUS_COLORS[o.status])}>{ORDER_STATUS_LABELS[o.status]}</span>
                      <span className="font-heading font-bold text-espresso">{formatPrice(o.total)}</span>
                      <ChevronRight className="h-4 w-4 text-espresso-300" />
                    </div>
                  </Link>
                )) : <EmptyState title="No orders yet" description="Your order history will appear here." icon={<Package className="h-6 w-6" />} action={<Link to="/shop"><Button>Start Shopping</Button></Link>} />}
              </div>
            )}

            {tab === 'wishlist' && (
              <div>
                {wishlistItems.length ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {wishlistItems.map((p) => (
                      <div key={p.id} className="card overflow-hidden relative">
                        <Link to={`/product/${p.slug}`}>
                          <img src={p.images[0]} alt={p.title} className="aspect-square w-full object-cover" />
                          <div className="p-3">
                            <p className="line-clamp-1 text-sm font-semibold text-espresso">{p.title}</p>
                            <p className="text-sm font-bold text-olive">{formatPrice(p.discounted_price ?? p.price)}</p>
                          </div>
                        </Link>
                        {/* Remove from wishlist */}
                        <button
                          onClick={() => { toggleWishlist(p); toast('Removed from wishlist', 'info') }}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-400 shadow hover:bg-white hover:text-red-600"
                          aria-label="Remove from wishlist"
                        >
                          <Heart className="h-4 w-4 fill-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Wishlist is empty"
                    description="Tap the heart icon on any product to save it here."
                    icon={<Heart className="h-6 w-6" />}
                    action={<Link to="/shop"><Button>Browse Products</Button></Link>}
                  />
                )}
              </div>
            )}

            {tab === 'custom' && (
              <div className="space-y-4">
                {requests && requests.length ? requests.map((r) => {
                  const quote = quotations?.find((q) => q.request_id === r.id && q.status === 'pending')
                  return (
                    <div key={r.id} className="card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-heading text-sm font-bold text-espresso">{r.request_number}</p>
                          <p className="text-xs text-espresso-400">{formatDate(r.created_at)}</p>
                          <p className="mt-1 text-sm text-espresso-600">{r.description}</p>
                        </div>
                        <span className={cn('badge', PRINT_STATUS_COLORS[r.status])}>{PRINT_STATUS_LABELS[r.status]}</span>
                      </div>
                      {quote && (
                        <div className="mt-4 rounded-xl bg-softSage-50 p-4">
                          <p className="text-sm font-semibold text-espresso">Quotation: {formatPrice(quote.price)} · {quote.estimated_days} days</p>
                          {quote.notes && <p className="mt-1 text-xs text-espresso-500">{quote.notes}</p>}
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" onClick={async () => { await respondToQuotation(quote.id, 'accepted'); toast('Quotation accepted!', 'success') }}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={async () => { await respondToQuotation(quote.id, 'rejected'); toast('Quotation declined', 'info') }}>Decline</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }) : <EmptyState title="No custom requests" description="Submit a custom 3D printing request to see it here." icon={<FileBox className="h-6 w-6" />} action={<Link to="/custom-printing"><Button>Start a Project</Button></Link>} />}
              </div>
            )}

            {tab === 'addresses' && (
              <div>
                <EmptyState title="No saved addresses" description="Addresses you use at checkout will be saved here." icon={<MapPin className="h-6 w-6" />} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
