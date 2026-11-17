import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { useToast } from '@/components/ui/Toast'
import { supabase, supabaseReady } from '@/lib/supabase'

export function Login() {
  const { signIn, signInWithGoogle, refresh } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Handle Google OAuth callback — Supabase returns #access_token in the URL hash
  useEffect(() => {
    if (!supabaseReady || !supabase) return

    // If URL has hash with access_token — Supabase OAuth callback
    if (window.location.hash.includes('access_token')) {
      setGoogleLoading(true)
      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session) {
          await refresh()
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          const stored = localStorage.getItem('3dhub-current-user')
          const user = stored ? JSON.parse(stored) : null
          if (user?.role === 'admin') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/', { replace: true })
          }
        }
        setGoogleLoading(false)
      })
      return
    }

    // Also listen for auth state change (handles redirect back)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN') && session) {
        await refresh()
        window.history.replaceState(null, '', window.location.pathname)
        const stored = localStorage.getItem('3dhub-current-user')
        const user = stored ? JSON.parse(stored) : null
        if (user?.role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, refresh])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { toast(error, 'error'); return }
    const stored = localStorage.getItem('3dhub-current-user')
    const user = stored ? JSON.parse(stored) : null
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate(from, { replace: true })
    }
  }

  const google = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setGoogleLoading(false)
      toast(error, 'error')
    }
    // Browser redirects to Google — loading stays
  }

  return (
    <div className="flex min-h-screen flex-col bg-softSage-50">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center"><Logo /></div>
          <div className="card p-8">
            <h1 className="font-heading text-2xl font-bold text-espresso">Welcome back</h1>
            <p className="mt-1 text-sm text-espresso-400">Sign in to your 3D HUB account</p>

            <div className="mt-6">
              <GoogleButton onClick={google} loading={googleLoading} />
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-espresso-100" />
              <span className="text-xs text-espresso-300">or sign in with email</span>
              <div className="h-px flex-1 bg-espresso-100" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label-field">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-semibold text-olive hover:text-olive-600">Forgot password?</Link>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">Sign In <ArrowRight className="h-4 w-4" /></Button>
            </form>
            <p className="mt-6 text-center text-sm text-espresso-400">
              Don't have an account? <Link to="/signup" className="font-semibold text-olive hover:text-olive-600">Sign up</Link>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-espresso-400">
            <Link to="/" className="hover:text-olive">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
