import { useState } from 'react'
import { X } from 'lucide-react'

const ITEMS = [
  '🚚 Free shipping on orders over ₹999',
  '✦ Think it.',
  '✦ Design it.',
  '✦ Print it.',
  '🏷️ Use code WELCOME10 for 10% off',
  '✦ Think it.',
  '✦ Design it.',
  '✦ Print it.',
]

// Duplicate for seamless infinite loop
const TRACK = [...ITEMS, ...ITEMS]

export function AnnouncementBar() {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div
      className="relative bg-espresso"
      style={{ overflow: 'hidden' }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee-scroll 28s linear infinite',
        }}
      >
        {TRACK.map((item, i) => (
          <span
            key={i}
            style={{
              whiteSpace: 'nowrap',
              padding: '7px 32px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#BFD2BF',
              letterSpacing: '0.02em',
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => setOpen(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-softSage-200 hover:text-white z-10"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee-scroll"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
