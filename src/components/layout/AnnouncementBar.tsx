import { useState } from 'react'

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

const TRACK = [...ITEMS, ...ITEMS]

export function AnnouncementBar() {
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="relative bg-espresso"
      style={{ overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee-scroll 18s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
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
