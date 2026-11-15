import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function AdminLogin() {
  const { signIn, user, isAdmin, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [user, isAdmin, loading, navigate])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      toast(error, 'error')
      return
    }
    // After signIn, AuthContext re-fetches user with role.
    // The useEffect above will redirect once isAdmin becomes true.
    // Safety fallback — navigate directly:
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center"><Logo variant="light" /></div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-softSage-200">
            <Shield className="h-3.5 w-3.5" /> Admin Dashboard
          </div>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-cardHover">
          <h1 className="font-heading text-xl font-bold text-espresso">Admin Sign In</h1>
          <p className="mt-1 text-sm text-espresso-400">Authorized personnel only</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label-field">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="admin@3dhub.example" />
              </div>
            </div>
            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" loading={submitting} className="w-full" size="lg">Sign In</Button>
          </form>
          <p className="mt-5 rounded-lg bg-softSage-50 px-3 py-2 text-xs text-espresso-500">
            Demo mode: sign up with the admin bootstrap email, then sign in here. See README for setup.
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-softSage-200"><Link to="/" className="hover:text-white">← Back to store</Link></p>
      </div>
    </div>
  )
}
