import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { useToast } from '@/components/ui/Toast'

export function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.name)
    setLoading(false)
    if (error) {
      toast(error, 'error')
    } else {
      toast('Account created! Welcome to 3D HUB.', 'success')
      navigate('/account')
    }
  }

  const google = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setGoogleLoading(false)
      toast(error, 'error')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-softSage-50">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center"><Logo /></div>
          <div className="card p-8">
            <h1 className="font-heading text-2xl font-bold text-espresso">Create your account</h1>
            <p className="mt-1 text-sm text-espresso-400">Join 3D HUB to track orders and save favorites</p>

            <div className="mt-6">
              <GoogleButton onClick={google} loading={googleLoading} />
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-espresso-100" />
              <span className="text-xs text-espresso-300">or sign up with email</span>
              <div className="h-px flex-1 bg-espresso-100" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label-field">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" placeholder="Your name" />
                </div>
              </div>
              <div>
                <label className="label-field">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                  <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10" placeholder="At least 6 characters" />
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">Create Account <ArrowRight className="h-4 w-4" /></Button>
            </form>
            <p className="mt-6 text-center text-sm text-espresso-400">
              Already have an account? <Link to="/login" className="font-semibold text-olive hover:text-olive-600">Sign in</Link>
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
