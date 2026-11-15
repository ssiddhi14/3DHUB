import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useToast } from '@/components/ui/Toast'
import { subscribeNewsletter } from '@/services/data'

const FOOTER_SHOP = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Home & Decor', to: '/category/home-decor' },
  { label: 'Desk Accessories', to: '/category/desk-accessories' },
  { label: 'Personalized Gifts', to: '/category/personalized-gifts' },
  { label: 'Miniatures & Models', to: '/category/miniatures-models' },
]

const FOOTER_COMPANY = [
  { label: 'About Us', to: '/about' },
  { label: 'Custom 3D Printing', to: '/custom-printing' },
  { label: 'Contact', to: '/contact' },
]

export function Footer() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await subscribeNewsletter(email)
      toast('Subscribed! Welcome to 3D HUB.', 'success')
      setEmail('')
    } catch {
      toast('Could not subscribe. Please try again.', 'error')
    }
  }

  return (
    <footer className="bg-espresso text-softSage-100">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-page py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold text-white">Join the 3D HUB community</h2>
            <p className="mt-2 text-sm text-softSage-200">Get early access to new drops, design tips, and exclusive offers.</p>
            <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-md gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-softSage-200/60 focus:border-olive focus:outline-none"
              />
              <button type="submit" className="btn bg-olive text-white hover:bg-olive-600">
                <Send className="h-4 w-4" /> Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo variant="light" showTagline />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-softSage-200">
              Premium 3D-printed products and custom printing services. We turn your ideas into tangible, beautiful objects.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-softSage-200 transition hover:bg-olive hover:text-white" aria-label="Social">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">Shop</h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_SHOP.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-softSage-200 transition hover:text-sageTeal-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_COMPANY.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-softSage-200 transition hover:text-sageTeal-400">{l.label}</Link></li>
              ))}
              <li><Link to="/admin" className="text-sm text-softSage-200 transition hover:text-sageTeal-400">Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-white">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-softSage-200">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-sageTeal-400" /> hello@3dhub.example</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-sageTeal-400" /> +91 98290 51866</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 flex-shrink-0 text-sageTeal-400" /> Jaipur, India</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-softSage-200/70 sm:flex-row">
          <p>© {new Date().getFullYear()} 3D HUB. All rights reserved.</p>
          <p>Design · Print · Create</p>
        </div>
      </div>
    </footer>
  )
}
