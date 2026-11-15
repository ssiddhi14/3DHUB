import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Shop } from '@/pages/Shop'
import { ProductDetail } from '@/pages/ProductDetail'
import { CustomPrinting } from '@/pages/CustomPrinting'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { Login } from '@/pages/auth/Login'
import { Signup } from '@/pages/auth/Signup'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { Account } from '@/pages/account/Account'
import { RequireAuth, RequireAdmin } from '@/components/guards'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { ScrollToTopOnNavigate } from '@/components/ScrollToTop'
import { PageLoader } from '@/components/ui/PageLoader'

const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard').then((m)       => ({ default: m.Dashboard })))
const AdminProducts     = lazy(() => import('@/pages/admin/Products').then((m)        => ({ default: m.Products })))
const AdminCategories   = lazy(() => import('@/pages/admin/Categories').then((m)      => ({ default: m.Categories })))
const AdminMaterials    = lazy(() => import('@/pages/admin/Materials').then((m)       => ({ default: m.Materials })))
const AdminOrders       = lazy(() => import('@/pages/admin/Orders').then((m)          => ({ default: m.Orders })))
const AdminCustomReqs   = lazy(() => import('@/pages/admin/CustomRequests').then((m)  => ({ default: m.CustomRequests })))
const AdminCoupons      = lazy(() => import('@/pages/admin/Coupons').then((m)         => ({ default: m.Coupons })))
const AdminReviews      = lazy(() => import('@/pages/admin/Reviews').then((m)         => ({ default: m.Reviews })))
const AdminCustomers    = lazy(() => import('@/pages/admin/Customers').then((m)       => ({ default: m.Customers })))
const AdminBanners      = lazy(() => import('@/pages/admin/Banners').then((m)         => ({ default: m.Banners })))
const AdminSettings     = lazy(() => import('@/pages/admin/Settings').then((m)        => ({ default: m.Settings })))
const AdminLogin        = lazy(() => import('@/pages/admin/AdminLogin').then((m)      => ({ default: m.AdminLogin })))

export default function App() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Routes>
        {/* Customer-facing site */}
        <Route element={<Layout />}>
          <Route path="/"                element={<Home />} />
          <Route path="/shop"            element={<Shop />} />
          <Route path="/category/:slug"  element={<Shop />} />
          <Route path="/product/:slug"   element={<ProductDetail />} />
          <Route path="/custom-printing" element={<CustomPrinting />} />
          <Route path="/about"           element={<About />} />
          <Route path="/contact"         element={<Contact />} />
          <Route path="/cart"            element={<Cart />} />
          <Route path="/order/:id"       element={<OrderConfirmation />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/account"  element={<RequireAuth><Account /></RequireAuth>} />
        </Route>

        {/* Auth */}
        <Route path="/login"            element={<Login />} />
        <Route path="/signup"           element={<Signup />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index          element={<Suspense fallback={<PageLoader />}><AdminDashboard  /></Suspense>} />
          <Route path="products"        element={<Suspense fallback={<PageLoader />}><AdminProducts    /></Suspense>} />
          <Route path="categories"      element={<Suspense fallback={<PageLoader />}><AdminCategories  /></Suspense>} />
          <Route path="materials"       element={<Suspense fallback={<PageLoader />}><AdminMaterials   /></Suspense>} />
          <Route path="orders"          element={<Suspense fallback={<PageLoader />}><AdminOrders      /></Suspense>} />
          <Route path="custom-requests" element={<Suspense fallback={<PageLoader />}><AdminCustomReqs  /></Suspense>} />
          <Route path="coupons"         element={<Suspense fallback={<PageLoader />}><AdminCoupons     /></Suspense>} />
          <Route path="reviews"         element={<Suspense fallback={<PageLoader />}><AdminReviews     /></Suspense>} />
          <Route path="customers"       element={<Suspense fallback={<PageLoader />}><AdminCustomers   /></Suspense>} />
          <Route path="banners"         element={<Suspense fallback={<PageLoader />}><AdminBanners     /></Suspense>} />
          <Route path="settings"        element={<Suspense fallback={<PageLoader />}><AdminSettings    /></Suspense>} />
        </Route>
      </Routes>
    </>
  )
}
