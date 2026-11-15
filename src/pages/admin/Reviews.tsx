import { useState } from 'react'
import { Check, X, Star } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchReviews, setReviewApproval, fetchProducts } from '@/services/data'
import { AdminPageHeader, AdminTable } from '@/components/admin/AdminUI'
import { useToast } from '@/components/ui/Toast'
import { formatDate, cn } from '@/lib/utils'
import type { Review } from '@/types'

export function Reviews() {
  const { toast } = useToast()
  const { data: reviews } = useAsync(() => fetchReviews())
  const { data: products } = useAsync(() => fetchProducts({ limit: 100 }))
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const productMap = new Map((products ?? []).map((p) => [p.id, p]))
  const filtered = (reviews ?? []).filter((r) => filter === 'all' || (filter === 'pending' ? !r.is_approved : r.is_approved))

  const toggle = async (r: Review) => {
    await setReviewApproval(r.id, !r.is_approved)
    toast(r.is_approved ? 'Review hidden' : 'Review approved', 'success')
  }

  return (
    <div>
      <AdminPageHeader title="Reviews" description={`${reviews?.length ?? 0} customer reviews`} />
      <div className="mb-4 flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('rounded-xl px-4 py-2 text-sm font-medium capitalize transition', filter === f ? 'bg-olive text-white' : 'bg-white text-espresso-400 border border-espresso-100 hover:text-espresso')}>{f}</button>
        ))}
      </div>
      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-sky-300 text-sky-300" />)}</div>
                    <span className="text-sm font-semibold text-espresso">{r.user_name}</span>
                    <span className="text-xs text-espresso-400">{formatDate(r.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-espresso-400">on {productMap.get(r.product_id)?.title ?? 'Unknown product'}</p>
                  <p className="mt-1 text-sm font-medium text-espresso">{r.title}</p>
                  <p className="mt-1 text-sm text-espresso-500">{r.body}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className={cn('badge', r.is_approved ? 'bg-olive-100 text-olive-700' : 'bg-sky-100 text-sky-700')}>{r.is_approved ? 'Approved' : 'Pending'}</span>
                  <button onClick={() => toggle(r)} className={cn('rounded-xl p-2 transition', r.is_approved ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-olive text-white hover:bg-olive-600')} aria-label={r.is_approved ? 'Hide' : 'Approve'}>
                    {r.is_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-espresso-100 py-16 text-center"><Star className="mx-auto h-10 w-10 text-espresso-200" /><p className="mt-3 text-espresso-400">No reviews to show</p></div>}
    </div>
  )
}
