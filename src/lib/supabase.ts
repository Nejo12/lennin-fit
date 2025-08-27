import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client (will work with placeholder values for graceful degradation)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
};

// Helper function to get Supabase client with error handling
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn(
      'Supabase is not properly configured. Using placeholder values.'
    );
  }
  return supabase;
};
