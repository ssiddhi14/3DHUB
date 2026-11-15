import { useState } from 'react'
import { Eye, Download, FileBox, IndianRupee } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchCustomRequests, updateCustomRequest, createQuotation } from '@/services/data'
import { AdminPageHeader, AdminTable } from '@/components/admin/AdminUI'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatFileSize, formatDate, cn } from '@/lib/utils'
import { PRINT_STATUS_LABELS, PRINT_STATUS_COLORS } from '@/lib/constants'
import type { CustomPrintRequest } from '@/types'

export function CustomRequests() {
  const { toast } = useToast()
  const { data: requests, loading } = useAsync(() => fetchCustomRequests())
  const [selected, setSelected] = useState<CustomPrintRequest | null>(null)
  const [status, setStatus] = useState('')
  const [quote, setQuote] = useState({ price: 0, estimated_days: 7, notes: '' })

  const open = (r: CustomPrintRequest) => {
    setSelected(r)
    setStatus(r.status)
    setQuote({ price: 0, estimated_days: 7, notes: '' })
  }

  const saveStatus = async () => {
    if (!selected) return
    await updateCustomRequest(selected.id, { status: status as any })
    toast('Request status updated', 'success')
    setSelected(null)
  }

  const sendQuote = async () => {
    if (!selected) return
    if (quote.price <= 0) { toast('Enter a price', 'error'); return }
    await createQuotation({ request_id: selected.id, price: quote.price, estimated_days: quote.estimated_days, notes: quote.notes })
    toast('Quotation sent to customer', 'success')
    setSelected(null)
  }

  return (
    <div>
      <AdminPageHeader title="Custom Printing Requests" description={`${requests?.length ?? 0} requests`} />
      {loading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 skeleton" />)}</div> : (requests ?? []).length ? (
        <AdminTable headers={['Request', 'Customer', 'Material', 'Qty', 'Date', 'Status', 'Action']}>
          {(requests ?? []).map((r) => (
            <tr key={r.id} className="hover:bg-softSage-50">
              <td className="px-4 py-3">
                <p className="font-medium text-espresso">{r.request_number}</p>
                <p className="line-clamp-1 max-w-xs text-xs text-espresso-400">{r.description}</p>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm text-espresso">{r.customer_name}</p>
                <p className="text-xs text-espresso-400">{r.email}</p>
              </td>
              <td className="px-4 py-3 text-espresso-400">{r.material?.name ?? '—'}</td>
              <td className="px-4 py-3 text-espresso-400">{r.quantity}</td>
              <td className="px-4 py-3 text-espresso-400">{formatDate(r.created_at)}</td>
              <td className="px-4 py-3"><span className={cn('badge', PRINT_STATUS_COLORS[r.status])}>{PRINT_STATUS_LABELS[r.status]}</span></td>
              <td className="px-4 py-3"><button onClick={() => open(r)} className="rounded-lg p-1.5 text-espresso-400 hover:bg-softSage-100 hover:text-olive"><Eye className="h-4 w-4" /></button></td>
            </tr>
          ))}
        </AdminTable>
      ) : <div className="rounded-2xl border border-dashed border-espresso-100 py-16 text-center"><FileBox className="mx-auto h-10 w-10 text-espresso-200" /><p className="mt-3 text-espresso-400">No custom requests yet</p></div>}

      {/* detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Request ${selected?.request_number ?? ''}`} size="lg">
        {selected && (
          <div className="space-y-5 p-6">
            {/* customer */}
            <div className="grid gap-4 rounded-xl bg-softSage-50 p-4 text-sm sm:grid-cols-2">
              <Info label="Customer" value={selected.customer_name} />
              <Info label="Email" value={selected.email} />
              <Info label="Phone" value={selected.phone} />
              <Info label="Submitted" value={formatDate(selected.created_at)} />
            </div>

            {/* project */}
            <div className="rounded-xl border border-espresso-100 p-4">
              <p className="font-heading text-sm font-bold text-espresso">Project details</p>
              <p className="mt-2 text-sm text-espresso-500">{selected.description}</p>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <Info label="Material" value={selected.material?.name ?? 'No preference'} />
                <Info label="Color" value={selected.color ?? '—'} />
                <Info label="Dimensions" value={selected.dimensions ?? '—'} />
                <Info label="Quantity" value={String(selected.quantity)} />
              </div>
              {selected.instructions && <p className="mt-3 text-sm text-espresso-500"><span className="font-semibold">Instructions: </span>{selected.instructions}</p>}
            </div>

            {/* files */}
            {selected.files.length > 0 && (
              <div className="rounded-xl border border-espresso-100 p-4">
                <p className="font-heading text-sm font-bold text-espresso">Uploaded files</p>
                <div className="mt-3 space-y-2">
                  {selected.files.map((f, i) => (
                    <a key={i} href={f.file_path} download={f.file_name} className="flex items-center justify-between rounded-lg border border-espresso-50 px-3 py-2 hover:bg-softSage-50">
                      <div className="flex items-center gap-2">
                        <span className={cn('badge', f.file_type === 'design' ? 'badge-olive' : 'badge-teal')}>{f.file_type}</span>
                        <span className="text-sm text-espresso">{f.file_name}</span>
                        {f.file_size && <span className="text-xs text-espresso-400">{formatFileSize(f.file_size)}</span>}
                      </div>
                      <Download className="h-4 w-4 text-olive" />
                    </a>
                  ))}
                </div>
                <p className="mt-2 text-xs text-espresso-400">Files are stored privately in Supabase Storage and only accessible to admins.</p>
              </div>
            )}

            {/* quotation */}
            <div className="rounded-xl border border-olive-100 bg-softSage-50 p-4">
              <p className="font-heading text-sm font-bold text-espresso">Send quotation</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input label="Price (₹)" type="number" value={quote.price} onChange={(e) => setQuote({ ...quote, price: Number(e.target.value) })} />
                <Input label="Estimated days" type="number" value={quote.estimated_days} onChange={(e) => setQuote({ ...quote, estimated_days: Number(e.target.value) })} />
              </div>
              <Textarea label="Notes to customer" value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} className="mt-3 min-h-[80px]" placeholder="Material choice, finishing, any clarifications..." />
              <Button onClick={sendQuote} className="mt-3"><IndianRupee className="h-4 w-4" /> Send Quotation</Button>
            </div>

            {/* status */}
            <div className="rounded-xl border border-espresso-100 p-4">
              <Select label="Update status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.entries(PRINT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
              <Button onClick={saveStatus} className="mt-3" variant="secondary">Update Status</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-espresso-400">{label}</p>
      <p className="font-medium text-espresso">{value}</p>
    </div>
  )
}
