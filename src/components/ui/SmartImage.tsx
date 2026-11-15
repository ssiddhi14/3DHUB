import { useState, type ImgHTMLAttributes } from 'react'
import { placeholderImage } from '@/lib/placeholder'
import { cn } from '@/lib/utils'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  label?: string
  category?: string
  aspect?: 'square' | 'video' | 'wide' | 'auto'
}

const aspectClass: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  auto: '',
}

/**
 * Image with a branded SVG fallback. If the primary src fails to load (broken
 * CDN link, offline, etc.), it swaps to a generated on-brand placeholder so the
 * layout never shows a broken image.
 */
export function SmartImage({ label, category = 'custom', aspect = 'square', className, src, alt = '', ...props }: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const fallback = placeholderImage({ label: label || alt || '3D HUB', category, seed: src ?? undefined })
  const resolved = failed || !src ? fallback : src

  return (
    <div className={cn('overflow-hidden', aspectClass[aspect], className)}>
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
        {...props}
      />
    </div>
  )
}
