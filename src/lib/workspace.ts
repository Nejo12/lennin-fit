import { supabase } from './supabase';

export async function currentOrgId(): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('default_org_id')
    .single();
  if (error || !data?.default_org_id) throw new Error('No workspace');
  return data.default_org_id;
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
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
}
