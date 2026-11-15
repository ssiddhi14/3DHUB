import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, onAuthChange, signIn, signUp, signInWithGoogle, signOut, resetPassword, updateProfile } from '@/services/auth'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updateProfile: (profile: Profile) => Promise<{ error: string | null }>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USER_KEY = '3dhub-current-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    const u = await getCurrentUser()
    setUser(u)
    setLoading(false)
  }

  useEffect(() => {
    loadUser()
    const unsub = onAuthChange((u) => {
      setUser(u)
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    })
    return unsub
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    signIn: async (email, password) => {
      const { error, user: u } = await signIn(email, password)
      if (u) {
        setUser(u)
        localStorage.setItem(USER_KEY, JSON.stringify(u))
      }
      return { error }
    },
    signUp: async (email, password, name) => {
      const { error, user: u } = await signUp(email, password, name)
      if (u) {
        setUser(u)
        localStorage.setItem(USER_KEY, JSON.stringify(u))
      }
      return { error }
    },
    signInWithGoogle: async () => {
      const { error } = await signInWithGoogle()
      // OAuth redirect happens on success; no local state change needed here.
      if (error) return { error }
      return { error: null }
    },
    signOut: async () => {
      await signOut()
      setUser(null)
      localStorage.removeItem(USER_KEY)
    },
    resetPassword,
    updateProfile: async (profile) => {
      const { error } = await updateProfile(profile)
      if (!error) setUser(profile)
      return { error }
    },
    refresh: loadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
