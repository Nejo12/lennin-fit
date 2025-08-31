import { supabase } from './supabase';

export async function currentOrgId(): Promise<string> {
  try {
    // First ensure user is properly initialized
    await ensureUserInitialized();

    const { data, error } = await supabase
      .from('profiles')
      .select('default_org_id')
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to get workspace');
    }

    if (!data?.default_org_id) {
      console.error('No default_org_id found in profile');
      throw new Error('No workspace configured');
    }

    return data.default_org_id;
  } catch (error) {
    console.error('Error in currentOrgId:', error);
    throw error;
  }
}

export async function ensureUserInitialized(): Promise<void> {
  try {
    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Error checking profile:', profileError);
      throw profileError;
    }

    if (!profile) {
      // Profile doesn't exist, initialize user
      console.log('Initializing new user...');
      const { error: initError } = await supabase.rpc('init_user', {
        p_full_name: user.user_metadata?.full_name || null,
      });

      if (initError) {
        console.error('Failed to initialize user:', initError);
        throw initError;
      }

      console.log('User initialized successfully');
    } else if (!profile.default_org_id) {
      // Profile exists but no default org, try to fix
      console.log('Profile exists but no default org, attempting to fix...');
      const { error: fixError } = await supabase.rpc('init_user', {
        p_full_name: profile.full_name,
      });

      if (fixError) {
        console.error('Failed to fix user profile:', fixError);
        throw fixError;
      }
    }

    // Ensure membership exists
    const { error: membershipError } = await supabase.rpc('ensure_membership');
    if (membershipError) {
      console.error('Failed to ensure membership:', membershipError);
      throw membershipError;
    }

    console.log('User initialization completed successfully');
  } catch (error) {
    console.error('Error in ensureUserInitialized:', error);
    throw error;
  }
}

export async function debugUserStatus(): Promise<void> {
  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log('Auth status:', { user: user?.id, error: authError });

    if (user) {
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      console.log('Profile status:', { profile, error: profileError });

      if (profile?.default_org_id) {
        // Check membership
        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('org_id', profile.default_org_id)
          .single();
        console.log('Membership status:', {
          membership,
          error: membershipError,
        });

        // Check organization exists
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.default_org_id)
          .single();
        console.log('Organization status:', {
          org,
          error: orgError,
        });
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
}
