import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product } from '@/types'

interface WishlistContextValue {
  items: Product[]
  isWished: (productId: string) => boolean
  toggle: (product: Product) => void
  count: number
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

const STORAGE_KEY = '3dhub-wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Product[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const isWished = (productId: string) => items.some((p) => p.id === productId)

  const toggle = (product: Product) => {
    setItems((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product],
    )
  }

  return (
    <WishlistContext.Provider value={{ items, isWished, toggle, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
