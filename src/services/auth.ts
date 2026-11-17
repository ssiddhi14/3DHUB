/**
 * Authentication service.
 *
 * Uses Supabase Auth when configured. In demo mode it simulates auth with a
 * local session so the full account flow can be exercised. The admin role is
 * determined by the profile row (role = 'admin'), seeded via the SQL migration
 * for the email listed in VITE_ADMIN_BOOTSTRAP_EMAIL.
 */

import { supabase, supabaseReady } from '@/lib/supabase'
import { getStore, mutate, genId } from './store'
import type { Profile } from '@/types'

const SESSION_KEY = '3dhub-demo-session'

export interface AuthSession {
  user: Profile | null
}

function readDemoSession(): Profile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

function writeDemoSession(profile: Profile | null) {
  if (profile) localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
  else localStorage.removeItem(SESSION_KEY)
}

export async function getCurrentUser(): Promise<Profile | null> {
  if (supabaseReady && supabase) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return null
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()
    if (error) return null
    if (profile) return profile as Profile
    // first login: create profile row
    const newProfile: Profile = {
      id: data.user.id,
      email: data.user.email ?? '',
      full_name: (data.user.user_metadata?.full_name as string) ?? null,
      phone: (data.user.user_metadata?.phone as string) ?? null,
      role: 'customer',
      avatar_url: null,
      created_at: new Date().toISOString(),
    }
    await supabase.from('profiles').insert(newProfile)
    return newProfile
  }
  return readDemoSession()
}

export async function signUp(email: string, password: string, fullName: string): Promise<{ error: string | null; user: Profile | null }> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: error.message, user: null }
    const user = data.user
    const profile: Profile | null = user
      ? { id: user.id, email: user.email ?? email, full_name: fullName, phone: null, role: 'customer', avatar_url: null, created_at: new Date().toISOString() }
      : null
    return { error: null, user: profile }
  }
  // demo mode
  const existing = getStore().profiles.find((p) => p.email === email)
  if (existing) return { error: 'An account with this email already exists.', user: null }
  const adminEmail = import.meta.env.VITE_ADMIN_BOOTSTRAP_EMAIL || 'admin@3dhub.example'
  const profile: Profile = {
    id: genId('usr'),
    email,
    full_name: fullName,
    phone: null,
    role: email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'customer',
    avatar_url: null,
    created_at: new Date().toISOString(),
  }
  mutate((s) => void s.profiles.push(profile))
  writeDemoSession(profile)
  return { error: null, user: profile }
}

export async function signIn(email: string, password: string): Promise<{ error: string | null; user: Profile | null }> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message, user: null }
    const user = data.user
    // Small delay to ensure session is fully established before querying
    await new Promise((r) => setTimeout(r, 300))
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (profile) {
      return { error: null, user: profile as Profile }
    }
    // Profile row missing — create it now
    const newProfile: Profile = {
      id: user.id,
      email: user.email ?? email,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      phone: null,
      role: 'customer',
      avatar_url: null,
      created_at: new Date().toISOString(),
    }
    await supabase.from('profiles').insert(newProfile).select().maybeSingle()
    // Re-fetch to pick up any role that was manually set via SQL
    await new Promise((r) => setTimeout(r, 200))
    const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    return { error: null, user: (freshProfile as Profile) ?? newProfile }
  }
  // demo mode: accept any password, look up by email, auto-create if missing
  const existing = getStore().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    writeDemoSession(existing)
    return { error: null, user: existing }
  }
  // allow the bootstrap admin to log in without prior signup in demo mode
  const adminEmail = import.meta.env.VITE_ADMIN_BOOTSTRAP_EMAIL || 'admin@3dhub.example'
  if (email.toLowerCase() === adminEmail.toLowerCase()) {
    const profile: Profile = { id: genId('usr'), email, full_name: 'Administrator', phone: null, role: 'admin', avatar_url: null, created_at: new Date().toISOString() }
    mutate((s) => void s.profiles.push(profile))
    writeDemoSession(profile)
    return { error: null, user: profile }
  }
  return { error: 'No account found. Please sign up first.', user: null }
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (supabaseReady && supabase) {
    // Use current origin so it works both on localhost and vercel
    const redirectTo = `${window.location.origin}/login`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    })
    return { error: error?.message ?? null }
  }
  return { error: 'Google sign-in requires a connected Supabase project. Add your credentials to .env to enable it.' }
}

export async function signOut(): Promise<void> {
  if (supabaseReady && supabase) {
    await supabase.auth.signOut()
    return
  }
  writeDemoSession(null)
}

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error: error?.message ?? null }
  }
  return { error: null }
}

export function onAuthChange(callback: (profile: Profile | null) => void): () => void {
  if (supabaseReady && supabase) {
    const { data } = supabase.auth.onAuthStateChange(async () => {
      const user = await getCurrentUser()
      callback(user)
    })
    return () => data.subscription.unsubscribe()
  }
  // demo mode: poll storage for changes
  const handler = () => callback(readDemoSession())
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export async function updateProfile(profile: Profile): Promise<{ error: string | null }> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone, avatar_url: profile.avatar_url }).eq('id', profile.id)
    return { error: error?.message ?? null }
  }
  mutate((s) => {
    const p = s.profiles.find((p) => p.id === profile.id)
    if (p) Object.assign(p, profile)
    writeDemoSession(profile)
  })
  return { error: null }
}
