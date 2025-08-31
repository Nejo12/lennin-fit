-- Simple Profile and Organization Fix
-- This migration fixes user profiles without relying on full_name column

-- 1. Create organizations for users without default_org_id
DO $$
DECLARE
    profile_record RECORD;
    new_org_id UUID;
BEGIN
    FOR profile_record IN 
        SELECT id FROM profiles WHERE default_org_id IS NULL
    LOOP
        -- Create a new organization for this user
        INSERT INTO organizations(name) 
        VALUES ('My Workspace') 
        RETURNING id INTO new_org_id;
        
        -- Update the profile with the new org_id
        UPDATE profiles 
        SET default_org_id = new_org_id 
        WHERE id = profile_record.id;
        
        -- Create membership
        INSERT INTO memberships(user_id, org_id, role) 
        VALUES (profile_record.id, new_org_id, 'owner')
        ON CONFLICT (user_id, org_id) DO NOTHING;
        
        RAISE NOTICE 'Fixed profile for user %: created org %', profile_record.id, new_org_id;
    END LOOP;
END $$;

-- 2. Clean up orphaned records
DELETE FROM memberships 
WHERE org_id NOT IN (SELECT id FROM organizations);

UPDATE profiles 
SET default_org_id = NULL 
WHERE default_org_id IS NOT NULL 
  AND default_org_id NOT IN (SELECT id FROM organizations);

-- 3. Create profiles for users who don't have one
INSERT INTO profiles (id, default_org_id)
SELECT 
    au.id,
    NULL
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL;

-- 4. Fix the newly created profiles
DO $$
DECLARE
    profile_record RECORD;
    new_org_id UUID;
BEGIN
    FOR profile_record IN 
        SELECT id FROM profiles WHERE default_org_id IS NULL
    LOOP
        -- Create a new organization for this user
        INSERT INTO organizations(name) 
        VALUES ('My Workspace') 
        RETURNING id INTO new_org_id;
        
        -- Update the profile with the new org_id
        UPDATE profiles 
        SET default_org_id = new_org_id 
        WHERE id = profile_record.id;
        
        -- Create membership
        INSERT INTO memberships(user_id, org_id, role) 
        VALUES (profile_record.id, new_org_id, 'owner')
        ON CONFLICT (user_id, org_id) DO NOTHING;
        
        RAISE NOTICE 'Created profile and org for user %: created org %', profile_record.id, new_org_id;
    END LOOP;
END $$;

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_default_org_id ON profiles(default_org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON memberships(user_id, org_id);

-- 6. Summary
SELECT 
    'Profile fixes completed' as status,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE default_org_id IS NOT NULL) as profiles_with_org,
    COUNT(*) FILTER (WHERE default_org_id IS NULL) as profiles_without_org
FROM profiles;
