-- Final Security Fixes - Address all Security Advisor issues

-- 1. Ensure ALL functions have proper search_path settings
-- This migration ensures every function has SET search_path = public

-- Function: ensure_membership
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

-- Function: is_member
CREATE OR REPLACE FUNCTION is_member(check_org uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND org_id = check_org
  );
$$;

-- Function: init_user
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

-- Function: update_invoice_totals
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

-- Function: clamp_task_positions
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

-- 2. Security audit function to verify all functions have proper settings
CREATE OR REPLACE FUNCTION audit_function_security()
RETURNS TABLE(function_name text, has_search_path boolean, has_security_definer boolean, search_path_value text) 
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT 
    p.proname::text as function_name,
    p.proconfig IS NOT NULL as has_search_path,
    p.prosecdef as has_security_definer,
    COALESCE(p.proconfig::text, 'NOT SET') as search_path_value
  FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' 
    AND p.prokind = 'f'
  ORDER BY p.proname;
$$;

-- 3. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION audit_function_security() TO authenticated;

-- 4. Add comments for documentation
COMMENT ON FUNCTION ensure_membership() IS 'Ensures user has membership for their default organization - SECURITY DEFINER with fixed search_path';
COMMENT ON FUNCTION is_member(uuid) IS 'Checks if current user is a member of the specified organization - STABLE with fixed search_path';
COMMENT ON FUNCTION init_user(text) IS 'Initializes user profile and organization - SECURITY DEFINER with fixed search_path';
COMMENT ON FUNCTION update_invoice_totals() IS 'Updates invoice totals when items change - TRIGGER function with fixed search_path';
COMMENT ON FUNCTION clamp_task_positions(uuid, date) IS 'Resequences task positions for a given organization and date - with fixed search_path';
COMMENT ON FUNCTION audit_function_security() IS 'Helper function to audit function security settings - check for missing search_path or security_definer where needed';

-- 5. Verify all functions have proper security settings
-- This will help identify any remaining issues
SELECT 'Security audit completed. Run SELECT * FROM audit_function_security(); to verify all functions have proper search_path settings.' as status;
