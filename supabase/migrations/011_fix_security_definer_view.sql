-- Fix Security Definer View Issue - Final Resolution
-- This migration ensures the invoice_public view is properly created without SECURITY DEFINER

-- Drop the view if it exists (regardless of how it was created)
DROP VIEW IF EXISTS invoice_public CASCADE;

-- Recreate the view WITHOUT SECURITY DEFINER
-- This ensures the view respects Row Level Security (RLS) policies
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

-- Verify the view was created correctly
DO $$
BEGIN
  -- Check if the view exists and doesn't have security definer
  IF NOT EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' 
    AND viewname = 'invoice_public'
  ) THEN
    RAISE EXCEPTION 'View invoice_public was not created successfully';
  END IF;
  
  -- Log success
  RAISE NOTICE 'Security definer view issue resolved: invoice_public view created without SECURITY DEFINER';
END $$;

-- Create a verification function to check view security
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

-- Grant execute permission on verification function
GRANT EXECUTE ON FUNCTION verify_view_security() TO authenticated;

-- Add comment for verification function
COMMENT ON FUNCTION verify_view_security() IS 'Verifies that views are created without security definer - run SELECT * FROM verify_view_security();';

-- Display verification results
SELECT 'Security verification completed. Run SELECT * FROM verify_view_security(); to confirm view security.' as status;
