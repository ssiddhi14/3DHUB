/**
 * CinematicHero
 *
 * Part 2 — Rolling Typography  ("Think it." / "Design it." / "Print it.")
 * Part 3 — Scroll-driven video shrink via GSAP ScrollTrigger
 * Part 4 — Product Discovery section revealed on scroll completion
 *
 * Architecture:
 *  - A single .cinematic-pin-wrap is pinned by GSAP ScrollTrigger.
 *  - Inside it lives the fullscreen video + rolling headline.
 *  - As the user scrolls the pinned section:
 *      1. headline slides up and fades out
 *      2. video scales down to ~85% with rounded corners
 *      3. background colour transitions to soft-sage
 *  - After the pin releases, the discovery section scrolls in normally.
 *
 * Rolling text is pure CSS + a tiny interval — no GSAP needed for that part,
 * which keeps it smooth even before GSAP loads.
 */

import {
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { placeholderImage } from '@/lib/placeholder'
import { useAsync } from '@/hooks/useData'
import { fetchCategories } from '@/services/data'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const WORDS = ['Think', 'Design', 'Print']
const WORD_DURATION = 2000
const TRANSITION_MS = 500

/* ------------------------------------------------------------------ */
/* Rolling word rotator (CSS-driven, no GSAP)                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Rolling word rotator                                                 */
/*                                                                      */
/* Approach: render WORDS + WORDS[0] (4 items) so the loop snap from   */
/* index 3 back to 0 is invisible — when we're on the ghost "Think"    */
/* at index 3 we silently jump to index 0 (real "Think") between ticks */
/* ------------------------------------------------------------------ */

const LOOP_WORDS = [...WORDS, WORDS[0]] // ['Think','Design','Print','Think']

function RollingWord() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const wrapRef   = useRef<HTMLSpanElement>(null)
  const indexRef  = useRef(0)
  const heightRef = useRef(0)

  // Measure once fonts have loaded, then again on resize
  const measure = useCallback(() => {
    const track = trackRef.current
    const wrap  = wrapRef.current
    if (!track || !wrap) return
    const first = track.children[0] as HTMLElement
    if (!first) return
    const h = first.getBoundingClientRect().height
    if (h > 0) {
      heightRef.current = h
      wrap.style.height = `${h}px`
    }
  }, [])

  useEffect(() => {
    // Try immediately, then again after fonts settle
    measure()
    const t1 = setTimeout(measure, 100)
    const t2 = setTimeout(measure, 400)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false

    const tick = () => {
      if (cancelled) return
      const track = trackRef.current
      const wrap  = wrapRef.current
      if (!track || !wrap) return

      const h = heightRef.current || (track.children[0] as HTMLElement)?.offsetHeight || 0
      if (!h) { setTimeout(tick, 200); return }

      wrap.style.height = `${h}px`

      const next = indexRef.current + 1
      indexRef.current = next

      // Animate slide up to next word
      track.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`
      track.style.transform  = `translateY(-${next * h}px)`

      if (next === LOOP_WORDS.length - 1) {
        // We just landed on the ghost "Think" at the end.
        // After the animation finishes, silently snap back to index 0.
        setTimeout(() => {
          if (cancelled || !track) return
          track.style.transition = 'none'
          track.style.transform  = 'translateY(0)'
          indexRef.current = 0
          // Schedule next tick after snap
          setTimeout(tick, WORD_DURATION)
        }, TRANSITION_MS + 50)
      } else {
        setTimeout(tick, WORD_DURATION)
      }
    }

    // First roll after initial hold
    const start = setTimeout(tick, WORD_DURATION)
    return () => {
      cancelled = true
      clearTimeout(start)
    }
  }, [])

  return (
    <span
      ref={wrapRef}
      className="word-rotator"
      aria-hidden="true"
    >
      <span ref={trackRef} className="word-rotator__track">
        {LOOP_WORDS.map((w, i) => (
          <span key={`${w}-${i}`} className="word-rotator__word">
            {w}
          </span>
        ))}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Category card                                                        */
/* ------------------------------------------------------------------ */

function CategoryCard({
  label,
  slug,
  accent,
  imgSrc,
}: {
  label: string
  slug: string
  accent: string
  imgSrc: string
}) {
  return (
    <Link
      to={`/category/${slug}`}
      className="cat-card block"
      aria-label={label}
    >
      <img
        src={imgSrc}
        alt={label}
        className="cat-card__img"
        loading="lazy"
        decoding="async"
      />
      <div className="cat-card__overlay" />
      <div className="cat-card__label">
        <p
          className="text-base font-semibold leading-tight text-white"
          style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
        >
          {label}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-softSage-100 opacity-70">
          Explore <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export function CinematicHero() {
  const pinWrapRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const discoveryRef = useRef<HTMLDivElement>(null)
  const discoverHeadRef = useRef<HTMLDivElement>(null)
  const catGridRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch real categories from database
  const { data: dbCategories } = useAsync(() => fetchCategories())

  // Simply take top 6 active categories from DB — no fixed slots
  const displayCategories = (dbCategories ?? [])
    .filter((c) => c.is_active)
    .slice(0, 6)
    .map((c) => ({
      label: c.name,
      slug: c.slug,
      accent: '#839D9A',
      imgSrc: c.image_url ||
        placeholderImage({ label: c.name, category: c.slug, seed: `hero-cat-${c.slug}`, width: 600, height: 800 }),
    }))

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) return
    if (!displayCategories.length) return // wait for data

    const ctx = gsap.context(() => {
      // Ensure video plays
      videoRef.current?.play().catch(() => {})

      /* ---- Main scroll timeline ---- */
      const isMobile = window.innerWidth < 768
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinWrapRef.current,
          start: 'top top',
          end: '+=180%',
          pin: !isMobile,  // disable pin on mobile
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      // Step 1 (0–35%): Slide headline up and fade out
      tl.to(
        headlineRef.current,
        {
          y: '-18vh',
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.35,
        },
        0,
      )

      // Step 2 (10–70%): Scale and round the video
      tl.to(
        videoWrapRef.current,
        {
          scale: 0.85,
          borderRadius: '28px',
          ease: 'power2.inOut',
          duration: 0.6,
        },
        0.1,
      )

      // Step 2b: Transition background colour
      tl.to(
        bgRef.current,
        {
          backgroundColor: '#F0F5EE',
          ease: 'power1.inOut',
          duration: 0.6,
        },
        0.1,
      )

      // Step 3: Reveal heading
      tl.fromTo(
        discoverHeadRef.current,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, ease: 'power3.out', duration: 0.35 },
        0.60,
      )

      // Step 4: Boxes appear with heading — scroll triggered
      if (catGridRef.current) {
        const cards = Array.from(catGridRef.current.querySelectorAll('[data-card]'))
        if (cards.length) {
          tl.fromTo(
            cards,
            { opacity: 0, y: 44 },
            { opacity: 1, y: 0, ease: 'power3.out', duration: 0.35, stagger: 0.06 },
            0.65,
          )
        }
      }
    })

    return () => ctx.revert()
  }, [prefersReducedMotion, displayCategories.length])

  return (
    <>
      {/* ── Pinned section ─────────────────────────────────────── */}
      <div ref={pinWrapRef} className="cinematic-pin-wrap">
        {/* Full-viewport hero */}
        <div
          ref={bgRef}
          className="cinematic-hero"
          style={{ backgroundColor: '#1a1208' }}
        >
          {/* Video container — GSAP will scale this */}
          <div
            ref={videoWrapRef}
            className="hero-video-wrap"
            style={{
              position: 'absolute',
              inset: 0,
              willChange: 'transform, border-radius',
            }}
          >
            <video
              ref={videoRef}
              src="/vdo.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/vdo-poster.jpg"
              aria-hidden="true"
            />
            {/* Subtle dark overlay so text stays legible */}
            <div className="hero-overlay" />
          </div>

          {/* ── Rolling headline ── */}
          <div ref={headlineRef} className="hero-headline">
            <div className="select-none text-center">
              {/* Accessible static version for screen readers */}
              <h1 className="sr-only">Think it. Design it. Print it. — 3D HUB</h1>

              {/* Visual animated headline */}
              <p
                aria-hidden="true"
                className="leading-none tracking-tight text-white"
                style={{
                  fontFamily: '"Space Grotesk", system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(3rem, 8vw, 7.5rem)',
                  lineHeight: 1.05,
                }}
              >
                <RollingWord /> it.
              </p>

              {/* Subline */}
              <p
                className="mt-5 text-white/60"
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontWeight: 300,
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.15rem)',
                  letterSpacing: '0.04em',
                }}
              >
                Premium 3D-printed products &amp; custom printing services
              </p>

              {/* CTAs — visible on hero, slide away with headline */}
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-espresso transition hover:bg-softSage"
                  style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
                >
                  Explore Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/custom-printing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
                >
                  Custom 3D Printing
                </Link>
              </div>
            </div>
          </div>

          {/* ── Discovery section ── */}
          <div
            ref={discoveryRef}
            style={{
              position: 'absolute',
              top: '47%',
              left: 0,
              right: 0,
              zIndex: 10,
              padding: '0',
              pointerEvents: 'none',
            }}
            className="hidden md:block"
          >
            {/* Section heading */}
            <div
              ref={discoverHeadRef}
              className="px-4 text-center"
            >
              <p
                className="text-sm font-semibold uppercase tracking-[0.2em] text-espresso-400"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
              >
                What we create
              </p>
              <h2
                className="mt-1 text-espresso"
                style={{
                  fontFamily: '"Space Grotesk", system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
                  lineHeight: 1.15,
                }}
              >
                Explore What We Create.
              </h2>
            </div>

            {/* Category grid */}
            <div
              ref={catGridRef}
              className="container-page mt-5"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {displayCategories.map((c, i) => (
                  <div
                    key={c.slug + c.label}
                    data-card="true"
                    style={{
                      opacity: displayCategories.length ? 0 : 1,
                      transform: displayCategories.length ? 'translateY(44px)' : 'none',
                    }}
                  >
                    <CategoryCard
                      label={c.label}
                      slug={c.slug}
                      accent={c.accent}
                      imgSrc={c.imgSrc}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile-only categories section — below the hero, normal flow ── */}
      <div className="block md:hidden bg-softSage-50 px-4 py-8">
        <p
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-espresso-400 mb-1"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
        >
          What we create
        </p>
        <h2
          className="text-center text-espresso font-bold mb-5"
          style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: '1.5rem',
          }}
        >
          Explore What We Create.
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {displayCategories.map((c) => (
            <Link
              key={c.slug + c.label}
              to={`/category/${c.slug}`}
              className="cat-card block"
              aria-label={c.label}
            >
              <img
                src={c.imgSrc}
                alt={c.label}
                className="cat-card__img"
                loading="lazy"
              />
              <div className="cat-card__overlay" />
              <div className="cat-card__label">
                <p
                  className="text-sm font-semibold text-white leading-tight"
                  style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
                >
                  {c.label}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-softSage-100 opacity-70">
                  Explore <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
