import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useToast } from '@/components/ui/Toast'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) toast(error, 'error')
    else { setSent(true); toast('Reset link sent', 'success') }
  }

  return (
    <div className="flex min-h-screen flex-col bg-softSage-50">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center"><Logo /></div>
          <div className="card p-8">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-olive text-white"><Check className="h-7 w-7" /></div>
                <h1 className="mt-4 font-heading text-2xl font-bold text-espresso">Check your email</h1>
                <p className="mt-2 text-sm text-espresso-400">We've sent a password reset link to {email}.</p>
                <Link to="/login"><Button className="mt-6">Back to sign in</Button></Link>
              </div>
            ) : (
              <>
                <h1 className="font-heading text-2xl font-bold text-espresso">Reset password</h1>
                <p className="mt-1 text-sm text-espresso-400">Enter your email and we'll send a reset link.</p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div>
                    <label className="label-field">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
                    </div>
                  </div>
                  <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Link <ArrowRight className="h-4 w-4" /></Button>
                </form>
              </>
            )}
            <p className="mt-6 text-center text-sm text-espresso-400">
              Remembered it? <Link to="/login" className="font-semibold text-olive hover:text-olive-600">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
