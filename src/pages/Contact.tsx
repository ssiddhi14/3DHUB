import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail, Phone, MapPin, Clock, Send, Package,
  ChevronDown, ChevronUp, Printer, RotateCcw,
  CreditCard, FileBox, Truck, HelpCircle, MessageSquare,
} from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

/* ------------------------------------------------------------------ */
/* FAQ Data                                                             */
/* ------------------------------------------------------------------ */
const FAQS = [
  {
    category: 'Orders & Shipping',
    icon: Truck,
    items: [
      {
        q: 'How do I track my order?',
        a: "Once your order is shipped, you will receive a tracking number via email and SMS. You can use it to track your order on our courier partner's website. Standard delivery takes 4–7 days after dispatch.",
      },
      {
        q: 'How long does printing and processing take?',
        a: 'Most products are printed to order and take 2–5 business days to process before shipping. Custom and personalized products may take 5–10 business days. Estimated timelines are shown on each product page.',
      },
      {
        q: 'Can I cancel or modify my order?',
        a: 'You can cancel or modify your order within 24 hours of placing it, as long as printing has not begun. Once production starts, cancellations are not possible. Contact us immediately at support@3dhub.in with your order number.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free shipping on all orders above ₹999. Orders below ₹999 have a flat shipping fee of ₹79.',
      },
    ],
  },
  {
    category: 'Custom 3D Printing',
    icon: Printer,
    items: [
      {
        q: 'How does the custom printing process work?',
        a: 'Submit your request with a description or 3D file (STL, OBJ, 3MF). Our team reviews it, sends you a quotation within 24 hours, and begins printing once you approve. You can track the status from your account.',
      },
      {
        q: 'What file formats do you accept?',
        a: 'We accept STL, OBJ, 3MF, and STEP files. If you don\'t have a 3D file, you can describe your idea or upload reference images and our team will design it for you.',
      },
      {
        q: 'How is the custom print price calculated?',
        a: 'Price depends on material, volume, complexity, and quantity. We send a detailed quotation before production begins — no surprises. You can accept or reject the quote.',
      },
      {
        q: 'Are my design files kept confidential?',
        a: 'Yes, absolutely. Your design files are stored securely in private storage and are only accessible to our production team. We do not share or sell your designs.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: RotateCcw,
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days for unused, undamaged standard products. Custom, personalized, and made-to-order products are non-returnable unless defective.',
      },
      {
        q: 'I received a damaged or wrong product. What do I do?',
        a: 'We\'re sorry! Please email us at support@3dhub.in with clear photos of the product and packaging within 48 hours of delivery. We will arrange a free replacement or refund.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are initiated within 2 business days of return approval and reflect in your account within 5–7 working days depending on your bank.',
      },
    ],
  },
  {
    category: 'Payments',
    icon: CreditCard,
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, credit/debit cards, net banking, and popular wallets via Razorpay. All payments are secured with 256-bit SSL encryption.',
      },
      {
        q: 'Is it safe to pay on 3D HUB?',
        a: 'Yes. We use Razorpay, one of India\'s most trusted payment gateways. We never store your card details on our servers.',
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Quick help tiles                                                     */
/* ------------------------------------------------------------------ */
const QUICK_HELP = [
  { icon: Package, title: 'Track Order', desc: 'Check the status of your order', href: '/account?tab=orders' },
  { icon: FileBox, title: 'Custom Printing', desc: 'Start or track a custom project', href: '/custom-printing' },
  { icon: RotateCcw, title: 'Returns', desc: 'Raise a return or exchange request', href: 'mailto:support@3dhub.in?subject=Return Request' },
  { icon: MessageSquare, title: 'Chat with us', desc: 'Email us and get a reply within 24h', href: 'mailto:support@3dhub.in' },
]

/* ------------------------------------------------------------------ */
/* FAQ Accordion item                                                   */
/* ------------------------------------------------------------------ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-espresso-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-espresso">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-olive" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 text-espresso-300" />
        }
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-espresso-500">{a}</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */
export function Contact() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      toast('Message sent! We\'ll get back to you within 24 hours.', 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setSending(false)
    }, 800)
  }

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-espresso py-14 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-softSage-300">Support</p>
        <h1
          className="mt-3 text-4xl font-bold sm:text-5xl"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          Hey there.<br />
          <span className="text-softSage">How can we help?</span>
        </h1>
        <p className="mt-4 text-softSage-200">
          Questions about an order, a custom project, or anything else? We're here.
        </p>
      </section>

      {/* ── Quick help tiles ── */}
      <section className="border-b border-espresso-100">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {QUICK_HELP.map((h) => (
              <a
                key={h.title}
                href={h.href}
                className="group flex flex-col items-center rounded-2xl border border-espresso-100 p-6 text-center transition hover:border-olive hover:shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-softSage-100 text-olive transition group-hover:bg-olive group-hover:text-white">
                  <h.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-bold text-espresso">{h.title}</p>
                <p className="mt-1 text-xs text-espresso-400">{h.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14">
        <div className="container-page max-w-5xl">
          <div className="mb-8 text-center">
            <h2
              className="text-2xl font-bold text-espresso sm:text-3xl"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              Popular Help Topics
            </h2>
            <p className="mt-2 text-espresso-400">Find quick answers to common questions</p>
          </div>

          {/* Category tabs */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {FAQS.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(i)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === i
                    ? 'bg-olive text-white'
                    : 'bg-softSage-50 text-espresso-500 hover:bg-softSage-100'
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="rounded-2xl border border-espresso-100 bg-white px-6">
            {FAQS[activeCategory].items.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact form + info ── */}
      <section className="bg-softSage-50 py-14">
        <div className="container-page max-w-5xl">
          <div className="mb-8 text-center">
            <h2
              className="text-2xl font-bold text-espresso sm:text-3xl"
              style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
            >
              Still need help?
            </h2>
            <p className="mt-2 text-espresso-400">Send us a message and we'll get back to you within 24 hours.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Form */}
            <form onSubmit={submit} className="card p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Order not received, Custom print query..."
                  required
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Message"
                  name="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue in detail. Include order number if applicable."
                  required
                />
              </div>
              <Button type="submit" loading={sending} className="mt-5">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>

            {/* Contact info */}
            <aside className="space-y-4">
              <div className="card p-6">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-espresso-400">Contact Us</h3>
                <div className="mt-4 space-y-4">
                  {[
                    { icon: Mail, label: 'Email', value: 'support@3dhub.in', href: 'mailto:support@3dhub.in' },
                    { icon: Phone, label: 'Phone', value: '+91 98290 51866', href: 'tel:+919829051866' },
                    { icon: MapPin, label: 'Studio', value: 'Jaipur, India', href: undefined },
                    { icon: Clock, label: 'Support hours', value: 'Mon–Sat, 10am–7pm IST', href: undefined },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-softSage-100 text-olive">
                        <c.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-espresso-400">{c.label}</p>
                        {c.href ? (
                          <a href={c.href} className="text-sm font-medium text-espresso hover:text-olive">{c.value}</a>
                        ) : (
                          <p className="text-sm font-medium text-espresso">{c.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-olive/10 text-olive">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-espresso">Have a custom project?</p>
                    <p className="mt-1 text-xs text-espresso-400">Upload your design or describe what you need — we'll send a quote within 24 hours.</p>
                    <Link to="/custom-printing" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-olive hover:text-olive-600">
                      Start a project →
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

    </div>
  )
}
