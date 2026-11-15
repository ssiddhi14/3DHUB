// Minimal class-name joiner (no external dependency).
export type ClassValue = string | number | null | undefined | false | ClassValue[] | { [key: string]: boolean }

export function clsx(inputs: ClassValue[]): string {
  const out: string[] = []
  const walk = (v: ClassValue) => {
    if (!v) return
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v))
    } else if (Array.isArray(v)) {
      v.forEach(walk)
    } else if (typeof v === 'object') {
      for (const key in v) {
        if ((v as Record<string, boolean>)[key]) out.push(key)
      }
    }
  }
  inputs.forEach(walk)
  return out.join(' ')
}
