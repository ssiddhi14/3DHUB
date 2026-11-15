import { Loader2 } from 'lucide-react'

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-espresso-400">
      <Loader2 className="h-8 w-8 animate-spin text-olive" />
      <p className="text-sm">{label}…</p>
    </div>
  )
}

export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-espresso-100 bg-softSage-50 px-6 py-16 text-center">
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sageTeal-100 text-sageTeal-500">{icon}</div>}
      <h3 className="font-heading text-lg font-bold text-espresso">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-espresso-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
