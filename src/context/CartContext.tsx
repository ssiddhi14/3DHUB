import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '@/types'
import { fetchSettings } from '@/services/data'

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, color?: string) => void
  removeItem: (productId: string, color?: string) => void
  updateQuantity: (productId: string, quantity: number, color?: string) => void
  clearCart: () => void
  subtotal: number
  shipping: number
  discount: number
  total: number
  itemCount: number
  appliedCouponCode: string | null
  couponDiscount: number
  applyCouponCode: (code: string, subtotal: number, discount: number) => void
  clearCoupon: () => void
  settings: { shipping_flat_rate: number; free_shipping_threshold: number } | null
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const CART_KEY = '3dhub-cart'
const COUPON_KEY = '3dhub-coupon'

function itemKey(productId: string, color?: string) {
  return `${productId}__${color ?? ''}`
}

function effectivePrice(p: Product): number {
  return p.discounted_price ?? p.price
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const [settings, setSettings] = useState<{ shipping_flat_rate: number; free_shipping_threshold: number } | null>(null)
  const [couponCode, setCouponCode] = useState<string | null>(() => localStorage.getItem(COUPON_KEY))
  const [couponDiscount, setCouponDiscount] = useState<number>(() => Number(localStorage.getItem('3dhub-coupon-disc') ?? 0))

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    fetchSettings().then((s) => setSettings({ shipping_flat_rate: s.shipping_flat_rate, free_shipping_threshold: s.free_shipping_threshold }))
  }, [])

  const addItem = (product: Product, quantity = 1, color?: string) => {
    setItems((prev) => {
      const key = itemKey(product.id, color)
      const existing = prev.find((i) => itemKey(i.product_id, i.color) === key)
      if (existing) {
        return prev.map((i) => (itemKey(i.product_id, i.color) === key ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { product_id: product.id, product, quantity, color }]
    })
  }

  const removeItem = (productId: string, color?: string) => {
    const key = itemKey(productId, color)
    setItems((prev) => prev.filter((i) => itemKey(i.product_id, i.color) !== key))
  }

  const updateQuantity = (productId: string, quantity: number, color?: string) => {
    if (quantity <= 0) return removeItem(productId, color)
    const key = itemKey(productId, color)
    setItems((prev) => prev.map((i) => (itemKey(i.product_id, i.color) === key ? { ...i, quantity } : i)))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + effectivePrice(i.product) * i.quantity, 0), [items])

  const itemDiscount = useMemo(() => items.reduce((sum, i) => sum + (i.product.discounted_price ? (i.product.price - i.product.discounted_price) * i.quantity : 0), 0), [items])

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0
    const threshold = settings?.free_shipping_threshold ?? 999
    if (subtotal >= threshold) return 0
    return settings?.shipping_flat_rate ?? 79
  }, [subtotal, settings])

  const total = useMemo(() => Math.max(0, subtotal - couponDiscount + shipping), [subtotal, couponDiscount, shipping])

  const applyCouponCode = (code: string, _subtotal: number, _discount: number) => {
    setCouponCode(code)
    localStorage.setItem(COUPON_KEY, code)
  }

  const clearCoupon = () => {
    setCouponCode(null)
    setCouponDiscount(0)
    localStorage.removeItem(COUPON_KEY)
    localStorage.removeItem('3dhub-coupon-disc')
  }

  // exposed couponDiscount setter is handled by checkout page via applyCoupon
  const setDiscount = (d: number) => {
    setCouponDiscount(d)
    localStorage.setItem('3dhub-coupon-disc', String(d))
  }

  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    discount: itemDiscount,
    total,
    itemCount,
    appliedCouponCode: couponCode,
    couponDiscount,
    applyCouponCode: applyCouponCode,
    clearCoupon,
    settings,
  }

  // attach setDiscount via a ref-like trick on the context value (used by checkout)
  ;(value as any).setCouponDiscount = setDiscount

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
