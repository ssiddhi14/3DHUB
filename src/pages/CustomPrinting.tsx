import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileCheck2, X, FileBox, ImageIcon, Sparkles, Check } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchMaterials } from '@/services/data'
import { createCustomRequest, uploadCustomPrintFile } from '@/services/data'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { ALLOWED_3D_EXTENSIONS, ALLOWED_IMAGE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@/lib/constants'
import { formatFileSize, hasAllowedExtension } from '@/lib/utils'
import type { CustomPrintFile } from '@/types'

export function CustomPrinting() {
  const { data: materials, loading } = useAsync(() => fetchMaterials())
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const designInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    customer_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: '',
    description: '',
    material_id: '',
    color: '',
    dimensions: '',
    quantity: 1,
    instructions: '',
  })
  const [designFiles, setDesignFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<{ id: string; number: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const onDesignFiles = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) { toast(`${f.name} exceeds ${MAX_FILE_SIZE_MB}MB`, 'error'); return false }
      if (!hasAllowedExtension(f.name, ALLOWED_3D_EXTENSIONS)) { toast(`${f.name} is not a supported 3D format`, 'error'); return false }
      return true
    })
    setDesignFiles((prev) => [...prev, ...valid])
  }

  const onImageFiles = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) { toast(`${f.name} exceeds ${MAX_FILE_SIZE_MB}MB`, 'error'); return false }
      if (!hasAllowedExtension(f.name, ALLOWED_IMAGE_EXTENSIONS)) { toast(`${f.name} is not a supported image format`, 'error'); return false }
      return true
    })
    setImageFiles((prev) => [...prev, ...valid])
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.customer_name.trim()) e.customer_name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.description.trim()) e.description = 'Tell us what you want to print'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const fileRecords: CustomPrintFile[] = []
      // upload design files
      for (const file of designFiles) {
        const url = await uploadCustomPrintFile(file)
        fileRecords.push({ id: '', request_id: '', file_name: file.name, file_path: url ?? file.name, file_type: 'design', file_size: file.size, mime_type: file.type || null })
      }
      for (const file of imageFiles) {
        const url = await uploadCustomPrintFile(file)
        fileRecords.push({ id: '', request_id: '', file_name: file.name, file_path: url ?? file.name, file_type: 'reference', file_size: file.size, mime_type: file.type || null })
      }

      const request = await createCustomRequest({
        user_id: user?.id ?? null,
        customer_name: form.customer_name,
        email: form.email,
        phone: form.phone,
        description: form.description,
        material_id: form.material_id || null,
        color: form.color || null,
        dimensions: form.dimensions || null,
        quantity: form.quantity,
        instructions: form.instructions || null,
        files: fileRecords,
      })
      setDone({ id: request.id, number: request.request_number })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      toast(err?.message ?? 'Failed to submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-olive-100 bg-softSage-50 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-olive text-white"><Check className="h-8 w-8" /></div>
          <h1 className="mt-5 font-heading text-2xl font-bold text-espresso">Request received!</h1>
          <p className="mt-2 text-espresso-500">Your custom printing request has been submitted. Our team will review it and send you a quotation.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 shadow-card">
            <span className="text-sm text-espresso-400">Request ID</span>
            <span className="font-heading text-lg font-bold text-olive">{done.number}</span>
          </div>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => navigate(user ? '/account?tab=custom' : '/')}>Track Request</Button>
            <Button variant="outline" onClick={() => { setDone(null); setForm({ customer_name: user?.full_name ?? '', email: user?.email ?? '', phone: '', description: '', material_id: '', color: '', dimensions: '', quantity: 1, instructions: '' }); setDesignFiles([]); setImageFiles([]) }}>Submit Another</Button>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { icon: FileBox, title: 'Upload your 3D file', desc: 'STL, OBJ, 3MF or STEP — or skip this and describe it instead.' },
    { icon: Sparkles, title: 'Add reference images', desc: 'Photos, sketches, or screenshots to show us the details.' },
    { icon: Check, title: 'Get a quote', desc: 'We review and send pricing within 24 hours.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-softSage-100 py-12">
        <div className="container-page">
          <Badge variant="teal">Custom 3D Printing Service</Badge>
          <h1 className="mt-3 font-heading text-3xl font-bold text-espresso sm:text-4xl text-balance">Bring your design to life</h1>
          <p className="mt-3 max-w-2xl text-espresso-600">Upload a 3D model or just tell us what you need. We'll handle materials, printing, and delivery.</p>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <form onSubmit={submit} className="space-y-6">
            {/* Customer info */}
            <div className="card p-6">
              <h2 className="font-heading text-lg font-bold text-espresso">Your details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Full name" name="customer_name" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} error={errors.customer_name} />
                <Input label="Phone" name="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
                <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} className="sm:col-span-2" />
              </div>
            </div>

            {/* Project details */}
            <div className="card p-6">
              <h2 className="font-heading text-lg font-bold text-espresso">Project details</h2>
              <div className="mt-4 grid gap-4">
                <Textarea label="Describe what you want to print" name="description" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} placeholder="e.g. A custom phone stand for a Pixel 8 with a built-in cable channel..." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Material" value={form.material_id} onChange={(e) => set('material_id', e.target.value)}>
                    <option value="">No preference</option>
                    {materials?.map((m) => <option key={m.id} value={m.id}>{m.name} — ₹{m.price_per_gram}/g</option>)}
                  </Select>
                  <Input label="Color preference" name="color" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="e.g. Olive green" />
                  <Input label="Dimensions (mm)" name="dimensions" value={form.dimensions} onChange={(e) => set('dimensions', e.target.value)} placeholder="e.g. 120 × 80 × 40" />
                  <Input label="Quantity" name="quantity" type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
                </div>
                <Textarea label="Additional instructions" name="instructions" value={form.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="Any special requirements, finishing, or notes..." />
              </div>
            </div>

            {/* File uploads */}
            <div className="card p-6">
              <h2 className="font-heading text-lg font-bold text-espresso">Upload files</h2>
              <p className="mt-1 text-sm text-espresso-400">Supported 3D formats: {ALLOWED_3D_EXTENSIONS.join(', ').toUpperCase()} · Images: {ALLOWED_IMAGE_EXTENSIONS.join(', ').toUpperCase()} · Max {MAX_FILE_SIZE_MB}MB each</p>

              {/* design files */}
              <div className="mt-5">
                <p className="label-field">3D design file (optional)</p>
                <div onClick={() => designInputRef.current?.click()} className="cursor-pointer rounded-2xl border-2 border-dashed border-espresso-100 bg-softSage-50 p-8 text-center transition hover:border-olive hover:bg-softSage-100">
                  <FileBox className="mx-auto h-8 w-8 text-sageTeal-500" />
                  <p className="mt-2 text-sm font-medium text-espresso">Click to upload or drag your 3D file</p>
                  <p className="text-xs text-espresso-400">No model? Describe it above and add reference images instead.</p>
                </div>
                <input ref={designInputRef} type="file" multiple accept=".stl,.obj,.3mf,.step,.stp" className="hidden" onChange={(e) => onDesignFiles(e.target.files)} />
                {designFiles.map((f, i) => (
                  <FileChip key={i} name={f.name} size={f.size} onRemove={() => setDesignFiles((p) => p.filter((_, idx) => idx !== i))} icon={<FileCheck2 className="h-4 w-4 text-olive" />} />
                ))}
              </div>

              {/* reference images */}
              <div className="mt-5">
                <p className="label-field">Reference images (optional)</p>
                <div onClick={() => imageInputRef.current?.click()} className="cursor-pointer rounded-2xl border-2 border-dashed border-espresso-100 bg-softSage-50 p-8 text-center transition hover:border-olive hover:bg-softSage-100">
                  <ImageIcon className="mx-auto h-8 w-8 text-sageTeal-500" />
                  <p className="mt-2 text-sm font-medium text-espresso">Add reference photos or sketches</p>
                  <p className="text-xs text-espresso-400">Help us understand your vision</p>
                </div>
                <input ref={imageInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.gif" className="hidden" onChange={(e) => onImageFiles(e.target.files)} />
                {imageFiles.map((f, i) => (
                  <FileChip key={i} name={f.name} size={f.size} onRemove={() => setImageFiles((p) => p.filter((_, idx) => idx !== i))} icon={<ImageIcon className="h-4 w-4 text-sky-400" />} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" size="lg" loading={submitting}><Upload className="h-4 w-4" /> Submit Request</Button>
              <p className="text-xs text-espresso-400">By submitting you agree to our terms. Your files stay private.</p>
            </div>
          </form>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="card p-6">
              <h3 className="font-heading text-base font-bold text-espresso">How it works</h3>
              <div className="mt-4 space-y-4">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-softSage-100 text-olive"><s.icon className="h-4.5 w-4.5" /></div>
                    <div>
                      <p className="text-sm font-semibold text-espresso">{s.title}</p>
                      <p className="text-xs text-espresso-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {materials && !loading && (
              <div className="card p-6">
                <h3 className="font-heading text-base font-bold text-espresso">Materials we offer</h3>
                <div className="mt-3 space-y-3">
                  {materials.map((m) => (
                    <div key={m.id} className="border-b border-espresso-50 pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-espresso">{m.name}</span>
                        <span className="text-xs text-espresso-400">₹{m.price_per_gram}/g</span>
                      </div>
                      <p className="mt-0.5 text-xs text-espresso-400">{m.recommended_usage}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function FileChip({ name, size, onRemove, icon }: { name: string; size: number; onRemove: () => void; icon: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-espresso-100 bg-white px-3 py-2.5">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-espresso">{name}</p>
        <p className="text-xs text-espresso-400">{formatFileSize(size)}</p>
      </div>
      <button onClick={onRemove} className="text-espresso-300 hover:text-red-500" aria-label="Remove"><X className="h-4 w-4" /></button>
    </div>
  )
}
