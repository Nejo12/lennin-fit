import { supabase } from './supabase'

export async function currentOrgId(): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('default_org_id')
    .single()
  if (error || !data?.default_org_id) throw new Error('No workspace')
  return data.default_org_id
}
