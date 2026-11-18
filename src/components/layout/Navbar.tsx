import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useData'
import { fetchCategories } from '@/services/data'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { itemCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: dbCategories } = useAsync(() => fetchCategories())

  // Build shop dropdown: Shop All + DB categories (excluding custom-printing) + Custom 3D Printing fixed at end
  const shopLinks = [
    { label: 'Shop All', to: '/shop' },
    ...(dbCategories ?? [])
      .filter((c) => c.is_active && c.slug !== 'custom-printing')
      .slice(0, 8)
      .map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => void (document.body.style.overflow = '')
  }, [mobileOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setMobileOpen(false)
    }
  }

  return (
    <header className={cn('sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow', scrolled && 'shadow-soft')}>
      <nav className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: mobile menu + logo */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-espresso" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
            <Logo />
          </div>

          {/* Center: nav */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => cn('nav-link px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'text-olive' : 'text-espresso hover:text-olive')}>
              Home
            </NavLink>
            <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-espresso hover:text-olive">
                Shop <ChevronDown className={cn('h-4 w-4 transition-transform', shopOpen && 'rotate-180')} />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-0 w-56 pt-1">
                  <div className="card p-2 shadow-cardHover animate-fade-in">
                    {shopLinks.map((l) => (
                      <Link key={l.to} to={l.to} className="block rounded-lg px-3 py-2 text-sm text-espresso hover:bg-softSage-50 hover:text-olive">
                        {l.label}
                      </Link>
                    ))}
                    <Link to="/custom-printing" className="block rounded-lg border-t border-espresso-100 px-3 py-2 text-sm font-semibold text-olive hover:bg-softSage-50">
                      Custom 3D Printing
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <NavLink to="/custom-printing" className={({ isActive }) => cn('px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'text-olive' : 'text-espresso hover:text-olive')}>
              Custom 3D Printing
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => cn('px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'text-olive' : 'text-espresso hover:text-olive')}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => cn('px-3 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? 'text-olive' : 'text-espresso hover:text-olive')}>
              Contact
            </NavLink>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen((s) => !s)} className="rounded-lg p-2 text-espresso hover:bg-softSage-50 hover:text-olive" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link to="/account?tab=wishlist" className="hidden sm:block rounded-lg p-2 text-espresso hover:bg-softSage-50 hover:text-olive" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to={user ? '/account' : '/login'} className="rounded-lg p-2 text-espresso hover:bg-softSage-50 hover:text-olive" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="relative rounded-lg p-2 text-espresso hover:bg-softSage-50 hover:text-olive" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-espresso-100 bg-white animate-fade-in">
          <form onSubmit={submitSearch} className="container-page py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 3D-printed products..."
                className="w-full rounded-xl border border-espresso-100 bg-softSage-50 py-2.5 pl-10 pr-4 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20"
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white opacity-100 shadow-cardHover animate-slide-up" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between border-b border-espresso-100 px-4 py-4">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-espresso" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <form onSubmit={submitSearch} className="mb-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-espresso-100 px-4 py-2.5 text-sm focus:border-olive focus:outline-none"
                />
              </form>
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-espresso-300">Shop</p>
              {shopLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-espresso hover:bg-softSage-50 hover:text-olive">
                  {l.label}
                </Link>
              ))}
              <Link to="/custom-printing" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-olive hover:bg-softSage-50">
                Custom 3D Printing
              </Link>
              <div className="my-2 border-t border-espresso-100" />
              <Link to="/about" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-espresso hover:bg-softSage-50">About</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-espresso hover:bg-softSage-50">Contact</Link>
              <Link to={user ? '/account' : '/login'} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-espresso hover:bg-softSage-50">
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
