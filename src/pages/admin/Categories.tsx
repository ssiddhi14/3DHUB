import { useState } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchCategories, createCategory, updateCategory, deleteCategory, uploadFile } from '@/services/data'
import { AdminPageHeader, AdminTable, ConfirmDialog } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { placeholderImage } from '@/lib/placeholder'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

export function Categories() {
  const { toast } = useToast()
  const { data: categories, loading } = useAsync(() => fetchCategories())
  const [editing, setEditing] = useState<Partial<Category> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  const save = async () => {
    if (!editing?.name) { toast('Name required', 'error'); return }
    setSaving(true)
    try {
      const data = { ...editing, image_url: editing.image_url || placeholderImage({ label: editing.name, category: editing.slug ?? 'custom', seed: editing.name }) }
      if (editing.id) { await updateCategory(editing.id, data); toast('Category updated', 'success') }
      else { await createCategory(data); toast('Category created', 'success') }
      setEditing(null)
    } catch (e: any) { toast(e?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    e.target.value = ''
    setImageUploading(true)
    try {
      const url = await uploadFile('banners', `cat-${Date.now()}.${file.name.split('.').pop()}`, file)
      setEditing({ ...editing, image_url: url! })
      toast('Image uploaded', 'success')
    } catch (err: any) {
      console.error('[Category upload error]', err)
      toast(err?.message ?? 'Upload failed', 'error')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <div>
      <AdminPageHeader title="Categories" description="Organize your product catalogue" action={<Button onClick={() => setEditing({ name: '', description: '', is_active: true })}><Plus className="h-4 w-4" /> Add Category</Button>} />
      {loading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div> : (
        <AdminTable headers={['', 'Category', 'Slug', 'Order', 'Status', 'Actions']}>
          {[...(categories ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((c) => (
            <tr key={c.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3 text-espresso-300"><GripVertical className="h-4 w-4" /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={c.image_url ?? ''} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-espresso">{c.name}</p>
                    <p className="line-clamp-1 text-xs text-espresso-400">{c.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-espresso-400">/category/{c.slug}</td>
              <td className="px-4 py-3 text-espresso-400">{c.sort_order}</td>
              <td className="px-4 py-3"><span className={cn('badge', c.is_active ? 'bg-olive-100 text-olive-700' : 'bg-espresso-100 text-espresso-400')}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Category' : 'New Category'}>
        {editing && (
          <div className="space-y-4 p-6">
            <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Textarea label="Description" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <div>
              <label className="label-field">Image</label>
              <div className="flex items-center gap-3">
                <img src={editing.image_url ?? placeholderImage({ label: editing.name || 'Category', category: 'custom' })} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <label className={cn('btn-outline btn cursor-pointer', imageUploading && 'opacity-60 pointer-events-none')}>
                {imageUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : 'Upload'}
                <input type="file" className="hidden" accept="image/*" onChange={onImage} disabled={imageUploading} />
              </label>
              </div>
            </div>
            <Input label="Sort order" type="number" value={editing.sort_order ?? 1} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
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
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await deleteCategory(deleteTarget.id); toast('Category deleted', 'info') } }} title="Delete category" message={`Delete "${deleteTarget?.name}"? Products in this category will lose their category.`} />
    </div>
  )
}
