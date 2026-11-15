import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from 'recharts'
import {
  IndianRupee, ShoppingBag, Users, Package, Clock, FileBox, Ticket, AlertTriangle, ArrowRight,
} from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchDashboardStats, fetchSalesSeries, fetchOrders, fetchCustomRequests, fetchProducts } from '@/services/data'
import { AdminPageHeader, StatCard } from '@/components/admin/AdminUI'
import { formatDate, formatPrice, cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PRINT_STATUS_LABELS, PRINT_STATUS_COLORS } from '@/lib/constants'

export function Dashboard() {
  const { data: stats } = useAsync(() => fetchDashboardStats())
  const { data: sales } = useAsync(() => fetchSalesSeries(6))
  const { data: orders } = useAsync(() => fetchOrders())
  const { data: requests } = useAsync(() => fetchCustomRequests())
  const { data: products } = useAsync(() => fetchProducts({}))

  const recentOrders = orders?.slice(0, 6) ?? []
  const recentRequests = requests?.slice(0, 4) ?? []
  const lowStock = products?.filter((p) => p.stock < 5).slice(0, 5) ?? []

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Overview of your 3D HUB store" />

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={stats?.totalRevenue ?? 0} icon={<IndianRupee className="h-5 w-5" />} accent="olive" hint="From paid orders" />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={<ShoppingBag className="h-5 w-5" />} accent="teal" hint={`${stats?.pendingOrders ?? 0} pending`} />
        <StatCard label="Customers" value={stats?.totalCustomers ?? 0} icon={<Users className="h-5 w-5" />} accent="sky" />
        <StatCard label="Products" value={stats?.totalProducts ?? 0} icon={<Package className="h-5 w-5" />} accent="sage" hint={`${stats?.lowStockProducts ?? 0} low stock`} />
      </div>

      {/* secondary stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} icon={<Clock className="h-5 w-5" />} accent="teal" />
        <StatCard label="Custom Requests" value={stats?.customRequests ?? 0} icon={<FileBox className="h-5 w-5" />} accent="sky" />
        <StatCard label="Pending Quotes" value={stats?.pendingQuotations ?? 0} icon={<Ticket className="h-5 w-5" />} accent="olive" />
        <StatCard label="Low Stock Items" value={stats?.lowStockProducts ?? 0} icon={<AlertTriangle className="h-5 w-5" />} accent="sage" />
      </div>

      {/* charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-heading text-base font-bold text-espresso">Revenue (last 6 months)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales ?? []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#646F4B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#646F4B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE4D8" vertical={false} />
                <XAxis dataKey="label" stroke="#8A7350" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A7350" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ECE4D8' }} formatter={(v: any) => formatPrice(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#646F4B" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-heading text-base font-bold text-espresso">Orders by month</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE4D8" vertical={false} />
                <XAxis dataKey="label" stroke="#8A7350" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8A7350" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #ECE4D8' }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {(sales ?? []).map((_, i) => <Cell key={i} fill="#839D9A" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* recent orders + low stock */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-espresso">Recent Orders</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-olive hover:text-olive-600">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {recentOrders.length ? (
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-espresso-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-espresso">{o.order_number}</p>
                    <p className="text-xs text-espresso-400">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('badge', ORDER_STATUS_COLORS[o.status])}>{ORDER_STATUS_LABELS[o.status]}</span>
                    <span className="text-sm font-bold text-espresso">{formatPrice(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="py-8 text-center text-sm text-espresso-400">No orders yet</p>}
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-espresso">Custom Requests</h2>
              <Link to="/admin/custom-requests" className="inline-flex items-center gap-1 text-sm font-semibold text-olive hover:text-olive-600">View all <ArrowRight className="h-4 w-4" /></Link>
            </div>
            {recentRequests.length ? recentRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-espresso-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-espresso">{r.request_number}</p>
                  <p className="line-clamp-1 text-xs text-espresso-400">{r.description}</p>
                </div>
                <span className={cn('badge', PRINT_STATUS_COLORS[r.status])}>{PRINT_STATUS_LABELS[r.status]}</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-espresso-400">No requests yet</p>}
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-heading text-base font-bold text-espresso">Low stock alert</h2>
            {lowStock.length ? lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl px-4 py-2 hover:bg-softSage-50">
                <span className="text-sm text-espresso">{p.title}</span>
                <span className="text-sm font-semibold text-sky-700">{p.stock} left</span>
              </div>
            )) : <p className="py-4 text-center text-sm text-espresso-400">All stocked up 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
