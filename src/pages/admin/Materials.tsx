import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/services/data'
import { AdminPageHeader, AdminTable, ConfirmDialog } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/utils'
import type { Material } from '@/types'

const empty = (): Partial<Material> => ({ name: '', description: '', properties: '', recommended_usage: '', colors: [], price_per_gram: 1, is_active: true })

export function Materials() {
  const { toast } = useToast()
  const { data: materials, loading } = useAsync(() => fetchMaterials())
  const [editing, setEditing] = useState<Partial<Material> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null)
  const [newColor, setNewColor] = useState({ name: '', hex: '#46351D' })

  const save = async () => {
    if (!editing?.name) { toast('Name required', 'error'); return }
    setSaving(true)
    try {
      const data = { ...editing, slug: editing.slug || slugify(editing.name) }
      if (editing.id) { await updateMaterial(editing.id, data); toast('Material updated', 'success') }
      else { await createMaterial(data); toast('Material created', 'success') }
      setEditing(null)
    } catch (e: any) { toast(e?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }

  const addColor = () => {
    if (!newColor.hex) return
    if (!(editing?.colors ?? []).includes(newColor.hex)) {
      setEditing({ ...editing, colors: [...(editing?.colors ?? []), newColor.hex] })
    }
    setNewColor({ name: '', hex: '#46351D' })
  }

  return (
    <div>
      <AdminPageHeader title="Materials" description="Manage 3D printing materials and pricing" action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> Add Material</Button>} />
      {loading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div> : (
        <AdminTable headers={['Material', 'Colors', 'Price/g', 'Usage', 'Status', 'Actions']}>
          {(materials ?? []).map((m) => (
            <tr key={m.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3">
                <p className="font-medium text-espresso">{m.name}</p>
                <p className="line-clamp-1 text-xs text-espresso-400">{m.description}</p>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5">
                  {m.colors.slice(0, 6).map((hex, i) => <span key={i} className="h-5 w-5 rounded-full border border-espresso-100" style={{ backgroundColor: hex }} />)}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-espresso">₹{m.price_per_gram}</td>
              <td className="px-4 py-3 max-w-[200px]"><span className="line-clamp-1 text-espresso-400">{m.recommended_usage}</span></td>
              <td className="px-4 py-3"><span className={cn('badge', m.is_active ? 'bg-olive-100 text-olive-700' : 'bg-espresso-100 text-espresso-400')}>{m.is_active ? 'Active' : 'Inactive'}</span></td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => setEditing(m)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(m)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Material' : 'New Material'} size="lg">
        {editing && (
          <div className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Input label="Price per gram (₹)" type="number" step="0.1" value={editing.price_per_gram ?? 0} onChange={(e) => setEditing({ ...editing, price_per_gram: Number(e.target.value) })} />
            </div>
            <Textarea label="Description" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <Input label="Properties" value={editing.properties ?? ''} onChange={(e) => setEditing({ ...editing, properties: e.target.value })} />
            <Textarea label="Recommended usage" value={editing.recommended_usage ?? ''} onChange={(e) => setEditing({ ...editing, recommended_usage: e.target.value })} />

            {/* colors */}
            <div>
              <label className="label-field">Available colors</label>
              <div className="flex flex-wrap gap-2">
                {(editing.colors ?? []).map((hex, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-xl border border-espresso-100 px-2 py-1">
                    <span className="h-4 w-4 rounded-full border border-espresso-100" style={{ backgroundColor: hex }} />
                    <button onClick={() => setEditing({ ...editing, colors: editing.colors!.filter((_, idx) => idx !== i) })}><X className="h-3 w-3 text-espresso-300" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-8 w-10 rounded border border-espresso-100" />
                <Button size="sm" variant="ghost" onClick={addColor}>Add color</Button>
              </div>
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
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await deleteMaterial(deleteTarget.id); toast('Material deleted', 'info') } }} title="Delete material" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  )
}
