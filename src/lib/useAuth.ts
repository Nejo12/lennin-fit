import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (mounted) setUser(user)
      setLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  return { user, loading }
}
