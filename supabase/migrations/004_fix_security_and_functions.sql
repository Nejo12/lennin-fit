-- Fix security definer view issue by recreating without security definer
DROP VIEW IF EXISTS invoice_public;

-- Recreate view without security definer
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

-- Ensure all functions have proper search_path settings
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

-- Ensure phone column exists in clients table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'phone'
    ) THEN
        ALTER TABLE clients ADD COLUMN phone text;
    END IF;
END $$;

-- Add missing indexes for foreign keys to improve performance
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_org_id ON invoice_items(org_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_id ON payments(org_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON memberships(org_id);
