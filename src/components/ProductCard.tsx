import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import type { Product } from '@/types'
import { SmartImage } from '@/components/ui/SmartImage'
import { Badge } from '@/components/ui/Badge'
import { cn, formatPrice, discountPercent } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [wished, setWished] = useState(false)

  const price = product.discounted_price ?? product.price
  const off = product.discounted_price ? discountPercent(product.price, product.discounted_price) : 0
  const lowStock = product.stock > 0 && product.stock < 6
  const outOfStock = product.stock <= 0

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock) return
    addItem(product, 1, product.colors[0]?.name)
    toast(`${product.title} added to cart`, 'success')
  }

  return (
    <Link to={`/product/${product.slug}`} className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
      <div className="relative">
        <SmartImage
          src={product.images[0]}
          alt={product.title}
          aspect="square"
          label={product.title}
          category={product.category?.slug}
          className="bg-softSage-50 transition-transform duration-500 group-hover:scale-105"
        />
        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <Badge variant="sale">-{off}%</Badge>}
          {product.is_new_arrival && <Badge variant="sky">New</Badge>}
          {product.is_bestseller && <Badge variant="olive">Bestseller</Badge>}
        </div>
        {/* hover actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={(e) => { e.preventDefault(); setWished((w) => !w); toast(wished ? 'Removed from wishlist' : 'Added to wishlist', 'info') }}
            className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:bg-white', wished ? 'text-olive' : 'text-espresso-400 hover:text-olive')}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4', wished && 'fill-olive')} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product) }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-espresso-400 shadow-soft backdrop-blur transition hover:bg-white hover:text-olive"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="badge bg-espresso-100 text-espresso-600">Out of stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-sageTeal-500">
          <Star className="h-3.5 w-3.5 fill-sageTeal-400 text-sageTeal-400" />
          <span className="font-semibold">{product.rating || 'New'}</span>
          {product.review_count > 0 && <span className="text-espresso-300">({product.review_count})</span>}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-heading text-sm font-bold text-espresso group-hover:text-olive">
          {product.title}
        </h3>
        <p className="mt-0.5 text-xs text-espresso-300">{product.category?.name}</p>

        {/* colors */}
        <div className="mt-2.5 flex items-center gap-1.5">
          {product.colors.slice(0, 5).map((c) => (
            <span key={c.hex} className="h-4 w-4 rounded-full border border-espresso-100 shadow-sm" style={{ backgroundColor: c.hex }} title={c.name} />
          ))}
          {product.colors.length > 5 && <span className="text-xs text-espresso-300">+{product.colors.length - 5}</span>}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-base font-bold text-espresso">{formatPrice(price)}</span>
              {product.discounted_price && (
                <span className="text-xs text-espresso-300 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            {lowStock && <p className="mt-0.5 text-[11px] font-medium text-sky-700">Only {product.stock} left</p>}
          </div>
        </div>

        <button
          onClick={addToCart}
          disabled={outOfStock}
          className={cn('btn mt-3 w-full', outOfStock ? 'bg-espresso-100 text-espresso-400' : 'bg-olive text-white hover:bg-olive-600')}
        >
          <ShoppingBag className="h-4 w-4" /> {outOfStock ? 'Sold out' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
}
