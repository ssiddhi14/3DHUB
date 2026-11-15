/**
 * Cloudinary upload helper — 3D HUB
 *
 * Uses the unsigned upload preset (no server-side secret needed).
 * Files are uploaded directly from the browser to Cloudinary's CDN.
 *
 * Setup:
 *  1. Create a free account at https://cloudinary.com
 *  2. Dashboard → Settings → Upload → Add upload preset
 *     - Signing Mode: Unsigned
 *     - Folder: 3dhub  (optional but keeps things organised)
 *     - Copy the preset name
 *  3. Copy your Cloud Name from the dashboard top bar
 *  4. Add to .env:
 *       VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *       VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 *
 * Returned URL is a full Cloudinary delivery URL with auto CDN.
 * You can append Cloudinary transformations to it, e.g.:
 *   url.replace('/upload/', '/upload/w_800,q_auto,f_auto/')
 */

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   ?? ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ''

export const cloudinaryReady: boolean =
  Boolean(CLOUD_NAME && UPLOAD_PRESET &&
    !CLOUD_NAME.includes('your_cloud') &&
    !UPLOAD_PRESET.includes('your_preset'))

export type CloudinaryFolder = 'products' | 'banners' | 'categories' | 'custom-requests' | 'avatars'

/**
 * Upload a single File to Cloudinary.
 * Returns the secure CDN URL, or null on failure.
 */
export async function uploadToCloudinary(
  file: File,
  folder: CloudinaryFolder = 'products',
): Promise<string | null> {
  if (!cloudinaryReady) {
    // Demo mode — return a local object URL so the admin preview still works
    return URL.createObjectURL(file)
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', `3dhub/${folder}`)
  // Auto optimise: convert to WebP, strip metadata
  form.append('quality', 'auto')
  form.append('fetch_format', 'auto')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[Cloudinary] Upload failed:', err)
    throw new Error((err as any)?.error?.message ?? 'Cloudinary upload failed')
  }

  const data = await res.json() as { secure_url: string }
  return data.secure_url
}

/**
 * Upload a 3D design file or reference image for custom print requests.
 * Non-image files (STL, OBJ, etc.) are uploaded as raw resources.
 */
export async function uploadRawToCloudinary(
  file: File,
  folder: CloudinaryFolder = 'custom-requests',
): Promise<string | null> {
  if (!cloudinaryReady) {
    return URL.createObjectURL(file)
  }

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', `3dhub/${folder}`)
  form.append('resource_type', 'raw') // for non-image files

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: form },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.error?.message ?? 'Cloudinary upload failed')
  }

  const data = await res.json() as { secure_url: string }
  return data.secure_url
}

/**
 * Append Cloudinary transformation to auto-optimise delivery.
 * Use this when rendering product images to resize & convert to WebP.
 *
 * @example
 *   <img src={optimise(product.images[0], 800)} />
 */
export function optimise(url: string, width = 800): string {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}
