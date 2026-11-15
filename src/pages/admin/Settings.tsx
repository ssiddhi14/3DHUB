import { useState } from 'react'
import { Save, Building2, Truck, FileText } from 'lucide-react'
import { useAsync } from '@/hooks/useData'
import { fetchSettings, updateSettings } from '@/services/data'
import { AdminPageHeader } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import type { SiteSettings } from '@/types'

export function Settings() {
  const { toast } = useToast()
  const { data: settings, loading } = useAsync(() => fetchSettings())
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)

  // sync form when settings load
  if (settings && !form) setForm(settings)
  const data = form ?? settings

  if (loading || !data) return <div className="h-64 skeleton rounded-2xl" />

  const set = (k: keyof SiteSettings, v: any) => setForm({ ...data, [k]: v })
  const setSocial = (k: string, v: string) => set('social_links', { ...data.social_links, [k]: v })

  const save = async () => {
    if (!form) return
    setSaving(true)
    try {
      await updateSettings(form)
      toast('Settings saved', 'success')
    } catch (e: any) { toast(e?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="Website Settings" description="Manage brand, contact, shipping and policies" />

      <div className="space-y-6">
        {/* Brand */}
        <section className="card p-6">
          <div className="mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-olive" /><h2 className="font-heading text-base font-bold text-espresso">Brand</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Brand name" value={data.brand_name} onChange={(e) => set('brand_name', e.target.value)} />
            <Input label="Tagline" value={data.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
        </section>

        {/* Contact */}
        <section className="card p-6">
          <h2 className="mb-4 font-heading text-base font-bold text-espresso">Contact information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Contact email" value={data.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
            <Input label="Contact phone" value={data.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} />
            <Input label="Address" value={data.address} onChange={(e) => set('address', e.target.value)} className="sm:col-span-2" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Input label="Instagram URL" value={data.social_links.instagram ?? ''} onChange={(e) => setSocial('instagram', e.target.value)} />
            <Input label="Twitter URL" value={data.social_links.twitter ?? ''} onChange={(e) => setSocial('twitter', e.target.value)} />
            <Input label="YouTube URL" value={data.social_links.youtube ?? ''} onChange={(e) => setSocial('youtube', e.target.value)} />
          </div>
        </section>

        {/* Shipping */}
        <section className="card p-6">
          <div className="mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-olive" /><h2 className="font-heading text-base font-bold text-espresso">Shipping</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Flat shipping rate (₹)" type="number" value={data.shipping_flat_rate} onChange={(e) => set('shipping_flat_rate', Number(e.target.value))} />
            <Input label="Free shipping threshold (₹)" type="number" value={data.free_shipping_threshold} onChange={(e) => set('free_shipping_threshold', Number(e.target.value))} />
          </div>
        </section>

        {/* Policies */}
        <section className="card p-6">
          <div className="mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-olive" /><h2 className="font-heading text-base font-bold text-espresso">Policies</h2></div>
          <Textarea label="Return & refund policy" value={data.return_policy} onChange={(e) => set('return_policy', e.target.value)} className="min-h-[100px]" />
          <Textarea label="Privacy policy" value={data.privacy_policy} onChange={(e) => set('privacy_policy', e.target.value)} className="mt-4 min-h-[100px]" />
          <Textarea label="Terms & conditions" value={data.terms} onChange={(e) => set('terms', e.target.value)} className="mt-4 min-h-[100px]" />
        </section>

        <div className="flex justify-end">
          <Button onClick={save} loading={saving} size="lg"><Save className="h-4 w-4" /> Save Settings</Button>
        </div>
      </div>
    </div>
  )
}
