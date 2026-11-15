import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function Contact() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      toast('Message sent! We will get back to you soon.', 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setSending(false)
    }, 800)
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@3dhub.example', href: 'mailto:hello@3dhub.example' },
    { icon: Phone, label: 'Phone', value: '+91 98290 51866', href: 'tel:+919829051866' },
    { icon: MapPin, label: 'Studio', value: 'Jaipur, India' },
    { icon: Clock, label: 'Hours', value: 'Mon–Sat, 10am–7pm' },
  ]

  return (
    <div>
      <section className="bg-softSage-100 py-12">
        <div className="container-page max-w-2xl text-center">
          <h1 className="font-heading text-3xl font-bold text-espresso sm:text-4xl">Get in touch</h1>
          <p className="mt-3 text-espresso-600">Questions about a product or a custom project? We'd love to hear from you.</p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="card p-7">
            <h2 className="font-heading text-lg font-bold text-espresso">Send us a message</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Your name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="mt-4">
              <Input label="Subject" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="mt-4">
              <Textarea label="Message" name="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <Button type="submit" loading={sending} className="mt-5"><Send className="h-4 w-4" /> Send Message</Button>
          </form>

          <aside className="space-y-4">
            <div className="card p-6">
              <h3 className="font-heading text-base font-bold text-espresso">Contact details</h3>
              <div className="mt-4 space-y-4">
                {contactInfo.map((c) => (
                  <a key={c.label} href={c.href ?? '#'} className="flex items-start gap-3 group">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-softSage-100 text-olive"><c.icon className="h-4.5 w-4.5" /></div>
                    <div>
                      <p className="text-xs text-espresso-400">{c.label}</p>
                      <p className="text-sm font-medium text-espresso group-hover:text-olive">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sageTeal-100 text-sageTeal-600"><MessageSquare className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold text-espresso">Need a custom quote?</p>
                  <p className="text-xs text-espresso-400">Submit a custom printing request for detailed pricing.</p>
                </div>
              </div>
              <a href="/custom-printing" className="btn-outline btn mt-4 w-full">Start a Project</a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
