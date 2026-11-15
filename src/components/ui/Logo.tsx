import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'default' | 'light'
  showTagline?: boolean
}

export function Logo({ className, variant = 'default', showTagline = false }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-espresso'
  const subColor = variant === 'light' ? 'text-softSage-200' : 'text-sageTeal-500'
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="3D HUB home">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-espresso">
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
          <g stroke="#BFD2BF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M32 14 L48 23 L48 41 L32 50 L16 41 L16 23 Z" />
            <path d="M32 14 L32 50 M16 23 L48 41 M48 23 L16 41" />
          </g>
          <circle cx="32" cy="32" r="3.5" fill="#7BB2D9" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('font-heading text-lg font-extrabold tracking-tight', textColor)}>
          3D HUB
        </span>
        {showTagline && (
          <span className={cn('text-[10px] font-semibold tracking-[0.25em]', subColor)}>
            DESIGN · PRINT · CREATE
          </span>
        )}
      </span>
    </Link>
  )
}
