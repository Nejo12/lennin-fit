#!/bin/bash

# Security Verification Script
# This script verifies that all security issues identified by Supabase Security Advisor are resolved

echo "🔒 Security Verification Script"
echo "================================"

# Check if we're connected to Supabase
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    exit 1
fi

echo "✅ Supabase project detected"

# Function to run SQL query and display results
run_sql() {
    local query="$1"
    local description="$2"
    
    echo ""
    echo "🔍 $description"
    echo "----------------------------------------"
    
    # Run the query using psql directly to the local database
    result=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "$query" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$result"
    else
        echo "❌ Failed to execute query"
        echo "Query: $query"
    fi
}

# 1. Verify invoice_public view security
run_sql "SELECT * FROM verify_view_security();" "1. Checking invoice_public view security"

# 2. Verify all functions have proper search_path
run_sql "SELECT * FROM audit_function_security();" "2. Checking function security settings"

# 3. Verify RLS is enabled on all tables
run_sql "
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('organizations', 'profiles', 'memberships', 'clients', 'projects', 'tasks', 'invoices', 'invoice_items', 'payments')
ORDER BY tablename;
" "3. Checking Row Level Security (RLS) status"

# 4. Verify the invoice_public view definition
run_sql "
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'invoice_public';
" "4. Checking invoice_public view definition"

# 5. Check for any remaining security definer functions
run_sql "
SELECT 
    p.proname as function_name,
    p.prosecdef as has_security_definer,
    p.proconfig as search_path_config
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' 
    AND p.prokind = 'f'
    AND p.prosecdef = true
ORDER BY p.proname;
" "5. Checking for SECURITY DEFINER functions"

echo ""
echo "========================================"
echo "🔒 Security Verification Complete"
echo ""
echo "✅ If you see 'SECURE' status for the view and all functions have search_path set,"
echo "   then the security issues have been resolved."
echo ""
echo "📋 Next Steps:"
echo "1. Deploy these changes to your production database"
echo "2. Run the Supabase Security Advisor again to confirm all issues are resolved"
echo "3. Test your application to ensure all functionality works correctly"
echo ""
echo "🚀 To deploy to production:"
echo "   supabase db push --linked"
