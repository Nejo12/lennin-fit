import { useEffect } from 'react';
import { supabase } from './supabase';
import { ensureUserInitialized } from './workspace';

export function useInitUser(fullName?: string) {
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Use the improved initialization function
        await ensureUserInitialized();

        console.log('User initialization completed successfully');
      } catch (error) {
        console.error('Error in useInitUser:', error);
        // Don't throw error - user can still use the app
      }
    })();
  }, [fullName]);
}
