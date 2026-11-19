import { useState } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Loader2 } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchProducts, fetchCategories, fetchMaterials, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/services/data'
import { AdminPageHeader, AdminTable, ConfirmDialog, AdminSearchInput } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, cn } from '@/lib/utils'
import { placeholderImage } from '@/lib/placeholder'
import type { Product } from '@/types'

const empty = (): Partial<Product> => ({
  title: '', description: '', price: 0, discounted_price: null, sku: '',
  category_id: null, material_id: null, stock: 0, is_active: true,
  is_bestseller: false, is_featured: false, is_new_arrival: true,
  is_customizable: false, images: [], colors: [{ name: 'Espresso', hex: '#46351D' }],
  dimensions: '', weight: '', printing_technology: '', processing_time: '2–3 days',
})

export function Products() {
  const { toast } = useToast()
  const { data: products, loading } = useAsync(() => fetchProducts({}))
  const { data: categories } = useAsync(() => fetchCategories())
  const { data: materials } = useAsync(() => fetchMaterials())
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [newColor, setNewColor] = useState({ name: '', hex: '#46351D' })
  const [imageUploading, setImageUploading] = useState(false)

  const filtered = (products ?? []).filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  const save = async () => {
    if (!editing?.title) { toast('Title is required', 'error'); return }
    setSaving(true)
    try {
      const data = { ...editing, images: editing.images && editing.images.length ? editing.images : [placeholderImage({ label: editing.title, category: 'custom', seed: editing.title })] }
      if (editing.id) {
        await updateProduct(editing.id, data)
        toast('Product updated', 'success')
      } else {
        await createProduct(data)
        toast('Product created', 'success')
      }
      setEditing(null)
    } catch (e: any) {
      toast(e?.message ?? 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    await deleteProduct(deleteTarget.id)
    toast('Product deleted', 'info')
  }

  const addColor = () => {
    if (!newColor.name) return
    setEditing({ ...editing, colors: [...(editing?.colors ?? []), { ...newColor }] })
    setNewColor({ name: '', hex: '#46351D' })
  }

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !editing) return
    e.target.value = ''
    setImageUploading(true)
    try {
      const urls: string[] = []
      for (const file of files) {
        const url = await uploadProductImage(editing.id ?? 'temp', file)
        if (url) urls.push(url)
      }
      if (urls.length) {
        setEditing((prev) => ({ ...prev, images: [...(prev?.images ?? []), ...urls] }))
        toast(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`, 'success')
      } else {
        toast('Upload returned empty URL', 'error')
      }
    } catch (err: any) {
      console.error('[Upload error]', err)
      toast(err?.message ?? 'Image upload failed', 'error')
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products?.length ?? 0} products in your store`}
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> Add Product</Button>}
      />

      <div className="mb-4"><AdminSearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU..." /></div>

      {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div> : (
        <AdminTable headers={['Product', 'SKU', 'Price', 'Stock', 'Flags', 'Status', 'Actions']}>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-espresso">{p.title}</p>
                    <p className="text-xs text-espresso-400">{p.category?.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-espresso-400">{p.sku}</td>
              <td className="px-4 py-3">
                {p.discounted_price ? (
                  <div>
                    <span className="font-semibold text-espresso">{formatPrice(p.discounted_price)}</span>
                    <span className="ml-1 text-xs text-espresso-300 line-through">{formatPrice(p.price)}</span>
                  </div>
                ) : <span className="font-semibold text-espresso">{formatPrice(p.price)}</span>}
              </td>
              <td className="px-4 py-3"><span className={cn('badge', p.stock < 5 ? 'bg-sky-100 text-sky-700' : 'bg-softSage-100 text-espresso')}>{p.stock}</span></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {p.is_bestseller && <Badge variant="olive">Best</Badge>}
                  {p.is_featured && <Badge variant="teal">Feat</Badge>}
                  {p.is_new_arrival && <Badge variant="sky">New</Badge>}
                </div>
              </td>
              <td className="px-4 py-3"><span className={cn('badge', p.is_active ? 'bg-olive-100 text-olive-700' : 'bg-espresso-100 text-espresso-400')}>{p.is_active ? 'Active' : 'Hidden'}</span></td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {/* edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit Product' : 'New Product'} size="xl">
        {editing && (
          <div className="space-y-5 p-6">
            {/* images */}
            <div>
              <label className="label-field">Product images</label>
              <div className="flex flex-wrap gap-3">
                {(editing.images ?? []).map((img, i) => (
                  <div key={i} className={cn('relative h-24 w-24 overflow-hidden rounded-xl border-2', i === 0 ? 'border-olive' : 'border-espresso-100')}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-olive/80 py-0.5 text-center text-[10px] font-semibold text-white">Cover</span>
                    )}
                    <button onClick={() => setEditing({ ...editing, images: editing.images!.filter((_, idx) => idx !== i) })} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-espresso-400 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <label className={cn('flex h-24 w-24 flex-col cursor-pointer items-center justify-center gap-1 rounded-xl border-2 border-dashed border-espresso-100 hover:border-olive', imageUploading && 'opacity-60 pointer-events-none')}>
                  {imageUploading
                    ? <Loader2 className="h-5 w-5 animate-spin text-olive" />
                    : <>
                        <Upload className="h-5 w-5 text-espresso-300" />
                        <span className="text-[10px] text-espresso-300">Multiple OK</span>
                      </>
                  }
                  <input type="file" multiple className="hidden" accept="image/*" onChange={onImageUpload} disabled={imageUploading} />
                </label>
              </div>
            </div>

            <Input label="Product title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Textarea label="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />

            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Regular price (₹)" type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              <Input label="Discounted price (₹)" type="number" value={editing.discounted_price ?? ''} onChange={(e) => setEditing({ ...editing, discounted_price: e.target.value ? Number(e.target.value) : null })} />
              <Input label="SKU" value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
              <Select label="Category" value={editing.category_id ?? ''} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}>
                <option value="">None</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Material" value={editing.material_id ?? ''} onChange={(e) => setEditing({ ...editing, material_id: e.target.value || null })}>
                <option value="">None</option>
                {materials?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>              <Input label="Stock quantity" type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
            </div>

            {/* colors */}
            <div>
              <label className="label-field">Available colors</label>
              <div className="flex flex-wrap gap-2">
                {(editing.colors ?? []).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-espresso-100 px-2.5 py-1.5">
                    <span className="h-5 w-5 rounded-full border border-espresso-100" style={{ backgroundColor: c.hex }} />
                    <span className="text-sm">{c.name}</span>
                    <button onClick={() => setEditing({ ...editing, colors: editing.colors!.filter((_, idx) => idx !== i) })}><X className="h-3.5 w-3.5 text-espresso-300" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input type="text" placeholder="Color name" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} className="w-40 rounded-lg border border-espresso-100 px-3 py-1.5 text-sm" />
                <input type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-8 w-10 rounded border border-espresso-100" />
                <Button size="sm" variant="ghost" onClick={addColor}>Add color</Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Dimensions" value={editing.dimensions ?? ''} onChange={(e) => setEditing({ ...editing, dimensions: e.target.value })} />
              <Input label="Weight" value={editing.weight ?? ''} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} />
              <Input label="Printing technology" value={editing.printing_technology ?? ''} onChange={(e) => setEditing({ ...editing, printing_technology: e.target.value })} />
              <Input label="Processing time" value={editing.processing_time ?? ''} onChange={(e) => setEditing({ ...editing, processing_time: e.target.value })} />
            </div>

            {/* flags */}
            <div className="flex flex-wrap gap-4 rounded-xl bg-softSage-50 p-4">
              {([
                ['is_active', 'Active (visible in store)'],
                ['is_bestseller', 'Mark as bestseller'],
                ['is_featured', 'Mark as featured'],
                ['is_new_arrival', 'Mark as new arrival'],
                ['is_customizable', 'Customizable product'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-espresso">
                  <input type="checkbox" checked={!!(editing as any)[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.checked })} className="h-4 w-4 rounded border-espresso-200 text-olive focus:ring-olive" />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-espresso-100 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} loading={saving}>{editing.id ? 'Save Changes' : 'Create Product'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={remove} title="Delete product" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  )
}
