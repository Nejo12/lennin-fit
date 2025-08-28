import { useEffect } from 'react';
import { supabase } from './supabase';

export function useInitUser(fullName?: string) {
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Try to initialize user profile
        const { error } = await supabase.rpc('init_user', {
          p_full_name: fullName ?? null,
        });
        if (error) {
          console.warn('Failed to initialize user profile:', error);
          // Don't throw error - user can still use the app
        }

        // Ensure membership exists
        const { error: membershipError } =
          await supabase.rpc('ensure_membership');
        if (membershipError) {
          console.warn('Failed to ensure membership:', membershipError);
          // Don't throw error - user can still use the app
        }
      } catch (error) {
        console.warn('Error in useInitUser:', error);
        // Don't throw error - user can still use the app
      }
    })();
  }, [fullName]);
}
