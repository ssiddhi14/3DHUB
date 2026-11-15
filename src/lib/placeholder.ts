/**
 * Generates branded SVG placeholder images using the 3D HUB palette.
 * Used as seed product imagery and as a graceful fallback for any image
 * that fails to load. Returns a data URI ready for <img src>.
 */

const PALETTE = ['#BFD2BF', '#839D9A', '#7BB2D9', '#646F4B', '#46351D']

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

const GLYPHS: Record<string, string> = {
  'home-decor': 'M3 11l9-8 9 8M5 9v11h14V9',
  'desk-accessories': 'M4 4h16v6H4zM6 10v8h12v-8',
  'gadgets-utility': 'M5 7h14v10H5zM9 21h6M9 3h6',
  'personalized-gifts': 'M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7C10 7 8 5 8 3a4 4 0 0 1 8 0c0 2-2 4-4 4',
  'miniatures-models': 'M12 2l9 5v10l-9 5-9-5V7zM12 2v20M3 7l9 5 9-5',
  'tech-accessories': 'M7 2h10v20H7zM10 18h4',
  'keychains': 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 12l-4 8 4-2 4 2-4-8',
  'toys-creative': 'M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z',
  'functional-tools': 'M14 7l3 3M5 19l5-5M3 21l3-3',
  'custom': 'M12 2v20M2 12h20M5 5l14 14M19 5L5 19',
}

export function placeholderImage(opts: {
  label?: string
  category?: string
  width?: number
  height?: number
  seed?: string
}): string {
  const { label = '3D HUB', category = 'custom', width = 800, height = 800, seed } = opts
  const h = hash(seed || label + category)
  const c1 = PALETTE[h % PALETTE.length]
  const c2 = PALETTE[(h + 2) % PALETTE.length]
  const glyph = GLYPHS[category] || GLYPHS['custom']

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="r" cx="0.3" cy="0.2" r="0.9">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <rect width="${width}" height="${height}" fill="url(#r)"/>
  <g transform="translate(${width / 2} ${height / 2 - 30})" fill="none" stroke="#46351D" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.78">
    <path d="${glyph}"/>
  </g>
  <text x="50%" y="${height / 2 + 120}" text-anchor="middle" font-family="'Plus Jakarta Sans',sans-serif" font-size="42" font-weight="700" fill="#46351D" opacity="0.82">${escapeXml(label)}</text>
  <text x="50%" y="${height / 2 + 165}" text-anchor="middle" font-family="'Inter',sans-serif" font-size="22" fill="#46351D" opacity="0.5" letter-spacing="3">DESIGN · PRINT · CREATE</text>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)
}

export function heroPlaceholder(width = 1600, height = 900): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#BFD2BF"/>
      <stop offset="55%" stop-color="#839D9A"/>
      <stop offset="100%" stop-color="#646F4B"/>
    </linearGradient>
    <radialGradient id="hr" cx="0.7" cy="0.25" r="0.7">
      <stop offset="0%" stop-color="#7BB2D9" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#7BB2D9" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#hg)"/>
  <rect width="${width}" height="${height}" fill="url(#hr)"/>
  <g transform="translate(${width / 2} ${height / 2})" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
    <path d="M-60 -120 l120 70 0 140 -120 70 -120 -70 0 -140 z" />
    <path d="M-60 -120 v140 M60 -50 v140 M-180 -50 h240" />
  </g>
  <text x="50%" y="85%" text-anchor="middle" font-family="'Plus Jakarta Sans',sans-serif" font-size="64" font-weight="800" fill="#46351D" opacity="0.9">3D HUB</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
