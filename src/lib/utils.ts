import { clsx, type ClassValue } from './clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/** Format a number as INR currency. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Percentage discount between regular and discounted price. */
export function discountPercent(regular: number, discounted: number): number {
  if (!regular || regular <= 0) return 0
  return Math.round(((regular - discounted) / regular) * 100)
}

/** Compact date formatting. */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Generate a human-friendly order/request id like HUB-7F3K9Q. */
export function generateId(prefix = 'HUB'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `${prefix}-${code}`
}

/** Truncate text with ellipsis. */
export function truncate(text: string, max = 120): string {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

/** Simple debounce. */
export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

/** In-memory slugify for category/product names. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Validate a file extension against an allow-list. */
export function hasAllowedExtension(filename: string, allowed: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return allowed.includes(ext)
}

/** Format bytes into a readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
