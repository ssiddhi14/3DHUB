import type { ReactNode } from 'react'
import { cn, formatPrice } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-espresso">{title}</h1>
        {description && <p className="mt-1 text-sm text-espresso-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, icon, accent = 'olive', hint }: { label: string; value: string | number; icon: ReactNode; accent?: 'olive' | 'teal' | 'sky' | 'sage'; hint?: string }) {
  const colors = {
    olive: 'bg-olive/10 text-olive',
    teal: 'bg-sageTeal/10 text-sageTeal-600',
    sky: 'bg-sky-100 text-sky-700',
    sage: 'bg-softSage-100 text-espresso',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-espresso-400">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', colors[accent])}>{icon}</div>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-espresso">{typeof value === 'number' && label.toLowerCase().includes('revenue') ? formatPrice(value) : value}</p>
      {hint && <p className="mt-1 text-xs text-espresso-400">{hint}</p>}
    </div>
  )
}

export function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-espresso-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-espresso-100 bg-softSage-50 text-xs font-semibold uppercase text-espresso-400">
          <tr>
            {headers.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-espresso-50">{children}</tbody>
      </table>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string }) {
  const [loading, setLoading] = useState(false)
  const run = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className="text-sm text-espresso-500">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={run} loading={loading} className="bg-red-500 hover:bg-red-600">{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}

export function AdminSearchInput({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full max-w-xs rounded-xl border border-espresso-100 px-4 py-2 text-sm focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20" />
  )
}
