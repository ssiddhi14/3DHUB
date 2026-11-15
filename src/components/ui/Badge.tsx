import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'sky' | 'olive' | 'teal' | 'sale' | 'neutral'
  className?: string
}

const variants: Record<string, string> = {
  sky: 'badge-sky',
  olive: 'badge-olive',
  teal: 'badge-teal',
  sale: 'badge-sale',
  neutral: 'badge bg-espresso-100 text-espresso-600',
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return <span className={cn(variants[variant], className)}>{children}</span>
}
