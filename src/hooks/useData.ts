import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribe } from '@/services/store'

/**
 * Generic async data hook with loading/error state and automatic re-fetch
 * whenever the in-memory store mutates (so admin edits appear everywhere in
 * real time). When Supabase is configured, the service functions query Postgres
 * and Supabase Realtime keeps things live; the store subscription is a no-op.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: any[] = []): {
  data: T | undefined
  loading: boolean
  error: string | null
  refresh: () => void
} {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(() => {
    setLoading(true)
    fetcherRef.current()
      .then((d) => {
        if (mounted.current) {
          setData(d)
          setError(null)
        }
      })
      .catch((e) => {
        if (mounted.current) setError(e?.message ?? 'Something went wrong')
      })
      .finally(() => {
        if (mounted.current) setLoading(false)
      })
  }, [])

  useEffect(() => {
    mounted.current = true
    run()
    const unsub = subscribe(run) // re-fetch on store mutation (real-time sync in demo mode)
    return () => {
      mounted.current = false
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refresh: run }
}
