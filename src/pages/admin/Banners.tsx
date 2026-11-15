import { useState } from 'react'
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchAllBanners, saveBanner, deleteBanner, uploadFile } from '@/services/data'
import { AdminPageHeader, ConfirmDialog } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { placeholderImage } from '@/lib/placeholder'
import type { Banner } from '@/types'

const empty = (): Partial<Banner> => ({ title: '', subtitle: '', image_url: '', cta_text: '', cta_link: '', is_active: true })

export function Banners() {
  const { toast } = useToast()
  const { data: banners, loading } = useAsync(() => fetchAllBanners())
  const [editing, setEditing] = useState<Partial<Banner> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  const save = async () => {
    if (!editing?.title) { toast('Title required', 'error'); return }
    setSaving(true)
    try {
      const data = { ...editing, image_url: editing.image_url || placeholderImage({ label: editing.title, category: 'custom', width: 1200, height: 400 }) }
      await saveBanner(data)
      toast('Banner saved', 'success')
      setEditing(null)
    } catch (e: any) { toast(e?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    e.target.value = ''
    setImageUploading(true)
    try {
      const url = await uploadFile('banners', `banner-${Date.now()}.${file.name.split('.').pop()}`, file)
      setEditing({ ...editing, image_url: url! })
      toast('Image uploaded', 'success')
    } catch (err: any) {
      console.error('[Banner upload error]', err)
      toast(err?.message ?? 'Upload failed', 'error')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <div>
      <AdminPageHeader title="Banners & Homepage" description="Manage promotional banners on the homepage" action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> Add Banner</Button>} />
      {loading ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}</div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {(banners ?? []).map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="relative">
                <img src={b.image_url} alt={b.title} className="aspect-[3/1] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-espresso-900/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-heading text-lg font-bold text-white">{b.title}</h3>
                  <p className="text-xs text-softSage-100">{b.subtitle}</p>
                </div>
                <div className="absolute right-3 top-3 flex gap-1">
                  {b.is_active ? <Eye className="h-4 w-4 text-white" /> : <EyeOff className="h-4 w-4 text-white/60" />}
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-espresso-400">Order {b.sort_order} · {b.cta_text}</span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(b)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(b)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Banner' : 'New Banner'} size="lg">
        {editing && (
          <div className="space-y-4 p-6">
            <Input label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Input label="Subtitle" value={editing.subtitle ?? ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
            <div className="flex items-center gap-3">
              <img src={editing.image_url ?? placeholderImage({ label: editing.title || 'Banner', category: 'custom', width: 1200, height: 400 })} alt="" className="h-20 w-36 rounded-xl object-cover" />
              <label className={cn('btn-outline btn cursor-pointer', imageUploading && 'opacity-60 pointer-events-none')}>
                {imageUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Upload</>}
                <input type="file" className="hidden" accept="image/*" onChange={onImage} disabled={imageUploading} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="CTA text" value={editing.cta_text ?? ''} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} placeholder="Shop now" />
              <Input label="CTA link" value={editing.cta_link ?? ''} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} placeholder="/shop" />
              <Input label="Sort order" type="number" value={editing.sort_order ?? 1} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-espresso">
              <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="h-4 w-4 rounded border-espresso-200 text-olive focus:ring-olive" /> Active
            </label>
            <div className="flex justify-end gap-2 border-t border-espresso-100 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} loading={saving}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await deleteBanner(deleteTarget.id); toast('Banner deleted', 'info') } }} title="Delete banner" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  )
}
