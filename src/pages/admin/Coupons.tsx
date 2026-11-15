import { useState } from 'react'
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchCoupons, saveCoupon, deleteCoupon } from '@/services/data'
import { AdminPageHeader, AdminTable, ConfirmDialog } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Coupon } from '@/types'

const empty = (): Partial<Coupon> => ({ code: '', description: '', type: 'percentage', value: 10, min_order: 0, max_uses: null, is_active: true })

export function Coupons() {
  const { toast } = useToast()
  const { data: coupons, loading } = useAsync(() => fetchCoupons())
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const save = async () => {
    if (!editing?.code) { toast('Code required', 'error'); return }
    setSaving(true)
    try {
      await saveCoupon(editing)
      toast('Coupon saved', 'success')
      setEditing(null)
    } catch (e: any) { toast(e?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }

  return (
    <div>
      <AdminPageHeader title="Coupons" description="Discount codes for customers" action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> Add Coupon</Button>} />
      {loading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div> : (coupons ?? []).length ? (
        <AdminTable headers={['Code', 'Description', 'Type', 'Value', 'Min order', 'Used', 'Status', 'Actions']}>
          {(coupons ?? []).map((c) => (
            <tr key={c.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3"><span className="font-mono font-bold text-olive">{c.code}</span></td>
              <td className="px-4 py-3 text-espresso-400">{c.description}</td>
              <td className="px-4 py-3 text-espresso-400 capitalize">{c.type}</td>
              <td className="px-4 py-3 font-medium text-espresso">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
              <td className="px-4 py-3 text-espresso-400">₹{c.min_order}</td>
              <td className="px-4 py-3 text-espresso-400">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
              <td className="px-4 py-3"><span className={cn('badge', c.is_active ? 'bg-olive-100 text-olive-700' : 'bg-espresso-100 text-espresso-400')}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : <div className="rounded-2xl border border-dashed border-espresso-100 py-16 text-center"><Ticket className="mx-auto h-10 w-10 text-espresso-200" /><p className="mt-3 text-espresso-400">No coupons yet</p></div>}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Coupon' : 'New Coupon'}>
        {editing && (
          <div className="space-y-4 p-6">
            <Input label="Code" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
            <Input label="Description" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </Select>
              <Input label={editing.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} type="number" value={editing.value ?? 0} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
              <Input label="Minimum order (₹)" type="number" value={editing.min_order ?? 0} onChange={(e) => setEditing({ ...editing, min_order: Number(e.target.value) })} />
              <Input label="Max uses (blank = unlimited)" type="number" value={editing.max_uses ?? ''} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value ? Number(e.target.value) : null })} />
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
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) { await deleteCoupon(deleteTarget.id); toast('Coupon deleted', 'info') } }} title="Delete coupon" message={`Delete "${deleteTarget?.code}"?`} />
    </div>
  )
}
