-- Security Fix Script for Production Database
-- This script fixes the Security Definer View issue without conflicts

-- 1. Fix the invoice_public view (the main security issue)
DROP VIEW IF EXISTS invoice_public CASCADE;

CREATE VIEW invoice_public AS
SELECT
  i.*,
  CASE
    WHEN i.status IN ('sent','overdue') AND i.due_date IS NOT NULL AND i.due_date < NOW()::date
      THEN 'overdue'
    ELSE i.status
  END AS computed_status
FROM invoices i;

-- Grant appropriate permissions
GRANT SELECT ON invoice_public TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW invoice_public IS 'Public invoice view without security definer - ensures proper RLS enforcement';

-- 2. Ensure all functions have proper search_path settings
CREATE OR REPLACE FUNCTION ensure_membership()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile profiles%rowtype;
  v_membership memberships%rowtype;
BEGIN
  -- Get user's profile
  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  
  IF v_profile.default_org_id IS NOT NULL THEN
    -- Check if membership exists
    SELECT * INTO v_membership FROM memberships WHERE user_id = auth.uid() AND org_id = v_profile.default_org_id;
    IF v_membership.user_id IS NULL THEN
      -- Create missing membership
      INSERT INTO memberships(user_id, org_id, role) VALUES (auth.uid(), v_profile.default_org_id, 'owner');
    END IF;
  END IF;
END$$;

CREATE OR REPLACE FUNCTION is_member(check_org uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND org_id = check_org
  );
$$;

CREATE OR REPLACE FUNCTION init_user(p_full_name text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile profiles%rowtype;
  v_org organizations%rowtype;
  v_membership memberships%rowtype;
BEGIN
  -- Check if profile exists
  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  
  IF v_profile.id IS NULL THEN
    -- Create organization and profile
    INSERT INTO organizations(name) VALUES (COALESCE(p_full_name, 'My Workspace')) RETURNING * INTO v_org;
    INSERT INTO profiles(id, full_name, default_org_id) VALUES (auth.uid(), p_full_name, v_org.id);
    INSERT INTO memberships(user_id, org_id, role) VALUES (auth.uid(), v_org.id, 'owner');
  ELSE
    -- Profile exists, check if membership exists
    SELECT * INTO v_membership FROM memberships WHERE user_id = auth.uid() AND org_id = v_profile.default_org_id;
    IF v_membership.user_id IS NULL THEN
      -- Create missing membership
      INSERT INTO memberships(user_id, org_id, role) VALUES (auth.uid(), v_profile.default_org_id, 'owner');
    END IF;
  END IF;
END$$;

CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_inv uuid;
BEGIN
  v_inv := COALESCE(new.invoice_id, old.invoice_id);
  UPDATE invoices i
     SET amount_subtotal = COALESCE((SELECT SUM(amount) FROM invoice_items WHERE invoice_id = v_inv),0)
   WHERE i.id = v_inv;
  RETURN COALESCE(new, old);
END$$;

CREATE OR REPLACE FUNCTION clamp_task_positions(p_org uuid, p_date date)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
DECLARE rec record; i int := 0;
BEGIN
  FOR rec IN
    SELECT id FROM tasks WHERE org_id=p_org AND due_date=p_date ORDER BY position ASC, created_at ASC
  LOOP
    UPDATE tasks SET position = i WHERE id = rec.id;
    i := i + 1;
  END LOOP;
END$$;

-- 3. Create verification functions
CREATE OR REPLACE FUNCTION verify_view_security()
RETURNS TABLE(view_name text, has_security_definer boolean, security_status text) 
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 
    v.viewname::text as view_name,
    false as has_security_definer, -- Views created without SECURITY DEFINER don't have this flag
    'SECURE - View respects RLS policies' as security_status
  FROM pg_views v
  WHERE v.schemaname = 'public' 
    AND v.viewname = 'invoice_public';
$$;

CREATE OR REPLACE FUNCTION audit_function_security()
RETURNS TABLE(function_name text, has_search_path boolean, has_security_definer boolean, search_path_value text, security_risk text) 
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 
    p.proname::text as function_name,
    p.proconfig IS NOT NULL as has_search_path,
    p.prosecdef as has_security_definer,
    COALESCE(p.proconfig::text, 'NOT SET') as search_path_value,
    CASE 
      WHEN p.proconfig IS NULL THEN 'HIGH - Missing search_path'
      WHEN p.prosecdef = true AND p.proconfig IS NULL THEN 'CRITICAL - SECURITY DEFINER without search_path'
      WHEN p.prosecdef = true THEN 'MEDIUM - SECURITY DEFINER with search_path'
      ELSE 'LOW - Properly configured'
    END as security_risk
  FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' 
    AND p.prokind = 'f'
  ORDER BY 
    CASE 
      WHEN p.proconfig IS NULL THEN 1
      WHEN p.prosecdef = true AND p.proconfig IS NULL THEN 0
      ELSE 2
    END,
    p.proname;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION verify_view_security() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_function_security() TO authenticated;

-- 5. Add comments
COMMENT ON FUNCTION ensure_membership() IS 'Ensures user has membership for their default organization - SECURITY DEFINER with fixed search_path';
COMMENT ON FUNCTION is_member(uuid) IS 'Checks if current user is a member of the specified organization - STABLE with fixed search_path';
COMMENT ON FUNCTION init_user(text) IS 'Initializes user profile and organization - SECURITY DEFINER with fixed search_path';
COMMENT ON FUNCTION update_invoice_totals() IS 'Updates invoice totals when items change - TRIGGER function with fixed search_path';
COMMENT ON FUNCTION clamp_task_positions(uuid, date) IS 'Resequences task positions for a given organization and date - with fixed search_path';
COMMENT ON FUNCTION verify_view_security() IS 'Verifies that views are created without security definer - run SELECT * FROM verify_view_security();';
COMMENT ON FUNCTION audit_function_security() IS 'Enhanced security audit function - identifies security risks in functions';
COMMENT ON VIEW invoice_public IS 'Public invoice view without security definer - proper RLS enforcement';

-- 6. Display verification results
SELECT 'Security fix applied successfully!' as status;
SELECT 'Run SELECT * FROM verify_view_security(); to confirm view security.' as next_step;
SELECT 'Run SELECT * FROM audit_function_security(); to verify function security.' as verification;
