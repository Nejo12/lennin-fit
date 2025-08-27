import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(
    null
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      // If Supabase is not configured, return null user
      if (!isSupabaseConfigured()) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Only set up auth state listener if Supabase is configured
    if (isSupabaseConfigured()) {
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    } else {
      return () => {
        mounted = false;
      };
    }
  }, []);

  return { user, loading };
}
