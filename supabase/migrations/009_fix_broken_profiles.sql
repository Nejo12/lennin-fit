-- Fix broken user profiles and missing organizations
-- This migration addresses the issues causing task creation failures

-- 1. Fix profiles without default_org_id
-- Find profiles that exist but don't have a default_org_id
DO $$
DECLARE
    profile_record RECORD;
    new_org_id UUID;
    org_name TEXT;
BEGIN
    FOR profile_record IN 
        SELECT id, COALESCE(full_name, 'User ' || id::text) as display_name
        FROM profiles 
        WHERE default_org_id IS NULL
    LOOP
        -- Create a new organization for this user
        org_name := COALESCE(profile_record.display_name, 'My Workspace');
        INSERT INTO organizations(name) 
        VALUES (org_name) 
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
EXCEPTION
    WHEN undefined_column THEN
        -- Handle case where full_name column doesn't exist
        FOR profile_record IN 
            SELECT id, 'User ' || id::text as display_name
            FROM profiles 
            WHERE default_org_id IS NULL
        LOOP
            -- Create a new organization for this user
            org_name := COALESCE(profile_record.display_name, 'My Workspace');
            INSERT INTO organizations(name) 
            VALUES (org_name) 
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

-- 2. Fix orphaned memberships (memberships pointing to non-existent organizations)
DELETE FROM memberships 
WHERE org_id NOT IN (SELECT id FROM organizations);

-- 3. Fix orphaned profiles (profiles pointing to non-existent organizations)
UPDATE profiles 
SET default_org_id = NULL 
WHERE default_org_id IS NOT NULL 
  AND default_org_id NOT IN (SELECT id FROM organizations);

-- 4. Re-run the fix for profiles that now have NULL default_org_id
DO $$
DECLARE
    profile_record RECORD;
    new_org_id UUID;
    org_name TEXT;
BEGIN
    FOR profile_record IN 
        SELECT id, COALESCE(full_name, 'User ' || id::text) as display_name
        FROM profiles 
        WHERE default_org_id IS NULL
    LOOP
        -- Create a new organization for this user
        org_name := COALESCE(profile_record.display_name, 'My Workspace');
        INSERT INTO organizations(name) 
        VALUES (org_name) 
        RETURNING id INTO new_org_id;
        
        -- Update the profile with the new org_id
        UPDATE profiles 
        SET default_org_id = new_org_id 
        WHERE id = profile_record.id;
        
        -- Create membership
        INSERT INTO memberships(user_id, org_id, role) 
        VALUES (profile_record.id, new_org_id, 'owner')
        ON CONFLICT (user_id, org_id) DO NOTHING;
        
        RAISE NOTICE 'Fixed orphaned profile for user %: created org %', profile_record.id, new_org_id;
    END LOOP;
EXCEPTION
    WHEN undefined_column THEN
        -- Handle case where full_name column doesn't exist
        FOR profile_record IN 
            SELECT id, 'User ' || id::text as display_name
            FROM profiles 
            WHERE default_org_id IS NULL
        LOOP
            -- Create a new organization for this user
            org_name := COALESCE(profile_record.display_name, 'My Workspace');
            INSERT INTO organizations(name) 
            VALUES (org_name) 
            RETURNING id INTO new_org_id;
            
            -- Update the profile with the new org_id
            UPDATE profiles 
            SET default_org_id = new_org_id 
            WHERE id = profile_record.id;
            
            -- Create membership
            INSERT INTO memberships(user_id, org_id, role) 
            VALUES (profile_record.id, new_org_id, 'owner')
            ON CONFLICT (user_id, org_id) DO NOTHING;
            
            RAISE NOTICE 'Fixed orphaned profile for user %: created org %', profile_record.id, new_org_id;
        END LOOP;
END $$;

-- 5. Ensure all authenticated users have profiles
-- This handles the case where a user exists in auth.users but not in profiles
INSERT INTO profiles (id, default_org_id)
SELECT 
    au.id,
    NULL
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL; -- Only confirmed users

-- 6. Fix the newly created profiles without default_org_id
DO $$
DECLARE
    profile_record RECORD;
    new_org_id UUID;
    org_name TEXT;
BEGIN
    FOR profile_record IN 
        SELECT id, COALESCE(full_name, 'User ' || id::text) as display_name
        FROM profiles 
        WHERE default_org_id IS NULL
    LOOP
        -- Create a new organization for this user
        org_name := COALESCE(profile_record.display_name, 'My Workspace');
        INSERT INTO organizations(name) 
        VALUES (org_name) 
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
EXCEPTION
    WHEN undefined_column THEN
        -- Handle case where full_name column doesn't exist
        FOR profile_record IN 
            SELECT id, 'User ' || id::text as display_name
            FROM profiles 
            WHERE default_org_id IS NULL
        LOOP
            -- Create a new organization for this user
            org_name := COALESCE(profile_record.display_name, 'My Workspace');
            INSERT INTO organizations(name) 
            VALUES (org_name) 
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

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_default_org_id ON profiles(default_org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON memberships(user_id, org_id);

-- 8. Summary of fixes applied
SELECT 
    'Profile fixes completed' as status,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE default_org_id IS NOT NULL) as profiles_with_org,
    COUNT(*) FILTER (WHERE default_org_id IS NULL) as profiles_without_org
FROM profiles;
