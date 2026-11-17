import { useState } from 'react'
import { Check, X, Star, Plus, Pencil, Trash2, Upload, Loader2 } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchReviews, setReviewApproval, saveReview, deleteReview, uploadFile } from '@/services/data'
import { AdminPageHeader, ConfirmDialog } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatDate, cn } from '@/lib/utils'
import type { Review } from '@/types'

const emptyReview = (): Partial<Review> => ({
  user_name: '',
  product_name: '',
  body: '',
  rating: 5,
  photo_url: null,
  is_approved: true,
})

export function Reviews() {
  const { toast } = useToast()
  const { data: reviews } = useAsync(() => fetchReviews())
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [editing, setEditing] = useState<Partial<Review> | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  const filtered = (reviews ?? []).filter((r) =>
    filter === 'all' ? true : filter === 'pending' ? !r.is_approved : r.is_approved
  )

  const save = async () => {
    if (!editing?.user_name || !editing?.body) { toast('Name and review text required', 'error'); return }
    setSaving(true)
    try {
      await saveReview(editing)
      toast('Review saved', 'success')
      setEditing(null)
    } catch (e: any) {
      toast(e?.message ?? 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    e.target.value = ''
    setUploading(true)
    try {
      const url = await uploadFile('banners', `reviews/${Date.now()}.${file.name.split('.').pop()}`, file)
      setEditing({ ...editing, photo_url: url! })
      toast('Photo uploaded', 'success')
    } catch (err: any) {
      toast(err?.message ?? 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const toggle = async (r: Review) => {
    await setReviewApproval(r.id, !r.is_approved)
    toast(r.is_approved ? 'Review hidden' : 'Review approved', 'success')
  }

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description={`${reviews?.length ?? 0} customer reviews`}
        action={<Button onClick={() => setEditing(emptyReview())}><Plus className="h-4 w-4" /> Add Review</Button>}
      />

      <div className="mb-4 flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('rounded-xl px-4 py-2 text-sm font-medium capitalize transition',
              filter === f ? 'bg-olive text-white' : 'bg-white text-espresso-400 border border-espresso-100 hover:text-espresso')}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-2xl shadow-card">
              {/* Photo top */}
              <div className="relative aspect-[4/3] bg-softSage-200">
                {r.photo_url ? (
                  <img src={r.photo_url} alt="Customer photo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-softSage-200 to-sageTeal-200">
                    <div className="flex gap-2 items-end">
                      {[32, 48, 28].map((h, i) => (
                        <div key={i} className="rounded-xl border-2 border-white/60" style={{ width: h * 0.65, height: h }} />
                      ))}
                    </div>
                  </div>
                )}
                <span className="absolute bottom-3 left-3 rounded-full bg-espresso/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  Customer photo
                </span>
                {/* Status badge */}
                <span className={cn('absolute top-3 right-3 badge', r.is_approved ? 'bg-olive text-white' : 'bg-sky-100 text-sky-700')}>
                  {r.is_approved ? 'Live' : 'Pending'}
                </span>
              </div>

              {/* Review bottom */}
              <div className="p-4" style={{ backgroundColor: '#2A2011' }}>
                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('h-3.5 w-3.5', i < r.rating ? 'fill-sky-300 text-sky-300' : 'text-white/20')} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-softSage-100 line-clamp-3">"{r.body}"</p>
                <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-olive text-xs font-bold text-white">
                    {r.user_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-white">{r.user_name}</p>
                      <span className="text-[10px] text-olive-300" style={{ color: '#a3b880' }}>✓ Verified</span>
                    </div>
                    <p className="truncate text-[11px] text-softSage-300">{r.product_name || 'Verified purchase'}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(r)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggle(r)} className={cn('rounded-lg p-1.5 transition', r.is_approved ? 'text-red-400 hover:bg-white/10' : 'text-olive-300 hover:bg-white/10')} style={{ color: r.is_approved ? '#f87171' : '#a3b880' }}>
                      {r.is_approved ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => setDeleteTarget(r)} className="rounded-lg p-1.5 text-red-400/70 hover:bg-white/10 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-espresso-100 py-16 text-center">
          <Star className="mx-auto h-10 w-10 text-espresso-200" />
          <p className="mt-3 text-espresso-400">No reviews to show</p>
          <Button className="mt-4" onClick={() => setEditing(emptyReview())}>
            <Plus className="h-4 w-4" /> Add First Review
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Review' : 'Add Review'} size="md">
        {editing && (
          <div className="space-y-4 p-6">
            {/* Photo upload */}
            <div>
              <label className="label-field">Customer Photo</label>
              <div className="flex items-center gap-3">
                {editing.photo_url ? (
                  <div className="relative h-20 w-28 overflow-hidden rounded-xl">
                    <img src={editing.photo_url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setEditing({ ...editing, photo_url: null })}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-20 w-28 items-center justify-center rounded-xl border-2 border-dashed border-espresso-100 bg-softSage-50">
                    <Upload className="h-5 w-5 text-espresso-300" />
                  </div>
                )}
                <label className={cn('btn-outline btn cursor-pointer', uploading && 'opacity-60 pointer-events-none')}>
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : 'Upload Photo'}
                  <input type="file" className="hidden" accept="image/*" onChange={onPhoto} disabled={uploading} />
                </label>
              </div>
              <p className="mt-1 text-xs text-espresso-400">Photo of the customer's product — shown as card background</p>
            </div>

            {/* Stars */}
            <div>
              <label className="label-field">Rating</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setEditing({ ...editing, rating: i + 1 })}>
                    <Star className={cn('h-6 w-6', i < (editing.rating || 0) ? 'fill-sky-300 text-sky-300' : 'text-espresso-200')} />
                  </button>
                ))}
              </div>
            </div>

            <Input label="Customer Name" value={editing.user_name || ''} onChange={(e) => setEditing({ ...editing, user_name: e.target.value })} placeholder="e.g. Rohan K." />
            <Input label="Product Name" value={editing.product_name || ''} onChange={(e) => setEditing({ ...editing, product_name: e.target.value })} placeholder="e.g. Modular Desk Organizer" />
            <Textarea label="Review Text" value={editing.body || ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} placeholder="What did the customer say?" />

            <label className="flex items-center gap-2 text-sm text-espresso">
              <input type="checkbox" checked={editing.is_approved ?? true} onChange={(e) => setEditing({ ...editing, is_approved: e.target.checked })}
                className="h-4 w-4 rounded border-espresso-200 text-olive focus:ring-olive" />
              Show on homepage (approved)
            </label>

            <div className="flex justify-end gap-2 border-t border-espresso-100 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} loading={saving}>Save Review</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) { await deleteReview(deleteTarget.id); toast('Review deleted', 'info') } }}
        title="Delete review"
        message={`Delete review by "${deleteTarget?.user_name}"?`}
      />
    </div>
  )
}
