import { useMemo, useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchProducts, fetchCategories, fetchMaterials } from '@/services/data'
import { ProductCard } from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/PageLoader'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

export function Shop() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const { toast } = useToast()
  const search = params.get('search') ?? ''
  const sort = (params.get('sort') as any) ?? 'newest'
  const minPrice = params.get('min') ? Number(params.get('min')) : undefined
  const maxPrice = params.get('max') ? Number(params.get('max')) : undefined
  const materialSlug = params.get('material') ?? undefined
  const inStock = params.get('instock') === '1'
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = useAsync(() => fetchCategories())
  const { data: materials } = useAsync(() => fetchMaterials())
  const { data: products, loading } = useAsync(
    () => fetchProducts({ categorySlug: slug, search, sort, minPrice, maxPrice, materialSlug, inStockOnly: inStock }),
    [slug, search, sort, minPrice, maxPrice, materialSlug, inStock],
  )

  const activeCategory = categories?.find((c) => c.slug === slug)

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const clearFilters = () => {
    setParams(slug ? {} : {}, { replace: true })
  }

  const heading = activeCategory ? activeCategory.name : search ? `Results for "${search}"` : 'All Products'

  return (
    <div>
      {/* breadcrumb */}
      <div className="border-b border-espresso-100 bg-softSage-50">
        <div className="container-page py-4">
          <nav className="flex items-center gap-1.5 text-xs text-espresso-400">
            <Link to="/" className="hover:text-olive">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-olive">Shop</Link>
            {activeCategory && <><ChevronRight className="h-3 w-3" /><span className="text-espresso">{activeCategory.name}</span></>}
          </nav>
          <h1 className="mt-2 font-heading text-2xl font-bold text-espresso sm:text-3xl">{heading}</h1>
          {activeCategory?.description && <p className="mt-1 max-w-2xl text-sm text-espresso-500">{activeCategory.description}</p>}
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-6' : 'hidden'} lg:sticky lg:top-24 lg:block lg:h-fit lg:w-64 lg:flex-shrink-0 lg:rounded-2xl lg:border lg:border-espresso-100 lg:p-5`}>
            <div className="mb-4 flex items-center justify-between lg:mb-5">
              <h2 className="font-heading text-base font-bold text-espresso">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="lg:hidden text-espresso"><X className="h-5 w-5" /></button>
            </div>

            <FilterGroup title="Category">
              <FilterRadio label="All categories" checked={!slug} onChange={() => { window.location.href = '/shop' }} />
              {categories?.filter((c) => c.slug !== 'custom-products').map((c) => (
                <FilterRadio key={c.id} label={c.name} checked={slug === c.slug} onChange={() => (window.location.href = `/category/${c.slug}`)} />
              ))}
            </FilterGroup>

            <FilterGroup title="Price range">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" defaultValue={minPrice} onBlur={(e) => update('min', e.target.value)} className="w-full rounded-lg border border-espresso-100 px-2.5 py-1.5 text-sm focus:border-olive focus:outline-none" />
                  <input type="number" placeholder="Max" defaultValue={maxPrice} onBlur={(e) => update('max', e.target.value)} className="w-full rounded-lg border border-espresso-100 px-2.5 py-1.5 text-sm focus:border-olive focus:outline-none" />
                </div>
                <button onClick={clearFilters} className="text-xs font-medium text-olive hover:text-olive-600">Clear all filters</button>
              </div>
            </FilterGroup>

            <FilterGroup title="Material">
              <FilterRadio label="All materials" checked={!materialSlug} onChange={() => update('material', null)} />
              {materials?.map((m) => (
                <FilterRadio key={m.id} label={m.name} checked={materialSlug === m.slug} onChange={() => update('material', m.slug)} />
              ))}
            </FilterGroup>

            <FilterGroup title="Availability">
              <FilterRadio label="In stock only" checked={inStock} onChange={() => update('instock', inStock ? null : '1')} />
            </FilterGroup>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-5 flex items-center justify-between gap-4">
              <button onClick={() => setShowFilters(true)} className="inline-flex items-center gap-2 rounded-xl border border-espresso-100 px-3 py-2 text-sm font-medium text-espresso lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <p className="hidden text-sm text-espresso-400 sm:block">{products?.length ?? 0} products</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-espresso-400">Sort</span>
                <select value={sort} onChange={(e) => update('sort', e.target.value)} className="rounded-xl border border-espresso-100 bg-white px-3 py-2 text-sm focus:border-olive focus:outline-none">
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {loading ? <ProductGridSkeleton count={8} /> : !products?.length ? (
              <EmptyState title="No products found" description="Try adjusting your filters or search term." />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-espresso-100 py-4 last:border-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-espresso-400">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function FilterRadio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`flex w-full items-center gap-2 text-left text-sm transition ${checked ? 'font-semibold text-olive' : 'text-espresso-500 hover:text-espresso'}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? 'border-olive' : 'border-espresso-200'}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-olive" />}
      </span>
      {label}
    </button>
  )
}
