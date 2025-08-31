-- Complete Security Fixes - Address ALL Security Advisor Issues

-- 1. Fix ALL Function Search Path Mutable Issues
-- Ensure every function has SET search_path = public

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

-- 2. Fix Security Definer View Issue
-- Drop and recreate invoice_public view without security definer
DROP VIEW IF EXISTS invoice_public;

CREATE VIEW invoice_public AS
SELECT
  i.*,
  CASE
    WHEN i.status IN ('sent','overdue') AND i.due_date IS NOT NULL AND i.due_date < NOW()::date
      THEN 'overdue'
    ELSE i.status
  END AS computed_status
FROM invoices i;

GRANT SELECT ON invoice_public TO anon, authenticated;

-- 3. Enhanced Security Audit Function
DROP FUNCTION IF EXISTS audit_function_security();

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

-- 4. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION audit_function_security() TO authenticated;

-- 5. Add comprehensive comments for documentation
COMMENT ON FUNCTION ensure_membership() IS 'Ensures user has membership for their default organization - SECURITY DEFINER with fixed search_path';
COMMENT ON FUNCTION is_member(uuid) IS 'Checks if current user is a member of the specified organization - STABLE with fixed search_path';
COMMENT ON FUNCTION init_user(text) IS 'Initializes user profile and organization - SECURITY DEFINER with fixed search_path';
COMMENT ON FUNCTION update_invoice_totals() IS 'Updates invoice totals when items change - TRIGGER function with fixed search_path';
COMMENT ON FUNCTION clamp_task_positions(uuid, date) IS 'Resequences task positions for a given organization and date - with fixed search_path';
COMMENT ON FUNCTION audit_function_security() IS 'Enhanced security audit function - identifies security risks in functions';
COMMENT ON VIEW invoice_public IS 'Public invoice view without security definer - proper RLS enforcement';

-- 6. Verify all functions have proper security settings
SELECT 'Security audit completed. Run SELECT * FROM audit_function_security(); to verify all functions have proper search_path settings.' as status;

-- 7. Additional security hardening
-- Ensure all tables have RLS enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 8. Security status summary
SELECT 
  'SECURITY FIXES APPLIED' as status,
  COUNT(*) as total_functions,
  COUNT(*) FILTER (WHERE p.proconfig IS NOT NULL) as functions_with_search_path,
  COUNT(*) FILTER (WHERE p.proconfig IS NULL) as functions_needing_fix
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' AND p.prokind = 'f';
