import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tags, Layers, ShoppingCart, FileBox,
  Ticket, Star, Users, Image as ImageIcon, Settings,
  LogOut, Menu, X, ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/materials', label: 'Materials', icon: Layers },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/custom-requests', label: 'Custom Requests', icon: FileBox },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-softSage-50">
      {/* Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-espresso text-softSage-100 transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo variant="light" />
          <button onClick={() => setOpen(false)} className="text-softSage-200 lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-olive text-white' : 'text-softSage-200 hover:bg-white/5 hover:text-white')}
            >
              <n.icon className="h-4.5 w-4.5" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-xs font-bold text-white">
              {(user?.full_name || user?.email || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.full_name || 'Admin'}</p>
              <p className="truncate text-xs text-softSage-300">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-softSage-200 hover:bg-white/10">
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </Link>
            <button onClick={async () => { await signOut(); navigate('/admin/login') }} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-softSage-200 hover:bg-red-500/20 hover:text-red-300">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-espresso-100 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden text-espresso"><Menu className="h-6 w-6" /></button>
          <h1 className="font-heading text-lg font-bold text-espresso">3D HUB Admin</h1>
          <div className="ml-auto text-sm text-espresso-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-espresso-900/40 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  )
}
