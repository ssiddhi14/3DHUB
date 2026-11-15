import { Link } from 'react-router-dom'
import { Printer, Leaf, Sparkles, Users, ArrowRight, Target, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function About() {
  return (
    <div>
      <section className="bg-softSage-100 py-16">
        <div className="container-page max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-olive">
            <Sparkles className="h-3.5 w-3.5" /> Our Story
          </span>
          <h1 className="mt-5 font-heading text-4xl font-extrabold text-espresso sm:text-5xl text-balance">
            We turn ideas into objects you can hold.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-espresso-600">
            3D HUB is a premium 3D printing studio crafting products that blend thoughtful design with modern technology. From everyday organizers to custom creations, everything we make is printed with care.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: 'Design-led', desc: 'Every product starts with intent. We design for how people actually live and work.' },
              { icon: Leaf, title: 'Sustainable', desc: 'We use biodegradable PLA where we can and print on demand to avoid waste.' },
              { icon: Printer, title: 'Technology-driven', desc: 'Precision FDM and resin printing, inspected by hand before it reaches you.' },
            ].map((v) => (
              <div key={v.title} className="card p-7 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-softSage-100 text-olive"><v.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 font-heading text-lg font-bold text-espresso">{v.title}</h3>
                <p className="mt-2 text-sm text-espresso-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-espresso py-16 text-white">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[['2K+', 'Products printed'], ['6', 'Materials offered'], ['48h', 'Avg. turnaround'], ['4.8★', 'Avg. rating']].map(([n, l]) => (
              <div key={l}>
                <p className="font-heading text-4xl font-extrabold text-softSage">{n}</p>
                <p className="mt-1 text-sm text-softSage-200">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-espresso">Our mission</h2>
            <p className="mt-4 leading-relaxed text-espresso-600">
              3D printing shouldn't be intimidating or limited to engineers. We believe everyone deserves access to custom, beautifully made objects. Whether you bring us a finished model or just an idea, we make the process simple and the results something you'll love.
            </p>
            <p className="mt-4 leading-relaxed text-espresso-600">
              Every order supports a small studio that cares about craft, materials, and getting the details right.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/shop"><Button>Shop Products <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/custom-printing"><Button variant="outline">Start Custom Project</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Heart, title: 'Made with care', desc: 'Hand-inspected prints' },
              { icon: Users, title: 'Personal service', desc: 'Real humans, real help' },
              { icon: Printer, title: 'Premium machines', desc: 'Calibrated for quality' },
              { icon: Leaf, title: 'Eco materials', desc: 'PLA by default' },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl bg-softSage-50 p-5">
                <c.icon className="h-7 w-7 text-olive" />
                <p className="mt-3 text-sm font-bold text-espresso">{c.title}</p>
                <p className="text-xs text-espresso-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
